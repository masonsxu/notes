#!/usr/bin/env python3
"""Generate narration audio + captions for all 17 slides using edge-tts.
Mature male voice: zh-CN-YunjianNeural."""
import json
import os
import re
import subprocess
import sys

VOICE = "zh-CN-YunjianNeural"
RATE = "-6%"  # slightly slower for a measured, mature delivery
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)))

# Per-slide narration. Keyed by slide number.
NARRATION = {
    1: (
        "大家好，欢迎参加 CIMICode 实践分享。这一讲是「大模型实践落地」。"
        "前两讲分别教了怎么开通上手、怎么用好，这一讲要解决的是：怎么把这些能力真正复现出来。"
        "我们以「用大模型做出咨询级 PPT」为案例，把从文字材料到成品的全流程，一步步拆给你看。新人照着做，效果一致。"
    ),
    2: (
        "先说一个真相：直接让大模型做 PPT，几乎一定会翻车。常见的翻车有三种。"
        "第一种是模板化，默认的卡片堆叠，缺乏咨询级的层级和密度。"
        "第二种是不可编辑，它把文字烘焙成图片，没法改也没法复用。"
        "第三种是内容失真，AI 会编造数据，或者把预估当成实测成果。"
        "我们的解法是一套七步的工程化流程，把「碰运气」变成「可复现」。"
    ),
    3: (
        "在动手之前，先重塑三个认知。第一，大模型的价值在于「端到端动手」——"
        "它不只是聊天，而是能读文件、写代码、生成 PPT、渲染、自检、迭代，把活真正干完。"
        "第二，环境能力决定方法路径，有没有图像生成、有没有渲染器，直接决定你能用哪套流程。"
        "第三，降级不等于失败，跳过某一步没关系，关键是如实告知、留痕、用替代方案保证交付。"
    ),
    4: (
        "环境准备这一步，核心是先打通渲染链路再动手。我们的链路是三段：用 bun 加 pptxgenjs 生成 PPTX，"
        "用 LibreOffice 把 PPTX 转成 PDF，再用 PyMuPDF 把 PDF 切成每页 PNG。"
        "这里有个大坑：LibreOffice 只能直接导出首页的 PNG，多页必须先转 PDF 再用 PyMuPDF 切。"
        "环境核查是动手前的动作，链路没打通就开工，必然中途卡死。"
    ),
    5: (
        "整个流程是七步。第一步证据分析和逐页大纲，第二步用八张样张选风格，第三步环境核查和降级决策，"
        "第四步搭共享视觉模块，第五步做三页风格验证，第六步生产加渲染 QA 加自检，第七步方向纠偏。"
        "每一步都有确认门或自检，把不确定性逐步消除。这是一套「防翻车」的流程。"
    ),
    6: (
        "第一步，分析。别急着画，先建证据表、写 SCR、定逐页大纲。"
        "证据表的纪律是：每条事实都标来源，不用常识补数据，冲突如实标注，数字标置信度。"
        "然后收敛成 SCR，也就是「背景-冲突-方案」，再定逐页大纲。"
        "这里有一个关键的第一道确认门，必须一次性确认故事线、页数、逐页论点、信息密度，以及开放的数据冲突。"
        "注意，不能只在页标题层面确认，否则后面一定返工。"
    ),
    7: (
        "第二步，风格。风格不是配色，而是色板、网格、层级、图表语言的整套系统。"
        "我们的做法是直接发八张样张让你选。从经典深红、冷灰勃艮第，到象牙白配深蓝等等。"
        "我们最终选了风格 4，象牙白加深蓝，专为科技和 AI 设计。"
        "锁定之后，色板、十五级字号、字体、页眉页脚、图表语言就全部固定，整个系列共用一套视觉系统。"
    ),
    8: (
        "第三步，核查。这也是本会话的关键转折点。我们核查发现：环境里没有图像生成能力，没法生成逐页的位图蓝图。"
        "于是我们如实降级，跳过 ImageGen 蓝图，并留下 imagegen_skipped 的痕迹，改用 PptxGenJS 原生生产加 LibreOffice 渲染 QA。"
        "降级有三条原则：如实告知哪道门无法满足、给出可选方案、留痕继续。"
        "环境限制不是死局，关键是不假装、留痕迹、用替代方案把活交付。"
    ),
    9: (
        "第四步，模块。我们把选定的风格固化成一个 theme.js，多份 PPT 共用一套系统，改一处全套跟着变。"
        "它包含色板、十五级 Typography Scale、字体，以及一堆元素函数，比如加标题、加页脚、加 KPI、加表格。"
        "每一页都用这些函数搭起来，风格就绝不漂移。模块化是「可复现」的关键，风格写进代码，不靠手调。"
    ),
    10: (
        "第五步，验证。先做三页代表性的样张：封面页、内容页、表格页，分别代表字体留白、KPI 和卡片密度、表头和代码块样式。"
        "渲染成 PNG 交给人工审核，通过后再批量生产。"
        "这一步是「风险闸门」，用最小成本确认视觉执行。本会话里 PPT1 的连线遮挡、PPT2 的方向错误，都是做出来才发现，如果先验证就能更早暴露。"
    ),
    11: (
        "第六步，生产。每份 PPT 都走一个循环：用 bun 生成 PPTX，用 render.sh 渲染每页 PNG，"
        "再用 python 做结构自检，查零尺寸和越界，最后渲染图发人工审核，有问题就修。"
        "结构自检脚本是复现的必备，遍历每个形状量坐标，宽高为零或超出画布就报警。用脚本查，不靠肉眼，又快又准。"
        "生产不是生成完就交，渲染、自检、人审三道关，才保证每页都合格。而且全程原生对象、零图片，完全可编辑。"
    ),
    12: (
        "第七步，纠偏，这也是本会话最重要的教训。PPT2 第一版是按源材料标题做的「成本优化」，"
        "但用户反馈说：成本不是我要操心的，我要让团队更好地使用。于是我们立即重写为「用好大模型加团队落地」。"
        "三条经验：源材料标题不等于真实意图，要挖到真实目的；重写前要先确认新结构，避免二次跑偏；方向错了就推翻重来，别在小修小补上浪费时间。"
    ),
    13: (
        "把这整套实践提炼成方法论，一共六条。证据表先行、确认门要重、先验证再量产、结构自检、局限要诚实、错了果断重写。"
        "这六条是「防翻车的护栏」，每一条都来自本会话的真实教训。"
    ),
    14: (
        "再给一份避坑指南，把本会话踩过的七个坑和解法列出来。"
        "比如直接让做 PPT 会模板化，解法是先做证据分析和大纲；LibreOffice 只能导首页 PNG，解法是走 PDF 再用 PyMuPDF 切页；"
        "缺图像生成硬撑，解法是如实降级留痕；不验证就量产，解法是先做三页样张；"
        "生成完就交，解法是渲染加自检加人审；确认门太轻，解法是故事线和密度一次确认；方向错了还修补，解法是果断重写。"
        "踩坑不可怕，记下来、有解法，新人就能直接绕过。"
    ),
    15: (
        "最后给一份复现指南，分六个阶段，勾选式推进。"
        "A 准备：装好工具、跑环境核查、准备文字材料；B 分析：建证据表、选故事线、写大纲、确认门拍板；"
        "C 定风格：展示样张、选定风格、锁色板字体；D 模块加验证：写视觉模块、做三页样张、渲染确认；"
        "E 生产：逐页搭建、渲染自检、人审定稿；F 校准：方向不对就确认新结构、果断重写、删掉旧版。"
        "Checklist 把经验变成步骤，新人照着勾就能走完全程。"
    ),
    16: (
        "实战的成果是两份可编辑的咨询级 PPT。"
        "PPT1《公司大模型工具使用入门》，17 页，面向新人，手把手教学；"
        "PPT2《用好大模型：进阶与团队落地》，18 页，面向组长和资深工程师，讲团队赋能。"
        "两份共用同一套流程和风格，还沉淀出了可复用资产：theme.js 视觉模块、render.sh 渲染脚本、build 模板。"
        "改文案、换主题、加页数都能复用这套资产，这就是「实践落地」的真正价值。"
    ),
    17: (
        "做个收束。一句话总结：大模型不是聊天机器人，而是「能动手的助理」。"
        "用工程化方法——证据分析、风格锁定、环境核查、模块化生产、渲染 QA、方向纠偏——把它变成可复现的生产力。"
        "立即行动起来：装好环境打通渲染链路，用一份小材料跑通七步流程，把 theme.js 存成团队资产，沉淀你自己的踩坑清单。"
        "入门教开通上手、进阶教用好赋能、实践落地教复现方法，三份合起来是一套完整的团队能力建设。感谢大家的收听！"
    ),
}



def parse_vtt_captions(vtt_path):
    """Parse a WebVTT file into list of {text, start, end} cues (in seconds)."""
    cues = []
    if not os.path.exists(vtt_path):
        return cues
    with open(vtt_path, encoding="utf-8") as f:
        content = f.read()
    blocks = re.split(r"\n\s*\n", content.strip())
    for block in blocks:
        lines = [ln for ln in block.strip().splitlines() if ln.strip()]
        if len(lines) < 2:
            continue
        # find the timestamp line
        ts_idx = None
        for i, ln in enumerate(lines):
            if "-->" in ln:
                ts_idx = i
                break
        if ts_idx is None:
            continue
        m = re.search(
            r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)",
            lines[ts_idx],
        )
        if not m:
            continue
        start = (
            int(m.group(1)) * 3600
            + int(m.group(2)) * 60
            + int(m.group(3))
            + float("0." + m.group(4))
        )
        end = (
            int(m.group(5)) * 3600
            + int(m.group(6)) * 60
            + int(m.group(7))
            + float("0." + m.group(8))
        )
        text = " ".join(lines[ts_idx + 1 :]).strip()
        # strip simple HTML if any
        text = re.sub(r"<[^>]+>", "", text)
        if text:
            cues.append({"text": text, "start": round(start, 3), "end": round(end, 3)})
    return cues


def get_duration(mp3_path, ffprobe):
    out = subprocess.run(
        [ffprobe, "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", mp3_path],
        capture_output=True, text=True,
    )
    return float(out.stdout.strip())


def main():
    import tempfile

    out_dir = os.path.join(OUT, "audio")
    os.makedirs(out_dir, exist_ok=True)
    ffprobe = os.path.join(os.path.dirname(OUT), ".bin", "ffprobe")

    manifest = []
    cursor = 0.0
    gap = 0.45  # pause between slides (s)

    for slide in range(1, len(NARRATION) + 1):
        text = NARRATION[slide]
        mp3 = os.path.join(out_dir, f"{slide:02d}.mp3")
        vtt = os.path.join(out_dir, f"{slide:02d}.vtt")
        if os.path.exists(mp3) and os.path.exists(vtt):
            print(f"[{slide:02d}] audio exists, parsing captions...", flush=True)
        else:
            print(f"[{slide:02d}] generating audio...", flush=True)
            r = subprocess.run(
                ["uvx", "--quiet", "edge-tts",
                 "--voice", VOICE, f"--rate={RATE}",
                 "--text", text,
                 "--write-media", mp3,
                 "--write-subtitles", vtt],
                capture_output=True, text=True,
            )
            if r.returncode != 0:
                print("ERROR:", r.stderr[-500:], file=sys.stderr)
                sys.exit(1)
        dur = get_duration(mp3, ffprobe)
        captions = parse_vtt_captions(vtt)
        manifest.append({
            "slide": slide,
            "audioStart": round(cursor, 3),
            "audioDuration": round(dur, 3),
            "sceneStart": round(cursor - 0.15, 3),  # visuals lead audio slightly
            "sceneDuration": round(dur + 0.6, 3),
            "narration": text,
            "captions": captions,
        })
        cursor += dur + gap

    total = cursor - gap
    out = {
        "voice": VOICE,
        "rate": RATE,
        "totalDuration": round(total, 3),
        "slides": manifest,
    }
    with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\nTotal duration: {total:.1f}s ({total/60:.1f} min)")
    print(f"Wrote {out_dir}/manifest.json")


if __name__ == "__main__":
    main()
