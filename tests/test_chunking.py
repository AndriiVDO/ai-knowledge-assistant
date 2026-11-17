
import pytest

from backend.chunking import chunk_pages


def test_chunking_short_text():
    pages = [
        {"page": 1, "text": "Hello AI"}
    ]

    chunks = chunk_pages(pages)

    assert len(chunks) == 1
    assert chunks[0]["text"] == "Hello AI"
    assert chunks[0]["page"] == 1


def test_chunking_with_overlap():
    pages = [
        {"page": 1, "text": "ABCDEFGHIJ"}
    ]

    chunks = chunk_pages(
        pages,
        chunk_size=6,
        overlap=2
    )

    assert len(chunks) == 2
    assert chunks[0]["text"] == "ABCDEF"
    assert chunks[1]["text"] == "EFGHIJ"


def test_chunking_preserves_page_numbers():
    pages = [
        {"page": 1, "text": "First page"},
        {"page": 2, "text": "Second page"}
    ]

    chunks = chunk_pages(pages)

    assert len(chunks) == 2
    assert chunks[0]["page"] == 1
    assert chunks[1]["page"] == 2


def test_chunking_invalid_size():
    with pytest.raises(ValueError):
        chunk_pages(
            [{"page": 1, "text": "Hello"}],
            chunk_size=0
        )


def test_chunking_invalid_overlap():
    with pytest.raises(ValueError):
        chunk_pages(
            [{"page": 1, "text": "Hello"}],
            chunk_size=100,
            overlap=100
        )
