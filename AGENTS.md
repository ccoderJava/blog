# AGENTS.md

## 命令

- `yarn run dev` — 启动本地开发服务器 <http://localhost:8000>
- `yarn run dist` — 构建静态站点到 `dist/`
- `yarn run deploy` — 构建并推送产物到 GitHub Pages 仓库

**必须**使用 `yarn`（v1），禁止使用 `npm`。`.yarnrc` 已设置 `--ignore-engines true`。

## 架构

- 基于 **VuePress 2** 的静态博客，主题使用 `vuepress-theme-hope`
- 配置文件：`.vuepress/config.js`（bundler、主题、插件、导航栏、统计）
- 内容目录：`_posts/`（markdown 文章，按年份子目录组织）、`_notes/`（非博客页面）
- 构建产物：`dist/`（已 gitignore，由 `yarn run dist` 生成）

## 内容编写

新文章放在 `_posts/` 下，使用以下 frontmatter：

```yaml
---
title: 文章标题
date: YYYY-MM-DD HH:mm:ss
author: 聪聪
category: 分类名
tags:
  - 标签1
  - 标签2
---
```

非博客页面（如 `about.md`、`_notes/`）需在 frontmatter 中设置 `article: false` 和 `comment: false`。

## 部署

- **本地部署**：`yarn run deploy` 构建站点后将 `dist/` 强制推送到 `ccoderJava/ccoderJava.github.io.git master`（GitHub Pages）。
- **CI 部署**：推送到 `master` 分支时触发 GitHub Actions 自动构建部署。需要 secret `BLOG_ACCESS_TOKEN`。Node 20.x。
