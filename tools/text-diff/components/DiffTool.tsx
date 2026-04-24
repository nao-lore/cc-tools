"use client";

import { useState, useCallback, useRef } from "react";
import {
  computeDiff,
  computeInlineDiff,
  computeStats,
  buildSideBySide,
  type DiffLine,
  type InlineChange,
} from "../lib/diff";

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

type ViewMode = "inline" | "side-by-side";

export default function DiffTool() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("inline");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [hasDiff, setHasDiff] = useState(false);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const diffOutputRef = useRef<HTMLDivElement>(null);

  const runDiff = useCallback(() => {
    const result = computeDiff(original, modified, {
      ignoreWhitespace,
      ignoreCase,
    });
    setDiffLines(result);
    setHasDiff(true);
  }, [original, modified, ignoreWhitespace, ignoreCase]);

  const stats = hasDiff ? computeStats(diffLines) : null;

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

  const handleCopyDiff = async () => {
    if (!diffOutputRef.current) return;
    const text = diffLines
      .map((l) => {
        const prefix =
          l.type === "added" ? "+ " : l.type === "removed" ? "- " : "  ";
        return prefix + l.content;
      })
      .join("\n");
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Input panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--muted-fg)]">
            Original Text
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-56 md:h-72 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg font-mono text-sm text-[var(--foreground)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted-fg)]"
            placeholder="Paste original text here..."
            spellCheck={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--muted-fg)]">
            Modified Text
          </label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="w-full h-56 md:h-72 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg font-mono text-sm text-[var(--foreground)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted-fg)]"
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
          Sample Texts
        </button>

        <div className="h-6 w-px bg-[var(--border)] hidden sm:block" />

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-[var(--muted-fg)]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={viewMode === "side-by-side"}
              onChange={(e) =>
                setViewMode(e.target.checked ? "side-by-side" : "inline")
              }
              className="accent-[var(--accent)]"
            />
            Side-by-side
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Ignore whitespace
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Ignore case
          </label>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-[var(--added-text)]">
            +{stats.added} added
          </span>
          <span className="text-[var(--removed-text)]">
            -{stats.removed} removed
          </span>
          <span className="text-[var(--muted-fg)]">
            {stats.unchanged} unchanged
          </span>
          <button
            onClick={handleCopyDiff}
            className="ml-auto text-[var(--muted-fg)] hover:text-[var(--foreground)] text-sm transition-colors"
          >
            Copy diff
          </button>
        </div>
      )}

      {/* Diff output */}
      {hasDiff && (
        <div
          ref={diffOutputRef}
          className="border border-[var(--border)] rounded-lg overflow-hidden"
        >
          {viewMode === "inline" ? (
            <InlineView diffLines={diffLines} />
          ) : (
            <SideBySideView diffLines={diffLines} />
          )}
        </div>
      )}
    </div>
  );
}

function InlineView({ diffLines }: { diffLines: DiffLine[] }) {
  // Group removed+added pairs for inline character diff
  const rows: (
    | { kind: "single"; line: DiffLine }
    | { kind: "pair"; removed: DiffLine; added: DiffLine }
  )[] = [];

  let i = 0;
  while (i < diffLines.length) {
    const line = diffLines[i];
    if (line.type === "unchanged") {
      rows.push({ kind: "single", line });
      i++;
    } else if (line.type === "removed") {
      // Check if next is added (pair for char diff)
      if (i + 1 < diffLines.length && diffLines[i + 1].type === "added") {
        rows.push({ kind: "pair", removed: line, added: diffLines[i + 1] });
        i += 2;
      } else {
        rows.push({ kind: "single", line });
        i++;
      }
    } else {
      rows.push({ kind: "single", line });
      i++;
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-sm">
        <tbody>
          {rows.map((row, idx) => {
            if (row.kind === "single") {
              return (
                <SingleLineRow key={idx} line={row.line} />
              );
            }
            // Pair: show character-level diff
            const inlineDiff = computeInlineDiff(
              row.removed.content,
              row.added.content
            );
            return (
              <PairRows
                key={idx}
                removed={row.removed}
                added={row.added}
                inlineDiff={inlineDiff}
              />
            );
          })}
        </tbody>
      </table>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "テキスト差分ツールはどんな場面で使いますか？", a: "コードの変更前後の確認、文章の改訂履歴の確認、設定ファイルの比較などに使えます。GitのDiff出力と同様の表示で、追加・削除・変更箇所を色分けして可視化します。" },
            { q: "インライン表示とサイドバイサイド表示の違いは？", a: "インライン表示は1列で変更前後を交互に表示します。サイドバイサイド表示は左右2列に並べて表示するため、変更箇所の対比が直感的に分かりやすくなります。" },
            { q: "差分結果をコピーできますか？", a: "現在のバージョンでは差分結果の直接コピー機能はありません。ブラウザの選択コピーでテキストをコピーしてご利用ください。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "テキスト差分ツールはどんな場面で使いますか？", "acceptedAnswer": { "@type": "Answer", "text": "コードの変更前後の確認、文章の改訂履歴の確認、設定ファイルの比較などに使えます。" } },
              { "@type": "Question", "name": "インライン表示とサイドバイサイド表示の違いは？", "acceptedAnswer": { "@type": "Answer", "text": "インライン表示は1列で変更前後を交互に表示します。サイドバイサイド表示は左右2列に並べて比較できます。" } },
              { "@type": "Question", "name": "差分結果をコピーできますか？", "acceptedAnswer": { "@type": "Answer", "text": "ブラウザの選択コピーでテキストをコピーしてご利用ください。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/regex-tester" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">正規表現テスター</a>
            <a href="/word-counter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">文字数カウンター</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleLineRow({ line }: { line: DiffLine }) {
  const bgClass =
    line.type === "added"
      ? "bg-[var(--added-bg)]"
      : line.type === "removed"
        ? "bg-[var(--removed-bg)]"
        : "";
  const textClass =
    line.type === "added"
      ? "text-[var(--added-text)]"
      : line.type === "removed"
        ? "text-[var(--removed-text)]"
        : "text-[var(--muted-fg)]";
  const prefix =
    line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";

  return (
    <tr className={bgClass}>
      <td className="w-8 sm:w-12 text-right pr-1 sm:pr-2 text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-1 sm:px-2 text-xs sm:text-sm">
        {line.oldLineNum ?? ""}
      </td>
      <td className="w-8 sm:w-12 text-right pr-1 sm:pr-2 text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-1 sm:px-2 text-xs sm:text-sm">
        {line.newLineNum ?? ""}
      </td>
      <td className="w-5 sm:w-6 text-center select-none">
        <span className={textClass}>{prefix}</span>
      </td>
      <td className={`px-2 sm:px-3 py-0.5 whitespace-pre overflow-x-auto ${textClass}`}>
        {line.content}
      </td>
    </tr>
  );
}

function PairRows({
  removed,
  added,
  inlineDiff,
}: {
  removed: DiffLine;
  added: DiffLine;
  inlineDiff: InlineChange[];
}) {
  return (
    <>
      <tr className="bg-[var(--removed-bg)]">
        <td className="w-12 text-right pr-2 text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-2">
          {removed.oldLineNum ?? ""}
        </td>
        <td className="w-12 text-right pr-2 text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-2">
        </td>
        <td className="w-6 text-center select-none">
          <span className="text-[var(--removed-text)]">-</span>
        </td>
        <td className="px-3 py-0.5 whitespace-pre text-[var(--removed-text)]">
          {inlineDiff.map((ch, i) =>
            ch.type === "removed" ? (
              <span
                key={i}
                className="bg-red-500/30 rounded-sm"
              >
                {ch.text}
              </span>
            ) : ch.type === "unchanged" ? (
              <span key={i}>{ch.text}</span>
            ) : null
          )}
        </td>
      </tr>
      <tr className="bg-[var(--added-bg)]">
        <td className="w-12 text-right pr-2 text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-2">
        </td>
        <td className="w-12 text-right pr-2 text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-2">
          {added.newLineNum ?? ""}
        </td>
        <td className="w-6 text-center select-none">
          <span className="text-[var(--added-text)]">+</span>
        </td>
        <td className="px-3 py-0.5 whitespace-pre text-[var(--added-text)]">
          {inlineDiff.map((ch, i) =>
            ch.type === "added" ? (
              <span
                key={i}
                className="bg-green-500/30 rounded-sm"
              >
                {ch.text}
              </span>
            ) : ch.type === "unchanged" ? (
              <span key={i}>{ch.text}</span>
            ) : null
          )}
        </td>
      </tr>
    </>
  );
}

function SideBySideView({ diffLines }: { diffLines: DiffLine[] }) {
  const pairs = buildSideBySide(diffLines);

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-sm">
        <tbody>
          {pairs.map((pair, idx) => {
            const leftBg = pair.left?.type === "removed" ? "bg-[var(--removed-bg)]" : "";
            const rightBg = pair.right?.type === "added" ? "bg-[var(--added-bg)]" : "";
            const leftText =
              pair.left?.type === "removed"
                ? "text-[var(--removed-text)]"
                : pair.left?.type === "unchanged"
                  ? "text-[var(--muted-fg)]"
                  : "";
            const rightText =
              pair.right?.type === "added"
                ? "text-[var(--added-text)]"
                : pair.right?.type === "unchanged"
                  ? "text-[var(--muted-fg)]"
                  : "";

            // Compute inline diff for paired removed/added
            let leftInline: InlineChange[] | null = null;
            let rightInline: InlineChange[] | null = null;
            if (
              pair.left?.type === "removed" &&
              pair.right?.type === "added"
            ) {
              const changes = computeInlineDiff(
                pair.left.content,
                pair.right.content
              );
              leftInline = changes;
              rightInline = changes;
            }

            return (
              <tr key={idx}>
                {/* Left side */}
                <td className={`w-8 sm:w-10 text-right text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-1 sm:px-2 text-xs sm:text-sm ${leftBg}`}>
                  {pair.left?.oldLineNum ?? ""}
                </td>
                <td className={`w-1/2 px-2 sm:px-3 py-0.5 whitespace-pre overflow-x-auto border-r border-[var(--border)] ${leftBg} ${leftText}`}>
                  {leftInline
                    ? leftInline.map((ch, i) =>
                        ch.type === "removed" ? (
                          <span key={i} className="bg-red-500/30 rounded-sm">{ch.text}</span>
                        ) : ch.type === "unchanged" ? (
                          <span key={i}>{ch.text}</span>
                        ) : null
                      )
                    : pair.left?.content ?? ""}
                </td>
                {/* Right side */}
                <td className={`w-8 sm:w-10 text-right text-[var(--muted-fg)] opacity-50 select-none border-r border-[var(--border)] px-1 sm:px-2 text-xs sm:text-sm ${rightBg}`}>
                  {pair.right?.newLineNum ?? ""}
                </td>
                <td className={`w-1/2 px-2 sm:px-3 py-0.5 whitespace-pre overflow-x-auto ${rightBg} ${rightText}`}>
                  {rightInline
                    ? rightInline.map((ch, i) =>
                        ch.type === "added" ? (
                          <span key={i} className="bg-green-500/30 rounded-sm">{ch.text}</span>
                        ) : ch.type === "unchanged" ? (
                          <span key={i}>{ch.text}</span>
                        ) : null
                      )
                    : pair.right?.content ?? ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
