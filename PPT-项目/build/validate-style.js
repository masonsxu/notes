// validate-style.js — 风格4 执行验证（3 页代表样张）
const PptxGenJS = require('pptxgenjs');
const th = require('./theme.js');
const { PAGE, M, CW, C, T, FONT, FONT_EN,
  addBase, addTitle, addFooter, addSoWhat, addKPI, addPanel, addClaim, addTable, addCode, addPill } = th;

const p = new PptxGenJS();
p.defineLayout({ name: 'W', width: PAGE.w, height: PAGE.h });
p.layout = 'W';
p.author = 'CIMICode TD Testing';

// 让 addBase 能拿到 pptx
function newSlide(holder) {
  const s = p.addSlide();
  s._pptxHolder = holder;
  return s;
}
const H = { pptx: p };

// ============ 第1页 封面 ============
{
  const s = newSlide(H);
  s.background = { color: C.bg };
  // 左侧深蓝竖带
  s.addShape('rect', { x: 0, y: 0, w: 0.28, h: PAGE.h, fill: { color: C.accent }, line: { type: 'none' } });
  // 顶部小标签
  s.addText('CIMICode · 内部培训', { x: M.left + 0.2, y: 1.5, w: 10, h: 0.4,
    fontFace: FONT, fontSize: T.T3, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  // 主标题 C0
  s.addText('公司大模型工具使用入门', { x: M.left + 0.2, y: 2.0, w: 11.5, h: 1.3,
    fontFace: FONT, fontSize: T.C0, bold: true, color: C.title, align: 'left', valign: 'middle' });
  // 副标题
  s.addText('从开通到上手，新人 1 天搞定', { x: M.left + 0.2, y: 3.35, w: 11.5, h: 0.6,
    fontFace: FONT, fontSize: 18, color: C.sub, align: 'left', valign: 'middle' });
  // 强调长规
  s.addShape('rect', { x: M.left + 0.2, y: 4.15, w: 2.2, h: 0.06, fill: { color: C.accent }, line: { type: 'none' } });
  // 受众/版本脚注
  s.addText('受众：部门新人、组内工程师    |    讲师：TD Testing', { x: M.left + 0.2, y: 6.4, w: 11, h: 0.4,
    fontFace: FONT, fontSize: T.T7, color: C.faint, align: 'left', valign: 'middle' });
  addFooter(s, 'CIMICode 平台 · 基于 OpenCode 开发', '01');
}

// ============ 第2页 内容页（KPI + 卡片 + SO WHAT）模型一览 ============
{
  const s = newSlide(H);
  addBase(s, { section: '01 · 资源总览', num: '03' });
  const cy = addTitle(s, '默认 DeepSeek v4 Flash 即可满足绝大多数需求', '四款模型按成本与能力分层，新人起步只认 Flash');
  // 左：四模型卡（2x2）
  const lx = M.left, lw = 7.5;
  const models = [
    { n: 'DeepSeek v4 Flash', t: '通用推理', c: '极低', tag: '推荐默认', hl: true,
      d: '日常 80% 场景：简单代码、Log 解析、格式转换、文档整理' },
    { n: 'DeepSeek v4 Pro', t: '深度推理', c: '约 5×', tag: '复杂任务',
      d: '复杂逻辑推理、深度 Bug 排查、架构设计' },
    { n: 'GLM 5.1 / 5.2', t: '长文本中文', c: '约 5×', tag: '长文场景',
      d: '长篇 SOP 编写、跨文件复杂整理' },
    { n: 'Kimi 2.7', t: '超长上下文', c: '约 5×', tag: '海量对比',
      d: '超大型 Log 校验、海量文档对比' },
  ];
  const cardW = (lw - 0.2) / 2, cardH = 1.35, gap = 0.2;
  models.forEach((m, i) => {
    const cx = lx + (i % 2) * (cardW + gap);
    const cyy = cy + 0.15 + Math.floor(i / 2) * (cardH + gap);
    const fill = m.hl ? C.accentBg : C.paper;
    const line = m.hl ? C.accent : C.line;
    s.addShape('rect', { x: cx, y: cyy, w: cardW, h: cardH, fill: { color: fill }, line: { color: line, width: m.hl ? 1.2 : 0.75 } });
    // 模型名 + 标签
    s.addText(m.n, { x: cx + 0.16, y: cyy + 0.1, w: cardW - 1.3, h: 0.34,
      fontFace: FONT, fontSize: T.T6, bold: true, color: m.hl ? C.accent : C.title, align: 'left', valign: 'middle' });
    addPill(s, cx + cardW - 1.18, cyy + 0.14, 1.02, 0.28, m.tag, { fill: m.hl ? C.accent : C.accentLt, color: m.hl ? C.white : C.accent });
    s.addText(`${m.t}   ·   成本 ${m.c}`, { x: cx + 0.16, y: cyy + 0.46, w: cardW - 0.3, h: 0.26,
      fontFace: FONT, fontSize: T.T7, color: C.sub, align: 'left', valign: 'middle' });
    s.addText(m.d, { x: cx + 0.16, y: cyy + 0.74, w: cardW - 0.3, h: 0.52,
      fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  });
  // 右：KPI 栏
  const rx = lx + lw + 0.3, rw = CW - lw - 0.3;
  addKPI(s, rx, cy + 0.15, rw, 1.5, '80%', '日常场景由 Flash 覆盖', { note: '建议比例，非实测' });
  addKPI(s, rx, cy + 1.75, rw, 1.5, '5×', '高阶模型约为公网成本', { numSize: 24, note: 'Pro / GLM / Kimi' });
  addPanel(s, rx, cy + 3.35, rw, 1.0, '新人选型口诀');
  s.addText('日常默认 Flash；遇到多次改不通、逻辑死循环，再切 Pro / GLM / Kimi。', { x: rx + 0.16, y: cy + 3.78, w: rw - 0.32, h: 0.5,
    fontFace: FONT, fontSize: T.T7, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
  addSoWhat(s, 'SO WHAT', '新人起步无需纠结：默认 DeepSeek v4 Flash，成本极低、响应快，覆盖绝大多数日常工作。');
  addFooter(s, '来源：CIMICode 模型清单（§1.1） · 80% 为建议比例', '03');
}

// ============ 第3页 表格页（三种形态对比）============
{
  const s = newSlide(H);
  addBase(s, { section: '01 · 资源总览', num: '04' });
  const cy = addTitle(s, '三种形态覆盖开发、机台、移动三类场景', '桌面版 / 终端版 / Web 版各有阵地，按场景选形');
  // 表格
  const rows = [
    ['形态', '使用方式', '适用场景', '特点'],
    ['桌面版 Desktop', '安装本地客户端', '代码开发、文档撰写、数据分析、PPT 整理', '视觉好，多窗口、图表预览、可视化项目管理'],
    ['终端版 TUI', '终端命令行', '服务器自动化、Linux 跑脚本、排查机台报错', '直接跑在 Linux/WSL/机台，无需图形界面'],
    ['Web 网页版', '浏览器访问', '手机/移动端临时查阅、非敏感非 Coding', '快捷免配置，适合突发文字处理或头脑风暴'],
  ];
  addTable(s, rows, {
    x: M.left, y: cy + 0.15, w: CW,
    colW: [2.1, 2.6, 4.0, CW - 8.7], rowH: 0.62,
    fontSize: T.T7, headSize: T.T7,
  });
  // 安装命令代码块（手把手）
  addCode(s, M.left, cy + 3.2, CW, 0.95,
    '# 终端版安装（Linux / macOS）\n$ npm install -g cimicode-tui      # 装好后进入项目目录运行 cimicode-tui\n# 桌面版：macOS / Windows 下载安装包，双击安装后登录公司账号');
  addSoWhat(s, 'SO WHAT', 'TD Testing 强依赖本地代码库与机台数据 —— 申请 Coding 权限后，桌面版 + 终端版是主力，Web 版作轻量补充。');
  addFooter(s, '来源：CIMICode 平台形态（§1.2）', '04');
}

p.writeFile({ fileName: '/Volumes/Vault/repos/github/notes/PPT-项目/build/_validate-style.pptx' })
  .then(f => console.log('写出:', f));
