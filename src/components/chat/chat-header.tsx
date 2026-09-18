import { ChevronDown, MoreHorizontal, PanelLeft, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ShareDialog } from "@/components/share-dialog";
import { MODELS } from "@/data/mock";
import { useChatStore } from "@/lib/chat-store";
import type { AIModelId } from "@/types/chat";
import { useState } from "react";
import { toast } from "sonner";

export function ChatHeader() {
  const { activeConversation, setModel, setMobileSidebarOpen, togglePin, deleteConversation } =
    useChatStore();
  const [shareOpen, setShareOpen] = useState(false);
  const model = activeConversation?.model ?? "gpt-5.6";
  const modelName = MODELS.find((m) => m.id === model)?.name ?? "GPT-5.6";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open sidebar"
        className="md:hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <PanelLeft className="size-4" aria-hidden />
      </Button>

      <h1 className="min-w-0 flex-1 truncate text-sm font-medium">
        {activeConversation?.title ?? "New chat"}
      </h1>

      <Select
        value={model}
        onValueChange={(v) => activeConversation && setModel(activeConversation.id, v as AIModelId)}
      >
        <SelectTrigger
          aria-label="Select model"
          className="h-8 w-auto gap-1.5 border-border bg-background px-2.5 text-xs"
        >
          <span className="truncate">{modelName}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
        </SelectTrigger>
        <SelectContent align="end">
          {MODELS.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <span className="flex flex-col">
                <span className="text-sm">{m.name}</span>
                <span className="text-xs text-muted-foreground">{m.description}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden gap-1.5 sm:inline-flex"
        onClick={() => setShareOpen(true)}
      >
        <Share2 className="size-4" aria-hidden /> Share
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Conversation options">
            <MoreHorizontal className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="sm:hidden" onSelect={() => setShareOpen(true)}>
            <Share2 className="size-4" aria-hidden /> Share
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => activeConversation && togglePin(activeConversation.id)}
          >
            {activeConversation?.pinned ? "Unpin conversation" : "Pin conversation"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              if (!activeConversation) return;
              deleteConversation(activeConversation.id);
              toast.success("Conversation deleted");
            }}
          >
            <Trash2 className="size-4" aria-hidden /> Delete conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
    </header>
  );
}
