import os
import logging
import time
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

SUMMARIZE_PROMPT = """You are a document summarization expert.
Summarize the following document clearly and concisely.
Format:
- One paragraph overview (3-4 sentences)
- 4-5 key bullet points starting with a dash

Document:
{text}

Summary:"""

QA_PROMPT = """You are a helpful and precise document assistant. 

Instructions:
1. If the user greets you or makes small talk (e.g., "hi", "hello", "how are you"), respond naturally and politely as a helpful AI assistant.
2. For all queries about information, answer ONLY using the provided document context.
3. If the user asks a factual question and the answer is not in the context, say exactly: "I couldn't find that information in this document."
4. When answering from the document, always cite which page number(s) the answer comes from.

DOCUMENT CONTEXT:
{context}

PREVIOUS CONVERSATION:
{history}

USER QUESTION: {question}

ANSWER:"""


def get_summary(text: str) -> str:
    """
    Generate an AI summary of the document text.
    Uses the first 6000 characters for summarization.
    """
    model_name = 'gemini-2.5-flash'
    try:
        model = genai.GenerativeModel(model_name)
        prompt = SUMMARIZE_PROMPT.format(text=text[:2000])
        
        try:
            response = model.generate_content(prompt)
            logger.info(f"Summary generated successfully using {model_name}")
            return response.text
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                logger.warning(f"Quota exceeded (429) for summarization. Retrying in 40s...")
                time.sleep(40)
                response = model.generate_content(prompt)
                logger.info(f"Summary generated successfully on retry using {model_name}")
                return response.text
            raise
    except Exception as e:
        logger.error(f"Summary generation failed ({model_name}): {str(e)}")
        raise


def answer_question(question: str, chunks: list, chat_history: list = None) -> str:
    """
    Answer a question using RAG context chunks and chat history.
    """
    if chat_history is None:
        chat_history = []

    context = "\n\n---\n\n".join([f"[Page {c['page']}]: {c['text']}" for c in chunks])
    history = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in chat_history[-6:]])

    model_name = 'gemini-2.5-flash'
    try:
        model = genai.GenerativeModel(model_name)
        prompt = QA_PROMPT.format(context=context, history=history, question=question)
        
        try:
            response = model.generate_content(prompt)
            logger.info(f"Question answered successfully using {model_name}")
            return response.text
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                logger.warning(f"Quota exceeded (429) for QA. Retrying in 40s...")
                time.sleep(40)
                response = model.generate_content(prompt)
                logger.info(f"Question answered successfully on retry using {model_name}")
                return response.text
            raise
    except Exception as e:
        logger.error(f"QA failed ({model_name}): {str(e)}")
        raise


def get_source_pages(chunks: list) -> list:
    """Extract and deduplicate source page numbers from chunks."""
    return sorted(list(set([c['page'] for c in chunks])))
