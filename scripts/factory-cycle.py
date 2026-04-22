#!/usr/bin/env python3
"""
Factory cycle helper - picks next N tools from backlog and marks them as building.
Used by the /loop autonomous factory.

Usage:
  python3 scripts/factory-cycle.py next [N]     # Get next N pending tools (default 6)
  python3 scripts/factory-cycle.py mark-built <slug> [slug...]  # Mark tools as built
  python3 scripts/factory-cycle.py stats         # Show backlog stats
"""

import json
import sys
from pathlib import Path

BACKLOG = Path(__file__).resolve().parent / "backlog-v2.json"


def load():
    return json.load(open(BACKLOG))


def save(data):
    json.dump(data, open(BACKLOG, "w"), indent=2, ensure_ascii=False)


def get_next(n=6):
    d = load()
    pending = [t for t in d["tools"] if t.get("status") == "pending"]
    batch = pending[:n]
    for t in batch:
        t["status"] = "building"
    save(d)
    return batch


def mark_built(slugs):
    d = load()
    for t in d["tools"]:
        if t["slug"] in slugs:
            t["status"] = "built"
    save(d)


def stats():
    d = load()
    total = len(d["tools"])
    pending = sum(1 for t in d["tools"] if t.get("status") == "pending")
    building = sum(1 for t in d["tools"] if t.get("status") == "building")
    built = sum(1 for t in d["tools"] if t.get("status") == "built")
    print(f"Total: {total} | Pending: {pending} | Building: {building} | Built: {built}")


def main():
    if len(sys.argv) < 2:
        stats()
        return

    cmd = sys.argv[1]

    if cmd == "next":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 6
        batch = get_next(n)
        if not batch:
            print("NO_MORE")
            return
        for t in batch:
            print(json.dumps(t, ensure_ascii=False))

    elif cmd == "mark-built":
        slugs = sys.argv[2:]
        mark_built(slugs)
        print(f"Marked {len(slugs)} as built")

    elif cmd == "stats":
        stats()


if __name__ == "__main__":
    main()
