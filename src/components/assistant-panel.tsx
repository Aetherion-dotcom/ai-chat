import { useState } from "react";
import { MessageSquare, Minimize2, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "@/components/chat/message-composer";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

interface PanelMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const REPLY = `Here's a quick summary:

- The panel keeps context from the page you're on
- Ask follow-ups without leaving your work
- Press **⌘J** to toggle it any time`;

let panelId = 0;

export function AssistantPanel() {
  const { panelOpen, setPanelOpen } = useChatStore();
  const [wide, setWide] = useState(false);
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [busy, setBusy] = useState(false);

  const send = (text: string) => {
    const user: PanelMessage = { id: `p-${(panelId += 1)}`, role: "user", content: text };
    const reply: PanelMessage = { id: `p-${(panelId += 1)}`, role: "assistant", content: "" };
    setMessages((prev) => [...prev, user, reply]);
    setBusy(true);
    let i = 0;
    const timer = setInterval(() => {
      i += 8;
      setMessages((prev) =>
        prev.map((m) => (m.id === reply.id ? { ...m, content: REPLY.slice(0, i) } : m)),
      );
      if (i >= REPLY.length) {
        clearInterval(timer);
        setBusy(false);
      }
    }, 28);
  };

  if (!panelOpen) {
    return (
      <Button
        type="button"
        onClick={() => setPanelOpen(true)}
        aria-label="Open assistant panel"
        className="fixed bottom-5 right-5 z-40 size-11 rounded-full shadow-lg"
      >
        <MessageSquare className="size-5" aria-hidden />
      </Button>
    );
  }

  return (
    <aside
      aria-label="Embedded assistant"
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex flex-col border-l border-border bg-background shadow-xl",
        "animate-in slide-in-from-right duration-200",
        wide ? "w-full sm:w-[520px]" : "w-full sm:w-[380px]",
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <img src={logo} alt="" width={512} height={512} className="size-5 dark:invert" />
        <span className="text-sm font-medium">Assistant</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={wide ? "Narrow panel" : "Widen panel"}
          className="ml-auto size-8 text-muted-foreground"
          onClick={() => setWide((v) => !v)}
        >
          <Minimize2 className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close assistant panel"
          className="size-8 text-muted-foreground"
          onClick={() => setPanelOpen(false)}
        >
          <X className="size-4" aria-hidden />
        </Button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Ask the assistant about anything on this page.
          </p>
        ) : (
          messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {m.content}
                </p>
              </div>
            ) : (
              <MarkdownRenderer key={m.id} content={m.content || "…"} className="text-sm" />
            ),
          )
        )}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <MessageComposer
          onSend={(text) => send(text)}
          isGenerating={busy}
          compact
          placeholder="Ask the assistant..."
        />
      </div>
    </aside>
  );
}
