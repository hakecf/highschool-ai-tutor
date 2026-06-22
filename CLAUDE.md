# CLAUDE.md — 高中生学习助手 (High School AI Tutor)

## 项目概述

一款基于 Next.js 16 的高中生学习辅助 Web 应用。学生上传数学/物理/化学教材，
AI 自动分析知识点、构建知识树和思维导图，并提供基于教材内容的智能问答。
Demo 阶段数据全部存储在浏览器本地。

## 标准文件路径

- **项目文档**: `docs/<文档名>.md`
  - `需求文档.md` — 功能需求与非功能需求
  - `技术方案.md` — 技术架构与关键决策
  - `设计规范.md` — UI 色彩/字体/间距/组件规范
  - `执行步骤.md` — 10 阶段开发计划与进度
  - `API接口文档.md` — 全部 API 端点详细规范
- **开发日志**: `开发日志/YYYY-MM-DD-<主题>.md`
- **UI 组件**: `src/components/<domain>/<name>.tsx`
- **通用 UI**: `src/components/ui/<name>.tsx` (shadcn/ui)
- **API 路由**: `src/app/api/<endpoint>/route.ts`
- **数据库**: `src/lib/db/<name>-db.ts`
- **AI 相关**: `src/lib/ai/<name>.ts`
- **文件解析**: `src/lib/parsers/<format>.ts`
- **状态管理**: `src/stores/<name>-store.ts`
- **自定义 Hooks**: `src/hooks/use-<name>.ts`
- **类型定义**: `src/types/<name>.ts`

## 工作指令

1. **"use client" 指令**：组件中使用 React hooks、zustand stores、浏览器 API、
   事件处理时，必须添加 `"use client"` 指令。API 路由和 lib/ 工具文件中不需要。
2. **AI API 调用**：所有 Claude API 调用必须通过服务端 API 路由 (`src/app/api/`)，
   绝对不要在客户端组件中直接调用 Anthropic SDK。`ANTHROPIC_API_KEY` 仅存于 `.env.local`。
3. **数据存储**：所有持久化数据必须存储在 IndexedDB 中，使用 Dexie.js 封装。
   导入 `src/lib/db/index.ts` 中的 `db` 实例。
4. **API 响应格式**：成功返回 `{ success: true, ...data }`，
   失败返回 `{ success: false, error: string, code: string }`。
5. **UI 组件**：使用 shadcn/ui 组件 (`src/components/ui/`)，不要自行创建基础 UI 组件。
6. **主题**：使用 CSS 变量中定义的淡蓝色主题（`--primary`, `--background` 等），
   通过 Tailwind 类名引用（如 `bg-primary`, `text-primary-foreground`）。
7. **开发命令**：
   - `npm run dev` — 启动开发服务器
   - `npx shadcn@latest add <component>` — 添加新 shadcn 组件
   - `npm run build` — 构建生产版本
8. **新增架构决策**：记录到 `开发日志/` 中。

## 关键约束

- ❌ 不使用云端数据库 — 所有数据存在 IndexedDB
- ❌ 不向前端暴露 API Key — Claude API 仅服务端调用
- ✅ 必须在 Windows (Chrome/Edge) 上正常运行
- ✅ Demo 范围：单用户、本地存储、淡蓝色主题
- ✅ 所有用户界面文本使用中文
