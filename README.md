---
home: true
icon: home
title: 聪聪碎碎念
heroText: 聪聪碎碎念
tagline: Java 后端开发工程师，专注支付行业与分布式系统
actions:
  - text: 阅读博客
    link: /article/
    type: primary
  - text: 关于我
    link: /about
features:
  - title: 全文搜索
    icon: search
    details: 支持文章全文检索，快速定位所需内容
  - title: RSS 订阅
    icon: rss
    details: 支持 Atom / RSS / JSON Feed 三种格式
  - title: 评论互动
    icon: comment-dots
    details: 基于 GitHub Discussions 的 Giscus 评论系统
  - title: 暗色模式
    icon: palette
    details: 明暗主题一键切换，阅读更舒适
  - title: SEO 优化
    icon: layout
    details: OG / Twitter Card / JSON-LD 结构数据完整配置
  - title: PWA 离线
    icon: mobile-alt
    details: 支持离线访问，可安装到桌面
---

## 本地开发

```bash
yarn run dev     # 启动开发服务器 http://localhost:8000
yarn run dist    # 构建静态站点到 dist/
yarn run deploy  # 构建并推送到 GitHub Pages
```

## 技术栈

- **构建工具**: VuePress 2 + Vite
- **主题**: vuepress-theme-hope
- **内容**: Markdown + YAML frontmatter
- **托管**: GitHub Pages + 自定义域名 [blog.ccoder.cc](https://blog.ccoder.cc)

## 订阅

在 RSS 阅读器中添加以下地址订阅：

- **Atom** `https://blog.ccoder.cc/atom.xml` <CopyLink url="https://blog.ccoder.cc/atom.xml" />
- **RSS** `https://blog.ccoder.cc/rss.xml` <CopyLink url="https://blog.ccoder.cc/rss.xml" />
- **JSON Feed** `https://blog.ccoder.cc/feed.json` <CopyLink url="https://blog.ccoder.cc/feed.json" />
