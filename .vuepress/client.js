import { defineClientConfig } from 'vuepress/client'
import CopyLink from './components/CopyLink.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('CopyLink', CopyLink)
  },
})
