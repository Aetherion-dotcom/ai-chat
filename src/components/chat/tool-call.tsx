import { AlertCircle, Ban, Check, ChevronRight, Loader2, Search, Wrench } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ToolCall as ToolCallType, ToolCallStatus } from "@/types/chat";

const STATUS_LABEL: Record<ToolCallStatus, string> = {
  running: "Running",
  completed: "Completed",
  error: "Error",
  rejected: "Rejected",
};

function StatusIcon({ status }: { status: ToolCallStatus }) {
  if (status === "running") return <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />;
  if (status === "completed") return <Check className="size-3.5 text-chart-2" aria-hidden />;
  if (status === "error") return <AlertCircle className="size-3.5 text-destructive" aria-hidden />;
  return <Ban className="size-3.5 text-muted-foreground" aria-hidden />;
}

export function ToolCall({ tool }: { tool: ToolCallType }) {
  const Icon = tool.name === "search" ? Search : Wrench;

  return (
    <Collapsible
      defaultOpen={false}
      className={cn(
        "mb-2 rounded-xl border bg-muted/20",
        tool.status === "error" ? "border-destructive/40" : "border-border",
      )}
    >
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRight
          className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
          aria-hidden
        />
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <span className="font-medium">{tool.label}</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <StatusIcon status={tool.status} />
          {STATUS_LABEL[tool.status]}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 border-t border-border px-4 py-3 text-xs">
          {tool.input && (
            <div>
              <p className="mb-1 font-medium text-muted-foreground">Parameters</p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-background p-2 font-mono">
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}
          {tool.output && (
            <div>
              <p className="mb-1 font-medium text-muted-foreground">Result</p>
              <p className="text-foreground">{tool.output}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
