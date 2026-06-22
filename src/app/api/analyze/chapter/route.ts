import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, DEFAULT_MODEL } from "@/lib/ai/client";
import { buildKnowledgePointPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterText, chapterTitle, subject } = body as {
      chapterText: string;
      chapterTitle: string;
      subject: string;
    };

    if (!chapterText || !subject) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();
    const { system, user } = buildKnowledgePointPrompt(
      chapterTitle || "未知章节",
      subject
    );

    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system,
      messages: [
        {
          role: "user",
          content: `${user}\n\n章节内容：\n\n${chapterText}`,
        },
      ],
    });

    const contentBlock = response.content.find((block) => block.type === "text");
    if (!contentBlock || contentBlock.type !== "text") {
      throw new Error("AI 未返回有效文本回复");
    }

    const content = contentBlock.text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI 回复格式异常，无法提取 JSON");
    }

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
    const message =
      error instanceof Error ? error.message : "AI 分析失败";

    return NextResponse.json(
      { success: false, error: `章节分析失败：${message}`, code: "AI_ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
