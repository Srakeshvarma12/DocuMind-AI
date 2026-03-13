# DocuMind AI

**DocuMind AI** is an advanced, enterprise-grade Document Intelligence and Natural Language Retrieval-Augmented Generation (RAG) platform. It enables users to upload, process, and converse with comprehensive documents using state-of-the-art Large Language Models (LLMs) and vector embeddings.

![DocuMind AI Preview](https://github.com/placeholder.png) <!-- Replace with actual screenshot -->

---

## 🚀 Key Features

- **Conversational RAG (Retrieval-Augmented Generation)**: Chat intuitively with your documents. DocuMind utilizes semantic chunking and vector embeddings to extract precise answers cited directly from the source pages.
- **Automated Summarization**: Instantly generate executive summaries and key bullet points upon document upload.
- **Asynchronous Processing**: Deep background task execution using **Celery** and **Redis**, allowing the user interface to remain highly responsive while heavy NLP and embedding operations occur.
- **Secure Authentication**: Built-in Google Single Sign-On (SSO) powered by Firebase, with a secure Guest User infrastructure for seamless trial access.
- **Modern UI/UX**: A highly responsive, glassmorphism-inspired React frontend built with Vite and Tailwind CSS.

---

## 🛠 Architecture & Tech Stack

### Frontend (User Interface)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **State Management**: React Context Auth Provider
- **Icons & Tyopgraphy**: Lucide-React & Custom styling
- **Hosting**: Prepared for Vercel / Netlify

### Backend (API & Processing)
- **Framework**: Django REST Framework (Python 3)
- **Database (Relational)**: PostgreSQL via adapter (or SQLite for local dev)
- **Database (Vector)**: ChromaDB for localized dense semantic retrieval
- **Task Queue**: Celery + Redis for async document parsing and AI pipeline execution
- **LLM Integration**: Google Gemini (`gemini-2.5-flash`) via `google-generativeai`
- **File Storage**: Cloudinary (Fallback to Local/Temporary)

---

## ⚙️ Local Development Setup

### Prisma & Dependencies

#### 1. Backend Integration (Django)
```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Migrate the database
python manage.py migrate
```

#### 2. Frontend Integration (React/Vite)
```bash
cd frontend

# Install Node dependencies
npm install
```

#### 3. Environment Variables
Create a `.env` file in the project root:
```ini
# Core
SECRET_KEY=your_django_secret
DEBUG=True

# AI Models
GEMINI_API_KEY=your_gemini_api_key

# Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Firebase & Redis
REDIS_URL=redis://localhost:6379/0
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/firebase-service-account.json
```

### Starting the Services (Requires 3 Terminals)

**Terminal 1: Django API server**
```bash
cd backend
python manage.py runserver
```

**Terminal 2: Celery Worker (requires Redis running on port 6379)**
```bash
cd backend
celery -A documind worker -l info --pool=solo
```

**Terminal 3: React Frontend**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🧠 AI Pipeline Details

When a document (PDF, TXT, DOCX) is uploaded:
1. **Extraction**: Text is extracted locally using specialized document parsers.
2. **Chunking**: The document is split into overlapping semantic chunks to preserve context boundaries.
3. **Embedding**: Chunks are processed and injected into a localized instance of ChromaDB for fast retrieval.
4. **Summarization**: `gemini-2.5-flash` creates an immediate executive summary of the document.
5. **Chat (RAG)**: Querying the document embeds the search phrase, compares it via cosine similarity in ChromaDB, and passes the most relevant chunks into a structured conversational prompt for precise, hallucination-free answering.

---

## 🛡️ License & Contributing

This project is proprietary. Code distribution or reproduction is strictly prohibited without explicit authorization.
