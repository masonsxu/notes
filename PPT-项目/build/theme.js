// theme.js — 风格4「象牙白 + 深蓝强调」锁定视觉系统
// 两份 PPT 共用。所有页面通过本模块产出统一观感。

// ---- 画布 ----
const PAGE = { w: 13.333, h: 7.5 };
const M = { left: 0.55, right: 0.55, top: 0.42, bottom: 0.38 };
const CW = PAGE.w - M.left - M.right; // 内容宽 12.233

// ---- 风格4 色板 ----
const C = {
  bg:        'F7F6F0', // 象牙白页面底
  paper:     'FCFBF5', // 面板/卡片底（略暖）
  white:     'FFFFFF',
  title:     '101820', // 近黑标题
  body:      '303030', // 正文
  sub:       '6F7275', // 次级
  faint:     '9AA0A6', // 更淡
  line:      'C9CDD1', // 线条
  lineSoft:  'E2E3DD', // 细分隔
  accent:    '12355B', // 深蓝强调
  accent2:   '1F4E79', // 深蓝次
  accentLt:  'DCE5EF', // 强调浅底
  accentBg:  'EAF0F6', // 强调更浅底
  warn:      'B5651D', // 警示琥珀
  warnLt:    'F6ECD8',
  pos:       '2F6B4F', // 正向绿
  neg:       '9E2B25', // 负向红
};

// ---- Typography Scale（技能固定 15 级）字号 pt ----
const T = {
  C0: 40,  // 封面/章节幕
  T1: 15,  // 页码/章节徽章
  T2: 24,  // 页面主标题
  T3: 11,  // 副标题
  T4: 12.5,// 模块/图表标题
  T5: 8,   // 证据编号/轻量标签
  T6: 12,  // 证据块标题
  T7: 10,  // 正文
  T8: 11,  // 结论条
  T9: 11,  // SO WHAT 标签
  T10: 10, // SO WHAT 正文
  T11: 8,  // 轴/图例/刻度
  T12: 9.5,// 数据标签
  T13: 26, // KPI 大数字
  T14: 7,  // 注释/来源/页脚
};

// 字体：中文苹方 + 西文同族，LibreOffice 在 macOS 可渲染
const FONT = 'PingFang SC';
const FONT_EN = 'PingFang SC';

// ============ 通用元素 ============

// 页面底色 + 顶部章节徽章 + 页脚
function addBase(s, opt = {}) {
  const { pptx } = s._pptxHolder || {};
  // 背景整页
  s.background = { color: C.bg };

  const sec = opt.section || '';
  const num = opt.num || '';
  // 左上章节徽章（深蓝小条 + 标签）
  if (sec) {
    s.addShape('roundRect', { x: M.left, y: M.top, w: 0.34, h: 0.34,
      fill: { color: C.accent }, rectRadius: 0.04, line: { type: 'none' } });
    s.addText(sec, { x: M.left + 0.44, y: M.top - 0.02, w: 8, h: 0.38,
      fontFace: FONT, fontSize: T.T1, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  }
  // 右上页码（T1）
  if (num) {
    s.addText(num, { x: PAGE.w - M.right - 1.2, y: M.top - 0.02, w: 1.2, h: 0.38,
      fontFace: FONT_EN, fontSize: T.T1, color: C.sub, align: 'right', valign: 'middle', bold: true });
  }
}

// 页面主标题（T2）+ 副标题（T3）+ 深蓝强调短规线
function addTitle(s, title, sub) {
  const y0 = M.top + 0.5;
  s.addText(title, { x: M.left, y: y0, w: CW, h: 0.62,
    fontFace: FONT, fontSize: T.T2, bold: true, color: C.title, align: 'left', valign: 'middle' });
  // 强调短规
  s.addShape('rect', { x: M.left, y: y0 + 0.66, w: 0.5, h: 0.055,
    fill: { color: C.accent }, line: { type: 'none' } });
  if (sub) {
    s.addText(sub, { x: M.left, y: y0 + 0.74, w: CW, h: 0.34,
      fontFace: FONT, fontSize: T.T3, color: C.sub, align: 'left', valign: 'middle', italic: false });
  }
  return y0 + (sub ? 1.12 : 0.8); // 内容区起始 y
}

// 页脚（左：来源/注释；右：页码）
function addFooter(s, leftText, pageStr) {
  const y = PAGE.h - M.bottom - 0.3;
  s.addShape('rect', { x: M.left, y: y - 0.02, w: CW, h: 0.012,
    fill: { color: C.lineSoft }, line: { type: 'none' } });
  if (leftText) {
    s.addText(leftText, { x: M.left, y, w: CW - 1.2, h: 0.28,
      fontFace: FONT, fontSize: T.T14, color: C.faint, align: 'left', valign: 'middle' });
  }
  if (pageStr) {
    s.addText(pageStr, { x: PAGE.w - M.right - 1.2, y, w: 1.2, h: 0.28,
      fontFace: FONT_EN, fontSize: T.T14, color: C.faint, align: 'right', valign: 'middle' });
  }
}

// SO WHAT 底栏（T9 标签 + T10 正文）
function addSoWhat(s, label, body, opt = {}) {
  const h = opt.h || 0.82;
  const y = PAGE.h - M.bottom - 0.34 - h;
  s.addShape('rect', { x: M.left, y, w: CW, h, fill: { color: C.accentBg }, line: { color: C.accentLt, width: 0.75 } });
  // 左侧强调竖条
  s.addShape('rect', { x: M.left, y, w: 0.07, h, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText(label || 'SO WHAT', { x: M.left + 0.24, y: y + 0.08, w: 2.4, h: 0.3,
    fontFace: FONT, fontSize: T.T9, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText(body, { x: M.left + 0.24, y: y + 0.34, w: CW - 0.5, h: h - 0.42,
    fontFace: FONT, fontSize: T.T10, color: C.title, align: 'left', valign: 'top', lineSpacingMultiple: 1.05 });
  return y; // 返回 SO WHAT 顶部 y，供内容区避让
}

// KPI 卡（T13 大数字 + T4 标签 + 可选脚注）
function addKPI(s, x, y, w, h, num, label, opt = {}) {
  s.addShape('rect', { x, y, w, h, fill: { color: C.paper }, line: { color: C.line, width: 0.75 } });
  s.addText(num, { x: x + 0.14, y: y + 0.12, w: w - 0.28, h: h * 0.5,
    fontFace: FONT_EN, fontSize: opt.numSize || T.T13, bold: true, color: C.accent, align: 'left', valign: 'middle' });
  s.addText(label, { x: x + 0.14, y: y + h * 0.56, w: w - 0.28, h: h * 0.32,
    fontFace: FONT, fontSize: T.T4, color: C.body, align: 'left', valign: 'top', lineSpacingMultiple: 1.0 });
  if (opt.note) {
    s.addText(opt.note, { x: x + 0.14, y: y + h - 0.26, w: w - 0.28, h: 0.22,
      fontFace: FONT, fontSize: T.T14, color: C.faint, align: 'left', valign: 'middle' });
  }
}

// 面板（带标题 T4）
function addPanel(s, x, y, w, h, title, opt = {}) {
  s.addShape('rect', { x, y, w, h, fill: { color: opt.fill || C.paper }, line: { color: opt.line || C.line, width: 0.75 } });
  if (title) {
    // 标题底条
    s.addShape('rect', { x, y, w: w, h: 0.36, fill: { color: opt.titleFill || C.accentBg }, line: { type: 'none' } });
    s.addText(title, { x: x + 0.14, y, w: w - 0.28, h: 0.36,
      fontFace: FONT, fontSize: T.T4, bold: true, color: opt.titleColor || C.accent, align: 'left', valign: 'middle' });
  }
}

// 结论条（T8，深蓝底白字，用于关键主张）
function addClaim(s, x, y, w, text, opt = {}) {
  const h = opt.h || 0.5;
  s.addShape('rect', { x, y, w, h, fill: { color: C.accent }, line: { type: 'none' } });
  s.addText(text, { x: x + 0.16, y, w: w - 0.3, h,
    fontFace: FONT, fontSize: T.T8, bold: true, color: C.white, align: 'left', valign: 'middle', lineSpacingMultiple: 1.0 });
  return y + h;
}

// 表格 helper（统一表头样式）
function addTable(s, rows, opt = {}) {
  const { x, y, w, colW, headerFill = C.accent, fontSize = T.T7, headSize = T.T7 } = opt;
  const tableRows = rows.map((r, ri) => {
    const isHead = ri === 0;
    return r.map(cell => {
      const txt = typeof cell === 'string' ? cell : cell.t;
      const o = typeof cell === 'string' ? {} : cell;
      return {
        text: txt,
        options: {
          fontFace: FONT, fontSize: isHead ? headSize : (o.size || fontSize),
          bold: isHead ? true : !!o.bold,
          color: isHead ? C.white : (o.color || C.body),
          align: o.align || (isHead ? 'center' : 'left'),
          valign: 'middle',
          fill: { color: isHead ? headerFill : (o.fill || (ri % 2 === 0 ? C.white : C.paper)) },
          line: { color: C.line, width: 0.5 },
        }
      };
    });
  });
  s.addTable(tableRows, { x, y, w, colW, rowH: opt.rowH || 0.4, align: opt.align });
}

// 代码块（等宽感，深底浅字）——手把手教学用
function addCode(s, x, y, w, h, code, opt = {}) {
  s.addShape('rect', { x, y, w, h, fill: { color: '1A2330' }, line: { type: 'none' } });
  s.addText(code, { x: x + 0.16, y, w: w - 0.3, h,
    fontFace: 'Menlo', fontSize: opt.size || 9, color: 'E6EDF3', align: 'left', valign: 'middle', lineSpacingMultiple: 1.15 });
}

// 小色块标签（pill）
function addPill(s, x, y, w, h, text, opt = {}) {
  s.addShape('roundRect', { x, y, w, h, rectRadius: 0.06,
    fill: { color: opt.fill || C.accentLt }, line: { type: 'none' } });
  s.addText(text, { x: x + 0.08, y, w: w - 0.16, h,
    fontFace: FONT, fontSize: opt.size || T.T11, bold: true,
    color: opt.color || C.accent, align: 'center', valign: 'middle' });
}

module.exports = { PAGE, M, CW, C, T, FONT, FONT_EN,
  addBase, addTitle, addFooter, addSoWhat, addKPI, addPanel, addClaim, addTable, addCode, addPill };
