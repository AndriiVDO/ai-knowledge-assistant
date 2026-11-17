
from pathlib import Path

from backend.pdf_processor import extract_pdf_text
from backend.chunking import chunk_pages
from backend.embeddings import embed_documents
from backend.repository import save_document


def index_document(
    document_id: str,
    filename: str,
    file_path: Path,
) -> dict:
    """Process a PDF and save its embeddings in PostgreSQL."""

    # Step 1: Extract text
    document = extract_pdf_text(file_path)

    # Step 2: Split into chunks
    chunks = chunk_pages(document["pages"])

    if not chunks:
        raise ValueError(
            "No extractable text found in PDF"
        )

    # Step 3: Generate embeddings
    texts = [chunk["text"] for chunk in chunks]
    embeddings = embed_documents(texts)

    # Step 4: Save everything to PostgreSQL
    return save_document(
        document_id=document_id,
        filename=filename,
        file_size=file_path.stat().st_size,
        page_count=document["page_count"],
        chunks=chunks,
        embeddings=embeddings,
    )
