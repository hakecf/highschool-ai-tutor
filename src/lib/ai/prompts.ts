// ── 章节提取 Prompt ──

export function buildChapterExtractionPrompt(
  subject: string,
  version: string
): { system: string; user: string } {
  const subjectNames: Record<string, string> = {
    math: "数学",
    physics: "物理",
    chemistry: "化学",
  };
  const subjectName = subjectNames[subject] || subject;

  const system = `你是一位经验丰富的${subjectName}教师，精通${version}教材体系。
你的任务是分析教材文本，准确识别章节结构，只输出 JSON，不要其他内容。
输出格式: {"chapters":[{"title":"章节标题","order":1,"rawContent":"完整的章节原文内容"}]}`;

  const user = `请分析以下${version}${subjectName}教材文本，提取所有章节。使用中文输出。\n\n教材文本：`;

  return { system, user };
}

// ── 知识点提取 Prompt ──

export function buildKnowledgePointPrompt(
  chapterTitle: string,
  subject: string
): { system: string; user: string } {
  const subjectNames: Record<string, string> = {
    math: "数学",
    physics: "物理",
    chemistry: "化学",
  };
  const subjectName = subjectNames[subject] || subject;

  const system = `你是${subjectName}教育专家。从教材章节中提取知识点。只输出 JSON，不要其他内容。
输出格式: {"knowledgePoints":[{"name":"知识点名","description":"解释","parentName":null,"level":0,"order":0}],"summary":"2-3句总结","keyPoints":["重点"],"difficultPoints":[{"title":"难点","explanation":"为什么难"}]}
parentName为父知识点名称，根节点为null。使用中文。`;

  const user = `请分析章节"${chapterTitle}"（${subjectName}），提取知识点结构。\n\n章节内容：`;

  return { system, user };
}

// ── 聊天系统 Prompt ──

export function buildChatSystemPrompt(
  subject: string,
  version: string,
  context: string
): string {
  const subjectNames: Record<string, string> = {
    math: "数学",
    physics: "物理",
    chemistry: "化学",
  };
  const subjectName = subjectNames[subject] || subject;

  return `你是知识渊博的${subjectName}家教老师，学生使用${version}教材。

## 教材参考
${context}

## 要求
1. 用中文回答，基于教材内容
2. 超出范围就礼貌说明并引导回教材
3. 可用 Markdown 格式
4. 数学题给出清晰步骤
5. 用通俗方式解释复杂概念`;
}

// ── 思维导图 Prompt ──

export function buildMindMapPrompt(
  subject: string
): { system: string; user: string } {
  const subjectNames: Record<string, string> = {
    math: "数学",
    physics: "物理",
    chemistry: "化学",
  };
  const subjectName = subjectNames[subject] || subject;

  const system = `你是${subjectName}教育专家。将知识点列表组织成思维导图 Markdown 大纲。
# 用于根主题，## 用于子主题，### 用于知识点。只输出 Markdown，不要解释。使用中文。`;

  const user = `请将以下${subjectName}知识点组织成 Markdown 大纲：`;

  return { system, user };
}
