// build-ppt3.js — PPT3《大模型实践落地：从文字材料到咨询级 PPT 的全流程复现》17 页
const PptxGenJS = require('pptxgenjs');
const th = require('./theme.js');
const { PAGE, M, CW, C, T, FONT, FONT_EN,
  addBase, addTitle, addFooter, addSoWhat, addKPI, addPanel, addClaim, addTable, addCode, addPill } = th;

const p = new PptxGenJS();
p.defineLayout({ name: 'W', width: PAGE.w, height: PAGE.h });
p.layout = 'W';
p.author = 'CIMICode TD Testing';
p.company = 'CIMICode';
p.title = '大模型实践落地：从文字材料到咨询级 PPT 的全流程复现';

const H = { pptx: p };
const newSlide = () => { const s = p.addSlide(); s._pptxHolder = H; return s; };

function nodeCircle(s, x, y, d, num, fill) {
  s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: fill || C.accent }, line: { type: 'none' } });
  s.addText(String(num), { x, y, w: d, h: d, fontFace: FONT_EN, fontSize: 13, bold: true, color: C.white, align: 'center', valign: 'middle' });
}

// ============ P1 封面 ============
{
  const s = newSlide();
  s.background = { color: C.bg };
  s.addShape('rect', { x: 0, y: 0, w: 0.28, h: PAGE.h, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('CIMICode · 实践分享', { x: M.left + 0.2, y: 1.25, w: 10, h: 0.4, fontFace: FONT, fontSize: T.T3, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('大模型实践落地', { x: M.left + 0.2, y: 1.7, w: 12, h: 1.1, fontFace: FONT, fontSize: T.C0, bold: true, color: C.title, align: 'left', valign: 'middle' });
  s.addText('从文字材料到咨询级 PPT 的全流程复现', { x: M.left + 0.2, y: 2.85, w: 12, h: 0.7, fontFace: FONT, fontSize: 24, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('新人照着一步步做，就能用大模型做出一模一样的效果', { x: M.left + 0.2, y: 3.75, w: 11.5, h: 0.6, fontFace: FONT, fontSize: 17, color: C.sub, align: 'left', valign: 'middle' });
  s.addShape('rect', { x: M.left + 0.2, y: 4.55, w: 2.2, h: 0.06, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('受众：想用大模型提效的全员    |    讲师：TD Testing', { x: M.left + 0.2, y: 6.45, w: 11, h: 0.4, fontFace: FONT, fontSize: T.T7, color: C.faint, align: 'left', valign: 'middle' });
  addFooter(s, '实战案例：PPT1《入门》+ PPT2《进阶》', '01');
}

// ============ P2 导览 ============
{
  const s = newSlide();
  addBase(s, { section: '导览', num: '02' });
  const cy = addTitle(s, '直接让大模型"做 PPT"会翻车，工程化方法才能稳定出活', '三大翻车痛点 + 七步工程化解法');
  // 左：三大翻车
  const lx = M.left, lw = 5.2;
  addPanel(s, lx, cy, lw, 3.5, '直接让大模型做 PPT 的三大翻车');
  const fails = [
    { t: '模板化', d: '默认卡片堆叠，缺乏咨询级的层级与密度', c: C.neg },
    { t: '不可编辑', d: '文字烘焙成图片，没法改、没法复用', c: C.warn },
    { t: '内容失真', d: 'AI 编造数据，或把预估当成实测成果', c: C.sub },
  ];
  fails.forEach((f, i) => {
    const yy = cy + 0.6 + i * 0.92;
    s.addShape('roundRect', { x: lx + 0.2, y: yy, w: 1.5, h: 0.42, rectRadius: 0.05, fill: { color: f.c }, line: { type: 'none' } });
    s.addText(f.t, { x: lx + 0.2, y: yy, w: 1.5, h: 0.42, fontFace: FONT, fontSize: T.T7, bold: true, color: C.white, align: 'center', valign: 'middle' });
    s.addText(f.d, { x: lx + 1.8, y: yy, w: lw - 1.95, h: 0.42, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle', lineSpacingMultiple: 1.0 });
  });
  // 右：七步路线图
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '七步工程化流程');
  const steps = ['① 证据分析 + 逐页大纲', '② 8 张样张选风格', '③ 环境核查 + 降级决策', '④ 搭共享视觉模块', '⑤ 3 页风格验证', '⑥ 生产 + 渲染 QA + 自检', '⑦ 方向纠偏'];
  steps.forEach((st, i) => {
    const yy = cy + 0.52 + i * 0.41;
    nodeCircle(s, rx + 0.2, yy + 0.01, 0.3, i + 1, C.accent);
    s.addText(st, { x: rx + 0.62, y: yy, w: rw - 0.8, h: 0.32, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
    if (i < steps.length - 1) s.addShape('rect', { x: rx + 0.345, y: yy + 0.3, w: 0.02, h: 0.11, fill: { color: C.accent }, line: { type: 'none' } });
  });
  addSoWhat(s, '本课目标', '把"让大模型做 PPT"从碰运气变成可复现的工程流程 —— 新人照做，效果一致。');
  addFooter(s, '来源：本会话实战整理 · 配套 PPT1/PPT2 案例', '02');
}

// ============ P3 三个反常识认知 ============
{
  const s = newSlide();
  addBase(s, { section: '认知重塑', num: '03' });
  const cy = addTitle(s, '重新认识大模型：它是"能动手的助理"', '三个反常识认知，是用好大模型的前提');
  const cards = [
    { n: '1', t: '价值在"端到端动手"', d: '不是只会聊天 —— 它能读文件、写代码、生成 PPTX、渲染、自检、迭代，把活真正干完。', ex: '本会话：大模型直接产出 35 页可编辑 PPT + 渲染图' },
    { n: '2', t: '环境能力决定方法路径', d: '有没有图像生成、有没有渲染器，直接决定能用哪套流程。动手前先核查。', ex: '本会话：缺图像生成 → 改用 PptxGenJS + 渲染 QA' },
    { n: '3', t: '降级不等于失败', d: '跳过某一步没关系 —— 关键是如实告知、留痕、用替代方案保证交付。', ex: '本会话：跳过 ImageGen 蓝图，照样交付高质量 PPT' },
  ];
  const cw = (CW - 0.5) / 3, ch = 3.4, gap = 0.25;
  cards.forEach((c, i) => {
    const cx = M.left + i * (cw + gap);
    s.addShape('roundRect', { x: cx, y: cy + 0.1, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
    s.addShape('rect', { x: cx, y: cy + 0.1, w: cw, h: 0.06, fill: { color: C.accent }, line: { type: 'none' } });
    nodeCircle(s, cx + 0.18, cy + 0.26, 0.5, c.n, C.accent);
    s.addText(c.t, { x: cx + 0.8, y: cy + 0.26, w: cw - 0.95, h: 0.5, fontFace: FONT, fontSize: T.T6, bold: true, color: C.title, align: 'left', valign: 'middle', lineSpacingMultiple: 1.0 });
    s.addText(c.d, { x: cx + 0.2, y: cy + 0.95, w: cw - 0.4, h: 1.5, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.15 });
    s.addShape('rect', { x: cx + 0.2, y: cy + 2.55, w: cw - 0.4, h: 0.012, fill: { color: C.lineSoft }, line: { type: 'none' } });
    s.addText(c.ex, { x: cx + 0.2, y: cy + 2.65, w: cw - 0.4, h: 0.7, fontFace: FONT, fontSize: T.T11, italic: true, color: C.accent, align: 'left', valign: 'top', lineSpacingMultiple: 1.1 });
  });
  addSoWhat(s, 'SO WHAT', '把大模型当"能动手的助理" —— 它的产出是文件、是结果，不只是回答。');
  addFooter(s, '来源：本会话实战教训总结', '03');
}

// ============ P4 技术栈与环境准备 ============
{
  const s = newSlide();
  addBase(s, { section: '环境准备', num: '04' });
  const cy = addTitle(s, '打通渲染链路是第一步 —— 先核查再动手', '环境不齐，流程就走不通');
  // 左：工具表
  const lx = M.left, lw = 7.6;
  addPanel(s, lx, cy, lw, 3.5, '必备工具清单');
  const rows = [
    ['工具', '用途', '安装'],
    ['bun', '运行 PptxGenJS', 'brew install bun'],
    ['pptxgenjs', '生成 PPTX（强制）', 'bun add -g pptxgenjs'],
    ['LibreOffice', 'PPTX → PDF 渲染', '官网安装'],
    ['uv', 'Python 环境管理', 'astral.sh/uv'],
    ['python-pptx', '结构自检', 'uv pip install python-pptx'],
    ['PyMuPDF', 'PDF → 每页 PNG', 'uv pip install pymupdf'],
  ];
  addTable(s, rows, { x: lx + 0.16, y: cy + 0.5, w: lw - 0.32, colW: [1.7, 2.5, lw - 0.32 - 4.2], rowH: 0.4, fontSize: T.T11, headSize: T.T11 });
  // 右：渲染链路
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '渲染链路（必须打通）');
  const chain = [
    { t: 'bun + pptxgenjs', d: '生成 PPTX' },
    { t: 'LibreOffice', d: 'PPTX → PDF' },
    { t: 'PyMuPDF', d: 'PDF → 每页 PNG' },
  ];
  chain.forEach((c, i) => {
    const yy = cy + 0.6 + i * 0.78;
    s.addShape('roundRect', { x: rx + 0.2, y: yy, w: rw - 0.4, h: 0.6, rectRadius: 0.05, fill: { color: C.accentBg }, line: { color: C.accentLt, width: 0.75 } });
    s.addText(c.t, { x: rx + 0.32, y: yy, w: rw - 0.6, h: 0.34, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText(c.d, { x: rx + 0.32, y: yy + 0.3, w: rw - 0.6, h: 0.28, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'middle' });
    if (i < chain.length - 1) s.addShape('downArrow', { x: rx + rw / 2 - 0.09, y: yy + 0.62, w: 0.18, h: 0.14, fill: { color: C.accent }, line: { type: 'none' } });
  });
  s.addText('⚠ 踩坑：LibreOffice 只能直接导首页 PNG；多页必须 PDF→PyMuPDF 切。', { x: rx + 0.2, y: cy + 3.05, w: rw - 0.4, h: 0.4, fontFace: FONT, fontSize: T.T14, italic: true, color: C.warn, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  addSoWhat(s, 'SO WHAT', '环境核查是"动手前"的动作 —— 链路没打通就开工，必然中途卡死。');
  addFooter(s, '来源：本会话环境核查实录', '04');
}

// ============ P5 七步工作流总览 ============
{
  const s = newSlide();
  addBase(s, { section: '七步总览', num: '05' });
  const cy = addTitle(s, '七步工程化流程，让大模型稳定产出可编辑 PPT', '一张图看懂从文字到 PPT 的完整路径');
  const flow = [
    { n: '1', t: '证据分析', d: '建证据表、SCR、逐页大纲，第一次确认' },
    { n: '2', t: '风格选择', d: '8 张样张选风格，锁定视觉系统' },
    { n: '3', t: '环境核查', d: '查工具链，缺则如实降级留痕' },
    { n: '4', t: '搭模块', d: '把风格固化成共享视觉模块' },
    { n: '5', t: '3 页验证', d: '先验证视觉执行，再批量生产' },
    { n: '6', t: '生产 QA', d: 'PptxGenJS 搭建 + 渲染 + 结构自检' },
    { n: '7', t: '方向纠偏', d: '意图错了果断重写，不修补' },
  ];
  // 上排 4 个，下排 3 个 + 收束
  const cw = (CW - 0.6) / 4, ch = 1.35, gap = 0.2;
  flow.forEach((f, i) => {
    const row = i < 4 ? 0 : 1;
    const col = i < 4 ? i : i - 4;
    const fx = M.left + col * (cw + gap);
    const fy = cy + 0.15 + row * (ch + 0.3);
    s.addShape('roundRect', { x: fx, y: fy, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.accent, width: 0.75 } });
    nodeCircle(s, fx + 0.16, fy + 0.16, 0.42, f.n, C.accent);
    s.addText(f.t, { x: fx + 0.68, y: fy + 0.16, w: cw - 0.84, h: 0.42, fontFace: FONT, fontSize: T.T6, bold: true, color: C.title, align: 'left', valign: 'middle' });
    s.addText(f.d, { x: fx + 0.18, y: fy + 0.68, w: cw - 0.36, h: 0.6, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
    if (i < flow.length - 1 && i !== 3) s.addShape('rightTriangle', { x: fx + cw + 0.04, y: fy + ch / 2 - 0.08, w: 0.12, h: 0.16, rotate: 90, fill: { color: C.accent }, line: { type: 'none' } });
  });
  // 第4到第5的换行箭头
  s.addText('↓', { x: M.left + 3 * (cw + gap) + cw / 2 - 0.1, y: cy + 0.15 + ch + 0.02, w: 0.2, h: 0.25, fontFace: FONT, fontSize: 14, bold: true, color: C.accent, align: 'center', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '七步是"防翻车"流程 —— 每一步都有确认门或自检，把不确定性逐步消除。');
  addFooter(s, '来源：本会话七步工作流', '05');
}

// ============ P6 步骤① 证据分析 ============
{
  const s = newSlide();
  addBase(s, { section: '步骤① 分析', num: '06' });
  const cy = addTitle(s, '别急着画 —— 先建证据表、写 SCR、定逐页大纲', '内容真实 + 论证清晰，是咨询级 PPT 的地基');
  const lx = M.left, lw = 6.5;
  addPanel(s, lx, cy, lw, 3.5, '证据表样本（每条事实都标来源）');
  const rows = [
    ['ID', '论点/数据', '来源', '置信度'],
    ['E02', 'Flash 覆盖日常 80% 场景', '§1.1', '高（建议比例）'],
    ['E04', '高阶模型约公网 5×', '§1.1', '高'],
    ['E07', 'AGENTS.md 月省 ~30 万 Token', '§2.3', '高（推算）'],
  ];
  addTable(s, rows, { x: lx + 0.16, y: cy + 0.5, w: lw - 0.32, colW: [0.7, 2.9, 0.9, lw - 0.32 - 4.5], rowH: 0.42, fontSize: T.T11, headSize: T.T11 });
  s.addText('纪律：不用常识补数据；冲突如实标注；数字标置信度。', { x: lx + 0.16, y: cy + 2.4, w: lw - 0.32, h: 0.5, fontFace: FONT, fontSize: T.T7, italic: true, color: C.warn, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  s.addText('收敛成 SCR（Situation-Complication-Resolution）+ 逐页大纲（每页含信息密度与组件清单）。', { x: lx + 0.16, y: cy + 2.95, w: lw - 0.32, h: 0.5, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  // 右：第一次确认门
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  s.addShape('roundRect', { x: rx, y: cy, w: rw, h: 3.5, rectRadius: 0.06, fill: { color: C.accentBg }, line: { color: C.accent, width: 1 } });
  s.addText('🚪 第一次确认门', { x: rx + 0.2, y: cy + 0.14, w: rw - 0.4, h: 0.36, fontFace: FONT, fontSize: T.T6, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('必须一次性确认：\n• 故事线（2-3 条选 1）\n• 页数\n• 逐页论点与结论标题\n• 每页信息密度与组件清单\n• 开放数据冲突与 caveat', { x: rx + 0.2, y: cy + 0.6, w: rw - 0.4, h: 2.2, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.25 });
  s.addText('⚠ 不能只在"页标题"层面确认 —— 那样后面必返工。', { x: rx + 0.2, y: cy + 2.9, w: rw - 0.4, h: 0.5, fontFace: FONT, fontSize: T.T11, bold: true, color: C.warn, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  addSoWhat(s, 'SO WHAT', '证据表保证内容真实，确认门保证方向对齐 —— 地基稳了，后面的生产才不会塌。');
  addFooter(s, '来源：步骤① 实战（本会话第一阶段）', '06');
}

// ============ P7 步骤② 风格选择 ============
{
  const s = newSlide();
  addBase(s, { section: '步骤② 风格', num: '07' });
  const cy = addTitle(s, '8 张样张直接选，锁定视觉系统再动手', '风格不是"配色"，是色板+网格+层级+图表语言的整套系统');
  const lx = M.left, lw = 7.3;
  addPanel(s, lx, cy, lw, 3.5, '8 种固定风格（直接发图选）');
  const styles = [
    '1 经典深红咨询风', '2 冷灰+勃艮第红', '3 暖象牙+暗酒红', '4 象牙白+深蓝 ★',
    '5 浅灰白+墨绿', '6 纸张米色+铜棕', '7 浅灰+黑金', '8 冷白灰+深紫',
  ];
  styles.forEach((st, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = lx + 0.2 + col * ((lw - 0.5) / 2);
    const by = cy + 0.55 + row * 0.62;
    const isSel = st.includes('★');
    s.addShape('roundRect', { x: bx, y: by, w: (lw - 0.5) / 2 - 0.1, h: 0.5, rectRadius: 0.05, fill: { color: isSel ? C.accent : C.paper }, line: { color: isSel ? C.accent : C.line, width: isSel ? 1.25 : 0.5 } });
    s.addText(st, { x: bx + 0.12, y: by, w: (lw - 0.5) / 2 - 0.22, h: 0.5, fontFace: FONT, fontSize: T.T7, bold: isSel, color: isSel ? C.white : C.body, align: 'left', valign: 'middle' });
  });
  // 右：选定风格4 + 锁定项
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '选定：风格4 象牙白+深蓝');
  addKPI(s, rx + 0.16, cy + 0.5, rw - 0.32, 1.1, '#12355B', '深蓝强调色', { numSize: 16, note: '专为科技/AI 设计' });
  s.addText('锁定项：', { x: rx + 0.16, y: cy + 1.75, w: rw - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('• 完整色板（底/标题/正文/线条/强调）\n• 15 级 Typography Scale（C0 + T1-T14）\n• 字体（中文苹方 / 代码 Menlo）\n• 页眉页脚 / SO WHAT / 图表语言', { x: rx + 0.16, y: cy + 2.05, w: rw - 0.32, h: 1.3, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  addSoWhat(s, 'SO WHAT', '一套视觉系统贯穿全系列 —— PPT1/PPT2/PPT3 共用风格4，品牌统一不漂移。');
  addFooter(s, '来源：步骤② 风格选择（cyber-ppt 8 风格）', '07');
}

// ============ P8 步骤③ 环境核查与降级 ============
{
  const s = newSlide();
  addBase(s, { section: '步骤③ 核查', num: '08' });
  const cy = addTitle(s, '环境缺图像生成？如实降级，留痕继续', '本会话的关键转折点 —— 不假装满足硬门槛');
  // 左：核查发现
  const lx = M.left, lw = 5.8;
  s.addShape('roundRect', { x: lx, y: cy, w: lw, h: 1.55, rectRadius: 0.06, fill: { color: C.warnLt }, line: { color: C.warn, width: 1 } });
  s.addText('🔍 核查发现', { x: lx + 0.2, y: cy + 0.12, w: lw - 0.4, h: 0.3, fontFace: FONT, fontSize: T.T6, bold: true, color: C.warn, align: 'left', valign: 'middle' });
  s.addText('• 无图像生成（ImageGen）能力\n• 无法生成逐页位图蓝图', { x: lx + 0.2, y: cy + 0.46, w: lw - 0.4, h: 1.0, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  // 右：降级方案
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  s.addShape('roundRect', { x: rx, y: cy, w: rw, h: 1.55, rectRadius: 0.06, fill: { color: C.accentBg }, line: { color: C.pos, width: 1 } });
  s.addText('✓ 降级方案', { x: rx + 0.2, y: cy + 0.12, w: rw - 0.4, h: 0.3, fontFace: FONT, fontSize: T.T6, bold: true, color: C.pos, align: 'left', valign: 'middle' });
  s.addText('跳过 ImageGen 蓝图（留痕 imagegen_skipped），改用 PptxGenJS 原生生产 + LibreOffice 渲染 QA。', { x: rx + 0.2, y: cy + 0.46, w: rw - 0.4, h: 1.0, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  // 下：降级原则
  addPanel(s, M.left, cy + 1.75, CW, 1.75, '降级三原则');
  const pr = [
    { t: '如实告知', d: '明确说哪道门无法满足' },
    { t: '给可选方案', d: 'A 降级生产 / B 换环境' },
    { t: '留痕继续', d: '记录跳过原因与依据' },
  ];
  const pw = (CW - 0.5) / 3;
  pr.forEach((c, i) => {
    const px = M.left + 0.2 + i * (pw + 0.05);
    nodeCircle(s, px, cy + 2.3, 0.4, i + 1, C.accent);
    s.addText(c.t, { x: px + 0.5, y: cy + 2.3, w: pw - 0.5, h: 0.4, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText(c.d, { x: px + 0.5, y: cy + 2.68, w: pw - 0.5, h: 0.5, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  });
  addSoWhat(s, 'SO WHAT', '环境限制不是死局 —— 关键是不假装、留痕迹、用替代方案把活交付。');
  addFooter(s, '来源：步骤③ 环境核查实录', '08');
}

// ============ P9 步骤④ 搭视觉模块 ============
{
  const s = newSlide();
  addBase(s, { section: '步骤④ 模块', num: '09' });
  const cy = addTitle(s, '把风格固化成模块，多份 PPT 共用一套系统', 'theme.js —— 改一处，全套跟着变');
  const lx = M.left, lw = 6.3;
  addPanel(s, lx, cy, lw, 3.5, 'theme.js 包含什么');
  const mods = [
    { t: '色板', d: 'bg / paper / title / body / accent / warn / pos…' },
    { t: 'Typography Scale', d: '15 级（C0 封面 + T1-T14），字号写死' },
    { t: '字体', d: '中文苹方 PingFang SC / 代码 Menlo' },
    { t: '元素函数', d: 'addTitle / addFooter / addSoWhat / addKPI…' },
  ];
  mods.forEach((m, i) => {
    const yy = cy + 0.55 + i * 0.68;
    s.addShape('roundRect', { x: lx + 0.2, y: yy, w: 1.9, h: 0.5, rectRadius: 0.05, fill: { color: C.accent }, line: { type: 'none' } });
    s.addText(m.t, { x: lx + 0.2, y: yy, w: 1.9, h: 0.5, fontFace: FONT, fontSize: T.T7, bold: true, color: C.white, align: 'center', valign: 'middle' });
    s.addText(m.d, { x: lx + 2.2, y: yy, w: lw - 2.4, h: 0.5, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'middle' });
  });
  // 右：代码示例
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '统一观感靠函数复用');
  addCode(s, rx + 0.16, cy + 0.5, rw - 0.32, 2.4,
    '// 每页都这样搭，风格绝不漂移\naddBase(s, {section, num});        // 徽章+页脚\nconst cy = addTitle(s, 标题, 副标题);\naddPanel(s, x, y, w, h, 标题);     // 面板\naddKPI(s, x, y, w, h, 大数字, 标签);\naddTable(s, rows, {...});           // 统一表头\naddSoWhat(s, 标签, 正文);          // 底栏');
  s.addText('两份 PPT 共用 theme.js → 品牌天然统一。', { x: rx + 0.16, y: cy + 3.0, w: rw - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T14, italic: true, color: C.accent, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '模块化是"可复现"的关键 —— 风格写进代码，不靠手调，新人调用即统一。');
  addFooter(s, '来源：步骤④ theme.js 设计', '09');
}

// ============ P10 步骤⑤ 3页验证 ============
{
  const s = newSlide();
  addBase(s, { section: '步骤⑤ 验证', num: '10' });
  const cy = addTitle(s, '先做 3 页样张验证，再批量生产', '小步验证视觉执行，避免 35 页返工');
  // 流程：3页样张 → 渲染 → 人审 → 通过才量产
  const stages = ['做 3 页代表性样张', '渲染每页 PNG', '人审视觉执行', '通过 → 批量生产'];
  const sw = (CW - 0.3) / 4;
  stages.forEach((st, i) => {
    const sx = M.left + i * (sw + 0.1);
    s.addShape('roundRect', { x: sx, y: cy + 0.15, w: sw, h: 1.1, rectRadius: 0.05, fill: { color: i === 3 ? C.accent : C.accentBg }, line: { color: C.accentLt, width: 0.75 } });
    nodeCircle(s, sx + 0.16, cy + 0.3, 0.36, i + 1, i === 3 ? C.white : C.accent);
    s.addText(st, { x: sx + 0.6, y: cy + 0.3, w: sw - 0.7, h: 0.7, fontFace: FONT, fontSize: T.T7, bold: true, color: i === 3 ? C.white : C.title, align: 'left', valign: 'middle', lineSpacingMultiple: 1.0 });
    if (i < stages.length - 1) s.addShape('rightTriangle', { x: sx + sw + 0.01, y: cy + 0.6, w: 0.08, h: 0.16, rotate: 90, fill: { color: C.accent }, line: { type: 'none' } });
  });
  // 代表性样张类型
  const lx = M.left, lw = CW;
  addPanel(s, lx, cy + 1.5, lw * 0.5 - 0.15, 2.0, '3 页样张代表什么');
  s.addText('• 封面页：C0 大标题 + 字体 + 留白\n• 内容页：KPI + 卡片 + SO WHAT 密度\n• 表格页：表头 + 代码块样式', { x: lx + 0.18, y: cy + 2.0, w: lw * 0.5 - 0.5, h: 1.4, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.25 });
  const rx2 = lx + lw * 0.5 + 0.15;
  s.addShape('roundRect', { x: rx2, y: cy + 1.5, w: lw * 0.5 - 0.15, h: 2.0, rectRadius: 0.06, fill: { color: C.warnLt }, line: { color: C.warn, width: 1 } });
  s.addText('⚠ 不验证直接量产的代价', { x: rx2 + 0.2, y: cy + 1.62, w: lw * 0.5 - 0.55, h: 0.3, fontFace: FONT, fontSize: T.T6, bold: true, color: C.warn, align: 'left', valign: 'middle' });
  s.addText('本会话 PPT1 的 P7 连线遮挡、PPT2 的方向错误，都是"做出来才发现" —— 如果先验证，能更早暴露。', { x: rx2 + 0.2, y: cy + 1.98, w: lw * 0.5 - 0.55, h: 1.4, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  addSoWhat(s, 'SO WHAT', '3 页验证是"风险闸门" —— 用最小成本确认视觉执行，再放心量产。');
  addFooter(s, '来源：步骤⑤ 风格验证实战', '10');
}

// ============ P11 步骤⑥ 生产+QA ============
{
  const s = newSlide();
  addBase(s, { section: '步骤⑥ 生产', num: '11' });
  const cy = addTitle(s, 'PptxGenJS 原生搭建 + 渲染 QA + 结构自检', '生产循环：生成 → 渲染 → 自检 → 人审 → 修');
  const lx = M.left, lw = 6.8;
  addPanel(s, lx, cy, lw, 3.5, '生产循环（每份 PPT 都走一遍）');
  const loop = ['bun run build-x.js → 生成 PPTX', 'bash render.sh → 每页 PNG', 'python 结构自检 → 零尺寸/越界', '渲染图发人审 → 有问题就修'];
  loop.forEach((t, i) => {
    const yy = cy + 0.6 + i * 0.62;
    nodeCircle(s, lx + 0.2, yy + 0.02, 0.38, i + 1, C.accent);
    s.addText(t, { x: lx + 0.72, y: yy, w: lw - 0.9, h: 0.42, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
    if (i < loop.length - 1) s.addShape('rect', { x: lx + 0.385, y: yy + 0.4, w: 0.02, h: 0.22, fill: { color: C.accent }, line: { type: 'none' } });
  });
  s.addText('100% 原生对象（文本/形状/表格），0 图片 → 完全可编辑。', { x: lx + 0.2, y: cy + 3.15, w: lw - 0.4, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, color: C.pos, align: 'left', valign: 'middle' });
  // 右：结构自检代码
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '结构自检脚本（复现必备）');
  addCode(s, rx + 0.16, cy + 0.5, rw - 0.32, 2.5,
    'from pptx import Presentation\nprs = Presentation("xxx.pptx")\nW,H = prs.slide_width/914400, prs.slide_height/914400\nfor i,sl in enumerate(prs.slides,1):\n  for sh in sl.shapes:\n    l,t,w,h = (sh.left/914400, sh.top/914400,\n              sh.width/914400, sh.height/914400)\n    if w<=0 or h<=0: print(f"P{i} 零尺寸")\n    if l+w>W+0.05: print(f"P{i} 右越界")\n    if t+h>H+0.05: print(f"P{i} 下越界")');
  s.addText('用脚本查，不靠肉眼 —— 又快又准。', { x: rx + 0.16, y: cy + 3.1, w: rw - 0.32, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, color: C.accent, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '生产不是"生成完就交" —— 渲染 + 自检 + 人审三道关，才能保证每页都合格。');
  addFooter(s, '来源：步骤⑥ 生产循环实战', '11');
}

// ============ P12 步骤⑦ 方向纠偏 ============
{
  const s = newSlide();
  addBase(s, { section: '步骤⑦ 纠偏', num: '12' });
  const cy = addTitle(s, '发现意图理解错，果断重写', '本会话最重要的教训 —— PPT2 从"成本"到"用好"');
  // 上：案例时间线
  s.addShape('roundRect', { x: M.left, y: cy, w: CW, h: 0.95, rectRadius: 0.05, fill: { color: C.warnLt }, line: { color: C.warn, width: 0.75 } });
  s.addText('PPT2 第一版：按源材料标题做"成本优化"（5×成本、降本法则、Token KPI） → 用户反馈：成本不是我要操心的，我要让团队更好地使用 → 立即重写为"用好大模型 + 团队落地"', { x: M.left + 0.2, y: cy + 0.1, w: CW - 0.4, h: 0.8, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle', lineSpacingMultiple: 1.2 });
  // 下：三条教训
  const cards = [
    { n: '1', t: '源材料标题 ≠ 真实意图', d: '材料叫"成本优化"，但用户要"用好" —— 要挖到真实目的' },
    { n: '2', t: '重写前先确认新结构', d: '已经错过一次，新方向必须再确认，避免二次跑偏' },
    { n: '3', t: '不在错误方向上修补', d: '方向错就推翻重来，别在小修小补上浪费时间' },
  ];
  const cw = (CW - 0.5) / 3, ch = 2.1;
  cards.forEach((c, i) => {
    const cx = M.left + i * (cw + 0.25);
    s.addShape('roundRect', { x: cx, y: cy + 1.15, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.accent, width: 0.75 } });
    nodeCircle(s, cx + 0.18, cy + 1.32, 0.46, c.n, C.accent);
    s.addText(c.t, { x: cx + 0.74, y: cy + 1.32, w: cw - 0.9, h: 0.46, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle', lineSpacingMultiple: 1.0 });
    s.addText(c.d, { x: cx + 0.2, y: cy + 1.95, w: cw - 0.4, h: 1.2, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.15 });
  });
  addSoWhat(s, 'SO WHAT', '方向纠偏不是失败，而是流程的一部分 —— 早发现、早重写，比硬撑到底省得多。');
  addFooter(s, '来源：步骤⑦ PPT2 重写实录', '12');
}

// ============ P13 六条核心方法论 ============
{
  const s = newSlide();
  addBase(s, { section: '方法论', num: '13' });
  const cy = addTitle(s, '六条核心实践，让大模型协作又稳又快', '把本会话的教训提炼成可复用的方法论');
  const m = [
    { n: '1', t: '证据表先行', d: '每个事实标来源，不臆造、不用常识补' },
    { n: '2', t: '确认门要重', d: '故事线/页数/论点/密度一次确认' },
    { n: '3', t: '先验证再量产', d: '3 页样张确认视觉，再批量生产' },
    { n: '4', t: '结构自检', d: '脚本查零尺寸/越界，不靠肉眼' },
    { n: '5', t: '局限要诚实', d: 'AI 无法读图交人审；缺能力就降级留痕' },
    { n: '6', t: '错了果断重写', d: '意图错就推翻重来，不修补' },
  ];
  const cw = (CW - 0.5) / 3, ch = 1.55, gap = 0.25;
  m.forEach((c, i) => {
    const cx = M.left + (i % 3) * (cw + gap);
    const cyy = cy + 0.12 + Math.floor(i / 3) * (ch + gap);
    s.addShape('roundRect', { x: cx, y: cyy, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
    nodeCircle(s, cx + 0.18, cyy + 0.2, 0.5, c.n, C.accent);
    s.addText(c.t, { x: cx + 0.82, y: cyy + 0.2, w: cw - 1.0, h: 0.5, fontFace: FONT, fontSize: T.T6, bold: true, color: C.title, align: 'left', valign: 'middle' });
    s.addText(c.d, { x: cx + 0.2, y: cyy + 0.85, w: cw - 0.4, h: 0.6, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
  });
  addSoWhat(s, 'SO WHAT', '六条方法论是"防翻车护栏" —— 每一条都来自本会话的真实教训。');
  addFooter(s, '来源：六条核心实践总结', '13');
}

// ============ P14 踩坑避坑指南 ============
{
  const s = newSlide();
  addBase(s, { section: '避坑指南', num: '14' });
  const cy = addTitle(s, '七个坑及解法 —— 别再踩一次', '本会话踩过的坑，都在这里');
  const rows = [
    ['坑', '现象', '解法'],
    ['意图理解错', 'PPT2 做成成本优化', '重写前确认新结构；标题≠意图'],
    ['z-order 遮挡', '连线盖住中心节点', '先画线（底层）再画节点（上层）'],
    ['零尺寸告警', '垂直线 w:0 触发自检', '改 w:0.02 细矩形'],
    ['看不到逐页渲染', 'LibreOffice 只导首页', '装 PyMuPDF，PDF→每页 PNG'],
    ['缺图像生成', '无法做 ImageGen 蓝图', '如实降级：原生生产+渲染QA'],
    ['AI 无法读图', '模型不支持图像输入', '渲染图发人审；AI 负责结构'],
    ['效果数据失真', '把预估%当实测成果', '标"预估/待实测"或用可观察信号'],
  ];
  addTable(s, rows, { x: M.left, y: cy + 0.12, w: CW, colW: [2.3, 4.0, CW - 6.3], rowH: 0.4, fontSize: T.T11, headSize: T.T7 });
  addSoWhat(s, 'SO WHAT', '踩坑不可怕 —— 记下来、有解法，新人就能直接绕过。');
  addFooter(s, '来源：本会话踩坑实录', '14');
}

// ============ P15 新人复现 Checklist ============
{
  const s = newSlide();
  addBase(s, { section: '复现指南', num: '15' });
  const cy = addTitle(s, '照这 6 阶段做，新手也能复现', '从准备到交付，勾选式推进');
  const cols = [
    { t: 'A · 准备', items: ['装 bun/pptxgenjs/LibreOffice', '装 uv/python-pptx/PyMuPDF', '跑环境核查', '准备文字源材料'] },
    { t: 'B · 分析', items: ['建证据表', '脑暴故事线选 1', '写 SCR + 逐页大纲', '确认门拍板'] },
    { t: 'C · 定风格', items: ['展示 8 张样张', '选定风格', '锁定色板/字体/图标'] },
    { t: 'D · 模块+验证', items: ['写共享视觉模块', '做 3 页样张', '渲染确认视觉执行'] },
    { t: 'E · 生产', items: ['逐页 PptxGenJS 搭建', '渲染 + 结构自检', '人审逐页', '定稿'] },
    { t: 'F · 校准', items: ['方向不对→确认新结构', '果断重写', '删旧版避免混淆'] },
  ];
  const cw = (CW - 0.5) / 3, ch = 1.68, gap = 0.25;
  cols.forEach((c, i) => {
    const cx = M.left + (i % 3) * (cw + gap);
    const cyy = cy + 0.12 + Math.floor(i / 3) * (ch + gap);
    s.addShape('roundRect', { x: cx, y: cyy, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
    s.addShape('rect', { x: cx, y: cyy, w: cw, h: 0.36, fill: { color: C.accent }, line: { type: 'none' } });
    s.addText(c.t, { x: cx + 0.16, y: cyy, w: cw - 0.32, h: 0.36, fontFace: FONT, fontSize: T.T7, bold: true, color: C.white, align: 'left', valign: 'middle' });
    s.addText(c.items.map((x, j) => ({ text: `☐ ${x}`, options: { color: C.body, fontSize: T.T11, breakLine: j < c.items.length - 1 } })),
      { x: cx + 0.16, y: cyy + 0.44, w: cw - 0.32, h: ch - 0.5, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.25 });
  });
  addSoWhat(s, 'SO WHAT', 'Checklist 把"经验"变成"步骤" —— 新人照着勾，就能走完全程。');
  addFooter(s, '来源：新人复现 6 阶段 Checklist', '15');
}

// ============ P16 成果展示 ============
{
  const s = newSlide();
  addBase(s, { section: '成果', num: '16' });
  const cy = addTitle(s, '实战成果：两份可编辑咨询级 PPT', '同一套流程、同一套风格，产出系列化交付物');
  // 左右两个成果卡
  const half = (CW - 0.3) / 2;
  // PPT1
  s.addShape('roundRect', { x: M.left, y: cy, w: half, h: 2.3, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.accent, width: 1 } });
  s.addShape('rect', { x: M.left, y: cy, w: 0.08, h: 2.3, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('PPT1《公司大模型工具使用入门》', { x: M.left + 0.24, y: cy + 0.14, w: half - 0.4, h: 0.4, fontFace: FONT, fontSize: T.T6, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('17 页 · 面向新人 · 手把手教学', { x: M.left + 0.24, y: cy + 0.56, w: half - 0.4, h: 0.3, fontFace: FONT, fontSize: T.T7, color: C.sub, align: 'left', valign: 'middle' });
  s.addText('封面 / 模型一览 / 权限安装 / 核心概念 / Plan-Build / 六大场景 / 6 个 Demo / AGENTS.md / Skill / 安全 / FAQ / Checklist', { x: M.left + 0.24, y: cy + 0.95, w: half - 0.4, h: 1.2, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  // PPT2
  const rx2 = M.left + half + 0.3;
  s.addShape('roundRect', { x: rx2, y: cy, w: half, h: 2.3, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.accent, width: 1 } });
  s.addShape('rect', { x: rx2, y: cy, w: 0.08, h: 2.3, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('PPT2《用好大模型：进阶应用与团队落地》', { x: rx2 + 0.24, y: cy + 0.14, w: half - 0.4, h: 0.4, fontFace: FONT, fontSize: T.T6, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('18 页 · 面向 TL/资深 · 团队赋能', { x: rx2 + 0.24, y: cy + 0.56, w: half - 0.4, h: 0.3, fontFace: FONT, fontSize: T.T7, color: C.sub, align: 'left', valign: 'middle' });
  s.addText('五板斧(选型/AGENTS.md/Prompt/工作流/规范) / 4 高价值场景(DOE/调研/项目/沉淀) / 提效配置 / 团队规范 / 落地路线图 / 效果信号', { x: rx2 + 0.24, y: cy + 0.95, w: half - 0.4, h: 1.2, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  // 底部：可复用资产
  addClaim(s, M.left, cy + 2.5, CW, '可复用资产：theme.js（视觉模块）+ render.sh（渲染）+ build 脚本模板', { h: 0.5 });
  s.addText('改文案/换主题/加页数都能复用这套资产 —— 这就是"实践落地"的真正价值。', { x: M.left, y: cy + 3.1, w: CW, h: 0.4, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addFooter(s, '来源：本会话最终交付物', '16');
}

// ============ P17 收束 ============
{
  const s = newSlide();
  addBase(s, { section: '收束', num: '17' });
  const cy = addTitle(s, '把"个人会用"变成"团队会做" —— 大模型实践落地', '可复现的工程化方法，才是真正的落地');
  // 左：核心一句话
  const lx = M.left, lw = 7.2;
  addPanel(s, lx, cy, lw, 2.4, '一句话总结');
  s.addText([
    { text: '大模型不是"聊天机器人"，而是"能动手的助理"。', options: { bold: true, color: C.accent, fontSize: 14, breakLine: true } },
    { text: '\n', options: { fontSize: 4 } },
    { text: '用工程化方法（证据分析→风格锁定→环境核查→模块化生产→渲染 QA→方向纠偏），把它变成可复现的生产力。', options: { color: C.body, fontSize: T.T7 } },
  ], { x: lx + 0.2, y: cy + 0.55, w: lw - 0.4, h: 1.7, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.3 });
  // 右：行动号召
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addClaim(s, rx, cy, rw, '立即行动', { h: 0.55 });
  s.addText('• 装好环境，打通渲染链路\n• 用一份小材料跑通七步流程\n• 把 theme.js 存成团队资产\n• 沉淀你自己的踩坑清单', { x: rx + 0.16, y: cy + 0.7, w: rw - 0.32, h: 1.6, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.25 });
  // 底部：三份配套
  addClaim(s, M.left, cy + 2.6, CW, '三份配套：PPT1 入门 · PPT2 进阶 · PPT3 实践落地', { h: 0.5 });
  s.addText('入门教"开通上手"，进阶教"用好赋能"，实践落地教"复现方法" —— 三份合起来是一套完整的大模型团队能力建设。', { x: M.left, y: cy + 3.2, w: CW, h: 0.4, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addFooter(s, '来源：全篇收束 · 大模型实践落地', '17');
}

const OUT = '/Volumes/Vault/repos/github/notes/PPT-项目/PPT3-大模型实践落地/deck/PPT3-大模型实践落地.pptx';
p.writeFile({ fileName: OUT }).then(f => console.log('PPT3 写出:', f, '| 页数:', p.slides.length));
