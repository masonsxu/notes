---
layout: home

hero:
  name: "Notes"
  text: "个人知识库"
  tagline: Markdown 材料与 HTML 报告的统一浏览入口 · 内容真源在仓库顶层 notes/ 与 reports/，本站点由它们构建而成
  actions:
    - theme: brand
      text: 浏览报告库
      link: /reports/
    - theme: alt
      text: HBM 材料导读
      link: /notes/hbm3e-hbm4e/

features:
  - title: 报告库 reports/
    details: 自包含 HTML 报告（工程蓝图主题），iframe 隔离渲染，保留图表动效与打印样式；新报告放入 reports/<主题域>/ 自动收录
    link: /reports/
    linkText: 打开报告库
  - title: 材料库 notes/
    details: Markdown 材料：调研底稿、核对留痕、证据摘录、想法与月志，直接由 VitePress 渲染
    link: /notes/hbm3e-hbm4e/
    linkText: 从 HBM 材料开始
  - title: 报告模板 templates/
    details: templates/report.html 是新报告起点：复制 → 替换占位内容 → 放入 reports/<主题域>/，无需登记
---
