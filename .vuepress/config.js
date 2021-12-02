const moment = require('moment');

module.exports = {
  host: 'localhost',
  port: 8000,
  dest: './dist',
  base: '/',
  head: [
    ['meta', { name: 'Keywords', content: 'ccoderJava,ccoder,聪聪的日志' }],
    ['meta', { name: 'description', content: '记录开发生活,ccoderJava,聪聪,ccoder' }],
    ['link', { rel: 'icon', href: '../public/favicon.ico' }]
  ],
  title: '聪聪的日志',
  description: '记录开发生活,ccoderJava,聪聪,ccoder',
  theme: '@vuepress/blog',
  themeConfig: {
    lastUpdated: true,
    dateFormat: 'YYYY-MM-DD hh:mm:ss',
    logo: './favicon.ico',
    nav: [
      { text: '首页', link: '/' },
      // { text: '分类', link: '/category/' },
      { text: '标签', link: '/tag/' },
    ],
    footer: {
      copyright: [
        {
          text: 'Powered by VuePress | Copyright © 2019-present',
          link: '',
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
      lengthPerPage: 5, // Maximum number of posts per page.
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
    '@vuepress/last-updated',
  ],
}
