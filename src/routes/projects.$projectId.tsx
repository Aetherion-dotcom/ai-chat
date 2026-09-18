import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, MessageSquare, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { FILES, PROJECTS, formatBytes, formatDate } from "@/data/mock";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — AI Chat" },
      {
        name: "description",
        content: "Browse the conversations and reference files that belong to this AI Chat project.",
      },
      { property: "og:title", content: "Project — AI Chat" },
      {
        property: "og:description",
        content: "Browse the conversations and reference files that belong to this AI Chat project.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = useParams({ from: "/projects/$projectId" });
  const project = PROJECTS.find((p) => p.id === projectId);
  const { conversations, selectConversation, newConversation } = useChatStore();
  const navigate = useNavigate();

  const projectChats = conversations.filter((c) => c.projectId === projectId);
  const projectFiles = FILES.filter((f) => f.projectId === projectId);

  return (
    <>
      <PageHeader
        title={project?.name ?? "Project"}
        actions={
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              newConversation(projectId);
              void navigate({ to: "/" });
            }}
          >
            <Plus className="size-4" aria-hidden /> New chat
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> All projects
          </Link>

          {project && (
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            </div>
          )}

          <section aria-labelledby="project-chats">
            <h3 id="project-chats" className="text-sm font-semibold">
              Conversations
            </h3>
            {projectChats.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No conversations in this project yet.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {projectChats.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        selectConversation(c.id);
                        void navigate({ to: "/" });
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <MessageSquare className="size-4 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-sm">{c.title}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(c.updatedAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="project-files">
            <h3 id="project-files" className="text-sm font-semibold">
              Reference files
            </h3>
            {projectFiles.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No files attached to this project.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {projectFiles.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                    <FileText className="size-4 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
