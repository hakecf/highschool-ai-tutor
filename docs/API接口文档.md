# API 接口文档 — 高中生学习助手 (Demo)

## 通用说明

- **Base URL**: `http://localhost:3000/api` (开发) 或 Vercel 域名 (生产)
- **Content-Type**: `application/json`（除 `/parse` 用 `multipart/form-data`）
- **响应格式**: `{ "success": boolean, ...data }` 或 `{ "success": false, "error": string, "code": string }`

---

## 1. POST /api/parse — 文件解析

**用途**：上传教材文件，提取纯文本内容。

**请求**：
```
Content-Type: multipart/form-data
Body:
  file: File (PDF / DOCX, 最大 15MB)
```

**成功响应** (200):
```json
{
  "success": true,
  "text": "第一章 函数\n1.1 函数的定义...",
  "pageCount": 42
}
```

**错误响应** (400/500):
```json
{
  "success": false,
  "error": "不支持的文件格式，请上传 PDF 或 DOCX",
  "code": "INVALID_FILE_TYPE"
}
```

---

## 2. POST /api/analyze/textbook — 提取章节结构

**用途**：对完整教材文本，使用 AI 提取章节划分。

**请求**：
```json
{
  "text": "教材完整文本...",
  "subject": "math",
  "version": "人教版"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "chapters": [
    {
      "title": "第一章 函数",
      "order": 1,
      "rawContent": "在本章中，我们将探索..."
    }
  ]
}
```

---

## 3. POST /api/analyze/chapter — 分析单个章节

**用途**：对单个章节文本，提取知识点层级结构 + 生成总结 + 识别重难点。

**请求**：
```json
{
  "chapterText": "章节文本...",
  "chapterTitle": "第一章 函数",
  "subject": "math"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "knowledgePoints": [
    {
      "name": "函数的定义",
      "description": "函数是一种特殊的对应关系...",
      "parentName": null,
      "level": 0,
      "order": 0
    }
  ],
  "summary": "本章介绍了函数的基本概念...",
  "keyPoints": ["重点1", "重点2", "重点3"],
  "difficultPoints": [
    {
      "title": "区分函数与一般关系",
      "explanation": "学生容易混淆函数和一般关系..."
    }
  ]
}
```

---

## 4. POST /api/mindmap — 生成思维导图

**用途**：基于知识点列表，生成 markdown 格式的思维导图大纲。

**请求**：
```json
{
  "knowledgePoints": [
    { "name": "函数", "level": 0, "order": 0 },
    { "name": "定义域与值域", "level": 1, "order": 0 }
  ],
  "subject": "math"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "markdown": "# 函数\n## 定义域与值域\n### 集合表示法\n### 区间表示法"
}
```

---

## 5. POST /api/chat — 流式对话

**用途**：基于教材内容进行 AI 问答（Server-Sent Events 流式响应）。

**请求**：
```json
{
  "messages": [
    { "role": "user", "content": "什么是函数？" },
    { "role": "assistant", "content": "函数是..." },
    { "role": "user", "content": "能举个例子吗？" }
  ],
  "subject": "math",
  "context": "相关知识点：\n- 函数的定义：...\n- 定义域与值域：..."
}
```

**响应**：`text/event-stream` (SSE)
```
data: {"type":"text_delta","text":"当然"}
data: {"type":"text_delta","text":"！根据"}
data: {"type":"text_delta","text":"你的教材..."}
data: {"type":"message_stop"}
```

---

## 错误码

| HTTP 状态码 | code | 说明 |
|-------------|------|------|
| 400 | `INVALID_FILE_TYPE` | 不支持的文件格式 |
| 400 | `NO_FILE` | 未上传文件 |
| 413 | `FILE_TOO_LARGE` | 文件过大 |
| 429 | `RATE_LIMITED` | 请求过于频繁 |
| 500 | `PARSE_FAILED` | 文件解析失败 |
| 500 | `AI_ANALYSIS_FAILED` | AI 分析失败 |
| 500 | `AI_QUOTA_EXCEEDED` | API 额度用尽 |
| 500 | `INTERNAL_ERROR` | 服务器内部错误 |
