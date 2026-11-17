
import numpy as np
import pytest

from backend import search


@pytest.fixture
def mock_embeddings(monkeypatch):
    """Use deterministic vectors without loading the AI model."""

    def fake_embed_documents(texts):
        vectors = {
            "Python programming": [1.0, 0.0],
            "Statistics and variance": [0.0, 1.0],
            "Machine learning": [0.8, 0.6],
        }
        return np.array([vectors[text] for text in texts])

    def fake_embed_query(query):
        return np.array([0.0, 1.0])

    monkeypatch.setattr(
        search, "embed_documents", fake_embed_documents
    )
    monkeypatch.setattr(
        search, "embed_query", fake_embed_query
    )


@pytest.fixture
def sample_chunks():
    return [
        {
            "chunk_id": 1,
            "page": 1,
            "text": "Python programming",
        },
        {
            "chunk_id": 2,
            "page": 2,
            "text": "Statistics and variance",
        },
        {
            "chunk_id": 3,
            "page": 3,
            "text": "Machine learning",
        },
    ]


def test_search_returns_most_relevant_chunk(
    mock_embeddings, sample_chunks
):
    results = search.semantic_search(
        "What is variance?",
        sample_chunks,
        top_k=1,
    )

    assert len(results) == 1
    assert results[0]["chunk_id"] == 2
    assert results[0]["page"] == 2
    assert results[0]["score"] == 1.0


def test_search_respects_top_k(
    mock_embeddings, sample_chunks
):
    results = search.semantic_search(
        "What is variance?",
        sample_chunks,
        top_k=2,
    )

    assert len(results) == 2
    assert results[0]["chunk_id"] == 2
    assert results[1]["chunk_id"] == 3


def test_search_empty_chunks():
    results = search.semantic_search(
        "What is variance?",
        [],
    )

    assert results == []


def test_search_rejects_empty_query():
    with pytest.raises(ValueError):
        search.semantic_search(
            "   ",
            [{"chunk_id": 1, "page": 1, "text": "Test"}],
        )


def test_search_rejects_invalid_top_k():
    with pytest.raises(ValueError):
        search.semantic_search(
            "What is variance?",
            [],
            top_k=0,
        )
