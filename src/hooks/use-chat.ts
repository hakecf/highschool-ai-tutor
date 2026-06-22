"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { generateId } from "@/lib/utils/id";
import { useChatStore } from "@/stores/chat-store";
import * as knowledgeDB from "@/lib/db/knowledge-db";
import type { ChatMessage } from "@/types";

export function useChat() {
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    loadSessions,
    createSession,
    deleteSession,
    setCurrentSession,
    loadMessages,
    addMessage,
    appendToLastMessage,
    setStreaming,
  } = useChatStore();

  /**
   * 发送消息并处理流式响应
   */
  const sendMessage = useCallback(
    async (
      content: string,
      subject: string = "math",
      textbookId?: string
    ) => {
      if (!content.trim() || isStreaming) return;

      let sessionId = currentSessionId;

      // 创建新会话
      if (!sessionId) {
        sessionId = await createSession({
          id: generateId(),
          textbookId,
          title: content.slice(0, 30),
        });
        setCurrentSession(sessionId);
      }

      // 添加用户消息
      const userMsg: Omit<ChatMessage, "createdAt"> = {
        id: generateId(),
        sessionId,
        role: "user",
        content: content.trim(),
      };
      addMessage(userMsg);

      // 搜索相关知识点作为上下文
      let context = "暂无教材参考内容。";
      if (textbookId) {
        try {
          const kps = await knowledgeDB.getKnowledgePointsByTextbook(textbookId);
          // 简单关键词匹配
          const keywords = content
            .replace(/[，。！？、；：""（）【】]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length >= 2);
          const matched = kps
            .filter((kp) =>
              keywords.some((kw) =>
                kp.name.includes(kw) || kp.description.includes(kw)
              )
            )
            .slice(0, 5);
          if (matched.length > 0) {
            context = matched
              .map((kp) => `- ${kp.name}: ${kp.description}`)
              .join("\n");
          }
        } catch { /* ignore */ }
      }

      // 准备消息历史
      const allMessages = [...useChatStore.getState().messages];
      const history = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // 添加助手占位消息
      const assistantMsg: Omit<ChatMessage, "createdAt"> = {
        id: generateId(),
        sessionId,
        role: "assistant",
        content: "",
      };
      addMessage(assistantMsg);
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            subject,
            context,
          }),
        });

        if (!res.ok) {
          throw new Error(`请求失败 (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("无法读取响应流");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const dataStr = trimmed.slice(6);
            if (dataStr === "[DONE]") continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === "text_delta" && data.text) {
                appendToLastMessage(data.text);
              } else if (data.type === "message_stop") {
                // 流结束
              } else if (data.type === "error") {
                appendToLastMessage(`\n\n[回复中断：${data.text}]`);
              }
            } catch { /* skip malformed chunks */ }
          }
        }

        setStreaming(false);

        // 更新持久化消息
        const finalMessages = useChatStore.getState().messages;
        const lastMsg = finalMessages[finalMessages.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          chatDBUpdate(lastMsg);
        }
      } catch (error) {
        setStreaming(false);
        const msg =
          error instanceof Error ? error.message : "对话失败";
        toast.error(msg);
        appendToLastMessage(`\n\n[错误：${msg}]`);
      }
    },
    [
      currentSessionId,
      isStreaming,
      createSession,
      setCurrentSession,
      addMessage,
      appendToLastMessage,
      setStreaming,
    ]
  );

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    loadSessions,
    createSession,
    deleteSession,
    setCurrentSession,
    loadMessages,
    sendMessage,
  };
}

// 更新持久化消息
async function chatDBUpdate(msg: ChatMessage) {
  const { db } = await import("@/lib/db/index");
  await db.chatMessages.put(msg);
}
