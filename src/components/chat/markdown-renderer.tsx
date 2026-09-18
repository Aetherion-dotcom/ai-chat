import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils";

const components: Components = {
  h1: ({ children }) => <h1 className="mt-6 mb-3 text-xl font-semibold tracking-tight first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-6 mb-2 text-lg font-semibold tracking-tight first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-5 mb-2 text-base font-semibold first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-3 leading-7 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium underline underline-offset-4 decoration-border hover:decoration-foreground"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-border pl-4 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-border px-3 py-2 last:border-0">{children}</td>,
  code: ({ className, children, ...props }) => {
    const text = String(children ?? "").replace(/\n$/, "");
    const match = /language-(\w+)/.exec(className ?? "");
    const isBlock = text.includes("\n") || Boolean(match);
    if (!isBlock) {
      return (
        <code
          className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
          {...props}
        >
          {children}
        </code>
      );
    }
    return <CodeBlock code={text} language={match?.[1] ?? "text"} />;
  },
  pre: ({ children }) => <>{children}</>,
};

export function MarkdownRenderer({ content, className }: { content: string; className?: string | undefined }) {
  return (
    <div className={cn("text-[15px] text-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
