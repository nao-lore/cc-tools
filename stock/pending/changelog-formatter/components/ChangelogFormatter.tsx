"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CommitType =
  | "feat"
  | "fix"
  | "chore"
  | "docs"
  | "refactor"
  | "perf"
  | "test"
  | "style"
  | "ci"
  | "build"
  | "other";

interface ParsedCommit {
  type: CommitType;
  scope: string | null;
  breaking: boolean;
  description: string;
  hash: string;
  raw: string;
}

interface GroupedCommits {
  [key: string]: ParsedCommit[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  CommitType,
  { label: string; emoji: string; order: number }
> = {
  feat: { label: "Features", emoji: "✨", order: 1 },
  fix: { label: "Bug Fixes", emoji: "🐛", order: 2 },
  perf: { label: "Performance Improvements", emoji: "⚡", order: 3 },
  refactor: { label: "Code Refactoring", emoji: "♻️", order: 4 },
  docs: { label: "Documentation", emoji: "📝", order: 5 },
  style: { label: "Styles", emoji: "💄", order: 6 },
  test: { label: "Tests", emoji: "✅", order: 7 },
  build: { label: "Build System", emoji: "🏗️", order: 8 },
  ci: { label: "CI", emoji: "👷", order: 9 },
  chore: { label: "Chores", emoji: "🔧", order: 10 },
  other: { label: "Other Changes", emoji: "📦", order: 11 },
};

const CONVENTIONAL_REGEX =
  /^([a-f0-9]{5,12}\s+)?([a-z]+)(\([^)]+\))?(!)?:\s*(.+)$/i;

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseCommit(line: string): ParsedCommit {
  const trimmed = line.trim();
  if (!trimmed) return null as unknown as ParsedCommit;

  const match = trimmed.match(CONVENTIONAL_REGEX);

  if (match) {
    const [, hashPart, typeRaw, scopePart, bang, description] = match;
    const rawType = typeRaw.toLowerCase();
    const type: CommitType = (Object.keys(TYPE_CONFIG) as CommitType[]).includes(
      rawType as CommitType
    )
      ? (rawType as CommitType)
      : "other";

    return {
      type,
      scope: scopePart ? scopePart.slice(1, -1) : null,
      breaking: bang === "!" || description.toUpperCase().includes("BREAKING CHANGE"),
      description: description.trim(),
      hash: hashPart ? hashPart.trim() : "",
      raw: trimmed,
    };
  }

  // Not conventional — extract hash if present
  const hashMatch = trimmed.match(/^([a-f0-9]{5,12})\s+(.+)$/i);
  return {
    type: "other",
    scope: null,
    breaking: false,
    description: hashMatch ? hashMatch[2] : trimmed,
    hash: hashMatch ? hashMatch[1] : "",
    raw: trimmed,
  };
}

function parseCommits(raw: string): ParsedCommit[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseCommit)
    .filter(Boolean);
}

function groupCommits(commits: ParsedCommit[]): GroupedCommits {
  const groups: GroupedCommits = {};
  for (const commit of commits) {
    if (!groups[commit.type]) groups[commit.type] = [];
    groups[commit.type].push(commit);
  }
  return groups;
}

function formatCommitLine(commit: ParsedCommit): string {
  const scope = commit.scope ? `**${commit.scope}:** ` : "";
  const breaking = commit.breaking ? " ⚠️ **BREAKING**" : "";
  const hash = commit.hash ? ` (\`${commit.hash}\`)` : "";
  return `- ${scope}${commit.description}${breaking}${hash}`;
}

function generateMarkdown(
  groups: GroupedCommits,
  version: string,
  date: string,
  includeBreaking: boolean
): string {
  const lines: string[] = [];

  const header = version
    ? `## [${version}] - ${date || new Date().toISOString().slice(0, 10)}`
    : `## Changelog - ${date || new Date().toISOString().slice(0, 10)}`;

  lines.push(header);
  lines.push("");

  // Breaking changes section
  if (includeBreaking) {
    const breakingCommits = Object.values(groups)
      .flat()
      .filter((c) => c.breaking);
    if (breakingCommits.length > 0) {
      lines.push("### ⚠️ BREAKING CHANGES");
      lines.push("");
      for (const commit of breakingCommits) {
        const scope = commit.scope ? `**${commit.scope}:** ` : "";
        const hash = commit.hash ? ` (\`${commit.hash}\`)` : "";
        lines.push(`- ${scope}${commit.description}${hash}`);
      }
      lines.push("");
    }
  }

  // Sorted type groups
  const sortedTypes = (Object.keys(groups) as CommitType[]).sort(
    (a, b) => TYPE_CONFIG[a].order - TYPE_CONFIG[b].order
  );

  for (const type of sortedTypes) {
    const config = TYPE_CONFIG[type];
    lines.push(`### ${config.emoji} ${config.label}`);
    lines.push("");
    for (const commit of groups[type]) {
      lines.push(formatCommitLine(commit));
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChangelogFormatter() {
  const [input, setInput] = useState("");
  const [version, setVersion] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [includeBreaking, setIncludeBreaking] = useState(true);
  const [copied, setCopied] = useState(false);

  const commits = input.trim() ? parseCommits(input) : [];
  const groups = groupCommits(commits);
  const markdown =
    commits.length > 0
      ? generateMarkdown(groups, version, date, includeBreaking)
      : "";

  const handleCopy = useCallback(async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  const totalCount = commits.length;
  const breakingCount = commits.filter((c) => c.breaking).length;

  return (
    <div className="space-y-6">
      {/* Controls row */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.2.0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Release Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeBreaking}
              onChange={(e) => setIncludeBreaking(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Breaking changes section
            </span>
          </label>
        </div>
      </div>

      {/* Input / Output grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Git Log Output
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Paste output from{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">
              git log --oneline
            </code>{" "}
            or conventional commit messages
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`abc1234 feat(auth): add OAuth2 login\ndef5678 fix(api): handle null response\n9ab0cde chore: update dependencies\nfeat!: drop Node 14 support`}
            rows={16}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            spellCheck={false}
          />
          {totalCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {totalCount} commit{totalCount !== 1 ? "s" : ""} parsed
              {breakingCount > 0 && (
                <span className="text-amber-600 ml-2">
                  · {breakingCount} breaking
                </span>
              )}
            </p>
          )}
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Markdown Changelog
            </label>
            <button
              onClick={handleCopy}
              disabled={!markdown}
              className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Grouped by type · Ready to paste into CHANGELOG.md
          </p>
          {markdown ? (
            <pre className="w-full h-[368px] overflow-auto border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {markdown}
            </pre>
          ) : (
            <div className="w-full h-[368px] border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400">
              Paste commits on the left to generate changelog
            </div>
          )}
        </div>
      </div>

      {/* Type legend */}
      {commits.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Commit breakdown
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(groups) as CommitType[])
              .sort((a, b) => TYPE_CONFIG[a].order - TYPE_CONFIG[b].order)
              .map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                >
                  <span>{TYPE_CONFIG[type].emoji}</span>
                  <span>{TYPE_CONFIG[type].label}</span>
                  <span className="font-semibold text-indigo-600">
                    {groups[type].length}
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
