<template>
  <span class="copy-link" @click="copy" :title="copied ? '已复制' : '复制'">{{ copied ? '✓' : '⧉' }}</span>
</template>

<script>
export default {
  props: { url: String },
  data() { return { copied: false } },
  methods: {
    copy() {
      navigator.clipboard.writeText(this.url).then(() => {
        this.copied = true
        setTimeout(() => { this.copied = false }, 2000)
      })
    },
  },
}
</script>

<style scoped>
.copy-link {
  cursor: pointer;
  font-size: 0.8em;
  margin-left: 0.25em;
  opacity: 0.65;
  transition: opacity 0.2s;
}
.copy-link:hover { opacity: 1; }
</style>
