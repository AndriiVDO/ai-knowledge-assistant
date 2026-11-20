"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowUp,
  BrainCircuit,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageSquareText,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
  Trash2,
  Files,
  BookOpen,
  Database,
  Clock3,
  ArrowRight,
} from "lucide-react";

import {
  uploadDocument,
  askDocument,
  getDocuments,
  type UploadedDocument,
  type SourceReference,
  type DocumentInfo,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

type View = "dashboard" | "documents" | "chat";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: SourceReference[];
};

function getChatStorageKey(documentId: string): string {
  return `ai-knowledge-chat-${documentId}`;
}

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [uploadedDocument, setUploadedDocument] =
    useState<UploadedDocument | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      try {
        const data = await getDocuments();

        if (!cancelled) {
          setDocuments(data);
          setDocumentsError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setDocumentsError(
            error instanceof Error
              ? error.message
              : "Unable to load documents.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDocuments(false);
        }
      }
    }

    loadDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoadingDocuments || documentsError) return;

    const savedDocumentId = localStorage.getItem(
      "ai-knowledge-active-document",
    );

    if (!savedDocumentId) return;

    const savedDocument = documents.find(
      (document) => document.id === savedDocumentId,
    );

    if (!savedDocument) {
      localStorage.removeItem("ai-knowledge-active-document");
      return;
    }

    setUploadedDocument({
      id: savedDocument.id,
      filename: savedDocument.filename,
      size_bytes: savedDocument.file_size,
      status: "indexed",
      saved_chunks: savedDocument.chunk_count,
    });
  }, [documents, isLoadingDocuments, documentsError]);

  useEffect(() => {
    if (!uploadedDocument) {
      return;
    }

    const storageKey = getChatStorageKey(uploadedDocument.id);
    const savedMessages = localStorage.getItem(storageKey);

    if (!savedMessages) {
      setMessages([]);
      return;
    }

    try {
      const parsed: unknown = JSON.parse(savedMessages);

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid chat history");
      }

      const validMessages = parsed.filter(
        (item): item is ChatMessage =>
          typeof item === "object" &&
          item !== null &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string",
      );

      setMessages(validMessages);
    } catch {
      setMessages([]);
    }
  }, [uploadedDocument?.id]);

  const [documentSearch, setDocumentSearch] = useState("");
  const [documentSort, setDocumentSort] = useState<
    "newest" | "oldest" | "name"
  >("newest");

  const navigation = [
    { id: "dashboard" as View, label: "Overview", icon: LayoutDashboard },
    { id: "documents" as View, label: "My Documents", icon: FolderOpen },
    { id: "chat" as View, label: "AI Chat", icon: MessageSquareText },
  ];

  const filteredDocuments = documents
    .filter((document) =>
      document.filename
        .toLowerCase()
        .includes(documentSearch.trim().toLowerCase()),
    )
    .sort((a, b) => {
      if (documentSort === "name") {
        return a.filename.localeCompare(b.filename);
      }

      const dateA = new Date(a.uploaded_at).getTime();
      const dateB = new Date(b.uploaded_at).getTime();

      return documentSort === "newest" ? dateB - dateA : dateA - dateB;
    });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("PDF files must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setView("documents");
  }

  function openDocumentChat(document: DocumentInfo) {
    localStorage.setItem("ai-knowledge-active-document", document.id);

    setUploadedDocument({
      id: document.id,
      filename: document.filename,
      size_bytes: document.file_size,
      status: "indexed",
      saved_chunks: document.chunk_count,
    });

    setChatError(null);
    setView("chat");
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const document = await uploadDocument(selectedFile);

      setUploadedDocument(document);
      localStorage.setItem("ai-knowledge-active-document", document.id);
      const updatedDocuments = await getDocuments();
      setDocuments(updatedDocuments);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setView("documents");
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Something went wrong during upload.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function updateMessages(documentId: string, newMessage: ChatMessage) {
    const storageKey = getChatStorageKey(documentId);
    const savedMessages = localStorage.getItem(storageKey);

    let previous: ChatMessage[] = [];

    if (savedMessages) {
      try {
        const parsed: unknown = JSON.parse(savedMessages);

        if (Array.isArray(parsed)) {
          previous = parsed.filter(
            (item): item is ChatMessage =>
              typeof item === "object" &&
              item !== null &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string",
          );
        }
      } catch {
        previous = [];
      }
    }

    const updated = [...previous, newMessage];

    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (uploadedDocument?.id === documentId) {
      setMessages(updated);
    }
  }

  function handleClearChat() {
    if (!uploadedDocument || isAnswering) return;

    const confirmed = window.confirm(
      `Clear chat history for "${uploadedDocument.filename}"?`,
    );

    if (!confirmed) return;

    localStorage.removeItem(getChatStorageKey(uploadedDocument.id));

    setMessages([]);
    setChatError(null);
  }

  async function handleAsk() {
    const text = question.trim();

    if (!text || !uploadedDocument || isAnswering) return;

    setQuestion("");
    setChatError(null);
    setIsAnswering(true);

    updateMessages(uploadedDocument.id, {
      role: "user",
      content: text,
    });

    try {
      const response = await askDocument(uploadedDocument.id, text);

      updateMessages(uploadedDocument.id, {
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      });
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Unable to generate an answer.",
      );
    } finally {
      setIsAnswering(false);
    }
  }

  return (
    <div className="h-dvh overflow-hidden bg-[#09090f] text-white">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#0e0e16] p-5 md:flex">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <BrainCircuit className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm font-bold">Knowledge AI</p>
              <p className="text-xs text-zinc-500">Document Intelligence</p>
            </div>
          </div>

          <div className="mt-10 px-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Workspace
          </div>

          <nav className="mt-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    active
                      ? "bg-violet-500/15 text-violet-300"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
              <Sparkles className="mb-3 h-5 w-5 text-violet-400" />
              <p className="text-sm font-semibold">AI-powered workspace</p>
              <p className="mt-2 text-xs leading-5 text-zinc-400">
                Search documents by meaning and ask questions using AI.
              </p>
            </div>

            <div className="flex items-center gap-3 border-t border-white/10 pt-4 text-sm text-zinc-500">
              <Settings2 className="h-4 w-4" />
              <span>Workspace settings</span>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {view !== "chat" && (
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">
              <div>
                <p className="text-xs text-zinc-500">PERSONAL WORKSPACE</p>
                <h1 className="mt-1 text-xl font-semibold">
                  {view === "dashboard"
                    ? "Overview"
                    : view === "documents"
                      ? "My Documents"
                      : "AI Chat"}
                </h1>
              </div>

              <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Local AI
              </Badge>
            </header>
          )}

          <div
            className={
              view === "chat"
                ? "flex min-h-0 w-full flex-1 flex-col px-6 py-6 lg:px-10"
                : "mx-auto w-full max-w-6xl flex-1 space-y-8 overflow-y-auto px-6 py-8 lg:px-10"
            }
          >
            {/* Welcome */}
            {view === "dashboard" && (
              <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-[#251b46] via-[#171326] to-[#11111b] p-8 md:p-10">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

                <div className="relative">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
                    <Sparkles className="h-3 w-3" />
                    Your AI Research Workspace
                  </div>

                  <h2 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
                    Turn documents into
                    <span className="text-violet-400"> knowledge.</span>
                  </h2>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400">
                    Upload PDFs, discover relevant information, and ask AI
                    questions grounded in your documents.
                  </p>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-7 rounded-xl bg-violet-600 text-white hover:bg-violet-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Document
                  </Button>
                </div>
              </section>
            )}

            {/* Dashboard statistics */}
            {view === "dashboard" && (
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Total Documents",
                    value: documents.length,
                    description: "PDF files in your library",
                    icon: Files,
                  },
                  {
                    title: "Total Pages",
                    value: documents.reduce(
                      (total, doc) => total + doc.page_count,
                      0,
                    ),
                    description: "Processed document pages",
                    icon: BookOpen,
                  },
                  {
                    title: "Indexed Chunks",
                    value: documents.reduce(
                      (total, doc) => total + doc.chunk_count,
                      0,
                    ),
                    description: "Searchable text segments",
                    icon: Database,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="rounded-2xl border border-white/10 bg-[#11111b] p-6"
                    >
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                        <Icon className="h-5 w-5 text-violet-400" />
                      </div>

                      <p className="text-sm text-zinc-400">{stat.title}</p>

                      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        {isLoadingDocuments
                          ? "..."
                          : documentsError
                            ? "—"
                            : stat.value.toLocaleString()}
                      </p>

                      <p className="mt-2 text-xs text-zinc-500">
                        {stat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Documents */}
            {view === "dashboard" && (
              <section className="rounded-2xl border border-white/10 bg-[#11111b] p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Recent Documents
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Quickly continue working with your documents.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setView("documents")}
                    className="flex items-center gap-2 text-sm text-violet-400 transition hover:text-violet-300"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {isLoadingDocuments ? (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    Loading recent documents...
                  </p>
                ) : documentsError ? (
                  <p role="alert" className="py-8 text-sm text-red-400">
                    {documentsError}
                  </p>
                ) : documents.length === 0 ? (
                  <div className="py-10 text-center">
                    <FileText className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                    <p className="text-sm text-zinc-400">
                      No documents uploaded yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...documents]
                      .sort(
                        (a, b) =>
                          new Date(b.uploaded_at).getTime() -
                          new Date(a.uploaded_at).getTime(),
                      )
                      .slice(0, 4)
                      .map((document) => (
                        <div
                          key={document.id}
                          className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-violet-500/30"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                            <FileText className="h-5 w-5 text-violet-400" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {document.filename}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                              <span>{document.page_count} pages</span>
                              <span>{document.chunk_count} chunks</span>

                              <span className="flex items-center gap-1">
                                <Clock3 className="h-3 w-3" />
                                {new Date(
                                  document.uploaded_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => openDocumentChat(document)}
                            className="flex items-center gap-2 rounded-lg bg-violet-600/15 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-600/25"
                          >
                            <MessageSquareText className="h-4 w-4" />
                            Continue Chat
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            )}

            {/* Document section */}
            {view !== "chat" && (
              <section className="rounded-2xl border border-white/10 bg-[#11111b] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Your Documents</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Choose a PDF to prepare it for your workspace.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Select PDF
                  </Button>
                </div>

                {/* Search and sort documents */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                    <input
                      type="search"
                      value={documentSearch}
                      onChange={(event) =>
                        setDocumentSearch(event.target.value)
                      }
                      placeholder="Search documents..."
                      aria-label="Search documents"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500"
                    />
                  </div>

                  <select
                    value={documentSort}
                    onChange={(event) =>
                      setDocumentSort(
                        event.target.value as "newest" | "oldest" | "name",
                      )
                    }
                    aria-label="Sort documents"
                    className="h-11 rounded-xl border border-white/10 bg-[#1b1b27] px-4 text-sm text-zinc-300 outline-none focus:border-violet-500"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </div>

                <div className="mb-6 space-y-3">
                  {isLoadingDocuments && (
                    <p className="text-sm text-zinc-500">
                      Loading documents...
                    </p>
                  )}

                  {documentsError && (
                    <p role="alert" className="text-sm text-red-400">
                      {documentsError}
                    </p>
                  )}

                  {!isLoadingDocuments &&
                    !documentsError &&
                    documents.length === 0 && (
                      <p className="text-sm text-zinc-500">
                        No uploaded documents yet.
                      </p>
                    )}

                  {!isLoadingDocuments &&
                    !documentsError &&
                    documents.length > 0 &&
                    filteredDocuments.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
                        <Search className="mx-auto mb-3 h-7 w-7 text-zinc-600" />
                        <p className="text-sm text-zinc-400">
                          No documents found
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          Try a different search term.
                        </p>
                      </div>
                    )}

                  {filteredDocuments.map((document) => {
                    const active = uploadedDocument?.id === document.id;

                    return (
                      <button
                        key={document.id}
                        onClick={() => openDocumentChat(document)}
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                          active
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-white/10 bg-white/5 hover:border-violet-500/40"
                        }`}
                      >
                        <FileText className="h-7 w-7 shrink-0 text-violet-400" />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {document.filename}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {document.page_count} pages · {document.chunk_count}{" "}
                            chunks
                          </p>
                        </div>

                        <Badge className="bg-emerald-500/10 text-emerald-400">
                          {active ? "Selected" : "Indexed"}
                        </Badge>
                      </button>
                    );
                  })}
                </div>

                {uploadedDocument && (
                  <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-emerald-400" />

                      <div>
                        <p className="font-medium text-white">
                          {uploadedDocument.filename}
                        </p>
                        <p className="mt-1 text-sm text-emerald-400">
                          Successfully indexed · {uploadedDocument.saved_chunks}{" "}
                          chunks
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <p role="alert" className="mb-4 text-sm text-red-400">
                    {uploadError}
                  </p>
                )}

                {selectedFile ? (
                  <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
                    <FileText className="h-8 w-8 text-violet-400" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Selected locally · Not uploaded yet
                      </p>
                    </div>

                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-violet-600 text-white hover:bg-violet-500"
                    >
                      {isUploading ? "Indexing..." : "Upload PDF"}
                    </Button>

                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      aria-label="Remove selected file"
                      className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center transition hover:border-violet-500/50 hover:bg-violet-500/5"
                  >
                    <UploadCloud className="mb-4 h-10 w-10 text-violet-400" />
                    <h3 className="font-medium">Choose your first document</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      PDF files up to 10 MB
                    </p>
                  </button>
                )}
              </section>
            )}

            {/* AI Chat */}
            {view === "chat" && (
              <div className="min-h-0 flex-1">
                <ChatWorkspace
                  document={uploadedDocument}
                  messages={messages}
                  question={question}
                  isAnswering={isAnswering}
                  chatError={chatError}
                  onQuestionChange={setQuestion}
                  onAsk={handleAsk}
                  onClearChat={handleClearChat}
                  onChangeDocument={() => setView("documents")}
                />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </main>
      </div>
    </div>
  );
}
