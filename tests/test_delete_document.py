
from uuid import uuid4

from fastapi.testclient import TestClient

from backend.main import app
from backend import documents


client = TestClient(app)

DOCUMENT_ID = str(uuid4())


def test_delete_document_success(monkeypatch, tmp_path):
    """Delete metadata and the uploaded PDF."""

    pdf_file = tmp_path / f"{DOCUMENT_ID}.pdf"
    pdf_file.write_bytes(b"%PDF-1.4\nTest PDF")

    monkeypatch.setattr(documents, "UPLOAD_DIR", tmp_path)
    monkeypatch.setattr(
        documents,
        "delete_document",
        lambda document_id: True,
    )

    response = client.delete(
        f"/documents/{DOCUMENT_ID}"
    )

    assert response.status_code == 200
    assert response.json()["document_id"] == DOCUMENT_ID
    assert response.json()["message"] == "Document deleted successfully"
    assert not pdf_file.exists()


def test_delete_document_not_found(monkeypatch, tmp_path):
    """Return 404 when the document does not exist."""

    monkeypatch.setattr(documents, "UPLOAD_DIR", tmp_path)
    monkeypatch.setattr(
        documents,
        "delete_document",
        lambda document_id: False,
    )

    response = client.delete(
        f"/documents/{DOCUMENT_ID}"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Document not found"


def test_delete_document_invalid_uuid(monkeypatch):
    """Reject an invalid document identifier."""

    def should_not_delete(document_id):
        raise AssertionError("Repository should not be called")

    monkeypatch.setattr(
        documents,
        "delete_document",
        should_not_delete,
    )

    response = client.delete(
        "/documents/invalid-id"
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid document ID"
