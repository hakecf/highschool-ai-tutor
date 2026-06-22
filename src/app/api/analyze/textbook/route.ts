import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, DEFAULT_MODEL } from "@/lib/ai/client";
import { buildChapterExtractionPrompt } from "@/lib/ai/prompts";

// 最大文本长度（字符），超过则分块处理
const MAX_CHARS = 80000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, subject, version } = body as {
      text: string;
      subject: string;
      version: string;
    };

    if (!text || !subject || !version) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数", code: "MISSING_PARAMS" },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();
    const { system, user } = buildChapterExtractionPrompt(subject, version);

    // 如果文本过长，截取前 MAX_CHARS 字符进行分析
    // 对于超长文本，先分析前面的章节，后续再处理剩余
    const textToAnalyze =
      text.length > MAX_CHARS
        ? text.slice(0, MAX_CHARS) +
          "\n\n[注意：教材文本过长，此处仅分析了前 " +
          MAX_CHARS +
          " 字符的内容]"
        : text;

    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system,
      messages: [
        {
          role: "user",
          content: `${user}\n\n教材文本：\n\n${textToAnalyze}`,
        },
      ],
    });

    // 提取 Claude 回复中的 JSON
    const contentBlock = response.content.find((block) => block.type === "text");
    if (!contentBlock || contentBlock.type !== "text") {
      throw new Error("AI 未返回有效文本回复");
    }

    const content = contentBlock.text;
    // 尝试从回复中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI 回复格式异常，无法提取 JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.chapters || !Array.isArray(parsed.chapters)) {
      throw new Error("AI 提取的章节数据格式不正确");
    }

    return NextResponse.json({
      success: true,
      chapters: parsed.chapters.map((ch: { title: string; order: number; rawContent: string }) => ({
        title: ch.title,
        order: ch.order,
        rawContent: ch.rawContent,
      })),
    });
  } catch (error) {
    console.error("Textbook analyze error:", error);
    const message =
      error instanceof Error ? error.message : "AI 分析失败";

    // 判断是否为 API Key 问题
    if (message.includes("ANTHROPIC_API_KEY")) {
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
