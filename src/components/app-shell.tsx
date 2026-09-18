import type { ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { AssistantPanel } from "@/components/assistant-panel";
import { CommandMenu } from "@/components/command-menu";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } =
    useChatStore();

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <aside
        aria-label="Sidebar"
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:block",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-[280px]",
        )}
      >
        <ChatSidebar />
      </aside>

      {sidebarCollapsed && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Expand sidebar"
          onClick={toggleSidebar}
          className="absolute left-2 top-2 z-30 hidden md:inline-flex"
        >
          <PanelLeft className="size-4" aria-hidden />
        </Button>
      )}

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetTitle className="sr-only">Conversations</SheetTitle>
          <ChatSidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className={cn("flex min-w-0 flex-1 flex-col", sidebarCollapsed && "md:pl-10")}>
        {children}
      </main>

      <CommandMenu />
      <AssistantPanel />
    </div>
  );
}
