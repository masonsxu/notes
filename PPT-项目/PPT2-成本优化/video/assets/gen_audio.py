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
        "大家好，欢迎参加 CIMICode 进阶培训。这一讲的主题是「用好大模型」。"
        "基础入门教的是怎么开通和上手，而进阶要解决的核心问题是：从「会聊」，升级到「用好」，"
        "让团队真正发挥大模型的价值。本课面向组长和资深工程师，配套第一讲一起看。"
    ),
    2: (
        "先看导览。团队不缺工具，缺的是「用好」的方法论和规范。常见的痛点有三个："
        "输出不稳定、重复造轮子、水平参差不齐。本课用「五板斧」来破局："
        "选对模型、配好 AGENTS.md、写好 Prompt、用对工作流与工具，最后是团队规范落地。"
        "目标是把「个人会用」升级成「团队用好」。"
    ),
    3: (
        "第一板斧，选对模型。原则很简单：够用即可，不盲目上高阶。"
        "日常默认就用 DeepSeek Flash，成本极低、响应快，能覆盖绝大多数任务。"
        "只有在三种情况下才升高阶模型：多次改代码仍未解决、逻辑推理陷入死循环，或者长文档和海量对比任务。"
        "记住，选型不是越强越好，把深度推理能力留给真正复杂的任务。"
    ),
    4: (
        "第二板斧，配好 AGENTS.md。它的作用是让大模型秒懂半导体专业语义，从第一次响应就理解术语，避免望文生义。"
        "一份完整的配置分四段：角色背景、术语上下文、编码与回复风格，以及安全约束。"
        "比如告诉它你是 TD 测试工程师，熟悉 CPK、DOE、SECS-GEM 这些词，它就不会再按通用语义去猜。"
    ),
    5: (
        "AGENTS.md 支持全局和项目级双层配置。全局配置放在用户主目录下，对所有项目打底；"
        "项目级配置放在项目目录里，只对当前项目生效，而且同名内容会覆盖全局。"
        "项目级可以写明这次具体测什么、机型是什么、数据放在哪个目录。"
        "这样通用规范一次写好，项目细节随用随加，团队就不再各写各的了。"
    ),
    6: (
        "第三板斧，写好 Prompt。黄金法则是：信息越具体，输出越准确。"
        "举个例子，如果你只说「帮我排查这个测试机报错」，大模型不知道机台型号、不知道日志在哪，"
        "只能给出一套通用的排查步骤。但如果你给全机台、错误码、坐标范围和日志路径，"
        "它就能输出可以直接运行的分析脚本。模糊指令得通用答案，具体指令得可用结果。"
    ),
    7: (
        "为了让提问更稳定，可以用「背景、目标、约束、输入、输出」这套五段式框架。"
        "背景说清场景和技术栈，目标说清要什么，约束说清限制，输入给数据位置，输出指定格式。"
        "再配合三个技巧：提供示例、分步骤下指令、一次性说清输出格式。"
        "团队统一用这套框架，输出质量和一致性都能稳定提升。"
    ),
    8: (
        "第四板斧，用对工作流和工具。复杂任务一定要先走 Plan 模式，分五步：理解需求、拆解任务、设计架构、评估风险，"
        "最后生成一份 TODO 清单。工程师审核通过后，再进入 Build 自动落地。"
        "Plan 的价值是让「做不做、怎么做」先想清楚，减少返工，复杂项目也能稳步推进。"
    ),
    9: (
        "工具方面，有两个 Skill 是团队必备的。第一个是 Grill-Me，需求澄清助手，它会用五类反问帮你把需求问全。"
        "第二个是 Web Search，联网搜索，用来查最新的 API 文档、库版本、行业最佳实践和标准更新。"
        "Grill-Me 把模糊需求变完整，Web Search 把过时知识变最新，两个 Skill 让团队真正用好工具。"
    ),
    10: (
        "进入场景实战。第一个高价值场景是 DOE 实验设计。关键是「喂对数据」。"
        "数据输入有三种方式：读项目文件、粘贴关键数据，或者提供文件路径。"
        "把测试数据加上失效机制一起喂给大模型，它就能直接产出可执行的实验矩阵，DOE 的周期会显著缩短。"
    ),
    11: (
        "第二个场景是技术调研和头脑风暴。遇到经验型难题、没有思路时，可以这么用："
        "比如探针针尖磨损导致虚焊，让大模型检索工业界的主流方案，列五个头脑风暴方向，对比利弊和成本，给出推荐路径。"
        "明确失效机制、要求多方案对比、要求决策维度，大模型就能把「没思路」变成一份可决策的清单。"
    ),
    12: (
        "第三个场景，复杂系统一句话起步。比如要做一个测试数据自动化分析平台，"
        "用一句话把五项需求讲清楚，进入 Plan 模式，大模型自动拆解出架构和分阶段计划。"
        "确认后 Build 会自动建目录、写代码、跑测试、出报告。"
        "复杂系统不必从零手敲，Plan 加 Build 能把「周级」开发压缩到「天级」。"
    ),
    13: (
        "第四个场景是知识沉淀。让大模型把散落在个人脑子里的经验，整理成团队可查的文档。"
        "比如整理一份探针台常见报错排查手册，或者测试 SOP、培训材料、可复用脚本库。"
        "人走了知识留下 —— 排查手册和脚本库让新人快速接班，团队不再依赖单点。"
    ),
    14: (
        "提效方面有两招。第一是 Auto-Approve 自动执行，个人开发环境可以放开，"
        "但产线数据库删除、线上配置修改这类操作，严禁全局免确认，用完也要及时关闭。"
        "第二是会话复用：保存常用对话模板、利用会话历史延续讨论、方向错了果断重启。"
        "把团队的重复输入清零，才能把时间花在判断和决策上。"
    ),
    15: (
        "团队规范这一页解决的是水平参差问题。四条做法："
        "统一部门级 AGENTS.md，让输出一致；共享 Prompt 模板库，把高频任务沉淀下来；"
        "定期开经验分享会，扩散好案例和踩坑；建立代码审查机制，AI 生成的代码也要走 review。"
        "规范不是限制，而是放大器，让新人的起点就是团队的最高水平。"
    ),
    16: (
        "团队落地分四个阶段渐进推进。Phase 1 基础建设，前两周搞定权限、安装和统一配置；"
        "Phase 2 技能培训，第 3 到 4 周组织培训和建立反馈机制；"
        "Phase 3 深度应用，第 5 到 8 周推广 Plan-Build、建立脚本库、沉淀文档；"
        "Phase 4 持续优化，长期复盘和迭代。先把基建和规范立起来，再推深度场景。"
    ),
    17: (
        "怎么判断团队真的「用好」了？不要看抽象的百分比，而看可观察的信号。"
        "比如 Plan-Build 的采用率、脚本和模板的复用数、AGENTS.md 配置的完整度、新人独立上手速度、"
        "知识沉淀量，以及问题复现率的下降。这些信号都可观察、可统计，持续向好就是团队在进步的证据。"
    ),
    18: (
        "最后做个收束。五板斧加四阶段，就是让全团队用好大模型的完整路径。"
        "立即行动起来：本周统一部门级 AGENTS.md，下周完成全员 Skill 安装，第 4 周分享首批最佳实践。"
        "入门教开通上手看第一讲，进阶用好看本课，实践落地看第三讲。感谢大家的收听！"
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
