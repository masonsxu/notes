<script setup>
const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: '报告' },
})
</script>

<template>
  <div class="htmlframe">
    <div class="htmlframe-bar">
      <span class="htmlframe-dot" aria-hidden="true"></span>
      <span class="htmlframe-title">{{ title }}</span>
      <a class="htmlframe-open" :href="src" target="_blank" rel="noopener">新窗口打开 ↗</a>
    </div>
    <iframe class="htmlframe-view" :src="src" :title="title" loading="lazy"></iframe>
  </div>
</template>

<style scoped>
/* 报告画布：吃满导航与侧栏之外的剩余空间，高度贴近视口底部 */
.htmlframe {
  background: var(--color-report-paper, #f3f6fa);
  border-bottom: 1px solid var(--vp-c-divider);
}
.htmlframe-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  height: 44px;
  padding: 0 14px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.htmlframe-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.htmlframe-title {
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.htmlframe-open {
  margin-left: auto;
  font-size: 0.78rem;
  white-space: nowrap;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
}
.htmlframe-view {
  display: block;
  width: 100%;
  height: calc(100vh - var(--vp-nav-height) - 45px);
  min-height: 480px;
  border: 0;
  background: var(--color-report-paper, #f3f6fa);
}
@media (max-width: 959px) {
  .htmlframe-view {
    height: calc(100vh - 45px);
  }
}
</style>
