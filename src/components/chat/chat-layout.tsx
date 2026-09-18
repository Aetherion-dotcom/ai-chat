import { useEffect, useRef } from "react";
import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { EmptyState } from "./empty-state";
import { MessageComposer } from "./message-composer";
import { useChatStore } from "@/lib/chat-store";
import type { AIModelId } from "@/types/chat";

export function ChatLayout() {
  const {
    activeConversation,
    settings,
    sendMessage,
    stopGenerating,
    regenerate,
    setFeedback,
    isGenerating,
    setModel,
  } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversation?.messages]);

  const messages = activeConversation?.messages ?? [];

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <ChatHeader />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onPick={(prompt) => sendMessage(prompt)} />
        ) : (
          <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 sm:px-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                settings={settings}
                onRegenerate={message.role === "assistant" ? () => regenerate(message.id) : undefined}
                onFeedback={
                  message.role === "assistant" ? (value) => setFeedback(message.id, value) : undefined
                }
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <MessageComposer
            onSend={(text, attachments) => sendMessage(text, attachments)}
            onStop={stopGenerating}
            isGenerating={isGenerating}
            enterToSend={settings.enterToSend}
            model={activeConversation?.model}
            onModelChange={(model: AIModelId) => {
              if (activeConversation) setModel(activeConversation.id, model);
            }}
          />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Responses are simulated for this prototype. Enter to send, Shift + Enter for a new line.
          </p>
        </div>
      </div>
    </div>
  );
}
