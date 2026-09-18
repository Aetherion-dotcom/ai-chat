# frontend.md

Implementation reference for the **AI Chat** frontend: architecture, data
types, state, components, and how every simulated behaviour works.

Everything here runs in the browser. There is no server logic, no persistence
beyond `localStorage`, and no network requests to any AI provider.

---

## 1. Architecture

```
src/routes/__root.tsx
└── QueryClientProvider
    └── ChatProvider            ← all app state (src/lib/chat-store.tsx)
        └── ThemeSync           ← applies light/dark/system to <html>
            └── TooltipProvider
                └── AppShell    ← sidebar + main column + global overlays
                    ├── <Outlet/>        ← the active route
                    ├── CommandMenu      ← ⌘K / Ctrl+K
                    ├── AssistantPanel   ← docked floating assistant
                    └── Toaster          ← sonner
```

`ChatProvider` is mounted exactly once. Any component below the root can call
`useChatStore()`; nothing needs prop drilling.

### Routes

| Path | File | Purpose |
| --- | --- | --- |
| `/` | `routes/index.tsx` | Chat: sidebar + header + conversation + composer |
| `/projects` | `routes/projects.index.tsx` | Project card grid |
| `/projects/$projectId` | `routes/projects.$projectId.tsx` | Project conversations + reference files |
| `/files` | `routes/files.tsx` | Shared file library with search/filter/sort |
| `/settings` | `routes/settings.tsx` | Appearance, chat, notification preferences |

Each route defines its own `head()` with a unique title, description and Open
Graph/Twitter metadata.

---

## 2. Domain types (`src/types/chat.ts`)

```ts
type AIModelId = "gpt-5.6" | "claude-sonnet" | "gemini" | "llama" | "mistral";

interface AIModel      { id; name; vendor; description }
interface Attachment   { id; name; size; kind: "image" | "file"; mime; previewUrl? }
interface Citation     { id; index; title; domain; url }
interface ToolCall     { id; name; label; status: "running" | "completed" | "error" | "rejected"; input?; output? }

interface Message {
  id; role: "user" | "assistant"; content; createdAt;
  attachments?; citations?; toolCalls?; reasoning?;
  streaming?; thinking?; stopped?; feedback?: "up" | "down" | null;
}

interface Conversation { id; title; updatedAt; pinned; messages; model; visibility; projectId? }
interface Project      { id; name; description; conversationCount; fileCount; updatedAt }
interface FileItem     { id; name; type; size; uploadedAt; conversation }
interface ChatSettings { theme; enterToSend; showReasoning; showCitations; compactMode; notifications }
```

TypeScript runs with `exactOptionalPropertyTypes`, so optional properties are
declared `field?: T | undefined`. Keep that convention when extending types.

---

## 3. State (`src/lib/chat-store.tsx`)

`ChatProvider` holds everything in `useState`/`useRef` and exposes it through
`useChatStore()`.

### Slices

- **Conversations** — list, active id, derived active conversation.
- **Composer** — draft text and pending attachments.
- **Generation** — whether a response is streaming, plus an abort ref used by
  *Stop generating*.
- **UI** — sidebar collapsed/open, command menu open, assistant panel open,
  share dialog open.
- **Settings** — read from `localStorage` on mount (inside `useEffect`, to keep
  SSR and hydration identical) and written back on every change.

### Key actions

| Action | Effect |
| --- | --- |
| `newConversation()` | Creates an empty conversation and makes it active |
| `selectConversation(id)` | Switches the active thread |
| `renameConversation(id, title)` | Inline rename from the sidebar menu |
| `togglePin(id)` | Moves the item into/out of the Pinned group |
| `deleteConversation(id)` | Confirmed through an Alert Dialog |
| `setSearch(query)` | Filters the sidebar; drives the "no results" state |
| `setModel(id)` | Updates the active model chip in header and composer |
| `setVisibility(v)` | private / team / public in the Share dialog |
| `addAttachments(files)` | Wraps `File` objects into `Attachment`s with object URLs |
| `removeAttachment(id)` | Drops it from local state |
| `sendMessage(text)` | Kicks off the simulated exchange (below) |
| `stopGenerating()` | Halts the stream and marks the message `stopped` |
| `regenerate(messageId)` | Replays the stream for that assistant turn |
| `setFeedback(id, "up"/"down")` | Thumbs state on assistant messages |
| `updateSettings(partial)` | Merges and persists to `localStorage` |

### Simulated streaming

`sendMessage` runs this sequence entirely on timers:

1. Append the user message (with any attachments) immediately.
2. Append an assistant message with `thinking: true` → the UI shows
   "AI is thinking…" with a pulsing indicator.
3. After a short delay, optionally attach mock `reasoning` steps and
   `toolCalls` that transition `running → completed` (some mock responses use
   `error` or `rejected` to demonstrate those states).
4. Reveal the predefined markdown answer in chunks on an interval, setting
   `streaming: true` and a blinking caret.
5. Attach `citations` when the mock response has sources.
6. Clear `streaming`, bump `conversation.updatedAt`, retitle a new thread from
   the first user message.

Stopping clears the interval and leaves the partial text plus a "Stopped
generating" hint. Regenerating clears the assistant content and repeats the
sequence.

---

## 4. Mock data (`src/data/mock.ts`)

Single source of fixtures:

- five models (GPT-5.6, Claude Sonnet, Gemini, Llama, Mistral)
- conversations spread across Today / Yesterday / Previous 7 Days / Older,
  including one long thread and one pinned thread
- a rich sample answer exercising headings, paragraphs, lists, links,
  blockquotes, tables, inline code and multi-language code blocks
- reasoning step sets, tool calls in all four states, citation sets
- four projects (AI Research, Web Development, Startup Ideas, Data Analysis)
- file library rows of mixed types and sizes
- suggestion prompts for the empty state

Timestamps are generated relative to the current hour so server and client
render the same markup.

---

## 5. Components

### `components/chat/`

| Component | Responsibility |
| --- | --- |
| `chat-layout.tsx` | Composes sidebar, header, scroll area and composer |
| `chat-sidebar.tsx` | Logo, New Chat, collapse, search with `⌘K` hint, grouped history, per-item Rename/Pin/Delete menu |
| `chat-header.tsx` | Mobile menu button, title, model selector, Share, More |
| `empty-state.tsx` | Headline, subtitle and four clickable suggestion cards |
| `chat-message.tsx` | Dispatches to the user/assistant layout, renders avatar, metadata, attachments, reasoning, tool calls, content, citations and actions |
| `markdown-renderer.tsx` | react-markdown + remark-gfm with styled elements |
| `code-block.tsx` | Language label, Copy → Copied button, scrollable mono body |
| `reasoning.tsx` | Collapsible "Reasoning" section with step list |
| `tool-call.tsx` | Status card for running / completed / error / rejected |
| `citations.tsx` | Collapsible "Sources" list with index, title, domain, link icon |
| `attachment-preview.tsx` | Chip or thumbnail with size and remove control |
| `message-actions.tsx` | Copy, Regenerate, Thumbs up/down, More |
| `message-composer.tsx` | Auto-growing textarea, attach, model select, voice, Send/Stop |

### Composer details

- Auto-resizes to content with a max height, then scrolls.
- `Enter` sends, `Shift+Enter` newlines — flipped by the "Enter to send"
  setting.
- Accepts files via the picker, drag-and-drop onto the composer, and image
  paste from the clipboard. Files never leave the browser.
- Swaps the Send button for a Stop button while generating.
- Microphone toggles a simulated "Listening…" state with a CSS waveform.

### Shell-level components

| Component | Responsibility |
| --- | --- |
| `app-shell.tsx` | Desktop sidebar vs mobile Sheet, main column, global overlays |
| `command-menu.tsx` | cmdk palette on ⌘K/Ctrl+K: New Chat, Search Conversations, Open Projects, Open Files, Settings, Toggle Theme — each performs the real state change |
| `share-dialog.tsx` | Private / Team / Public radio group + Copy link with feedback |
| `assistant-panel.tsx` | Right-docked embeddable assistant with its own thread and composer, animated open/close, keyboard shortcut |
| `theme-provider.tsx` | light / dark / system, persisted |
| `page-header.tsx` | Shared title/description header for non-chat routes |

### `components/ui/`

Unmodified shadcn/ui primitives (Button, Input, Textarea, Dialog, Sheet,
Dropdown Menu, Alert Dialog, Tooltip, Scroll Area, Collapsible, Accordion,
Command, Select, Switch, Radio Group, Tabs, Table, Badge, Avatar, Separator,
Skeleton, Sonner). Prefer these over custom controls — accessibility is already
handled.

---

## 6. UI states demonstrated

Empty chat · active conversation · streaming · thinking · tool running ·
tool completed · tool error · tool rejected · attachments · citations · code
response · long conversation · search results · no search results · empty
projects · empty file library · delete confirmation · share dialog · mobile
sidebar · light and dark themes.

---

## 7. Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Command palette |
| `Enter` | Send (configurable) |
| `Shift+Enter` | Newline |
| `Esc` | Close dialog / sheet / palette |
| `Tab` / `Shift+Tab` | Move focus; all interactive elements are reachable |

---

## 8. Conventions

- Semantic Tailwind tokens only — never literal colour utilities.
- One component per file, named export plus typed props interface.
- Types in `src/types/chat.ts`, fixtures in `src/data/mock.ts`.
- Browser-only reads (`window`, `localStorage`) go in `useEffect`.
- `src/routeTree.gen.ts` is generated; never edit it.

## 9. Scripts

```bash
bun install
bun run dev          # dev server on :8080
bun run build        # production build
bun run lint
bunx tsgo --noEmit   # type check
```
