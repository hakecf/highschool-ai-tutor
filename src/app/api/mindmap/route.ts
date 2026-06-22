import { NextRequest, NextResponse } from "next/server";
import { getAIClient, DEFAULT_MODEL } from "@/lib/ai/client";
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

    const kpText = knowledgePoints
      .sort((a, b) => a.order - b.order)
      .map((kp) => `${"  ".repeat(kp.level)}- ${kp.name}`)
      .join("\n");

    const client = getAIClient();
    const { system, user } = buildMindMapPrompt(subject);

    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `${user}\n\n知识点列表：\n${kpText}\n\n请生成 Markdown 大纲。` },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("AI 未返回有效回复");

    return NextResponse.json({ success: true, markdown: content });
  } catch (error) {
    console.error("Mindmap generation error:", error);
    const message = error instanceof Error ? error.message : "AI 生成失败";
    return NextResponse.json(
      { success: false, error: `思维导图生成失败：${message}`, code: "AI_ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
