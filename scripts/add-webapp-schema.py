#!/usr/bin/env python3
"""
Add WebApplication JSON-LD schema to tool components.

Scans tools/, stock/priority/, and stock/pending/ directories.
Skips tools that already contain "WebApplication" or "SoftwareApplication".
Inserts the schema AFTER any existing JSON-LD scripts, before the last </div> or </>.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TOOL_DIRS = [ROOT / "tools"]
STOCK_DIRS = [
    ROOT / "stock" / "priority",
    ROOT / "stock" / "pending",
]

BASE_URL = "https://tools.loresync.dev"


# ──────────────────────────────────────────────────────────────────────────────
# Schema generator
# ──────────────────────────────────────────────────────────────────────────────

def make_webapp_schema_jsx(name: str, description: str, slug: str, market: str) -> str:
    in_language = "ja" if market == "JP" else "en"
    schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": name,
        "description": description,
        "url": f"{BASE_URL}/{slug}",
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "JPY",
        },
        "inLanguage": in_language,
    }
    schema_json = json.dumps(schema, ensure_ascii=False, indent=2)
    return (
        "\n      <script\n"
        '        type="application/ld+json"\n'
        "        dangerouslySetInnerHTML={{\n"
        f"          __html: `{schema_json}`\n"
        "        }}\n"
        "      />"
    )


# ──────────────────────────────────────────────────────────────────────────────
# Insertion logic
# ──────────────────────────────────────────────────────────────────────────────

def find_insertion_point(content: str) -> int | None:
    """
    Find position just before the last </div> or </> in the component's return statement.
    Same strategy as add-seo-sections.py.
    """
    export_match = re.search(r'export\s+default\s+function\s+\w+', content)
    if export_match is None:
        export_match = re.search(r'export\s+default\s+', content)
    if export_match is None:
        return None

    after_export = content[export_match.start():]

    return_match = re.search(r'\breturn\s*\(', after_export)
    if return_match is None:
        return None

    return_abs_start = export_match.start() + return_match.start()
    after_return = content[return_abs_start:]

    close_matches = list(re.finditer(r'\)\s*;\s*\n\s*\}', after_return))
    if not close_matches:
        return None

    last_close = close_matches[-1]
    search_region_end = return_abs_start + last_close.start()
    search_region = content[return_abs_start:search_region_end]

    last_tag = None
    for m in re.finditer(r'</div>|</>', search_region):
        last_tag = m

    if last_tag is None:
        return None

    return return_abs_start + last_tag.start()


def insert_schema(content: str, schema_jsx: str) -> str | None:
    """Insert schema_jsx before the last closing tag. Returns new content or None."""
    pos = find_insertion_point(content)
    if pos is None:
        return None
    return content[:pos] + schema_jsx + "\n      " + content[pos:]


# ──────────────────────────────────────────────────────────────────────────────
# Per-tool processing
# ──────────────────────────────────────────────────────────────────────────────

def get_meta_for_tools_dir(tool_dir: Path) -> dict | None:
    """
    For tools/ entries (no meta.json), look up slug from tools-config.ts via grep,
    or fall back to the directory name as slug and read page.tsx for name.
    Returns a dict with slug, name, description, market.
    """
    # Try reading page.tsx for name from h1
    page_path = tool_dir / "page.tsx"
    if not page_path.exists():
        return None

    slug = tool_dir.name
    content = page_path.read_text(encoding="utf-8")

    # Extract name from <h1 ...>TEXT</h1>
    h1_match = re.search(r'<h1[^>]*>([^<]+)</h1>', content)
    name = h1_match.group(1).strip() if h1_match else slug

    # Extract description from <p ...>TEXT</p> near top
    p_match = re.search(r'<p[^>]*className="[^"]*text-gray[^"]*"[^>]*>([^<]+)</p>', content)
    description = p_match.group(1).strip() if p_match else ""

    # Detect market: if name/description has Japanese chars → JP, else EN
    has_japanese = bool(re.search(r'[\u3040-\u30ff\u4e00-\u9fff]', name + description))
    market = "JP" if has_japanese else "EN"

    return {"slug": slug, "name": name, "description": description, "market": market}


def process_tool(tool_dir: Path, is_stock: bool) -> str:
    """
    Process one tool directory.
    Returns: "added", "skipped", or "error:<reason>"
    """
    if is_stock:
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
        comp_content = comp_path.read_text(encoding="utf-8")
        target_path = comp_path

    else:
        # tools/ directory: inject into page.tsx
        page_path = tool_dir / "page.tsx"
        if not page_path.exists():
            return "error:no page.tsx"

        meta = get_meta_for_tools_dir(tool_dir)
        if meta is None:
            return "error:could not extract meta"

        slug = meta["slug"]
        name = meta["name"]
        description = meta["description"]
        market = meta["market"]
        comp_content = page_path.read_text(encoding="utf-8")
        target_path = page_path

    # Skip check
    if any(marker in comp_content for marker in ["WebApplication", "SoftwareApplication"]):
        return "skipped"

    schema_jsx = make_webapp_schema_jsx(name, description, slug, market)
    new_content = insert_schema(comp_content, schema_jsx)
    if new_content is None:
        return "error:no insertion point found"

    target_path.write_text(new_content, encoding="utf-8")
    return "added"


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    added = 0
    skipped = 0
    errors = []

    all_entries: list[tuple[Path, bool]] = []  # (dir, is_stock)

    for tool_dir in TOOL_DIRS:
        if not tool_dir.exists():
            print(f"Warning: directory not found: {tool_dir}", file=sys.stderr)
            continue
        for entry in sorted(tool_dir.iterdir()):
            if entry.is_dir():
                all_entries.append((entry, False))

    for stock_dir in STOCK_DIRS:
        if not stock_dir.exists():
            print(f"Warning: directory not found: {stock_dir}", file=sys.stderr)
            continue
        for entry in sorted(stock_dir.iterdir()):
            if entry.is_dir():
                all_entries.append((entry, True))

    total = len(all_entries)
    print(f"Found {total} tool directories\n")

    for tool_dir, is_stock in all_entries:
        slug = tool_dir.name
        result = process_tool(tool_dir, is_stock)

        if result == "added":
            print(f"  + {slug}")
            added += 1
        elif result == "skipped":
            print(f"  . {slug} (skipped)")
            skipped += 1
        else:
            reason = result.replace("error:", "")
            print(f"  ! {slug} (ERROR: {reason})")
            errors.append((slug, reason))

    print(f"\n{'='*60}")
    print(f"Done: {added} added, {skipped} skipped, {len(errors)} errors")
    if errors:
        print("\nErrors:")
        for slug, reason in errors:
            print(f"  {slug}: {reason}")


if __name__ == "__main__":
    main()
