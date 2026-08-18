# 天策抖音图文生成器

一个开源的推文卡片与抖音图文生成工具。选择内容、背景和卡片样式后，可以直接导出 3:4 竖图，并生成配套发布文案。

在线体验：[tiance-tweet-card.leobai825.chatgpt.site](https://tiance-tweet-card.leobai825.chatgpt.site)

## 功能

- 1,020 条中文 AI 内容素材，支持分类、搜索和随机抽取
- 566 条公开历史推文，可搜索和改写
- 8 种 AI 主题改写结构
- 白色、黑色推文卡片
- 抖音 3:4 海报与纯卡片两种输出
- 自定义背景、本地上传或使用网络图片
- 鼠标拖动卡片，调整位置和大小
- 自动生成一句发布文案和 3 个话题标签
- 一键导出 PNG，全程在浏览器本地运行

## 安装

需要先安装 [Node.js 20 或更高版本](https://nodejs.org/)。

```bash
git clone https://github.com/Leobai03/tiance-tweet-card-generator.git
cd tiance-tweet-card-generator
npm install
npm run dev
```

启动后打开终端显示的本地网址，通常是：

```text
http://localhost:5173
```

## 构建

```bash
npm run build
npm run test:sites
```

构建产物位于 `dist/`。

## 自定义成自己的版本

- 修改头像：替换 `public/assets/tiance-avatar.jpg`
- 修改名字和账号：编辑 `src/App.jsx` 中的账号信息
- 修改历史内容：替换 `src/tweets.json`
- 修改 AI 素材库：编辑 `src/content-sources.json`
- 修改背景：替换 `public/backgrounds/` 中的图片并更新 `src/App.jsx`

## 内容与数据边界

- 工具本身不需要 OpenAI API Key，也不会上传用户编辑的正文。
- 历史推文来自公开内容归档，仅作为作者自己的内容素材使用。
- 卡片互动数字用于视觉排版演示，不代表真实社交平台数据。
- 发布内容前应人工检查事实、个人经历、收益表述和平台规则。
- 不要把他人的内容替换成自己的署名，也不要编造使用效果或收入结果。
- 仓库内图片素材请在商业使用前自行确认授权范围；你也可以替换成自己的图片。

## 技术栈

- React 19
- Vite 6
- html-to-image
- Phosphor Icons

## 许可证

代码使用 [MIT License](./LICENSE) 开源。
