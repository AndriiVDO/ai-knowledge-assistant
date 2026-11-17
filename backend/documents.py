from backend.pdf_processor import extract_pdf_text
from pathlib import Path
from uuid import UUID, uuid4
from backend.chunking import chunk_pages

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", status_code=201)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    document_id = str(uuid4())
    output_path = UPLOAD_DIR / f"{document_id}.pdf"

    size = 0

    try:
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        with output_path.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)

                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File exceeds the 10 MB limit"
                    )

                output.write(chunk)

        with output_path.open("rb") as saved:
            if saved.read(5) != b"%PDF-":
                raise HTTPException(
                    status_code=400,
                    detail="Invalid PDF file"
                )

    except Exception:
        output_path.unlink(missing_ok=True)
        raise

    finally:
        await file.close()

    return {
        "id": document_id,
        "filename": file.filename,
        "size_bytes": size,
        "status": "uploaded"
    }


@router.get("/{document_id}/text")
def get_document_text(document_id: str):
    try:
        document_uuid = UUID(document_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID"
        )

    file_path = UPLOAD_DIR / f"{document_uuid}.pdf"

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    try:
        result = extract_pdf_text(file_path)
    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Unable to extract text from PDF"
        )

    return {
        "document_id": str(document_uuid),
        **result
    }



@router.get("/{document_id}/chunks")
def get_document_chunks(document_id: str):
    try:
        document_uuid = UUID(document_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID"
        )

    file_path = UPLOAD_DIR / f"{document_uuid}.pdf"

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    try:
        document = extract_pdf_text(file_path)
        chunks = chunk_pages(document["pages"])
    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Unable to process PDF"
        )

    return {
        "document_id": str(document_uuid),
        "page_count": document["page_count"],
        "chunk_count": len(chunks),
        "chunks": chunks
    }
