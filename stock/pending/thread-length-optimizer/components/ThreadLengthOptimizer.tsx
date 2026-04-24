"use client";

import { useState, useMemo } from "react";

const PLATFORMS = [
  { id: "x", label: "X (Twitter)", limit: 280, color: "blue" },
  { id: "threads", label: "Threads", limit: 500, color: "purple" },
  { id: "bluesky", label: "Bluesky", limit: 300, color: "sky" },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

function splitIntoThreads(text: string, limit: number): string[] {
  if (text.length === 0) return [];
  if (text.length <= limit) return [text];

  const threads: string[] = [];
  let remaining = text.trim();

  while (remaining.length > limit) {
    // Try to break at sentence boundary (。!?.) within limit
    const slice = remaining.slice(0, limit);
    const sentenceEnd = slice.search(/[。！？!?.][^。！？!?.]*$/);

    let breakAt: number;
    if (sentenceEnd > 0) {
      // +1 to include the punctuation
      breakAt = sentenceEnd + 1;
    } else {
      // Fall back to last whitespace or newline
      const lastSpace = Math.max(
        slice.lastIndexOf(" "),
        slice.lastIndexOf("\n")
      );
      breakAt = lastSpace > 0 ? lastSpace : limit;
    }

    threads.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }

  if (remaining.length > 0) {
    threads.push(remaining);
  }

  return threads;
}

function colorClasses(color: string, variant: "bg" | "text" | "border" | "ring") {
  const map: Record<string, Record<string, string>> = {
    blue: {
      bg: "bg-blue-500",
      text: "text-blue-600",
      border: "border-blue-500",
      ring: "ring-blue-500",
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-600",
      border: "border-purple-500",
      ring: "ring-purple-500",
    },
    sky: {
      bg: "bg-sky-500",
      text: "text-sky-600",
      border: "border-sky-500",
      ring: "ring-sky-500",
    },
  };
  return map[color]?.[variant] ?? "";
}

function BarColor({
  pct,
  color,
}: {
  pct: number;
  color: string;
}) {
  const barColor =
    pct >= 100
      ? "bg-red-500"
      : pct >= 80
      ? "bg-amber-400"
      : colorClasses(color, "bg");

  return (
    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-200 ${barColor}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function ThreadCard({
  index,
  total,
  text,
  limit,
  color,
  onCopy,
  copied,
}: {
  index: number;
  total: number;
  text: string;
  limit: number;
  color: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const count = text.length;
  const over = count > limit;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${colorClasses(color, "bg")}`}
          >
            {index + 1}
          </span>
          <span className="text-xs text-gray-400">/ {total}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold tabular-nums ${
              over ? "text-red-500" : "text-gray-500"
            }`}
          >
            {count} / {limit}
          </span>
          <button
            onClick={onCopy}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-gray-400"
          >
            {copied ? "コピー済" : "コピー"}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
        {text}
      </p>
      <BarColor pct={(count / limit) * 100} color={color} />
    </div>
  );
}

export default function ThreadLengthOptimizer() {
  const [text, setText] = useState("");
  const [platformId, setPlatformId] = useState<PlatformId>("x");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const platform = PLATFORMS.find((p) => p.id === platformId)!;
  const { limit, color } = platform;

  const threads = useMemo(
    () => splitIntoThreads(text, limit),
    [text, limit]
  );

  const charCount = text.length;
  const pct = limit > 0 ? (charCount / limit) * 100 : 0;
  const isOver = charCount > limit;
  const needsSplit = threads.length > 1;

  function copyThread(index: number) {
    navigator.clipboard.writeText(threads[index]).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  }

  function copyAll() {
    const joined = threads
      .map((t, i) => `[${i + 1}/${threads.length}]\n${t}`)
      .join("\n\n");
    navigator.clipboard.writeText(joined).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    });
  }

  return (
    <div className="space-y-5">
      {/* Platform tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => {
            const active = p.id === platformId;
            return (
              <button
                key={p.id}
                onClick={() => setPlatformId(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  active
                    ? `${colorClasses(p.color, "bg")} text-white ${colorClasses(p.color, "border")}`
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {p.label}
                <span className="ml-1.5 text-xs opacity-70">{p.limit}字</span>
              </button>
            );
          })}
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ここに投稿テキストを入力してください..."
          rows={6}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y leading-relaxed placeholder:text-gray-300"
          style={{ minHeight: "120px" }}
        />

        {/* Live counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {needsSplit
                ? `スレッド分割: ${threads.length}投稿`
                : isOver
                ? "制限超過"
                : "文字数"}
            </span>
            <span
              className={`font-semibold tabular-nums ${
                isOver ? "text-red-500" : "text-gray-600"
              }`}
            >
              {charCount} / {limit}
            </span>
          </div>
          <BarColor pct={pct} color={color} />
        </div>

        {/* Status badge */}
        {text.length > 0 && (
          <div
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              needsSplit
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : isOver
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {needsSplit
              ? `${threads.length}投稿のスレッドに分割します（各${limit}字以内）`
              : isOver
              ? `${charCount - limit}字オーバーしています`
              : `残り ${limit - charCount} 字`}
          </div>
        )}
      </div>

      {/* Thread preview */}
      {threads.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              スレッドプレビュー
              {threads.length > 1 && (
                <span className="ml-2 normal-case font-normal text-gray-400">
                  {threads.length}投稿
                </span>
              )}
            </p>
            {threads.length > 1 && (
              <button
                onClick={copyAll}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 transition-colors"
              >
                {copiedAll ? "コピー済" : "全投稿をコピー"}
              </button>
            )}
          </div>

          {threads.map((t, i) => (
            <ThreadCard
              key={i}
              index={i}
              total={threads.length}
              text={t}
              limit={limit}
              color={color}
              onCopy={() => copyThread(i)}
              copied={copiedIndex === i}
            />
          ))}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">
          分割ルール
        </p>
        <p>文末（。！？!?.）を優先して分割 → なければ空白・改行で分割</p>
        <p>
          X: 280字 ／ Threads: 500字 ／ Bluesky: 300字（URLは実際の投稿では字数計算が異なる場合あり）
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このX / Threads / Bluesky 投稿最適化ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">プラットフォーム別文字数制限、スレッド分割プレビュー。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このX / Threads / Bluesky 投稿最適化ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "プラットフォーム別文字数制限、スレッド分割プレビュー。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "X / Threads / Bluesky 投稿最適化",
  "description": "プラットフォーム別文字数制限、スレッド分割プレビュー",
  "url": "https://tools.loresync.dev/thread-length-optimizer",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
