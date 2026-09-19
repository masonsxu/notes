#!/usr/bin/env python3
"""生成 opencode 实战篇（ppt3）的练习数据。

固定随机种子，保证 materials/data/ 与 materials/reference/ 的数字一致。
改动 SEED 或批次参数后，必须重新核对参考报告（reference/report-w31-w34.md）的全部数字。

埋点设计（讲师须知，课堂上不提前告知学员）：
- w32：文件中间混入一行重复表头（数据行 301，其余批次 300）
  → 教"审核发现行数对不上 → 排查 → 纠偏重算"（讲义 3.3 / 3.4）
- w34：中心均值偏移（整体 CPK 远低于 1.33），且边缘 die 再 +5 mΩ
  → 教"异常批次标注置顶 + 边缘 die 单独列一节"（讲义第四部分）

用法：uv run --no-project scripts/gen_data.py
仅用标准库，无第三方依赖。
"""

from __future__ import annotations

import csv
import random
import statistics
from pathlib import Path

SEED = 20260831
USL = 50.0          # 接触电阻规格上限（mΩ），进阶篇口径沿用
GRID = 10           # die 网格 10×10
WAFERS = 3          # 每批次 3 片 wafer
HEADER = ["batch", "wafer_id", "die_x", "die_y", "rc_mohm"]

# (批次, 中心均值 mΩ, 标准差, 边缘 die 附加偏移, 是否埋重复表头)
BATCHES = [
    ("w31", 40.0, 2.0, 0.0, False),
    ("w32", 40.3, 2.0, 0.0, True),
    ("w33", 39.8, 2.0, 0.0, False),
    ("w34", 45.0, 2.4, 5.0, False),
]

BINS = [(36.0, 38.0), (38.0, 40.0), (40.0, 42.0), (42.0, 44.0),
        (44.0, 46.0), (46.0, 48.0), (48.0, 50.0), (50.0, float("inf"))]


def is_edge(x: int, y: int) -> bool:
    return x in (0, GRID - 1) or y in (0, GRID - 1)


def _is_number(v: str | None) -> bool:
    if v is None:
        return False
    try:
        float(v)
        return True
    except ValueError:
        return False


def gen_rows(rng: random.Random, label: str, mu: float, sd: float, edge_shift: float) -> list[list]:
    rows = []
    for w in range(1, WAFERS + 1):
        wafer_id = f"{label}-{w:02d}"
        for x in range(GRID):
            for y in range(GRID):
                v = rng.gauss(mu, sd) + (edge_shift if is_edge(x, y) else 0.0)
                rows.append([label, wafer_id, x, y, f"{v:.1f}"])
    return rows


def write_csv(path: Path, rows: list[list], plant_dup_header: bool) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(HEADER)
        if plant_dup_header:
            mid = len(rows) // 2
            w.writerows(rows[:mid])
            w.writerow(HEADER)  # 模拟导出工具重复写入的表头
            w.writerows(rows[mid:])
        else:
            w.writerows(rows)


def main() -> None:
    rng = random.Random(SEED)
    out_dir = Path(__file__).resolve().parents[1] / "materials" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    print("== 总览（剔除非数值行后的统计口径） ==")
    print("| batch | rows | mean | sd | >=50 | pct>=50 | cpk |")
    print("| --- | --- | --- | --- | --- | --- | --- |")
    summary: dict[str, dict] = {}
    for label, mu, sd, edge_shift, plant in BATCHES:
        rows = gen_rows(rng, label, mu, sd, edge_shift)
        path = out_dir / f"rc_{label}.csv"
        write_csv(path, rows, plant)

        vals = [float(r[4]) for r in rows]
        mean = statistics.fmean(vals)
        sdst = statistics.stdev(vals)
        over = sum(v >= USL for v in vals)  # 口径：达到或超过 USL 即计超规格
        cpk = (USL - mean) / (3 * sdst)
        edge_vals = [float(r[4]) for r in rows if is_edge(int(r[2]), int(r[3]))]
        ctr_vals = [float(r[4]) for r in rows if not is_edge(int(r[2]), int(r[3]))]
        summary[label] = dict(rows=len(rows), mean=mean, sd=sdst, over=over,
                              cpk=cpk, edge_mean=statistics.fmean(edge_vals),
                              ctr_mean=statistics.fmean(ctr_vals))
        print(f"| {label} | {len(rows)} | {mean:.2f} | {sdst:.2f} | {over} | "
              f"{over / len(vals):.1%} | {cpk:.2f} |")

    print("\n== w34 边缘 vs 中心 ==")
    s = summary["w34"]
    print(f"edge n=108 mean={s['edge_mean']:.2f}  center n=192 mean={s['ctr_mean']:.2f}  "
          f"gap={s['edge_mean'] - s['ctr_mean']:.2f}")

    print("\n== 分箱频次表（个数，剔除非数值行） ==")
    print("| 区间 (mΩ) | " + " | ".join(l for l, *_ in BATCHES) + " |")
    print("| --- | --- | --- | --- | --- |")
    file_vals = {}
    for lbl, *_ in BATCHES:
        with (out_dir / f"rc_{lbl}.csv").open(encoding="utf-8") as f:
            file_vals[lbl] = [
                float(r["rc_mohm"]) for r in csv.DictReader(f)
                if _is_number(r.get("rc_mohm"))
            ]
    for lo, hi in BINS:
        counts = [sum(1 for v in file_vals[lbl] if lo <= v < hi) for lbl, *_ in BATCHES]
        tag = f"{lo:.0f}–{hi:.0f}" if hi != float("inf") else f"≥{lo:.0f}"
        print(f"| {tag} | " + " | ".join(str(c) for c in counts) + " |")

    # 校验埋点
    print("\n== 校验 ==")
    checks = [
        ("文件行数 w31/w33/w34 = 300", all(summary[l]["rows"] == 300 for l in ("w31", "w33", "w34"))),
        ("w32 文件含 301 行数据（重复表头已埋）", summary["w32"]["rows"] == 300 and _w32_file_rows(out_dir) == 301),
        ("正常批次均值在 39–41.5", all(39 <= summary[l]["mean"] <= 41.5 for l in ("w31", "w32", "w33"))),
        ("正常批次 CPK > 1.5", all(summary[l]["cpk"] > 1.5 for l in ("w31", "w32", "w33"))),
        ("正常批次超 50 占比 ≤ 1%", all(summary[l]["over"] / 300 <= 0.01 for l in ("w31", "w32", "w33"))),
        ("w34 均值 > 46", summary["w34"]["mean"] > 46),
        ("w34 CPK < 0.5", summary["w34"]["cpk"] < 0.5),
        ("w34 超 50 占比 > 10%", summary["w34"]["over"] / 300 > 0.10),
        ("w34 边缘比中心高 4–6.5", 4 <= summary["w34"]["edge_mean"] - summary["w34"]["ctr_mean"] <= 6.5),
    ]
    ok = True
    for name, passed in checks:
        print(("[PASS] " if passed else "[FAIL] ") + name)
        ok = ok and passed
    raise SystemExit(0 if ok else 1)


def _w32_file_rows(out_dir: Path) -> int:
    with (out_dir / "rc_w32.csv").open(encoding="utf-8") as f:
        return sum(1 for _ in f) - 1  # 减去首行表头


if __name__ == "__main__":
    main()
