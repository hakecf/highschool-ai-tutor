import { NextRequest } from "next/server";
import { getAnthropicClient, DEFAULT_MODEL } from "@/lib/ai/client";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, subject, context } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      subject: string;
      context: string;
    };

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "缺少对话消息", code: "MISSING_PARAMS" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = getAnthropicClient();
    const systemPrompt = buildChatSystemPrompt(
      subject || "math",
      "人教版", // default
      context || "暂无教材参考内容。"
    );

    // 将消息格式化为 Anthropic 格式
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 使用流式 API
    const stream = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      temperature: 0.7,
      system: systemPrompt,
      messages: anthropicMessages,
      stream: true,
    });

    // 创建 SSE 流
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = JSON.stringify({
                type: "text_delta",
                text: event.delta.text,
              });
              controller.enqueue(
                encoder.encode(`data: ${chunk}\n\n`)
              );
            }
          }
          // 发送完成信号
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "message_stop" })}\n\n`)
          );
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", text: "回复生成中断" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const message =
      error instanceof Error ? error.message : "对话请求失败";
    return new Response(
      JSON.stringify({ success: false, error: message, code: "AI_CHAT_FAILED" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
