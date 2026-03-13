from celery import shared_task
from django.utils import timezone
import tempfile
import requests
import logging
import os

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5)
def process_document(self, document_id: int, extracted_text: str = None, page_count: int = None, word_count: int = None):
    """
    Async task to process an uploaded document.
    Increased retries and backoff for Gemini Quota (429) errors.
    """
    from apps.documents.models import Document
    from apps.documents.utils.chunker import chunk_text
    from apps.documents.utils.embeddings import store_chunks
    from apps.documents.utils.ai import get_summary

    doc = Document.objects.get(id=document_id)
    doc.refresh_from_db()
    
    # Only set to processing if it's the first attempt
    if self.request.retries == 0:
        doc.status = 'processing'
        doc.error_message = ""
        
        # If text was passed directly, save it now
        if extracted_text:
            doc.extracted_text = extracted_text
            if page_count: doc.page_count = page_count
            if word_count: doc.word_count = word_count
            
        doc.save()

    # Step 1: Ensure text is present
    if not doc.extracted_text:
        tmp_path = None
        try:
            import cloudinary
            import cloudinary.utils
            cloudinary.config(
                cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
                api_key=os.environ.get('CLOUDINARY_API_KEY'),
                api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
                secure=True
            )

            download_url = doc.file_url
            if doc.file_public_id:
                # Force refresh from settings if env is flaky in worker
                from django.conf import settings
                if not os.environ.get('CLOUDINARY_API_SECRET') and hasattr(settings, 'CLOUDINARY_STORAGE'):
                    config = settings.CLOUDINARY_STORAGE
                    cloudinary.config(
                        cloud_name=config.get('CLOUD_NAME'),
                        api_key=config.get('API_KEY'),
                        api_secret=config.get('API_SECRET'),
                        secure=True
                    )

                download_url, _ = cloudinary.utils.cloudinary_url(
                    doc.file_public_id,
                    resource_type='raw',
                    sign_url=True
                )

            logger.info(f"Downloading fallback from: {download_url}")
            response = requests.get(download_url, timeout=30)
            response.raise_for_status()

            with tempfile.NamedTemporaryFile(suffix=f'.{doc.file_type}', delete=False) as tmp:
                tmp.write(response.content)
                tmp_path = tmp.name

            from .utils.extraction import extract_text, get_doc_metadata
            doc.extracted_text = extract_text(tmp_path, doc.file_type)
            metadata = get_doc_metadata(tmp_path, doc.file_type)
            doc.page_count = metadata['page_count']
            doc.word_count = metadata['word_count']
            doc.save()
            
        except Exception as e:
            logger.error(f"Fallback download failed for {document_id}: {str(e)}")
            # Only fail the document if it's the last retry
            if self.request.retries >= self.max_retries:
                doc.status = 'failed'
                doc.error_message = f"Download failed: {str(e)}"
                doc.save()
                return
            raise self.retry(exc=e, countdown=60)
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    try:
        # Step 1/3: Chunk and embed
        if not doc.chroma_collection_id:
            logger.info(f"Step 1/3: Chunking document {document_id}")
            chunks = chunk_text(doc.extracted_text)
            
            logger.info(f"Step 2/3: Storing {len(chunks)} chunks in ChromaDB")
            collection_name = store_chunks(doc.id, chunks)
            doc.chroma_collection_id = collection_name
            doc.save()

        # Step 3/3: Summarize (Non-blocking fallback)
        if not doc.summary or "unavailable" in doc.summary:
            try:
                logger.info(f"Step 3/3: Generating AI summary for {document_id}")
                doc.summary = get_summary(doc.extracted_text)
                doc.save()
            except Exception as sum_e:
                logger.warning(f"Summarization failed for {document_id}, but proceeding: {str(sum_e)}")
                doc.summary = "Summary temporarily unavailable due to AI provider limits. You can still chat with this document."
                doc.save()

        doc.status = 'ready'
        doc.processed_at = timezone.now()
        doc.error_message = ""
        doc.save()

        logger.info(f"Document {document_id} processed successfully")

    except Exception as e:
        error_str = str(e)
        logger.error(f"Processing failed for {document_id}: {error_str}")
        
        # Check for Gemini Quota error (429)
        countdown = 60 # Default
        if "429" in error_str or "quota" in error_str.lower():
            countdown = 120 # Wait longer for quota reset
            logger.info(f"Quota error detected, backing off for {countdown}s")

        if self.request.retries >= self.max_retries:
            doc.status = 'failed'
            doc.error_message = f"AI API Error: {error_str[:200]}"
            doc.save()
            logger.error(f"Max retries reached for {document_id}. Final failure.")
        else:
            # Update error message so user can see what's happening, but keep status 'processing'
            doc.error_message = f"Retrying (Attempt {self.request.retries + 1}): {error_str[:150]}"
            doc.save()
            raise self.retry(exc=e, countdown=countdown)


@shared_task
def process_document_sync(document_id: int):
    """
    Synchronous version for development (can be called as a task too).
    Now also bypasses download if text exists.
    """
    from apps.documents.models import Document
    from apps.documents.utils.chunker import chunk_text
    from apps.documents.utils.embeddings import store_chunks
    from apps.documents.utils.ai import get_summary

    doc = Document.objects.get(id=document_id)
    doc.refresh_from_db()
    doc.status = 'processing'
    doc.save()

    if not doc.extracted_text:
        # Synchronous fallback download logic if needed
        pass

    try:
        logger.info(f"Step 1/3: Chunking document {document_id}")
        chunks = chunk_text(doc.extracted_text)
        
        logger.info(f"Step 2/3: Storing {len(chunks)} chunks in ChromaDB")
        collection_name = store_chunks(doc.id, chunks)
        doc.chroma_collection_id = collection_name
        
        logger.info(f"Step 3/3: Generating AI summary for {document_id}")
        doc.summary = get_summary(doc.extracted_text)
        
        doc.status = 'ready'
        doc.processed_at = timezone.now()
        doc.save()
        logger.info(f"Document {document_id} processed successfully (sync)")
    except Exception as e:
        logger.error(f"Sync processing failed: {str(e)}")
        doc.status = 'failed'
        doc.error_message = str(e)
        doc.save()
