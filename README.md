# AI Knowledge Assistant

An AI-powered document assistant built with Python and FastAPI.

The goal is to create a RAG (Retrieval-Augmented Generation) application that allows users to upload PDF documents and ask questions based on their content.

## Tech Stack

### Currently Used

- Python 3.13
- FastAPI
- Uvicorn
- PyMuPDF
- pytest

### Planned

- Next.js + TypeScript
- PostgreSQL + pgvector
- LLM API
- Docker
- GitHub Actions

## Current Features

- REST API built with FastAPI
- PDF upload with file validation (10 MB limit)
- Unique document IDs using UUID
- Local PDF document storage
- PDF text extraction using PyMuPDF
- Page-aware text chunking with overlap
- Document text and chunks retrieval endpoints
- Automatic OpenAPI documentation
- Interactive Swagger UI
- Multilingual text embeddings using multilingual-e5-small
- Semantic search across PDF documents
- Cross-language document retrieval
- Cosine similarity ranking
- Semantic Search REST API
- PostgreSQL database with pgvector extension
- Persistent storage of document chunks and embeddings
- Vector similarity search using cosine distance
- Automatic PDF indexing after upload
- Safe document re-indexing
- Automated tests using pytest (17 tests)

## Planned Features

- Semantic search using embeddings
- Vector database integration with pgvector
- RAG-based question answering
- AI chat with document context
- Source citations with page references
- Modern web interface using Next.js
- Docker containerization
- CI/CD with GitHub Actions

## Project Structure

```text
ai-knowledge-assistant/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── documents.py
│   ├── pdf_processor.py
│   └── chunking.py
├── tests/
│   ├── test_chunking.py
│   └── test_documents.py
├── docs/
│   └── screenshots/
├── uploads/              # Local files (Git ignored)
├── .gitignore
├── requirements.txt
└── README.md
```

## Getting Started

### 1. Clone the repository

```powershell
git clone https://github.com/AndriiVDO/ai-knowledge-assistant.git
cd ai-knowledge-assistant
```

### 2. Create a virtual environment

```powershell
python -m venv .venv
```

### 3. Activate the environment (PowerShell)

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 5. Start the backend

```powershell
python -m uvicorn backend.main:app --reload
```

The API will be available at:

http://127.0.0.1:8000

## API Endpoints

| Method | Endpoint                          | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/`                               | Welcome message              |
| GET    | `/health`                         | API health check             |
| POST   | `/documents/upload`               | Upload a PDF document        |
| GET    | `/documents/{document_id}/text`   | Extract PDF text             |
| GET    | `/documents/{document_id}/chunks` | Retrieve text chunks         |
| POST   | `/documents/{document_id}/search` | Semantic search within a PDF |
| POST   | `/documents/{document_id}/index`  | Index or re-index a PDF      |

## API Documentation

After starting the backend:

- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

## Testing

Run all automated tests:

```powershell
python -m pytest -v
```

Current automated tests cover:

- Successful PDF upload
- Invalid file extensions
- Invalid PDF signatures
- File size limits
- Missing upload files
- Text chunking
- Chunk overlap
- Page number preservation
- Invalid chunk parameters

**Current result: 10 tests passed.**

## Security Notes

- Uploaded files are limited to 10 MB.
- PDF extensions and file signatures are checked.
- Uploaded documents are stored using UUID filenames.
- Local uploads and environment variables are excluded from Git.

The current validation is intended for development and does not constitute complete production-grade PDF security.

## Roadmap

- [x] Initialize FastAPI backend
- [x] Implement health check
- [x] Implement PDF upload
- [x] Implement PDF text extraction
- [x] Implement text chunking
- [x] Add automated tests
- [x] Generate document embeddings
- [x] Implement semantic search
- [x] Integrate PostgreSQL and pgvector
- [x] Implement automatic document indexing
- [x] Implement persistent vector search
- [ ] Implement RAG pipeline
- [ ] Add LLM-powered chat
- [ ] Build Next.js frontend
- [ ] Add Docker support
- [ ] Configure CI/CD
- [ ] Deploy application

## Project Status

**Active Development — Document Processing Completed**

The backend currently supports PDF uploads, text extraction and chunking.

The next development milestone is implementing embeddings and semantic search.

## License

To be determined.
