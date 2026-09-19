// opencode 进阶与实战 — 建立工作体系，完成你的第一个项目（课程第二讲）
// 与入门篇同一设计系统：暖橙浅底 + 深色封面/结尾，终端窗口母题。运行: bun build.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const OUT = path.join(__dirname, "opencode-进阶与实战.pptx");
const W = 13.33, H = 7.5, M = 0.55, CW = 13.33 - 2 * 0.55;

const BG = "FFFFFF", INK = "2B2119", BODY = "4C4138", MUT = "8A7B6E",
  LINEC = "E9DCCE", CARD = "FDF1EC", CARDN = "F7F2ED", TINT = "FBE4D6",
  DARK = "211913", DCARD = "30251B", DINK = "F7F0E8", DMUT = "D3C2B0", DLINE = "4A3826", GREY = "9C8D80",
  OR = "E8590C", ORB = "EB6C36", ORD = "C2410C";
const F = "Microsoft YaHei", MONO = "Consolas";
const TOTAL = 22;

const P = new pptxgen();
P.layout = "LAYOUT_WIDE";
P.author = "masonsxu";
P.title = "opencode 进阶与实战：建立工作体系，完成你的第一个项目";

const sh = () => ({ type: "outer", color: "3A2A1C", blur: 7, offset: 2, angle: 90, opacity: 0.1 });

function sl(dark = false) { const s = P.addSlide(); s.background = { color: dark ? DARK : BG }; return s; }
function T(s, txt, x, y, w, h, o = {}) {
  s.addText(txt, {
    x, y, w, h, margin: 0, fontFace: o.mono ? MONO : F,
    fontSize: o.fs || 14, color: o.c || (o.dark ? DINK : BODY), bold: !!o.b,
    align: o.a || "left", valign: o.v || "top",
    lineSpacingMultiple: o.lsm, paraSpaceAfter: o.psa, charSpacing: o.cs,
  });
}
// 多段文本：每项一段（一 run 一段，规避 pPr 陷阱）；把简写 c 映射为 pptxgenjs 的 color
function PG(items, base = {}) {
  return items.map((it, i) => {
    const { c, ...rest } = it.o || {};
    return { text: it.t, options: { fontFace: base.mono ? MONO : F, color: c, breakLine: i < items.length - 1 || undefined, ...rest } };
  });
}
function head(s, kick, title, sub) {
  if (kick) T(s, kick, M, 0.4, CW, 0.3, { fs: 13, b: 1, c: OR, cs: 1 });
  T(s, title, M, 0.7, CW, 0.6, { fs: 28, b: 1, c: INK });
  if (sub) T(s, sub, M, 1.34, CW, 0.36, { fs: 13.5, c: MUT });
}
function foot(s, i, dark = false) {
  T(s, `opencode 进阶与实战 · ${String(i).padStart(2, "0")} / ${TOTAL}`, 9.2, 7.12, 3.58, 0.26, { fs: 12, c: dark ? "6E5A47" : "CDBFB0", a: "right" });
}
function card(s, x, y, w, h, o = {}) {
  s.addShape(P.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: o.r ?? 0.09,
    fill: { color: o.fill || CARDN, transparency: o.t || 0 },
    line: o.noLine ? { color: o.fill || CARDN, width: 0 } : { color: o.lineC || LINEC, width: o.lw || 0.75 },
    shadow: o.flat ? undefined : sh(),
  });
}
function arrow(s, x1, y1, x2, y2, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.max(Math.abs(x2 - x1), 0.001), h = Math.max(Math.abs(y2 - y1), 0.001);
  s.addShape(P.shapes.LINE, {
    x, y, w, h, flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.c || OR, width: o.w || 1.5, dashType: o.d ? "dash" : "solid", endArrowType: o.noHead ? "none" : "triangle", beginArrowType: o.back ? "triangle" : "none" },
  });
}
function chip(s, txt, x, y, w, h, o = {}) {
  s.addShape(P.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: Math.min(h / 2, 0.25), fill: { color: o.fill || CARD }, line: o.lineC ? { color: o.lineC, width: 1 } : { color: o.fill || CARD, width: 0 } });
  T(s, txt, x + 0.08, y, w - 0.16, h, { fs: o.fs || 12.5, b: o.b !== false, c: o.c || ORD, a: "center", v: "middle" });
}
function numDot(s, n, x, y, d, o = {}) {
  s.addShape(P.shapes.OVAL, { x, y, w: d, h: d, fill: { color: o.fill || OR }, line: { color: o.fill || OR, width: 0 } });
  T(s, String(n), x, y, d, d, { fs: o.fs || 13, b: 1, c: "FFFFFF", a: "center", v: "middle" });
}
function term(s, x, y, w, h, title, opts = {}) {
  card(s, x, y, w, h, { fill: DCARD, lineC: DLINE, lw: 1, r: 0.1 });
  ["5A4630", "8A6A3C", ORB].forEach((c, i) => s.addShape(P.shapes.OVAL, { x: x + 0.22 + i * 0.26, y: y + 0.18, w: 0.12, h: 0.12, fill: { color: c }, line: { color: c, width: 0 } }));
  if (title) T(s, title, x + 1.1, y + 0.12, w - 1.3, 0.26, { fs: 12.5, b: 1, c: DMUT });
  return { x: x + 0.3, y: y + 0.5, w: w - 0.6, h: h - 0.7 };
}
function checkRow(s, txt, x, y, w, o = {}) {
  s.addShape(P.shapes.ROUNDED_RECTANGLE, { x, y: y + 0.03, w: 0.17, h: 0.17, rectRadius: 0.03, fill: { color: o.fill || "FFFFFF" }, line: { color: o.box || ORB, width: 1.25 } });
  if (o.done) T(s, "✓", x - 0.015, y - 0.025, 0.2, 0.24, { fs: 12, b: 1, c: OR, a: "center", v: "middle" });
  T(s, txt, x + 0.28, y - 0.02, w - 0.28, 0.3, { fs: o.fs || 13, c: o.c || BODY, b: o.b });
}

// ================= S1 封面 =================
{
  const s = sl(true);
  T(s, "02", 9.7, 0.5, 3.2, 3.0, { fs: 150, b: 1, c: "2E241B", a: "right", mono: true });
  T(s, "OPENCODE 系列课程 · 第二讲", M, 1.15, 9, 0.32, { fs: 15, b: 1, c: ORB, cs: 2 });
  T(s, "opencode 进阶与实战", M, 1.55, 11.5, 1.15, { fs: 54, b: 1, c: DINK });
  T(s, "建立工作体系，完成你的第一个项目", M, 2.85, 10.5, 0.5, { fs: 22, c: DMUT });
  const t = term(s, M, 3.85, 8.3, 2.15, "rc-reports — 下周一早上");
  T(s, PG([
    { t: "❯ 跑一遍 rc 周报 skill，处理 data/ 下新的 rc_*.csv", o: { c: DINK, fs: 14.5, b: 1 } },
    { t: "  skill batch-rc-report · reading 4 files · stats · histogram", o: { c: DMUT, fs: 12.5, mono: true } },
    { t: "✓ reports/report-w35-w38.md 已生成", o: { c: ORB, fs: 14, b: 1 } },
  ]), t.x, t.y + 0.05, t.w, t.h, { lsm: 1.35 });
  T(s, "上过《opencode 入门》　·　课堂 60 分钟 ＋ 课后 2–2.5 小时　·　练完交付你自己的 SKILL.md", M, 6.55, 12.23, 0.35, { fs: 14, c: DMUT });
  s.addNotes("开场呼应入门篇结尾的两个问题——本课回答它们：体系化记录 + 流程沉淀，最后落到一个完整项目。");
}

// ================= S2 课程定位与节奏 =================
{
  const s = sl();
  head(s, "开场 · 课程定位", "一份文档，两种读法", "课堂 60 分钟跟讲；课后 2–2.5 小时把第四部分完整跑一遍——文档就是操作手册");
  const defs = [
    ["写给谁", "上过入门篇的同学——会 Plan / Build、用过 /init，想从“会把一件事交给 agent”走到“独立做完一个项目”。"],
    ["前置要求", "三件套就位（opencode / VS Code / Git）＋ 课堂发放的练习素材包：materials/data/ 四个 CSV。"],
    ["读完能做什么", "建立两个可持续增值的工作体系（Markdown 汇报项目、skill 工作流）；独立完成“数据 → 统计 → 图表 → 报告”；同类任务一句话复跑。"],
  ];
  defs.forEach((d, i) => {
    const x = M + i * 4.13;
    card(s, x, 1.85, 3.93, 2.5);
    chip(s, d[0], x + 0.32, 2.08, 1.5, 0.4, { fs: 13.5 });
    T(s, d[1], x + 0.32, 2.62, 3.3, 1.6, { fs: 12.5, lsm: 1.25 });
  });
  // 60 分钟节奏条（按分钟等比分段 5/10/10/25/10）
  T(s, "60 分钟课堂节奏", M, 4.7, 5, 0.35, { fs: 15, b: 1, c: INK });
  const segs = [
    ["0–5", "从会用到体系", 5, "F3E3D8"], ["5–15", "理念一 · 汇报项目", 10, "F6D9C6"],
    ["15–25", "理念二 · skill 五步法", 10, "F3C5A5"], ["25–50", "实战 · 接触电阻项目", 25, OR],
    ["50–60", "方法论 ＋ 课后作业", 10, "F3C5A5"],
  ];
  const bx = M, bw = 12.23, by = 5.15, bh = 0.55;
  let cx = bx;
  segs.forEach((g, gi) => {
    const w = bw * g[2] / 60;
    s.addShape(P.shapes.RECTANGLE, { x: cx, y: by, w: w - 0.04, h: bh, fill: { color: g[3] }, line: { color: g[3], width: 0 } });
    T(s, g[0], cx, by + 0.06, w - 0.04, 0.24, { fs: 11.5, b: 1, c: g[2] === 25 ? "FFFFFF" : ORD, a: "center" });
    // 第 2 段（理念一）标签下移一行；第 1 段（最窄）标签左对齐并向右延展，避免错位与碰撞
    const ly = gi === 1 ? by + 1.02 : by + 0.66;
    const lw2 = gi === 0 ? w + 0.95 : Math.min(w + 0.15, 12.78 - cx);
    T(s, g[1], cx, ly, lw2, 0.32, { fs: 11.5, c: g[2] === 25 ? ORD : MUT, b: g[2] === 25, a: "left" });
    cx += w;
  });
  T(s, "实战占一半时间：M1 骨架 5′ · M2 指令＋审核＋纠偏 10′ · M3 异常 5′ · M4 报告沉淀 5′；课后完整跑一遍＋互查。", M, 6.45, 12.23, 0.35, { fs: 12.5, c: MUT });
  foot(s, 2);
  s.addNotes("时间条按真实分钟等比：实战 25 分钟是主体。课后自学重点是第四部分完整跑一遍。");
}

// ================= S3 从会用到体系 =================
{
  const s = sl();
  head(s, "第一部分 · 从会用到体系", "体系化改变三样东西", "“会用”的状态：每次任务从零开始——提问临时想、规范靠记忆、经验留在脑子里");
  const rows = [
    ["提问", "每次临时想", "口径在 AGENTS.md，新任务一句话启动"],
    ["规范", "靠记忆、口头传", "在项目文件里，自动生效"],
    ["经验", "留在个人脑中", "沉淀成模板 / skill，可复用可共享"],
  ];
  const th = { b: 1, color: INK, fill: { color: CARD } };
  s.addTable([
    [{ text: "", options: { fill: { color: CARD } } }, { text: "没有体系", options: { ...th, color: MUT } }, { text: "有体系", options: { ...th, color: ORD } }],
    ...rows.map(r => [{ text: r[0], options: { b: 1, color: INK } }, r[1], r[2]]),
  ], {
    x: M, y: 1.95, w: 12.23, colW: [1.6, 3.6, 7.03], rowH: [0.42, 0.66, 0.66, 0.66],
    fontFace: F, fontSize: 14, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.08,
  });
  T(s, "体系改变的是：记录的格式、沉淀的位置、复用的方式。", M, 5.0, 12.23, 0.45, { fs: 17, b: 1, c: INK });
  const map = [["二", "理念一\nMarkdown 汇报项目"], ["三", "理念二\nskill 五步法"], ["四", "实战\n接触电阻项目"], ["五", "方法论底座"], ["六", "团队与课后"]];
  map.forEach((m, i) => {
    const x = M + i * 2.47, w = 2.31;
    card(s, x, 5.6, w, 1.25, { flat: true });
    T(s, "第" + m[0] + "部分", x + 0.2, 5.74, w - 0.4, 0.28, { fs: 11.5, b: 1, c: OR });
    T(s, m[1], x + 0.2, 6.04, w - 0.4, 0.7, { fs: 12.5, b: 1, c: INK, lsm: 1.15 });
    if (i < 4) arrow(s, x + w, 6.22, x + 2.47, 6.22, { c: ORB, w: 1.5 });
  });
  foot(s, 3);
  s.addNotes("入门篇结束时你会把一件事交给 agent；本课把三行差距逐行落地。");
}

// ================= S4 为什么是 Markdown =================
{
  const s = sl();
  head(s, "第二部分 · 理念一：Markdown 汇报项目", "为什么是 Markdown", "月底写周报的真实过程：翻聊天记录、翻邮件、回忆三周前——每次总结都重新想一遍");
  const th = { b: 1, color: INK, fill: { color: CARD } };
  const hot = t => ({ text: t, options: { color: ORD, b: true } });
  s.addTable([
    [{ text: "维度", options: { ...th } }, { text: "Word / PPT", options: { ...th } }, { text: "Excel", options: { ...th } }, { text: "Markdown", options: { ...th, color: ORD } }],
    ["agent 直接读", "格式噪声重", "结构受限", hot("纯文本＋结构标记，直接读")],
    ["agent 直接写", "困难", "困难", hot("直接写，可套模板")],
    ["逐行对比（diff）", "二进制不可比", "不可比", hot("天然支持")],
    ["跨层级聚合（日→周→月）", "复制粘贴", "手动透视", hot("一句话聚合")],
  ], {
    x: M, y: 1.95, w: 12.23, colW: [3.0, 2.6, 2.3, 4.33], rowH: [0.44, 0.62, 0.62, 0.62, 0.62],
    fontFace: F, fontSize: 13.5, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.08,
  });
  card(s, M, 5.75, 12.23, 1.05, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "Markdown 是 agent 世界的通用交换格式：你交给它的素材、它还给你的成品，是同一种结构化纯文本。", M + 0.4, 6.05, 11.5, 0.5, { fs: 16.5, b: 1, c: ORD });
  T(s, "agent 能接管汇报的前提只有一个：你的记录以它能读写的方式存在。", M, 5.3, 12.23, 0.35, { fs: 13.5, c: MUT });
  foot(s, 4);
  s.addNotes("四行对比只讲一件事：读写、对比、聚合三个环节 Markdown 全通。");
}

// ================= S5 项目结构与自动生长 =================
{
  const s = sl();
  head(s, "第二部分 · 理念一：Markdown 汇报项目", "一次搭建，汇报自动生长", "你只写 daily/ 一个输入，周报月报是“按模板聚合”，不是“重新写”");
  // 左：目录树
  const t = term(s, M, 1.85, 5.5, 4.55, "work-reports/ — 工作汇报项目");
  T(s, PG([
    { t: "work-reports/", o: { c: ORB, fs: 14, b: 1, mono: true, psa: 4 } },
    { t: "├── AGENTS.md      汇报规范：格式·维度·口径·红线", o: { c: DINK, fs: 12, mono: true, psa: 3 } },
    { t: "├── templates/     模板：日报/周报/月报/季度", o: { c: DINK, fs: 12, mono: true, psa: 3 } },
    { t: "├── daily/         每日记录（你唯一的日常输入）", o: { c: ORB, fs: 12, b: 1, mono: true, psa: 3 } },
    { t: "│   ├── 2026-08-11.md", o: { c: DMUT, fs: 12, mono: true, psa: 3 } },
    { t: "│   └── 2026-08-12.md", o: { c: DMUT, fs: 12, mono: true, psa: 3 } },
    { t: "├── weekly/        周报（agent 聚合生成）", o: { c: DINK, fs: 12, mono: true, psa: 3 } },
    { t: "├── monthly/       月报 / 季度汇报（再聚合）", o: { c: DINK, fs: 12, mono: true, psa: 3 } },
    { t: "└── assets/        图表与截图", o: { c: DINK, fs: 12, mono: true } },
  ]), t.x, t.y + 0.05, t.w, t.h, { lsm: 1.15 });
  // 右：聚合流
  const rx = 6.85, rw = 2.9;
  const lvl = (y, name, sub, hot) => {
    card(s, rx + 1.15, y, rw, 0.85, hot ? { fill: CARD, lineC: ORB, lw: 1.5 } : {});
    T(s, name, rx + 1.3, y + 0.12, rw - 0.3, 0.34, { fs: 14.5, b: 1, c: hot ? ORD : INK });
    T(s, sub, rx + 1.3, y + 0.46, rw - 0.3, 0.3, { fs: 11, c: MUT });
  };
  lvl(1.9, "daily/ 每日记录", "几分钟的事实 · 唯一输入", true);
  arrow(s, rx + 1.15 + rw / 2, 2.75, rx + 1.15 + rw / 2, 3.25, { w: 1.75 });
  T(s, "一句话：\n汇总本周", rx + 4.2, 2.68, 1.5, 0.6, { fs: 11.5, c: ORD, b: 1, lsm: 1.15 });
  lvl(3.25, "weekly/ 周报", "agent 按模板聚合");
  arrow(s, rx + 1.15 + rw / 2, 4.1, rx + 1.15 + rw / 2, 4.6, { w: 1.75 });
  lvl(4.6, "monthly/ 月报 · 季度", "再聚合，层层向上");
  // 规范继承
  card(s, rx - 0.5, 2.6, 1.3, 2.1, { fill: "FFFFFF", lineC: ORB, lw: 1, flat: true });
  T(s, "AGENTS.md\n+ templates/", rx - 0.45, 2.95, 1.2, 0.8, { fs: 10.5, b: 1, c: ORD, a: "center", lsm: 1.2 });
  T(s, "写一次", rx - 0.45, 3.85, 1.2, 0.3, { fs: 10.5, c: MUT, a: "center" });
  [3.67, 5.02].forEach(y => arrow(s, rx - 0.5 + 1.3, y, rx + 1.15, y, { c: ORB, w: 1.25, d: true }));
  T(s, "规范在每一层\n自动继承", rx + 4.2, 3.6, 1.5, 0.6, { fs: 11.5, c: MUT, lsm: 1.15 });
  T(s, "第一天就让这个目录成为 Git 仓库：每次周报都是一个存档点，改错随时回退。", rx - 0.5, 5.85, 6.28, 0.6, { fs: 12.5, c: BODY, lsm: 1.25 });
  foot(s, 5);
  s.addNotes("左边目录一次搭好；右边讲清“唯一输入是 daily/，其余都是聚合产物”，规范沿虚线自动继承。");
}

// ================= S6 六步搭建 =================
{
  const s = sl();
  head(s, "第二部分 · 理念一：Markdown 汇报项目", "从零搭建：六步，半天，长期生效", "");
  const steps = [
    ["① 建目录、集素材", "建好目录结构，近期零散记录集中放进 daily/"],
    ["② /init 生成须知", "在 opencode 里打开项目，得到 AGENTS.md 初稿"],
    ["③ 人工调整", "补汇报口径、岗位术语、红线"],
    ["④ 沉淀模板", "从历史记录归纳周报模板，修一版存 templates/"],
    ["⑤ 日常运转", "每天几分钟写 daily/；周五一句话生成周报"],
    ["⑥ 持续调优", "不满意 → 改模板和 AGENTS.md，不是重新交代"],
  ];
  steps.forEach((st, i) => {
    const x = M + (i % 3) * 4.13, y = 1.8 + Math.floor(i / 3) * 1.28;
    card(s, x, y, 3.93, 1.12, { flat: true });
    T(s, st[0], x + 0.28, y + 0.14, 3.4, 0.32, { fs: 13.5, b: 1, c: ORD });
    T(s, st[1], x + 0.28, y + 0.5, 3.4, 0.5, { fs: 11.5, c: BODY, lsm: 1.15 });
  });
  // 关键 prompt
  const t1 = term(s, M, 4.55, 5.95, 1.6, "步骤 ④ · 归纳周报模板");
  T(s, "❯ 读取 daily/ 全部工作记录，归纳一份周报模板：本周完成、进行中（标进度百分比）、下周计划、风险与求助。先给我看结构，确认后写入 templates/weekly.md。", t1.x, t1.y, t1.w, t1.h, { c: DINK, fs: 12, lsm: 1.25 });
  const t2 = term(s, 6.83, 4.55, 5.95, 1.6, "步骤 ⑤ · 每周五的一句话");
  T(s, "❯ 按 templates/weekly.md 汇总 daily/ 本周的记录，生成本周周报到 weekly/。", t2.x, t2.y, t2.w, t2.h, { c: DINK, fs: 12, lsm: 1.25 });
  s.addShape(P.shapes.RECTANGLE, { x: 0, y: 6.35, w: 13.33, h: 0.82, fill: { color: CARD }, line: { color: CARD, width: 0 } });
  T(s, PG([
    { t: "维度从哪来：", o: { b: 1, c: INK, fs: 13 } },
    { t: "每次调整写回模板或 AGENTS.md，不是只改这一份——教一次，永久生效；记录随生态升值，越早开始复利越长。", o: { c: ORD, fs: 13, b: 1 } },
  ]), M, 6.55, 12.23, 0.5, { lsm: 1.3 });
  foot(s, 6);
  s.addNotes("六步是操作顺序；两条 prompt 可直接照抄。维度靠项目“教”出来，不是 agent 天生懂。");
}

// ================= S7 四条路对比 =================
{
  const s = sl();
  head(s, "第三部分 · 理念二：把重复手动任务沉淀为 skill", "同一件事，四条路", "典型任务：打开 Excel → 按口径统计 → 截图 → 写结论，单次 20 分钟；30 个文件一整天，口径一变全部重做");
  const th = { b: 1, color: INK, fill: { color: CARD } };
  const hot = t => ({ text: t, options: { color: ORD, b: true, fill: { color: CARD } } });
  const nor = t => ({ text: t, options: {} });
  s.addTable([
    [{ text: "维度", options: { ...th } }, { text: "纯人工", options: { ...th } }, { text: "自学函数/脚本", options: { ...th } }, { text: "找 IT 开发", options: { ...th } }, { text: "agent 工作流 skill", options: { ...th, color: ORD } }],
    [nor("首次上手"), nor("无"), nor("数小时～数天"), nor("需求沟通＋数周排期"), hot("半天")],
    [nor("单次执行"), nor("每次 20 分钟起"), nor("分钟级，人要盯"), nor("自动，但改不动"), hot("一句话，人只审总表")],
    [nor("口径变更"), nor("全部重做"), nor("改公式 / 改代码"), nor("提需求等排期"), hot("说一句，agent 更新 skill")],
    [nor("经验沉淀"), nor("脑中＋SOP 文档"), nor("代码里，难读"), nor("别人的代码库"), hot("skill 里，自然语言可读")],
    [nor("团队共享"), nor("口口相传"), nor("发文件"), nor("走 IT 流程"), hot("拷走文件夹即共享")],
  ], {
    x: M, y: 1.95, w: 12.23, colW: [1.75, 2.06, 2.66, 2.66, 3.1], rowH: [0.44, 0.6, 0.6, 0.6, 0.6, 0.6],
    fontFace: F, fontSize: 12.5, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.07,
  });
  card(s, M, 5.85, 12.23, 0.95, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "四条旧路的共同问题：业务口径（只有你懂）和执行能力（程序才有）始终分家——大模型 ＋ agent 第一次把它们合到一起。", M + 0.4, 6.1, 11.5, 0.5, { fs: 14.5, b: 1, c: ORD });
  foot(s, 7);
  s.addNotes("本页是理念二的核心论证：逐列对比后落到最后一句话——口径与执行力的合并。");
}

// ================= S8 五步法飞轮 =================
{
  const s = sl();
  head(s, "第三部分 · 理念二：把重复手动任务沉淀为 skill", "五步法：一次搭建 ＋ 持续飞轮", "");
  // 上：一次性搭建
  T(s, "一次性搭建（半天）", M, 1.75, 3.5, 0.32, { fs: 13.5, b: 1, c: MUT });
  const setup = [
    ["① 建项目", "你 · 历史材料全部迁入"],
    ["② /init 通读", "agent · 生成 AGENTS.md 初稿"],
    ["③ 人工调整", "你 · 补口径 · 边界 · 红线"],
  ];
  setup.forEach((n, i) => {
    const x = M + i * 2.9, hot = i === 2;
    card(s, x, 2.12, 2.55, 1.1, hot ? { fill: CARD, lineC: ORB, lw: 2.25 } : {});
    T(s, n[0], x + 0.22, 2.26, 2.15, 0.34, { fs: 14, b: 1, c: hot ? ORD : INK });
    T(s, n[1], x + 0.22, 2.62, 2.15, 0.45, { fs: 11, c: MUT });
    if (i < 2) arrow(s, x + 2.55, 2.67, x + 2.9, 2.67, { c: ORB, w: 1.5 });
  });
  chip(s, "③ 是质量决定性一步：后续所有产出取决于这步做得多细", 9.6, 2.35, 3.18, 0.64, { fill: "FFFFFF", lineC: ORB, c: ORD, fs: 11.5 });
  arrow(s, 7.62, 3.22, 4.7, 3.92, { c: ORB, w: 1.75 });
  // 下：飞轮
  T(s, "持续运转的飞轮", M, 3.55, 3.5, 0.32, { fs: 13.5, b: 1, c: MUT });
  const fly = [
    ["④ 沉淀 skill", "agent · 跑通的工作流写成 SKILL.md", 3.2],
    ["⑤ 一句话执行", "agent · 循环批量跑完，你审总表", 7.0],
  ];
  fly.forEach(n => {
    card(s, n[2], 3.92, 3.0, 1.1);
    T(s, n[0], n[2] + 0.22, 4.06, 2.6, 0.34, { fs: 14, b: 1, c: INK });
    T(s, n[1], n[2] + 0.22, 4.42, 2.6, 0.45, { fs: 11, c: MUT });
  });
  arrow(s, 6.2, 4.47, 7.0, 4.47, { c: ORB, w: 1.75 });
  // 飞轮回流
  arrow(s, 8.5, 5.02, 8.5, 5.35, { noHead: true, c: ORB, w: 1.5, d: true });
  arrow(s, 8.5, 5.35, 4.7, 5.35, { noHead: true, c: ORB, w: 1.5, d: true });
  arrow(s, 4.7, 5.35, 4.7, 5.02, { c: ORB, w: 1.5, d: true });
  T(s, "执行中遇到新问题 → 几句话写回 skill / AGENTS.md → 下次自动处理", 4.9, 5.42, 5.2, 0.5, { fs: 12, b: 1, c: ORD });
  // 右侧结论
  card(s, 10.35, 3.92, 2.43, 1.75, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "人工时间\n就此释放", 10.35, 4.2, 2.43, 0.8, { fs: 15, b: 1, c: ORD, a: "center", lsm: 1.25 });
  T(s, "去接更大的任务量", 10.35, 5.15, 2.43, 0.3, { fs: 11.5, c: MUT, a: "center" });
  T(s, "这就是经验沉淀的飞轮。", M, 6.15, 6, 0.35, { fs: 14, b: 1, c: INK });
  foot(s, 8);
  s.addNotes("前三步一次性搭建，③ 人工调整决定质量上限；④⑤ 构成飞轮，新问题写回后自动处理。");
}

// ================= S9 SKILL.md =================
{
  const s = sl();
  head(s, "第三部分 · 理念二：把重复手动任务沉淀为 skill", "SKILL.md：一份可执行的 SOP", "平时是项目里的普通文件、不占上下文；触发时装入上下文，循环从“现场发挥”切换成“按剧本走”");
  T(s, "SOP 给人看，skill 给 agent 执行。", M, 1.85, 12.23, 0.6, { fs: 26, b: 1, c: ORD });
  const t = term(s, M, 2.7, 7.6, 3.85, "SKILL.md 骨架示例（第四部分实战会亲手生成一份）");
  T(s, PG([
    { t: "# batch-rc-report：接触电阻批量报告", o: { c: ORB, fs: 13.5, b: 1, psa: 6 } },
    { t: "## 什么时候用", o: { c: DINK, fs: 12.5, b: 1, psa: 2 } },
    { t: "用户给出若干 rc_*.csv，要按批次出统计报告时", o: { c: DMUT, fs: 12, psa: 6 } },
    { t: "## 步骤", o: { c: DINK, fs: 12.5, b: 1, psa: 2 } },
    { t: "1. 读取全部 rc_*.csv，校验列　2. 按批次统计均值/标准差/超规格占比", o: { c: DMUT, fs: 12, psa: 2 } },
    { t: "3. 每批生成分布图　4. 汇总为 reports/rc_report_日期.md，异常批次标 ⚠ 置顶", o: { c: DMUT, fs: 12, psa: 6 } },
    { t: "## 口径（2026-08 讨论沉淀）", o: { c: DINK, fs: 12.5, b: 1, psa: 2 } },
    { t: "边缘 die 异常不算批次失败 · CPK 低于 1.33 必须标注", o: { c: DMUT, fs: 12, psa: 6 } },
    { t: "## 坑", o: { c: DINK, fs: 12.5, b: 1, psa: 2 } },
    { t: "w32 文件中间混入一行重复表头，先剔除再统计", o: { c: DMUT, fs: 12 } },
  ]), t.x, t.y, t.w, t.h, { lsm: 1.12 });
  const x = 8.55, w = 4.23;
  card(s, x, 2.7, w, 3.85, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "四段结构", x + 0.32, 2.95, w - 0.64, 0.35, { fs: 15, b: 1, c: INK });
  const seg = [["什么时候用", "触发条件，一句话能判断"], ["步骤", "编号动作，循环照着走"], ["口径", "团队讨论沉淀的判定规则"], ["坑", "踩过的雷和处理办法"]];
  seg.forEach((p, i) => {
    const y = 3.42 + i * 0.7;
    T(s, p[0], x + 0.32, y, w - 0.64, 0.3, { fs: 13.5, b: 1, c: ORD });
    T(s, p[1], x + 0.32, y + 0.29, w - 0.64, 0.3, { fs: 12, c: BODY });
  });
  T(s, "口径与坑，是 skill 里最值钱的部分。", x + 0.32, 6.22, w - 0.64, 0.3, { fs: 12.5, b: 1, c: INK });
  foot(s, 9);
  s.addNotes("骨架四段：什么时候用 / 步骤 / 口径 / 坑。口径和坑只能从真实执行里长出来。");
}

// ================= S10 实战定题 =================
{
  const s = sl();
  head(s, "第四部分 · 实战：接触电阻项目", "定题：一句话项目与验收标准", "动手前先立靶子，做完回来对照——这是本课主体，课堂上跟演示，课后完整跑一遍");
  // 给什么 → 交付什么
  card(s, M, 1.9, 5.3, 1.5, {});
  T(s, "你给它什么", M + 0.32, 2.1, 4.6, 0.32, { fs: 13.5, b: 1, c: MUT });
  T(s, "data/ 下 w31–w34 四个批次的接触电阻 CSV（每批 3 片 wafer × 100 die）", M + 0.32, 2.48, 4.7, 0.75, { fs: 13.5, c: INK, lsm: 1.25 });
  arrow(s, 5.85, 2.65, 6.85, 2.65, { w: 2 });
  T(s, "加工", 5.75, 2.2, 1.2, 0.3, { fs: 12, c: MUT, a: "center" });
  card(s, 6.85, 1.9, 5.93, 1.5, { fill: CARD, lineC: ORB, lw: 1.5 });
  T(s, "它交付什么", 7.17, 2.1, 5.3, 0.32, { fs: 13.5, b: 1, c: MUT });
  T(s, "reports/ 一份可交出去的批次报告：统计表、异常标注、边缘 die 分析、结论", 7.17, 2.48, 5.3, 0.75, { fs: 13.5, b: 1, c: ORD, lsm: 1.25 });
  // 信号
  T(s, "对照入门篇信号表，四条全中——正是理想的第一项目：", M, 3.62, 8, 0.32, { fs: 13, c: MUT });
  ["每周重复做", "规则明确（USL / CPK 红线）", "有现成素材", "容许迭代"].forEach((c, i) => {
    chip(s, "✓ " + c, M + i * 2.62, 3.98, 2.45, 0.44, { fill: CARD, lineC: TINT, c: ORD, fs: 12 });
  });
  // 验收标准
  card(s, M, 4.65, 12.23, 2.1, {});
  T(s, "验收标准（动手前立靶子）", M + 0.35, 4.85, 6, 0.35, { fs: 15, b: 1, c: INK });
  const acc = [
    "统计表：四批次各一行——die 数、均值、标准差、超规格占比、CPK",
    "异常标注：CPK 低于 1.33 的批次标 ⚠ 并置顶，附异常分析",
    "边缘 die 单独一节：不计入批次失败判定，但要有对比数字",
    "可独立阅读：没上过课的同事不看数据也能读懂结论",
    "每条结论后面跟着支撑数字",
  ];
  acc.forEach((a, i) => {
    checkRow(s, a, M + 0.35 + (i % 2) * 6.0, 5.3 + Math.floor(i / 2) * 0.44, 5.8, { fs: 11.5 });
  });
  foot(s, 10);
  s.addNotes("定题就是定义输入和交付；验收标准五条在 M4 结束时逐项回来打钩。");
}

// ================= S11 加工管线 =================
{
  const s = sl();
  head(s, "第四部分 · 实战：接触电阻项目", "成品是长出来的：加工管线", "原始数据经三个里程碑逐级加工成报告，每长出一段做一次 Git 存档——任何一步都能退回上一段");
  const py = 2.3, ph = 1.3;
  const nodes = [
    [M, 2.6, "data/ 四个批次 CSV", "原始数据 · 只读", false],
    [4.35, 2.3, "reports/stats.md", "批次统计表（M2）", false],
    [7.85, 2.3, "reports/histogram.md", "分布频次对比（M3）", false],
    [11.35, 1.98, "report-w31-w34.md", "✓ 成品报告（M4）", true],
  ];
  nodes.forEach(n => {
    card(s, n[0], py, n[1], ph, n[4] ? { fill: CARD, lineC: ORB, lw: 2 } : {});
    T(s, n[2], n[0] + 0.15, py + 0.22, n[1] - 0.3, 0.55, { fs: n[4] ? 12 : 12.5, b: 1, c: n[4] ? ORD : INK, lsm: 1.15, mono: !n[4] });
    T(s, n[3], n[0] + 0.15, py + 0.88, n[1] - 0.3, 0.3, { fs: 11, c: MUT });
  });
  arrow(s, 3.15, py + ph / 2, 4.35, py + ph / 2, { w: 1.75 });
  T(s, "统计", 3.2, py + ph / 2 - 0.38, 1.1, 0.28, { fs: 11.5, c: ORD, b: 1, a: "center" });
  arrow(s, 6.65, py + ph / 2, 7.85, py + ph / 2, { w: 1.75 });
  T(s, "异常", 6.7, py + ph / 2 - 0.38, 1.1, 0.28, { fs: 11.5, c: ORD, b: 1, a: "center" });
  arrow(s, 10.15, py + ph / 2, 11.35, py + ph / 2, { w: 1.75 });
  T(s, "汇总", 10.2, py + ph / 2 - 0.38, 1.1, 0.28, { fs: 11.5, c: ORD, b: 1, a: "center" });
  // Git 时间线
  const gy = 4.55;
  s.addShape(P.shapes.RECTANGLE, { x: M, y: gy - 0.01, w: 12.23, h: 0.02, fill: { color: LINEC } });
  s.addShape(P.shapes.RECTANGLE, { x: M, y: gy - 0.01, w: 12.23, h: 0.02, fill: { color: ORB, transparency: 55 } });
  ["骨架", "统计", "图表", "报告"].forEach((g, i) => {
    const cx = 1.85 + i * 3.2;
    s.addShape(P.shapes.OVAL, { x: cx - 0.09, y: gy - 0.09, w: 0.18, h: 0.18, fill: { color: ORB }, line: { color: "FFFFFF", width: 1.5 } });
    T(s, "存档 · " + g, cx - 0.7, gy + 0.16, 1.4, 0.28, { fs: 11.5, c: MUT, a: "center" });
  });
  T(s, "Git 存档时间线：每完成一段存档一次，改坏随时退回上一段", M, 4.95, 12.23, 0.3, { fs: 12.5, c: MUT });
  // 三条纪律
  const dis = [["1. 原始数据只读", "agent 提出修改 / 删除 data/ 里的文件，一律不批——清理在新文件或内存里完成"],
    ["2. 过验收点才前进", "每个里程碑末尾有验收点，过了再进下一步"],
    ["3. 卡住 5 分钟就问", "课堂举手；课后对照文档末尾的排错速查"]];
  dis.forEach((d, i) => {
    const x = M + i * 4.13;
    card(s, x, 5.5, 3.93, 1.35, { fill: i === 0 ? CARD : CARDN, lineC: i === 0 ? TINT : LINEC, lw: 1 });
    T(s, d[0], x + 0.3, 5.68, 3.35, 0.32, { fs: 13.5, b: 1, c: i === 0 ? ORD : INK });
    T(s, d[1], x + 0.3, 6.04, 3.35, 0.7, { fs: 11.5, c: BODY, lsm: 1.2 });
  });
  foot(s, 11);
  s.addNotes("管线图上方是产物链，下方是 Git 时间线。三条纪律第一条是红线：data/ 只读。");
}

// ================= S12 M1 骨架 =================
{
  const s = sl();
  head(s, "第四部分 · 实战 · 里程碑①（课堂 5 分钟）", "建项目骨架：目录、Git、口径", "新建空文件夹（如 rc-reports/），拷入素材包 data/，用 opencode 打开");
  const t1 = term(s, M, 1.9, 5.95, 2.1, "第一条指令：骨架＋第一次存档");
  T(s, "❯ 帮我把当前文件夹初始化成 Git 仓库，并建好项目目录：assets/（图表）、reports/（报告）、templates/（模板）。data/ 是原始数据，保持原样。建完目录后，给当前全部文件做第一次 Git 存档。", t1.x, t1.y, t1.w, t1.h, { c: DINK, fs: 11.5, lsm: 1.25 });
  const t2 = term(s, M, 4.15, 5.95, 2.3, "再 /init，然后向 AGENTS.md 补口径");
  T(s, PG([
    { t: "❯ 向 AGENTS.md 补充以下口径：", o: { c: DINK, fs: 11, psa: 3 } },
    { t: "· USL = 50 mΩ；rc_mohm ≥ 50 计为超规格", o: { c: DINK, fs: 11, psa: 3 } },
    { t: "· CPK =（USL − 均值）/（3 × 标准差）；低于 1.33 必须标注", o: { c: DINK, fs: 11, psa: 3 } },
    { t: "· 边缘 die：die_x 或 die_y 为 0 或 9；异常单独列节", o: { c: DINK, fs: 11, psa: 3 } },
    { t: "· 原始数据只读：清理在内存或新文件完成", o: { c: DINK, fs: 11 } },
  ]), t2.x, t2.y, t2.w, t2.h, { lsm: 1.18 });
  const x = 6.83, w = 5.95;
  card(s, x, 1.9, w, 2.0, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "口径本来就该由你来补", x + 0.35, 2.12, w - 0.7, 0.35, { fs: 15, b: 1, c: INK });
  T(s, "目录里只有数据，/init 的初稿会很空——这不是问题：业务口径（USL、CPK 红线、边缘 die 定义）只有你懂，正是五步法第 ③ 步“人工调整”。", x + 0.35, 2.55, w - 0.7, 1.2, { fs: 13, c: BODY, lsm: 1.3 });
  card(s, x, 4.15, w, 2.15);
  T(s, "验收点", x + 0.35, 4.38, w - 0.7, 0.35, { fs: 15, b: 1, c: INK });
  ["agent 汇报 Git 第一个存档完成，VS Code 里能看到目录树", "AGENTS.md 里有：USL 50、CPK 红线、边缘 die 定义", "存档（骨架完成，第二个存档点）"].forEach((c, i) => {
    checkRow(s, c, x + 0.35, 4.85 + i * 0.44, w - 0.7, { fs: 12 });
  });
  foot(s, 12);
  s.addNotes("M1 两条指令现场跑完 5 分钟；强调口径来自人，不来自模型。");
}

// ================= S13 M2 核心节奏 =================
{
  const s = sl();
  head(s, "第四部分 · 实战 · 里程碑②（课堂 10 分钟）", "核心节奏：下指令 → 审方案 → 放行 → 验收", "全项目的核心节奏——你出手 4 次，其余由 agent 循环承担");
  // 你泳道
  T(s, "你 · 4 次出手", M, 1.8, 3, 0.3, { fs: 13, b: 1, c: MUT });
  const you = [["① 下指令", "plan 模式 · 五段式"], ["② 审方案", "空间 · 时间 · 兜底"], ["③ 放行", "切 build"], ["④ 验收数字", "对锚点 · 抽查"]];
  you.forEach((n, i) => {
    const x = M + i * 3.12, hot = i === 3;
    card(s, x, 2.12, 2.75, 1.0, hot ? { fill: CARD, lineC: ORB, lw: 2.25 } : { fill: "FFFFFF" });
    T(s, n[0], x + 0.2, 2.26, 2.35, 0.34, { fs: 13.5, b: 1, c: hot ? ORD : INK });
    T(s, n[1], x + 0.2, 2.62, 2.35, 0.3, { fs: 11, c: MUT });
    if (i < 3) arrow(s, x + 2.75, 2.62, x + 3.12, 2.62, { c: ORB, w: 1.5 });
  });
  arrow(s, 11.0, 3.12, 6.7, 3.95, { c: ORB, w: 1.75 });
  T(s, "④ 验收数字", 11.05, 3.25, 1.6, 0.28, { fs: 11.5, c: ORD, b: 1 });
  // agent 泳道
  T(s, "Agent · 循环", M, 3.95, 3, 0.3, { fs: 13, b: 1, c: MUT });
  const ag = [["读入 ＋ 校验", "行数 · 数值列"], ["按批次统计", "均值 · 占比 · CPK"], ["写 stats.md", "贴表给你审"]];
  ag.forEach((n, i) => {
    const x = M + i * 4.15;
    card(s, x, 4.28, 3.7, 1.0);
    T(s, n[0], x + 0.25, 4.42, 3.2, 0.34, { fs: 13.5, b: 1, c: INK });
    T(s, n[1], x + 0.25, 4.78, 3.2, 0.3, { fs: 11, c: MUT });
    if (i < 2) arrow(s, x + 3.7, 4.78, x + 4.15, 4.78, { c: ORB, w: 1.5 });
  });
  // 纠偏回路
  arrow(s, 10.55, 5.28, 10.55, 5.75, { noHead: true, c: GREY, w: 1.5, d: true });
  arrow(s, 10.55, 5.75, 2.4, 5.75, { noHead: true, c: GREY, w: 1.5, d: true });
  arrow(s, 2.4, 5.75, 2.4, 5.28, { c: GREY, w: 1.5, d: true });
  T(s, "对不上 → 一条纠偏指令，把循环拉回读入重跑", 4.6, 5.82, 5.6, 0.3, { fs: 12, c: MUT, a: "center" });
  card(s, M, 6.3, 12.23, 0.75, { fill: CARD, lineC: TINT, lw: 1, flat: true });
  T(s, "发现问题就纠偏——这个节奏贯穿后面每个里程碑，也是日常使用 agent 的标准节奏。", M + 0.35, 6.5, 11.5, 0.4, { fs: 13.5, b: 1, c: ORD });
  foot(s, 13);
  s.addNotes("泳道图：上道是你 4 次出手（验收橙色加粗），下道是 agent 循环；虚线是纠偏回路。");
}

// ================= S14 M2 五段式指令 =================
{
  const s = sl();
  head(s, "第四部分 · 实战 · 里程碑②", "指令实例：一条完整的五段式", "每一段都在压缩 agent 的猜测空间——各段作用见第五部分");
  const t = term(s, M, 1.85, 7.45, 4.75, "M2 指令 · Plan 模式发出");
  const seg = [
    ["背景", "data/ 下是 w31–w34 四个批次的接触电阻数据，列为 batch, wafer_id, die_x, die_y, rc_mohm（mΩ），每批 3 片 wafer"],
    ["目标", "核对四个文件正确读入，按批次统计：die 数、均值、标准差、超规格占比（≥50）、CPK"],
    ["约束", "读入时校验行数与数值列；任何一行读不进去都要明确报告，不许静默跳过；原始数据只读"],
    ["输入", "data/rc_w31.csv ~ data/rc_w34.csv"],
    ["输出", "先在对话里贴 Markdown 统计表给我审，确认后写入 reports/stats.md"],
  ];
  seg.forEach((g, i) => {
    const y = t.y + i * 0.82;
    chip(s, g[0], t.x, y, 0.78, 0.36, { fill: "3E2E20", lineC: ORB, c: ORB, fs: 12 });
    T(s, g[1], t.x + 0.95, y - 0.03, t.w - 0.95, 0.8, { c: DINK, fs: 11.5, lsm: 1.2 });
  });
  const x = 8.45, w = 4.33;
  card(s, x, 1.85, w, 4.75, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "放行前的“三问”", x + 0.32, 2.1, w - 0.64, 0.38, { fs: 15.5, b: 1, c: INK });
  const q = [["空间", "会读 / 改 / 新建哪些文件？", "只读 data/ 四个文件，只写 reports/stats.md"],
    ["时间", "步骤顺序与验收点？", "先读入校验，过了再统计"],
    ["兜底", "出异常怎么办？", "报告给你，不静默处理"]];
  q.forEach((p, i) => {
    const y = 2.62 + i * 1.28;
    T(s, p[0], x + 0.32, y, 1.2, 0.34, { fs: 15, b: 1, c: ORD });
    T(s, p[1], x + 0.32, y + 0.36, w - 0.64, 0.3, { fs: 12, c: INK, b: 1 });
    T(s, "M2 答案：" + p[2], x + 0.32, y + 0.66, w - 0.64, 0.55, { fs: 11.5, c: BODY, lsm: 1.2 });
    if (i < 2) s.addShape(P.shapes.LINE, { x: x + 0.32, y: y + 1.16, w: w - 0.64, h: 0, line: { color: TINT, width: 0.75 } });
  });
  T(s, "三问都过 → 切 Build：“方案没问题，开始执行。”", M, 6.72, 7.45, 0.32, { fs: 13, b: 1, c: ORD });
  foot(s, 14);
  s.addNotes("逐段读指令，解释每段压缩了什么猜测；三问是审方案的检查单。");
}

// ================= S15 M2 锚点与纠偏 =================
{
  const s = sl();
  head(s, "第四部分 · 实战 · 里程碑②", "验收锚点与纠偏闭环", "锚点是本批素材的“应然值”——数字对不上，就是发现问题的时候");
  const th = { b: 1, color: INK, fill: { color: CARD } };
  s.addTable([
    [{ text: "锚点", options: { ...th } }, { text: "应然值", options: { ...th } }],
    ["每批次 die 数", "300（四行都看一眼）"],
    ["正常批次均值", "39–41 mΩ"],
    ["超 50 mΩ 占比", "正常批次为 0"],
    ["CPK", "正常批次 > 1.5"],
  ], {
    x: M, y: 1.95, w: 5.3, colW: [2.4, 2.9], rowH: [0.4, 0.5, 0.5, 0.5, 0.5],
    fontFace: F, fontSize: 12.5, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.07,
  });
  T(s, "换一批数据，锚点跟着换。", M, 4.6, 5.3, 0.3, { fs: 12, c: MUT });
  // 三种结局
  const x2 = 6.15, w2 = 6.63;
  T(s, "审核的三种结局（动作都是同一个：问清理规则）", x2, 1.95, w2, 0.32, { fs: 14, b: 1, c: INK });
  const ends = [
    ["它报告了异常", "汇报写明“某文件某行读不进去”→ 表扬，走纠偏"],
    ["它自己处理了", "统计正常但交代了处理方式 → 追问：“删了哪行、依据是什么”"],
    ["它没发现", "die 数、均值与锚点对不上 → 你来抓，走纠偏"],
  ];
  ends.forEach((e, i) => {
    const y = 2.4 + i * 0.78;
    card(s, x2, y, w2, 0.66, { flat: true });
    T(s, e[0], x2 + 0.25, y + 0.1, 1.95, 0.45, { fs: 13, b: 1, c: ORD, v: "middle" });
    T(s, e[1], x2 + 2.3, y + 0.08, w2 - 2.55, 0.52, { fs: 12, c: BODY, lsm: 1.15, v: "middle" });
  });
  // 纠偏闭环 prompt
  const t = term(s, M, 5.0, 12.23, 1.85, "纠偏闭环（本批素材里确实埋了一处行数异常）");
  T(s, PG([
    { t: "❯ w32 的 die 数和其他批次对不上。请先在 Plan 模式说明排查思路，我确认后你再动手：定位多出来的行是什么、在文件第几行、清理规则是什么，然后重算 w32 的统计并更新 reports/stats.md。", o: { c: DINK, fs: 11.5, psa: 5 } },
    { t: "❯ 把刚才发现的这个坑补进 AGENTS.md 的注意事项：哪个文件、什么问题、读入时先怎么处理。　→ 确认规则合理再放行；坑沉淀进项目", o: { c: ORB, fs: 11.5, b: 1 } },
  ]), t.x, t.y, t.w, t.h, { lsm: 1.2 });
  foot(s, 15);
  s.addNotes("锚点表让大家知道“数字应该长什么样”；三种结局说明人永远保留抽查权；纠偏后把坑写回 AGENTS.md。");
}

// ================= S16 M3 统计与图表 =================
{
  const s = sl();
  head(s, "第四部分 · 实战 · 里程碑③（课堂 5 分钟）", "统计与图表：判定靠规则，不靠感觉", "先 /new——M2 的对话装满了来回，M3 是新任务（AGENTS.md 自动兜底背景）");
  // 左：判断流
  card(s, M, 2.15, 2.75, 1.05);
  T(s, "三个信号算完", M + 0.2, 2.28, 2.35, 0.34, { fs: 13, b: 1, c: INK });
  T(s, "均值 · 超规格占比 · CPK", M + 0.2, 2.64, 2.4, 0.3, { fs: 11, c: MUT });
  arrow(s, 3.3, 2.67, 3.75, 2.67, { w: 1.75 });
  s.addShape(P.shapes.DIAMOND, { x: 3.75, y: 2.0, w: 1.75, h: 1.35, fill: { color: "FFFFFF" }, line: { color: ORB, width: 1.25 } });
  T(s, "CPK\n< 1.33 ?", 3.75, 2.32, 1.75, 0.72, { fs: 12, b: 1, c: INK, a: "center", lsm: 1.1 });
  chip(s, "✓ 正常，按序排", 5.95, 2.0, 2.15, 0.5, { fill: CARDN, lineC: LINEC, c: INK, fs: 12.5 });
  arrow(s, 5.5, 2.35, 5.95, 2.25, { c: GREY, w: 1.5 });
  T(s, "否", 5.55, 1.95, 0.4, 0.26, { fs: 11.5, c: MUT });
  card(s, 5.95, 2.62, 2.5, 0.95, { fill: CARD, lineC: ORB, lw: 1.5 });
  T(s, "⚠ 异常批次", 6.15, 2.72, 2.1, 0.3, { fs: 13, b: 1, c: ORD });
  T(s, "置顶 ＋ 单独分析", 6.15, 3.04, 2.1, 0.3, { fs: 11, c: BODY });
  arrow(s, 5.5, 2.85, 5.95, 2.95, { w: 1.75 });
  T(s, "是", 5.55, 2.98, 0.4, 0.26, { fs: 11.5, c: ORD, b: 1 });
  card(s, 5.95, 3.75, 6.83, 0.85, { flat: true });
  arrow(s, 7.2, 3.57, 7.2, 3.75, { c: ORB, w: 1.5 });
  T(s, "追问第二层：边缘 die vs 中心 die 对比表，直接进报告第三节", 6.25, 3.95, 6.3, 0.45, { fs: 13, b: 1, c: INK, v: "middle" });
  // 左下：锚点
  card(s, M, 3.5, 5.0, 1.15, { fill: CARD, lineC: TINT, lw: 1, flat: true });
  T(s, "验收锚点", M + 0.25, 3.64, 4.5, 0.28, { fs: 12.5, b: 1, c: ORD });
  T(s, "异常批次均值高 6 mΩ 以上、超规格占比约两成、CPK 远低于红线；边缘 die 比中心高约 5 mΩ。", M + 0.25, 3.94, 4.55, 0.65, { fs: 11, c: BODY, lsm: 1.2 });
  // 下：三条指令
  const t = term(s, M, 4.8, 12.23, 2.0, "M3 的三条指令");
  T(s, PG([
    { t: "❯ 分布频次表（必做，“文字版直方图”）：以 2 mΩ 为区间（从 36 起）输出每批次频次表，≥50 超规格区间单独一行；哪个批次明显右移，用一句话点出 → reports/histogram.md", o: { c: DINK, fs: 11, psa: 4 } },
    { t: "❯ 边缘 die 拆分：按 die_x / die_y 是否为 0 或 9 分成两组，分别统计均值与超规格占比，贴对比表，说明边缘比中心差多少", o: { c: DINK, fs: 11, psa: 4 } },
    { t: "❯ 加分项（需 python）：matplotlib 每批分布直方图＋50 mΩ 红线，存 assets/；画不出不纠结，频次表已够支撑全部结论", o: { c: ORB, fs: 11, b: 1 } },
  ]), t.x, t.y, t.w, t.h, { lsm: 1.15 });
  foot(s, 16);
  s.addNotes("先讲判定门（CPK 是否低于 1.33），再给三条指令。频次表是保底交付，直方图是加分项。");
}

// ================= S17 M4 报告与沉淀 =================
{
  const s = sl();
  head(s, "第四部分 · 实战 · 里程碑④（课堂 5 分钟）", "报告与沉淀：这次的产出，下周变成一句话", "生成成品报告，对照 4.1 的验收标准逐项打钩——开头的靶子，现在回来验靶");
  const t = term(s, M, 1.9, 7.45, 1.75, "生成成品报告");
  T(s, "❯ 把前三个里程碑的产物汇总成 reports/report-w31-w34.md，结构四节：① 总览表（异常批次置顶）② 异常批次分析 ③ 边缘 die（单独一节）④ 结论与建议。每条结论后跟着支撑数字；数据清理处理在报告开头注明一句。", t.x, t.y, t.w, t.h, { c: DINK, fs: 11.5, lsm: 1.25 });
  // 沉淀两卡
  card(s, M, 3.85, 3.6, 1.35, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "模板沉淀 · 理念一", M + 0.28, 4.0, 3.05, 0.3, { fs: 12.5, b: 1, c: ORD });
  T(s, "把报告结构沉淀成 templates/rc-weekly.md：节标题、每节放什么表、哪些口径必须出现", M + 0.28, 4.32, 3.1, 0.85, { fs: 11.5, c: BODY, lsm: 1.2 });
  card(s, 4.32, 3.85, 3.6, 1.35, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "SKILL 草稿 · 理念二", 4.6, 4.0, 3.05, 0.3, { fs: 12.5, b: 1, c: ORD });
  T(s, "把从统计到报告的完整流程写成 SKILL.md：什么时候用、步骤、口径、坑（五步法第 ④ 步）", 4.6, 4.32, 3.1, 0.85, { fs: 11.5, c: BODY, lsm: 1.2 });
  // 最终结构
  const t2 = term(s, 8.12, 1.9, 4.66, 4.7, "最终项目结构");
  T(s, PG([
    { t: "rc-reports/", o: { c: ORB, fs: 12, b: 1, mono: true, psa: 2 } },
    { t: "├── AGENTS.md     口径＋w32 的坑", o: { c: DMUT, fs: 10.5, mono: true, psa: 2 } },
    { t: "├── SKILL.md      下次一句话复跑", o: { c: DMUT, fs: 10.5, mono: true, psa: 2 } },
    { t: "├── data/         原始数据（只读）", o: { c: DMUT, fs: 10.5, mono: true, psa: 2 } },
    { t: "├── assets/       图表（选做）", o: { c: DMUT, fs: 10.5, mono: true, psa: 2 } },
    { t: "├── reports/", o: { c: DMUT, fs: 10.5, mono: true, psa: 2 } },
    { t: "│   ├── stats.md       M2 统计表", o: { c: DMUT, fs: 10.5, mono: true, psa: 2 } },
    { t: "│   ├── histogram.md   M3 分布对比", o: { c: DMUT, fs: 10.5, mono: true, psa: 2 } },
    { t: "│   └── report-w31-w34.md ✓ 成品", o: { c: ORB, fs: 10.5, b: 1, mono: true, psa: 2 } },
    { t: "└── templates/rc-weekly.md  模板", o: { c: DMUT, fs: 10.5, mono: true } },
  ]), t2.x, t2.y, t2.w, t2.h, { lsm: 1.12 });
  // 下周一句话
  card(s, M, 5.35, 7.67, 1.32, { fill: DARK, lineC: DARK, noLine: true });
  T(s, "下周新数据到手，就是一句话：", M + 0.35, 5.5, 7, 0.3, { fs: 12.5, c: DMUT });
  T(s, "❯ 跑一遍 rc 周报 skill，处理 data/ 下新的 rc_*.csv", M + 0.35, 5.82, 7.1, 0.4, { fs: 15, b: 1, c: ORB, mono: true });
  T(s, "——今天的四个里程碑，下周变成一句话。", M + 0.35, 6.28, 7, 0.3, { fs: 12, c: DMUT });
  T(s, "最终验收：4.1 五项全打钩 ＋ data/ 从未被动过（红线）＋ 每段一个 Git 存档 ＋ w32 的坑已沉淀进 AGENTS.md。", M, 6.78, 12.23, 0.28, { fs: 11.5, c: MUT });
  foot(s, 17);
  s.addNotes("M4 是两个理念的落点：模板沉淀（理念一）＋SKILL 草稿（理念二）；目录树对照检查。");
}

// ================= S18 五段式 =================
{
  const s = sl();
  head(s, "第五部分 · 方法论底座", "提问：五段式", "M2 那条指令就是完整实例——不必每次写满五段，缺哪段补哪段");
  const th = { b: 1, color: INK, fill: { color: CARD } };
  s.addTable([
    [{ text: "段", options: { ...th } }, { text: "回答什么", options: { ...th } }, { text: "不写会发生什么", options: { ...th } }],
    [{ text: "背景", options: { b: 1, color: ORD } }, "场景 / 已有条件", "它不知道列含义、每批该多少行"],
    [{ text: "目标", options: { b: 1, color: ORD } }, "要什么 / 验收标准", "开放式指令，产出不可审"],
    [{ text: "约束", options: { b: 1, color: ORD } }, "限制与红线", "行读不进去就悄悄跳过"],
    [{ text: "输入", options: { b: 1, color: ORD } }, "相关文件路径", "漏读或多读文件"],
    [{ text: "输出", options: { b: 1, color: ORD } }, "格式 / 保存位置", "数字散落在对话里"],
  ], {
    x: M, y: 1.9, w: 7.6, colW: [1.1, 2.6, 3.9], rowH: [0.4, 0.56, 0.56, 0.56, 0.56, 0.56],
    fontFace: F, fontSize: 12.5, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.07,
  });
  const x = 8.6, w = 4.18;
  card(s, x, 1.9, w, 4.55, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "三个技巧", x + 0.32, 2.15, w - 0.64, 0.38, { fs: 16, b: 1, c: INK });
  const tips = [["给示例", "对齐格式优于描述：“像这样：xxx，按这个格式重写”"], ["分步骤", "“先…再…”，给执行定序"], ["定输出", "表格结构 / 文件命名 / 保存位置"]];
  tips.forEach((p, i) => {
    const y = 2.7 + i * 1.15;
    T(s, p[0], x + 0.32, y, 2.5, 0.34, { fs: 14.5, b: 1, c: ORD });
    T(s, p[1], x + 0.32, y + 0.36, w - 0.64, 0.65, { fs: 12, c: BODY, lsm: 1.25 });
  });
  T(s, "核心：把脑中“默认成立”的前提，显式写出来。", x + 0.32, 6.02, w - 0.64, 0.5, { fs: 13, b: 1, c: INK, lsm: 1.25 });
  T(s, "课后自查 6.3：回答不准确、答非所问 → 先查这一页。", M, 6.7, 7.6, 0.32, { fs: 12.5, c: MUT });
  foot(s, 18);
  s.addNotes("五段式回指 M2 实例；三个技巧是压缩猜测空间的快捷方式。");
}

// ================= S19 配置与术语 =================
{
  const s = sl();
  head(s, "第五部分 · 方法论底座", "配置：双层 AGENTS.md 与术语消歧", "全局级放个人习惯，项目级放团队规范——冲突时项目级覆盖，未冲突两层叠加");
  // 双层图
  card(s, M, 2.0, 5.5, 1.35);
  T(s, "全局级 AGENTS.md", M + 0.3, 2.18, 4.9, 0.34, { fs: 14.5, b: 1, c: INK });
  T(s, "~/.config/opencode/AGENTS.md · 个人偏好与通用习惯 · 个人维护，不共享", M + 0.3, 2.56, 4.95, 0.6, { fs: 11.5, c: MUT, lsm: 1.2 });
  card(s, M, 3.55, 5.5, 1.35);
  T(s, "项目级 AGENTS.md", M + 0.3, 3.73, 4.9, 0.34, { fs: 14.5, b: 1, c: INK });
  T(s, "仓库根目录 /AGENTS.md · 领域术语、规范、目录约定 · 团队共同维护，随仓库提交", M + 0.3, 4.11, 4.95, 0.6, { fs: 11.5, c: MUT, lsm: 1.2 });
  arrow(s, 6.05, 2.67, 7.05, 3.1, { c: ORB, w: 1.5 });
  arrow(s, 6.05, 4.22, 7.05, 3.35, { c: ORB, w: 1.5 });
  T(s, "未冲突 → 叠加", 6.0, 2.3, 1.6, 0.26, { fs: 10.5, c: MUT, a: "center" });
  T(s, "冲突 → 项目级覆盖", 5.7, 4.32, 1.3, 0.24, { fs: 10, c: MUT, a: "center" });
  card(s, 7.05, 2.7, 2.6, 0.9, { fill: CARD, lineC: ORB, lw: 1.5 });
  T(s, "每轮对话生效", 7.05, 2.9, 2.6, 0.5, { fs: 14, b: 1, c: ORD, a: "center", v: "middle" });
  // opencode.json
  const t = term(s, M, 5.15, 5.5, 1.55, "团队已有规范文档？引用而不搬运（支持 glob）");
  T(s, PG([
    { t: "{ \"instructions\": [", o: { c: DMUT, fs: 11, mono: true, psa: 2 } },
    { t: "  \"docs/development-standards.md\",", o: { c: DINK, fs: 11, mono: true, psa: 2 } },
    { t: "  \"test/testing-guidelines.md\" ] }", o: { c: DINK, fs: 11, mono: true } },
  ]), t.x, t.y, t.w, t.h, { lsm: 1.15 });
  // 术语表
  const x2 = 7.05, w2 = 5.73;
  T(s, "术语消歧：配置里最有价值的资产", x2, 4.35, w2, 0.32, { fs: 14, b: 1, c: INK });
  T(s, "同一词汇通用义 ≠ 专业义时必须显式定义，否则 agent 按通用义理解：", x2, 4.7, w2, 0.3, { fs: 11.5, c: MUT });
  const th2 = { b: 1, color: INK, fill: { color: CARD } };
  s.addTable([
    [{ text: "术语", options: { ...th2 } }, { text: "通用语义", options: { ...th2 } }, { text: "专业语义（需配置）", options: { ...th2, color: ORD } }],
    [{ text: "Yield", options: { b: 1 } }, "产量 / 收益", { text: "良率：合格品占总数比例", options: { color: ORD, b: true } }],
    [{ text: "Probe", options: { b: 1 } }, "探测", { text: "探针测试：晶圆级电性测试", options: { color: ORD, b: true } }],
    [{ text: "DOE", options: { b: 1 } }, "易与能量符号混淆", { text: "实验设计：优化工艺参数", options: { color: ORD, b: true } }],
  ], {
    x: x2, y: 5.02, w: w2, colW: [0.95, 1.78, 3.0], rowH: [0.34, 0.46, 0.46, 0.46],
    fontFace: F, fontSize: 11.5, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.06,
  });
  T(s, "办公岗同理：“闭环”“对齐”“抓手”在不同公司含义不同，定义清楚再交付。", x2, 6.78, w2, 0.28, { fs: 11.5, c: MUT });
  foot(s, 19);
  s.addNotes("双层配置讲合并语义；术语消歧举 Yield/Probe/DOE 三个例子即可。");
}

// ================= S20 上下文与确认门 =================
{
  const s = sl();
  head(s, "第五部分 · 方法论底座", "上下文三纪律，确认门一道", "agent 只看得见上下文；每一项都计入 token——关键不是总量大，而是该留的没留、该清的没清");
  // 左：三纪律
  card(s, M, 1.95, 5.55, 4.6);
  T(s, "上下文三纪律", M + 0.32, 2.18, 4.9, 0.36, { fs: 16, b: 1, c: INK });
  const dis = [["输入侧", "能读文件就不粘贴；超大日志先提取关键行"], ["会话侧", "新任务 /new；长任务阶段性 /compact；跑偏果断 /new"], ["时机", "响应明显变慢、长任务只剩收尾、话题从 A 转 B 但要保留结论——出现就 /compact"]];
  dis.forEach((d, i) => {
    const y = 2.7 + i * 1.15;
    T(s, d[0], M + 0.32, y, 1.5, 0.34, { fs: 14.5, b: 1, c: ORD });
    T(s, d[1], M + 0.32, y + 0.36, 4.95, 0.7, { fs: 12.5, c: BODY, lsm: 1.25 });
    if (i < 2) s.addShape(P.shapes.LINE, { x: M + 0.32, y: y + 1.04, w: 4.9, h: 0, line: { color: LINEC, width: 0.75 } });
  });
  T(s, "越长响应越慢、费用越高。", M + 0.32, 6.1, 4.9, 0.3, { fs: 12, c: MUT });
  // 右：确认门
  const x2 = 6.55, w2 = 6.23;
  T(s, "确认门：返工成本的分水岭", x2, 1.95, w2, 0.36, { fs: 16, b: 1, c: INK });
  card(s, x2, 2.5, 2.6, 1.05);
  T(s, "plan：打磨方案", x2 + 0.2, 2.62, 2.3, 0.32, { fs: 13, b: 1, c: INK });
  T(s, "三问过再放行", x2 + 0.2, 2.96, 2.3, 0.3, { fs: 11, c: MUT });
  arrow(s, x2 + 2.6, 3.02, x2 + 3.35, 3.02, { w: 1.75 });
  card(s, x2 + 3.35, 2.5, 1.35, 1.05, { fill: OR, lineC: OR, noLine: true });
  T(s, "确认门\n切 build", x2 + 3.35, 2.66, 1.35, 0.75, { fs: 12.5, b: 1, c: "FFFFFF", a: "center", lsm: 1.15 });
  arrow(s, x2 + 4.7, 3.02, x2 + 5.35, 3.02, { w: 1.75 });
  card(s, x2 + 5.35, 2.5, 0.88, 1.05);
  T(s, "build\n执行", x2 + 5.35, 2.66, 0.88, 0.75, { fs: 12.5, b: 1, c: INK, a: "center", lsm: 1.15 });
  chip(s, "✓ 交付成品", x2 + 4.7, 3.75, 1.55, 0.42, { fill: CARD, lineC: TINT, c: ORD, fs: 11.5 });
  arrow(s, x2 + 5.79, 3.55, x2 + 5.5, 3.75, { w: 1.5 });
  // 门后返工
  arrow(s, x2 + 5.5, 4.17, x2 + 5.5, 4.55, { noHead: true, c: ORB, w: 2, d: true });
  arrow(s, x2 + 5.5, 4.55, x2 + 1.3, 4.55, { noHead: true, c: ORB, w: 2, d: true });
  arrow(s, x2 + 1.3, 4.55, x2 + 1.3, 3.55, { c: ORB, w: 2, d: true });
  T(s, "门后返工：重做文件与执行，代价差一个量级", x2 + 1.5, 4.62, 4.5, 0.3, { fs: 12, b: 1, c: ORD });
  arrow(s, x2 + 0.9, 3.55, x2 + 0.9, 3.02, { noHead: true, c: GREY, w: 1.25, d: true });
  arrow(s, x2 + 0.9, 3.02, x2 + 1.3, 3.02, { c: GREY, w: 1.25, d: true });
  T(s, "门前返工：只改几行方案文字", x2 + 0.1, 5.0, 3.4, 0.28, { fs: 11.5, c: MUT });
  card(s, x2, 5.45, w2, 1.1, { flat: true });
  T(s, PG([
    { t: "方向性返工的代价比细节返工大一个量级——最核心的一条纪律。", o: { c: INK, fs: 12.5, b: 1, psa: 4 } },
    { t: "一条 Plan 的完整拆解：空间（动哪些文件）· 时间（步骤与验收点）· 兜底（异常怎么办）。", o: { c: BODY, fs: 12 } },
  ]), x2 + 0.3, 5.62, w2 - 0.6, 0.85, { lsm: 1.25 });
  foot(s, 20);
  s.addNotes("左侧讲怎么省（三纪律），右侧讲什么时候放（确认门）——两条回边跨不跨门，代价差一个量级。");
}

// ================= S21 团队与课后 =================
{
  const s = sl();
  head(s, "第六部分 · 从个人到团队与课后", "个人体系 → 团队资产", "经验沉淀在项目文件里，天然具备团队流动性——拷走文件夹就是共享");
  const th = { b: 1, color: INK, fill: { color: CARD } };
  s.addTable([
    [{ text: "资产", options: { ...th } }, { text: "个人形态", options: { ...th } }, { text: "团队形态", options: { ...th, color: ORD } }],
    [{ text: "工作汇报项目", options: { b: 1 } }, "自己的 work-reports/", "部门标准目录＋统一模板，新人入职即继承整套汇报框架"],
    [{ text: "Skill 库", options: { b: 1 } }, "自己沉淀的 SKILL.md", "团队认可的 skill 集中存放＋使用场景清单，减少全员试错"],
    [{ text: "AGENTS.md 分层", options: { b: 1 } }, "全局级个人习惯", "项目级团队规范随仓库生效，新人拉取即用"],
  ], {
    x: M, y: 1.9, w: 12.23, colW: [2.3, 3.1, 6.83], rowH: [0.42, 0.62, 0.62, 0.62],
    fontFace: F, fontSize: 12.5, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.07,
  });
  T(s, "效果看三个可观察信号：成员用 agent 完成任务的频次（采用率）· 模板 / skill 被复用的次数（复用数）· AGENTS.md 与模板的增量（沉淀量）。无实测数据先标“待实测”。", M, 4.6, 12.23, 0.6, { fs: 12.5, c: MUT, lsm: 1.25 });
  // 课后作业
  card(s, M, 5.35, 12.23, 1.5, { fill: CARD, lineC: ORB, lw: 1.25 });
  T(s, "课后作业：换你自己的数据", M + 0.4, 5.52, 6, 0.35, { fs: 14.5, b: 1, c: INK });
  const hw = [["① 找素材", "一份 CSV / 日志 / 表格，过信号表，满足三条就动手"], ["② 复用骨架", "目录结构、口径段、rc-weekly 模板拿去改，结构不用重想"], ["③ 跑通后沉淀", "坑和口径写回 AGENTS.md；跑通两三轮写成自己的 SKILL.md"]];
  hw.forEach((h, i) => {
    const x = M + 0.4 + i * 3.95;
    T(s, h[0], x, 5.95, 1.6, 0.3, { fs: 13, b: 1, c: ORD });
    T(s, h[1], x, 6.27, 3.7, 0.55, { fs: 11.5, c: BODY, lsm: 1.2 });
  });
  T(s, "下次带两个东西来：你的报告，和你的 SKILL.md。", 8.7, 5.5, 4.05, 0.35, { fs: 12.5, b: 1, c: ORD });
  foot(s, 21);
  s.addNotes("三个资产都可以“拷走即共享”；课后作业落到每人自己的数据。");
}

// ================= S22 结尾 =================
{
  const s = sl(true);
  T(s, "结语", M, 0.9, 8, 0.35, { fs: 15, b: 1, c: ORB, cs: 2 });
  T(s, "工具已就位，体系待搭建。", M, 1.4, 12, 0.75, { fs: 40, b: 1, c: DINK });
  T(s, "从今天的第一篇 daily 记录、第一个项目文件夹开始。", M, 2.4, 12, 0.45, { fs: 18, c: DMUT });
  card(s, M, 3.4, 12.23, 1.7, { fill: DCARD, lineC: ORB, lw: 1.5 });
  T(s, "记录即资产，流程即资产", M, 3.8, 12.23, 0.7, { fs: 32, b: 1, c: ORB, a: "center" });
  T(s, "——它们随模型与 agent 的进化持续升值", M, 4.6, 12.23, 0.35, { fs: 14, c: DMUT, a: "center" });
  const t = term(s, M, 5.5, 6.2, 1.15, "work-reports — 今晚");
  T(s, PG([
    { t: "❯ git commit -m \"第一天：写下第一篇 daily\"", o: { c: DINK, fs: 13, mono: true, b: 1 } },
  ]), t.x, t.y, t.w, t.h);
  const refs = ["课后完整跑一遍第四部分（2–2.5 h）", "互查：交换 rc-reports/，必查 die 数 / 抽一个数 / 结论有据", "卡住了查文档 6.3 排错速查"];
  T(s, PG(refs.map(r => ({ t: "· " + r, o: { c: DMUT, fs: 13.5 } }))), 7.15, 5.65, 5.6, 1.2, { lsm: 1.45 });
  foot(s, 22, true);
  s.addNotes("收尾回到两讲的主线：从会用到体系。作业与互查安排在课后。");
}

P.writeFile({ fileName: OUT }).then(() => console.log("written:", OUT));
