#!/usr/bin/env python3
"""
Add FAQ section + JSON-LD FAQPage schema to stock tool components.

Scans stock/priority/ and stock/pending/ directories.
Skips tools that already contain "よくある質問", "FAQ", or "application/ld+json".
Inserts the FAQ section before the last </div> in the component's return statement.
"""

import json
import re
import sys
from pathlib import Path

STOCK_DIRS = [
    Path(__file__).resolve().parent.parent / "stock" / "priority",
    Path(__file__).resolve().parent.parent / "stock" / "pending",
]

# ──────────────────────────────────────────────────────────────────────────────
# FAQ content generators
# ──────────────────────────────────────────────────────────────────────────────

def make_faq_jp(name: str, description: str) -> tuple[list[dict], str]:
    """Return (faq_items, jsx_string) for JP tools."""
    faqs = [
        {
            "q": f"この{name}ツールは何ができますか？",
            "a": f"{description}。入力するだけで即座に結果を表示します。",
        },
        {
            "q": "利用料金はかかりますか？",
            "a": "完全無料でご利用いただけます。会員登録も不要です。",
        },
        {
            "q": "計算結果は正確ですか？",
            "a": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。",
        },
    ]

    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f["q"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f["a"],
                },
            }
            for f in faqs
        ],
    }

    details_jsx = "\n".join(
        f"""    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">{f["q"]}</summary>
      <p className="mt-2 text-sm text-gray-600">{f["a"]}</p>
    </details>"""
        for f in faqs
    )

    schema_json = json.dumps(schema, ensure_ascii=False)

    jsx = f"""
      {{/* FAQ */}}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
{details_jsx}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{{{__html: JSON.stringify({json.dumps(schema, ensure_ascii=False)})}}}} />"""

    return faqs, jsx


def make_faq_en(name: str, description: str) -> tuple[list[dict], str]:
    """Return (faq_items, jsx_string) for EN tools."""
    faqs = [
        {
            "q": f"What does this {name} tool do?",
            "a": f"{description}. Just enter your values and get instant results.",
        },
        {
            "q": "Is this tool free to use?",
            "a": "Yes, completely free. No sign-up or account required.",
        },
        {
            "q": "How accurate are the results?",
            "a": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.",
        },
    ]

    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f["q"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f["a"],
                },
            }
            for f in faqs
        ],
    }

    details_jsx = "\n".join(
        f"""    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">{f["q"]}</summary>
      <p className="mt-2 text-sm text-gray-600">{f["a"]}</p>
    </details>"""
        for f in faqs
    )

    jsx = f"""
      {{/* FAQ */}}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
{details_jsx}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{{{__html: JSON.stringify({json.dumps(schema, ensure_ascii=False)})}}}} />"""

    return faqs, jsx


# ──────────────────────────────────────────────────────────────────────────────
# Insertion logic
# ──────────────────────────────────────────────────────────────────────────────

def find_insertion_point(content: str) -> int | None:
    """
    Find the position just before the last top-level closing </div> or </>
    in the main (export default) component's return statement.

    Strategy:
    1. Find `export default function` (or `export default`).
    2. Find the first `return (` after that.
    3. Work backwards from the end of the file to find the final `);` + `}` pattern.
    4. Within return_start..final_close, find the last `</div>` or `</>`.

    Returns None if no suitable insertion point found.
    """
    # Find export default function position
    export_match = re.search(r'export\s+default\s+function\s+\w+', content)
    if export_match is None:
        # Fallback: try `export default` arrow function or re-exported
        export_match = re.search(r'export\s+default\s+', content)
    if export_match is None:
        return None

    after_export = content[export_match.start():]

    # Find first `return (` after export default
    return_match = re.search(r'\breturn\s*\(', after_export)
    if return_match is None:
        return None

    return_abs_start = export_match.start() + return_match.start()

    # Find the final closing pattern of the whole file: last `\n}` or `\n}\n`
    # The component's closing brace should be the last `}` in the file.
    # We search backwards for `\n}` near end of file.
    # More robustly: find the last occurrence of `\n  );\n}` or `\n);\n}` after return_abs_start
    after_return = content[return_abs_start:]

    # Find ALL occurrences of `);\n}` or `);\r\n}` after the return, pick the last
    close_matches = list(re.finditer(r'\)\s*;\s*\n\s*\}', after_return))
    if not close_matches:
        return None

    last_close = close_matches[-1]
    search_region_end = return_abs_start + last_close.start()

    # The region to search: from just after `return (` to just before `);}`
    search_region = content[return_abs_start:search_region_end]

    # Find the last </div> or </> in that region
    last_tag = None
    for m in re.finditer(r'</div>|</>', search_region):
        last_tag = m

    if last_tag is None:
        return None

    # Absolute position in original content
    return return_abs_start + last_tag.start()


def insert_faq(content: str, faq_jsx: str) -> str | None:
    """Insert faq_jsx before the last closing tag. Returns new content or None on failure."""
    pos = find_insertion_point(content)
    if pos is None:
        return None
    return content[:pos] + faq_jsx + "\n      " + content[pos:]


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def process_tool(tool_dir: Path) -> str:
    """
    Process one tool directory.
    Returns: "added", "skipped", or "error:<reason>"
    """
    meta_path = tool_dir / "meta.json"
    comp_dir = tool_dir / "components"

    if not meta_path.exists():
        return "error:no meta.json"
    if not comp_dir.exists():
        return "error:no components dir"

    tsx_files = list(comp_dir.glob("*.tsx"))
    if not tsx_files:
        return "error:no tsx file"

    comp_path = tsx_files[0]

    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    except Exception as e:
        return f"error:meta parse error {e}"

    slug = meta.get("slug", tool_dir.name)
    name = meta.get("name", slug)
    description = meta.get("description", "")
    market = meta.get("market", "JP")

    content = comp_path.read_text(encoding="utf-8")

    # Skip check
    skip_markers = ["よくある質問", "Frequently Asked Questions", "application/ld+json"]
    if any(marker in content for marker in skip_markers):
        return "skipped"

    # Generate FAQ
    if market == "EN":
        _, faq_jsx = make_faq_en(name, description)
    else:
        _, faq_jsx = make_faq_jp(name, description)

    new_content = insert_faq(content, faq_jsx)
    if new_content is None:
        return "error:no insertion point found"

    comp_path.write_text(new_content, encoding="utf-8")
    return "added"


def main():
    added = 0
    skipped = 0
    errors = []

    all_tool_dirs = []
    for stock_dir in STOCK_DIRS:
        if not stock_dir.exists():
            print(f"Warning: directory not found: {stock_dir}", file=sys.stderr)
            continue
        for tool_dir in sorted(stock_dir.iterdir()):
            if tool_dir.is_dir():
                all_tool_dirs.append(tool_dir)

    total = len(all_tool_dirs)
    print(f"Found {total} tool directories\n")

    for tool_dir in all_tool_dirs:
        slug = tool_dir.name
        result = process_tool(tool_dir)

        if result == "added":
            print(f"  {slug} (added)")
            added += 1
        elif result == "skipped":
            print(f"  {slug} (skipped, already has FAQ)")
            skipped += 1
        else:
            reason = result.replace("error:", "")
            print(f"  {slug} (ERROR: {reason})")
            errors.append((slug, reason))

    print(f"\n{'='*60}")
    print(f"Done: {added} added, {skipped} skipped, {len(errors)} errors")
    if errors:
        print("\nErrors:")
        for slug, reason in errors:
            print(f"  {slug}: {reason}")


if __name__ == "__main__":
    main()
