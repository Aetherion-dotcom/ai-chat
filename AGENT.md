# AGENT.md

Guidance for AI coding agents (and humans) working on this repository.

## 1. What this project is

**AI Chat** is a **frontend-only** AI chat application interface — a premium,
production-quality UI inspired by ChatGPT, Claude and Gemini.

There is **no backend**. No database, no authentication, no LLM provider, no
real file uploads, no API keys. Every behaviour — streaming, reasoning, tool
calls, citations, attachments, projects, file library — is simulated with local
React state and mock data.

> **Hard rule:** never add a backend, a server function that calls an external
> model, a database, or an API key requirement to this project. If a feature
> seems to need one, simulate it on the client instead.

## 2. Stack (as actually implemented)

| Concern        | Choice |
| -------------- | ------ |
| Framework      | TanStack Start v1 (file-based routing under `src/routes`) |
| UI library     | React 19 |
| Language       | TypeScript (strict, `exactOptionalPropertyTypes` enabled) |
| Styling        | Tailwind CSS v4 via `src/styles.css` (no `tailwind.config.js`) |
| Components     | shadcn/ui on Radix primitives (`src/components/ui`) |
| Icons          | lucide-react |
| Markdown       | react-markdown + remark-gfm |
| Command palette| cmdk (`Command` from shadcn/ui) |
| Toasts         | sonner |
| Build tool     | Vite 8 |
| Package manager| bun |

### Note on the original brief

The original brief asked for Next.js 16 App Router. This repository is a
**TanStack Start** project and the router cannot be swapped. The requested URL
structure is preserved 1:1 with TanStack file routes:

| Brief (Next.js)            | Here (TanStack Start)             |
| -------------------------- | --------------------------------- |
| `app/page.tsx`             | `src/routes/index.tsx`            |
| `app/projects/page.tsx`    | `src/routes/projects.index.tsx`   |
| `app/projects/[id]/page.tsx`| `src/routes/projects.$projectId.tsx` |
| `app/files/page.tsx`       | `src/routes/files.tsx`            |
| `app/settings/page.tsx`    | `src/routes/settings.tsx`         |
| `app/layout.tsx`           | `src/routes/__root.tsx`           |

Do **not** install `react-router-dom`, `next`, or any other router.

## 3. Repository map

```
src/
├── routes/
│   ├── __root.tsx              # html shell, providers, AppShell, <Outlet/>
│   ├── index.tsx               # chat view (/)
│   ├── projects.index.tsx      # projects grid
│   ├── projects.$projectId.tsx # single project view
│   ├── files.tsx               # shared file library
│   └── settings.tsx            # settings page
├── components/
│   ├── app-shell.tsx           # sidebar + main area + global overlays
│   ├── command-menu.tsx        # ⌘K / Ctrl+K palette
│   ├── share-dialog.tsx        # private / team / public visibility
│   ├── assistant-panel.tsx     # docked floating assistant
│   ├── theme-provider.tsx      # light / dark / system
│   ├── page-header.tsx
│   ├── chat/                   # all chat-specific components
│   │   ├── chat-layout.tsx     chat-sidebar.tsx   chat-header.tsx
│   │   ├── chat-message.tsx    message-actions.tsx message-composer.tsx
│   │   ├── markdown-renderer.tsx code-block.tsx    citations.tsx
│   │   ├── reasoning.tsx       tool-call.tsx      attachment-preview.tsx
│   │   └── empty-state.tsx
│   └── ui/                     # shadcn/ui primitives — avoid hand-editing
├── lib/chat-store.tsx          # single source of app state
├── data/mock.ts                # all mock conversations, projects, files
├── types/chat.ts               # every domain type
└── styles.css                  # design tokens, theme, animations
```

## 4. State model

All application state lives in **one provider**: `ChatProvider` in
`src/lib/chat-store.tsx`, consumed via the `useChatStore()` hook.

```tsx
const { conversations, activeConversation, sendMessage, settings } = useChatStore();
```

`ChatProvider` is mounted once, in `src/routes/__root.tsx`, wrapping `<Outlet />`.
If you ever see `useChatStore must be used within ChatProvider`, a component
rendered outside that subtree (or a stale build) is the cause — mount the
provider higher, never duplicate it.

Responsibilities of the store:

- conversation CRUD: create, rename, pin, delete, select
- search / filtering of conversation history
- active model selection
- share visibility (private / team / public)
- attachments held in memory (object URLs, never uploaded)
- **simulated streaming**: append user message → thinking state → reveal a mock
  answer token-chunk by token-chunk on a timer → allow stop / regenerate
- settings, persisted to `localStorage`

## 5. Rules for agents

1. **No backend, ever.** No `createServerFn` for data, no fetch to third
   parties, no env vars, no secrets.
2. **Types first.** Add or extend interfaces in `src/types/chat.ts` before
   writing components. `exactOptionalPropertyTypes` is on — optional fields must
   be declared as `field?: T | undefined`.
3. **Semantic tokens only.** Never write `text-white`, `bg-black`, or
   `bg-[#111]`. Use `bg-background`, `text-muted-foreground`, `border-border`,
   etc. See `design.md`.
4. **Reuse shadcn/ui.** If a primitive exists in `src/components/ui`, use it
   instead of hand-rolling a div with click handlers — accessibility comes free.
5. **Every route needs `head()`** with a unique title and description.
6. **Mock data lives in `src/data/mock.ts`.** Do not inline fixtures in
   components. Timestamps are anchored to the current hour to avoid SSR
   hydration mismatches — keep that pattern.
7. **Hydration safety.** Anything reading `window`, `localStorage`, or
   `Date.now()` for render output must run in `useEffect`, not in a `useState`
   initializer.
8. **Don't edit `src/routeTree.gen.ts`** — it is generated.

## 6. Local development

```bash
bun install
bun run dev        # http://localhost:8080
bun run build      # production build
bun run lint
bunx tsgo --noEmit # type check
```

## 7. Definition of done for a change

- `bunx tsgo --noEmit` passes with zero errors
- `bun run build` succeeds
- No console or runtime errors on `/`, `/projects`, `/files`, `/settings`
- Works at 320px, 768px, 1024px and 1440px widths
- Works in both light and dark themes
- Keyboard reachable, focus visible, controls labelled
