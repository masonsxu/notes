// AI Agent 进化之路 — 深色科技风 PPT（时间线贯穿）
// 运行: bun build.js
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const FA = require("react-icons/fa");

const OUT = "/tmp/ppt-build/AI-Agent-进化之路.pptx";

// ---------- 设计系统 ----------
const C = {
  bg: "0A0F1E", card: "141B31", card2: "10182E", cardLine: "263154",
  ink: "F5F7FF", body: "C7D0E4", mut: "8A94B0", faint: "5A6480",
  line: "2A3554", dot: "1E2A4A",
  s1: "22D3EE", s2: "A78BFA", s3: "34D399", amber: "FBBF24",
};
const F = "Microsoft YaHei";
const MONO = "Courier New";
const STAGES = [
  { n: "01", en: "Prompt Engineering", cn: "把话说对", color: C.s1 },
  { n: "02", en: "Context Engineering", cn: "把料喂对", color: C.s2 },
  { n: "03", en: "Harness Engineering", cn: "把事做成", color: C.s3 },
];
const T = (t, o) => ({ text: t, options: { fontFace: F, ...o } });

// ---------- 图标 ----------
const iconCache = {};
async function icon(Comp, color) {
  const key = Comp.name + color;
  if (iconCache[key]) return iconCache[key];
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: "256" }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return (iconCache[key] = "image/png;base64," + png.toString("base64"));
}

(async () => {
  const I = {};
  const defs = {
    listol: [FA.FaListOl, C.s1], route: [FA.FaRoute, C.s1], astro: [FA.FaUserAstronaut, C.s1],
    code: [FA.FaCode, C.s1], vote: [FA.FaVoteYea, C.s1], link: [FA.FaLink, C.s1],
    warn: [FA.FaExclamationTriangle, C.s1], random: [FA.FaRandom, C.s1], snow: [FA.FaSnowflake, C.s1],
    cslash: [FA.FaCommentSlash, C.s1], quote: [FA.FaQuoteLeft, C.s1],
    arrowv: [FA.FaArrowRight, C.s2], chip: [FA.FaMicrochip, C.s2], check: [FA.FaCheckCircle, C.s2],
    cubes: [FA.FaCubes, C.s2], db: [FA.FaDatabase, C.s2], tools: [FA.FaTools, C.s2],
    arrowe: [FA.FaArrowRight, C.s3], layers: [FA.FaLayerGroup, C.s3], robot: [FA.FaRobot, C.s3],
    net: [FA.FaNetworkWired, C.s3], paw: [FA.FaPaw, C.s3], bulb: [FA.FaLightbulb, C.amber],
  };
  for (const k in defs) I[k] = await icon(...defs[k]);

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.author = "masonsxu";
  pres.title = "AI Agent 进化之路";

  // ---------- 通用元素 ----------
  const shadow = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 90, opacity: 0.3 });

  function newSlide() {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    return s;
  }

  function card(s, x, y, w, h, o = {}) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: o.r ?? 0.08,
      fill: { color: o.fill ?? C.card, transparency: o.t ?? 0 },
      line: o.line === null ? { color: o.fill ?? C.card, width: 0 } : { color: o.lineColor ?? C.cardLine, width: o.lw ?? 0.75 },
      shadow: o.flat ? undefined : shadow(),
    });
  }

  function iconCircle(s, x, y, d, ic, color) {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color, transparency: 86 }, line: { color, width: 1 } });
    const inset = d * 0.26;
    s.addImage({ data: ic, x: x + inset, y: y + inset, w: d - 2 * inset, h: d - 2 * inset });
  }

  function numCircle(s, x, y, d, st, fs = 13) {
    s.addText(st.n, {
      shape: pres.shapes.OVAL, x, y, w: d, h: d, margin: 0,
      fill: { color: st.color, transparency: 85 }, line: { color: st.color, width: 1.25 },
      align: "center", valign: "middle", fontFace: F, fontSize: fs, bold: true, color: st.color,
    });
  }

  // 页眉: 阶段圆号 + 标题 + 副标
  function header(s, st, title, sub) {
    if (st) numCircle(s, 0.5, 0.32, 0.46, st, 14);
    s.addText(title, {
      x: st ? 1.12 : 0.5, y: 0.26, w: 8.3, h: 0.44, margin: 0,
      fontFace: F, fontSize: 23, bold: true, color: C.ink,
    });
    s.addText(sub, { x: st ? 1.12 : 0.5, y: 0.74, w: 8.3, h: 0.28, margin: 0, fontFace: F, fontSize: 11, color: C.mut });
  }

  // 底部时间线进度条: cur = 0/1/2 当前阶段, 3=全部点亮, -1=全灭
  function bar(s, cur, page) {
    const cxs = [1.05, 3.55, 6.05], cy = 5.36;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: cy - 0.006, w: 7.55, h: 0.012, fill: { color: C.line } });
    if (cur >= 0) {
      const upto = cur === 3 ? cxs[2] : cxs[cur];
      s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: cy - 0.006, w: upto - 0.5, h: 0.012, fill: { color: STAGES[cur === 3 ? 2 : cur].color, transparency: 20 } });
    }
    cxs.forEach((cx, i) => {
      const active = cur === 3 || i === cur, past = cur >= 0 && i < cur;
      if (active) s.addShape(pres.shapes.OVAL, { x: cx - 0.11, y: cy - 0.11, w: 0.22, h: 0.22, fill: { color: STAGES[i].color, transparency: 82 } });
      s.addShape(pres.shapes.OVAL, {
        x: cx - 0.05, y: cy - 0.05, w: 0.1, h: 0.1,
        fill: active || past ? { color: STAGES[i].color, transparency: past ? 40 : 0 } : { color: C.line },
      });
      s.addText(`${STAGES[i].n} · ${STAGES[i].en}`, {
        x: cx + 0.14, y: 5.06, w: 2.3, h: 0.22, margin: 0, fontFace: F, fontSize: 8.5,
        color: active ? STAGES[i].color : C.faint, bold: active,
      });
    });
    s.addText(`${String(page).padStart(2, "0")} / 12`, { x: 8.55, y: 5.06, w: 0.95, h: 0.22, margin: 0, align: "right", fontFace: F, fontSize: 8.5, color: C.faint });
  }

  // 封面/结语装饰
  function deco(s) {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 11; c++)
      s.addShape(pres.shapes.OVAL, { x: 0.6 + c * 0.22, y: 0.5 + r * 0.22, w: 0.024, h: 0.024, fill: { color: C.dot } });
    [0.9, 1.45, 2.0].forEach((r) => s.addShape(pres.shapes.OVAL, { x: 8.9 - r, y: 0.7 - r, w: 2 * r, h: 2 * r, fill: { type: "none" }, line: { color: C.dot, width: 1 } }));
    s.addShape(pres.shapes.OVAL, { x: 7.9, y: -1.6, w: 4.6, h: 4.6, fill: { color: C.s1, transparency: 92 } });
    s.addShape(pres.shapes.OVAL, { x: -1.8, y: 3.3, w: 4.4, h: 4.4, fill: { color: C.s2, transparency: 93 } });
    s.addShape(pres.shapes.OVAL, { x: 8.7, y: 4.4, w: 2.4, h: 2.4, fill: { color: C.s3, transparency: 90 } });
  }

  // ================= S1 封面 =================
  {
    const s = newSlide();
    deco(s);
    s.addText([T("AI AGENT", { color: C.s1, bold: true }), T("  ·  EVOLUTION ROADMAP  ·  2020 → 2026", { color: C.mut })],
      { x: 0.7, y: 1.04, w: 7, h: 0.28, margin: 0, fontSize: 11, charSpacing: 3 });
    s.addText("AI Agent 进化之路", { x: 0.68, y: 1.36, w: 8.8, h: 0.95, margin: 0, fontFace: F, fontSize: 46, bold: true, color: C.ink });
    s.addText("从 Prompt 到 Context 再到 Harness —— AI 应用的三次范式跃迁", { x: 0.7, y: 2.44, w: 8.6, h: 0.32, margin: 0, fontFace: F, fontSize: 15, color: C.body });
    s.addText([T("把话说对", { color: C.s1, bold: true }), T("  ·  ", { color: C.faint }), T("把料喂对", { color: C.s2, bold: true }), T("  ·  ", { color: C.faint }), T("把事做成", { color: C.s3, bold: true })],
      { x: 0.7, y: 2.82, w: 8.6, h: 0.3, margin: 0, fontSize: 12.5 });
    // 时间线
    const cxs = [1.95, 4.5, 7.05], cy = 3.95;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: cy - 0.006, w: 6.15, h: 0.012, fill: { color: C.line } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: cy - 0.006, w: 2.25, h: 0.012, fill: { color: C.s1, transparency: 40 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.2, y: cy - 0.006, w: 2.5, h: 0.012, fill: { color: C.s2, transparency: 40 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.75, y: cy - 0.006, w: 1.25, h: 0.012, fill: { color: C.s3, transparency: 40 } });
    s.addShape(pres.shapes.LINE, { x: 7.1, y: cy, w: 1.3, h: 0, line: { color: C.faint, width: 1, dashType: "dash", endArrowType: "triangle" } });
    const meta = [
      ["2020 — 2023", "Prompt Engineering", "Few-shot · CoT · 结构化输出"],
      ["2023 — 2025", "Context Engineering", "RAG · Memory · Tool Use"],
      ["2025 → 2026", "Harness Engineering", "AutoGPT · MCP · OpenClaw"],
    ];
    cxs.forEach((cx, i) => {
      const st = STAGES[i];
      s.addShape(pres.shapes.OVAL, { x: cx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fill: { color: st.color, transparency: 80 } });
      s.addShape(pres.shapes.OVAL, { x: cx - 0.055, y: cy - 0.055, w: 0.11, h: 0.11, fill: { color: st.color } });
      s.addText(meta[i][0], { x: cx - 1.25, y: 4.2, w: 2.5, h: 0.24, margin: 0, align: "center", fontFace: F, fontSize: 10.5, bold: true, color: st.color });
      s.addText(meta[i][1], { x: cx - 1.25, y: 4.44, w: 2.5, h: 0.26, margin: 0, align: "center", fontFace: F, fontSize: 13, bold: true, color: C.ink });
      s.addText(meta[i][2], { x: cx - 1.25, y: 4.72, w: 2.5, h: 0.22, margin: 0, align: "center", fontFace: F, fontSize: 9.5, color: C.mut });
    });
    s.addNotes("开场: AI 应用的工程范式在六年里完成三次跃迁。本片用一条时间线贯穿: Prompt 教我们把话说对, Context 让我们把料喂对, Harness 让模型把事做成。");
  }

  // ================= S2 进化全景 =================
  {
    const s = newSlide();
    header(s, null, "进化全景 · 三次范式跃迁", "同一个目标 —— 让模型可靠地完成任务 —— 由三个范式接力完成");
    s.addText("2020 → 2026 · 从「对话模型」到「常驻智能体」", { x: 0.5, y: 1.18, w: 8, h: 0.24, margin: 0, fontFace: F, fontSize: 10.5, color: C.mut, charSpacing: 1 });
    const cards = [
      ["2020 — 2023", "用自然语言向模型下达指令, 打磨提示词以榨取模型能力", "Few-shot · CoT · Role"],
      ["2023 — 2025", "设计「什么信息进入上下文」的系统: 检索、记忆与工具", "RAG · Memory · MCP"],
      ["2025 → 2026", "为模型构建自主运行的工程系统, 让智能体真正落地", "Agent Loop · 沙箱 · 常驻"],
    ];
    const xs = [0.5, 3.6, 6.7];
    cards.forEach((cd, i) => {
      const st = STAGES[i], x = xs[i], y = 1.56, w = 2.8, h = 2.5;
      card(s, x, y, w, h);
      numCircle(s, x + 0.22, y + 0.2, 0.4, st, 11.5);
      s.addText(cd[0], { x: x + w - 1.35, y: y + 0.28, w: 1.13, h: 0.22, margin: 0, align: "right", fontFace: F, fontSize: 10, bold: true, color: st.color });
      s.addText(st.en, { x: x + 0.22, y: y + 0.74, w: 2.45, h: 0.28, margin: 0, fontFace: F, fontSize: 14, bold: true, color: st.color });
      s.addText(`「${st.cn}」`, { x: x + 0.22, y: y + 1.04, w: 2.4, h: 0.3, margin: 0, fontFace: F, fontSize: 14, bold: true, color: C.ink });
      s.addText(cd[1], { x: x + 0.22, y: y + 1.42, w: 2.36, h: 0.62, margin: 0, fontFace: F, fontSize: 10, color: C.mut });
      s.addText(cd[2], { x: x + 0.22, y: y + 2.12, w: 2.36, h: 0.22, margin: 0, fontFace: F, fontSize: 9, color: C.mut });
    });
    [3.34, 6.44].forEach((x) => s.addShape(pres.shapes.LINE, { x, y: 2.81, w: 0.22, h: 0, line: { color: C.faint, width: 1.5, endArrowType: "triangle" } }));
    card(s, 0.5, 4.3, 9, 0.78, { fill: C.card2 });
    iconCircle(s, 0.72, 4.49, 0.4, I.bulb, C.amber);
    s.addText([T("一条主线:  ", { bold: true, color: C.ink }), T("模型每强一分, 瓶颈就向外移一层 —— 先是「怎么问」, 再是「喂什么」, 最后是「怎么跑」", { color: C.body })],
      { x: 1.28, y: 4.3, w: 8.0, h: 0.78, margin: 0, valign: "middle", fontFace: F, fontSize: 10.5 });
    bar(s, -1, 2);
    s.addNotes("全景页: 三个阶段不是互相取代, 而是层层包裹。给出后面所有页面的地图。");
  }

  // ================= S3 PE 起源 =================
  {
    const s = newSlide();
    header(s, STAGES[0], "Prompt Engineering · 起源", "2020 — 2022: 大模型证明「提示即编程」, 提示词成为人机交互的新界面");
    const rows = [
      ["2020.05", "GPT-3 问世, 提示即编程", "《Language Models are Few-Shot Learners》: 不微调, 提示即可"],
      ["2022.01", "思维链 CoT, 推理被「提示」出来", "「Let's think step by step」让模型写出推理步骤"],
      ["2022.11", "ChatGPT 破圈, 人人写提示词", "RLHF + 指令跟随, 两个月用户破亿"],
    ];
    rows.forEach((r, i) => {
      const y = 1.32 + i * 1.18;
      card(s, 0.5, y, 5.25, 1.06);
      s.addText(r[0], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05, x: 0.68, y: y + 0.2, w: 1.0, h: 0.3, margin: 0, align: "center", valign: "middle", fontFace: F, fontSize: 10, bold: true, color: C.s1, fill: { color: C.s1, transparency: 85 }, line: { color: C.s1, width: 1 } });
      s.addText(r[1], { x: 1.82, y: y + 0.2, w: 3.75, h: 0.3, margin: 0, valign: "middle", fontFace: F, fontSize: 12.5, bold: true, color: C.ink });
      s.addText(r[2], { x: 0.68, y: y + 0.6, w: 4.9, h: 0.26, margin: 0, fontFace: F, fontSize: 9.5, color: C.mut });
    });
    // 右侧: 引言 + 终端
    card(s, 6.0, 1.32, 3.5, 1.66);
    s.addImage({ data: I.quote, x: 6.22, y: 1.5, w: 0.28, h: 0.28, transparency: 30 });
    s.addText("The hottest new programming language is English.", { x: 6.22, y: 1.84, w: 3.08, h: 0.54, margin: 0, fontFace: F, fontSize: 12, italic: true, color: C.ink });
    s.addText("—— Andrej Karpathy · 2022", { x: 6.22, y: 2.4, w: 3.08, h: 0.2, margin: 0, fontFace: F, fontSize: 9, color: C.faint });
    s.addText("「最热门的新编程语言是英语」", { x: 6.22, y: 2.62, w: 3.08, h: 0.22, margin: 0, fontFace: F, fontSize: 10, color: C.mut });
    card(s, 6.0, 3.12, 3.5, 1.62, { fill: "0D1426" });
    [["FF5F57"], ["FEBC2E"], ["28C840"]].forEach(([c], i) => s.addShape(pres.shapes.OVAL, { x: 6.2 + i * 0.15, y: 3.28, w: 0.07, h: 0.07, fill: { color: c } }));
    s.addText("prompt_2022.txt", { x: 7.9, y: 3.24, w: 1.45, h: 0.18, margin: 0, align: "right", fontFace: MONO, fontSize: 8, color: C.faint });
    s.addText([
      T("你是资深技术译者, 风格简洁。", { color: C.body, breakLine: true }),
      T("示例: agent → 智能体", { color: C.mut, breakLine: true }),
      T("      context → 上下文", { color: C.mut, breakLine: true }),
      T("请翻译: harness", { color: C.ink, bold: true, breakLine: true }),
      T("▍挽具 / 脚手架 …", { color: C.s1 }),
    ], { x: 6.22, y: 3.5, w: 3.1, h: 1.14, margin: 0, fontFace: MONO, fontSize: 10, paraSpaceAfter: 5 });
    bar(s, 0, 3);
    s.addNotes("三个节点讲起源: GPT-3 证明 few-shot, CoT 挖出推理, ChatGPT 把提示词带给大众。右侧终端示例埋下伏笔: harness 这个词 2022 年还只是个翻译难题。");
  }

  // ================= S4 PE 核心技巧 =================
  {
    const s = newSlide();
    header(s, STAGES[0], "Prompt Engineering · 核心技巧", "六类高频技巧: 把任务、示例与推理路径显式写进提示");
    const items = [
      ["listol", "少样本示例", "Few-shot", "在提示里直接给输入输出示例, 模型照葫芦画瓢"],
      ["route", "思维链", "Chain-of-Thought", "一句「Let's think step by step」, 让模型显式推理"],
      ["astro", "角色设定", "Role Prompting", "「你是资深架构师」: 用角色锁定语气与专业度"],
      ["code", "结构化输出", "JSON / XML Schema", "约定输出格式, 让下游程序可解析、可集成"],
      ["vote", "自洽性投票", "Self-Consistency", "多条推理路径采样后投票, 降低单次偏差"],
      ["link", "提示链分解", "Prompt Chaining", "大任务拆成子提示串联, 各步只做一件事"],
    ];
    items.forEach((it, i) => {
      const x = 0.5 + (i % 3) * 3.1, y = 1.32 + Math.floor(i / 3) * 1.66, w = 2.8, h = 1.52;
      card(s, x, y, w, h);
      iconCircle(s, x + 0.2, y + 0.2, 0.42, I[it[0]], C.s1);
      s.addText(it[1], { x: x + 0.74, y: y + 0.2, w: 1.95, h: 0.26, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.ink });
      s.addText(it[2], { x: x + 0.74, y: y + 0.47, w: 1.95, h: 0.2, margin: 0, fontFace: F, fontSize: 8.5, color: C.faint });
      s.addText(it[3], { x: x + 0.2, y: y + 0.78, w: 2.4, h: 0.62, margin: 0, fontFace: F, fontSize: 10, color: C.mut });
    });
    s.addText("共同点: 全部依赖一次性写好的文本, 发生在一次对话之内 —— 这正是它的天花板", { x: 0.5, y: 4.66, w: 9, h: 0.28, margin: 0, fontFace: F, fontSize: 10, italic: true, color: C.mut });
    bar(s, 0, 4);
    s.addNotes("六张卡片快速过: 示例、推理、角色、格式、投票、分解。结尾一句引出局限页。");
  }

  // ================= S5 PE 局限 =================
  {
    const s = newSlide();
    header(s, STAGES[0], "Prompt Engineering · 局限性", "四道天花板: 提示词无法突破模型自身的边界");
    const items = [
      ["warn", "幻觉难消除", "模型会一本正经地编造, 缺乏事实校验与自我纠错手段"],
      ["random", "措辞脆弱", "一词之差结果漂移; 依赖大量手工试错, 难以稳定复现"],
      ["snow", "知识冻结", "训练截止即知识截止: 最新信息、私域数据一概不知"],
      ["cslash", "只会说, 不会做", "无记忆、无工具、无行动 —— 输出停留在文本, 任务无法闭环"],
    ];
    items.forEach((it, i) => {
      const x = 0.5 + (i % 2) * 4.6, y = 1.32 + Math.floor(i / 2) * 1.28, w = 4.4, h = 1.16;
      card(s, x, y, w, h);
      iconCircle(s, x + 0.2, y + 0.2, 0.44, I[it[0]], C.s1);
      s.addText(it[1], { x: x + 0.78, y: y + 0.18, w: 3.4, h: 0.26, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.ink });
      s.addText(it[2], { x: x + 0.78, y: y + 0.48, w: 3.42, h: 0.56, margin: 0, fontFace: F, fontSize: 10, color: C.mut });
    });
    card(s, 0.5, 3.98, 9, 0.66, { fill: C.s2, t: 88, lineColor: C.s2, lw: 1 });
    s.addImage({ data: I.arrowv, x: 0.78, y: 4.14, w: 0.34, h: 0.34 });
    s.addText([T("范式转折 · 2024", { bold: true, color: C.s2, fontSize: 11.5 }), T("   →   Context Engineering", { bold: true, color: C.ink, fontSize: 11.5 })],
      { x: 1.36, y: 4.06, w: 7.9, h: 0.24, margin: 0, fontFace: F });
    s.addText("提示词只能逼近模型上限 —— 与其打磨「怎么问」, 不如设计「喂什么」: 检索、记忆与工具登场", { x: 1.36, y: 4.32, w: 7.9, h: 0.26, margin: 0, fontFace: F, fontSize: 10, color: C.body });
    bar(s, 0, 5);
    s.addNotes("四道天花板之后给出转折: 2024 年行业共识转向上下文工程。紫色条是进入第二阶段的门。");
  }

  // ================= S6 CE 为什么 =================
  {
    const s = newSlide();
    header(s, STAGES[1], "Context Engineering · 为什么上下文更重要", "2024 — 2025: 模型足够强之后, 瓶颈转移到「进入窗口的信息」");
    const rows = [
      ["概念提出 · Karpathy (2025)", "「上下文工程是为模型的下一步, 恰到好处地填充窗口的艺术」—— 从一句话升级为一门工程"],
      ["模型不再是瓶颈", "同一模型, 喂对上下文, 表现天差地别; 差距来自上下文的质量, 而非提示的措辞"],
      ["从一句话到一个系统", "PE 优化单条提示; CE 设计「什么信息、何时、以何种形式进入窗口」的完整系统"],
    ];
    rows.forEach((r, i) => {
      const y = 1.32 + i * 1.02;
      card(s, 0.5, y, 4.9, 0.92);
      s.addShape(pres.shapes.OVAL, { x: 0.68, y: y + 0.19, w: 0.08, h: 0.08, fill: { color: C.s2 } });
      s.addText(r[0], { x: 0.84, y: y + 0.09, w: 4.4, h: 0.24, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.ink });
      s.addText(r[1], { x: 0.84, y: y + 0.37, w: 4.4, h: 0.5, margin: 0, fontFace: F, fontSize: 10, color: C.mut });
    });
    // 右侧类比卡
    card(s, 5.6, 1.34, 3.9, 2.94);
    iconCircle(s, 5.8, 1.52, 0.4, I.chip, C.s2);
    s.addText("LLM 即一台计算机", { x: 6.32, y: 1.56, w: 3.0, h: 0.26, margin: 0, fontFace: F, fontSize: 13, bold: true, color: C.ink });
    s.addText("—— Karpathy 类比", { x: 6.32, y: 1.83, w: 3.0, h: 0.2, margin: 0, fontFace: F, fontSize: 9, color: C.faint });
    const maps = [
      ["CPU", "LLM 大模型 (算力)", C.s1],
      ["内存 RAM", "上下文窗口 (工作记忆)", C.s2],
      ["硬盘 / 外设", "RAG · Memory · Tools", C.s2],
      ["操作系统", "Agent Harness → 第三章", C.s3],
    ];
    maps.forEach((m, i) => {
      const y = 2.22 + i * 0.44;
      s.addText(m[0], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05, x: 5.8, y, w: 1.05, h: 0.32, margin: 0, align: "center", valign: "middle", fontFace: F, fontSize: 9.5, bold: true, color: m[2], fill: { color: m[2], transparency: 85 }, line: { color: m[2], width: 0.75 } });
      s.addText(m[1], { x: 7.0, y, w: 2.32, h: 0.32, margin: 0, valign: "middle", fontFace: F, fontSize: 9.5, color: C.body });
    });
    const pills = ["Ⅰ · RAG 检索增强", "Ⅱ · Memory 记忆", "Ⅲ · Tool Use 工具"];
    pills.forEach((p, i) => {
      s.addText(p, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05, x: 0.5 + i * 2.42, y: 4.42, w: 2.24, h: 0.42, margin: 0, align: "center", valign: "middle", fontFace: F, fontSize: 10.5, bold: true, color: C.s2, fill: { color: C.s2, transparency: 85 }, line: { color: C.s2, width: 1 } });
    });
    s.addText("后两页逐一展开 →", { x: 7.8, y: 4.52, w: 1.7, h: 0.24, margin: 0, fontFace: F, fontSize: 9.5, color: C.faint });
    bar(s, 1, 6);
    s.addNotes("核心论证: 模型能力商品化后, 竞争力在上下文供给。右侧类比把三章串起来: 提示是指令, 上下文是内存, Harness 是操作系统。");
  }

  // ================= S7 CE·RAG =================
  {
    const s = newSlide();
    header(s, STAGES[1], "关键技术 Ⅰ · RAG 检索增强生成", "先检索、后生成: 让模型回答前先「查资料」, 把知识装进上下文");
    const nodes = [["提问", "Query"], ["向量化", "Embedding"], ["检索", "Retrieve Top-K"], ["重排", "Rerank"], ["注入上下文", "Augment"], ["生成回答", "Generate"]];
    nodes.forEach((n, i) => {
      const x = 0.5 + i * 1.54, last = i === 5;
      s.addText([T(n[0], { fontSize: 10.5, bold: true, color: last ? C.ink : C.ink, breakLine: true }), T(n[1], { fontSize: 7.5, color: last ? C.s2 : C.faint })],
        { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.07, x, y: 1.38, w: 1.3, h: 0.74, margin: 0, align: "center", valign: "middle", fontFace: F, fill: { color: last ? C.s2 : C.card, transparency: last ? 85 : 0 }, line: { color: last ? C.s2 : C.cardLine, width: 0.75 } });
      if (!last) s.addShape(pres.shapes.LINE, { x: x + 1.33, y: 1.75, w: 0.18, h: 0, line: { color: C.faint, width: 1.5, endArrowType: "triangle" } });
    });
    s.addText("离线: 分块 → 向量化 → 入库    ｜    在线: 检索 → 重排 → 注入 → 生成", { x: 0.5, y: 2.32, w: 9, h: 0.24, margin: 0, align: "center", fontFace: F, fontSize: 10, color: C.faint });
    const blocks = [
      ["check", "解决什么", ["突破训练截止, 知识实时更新", "接入企业私域文档与数据", "答案附引用来源, 可验证", "事实性幻觉明显减少"]],
      ["cubes", "核心组件", ["Embedding 嵌入模型", "向量数据库 (pgvector · Milvus)", "分块策略 Chunking", "重排模型 Reranker"]],
    ];
    blocks.forEach((b, bi) => {
      const x = 0.5 + bi * 4.6;
      card(s, x, 2.72, 4.4, 1.78);
      iconCircle(s, x + 0.2, 2.9, 0.4, I[b[0]], C.s2);
      s.addText(b[1], { x: x + 0.72, y: 2.96, w: 2.5, h: 0.26, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.ink });
      b[2].forEach((t, i) => {
        const y = 3.4 + i * 0.27;
        s.addShape(pres.shapes.OVAL, { x: x + 0.24, y: y + 0.06, w: 0.07, h: 0.07, fill: { color: C.s2 } });
        s.addText(t, { x: x + 0.42, y, w: 3.85, h: 0.24, margin: 0, fontFace: F, fontSize: 10, color: C.body });
      });
    });
    bar(s, 1, 7);
    s.addNotes("RAG 流水线六步; 离线建库与在线问答两条链路。下托两卡: 价值与组件。");
  }

  // ================= S8 CE·Memory & Tool =================
  {
    const s = newSlide();
    header(s, STAGES[1], "关键技术 Ⅱ · Memory 记忆 与 Tool Use 工具", "让上下文「跨会话生长」, 并给模型装上「手和脚」");
    const blocks = [
      ["db", "Memory · 记忆", [
        ["短期记忆 · 会话内", "对话历史、中间结果、暂存文件 —— 工作记忆"],
        ["长期记忆 · 跨会话", "CLAUDE.md / AGENTS.md 规则、向量记忆库、用户档案"],
        ["记忆管理", "写入 · 检索 · 压缩 · 遗忘, 防止窗口被旧账塞满"],
      ]],
      ["tools", "Tool Use · 工具", [
        ["Function Calling", "2023.06 起原生化: 模型输出结构化调用参数"],
        ["MCP · 2024.11", "Model Context Protocol: 工具接入的「USB-C」"],
        ["从说到做 · ReAct", "思考 → 调用工具 → 观察结果 → 再思考的闭环"],
      ]],
    ];
    blocks.forEach((b, bi) => {
      const x = 0.5 + bi * 4.6;
      card(s, x, 1.32, 4.4, 2.94);
      iconCircle(s, x + 0.2, 1.52, 0.44, I[b[0]], C.s2);
      s.addText(b[1], { x: x + 0.78, y: 1.58, w: 3.4, h: 0.3, margin: 0, fontFace: F, fontSize: 13.5, bold: true, color: C.ink });
      b[2].forEach((r, i) => {
        const y = 2.1 + i * 0.74;
        s.addShape(pres.shapes.OVAL, { x: x + 0.24, y: y + 0.07, w: 0.07, h: 0.07, fill: { color: C.s2 } });
        s.addText(r[0], { x: x + 0.42, y, w: 3.8, h: 0.22, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.ink });
        s.addText(r[1], { x: x + 0.42, y: y + 0.24, w: 3.85, h: 0.36, margin: 0, fontFace: F, fontSize: 10, color: C.mut });
      });
    });
    card(s, 0.5, 4.4, 9, 0.62, { fill: C.s3, t: 88, lineColor: C.s3, lw: 1 });
    s.addImage({ data: I.arrowe, x: 0.78, y: 4.55, w: 0.32, h: 0.32 });
    s.addText([T("范式转折 · 2025", { bold: true, color: C.s3, fontSize: 11.5 }), T("   →   Harness Engineering", { bold: true, color: C.ink, fontSize: 11.5 })],
      { x: 1.36, y: 4.48, w: 7.9, h: 0.24, margin: 0, fontFace: F });
    s.addText("上下文齐备后, 剩下的问题是自主性 —— 谁来规划、循环、纠错?", { x: 1.36, y: 4.74, w: 7.9, h: 0.24, margin: 0, fontFace: F, fontSize: 10, color: C.body });
    bar(s, 1, 8);
    s.addNotes("Memory 分短期/长期/管理三层; Tool Use 从 Function Calling 到 MCP 到 ReAct 闭环。绿色转折条进入第三章。");
  }

  // ================= S9 HE 框架演进 =================
  {
    const s = newSlide();
    header(s, STAGES[2], "Harness Engineering · Agent 框架演进", "Harness (挽具) = 模型之外的一切工程系统; 模型是引擎, Harness 是整辆车");
    card(s, 0.5, 1.24, 9, 0.52, { fill: C.card2, flat: true });
    s.addImage({ data: I.layers, x: 0.72, y: 1.36, w: 0.28, h: 0.28 });
    s.addText([T("Harness 管什么:  ", { bold: true, color: C.ink }), T("任务循环 · 工具调度 · 权限沙箱 · 上下文管理 · 人机协同", { color: C.body })],
      { x: 1.14, y: 1.24, w: 8.2, h: 0.52, margin: 0, valign: "middle", fontFace: F, fontSize: 10.5 });
    const cy = 2.62, cxs = [1.36, 3.08, 4.8, 6.52, 8.24];
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: cy - 0.006, w: 8.8, h: 0.012, fill: { color: C.line } });
    for (let i = 0; i < 4; i++) s.addShape(pres.shapes.RECTANGLE, { x: cxs[i] + 0.06, y: cy - 0.006, w: cxs[i + 1] - cxs[i] - 0.12, h: 0.012, fill: { color: C.s3, transparency: 45 } });
    const tl = [
      ["2023", "AutoGPT / BabyAGI", "自主循环首秀: 拆目标 → 执行 → 反思; 惊艳但易失控"],
      ["2023 — 24", "LangChain / AutoGen", "编排框架: 链式 → 图式 → 多 Agent 协作"],
      ["2024.11", "MCP 发布", "工具与上下文接入标准化, 生态走向统一"],
      ["2025", "Claude Code 等", "编码 Agent 爆发, Harness 概念成形"],
      ["2025 — 26", "ACP · OpenClaw", "客户端协议互联, 常驻个人助理落地"],
    ];
    tl.forEach((t, i) => {
      const cx = cxs[i];
      s.addText(t[0], { x: cx - 0.85, y: 2.22, w: 1.7, h: 0.2, margin: 0, align: "center", fontFace: F, fontSize: 10, bold: true, color: C.s3 });
      s.addShape(pres.shapes.OVAL, { x: cx - 0.1, y: cy - 0.1, w: 0.2, h: 0.2, fill: { color: C.s3, transparency: 82 } });
      s.addShape(pres.shapes.OVAL, { x: cx - 0.05, y: cy - 0.05, w: 0.1, h: 0.1, fill: { color: C.s3 } });
      s.addText(t[1], { x: cx - 0.85, y: 2.8, w: 1.7, h: 0.26, margin: 0, align: "center", fontFace: F, fontSize: 10.5, bold: true, color: C.ink });
      s.addText(t[2], { x: cx - 0.83, y: 3.12, w: 1.66, h: 0.66, margin: 0, align: "center", fontFace: F, fontSize: 9.5, color: C.mut });
    });
    card(s, 0.5, 4.06, 9, 0.66, { fill: C.card2, flat: true });
    s.addText([T("趋势:  ", { bold: true, color: C.ink }), T("框架越来越「薄」, 模型自主性越来越强 —— 从框架替模型编排, 走向模型在系统内自驱", { color: C.body })],
      { x: 0.78, y: 4.06, w: 8.42, h: 0.66, margin: 0, valign: "middle", fontFace: F, fontSize: 10.5 });
    bar(s, 2, 9);
    s.addNotes("框架演进五节点: AutoGPT 证明方向, LangChain 做编排, MCP 统一工具, 编码 Agent 让 Harness 概念成形, 协议与常驻助理落地。");
  }

  // ================= S10 HE 代表产品 =================
  {
    const s = newSlide();
    header(s, STAGES[2], "Harness Engineering · 代表产品", "三条路径: 自主探索 → 协议互联 → 常驻落地");
    const prods = [
      ["robot", "AutoGPT", "2023", "开源自主 Agent 鼻祖", [
        "GPT-4 自主循环: 拆解目标 → 执行 → 自我反思",
        "现象级爆红, GitHub 16 万+ Star",
        "失控、空转、烧钱: 可靠性不足",
      ], "意义: 证明自主 Agent 方向成立"],
      ["net", "ACPAgent", "2025", "以 ACP 协议互联的 Agent 运行时", [
        "以 ACP 协议接入编辑器/客户端, 如接入 LSP",
        "会话、权限、流式输出全面标准化",
        "Agent 从「产品功能」变「可插拔服务」",
      ], "意义: 协议让生态互联互通"],
      ["paw", "OpenClaw", "2026", "24/7 常驻的开源个人 AI 助理", [
        "本地守护进程 24/7 运行, 接入 WhatsApp 等渠道",
        "隐私可控, MCP 工具生态即插即用",
        "从编码工具变成「生活方式 Agent」",
      ], "意义: Agent 融入日常生活"],
    ];
    prods.forEach((p, i) => {
      const x = 0.5 + i * 3.1, y = 1.3, w = 2.8, h = 3.34;
      card(s, x, y, w, h);
      iconCircle(s, x + 0.2, y + 0.2, 0.46, I[p[0]], C.s3);
      s.addText(p[2], { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.05, x: x + w - 1.08, y: y + 0.26, w: 0.88, h: 0.28, margin: 0, align: "center", valign: "middle", fontFace: F, fontSize: 9.5, bold: true, color: C.s3, fill: { color: C.s3, transparency: 85 }, line: { color: C.s3, width: 0.75 } });
      s.addText(p[1], { x: x + 0.2, y: y + 0.78, w: 2.4, h: 0.28, margin: 0, fontFace: F, fontSize: 15, bold: true, color: C.ink });
      s.addText(p[3], { x: x + 0.2, y: y + 1.08, w: 2.42, h: 0.36, margin: 0, fontFace: F, fontSize: 10, color: C.faint });
      p[4].forEach((b, j) => {
        const yy = y + 1.48 + j * 0.5;
        s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: yy + 0.07, w: 0.06, h: 0.06, fill: { color: C.s3 } });
        s.addText(b, { x: x + 0.38, y: yy, w: 2.34, h: 0.46, margin: 0, fontFace: F, fontSize: 10, color: C.body });
      });
      s.addText(p[5], { x: x + 0.2, y: y + 3.04, w: 2.42, h: 0.26, margin: 0, fontFace: F, fontSize: 10, bold: true, color: C.s3 });
    });
    s.addText("AutoGPT 指明方向, ACPAgent 打通连接, OpenClaw 把 Agent 装进生活 —— 三代产品接力完成「落地」", { x: 0.5, y: 4.76, w: 9, h: 0.28, margin: 0, fontFace: F, fontSize: 10, italic: true, color: C.mut });
    bar(s, 2, 10);
    s.addNotes("三个代表产品三条路径。ACPAgent 按 Agent Client Protocol 生态口径介绍, 如与你的实际产品定位不符可直接改这一页。");
  }

  // ================= S11 对比 =================
  {
    const s = newSlide();
    header(s, null, "三个阶段 · 一张表看懂", "范围、对象、技术与代表产物的全对比");
    const hd = (t, c) => ({ text: t, options: { fill: { color: c }, color: "0A0F1E", bold: true, fontSize: 11, align: "center", valign: "middle", fontFace: F } });
    const lb = (t) => ({ text: t, options: { fill: { color: C.card2 }, color: C.mut, bold: true, fontSize: 10, align: "center", valign: "middle", fontFace: F } });
    const ce = (t) => ({ text: t, options: { fill: { color: C.card }, color: C.body, fontSize: 10, align: "center", valign: "middle", fontFace: F } });
    const rows = [
      [hd("对比维度", C.card2), hd("Prompt Engineering", C.s1), hd("Context Engineering", C.s2), hd("Harness Engineering", C.s3)],
      [lb("时期"), ce("2020 — 2023"), ce("2023 — 2025"), ce("2025 → 至今")],
      [lb("时代命题"), ce("把话说对"), ce("把料喂对"), ce("把事做成")],
      [lb("核心对象"), ce("一条提示词 Prompt"), ce("一套上下文供给系统"), ce("一个自主运行的工程系统")],
      [lb("关键技术"), ce("Few-shot · CoT · 角色设定"), ce("RAG · Memory · Tool Use"), ce("Agent 循环 · 沙箱 · 协议互联")],
      [lb("代表产物"), ce("ChatGPT · 提示词指南"), ce("RAG 问答 · 编码 Copilot"), ce("AutoGPT · ACPAgent · OpenClaw")],
      [lb("局限 → 突破"), ce("上限锁死在模型 → 喂对料"), ce("仍靠人驱动 → 系统自驱"), ce("进化仍在继续 → ?")],
    ];
    s.addTable(rows, { x: 0.5, y: 1.3, w: 9, colW: [1.7, 2.43, 2.43, 2.44], rowH: [0.4, 0.48, 0.48, 0.48, 0.48, 0.48, 0.48], border: { pt: 0.75, color: "1B2440" } });
    s.addText([
      T("每一次跃迁都是把前一阶段「包进」更大的系统:   ", { color: C.body, fontSize: 11.5 }),
      T("Prompt ", { color: C.s1, bold: true, fontSize: 13 }), T("⊂ ", { color: C.faint, bold: true, fontSize: 13 }),
      T("Context ", { color: C.s2, bold: true, fontSize: 13 }), T("⊂ ", { color: C.faint, bold: true, fontSize: 13 }),
      T("Harness", { color: C.s3, bold: true, fontSize: 13 }),
    ], { x: 0.5, y: 4.88, w: 9, h: 0.34, margin: 0, valign: "middle", fontFace: F });
    bar(s, 3, 11);
    s.addNotes("收束对比。强调嵌套关系: 后一阶段包含前一阶段, 不是否定。");
  }

  // ================= S12 结语 =================
  {
    const s = newSlide();
    deco(s);
    s.addText([T("从「会说话」", { color: C.s1 }), T("到", { color: C.ink }), T("「会做事」", { color: C.s3 })],
      { x: 0.5, y: 1.32, w: 9, h: 0.78, margin: 0, align: "center", fontFace: F, fontSize: 38, bold: true });
    s.addText("Prompt 教会模型怎么回答, Context 决定模型知道什么, Harness 让模型自己把事做成", { x: 0.5, y: 2.24, w: 9, h: 0.3, margin: 0, align: "center", fontFace: F, fontSize: 13, color: C.body });
    const pills = [["Prompt Engineering", "把话说对"], ["Context Engineering", "把料喂对"], ["Harness Engineering", "把事做成"]];
    pills.forEach((p, i) => {
      const x = 0.85 + i * 2.875, st = STAGES[i];
      s.addText([T(p[0], { bold: true, fontSize: 11, color: st.color, breakLine: true }), T(p[1], { fontSize: 9, color: C.mut })],
        { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.07, x, y: 2.98, w: 2.55, h: 0.62, margin: 0, align: "center", valign: "middle", fontFace: F, fill: { color: st.color, transparency: 88 }, line: { color: st.color, width: 1 } });
      if (i < 2) s.addShape(pres.shapes.LINE, { x: x + 2.62, y: 3.29, w: 0.19, h: 0, line: { color: C.faint, width: 1.5, endArrowType: "triangle" } });
    });
    s.addText("进化没有终点 —— 下一个范式, 正在发生", { x: 0.5, y: 4.08, w: 9, h: 0.32, margin: 0, align: "center", fontFace: F, fontSize: 13, bold: true, color: C.ink });
    s.addText("THANK YOU", { x: 0.5, y: 4.52, w: 9, h: 0.26, margin: 0, align: "center", fontFace: F, fontSize: 11, bold: true, color: C.faint, charSpacing: 5 });
    s.addText("AI Agent 进化之路 · 2026.08", { x: 0.5, y: 5.14, w: 9, h: 0.22, margin: 0, align: "center", fontFace: F, fontSize: 9, color: C.faint });
    s.addNotes("收尾: 一句话总结三阶段, 展望下一范式。");
  }

  await pres.writeFile({ fileName: OUT });
  console.log("written:", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
