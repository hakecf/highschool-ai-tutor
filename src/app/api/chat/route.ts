import { NextRequest } from "next/server";
import { getAIClient, DEFAULT_MODEL } from "@/lib/ai/client";
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
        JSON.stringify({ success: false, error: "缺少对话消息" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = getAIClient();
    const systemPrompt = buildChatSystemPrompt(
      subject || "math", "人教版",
      context || "暂无教材参考内容。"
    );

    // DeepSeek 使用 OpenAI 格式
    const stream = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              const data = JSON.stringify({ type: "text_delta", text: delta });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "message_stop" })}\n\n`
            )
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
    const message = error instanceof Error ? error.message : "对话请求失败";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
