
from pathlib import Path

import pymupdf


def extract_pdf_text(file_path: Path) -> dict:
    """Extract text from a PDF document."""

    if not file_path.is_file():
        raise FileNotFoundError(
            f"PDF file not found: {file_path}"
        )

    pages = []

    with pymupdf.open(file_path) as document:
        for page_number, page in enumerate(document, start=1):
            text = page.get_text("text")

            pages.append({
                "page": page_number,
                "text": text.strip()
            })

    return {
        "page_count": len(pages),
        "pages": pages,
        "total_characters": sum(
            len(page["text"]) for page in pages
        )
    }
