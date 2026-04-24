"use client";

import { useState, useCallback } from "react";

// ─── Diff types ───────────────────────────────────────────────────────────────

type DiffType = "added" | "removed" | "unchanged";

interface DiffLine {
  type: DiffType;
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

interface InlineChange {
  type: DiffType;
  text: string;
}

interface DiffStats {
  added: number;
  removed: number;
  changed: number;
}

// ─── Diff algorithm ───────────────────────────────────────────────────────────

function lcsMatrix(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function computeDiff(
  original: string,
  modified: string,
  ignoreWhitespace: boolean
): DiffLine[] {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");

  const normalize = (l: string) =>
    ignoreWhitespace ? l.replace(/\s+/g, " ").trim() : l;

  const normOrig = origLines.map(normalize);
  const normMod = modLines.map(normalize);

  const dp = lcsMatrix(normOrig, normMod);
  const stack: DiffLine[] = [];
  let i = normOrig.length;
  let j = normMod.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && normOrig[i - 1] === normMod[j - 1]) {
      stack.push({ type: "unchanged", content: origLines[i - 1], oldLineNum: i, newLineNum: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", content: modLines[j - 1], newLineNum: j });
      j--;
    } else {
      stack.push({ type: "removed", content: origLines[i - 1], oldLineNum: i });
      i--;
    }
  }

  stack.reverse();
  return stack;
}

function computeInlineDiff(oldStr: string, newStr: string): InlineChange[] {
  const a = Array.from(oldStr);
  const b = Array.from(newStr);
  const m = a.length;
  const n = b.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const changes: InlineChange[] = [];
  let ci = m;
  let cj = n;
  while (ci > 0 || cj > 0) {
    if (ci > 0 && cj > 0 && a[ci - 1] === b[cj - 1]) {
      changes.push({ type: "unchanged", text: a[ci - 1] });
      ci--;
      cj--;
    } else if (cj > 0 && (ci === 0 || dp[ci][cj - 1] >= dp[ci - 1][cj])) {
      changes.push({ type: "added", text: b[cj - 1] });
      cj--;
    } else {
      changes.push({ type: "removed", text: a[ci - 1] });
      ci--;
    }
  }
  changes.reverse();

  // Merge consecutive same-type changes
  const merged: InlineChange[] = [];
  for (const ch of changes) {
    if (merged.length > 0 && merged[merged.length - 1].type === ch.type) {
      merged[merged.length - 1].text += ch.text;
    } else {
      merged.push({ ...ch });
    }
  }
  return merged;
}

function buildSideBySide(
  diff: DiffLine[]
): { left: DiffLine | null; right: DiffLine | null }[] {
  const pairs: { left: DiffLine | null; right: DiffLine | null }[] = [];
  let i = 0;
  while (i < diff.length) {
    const line = diff[i];
    if (line.type === "unchanged") {
      pairs.push({ left: line, right: line });
      i++;
    } else if (line.type === "removed") {
      const removedBatch: DiffLine[] = [];
      while (i < diff.length && diff[i].type === "removed") {
        removedBatch.push(diff[i++]);
      }
      const addedBatch: DiffLine[] = [];
      while (i < diff.length && diff[i].type === "added") {
        addedBatch.push(diff[i++]);
      }
      const maxLen = Math.max(removedBatch.length, addedBatch.length);
      for (let k = 0; k < maxLen; k++) {
        pairs.push({
          left: k < removedBatch.length ? removedBatch[k] : null,
          right: k < addedBatch.length ? addedBatch[k] : null,
        });
      }
    } else {
      pairs.push({ left: null, right: line });
      i++;
    }
  }
  return pairs;
}

function computeStats(diff: DiffLine[]): DiffStats {
  const pairs = buildSideBySide(diff);
  let added = 0;
  let removed = 0;
  let changed = 0;
  for (const p of pairs) {
    if (p.left?.type === "removed" && p.right?.type === "added") {
      changed++;
    } else if (p.left?.type === "removed" && !p.right) {
      removed++;
    } else if (!p.left && p.right?.type === "added") {
      added++;
    }
  }
  return { added, removed, changed };
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie"];

for (let i = 0; i < users.length; i++) {
  greet(users[i]);
}`;

const SAMPLE_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

const users = ["Alice", "Bob", "Charlie", "Diana"];

for (const user of users) {
  greet(user);
}

// Added logging
console.log("Greeted all users");`;

// ─── Main component ───────────────────────────────────────────────────────────

type ViewMode = "side-by-side" | "unified";

export default function DiffViewer() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [hasDiff, setHasDiff] = useState(false);

  const runDiff = useCallback(() => {
    const result = computeDiff(original, modified, ignoreWhitespace);
    setDiffLines(result);
    setHasDiff(true);
  }, [original, modified, ignoreWhitespace]);

  const handleClear = () => {
    setOriginal("");
    setModified("");
    setDiffLines([]);
    setHasDiff(false);
  };

  const handleSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
    setDiffLines([]);
    setHasDiff(false);
  };

  const stats = hasDiff ? computeStats(diffLines) : null;

  return (
    <div className="space-y-6">
      {/* Input panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--muted-fg)]">
            Original
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-56 md:h-64 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg font-mono text-sm text-[var(--foreground)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted-fg)]"
            placeholder="Paste original text here..."
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--muted-fg)]">
            Modified
          </label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="w-full h-56 md:h-64 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg font-mono text-sm text-[var(--foreground)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted-fg)]"
            placeholder="Paste modified text here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={runDiff}
          className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Compare
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-[var(--border)] text-[var(--muted-fg)] rounded-lg hover:text-[var(--foreground)] transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleSample}
          className="px-4 py-2 border border-[var(--border)] text-[var(--muted-fg)] rounded-lg hover:text-[var(--foreground)] transition-colors"
        >
          Sample
        </button>

        <div className="h-6 w-px bg-[var(--border)] hidden sm:block" />

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-fg)]">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs font-medium">
            <button
              onClick={() => setViewMode("side-by-side")}
              className={`px-3 py-1.5 transition-colors ${
                viewMode === "side-by-side"
                  ? "bg-[var(--accent)] text-white"
                  : "hover:text-[var(--foreground)]"
              }`}
            >
              Side-by-side
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`px-3 py-1.5 border-l border-[var(--border)] transition-colors ${
                viewMode === "unified"
                  ? "bg-[var(--accent)] text-white"
                  : "hover:text-[var(--foreground)]"
              }`}
            >
              Unified
            </button>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Ignore whitespace
          </label>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap items-center gap-5 text-sm px-1">
          <span className="text-green-600 dark:text-green-400 font-medium">
            +{stats.added} added
          </span>
          <span className="text-red-600 dark:text-red-400 font-medium">
            -{stats.removed} removed
          </span>
          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
            ~{stats.changed} changed
          </span>
          {stats.added === 0 && stats.removed === 0 && stats.changed === 0 && (
            <span className="text-[var(--muted-fg)]">No differences found</span>
          )}
        </div>
      )}

      {/* Diff output */}
      {hasDiff && diffLines.length > 0 && (
        <div className="border border-[var(--border)] rounded-lg overflow-hidden">
          {viewMode === "side-by-side" ? (
            <SideBySideView diffLines={diffLines} />
          ) : (
            <UnifiedView diffLines={diffLines} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Side-by-side view ────────────────────────────────────────────────────────

function SideBySideView({ diffLines }: { diffLines: DiffLine[] }) {
  const pairs = buildSideBySide(diffLines);

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)] text-[var(--muted-fg)] text-xs">
            <th className="w-10 px-2 py-1 text-right font-normal select-none border-r border-[var(--border)]">
              #
            </th>
            <th className="px-3 py-1 text-left font-normal border-r border-[var(--border)]">
              Original
            </th>
            <th className="w-10 px-2 py-1 text-right font-normal select-none border-r border-[var(--border)]">
              #
            </th>
            <th className="px-3 py-1 text-left font-normal">Modified</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, idx) => {
            const isPairedChange =
              pair.left?.type === "removed" && pair.right?.type === "added";
            let inlineDiff: InlineChange[] | null = null;
            if (isPairedChange) {
              inlineDiff = computeInlineDiff(
                pair.left!.content,
                pair.right!.content
              );
            }

            const leftBg =
              pair.left?.type === "removed"
                ? isPairedChange
                  ? "bg-yellow-50 dark:bg-yellow-950/30"
                  : "bg-red-50 dark:bg-red-950/30"
                : "";
            const rightBg =
              pair.right?.type === "added"
                ? isPairedChange
                  ? "bg-yellow-50 dark:bg-yellow-950/30"
                  : "bg-green-50 dark:bg-green-950/30"
                : "";
            const leftText =
              pair.left?.type === "removed"
                ? isPairedChange
                  ? "text-yellow-800 dark:text-yellow-300"
                  : "text-red-700 dark:text-red-400"
                : "text-[var(--muted-fg)]";
            const rightText =
              pair.right?.type === "added"
                ? isPairedChange
                  ? "text-yellow-800 dark:text-yellow-300"
                  : "text-green-700 dark:text-green-400"
                : "text-[var(--muted-fg)]";

            return (
              <tr key={idx}>
                {/* Left line number */}
                <td
                  className={`w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs ${leftBg}`}
                >
                  {pair.left?.oldLineNum ?? ""}
                </td>
                {/* Left content */}
                <td
                  className={`px-3 py-0.5 whitespace-pre border-r border-[var(--border)] ${leftBg} ${leftText}`}
                >
                  {pair.left ? (
                    inlineDiff ? (
                      <>
                        {inlineDiff.map((ch, i) =>
                          ch.type === "removed" ? (
                            <span
                              key={i}
                              className="bg-yellow-300/50 dark:bg-yellow-500/30 rounded-sm"
                            >
                              {ch.text}
                            </span>
                          ) : ch.type === "unchanged" ? (
                            <span key={i}>{ch.text}</span>
                          ) : null
                        )}
                      </>
                    ) : (
                      pair.left.content || "\u00a0"
                    )
                  ) : (
                    <span className="opacity-0 select-none">&nbsp;</span>
                  )}
                </td>
                {/* Right line number */}
                <td
                  className={`w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs ${rightBg}`}
                >
                  {pair.right?.newLineNum ?? ""}
                </td>
                {/* Right content */}
                <td
                  className={`px-3 py-0.5 whitespace-pre ${rightBg} ${rightText}`}
                >
                  {pair.right ? (
                    inlineDiff ? (
                      <>
                        {inlineDiff.map((ch, i) =>
                          ch.type === "added" ? (
                            <span
                              key={i}
                              className="bg-yellow-300/50 dark:bg-yellow-500/30 rounded-sm"
                            >
                              {ch.text}
                            </span>
                          ) : ch.type === "unchanged" ? (
                            <span key={i}>{ch.text}</span>
                          ) : null
                        )}
                      </>
                    ) : (
                      pair.right.content || "\u00a0"
                    )
                  ) : (
                    <span className="opacity-0 select-none">&nbsp;</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Unified view ─────────────────────────────────────────────────────────────

function UnifiedView({ diffLines }: { diffLines: DiffLine[] }) {
  // Group adjacent removed+added into pairs for char-level diff
  const rows: (
    | { kind: "single"; line: DiffLine }
    | { kind: "pair"; removed: DiffLine; added: DiffLine }
  )[] = [];

  let i = 0;
  while (i < diffLines.length) {
    const line = diffLines[i];
    if (line.type === "removed" && i + 1 < diffLines.length && diffLines[i + 1].type === "added") {
      rows.push({ kind: "pair", removed: line, added: diffLines[i + 1] });
      i += 2;
    } else {
      rows.push({ kind: "single", line });
      i++;
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)] text-[var(--muted-fg)] text-xs">
            <th className="w-10 px-2 py-1 text-right font-normal select-none border-r border-[var(--border)]">
              Old
            </th>
            <th className="w-10 px-2 py-1 text-right font-normal select-none border-r border-[var(--border)]">
              New
            </th>
            <th className="w-6 py-1 font-normal border-r border-[var(--border)]" />
            <th className="px-3 py-1 text-left font-normal">Content</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            if (row.kind === "single") {
              const { line } = row;
              const isPairedChange = false;
              const bg =
                line.type === "added"
                  ? "bg-green-50 dark:bg-green-950/30"
                  : line.type === "removed"
                  ? "bg-red-50 dark:bg-red-950/30"
                  : "";
              const textColor =
                line.type === "added"
                  ? "text-green-700 dark:text-green-400"
                  : line.type === "removed"
                  ? "text-red-700 dark:text-red-400"
                  : "text-[var(--muted-fg)]";
              const prefix =
                line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
              return (
                <tr key={idx} className={bg}>
                  <td className={`w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs ${bg}`}>
                    {line.oldLineNum ?? ""}
                  </td>
                  <td className={`w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs ${bg}`}>
                    {line.newLineNum ?? ""}
                  </td>
                  <td className={`w-6 text-center select-none border-r border-[var(--border)] ${bg} ${textColor}`}>
                    {prefix}
                  </td>
                  <td className={`px-3 py-0.5 whitespace-pre ${textColor}`}>
                    {line.content || "\u00a0"}
                  </td>
                </tr>
              );
            }

            // Paired removed+added with char-level diff
            const inlineDiff = computeInlineDiff(row.removed.content, row.added.content);
            return (
              <>
                {/* Removed row */}
                <tr key={`${idx}-rm`} className="bg-yellow-50 dark:bg-yellow-950/30">
                  <td className="w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs bg-yellow-50 dark:bg-yellow-950/30">
                    {row.removed.oldLineNum ?? ""}
                  </td>
                  <td className="w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs bg-yellow-50 dark:bg-yellow-950/30" />
                  <td className="w-6 text-center select-none border-r border-[var(--border)] text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30">
                    -
                  </td>
                  <td className="px-3 py-0.5 whitespace-pre text-yellow-800 dark:text-yellow-300">
                    {inlineDiff.map((ch, i) =>
                      ch.type === "removed" ? (
                        <span key={i} className="bg-yellow-300/60 dark:bg-yellow-500/40 rounded-sm">
                          {ch.text}
                        </span>
                      ) : ch.type === "unchanged" ? (
                        <span key={i}>{ch.text}</span>
                      ) : null
                    )}
                  </td>
                </tr>
                {/* Added row */}
                <tr key={`${idx}-add`} className="bg-yellow-50 dark:bg-yellow-950/30">
                  <td className="w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs bg-yellow-50 dark:bg-yellow-950/30" />
                  <td className="w-10 text-right px-2 py-0.5 text-[var(--muted-fg)] opacity-60 select-none border-r border-[var(--border)] text-xs bg-yellow-50 dark:bg-yellow-950/30">
                    {row.added.newLineNum ?? ""}
                  </td>
                  <td className="w-6 text-center select-none border-r border-[var(--border)] text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30">
                    +
                  </td>
                  <td className="px-3 py-0.5 whitespace-pre text-yellow-800 dark:text-yellow-300">
                    {inlineDiff.map((ch, i) =>
                      ch.type === "added" ? (
                        <span key={i} className="bg-yellow-300/60 dark:bg-yellow-500/40 rounded-sm">
                          {ch.text}
                        </span>
                      ) : ch.type === "unchanged" ? (
                        <span key={i}>{ch.text}</span>
                      ) : null
                    )}
                  </td>
                </tr>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Side-by-Side Diff tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Visual side-by-side text comparison with highlighting. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Side-by-Side Diff tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Visual side-by-side text comparison with highlighting. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </>
            );
          })}
        </tbody>
      </table>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Side-by-Side Diff",
  "description": "Visual side-by-side text comparison with highlighting",
  "url": "https://tools.loresync.dev/diff-viewer",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
