import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KEYWORDS =
  /\b(const|let|var|function|return|if|else|for|while|import|from|export|default|interface|type|new|await|async|class|extends|select|from|where|group|order|by|desc|asc|sum|as|now|interval|true|false|null|undefined)\b/g;

/** Very small token colorizer — enough to read like a real editor without a heavy dependency. */
function highlight(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(
    `(\`[^\`]*\`|"[^"]*"|'[^']*')|(//[^\\n]*|--[^\\n]*)|(\\b\\d+(?:\\.\\d+)?\\b)|${KEYWORDS.source}`,
    "g",
  );
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(code)) !== null) {
    if (match.index > last) nodes.push(code.slice(last, match.index));
    const [text, str, comment, num] = match;
    const className = str
      ? "text-chart-2"
      : comment
        ? "text-muted-foreground italic"
        : num
          ? "text-chart-5"
          : "text-chart-4";
    nodes.push(
      <span key={`t-${key++}`} className={className}>
        {text}
      </span>,
    );
    last = match.index + text.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

interface CodeBlockProps {
  code: string;
  language?: string | undefined;
  className?: string | undefined;
}

export function CodeBlock({ code, language = "text", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <figure
      className={cn(
        "group/code my-4 overflow-hidden rounded-xl border border-border bg-muted/40",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {language}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={copy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy code"}
        </Button>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">{highlight(code)}</code>
      </pre>
    </figure>
  );
}
