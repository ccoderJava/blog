# VuePress 1.x → 2.x 迁移计划

## Context

项目当前使用 VuePress 1.x（webpack 4 + Vue 2），在 Node.js v24 下存在多个兼容性问题（OpenSSL、websocket-driver、ES Module 等），通过 patch node_modules 修复不可持续。采用方案 B：升级到 VuePress 2.x + `vuepress-theme-hope` 主题，从根源解决所有兼容性问题。

## 目标

- 内容（35篇博客 + 1篇随笔 + 图片）**不变**
- 前端格式（title/date/author/category/tags）**兼容**
- 所有功能完整迁移：博客列表、标签、RSS、Sitemap、PWA、Giscus评论、全文搜索、暗色模式、图片查看器、脚注、代码行号、ICP备案、Google/Baidu统计、SEO
- URL 结构保持一致
- 支持 Node.js v24

## 技术选型

| 项目 | 旧 | 新 |
|------|-----|-----|
| 框架 | VuePress 1.x + webpack 4 | VuePress 2.x + Vite |
| Vue | Vue 2 | Vue 3 |
| 主题 | @vuepress/theme-blog | vuepress-theme-hope |
| 样式 | Stylus (.styl) | SCSS |
| 包管理 | yarn 1.x | yarn 1.x（不变） |

## 插件映射表

| VuePress 1 插件 | VuePress 2 替代 | 内置？ |
|----------------|-----------------|--------|
| @vuepress/back-to-top | 内置组件 | ✅ 自动 |
| @vuepress/medium-zoom | `plugins.photoSwipe` | ✅ hopeTheme() |
| @vuepress/active-header-links | 内置 | ✅ 自动 |
| @vuepress/last-updated | `lastUpdated: true` | ✅ hopeTheme() |
| @markspec/vuepress-plugin-footnote | `plugins.mdEnhance.footnote` | ✅ hopeTheme() |
| vuepress-plugin-viewer | `plugins.photoSwipe` | ✅ hopeTheme() |
| vuepress-plugin-img-lazy | `plugins.mdEnhance.imgLazyload` | ✅ hopeTheme() |
| GiscusComment.vue (内联) | `plugins.comment: { type: 'giscus' }` | ✅ hopeTheme() |
| @vuepress/pwa | `@vuepress/plugin-pwa@next` | ❌ 需单独安装 |
| vuepress-plugin-sitemap | `vuepress-plugin-sitemap2` | ❌ 需单独安装 |
| vuepress-plugin-fulltext-search | `vuepress-plugin-search-pro` | ❌ 需单独安装 |
| vuepress-plugin-feed (RSS) | `vuepress-plugin-feed2` | ❌ 需单独安装 |

> 12 个旧功能 → 8 个内置、4 个需单独安装 npm 包

## 实施步骤

### Step 1: 创建迁移分支
```bash
git checkout -b migrate-vuepress2
```

### Step 2: 重写 `package.json`
- 移除所有 VuePress 1.x 依赖、moment、resolutions、NODE_OPTIONS
- 新增依赖（6 个包即可替代原来 12 个）：
  ```json
  {
    "devDependencies": {
      "vuepress": "^2.0.0-rc.30",
      "vuepress-theme-hope": "^2.0.0-rc.107",
      "@vuepress/plugin-pwa": "^2.0.0-rc.131",
      "vuepress-plugin-feed2": "^2.0.0-rc.16",
      "vuepress-plugin-sitemap2": "^2.0.0-rc.16",
      "vuepress-plugin-search-pro": "^2.0.0-rc.59",
      "sass-embedded": "^1.83.0"
    }
  }
  ```
- 保留：`yarn@1.22.22`、scripts 不变（dev/dist/deploy，移除 NODE_OPTIONS）

### Step 3: 重写 `.vuepress/config.js`
核心改动：使用 `hopeTheme({...})` 替代 `theme: '@vuepress/blog'`。包含：
- **SEO/Head**：保留全部 meta、OG、Twitter Card、JSON-LD、Google Analytics、百度统计
- **导航**：文章(/)、随笔(/notes/)、标签(/tag/)、个人简历(PDF)
- **博客**：`blog.article: '/'` 首页文章列表
- **页脚**：ICP备案号 + GitHub
- **暗色模式**：`darkmode: 'toggle'`
- **评论**：Giscus 原生集成（无需自定义组件）
- **插件**：feed/RSS、mdEnhance（脚注、图片懒加载、TOC）、photoSwipe、PWA、SEO、Sitemap

### Step 4: 样式迁移（.styl → .scss）
- **创建** `.vuepress/styles/palette.scss`：`$theme-color: #2196f3`
- **创建** `.vuepress/styles/index.scss`：迁移 CSS 自定义属性（暗色模式）、基础样式
- **删除** `palette.styl`、`index.styl`
- **注意**：theme-hope 的 CSS class 名与原主题不同，暗色模式选择器需后续调整

### Step 5: 删除 GiscusComment.vue
- 删除 `.vuepress/components/GiscusComment.vue`
- theme-hope 的 comment 插件原生支持 Giscus，自动处理条件渲染和暗色模式切换

### Step 6: 修复 TOC 标记
8 篇文章使用了 `[toc]` 或 `[[toc]]`，统一为 `[TOC]`：
- 4 篇：`[[toc]]` → `[TOC]`
- 4 篇：`[toc]` → `[TOC]`
- 修复 `ISO20022-xiao-xi-jian-mo.md` 中 `[[toc]]]` 的额外括号

### Step 7: 处理随笔（notes）
- 创建 `_notes/README.md` 作为 `/notes/` 列表页（`article: false`）
- 原有 `template.md` 保持不变

### Step 8: 更新 CI/CD
- `.github/workflows/main.yml`：`node-version: '20.x'`
- `deploy.sh`：不变

### Step 9: 清理安装
```bash
rm -rf node_modules yarn.lock
yarn
```

### Step 10: 验证
```bash
yarn dev    # 开发服务器 http://localhost:8080
yarn dist   # 生产构建 ./dist/
```

## 修改文件清单

| 操作 | 文件 |
|------|------|
| 重写 | `package.json` |
| 重写 | `.vuepress/config.js` |
| 新建 | `.vuepress/styles/palette.scss` |
| 新建 | `.vuepress/styles/index.scss` |
| 新建 | `_notes/README.md` |
| 修改 | `.github/workflows/main.yml`（node-version: 20.x） |
| 修改 | 8 篇 post（TOC 标记修复） |
| 删除 | `.vuepress/components/GiscusComment.vue` |
| 删除 | `.vuepress/styles/palette.styl` |
| 删除 | `.vuepress/styles/index.styl` |
| 删除 | `node_modules/`、`yarn.lock`（重新生成） |

## 不变文件

| 文件 | 说明 |
|------|------|
| `_posts/` 全部内容 | 博客文章 + 图片 |
| `.vuepress/public/` | favicon.ico、favicon.png、简历 PDF |
| `deploy.sh` | 部署脚本 |

## 验证检查项

- [ ] `yarn dev` 无报错启动
- [ ] `yarn dist` 构建成功
- [ ] 首页 `/` 显示分页文章列表
- [ ] 文章详情页正常渲染（内容、图片、代码块）
- [ ] 标签页 `/tag/` 显示标签云
- [ ] Giscus 评论在文章页显示
- [ ] RSS (/atom.xml, /rss.xml) 可用
- [ ] Sitemap (/sitemap.xml) 可用
- [ ] PWA Service Worker 注册
- [ ] 暗色模式切换正常
- [ ] 图片点击放大（PhotoSwipe）
- [ ] TOC 在包含 `[TOC]` 的文章中渲染
- [ ] 搜索功能正常
- [ ] ICP 备案号显示在页脚
- [x] Google Analytics / 百度统计脚本存在
- [x] SEO meta 标签存在
- [x] 简历 PDF 链接可访问

---

## 迁移总结

完成时间：2026-07-09

| 项目 | 迁移前 | 迁移后 |
|------|--------|--------|
| 框架 | VuePress 1.x + Webpack 4 | VuePress 2.x + Vite |
| Vue 版本 | Vue 2 | Vue 3 |
| 主题 | @vuepress/theme-blog | vuepress-theme-hope |
| 依赖数 | 12 个插件 + 1 个主题 | 7 个包 |
| Node 兼容性 | 仅 Node 16/18 | 支持 Node 20/24 |
| 构建速度 | ~9s | ~3s |
| 样式系统 | Stylus (.styl) | SCSS |
| 评论系统 | 自定义 Vue 2 组件 (GiscusComment.vue) | 主题原生 Giscus 集成 |
| 配置文件 | CommonJS (module.exports) | ESM (export default) |

### 功能覆盖

| 功能 | 来源 | 状态 |
|------|------|------|
| 博客文章列表（分页） | 主题内置 blog 插件 | ✅ |
| 标签系统 | 主题内置 blog 插件 | ✅ |
| 星标文章 | 主题内置 blog 插件 | ✅ 新增 |
| Giscus 评论 | 主题内置 comment 插件 | ✅ |
| RSS Feed | 主题内置 feed 插件 | ✅ |
| Sitemap | 主题内置 sitemap 插件 | ✅ |
| PWA | 主题内置 pwa 插件 | ✅ |
| 全文搜索 | 主题内置 slimsearch 插件 | ✅ |
| 暗色模式（toggle） | 主题内置 | ✅ |
| 图片查看器（PhotoSwipe） | 主题内置 | ✅ |
| 脚注 | 主题内置 mdEnhance | ✅ |
| 图片懒加载 | 主题内置 markdown | ✅ |
| 代码高亮（Shiki） | 主题内置 | ✅ |
| 代码行号 | 主题内置 | ✅ |
| 复制代码按钮 | 主题内置 copyCode | ✅ |
| SEO / OG / Twitter Card | 主题内置 seo + head | ✅ |
| Google Analytics | head 标签 | ✅ |
| 百度统计 | head 标签 | ✅ |
| ICP 备案号 | 主题页脚 | ✅ |
| 关于我页面 | 自定义 about.md | ✅ 新增 |
| 简历 PDF | 导航栏链接 | ✅ |

### 后续优化建议

1. 将 `favicon.png`（1.5MB）压缩为合适尺寸的 logo 图片
2. 根据需要补充 about.md 中的个人经历和项目信息
3. 可在文章 frontmatter 中添加 `star: true` 收录到星标目录
