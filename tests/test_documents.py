
import io

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend import documents


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Use a temporary directory instead of real uploads/
    monkeypatch.setattr(documents, "UPLOAD_DIR", tmp_path)

    with TestClient(app) as test_client:
        yield test_client


def test_upload_valid_pdf(client, tmp_path):
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj\n"
        b"<< /Type /Catalog >>\n"
        b"endobj\n"
        b"%%EOF"
    )

    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "example.pdf",
                io.BytesIO(pdf_content),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["status"] == "uploaded"
    assert data["filename"] == "example.pdf"
    assert data["size_bytes"] == len(pdf_content)

    saved_file = tmp_path / f"{data['id']}.pdf"

    assert saved_file.exists()
    assert saved_file.read_bytes() == pdf_content


def test_upload_rejects_non_pdf(client):
    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "notes.txt",
                io.BytesIO(b"Hello world"),
                "text/plain",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only PDF files are allowed"


def test_upload_rejects_invalid_pdf_content(client):
    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "fake.pdf",
                io.BytesIO(b"This is not a PDF"),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid PDF file"


def test_upload_rejects_oversized_pdf(client, monkeypatch):
    # Reduce the limit for testing without creating a 10 MB file
    monkeypatch.setattr(documents, "MAX_FILE_SIZE", 10)

    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "large.pdf",
                io.BytesIO(b"%PDF-" + b"A" * 20),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 413
    assert response.json()["detail"] == "File exceeds the 10 MB limit"


def test_upload_requires_file(client):
    response = client.post("/documents/upload")

    assert response.status_code == 422
