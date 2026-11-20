import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type MarkdownMessageProps = {
  content: string;
};

function normalizeMathDelimiters(content: string): string {
  return content
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, formula: string) => {
      return `\n\n$$${formula}$$\n\n`;
    })
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula: string) => {
      return `$${formula}$`;
    });
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="ai-markdown min-w-0 max-w-full break-words text-sm leading-7 text-zinc-200">
      {" "}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        skipHtml
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-5 text-xl font-bold text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 mt-4 text-lg font-semibold text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 font-semibold text-white">{children}</h3>
          ),
          p: ({ children }) => <p className="my-2">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-[#09090f] p-4 text-xs leading-6">
              {children}
            </pre>
          ),
          code: ({ children, className }) => (
            <code
              className={
                className ?? "rounded bg-white/10 px-1.5 py-0.5 text-violet-300"
              }
            >
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-white/15 bg-white/5 px-3 py-2 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-white/15 px-3 py-2">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-violet-500 pl-4 text-zinc-400">
              {children}
            </blockquote>
          ),
        }}
      >
        {normalizeMathDelimiters(content)}
      </ReactMarkdown>
    </div>
  );
}
