import logo from "@/assets/logo.png";
import { SUGGESTIONS } from "@/data/mock";

export function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <img
        src={logo}
        alt=""
        width={512}
        height={512}
        className="mb-5 size-10 opacity-90 dark:invert"
      />
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How can I help you today?</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Ask questions, analyze files, write code, or explore ideas with AI.
      </p>

      <ul className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => onPick(s.title)}
              className="w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="block text-sm font-medium">{s.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{s.subtitle}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
