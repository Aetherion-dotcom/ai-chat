import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FolderKanban,
  Files,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

function groupOf(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return "Previous 7 Days";
  return "Older";
}

const ORDER = ["Today", "Yesterday", "Previous 7 Days", "Older"];

export function ChatSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const {
    conversations,
    activeId,
    selectConversation,
    newConversation,
    renameConversation,
    togglePin,
    deleteConversation,
    toggleSidebar,
  } = useChatStore();
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = useMemo(
    () => conversations.filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase())),
    [conversations, query],
  );

  const pinned = filtered.filter((c) => c.pinned);
  const groups = useMemo(() => {
    const map = new Map<string, Conversation[]>();
    filtered
      .filter((c) => !c.pinned)
      .forEach((c) => {
        const key = groupOf(c.updatedAt);
        map.set(key, [...(map.get(key) ?? []), c]);
      });
    return ORDER.filter((k) => map.has(k)).map((k) => [k, map.get(k)!] as const);
  }, [filtered]);

  const item = (conversation: Conversation) => {
    const isActive = conversation.id === activeId;
    const isRenaming = renaming === conversation.id;

    return (
      <li key={conversation.id} className="group/item relative">
        {isRenaming ? (
          <form
            className="px-1 py-0.5"
            onSubmit={(e) => {
              e.preventDefault();
              renameConversation(conversation.id, renameValue.trim() || conversation.title);
              setRenaming(null);
            }}
          >
            <Input
              autoFocus
              value={renameValue}
              aria-label="Conversation title"
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => setRenaming(null)}
              className="h-8 text-sm"
            />
          </form>
        ) : (
          <div
            className={cn(
              "flex items-center rounded-lg pr-1 transition-colors hover:bg-accent",
              isActive && "bg-accent",
            )}
          >
            <button
              type="button"
              onClick={() => {
                selectConversation(conversation.id);
                onNavigate?.();
              }}
              className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="block truncate text-sm">{conversation.title}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${conversation.title}`}
                  className="size-7 shrink-0 text-muted-foreground opacity-0 focus-visible:opacity-100 group-hover/item:opacity-100 data-[state=open]:opacity-100"
                >
                  <MoreHorizontal className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    setRenameValue(conversation.title);
                    setRenaming(conversation.id);
                  }}
                >
                  <Pencil className="size-4" aria-hidden /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => togglePin(conversation.id)}>
                  {conversation.pinned ? (
                    <>
                      <PinOff className="size-4" aria-hidden /> Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="size-4" aria-hidden /> Pin
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setPendingDelete(conversation)}
                >
                  <Trash2 className="size-4" aria-hidden /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-3 py-3">
        <img src={logo} alt="" width={512} height={512} className="size-6 dark:invert" />
        <span className="text-sm font-semibold tracking-tight">AI Chat</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Collapse sidebar"
              onClick={toggleSidebar}
              className="ml-auto hidden size-8 text-muted-foreground md:inline-flex"
            >
              <PanelLeftClose className="size-4" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Collapse sidebar</TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-2 px-3 pb-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            newConversation();
            onNavigate?.();
          }}
        >
          <Plus className="size-4" aria-hidden /> New chat
        </Button>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search conversations"
            className="h-9 pl-8 pr-12"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3">
        {filtered.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            No conversations match “{query}”.
          </p>
        ) : (
          <nav aria-label="Conversation history" className="space-y-4 pb-4">
            {pinned.length > 0 && (
              <section>
                <h2 className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Pinned
                </h2>
                <ul className="space-y-0.5">{pinned.map(item)}</ul>
              </section>
            )}
            {groups.map(([label, list]) => (
              <section key={label}>
                <h2 className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </h2>
                <ul className="space-y-0.5">{list.map(item)}</ul>
              </section>
            ))}
          </nav>
        )}
      </ScrollArea>

      <div className="border-t border-sidebar-border p-2">
        <nav className="grid gap-0.5" aria-label="Workspace">
          <Link
            to="/projects"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            activeProps={{ className: "bg-accent" }}
          >
            <FolderKanban className="size-4 text-muted-foreground" aria-hidden /> Projects
          </Link>
          <Link
            to="/files"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            activeProps={{ className: "bg-accent" }}
          >
            <Files className="size-4 text-muted-foreground" aria-hidden /> Files
          </Link>
          <Link
            to="/settings"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
            activeProps={{ className: "bg-accent" }}
          >
            <Settings className="size-4 text-muted-foreground" aria-hidden /> Settings
          </Link>
        </nav>
      </div>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be removed from your history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteConversation(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
