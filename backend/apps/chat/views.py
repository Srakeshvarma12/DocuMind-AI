from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.documents.models import Document
from .models import ChatSession, ChatMessage
from .serializers import ChatMessageSerializer, SendMessageSerializer
from apps.documents.utils.embeddings import retrieve_relevant_chunks
from apps.documents.utils.ai import answer_question, get_source_pages
import logging

logger = logging.getLogger(__name__)


class ChatView(APIView):
    """
    GET: Retrieve full chat history for a document
    POST: Send a message and receive AI answer
    DELETE: Clear chat history
    """

    def get(self, request, doc_id):
        """Get full chat history for a document."""
        try:
            doc = Document.objects.get(id=doc_id, user=request.user)
        except Document.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Document not found', 'code': 'NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        session, _ = ChatSession.objects.get_or_create(document=doc)
        messages = session.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)

        return Response({
            'success': True,
            'data': {
                'document_id': doc.id,
                'document_title': doc.title,
                'messages': serializer.data
            }
        })

    def post(self, request, doc_id):
        """Send a message and get AI response."""
        try:
            doc = Document.objects.get(id=doc_id, user=request.user)
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

        if not doc.chroma_collection_id:
            return Response(
                {'success': False, 'error': 'Document not processed yet — please wait', 'code': 'NOT_READY'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate message
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': 'Message is required', 'code': 'VALIDATION_ERROR'},
                status=status.HTTP_400_BAD_REQUEST
            )

        question = serializer.validated_data['message']

        try:
            # Get or create chat session
            session, _ = ChatSession.objects.get_or_create(document=doc)

            # Save user message
            user_msg = ChatMessage.objects.create(
                session=session,
                role='user',
                content=question
            )

            # RAG: Retrieve relevant chunks
            chunks = retrieve_relevant_chunks(doc.chroma_collection_id, question, top_k=4)
            source_pages = get_source_pages(chunks)

            # Build chat history for context
            history = list(
                session.messages.order_by('-created_at')[:6]
                .values('role', 'content')
            )
            history.reverse()

            # Get AI answer
            answer = answer_question(question, chunks, history)

            # Save assistant message
            ai_msg = ChatMessage.objects.create(
                session=session,
                role='assistant',
                content=answer,
                source_pages=source_pages
            )

            return Response({
                'success': True,
                'data': {
                    'user_message': ChatMessageSerializer(user_msg).data,
                    'ai_message': ChatMessageSerializer(ai_msg).data,
                }
            })

        except Exception as e:
            logger.error(f"Chat failed for doc {doc_id}: {str(e)}")
            return Response(
                {'success': False, 'error': f'AI service error: {str(e)}', 'code': 'AI_ERROR'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    def delete(self, request, doc_id):
        """Clear chat history for a document."""
        try:
            doc = Document.objects.get(id=doc_id, user=request.user)
        except Document.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Document not found', 'code': 'NOT_FOUND'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            session = ChatSession.objects.get(document=doc)
            session.messages.all().delete()
            return Response({
                'success': True,
                'message': 'Chat history cleared'
            })
        except ChatSession.DoesNotExist:
            return Response({
                'success': True,
                'message': 'No chat history to clear'
            })
