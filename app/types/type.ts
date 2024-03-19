import { type Message } from "ai/react";

// chat type
export type ChatHistory = {
  userId: string;
  chatId: string;
  messages: Message[];
  active: boolean;
};