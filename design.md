# design.md

The design system behind **AI Chat** — a premium, minimal, neutral interface
that should read as a real developer-productivity product, not a template.

## 1. Design principles

1. **Neutral foundation.** Black, white and grayscale. Colour is reserved for
   state (destructive, success, warning) — never for decoration.
2. **Content first.** The conversation is the product. Chrome recedes:
   hairline borders, muted labels, no heavy surfaces.
3. **Quiet depth.** Separation comes from 1px borders and background steps, not
   drop shadows. Shadows appear only on floating layers (popovers, dialogs,
   docked panel).
4. **Calm motion.** 120–200ms transitions on colour, opacity and transform
   only. No bouncing, no parallax, no attention-grabbing loops — except the
   deliberate streaming caret and voice waveform.
5. **No AI-slop aesthetics.** No purple/indigo gradients, no glassmorphism, no
   illustrations, no emoji as UI, no default Inter/Poppins look.
6. **Density with air.** Compact controls, generous vertical rhythm between
   messages.

## 2. Tokens

All colours are CSS custom properties in `src/styles.css`, defined in `oklch`,
exposed to Tailwind through `@theme inline`. **Components must only use the
semantic utility names** — `bg-background`, `text-foreground`,
`text-muted-foreground`, `border-border`, `bg-card`, `bg-accent`,
`bg-secondary`, `bg-destructive`, `ring-ring`, `bg-sidebar`, …

| Token | Role |
| --- | --- |
| `background` / `foreground` | page canvas and primary text |
| `card` / `card-foreground` | raised surfaces: message cards, project cards, tool calls |
| `popover` / `popover-foreground` | floating layers: dropdowns, command menu, tooltips |
| `primary` / `primary-foreground` | send button, active states — near-black in light, near-white in dark |
| `secondary` | low-emphasis fills: chips, ghost button hover |
| `muted` / `muted-foreground` | subdued panels and metadata text |
| `accent` / `accent-foreground` | hover/selected rows in lists and menus |
| `destructive` | delete actions and error tool calls |
| `border` / `input` / `ring` | hairlines, field borders, focus ring |
| `sidebar*` | dedicated sidebar surface, slightly offset from the canvas |

### Adding a colour

1. Add the value to `:root` (light) **and** `.dark` (dark) in oklch.
2. Register it in `@theme inline` as `--color-<name>: var(--<name>)`.
3. Use it only through the generated utility.

Never hardcode a hex or a literal colour utility in a component — it breaks
theming and dark mode.

## 3. Typography

- **Sans:** Geist — UI, prose, headings.
- **Mono:** Geist Mono — code blocks, inline code, file sizes, shortcut hints.
- Loaded via a `<link>` in the root route head, never `@import` in CSS.

| Use | Size / weight |
| --- | --- |
| Page / empty-state headline | `text-3xl` – `text-4xl`, semibold, tight tracking |
| Section heading | `text-lg` semibold |
| Body & message text | `text-sm` – `text-base`, relaxed leading (~1.7) |
| Metadata, timestamps, labels | `text-xs`, `text-muted-foreground` |
| Code | `text-[13px]` mono |

Assistant prose renders through `MarkdownRenderer`, which styles headings,
paragraphs, lists, links, blockquotes, tables, inline code and code blocks.
Assistant output is **never** rendered in a `<textarea>` or `<pre>` dump.

## 4. Shape, border, elevation

- Radius scale derives from a single `--radius`: `rounded-md` for controls,
  `rounded-lg` for cards and the composer, `rounded-xl`/`2xl` for the docked
  assistant panel and suggestion cards.
- Borders are always `border-border` at 1px.
- Shadows: `shadow-none` inline, `shadow-sm` on hover for cards,
  `shadow-lg` for dialogs/popovers only.

## 5. Spacing & layout

4px base scale. Common values: 8, 12, 16, 24, 32, 48.

```
Desktop ≥1024px
┌────────────┬──────────────────────────────────┐
│ Sidebar    │ Header (56px, sticky)            │
│ 280px      ├──────────────────────────────────┤
│ sidebar bg │ Conversation (scroll)            │
│            │   content max-width 768px,       │
│            │   centred, 24px gutters          │
│            ├──────────────────────────────────┤
│            │ Composer (sticky bottom)         │
└────────────┴──────────────────────────────────┘
```

- Sidebar: fixed 280px, collapsible on desktop, a Sheet on mobile.
- Message column: `max-w-3xl mx-auto` so lines stay readable on wide monitors.
- Message spacing: 24–32px between turns, 12px inside a turn.
- Composer sits in a sticky footer with a soft fade above it.

### Breakpoints

| Width | Behaviour |
| --- | --- |
| 320–479px | Sidebar → Sheet, header shows menu + title only, icon-only actions, composer full-bleed |
| 480–767px | Same, slightly wider gutters |
| 768–1023px | Sidebar still a Sheet, model selector visible in header |
| 1024–1439px | Persistent sidebar, full header |
| ≥1440px | Centred content column, sidebar unchanged, extra canvas left empty |

Tap targets are ≥40px on touch widths.

## 6. Component patterns

- **Sidebar item:** full-width ghost row, `hover:bg-accent`, active row uses
  `bg-accent` + medium weight; the "more" menu fades in on hover and is always
  present for keyboard users.
- **Conversation groups:** Pinned, Today, Yesterday, Previous 7 Days, Older —
  each with an uppercase `text-xs` muted label.
- **Message:** avatar 28px, role label, content, then an action row that
  appears on hover/focus (copy, regenerate, thumbs up/down, more).
- **Reasoning:** collapsible, `bg-muted/40`, chevron rotates, monospace-ish
  muted step list.
- **Tool call:** bordered card with a status icon — spinner (running), check
  (completed), alert (error, destructive tint), slash (rejected) — plus name,
  status line and optional output.
- **Citations:** collapsible "Sources" block; each row shows index badge,
  title, domain and an external-link icon.
- **Code block:** header bar with language label and a Copy → Copied button,
  mono body, horizontal scroll, no line wrap.
- **Attachments:** chips/thumbnails with name, size and a remove button;
  images show a preview thumbnail.
- **Empty state:** centred headline, one-line subtitle, four suggestion cards
  that send their prompt on click.

## 7. Motion

| Interaction | Treatment |
| --- | --- |
| Hover / focus | 150ms colour + background |
| Sheet / dialog | 200ms fade + slide |
| Docked panel | 250ms slide-in from right |
| Streaming text | characters revealed on a timer with a blinking caret |
| Thinking state | three-dot pulse with "AI is thinking…" |
| Voice input | CSS keyframe waveform bars defined in `styles.css` |

Everything should respect `prefers-reduced-motion` where it is decorative.

## 8. Accessibility

- Semantic landmarks: `<aside>`, `<header>`, `<main>`, `<form>`.
- Every icon-only button has an `aria-label`; hover hints use Tooltip.
- Focus is always visible via `ring-2 ring-ring ring-offset-2`.
- Dialogs, sheets, dropdowns and the command palette come from Radix, so focus
  trap, escape handling and `aria-*` wiring are correct by construction.
- Streaming regions are `aria-live="polite"`.
- Contrast: body text ≥ 4.5:1, muted metadata ≥ 4.5:1 against its surface, in
  both themes.

## 9. Theming

Three modes — Light, Dark, System — selected in Settings or the command
palette, applied by toggling `.dark` on `<html>` and persisted to
`localStorage`. Dark mode is a true near-black neutral (not blue-tinted), with
surfaces stepping up from the canvas rather than down.
