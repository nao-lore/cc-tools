#!/usr/bin/env python3
"""Validate that the generated tool registry, routes, and stock queue agree."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "app"
TOOLS_DIR = ROOT / "tools"
STOCK_DIRS = [ROOT / "stock" / "priority", ROOT / "stock" / "pending"]
TOOLS_CONFIG = ROOT / "lib" / "tools-config.ts"
TOOL_CATEGORIES = ROOT / "lib" / "tool-categories.ts"
CATEGORIES = ROOT / "lib" / "categories.ts"
NON_TOOL_APP_DIRS = {"blog", "category"}


def fail(message: str) -> None:
    print(f"ERROR: {message}")


def parse_tool_entries() -> list[tuple[str, str]]:
    entries = []
    for line in TOOLS_CONFIG.read_text().splitlines():
        slug = re.search(r'slug:\s*"([^"]+)"', line)
        category = re.search(r'category:\s*"([^"]+)"', line)
        if slug and category:
            entries.append((slug.group(1), category.group(1)))
    return entries


def parse_category_slugs() -> set[str]:
    return set(re.findall(r'slug:\s*"([^"]+)"', CATEGORIES.read_text()))


def parse_category_map() -> dict[str, str]:
    text = TOOL_CATEGORIES.read_text()
    return dict(re.findall(r'"([^"]+)":\s*"([^"]+)"', text))


def child_dirs(path: Path) -> set[str]:
    if not path.exists():
        return set()
    return {p.name for p in path.iterdir() if p.is_dir()}


def stock_entries() -> list[tuple[str, Path]]:
    entries = []
    for stock_dir in STOCK_DIRS:
        if not stock_dir.exists():
            continue
        for meta_file in sorted(stock_dir.glob("*/meta.json")):
            with meta_file.open() as f:
                meta = json.load(f)
            entries.append((meta["slug"], meta_file.parent))
    return entries


def stock_category(path: Path) -> str:
    with (path / "meta.json").open() as f:
        return json.load(f).get("category", "")


def stock_is_deployable(path: Path) -> bool:
    if (path / "page.tsx").exists():
        return True
    components_dir = path / "components"
    components = sorted(components_dir.glob("*.tsx")) if components_dir.exists() else []
    return len(components) == 1


def main() -> int:
    errors = 0

    tool_entries = parse_tool_entries()
    config_slugs = [slug for slug, _ in tool_entries]
    config_slug_set = set(config_slugs)
    category_names = {category for _, category in tool_entries}
    tool_dirs = child_dirs(TOOLS_DIR)
    app_dirs = child_dirs(APP_DIR) - NON_TOOL_APP_DIRS
    category_slugs = parse_category_slugs()
    category_map = parse_category_map()

    for slug, count in Counter(config_slugs).items():
        if count > 1:
            fail(f"duplicate slug in tools-config.ts: {slug}")
            errors += 1

    for slug in sorted(config_slug_set - tool_dirs):
        fail(f"tools-config.ts references missing tools/{slug}")
        errors += 1

    for slug in sorted(config_slug_set - app_dirs):
        fail(f"tools-config.ts references missing app/{slug}")
        errors += 1

    for slug in sorted(config_slug_set):
        if not (TOOLS_DIR / slug / "page.tsx").exists():
            fail(f"tools-config.ts references tools/{slug}, but tools/{slug}/page.tsx is missing")
            errors += 1
        if not (APP_DIR / slug / "page.tsx").exists():
            fail(f"tools-config.ts references app/{slug}, but app/{slug}/page.tsx is missing")
            errors += 1

    for slug in sorted(tool_dirs - config_slug_set):
        fail(f"tools/{slug} exists but is missing from tools-config.ts")
        errors += 1

    for slug in sorted(app_dirs - config_slug_set):
        fail(f"app/{slug} exists but is missing from tools-config.ts")
        errors += 1

    for category in sorted(category_names - set(category_map)):
        fail(f"tool category is not mapped in tool-categories.ts: {category}")
        errors += 1

    for category, slug in sorted(category_map.items()):
        if slug not in category_slugs:
            fail(f"tool-categories.ts maps {category} to missing category slug {slug}")
            errors += 1

    seen_stock = set()
    for slug, path in stock_entries():
        if slug in seen_stock:
            fail(f"duplicate stock slug: {slug} at {path.relative_to(ROOT)}")
            errors += 1
        seen_stock.add(slug)

        if slug in config_slug_set or slug in tool_dirs or slug in app_dirs:
            fail(f"stock entry is already deployed and will block the queue: {path.relative_to(ROOT)}")
            errors += 1

        category = stock_category(path)
        if category not in category_map:
            fail(f"stock entry category is not mapped in tool-categories.ts: {category} ({path.relative_to(ROOT)})")
            errors += 1

        if not stock_is_deployable(path):
            fail(f"stock entry cannot be auto-deployed: {path.relative_to(ROOT)}")
            errors += 1

    if errors:
        print(f"\nIntegrity check failed with {errors} error(s).")
        return 1

    print(
        "Integrity check passed: "
        f"{len(config_slug_set)} configured tools, "
        f"{len(category_names)} tool categories, "
        f"{len(seen_stock)} stock entries."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
