import { Brain, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ReasoningProps {
  steps: string[];
  active?: boolean | undefined;
}

export function Reasoning({ steps, active = false }: ReasoningProps) {
  if (steps.length === 0) return null;

  return (
    <Collapsible defaultOpen={false} className="mb-3 rounded-xl border border-border bg-muted/30">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRight
          className="size-4 transition-transform group-data-[state=open]:rotate-90"
          aria-hidden
        />
        <Brain className="size-3.5" aria-hidden />
        <span className="font-medium">Reasoning</span>
        {active && <span className="text-xs">thinking…</span>}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="space-y-1.5 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {steps.map((step) => (
            <li key={step} className="leading-6">
              {step}
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}
