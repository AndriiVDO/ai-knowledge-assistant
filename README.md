# AI Knowledge Assistant

An AI-powered document assistant built with Python and FastAPI.

The goal is to create a RAG (Retrieval-Augmented Generation) application that allows users to upload PDF documents and ask questions based on their content.

## Tech Stack

- Python 3.13
- FastAPI
- Uvicorn
- Next.js (planned)
- PostgreSQL + pgvector (planned)
- LLM API (planned)
- Docker (planned)

## Current Features

- FastAPI backend
- Health check endpoint
- Automatic OpenAPI documentation
- Interactive Swagger UI

## Planned Features

- PDF document uploads
- Text extraction and chunking
- Semantic search using embeddings
- RAG-based question answering
- Source citations
- Web interface

## Getting Started

### 1. Create a virtual environment

```powershell
python -m venv .venv
```

### 2. Activate it (PowerShell)

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 4. Run the backend

```powershell
python -m uvicorn backend.main:app --reload
```

## API Endpoints

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| GET    | `/`       | Welcome message  |
| GET    | `/health` | API health check |

## API Documentation

After starting the server:

- Swagger UI: http://127.0.0.1:8000/docs
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

## Project Status

Early development — backend foundation implemented.

## License

To be determined.
