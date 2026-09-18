import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_CONVERSATIONS,
  MOCK_CITATIONS,
  MOCK_REASONING,
  MOCK_RESPONSES,
} from "@/data/mock";
import {
  DEFAULT_SETTINGS,
  type AIModelId,
  type Attachment,
  type ChatSettings,
  type Conversation,
  type Message,
  type ShareVisibility,
} from "@/types/chat";

const SETTINGS_KEY = "ai-chat:settings";

let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter += 1)}`;

interface ChatContextValue {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  settings: ChatSettings;
  setSettings: (patch: Partial<ChatSettings>) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  isGenerating: boolean;
  selectConversation: (id: string) => void;
  newConversation: (projectId?: string) => string;
  renameConversation: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  deleteConversation: (id: string) => void;
  setModel: (id: string, model: AIModelId) => void;
  setVisibility: (id: string, visibility: ShareVisibility) => void;
  sendMessage: (text: string, attachments?: Attachment[], conversationId?: string) => void;
  stopGenerating: () => void;
  regenerate: (messageId: string) => void;
  setFeedback: (messageId: string, value: "up" | "down") => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>("conv-1");
  const [settings, setSettingsState] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const responseIndex = useRef(0);

  // Load persisted settings after hydration.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettingsState({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as ChatSettings) });
    } catch {
      /* ignore */
    }
  }, []);

  const setSettings = useCallback((patch: Partial<ChatSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const patchConversation = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
    },
    [],
  );

  const patchMessage = useCallback(
    (conversationId: string, messageId: string, patch: Partial<Message>) => {
      patchConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
      }));
    },
    [patchConversation],
  );

  const runStream = useCallback(
    (conversationId: string, messageId: string) => {
      const body = MOCK_RESPONSES[responseIndex.current % MOCK_RESPONSES.length]!;
      responseIndex.current += 1;
      setIsGenerating(true);

      const schedule = (fn: () => void, delay: number) => {
        timers.current.push(setTimeout(fn, delay));
      };

      // Thinking phase, then tool call, then streamed text.
      schedule(() => {
        patchMessage(conversationId, messageId, {
          thinking: false,
          streaming: true,
          reasoning: MOCK_REASONING,
          toolCalls: [
            {
              id: uid("tool"),
              name: "search",
              label: "Search",
              status: "running",
              input: { query: "reference documentation" },
            },
          ],
        });
      }, 900);

      schedule(() => {
        patchConversation(conversationId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  toolCalls: m.toolCalls?.map((t) => ({
                    ...t,
                    status: "completed" as const,
                    output: "3 relevant results found.",
                  })),
                }
              : m,
          ),
        }));
      }, 1800);

      const chunkSize = 6;
      const steps = Math.ceil(body.length / chunkSize);
      for (let i = 1; i <= steps; i += 1) {
        schedule(() => {
          patchMessage(conversationId, messageId, { content: body.slice(0, i * chunkSize) });
        }, 1900 + i * 14);
      }

      schedule(
        () => {
          patchMessage(conversationId, messageId, {
            content: body,
            streaming: false,
            citations: MOCK_CITATIONS,
          });
          setIsGenerating(false);
        },
        1900 + steps * 14 + 120,
      );
    },
    [patchConversation, patchMessage],
  );

  const sendMessage = useCallback(
    (text: string, attachments: Attachment[] = [], conversationId?: string) => {
      const trimmed = text.trim();
      if (!trimmed && attachments.length === 0) return;

      let targetId = conversationId ?? activeId;
      if (!targetId) {
        targetId = uid("conv");
        const created: Conversation = {
          id: targetId,
          title: trimmed.slice(0, 48) || "New chat",
          updatedAt: new Date().toISOString(),
          model: "gpt-5.6",
          visibility: "private",
          messages: [],
        };
        setConversations((prev) => [created, ...prev]);
        setActiveId(targetId);
      }

      const userMessage: Message = {
        id: uid("msg"),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
        attachments,
      };
      const assistantMessage: Message = {
        id: uid("msg"),
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        thinking: true,
        streaming: true,
      };

      patchConversation(targetId, (c) => ({
        ...c,
        title: c.messages.length === 0 && trimmed ? trimmed.slice(0, 48) : c.title,
        updatedAt: new Date().toISOString(),
        messages: [...c.messages, userMessage, assistantMessage],
      }));

      runStream(targetId, assistantMessage.id);
    },
    [activeId, patchConversation, runStream],
  );

  const stopGenerating = useCallback(() => {
    clearTimers();
    setIsGenerating(false);
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.streaming || m.thinking
            ? {
                ...m,
                streaming: false,
                thinking: false,
                stopped: true,
                content: m.content || "_Generation stopped._",
                toolCalls: m.toolCalls?.map((t) =>
                  t.status === "running" ? { ...t, status: "rejected" as const } : t,
                ),
              }
            : m,
        ),
      })),
    );
  }, [clearTimers]);

  const regenerate = useCallback(
    (messageId: string) => {
      if (!activeId) return;
      clearTimers();
      patchMessage(activeId, messageId, {
        content: "",
        thinking: true,
        streaming: true,
        stopped: false,
        citations: undefined,
        toolCalls: undefined,
        feedback: null,
      });
      runStream(activeId, messageId);
    },
    [activeId, clearTimers, patchMessage, runStream],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      activeId,
      activeConversation: conversations.find((c) => c.id === activeId) ?? null,
      settings,
      setSettings,
      sidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
      mobileSidebarOpen,
      setMobileSidebarOpen,
      commandOpen,
      setCommandOpen,
      panelOpen,
      setPanelOpen,
      isGenerating,
      selectConversation: (id) => {
        setActiveId(id);
        setMobileSidebarOpen(false);
      },
      newConversation: (projectId) => {
        const id = uid("conv");
        const created: Conversation = {
          id,
          title: "New chat",
          updatedAt: new Date().toISOString(),
          model: "gpt-5.6",
          visibility: "private",
          projectId,
          messages: [],
        };
        setConversations((prev) => [created, ...prev]);
        setActiveId(id);
        setMobileSidebarOpen(false);
        return id;
      },
      renameConversation: (id, title) => patchConversation(id, (c) => ({ ...c, title })),
      togglePin: (id) => patchConversation(id, (c) => ({ ...c, pinned: !c.pinned })),
      deleteConversation: (id) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setActiveId((current) =>
          current === id ? (conversations.find((c) => c.id !== id)?.id ?? null) : current,
        );
      },
      setModel: (id, model) => patchConversation(id, (c) => ({ ...c, model })),
      setVisibility: (id, visibility) => patchConversation(id, (c) => ({ ...c, visibility })),
      sendMessage,
      stopGenerating,
      regenerate,
      setFeedback: (messageId, feedbackValue) => {
        if (!activeId) return;
        patchConversation(activeId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? { ...m, feedback: m.feedback === feedbackValue ? null : feedbackValue }
              : m,
          ),
        }));
      },
    }),
    [
      conversations,
      activeId,
      settings,
      setSettings,
      sidebarCollapsed,
      mobileSidebarOpen,
      commandOpen,
      panelOpen,
      isGenerating,
      patchConversation,
      sendMessage,
      stopGenerating,
      regenerate,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used within ChatProvider");
  return ctx;
}
