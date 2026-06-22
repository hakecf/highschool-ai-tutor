"use client";

import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessageBubble({
  role,
  content,
  isStreaming,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 py-3 px-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar (assistant only) */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-white border border-border shadow-sm"
        )}
      >
        {content ? (
          <div className="whitespace-pre-wrap break-words">
            {content}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
            )}
          </div>
        ) : (
          <span className="text-muted-foreground italic">
            思考中<span className="animate-pulse">...</span>
          </span>
        )}
      </div>

      {/* Avatar (user only) */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
          <User className="h-4 w-4 text-blue-600" />
        </div>
      )}
    </div>
  );
}
