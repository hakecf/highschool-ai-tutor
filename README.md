# 高中生学习助手 — AI 智能辅导

一款基于 AI 的高中生学习辅助 Web 应用。上传数学、物理、化学教材，AI 自动分析知识点结构，生成思维导图，并提供基于教材内容的智能问答。

## 功能

- **📚 教材分析**：上传 PDF/Word/图片教材，AI 自动提取章节结构和知识点层级
- **🧠 知识可视化**：交互式知识树 + 思维导图，系统化掌握知识体系
- **💬 智能问答**：基于教材内容，AI 流式回答学生问题
- **📝 章节总结**：每章自动生成总结、重点知识和难点解析
- **🔒 隐私优先**：所有数据存储在本地浏览器，不上传任何云端服务器

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

在项目根目录创建 `.env.local` 文件：

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

> 在 [console.anthropic.com](https://console.anthropic.com/) 获取 API Key。

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| 状态管理 | Zustand |
| 本地存储 | IndexedDB (Dexie.js) |
| AI | Claude API (Anthropic) |
| 文件解析 | pdf-parse / mammoth / Tesseract.js |
| 思维导图 | markmap |

## 项目结构

```
src/
├── app/
│   ├── (main)/          # 主界面布局
│   │   ├── textbooks/   # 教材管理
│   │   ├── knowledge/   # 知识浏览
│   │   ├── mindmap/     # 思维导图
│   │   ├── chat/        # AI 对话
│   │   └── settings/    # 设置
│   └── api/             # API 路由
├── components/          # UI 组件
├── lib/
│   ├── db/              # 数据库 CRUD
│   ├── ai/              # Claude 客户端
│   └── parsers/         # 文件解析器
├── stores/              # Zustand stores
├── hooks/               # Custom hooks
└── types/               # TypeScript 类型
```

## 文档

- [需求文档](docs/需求文档.md)
- [技术方案](docs/技术方案.md)
- [设计规范](docs/设计规范.md)
- [执行步骤](docs/执行步骤.md)
- [API 文档](docs/API接口文档.md)
