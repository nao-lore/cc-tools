#!/usr/bin/env python3
"""
Deploys N tools from stock/pending/ to the live monorepo.
Used by GitHub Actions daily cron OR manually.

Usage:
  python3 scripts/stock-to-deploy.py [N]  # Deploy N tools (default: 3)
  python3 scripts/stock-to-deploy.py --all # Deploy all pending
  python3 scripts/stock-to-deploy.py --list # List pending tools
"""

import json
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRIORITY_DIR = ROOT / "stock" / "priority"
STOCK_DIR = ROOT / "stock" / "pending"
TOOLS_DIR = ROOT / "tools"
APP_DIR = ROOT / "app"
CONFIG_FILE = ROOT / "lib" / "tools-config.ts"


TIER_ORDER = {"S": 0, "A": 1, "B": 2, "C": 3, "D": 4}


def list_pending() -> list[dict]:
    """List all pending tools with their metadata. Priority tools come first, sorted by tier."""
    tools = []
    # Priority queue first, then regular pending
    for stock_dir in [PRIORITY_DIR, STOCK_DIR]:
        if not stock_dir.exists():
            continue
        for meta_file in sorted(stock_dir.glob("*/meta.json")):
            with open(meta_file) as f:
                meta = json.load(f)
            meta["_dir"] = meta_file.parent
            meta["_priority"] = (stock_dir == PRIORITY_DIR)
            tools.append(meta)
    # Sort: priority dir first, then by tier (S > A > B > C > D), then alphabetical
    tools.sort(key=lambda t: (
        0 if t["_priority"] else 1,
        TIER_ORDER.get(t.get("tier", "D"), 4),
        t["slug"],
    ))
    return tools


def deploy_tool(meta: dict) -> bool:
    """Deploy a single tool from stock to live."""
    slug = meta["slug"]
    stock_tool_dir = meta["_dir"]
    dest_tool_dir = TOOLS_DIR / slug
    dest_app_dir = APP_DIR / slug

    # Skip if already deployed
    if dest_tool_dir.exists():
        print(f"  SKIP {slug} (already in tools/)")
        return False

    # 1. Copy tool source files (everything except meta.json)
    dest_tool_dir.mkdir(parents=True, exist_ok=True)
    for item in stock_tool_dir.iterdir():
        if item.name == "meta.json":
            continue
        dest = dest_tool_dir / item.name
        if item.is_dir():
            shutil.copytree(item, dest)
        else:
            shutil.copy2(item, dest)

    # 2. Generate app/[slug]/page.tsx wrapper
    dest_app_dir.mkdir(parents=True, exist_ok=True)
    title = meta.get("title", meta["name"])
    description = meta.get("metaDescription", meta["description"])
    wrapper = f'''import type {{ Metadata }} from "next";
import ToolPage from "@/tools/{slug}/page";

export const metadata: Metadata = {{
  title: "{title}",
  description: "{description}",
  alternates: {{ canonical: "https://tools.loresync.dev/{slug}" }},
}};

export default function Page() {{
  return <ToolPage />;
}}
'''
    (dest_app_dir / "page.tsx").write_text(wrapper)

    # 3. Append to tools-config.ts
    config_content = CONFIG_FILE.read_text()
    market = meta.get("market", "EN")
    category = meta.get("category", "Developer Tools")
    name = meta["name"]
    desc = meta["description"]
    new_entry = f'  {{ slug: "{slug}", name: "{name}", description: "{desc}", market: "{market}", category: "{category}", oldUrl: "" }},'

    # Insert before the closing ];
    config_content = config_content.replace(
        "\n];",
        f"\n{new_entry}\n];",
    )
    CONFIG_FILE.write_text(config_content)

    # 4. Remove from stock/pending
    shutil.rmtree(stock_tool_dir)

    print(f"  DEPLOYED {slug}")
    return True


def main():
    args = sys.argv[1:]

    if "--list" in args:
        pending = list_pending()
        if not pending:
            print("No pending tools in stock.")
            return
        print(f"\n{len(pending)} tools in stock/pending/:\n")
        for i, t in enumerate(pending, 1):
            print(f"  {i}. {t['slug']} ({t['market']}) — {t['name']}")
        return

    if "--all" in args:
        count = 999
    elif args and args[0].isdigit():
        count = int(args[0])
    else:
        count = 5  # default daily batch size (ramp up after SC monitoring)

    pending = list_pending()
    if not pending:
        print("No pending tools in stock. Nothing to deploy.")
        return

    to_deploy = pending[:count]
    print(f"\nDeploying {len(to_deploy)} of {len(pending)} pending tools:\n")

    deployed = 0
    for meta in to_deploy:
        if deploy_tool(meta):
            deployed += 1

    print(f"\nDone. {deployed} tools deployed, {len(pending) - deployed} remaining in stock.")


if __name__ == "__main__":
    main()
