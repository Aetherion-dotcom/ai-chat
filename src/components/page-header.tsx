import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/chat-store";
import type { ReactNode } from "react";

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  const { setMobileSidebarOpen } = useChatStore();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-6">
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
      <h1 className="truncate text-sm font-medium">{title}</h1>
      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </header>
  );
}
