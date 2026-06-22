import { NextRequest, NextResponse } from "next/server";
import { getAIClient, DEFAULT_MODEL } from "@/lib/ai/client";
import { buildKnowledgePointPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterText, chapterTitle, subject } = body as {
      chapterText: string; chapterTitle: string; subject: string;
    };

    if (!chapterText || !subject) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const client = getAIClient();
    const { system, user } = buildKnowledgePointPrompt(
      chapterTitle || "未知章节",
      subject
    );

    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `${user}\n\n${chapterText}` },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("AI 未返回有效回复");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 回复格式异常，无法提取 JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      knowledgePoints: parsed.knowledgePoints || [],
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints || [],
      difficultPoints: parsed.difficultPoints || [],
    });
  } catch (error) {
    console.error("Chapter analyze error:", error);
    const message = error instanceof Error ? error.message : "AI 分析失败";
    return NextResponse.json(
      { success: false, error: `章节分析失败：${message}`, code: "AI_ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
