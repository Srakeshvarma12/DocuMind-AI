import fitz  # PyMuPDF
from docx import Document as DocxDocument
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> dict:
    """Extract text from PDF using PyMuPDF."""
    doc = fitz.open(file_path)
    full_text = ""
    pages = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        pages.append({'page': page_num + 1, 'text': text})
        full_text += text + "\n"
    doc.close()
    return {
        'full_text': full_text.strip(),
        'pages': pages,
        'page_count': len(pages),
        'word_count': len(full_text.split())
    }


def extract_text_from_docx(file_path: str) -> dict:
    """Extract text from DOCX using python-docx."""
    doc = DocxDocument(file_path)
    full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    return {
        'full_text': full_text,
        'pages': [{'page': 1, 'text': full_text}],
        'page_count': 1,
        'word_count': len(full_text.split())
    }


def extract_text_from_txt(file_path: str) -> dict:
    """Extract text from plain text files."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    return {
        'full_text': text,
        'pages': [{'page': 1, 'text': text}],
        'page_count': 1,
        'word_count': len(text.split())
    }


def extract_text(file_path: str, file_type: str) -> dict:
    """Extract text from a file based on its type."""
    extractors = {
        'pdf': extract_text_from_pdf,
        'docx': extract_text_from_docx,
        'txt': extract_text_from_txt,
    }
    if file_type not in extractors:
        raise ValueError(f"Unsupported file type: {file_type}")
    logger.info(f"Extracting text from {file_type} file: {file_path}")
    return extractors[file_type](file_path)
