import OpenAI from "openai";

let client: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error(
        "未配置 DEEPSEEK_API_KEY 环境变量。请在 Vercel 设置中添加。"
      );
    }
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
  }
  return client;
}

// DeepSeek 当前最推荐模型
export const DEFAULT_MODEL = "deepseek-chat";
