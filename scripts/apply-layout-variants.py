#!/usr/bin/env python3
"""
Apply Layout B (dark+sidebar) or Layout C (card+breadcrumb) to all stock/pending/ tools
that have a page.tsx. Assignment is deterministic via slug hash (~50/50 split).

Layout A (light gradient) is kept as-is for stock/priority/ and tools/.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

PENDING_DIR = Path(__file__).resolve().parent.parent / "stock" / "pending"


def pick_layout(slug: str) -> str:
    """Deterministically assign 'B' or 'C' based on slug hash."""
    h = int(hashlib.md5(slug.encode()).hexdigest(), 16)
    return "B" if h % 2 == 0 else "C"


def extract_import_info(page_content: str):
    """
    Extract:
      - use_client: bool
      - import_line: the full import statement (e.g. 'import Foo from "./components/Foo";')
      - component_name: the default-exported component identifier
    Returns None if no component import found.
    """
    use_client = page_content.lstrip().startswith('"use client"') or page_content.lstrip().startswith("'use client'")

    # Match: import ComponentName from "./components/..."
    match = re.search(
        r'^import\s+(\w+)\s+from\s+["\']\.\/components\/[^"\']+["\'];?',
        page_content,
        re.MULTILINE,
    )
    if not match:
        return None

    import_line = match.group(0).rstrip(";") + ";"
    component_name = match.group(1)
    return use_client, import_line, component_name


def build_layout_b(use_client: bool, import_line: str, component_name: str, title: str, subtitle: str) -> str:
    client_directive = '"use client";\n' if use_client else ""
    return f'''{client_directive}{import_line}

export default function Page() {{
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 mb-8">{subtitle}</p>
          <{component_name} />
        </div>
        <aside className="hidden lg:block space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">関連ツール</h3>
            <div className="space-y-2 text-sm">
              <a href="/" className="block text-blue-400 hover:text-blue-300">← ツール一覧に戻る</a>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 border-dashed p-6 text-center">
            <span className="text-gray-600 text-xs">Ad Space</span>
          </div>
        </aside>
      </div>
    </div>
  );
}}
'''


def build_layout_c(use_client: bool, import_line: str, component_name: str, title: str, subtitle: str) -> str:
    client_directive = '"use client";\n' if use_client else ""
    return f'''{client_directive}{import_line}

export default function Page() {{
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">ツール一覧</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{title}</span>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 mb-8">{subtitle}</p>
          <{component_name} />
        </div>
      </div>
    </div>
  );
}}
'''


def process_tool(tool_dir: Path, dry_run: bool = False) -> str:
    """Process a single tool directory. Returns status string."""
    page_path = tool_dir / "page.tsx"
    meta_path = tool_dir / "meta.json"

    if not page_path.exists():
        return "skip:no-page"

    if not meta_path.exists():
        return "skip:no-meta"

    # Read meta
    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    except Exception as e:
        return f"skip:bad-meta:{e}"

    title = meta.get("name") or meta.get("title") or tool_dir.name
    subtitle = meta.get("description") or meta.get("metaDescription") or ""
    # Truncate very long subtitles
    if len(subtitle) > 120:
        subtitle = subtitle[:117] + "..."

    # Read page.tsx
    page_content = page_path.read_text(encoding="utf-8")

    result = extract_import_info(page_content)
    if result is None:
        return "skip:no-component-import"

    use_client, import_line, component_name = result
    slug = tool_dir.name
    layout = pick_layout(slug)

    if layout == "B":
        new_content = build_layout_b(use_client, import_line, component_name, title, subtitle)
    else:
        new_content = build_layout_c(use_client, import_line, component_name, title, subtitle)

    if not dry_run:
        page_path.write_text(new_content, encoding="utf-8")

    return f"layout-{layout}"


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("DRY RUN — no files will be written\n")

    tool_dirs = sorted(PENDING_DIR.iterdir())
    counts = {"layout-B": 0, "layout-C": 0, "skip:no-page": 0, "skip:no-meta": 0,
              "skip:no-component-import": 0, "other-skip": 0}

    for tool_dir in tool_dirs:
        if not tool_dir.is_dir():
            continue
        status = process_tool(tool_dir, dry_run=dry_run)
        if status in counts:
            counts[status] += 1
        elif status.startswith("skip"):
            counts["other-skip"] += 1
        else:
            counts[status] = counts.get(status, 0) + 1

        prefix = "[DRY]" if dry_run else "[OK]"
        print(f"{prefix} {tool_dir.name}: {status}")

    print("\n--- Summary ---")
    for k, v in counts.items():
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
