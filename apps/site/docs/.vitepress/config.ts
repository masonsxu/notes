import { defineConfig } from 'vitepress'
import manifest from './gen/manifest.json'

// 侧栏清单由 sync.mjs 生成（turbo 编排：dev/build 前必跑 sync）。
// 报告侧栏完全自动；笔记侧栏对 hbm3e-hbm4e 手策中文标签，其余目录自动分组。

const reports = manifest.reports ?? []
const notes = manifest.notes ?? []

const byDomain = {}
for (const r of reports) (byDomain[r.domain] ??= []).push(r)

const reportsSidebar = [
  { text: '报告库', items: [{ text: '总览', link: '/reports/' }] },
  ...Object.entries(byDomain).map(([domain, rs]) => ({
    text: domain,
    items: rs.map(r => ({ text: r.title, link: r.page })),
  })),
]

const noteLink = n => ({ text: n.title, link: n.route })
const groupByPrefix = (prefix, label, collapsed = true) => {
  const items = notes.filter(n => n.route.startsWith(prefix)).map(noteLink)
  return items.length ? { text: label, collapsed, items } : null
}

const notesSidebar = [
  {
    text: 'HBM 先进封装 + 测试数据',
    items: [
      { text: '材料导读', link: '/notes/hbm3e-hbm4e/' },
      { text: 'HBM3E / HBM4E 工艺调研', link: '/notes/hbm3e-hbm4e/HBM3E_HBM4E_工艺调研' },
      { text: '数据核对与落地评估报告', link: '/notes/hbm3e-hbm4e/数据核对与落地评估报告' },
    ].filter(item => notes.some(n => n.route === item.link || item.link === '/notes/hbm3e-hbm4e/')),
  },
  groupByPrefix('/notes/hbm3e-hbm4e/sources/', '来源证据层 · sources'),
  groupByPrefix('/notes/ideas/', '想法与练手 · ideas'),
  groupByPrefix('/notes/inbox/', '收件箱 · inbox'),
  groupByPrefix('/notes/log/', '月志 · log'),
].filter(Boolean)

export default defineConfig({
  lang: 'zh-CN',
  title: 'Notes',
  description: '个人知识库：Markdown 材料 + HTML 报告的统一站点',
  appearance: false,
  outDir: '../dist',
  rewrites: {
    'gen/notes/:rest*': 'notes/:rest*',
    'gen/reports/:rest*': 'reports/:rest*',
  },
  head: [['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }]],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '报告库', link: '/reports/' },
      { text: 'HBM 材料', link: '/notes/hbm3e-hbm4e/' },
    ],
    sidebar: {
      '/notes/': notesSidebar,
      '/reports/': reportsSidebar,
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    socialLinks: [{ icon: 'github', link: 'https://github.com/masonsxu/notes' }],
  },
})
