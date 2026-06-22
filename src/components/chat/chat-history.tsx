"use client";

import { Plus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";
import type { ChatSession } from "@/types";

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function ChatHistory({
  sessions,
  currentSessionId,
  onSelect,
  onDelete,
  onNew,
}: ChatHistoryProps) {
  return (
    <div className="w-56 shrink-0 border-r border-border flex flex-col h-full">
      {/* New chat button */}
      <div className="p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onNew}
        >
          <Plus className="h-4 w-4" />
          新对话
        </Button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 px-2">
            暂无对话记录
          </p>
        ) : (
          <div className="space-y-0.5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors",
                  session.id === currentSessionId
                    ? "bg-secondary"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelect(session.id)}
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-xs">
                  {session.title || "新对话"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
