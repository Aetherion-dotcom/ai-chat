import { useState } from "react";
import { Check, Copy, Globe, Lock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useChatStore } from "@/lib/chat-store";
import type { ShareVisibility } from "@/types/chat";

const OPTIONS: { value: ShareVisibility; label: string; description: string; icon: typeof Lock }[] = [
  { value: "private", label: "Private", description: "Only you can access this conversation", icon: Lock },
  { value: "team", label: "Team", description: "Anyone in your workspace can access it", icon: Users },
  { value: "public", label: "Public", description: "Anyone with the link can access it", icon: Globe },
];

export function ShareDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { activeConversation, setVisibility } = useChatStore();
  const [copied, setCopied] = useState(false);
  const visibility = activeConversation?.visibility ?? "private";
  const link = `https://ai-chat.app/c/${activeConversation?.id ?? "new"}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share conversation</DialogTitle>
          <DialogDescription>Choose who can open this conversation.</DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={visibility}
          onValueChange={(v) =>
            activeConversation && setVisibility(activeConversation.id, v as ShareVisibility)
          }
          className="gap-2"
        >
          {OPTIONS.map((option) => (
            <Label
              key={option.value}
              htmlFor={`share-${option.value}`}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent has-[[data-state=checked]]:border-foreground/30 has-[[data-state=checked]]:bg-accent/60"
            >
              <RadioGroupItem id={`share-${option.value}`} value={option.value} className="mt-0.5" />
              <span className="flex-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <option.icon className="size-4 text-muted-foreground" aria-hidden />
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>

        <div className="flex gap-2">
          <Input readOnly value={link} aria-label="Share link" className="text-xs" />
          <Button type="button" onClick={copy} className="gap-1.5 shrink-0">
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
