module.exports = {
  host: 'localhost',
  port: 8000,
  dest: './dist',
  base: '/',
  head: [
    // ['script', { src: 'https://tajs.qq.com/stats?sId=66403914', charset: 'UTF-8' }]
  ],
  title: '聪聪的日志',
  description: '记录开发生活',
  theme: '@vuepress/blog',
  themeConfig: {
    dateFormat: 'YYYY-MM-DD',
    nav: [
      { text: '首页', link: '/' },
      { text: '分类', link: '/category/' },
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
          link: 'https://github.com/ccoderJava/blog',
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
      clientSecret: 'b8b02dfa474c62809a030e23ba63b4140946a0b6',
      proxy: 'http://blog.ccoder.cc/'
    },
    feed: {
      canonical_base: 'http://blog.ccoder.cc/',
    }
  },
  markdown: {
    lineNumbers: true
  },
  plugins: [
    '@vuepress/back-to-top',
    '@vuepress/medium-zoom',
    '@vuepress/active-header-links',
    '@markspec/vuepress-plugin-footnote',
    'vuepress-plugin-image'
  ],
}
