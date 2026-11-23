
-- AI Knowledge Assistant
-- PostgreSQL database initialization

-- Enable vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents metadata
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    page_count INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document text chunks and embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id BIGSERIAL PRIMARY KEY,

    document_id UUID NOT NULL
        REFERENCES documents(id)
        ON DELETE CASCADE,

    chunk_index INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT document_chunks_document_id_chunk_index_key
        UNIQUE (document_id, chunk_index)
);

-- Index for retrieving chunks by document
CREATE INDEX IF NOT EXISTS idx_chunks_document_id
ON document_chunks(document_id);
