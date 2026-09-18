import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Files, FolderKanban, MessageSquarePlus, Moon, Search, Settings } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useChatStore } from "@/lib/chat-store";

export function CommandMenu() {
  const {
    commandOpen,
    setCommandOpen,
    newConversation,
    conversations,
    selectConversation,
    settings,
    setSettings,
    setPanelOpen,
  } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
      if (e.key.toLowerCase() === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPanelOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen, setPanelOpen]);

  const run = (fn: () => void) => {
    setCommandOpen(false);
    fn();
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search conversations..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              run(() => {
                newConversation();
                void navigate({ to: "/" });
              })
            }
          >
            <MessageSquarePlus className="size-4" aria-hidden /> New chat
          </CommandItem>
          <CommandItem onSelect={() => run(() => void navigate({ to: "/projects" }))}>
            <FolderKanban className="size-4" aria-hidden /> Open projects
          </CommandItem>
          <CommandItem onSelect={() => run(() => void navigate({ to: "/files" }))}>
            <Files className="size-4" aria-hidden /> Open files
          </CommandItem>
          <CommandItem onSelect={() => run(() => void navigate({ to: "/settings" }))}>
            <Settings className="size-4" aria-hidden /> Settings
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => setSettings({ theme: settings.theme === "dark" ? "light" : "dark" }))
            }
          >
            <Moon className="size-4" aria-hidden /> Toggle theme
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Conversations">
          {conversations.slice(0, 8).map((c) => (
            <CommandItem
              key={c.id}
              value={c.title}
              onSelect={() =>
                run(() => {
                  selectConversation(c.id);
                  void navigate({ to: "/" });
                })
              }
            >
              <Search className="size-4" aria-hidden /> {c.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
