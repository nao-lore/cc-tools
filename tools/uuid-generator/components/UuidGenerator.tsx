"use client";

import { useState, useCallback } from "react";

type UuidFormat = "standard" | "no-dashes" | "uppercase" | "lowercase";

function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatUuid(uuid: string, format: UuidFormat): string {
  switch (format) {
    case "no-dashes":
      return uuid.replace(/-/g, "");
    case "uppercase":
      return uuid.toUpperCase();
    case "lowercase":
      return uuid.toLowerCase();
    default:
      return uuid;
  }
}

const BULK_OPTIONS = [1, 5, 10, 50, 100] as const;

const FORMAT_OPTIONS: { value: UuidFormat; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "no-dashes", label: "No Dashes" },
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
];

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => [generateUuidV4()]);
  const [count, setCount] = useState<number>(1);
  const [format, setFormat] = useState<UuidFormat>("standard");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = useCallback(() => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUuidV4());
    }
    setUuids(newUuids);
    setCopiedIndex(null);
    setCopiedAll(false);
  }, [count]);

  const formattedUuids = uuids.map((u) => formatUuid(u, format));

  const copyOne = useCallback(
    async (index: number) => {
      await navigator.clipboard.writeText(formattedUuids[index]);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    },
    [formattedUuids]
  );

  const copyAll = useCallback(async () => {
    await navigator.clipboard.writeText(formattedUuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }, [formattedUuids]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Count selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Count
          </label>
          <div className="flex gap-1.5">
            {BULK_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors cursor-pointer ${
                  count === n
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Format selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as UuidFormat)}
            className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          >
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 active:bg-gray-950 transition-colors cursor-pointer mb-6"
      >
        Generate UUID{count > 1 ? "s" : ""}
      </button>

      {/* Results */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header with copy all */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            {formattedUuids.length} UUID{formattedUuids.length > 1 ? "s" : ""}
          </span>
          {formattedUuids.length > 1 && (
            <button
              onClick={copyAll}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              {copiedAll ? "Copied!" : "Copy All"}
            </button>
          )}
        </div>

        {/* UUID list */}
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {formattedUuids.map((uuid, i) => (
            <div
              key={`${uuid}-${i}`}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 group"
            >
              <code className="text-sm font-mono text-gray-800 select-all">
                {uuid}
              </code>
              <button
                onClick={() => copyOne(i)}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer ml-3 shrink-0"
              >
                {copiedIndex === i ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "UUIDとは何ですか？", a: "UUID（Universally Unique Identifier）は128ビットの一意な識別子です。データベースのプライマリキー、APIのリソース識別子、セッションIDなどに広く使用されます。衝突確率は天文学的に低く、実用上は完全にユニークと見なせます。" },
            { q: "UUID v4とv7の違いは何ですか？", a: "v4はランダムに生成されるため順序性がありません。v7はUnixタイムスタンプを先頭に含むため、時系列で並べることができます。データベースのインデックス効率を考えると、v7が有利な場面が増えています。" },
            { q: "生成されたUUIDはサーバーに送信されますか？", a: "いいえ。UUIDはすべてブラウザ内でWeb Crypto APIを使って生成されます。サーバーへの通信は一切ありません。" },
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
              { "@type": "Question", "name": "UUIDとは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "UUID（Universally Unique Identifier）は128ビットの一意な識別子です。データベースのプライマリキー、APIのリソース識別子などに広く使用されます。" } },
              { "@type": "Question", "name": "UUID v4とv7の違いは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "v4はランダム生成で順序性がありません。v7はタイムスタンプを含むため時系列で並べることができ、データベースのインデックス効率が向上します。" } },
              { "@type": "Question", "name": "生成されたUUIDはサーバーに送信されますか？", "acceptedAnswer": { "@type": "Answer", "text": "いいえ。UUIDはすべてブラウザ内でWeb Crypto APIを使って生成され、サーバーへの通信は一切ありません。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/hash-generator" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">ハッシュ生成ツール</a>
            <a href="/password-generator" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">パスワード生成ツール</a>
          </div>
        </div>
      </div>
    </div>
  );
}
