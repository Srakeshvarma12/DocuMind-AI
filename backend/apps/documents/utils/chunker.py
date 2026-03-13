from langchain_text_splitters import RecursiveCharacterTextSplitter
import logging

logger = logging.getLogger(__name__)


def chunk_text(pages: list, chunk_size: int = 500, chunk_overlap: int = 50) -> list:
    """
    Split document pages into overlapping chunks for embedding.
    
    Args:
        pages: List of dicts with 'page' and 'text' keys
        chunk_size: Maximum characters per chunk
        chunk_overlap: Overlap between consecutive chunks
    
    Returns:
        List of dicts with 'text', 'page_number', and 'chunk_index'
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    # If pages is a single string, treat it as a list of one page
    if isinstance(pages, str):
        pages = [{'text': pages, 'page': 1}]

    chunks = []
    for page_data in pages:
        text = page_data.get('text', '')
        if not text:
            continue
            
        page_chunks = splitter.split_text(text)
        for i, chunk in enumerate(page_chunks):
            if chunk.strip():
                chunks.append({
                    'text': chunk.strip(),
                    'page_number': page_data.get('page', 1),
                    'chunk_index': i
                })

    logger.info(f"Created {len(chunks)} chunks")
    return chunks
