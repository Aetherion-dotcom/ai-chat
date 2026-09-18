import { useState } from "react";
import { Check, Copy, MoreHorizontal, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  content: string;
  feedback?: "up" | "down" | null | undefined;
  onRegenerate?: (() => void) | undefined;
  onFeedback?: ((value: "up" | "down") => void) | undefined;
}

export function MessageActions({ content, feedback, onRegenerate, onFeedback }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const action = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    active = false,
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={onClick}
          className={cn(
            "size-7 text-muted-foreground hover:text-foreground",
            active && "text-foreground",
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="mt-2 flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy message"}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy response</TooltipContent>
      </Tooltip>

      {onRegenerate && action("Regenerate", <RefreshCw className="size-3.5" aria-hidden />, onRegenerate)}
      {onFeedback &&
        action(
          "Good response",
          <ThumbsUp className="size-3.5" aria-hidden />,
          () => onFeedback("up"),
          feedback === "up",
        )}
      {onFeedback &&
        action(
          "Bad response",
          <ThumbsDown className="size-3.5" aria-hidden />,
          () => onFeedback("down"),
          feedback === "down",
        )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="More actions"
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="size-3.5" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => toast.success("Response saved to your library")}>
            Save to library
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.success("Report sent")}>Report issue</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
