import { useEffect } from "react";
import { useChatStore } from "@/lib/chat-store";

/** Applies the persisted theme preference to the document element. */
export function ThemeSync() {
  const { settings } = useChatStore();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.theme]);

  return null;
}
