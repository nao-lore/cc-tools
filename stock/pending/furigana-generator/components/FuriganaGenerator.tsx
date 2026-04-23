"use client";

import { useState, useCallback } from "react";

interface Pair {
  kanji: string;
  yomi: string;
}

const PRESETS: Pair[] = [
  { kanji: "東京", yomi: "とうきょう" },
  { kanji: "大阪", yomi: "おおさか" },
  { kanji: "漢字", yomi: "かんじ" },
];

const EMPTY_ROWS = 3;

function sanitizeHtml(html: string): string {
  // Allow only ruby, rb, rt tags and their text content
  const allowed = /<\/?(?:ruby|rb|rt)>/g;
  // Strip all tags except allowed ones
  return html.replace(/<[^>]+>/g, (tag) => {
    if (/^<\/?(?:ruby|rb|rt)>$/.test(tag)) return tag;
    return "";
  });
}

function convertText(text: string, pairs: Pair[]): string {
  // Filter out pairs with empty kanji
  const valid = pairs.filter((p) => p.kanji.trim() !== "");
  if (valid.length === 0) return text;

  // Sort by kanji length descending to replace longer matches first
  const sorted = [...valid].sort(
    (a, b) => b.kanji.length - a.kanji.length
  );

  let result = text;
  for (const { kanji, yomi } of sorted) {
    const escaped = kanji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "g");
    result = result.replace(
      re,
      `<ruby><rb>${kanji}</rb><rt>${yomi}</rt></ruby>`
    );
  }
  return result;
}

export default function FuriganaGenerator() {
  const [pairs, setPairs] = useState<Pair[]>([
    ...PRESETS,
    ...Array.from({ length: Math.max(0, EMPTY_ROWS - PRESETS.length) }, () => ({
      kanji: "",
      yomi: "",
    })),
  ]);
  const [body, setBody] = useState(
    "東京と大阪は日本の主要都市です。漢字の読み方を学びましょう。"
  );
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePairChange = useCallback(
    (index: number, field: "kanji" | "yomi", value: string) => {
      setPairs((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const addRow = useCallback(() => {
    setPairs((prev) => [...prev, { kanji: "", yomi: "" }]);
  }, []);

  const removeRow = useCallback((index: number) => {
    setPairs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleConvert = useCallback(() => {
    const result = convertText(body, pairs);
    setOutput(result);
    setCopied(false);
  }, [body, pairs]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const sanitized = output ? sanitizeHtml(output) : "";

  return (
    <div className="space-y-6">
      {/* Dictionary */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">辞書登録</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-muted mb-1 px-1">
            <span>漢字</span>
            <span>よみ（ひらがな）</span>
            <span />
          </div>
          {pairs.map((pair, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input
                type="text"
                value={pair.kanji}
                onChange={(e) => handlePairChange(i, "kanji", e.target.value)}
                placeholder="例: 東京"
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                value={pair.yomi}
                onChange={(e) => handlePairChange(i, "yomi", e.target.value)}
                placeholder="例: とうきょう"
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={() => removeRow(i)}
                aria-label="行を削除"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:text-foreground hover:border-foreground transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addRow}
          className="mt-3 px-3 py-1.5 text-xs border border-border rounded-lg text-muted hover:text-foreground hover:border-foreground transition-colors"
        >
          + 行を追加
        </button>
      </div>

      {/* Body text */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">本文入力</h3>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="ふりがなを付けたい文章を入力してください"
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-y"
        />
      </div>

      {/* Convert button */}
      <button
        onClick={handleConvert}
        className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/80 transition-colors"
      >
        変換
      </button>

      {/* Output */}
      {output && (
        <>
          {/* HTML code */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted">HTML出力</h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
              >
                {copied ? "コピー完了!" : "コピー"}
              </button>
            </div>
            <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {output}
            </pre>
          </div>

          {/* Rendered preview */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-medium text-muted mb-3">プレビュー</h3>
            <div
              className="text-foreground text-base leading-loose bg-background rounded-lg border border-border p-4"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
