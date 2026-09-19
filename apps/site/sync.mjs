// 内容物化：顶层 notes/ + reports/ → 站点构建目录。生成物全部 gitignore，可随时重建。
// - notes/**/*.md → docs/gen/notes/**（README.md 镜像为 index.md，作为目录页路由）
// - reports/**    → docs/public/files/reports/**（iframe 的静态源，publicDir 保证原样拷贝）
// - 扫描 reports/ 自动生成嵌入页 docs/gen/reports/**、报告库总览页，以及侧栏清单 manifest.json
// 新增报告零登记：文件放入 reports/<域>/ 即被收录。
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, watch, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(siteDir, '../..');
const NOTES = join(repoRoot, 'notes');
const REPORTS = join(repoRoot, 'reports');
const DOCS = join(siteDir, 'docs');
const GEN = join(DOCS, 'gen');
const FILES = join(DOCS, 'public', 'files', 'reports');
const VPGEN = join(DOCS, '.vitepress', 'gen');

const firstHeading = md => (md.match(/^#\s+(.+?)\s*$/m) || [])[1] ?? '';
const htmlTitle = html => (html.match(/<title>([^<]+)<\/title>/) || [])[1] ?? '';

function walk(dir, exts, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p, exts, acc);
    else if (exts.some(e => name.name.endsWith(e))) acc.push(p);
  }
  return acc;
}

function sync() {
  for (const d of [GEN, FILES, VPGEN]) rmSync(d, { recursive: true, force: true });
  mkdirSync(GEN, { recursive: true });
  mkdirSync(FILES, { recursive: true });
  mkdirSync(VPGEN, { recursive: true });

  // 1. Markdown 材料镜像（README.md → index.md 作目录页）
  const notes = [];
  for (const src of walk(NOTES, ['.md'])) {
    const rel = relative(NOTES, src);
    const isReadme = rel.split('/').pop() === 'README.md';
    const destRel = isReadme ? join(dirname(rel), 'index.md') : rel;
    const dest = join(GEN, 'notes', destRel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
    const cleanRoute = '/notes/' + destRel.replace(/\.md$/, '').replace(/(^|\/)index$/, '');
    const fallback = rel.replace(/\.md$/, '').split('/').pop();
    const title = firstHeading(readFileSync(src, 'utf8')) || fallback;
    notes.push({ route: cleanRoute, title });
  }
  notes.sort((a, b) => a.route.localeCompare(b.route));

  // 2. HTML 报告静态镜像 + 嵌入页生成
  cpSync(REPORTS, FILES, { recursive: true });
  const reports = [];
  for (const src of walk(REPORTS, ['.html'])) {
    const rel = relative(REPORTS, src);
    const domain = dirname(rel).split('/').join('/');
    const file = rel.split('/').pop();
    const slug = file.replace(/\.html$/, '');
    const title = htmlTitle(readFileSync(src, 'utf8')) || slug;
    const page = `/reports/${domain}/${slug}`;
    const staticSrc = `/files/reports/${rel.split('/').join('/')}`;
    reports.push({ domain, file, slug, title, page, static: staticSrc });

    const embedDir = join(GEN, 'reports', domain);
    mkdirSync(embedDir, { recursive: true });
    writeEmbed(join(embedDir, `${slug}.md`), title, staticSrc);
  }
  reports.sort((a, b) => (a.domain + a.slug).localeCompare(b.domain + b.slug));

  // 3. 报告库总览页
  const byDomain = {};
  for (const r of reports) (byDomain[r.domain] ??= []).push(r);
  let idx = '---\ntitle: 报告库\n---\n\n# 报告库\n\n自包含 HTML 报告总览，由 sync.mjs 从顶层 `reports/` 自动生成。新报告放入 `reports/<主题域>/` 后重新构建即自动收录。\n';
  for (const [domain, rs] of Object.entries(byDomain)) {
    idx += `\n## ${domain}\n\n`;
    for (const r of rs) idx += `- [${r.title}](${r.page})\n`;
  }
  writeFileSync(join(GEN, 'reports', 'index.md'), idx);

  // 4. 侧栏清单（config.ts 读取）
  writeFileSync(join(VPGEN, 'manifest.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    notes,
    reports,
  }, null, 2));

  console.log(`[sync] notes 页 ${notes.length} · 报告 ${reports.length} · 已物化至 docs/gen 与 docs/public/files`);
}

function writeEmbed(dest, title, staticSrc) {
  writeFileSync(dest, `---
title: ${title}
layout: page
pageClass: report-full
---

<HtmlFrame src="${staticSrc}" title="${title}" />
`);
}

sync();

if (process.argv.includes('--watch')) {
  let timer = null;
  const rerun = () => { clearTimeout(timer); timer = setTimeout(() => { try { sync(); } catch (e) { console.error('[sync]', e.message); } }, 300); };
  watch(NOTES, { recursive: true }, rerun);
  watch(REPORTS, { recursive: true }, rerun);
  console.log('[sync] watch 模式：notes/ 与 reports/ 变更将自动重新物化');
}
