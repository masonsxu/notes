// build-ppt2.js — PPT2《用好大模型：CIMICode 进阶应用与团队落地》18 页（重写版，去成本、聚焦用好）
const PptxGenJS = require('pptxgenjs');
const th = require('./theme.js');
const { PAGE, M, CW, C, T, FONT, FONT_EN,
  addBase, addTitle, addFooter, addSoWhat, addKPI, addPanel, addClaim, addTable, addCode, addPill } = th;

const p = new PptxGenJS();
p.defineLayout({ name: 'W', width: PAGE.w, height: PAGE.h });
p.layout = 'W';
p.author = 'CIMICode TD Testing';
p.company = 'CIMICode';
p.title = '用好大模型：CIMICode 进阶应用与团队落地';

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
  s.addText('CIMICode · 进阶培训', { x: M.left + 0.2, y: 1.35, w: 10, h: 0.4, fontFace: FONT, fontSize: T.T3, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('用好大模型', { x: M.left + 0.2, y: 1.8, w: 12, h: 1.0, fontFace: FONT, fontSize: T.C0, bold: true, color: C.title, align: 'left', valign: 'middle' });
  s.addText('CIMICode 进阶应用与团队落地', { x: M.left + 0.2, y: 2.85, w: 12, h: 0.8, fontFace: FONT, fontSize: 26, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('从"会聊"到"用好"，让团队真正发挥大模型价值', { x: M.left + 0.2, y: 3.85, w: 11.5, h: 0.6, fontFace: FONT, fontSize: 17, color: C.sub, align: 'left', valign: 'middle' });
  s.addShape('rect', { x: M.left + 0.2, y: 4.65, w: 2.2, h: 0.06, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('受众：TL、组内资深工程师    |    讲师：TD Testing', { x: M.left + 0.2, y: 6.45, w: 11, h: 0.4, fontFace: FONT, fontSize: T.T7, color: C.faint, align: 'left', valign: 'middle' });
  addFooter(s, '配套：《公司大模型工具使用入门》(PPT1)', '01');
}

// ============ P2 导览：痛点 + 五板斧 ============
{
  const s = newSlide();
  addBase(s, { section: '导览', num: '02' });
  const cy = addTitle(s, '从"会聊"到"用好"：三大进阶痛点，五板斧破局', '团队不缺工具，缺的是"用好"的方法论与规范');
  // 左：三大痛点
  const lx = M.left, lw = 5.0;
  addPanel(s, lx, cy, lw, 3.5, '团队现状的三大痛点');
  const pains = [
    { t: '输出不稳', d: '没配背景/术语，大模型望文生义，反复返工', c: C.neg },
    { t: '重复造轮子', d: '每个人各写各的 Prompt，经验无法沉淀复用', c: C.warn },
    { t: '水平参差', d: '新人不会问、老人不会教，团队能力断层', c: C.sub },
  ];
  pains.forEach((pn, i) => {
    const yy = cy + 0.55 + i * 0.92;
    s.addShape('ellipse', { x: lx + 0.2, y: yy + 0.07, w: 0.4, h: 0.4, fill: { color: pn.c }, line: { type: 'none' } });
    s.addText(String(i + 1), { x: lx + 0.2, y: yy + 0.07, w: 0.4, h: 0.4, fontFace: FONT_EN, fontSize: 13, bold: true, color: C.white, align: 'center', valign: 'middle' });
    s.addText(pn.t, { x: lx + 0.74, y: yy, w: 1.8, h: 0.34, fontFace: FONT, fontSize: T.T6, bold: true, color: pn.c, align: 'left', valign: 'middle' });
    s.addText(pn.d, { x: lx + 0.74, y: yy + 0.34, w: lw - 1.0, h: 0.5, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  });
  // 右：五板斧
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '本课五板斧');
  const axes = ['① 选对模型（按任务选型）', '② 配好 AGENTS.md（人设与术语）', '③ 写好 Prompt（具体 + 结构化）', '④ 用对工作流与工具（Plan-Build + Skill）', '⑤ 团队规范落地（统一配置 + 复用）'];
  axes.forEach((st, i) => {
    const yy = cy + 0.55 + i * 0.56;
    nodeCircle(s, rx + 0.2, yy + 0.01, 0.34, i + 1, C.accent);
    s.addText(st, { x: rx + 0.7, y: yy, w: rw - 0.9, h: 0.36, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
    if (i < axes.length - 1) s.addShape('rect', { x: rx + 0.365, y: yy + 0.34, w: 0.02, h: 0.22, fill: { color: C.accent }, line: { type: 'none' } });
  });
  s.addText('← 基础入门见 PPT1《公司大模型工具使用入门》', { x: rx + 0.2, y: cy + 3.38, w: rw - 0.4, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, color: C.faint, align: 'left', valign: 'middle' });
  addSoWhat(s, '本课目标', '用五板斧 + 团队规范，把"个人会用"升级成"团队用好"，让大模型真正成为生产力。');
  addFooter(s, '来源：PPT2 进阶内容重组（§3-§9）', '02');
}

// ============ P3 板斧① 选对模型 ============
{
  const s = newSlide();
  addBase(s, { section: '板斧① 选对模型', num: '03' });
  const cy = addTitle(s, '按任务选模型：简单归 Flash、复杂归高阶', '选对模型是用好的第一步 —— 够用即可，不盲目上高阶');
  const rows = [
    ['任务类型', '推荐模型', '理由'],
    ['简单文本整理', 'Flash', '速度优先，快速完成'],
    ['代码草稿编写', 'Flash', '快速迭代，响应快'],
    ['Log 解析（简单）', 'Flash', '格式转换类，Flash 足够'],
    ['复杂 Bug 排查', 'Pro', '需深度推理、多步分析'],
    ['架构设计', 'Pro', '需全局思考与权衡'],
    ['长篇 SOP 编写', 'GLM', '长文本生成能力强'],
    ['海量文档对比', 'Kimi', '超长上下文支持'],
  ];
  addTable(s, rows, { x: M.left, y: cy + 0.12, w: 8.4, colW: [2.6, 1.4, 4.4], rowH: 0.4, fontSize: T.T7, headSize: T.T7 });
  const rx = M.left + 8.6, rw = CW - 8.6;
  addPanel(s, rx, cy + 0.12, rw, 3.38, '何时升高阶？');
  s.addText([
    { text: '默认：Flash', options: { bold: true, color: C.pos, fontSize: T.T7, breakLine: true } },
    { text: '\n', options: { fontSize: 4 } },
    { text: '触发切换：', options: { bold: true, color: C.warn, fontSize: T.T7, breakLine: true } },
    { text: '• 多次改代码仍未解决\n• 逻辑推理陷入死循环\n• 长文档 / 海量对比任务', options: { color: C.body, fontSize: T.T7 } },
  ], { x: rx + 0.2, y: cy + 0.6, w: rw - 0.4, h: 2.8, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.2 });
  addSoWhat(s, 'SO WHAT', '选型不是"越强越好" —— 把深度推理能力留给真正复杂的任务，日常交给 Flash 快速完成。');
  addFooter(s, '来源：模型选择策略（§1.3 / §2.1）', '03');
}

// ============ P4 板斧② AGENTS.md 消歧义 + 模板 ============
{
  const s = newSlide();
  addBase(s, { section: '板斧② 配好 AGENTS.md', num: '04' });
  const cy = addTitle(s, 'AGENTS.md 让大模型秒懂半导体专业语义', '消歧义 + 完整四段模板，从第一次响应就理解术语');
  const lx = M.left, lw = 5.3;
  addPanel(s, lx, cy, lw, 3.5, '消歧义：通用 vs 专业');
  const rows = [
    ['术语', '通用理解', '半导体专业'],
    ['Bump', '碰撞', '微凸块，芯片互连'],
    ['Probe Card', '探测卡', '探针卡，晶圆测试'],
    ['Yield', '产量', '良率，合格品比例'],
    ['Pre-DC', '预直流', '键合前电性测试'],
    ['SECS/GEM', '无', '设备通讯标准协议'],
  ];
  addTable(s, rows, { x: lx + 0.16, y: cy + 0.5, w: lw - 0.32, colW: [1.2, 1.3, lw - 0.32 - 2.5], rowH: 0.4, fontSize: T.T11, headSize: T.T11 });
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '完整配置模板（四段）');
  addCode(s, rx + 0.16, cy + 0.5, rw - 0.32, 2.45,
    '# Role & Background\n半导体先进封装 TD Testing 高级测试工程师\n（测试 Flow / 自动化 / 数据分析 / 报错排查）\n\n# Terminology & Context\nPre-DC / CPK / Yield / DOE / SECS-GEM / Prober\n\n# Coding & Response Style\n优先 Python + pandas，异常处理健壮，结果导向\n\n# Safety & Constraints\n产线操作先确认安全步骤，改动前先备份');
  s.addText('路径：~/.cimi/cimicode/AGENTS.md（一次配置，永久生效）', { x: rx + 0.16, y: cy + 3.02, w: rw - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T14, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '术语消歧义直接降低误判率 —— 配好专业背景，大模型不再"望文生义"，输出一次到位。');
  addFooter(s, '来源：AGENTS.md 高级配置（§3.1 / §3.2）', '04');
}

// ============ P5 AGENTS.md 分项目配置 ============
{
  const s = newSlide();
  addBase(s, { section: '板斧② 配好 AGENTS.md', num: '05' });
  const cy = addTitle(s, '全局 + 项目级双层配置，兼顾通用与专用', '一套全局打底，每个项目再叠加专用上下文');
  const lx = M.left, lw = 5.4;
  addPanel(s, lx, cy, lw, 3.5, '配置目录结构');
  s.addText([
    { text: '~/.cimi/cimicode/AGENTS.md', options: { bold: true, color: C.accent, fontSize: T.T7, fontFace: FONT_EN, breakLine: true } },
    { text: '└ 全局配置（对所有项目生效）\n', options: { color: C.sub, fontSize: T.T7 } },
    { text: '\n', options: { fontSize: 4 } },
    { text: '<项目目录>/AGENTS.md', options: { bold: true, color: C.accent, fontSize: T.T7, fontFace: FONT_EN, breakLine: true } },
    { text: '└ 项目级配置（仅对该项目生效）', options: { color: C.sub, fontSize: T.T7 } },
  ], { x: lx + 0.2, y: cy + 0.55, w: lw - 0.4, h: 1.4, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.2 });
  s.addText('优先级：项目级 > 全局（同名内容项目级覆盖）', { x: lx + 0.2, y: cy + 2.2, w: lw - 0.4, h: 0.5, fontFace: FONT, fontSize: T.T7, italic: true, color: C.warn, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '项目级配置示例');
  addCode(s, rx + 0.16, cy + 0.5, rw - 0.32, 2.4,
    '# Project-Specific Context\n## 项目信息\n- 项目名称: XXX 产品 Pre-DC 测试\n- 测试机型: Accretech Prober + Advantest Tester\n- 测试项目: Contact Resistance, Leakage\n\n## 数据目录结构\n- ./logs/ 原始 Log    ./data/ 处理后数据\n- ./scripts/ 脚本    ./reports/ 报告\n\n## 特殊要求\n- 所有脚本支持 UTF-8，时间戳统一 UTC+8');
  s.addText('项目级让大模型知道"这次具体测什么、数据放哪"。', { x: rx + 0.16, y: cy + 2.98, w: rw - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T14, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '全局打底 + 项目叠加 —— 通用规范一次写好，项目细节随用随加，团队配置不再各写各的。');
  addFooter(s, '来源：分项目配置（§3.3）', '05');
}

// ============ P6 板斧③ Prompt 模糊vs具体 ============
{
  const s = newSlide();
  addBase(s, { section: '板斧③ 写好 Prompt', num: '06' });
  const cy = addTitle(s, '信息越具体，输出越准确', 'Prompt 黄金法则 —— 模糊指令得通用答案，具体指令得可用结果');
  const half = (CW - 0.3) / 2;
  s.addShape('roundRect', { x: M.left, y: cy, w: half, h: 3.5, rectRadius: 0.06, fill: { color: C.warnLt }, line: { color: C.warn, width: 1 } });
  s.addText('✗ 模糊（效果差）', { x: M.left + 0.2, y: cy + 0.12, w: half - 0.4, h: 0.34, fontFace: FONT, fontSize: T.T6, bold: true, color: C.warn, align: 'left', valign: 'middle' });
  addCode(s, M.left + 0.2, cy + 0.5, half - 0.4, 0.6, '> 帮我排查这个测试机报错。');
  s.addText('问题：', { x: M.left + 0.2, y: cy + 1.2, w: half - 0.4, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.neg, align: 'left', valign: 'middle' });
  s.addText('• 不知道机台型号\n• 不知道 Log 位置\n• 不知道测试项与现象', { x: M.left + 0.2, y: cy + 1.48, w: half - 0.4, h: 0.9, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  s.addText('→ 输出：通用排查步骤，不具针对性', { x: M.left + 0.2, y: cy + 2.75, w: half - 0.4, h: 0.5, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  const rx2 = M.left + half + 0.3;
  s.addShape('roundRect', { x: rx2, y: cy, w: half, h: 3.5, rectRadius: 0.06, fill: { color: C.accentBg }, line: { color: C.pos, width: 1 } });
  s.addText('✓ 具体（效果极佳）', { x: rx2 + 0.2, y: cy + 0.12, w: half - 0.4, h: 0.34, fontFace: FONT, fontSize: T.T6, bold: true, color: C.pos, align: 'left', valign: 'middle' });
  addCode(s, rx2 + 0.2, cy + 0.5, half - 0.4, 1.3,
    '> Accretech 探针台 Pre-DC 测试报 ERR-2041\n  Contact Resistance Exceeded。\n  Wafer 第3次Pass，Pin: Row A-F Col 1-12，\n  Log: ./logs/prober_20260726.txt。\n  请分析 ERR-2041 前后 Pin 坐标，\n  识别高阻 Die 分布，生成 Python 散点图。');
  s.addText('→ 输出：针对性分析脚本，直接可用', { x: rx2 + 0.2, y: cy + 2.9, w: half - 0.4, h: 0.5, fontFace: FONT, fontSize: T.T7, italic: true, bold: true, color: C.pos, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '把机台、错误码、坐标范围、Log 路径都给全 —— 大模型才能从"通用答案"升级到"可直接用的方案"。');
  addFooter(s, '来源：Prompt 工程（§6.1 / §6.2）', '06');
}

// ============ P7 Prompt 五段式模板 ============
{
  const s = newSlide();
  addBase(s, { section: '板斧③ 写好 Prompt', num: '07' });
  const cy = addTitle(s, '用"背景/目标/约束/输入/输出"五段式框架提问', '结构化 Prompt 模板 + 3 个优化技巧，团队统一提问方式');
  const lx = M.left, lw = 7.0;
  addPanel(s, lx, cy, lw, 3.5, '结构化 Prompt 五段式模板');
  const seg = [
    { k: '【背景】', v: '项目/场景描述、技术栈、已有条件' },
    { k: '【目标】', v: '期望功能、输出格式要求' },
    { k: '【约束】', v: '性能、兼容性、安全限制' },
    { k: '【输入】', v: '数据/代码/配置文件位置' },
    { k: '【输出】', v: '文件格式、保存位置、是否测试' },
  ];
  seg.forEach((g, i) => {
    const yy = cy + 0.55 + i * 0.5;
    s.addShape('roundRect', { x: lx + 0.16, y: yy, w: 1.1, h: 0.4, rectRadius: 0.04, fill: { color: C.accent }, line: { type: 'none' } });
    s.addText(g.k, { x: lx + 0.16, y: yy, w: 1.1, h: 0.4, fontFace: FONT, fontSize: T.T7, bold: true, color: C.white, align: 'center', valign: 'middle' });
    s.addText(g.v, { x: lx + 1.36, y: yy, w: lw - 1.55, h: 0.4, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle' });
  });
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '3 个优化技巧');
  const tk = [
    { t: '提供示例', d: '给一行期望格式，模型照着输出' },
    { t: '分步骤指令', d: '先读→筛选→统计→导出，逐步' },
    { t: '明确输出格式', d: '脚本语言、库、文件名一次说清' },
  ];
  tk.forEach((t, i) => {
    const yy = cy + 0.6 + i * 0.85;
    nodeCircle(s, rx + 0.2, yy + 0.03, 0.4, i + 1, C.accent);
    s.addText(t.t, { x: rx + 0.74, y: yy, w: rw - 0.9, h: 0.34, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText(t.d, { x: rx + 0.74, y: yy + 0.32, w: rw - 0.9, h: 0.42, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  });
  addSoWhat(s, 'SO WHAT', '五段式是可复用的提问框架 —— 团队统一用它，输出质量与一致性都能稳定提升。');
  addFooter(s, '来源：Prompt 优化技巧（§6.3 / §6.4）', '07');
}

// ============ P8 板斧④ Plan-Build 工作流 ============
{
  const s = newSlide();
  addBase(s, { section: '板斧④ 工作流与工具', num: '08' });
  const cy = addTitle(s, 'Plan 5 步规划审核，Build 自动落地执行', '复杂项目先规划架构、拆任务、评估风险，再执行');
  const stages = ['1 理解需求', '2 拆解任务', '3 设计架构', '4 评估风险', '5 生成 TODO.md'];
  const sw = (CW - 0.4) / 5;
  stages.forEach((st, i) => {
    const sx = M.left + i * (sw + 0.1);
    s.addShape('roundRect', { x: sx, y: cy + 0.1, w: sw, h: 0.7, rectRadius: 0.05, fill: { color: i === 4 ? C.accent : C.accentBg }, line: { color: C.accentLt, width: 0.75 } });
    s.addText(st, { x: sx, y: cy + 0.1, w: sw, h: 0.7, fontFace: FONT, fontSize: T.T7, bold: true, color: i === 4 ? C.white : C.accent, align: 'center', valign: 'middle' });
    if (i < stages.length - 1) s.addShape('rightTriangle', { x: sx + sw + 0.01, y: cy + 0.36, w: 0.08, h: 0.18, rotate: 90, fill: { color: C.accent }, line: { type: 'none' } });
  });
  s.addText('↓ 工程师审核 Plan：通过 → Build；有问题 → 回 Plan 修改', { x: M.left, y: cy + 0.9, w: CW, h: 0.3, fontFace: FONT, fontSize: T.T7, bold: true, color: C.warn, align: 'center', valign: 'middle' });
  const lx = M.left, lw = 7.3;
  addPanel(s, lx, cy + 1.35, lw, 2.15, 'Plan 产物：TODO.md 示例');
  addCode(s, lx + 0.16, cy + 1.78, lw - 0.32, 1.65,
    '# 测试数据自动化分析平台\n## 架构: pandas + SQLAlchemy / matplotlib / HTML+PDF\n## Phase 1 基础框架(2天): 目录结构 / 数据加载 / 统计\n## Phase 2 可视化(2天): CPK 趋势 / Yield 分布 / 异常标记\n## Phase 3 报告(1天): HTML 模板 / PDF 导出 / 历史对比\n## 风险: 数据格式不一致 → 需清洗层；大数据量 → 分块');
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy + 1.35, rw, 2.15, '加速开发三技巧');
  const tips = ['并行任务拆解（独立模块并行）', '增量式开发（先 MVP 后扩展）', '代码复用（参考已有模块风格）'];
  tips.forEach((t, i) => {
    const yy = cy + 1.82 + i * 0.5;
    s.addText(`▸ ${t}`, { x: rx + 0.2, y: yy, w: rw - 0.4, h: 0.42, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  });
  addSoWhat(s, 'SO WHAT', 'Plan 让"做不做、怎么做"先想清楚 —— 减少返工，复杂项目也能稳步推进，团队协作更高效。');
  addFooter(s, '来源：Plan-Build 高级工作流（§4.1 / §4.2 / §4.4）', '08');
}

// ============ P9 板斧④ Skill 深度 ============
{
  const s = newSlide();
  addBase(s, { section: '板斧④ 工作流与工具', num: '09' });
  const cy = addTitle(s, 'Grill-Me 厘清需求，Web Search 补时效', '两个 Skill 让团队提问不卡壳、信息不过期');
  const half = (CW - 0.3) / 2;
  addPanel(s, M.left, cy, half, 3.5, 'Grill-Me · 5 类反问厘清需求');
  const gq = ['Log 文件格式是什么？', '要提取哪些关键字段？', '输出格式要求？（CSV/Excel/JSON）', '是否需要统计分析？', '是否需要可视化？'];
  gq.forEach((q, i) => {
    const yy = cy + 0.55 + i * 0.45;
    s.addShape('roundRect', { x: M.left + 0.16, y: yy, w: half - 0.32, h: 0.36, rectRadius: 0.05, fill: { color: i % 2 ? C.accentBg : C.paper }, line: { color: C.accentLt, width: 0.5 } });
    s.addText(`${i + 1}. ${q}`, { x: M.left + 0.26, y: yy, w: half - 0.5, h: 0.36, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle' });
  });
  addCode(s, M.left + 0.16, cy + 2.95, half - 0.32, 0.45, '$ /install-skill grill-me');
  const rx2 = M.left + half + 0.3;
  addPanel(s, rx2, cy, half, 3.5, 'Web Search · 4 大场景');
  const ws = [
    { t: 'API 文档', d: '查最新库版本（如 pysecsgem）' },
    { t: '方案调研', d: '行业最佳实践' },
    { t: '问题排查', d: '类似报错的解决方案' },
    { t: '标准查询', d: 'JEDEC 等标准更新' },
  ];
  ws.forEach((w, i) => {
    const yy = cy + 0.55 + i * 0.5;
    s.addShape('roundRect', { x: rx2 + 0.16, y: yy, w: 1.5, h: 0.4, rectRadius: 0.05, fill: { color: C.accent }, line: { type: 'none' } });
    s.addText(w.t, { x: rx2 + 0.16, y: yy, w: 1.5, h: 0.4, fontFace: FONT, fontSize: T.T7, bold: true, color: C.white, align: 'center', valign: 'middle' });
    s.addText(w.d, { x: rx2 + 1.75, y: yy, w: half - 1.9, h: 0.4, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle' });
  });
  s.addText('其他 Skill：auto-approve（自动执行）、code-review（代码审查）', { x: rx2 + 0.16, y: cy + 2.75, w: half - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T11, italic: true, color: C.sub, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  addCode(s, rx2 + 0.16, cy + 3.3, half - 0.32, 0.45, '$ /install-skill web-search');
  addSoWhat(s, 'SO WHAT', 'Grill-Me 把"模糊需求"变"完整需求"，Web Search 把"过时知识"变"最新信息" —— 双 Skill 让团队用好工具。');
  addFooter(s, '来源：Skill 高级配置（§5.1 / §5.2 / §5.3）', '09');
}

// ============ P10 场景① DOE 实验设计 ============
{
  const s = newSlide();
  addBase(s, { section: '场景实战', num: '10' });
  const cy = addTitle(s, '喂对数据，让大模型设计可执行 DOE 实验', '数据输入 3 方式 + DOE 实验设计流程 + 因子矩阵');
  const lx = M.left, lw = 4.6;
  addPanel(s, lx, cy, lw, 3.5, '数据输入 3 方式');
  const ins = [
    { t: '① 读项目文件', d: '指定 ./data/rc_data.csv 路径' },
    { t: '② 粘贴关键数据', d: '批次统计表（样本/均值/CPK）' },
    { t: '③ 提供文件路径', d: '原始 + 处理后 + 配置文件' },
  ];
  ins.forEach((t, i) => {
    const yy = cy + 0.6 + i * 0.9;
    s.addText(t.t, { x: lx + 0.2, y: yy, w: lw - 0.4, h: 0.34, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText(t.d, { x: lx + 0.2, y: yy + 0.32, w: lw - 0.4, h: 0.5, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  });
  const mx = lx + lw + 0.25, mw = 3.3;
  addPanel(s, mx, cy, mw, 3.5, 'DOE 设计流程');
  const fl = ['已有数据', '数据分析', '识别问题', '设计 DOE'];
  fl.forEach((t, i) => {
    const yy = cy + 0.55 + i * 0.62;
    s.addShape('roundRect', { x: mx + 0.3, y: yy, w: mw - 0.6, h: 0.44, rectRadius: 0.05, fill: { color: i === 3 ? C.accent : C.accentBg }, line: { color: C.accentLt, width: 0.5 } });
    s.addText(t, { x: mx + 0.3, y: yy, w: mw - 0.6, h: 0.44, fontFace: FONT, fontSize: T.T7, bold: true, color: i === 3 ? C.white : C.accent, align: 'center', valign: 'middle' });
    if (i < fl.length - 1) s.addShape('rect', { x: mx + mw / 2 - 0.01, y: yy + 0.44, w: 0.02, h: 0.18, fill: { color: C.accent }, line: { type: 'none' } });
  });
  const rx = mx + mw + 0.25, rw = CW - (mx + mw - M.left) - 0.25;
  addPanel(s, rx, cy, rw, 3.5, '示例：3 因子 2 水平');
  const rows = [
    ['因子', '-1', '+1'],
    ['Overdrive', '50μm', '80μm'],
    ['Clean', '50次', '100次'],
    ['Soak', '10ms', '30ms'],
  ];
  addTable(s, rows, { x: rx + 0.16, y: cy + 0.5, w: rw - 0.32, colW: [rw - 0.32 - 1.0, 0.5, 0.5], rowH: 0.4, fontSize: T.T11, headSize: T.T11 });
  s.addText('目标：降接触电阻标准差，CPK 提升至 1.5 以上', { x: rx + 0.16, y: cy + 2.35, w: rw - 0.32, h: 0.9, fontFace: FONT, fontSize: T.T11, italic: true, color: C.sub, align: 'left', valign: 'top', lineSpacingMultiple: 1.15 });
  addSoWhat(s, 'SO WHAT', '把测试数据 + 失效机制喂给大模型 —— 直接产出可执行的实验矩阵，DOE 周期显著缩短。');
  addFooter(s, '来源：数据输入与实验设计（§7.1 / §7.2）', '10');
}

// ============ P11 场景② 技术调研 ============
{
  const s = newSlide();
  addBase(s, { section: '场景实战', num: '11' });
  const cy = addTitle(s, '技术难题没思路？让大模型做调研与头脑风暴', '高价值场景②：技术调研 + 头脑风暴，把经验型难题变可执行清单');
  const lx = M.left, lw = 6.6;
  addPanel(s, lx, cy, lw, 3.5, '场景：探针台针尖磨损导致虚焊');
  addCode(s, lx + 0.16, cy + 0.5, lw - 0.32, 1.5,
    '> 探针台针尖磨损导致虚焊/测量不准\n  (False Contact Failure)。\n  请作为半导体测试专家，针对 3D 堆叠先进封装，\n  检索工业界解决 Micro-bump 探针损伤的主流方案，\n  列 5 个头脑风暴方向，对比利弊与引入成本，\n  给出推荐实施路径。（可用 web search）');
  s.addText('关键要素：', { x: lx + 0.16, y: cy + 2.1, w: lw - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('• 明确失效机制（Micro-bump 探针损伤）\n• 要求多方案对比（5 个方向）\n• 要求决策维度（利弊 + 成本 + 推荐路径）', { x: lx + 0.16, y: cy + 2.38, w: lw - 0.32, h: 1.0, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.15 });
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '预期产出');
  const outs = ['技术方案对比表（5 方向）', '各方案利弊分析', '引入成本评估', '推荐实施路径'];
  outs.forEach((t, i) => {
    const yy = cy + 0.6 + i * 0.62;
    nodeCircle(s, rx + 0.2, yy + 0.02, 0.36, i + 1, C.accent);
    s.addText(t, { x: rx + 0.7, y: yy, w: rw - 0.9, h: 0.4, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
  });
  s.addText('配合 web-search 获取最新行业资料。', { x: rx + 0.2, y: cy + 3.15, w: rw - 0.4, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '从"没思路"到"5 方向对比 + 推荐路径" —— 大模型把经验型难题快速拆成可决策的清单。');
  addFooter(s, '来源：高级业务场景（§9.1 / §4 Demo6）', '11');
}

// ============ P12 场景③ 复杂项目开发 ============
{
  const s = newSlide();
  addBase(s, { section: '场景实战', num: '12' });
  const cy = addTitle(s, '复杂系统一句话起步：Plan-Build 全流程示范', '高价值场景③：测试数据自动化分析平台');
  const lx = M.left, lw = 6.6;
  addPanel(s, lx, cy, lw, 3.5, '需求指令（进 Plan 模式）');
  addCode(s, lx + 0.16, cy + 0.5, lw - 0.32, 1.7,
    '> 进入 Plan 模式，规划"测试数据自动化分析平台"：\n  1. 支持多种数据源（CSV / Excel / SQLite）\n  2. 自动生成可视化报告（CPK 趋势 / Yield 分布）\n  3. 支持历史数据对比\n  4. 异常数据自动报警\n  5. 输出 HTML 和 PDF 两种报告\n  先制定计划，确认后进入 Build 执行。');
  s.addText('一句话讲清 5 项需求 → Plan 自动拆解。', { x: lx + 0.16, y: cy + 2.35, w: lw - 0.32, h: 0.5, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle', lineSpacingMultiple: 1.1 });
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, 'Plan 产物 → Build 落地');
  s.addText([
    { text: '架构：', options: { bold: true, color: C.accent, fontSize: T.T7 } },
    { text: 'pandas + SQLAlchemy / matplotlib / HTML+PDF\n\n', options: { color: C.body, fontSize: T.T7 } },
    { text: 'Phase 1 基础框架：', options: { bold: true, color: C.accent, fontSize: T.T7 } },
    { text: '目录 / 数据加载 / 统计\n', options: { color: C.body, fontSize: T.T7 } },
    { text: 'Phase 2 可视化：', options: { bold: true, color: C.accent, fontSize: T.T7 } },
    { text: 'CPK 趋势 / Yield 分布 / 异常标记\n', options: { color: C.body, fontSize: T.T7 } },
    { text: 'Phase 3 报告：', options: { bold: true, color: C.accent, fontSize: T.T7 } },
    { text: 'HTML 模板 / PDF 导出 / 历史对比\n\n', options: { color: C.body, fontSize: T.T7 } },
    { text: 'Build：', options: { bold: true, color: C.pos, fontSize: T.T7 } },
    { text: '自动建目录、写代码、跑测试、出报告', options: { color: C.body, fontSize: T.T7 } },
  ], { x: rx + 0.18, y: cy + 0.5, w: rw - 0.36, h: 2.9, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.15 });
  addSoWhat(s, 'SO WHAT', '复杂系统不必从零手敲 —— Plan 拆解 + Build 自动落地，把"周级"开发压缩到"天级"。');
  addFooter(s, '来源：高级业务场景（§9.2 / §4.2）', '12');
}

// ============ P13 场景④ 知识沉淀 ============
{
  const s = newSlide();
  addBase(s, { section: '场景实战', num: '13' });
  const cy = addTitle(s, '把经验沉淀成手册：排查手册 / SOP / 培训材料', '高价值场景④：知识沉淀与团队分享');
  const lx = M.left, lw = 6.6;
  addPanel(s, lx, cy, lw, 3.5, '场景：整理探针台常见报错排查手册');
  addCode(s, lx + 0.16, cy + 0.5, lw - 0.32, 1.5,
    '> 帮我整理一份"探针台常见报错排查手册"：\n  1. 列出最常见的 10 种报错\n  2. 每种报错的原因分析\n  3. 排查步骤\n  4. 解决方案\n  5. 预防措施\n  用 Markdown，含代码示例与流程图，\n  基于项目历史 Log 文件整理。');
  s.addText('价值：把散落在个人脑中的经验，变成团队可查的文档。', { x: lx + 0.16, y: cy + 2.15, w: lw - 0.32, h: 0.7, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle', lineSpacingMultiple: 1.15 });
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '可沉淀的知识产物');
  const docs = [
    { t: '排查手册', d: '常见报错的原因/步骤/解决/预防' },
    { t: '测试 SOP', d: '机台操作与测试 Flow 标准化' },
    { t: '培训材料', d: '新人上手 PPT / 文档' },
    { t: '脚本库', d: '可复用的自动化脚本集合' },
  ];
  docs.forEach((d, i) => {
    const yy = cy + 0.55 + i * 0.62;
    s.addShape('roundRect', { x: rx + 0.16, y: yy, w: 1.7, h: 0.46, rectRadius: 0.05, fill: { color: C.accent }, line: { type: 'none' } });
    s.addText(d.t, { x: rx + 0.16, y: yy, w: 1.7, h: 0.46, fontFace: FONT, fontSize: T.T7, bold: true, color: C.white, align: 'center', valign: 'middle' });
    s.addText(d.d, { x: rx + 1.95, y: yy, w: rw - 2.1, h: 0.46, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'middle' });
  });
  s.addText('沉淀即资产 —— 人走了知识留下。', { x: rx + 0.16, y: cy + 3.15, w: rw - 0.32, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '把"个人经验"沉淀为"团队资产" —— 排查手册、SOP、脚本库让新人快速接班，团队不再依赖单点。');
  addFooter(s, '来源：高级业务场景（§9.3）', '13');
}

// ============ P14 提效配置 Auto-Approve + 会话复用 ============
{
  const s = newSlide();
  addBase(s, { section: '提效与规范', num: '14' });
  const cy = addTitle(s, 'Auto-Approve + 会话复用，把重复操作清零', '提效不等于省钱 —— 让团队把时间花在判断，而非点确认');
  const half = (CW - 0.3) / 2;
  // 左：Auto-Approve + 安全分级
  addPanel(s, M.left, cy, half, 3.5, 'Auto-Approve · 自动执行');
  const rows = [
    ['环境', '权限建议'],
    ['个人本地项目', 'Auto-Approve'],
    ['共享代码库', '默认确认'],
    ['产线相关系统', '严格确认'],
  ];
  addTable(s, rows, { x: M.left + 0.16, y: cy + 0.5, w: half - 0.32, colW: [half - 0.32 - 1.6, 1.6], rowH: 0.42, fontSize: T.T7, headSize: T.T7 });
  s.addText('⚠ 红线：产线数据库删除、线上配置修改严禁全局免确认。', { x: M.left + 0.16, y: cy + 2.35, w: half - 0.32, h: 0.6, fontFace: FONT, fontSize: T.T11, bold: true, color: C.warn, align: 'left', valign: 'top', lineSpacingMultiple: 1.15 });
  s.addText('完成任务后及时关闭 Auto-Approve。', { x: M.left + 0.16, y: cy + 3.0, w: half - 0.32, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  // 右：会话复用三招
  const rx2 = M.left + half + 0.3;
  addPanel(s, rx2, cy, half, 3.5, '会话复用三招');
  const sms = [
    { t: '保存常用对话模板', d: '高频指令模板化，下次直接复用' },
    { t: '利用会话历史', d: '同一会话延续讨论，不重复输入上下文' },
    { t: '及时结束无用会话', d: '方向错误果断重启，避免越聊越偏' },
  ];
  sms.forEach((t, i) => {
    const yy = cy + 0.6 + i * 0.85;
    nodeCircle(s, rx2 + 0.2, yy + 0.03, 0.4, i + 1, C.accent);
    s.addText(t.t, { x: rx2 + 0.74, y: yy, w: half - 0.9, h: 0.34, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText(t.d, { x: rx2 + 0.74, y: yy + 0.34, w: half - 0.9, h: 0.42, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  });
  addSoWhat(s, 'SO WHAT', '个人环境放开提效、产线严守确认；会话模板化让团队的"重复输入"清零，专注判断与决策。');
  addFooter(s, '来源：权限配置 / 会话管理（§8 / §2.4）', '14');
}

// ============ P15 团队规范 ============
{
  const s = newSlide();
  addBase(s, { section: '团队规范', num: '15' });
  const cy = addTitle(s, '统一配置 + 模板库 + 审查，拉齐团队水平', '解决"团队成员水平不一致"—— 把个人最佳实践变成团队标准');
  const cards = [
    { n: '1', t: '统一部门级 AGENTS.md', d: '全员共用一份术语与角色背景，输出一致' },
    { n: '2', t: '共享 Prompt 模板库', d: '把高频任务的五段式模板沉淀进知识库' },
    { n: '3', t: '定期经验分享会', d: '复盘好用案例与踩坑，扩散给全团队' },
    { n: '4', t: '代码审查机制', d: 'AI 生成代码也要走 review，守住质量' },
  ];
  const cw = (CW - 0.45) / 2, ch = 1.55, gap = 0.25;
  cards.forEach((c, i) => {
    const cx = M.left + (i % 2) * (cw + gap);
    const cyy = cy + 0.12 + Math.floor(i / 2) * (ch + gap);
    s.addShape('roundRect', { x: cx, y: cyy, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
    nodeCircle(s, cx + 0.18, cyy + 0.2, 0.5, c.n, C.accent);
    s.addText(c.t, { x: cx + 0.82, y: cyy + 0.2, w: cw - 1.0, h: 0.5, fontFace: FONT, fontSize: T.T6, bold: true, color: C.title, align: 'left', valign: 'middle' });
    s.addText(c.d, { x: cx + 0.2, y: cyy + 0.85, w: cw - 0.4, h: 0.6, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
  });
  addSoWhat(s, 'SO WHAT', '规范不是限制，而是放大器 —— 一套统一配置 + 模板库，让新人的起点就是团队的最高水平。');
  addFooter(s, '来源：团队水平拉齐（§11 Q4）', '15');
}

// ============ P16 落地路线图 ============
{
  const s = newSlide();
  addBase(s, { section: '团队落地', num: '16' });
  const cy = addTitle(s, '4 阶段推进，从基础建设到持续优化', '渐进式落地 —— 先基建、再培训、后深用、持续迭代');
  const phases = [
    { t: 'Phase 1 · 基础建设', w: '第 1-2 周', items: ['全员申请 CIMICode 权限', '安装桌面版 + 终端版', '统一配置部门级 AGENTS.md', '安装基础 Skill'] },
    { t: 'Phase 2 · 技能培训', w: '第 3-4 周', items: ['组织 CIMICode 使用培训', '分享最佳实践与案例', '建立问题反馈机制', '制定使用规范'] },
    { t: 'Phase 3 · 深度应用', w: '第 5-8 周', items: ['推广 Plan-Build 工作流', '建立自动化脚本库', '沉淀技术文档与 SOP', '推广高价值场景'] },
    { t: 'Phase 4 · 持续优化', w: '长期', items: ['定期复盘使用效果', '优化 AGENTS.md 配置', '扩展 Skill 应用场景', '分享最佳实践'] },
  ];
  const pw = (CW - 0.6) / 4;
  phases.forEach((ph, i) => {
    const px = M.left + i * (pw + 0.2);
    s.addShape('roundRect', { x: px, y: cy + 0.1, w: pw, h: 3.4, rectRadius: 0.05, fill: { color: C.paper }, line: { color: i === 0 ? C.accent : C.line, width: i === 0 ? 1.25 : 0.75 } });
    s.addShape('rect', { x: px, y: cy + 0.1, w: pw, h: 0.06, fill: { color: C.accent }, line: { type: 'none' } });
    s.addText(ph.t, { x: px + 0.16, y: cy + 0.24, w: pw - 0.32, h: 0.34, fontFace: FONT, fontSize: T.T6, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    addPill(s, px + 0.16, cy + 0.62, pw - 0.32, 0.3, ph.w, { fill: C.accentBg, color: C.accent, size: T.T11 });
    ph.items.forEach((it, j) => {
      const yy = cy + 1.1 + j * 0.52;
      s.addText('•', { x: px + 0.16, y: yy, w: 0.2, h: 0.3, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'top' });
      s.addText(it, { x: px + 0.34, y: yy, w: pw - 0.5, h: 0.48, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
    });
    if (i < phases.length - 1) s.addShape('rightTriangle', { x: px + pw + 0.03, y: cy + 1.7, w: 0.14, h: 0.22, rotate: 90, fill: { color: C.accent }, line: { type: 'none' } });
  });
  addSoWhat(s, 'SO WHAT', '4 阶段渐进 —— 先把基建和规范立起来，再推深度场景，避免一哄而上导致水平参差。');
  addFooter(s, '来源：团队落地路线图（§10.1）', '16');
}

// ============ P17 效果信号 ============
{
  const s = newSlide();
  addBase(s, { section: '团队落地', num: '17' });
  const cy = addTitle(s, '怎么看团队真的"用好"了？', '用可观察的采用与质量信号衡量，而非抽象指标');
  const sigs = [
    { n: '①', t: 'Plan-Build 采用率', d: '复杂任务是否普遍先 Plan 再 Build' },
    { n: '②', t: '脚本/模板复用数', d: '共享库里沉淀了多少可复用资产' },
    { n: '③', t: 'AGENTS.md 配置完整度', d: '部门级 + 项目级是否到位' },
    { n: '④', t: '新人独立上手速度', d: '从入职到完成首个任务的时间' },
    { n: '⑤', t: '知识沉淀量', d: 'SOP / 手册 / 培训材料的产出' },
    { n: '⑥', t: '问题复现率下降', d: '同类报错是否靠手册自助解决' },
  ];
  const cw = (CW - 0.5) / 3, ch = 1.45, gap = 0.22;
  sigs.forEach((sg, i) => {
    const cx = M.left + (i % 3) * (cw + gap);
    const cyy = cy + 0.15 + Math.floor(i / 3) * (ch + gap);
    s.addShape('roundRect', { x: cx, y: cyy, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
    s.addText(sg.n, { x: cx + 0.16, y: cyy + 0.14, w: 0.6, h: 0.4, fontFace: FONT, fontSize: T.T4, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText(sg.t, { x: cx + 0.72, y: cyy + 0.14, w: cw - 0.86, h: 0.4, fontFace: FONT, fontSize: T.T6, bold: true, color: C.title, align: 'left', valign: 'middle' });
    s.addText(sg.d, { x: cx + 0.18, y: cyy + 0.62, w: cw - 0.36, h: 0.7, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
  });
  s.addText('这些信号都可观察、可统计 —— 用它们判断团队是否在进步，比抽象百分比更可靠。', { x: M.left, y: cy + 2 * (ch + gap) + 0.28, w: CW, h: 0.4, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addSoWhat(s, 'SO WHAT', '不追求好看的数字，而看真实的采用与沉淀 —— 信号持续向好，就是团队"用好"的证据。');
  addFooter(s, '来源：效果评估（§10.3）重组为可观察信号', '17');
}

// ============ P18 收束 ============
{
  const s = newSlide();
  addBase(s, { section: '收束', num: '18' });
  const cy = addTitle(s, '五板斧 + 4 阶段，让全团队用好大模型', '从"会聊"到"用好"，关键是配置规范 + 方法论 + 团队落地');
  // 左：五板斧回顾
  const lx = M.left, lw = 7.2;
  addPanel(s, lx, cy, lw, 2.4, '五板斧回顾');
  const axes = ['选对模型 · 配好 AGENTS.md · 写好 Prompt', '用对 Plan-Build 工作流 · 用对 Skill 工具', '团队规范：统一配置 + 模板库 + 审查'];
  axes.forEach((a, i) => {
    const yy = cy + 0.6 + i * 0.55;
    nodeCircle(s, lx + 0.2, yy + 0.02, 0.36, i + 1, C.accent);
    s.addText(a, { x: lx + 0.7, y: yy, w: lw - 0.9, h: 0.4, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
  });
  // 右：行动号召
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addClaim(s, rx, cy, rw, '立即行动：启动 Phase 1', { h: 0.55 });
  s.addText('• 本周统一部门级 AGENTS.md\n• 下周完成全员 Skill 安装\n• 第 4 周分享首批最佳实践', { x: rx + 0.16, y: cy + 0.7, w: rw - 0.32, h: 1.0, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.2 });
  // 底部承接
  addClaim(s, M.left, cy + 2.6, CW, '基础入门 → PPT1《公司大模型工具使用入门》　|　进阶用好 → 本课 PPT2', { h: 0.5 });
  s.addText('两份配套：PPT1 教"开通与上手"，PPT2 教"用好与团队落地"。', { x: M.left, y: cy + 3.2, w: CW, h: 0.4, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addFooter(s, '来源：全篇收束 · 团队落地路线图（§10）', '18');
}

const OUT = '/Volumes/Vault/repos/github/notes/PPT-项目/PPT2-成本优化/deck/PPT2-大模型进阶应用与团队落地.pptx';
p.writeFile({ fileName: OUT }).then(f => console.log('PPT2(重写) 写出:', f, '| 页数:', p.slides.length));
