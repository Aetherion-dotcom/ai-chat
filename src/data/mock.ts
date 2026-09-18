import type {
  AIModel,
  Conversation,
  FileItem,
  Message,
  Project,
} from "@/types/chat";

export const MODELS: AIModel[] = [
  { id: "gpt-5.6", name: "GPT-5.6", vendor: "OpenAI", description: "Best for complex reasoning" },
  { id: "claude-sonnet", name: "Claude Sonnet", vendor: "Anthropic", description: "Balanced speed and depth" },
  { id: "gemini", name: "Gemini", vendor: "Google", description: "Great with long context" },
  { id: "llama", name: "Llama", vendor: "Meta", description: "Open weights, fast" },
  { id: "mistral", name: "Mistral", vendor: "Mistral AI", description: "Lightweight and quick" },
];

// Anchored to the top of the current UTC hour so server and client render
// identical timestamps (no hydration mismatch) while staying "recent".
const now = Math.floor(Date.now() / 3600_000) * 3600_000;
const hours = (h: number) => new Date(now - h * 3600_000).toISOString();
const days = (d: number) => new Date(now - d * 86_400_000).toISOString();

export const SUGGESTIONS = [
  { title: "Explain quantum computing", subtitle: "In plain language, with examples" },
  { title: "Analyze this dataset", subtitle: "Find trends and outliers" },
  { title: "Help me build a React app", subtitle: "Structure, routing and state" },
  { title: "Write a SQL query", subtitle: "Joins, aggregates and windows" },
];

const CODE_ANSWER = `Here's a compact approach, plus the reasoning behind each choice.

## Overview

A small **streaming renderer** keeps the UI responsive while tokens arrive. The key ideas:

1. Append tokens to a buffer
2. Flush on an animation frame
3. Render markdown from the buffer

> Batching per frame avoids layout thrash on long responses.

### Example

\`\`\`tsx
function useStream(text: string, speed = 18) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += speed;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [text, speed]);
  return shown;
}
\`\`\`

Use \`requestAnimationFrame\` if you need frame-accurate pacing.

### Trade-offs

| Approach | Smoothness | Complexity |
| --- | --- | --- |
| Interval | Good | Low |
| rAF | Excellent | Medium |
| Web worker | Excellent | High |

Read more in the [React docs](https://react.dev).`;

const SQL_ANSWER = `Sure — here is a query that returns the top customers per region.

\`\`\`sql
select
  region,
  customer_id,
  sum(amount) as revenue
from orders
where created_at >= now() - interval '90 days'
group by region, customer_id
order by region, revenue desc;
\`\`\`

To keep only the top three per region, wrap it with \`row_number()\`.`;

export const MOCK_REASONING = [
  "Analyzing the user's request and the constraints mentioned.",
  "Comparing possible approaches and their trade-offs.",
  "Drafting a concise answer with a runnable example.",
];

export const MOCK_CITATIONS = [
  { id: "c1", index: 1, title: "Next.js Documentation", domain: "nextjs.org", url: "https://nextjs.org/docs" },
  { id: "c2", index: 2, title: "React Documentation", domain: "react.dev", url: "https://react.dev" },
  { id: "c3", index: 3, title: "Vercel AI SDK", domain: "ai-sdk.dev", url: "https://ai-sdk.dev" },
];

export const MOCK_RESPONSES = [CODE_ANSWER, SQL_ANSWER];

const msg = (m: Partial<Message> & Pick<Message, "id" | "role" | "content">): Message => ({
  createdAt: hours(3),
  ...m,
});

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Streaming UI patterns in React",
    updatedAt: hours(1),
    pinned: true,
    model: "gpt-5.6",
    visibility: "private",
    projectId: "proj-web",
    messages: [
      msg({
        id: "m1",
        role: "user",
        content: "How should I render a streaming AI response without the UI stuttering?",
        attachments: [
          { id: "a1", name: "profiler-trace.pdf", size: 2_411_000, kind: "file", mime: "application/pdf" },
        ],
      }),
      msg({
        id: "m2",
        role: "assistant",
        content: CODE_ANSWER,
        reasoning: MOCK_REASONING,
        citations: MOCK_CITATIONS,
        toolCalls: [
          {
            id: "t1",
            name: "search",
            label: "Search",
            status: "completed",
            input: { query: "react streaming render performance" },
            output: "3 relevant results found.",
          },
          {
            id: "t2",
            name: "read_file",
            label: "Read file",
            status: "error",
            input: { path: "profiler-trace.pdf" },
            output: "Could not parse page 14 of the trace.",
          },
        ],
      }),
    ],
  },
  {
    id: "conv-2",
    title: "Quarterly revenue SQL",
    updatedAt: hours(6),
    model: "claude-sonnet",
    visibility: "team",
    projectId: "proj-data",
    messages: [
      msg({ id: "m3", role: "user", content: "Write a SQL query for top customers per region." }),
      msg({ id: "m4", role: "assistant", content: SQL_ANSWER, reasoning: MOCK_REASONING }),
    ],
  },
  {
    id: "conv-3",
    title: "Positioning for a dev-tools startup",
    updatedAt: days(1),
    model: "gemini",
    visibility: "private",
    projectId: "proj-startup",
    messages: [],
  },
  {
    id: "conv-4",
    title: "Vector database comparison",
    updatedAt: days(3),
    model: "gpt-5.6",
    visibility: "private",
    projectId: "proj-research",
    messages: [],
  },
  {
    id: "conv-5",
    title: "Onboarding email sequence",
    updatedAt: days(5),
    model: "mistral",
    visibility: "public",
    messages: [],
  },
  {
    id: "conv-6",
    title: "Migrating a monorepo to Turbo",
    updatedAt: days(21),
    model: "llama",
    visibility: "private",
    projectId: "proj-web",
    messages: [],
  },
  {
    id: "conv-7",
    title: "Designing an evaluation harness",
    updatedAt: days(40),
    model: "claude-sonnet",
    visibility: "private",
    projectId: "proj-research",
    messages: [],
  },
];

export const PROJECTS: Project[] = [
  {
    id: "proj-research",
    name: "AI Research",
    description: "Model evaluations, papers and benchmark notes.",
    conversationCount: 2,
    fileCount: 3,
    updatedAt: days(3),
  },
  {
    id: "proj-web",
    name: "Web Development",
    description: "Frontend architecture, design systems and performance.",
    conversationCount: 2,
    fileCount: 2,
    updatedAt: hours(1),
  },
  {
    id: "proj-startup",
    name: "Startup Ideas",
    description: "Positioning, pricing experiments and market notes.",
    conversationCount: 1,
    fileCount: 1,
    updatedAt: days(1),
  },
  {
    id: "proj-data",
    name: "Data Analysis",
    description: "Warehouse queries, dashboards and reporting.",
    conversationCount: 1,
    fileCount: 2,
    updatedAt: hours(6),
  },
];

export const FILES: FileItem[] = [
  { id: "f1", name: "profiler-trace.pdf", type: "PDF", size: 2_411_000, uploadedAt: hours(2), conversation: "Streaming UI patterns in React", projectId: "proj-web" },
  { id: "f2", name: "revenue-q3.csv", type: "CSV", size: 812_000, uploadedAt: hours(7), conversation: "Quarterly revenue SQL", projectId: "proj-data" },
  { id: "f3", name: "benchmark-results.json", type: "JSON", size: 148_000, uploadedAt: days(3), conversation: "Vector database comparison", projectId: "proj-research" },
  { id: "f4", name: "landing-hero.png", type: "Image", size: 1_940_000, uploadedAt: days(4), conversation: "Positioning for a dev-tools startup", projectId: "proj-startup" },
  { id: "f5", name: "eval-harness-spec.md", type: "Markdown", size: 24_000, uploadedAt: days(6), conversation: "Designing an evaluation harness", projectId: "proj-research" },
  { id: "f6", name: "design-tokens.ts", type: "Code", size: 11_400, uploadedAt: days(9), conversation: "Migrating a monorepo to Turbo", projectId: "proj-web" },
  { id: "f7", name: "cohort-analysis.xlsx", type: "Spreadsheet", size: 3_200_000, uploadedAt: days(12), conversation: "Quarterly revenue SQL", projectId: "proj-data" },
  { id: "f8", name: "interview-notes.txt", type: "Text", size: 9_800, uploadedAt: days(18), conversation: "Positioning for a dev-tools startup", projectId: "proj-research" },
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}
