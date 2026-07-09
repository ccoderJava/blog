import { viteBundler } from '@vuepress/bundler-vite'
import { hopeTheme } from 'vuepress-theme-hope'

export default {
  bundler: viteBundler(),
  title: '聪聪碎碎念',
  description: '聪聪碎碎念 — Java 后端开发工程师的技术博客，专注支付行业、分布式系统、面试经验分享',
  base: '/',
  dest: './dist',
  lang: 'zh-CN',
  port: 8000,
  shouldPrefetch: false,
  pagePatterns: ['**/*.md', '!README.md', '!MIGRATION_PLAN.md', '!.vuepress', '!node_modules'],

  head: [
    // SEO meta
    ['meta', { name: 'Keywords', content: 'ccoderJava,ccoder,聪聪,Java,支付,后端开发,技术博客,面试' }],
    ['meta', { name: 'description', content: '聪聪碎碎念 — Java 后端开发工程师的技术博客，专注支付行业、分布式系统、面试经验分享' }],
    ['meta', { name: 'author', content: '聪聪' }],
    ['meta', { name: 'robots', content: 'index,follow' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],

    // Open Graph / Facebook
    ['meta', { property: 'og:title', content: '聪聪碎碎念' }],
    ['meta', { property: 'og:description', content: '聪聪碎碎念 — Java 后端开发工程师的技术博客，专注支付行业、分布式系统、面试经验分享' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://blog.ccoder.cc/' }],
    ['meta', { property: 'og:site_name', content: '聪聪碎碎念' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: '聪聪碎碎念' }],
    ['meta', { name: 'twitter:description', content: '聪聪碎碎念 — Java 后端开发工程师的技术博客，专注支付行业、分布式系统、面试经验分享' }],
    ['meta', { name: 'twitter:creator', content: '@ccoderJava' }],

    // JSON-LD Structured Data
    ['script', { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': '聪聪碎碎念',
        'url': 'https://blog.ccoder.cc/',
        'description': '聪聪碎碎念 — Java 后端开发工程师的技术博客，专注支付行业、分布式系统、面试经验分享',
        'author': {
          '@type': 'Person',
          'name': '聪聪',
          'url': 'https://github.com/ccoderJava'
        }
      })
    ],

    // Google Analytics (v4 gtag)
    ['script', { src: 'https://www.googletagmanager.com/gtag/js?id=G-40YT5YJMBG', async: true }],
    ['script', {},
      `window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-40YT5YJMBG');`],

    // Baidu Analytics
    ['script', {},
      `var _hmt = _hmt || [];
       (function() {
         var hm = document.createElement("script");
         hm.src = "https://hm.baidu.com/hm.js?921719b1f1d6a98cb84343b54b11c7dd";
         var s = document.getElementsByTagName("script")[0];
         s.parentNode.insertBefore(hm, s);
       })();`],
  ],

  theme: hopeTheme({
    hostname: 'https://blog.ccoder.cc/',
    author: {
      name: '聪聪',
      url: 'https://github.com/ccoderJava',
    },
    logo: '/favicon.ico',
    favicon: '/favicon.ico',

    // Navbar
    navbar: [
      { text: '文章', link: '/' },
      { text: '随笔', link: '/notes/' },
      { text: '标签', link: '/tag/' },
      { text: '关于我', link: '/about' },
    ],

    // Sidebar: not needed for blog layout
    sidebar: false,

    // Blog
    blog: {
      name: '聪聪',
      description: 'Java 后端开发工程师，专注支付行业与分布式系统',
    },

    // Dark mode
    darkmode: 'toggle',

    // Footer
    displayFooter: true,
    footer: '<a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2021021487号-1</a>',
    copyright: 'Copyright © 2021-present 聪聪',

    // Meta
    lastUpdated: true,

    // Page display info
    pageInfo: ['Author', 'Category', 'Tag', 'Date', 'ReadingTime', 'Word'],

    // Markdown enhancements
    markdown: {
      imgLazyload: true,
      imgSize: true,
      footnote: true,
      tasklist: true,
      align: true,
    },

    // Plugins
    plugins: {
      // Enable blog feature
      blog: {
        article: '/',
        // Auto-excerpt: shorter excerpts for compact cards
        excerptLength: 100,
      },

      // Comment (Giscus) - replaces custom GiscusComment.vue
      comment: {
        provider: 'Giscus',
        repo: 'ccoderJava/blog',
        repoId: 'R_kgDOGdSCog',
        category: 'Announcements',
        categoryId: 'DIC_kwDOGdSCos4DAy9Z',
        mapping: 'pathname',
        strict: false,
        reactionsEnabled: true,
        inputPosition: 'bottom',
        lang: 'zh-CN',
        lightTheme: 'light',
        darkTheme: 'dark',
      },

      // PhotoSwipe - replaces medium-zoom + viewer
      photoSwipe: true,

      // SEO
      seo: {
        ogImage: '/favicon.png',
        twitterCard: 'summary',
      },

      // Copy code button
      copyCode: {},

      // Feed / RSS
      feed: {
        atom: true,
        rss: true,
        json: true,
        count: 20,
        filter: ({ frontmatter }) => frontmatter.article !== false,
      },

      // PWA
      pwa: {
        themeColor: '#2196f3',
        favicon: '/favicon.ico',
      },

      // Search (full-text)
      slimsearch: {
        indexContent: true,
        locales: {
          '/': {
            placeholder: '搜索...',
          },
        },
      },

      // Sitemap
      sitemap: {},
    },
  }),
}
