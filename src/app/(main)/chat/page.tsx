"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatMessageBubble } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatHistory } from "@/components/chat/chat-history";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChat } from "@/hooks/use-chat";
import * as textbookDB from "@/lib/db/textbook-db";
import type { Textbook } from "@/types";

export default function ChatPage() {
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    loadSessions,
    deleteSession,
    setCurrentSession,
    loadMessages,
    sendMessage,
  } = useChat();

  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("math");
  const [selectedTextbookId, setSelectedTextbookId] = useState<
    string | undefined
  >();
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 加载数据
  useEffect(() => {
    loadSessions();
    textbookDB.getAllTextbooks().then((all) => {
      setTextbooks(all.filter((t) => t.status === "ready"));
    });
  }, [loadSessions]);

  // 加载当前会话消息
  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    }
  }, [currentSessionId, loadMessages]);

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (content: string) => {
    sendMessage(content, selectedSubject, selectedTextbookId);
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleNewChat = async () => {
    setCurrentSession(null);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSession(id);
  };

  // 示例提示
  const examplePrompts = [
    "什么是函数？请用通俗的方式解释",
    "二次函数的顶点坐标怎么求？",
    "牛顿第二定律的公式和物理意义是什么？",
  ];

  return (
    <div className="flex h-full">
      {/* History sidebar */}
      <div className="hidden md:flex">
        <ChatHistory
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelect={handleSelectSession}
          onDelete={deleteSession}
          onNew={handleNewChat}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-background/80">
          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">数学</SelectItem>
              <SelectItem value="physics">物理</SelectItem>
              <SelectItem value="chemistry">化学</SelectItem>
            </SelectContent>
          </Select>

          {textbooks.length > 0 && (
            <Select
              value={selectedTextbookId || ""}
              onValueChange={(v) => setSelectedTextbookId(v || undefined)}
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="选择教材（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">不使用教材</SelectItem>
                {textbooks.map((tb) => (
                  <SelectItem key={tb.id} value={tb.id}>
                    {tb.name.slice(0, 15)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Messages */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto"
        >
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center py-12 px-4">
              <EmptyState
                icon={MessageCircle}
                title="开始对话"
                description="基于你的教材知识库，向 AI 提问学习问题"
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {examplePrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={
                    isStreaming &&
                    msg.role === "assistant" &&
                    msg.id === messages[messages.length - 1]?.id
                  }
                />
              ))}
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
