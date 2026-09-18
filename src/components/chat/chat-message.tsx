import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { AttachmentPreview } from "./attachment-preview";
import { CitationList } from "./citations";
import { MarkdownRenderer } from "./markdown-renderer";
import { MessageActions } from "./message-actions";
import { Reasoning } from "./reasoning";
import { ToolCall } from "./tool-call";
import { formatTime } from "@/data/mock";
import { cn } from "@/lib/utils";
import type { ChatSettings, Message } from "@/types/chat";

export function UserMessage({ message, compact }: { message: Message; compact?: boolean }) {
  return (
    <article className={cn("flex justify-end gap-3", compact ? "py-2" : "py-4")} aria-label="Your message">
      <div className="flex max-w-[85%] flex-col items-end gap-2">
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.attachments.map((a) => (
              <AttachmentPreview key={a.id} attachment={a} />
            ))}
          </div>
        )}
        {message.content && (
          <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-7 text-primary-foreground">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
        <time className="text-[11px] text-muted-foreground" dateTime={message.createdAt}>
          {formatTime(message.createdAt)}
        </time>
      </div>
      <span
        aria-hidden
        className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[11px] font-medium"
      >
        You
      </span>
    </article>
  );
}

interface AssistantMessageProps {
  message: Message;
  settings: ChatSettings;
  onRegenerate?: (() => void) | undefined;
  onFeedback?: ((value: "up" | "down") => void) | undefined;
}

export function AssistantMessage({
  message,
  settings,
  onRegenerate,
  onFeedback,
}: AssistantMessageProps) {
  return (
    <article className={cn("flex gap-3", settings.compactMode ? "py-2" : "py-4")} aria-label="Assistant message">
      <img
        src={logo}
        alt=""
        width={512}
        height={512}
        loading="lazy"
        className="mt-1 size-7 shrink-0 rounded-full border border-border bg-background p-1 dark:invert"
      />
      <div className="min-w-0 flex-1">
        {message.thinking && (
          <p className="flex items-center gap-2 py-1 text-sm text-muted-foreground" aria-live="polite">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            AI is thinking...
          </p>
        )}

        {settings.showReasoning && message.reasoning && message.reasoning.length > 0 && (
          <Reasoning steps={message.reasoning} active={message.streaming} />
        )}

        {message.toolCalls?.map((tool) => <ToolCall key={tool.id} tool={tool} />)}

        {message.content && (
          <MarkdownRenderer
            content={message.content + (message.streaming ? " ▍" : "")}
            className={settings.compactMode ? "text-sm" : undefined}
          />
        )}

        {settings.showCitations && message.citations && (
          <CitationList citations={message.citations} />
        )}

        {message.stopped && (
          <p className="mt-2 text-xs text-muted-foreground">Generation stopped.</p>
        )}

        {!message.streaming && !message.thinking && message.content && (
          <MessageActions
            content={message.content}
            feedback={message.feedback}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
          />
        )}
      </div>
    </article>
  );
}

interface ChatMessageProps {
  message: Message;
  settings: ChatSettings;
  onRegenerate?: (() => void) | undefined;
  onFeedback?: ((value: "up" | "down") => void) | undefined;
}

export function ChatMessage({ message, settings, onRegenerate, onFeedback }: ChatMessageProps) {
  if (message.role === "user") {
    return <UserMessage message={message} compact={settings.compactMode} />;
  }
  return (
    <AssistantMessage
      message={message}
      settings={settings}
      onRegenerate={onRegenerate}
      onFeedback={onFeedback}
    />
  );
}
