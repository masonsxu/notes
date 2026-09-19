// opencode 入门 — 理解 Agent 的原理，交出你的第一个任务（课程第一讲）
// 暖橙浅底 + 深色封面/结尾（三明治），终端窗口为贯穿母题。运行: bun build.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const OUT = path.join(__dirname, "opencode-入门.pptx");
const W = 13.33, H = 7.5, M = 0.55, CW = 13.33 - 2 * 0.55; // 内容宽 12.23

// ---------- 设计系统（取自讲义图表的橙色系） ----------
const BG = "FFFFFF", INK = "2B2119", BODY = "4C4138", MUT = "8A7B6E",
  LINEC = "E9DCCE", CARD = "FDF1EC", CARDN = "F7F2ED", TINT = "FBE4D6",
  DARK = "211913", DCARD = "30251B", DINK = "F7F0E8", DMUT = "D3C2B0", DLINE = "4A3826", GREY = "9C8D80",
  OR = "E8590C", ORB = "EB6C36", ORD = "C2410C";
const F = "Microsoft YaHei", MONO = "Consolas";
const TOTAL = 22;

const P = new pptxgen();
P.layout = "LAYOUT_WIDE";
P.author = "masonsxu";
P.title = "opencode 入门：理解 Agent 的原理，交出你的第一个任务";

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
  T(s, `opencode 入门 · ${String(i).padStart(2, "0")} / ${TOTAL}`, 9.4, 7.12, 3.38, 0.26, { fs: 12, c: dark ? "6E5A47" : "CDBFB0", a: "right" });
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
  T(s, txt, x + 0.1, y, w - 0.2, h, { fs: o.fs || 12.5, b: o.b !== false, c: o.c || ORD, a: "center", v: "middle" });
}
function numDot(s, n, x, y, d, o = {}) {
  s.addShape(P.shapes.OVAL, { x, y, w: d, h: d, fill: { color: o.fill || OR }, line: { color: o.fill || OR, width: 0 } });
  T(s, String(n), x, y, d, d, { fs: o.fs || 13, b: 1, c: "FFFFFF", a: "center", v: "middle" });
}
// 终端窗口卡：深色 + 窗口圆点 + 标题 + 命令行
function term(s, x, y, w, h, title, opts = {}) {
  card(s, x, y, w, h, { fill: DCARD, lineC: DLINE, lw: 1, r: 0.1 });
  ["5A4630", "8A6A3C", ORB].forEach((c, i) => s.addShape(P.shapes.OVAL, { x: x + 0.22 + i * 0.26, y: y + 0.18, w: 0.12, h: 0.12, fill: { color: c }, line: { color: c, width: 0 } }));
  if (title) T(s, title, x + 1.1, y + 0.12, w - 1.3, 0.26, { fs: 12.5, b: 1, c: DMUT });
  return { x: x + 0.3, y: y + 0.5, w: w - 0.6, h: h - 0.7 };
}
// 复选清单行
function checkRow(s, txt, x, y, w, o = {}) {
  s.addShape(P.shapes.ROUNDED_RECTANGLE, { x, y: y + 0.03, w: 0.17, h: 0.17, rectRadius: 0.03, fill: { color: o.fill || "FFFFFF" }, line: { color: o.box || ORB, width: 1.25 } });
  if (o.done) T(s, "✓", x - 0.015, y - 0.025, 0.2, 0.24, { fs: 12, b: 1, c: OR, a: "center", v: "middle" });
  T(s, txt, x + 0.28, y - 0.02, w - 0.28, 0.3, { fs: o.fs || 13, c: o.c || BODY, b: o.b });
}

// ================= S1 封面 =================
{
  const s = sl(true);
  T(s, "01", 9.7, 0.5, 3.2, 3.0, { fs: 150, b: 1, c: "2E241B", a: "right", mono: true });
  T(s, "OPENCODE 系列课程 · 第一讲", M, 1.15, 9, 0.32, { fs: 15, b: 1, c: ORB, cs: 2 });
  T(s, "opencode 入门", M, 1.55, 10.5, 1.15, { fs: 60, b: 1, c: DINK });
  T(s, "理解 Agent 的原理，交出你的第一个任务", M, 2.85, 10.5, 0.5, { fs: 22, c: DMUT });
  const t = term(s, M, 3.85, 8.3, 2.15, "opencode — 你的工作目录");
  T(s, PG([
    { t: "❯ 请读取当前目录下所有 .log 文件，统计错误码频次", o: { c: DINK, fs: 14.5, b: 1 } },
    { t: "  thinking → reading a.log … reading d.log …", o: { c: DMUT, fs: 12.5, mono: true } },
    { t: "✓ 已交付 error_report.md（Markdown 表格）", o: { c: ORB, fs: 14, b: 1, psa: 4 } },
  ]), t.x, t.y + 0.05, t.w, t.h, { lsm: 1.35 });
  T(s, "写给第一次接触 Agent 的同学　·　无需编程基础　·　课后即交出第一个真实任务", M, 6.55, 12.23, 0.35, { fs: 14, c: DMUT });
  s.addNotes("开场：本讲面向只用过 ChatGPT/DeepSeek 网页版的同学。目标两个：听懂 agent 原理，课上交出第一个真实任务。");
}

// ================= S2 课程定位 =================
{
  const s = sl();
  head(s, "开场 · 课程定位", "这门课给你什么", "从“只会粘贴提问”，到让 agent 在你的工作目录里交回成品文件");
  const defs = [
    ["写给谁", "第一次接触 agent 的同学——只用过 ChatGPT / DeepSeek 网页版，没打开过命令行也没关系。"],
    ["前置要求", "无。不需要会编程，不需要懂技术名词，带着手头的真实工作来就行。"],
    ["读完能做什么", "讲清 agent 的工作原理；配齐 opencode ＋ VS Code ＋ Git 三件套；让 agent 在你的目录里完成第一个真实任务。"],
  ];
  defs.forEach((d, i) => {
    const x = M + i * 4.13;
    card(s, x, 1.95, 3.93, 3.15);
    chip(s, d[0], x + 0.35, 2.3, 1.5, 0.42, { fs: 14 });
    T(s, d[1], x + 0.35, 3.0, 3.25, 1.9, { fs: 14, lsm: 1.3 });
  });
  s.addShape(P.shapes.RECTANGLE, { x: 0, y: 5.55, w: 13.33, h: 1.1, fill: { color: CARD }, line: { color: CARD, width: 0 } });
  T(s, PG([
    { t: "怎么用这份文档", o: { b: 1, c: INK, fs: 14.5 } },
    { t: "现场演示按节推进，每节一页；课后当操作手册用——所有指令、模板、清单可直接复制照做。", o: { c: BODY, fs: 14 } },
  ]), M, 5.78, 12.23, 0.7, { lsm: 1.35 });
  foot(s, 2);
  s.addNotes("强调零门槛；文档课后是操作手册，PPT 只带走结构和节奏。");
}

// ================= S3 聊天框卡在哪 =================
{
  const s = sl();
  head(s, "第一部分 · 为什么聊天框不够用", "问题不在模型智力，在它进不去你的文件", "一批几十 MB 的机台日志，混着正常记录和报错——用聊天应用处理的真实路径");
  const steps = [
    ["复制一段日志粘进 ChatGPT，问“报了什么错”", "文件太大粘不全，只能截取片段"],
    ["拿到口头建议，回到文件里手动统计错误码", "半小时起步"],
    ["想要一张汇总表，再手动整理一遍", "又半小时"],
  ];
  steps.forEach((st, i) => {
    const x = M + i * 4.28;
    card(s, x, 1.95, 3.68, 2.5);
    T(s, String(i + 1), x + 0.3, 2.12, 1.0, 0.75, { fs: 40, b: 1, c: OR });
    T(s, st[0], x + 0.3, 2.95, 3.1, 0.85, { fs: 14, c: INK, lsm: 1.25 });
    T(s, "代价：" + st[1], x + 0.3, 3.9, 3.1, 0.35, { fs: 12.5, c: ORD, b: 1 });
    if (i < 2) arrow(s, x + 3.68, 3.2, x + 4.28, 3.2, { c: ORB, w: 1.75 });
  });
  card(s, M, 4.95, 12.23, 1.55, { fill: CARD, lw: 1, lineC: TINT });
  T(s, PG([
    { t: "opencode 解决的就是这一层", o: { b: 1, c: INK, fs: 16 } },
    { t: "让它进入你的工作目录——自己读、自己算、把结果写成文件交给你。", o: { b: 1, c: ORD, fs: 18 } },
  ]), M + 0.4, 5.2, 11.4, 1.1, { lsm: 1.4 });
  foot(s, 3);
  s.addNotes("场景要具体：几十 MB 日志粘不进去；即使粘进去，统计和整理还是你手动做。卡点不是智力，是访问权。");
}

// ================= S4 分界线 =================
{
  const s = sl();
  head(s, "第一部分 · 为什么聊天框不够用", "分界线：给文字，还是交成品", "两个类比全文沿用：电话客服 vs 助理领进办公室");
  const rows = ["它能接触什么", "它的产出", "剩下谁动手"];
  const L = ["你粘贴的那段文字", "一段建议", "你"], R = ["整个工作目录", "成品文件", "它"];
  const mk = (x, title, sub, vals, emphasis) => {
    card(s, x, 1.85, 5.75, 4.55, emphasis ? { fill: CARD, lineC: ORB, lw: 1.5 } : {});
    T(s, title, x + 0.45, 2.15, 4.9, 0.45, { fs: 20, b: 1, c: emphasis ? ORD : INK });
    T(s, sub, x + 0.45, 2.62, 4.9, 0.32, { fs: 13, c: MUT });
    rows.forEach((r, i) => {
      const y = 3.15 + i * 1.0;
      if (i) s.addShape(P.shapes.LINE, { x: x + 0.45, y: y - 0.12, w: 4.85, h: 0, line: { color: emphasis ? TINT : LINEC, width: 0.75 } });
      T(s, r, x + 0.45, y, 4.85, 0.3, { fs: 12.5, c: MUT });
      T(s, vals[i], x + 0.45, y + 0.32, 4.85, 0.45, { fs: 17, b: 1, c: emphasis ? ORD : INK });
    });
  };
  mk(M, "聊天应用", "像电话客服：口头指导，挂断后你自己动手", L, false);
  mk(7.03, "opencode", "像助理领进办公室：自己翻文件柜、算好、把报告放你桌上", R, true);
  s.addShape(P.shapes.OVAL, { x: 6.39, y: 3.85, w: 0.56, h: 0.56, fill: { color: DARK }, line: { color: DARK, width: 0 } });
  T(s, "VS", 6.39, 3.85, 0.56, 0.56, { fs: 13, b: 1, c: "FFFFFF", a: "center", v: "middle" });
  foot(s, 4);
  s.addNotes("三行就是分界线：接触面、产出物、动手方。右侧橙色是本课要带你到达的状态。");
}

// ================= S5 岗位场景 =================
{
  const s = sl();
  head(s, "第一部分 · 为什么聊天框不够用", "每个岗位都用得上的场景", "你给它素材，它交回成品——不是一段建议");
  const sc = [
    ["写周报 / 月报", "几份零散的工作记录、数据片段", "按你指定模板排好的报告草稿"],
    ["会议纪要整理", "速记 / 录音转写文本", "分议题的结构化纪要＋待办清单"],
    ["数据汇总", "多个 Excel / CSV 文件", "合并成一张总表＋按维度统计"],
    ["资料综述", "几份不同来源的文档", "一份带来源标注的综述"],
    ["报告排版", "文字内容＋排版要求", "排好版的 Markdown 文档"],
  ];
  sc.forEach((d, i) => {
    const x = M + i * 2.47, w = 2.31;
    card(s, x, 1.8, w, 3.0);
    T(s, d[0], x + 0.22, 2.05, w - 0.44, 0.65, { fs: 15, b: 1, c: INK });
    T(s, PG([
      { t: "你给", o: { fs: 11.5, c: MUT, b: 1, psa: 2 } },
      { t: d[1], o: { fs: 12.5, c: BODY, psa: 8 } },
      { t: "它交", o: { fs: 11.5, c: OR, b: 1, psa: 2 } },
      { t: d[2], o: { fs: 12.5, c: ORD, b: 1 } },
    ]), x + 0.22, 2.8, w - 0.44, 1.9, { lsm: 1.22 });
  });
  s.addShape(P.shapes.RECTANGLE, { x: 0, y: 5.25, w: 13.33, h: 1.35, fill: { color: CARD }, line: { color: CARD, width: 0 } });
  T(s, PG([
    { t: "与粘贴给 ChatGPT 的三个差别", o: { b: 1, c: INK, fs: 14.5 } },
    { t: "① 不用手动粘贴——打开目录它自己读全部素材　② 直接交成品文件　③ 能跨多份资料对照：“把三场会议纪要合并，标出冲突的待办”", o: { c: BODY, fs: 14 } },
  ]), M, 5.5, 12.23, 0.9, { lsm: 1.35 });
  foot(s, 5);
  s.addNotes("让大家对号入座：每个岗位都能在其中找到自己上周做过的事。");
}

// ================= S6 能省多少事（图表） =================
{
  const s = sl();
  head(s, "第一部分 · 为什么聊天框不够用", "能省多少事", "同类任务耗时量级对比：自己动手 vs 一句话交给 opencode（单位：分钟）");
  s.addChart(P.charts.BAR, [
    { name: "现在（自己动手）", labels: ["纪要整理成模板报告", "给陌生项目加小功能", "100MB 日志提取错误并统计"], values: [60, 240, 45] },
    { name: "用 opencode", labels: ["纪要整理成模板报告", "给陌生项目加小功能", "100MB 日志提取错误并统计"], values: [5, 40, 4] },
  ], {
    x: M, y: 1.9, w: 7.7, h: 4.35, barDir: "bar",
    chartColors: ["C9B9A9", OR],
    chartArea: { fill: { color: "FFFFFF" } },
    catAxisLabelColor: INK, catAxisLabelFontSize: 13, catAxisLabelFontFace: F,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    catAxisOrientation: "maxMin", catAxisLineShow: false, valAxisLineShow: false,
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: BODY, dataLabelFontSize: 12, dataLabelFontFace: F,
    showLegend: true, legendPos: "b", legendFontSize: 12.5, legendFontFace: F, legendColor: BODY,
    barGapWidthPct: 90, barGapDepthPct: 40,
  });
  T(s, "量级参考，实际取决于任务复杂度（讲义 1.4）", M, 6.42, 7.7, 0.3, { fs: 12, c: MUT });
  const x = 8.65, w = 4.13;
  card(s, x, 1.9, w, 4.35, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "为什么快", x + 0.35, 2.2, w - 0.7, 0.4, { fs: 17, b: 1, c: INK });
  const why = [
    ["进得去", "打开目录，自己读全部素材"],
    ["跑得动", "自己写脚本、执行统计"],
    ["写得出", "把结果整理成文件交付"],
  ];
  why.forEach((d, i) => {
    const y = 2.85 + i * 0.92;
    T(s, d[0], x + 0.35, y, 1.15, 0.4, { fs: 16, b: 1, c: ORD });
    T(s, d[1], x + 1.6, y + 0.04, w - 1.95, 0.6, { fs: 13, c: BODY });
    if (i < 2) s.addShape(P.shapes.LINE, { x: x + 0.35, y: y + 0.68, w: w - 0.7, h: 0, line: { color: TINT, width: 0.75 } });
  });
  T(s, "重点是：重复性的整理、统计、梳理工作，它确实省时间。", x + 0.35, 5.6, w - 0.7, 0.6, { fs: 13.5, b: 1, c: INK, lsm: 1.3 });
  foot(s, 6);
  s.addNotes("柱状图是量级示意：240 分钟=半天，40 分钟=几十分钟。别承诺精确数字，强调重复性整理统计类任务的节省。");
}

// ================= S7 大模型 =================
{
  const s = sl();
  head(s, "第二部分 · Agent 的原理（全文地基）", "大模型：只看得见“上下文”的大脑", "给定一段前文、续写出下文——它的全部世界，就是当前输入的文字（context）");
  const inf = [
    ["没有眼睛和手", "上下文之外的东西，对它不存在", "粘贴 100MB 日志不可行"],
    ["不记忆", "每轮对话从上下文重新开始", "每个新对话都要重新介绍背景"],
    ["只会说", "输出的是文字，不是行动", "聊天框里再聪明，也只能给建议"],
  ];
  inf.forEach((d, i) => {
    const x = M + i * 4.13;
    card(s, x, 1.95, 3.93, 2.6);
    T(s, d[0], x + 0.35, 2.2, 3.25, 0.4, { fs: 17, b: 1, c: INK });
    T(s, d[1], x + 0.35, 2.72, 3.25, 0.65, { fs: 13.5, c: BODY, lsm: 1.25 });
    T(s, "→ " + d[2], x + 0.35, 3.7, 3.25, 0.65, { fs: 12.5, c: MUT, lsm: 1.2 });
  });
  T(s, "卡住的不是智力，是没有手。", M, 5.0, 12.23, 0.95, { fs: 40, b: 1, c: ORD });
  T(s, "后面的每个功能——Plan / Build、AGENTS.md、权限确认——都是同一个原理的不同侧面。", M, 6.05, 12.23, 0.4, { fs: 14.5, c: MUT });
  foot(s, 7);
  s.addNotes("本页是全文地基。三个推论一一对应后面三件套：没手→工具；不记忆→AGENTS.md；只会说→循环执行。");
}

// ================= S8 Agent = LLM + 工具 + 循环 =================
{
  const s = sl();
  head(s, "第二部分 · Agent 的原理", "跃迁：给大脑接上手", "Agent = LLM ＋ 工具 ＋ 循环");
  const box = (x, w, tag, txt, hot) => {
    card(s, x, 2.0, w, 1.75, hot ? { fill: OR, lineC: OR, noLine: true } : {});
    T(s, tag, x + 0.25, 2.22, w - 0.5, 0.35, { fs: 13, b: 1, c: hot ? "FFE3D2" : OR });
    T(s, txt, x + 0.25, 2.62, w - 0.5, 1.0, { fs: 13.5, c: hot ? "FFFFFF" : INK, lsm: 1.25, b: hot });
  };
  const plus = (x, t) => T(s, t, x, 2.58, 0.42, 0.6, { fs: 26, b: 1, c: MUT, a: "center", v: "middle" });
  box(M, 2.6, "大脑 · LLM", "给定前文\n续写下文");
  plus(3.22, "＋");
  box(3.72, 3.0, "手 · 工具", "读写文件 · 执行命令\n联网检索");
  plus(6.79, "＋");
  box(7.29, 3.0, "循环 · Loop", "思考 → 行动 → 观察\n直到任务完成");
  plus(10.36, "＝");
  box(10.86, 1.92, "Agent", "自主多步\n完成任务", true);
  // 对比表
  const rows = [
    [{ text: "组成", options: { b: 1, color: INK, fill: { color: CARD } } }, { text: "聊天应用", options: { b: 1, color: INK, fill: { color: CARD } } }, { text: "Agent（如 opencode）", options: { b: 1, color: ORD, fill: { color: CARD } } }],
    ["大脑（LLM）", "有", "有"],
    ["手（工具）", "无", "读写文件 · 执行命令 · 联网检索"],
    ["循环", "无", "思考 → 行动 → 观察，直到任务完成"],
  ];
  s.addTable(rows, {
    x: M, y: 4.1, w: 8.6, colW: [1.9, 1.6, 5.1], rowH: 0.42,
    fontFace: F, fontSize: 12.5, color: BODY, valign: "middle", align: "left",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.06,
  });
  T(s, "opencode 的三种形态", 9.55, 4.1, 3.2, 0.32, { fs: 13.5, b: 1, c: INK });
  const forms = [["桌面应用", "主线 · 所有人"], ["终端 TUI", "习惯命令行的工程师"], ["IDE 插件", "VS Code / Cursor 用户"]];
  forms.forEach((f, i) => {
    const y = 4.52 + i * 0.56;
    s.addShape(P.shapes.OVAL, { x: 9.55, y: y + 0.1, w: 0.1, h: 0.1, fill: { color: ORB }, line: { color: ORB, width: 0 } });
    T(s, f[0], 9.75, y, 1.35, 0.35, { fs: 13, b: 1, c: INK });
    T(s, f[1], 11.1, y, 1.75, 0.35, { fs: 12, c: MUT });
  });
  foot(s, 8);
  s.addNotes("等式是本讲最重要的一个模型：大脑聊天应用也有，差的是手和循环。opencode 三种形态，本课以桌面应用为主线。");
}

// ================= S9 主循环 =================
{
  const s = sl();
  head(s, "第二部分 · Agent 的原理", "主循环：一句指令，展开成十几轮", "界面上“正在读文件、正在跑脚本”，就是循环的外显");
  const ly = [1.78, 3.35, 5.2]; // 三条生命线 x
  const heads = [["你", M, 1.7], ["Agent · opencode", 5.05, 2.3], ["工作目录", 10.6, 2.18]];
  heads.forEach(hd => {
    chip(s, hd[0], hd[1], 1.8, hd[2], 0.52, { fill: DARK, c: DINK, fs: 14 });
  });
  const lx = [1.4, 6.2, 11.7]; // 生命线中心 x
  lx.forEach(x => s.addShape(P.shapes.LINE, { x, y: 2.32, w: 0.001, h: 2.75, line: { color: LINEC, width: 1, dashType: "dash" } }));
  // 循环框
  s.addShape(P.shapes.ROUNDED_RECTANGLE, { x: 4.75, y: 2.5, w: 7.9, h: 2.2, rectRadius: 0.12, fill: { color: CARD, transparency: 60 }, line: { color: ORB, width: 1, dashType: "dash" } });
  chip(s, "循环：思考 → 行动 → 观察 × N", 5.4, 2.38, 3.1, 0.34, { fill: "FFFFFF", lineC: ORB, c: ORD, fs: 12 });
  const msg = (y, from, to, txt, o = {}) => {
    const x1 = lx[from], x2 = lx[to];
    arrow(s, x1, y, x2, y, { c: o.c || OR, w: o.w || 1.5, d: o.d, noHead: o.noHead });
    const mid = (x1 + x2) / 2;
    T(s, txt, mid - 2.0, y - 0.34, 4.0, 0.3, { fs: 12.5, c: o.tc || (o.d ? MUT : INK), a: "center", b: o.b });
  };
  msg(2.85, 0, 1, "「统计 .log 的错误码，输出表格」", { b: 1 });
  msg(3.3, 1, 2, "读取 .log 文件");
  msg(3.72, 2, 1, "文件内容", { d: true, c: GREY });
  msg(4.14, 1, 2, "写入 error_report.md");
  msg(4.56, 2, 1, "写入成功", { d: true, c: GREY });
  arrow(s, lx[1], 5.07, lx[0], 5.07, { c: OR, w: 2 });
  T(s, "✓ 交付：error_report.md", 2.1, 4.73, 2.6, 0.3, { fs: 13.5, b: 1, c: ORD, a: "center" });
  T(s, "每次写文件、执行命令前，先经你确认（权限门禁）", 6.7, 4.73, 4.0, 0.28, { fs: 12, c: MUT });
  const props = [
    ["只看得见上下文", "打开目录让它自己读，是正解"],
    ["行动有边界、有门禁", "只碰你打开的目录；动手前要你确认"],
    ["循环支撑多步任务", "交付“做完的活”，不是“一段建议”"],
  ];
  props.forEach((p, i) => {
    const x = M + i * 4.13;
    card(s, x, 5.6, 3.93, 1.15, { flat: true });
    T(s, p[0], x + 0.3, 5.78, 3.35, 0.32, { fs: 14, b: 1, c: ORD });
    T(s, p[1], x + 0.3, 6.14, 3.35, 0.45, { fs: 12.5, c: BODY });
  });
  foot(s, 9);
  s.addNotes("沿时序走一遍：指令进来，agent 在循环里读文件、写文件，每轮动手前有权限门禁，最后交付成品。三条性质由循环直接推出。");
}

// ================= S10 Plan/Build =================
{
  const s = sl();
  head(s, "第二部分 · Agent 的原理", "Plan / Build：对循环的两种配置", "Plan 只说不做、零风险；方案经你确认后，过“确认门”切 Build 放开行动");
  const Y = 2.5, hh = 1.15;
  const nodes = [
    [M, 1.8, "下指令", "plan 模式", 0],
    [2.75, 2.3, "agent 说方案", "不动任何文件 · 零风险", 0],
    [5.5, 1.7, "方案对吗？", "", 1],
    [7.75, 2.1, "确认门：切 build", "你放行，循环开始动手", 2],
    [10.35, 2.43, "build：读 · 算 · 写", "思考 → 行动 → 观察", 0],
  ];
  nodes.forEach(n => {
    if (n[4] === 1) {
      s.addShape(P.shapes.DIAMOND, { x: n[0], y: Y - 0.36, w: n[1] + 0.2, h: hh + 0.75, fill: { color: "FFFFFF" }, line: { color: ORB, width: 1.25 } });
      T(s, n[2], n[0], Y + 0.02, n[1] + 0.2, 0.4, { fs: 13, b: 1, c: INK, a: "center" });
    } else if (n[4] === 2) {
      card(s, n[0], Y, n[1], hh, { fill: OR, lineC: OR, noLine: true });
      T(s, n[2], n[0] + 0.15, Y + 0.16, n[1] - 0.3, 0.4, { fs: 13.5, b: 1, c: "FFFFFF", a: "center" });
      T(s, n[3], n[0] + 0.15, Y + 0.6, n[1] - 0.3, 0.4, { fs: 11.5, c: "FFE3D2", a: "center" });
    } else {
      card(s, n[0], Y, n[1], hh);
      T(s, n[2], n[0] + 0.15, Y + 0.16, n[1] - 0.3, 0.4, { fs: 14, b: 1, c: INK, a: "center" });
      if (n[3]) T(s, n[3], n[0] + 0.12, Y + 0.6, n[1] - 0.24, 0.45, { fs: 11, c: MUT, a: "center" });
    }
  });
  arrow(s, 2.35, Y + hh / 2, 2.75, Y + hh / 2);
  arrow(s, 5.05, Y + hh / 2, 5.5, Y + hh / 2);
  arrow(s, 7.4, Y + hh / 2, 7.75, Y + hh / 2, { w: 2 });
  arrow(s, 9.85, Y + hh / 2, 10.35, Y + hh / 2);
  // 不对：回到方案
  arrow(s, 6.4, Y - 0.36, 6.4, 1.98, { noHead: true, c: GREY, w: 1.25 });
  arrow(s, 6.4, 1.98, 3.9, 1.98, { noHead: true, c: GREY, w: 1.25 });
  arrow(s, 3.9, 1.98, 3.9, Y, { c: GREY, w: 1.25, d: true });
  T(s, "不对 · 继续在 plan 里调整", 4.1, 1.74, 3.6, 0.24, { fs: 12, c: MUT });
  // 对：标签
  T(s, "对", 7.44, Y + hh / 2 - 0.42, 0.5, 0.28, { fs: 12.5, b: 1, c: ORD });
  // build 自环
  s.addShape(P.shapes.OVAL, { x: 11.35, y: Y + 1.3, w: 0.5, h: 0.5, fill: { color: "FFFFFF", transparency: 100 }, line: { color: ORB, width: 1.25, dashType: "dash" } });
  arrow(s, 11.85, Y + 1.55, 12.15, Y + 1.2, { c: ORB, w: 1.25, d: true });
  T(s, "未完成 · 继续循环", 10.35, Y + 1.85, 2.4, 0.28, { fs: 11.5, c: MUT });
  // 完成
  chip(s, "✓ 成品写入工作目录", 9.2, 4.75, 3.55, 0.5, { fill: CARD, lineC: ORB, c: ORD, fs: 14 });
  arrow(s, 11.55, Y + hh, 11.0, 4.75, { c: OR, w: 1.75 });
  // 模式表
  const modes = [
    ["plan", "思考＋说方案，不动任何文件", "对方案 —— 零风险"],
    ["build", "放开行动：读、算、写", "执行并交付"],
  ];
  modes.forEach((m, i) => {
    const x = M + i * 6.27;
    card(s, x, 5.55, 5.96, 1.2, { flat: true });
    T(s, m[0], x + 0.35, 5.72, 1.1, 0.45, { fs: 19, b: 1, c: ORD, mono: true });
    T(s, m[1], x + 1.6, 5.75, 4.1, 0.35, { fs: 13.5, c: INK, b: 1 });
    T(s, m[2], x + 1.6, 6.14, 4.1, 0.35, { fs: 12.5, c: MUT });
  });
  foot(s, 10);
  s.addNotes("橙色框是确认门：从说到做的切换点。方案对了再切 build，不对继续在 plan 里改——这是后面所有实操的节奏。");
}

// ================= S11 安装五步 =================
{
  const s = sl();
  head(s, "第三部分 · 装上就用：第一个五分钟", "安装：企业内部五步", "opencode 是企业版部署，不在公开网上下载");
  const steps = [
    ["申请 token plan", "提交使用申请，获取授权（企业内部申请系统）"],
    ["申请安装包下发", "审批通过后申请下发，或由 IT 统一推送"],
    ["内部商店安装", "找到 opencode 点击安装，像装普通软件一样"],
    ["打开并登录", "企业账号登录；模型自动配置，不填密钥"],
    ["检查", "按下方清单逐项确认"],
  ];
  steps.forEach((st, i) => {
    const x = M + i * 2.47, w = 2.31;
    card(s, x, 1.85, w, 2.35);
    numDot(s, i + 1, x + 0.25, 2.08, 0.42);
    T(s, st[0], x + 0.2, 2.65, w - 0.38, 0.6, { fs: 13, b: 1, c: INK });
    T(s, st[1], x + 0.25, 3.28, w - 0.5, 0.85, { fs: 11.5, c: BODY, lsm: 1.2 });
    if (i < 4) arrow(s, x + w, 3.0, x + 2.47, 3.0, { c: OR, w: 2.25 });
  });
  card(s, M, 4.65, 12.23, 1.95, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "第 5 步 · 检查清单", M + 0.4, 4.9, 4, 0.35, { fs: 15, b: 1, c: INK });
  ["应用能正常打开、不报错", "企业账号登录成功", "新建对话发一句“你好”，能收到回复"].forEach((c, i) => {
    checkRow(s, c, M + 0.4 + i * 4.0, 5.42, 3.8, { b: 1, c: INK });
  });
  T(s, "任何一项卡住：回内部申请系统查审批状态，或联系 IT。走命令行的环境：完成步骤 1–2 后，装好输入 opencode 启动。", M + 0.4, 5.95, 11.5, 0.4, { fs: 12.5, c: MUT });
  foot(s, 11);
  s.addNotes("第 4 步强调“不填密钥”——企业版自动配置模型，这是和网上教程最大的差别。");
}

// ================= S12 认识界面 =================
{
  const s = sl();
  head(s, "第三部分 · 装上就用", "认识界面：三个区域", "对话区看它在干什么，输入框下指令，右下角看当前模式");
  // 线框图
  card(s, M, 1.75, 7.3, 4.65, { fill: "FFFFFF", lineC: LINEC, lw: 1 });
  card(s, M + 0.25, 2.0, 6.8, 2.85, { fill: "FBF8F4", flat: true, noLine: true, r: 0.06 });
  numDot(s, 1, M + 0.45, 2.18, 0.34, { fs: 12 });
  T(s, "对话区", M + 0.9, 2.2, 2, 0.3, { fs: 13, b: 1, c: INK });
  T(s, PG([
    { t: "正在读取 a.log（2.3 MB）…", o: { c: MUT, fs: 12.5, psa: 7 } },
    { t: "✓ 已提取报错行 1,204 条，识别 6 类错误码", o: { c: BODY, fs: 12.5, psa: 7 } },
    { t: "已写入 error_report.md，请查收", o: { c: ORD, fs: 12.5, b: 1 } },
  ]), M + 0.95, 2.72, 5.9, 1.6, { lsm: 1.25 });
  card(s, M + 0.25, 5.05, 5.3, 0.6, { fill: "FFFFFF", lineC: LINEC, flat: true, r: 0.1 });
  numDot(s, 2, M + 0.4, 5.18, 0.34, { fs: 12 });
  T(s, "给 agent 下指令…", M + 0.9, 5.2, 3.5, 0.32, { fs: 13, c: MUT });
  chip(s, "③ 模式：plan ⇄ build（Tab 切换）", M + 4.6, 5.75, 2.7, 0.42, { fill: "FFFFFF", lineC: ORB, c: ORD, fs: 11.5 });
  T(s, "② 输入框", M + 5.75, 5.14, 1.5, 0.3, { fs: 12, b: 1, c: INK });
  // 右列
  const x = 8.35, w = 4.43;
  card(s, x, 1.75, w, 2.6);
  T(s, "斜杠命令（输入框打 / 弹出）", x + 0.3, 1.98, w - 0.6, 0.32, { fs: 14, b: 1, c: INK });
  const cmds = [["/new", "新对话，换话题时用"], ["/init", "生成项目说明 AGENTS.md（第四部分）"], ["/help", "查看全部命令"]];
  cmds.forEach((c, i) => {
    const y = 2.45 + i * 0.58;
    T(s, c[0], x + 0.3, y, 0.85, 0.34, { fs: 14, b: 1, c: ORD, mono: true });
    T(s, c[1], x + 1.2, y + 0.02, w - 1.5, 0.5, { fs: 12.5, c: BODY });
  });
  card(s, x, 4.6, w, 1.8, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "打开工作目录：划定边界", x + 0.3, 4.82, w - 0.6, 0.32, { fs: 14, b: 1, c: INK });
  T(s, "「打开文件夹」挑一个你真实在用的目录——测试日志、代码仓库、工作笔记都行。它不会动这个文件夹之外的任何东西。", x + 0.3, 5.22, w - 0.6, 1.05, { fs: 12.5, c: BODY, lsm: 1.28 });
  foot(s, 12);
  s.addNotes("对着界面指认三个区域即可；斜杠命令先记 /new 和 /init。打开目录=划定 agent 的行动边界。");
}

// ================= S13 第一条指令 =================
{
  const s = sl();
  head(s, "第三部分 · 装上就用", "第一条指令：Plan → 确认 → Build", "按岗位选一个场景，切到 Plan 模式发出去");
  const mk = (x, title, txt) => {
    const t = term(s, x, 1.85, 5.95, 2.9, title);
    T(s, PG([
      { t: "❯ " + txt, o: { c: DINK, fs: 13.5, lsm: 1.35 } },
    ]), t.x, t.y + 0.1, t.w, t.h);
  };
  mk(M, "场景一 · 日志统计（测试 / 数据 / 工程）", "请读取当前目录下所有 .log 文件，提取报错行，按错误码统计频次，最后输出一个 Markdown 表格。先在 Plan 模式下说说你的处理思路。");
  mk(6.83, "场景二 · 周报整理（非编程岗 / 职能 / 管理）", "请读取当前目录下所有工作记录，按时间线整理成本周周报，包含本周完成事项、进行中事项、下周计划。先在 Plan 模式下说说你的处理思路。");
  s.addShape(P.shapes.RECTANGLE, { x: 0, y: 5.15, w: 13.33, h: 1.45, fill: { color: CARD }, line: { color: CARD, width: 0 } });
  T(s, PG([
    { t: "它回复处理思路之后", o: { b: 1, c: INK, fs: 14.5 } },
    { t: "对 → 切 build，回复“思路没问题，开始执行”　·　不对 → 继续在 Plan 里追问或调整", o: { c: ORD, fs: 14, b: 1 } },
    { t: "这五分钟里：你出手 3 次（打开目录 → 下指令 → 确认方案），其余全部由 agent 循环完成——你没复制素材、没写代码、没开命令行。", o: { c: BODY, fs: 13 } },
  ]), M, 5.38, 12.23, 1.1, { lsm: 1.4 });
  foot(s, 13);
  s.addNotes("现场演示任选一个场景跑通；强调新手要建立的节奏感——什么时候轮到我。");
}

// ================= S14 三件套 =================
{
  const s = sl();
  head(s, "第三部分 · 装上就用", "五分钟之后：配齐三件套", "opencode 干活，VS Code 是你看和改的工作台，Git 是让你放心放手的安全网");
  // 中心
  card(s, 5.11, 3.0, 3.1, 1.5, { fill: CARD, lineC: ORB, lw: 2 });
  T(s, "工作目录（项目）", 5.11, 3.25, 3.1, 0.4, { fs: 16, b: 1, c: ORD, a: "center" });
  T(s, "你的文件都在这里", 5.11, 3.7, 3.1, 0.35, { fs: 12.5, c: MUT, a: "center" });
  // 三卫星
  const sat = (x, y, name, role, lab, ly) => {
    card(s, x, y, 2.75, 1.15);
    T(s, name, x + 0.25, y + 0.16, 2.3, 0.38, { fs: 15.5, b: 1, c: INK });
    T(s, role, x + 0.25, y + 0.58, 2.3, 0.35, { fs: 12, c: OR, b: 1 });
    arrow(s, x + 2.75, y + 0.58, 5.11, 3.55, { c: ORB, w: 1.75 });
    T(s, lab, x + 2.85, ly, 1.95, 0.28, { fs: 12, c: GREY, a: "center" });
  };
  sat(0.75, 1.85, "opencode", "干活", "写成品 · 改文件", 2.46);
  sat(0.75, 4.45, "VS Code", "看和改", "打开 · 查看 · diff", 4.5);
  // Git 右侧
  card(s, 9.85, 3.15, 2.75, 1.15);
  T(s, "Git", 10.1, 3.31, 2.3, 0.38, { fs: 15.5, b: 1, c: INK });
  T(s, "安全网", 10.1, 3.73, 2.3, 0.35, { fs: 12, c: OR, b: 1 });
  arrow(s, 8.21, 3.45, 9.85, 3.55, { c: ORB, w: 1.75 });
  T(s, "每任务存档", 8.32, 3.02, 1.45, 0.28, { fs: 12, c: GREY, a: "center" });
  arrow(s, 9.85, 4.0, 8.21, 3.9, { c: GREY, w: 1.5, d: true });
  T(s, "随时回退", 8.32, 4.12, 1.45, 0.28, { fs: 12, c: GREY, a: "center" });
  // 底部两栏
  card(s, M, 5.62, 6.0, 1.48, { flat: true });
  T(s, PG([
    { t: "VS Code：看和改的工作台", o: { b: 1, c: INK, fs: 13 } },
    { t: "写 Markdown 边写边预览 · 看改动 diff（红绿对照，审核核心）· 目录树浏览 · 装 IDE 插件嵌入编辑器", o: { c: BODY, fs: 12 } },
  ]), M + 0.3, 5.8, 5.5, 1.2, { lsm: 1.22 });
  card(s, 6.78, 5.62, 6.0, 1.48, { flat: true });
  T(s, PG([
    { t: "Git：给文件夹装上「存档点」", o: { b: 1, c: INK, fs: 13 } },
    { t: "存档＝拍快照 · diff＝改了什么 · 回退＝回到存档点；不用学命令，让 agent 替你做。", o: { c: BODY, fs: 12 } },
    { t: "打开目录第一句话：先让 agent 初始化 Git——安全网要在任务之前存在。", o: { c: ORD, fs: 12, b: 1 } },
  ]), 7.08, 5.78, 5.5, 1.3, { lsm: 1.22 });
  foot(s, 14);
  s.addNotes("三件套围绕同一个工作目录各司其职。VS Code 企业环境优先内部商店；Git 多由 IT 统一安装，Mac 多数自带。");
}

// ================= S15 AGENTS.md =================
{
  const s = sl();
  head(s, "第四部分 · 让它更懂你的工作", "AGENTS.md：写一次，每轮生效", "模型不记忆，每轮对话从上下文重新开始——把“项目须知”放进目录，opencode 每次启动自动读");
  // 左：问题→方案
  card(s, M, 1.9, 5.3, 1.5, { flat: true });
  T(s, PG([
    { t: "没有它的时候", o: { b: 1, c: MUT, fs: 13.5 } },
    { t: "每次新对话都要重新介绍：“我是做什么的、bin 是什么意思”", o: { c: BODY, fs: 13.5 } },
  ]), M + 0.3, 2.12, 4.75, 1.1, { lsm: 1.3 });
  arrow(s, 3.2, 3.4, 3.2, 3.75, { w: 2 });
  card(s, M, 3.75, 5.3, 2.6, { fill: CARD, lineC: ORB, lw: 1.5 });
  T(s, "AGENTS.md ＝ 项目须知", M + 0.3, 3.98, 4.75, 0.38, { fs: 16, b: 1, c: ORD });
  T(s, PG([
    { t: "放在项目目录里，opencode 每次启动自动读", o: { c: INK, fs: 13.5, psa: 6 } },
    { t: "写一次，每轮对话自动生效，背景不再重复介绍", o: { c: INK, fs: 13.5, psa: 6 } },
    { t: "一键生成：输入 /init，它读你的目录、问几个问题，生成初版", o: { c: BODY, fs: 13.5 } },
  ]), M + 0.3, 4.45, 4.75, 1.7, { lsm: 1.3 });
  // 右：四段模板
  const t = term(s, 6.35, 1.9, 6.43, 4.45, "AGENTS.md 四段模板（/init 后你补上岗位信息）");
  T(s, PG([
    { t: "# 角色与背景", o: { c: ORB, fs: 13.5, b: 1, psa: 2 } },
    { t: "我是 [部门/岗位] 的 [身份]，主要负责 [工作内容]", o: { c: DINK, fs: 12.5, psa: 8 } },
    { t: "# 术语解释", o: { c: ORB, fs: 13.5, b: 1, psa: 2 } },
    { t: "bin：测试结果分类 · lot：同一批次的产品", o: { c: DINK, fs: 12.5, psa: 8 } },
    { t: "# 常用文件 / 命令", o: { c: ORB, fs: 13.5, b: 1, psa: 2 } },
    { t: ".log 是机台测试日志 · 统计用 python，输出 Markdown 表格", o: { c: DINK, fs: 12.5, psa: 8 } },
    { t: "# 注意事项", o: { c: ORB, fs: 13.5, b: 1, psa: 2 } },
    { t: "涉及生产数据先确认再动 · 输出用中文，结果导向", o: { c: DINK, fs: 12.5 } },
  ]), t.x, t.y, t.w, t.h, { lsm: 1.18 });
  s.addShape(P.shapes.RECTANGLE, { x: 0, y: 6.5, w: 13.33, h: 0.56, fill: { color: CARD }, line: { color: CARD, width: 0 } });
  T(s, "编写要点：只写「AI 不知道、但你岗位必需」的——术语、文件格式、常用命令、红线；不要写它本来就有的默认设定。", M, 6.63, 12.23, 0.32, { fs: 13.5, b: 1, c: ORD });
  foot(s, 15);
  s.addNotes("AGENTS.md 是解决“不记忆”的那一块。/init 生成初版后，人工补的才是价值所在。");
}

// ================= S16 门禁与会话 =================
{
  const s = sl();
  head(s, "第四部分 · 让它更懂你的工作 / 第五部分 · 日常节奏", "行动有门禁，会话要卫生", "权限：每次改文件、跑命令前先问你，默认不自动执行");
  card(s, M, 1.85, 6.35, 4.75);
  T(s, "权限：行动前的门禁", M + 0.35, 2.1, 5.6, 0.38, { fs: 16, b: 1, c: INK });
  const perm = [
    ["第一次用、不太放心", "保持每次都问（默认就是）"],
    ["生产数据、重要文件", "一定保持每次都问"],
    ["自己的练习目录", "可以放开权限，加快节奏"],
    ["看它要跑不认识的命令", "先让它解释命令做什么，再决定批不批"],
  ];
  perm.forEach((p, i) => {
    const y = 2.65 + i * 0.92;
    if (i) s.addShape(P.shapes.LINE, { x: M + 0.35, y: y - 0.16, w: 5.65, h: 0, line: { color: LINEC, width: 0.75 } });
    T(s, p[0], M + 0.35, y, 5.65, 0.32, { fs: 13.5, b: 1, c: INK });
    T(s, "→ " + p[1], M + 0.35, y + 0.34, 5.65, 0.32, { fs: 12.5, c: BODY });
  });
  const x2 = 7.15, w2 = 5.63;
  card(s, x2, 1.85, w2, 2.5);
  T(s, "会话卫生", x2 + 0.35, 2.1, 4.9, 0.38, { fs: 16, b: 1, c: INK });
  const hy = [
    ["换主题", "/new —— 背景从 AGENTS.md 重新加载，不会丢"],
    ["同一任务没做完", "接着聊，不用新建"],
    ["聊很久变慢", "/new 重开，或 /compact 压缩当前对话"],
  ];
  hy.forEach((p, i) => {
    const y = 2.6 + i * 0.55;
    T(s, p[0], x2 + 0.35, y, 1.95, 0.35, { fs: 13, b: 1, c: INK });
    T(s, p[1], x2 + 2.3, y + 0.02, w2 - 2.6, 0.45, { fs: 12, c: BODY });
  });
  card(s, x2, 4.55, w2, 2.05, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "什么时候先 Plan", x2 + 0.35, 4.78, 4.9, 0.35, { fs: 15, b: 1, c: INK });
  const pl = [["问问题、查信息", "直接问"], ["改一个文件、小调整", "直接说，看一眼结果"], ["改多个文件、跑统计", "先 Plan，确认再 Build"], ["生产环境、不可逆操作", "一定先 Plan，逐条确认"]];
  pl.forEach((p, i) => {
    const y = 5.22 + i * 0.33;
    T(s, p[0], x2 + 0.35, y, 2.5, 0.3, { fs: 12, c: BODY });
    T(s, p[1], x2 + 2.95, y, w2 - 3.3, 0.3, { fs: 12, c: i > 1 ? ORD : MUT, b: i > 1 });
  });
  T(s, "准则：不确定会不会搞坏东西，就先 Plan——plan 模式零风险。", M, 6.75, 6.35, 0.32, { fs: 13, b: 1, c: ORD });
  foot(s, 16);
  s.addNotes("门禁默认全开（每次都问）；会话卫生三条对应 /new 与 /compact；先 Plan 的判断按任务风险分级。");
}

// ================= S17 出错与纠偏 =================
{
  const s = sl();
  head(s, "第五部分 · 日常节奏与审核", "出错了怎么办；答得不好，怎么纠", "正常使用基本不会把电脑搞坏：有边界、有门禁、有撤销（Git 仓库下支持 /undo 回退上一轮改动）");
  card(s, M, 1.95, 5.3, 4.3);
  T(s, "出错了怎么办", M + 0.35, 2.2, 4.6, 0.38, { fs: 16, b: 1, c: INK });
  const err = [
    ["它改错了文件", "/undo 撤回（需 Git 仓库），或手动改回"],
    ["它理解错了意思", "不要顺着走，/new 重新描述需求"],
    ["它跑的命令你不放心", "别批准，先让它解释命令做什么"],
    ["对话越来越乱", "/new 重开"],
  ];
  err.forEach((p, i) => {
    const y = 2.75 + i * 0.85;
    if (i) s.addShape(P.shapes.LINE, { x: M + 0.35, y: y - 0.14, w: 4.6, h: 0, line: { color: LINEC, width: 0.75 } });
    T(s, p[0], M + 0.35, y, 4.6, 0.32, { fs: 13.5, b: 1, c: INK });
    T(s, "→ " + p[1], M + 0.35, y + 0.34, 4.6, 0.32, { fs: 12.5, c: BODY });
  });
  const x2 = 6.35, w2 = 6.43;
  card(s, x2, 1.95, w2, 4.3);
  T(s, "答得不好：多数是没拿到足够的约束", x2 + 0.35, 2.2, 5.7, 0.38, { fs: 16, b: 1, c: INK });
  const rows = [
    [{ text: "情况", options: { b: 1, color: INK, fill: { color: CARD } } }, { text: "不要这样", options: { b: 1, color: INK, fill: { color: CARD } } }, { text: "这样做", options: { b: 1, color: ORD, fill: { color: CARD } } }],
    ["方向跑偏", "顺着越聊越远", "停下：“我要的是 X，不是 Y”；偏差大就 /new"],
    ["太笼统", "“再说详细点”", "给样例：“像这样：xxx，按这个格式重写”"],
    ["多给了不需要的", "“不要这些”", "明确：“只要 X 部分，去掉 Y 和 Z”"],
    ["漏了要的", "“你漏了东西”", "指出：“还缺一个按周汇总的维度”"],
    ["理解错术语", "反复纠正同一个词", "“在我们这里它的意思是…”，并补进 AGENTS.md"],
  ];
  s.addTable(rows, {
    x: x2 + 0.35, y: 2.72, w: w2 - 0.7, colW: [1.35, 1.85, 2.88], rowH: [0.4, 0.64, 0.64, 0.64, 0.64, 0.64],
    fontFace: F, fontSize: 11.5, color: BODY, valign: "middle",
    border: { type: "solid", pt: 0.5, color: LINEC }, fill: { color: "FFFFFF" }, margin: 0.05,
  });
  T(s, "关键习惯：发现走偏尽早停——方向性问题用 /new 重开，成本最低。", M, 6.5, 12.23, 0.35, { fs: 13.5, b: 1, c: ORD });
  foot(s, 17);
  s.addNotes("左列是事故处理，右列是质量问题。核心口诀：答不好先补约束，走偏尽早 /new。");
}

// ================= S18 审核标准 =================
{
  const s = sl();
  head(s, "第五部分 · 日常节奏与审核", "怎么审核它的输出");
  T(s, "像审核一个勤快、但不懂行的实习生交来的活", M, 1.75, 12.23, 0.7, { fs: 30, b: 1, c: INK });
  T(s, "不全盘接受，也不一次不满意就全盘否定。", M, 2.5, 12.23, 0.35, { fs: 15, c: MUT });
  const items = [
    ["事实 / 数字对不对", "抽查关键数据，与原始文件对照——数字问题零容忍"],
    ["格式符合要求吗", "对照你要的格式：表格列、标题层级"],
    ["有没有臆造内容", "警惕它“补”出来的你没给过的信息，问“这条数据来源是哪个文件”"],
    ["逻辑通顺吗", "通读一遍，看结论是否站得住；有断点让它重梳"],
    ["边界情况覆盖了吗", "想一个特殊输入，看它处理了没有"],
  ];
  items.forEach((it, i) => {
    const y = 3.15 + i * 0.62;
    if (i) s.addShape(P.shapes.LINE, { x: M, y: y - 0.1, w: 12.23, h: 0, line: { color: LINEC, width: 0.75 } });
    checkRow(s, "", M, y + 0.08, 0.2);
    T(s, it[0], M + 0.5, y, 3.4, 0.4, { fs: 15, b: 1, c: INK });
    T(s, it[1], 4.2, y + 0.03, 8.5, 0.4, { fs: 13.5, c: BODY });
  });
  card(s, M, 6.3, 12.23, 0.72, { fill: CARD, lineC: ORB, lw: 1.25 });
  T(s, "红线：涉及生产数据、对外交付、重要决策的内容，必须人工复核——opencode 是加速器，不替你负责。", M + 0.35, 6.49, 11.5, 0.38, { fs: 14.5, b: 1, c: ORD });
  foot(s, 18);
  s.addNotes("审核标准一句话：当实习生交来的活审。五项检查走一遍，最后是红线——责任永远在人。");
}

// ================= S19 实习生测试 =================
{
  const s = sl();
  head(s, "第六部分 · 哪些工作可以交出去", "实习生测试法");
  card(s, M, 1.7, 12.23, 1.75, { fill: CARD, lineC: ORB, lw: 1.5 });
  T(s, "“这件事，交给一个看不懂我的专业、但会熟练操作电脑、从不嫌烦的实习生，我能说清楚让他做吗？”", M + 0.45, 1.95, 11.3, 0.85, { fs: 19, b: 1, c: INK, lsm: 1.3 });
  T(s, "能说清楚 → 大概率可以交给 opencode；说不清楚、得靠你自己判断 → 暂时不适合。Agent 不会读心。", M + 0.45, 2.95, 11.3, 0.35, { fs: 13.5, c: BODY });
  // 左：适合信号
  card(s, M, 3.75, 6.6, 2.95);
  T(s, "适合交出去的信号", M + 0.35, 3.98, 5.9, 0.36, { fs: 15.5, b: 1, c: INK });
  const sig = [["重复做", "每周/每月来一遍：周报、汇总、巡检"], ["规则明确", "有固定格式或步骤：按模板填、按维度统计"], ["有现成素材", "输入是已有文件：日志、记录、表格"], ["机械耗时", "翻几百行找规律、合并十几个表格"], ["容许迭代", "出一版草稿你再改"]];
  sig.forEach((p, i) => {
    const y = 4.42 + i * 0.4;
    s.addShape(P.shapes.OVAL, { x: M + 0.38, y: y + 0.09, w: 0.1, h: 0.1, fill: { color: ORB }, line: { color: ORB, width: 0 } });
    T(s, p[0], M + 0.6, y, 1.5, 0.32, { fs: 13.5, b: 1, c: ORD });
    T(s, p[1], M + 2.15, y + 0.02, 4.3, 0.32, { fs: 12, c: BODY });
  });
  T(s, "满足 3 条以上 → 强烈建议试一下；一两条 → 预期别太高；零条 → 暂时别勉强。", M + 0.35, 6.36, 5.9, 0.3, { fs: 11.5, c: MUT });
  // 右：不适合
  const x2 = 7.4, w2 = 5.38;
  card(s, x2, 3.75, w2, 2.95, { fill: "FBF6F1" });
  T(s, "这些暂时不适合", x2 + 0.35, 3.98, 4.7, 0.36, { fs: 15.5, b: 1, c: MUT });
  const no = [
    ["需要你个人判断的决策", "它不知道你的取舍标准"],
    ["人际、政治、敏感信息", "别把不该外泄的内容喂进去"],
    ["没有任何素材、凭空创造", "它会臆造，不可信"],
    ["一次性、学它比自己做还贵", "不划算"],
  ];
  no.forEach((p, i) => {
    const y = 4.5 + i * 0.52;
    T(s, "×", x2 + 0.35, y, 0.3, 0.32, { fs: 14, b: 1, c: "B04A3A" });
    T(s, p[0], x2 + 0.68, y, w2 - 1.0, 0.32, { fs: 13.5, b: 1, c: INK });
    T(s, p[1], x2 + 0.68, y + 0.3, w2 - 1.0, 0.28, { fs: 11.5, c: MUT });
  });
  foot(s, 19);
  s.addNotes("测试法是唯一需要记住的判断工具：能不能说清楚。信号表是它的展开版。");
}

// ================= S20 岗位切入点 =================
{
  const s = sl();
  head(s, "第六部分 · 哪些工作可以交出去", "按岗位找切入点", "从每个岗位最有“重复感”的那件事开始");
  const jobs = [
    ["测试 / 工艺 / 数据工程师", ["批量日志的错误码提取与频次统计", "测试数据按 lot / wafer / bin 良率汇总", "陌生测试程序的调用关系梳理", "实验数据整理成 DOE 矩阵"]],
    ["产品 / 应用工程师", ["按 datasheet / spec 生成检查清单与 SOP", "多份技术文档要点对比综述", "结合日志和规格做客户问题根因排查"]],
    ["职能 / 行政 / 运营", ["会议纪要按议题归并＋待办提取", "多份周报合并成月报", "数据表格合并与按维度统计", "按固定模板排版报告"]],
    ["管理岗", ["多来源信息的综述与对比", "项目进度：多份状态报告汇总", "决策所需的数据整理与可视化"]],
  ];
  jobs.forEach((j, i) => {
    const x = M + (i % 2) * 6.27, y = 1.85 + Math.floor(i / 2) * 2.3;
    card(s, x, y, 5.96, 2.1);
    T(s, j[0], x + 0.35, y + 0.2, 5.3, 0.36, { fs: 15.5, b: 1, c: ORD });
    T(s, PG(j[1].map(t => ({ t: "· " + t, o: { c: BODY, fs: 12.5 } }))), x + 0.35, y + 0.66, 5.3, 1.35, { lsm: 1.3, psa: 4 });
  });
  T(s, "找不到你的岗位？回到上一页，把上周的工作清单逐项过一遍“实习生测试”。", M, 6.5, 12.23, 0.35, { fs: 13.5, c: MUT });
  foot(s, 20);
  s.addNotes("每个岗位读一个最典型的例子即可，其余留给大家自己扫。");
}

// ================= S21 三步法 =================
{
  const s = sl();
  head(s, "第六部分 · 哪些工作可以交出去", "第一个真实任务：三步法", "心态：选小一点、期望放低一点——跑通一个完整循环，比第一次就追求完美更重要");
  const steps = [
    ["试水", ["选一个本周要做、做砸了也没关系的任务", "素材放进一个文件夹", "越具体越好：“统计这个文件夹里所有 CSV 的行数”优于“帮我分析数据”"]],
    ["验证", ["Plan 出方案 → 你确认 → Build 执行", "按 5.5 的清单审核输出", "有问题就按 5.4 纠偏"]],
    ["扩散", ["同类型任务下次照这次的方式交", "把标准提问方式存下来当模板", "坑和口径写回 AGENTS.md"]],
  ];
  steps.forEach((st, i) => {
    const x = M + i * 4.13;
    card(s, x, 1.9, 3.93, 3.35);
    T(s, String(i + 1), x + 0.3, 2.08, 1.0, 0.8, { fs: 44, b: 1, c: OR });
    T(s, st[0], x + 0.95, 2.35, 2.5, 0.45, { fs: 20, b: 1, c: INK });
    T(s, PG(st[1].map(t => ({ t: "· " + t, o: { c: BODY, fs: 12.5 } }))), x + 0.3, 3.1, 3.35, 2.0, { lsm: 1.3, psa: 6 });
    if (i < 2) arrow(s, x + 3.93, 3.55, x + 4.13, 3.55, { c: ORB, w: 2 });
  });
  card(s, M, 5.55, 12.23, 1.35, { fill: CARD, lineC: TINT, lw: 1 });
  T(s, "当天上手 Checklist", M + 0.35, 5.72, 4, 0.32, { fs: 13.5, b: 1, c: INK });
  ["走完企业安装五步", "打开一个真实文件夹", "/init 生成 AGENTS.md 并补术语", "问一个项目相关问题验证", "Plan→确认→Build 拿到交付物", "按清单审核，有问题就纠偏"].forEach((c, i) => {
    checkRow(s, c, M + 0.35 + (i % 3) * 4.05, 6.14 + Math.floor(i / 3) * 0.4, 3.9, { fs: 12 });
  });
  foot(s, 21);
  s.addNotes("三步法是本讲的落点：回去这周就选一个任务试水。Checklist 六项是当天上手的验证。");
}

// ================= S22 结语 =================
{
  const s = sl(true);
  T(s, "结语 · 两个问题", M, 0.75, 8, 0.35, { fs: 15, b: 1, c: ORB, cs: 2 });
  T(s, "到这里，你已经能把一件事交给 agent。", M, 1.25, 12, 0.55, { fs: 26, b: 1, c: DINK });
  T(s, "真正改变工作方式的，是下面两个问题：", M, 1.9, 12, 0.4, { fs: 15, c: DMUT });
  const q = (y, n, txt) => {
    card(s, M, y, 12.23, 1.35, { fill: DCARD, lineC: DLINE, lw: 1 });
    T(s, n, M + 0.4, y + 0.3, 1.3, 0.75, { fs: 40, b: 1, c: ORB, mono: true });
    T(s, txt, M + 1.6, y + 0.22, 10.2, 0.95, { fs: 16.5, b: 1, c: DINK, lsm: 1.3, v: "middle" });
  };
  q(2.5, "Q1", "如果每天的工作都用 Markdown 记录在一个项目里——月底的周报、月报、季度汇报会发生什么？");
  q(4.05, "Q2", "如果每周重复的 Excel 统计、截图、分析，能沉淀成 agent 批量执行的工作流——会发生什么？");
  T(s, "答案在下一讲：《opencode 进阶与实战》", M, 5.75, 12.23, 0.45, { fs: 18, b: 1, c: ORB });
  T(s, "Markdown 汇报项目 · 重复任务沉淀为 skill · 完整数据项目实战 · 提问五段式与确认门 · 从个人到团队", M, 6.28, 10.5, 0.35, { fs: 13, c: DMUT });
  T(s, "❯ 下一讲见", M, 6.85, 6, 0.35, { fs: 14, b: 1, c: ORB, mono: true });
  foot(s, 22, true);
  s.addNotes("留问题不给答案，制造期待；下一讲开篇就回答这两个问题。");
}

P.writeFile({ fileName: OUT }).then(() => console.log("written:", OUT));
