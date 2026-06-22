/**
 * 客户端 OCR（图片文字识别）
 * 使用 Tesseract.js，支持中文 + 英文
 */
import Tesseract from "tesseract.js";

export async function ocrImage(file: File): Promise<string> {
  // 创建临时 URL 供 Tesseract 读取
  const imageUrl = URL.createObjectURL(file);

  try {
    const result = await Tesseract.recognize(imageUrl, "chi_sim+eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          // 进度回调 — 可以用于进度条
          console.log(`OCR progress: ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });
    return result.data.text;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
