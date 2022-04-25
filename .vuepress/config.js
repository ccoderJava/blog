const moment = require('moment');

module.exports = {
  host: 'localhost',
  port: 8000,
  dest: './dist',
  base: '/',
  head: [
    ['meta', { name: 'Keywords', content: 'ccoderJava,ccoder,聪聪的日志' }],
    ['meta', { name: 'description', content: '记录开发生活,ccoderJava,聪聪,ccoder' }],
    ['link', { rel: 'icon', href: './favicon.ico' }],
    // google analytic
    ['script', { src: "https://www.googletagmanager.com/gtag/js?id=G-40YT5YJMBG", async: true }],
    ['script', {},
      ` window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-40YT5YJMBG');`],
    // baidu 统计
    ['script', {},
      `var _hmt = _hmt || [];
               (function() {
                 var hm = document.createElement("script");
                 hm.src = "https://hm.baidu.com/hm.js?921719b1f1d6a98cb84343b54b11c7dd";
                 var s = document.getElementsByTagName("script")[0]; 
                 s.parentNode.insertBefore(hm, s);
               })();`],
  ],
  title: '聪聪的日志',
  description: '记录开发生活,ccoderJava,聪聪,ccoder',
  theme: '@vuepress/blog',
  themeConfig: {
    lastUpdated: "上次更新",
    dateFormat: 'YYYY-MM-DD hh:mm:ss',
    logo: './favicon.ico',
    nav: [
      { text: '首页', link: '/' },
      { text: '标签', link: '/tag/' },
      { text: '个人简历', target: '_blank', link: 'https://ccoderjava.github.io/chencong_java software engineer_4 years.pdf' },
    ],
    footer: {
      copyright: [
        {
          text: 'Powered by VuePress | 鄂ICP备2021021487号-1',
          link: 'https://beian.miit.gov.cn/',
        },
      ],
      contact: [
        {
          type: 'github',
          link: 'https://github.com/ccoderJava',
        },
      ],
    },
    directories: [
      {
        id: 'post',
        dirname: '_posts',
        path: '/',
        itemPermalink: '/:slug'
      },
    ],
    globalPagination: {
      sorter: (prev, next) => {
        const dayjs = require('dayjs')
        const prevTime = dayjs(prev.frontmatter.date)
        const nextTime = dayjs(next.frontmatter.date)
        const prevTop = (prev.frontmatter.top || 0) * 10000000000000
        const nextTop = (next.frontmatter.top || 0) * 10000000000000
        return (prevTop || prevTime) - (nextTop || nextTime) > 0 ? -1 : 1
      },
      prevText: '上一页', // Text for previous links.
      nextText: '下一页', // Text for next links.
      lengthPerPage: 8, // Maximum number of posts per page.
    },
    comment: {
      service: 'vssue',
      owner: 'ccoderJava',
      repo: 'blog',
      clientId: 'e840ebe73571b97960d3',
      clientSecret: 'f8db56f33f43d10612a08703ff4569b45b484110',
      proxy: 'http://blog.ccoder.cc/'
    },
    feed: {
      canonical_base: 'http://blog.ccoder.cc/',
    }
  },
  markdown: {
    //markdown 中代码块显示行号
    lineNumbers: true
  },
  plugins: [
    '@vuepress/back-to-top',
    '@vuepress/medium-zoom',
    '@vuepress/active-header-links',
    '@markspec/vuepress-plugin-footnote',
    'vuepress-plugin-viewer',
    '@vuepress/last-updated'
  ],
}
