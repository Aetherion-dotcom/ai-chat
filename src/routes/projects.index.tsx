import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, MessageSquare, Paperclip, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PROJECTS, formatDate } from "@/data/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — AI Chat" },
      {
        name: "description",
        content: "Group related conversations and reference files into focused AI Chat projects.",
      },
      { property: "og:title", content: "Projects — AI Chat" },
      {
        property: "og:description",
        content: "Group related conversations and reference files into focused AI Chat projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = PROJECTS;

  return (
    <>
      <PageHeader
        title="Projects"
        actions={
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.success("Project created")}
          >
            <Plus className="size-4" aria-hidden /> New project
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <FolderKanban className="mx-auto size-6 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm font-medium">No projects yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a project to group chats and files.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-sm font-semibold">{p.name}</span>
                    <span className="mt-1 flex-1 text-sm text-muted-foreground">{p.description}</span>
                    <span className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3.5" aria-hidden /> {p.conversationCount} chats
                      </span>
                      <span className="flex items-center gap-1">
                        <Paperclip className="size-3.5" aria-hidden /> {p.fileCount} files
                      </span>
                      <span className="ml-auto">{formatDate(p.updatedAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
