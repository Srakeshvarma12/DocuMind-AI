import chromadb
from sentence_transformers import SentenceTransformer
import logging
import os

from django.conf import settings

logger = logging.getLogger(__name__)

# Load model once at module level (lazy singleton)
_model = None


def get_model():
    """Get or initialize the sentence transformer model."""
    global _model
    if _model is None:
        cache_dir = os.path.join(settings.BASE_DIR, 'model_cache')
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)
            
        logger.info(f"Loading sentence-transformers model to {cache_dir}")
        _model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder=cache_dir)
    return _model


def get_chroma_client():
    """Get persistent ChromaDB client."""
    db_path = os.path.join(settings.BASE_DIR, 'chroma_db')
    logger.debug(f"Connecting to ChromaDB at: {db_path}")
    return chromadb.PersistentClient(path=db_path)


def store_chunks(doc_id: int, chunks: list) -> str:
    """
    Store document chunks with embeddings in ChromaDB.
    
    Args:
        doc_id: Document database ID
        chunks: List of dicts with 'text', 'page_number', 'chunk_index'
    
    Returns:
        Collection name string
    """
    collection_name = f"doc_{doc_id}"
    chroma_client = get_chroma_client()

    # Delete existing collection if any
    try:
        chroma_client.delete_collection(collection_name)
    except Exception:
        pass

    collection = chroma_client.create_collection(collection_name)

    texts = [c['text'] for c in chunks]
    embeddings = get_model().encode(texts).tolist()
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{'page': c['page_number'], 'chunk_index': c['chunk_index']} for c in chunks]

    collection.add(
        documents=texts,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )

    logger.info(f"Stored {len(chunks)} chunks in ChromaDB collection: {collection_name}")
    return collection_name


def retrieve_relevant_chunks(collection_name: str, question: str, top_k: int = 4) -> list:
    """
    Retrieve the most relevant chunks for a question using vector similarity.
    
    Args:
        collection_name: ChromaDB collection name
        question: User's question text
        top_k: Number of chunks to retrieve
    
    Returns:
        List of dicts with 'text' and 'page' keys
    """
    chroma_client = get_chroma_client()
    collection = chroma_client.get_collection(collection_name)
    question_embedding = get_model().encode([question]).tolist()

    results = collection.query(
        query_embeddings=question_embedding,
        n_results=top_k
    )

    chunks = [
        {
            'text': doc,
            'page': results['metadatas'][0][i].get('page', 1)
        }
        for i, doc in enumerate(results['documents'][0])
    ]

    logger.info(f"Retrieved {len(chunks)} relevant chunks for question")
    return chunks


def delete_collection(collection_name: str) -> bool:
    """Delete a ChromaDB collection."""
    try:
        chroma_client = get_chroma_client()
        chroma_client.delete_collection(collection_name)
        logger.info(f"Deleted ChromaDB collection: {collection_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete collection {collection_name}: {str(e)}")
        return False
