import { NextRequest, NextResponse } from "next/server";
import { parsePDF } from "@/lib/parsers/pdf";
import { parseWord } from "@/lib/parsers/word";

// 最大文件大小: 15MB
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "未检测到上传文件", code: "NO_FILE" },
        { status: 400 }
      );
    }

    // 文件类型检查
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "文件过大，请上传小于 15MB 的文件", code: "FILE_TOO_LARGE" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // PDF
    if (
      fileType === "application/pdf" ||
      fileName.endsWith(".pdf")
    ) {
      const result = await parsePDF(buffer);
      return NextResponse.json({
        success: true,
        text: result.text,
        pageCount: result.pageCount,
      });
    }

    // Word
    if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      const result = await parseWord(buffer);
      return NextResponse.json({
        success: true,
        text: result.text,
      });
    }

    // 图片 — 由客户端 OCR 处理，这里给出提示
    if (
      fileType.startsWith("image/") ||
      /\.(png|jpe?g|webp|bmp)$/.test(fileName)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "图片文件请在客户端进行 OCR 识别",
          code: "USE_CLIENT_OCR",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "不支持的文件格式，请上传 PDF、DOCX 或图片文件",
        code: "INVALID_FILE_TYPE",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { success: false, error: "文件解析失败，请检查文件是否正常", code: "PARSE_FAILED" },
      { status: 500 }
    );
  }
}
