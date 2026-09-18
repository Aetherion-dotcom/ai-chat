import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "@/lib/chat-store";
import type { ChatSettings } from "@/types/chat";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Chat" },
      {
        name: "description",
        content: "Control appearance, chat behaviour and notifications for your AI Chat workspace.",
      },
      { property: "og:title", content: "Settings — AI Chat" },
      {
        property: "og:description",
        content: "Control appearance, chat behaviour and notifications for your AI Chat workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

const TOGGLES: { key: keyof ChatSettings; label: string; description: string }[] = [
  { key: "enterToSend", label: "Enter to send", description: "Shift + Enter inserts a new line." },
  { key: "showReasoning", label: "Show reasoning", description: "Display the model's thinking steps." },
  { key: "showCitations", label: "Show citations", description: "List sources under responses." },
  { key: "compactMode", label: "Compact mode", description: "Tighter spacing in the transcript." },
];

function SettingsPage() {
  const { settings, setSettings } = useChatStore();

  return (
    <>
      <PageHeader title="Settings" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-8 sm:px-6">
          <section aria-labelledby="appearance">
            <h2 id="appearance" className="text-base font-semibold">
              Appearance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose how AI Chat looks to you.</p>
            <RadioGroup
              value={settings.theme}
              onValueChange={(v) => setSettings({ theme: v as ChatSettings["theme"] })}
              className="mt-4 grid gap-2 sm:grid-cols-3"
            >
              {THEMES.map((t) => (
                <Label
                  key={t.value}
                  htmlFor={`theme-${t.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent has-[[data-state=checked]]:border-foreground/30 has-[[data-state=checked]]:bg-accent/60"
                >
                  <RadioGroupItem id={`theme-${t.value}`} value={t.value} />
                  <t.icon className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium">{t.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <Separator />

          <section aria-labelledby="chat">
            <h2 id="chat" className="text-base font-semibold">
              Chat
            </h2>
            <div className="mt-4 divide-y divide-border rounded-xl border border-border">
              {TOGGLES.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-4 p-4">
                  <Label htmlFor={t.key} className="flex-1 cursor-pointer">
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {t.description}
                    </span>
                  </Label>
                  <Switch
                    id={t.key}
                    checked={Boolean(settings[t.key])}
                    onCheckedChange={(checked) => setSettings({ [t.key]: checked })}
                  />
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section aria-labelledby="notifications">
            <h2 id="notifications" className="text-base font-semibold">
              Notifications
            </h2>
            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <Label htmlFor="notifications-toggle" className="flex-1 cursor-pointer">
                <span className="block text-sm font-medium">Enable notifications</span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  Get notified when a long response finishes.
                </span>
              </Label>
              <Switch
                id="notifications-toggle"
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ notifications: checked })}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
