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
        "大家好，欢迎参加 CIMICode 内部培训。今天我们来学习公司大模型工具的使用入门。"
        "这节课的目标，是让新人在一天之内，从开通权限，到独立上手，完成第一个真实任务。"
    ),
    2: (
        "先看整体导览。公司已经就位了四款大模型、三种使用形态，以及一套完整的工作流。"
        "本课分五段递进：申请权限、安装工具、配置人设、掌握工作流，最后守住安全红线。"
        "走完这五步，新人就能独立干活。"
    ),
    3: (
        "第一部分，资源总览。公司提供四款模型，按成本和能力分层。"
        "新人的选择非常简单：默认使用 DeepSeek v4 Flash。它成本极低、响应快，能覆盖日常约百分之八十的场景。"
        "只有遇到复杂逻辑、深度排查或长文处理，再切换到 Pro、GLM 或 Kimi。"
        "记住口诀：日常默认 Flash，搞不定再升级。"
    ),
    4: (
        "模型就绪后，还有三种使用形态。桌面版负责日常开发和可视化，终端版负责机台和服务器自动化，Web 版作为轻量补充。"
        "对 TD Testing 来说，桌面版加终端版是主力，因为我们的工作强依赖本地代码库和机台数据。"
        "安装也很简单，终端版一条 npm 命令就能搞定。"
    ),
    5: (
        "第二部分，权限与安装。第一步是申请 Coding 权限，在 CIMICode 维护群发起，一次到位。"
        "强烈建议全员直接申请 Coding 权限，而不是非 Coding。"
        "因为 TD 的日常工作，比如日志解析、自动化脚本、SECS/GEM 对接，都依赖本地代码库。"
        "Coding 权限能挂载本地工作区，灵活性远超纯网页版。"
    ),
    6: (
        "权限拿到后，开始安装工具。桌面版在 macOS 或 Windows 下载安装包，双击安装，登录公司账号即可。"
        "终端版则执行一条命令全局安装 cimicode-tui，然后进入项目目录直接启动。"
        "两个都装上，按场景灵活切换。"
    ),
    7: (
        "第三部分，核心概念。理解四个关键词，才算真正会用 CIMICode。"
        "第一，AGENTS.md，管系统人设和规则；第二，Model，也就是模型，管能力大小；"
        "第三，Plan 和 Build，是执行模式，先规划再落地；第四，Skills 和 Tools，是外挂能力。"
        "四者配合，大模型才真正懂事。"
    ),
    8: (
        "重点讲一下 Plan 和 Build 工作流。复杂任务一定要先用 Plan 模式。"
        "Plan 只思考、不改动代码，它会拆解步骤、设计架构、评估风险，生成一份待办清单。"
        "工程师确认没问题后，再切换到 Build 模式自动落地，避免大模型盲目改代码。"
        "记住：先想清楚，再动手。"
    ),
    9: (
        "第四部分，工作场景。大模型到底能帮 TD 做什么？答案是六大场景："
        "文件与邮件处理、编写 SOP 和 PPT、脚本开发与自动化、实验设计、数据分析与可视化，还有技术知识问答。"
        "把重复劳动交给大模型，工程师聚焦在判断和决策上。"
    ),
    10: (
        "看两个实际演示。第一个，文件邮件整理：一句指令，读取报错日志，提取错误码和频次，整理成表格，还能草拟产线回复邮件。"
        "第二个，自动化代码：让大模型写一个 Python 脚本，解析测试数据，自动计算 CPK 和良率，把异常晶圆标红导出。"
        "指令到输出，闭环跑通，新人当天见效。"
    ),
    11: (
        "还有两个演示。第三个，编写测试 SOP：把机台驱动代码喂给大模型，它能生成完整的标准操作规程，附带常见问题排查。"
        "第四个，制作 PPT 大纲：一句话描述目标受众，大模型就给出结构化大纲和建议图表。"
        "文档和汇报材料的生产周期，从半天压缩到了分钟。"
    ),
    12: (
        "最后两个演示。第五个是实验设计：基于测试数据，结合失效机制，设计多因子实验，优化工艺参数。"
        "第六个是技术调研：针对探针磨损这类难题，检索整理工业界主流方案，给出可执行的对比清单。"
        "从数据到实验方案，从难题到决策路径，大模型把经验型难题变成了可执行清单。"
    ),
    13: (
        "第五部分，配置 AGENTS.md。它放在用户主目录下，配置一次，全局永久生效。"
        "核心是三段：角色背景、术语上下文、还有编码与回复风格。"
        "比如告诉大模型你是半导体测试工程师，熟悉 SECS/GEM 协议，它就能正确理解术语。"
        "不配置，它只能按通用语义去猜。"
    ),
    14: (
        "再讲两个必备技能。第一个是 Grill-Me，需求澄清助手。"
        "新人不知道怎么提需求时，它会反问你数据格式、阈值、输出格式，帮你把问题问对。"
        "第二个是 Web Search，联网搜索。大模型训练数据有截止日期，查最新文档、行业标准更新，都靠它。"
        "这两个技能，补齐了新人最常踩的两个坑。"
    ),
    15: (
        "第六部分，权限与安全。自动确认能大幅提升效率，但必须按环境分级。"
        "个人开发环境、独立分支、沙盒测试，可以放心开启。"
        "但产线机台、线上配置文件，严禁全局免确认。"
        "效率和安全不冲突：个人环境放开提效，产线系统一步一确认，红线绝不碰。"
    ),
    16: (
        "第七部分，常见问题。安装失败，先查网络和内网，再确认 Coding 权限。"
        "回答不准，检查人设配置，用 Grill-Me 厘清需求。"
        "令牌消耗太快，日常切回 Flash 模型，避免粘贴大量原始数据。"
        "新人踩坑不用慌，按这三条路径逐一排查。"
    ),
    17: (
        "最后是一份上手清单，建议当天完成。一共八步：申请权限、安装工具、配置人设、安装两个技能、"
        "打开真实项目、完成一个简单任务，最后用 Plan 和 Build 完成一个复杂任务。"
        "照着走，今天就能交付第一个成果。进阶学习请看第二讲，解决用得起、用得好的问题。感谢大家的收听！"
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

    for slide in range(1, 18):
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
