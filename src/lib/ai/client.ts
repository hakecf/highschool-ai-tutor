import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "未配置 ANTHROPIC_API_KEY 环境变量。请在 .env.local 中设置。"
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

// 默认使用的模型
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";
