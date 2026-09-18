import { ChevronRight, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Citation } from "@/types/chat";

export function CitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <Collapsible className="mt-4 rounded-xl border border-border bg-muted/30">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRight
          className="size-4 transition-transform group-data-[state=open]:rotate-90"
          aria-hidden
        />
        Sources
        <span className="text-xs font-normal text-muted-foreground">({citations.length})</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="space-y-1 border-t border-border px-3 py-2">
          {citations.map((c) => (
            <li key={c.id}>
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[11px] text-muted-foreground">
                  {c.index}
                </span>
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{c.domain}</span>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
