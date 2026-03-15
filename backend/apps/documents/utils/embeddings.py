import logging
import os
import numpy as np

from django.conf import settings
from apps.documents.models import Document

logger = logging.getLogger(__name__)

# Load model once at module level (lazy singleton)
_model = None

def get_model():
    """Get or initialize the sentence transformer model."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        cache_dir = os.path.join(settings.BASE_DIR, 'model_cache')
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)
            
        logger.info(f"Loading sentence-transformers model to {cache_dir}")
        _model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=cache_dir)
    return _model

def store_chunks(doc_id: int, chunks: list) -> str:
    """
    Store document chunks with embeddings in the database.
    
    Args:
        doc_id: Document database ID
        chunks: List of dicts with 'text', 'page_number', 'chunk_index'
    """
    texts = [c['text'] for c in chunks]
    embeddings = get_model().encode(texts).tolist()
    
    prepared_data = []
    for i, chunk in enumerate(chunks):
        prepared_data.append({
            'text': chunk['text'],
            'page': chunk['page_number'],
            'embedding': embeddings[i]
        })
    
    doc = Document.objects.get(id=doc_id)
    doc.embeddings_data = prepared_data
    doc.save()
    
    logger.info(f"Stored {len(chunks)} chunks in database for document: {doc_id}")
    return f"db_{doc_id}"

def retrieve_relevant_chunks(doc_id_str: str, question: str, top_k: int = 4) -> list:
    """
    Retrieve the most relevant chunks for a question using cosine similarity in Python.
    
    Args:
        doc_id_str: Collection name (e.g., 'db_3' or 'doc_3')
        question: User's question text
        top_k: Number of chunks to retrieve
    """
    # Extract ID from string like 'doc_3' or 'db_3'
    try:
        doc_id = int(doc_id_str.split('_')[1])
    except (IndexError, ValueError):
        logger.error(f"Invalid doc_id format: {doc_id_str}")
        return []

    doc = Document.objects.get(id=doc_id)
    if not doc.embeddings_data:
        logger.warning(f"RETRIEVAL: No embeddings found for document {doc_id}")
        return []

    logger.info(f"RETRIEVAL: Loaded {len(doc.embeddings_data)} chunks from database for doc {doc_id}")

    # Encode question
    question_embedding = get_model().encode([question])[0]
    
    # Calculate similarities
    similarities = []
    for item in doc.embeddings_data:
        chunk_embedding = np.array(item['embedding'])
        # Cosine similarity: (A . B) / (||A|| * ||B||)
        score = np.dot(question_embedding, chunk_embedding) / (
            np.linalg.norm(question_embedding) * np.linalg.norm(chunk_embedding)
        )
        similarities.append((score, item))

    # Sort and pick top k
    similarities.sort(key=lambda x: x[0], reverse=True)
    top_results = similarities[:top_k]

    # Debug: Log top similarity scores
    scores_debug = [f"{res[0]:.4f}" for res in top_results]
    logger.info(f"RETRIEVAL: Top {len(top_results)} scores: {scores_debug}")

    chunks = [
        {
            'text': res[1]['text'],
            'page': res[1]['page']
        }
        for res in top_results
    ]

    logger.info(f"RETRIEVAL: Returning {len(chunks)} chunks")
    return chunks

def delete_collection(collection_name: str) -> bool:
    """No-op for database storage."""
    return True
