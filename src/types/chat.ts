export type AIModelId = "gpt-5.6" | "claude-sonnet" | "gemini" | "llama" | "mistral";

export interface AIModel {
  id: AIModelId;
  name: string;
  vendor: string;
  description: string;
}

export type AttachmentKind = "image" | "file";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  kind: AttachmentKind;
  mime: string;
  previewUrl?: string | undefined;
}

export interface Citation {
  id: string;
  index: number;
  title: string;
  domain: string;
  url: string;
}

export type ToolCallStatus = "running" | "completed" | "error" | "rejected";

export interface ToolCall {
  id: string;
  name: string;
  label: string;
  status: ToolCallStatus;
  input?: Record<string, string> | undefined;
  output?: string | undefined;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  attachments?: Attachment[] | undefined;
  citations?: Citation[] | undefined;
  toolCalls?: ToolCall[] | undefined;
  reasoning?: string[] | undefined;
  streaming?: boolean | undefined;
  thinking?: boolean | undefined;
  stopped?: boolean | undefined;
  feedback?: "up" | "down" | null | undefined;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  pinned?: boolean | undefined;
  projectId?: string | undefined;
  model: AIModelId;
  visibility: ShareVisibility;
  messages: Message[];
}

export type ShareVisibility = "private" | "team" | "public";

export interface Project {
  id: string;
  name: string;
  description: string;
  conversationCount: number;
  fileCount: number;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  conversation: string;
  projectId?: string | undefined;
}

export interface ChatSettings {
  theme: "light" | "dark" | "system";
  enterToSend: boolean;
  showReasoning: boolean;
  showCitations: boolean;
  compactMode: boolean;
  notifications: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  theme: "system",
  enterToSend: true,
  showReasoning: true,
  showCitations: true,
  compactMode: false,
  notifications: false,
};
