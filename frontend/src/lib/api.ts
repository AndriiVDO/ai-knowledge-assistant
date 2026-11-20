const API_URL = "http://127.0.0.1:8000";

export type UploadedDocument = {
  id: string;
  filename: string;
  size_bytes: number;
  status: string;
  saved_chunks: number;
};

export async function uploadDocument(file: File): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.detail ?? `Upload failed (HTTP ${response.status})`);
  }

  return response.json();
}

export type SourceReference = {
  page: number;
  chunk_id: number;
  score: number;
};

export type AskResponse = {
  document_id: string;
  question: string;
  answer: string;
  sources: SourceReference[];
  model: string;
};

export async function askDocument(
  documentId: string,
  question: string,
): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/documents/${documentId}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      top_k: 2,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      typeof error?.detail === "string"
        ? error.detail
        : `AI request failed (HTTP ${response.status})`,
    );
  }

  return response.json();
}

export type DocumentInfo = {
  id: string;
  filename: string;
  file_size: number;
  page_count: number;
  uploaded_at: string;
  chunk_count: number;
};

export async function getDocuments(): Promise<DocumentInfo[]> {
  const response = await fetch(`${API_URL}/documents`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load documents");
  }

  const data: { documents: DocumentInfo[] } = await response.json();

  return data.documents;
}
