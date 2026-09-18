import { createFileRoute } from "@tanstack/react-router";
import { ChatLayout } from "@/components/chat/chat-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Chat — A premium AI assistant workspace" },
      {
        name: "description",
        content:
          "Chat with AI models, review reasoning, run tools and keep every conversation organised in one clean workspace.",
      },
      { property: "og:title", content: "AI Chat — A premium AI assistant workspace" },
      {
        property: "og:description",
        content:
          "Chat with AI models, review reasoning, run tools and keep every conversation organised in one clean workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatLayout,
});
