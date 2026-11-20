"use client";

import { useEffect, useRef } from "react";
import {
  ArrowUp,
  BrainCircuit,
  FileText,
  FolderOpen,
  Loader2,
  Trash2,
} from "lucide-react";

import { MarkdownMessage } from "./MarkdownMessage";
import type { SourceReference, UploadedDocument } from "@/lib/api";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: SourceReference[];
};

type ChatWorkspaceProps = {
  document: UploadedDocument | null;
  messages: ChatMessage[];
  question: string;
  isAnswering: boolean;
  chatError: string | null;
  onQuestionChange: (value: string) => void;
  onAsk: () => void;
  onClearChat: () => void;
  onChangeDocument: () => void;
};

export function ChatWorkspace({
  document,
  messages,
  question,
  isAnswering,
  chatError,
  onQuestionChange,
  onAsk,
  onClearChat,
  onChangeDocument,
}: ChatWorkspaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isAnswering]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0d0d14]">
      {/* Compact document toolbar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-violet-400" />

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">
              {document?.filename ?? "No document selected"}
            </p>
            <p className="text-xs text-zinc-500">
              {document
                ? `${document.saved_chunks} indexed chunks`
                : "Choose a PDF to start chatting"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearChat}
            disabled={!document || messages.length === 0 || isAnswering}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onChangeDocument}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5"
          >
            <FolderOpen className="h-4 w-4" />
            Change Document
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-8 px-5 py-8 lg:px-8">
          {messages.length === 0 && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                <BrainCircuit className="h-7 w-7 text-violet-400" />
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {document
                  ? "What would you like to know?"
                  : "Your AI workspace"}
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
                {document
                  ? "Ask questions, explore concepts, and find information in your document."
                  : "Select a document to start an AI-powered conversation."}
              </p>
            </div>
          )}

          {messages.map((message, index) =>
            message.role === "user" ? (
              <div key={index} className="flex justify-end">
                <div className="max-w-[85%] min-w-0 whitespace-pre-wrap break-words rounded-2xl bg-[#29213e] px-5 py-3 text-sm leading-7 text-zinc-100">
                  {message.content}
                </div>
              </div>
            ) : (
              <div key={index} className="flex min-w-0 items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                  <BrainCircuit className="h-4 w-4 text-violet-400" />
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <MarkdownMessage content={message.content} />

                  {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, sourceIndex) => (
                        <span
                          key={`${source.page}-${source.chunk_id}-${sourceIndex}`}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-violet-300"
                        >
                          Page {source.page} · Chunk {source.chunk_id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
          )}

          {isAnswering && (
            <div
              role="status"
              className="flex items-center gap-3 text-sm text-zinc-400"
            >
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              Generating answer...
            </div>
          )}

          {chatError && (
            <p role="alert" className="text-sm text-red-400">
              {chatError}
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed chat composer */}
      <div className="shrink-0 px-5 pb-5 pt-3 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-2xl border border-white/15 bg-[#1b1b27] p-3 shadow-xl">
            <textarea
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  onAsk();
                }
              }}
              disabled={!document || isAnswering}
              placeholder={
                document
                  ? "Ask anything about your document..."
                  : "Select a document to start..."
              }
              rows={2}
              className="max-h-40 min-h-14 w-full resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-zinc-500 disabled:opacity-50"
            />

            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate px-2 text-xs text-zinc-500">
                {document?.filename ?? "No document selected"}
              </span>

              <button
                type="button"
                onClick={onAsk}
                disabled={!document || !question.trim() || isAnswering}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-zinc-600">
            AI responses may contain errors. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
