
from pathlib import Path
from unittest.mock import Mock

import numpy as np
import pytest

from backend import indexing


def test_index_document_success(tmp_path, monkeypatch):
    pdf_path = tmp_path / "example.pdf"
    pdf_path.write_bytes(b"%PDF-1.4 test content")

    pages = [{"page": 1, "text": "Example text"}]
    chunks = [
        {"chunk_id": 1, "page": 1, "text": "Example text"}
    ]
    vectors = np.zeros((1, 384), dtype=np.float32)

    extract_mock = Mock(
        return_value={"page_count": 1, "pages": pages}
    )
    chunk_mock = Mock(return_value=chunks)
    embed_mock = Mock(return_value=vectors)
    save_mock = Mock(
        return_value={
            "document_id": "test-id",
            "saved_chunks": 1,
            "status": "indexed",
        }
    )

    monkeypatch.setattr(indexing, "extract_pdf_text", extract_mock)
    monkeypatch.setattr(indexing, "chunk_pages", chunk_mock)
    monkeypatch.setattr(indexing, "embed_documents", embed_mock)
    monkeypatch.setattr(indexing, "save_document", save_mock)

    result = indexing.index_document(
        document_id="test-id",
        filename="example.pdf",
        file_path=pdf_path,
    )

    assert result["status"] == "indexed"
    assert result["saved_chunks"] == 1

    embed_mock.assert_called_once_with(["Example text"])

    save_mock.assert_called_once()
    assert save_mock.call_args.kwargs["page_count"] == 1
    assert save_mock.call_args.kwargs["file_size"] == pdf_path.stat().st_size


def test_index_document_empty_pdf(tmp_path, monkeypatch):
    pdf_path = tmp_path / "empty.pdf"
    pdf_path.write_bytes(b"%PDF-1.4")

    monkeypatch.setattr(
        indexing,
        "extract_pdf_text",
        lambda path: {
            "page_count": 1,
            "pages": [{"page": 1, "text": ""}],
        },
    )

    monkeypatch.setattr(
        indexing,
        "chunk_pages",
        lambda pages: [],
    )

    embed_mock = Mock()
    save_mock = Mock()

    monkeypatch.setattr(indexing, "embed_documents", embed_mock)
    monkeypatch.setattr(indexing, "save_document", save_mock)

    with pytest.raises(
        ValueError,
        match="No extractable text found in PDF",
    ):
        indexing.index_document(
            document_id="test-id",
            filename="empty.pdf",
            file_path=pdf_path,
        )

    embed_mock.assert_not_called()
    save_mock.assert_not_called()
