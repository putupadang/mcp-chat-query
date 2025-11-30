"use client";

import { formatTimestamp } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import ToolCall from "./ToolCall";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCall?: {
    name: string;
    input: any;
    result: any;
    executionTime?: string;
  };
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={`flex flex-col gap-2 max-w-[80%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <Card className={isUser ? "bg-primary text-primary-foreground" : ""}>
          <CardContent className="p-4">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </CardContent>
        </Card>

        {message.toolCall && <ToolCall toolCall={message.toolCall} />}

        <span className="text-xs text-muted-foreground">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-secondary">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
