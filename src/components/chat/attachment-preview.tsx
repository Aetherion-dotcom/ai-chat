import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/types/chat";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove?: ((id: string) => void) | undefined;
  className?: string | undefined;
}

export function AttachmentPreview({ attachment, onRemove, className }: AttachmentPreviewProps) {
  const isImage = attachment.kind === "image" && attachment.previewUrl;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2",
        className,
      )}
    >
      {isImage ? (
        <img
          src={attachment.previewUrl}
          alt={attachment.name}
          className="size-10 rounded-lg border border-border object-cover"
        />
      ) : (
        <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
          <FileText className="size-4 text-muted-foreground" aria-hidden />
        </span>
      )}
      <span className="min-w-0">
        <span className="block max-w-[160px] truncate text-sm font-medium">{attachment.name}</span>
        <span className="block text-xs text-muted-foreground">{formatBytes(attachment.size)}</span>
      </span>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove ${attachment.name}`}
          onClick={() => onRemove(attachment.id)}
          className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
