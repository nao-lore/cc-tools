#!/usr/bin/env python3
"""Normalize static internal links in deployed app/tool TSX files."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TARGET_DIRS = [ROOT / "app", ROOT / "tools"]
INTERNAL_ANCHOR_RE = re.compile(
    r'<a(\s+[^>]*href="/[^"]*"[^>]*)>(.*?)</a>',
    re.DOTALL,
)


def add_link_import(text: str) -> str:
    if 'from "next/link"' in text or "from 'next/link'" in text:
        return text

    line = 'import Link from "next/link";\n'
    if text.startswith('"use client";\n\n'):
        return text.replace('"use client";\n\n', f'"use client";\n\n{line}', 1)
    if text.startswith('"use client";\n'):
        return text.replace('"use client";\n', f'"use client";\n{line}', 1)
    return line + text


def normalize_file(path: Path) -> tuple[bool, int]:
    text = path.read_text()
    text = text.replace('href="/tools/', 'href="/')

    replacements = 0

    def replace_anchor(match: re.Match[str]) -> str:
        nonlocal replacements
        replacements += 1
        return f"<Link{match.group(1)}>{match.group(2)}</Link>"

    text = INTERNAL_ANCHOR_RE.sub(replace_anchor, text)
    if replacements:
        text = add_link_import(text)

    original = path.read_text()
    if text == original:
        return False, 0

    path.write_text(text)
    return True, replacements


def main() -> None:
    changed_files = 0
    replaced_links = 0

    for target_dir in TARGET_DIRS:
        for path in sorted(target_dir.rglob("*.tsx")):
            changed, replacements = normalize_file(path)
            if changed:
                changed_files += 1
                replaced_links += replacements

    print(f"Normalized internal links: {replaced_links} link(s) in {changed_files} file(s).")


if __name__ == "__main__":
    main()
