
from fastapi.testclient import TestClient
import httpx
from backend.main import app
from backend import documents


client = TestClient(app)

DOCUMENT_ID = "5756cef4-461f-4b00-81e4-68ccdc1c86d3"


def test_ask_document_success(monkeypatch):
    """Test RAG API without running real AI models."""

    def fake_retrieve_context(document_id, question, top_k):
        return {
            "question": question,
            "context": "[Source: page 1, chunk 2]\nVar(X) = E(X²) - µ²",
            "sources": [
                {
                    "page": 1,
                    "chunk_id": 2,
                    "score": 0.7858,
                }
            ],
        }

    def fake_generate_answer(question, context):
        return "Дисперсія обчислюється за формулою Var(X) = E(X²) - µ²."

    monkeypatch.setattr(
        documents,
        "retrieve_context",
        fake_retrieve_context,
    )

    monkeypatch.setattr(
        documents,
        "generate_answer",
        fake_generate_answer,
    )

    response = client.post(
        f"/documents/{DOCUMENT_ID}/ask",
        json={
            "question": "Як розрахувати дисперсію?",
            "top_k": 2,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["document_id"] == DOCUMENT_ID
    assert "Дисперсія" in data["answer"]
    assert len(data["sources"]) == 1
    assert data["sources"][0]["page"] == 1
    assert data["model"] == "local-llm"


def test_ask_document_invalid_id():
    response = client.post(
        "/documents/invalid-id/ask",
        json={"question": "What is variance?"},
    )

    assert response.status_code == 400


def test_ask_document_empty_question():
    response = client.post(
        f"/documents/{DOCUMENT_ID}/ask",
        json={"question": ""},
    )

    assert response.status_code == 422


def test_ask_document_invalid_top_k():
    response = client.post(
        f"/documents/{DOCUMENT_ID}/ask",
        json={
            "question": "What is variance?",
            "top_k": 0,
        },
    )

    assert response.status_code == 422


def test_ask_document_no_indexed_content(monkeypatch):
    monkeypatch.setattr(
        documents,
        "retrieve_context",
        lambda document_id, question, top_k: {
            "question": question,
            "context": "",
            "sources": [],
        },
    )

    response = client.post(
        f"/documents/{DOCUMENT_ID}/ask",
        json={"question": "What is variance?"},
    )

    assert response.status_code == 404


def test_ask_document_ollama_timeout(monkeypatch):
    """Return HTTP 504 when the AI model times out."""

    monkeypatch.setattr(
        documents,
        "retrieve_context",
        lambda document_id, question, top_k: {
            "question": question,
            "context": "[Source: page 1, chunk 1]\nTest content",
            "sources": [
                {"page": 1, "chunk_id": 1, "score": 0.9}
            ],
        },
    )

    def fake_generate_answer(question, context):
        raise httpx.ReadTimeout("Model timed out")

    monkeypatch.setattr(
        documents,
        "generate_answer",
        fake_generate_answer,
    )

    response = client.post(
        f"/documents/{DOCUMENT_ID}/ask",
        json={"question": "What is variance?"},
    )

    assert response.status_code == 504
    assert response.json()["detail"] == "AI model response timed out"


def test_ask_document_ollama_unavailable(monkeypatch):
    """Return HTTP 503 when Ollama is unavailable."""

    monkeypatch.setattr(
        documents,
        "retrieve_context",
        lambda document_id, question, top_k: {
            "question": question,
            "context": "[Source: page 1, chunk 1]\nTest content",
            "sources": [
                {"page": 1, "chunk_id": 1, "score": 0.9}
            ],
        },
    )

    def fake_generate_answer(question, context):
        raise httpx.ConnectError("Connection refused")

    monkeypatch.setattr(
        documents,
        "generate_answer",
        fake_generate_answer,
    )

    response = client.post(
        f"/documents/{DOCUMENT_ID}/ask",
        json={"question": "What is variance?"},
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "AI model service is unavailable"
