import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { ArrowUp, Mic, Paperclip, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AttachmentPreview } from "./attachment-preview";
import { MODELS } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { AIModelId, Attachment } from "@/types/chat";

let attachmentId = 0;

interface MessageComposerProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop?: (() => void) | undefined;
  isGenerating?: boolean | undefined;
  model?: AIModelId | undefined;
  onModelChange?: ((model: AIModelId) => void) | undefined;
  enterToSend?: boolean | undefined;
  placeholder?: string | undefined;
  compact?: boolean | undefined;
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

export function MessageComposer({
  onSend,
  onStop,
  isGenerating = false,
  model,
  onModelChange,
  enterToSend = true,
  placeholder = "Ask anything...",
  compact = false,
  value,
  onValueChange,
}: MessageComposerProps) {
  const [internal, setInternal] = useState("");
  const text = value ?? internal;
  const setText = onValueChange ?? setInternal;
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const [listening, setListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  useEffect(() => {
    if (!isGenerating) textareaRef.current?.focus();
  }, [isGenerating]);

  const addFiles = (files: FileList | File[]) => {
    const next: Attachment[] = Array.from(files).map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `att-${(attachmentId += 1)}`,
        name: file.name || (isImage ? "pasted-image.png" : "file"),
        size: file.size,
        kind: isImage ? "image" : "file",
        mime: file.type,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
    });
    setAttachments((prev) => [...prev, ...next]);
  };

  const submit = () => {
    if (isGenerating) return;
    if (!text.trim() && attachments.length === 0) return;
    onSend(text, attachments);
    setText("");
    setAttachments([]);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm transition-colors focus-within:border-foreground/25",
        dragging && "border-foreground/40 bg-accent/40",
      )}
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-border p-3">
          {attachments.map((a) => (
            <AttachmentPreview
              key={a.id}
              attachment={a}
              onRemove={(id) => setAttachments((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}

      {listening ? (
        <div className="flex items-center gap-3 px-4 py-5">
          <span className="text-sm font-medium">Listening...</span>
          <span className="flex items-end gap-[3px]" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="waveform-bar w-[3px] rounded-full bg-foreground/70"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="ml-auto"
            onClick={() => setListening(false)}
          >
            Stop
          </Button>
        </div>
      ) : (
        <label className="block px-4 pt-3">
          <span className="sr-only">Message</span>
          <textarea
            ref={textareaRef}
            value={text}
            rows={1}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && enterToSend) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            aria-label="Message"
            className="max-h-[220px] w-full resize-none bg-transparent text-[15px] leading-7 outline-none placeholder:text-muted-foreground"
          />
        </label>
      )}

      <div className="flex items-center gap-1 px-2 pb-2 pt-1">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Attach files"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => fileRef.current?.click()}
            >
              {compact ? <Paperclip className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach files</TooltipContent>
        </Tooltip>

        {model && onModelChange && !compact && (
          <Select value={model} onValueChange={(v) => onModelChange(v as AIModelId)}>
            <SelectTrigger
              aria-label="Select model"
              className="h-8 w-auto gap-1 border-0 bg-transparent px-2 text-xs text-muted-foreground shadow-none hover:text-foreground focus:ring-0"
            >
              <span className="truncate">
                {MODELS.find((m) => m.id === model)?.name ?? "Model"}
              </span>
            </SelectTrigger>
            <SelectContent align="start">
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-sm">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Use voice input"
              aria-pressed={listening}
              className="ml-auto size-8 text-muted-foreground hover:text-foreground"
              onClick={() => setListening((v) => !v)}
            >
              <Mic className="size-4" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Voice input</TooltipContent>
        </Tooltip>

        {isGenerating ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Stop generating"
            className="size-8"
            onClick={onStop}
          >
            <Square className="size-3.5 fill-current" aria-hidden />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            aria-label="Send message"
            className="size-8 rounded-full"
            disabled={!text.trim() && attachments.length === 0}
            onClick={submit}
          >
            <ArrowUp className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
