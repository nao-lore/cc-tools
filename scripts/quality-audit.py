#!/usr/bin/env python3
"""Score deployed tools and produce a prioritized quality-improvement report."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
from statistics import mean


ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "app"
TOOLS_DIR = ROOT / "tools"
REPORT_DIR = ROOT / "reports"
TOOLS_CONFIG = ROOT / "lib" / "tools-config.ts"


ENTRY_RE = re.compile(
    r'\{\s*slug:\s*"(?P<slug>[^"]+)",\s*name:\s*"(?P<name>[^"]+)",\s*'
    r'description:\s*"(?P<description>[^"]*)",\s*market:\s*"(?P<market>[^"]+)",\s*'
    r'category:\s*"(?P<category>[^"]+)"',
)


@dataclass(frozen=True)
class Check:
    key: str
    label: str
    weight: int
    pattern: str


CHECKS = [
    Check("metadata", "page metadata", 6, r"export const metadata|generateMetadata"),
    Check("canonical", "canonical URL", 4, r"alternates:\s*\{\s*canonical"),
    Check("h1", "visible h1", 4, r"<h1\b"),
    Check("h2_sections", "supporting sections", 4, r"<h2\b"),
    Check("faq", "FAQ or FAQ schema", 6, r"FAQPage|faq|よくある質問|Q&A"),
    Check("jsonld", "structured data", 5, r'application/ld\+json|schema\.org'),
    Check("related_links", "related internal links", 5, r"関連ツール|Related Tools|href=\"/"),
    Check("labels", "form labels", 4, r"<label\b|aria-label"),
    Check("copy", "copy action", 5, r"clipboard|コピー|Copy"),
    Check("download_export", "download/export action", 4, r"download|export|CSV|PNG|JSON|エクスポート"),
    Check("examples", "examples/samples", 4, r"example|sample|サンプル|例:|例）|例："),
    Check("reset_clear", "reset/clear action", 3, r"reset|clear|リセット|クリア"),
    Check("validation", "validation/error handling", 5, r"error|invalid|validate|検証|エラー|不正"),
    Check("privacy", "local/privacy assurance", 3, r"ブラウザ上|外部に送信|local|privacy|プライバシー"),
    Check("responsive", "responsive layout", 4, r"sm:|md:|lg:|grid-cols|flex-wrap"),
    Check("accessible_buttons", "button controls", 3, r"<button\b"),
    Check("current_count", "current site count", 3, r"\{?tools\.length\}?|142|100\+|無料オンラインツール集"),
]

ANTI_CHECKS = [
    ("old_count", "stale 53+/60+ copy", 8, r"53\+|60\+"),
    ("ad_placeholder", "visible ad placeholder", 5, r"AdSense Placeholder|広告スペース"),
    ("missing_route_link", "legacy /tools route link", 10, r'href="/tools(?:/|")'),
    ("raw_anchor_internal", "raw internal anchor", 4, r"<a\s+[^>]*href=\"/"),
    ("any_type", "loose any type", 3, r"\bany\b"),
]

HIGH_IMPACT_CATEGORIES = {
    "AI Tools",
    "AI Workflow",
    "Business Tools",
    "Data Format Tools",
    "Developer Tools",
    "Encoding & Decoding",
    "Image Tools",
    "Japanese Tools",
    "Tax Tools",
}


def parse_tools() -> list[dict[str, str]]:
    return [m.groupdict() for m in ENTRY_RE.finditer(TOOLS_CONFIG.read_text())]


def read_tree(path: Path) -> str:
    if not path.exists():
        return ""
    chunks = []
    for item in sorted(path.rglob("*")):
        if item.is_file() and item.suffix in {".tsx", ".ts", ".json"}:
            chunks.append(f"\n/* {item.relative_to(ROOT)} */\n")
            chunks.append(item.read_text(errors="ignore"))
    return "\n".join(chunks)


def classify(tool: dict[str, str], text: str) -> str:
    slug = tool["slug"]
    name = tool["name"].lower()
    category = tool["category"]
    haystack = f"{slug} {name} {tool['description'].lower()} {category.lower()}"

    if "comparison" in slug or "比較" in haystack:
        return "comparison"
    if "image" in category.lower() or "qr" in slug or "画像" in haystack:
        return "image"
    if "formatter" in slug or "converter" in slug or "変換" in haystack or "format" in haystack:
        return "converter"
    if "calculator" in slug or "計算" in haystack or "sim" in slug or "シミュ" in haystack:
        return "calculator"
    if "generator" in slug or "生成" in haystack:
        return "generator"
    if "status" in slug or "lookup" in slug or "reference" in text.lower():
        return "reference"
    return "utility"


def has(pattern: str, text: str) -> bool:
    return re.search(pattern, text, re.IGNORECASE | re.MULTILINE) is not None


def count(pattern: str, text: str) -> int:
    return len(re.findall(pattern, text, re.IGNORECASE | re.MULTILINE))


def score_tool(tool: dict[str, str]) -> dict:
    slug = tool["slug"]
    app_text = read_tree(APP_DIR / slug)
    tool_text = read_tree(TOOLS_DIR / slug)
    text = f"{app_text}\n{tool_text}"
    archetype = classify(tool, text)

    positive = []
    missing = []
    score = 0
    max_score = sum(check.weight for check in CHECKS)

    for check in CHECKS:
        passed = has(check.pattern, text)
        if passed:
            score += check.weight
            positive.append(check.key)
        else:
            missing.append(check.key)

    penalties = []
    penalty_total = 0
    for key, label, weight, pattern in ANTI_CHECKS:
        if has(pattern, text):
            penalties.append(key)
            penalty_total += weight

    raw_score = max(score - penalty_total, 0)
    quality_score = round(raw_score / max_score * 100)

    h2_count = count(r"<h2\b", text)
    button_count = count(r"<button\b", text)
    input_count = count(r"<(?:input|textarea|select)\b", text)
    internal_links = count(r'href="/', text)
    component_count = len(list((TOOLS_DIR / slug / "components").glob("*.tsx"))) if (TOOLS_DIR / slug / "components").exists() else 0
    has_og = (APP_DIR / slug / "opengraph-image.tsx").exists()

    impact = 1.0
    if tool["category"] in HIGH_IMPACT_CATEGORIES:
        impact += 0.35
    if tool["market"] == "JP":
        impact += 0.15
    if archetype in {"calculator", "converter", "image", "comparison"}:
        impact += 0.15

    priority_score = round((100 - quality_score) * impact)
    tier = "S" if priority_score >= 90 else "A" if priority_score >= 70 else "B" if priority_score >= 45 else "C"

    return {
        **tool,
        "archetype": archetype,
        "qualityScore": quality_score,
        "priorityScore": priority_score,
        "priorityTier": tier,
        "passed": positive,
        "missing": missing[:],
        "penalties": penalties,
        "signals": {
            "h2Count": h2_count,
            "buttonCount": button_count,
            "inputCount": input_count,
            "internalLinkCount": internal_links,
            "componentCount": component_count,
            "hasOpenGraphImage": has_og,
            "sourceLines": text.count("\n"),
        },
    }


def summarize(results: list[dict]) -> dict:
    by_tier: dict[str, int] = {}
    by_type: dict[str, list[int]] = {}
    by_category: dict[str, list[int]] = {}

    for item in results:
        by_tier[item["priorityTier"]] = by_tier.get(item["priorityTier"], 0) + 1
        by_type.setdefault(item["archetype"], []).append(item["qualityScore"])
        by_category.setdefault(item["category"], []).append(item["qualityScore"])

    return {
        "toolCount": len(results),
        "averageQualityScore": round(mean(item["qualityScore"] for item in results), 1),
        "priorityTierCounts": dict(sorted(by_tier.items())),
        "averageByArchetype": {
            key: round(mean(values), 1)
            for key, values in sorted(by_type.items())
        },
        "weakestCategories": [
            {"category": key, "averageQualityScore": round(mean(values), 1), "toolCount": len(values)}
            for key, values in sorted(by_category.items(), key=lambda kv: mean(kv[1]))[:12]
        ],
    }


def render_markdown(results: list[dict], summary: dict) -> str:
    top = sorted(results, key=lambda item: (-item["priorityScore"], item["qualityScore"], item["slug"]))[:30]
    best = sorted(results, key=lambda item: (-item["qualityScore"], item["slug"]))[:15]

    lines = [
        "# cc-tools Quality Audit",
        "",
        "This is a static quality proxy for deciding what to improve next. It is not a live competitor benchmark.",
        "",
        "## Summary",
        "",
        f"- Tools audited: {summary['toolCount']}",
        f"- Average quality score: {summary['averageQualityScore']}/100",
        f"- Priority tiers: {json.dumps(summary['priorityTierCounts'], ensure_ascii=False)}",
        "",
        "## Highest Priority Tools",
        "",
        "| Tier | Priority | Quality | Slug | Type | Category | Main gaps |",
        "| --- | ---: | ---: | --- | --- | --- | --- |",
    ]

    for item in top:
        gaps = ", ".join(item["missing"][:5])
        if item["penalties"]:
            gaps = f"{gaps}; penalties: {', '.join(item['penalties'])}" if gaps else f"penalties: {', '.join(item['penalties'])}"
        lines.append(
            f"| {item['priorityTier']} | {item['priorityScore']} | {item['qualityScore']} | "
            f"`{item['slug']}` | {item['archetype']} | {item['category']} | {gaps} |"
        )

    lines.extend([
        "",
        "## Strongest Current Tools",
        "",
        "| Quality | Slug | Type | Category |",
        "| ---: | --- | --- | --- |",
    ])
    for item in best:
        lines.append(f"| {item['qualityScore']} | `{item['slug']}` | {item['archetype']} | {item['category']} |")

    lines.extend([
        "",
        "## Archetype Averages",
        "",
        "| Type | Average quality |",
        "| --- | ---: |",
    ])
    for key, value in summary["averageByArchetype"].items():
        lines.append(f"| {key} | {value} |")

    lines.extend([
        "",
        "## Weakest Categories",
        "",
        "| Category | Average quality | Tools |",
        "| --- | ---: | ---: |",
    ])
    for item in summary["weakestCategories"]:
        lines.append(f"| {item['category']} | {item['averageQualityScore']} | {item['toolCount']} |")

    lines.extend([
        "",
        "## Next Factory Steps",
        "",
        "1. Build shared v2 shells for converter, calculator, image, and comparison tools.",
        "2. Rewrite the highest-priority S-tier tools in batches using those shells.",
        "3. Promote repeated checks from this report into `check-integrity.py` only after the signal is reliable.",
        "4. Add live competitor notes only for tools selected for an S-tier rewrite.",
    ])

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", default=str(REPORT_DIR / "quality-audit.json"))
    parser.add_argument("--md", default=str(REPORT_DIR / "quality-audit.md"))
    parser.add_argument("--fail-under", type=int, default=None)
    args = parser.parse_args()

    tools = parse_tools()
    results = [score_tool(tool) for tool in tools]
    results.sort(key=lambda item: (-item["priorityScore"], item["qualityScore"], item["slug"]))
    summary = summarize(results)

    payload = {
        "summary": summary,
        "checks": [{"key": c.key, "label": c.label, "weight": c.weight} for c in CHECKS],
        "antiChecks": [{"key": key, "label": label, "weight": weight} for key, label, weight, _ in ANTI_CHECKS],
        "tools": results,
    }

    Path(args.json).parent.mkdir(parents=True, exist_ok=True)
    Path(args.json).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    Path(args.md).write_text(render_markdown(results, summary) + "\n")

    print(
        "Quality audit complete: "
        f"{summary['toolCount']} tools, "
        f"average score {summary['averageQualityScore']}/100, "
        f"{summary['priorityTierCounts']} priority tiers."
    )

    if args.fail_under is not None and summary["averageQualityScore"] < args.fail_under:
        raise SystemExit(f"Average quality score below threshold: {summary['averageQualityScore']} < {args.fail_under}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
