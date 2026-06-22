import { NextRequest, NextResponse } from "next/server";
import { getAIClient, DEFAULT_MODEL } from "@/lib/ai/client";
import { buildChapterExtractionPrompt } from "@/lib/ai/prompts";

const MAX_CHARS = 80000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, subject, version } = body as {
      text: string; subject: string; version: string;
    };

    if (!text || !subject || !version) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const client = getAIClient();
    const { system, user } = buildChapterExtractionPrompt(subject, version);

    const textToAnalyze = text.length > MAX_CHARS
      ? text.slice(0, MAX_CHARS) + "\n\n[注意：教材过长，仅分析了前80%的内容]"
      : text;

    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `${user}\n\n${textToAnalyze}` },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("AI 未返回有效回复");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI 回复格式异常，无法提取 JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.chapters || !Array.isArray(parsed.chapters)) {
      throw new Error("AI 提取的章节数据格式不正确");
    }

    return NextResponse.json({
      success: true,
      chapters: parsed.chapters.map(
        (ch: { title: string; order: number; rawContent: string }) => ({
          title: ch.title,
          order: ch.order,
          rawContent: ch.rawContent,
        })
      ),
    });
  } catch (error) {
    console.error("Textbook analyze error:", error);
    const message = error instanceof Error ? error.message : "AI 分析失败";
    if (message.includes("DEEPSEEK_API_KEY")) {
      return NextResponse.json(
        { success: false, error: message, code: "NO_API_KEY" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: `章节提取失败：${message}`, code: "AI_ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}
