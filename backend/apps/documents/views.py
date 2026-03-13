from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document
from .serializers import DocumentSerializer, DocumentDetailSerializer
from .utils.embeddings import delete_collection
import tempfile
import os
import logging
import threading

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB


class DocumentListView(APIView):
    """List all documents for the authenticated user."""

    def get(self, request):
        documents = Document.objects.filter(user=request.user)
        serializer = DocumentSerializer(documents, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class DocumentUploadView(APIView):
    """Upload a new document."""
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'success': False, 'error': 'No file provided', 'code': 'NO_FILE'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type
        file_ext = file.name.rsplit('.', 1)[-1].lower() if '.' in file.name else ''
        if file_ext not in ALLOWED_EXTENSIONS:
            return Response(
                {'success': False, 'error': 'Supported formats: PDF, DOCX, TXT', 'code': 'INVALID_TYPE'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size
        if file.size > MAX_FILE_SIZE:
            return Response(
                {'success': False, 'error': 'File too large. Max 25MB.', 'code': 'FILE_TOO_LARGE'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save temp file and upload to Cloudinary
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=f'.{file_ext}', delete=False) as tmp:
                for chunk in file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name

            # Upload to Cloudinary
            from .utils.storage import upload_document
            from .utils.extraction import extract_text, get_doc_metadata
            cloud_result = upload_document(tmp_path, file.name.rsplit('.', 1)[0])

            # Create document record
            title = request.data.get('title', file.name)
            
            # Extract text and metadata while local (to avoid Cloudinary 401 later)
            logger.info(f"Starting local extraction for {title} (ext: {file_ext}) from {tmp_path}")
            extracted_txt = extract_text(tmp_path, file_ext)
            metadata = get_doc_metadata(tmp_path, file_ext)
            
            logger.info(f"Local extraction finished. Text length: {len(extracted_txt)}, Pages: {metadata['page_count']}")

            doc = Document.objects.create(
                user=request.user,
                title=title,
                file_url=cloud_result['url'],
                file_public_id=cloud_result['public_id'],
                file_type=file_ext,
                file_size=file.size,
                extracted_text=extracted_txt,
                page_count=metadata['page_count'],
                word_count=metadata['word_count'],
                status='uploading'
            )

            # Trigger background task (summarization and embedding)
            # Pass extracted text directly to avoid downloading from Cloudinary
            try:
                from .tasks import process_document
                process_document.delay(
                    doc.id, 
                    extracted_text=extracted_txt,
                    page_count=metadata['page_count'],
                    word_count=metadata['word_count']
                )
                logger.info(f"Task process_document queued for doc {doc.id}")
            except Exception as e:
                logger.warning(f"Celery not available, processing synchronously: {e}")
                from .tasks import process_document_sync
                thread = threading.Thread(target=process_document_sync, args=(doc.id,))
                thread.start()

            serializer = DocumentSerializer(doc)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Document uploaded successfully. Processing started.'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Upload failed: {str(e)}")
            return Response(
                {'success': False, 'error': f'Upload failed: {str(e)}', 'code': 'UPLOAD_FAILED'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)


class DocumentDetailView(APIView):
    """Get or delete a single document."""

    def get(self, request, pk):
        try:
            doc = Document.objects.get(id=pk, user=request.user)
        except Document.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Document not found', 'code': 'NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = DocumentDetailSerializer(doc)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def delete(self, request, pk):
        try:
            doc = Document.objects.get(id=pk, user=request.user)
        except Document.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Document not found', 'code': 'NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete ChromaDB collection
        if doc.chroma_collection_id:
            delete_collection(doc.chroma_collection_id)

        doc.delete()
        return Response({
            'success': True,
            'message': 'Document deleted successfully'
        })


class DocumentStatusView(APIView):
    """Poll document processing status."""

    def get(self, request, pk):
        try:
            doc = Document.objects.get(id=pk, user=request.user)
        except Document.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Document not found', 'code': 'NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'success': True,
            'data': {
                'id': doc.id,
                'status': doc.status,
                'error_message': doc.error_message,
            }
        })


class DocumentSummaryView(APIView):
    """Get document summary and stats."""

    def get(self, request, pk):
        try:
            doc = Document.objects.get(id=pk, user=request.user)
        except Document.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Document not found', 'code': 'NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        if doc.status != 'ready':
            return Response(
                {'success': False, 'error': 'Document not processed yet — please wait', 'code': 'NOT_READY'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'success': True,
            'data': {
                'id': doc.id,
                'title': doc.title,
                'summary': doc.summary,
                'page_count': doc.page_count,
                'word_count': doc.word_count,
                'file_type': doc.file_type,
                'file_size': doc.file_size,
                'uploaded_at': doc.uploaded_at,
                'processed_at': doc.processed_at,
            }
        })
