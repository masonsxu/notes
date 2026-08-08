#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate opencode-getting-started.bento.html from the markdown source material."""
import json, re, sys

# ---------- design tokens ----------
BG       = "#0D1117"
BG2      = "#11161D"
PANEL    = "#161B22"
PANEL2   = "#1C232C"
BORDER   = "rgba(255,255,255,0.10)"
BORDER2  = "rgba(255,255,255,0.06)"
MAIN     = "#E6EDF3"
MUTED    = "#8B949E"
DIM      = "#6E7681"
ACCENT   = "#2DD4BF"
ACCENT2  = "#5EEAD4"
ACC_BG   = "rgba(45,212,191,0.12)"
WARN     = "#F0883E"
WARN_BG  = "rgba(240,136,62,0.12)"
SANS  = "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
MONO  = "ui-monospace, 'SF Mono', Menlo, Consolas, 'PingFang SC', monospace"

W, H = 1280, 720
RIGHT = 1184

# ---------- element helpers ----------
def T(id, x, y, w, h, html, size=18, weight=400, color=MAIN, align="left",
      valign="top", lh=1.3, family=SANS, role=None, ls=None, fx=None, **kw):
    d = {"id":id,"type":"text","x":x,"y":y,"w":w,"h":h,"rotation":0,"opacity":1,
         "html":html,"fontSize":size,"fontFamily":family,"fontWeight":weight,
         "color":color,"align":align,"valign":valign,"lineHeight":lh}
    if role: d["role"]=role
    if ls is not None: d["letterSpacing"]=ls
    if fx: d["fx"]=fx
    d.update(kw); return d

def R(id, x, y, w, h, fill=PANEL, stroke=BORDER, sw=1, radius=12, **kw):
    d = {"id":id,"type":"shape","shape":"rect","x":x,"y":y,"w":w,"h":h,
         "fill":fill,"stroke":stroke,"strokeWidth":sw,"radius":radius,
         "rotation":0,"opacity":1}
    d.update(kw); return d

def E(id, x, y, w, h, fill, stroke="none", sw=0, **kw):
    d={"id":id,"type":"shape","shape":"ellipse","x":x,"y":y,"w":w,"h":h,
       "fill":fill,"stroke":stroke,"strokeWidth":sw,"radius":0,"rotation":0,"opacity":1}
    d.update(kw); return d

def CONN(id, frm, to, color=MUTED, sw=2, dash=False, march=False, **kw):
    d={"id":id,"type":"shape","shape":"line","x":0,"y":0,"w":0,"h":0,
       "fill":"none","stroke":color,"strokeWidth":sw,"strokeStyle":"dashed" if dash else "solid",
       "lineEnd":"arrow","lineStart":"none","radius":0,"rotation":0,"opacity":1,
       "from":{"el":frm,"side":"auto"},"to":{"el":to,"side":"auto"}}
    if march: d["fx"]={"loop":{"type":"dash-march","distance":14,"duration":1.4}}
    d.update(kw); return d

def TABLE(id, x, y, w, h, columns, rows, header=True, fontSize=15, **st):
    style={"headerBg":PANEL2,"headerColor":ACCENT,"zebra":"rgba(255,255,255,0.025)",
           "borderColor":BORDER,"borderWidth":1,"cellPadX":14,"cellPadY":9,
           "fontSize":fontSize,"color":MAIN,"radius":10}
    style.update(st)
    return {"id":id,"type":"table","x":x,"y":y,"w":w,"h":h,"rotation":0,"opacity":1,
            "header":header,"columns":[{"w":c} for c in columns],"rows":rows,"style":style}

def CELL(html, align="left", color=None, bold=False):
    c={"html":html,"align":align}
    if color: c["color"]=color
    if bold: c["bold"]=True
    return c

# standard header + footer chrome (stable ids -> morph across content slides)
def chrome(kicker, title):
    return [
        T("kicker", 96, 60, 760, 22, kicker, size=13, weight=700, color=ACCENT,
          family=MONO, lh=1, role="kicker", ls=2),
        T("title", 96, 92, 1088, 58, title, size=38, weight=800, color=MAIN,
          lh=1.05, role="title"),
        R("accent-rule", 96, 158, 52, 4, ACCENT, stroke="none", sw=0, radius=2),
        T("footer-l", 96, 678, 600, 18, "opencode · 工具使用入门", size=11,
          color=DIM, family=MONO, lh=1),
        T("footer-r", 884, 678, 300, 18, "{{page:2}} / {{pages}}", size=11,
          color=DIM, family=MONO, align="right", lh=1),
    ]

def slide(id_, kicker, title, elements, notes, transition="morph", bg=BG, extra=None):
    s={"id":id_,"background":bg,"transition":transition,"notes":notes,
       "elements":chrome(kicker,title)+elements}
    if extra: s.update(extra)
    return s

def divider(id_, num, name, desc, notes):
    return {"id":id_,"background":BG,"transition":"fade","notes":notes,"elements":[
        R(id_+"-grad", 0, 0, W, H, BG, stroke="none", sw=0, radius=0,
          fillGradient={"angle":135,"stops":[{"at":0,"color":"#0D1117"},{"at":1,"color":"#0A1418"}]}),
        E(id_+"-glow", -260, -260, 1000, 1000, ACC_BG, opacity=0.9,
          fx={"ambient":"kenburns","ken":{"dir":"drift","scale":1.12,"duration":24}}),
        T(id_+"-num", 96, 150, 700, 360, num, size=340, weight=800, color=ACCENT,
          family=MONO, lh=0.9, opacity=0.95),
        T(id_+"-k", 820, 250, 360, 24, "PART", size=13, weight=700, color=MUTED,
          family=MONO, ls=4),
        T(id_+"-name", 820, 286, 360, 130, name, size=40, weight=800, color=MAIN, lh=1.1),
        R(id_+"-rule", 820, 420, 52, 4, ACCENT, stroke="none", sw=0, radius=2),
        T(id_+"-desc", 820, 446, 360, 120, desc, size=16, color=MUTED, lh=1.5),
    ]}

def pill(id_, x, y, w, label, fill=ACC_BG, fg=ACCENT2):
    return [R(id_, x, y, w, 34, fill, stroke="none", sw=0, radius=17),
            T(id_+"-t", x, y, w, 34, label, size=13, weight=600, color=fg,
              family=MONO, align="center", valign="middle", lh=1)]

def card(id_, x, y, w, h, fill=PANEL):
    return R(id_, x, y, w, h, fill, stroke=BORDER, sw=1, radius=14)

slides=[]

# ============ 1. COVER ============
slides.append({"id":"cover","background":BG,"transition":"none","notes":
    "开场。本课目标：把对大模型的认知从'聊天应用'推进到'Code Agent'，并当天完成首个真实任务。"
    "听众两极：20年以上半导体资深工程师，与应届/非编程岗。统一从基本功能与使用场景切入。",
    "elements":[
    R("c-grad",0,0,W,H,BG,stroke="none",sw=0,radius=0,
      fillGradient={"angle":135,"stops":[{"at":0,"color":"#0D1117"},{"at":1,"color":"#0A1416"}]}),
    E("c-glow",-300,-340,1100,1100,"rgba(45,212,191,0.16)",opacity=1,
      fx={"ambient":"kenburns","ken":{"dir":"drift","scale":1.14,"duration":26}}),
    E("c-glow2",760,360,760,760,"rgba(56,132,191,0.10)",opacity=1,
      fx={"ambient":"kenburns","ken":{"dir":"drift","scale":1.1,"duration":30}}),
    T("c-kick",96,200,800,24,"OPencode · 工具使用入门",size=14,weight=700,
      color=ACCENT,family=MONO,ls=4),
    T("c-title",92,238,1000,170,"opencode",size=150,weight=800,color=ACCENT,
      family=MONO,lh=1,fx={"enter":"fade-up"}),
    T("c-sub",96,418,900,56,"从聊天应用 到 Code Agent",size=40,weight=700,
      color=MAIN,lh=1.1),
    R("c-rule",96,486,160,4,ACCENT,stroke="none",sw=0,radius=2),
    T("c-tag",96,510,820,30,"面向半导体工程团队的工程任务执行工具 · 终端原生 · 文件读写 · 命令执行",
      size=16,color=MUTED,lh=1.4),
    *pill("p1",96,572,150,"终端 TUI"),
    *pill("p2",258,572,196,"文件 · 命令执行"),
    *pill("p3",466,572,140,"工具调用"),
    T("c-foot",96,678,600,18,"内部培训 · 半导体工程团队",size=11,color=DIM,family=MONO,lh=1),
]})

# ============ 2. 目标与受众 ============
slides.append(slide("s-audience","00 · 概览","目标与受众",[
    T("a-lead",96,196,1088,26,"两类听众，共性：对大模型的认知停留在'问答对话'，不了解 Code Agent 在工程任务中的应用面。",
      size=16,color=MUTED,lh=1.4),
    # card A
    card("a-A",96,250,528,300),
    T("a-Ah",120,274,200,24,"资深工程师",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("a-At",120,304,480,40,"深耕半导体 20 年以上的专家",size=24,weight=800,color=MAIN,lh=1.15),
    T("a-Ad",120,356,480,170,"• 熟悉测试程序、ATE、良率分析\n• 对大模型工具的认知有限\n• 关心：能否接入既有工程流程、可控性、安全边界",
      size=15,color=MUTED,lh=1.6),
    # card B
    card("a-B",656,250,528,300),
    T("a-Bh",680,274,200,24,"新人 / 非编程岗",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("a-Bt",680,304,480,40,"应届或非编程岗位同事",size=24,weight=800,color=MAIN,lh=1.15),
    T("a-Bd",680,356,480,170,"• 仅用过 ChatGPT / DeepSeek 网页版\n• 不清楚'编程智能体'能做什么\n• 关心：上手成本、能产出什么交付物",
      size=15,color=MUTED,lh=1.6),
    # objective bar
    R("a-obj",96,572,1088,60,PANEL2,stroke=BORDER,sw=1,radius=12),
    T("a-objt",120,572,1040,60,"本课目标：当天完成 安装 → 配置 → 首个真实任务",size=18,
      weight=700,color=ACCENT,valign="middle",family=MONO,lh=1),
],"核心矛盾：听众不知道 opencode 能在工作中做什么。所以全程从基本功能与使用场景切入，少抽象、多具体岗位映射。"))

# ============ 3. DIVIDER 01 ============
slides.append(divider("d1","01","概念建立","聊天应用与 Code Agent 的能力边界 —— 先界定'它是什么'，再谈'它能干什么'。",
    "进入第一部分：概念建立。先把两类工具的能力边界讲清楚，避免后续把 Code Agent 当聊天机器人用。"))

# ============ 4. Chatbot vs Code Agent table ============
rows=[
    {"cells":[CELL("维度",bold=True),CELL("聊天应用 Chatbot"),CELL("Code Agent（opencode）")]},
    {"cells":[CELL("输入边界"),CELL("用户手动粘贴文本片段"),CELL("读取项目目录的全部文件与结构")]},
    {"cells":[CELL("输出形式"),CELL("文本建议、代码片段"),CELL("文件写入、命令执行、结构化交付物")]},
    {"cells":[CELL("文件系统"),CELL("无访问权限"),CELL("具备读写权限（受配置约束）")]},
    {"cells":[CELL("命令执行"),CELL("无"),CELL("具备终端命令执行权限（受配置约束）")]},
    {"cells":[CELL("状态保持"),CELL("单轮文本对话"),CELL("会话级上下文，跨轮累积")]},
]
slides.append(slide("s-vs","01 · 概念建立","聊天应用 vs Code Agent",[
    TABLE("vs-t",96,196,1088,340,[1.3,2.1,2.6],rows,fontSize=16,
          cellPadX=16,cellPadY=12),
    R("vs-bar",96,560,1088,64,ACC_BG,stroke="none",sw=0,radius=12),
    T("vs-take",120,560,1040,64,"本质差异：Code Agent 具备 <b>文件 I/O 与命令执行层</b>，输出止于'可交付产物'，而非文本建议。",
      size=17,weight=600,color=ACCENT2,valign="middle",lh=1.4),
],"这张表是全课的认知锚点。逐行对比，强调'输入/输出边界'与'文件系统/命令执行权限'两行——这是 Agent 与 Chatbot 的分水岭。"))

# ============ 5. 架构对比 (composed diagram) + state drill-down ============
arch=[
    R("a5-grad",0,0,W,H,BG,stroke="none",sw=0,radius=0),
    # ---- left: chatbot ----
    T("a5-lh",96,196,420,24,"聊天应用",size=14,weight=700,color=MUTED,family=MONO,ls=2),
    R("a5-cu",116,250,140,56,PANEL,radius=12),
    T("a5-cut",116,250,140,56,"用户",size=17,weight=700,color=MAIN,align="center",valign="middle",lh=1),
    R("a5-cl",336,250,140,56,PANEL,radius=12),
    T("a5-clt",336,250,140,56,"大模型",size=17,weight=700,color=MAIN,align="center",valign="middle",lh=1),
    CONN("a5-e1","a5-cu","a5-cl",color=MUTED),
    CONN("a5-e2","a5-cl","a5-cu",color=MUTED),
    T("a5-l1",150,316,120,18,"文本",size=12,color=DIM,family=MONO,align="center"),
    T("a5-l2",322,316,120,18,"文本",size=12,color=DIM,family=MONO,align="center"),
    # divider
    R("a5-sep",556,196,2,360,BORDER2,stroke="none",sw=0,radius=0),
    # ---- right: code agent ----
    T("a5-rh",596,196,588,24,"Code Agent（opencode）",size=14,weight=700,color=ACCENT,family=MONO,ls=2),
    R("a5-au",616,250,120,56,PANEL,radius=12),
    T("a5-aut",616,250,120,56,"用户",size=16,weight=700,color=MAIN,align="center",valign="middle",lh=1),
    R("a5-al",808,250,120,56,PANEL,radius=12),
    T("a5-alt",808,250,120,56,"大模型",size=16,weight=700,color=MAIN,align="center",valign="middle",lh=1),
    R("a5-at",1000,250,140,56,PANEL2,stroke=ACCENT,sw=1,radius=12),
    T("a5-att",1000,250,140,56,"工具层",size=16,weight=700,color=ACCENT,align="center",valign="middle",lh=1,link="st-tech"),
    R("a5-afs",760,372,200,48,PANEL,radius=10),
    T("a5-afst",760,372,200,48,"文件系统",size=14,color=MAIN,align="center",valign="middle",lh=1),
    R("a5-acmd",976,372,200,48,PANEL,radius=10),
    T("a5-acmdt",976,372,200,48,"终端命令",size=14,color=MAIN,align="center",valign="middle",lh=1),
    CONN("a5-e3","a5-au","a5-al",color=MUTED),
    CONN("a5-e4","a5-al","a5-at",color=ACCENT,dash=True,march=True),
    CONN("a5-e5","a5-at","a5-afs",color=ACCENT,dash=True,march=True),
    CONN("a5-e6","a5-at","a5-acmd",color=ACCENT,dash=True,march=True),
    CONN("a5-e7","a5-acmd","a5-al",color=MUTED),
    T("a5-l3",650,316,110,18,"指令",size=12,color=DIM,family=MONO,align="center"),
    T("a5-l4",848,316,130,18,"工具调用",size=12,color=ACCENT,family=MONO,align="center"),
    T("a5-l5",1010,344,120,18,"读写 / 执行",size=12,color=ACCENT,family=MONO,align="center"),
    T("a5-lcap",96,344,420,40,"无执行层 —— 输出止于文本",size=14,color=DIM,lh=1.4,align="center"),
    R("a5-capbar",96,572,1088,64,PANEL2,stroke=BORDER,sw=1,radius=12),
    T("a5-cap",120,572,1040,64,"工具层 = 文件 I/O · 命令执行 · 检索。大模型输出工具调用，宿主程序执行后回填上下文。",
      size=16,color=MAIN,valign="middle",lh=1.4),
]
slides.append(slide("s-arch","01 · 概念建立","架构对比：工具执行层",arch,
    "左图：聊天应用是用户↔大模型的文本闭环。右图：Code Agent 多了'工具层'，大模型经工具层读写文件、执行命令。点击'工具层'节点展开技术原理。"))
# state slide: 技术原理
slides.append({"id":"st-tech","stateOf":"s-arch","background":BG,"transition":"morph","notes":
    "面向工程师的底层机制：function calling / tool use 协议。推理—执行—观测闭环。聊天应用缺执行层，故输出止于文本。",
    "elements":[
    R("st-bg",0,0,W,H,"#0B1014",stroke="none",sw=0,radius=0),
    T("st-k",96,80,800,24,"技术原理 · 面向工程师",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("st-t",96,112,900,56,"function calling / tool use 闭环",size=34,weight=800,color=MAIN,lh=1.1),
    R("st-rule",96,176,52,4,ACCENT,stroke="none",sw=0,radius=2),
    # loop nodes
    R("st-n1",96,250,260,90,PANEL,radius=12),
    T("st-n1t",96,270,260,50,"① 推理\n大模型输出结构化工具调用请求",size=15,color=MAIN,align="center",valign="middle",lh=1.4),
    R("st-n2",384,250,260,90,PANEL2,stroke=ACCENT,sw=1,radius=12),
    T("st-n2t",384,270,260,50,"② 执行\nopencode 解析并执行实际 I/O",size=15,color=ACCENT2,align="center",valign="middle",lh=1.4),
    R("st-n3",672,250,260,90,PANEL,radius=12),
    T("st-n3t",672,270,260,50,"③ 观测\n执行结果回填至上下文",size=15,color=MAIN,align="center",valign="middle",lh=1.4),
    R("st-n4",960,250,224,90,PANEL,radius=12),
    T("st-n4t",960,270,224,50,"④ 再推理\n基于新上下文继续",size=15,color=MAIN,align="center",valign="middle",lh=1.4),
    CONN("st-c1","st-n1","st-n2",color=ACCENT,dash=True,march=True),
    CONN("st-c2","st-n2","st-n3",color=ACCENT,dash=True,march=True),
    CONN("st-c3","st-n3","st-n4",color=ACCENT,dash=True,march=True),
    R("st-note",96,400,1088,200,PANEL,stroke=BORDER,sw=1,radius=14),
    T("st-notek",120,424,300,22,"关键区分",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("st-notet",120,456,1040,130,
      "• 宿主程序（opencode）持有文件系统与 shell 的访问权，是执行主体\n"
      "• 大模型本身不直接触碰文件系统 —— 它只产出调用意图\n"
      "• 由此带来可控点：权限配置（ask / allow）可逐工具拦截每一次执行",
      size=16,color=MAIN,lh=1.7),
    # dismiss
    R("st-dismiss",0,0,W,H,"rgba(0,0,0,0)",stroke="none",sw=0,radius=0,link="s-arch"),
    T("st-back",96,630,400,22,"← 返回",size=13,color=ACCENT,family=MONO,lh=1,link="s-arch"),
]})

# ============ 6. 技术定位 ============
cards6=[
    ("运行形态","终端 TUI 为主","另支持 Web 界面与命令行（headless）模式，可嵌入脚本与流水线"),
    ("模型无关","provider-agnostic","解耦大模型服务商；企业版登录后自动完成模型接入"),
    ("开源协议","代码可审计","可自托管，部署路径与数据流向可审计、可内网隔离"),
]
els6=[]
xs6=[96,470,844]
for i,(h,s,d) in enumerate(cards6):
    x=xs6[i]
    els6+=[card("p6c%d"%i,x,210,340,330),
           T("p6n%d"%i,x+24,238,40,24,"%02d"%(i+1),size=13,weight=700,color=ACCENT,family=MONO,ls=2),
           T("p6h%d"%i,x+24,272,292,30,h,size=22,weight=800,color=MAIN,lh=1.15),
           T("p6s%d"%i,x+24,312,292,28,s,size=14,weight=600,color=ACCENT2,family=MONO,lh=1.2),
           R("p6r%d"%i,x+24,350,40,3,ACCENT,stroke="none",sw=0,radius=2),
           T("p6d%d"%i,x+24,372,292,150,d,size=15,color=MUTED,lh=1.6)]
slides.append(slide("s-pos","01 · 概念建立","opencode 的技术定位",els6,
    "三点定位。重点第二点：模型无关 + 企业版登录自动配置，所以本课不涉及手动配模型。第三点开源/可自托管回应资深工程师对数据安全的关切。"))

# ============ 7. DIVIDER 02 ============
slides.append(divider("d2","02","能力与场景","回答核心疑问：opencode 在日常工作中能执行哪些任务、产出什么交付物。",
    "进入第二部分——本课重心。先讲五大核心能力，再落到六类通用场景与半导体产线的岗位映射。"))

# ============ 8. 核心能力清单 ============
rows8=[
    {"cells":[CELL("能力",bold=True),CELL("技术内涵"),CELL("工作中的对应操作")]},
    {"cells":[CELL("上下文感知"),CELL("以启动目录为工作区，加载文件树/代码/文档/配置"),CELL("无需粘贴，直接引用项目内任意文件")]},
    {"cells":[CELL("文件读写"),CELL("工作区内创建、修改、删除文件（受权限约束）"),CELL("改源码、生成脚本、产出文档")]},
    {"cells":[CELL("命令执行"),CELL("调用 shell 执行命令，捕获 stdout / stderr"),CELL("跑脚本、装依赖、查日志、运行测试")]},
    {"cells":[CELL("工具调用"),CELL("按协议调用检索、网络抓取等外部工具"),CELL("查 API 文档、抓取最新规范")]},
    {"cells":[CELL("会话管理"),CELL("跨轮保持上下文，支持压缩、续接、派生"),CELL("多轮迭代同一任务")]},
]
slides.append(slide("s-cap","02 · 能力与场景","核心能力清单",[
    TABLE("cap-t",96,196,1088,360,[1.3,2.7,2.3],rows8,fontSize=16,cellPadX=16,cellPadY=13),
    T("cap-note",96,572,1088,40,"这五项能力的组合，决定了它能产出'可交付产物'而非'文本建议'。",
      size=15,color=MUTED,lh=1.4),
],"五大能力。强调'上下文感知'是与聊天应用的本质差异，也是后续所有场景的前提。"))

# ============ 9. 上下文感知流程 (pipeline) ============
steps9=[("cd ~/work/my-project","进入项目目录"),
        ("opencode","启动，以此目录为工作区"),
        ("加载","文件树 · 代码 · 文档 · 配置"),
        ("注入 AGENTS.md","角色 · 术语 · 规范"),
        ("执行任务","基于真实上下文"),
        ("交付产物","文件 / 报告 / 脚本")]
nels9=[]
xpos9=[96,284,472,660,848,1036]; w9=148; y9=300; h9=92
nels9.append(T("fl9-h",96,196,1088,28,"以项目文件作为上下文来源，而非依赖用户文本输入",
    size=16,color=MUTED,lh=1.4))
# dashed marching path behind nodes (one horizontal line)
nels9.append(R("fl9-line",170,345,910,2,"rgba(45,212,191,0.35)",stroke=ACCENT,sw=2,radius=0,
    strokeStyle="dashed",fx={"loop":{"type":"dash-march","distance":14,"duration":1.6}}))
for i,(t,d) in enumerate(steps9):
    x=xpos9[i]
    fill=PANEL2 if i in (3,4) else PANEL
    nels9.append(R("fl9-n%d"%i,x,y9,w9,h9,fill,stroke=ACCENT if i in(3,4) else BORDER,sw=1,radius=12))
    nels9.append(T("fl9-nt%d"%i,x+8,y9+12,w9-16,34,t,size=13,weight=700,color=MAIN if i not in(3,4) else ACCENT2,
        family=MONO,align="center",lh=1.2))
    nels9.append(T("fl9-nd%d"%i,x+8,y9+48,w9-16,38,d,size=11,color=MUTED,align="center",lh=1.25))
nels9.append(T("fl9-cap",96,440,1088,40,"步骤 ①② 在终端完成；③④⑤⑥ 由 opencode 自动进行 —— 这就是'打开项目'的全部含义。",
    size=15,color=MUTED,lh=1.4))
slides.append(slide("s-ctx","02 · 能力与场景","上下文感知流程",nels9,
    "一条流水线讲清'打开项目'背后发生的事。虚线动效表示数据沿流程流动。强调③④是自动注入，用户无需手动粘贴。"))

# ============ 10. 六类通用场景 (grid) ============
sc=[("01","代码理解","梳理模块调用链与数据流","结构图 + 逐层说明"),
    ("02","代码修改 / 缺陷修复","定位根因并修复","修改后代码 + 变更说明"),
    ("03","脚本 / 自动化","批处理、批重命名、批转换","可执行脚本 + 说明"),
    ("04","资料检索","检索库当前版本 API 用法","带来源链接的资料"),
    ("05","数据分析","统计日志错误码频次","汇总表 / 图表 / 报告"),
    ("06","文档整理","依笔记生成 SOP / 报告","结构化文档")]
e10=[]; gx=[96,470,844]; gy=[210,420]
for i,(n,t,cmd,out) in enumerate(sc):
    x=gx[i%3]; y=gy[i//3]
    e10+=[card("sc%d"%i,x,y,340,196),
          T("scn%d"%i,x+22,y+22,60,28,n,size=15,weight=700,color=ACCENT,family=MONO,ls=1),
          T("sct%d"%i,x+22,y+54,296,30,t,size=19,weight=800,color=MAIN,lh=1.15),
          R("scr%d"%i,x+22,y+92,28,3,ACCENT,stroke="none",sw=0,radius=2),
          T("scc%d"%i,x+22,y+104,296,40,"▸ "+cmd,size=14,color=MUTED,lh=1.4),
          T("sco%d"%i,x+22,y+150,296,34,"产出："+out,size=13,color=ACCENT2,family=MONO,lh=1.3)]
slides.append(slide("s-scen","02 · 能力与场景","六类通用场景",e10,
    "六类场景覆盖绝大多数日常工程任务。每张卡给出'指令意图'和'交付物'，让听众知道每类任务能拿到什么。"))

# ============ 11. 半导体产线场景 ============
rows11=[
    {"cells":[CELL("岗位 / 任务",bold=True),CELL("opencode 可执行操作"),CELL("交付物")]},
    {"cells":[CELL("测试工程师 · ATE 日志"),CELL("读取机台 .log，提取 fail bin 与错误码，统计频次与时段分布"),CELL("错误码汇总表 + 异常时段定位")]},
    {"cells":[CELL("测试工程师 · 测试程序"),CELL("阅读测试程序（C/C++/向量文件），梳理测试项调用关系"),CELL("调用结构图 + 逐项说明")]},
    {"cells":[CELL("良率 / 数据工程师"),CELL("处理导出 CSV/数据表，按 lot、wafer、bin 维度统计"),CELL("良率分布表 + 图表")]},
    {"cells":[CELL("产品 / 应用工程师"),CELL("依据 datasheet / 测试规范生成检查清单与 SOP"),CELL("结构化文档")]},
    {"cells":[CELL("非编程岗"),CELL("整理会议纪要、周报，按指定模板排版"),CELL("排版后的报告")]},
]
slides.append(slide("s-semi","02 · 能力与场景","半导体产线场景示例",[
    TABLE("semi-t",96,196,1088,400,[1.7,3.0,2.1],rows11,fontSize=15,cellPadX=16,cellPadY=13),
    T("semi-note",96,614,1088,28,"按岗位映射 —— 帮助每位听众判断自己的接入点。",size=14,color=MUTED,lh=1.3),
],"本页直接对接听众岗位。逐行点名，请对应岗位同事认领，强调这些都是当天可上手的具体任务。"))

# ============ 12. 工时对比 (chart) ============
slides.append(slide("s-time","02 · 能力与场景","工时对比（参考量级）",[
    {"id":"time-chart","type":"chart","x":96,"y":210,"w":760,"h":400,"rotation":0,"opacity":1,
     "preset":"bar","fx":{"enter":"fade-up"},
     "option":{
        "color":[MUTED,ACCENT],
        "grid":{"top":40,"left":48,"right":16,"bottom":40},
        "xAxis":{"type":"category","data":["解析100MB日志","陌生项目加功能","纪要转报告"],
                 "axisLabel":{"fontSize":13,"color":MUTED},"axisLine":{"lineStyle":{"color":BORDER}}},
        "yAxis":{"type":"value",
                 "axisLabel":{"fontSize":12,"color":MUTED},"splitLine":{"lineStyle":{"color":BORDER2}}},
        "legend":{"show":True,"top":4,"textStyle":{"fontSize":14,"color":MAIN}},
        "series":[
            {"type":"bar","name":"传统流程","data":[45,240,60],"barWidth":26,"itemStyle":{"borderRadius":[4,4,0,0]}},
            {"type":"bar","name":"opencode","data":[5,40,5],"barWidth":26,"itemStyle":{"borderRadius":[4,4,0,0]}}
        ],
        "tooltip":{"trigger":"item","formatter":"{b}: {c} 分钟"}
     }},
    # side insight panel
    card("time-side",896,210,288,400),
    T("time-sh",920,236,240,24,"关键观察",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("time-st",920,268,240,60,"重复性、规则化任务的工时下降最显著",size=18,weight=700,color=MAIN,lh=1.3),
    R("time-sr",920,336,40,3,ACCENT,stroke="none",sw=0,radius=2),
    T("time-sd",920,356,240,240,
      "• 日志解析：脚本编写调试 → 一句指令\n"
      "• 陌生代码：通读架构 → Plan 先行\n"
      "• 文档排版：手动 → 模板化\n\n"
      "量级参考，实际取决于任务复杂度与上下文规模。",
      size=14,color=MUTED,lh=1.7),
],"用一张柱状图把'省了多少时间'可视化。传统流程（灰）vs opencode（青）。提醒：量级参考，非绝对值。"))

# ============ 13. DIVIDER 03 ============
slides.append(divider("d3","03","工作模式","Plan / Build —— 先规划后执行，降低文件写入与命令执行的误操作风险。",
    "进入第三部分：因为 opencode 能改文件、能执行命令，必须建立'先想后做'的工作模式。"))

# ============ 14. Plan / Build 工作流 ============
pb=[
    R("pb-req",96,210,200,60,PANEL,radius=12),
    T("pb-reqt",96,210,200,60,"提出需求",size=17,weight=700,color=MAIN,align="center",valign="middle",lh=1),
    R("pb-dia",376,200,150,80,WARN_BG,stroke=WARN,sw=1,radius=10),
    T("pb-diat",376,200,150,80,"复杂度?",size=16,weight=700,color=WARN,align="center",valign="middle",lh=1.2),
    CONN("pb-c1","pb-req","pb-dia",color=MUTED),
    # plan branch
    R("pb-plan",600,210,260,80,PANEL2,stroke=WARN,sw=1,radius=12),
    T("pb-planh",616,224,80,22,"PLAN",size=13,weight=700,color=WARN,family=MONO,ls=2),
    T("pb-plant",616,250,232,36,"只规划：拆解步骤 · 列涉及文件 · 评估方案，不改动文件",size=13,color=MAIN,lh=1.35),
    CONN("pb-c2","pb-dia","pb-plan",color=WARN),
    T("pb-lab1",436,176,180,16,"多文件 / 有风险",size=11,color=WARN,family=MONO,align="center"),
    # review
    R("pb-rev",936,210,180,80,PANEL,radius=12),
    T("pb-revt",936,210,180,80,"用户审核",size=15,weight=700,color=MAIN,align="center",valign="middle",lh=1.2),
    CONN("pb-c3","pb-plan","pb-rev",color=MUTED),
    # build
    R("pb-build",560,360,420,90,PANEL2,stroke=ACCENT,sw=1,radius=12),
    T("pb-buildh",580,376,90,22,"BUILD",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("pb-buildt",580,402,380,36,"按确认方案执行：写入文件 · 执行命令 · 验证结果",size=14,color=MAIN,lh=1.35),
    CONN("pb-c4","pb-rev","pb-build",color=ACCENT,dash=True,march=True),
    T("pb-lab2",996,300,160,16,"方案确认",size=11,color=ACCENT,family=MONO,align="center"),
    # direct build (simple tasks)
    CONN("pb-c5","pb-dia","pb-build",color=MUTED),
    T("pb-lab3",330,300,200,16,"单文件 / 查询类 → 直接 Build",size=11,color=DIM,family=MONO,align="center"),
    # result
    R("pb-res",560,500,420,56,ACC_BG,stroke="none",sw=0,radius=12),
    T("pb-rest",560,500,420,56,"验证交付物",size=17,weight=700,color=ACCENT2,align="center",valign="middle",lh=1),
    CONN("pb-c6","pb-build","pb-res",color=ACCENT),
    # legend
    R("pb-lg1",96,500,14,14,WARN_BG,stroke=WARN,sw=1,radius=3),
    T("pb-lg1t",118,496,300,22,"Plan = 推理，不产生变更",size=13,color=MUTED,lh=1.2,valign="middle"),
    R("pb-lg2",96,528,14,14,PANEL2,stroke=ACCENT,sw=1,radius=3),
    T("pb-lg2t",118,524,360,22,"Build = 执行，受权限约束",size=13,color=MUTED,lh=1.2,valign="middle"),
]
slides.append(slide("s-pb","03 · 工作模式","Plan / Build 工作流",pb,
    "决策流：复杂/有风险任务先 Plan 展示思路，审核通过再 Build；简单查询类直接对话。Tab 切换，右下角有指示器。决策准则：生产/敏感/不可逆必先 Plan。"))

# ============ 15. DIVIDER 04 ============
slides.append(divider("d4","04","配置与会话","AGENTS.md · Skill · 权限 · 会话管理 —— 让工具稳定、可控、可复用。",
    "进入第四部分：配置体系决定输出的专业度，会话管理决定上下文成本。"))

# ============ 16. 配置层级 + AGENTS.md ============
e16=[
    # left: hierarchy
    T("cf-lh",96,196,528,24,"配置层级",size=14,weight=700,color=ACCENT,family=MONO,ls=2),
    R("cf-g",96,236,528,76,PANEL,radius=12),
    T("cf-gh",116,250,200,20,"全局 ~/.config/opencode/",size=12,weight=700,color=ACCENT2,family=MONO,lh=1.2),
    T("cf-gd",116,274,490,30,"AGENTS.md — 个人偏好 · 跨项目习惯（仅本人）",size=13,color=MAIN,lh=1.3),
    R("cf-p",96,328,528,96,PANEL,radius=12),
    T("cf-ph",116,342,260,20,"项目（仓库根目录，随仓库提交）",size=12,weight=700,color=ACCENT2,family=MONO,lh=1.2),
    T("cf-pd",116,366,490,50,"• AGENTS.md — 团队规范 · 领域术语\n• opencode.json — 权限策略 · Skill 开关",size=13,color=MAIN,lh=1.5),
    R("cf-merge",96,444,528,56,ACC_BG,stroke="none",sw=0,radius=12),
    T("cf-merget",96,444,528,56,"合并为运行时上下文 → 注入会话",size=15,weight=700,color=ACCENT2,align="center",valign="middle",lh=1),
    CONN("cf-m1","cf-g","cf-merge",color=ACCENT,dash=True),
    CONN("cf-m2","cf-p","cf-merge",color=ACCENT,dash=True),
    T("cf-init",96,520,528,40,"提示：用 /init 引导式生成或更新 AGENTS.md，无需从零编写。",size=13,color=MUTED,lh=1.4),
    # right: AGENTS.md 4-segment template
    T("cf-rh",656,196,528,24,"AGENTS.md · 四段式模板",size=14,weight=700,color=ACCENT,family=MONO,ls=2),
]
segs=[("①","角色与背景","部门/岗位 · 专业身份 · 主要职责"),
      ("②","领域术语","术语定义，避免按通用语义误解"),
      ("③","代码与输出规范","语言/框架 · 健壮性 · 输出风格"),
      ("④","安全与约束","敏感环境先确认 · 红线")]
yy=236
for i,(n,h,d) in enumerate(segs):
    e16+=[card("cf-s%d"%i,656,yy,528,70),
          T("cf-sn%d"%i,676,yy+12,40,46,n,size=22,weight=800,color=ACCENT,family=MONO,valign="middle",lh=1),
          T("cf-sh%d"%i,728,yy+12,260,24,h,size=16,weight=700,color=MAIN,lh=1.2),
          T("cf-sd%d"%i,728,yy+38,440,24,d,size=12,color=MUTED,family=MONO,lh=1.3)]
    yy+=82
e16+=[T("cf-tip2",656,yy+2,528,30,"要点：只写'模型未知、但岗位必需'的信息。",size=12,color=DIM,lh=1.3)]
slides.append(slide("s-cfg","04 · 配置与会话","配置层级 与 AGENTS.md",e16,
    "左侧三层配置如何合并为运行时上下文。右侧 AGENTS.md 四段式模板——这是输出专业度的关键，团队应先统一一份。"))

# ============ 17. Skill + 权限 ============
rowsS=[
    {"cells":[CELL("Skill",bold=True),CELL("能力"),CELL("触发场景")]},
    {"cells":[CELL("web search"),CELL("联网检索"),CELL("查 API 文档、行业标准")]},
    {"cells":[CELL("planning"),CELL("结构化任务拆解"),CELL("复杂任务前置规划")]},
    {"cells":[CELL("review"),CELL("成果审查"),CELL("提交前自查")]},
    {"cells":[CELL("debugging"),CELL("系统化排错"),CELL("缺陷定位")]},
]
rowsP=[
    {"cells":[CELL("场景",bold=True),CELL("推荐策略")]},
    {"cells":[CELL("生产 / 重要数据 / 不可逆"),CELL("先 Plan 后 Build，permission=ask，逐条确认")]},
    {"cells":[CELL("共享主干分支"),CELL("谨慎操作，避免误改他人提交")]},
    {"cells":[CELL("沙盒 / 独立分支 / 实验"),CELL("可放开 allow，降低交互成本")]},
    {"cells":[CELL("不确定的命令"),CELL("先要求说明命令作用再批准")]},
]
slides.append(slide("s-skill","04 · 配置与会话","Skill 与 权限策略",[
    T("sk-h",96,196,528,24,"Skill · 按需加载的领域能力",size=14,weight=700,color=ACCENT,family=MONO,ls=2),
    TABLE("sk-t",96,232,528,300,[1.2,1.6,2.0],rowsS,fontSize=14,cellPadX=12,cellPadY=10),
    T("sk-note",96,546,528,40,"打包的'领域知识+操作流程'，平时不占上下文预算，用到才加载。",
      size=13,color=MUTED,lh=1.4),
    T("pm-h",656,196,528,24,"权限 · 默认访问控制层",size=14,weight=700,color=ACCENT,family=MONO,ls=2),
    TABLE("pm-t",656,232,528,300,[1.9,2.3],rowsP,fontSize=14,cellPadX=12,cellPadY=10),
    T("pm-note",656,546,528,40,"默认：写文件、执行命令前请求批准（ask）。可按工具精确配置。",
      size=13,color=MUTED,lh=1.4),
],"左：Skill 是领域能力扩展。右：权限是默认安全网——生产环境保持 ask，沙盒可放开。"))

# ============ 18. 会话管理 ============
e18=[
    T("se-h",96,196,1088,24,"会话 = 一次连续对话的完整上下文；上下文规模与时延、token 消耗正相关",size=15,color=MUTED,lh=1.4),
    # lifecycle nodes
    R("se-new",96,248,150,64,PANEL,radius=12),
    T("se-newt",96,248,150,64,"/new",size=18,weight=700,color=ACCENT,family=MONO,align="center",valign="middle",lh=1),
    R("se-run",330,240,260,80,PANEL2,stroke=ACCENT,sw=1,radius=12),
    T("se-runh",346,254,200,20,"会话运行",size=13,weight=700,color=ACCENT2,family=MONO,lh=1.2),
    T("se-rund",346,278,228,34,"上下文累积 · 多轮迭代",size=13,color=MAIN,lh=1.3),
    R("se-compact",676,248,170,64,PANEL,radius=12),
    T("se-compactt",676,248,170,64,"/compact",size=16,weight=700,color=ACCENT,family=MONO,align="center",valign="middle",lh=1),
    R("se-store",926,248,170,64,PANEL,radius=12),
    T("se-storet",926,248,170,64,"会话存储",size=15,weight=700,color=MAIN,align="center",valign="middle",lh=1),
    R("se-resume",926,340,170,64,PANEL,radius=12),
    T("se-resumet",926,340,170,64,"/sessions",size=16,weight=700,color=ACCENT,family=MONO,align="center",valign="middle",lh=1),
    CONN("se-c1","se-new","se-run",color=MUTED),
    CONN("se-c2","se-run","se-compact",color=ACCENT,dash=True,march=True),
    CONN("se-c3","se-compact","se-run",color=MUTED),
    CONN("se-c4","se-run","se-store",color=MUTED),
    CONN("se-c5","se-store","se-resume",color=MUTED),
    CONN("se-c6","se-resume","se-run",color=ACCENT,dash=True,march=True),
    T("se-l1",250,286,76,16,"新建",size=11,color=DIM,family=MONO,align="center"),
    T("se-l2",590,286,84,16,"膨胀→压缩",size=11,color=ACCENT,family=MONO,align="center"),
    # command table
    TABLE("se-tab",96,440,760,180,[1.1,1.3,2.4],[
        {"cells":[CELL("命令",bold=True),CELL("别名"),CELL("作用")]},
        {"cells":[CELL("/new"),CELL("/clear"),CELL("新建会话，清空当前上下文")]},
        {"cells":[CELL("/sessions"),CELL("/resume /continue"),CELL("列出历史会话，切换或续接")]},
        {"cells":[CELL("/compact"),CELL("/summarize"),CELL("压缩当前上下文为摘要")]},
    ],fontSize=14,cellPadX=12,cellPadY=10),
    card("se-side",896,440,288,180),
    T("se-sh",920,460,240,22,"决策口诀",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("se-sd",920,490,240,120,"• 任务结束 → /new\n• 未干完 → /sessions 续接\n• 变慢 → /compact\n• 跑偏 → /new 重来",
      size=14,color=MAIN,lh=1.7),
]
slides.append(slide("s-sess","04 · 配置与会话","会话管理",e18,
    "会话是上下文容器。/new 开新、/sessions 续接、/compact 压缩。右下口诀帮助记忆何时用哪条命令。"))

# ============ 19. DIVIDER 05 ============
slides.append(divider("d5","05","上手实践","安装 · 首个真实任务（日志统计 Demo）· 上手 Checklist。",
    "最后一部分：动手。今天完成安装、登录、打开项目、跑通第一个真实任务。"))

# ============ 20. 安装与启动 ============
inst=[("方式一 · 官方脚本","curl -fsSL https://opencode.ai/install | bash"),
      ("方式二 · Homebrew","brew install anomalyco/tap/opencode"),
      ("方式三 · npm 全局","npm install -g opencode-ai")]
e20=[]
yy=210
for i,(h,c) in enumerate(inst):
    e20+=[card("in%d"%i,96,yy,1088,70),
          T("inh%d"%i,120,yy+12,260,24,h,size=14,weight=700,color=ACCENT,family=MONO,lh=1.2),
          R("inc%d"%i,420,yy+16,740,38,PANEL2,stroke=BORDER2,sw=1,radius=8),
          T("inct%d"%i,436,yy+16,710,38,c,size=14,color=MAIN,family=MONO,valign="middle",lh=1)]
    yy+=84
# start block
e20+=[card("st",96,yy,1088,94,ACC_BG),
      T("sth",120,yy+12,260,24,"启动",size=14,weight=700,color=ACCENT2,family=MONO,lh=1.2),
      T("stc",120,yy+42,1040,46,"cd ~/work/my-project   #  进入工作区目录（代码库/数据/笔记均可）<br/>opencode                #  以该目录为工作区启动 · 登录企业账号即自动完成模型配置",
        size=14,color=MAIN,family=MONO,lh=1.5)]
slides.append(slide("s-install","05 · 上手实践","安装与启动",e20,
    "三选一安装。启动两步：cd 进项目目录、运行 opencode。企业版登录后模型自动配置，无需手动设置 API Key。"))

# ============ 21. Demo 日志统计 ============
e21=[
    T("dm-h",96,196,1088,26,"场景：提取日志错误行，按错误码统计频次，输出 Markdown 表格",size=15,color=MUTED,lh=1.4),
    # flow
    R("dm-n1",96,246,210,64,PANEL,radius=12),
    T("dm-n1t",96,246,210,64,"① cd 目录 + 启动",size=14,weight=700,color=MAIN,align="center",valign="middle",lh=1.2),
    R("dm-n2",336,246,210,64,PANEL2,stroke=WARN,sw=1,radius=12),
    T("dm-n2t",336,246,210,64,"② Plan 提交指令",size=14,weight=700,color=WARN,align="center",valign="middle",lh=1.2),
    R("dm-n3",576,246,150,64,PANEL,radius=12),
    T("dm-n3t",576,246,150,64,"③ 审核",size=14,weight=700,color=MAIN,align="center",valign="middle",lh=1.2),
    R("dm-n4",750,246,210,64,PANEL2,stroke=ACCENT,sw=1,radius=12),
    T("dm-n4t",750,246,210,64,"④ Build 执行",size=14,weight=700,color=ACCENT,align="center",valign="middle",lh=1.2),
    R("dm-n5",984,246,200,64,ACC_BG,stroke="none",sw=0,radius=12),
    T("dm-n5t",984,246,200,64,"⑤ 产出交付物",size=14,weight=700,color=ACCENT2,align="center",valign="middle",lh=1.2),
    CONN("dm-c1","dm-n1","dm-n2",color=MUTED),
    CONN("dm-c2","dm-n2","dm-n3",color=WARN),
    CONN("dm-c3","dm-n3","dm-n4",color=ACCENT,dash=True,march=True),
    CONN("dm-c4","dm-n4","dm-n5",color=ACCENT),
    # commands
    card("dm-cmd",96,340,1088,200),
    T("dm-cmdh",120,360,300,22,"分步指令",size=13,weight=700,color=ACCENT,family=MONO,ls=2),
    T("dm-cmdt",120,390,1040,140,
      "<b>第二步（Plan 模式）</b><br/>"
      "请读取当前目录下所有 .log 文件，提取 Error / ERROR / 错误行，<br/>"
      "按错误码统计频次，输出 Markdown 表格。先切到 Plan 模式说明处理思路。<br/><br/>"
      "<b>第三步（审核通过后切 Build）</b><br/>思路确认，切回 Build 模式执行。",
      size=14,color=MAIN,family=MONO,lh=1.6),
    R("dm-out",96,560,1088,60,PANEL2,stroke=BORDER,sw=1,radius=12),
    T("dm-outt",120,560,1040,60,"产出：每文件错误统计 + 频次汇总表 + 异常时段定位（全程无需复制粘贴日志）",
      size=14,color=ACCENT2,valign="middle",lh=1.4),
]
slides.append(slide("s-demo","05 · 上手实践","首个真实任务 · 日志统计 Demo",e21,
    "端到端走一遍 Plan→Build。重点：全程没复制日志内容——opencode 自己读文件。这就是上下文感知的价值。"))

# ============ 22. Checklist ============
ck=["安装 opencode（install 脚本 / brew / npm 三选一）",
    "登录企业账号（自动完成模型配置）",
    "进入真实项目目录启动 opencode",
    "/init 生成首个 AGENTS.md（先写角色 + 术语）",
    "提出一个项目相关问题，验证上下文感知",
    "Plan 模式规划一项小任务，确认后切 Build 执行",
    "走一遍 /new · /sessions · /compact",
    "完成一个真实任务（如日志统计 Demo）"]
e22=[]
col_x=[96,656]; row_y=[208,320,432,544]
for i,item in enumerate(ck):
    cx=col_x[i%2]; cy=row_y[i//2]
    e22+=[R("ck%d"%i,cx,cy,528,108,PANEL,stroke=BORDER,sw=1,radius=12),
          E("ckb%d"%i,cx+22,cy+22,40,40,ACC_BG,stroke=ACCENT,sw=1),
          T("ckn%d"%i,cx+22,cy+22,40,40,"%02d"%(i+1),size=15,weight=800,color=ACCENT,family=MONO,align="center",valign="middle",lh=1),
          T("ckt%d"%i,cx+80,cy+22,428,64,item,size=16,color=MAIN,lh=1.4,valign="middle")]
slides.append(slide("s-check","05 · 上手实践","上手步骤 Checklist",e22,
    "八步清单，照做即可在今天完成首个真实任务。建议现场跟着做完前 4 步。"))

# ============ 23. 总结 ============
slides.append({"id":"s-end","background":BG,"transition":"morph","notes":
    "收尾。一句话带走：opencode 是具备文件 I/O 与命令执行层的工程任务执行工具，不是聊天机器人。今天完成首个真实任务。",
    "elements":[
    R("end-grad",0,0,W,H,BG,stroke="none",sw=0,radius=0,
      fillGradient={"angle":135,"stops":[{"at":0,"color":"#0D1117"},{"at":1,"color":"#0A1416"}]}),
    E("end-glow",-260,260,900,900,"rgba(45,212,191,0.14)",opacity=1,
      fx={"ambient":"kenburns","ken":{"dir":"drift","scale":1.12,"duration":26}}),
    T("end-k",96,180,800,24,"总结",size=13,weight=700,color=ACCENT,family=MONO,ls=4),
    T("end-t",96,216,1088,150,"把对大模型的认知，<br/>从'聊天应用'推进到'<b>Code Agent</b>'。",
      size=46,weight=800,color=MAIN,lh=1.2),
    R("end-rule",96,400,160,4,ACCENT,stroke="none",sw=0,radius=2),
    # 3 takeaways
    T("end-tk1",96,440,360,24,"01 · 它是什么",size=12,weight=700,color=ACCENT,family=MONO,ls=2),
    T("end-tv1",96,466,360,80,"具备文件 I/O 与命令执行层的工程任务执行工具",size=16,color=MAIN,lh=1.5),
    T("end-tk2",470,440,360,24,"02 · 怎么用",size=12,weight=700,color=ACCENT,family=MONO,ls=2),
    T("end-tv2",470,466,360,80,"打开项目目录 → Plan 先审 → Build 执行",size=16,color=MAIN,lh=1.5),
    T("end-tk3",844,440,300,24,"03 · 今天",size=12,weight=700,color=ACCENT,family=MONO,ls=2),
    T("end-tv3",844,466,300,80,"完成首个真实任务，建立手感",size=16,color=MAIN,lh=1.5),
    T("end-foot",96,678,1088,18,"opencode · 工具使用入门 — 完",size=11,color=DIM,family=MONO,align="center",lh=1),
]})

# ---------- assemble ----------
doc={
    "format":"bento/slides","version":1,
    "title":"opencode 工具使用入门",
    "size":{"width":W,"height":H},
    "theme":{"background":BG,"color":MAIN,"accent":ACCENT,"fontFamily":SANS},
    "meta":{"author":"半导体工程团队","subject":"opencode 工具使用入门","event":"内部培训"},
    "slides":slides,
}

# validate JSON
js=json.dumps(doc,ensure_ascii=False)
json.loads(js)  # round-trip parse check

# escape < so the script block can never contain </script>
js_safe=js.replace("<","\\u003c")

html=open("opencode-getting-started.bento.html",encoding="utf-8").read()
new=re.sub(r'(id="bento-doc">)(.*?)(</script>)',
           lambda m: m.group(1)+js_safe+m.group(3),
           html,count=1,flags=re.S)
assert new!=html, "splice failed"
open("opencode-getting-started.bento.html","w",encoding="utf-8").write(new)
print("OK · slides:",len(slides),"· bytes:",len(new))
# report non-state slide count
print("non-state slides:",sum(1 for s in slides if "stateOf" not in s))
