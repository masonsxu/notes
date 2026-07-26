// build-ppt1.js — PPT1《公司大模型工具使用入门》17 页
const PptxGenJS = require('pptxgenjs');
const th = require('./theme.js');
const { PAGE, M, CW, C, T, FONT, FONT_EN,
  addBase, addTitle, addFooter, addSoWhat, addKPI, addPanel, addClaim, addTable, addCode, addPill } = th;

const p = new PptxGenJS();
p.defineLayout({ name: 'W', width: PAGE.w, height: PAGE.h });
p.layout = 'W';
p.author = 'CIMICode TD Testing';
p.company = 'CIMICode';
p.title = '公司大模型工具使用入门';

const H = { pptx: p };
const newSlide = () => { const s = p.addSlide(); s._pptxHolder = H; return s; };

// 内容区纵向区间（标题下方 到 SO WHAT 上方）
const CONTENT_TOP_BASE = M.top + 0.5;          // 标题起始
// SO WHAT 顶部约在 5.96（h=0.82），内容下界留 5.86
const SO_BOTTOM = 5.86;

// 编号圆点节点
function nodeCircle(s, x, y, d, num, fill) {
  s.addShape('ellipse', { x, y, w: d, h: d, fill: { color: fill || C.accent }, line: { type: 'none' } });
  s.addText(String(num), { x, y, w: d, h: d, fontFace: FONT_EN, fontSize: 13, bold: true, color: C.white, align: 'center', valign: 'middle' });
}

// ============ P1 封面 ============
{
  const s = newSlide();
  s.background = { color: C.bg };
  s.addShape('rect', { x: 0, y: 0, w: 0.28, h: PAGE.h, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('CIMICode · 内部培训', { x: M.left + 0.2, y: 1.45, w: 10, h: 0.4,
    fontFace: FONT, fontSize: T.T3, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('公司大模型工具使用入门', { x: M.left + 0.2, y: 1.95, w: 11.6, h: 1.3,
    fontFace: FONT, fontSize: T.C0, bold: true, color: C.title, align: 'left', valign: 'middle' });
  s.addText('从开通到上手，新人 1 天搞定', { x: M.left + 0.2, y: 3.3, w: 11.5, h: 0.6,
    fontFace: FONT, fontSize: 18, color: C.sub, align: 'left', valign: 'middle' });
  s.addShape('rect', { x: M.left + 0.2, y: 4.1, w: 2.2, h: 0.06, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('受众：部门新人、组内工程师    |    讲师：TD Testing', { x: M.left + 0.2, y: 6.45, w: 11, h: 0.4,
    fontFace: FONT, fontSize: T.T7, color: C.faint, align: 'left', valign: 'middle' });
  addFooter(s, 'CIMICode 平台 · 基于 OpenCode 开发', '01');
}

// ============ P2 全篇导览 ============
{
  const s = newSlide();
  addBase(s, { section: '导览', num: '02' });
  const cy = addTitle(s, '三大能力已就位，本课带你打通"开通—理解—落地"全链路', '全篇五段递进，跟着走，今天就能动手');
  // 左：能力速览
  const lx = M.left, lw = 4.5;
  addPanel(s, lx, cy, lw, 3.5, '公司已就位的能力');
  s.addText([
    { text: '4 个大模型', options: { bold: true, color: C.accent, fontSize: T.T7, breakLine: true } },
    { text: 'Flash / Pro / GLM / Kimi，按成本与能力分层', options: { color: C.body, fontSize: T.T7, breakLine: true } },
    { text: '\n', options: { fontSize: 4 } },
    { text: '3 种使用形态', options: { bold: true, color: C.accent, fontSize: T.T7, breakLine: true } },
    { text: '桌面版 / 终端版 / Web 版，覆盖开发、机台、移动', options: { color: C.body, fontSize: T.T7, breakLine: true } },
    { text: '\n', options: { fontSize: 4 } },
    { text: '1 套工作流', options: { bold: true, color: C.accent, fontSize: T.T7, breakLine: true } },
    { text: 'Plan 规划 → Build 执行 + Skill 扩展能力', options: { color: C.body, fontSize: T.T7 } },
  ], { x: lx + 0.18, y: cy + 0.5, w: lw - 0.36, h: 2.8, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.0 });
  // 右：五段路线图（竖向）
  const rx = lx + lw + 0.4, rw = CW - lw - 0.4;
  addPanel(s, rx, cy, rw, 3.5, '本课五段路线图');
  const steps = ['① 申请 Coding 权限（维护群）', '② 安装桌面版 + 终端版', '③ 配置 AGENTS.md 人设', '④ 掌握 Plan-Build 与 Skill', '⑤ 守住 Auto-Approve 安全红线'];
  const sy0 = cy + 0.52, sgap = 0.56;
  steps.forEach((st, i) => {
    const yy = sy0 + i * sgap;
    nodeCircle(s, rx + 0.22, yy, 0.34, i + 1, C.accent);
    s.addText(st, { x: rx + 0.72, y: yy, w: rw - 1.0, h: 0.34, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
    if (i < steps.length - 1) s.addShape('rect', { x: rx + 0.385, y: yy + 0.34, w: 0.02, h: sgap - 0.34, fill: { color: C.accent }, line: { type: 'none' } });
  });
  addSoWhat(s, '本课目标', '五步走完后，新人能独立完成第一个真实任务（如：整理报错邮件、生成 CPK 分析脚本）。');
  addFooter(s, '来源：PPT1 大纲（§一/二/三）', '02');
}

// ============ P3 模型一览 ============
{
  const s = newSlide();
  addBase(s, { section: '01 · 资源总览', num: '03' });
  const cy = addTitle(s, '默认 DeepSeek v4 Flash 即可满足绝大多数需求', '四款模型按成本与能力分层，新人起步只认 Flash');
  const lx = M.left, lw = 7.5;
  const models = [
    { n: 'DeepSeek v4 Flash', t: '通用推理', c: '极低', tag: '推荐默认', hl: true, d: '日常 80% 场景：简单代码、Log 解析、格式转换、文档整理' },
    { n: 'DeepSeek v4 Pro', t: '深度推理', c: '约 5×', tag: '复杂任务', d: '复杂逻辑推理、深度 Bug 排查、架构设计' },
    { n: 'GLM 5.1 / 5.2', t: '长文本中文', c: '约 5×', tag: '长文场景', d: '长篇 SOP 编写、跨文件复杂整理' },
    { n: 'Kimi 2.7', t: '超长上下文', c: '约 5×', tag: '海量对比', d: '超大型 Log 校验、海量文档对比' },
  ];
  const cardW = (lw - 0.2) / 2, cardH = 1.35, gap = 0.2;
  models.forEach((m, i) => {
    const cx = lx + (i % 2) * (cardW + gap);
    const cyy = cy + 0.12 + Math.floor(i / 2) * (cardH + gap);
    const fill = m.hl ? C.accentBg : C.paper;
    const line = m.hl ? C.accent : C.line;
    s.addShape('rect', { x: cx, y: cyy, w: cardW, h: cardH, fill: { color: fill }, line: { color: line, width: m.hl ? 1.2 : 0.75 } });
    s.addText(m.n, { x: cx + 0.16, y: cyy + 0.1, w: cardW - 1.3, h: 0.34, fontFace: FONT, fontSize: T.T6, bold: true, color: m.hl ? C.accent : C.title, align: 'left', valign: 'middle' });
    addPill(s, cx + cardW - 1.18, cyy + 0.14, 1.02, 0.28, m.tag, { fill: m.hl ? C.accent : C.accentLt, color: m.hl ? C.white : C.accent });
    s.addText(`${m.t}   ·   成本 ${m.c}`, { x: cx + 0.16, y: cyy + 0.46, w: cardW - 0.3, h: 0.26, fontFace: FONT, fontSize: T.T7, color: C.sub, align: 'left', valign: 'middle' });
    s.addText(m.d, { x: cx + 0.16, y: cyy + 0.74, w: cardW - 0.3, h: 0.52, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  });
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addKPI(s, rx, cy + 0.12, rw, 1.5, '80%', '日常场景由 Flash 覆盖', { note: '建议比例，非实测' });
  addKPI(s, rx, cy + 1.75, rw, 1.5, '5×', '高阶模型约为公网成本', { numSize: 24, note: 'Pro / GLM / Kimi' });
  addPanel(s, rx, cy + 3.35, rw, 1.0, '新人选型口诀');
  s.addText('日常默认 Flash；多次改不通、逻辑死循环，再切 Pro / GLM / Kimi。', { x: rx + 0.16, y: cy + 3.78, w: rw - 0.32, h: 0.5, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
  addSoWhat(s, 'SO WHAT', '新人起步无需纠结：默认 DeepSeek v4 Flash，成本极低、响应快，覆盖绝大多数日常工作。');
  addFooter(s, '来源：CIMICode 模型清单（§1.1） · 80% 为建议比例', '03');
}

// ============ P4 三种形态 ============
{
  const s = newSlide();
  addBase(s, { section: '01 · 资源总览', num: '04' });
  const cy = addTitle(s, '三种形态覆盖开发、机台、移动三类场景', '桌面版 / 终端版 / Web 版各有阵地，按场景选形');
  const rows = [
    ['形态', '使用方式', '适用场景', '特点'],
    ['桌面版 Desktop', '安装本地客户端', '代码开发、文档撰写、数据分析、PPT 整理', '视觉好，多窗口、图表预览、可视化项目管理'],
    ['终端版 TUI', '终端命令行', '服务器自动化、Linux 跑脚本、排查机台报错', '直接跑在 Linux/WSL/机台，无需图形界面'],
    ['Web 网页版', '浏览器访问', '手机/移动端临时查阅、非敏感非 Coding', '快捷免配置，适合突发文字处理或头脑风暴'],
  ];
  addTable(s, rows, { x: M.left, y: cy + 0.12, w: CW, colW: [2.1, 2.6, 4.0, CW - 8.7], rowH: 0.62, fontSize: T.T7, headSize: T.T7 });
  addCode(s, M.left, cy + 3.05, CW, 0.95,
    '# 终端版安装（Linux / macOS）\n$ npm install -g cimicode-tui      # 装好后进入项目目录运行 cimicode-tui\n# 桌面版：macOS / Windows 下载安装包，双击安装后登录公司账号');
  addSoWhat(s, 'SO WHAT', 'TD Testing 强依赖本地代码库与机台数据 —— 申请 Coding 权限后，桌面版 + 终端版是主力，Web 版作轻量补充。');
  addFooter(s, '来源：CIMICode 平台形态（§1.2）', '04');
}

// ============ P5 第一步：申请 Coding 权限 ============
{
  const s = newSlide();
  addBase(s, { section: '02 · 权限与安装', num: '05' });
  const cy = addTitle(s, '在 CIMICode 维护群申请 Coding 权限，一次到位', '强烈建议全员申请 Coding 权限，而非仅非 Coding');
  // 左：申请流程 3 步
  const lx = M.left, lw = 5.0;
  addPanel(s, lx, cy, lw, 3.5, '申请流程（3 步）');
  const flow = ['在 CIMICode 维护群发起申请', '选择权限类型：Coding 或 非 Coding', '获得权限，按需安装桌面版 / 终端版'];
  const fy0 = cy + 0.6, fgap = 0.85;
  flow.forEach((t, i) => {
    const yy = fy0 + i * fgap;
    nodeCircle(s, lx + 0.24, yy, 0.42, i + 1, C.accent);
    s.addText(t, { x: lx + 0.82, y: yy, w: lw - 1.0, h: 0.42, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
    if (i < flow.length - 1) s.addShape('rect', { x: lx + 0.445, y: yy + 0.42, w: 0.02, h: fgap - 0.42, fill: { color: C.line }, line: { type: 'none' } });
  });
  // 右：权限分支 + 建议
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 1.5, '两种权限的区别');
  s.addText([
    { text: '非 Coding：', options: { bold: true, color: C.warn, fontSize: T.T7 } },
    { text: '仅 Web 网页版，纯文档/邮件草稿等简单场景\n', options: { color: C.body, fontSize: T.T7 } },
    { text: 'Coding：', options: { bold: true, color: C.pos, fontSize: T.T7 } },
    { text: '支持安装桌面版 + 终端版，挂载本地工作区', options: { color: C.body, fontSize: T.T7 } },
  ], { x: rx + 0.18, y: cy + 0.5, w: rw - 0.36, h: 0.9, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.1 });
  // 建议结论条
  addClaim(s, rx, cy + 1.7, rw, '强烈建议：全员申请 Coding 权限', { h: 0.5 });
  // 4 条理由
  const reasons = ['TD 日常（Log 解析、自动化脚本、SECS/GEM 对接）依赖本地代码库', '桌面版 + TUI 能直接挂载本地工作区，自动化处理本地测试文件', '灵活性与使用场景远超 Web 网页版', '即使主要用 Web 版，Coding 权限也提供更多可用场景'];
  s.addText(reasons.map((r, i) => ({ text: `• ${r}`, options: { color: C.body, fontSize: T.T7, breakLine: i < reasons.length - 1 } })),
    { x: rx + 0.18, y: cy + 2.35, w: rw - 0.36, h: 1.0, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.15 });
  addSoWhat(s, 'SO WHAT', '权限一步到位选 Coding，避免日后反复申请 —— 本地代码库与机台数据是 TD 工作的核心。');
  addFooter(s, '来源：权限申请与建议（§2.1 / §2.2）', '05');
}

// ============ P6 第二步：安装 ============
{
  const s = newSlide();
  addBase(s, { section: '02 · 权限与安装', num: '06' });
  const cy = addTitle(s, '桌面版双击即装，终端版一条命令搞定', '装好后登录公司账号，即可开始使用');
  const half = (CW - 0.3) / 2;
  // 左：桌面版
  addPanel(s, M.left, cy, half, 3.5, '桌面版 Desktop');
  const dsteps = ['下载安装包（macOS / Windows）', '双击安装，默认配置即可', '打开桌面版，登录公司账号'];
  dsteps.forEach((t, i) => {
    const yy = cy + 0.6 + i * 0.7;
    nodeCircle(s, M.left + 0.22, yy, 0.36, i + 1, C.accent);
    s.addText(t, { x: M.left + 0.74, y: yy, w: half - 1.0, h: 0.36, fontFace: FONT, fontSize: T.T7, color: C.title, align: 'left', valign: 'middle' });
  });
  s.addText('适合：代码开发、文档撰写、数据分析、PPT 整理', { x: M.left + 0.22, y: cy + 2.8, w: half - 0.44, h: 0.4, fontFace: FONT, fontSize: T.T14, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  // 右：终端版
  const rx2 = M.left + half + 0.3;
  addPanel(s, rx2, cy, half, 3.5, '终端版 TUI');
  const tsteps = ['Linux / macOS / WSL 终端执行安装命令', '进入项目目录，启动 cimicode-tui', '按需登录账号或使用已有配置'];
  tsteps.forEach((t, i) => {
    const yy = cy + 0.6 + i * 0.62;
    nodeCircle(s, rx2 + 0.22, yy, 0.36, i + 1, C.accent);
    s.addText(t, { x: rx2 + 0.74, y: yy, w: half - 1.0, h: 0.36, fontFace: FONT, fontSize: T.T7, color: C.title, align: 'left', valign: 'middle' });
  });
  addCode(s, rx2 + 0.18, cy + 2.55, half - 0.36, 0.78, '# 安装\n$ npm install -g cimicode-tui\n# 启动（在项目目录下）\n$ cimicode-tui');
  addSoWhat(s, 'SO WHAT', '桌面版负责日常开发与可视化，终端版负责机台/服务器自动化 —— 两个都装，按场景切换。');
  addFooter(s, '来源：安装步骤（§2.3）', '06');
}

// ============ P7 核心概念总图 ============
{
  const s = newSlide();
  addBase(s, { section: '03 · 概念与工作流', num: '07' });
  const cy = addTitle(s, '四个核心概念构成大模型协助开发的骨架', '理解它们，才算真正会用 CIMICode');
  // 中心点
  const hubX = M.left + CW / 2, hubY = cy + 1.66;
  const hubW = 2.3, hubH = 1.2;
  // 四角卡片定义（先定义以便先画连线）
  const nodes = [
    { x: M.left, y: cy + 0.08, w: 3.5, h: 1.2, t: '① AGENTS.md', d: '系统人设与规则：角色、术语、编码偏好', path: '~/.cimi/cimicode/AGENTS.md' },
    { x: M.left + CW - 3.5, y: cy + 0.08, w: 3.5, h: 1.2, t: '② Model', d: '大脑：Flash / Pro / GLM / Kimi 按需切换' },
    { x: M.left, y: cy + 2.18, w: 3.5, h: 1.2, t: '③ Plan / Build', d: '执行模式：Plan 规划 → Build 自动落地' },
    { x: M.left + CW - 3.5, y: cy + 2.18, w: 3.5, h: 1.2, t: '④ Skills / Tools', d: '外挂能力：web_search / grill_me / auto_approve' },
  ];
  // ① 先画连接线（最底层，避免遮挡中心）
  nodes.forEach(n => {
    const nx = n.x + n.w / 2, ny = n.y + n.h / 2;
    s.addShape('line', { x: Math.min(nx, hubX), y: Math.min(ny, hubY), w: Math.abs(nx - hubX), h: Math.abs(ny - hubY), line: { color: C.accentLt, width: 1.5 } });
  });
  // ② 再画中心节点（盖住线的端点）
  s.addShape('roundRect', { x: hubX - hubW / 2, y: hubY - hubH / 2, w: hubW, h: hubH, rectRadius: 0.1, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText('CIMICode', { x: hubX - hubW / 2, y: hubY - 0.5, w: hubW, h: 0.4, fontFace: FONT, fontSize: T.T4, bold: true, color: C.white, align: 'center', valign: 'middle' });
  s.addText('＋ 打开项目 = 把代码库 / Flow / Log 导入为 Context', { x: hubX - hubW / 2 + 0.1, y: hubY - 0.08, w: hubW - 0.2, h: 0.5, fontFace: FONT, fontSize: T.T11, color: C.accentLt, align: 'center', valign: 'top', lineSpacingMultiple: 1.05 });
  // ③ 最后画四角卡片（盖住线的另一端）
  nodes.forEach(n => {
    s.addShape('roundRect', { x: n.x, y: n.y, w: n.w, h: n.h, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.accent, width: 1 } });
    s.addText(n.t, { x: n.x + 0.16, y: n.y + 0.1, w: n.w - 0.32, h: 0.34, fontFace: FONT, fontSize: T.T6, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText(n.d, { x: n.x + 0.16, y: n.y + 0.46, w: n.w - 0.32, h: 0.5, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
    if (n.path) s.addText(n.path, { x: n.x + 0.16, y: n.y + n.h - 0.24, w: n.w - 0.32, h: 0.2, fontFace: FONT_EN, fontSize: T.T14, color: C.faint, align: 'left', valign: 'middle' });
  });
  addSoWhat(s, 'SO WHAT', 'AGENTS.md 管人设、Model 管能力、Plan-Build 管执行、Skills 管扩展 —— 四者配合，大模型才真正"懂事"。');
  addFooter(s, '来源：CIMICode 核心概念（§3.1 / §3.2）', '07');
}

// ============ P8 Plan-Build 工作流 ============
{
  const s = newSlide();
  addBase(s, { section: '03 · 概念与工作流', num: '08' });
  const cy = addTitle(s, 'Plan 模式只思考不改动，Build 模式按确认自动落地', '复杂任务先 Plan 审核，再 Build 执行，避免盲改');
  // 横向流程：需求 → Plan → (确认) → Build
  const bx = M.left, bw = CW, by = cy + 0.2, bh = 1.5;
  const stages = [
    { t: '用户需求', d: '复杂任务输入', fill: C.sub },
    { t: 'Plan 模式', d: '拆解步骤 / 设计架构 / 评估风险\n生成 TODO.md', fill: C.accent2 },
    { t: '工程师确认', d: '审核 Plan\n通过 → Build；有问题 → 回 Plan', fill: C.warn },
    { t: 'Build 模式', d: '自动创建文件 / 写入代码 / 运行测试', fill: C.accent },
  ];
  const cellW = (bw - 0.6) / 4;
  stages.forEach((st, i) => {
    const xx = bx + i * (cellW + 0.2);
    s.addShape('roundRect', { x: xx, y: by, w: cellW, h: bh, rectRadius: 0.06, fill: { color: st.fill }, line: { type: 'none' } });
    s.addText(st.t, { x: xx + 0.14, y: by + 0.12, w: cellW - 0.28, h: 0.36, fontFace: FONT, fontSize: T.T6, bold: true, color: C.white, align: 'left', valign: 'middle' });
    s.addText(st.d, { x: xx + 0.14, y: by + 0.5, w: cellW - 0.28, h: 0.9, fontFace: FONT, fontSize: T.T11, color: C.white, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
    if (i < stages.length - 1) {
      s.addShape('rightTriangle', { x: xx + cellW + 0.02, y: by + bh / 2 - 0.1, w: 0.16, h: 0.2, rotate: 90, fill: { color: C.accent }, line: { type: 'none' } });
    }
  });
  // 模式对比小表
  const rows = [
    ['模式', '是否改动文件', '作用', '使用时机'],
    ['Plan', '否（只思考）', '展示思路、拆步骤、列方案，供审核', '复杂任务开始前'],
    ['Build', '是（真执行）', '按确认的 Plan 写代码、建文件、跑测试', 'Plan 确认无误后'],
  ];
  addTable(s, rows, { x: M.left, y: by + bh + 0.3, w: 7.3, colW: [1.1, 1.7, 2.7, 1.8], rowH: 0.5, fontSize: T.T7, headSize: T.T7 });
  // 示例指令
  addCode(s, M.left + 7.5, by + bh + 0.3, CW - 7.5, 1.35,
    '# 进入 Plan 模式规划\n> 进入 Plan 模式，帮我规划一个测试数据\n  自动化分析平台的架构…\n# 确认后切换 Build\n> Plan 已确认，现在进入 Build 模式执行。');
  addSoWhat(s, 'SO WHAT', 'Plan 先想清楚再动手 —— 工程师审核思路，避免大模型盲改代码；确认后才 Build 自动落地。');
  addFooter(s, '来源：Plan-Build 工作流（§7.1 / §7.2）', '08');
}

// ============ P9 六大场景 ============
{
  const s = newSlide();
  addBase(s, { section: '04 · 场景与 Demo', num: '09' });
  const cy = addTitle(s, '大模型是 TD Testing 的全能数字助理', '不止聊天机器人，日常六大场景全能上手');
  const sc = [
    { n: '1', t: '文件与邮件处理', d: '提取测试异常、整理报错邮件与报告' },
    { n: '2', t: '编写 SOP 与 PPT', d: '封装机台操作与测试 Flow 文档' },
    { n: '3', t: '脚本开发与自动化', d: 'Python / Shell / Log 解析脚本' },
    { n: '4', t: '实验设计 (DOE)', d: '基于已有数据设计实验矩阵' },
    { n: '5', t: '数据分析与可视化', d: 'Yield / CPK 图表自动生成' },
    { n: '6', t: '知识问答', d: '技术问题、协议标准快速查询' },
  ];
  const gw = (CW - 0.5) / 3, gh = 1.55, gap = 0.25;
  sc.forEach((m, i) => {
    const gx = M.left + (i % 3) * (gw + gap);
    const gy = cy + 0.15 + Math.floor(i / 3) * (gh + gap);
    s.addShape('roundRect', { x: gx, y: gy, w: gw, h: gh, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
    nodeCircle(s, gx + 0.18, gy + 0.2, 0.5, m.n, C.accent);
    s.addText(m.t, { x: gx + 0.82, y: gy + 0.2, w: gw - 1.0, h: 0.5, fontFace: FONT, fontSize: T.T6, bold: true, color: C.title, align: 'left', valign: 'middle' });
    s.addText(m.d, { x: gx + 0.2, y: gy + 0.85, w: gw - 0.4, h: 0.6, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
  });
  addSoWhat(s, 'SO WHAT', '从文件整理到 DOE 设计 —— 把重复劳动交给大模型，工程师聚焦判断与决策。');
  addFooter(s, '来源：日常工作场景（§4 场景图）', '09');
}

// ============ P10 Demo ①② ============
{
  const s = newSlide();
  addBase(s, { section: '04 · 场景与 Demo', num: '10' });
  const cy = addTitle(s, '一句指令完成 Error Code 汇总邮件 / 生成可运行 CPK 脚本', 'Demo ① 文件邮件整理　 Demo ② 自动化代码');
  const half = (CW - 0.3) / 2;
  // Demo1
  addPanel(s, M.left, cy, half, 3.5, 'Demo ① 文件整理与邮件读取');
  addCode(s, M.left + 0.16, cy + 0.5, half - 0.32, 1.15,
    '请读取 Downloads/logs 下 5 个报错日志，\n提取所有 Error Code、发生频次与测试 Channel，\n整理成 Markdown 表格，并草拟回复产线邮件。');
  s.addText('预期输出：', { x: M.left + 0.16, y: cy + 1.75, w: half - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('• 结构化 Error Code 汇总表（按频次排序）\n• 可直接发送的产线回复邮件草稿', { x: M.left + 0.16, y: cy + 2.02, w: half - 0.32, h: 0.7, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.1 });
  // Demo2
  const rx2 = M.left + half + 0.3;
  addPanel(s, rx2, cy, half, 3.5, 'Demo ② 自动化代码（CPK / Yield）');
  addCode(s, rx2 + 0.16, cy + 0.5, half - 0.32, 1.15,
    '写一个 Python 脚本，解析当前目录所有 .csv 测试数据，\n自动计算每批次 CPK 和 yield，并将 Yield < 98%\n的 Wafer ID 标红导出为 Excel。');
  s.addText('预期输出：', { x: rx2 + 0.16, y: cy + 1.75, w: half - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('• 可直接运行的 Python 脚本（含异常处理）\n• 格式化 Excel 报告（异常 Wafer 标红）', { x: rx2 + 0.16, y: cy + 2.02, w: half - 0.32, h: 0.7, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.1 });
  addSoWhat(s, 'SO WHAT', '把"指令 → 输出"的闭环跑通：文件/邮件秒级整理，分析脚本一句话生成，新人当天见效。');
  addFooter(s, '来源：日常工作场景 Demo（§4 Demo1 / Demo2）', '10');
}

// ============ P11 Demo ③④ ============
{
  const s = newSlide();
  addBase(s, { section: '04 · 场景与 Demo', num: '11' });
  const cy = addTitle(s, '自然语言生成完整测试 SOP 与 PPT 大纲', 'Demo ③ 编写测试 SOP　 Demo ④ 制作 PPT 大纲');
  const half = (CW - 0.3) / 2;
  addPanel(s, M.left, cy, half, 3.5, 'Demo ③ 编写测试 SOP');
  addCode(s, M.left + 0.16, cy + 0.5, half - 0.32, 1.15,
    '根据项目中的 prober_driver.py 驱动代码，\n生成《机台自动化测试标准操作规程 (SOP)》,\n含环境准备、初始化、Flow 挂载、常见报错排查。');
  s.addText('预期输出：', { x: M.left + 0.16, y: cy + 1.75, w: half - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('• 完整 SOP 文档（步骤截图描述）\n• 常见问题 FAQ 与排查步骤', { x: M.left + 0.16, y: cy + 2.02, w: half - 0.32, h: 0.7, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.1 });
  const rx2 = M.left + half + 0.3;
  addPanel(s, rx2, cy, half, 3.5, 'Demo ④ 制作 PPT 大纲');
  addCode(s, rx2 + 0.16, cy + 0.5, half - 0.32, 1.15,
    '做一个"测试数据自动化分析"组内分享 PPT，\n目标受众是部门工程师，请设计大纲，含\n背景、问题、方案、Demo、效果对比。');
  s.addText('预期输出：', { x: rx2 + 0.16, y: cy + 1.75, w: half - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('• 结构化 PPT 大纲（每页核心要点）\n• 建议的图表类型与讲解节奏', { x: rx2 + 0.16, y: cy + 2.02, w: half - 0.32, h: 0.7, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.1 });
  addSoWhat(s, 'SO WHAT', '读代码出 SOP、一句话出大纲 —— 文档与汇报材料的生产周期从"半天"压缩到"分钟"。');
  addFooter(s, '来源：日常工作场景 Demo（§4 Demo3 / Demo4）', '11');
}

// ============ P12 Demo ⑤⑥ ============
{
  const s = newSlide();
  addBase(s, { section: '04 · 场景与 Demo', num: '12' });
  const cy = addTitle(s, '基于测试数据设计 DOE，并做技术调研头脑风暴', 'Demo ⑤ DOE 实验设计　 Demo ⑥ 技术调研');
  const half = (CW - 0.3) / 2;
  // Demo5 DOE 因子矩阵
  addPanel(s, M.left, cy, half, 3.5, 'Demo ⑤ DOE 实验设计');
  addCode(s, M.left + 0.16, cy + 0.48, half - 0.32, 1.0,
    '这是最近 3 批次接触电阻 rc_data.json。\n请结合 Micro-bump 失效机制，设计 3 因子\n2 水平 DOE，优化针尖压力与清洗周期。');
  const rows = [
    ['因子', '低 (-1)', '高 (+1)'],
    ['Overdrive', '50 μm', '80 μm'],
    ['Clean Count', '50 次', '100 次'],
    ['Soak Time', '10 ms', '30 ms'],
  ];
  addTable(s, rows, { x: M.left + 0.16, y: cy + 1.62, w: half - 0.32, colW: [1.6, 1.0, 1.0].map(v => v * (half - 0.32) / 3.6), rowH: 0.34, fontSize: T.T11, headSize: T.T11 });
  s.addText('目标：降低接触电阻标准差，CPK 提升至 1.5 以上', { x: M.left + 0.16, y: cy + 3.05, w: half - 0.32, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  // Demo6 调研
  const rx2 = M.left + half + 0.3;
  addPanel(s, rx2, cy, half, 3.5, 'Demo ⑥ 技术调研与头脑风暴');
  addCode(s, rx2 + 0.16, cy + 0.48, half - 0.32, 1.0,
    '探针台针尖磨损导致虚焊/测量不准\n(False Contact Failure)。请检索并整理工业界\n解决 Micro-bump 探针损伤的主流方案，列 5 个方向对比。');
  s.addText('预期输出：', { x: rx2 + 0.16, y: cy + 1.62, w: half - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText('• 技术方案对比表（利弊 + 引入成本）\n• 5 个头脑风暴方向\n• 推荐的实施路径', { x: rx2 + 0.16, y: cy + 1.9, w: half - 0.32, h: 0.9, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.1 });
  addSoWhat(s, 'SO WHAT', '从数据到实验方案、从难题到决策路径 —— 大模型把"经验型难题"变成"可执行清单"。');
  addFooter(s, '来源：日常工作场景 Demo（§4 Demo5 / Demo6）', '12');
}

// ============ P13 AGENTS.md 入门 ============
{
  const s = newSlide();
  addBase(s, { section: '05 · AGENTS.md', num: '13' });
  const cy = addTitle(s, '配置 AGENTS.md 让大模型秒懂半导体测试语境', '消歧义 + 提效率 + 统一标准，一次配置永久生效');
  // 左：术语对照
  const lx = M.left, lw = 5.3;
  addPanel(s, lx, cy, lw, 3.5, '为什么必须配置：术语消歧义');
  const rows = [
    ['术语', '通用理解', '半导体专业'],
    ['Bump', '碰撞、撞击', '微凸块，芯片互连'],
    ['Probe Card', '探测卡', '探针卡，晶圆测试'],
    ['Yield', '产量、收益', '良率，合格品比例'],
    ['Pre-DC', '预直流', '减薄/划片/键合前电性测试'],
  ];
  addTable(s, rows, { x: lx + 0.16, y: cy + 0.5, w: lw - 0.32, colW: [1.2, 1.7, lw - 0.32 - 2.9], rowH: 0.42, fontSize: T.T11, headSize: T.T11 });
  // 右：模板三段 + 路径
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addPanel(s, rx, cy, rw, 3.5, '基础配置模板（三段）');
  addCode(s, rx + 0.16, cy + 0.5, rw - 0.32, 2.35,
    '# Role & Background\n你是一个半导体先进封装 TD Testing 部门的\n高级测试工程师与自动化专家。\n\n# Terminology & Context\n- Pre-DC: Wafer 减薄/划片/键合前的直流电性测试\n- 熟知 SECS/GEM、Prober、Tester 通讯机制\n\n# Coding & Response Style\n- 优先 Python 数据分析与自动化脚本\n- 代码必须包含健壮的异常处理');
  s.addText([
    { text: '路径：', options: { bold: true, color: C.accent, fontSize: T.T7 } },
    { text: '~/.cimi/cimicode/AGENTS.md（全局，对所有项目生效；改完立即生效，无需重启）', options: { color: C.body, fontSize: T.T7 } },
  ], { x: rx + 0.16, y: cy + 2.95, w: rw - 0.32, h: 0.45, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.1 });
  addSoWhat(s, 'SO WHAT', '不配置背景，大模型按通用语义理解术语 —— 一份 AGENTS.md 让全团队获得一致且专业的 AI 辅助。');
  addFooter(s, '来源：AGENTS.md 配置入门（§5.1 / §5.2 / §5.3）', '13');
}

// ============ P14 Skill ============
{
  const s = newSlide();
  addBase(s, { section: '06 · Skill', num: '14' });
  const cy = addTitle(s, '两个必备 Skill 让新人提问不卡壳、信息不过期', 'Grill-Me 厘清需求　 Web Search 补时效');
  const half = (CW - 0.3) / 2;
  // 左 Grill-Me
  addPanel(s, M.left, cy, half, 3.5, 'Grill-Me：需求澄清助手');
  s.addText('解决：新人不知道怎么提需求，模型猜错意图。', { x: M.left + 0.16, y: cy + 0.48, w: half - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle' });
  // 对话气泡：输入 → 反问
  s.addShape('roundRect', { x: M.left + 0.16, y: cy + 0.95, w: half - 0.32, h: 0.4, rectRadius: 0.05, fill: { color: C.accentBg }, line: { color: C.accentLt, width: 0.75 } });
  s.addText('帮我写一个良率分析脚本。', { x: M.left + 0.28, y: cy + 0.95, w: half - 0.56, h: 0.4, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  s.addShape('roundRect', { x: M.left + 0.16, y: cy + 1.45, w: half - 0.32, h: 1.2, rectRadius: 0.05, fill: { color: C.paper }, line: { color: C.accent, width: 1 } });
  s.addText('Grill-Me 反问：\n1. 数据源格式（CSV/Excel/SQLite）？\n2. 良率是否剔除 Dummy Die？\n3. 异常阈值（如 < 95%）？\n4. 输出格式（Markdown/Excel/图表）？', { x: M.left + 0.28, y: cy + 1.52, w: half - 0.56, h: 1.1, fontFace: FONT, fontSize: T.T11, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.1 });
  addCode(s, M.left + 0.16, cy + 2.78, half - 0.32, 0.5, '$ /install-skill grill-me');
  // 右 Web Search
  const rx2 = M.left + half + 0.3;
  addPanel(s, rx2, cy, half, 3.5, 'Web Search：联网搜索');
  s.addText('解决：训练数据有截止日期，查不到最新工具/标准。', { x: rx2 + 0.16, y: cy + 0.48, w: half - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'middle' });
  const tags = ['最新 API 文档（如 pysecsgem）', '行业标准更新（JEDEC 等）', '开源项目最新版本', '报错代码解决方案'];
  tags.forEach((tg, i) => {
    const ty = cy + 1.0 + i * 0.42;
    addPill(s, rx2 + 0.16, ty, half - 0.32, 0.34, tg, { fill: C.accentLt, color: C.accent, size: T.T7 });
  });
  addCode(s, rx2 + 0.16, cy + 2.78, half - 0.32, 0.5, '$ /install-skill web-search');
  addSoWhat(s, 'SO WHAT', 'Grill-Me 让新人"问对问题"，Web Search 让大模型"查到最新" —— 两个 Skill 补齐新人最常踩的两个坑。');
  addFooter(s, '来源：Skill 安装与使用（§6.1 / §6.2）', '14');
}

// ============ P15 权限与安全 ============
{
  const s = newSlide();
  addBase(s, { section: '07 · 权限与安全', num: '15' });
  const cy = addTitle(s, '个人环境开 Auto-Approve，产线系统严守确认', '默认每次确认太慢；但要按环境分级放开');
  // 左：权限三级表
  const lx = M.left, lw = 7.4;
  addPanel(s, lx, cy, lw, 3.5, '权限分级建议');
  const rows = [
    ['环境', '权限建议', '原因'],
    ['个人本地项目', 'Auto-Approve', '提升效率，无风险'],
    ['共享代码库', '默认确认模式', '防止误操作影响他人'],
    ['产线相关系统', '严格确认模式', '安全第一'],
  ];
  addTable(s, rows, { x: lx + 0.16, y: cy + 0.5, w: lw - 0.32, colW: [2.4, 2.0, lw - 0.32 - 4.4], rowH: 0.5, fontSize: T.T7, headSize: T.T7 });
  s.addText('Auto-Approve 适用：独立的 Git 分支、沙盒测试环境、个人本地项目', { x: lx + 0.16, y: cy + 2.95, w: lw - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T7, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  // 右：安全红线警示框
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  s.addShape('roundRect', { x: rx, y: cy, w: rw, h: 3.5, rectRadius: 0.06, fill: { color: C.warnLt }, line: { color: C.warn, width: 1.25 } });
  s.addShape('rect', { x: rx, y: cy, w: 0.08, h: 3.5, fill: { color: C.warn }, line: { type: 'none' } });
  s.addText('⚠ 安全红线', { x: rx + 0.24, y: cy + 0.14, w: rw - 0.4, h: 0.34, fontFace: FONT, fontSize: T.T6, bold: true, color: C.warn, align: 'left', valign: 'middle' });
  s.addText([
    { text: '严禁', options: { bold: true, color: C.neg, fontSize: T.T7 } },
    { text: ' 在产线机台数据库删除、线上配置文件修改时开启全局免确认。\n\n', options: { color: C.body, fontSize: T.T7 } },
    { text: '建议做法：\n', options: { bold: true, color: C.title, fontSize: T.T7 } },
    { text: '• 仅在个人开发环境中使用 Auto-Approve\n• 完成任务后及时关闭\n• 定期审查权限配置', options: { color: C.body, fontSize: T.T7 } },
  ], { x: rx + 0.24, y: cy + 0.55, w: rw - 0.48, h: 2.8, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.15 });
  addSoWhat(s, 'SO WHAT', '效率与安全不冲突 —— 个人环境放开提效，产线系统一步一确认，红线绝不碰。');
  addFooter(s, '来源：权限配置（§8.1 / §8.2 / §8.3）', '15');
}

// ============ P16 FAQ ============
{
  const s = newSlide();
  addBase(s, { section: '08 · FAQ', num: '16' });
  const cy = addTitle(s, '三类高频问题都有标准排查路径', '新人踩坑不用慌，按路径逐一排查');
  const faqs = [
    { q: '安装失败怎么办？', a: ['检查网络连接，确保可访问公司内网', '确认已获得 Coding 权限', '联系 CIMICode 维护群获取支持'] },
    { q: '大模型回答不准？', a: ['检查 AGENTS.md 是否配置正确背景', '用 Grill-Me Skill 厘清需求', '提供更多上下文（文件路径、错误码）'] },
    { q: 'Token 消耗太快？', a: ['日常任务用 DeepSeek v4 Flash', '复杂任务才切 Pro 模型', '避免粘贴大量原始数据，先脚本提取'] },
  ];
  const cw = (CW - 0.5) / 3, gap = 0.25, ch = 3.4;
  faqs.forEach((f, i) => {
    const fx = M.left + i * (cw + gap);
    s.addShape('roundRect', { x: fx, y: cy + 0.1, w: cw, h: ch, rectRadius: 0.06, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
    s.addShape('rect', { x: fx, y: cy + 0.1, w: cw, h: 0.06, fill: { color: C.accent }, line: { type: 'none' } });
    s.addText(`Q${i + 1}  ${f.q}`, { x: fx + 0.16, y: cy + 0.28, w: cw - 0.32, h: 0.4, fontFace: FONT, fontSize: T.T6, bold: true, color: C.accent, align: 'left', valign: 'middle' });
    s.addText('排查路径：', { x: fx + 0.16, y: cy + 0.78, w: cw - 0.32, h: 0.26, fontFace: FONT, fontSize: T.T7, bold: true, color: C.title, align: 'left', valign: 'middle' });
    s.addText(f.a.map((x, j) => ({ text: `${j + 1}. ${x}`, options: { color: C.body, fontSize: T.T7, breakLine: j < f.a.length - 1 } })),
      { x: fx + 0.16, y: cy + 1.1, w: cw - 0.32, h: 2.1, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.2 });
  });
  s.addText('附：在 CIMICode 界面顶部或设置中，可查看当前使用的模型与 Token 消耗。', { x: M.left, y: cy + ch + 0.25, w: CW, h: 0.3, fontFace: FONT, fontSize: T.T14, italic: true, color: C.sub, align: 'left', valign: 'middle' });
  addFooter(s, '来源：常见问题 FAQ（§九）', '16');
}

// ============ P17 Checklist + 下一步 ============
{
  const s = newSlide();
  addBase(s, { section: '收束', num: '17' });
  const cy = addTitle(s, '照着这 8 步，今天完成第一个真实任务', '新人上手 Checklist · 建议当天完成');
  const cl = [
    '在 CIMICode 维护群申请 Coding 权限',
    '安装桌面版和/或终端版',
    '配置 AGENTS.md（参考模板）',
    '安装 Grill-Me Skill',
    '安装 Web Search Skill',
    '打开一个实际项目目录',
    '完成一个简单任务（如文件整理）',
    '用 Plan-Build 完成一个复杂任务',
  ];
  const colN = 2, colW = (CW - 0.4) / colN;
  cl.forEach((t, i) => {
    const col = i % colN, row = Math.floor(i / colN);
    const cx = M.left + col * (colW + 0.4);
    const cyy = cy + 0.15 + row * 0.62;
    // 勾选框
    s.addShape('roundRect', { x: cx, y: cyy, w: 0.34, h: 0.34, rectRadius: 0.04, fill: { color: C.white }, line: { color: C.accent, width: 1.25 } });
    s.addText('✓', { x: cx, y: cyy, w: 0.34, h: 0.34, fontFace: FONT, fontSize: 12, bold: true, color: C.accent, align: 'center', valign: 'middle' });
    s.addText(`${i + 1}.  ${t}`, { x: cx + 0.44, y: cyy, w: colW - 0.5, h: 0.34, fontFace: FONT, fontSize: T.T7, color: C.title, align: 'left', valign: 'middle' });
  });
  // 下一步行动框（承接 PPT2）
  addClaim(s, M.left, cy + 2.75, CW, '下一步：进阶学习《大模型成本优化与高级功能配置》(PPT2) —— 解决"用得起、用得好"', { h: 0.55 });
  s.addText('PPT2 面向老板 / TL，覆盖 Token 成本优化、AGENTS.md 高级配置、Plan-Build 进阶与团队落地路线图。', { x: M.left, y: cy + 3.4, w: CW, h: 0.4, fontFace: FONT, fontSize: T.T7, color: C.sub, align: 'left', valign: 'middle' });
  addFooter(s, '来源：快速上手 Checklist（§十）', '17');
}

const OUT = '/Volumes/Vault/repos/github/notes/PPT-项目/PPT1-入门/deck/PPT1-公司大模型工具使用入门.pptx';
p.writeFile({ fileName: OUT }).then(f => console.log('PPT1 写出:', f, '| 页数:', p.slides.length));
