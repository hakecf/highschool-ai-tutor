import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, DEFAULT_MODEL } from "@/lib/ai/client";
import { buildMindMapPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { knowledgePoints, subject } = body as {
      knowledgePoints: { name: string; level: number; order: number }[];
      subject: string;
    };

    if (!knowledgePoints || knowledgePoints.length === 0) {
      return NextResponse.json(
        { success: false, error: "缺少知识点数据", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    // 格式化知识点列表
    const kpText = knowledgePoints
      .sort((a, b) => a.order - b.order)
      .map((kp) => `${"  ".repeat(kp.level)}- ${kp.name}`)
      .join("\n");

    const client = getAnthropicClient();
    const { system, user } = buildMindMapPrompt(subject);

    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system,
      messages: [
        {
          role: "user",
          content: `${user}\n\n知识点列表：\n${kpText}\n\n请生成 Markdown 大纲。`,
        },
      ],
    });

    const contentBlock = response.content.find(
      (block) => block.type === "text"
    );
    if (!contentBlock || contentBlock.type !== "text") {
      throw new Error("AI 未返回有效文本回复");
    }

    return NextResponse.json({
      success: true,
      markdown: contentBlock.text,
    });
  } catch (error) {
    console.error("Mindmap generation error:", error);
    const message =
      error instanceof Error ? error.message : "AI 生成失败";
    return NextResponse.json(
      { success: false, error: `思维导图生成失败：${message}`, code: "AI_ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
