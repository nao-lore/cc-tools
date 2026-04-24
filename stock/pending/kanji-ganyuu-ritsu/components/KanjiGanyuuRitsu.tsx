"use client";

import { useState, useCallback } from "react";

// --- Types ---
interface CharStats {
  kanji: number;
  hiragana: number;
  katakana: number;
  ascii: number;
  other: number;
  total: number;
}

interface SegmentInfo {
  char: string;
  type: "kanji" | "hiragana" | "katakana" | "ascii" | "other";
}

// --- Helpers ---
function isKanji(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0x20000 && code <= 0x2a6df)
  );
}
function isHiragana(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x3041 && code <= 0x3096;
}
function isKatakana(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (code >= 0x30a1 && code <= 0x30fa) || (code >= 0xff66 && code <= 0xff9f);
}
function isAscii(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x21 && code <= 0x7e;
}

function analyzeText(text: string): { stats: CharStats; segments: SegmentInfo[] } {
  const stats: CharStats = { kanji: 0, hiragana: 0, katakana: 0, ascii: 0, other: 0, total: 0 };
  const segments: SegmentInfo[] = [];

  for (const ch of text) {
    if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t" || ch === "　") continue;
    stats.total++;
    if (isKanji(ch)) {
      stats.kanji++;
      segments.push({ char: ch, type: "kanji" });
    } else if (isHiragana(ch)) {
      stats.hiragana++;
      segments.push({ char: ch, type: "hiragana" });
    } else if (isKatakana(ch)) {
      stats.katakana++;
      segments.push({ char: ch, type: "katakana" });
    } else if (isAscii(ch)) {
      stats.ascii++;
      segments.push({ char: ch, type: "ascii" });
    } else {
      stats.other++;
      segments.push({ char: ch, type: "other" });
    }
  }
  return { stats, segments };
}

function pct(n: number, total: number): string {
  if (total === 0) return "0.0";
  return ((n / total) * 100).toFixed(1);
}

// --- Sub-components ---
interface BarProps {
  label: string;
  count: number;
  total: number;
  color: string;
  bgColor: string;
}
function StatBar({ label, count, total, color, bgColor }: BarProps) {
  const p = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-medium ${color}`}>{label}</span>
        <span className="text-sm text-gray-700">
          {count}文字 <span className="text-gray-400 ml-1">({pct(count, total)}%)</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${bgColor}`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}

// --- Main Component ---
export default function KanjiGanyuuRitsu() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ stats: CharStats; segments: SegmentInfo[] } | null>(null);

  const analyze = useCallback(() => {
    if (!text.trim()) return;
    setResult(analyzeText(text));
  }, [text]);

  const sample =
    "東京は日本の首都です。The weather is nice today. カタカナも含まれています。漢字の割合を分析しましょう。";

  const typeColor: Record<SegmentInfo["type"], string> = {
    kanji: "bg-red-100 text-red-800 border-red-200",
    hiragana: "bg-blue-100 text-blue-800 border-blue-200",
    katakana: "bg-green-100 text-green-800 border-green-200",
    ascii: "bg-yellow-100 text-yellow-800 border-yellow-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">分析するテキスト</label>
          <button
            onClick={() => setText(sample)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            サンプルを使う
          </button>
        </div>
        <textarea
          className="w-full h-40 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="分析したいテキストを入力してください…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{text.length}文字入力中</span>
          <button
            onClick={analyze}
            disabled={!text.trim()}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            分析する
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">文字種別 内訳</h2>
            <div className="mb-4 text-sm text-gray-500">
              対象文字数: <span className="font-bold text-gray-800">{result.stats.total}</span>
              文字（空白・改行を除く）
            </div>
            <StatBar
              label="漢字"
              count={result.stats.kanji}
              total={result.stats.total}
              color="text-red-700"
              bgColor="bg-red-500"
            />
            <StatBar
              label="ひらがな"
              count={result.stats.hiragana}
              total={result.stats.total}
              color="text-blue-700"
              bgColor="bg-blue-500"
            />
            <StatBar
              label="カタカナ"
              count={result.stats.katakana}
              total={result.stats.total}
              color="text-green-700"
              bgColor="bg-green-500"
            />
            <StatBar
              label="英数字・記号 (ASCII)"
              count={result.stats.ascii}
              total={result.stats.total}
              color="text-yellow-700"
              bgColor="bg-yellow-500"
            />
            <StatBar
              label="その他"
              count={result.stats.other}
              total={result.stats.total}
              color="text-gray-600"
              bgColor="bg-gray-400"
            />
          </div>

          {/* Difficulty meter */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">難読度スコア</h2>
            {(() => {
              const kanjiRatio = result.stats.total > 0 ? result.stats.kanji / result.stats.total : 0;
              const score = Math.round(kanjiRatio * 100);
              let label = "やさしい";
              let color = "text-green-600";
              let bg = "bg-green-500";
              if (score >= 40) { label = "やや難しい"; color = "text-orange-600"; bg = "bg-orange-500"; }
              if (score >= 60) { label = "難しい"; color = "text-red-600"; bg = "bg-red-500"; }
              return (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-3xl font-bold ${color}`}>{score}</span>
                    <span className="text-gray-400">/ 100</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${color} bg-opacity-10 border border-current`}>{label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className={`h-4 rounded-full ${bg} transition-all duration-700`} style={{ width: `${score}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">漢字比率が高いほど難読度が上がります（漢字含有率 {pct(result.stats.kanji, result.stats.total)}%）</p>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この漢字含有率計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">テキスト中の漢字・ひらがな・カタカナ・英数字の比率を分析。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この漢字含有率計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "テキスト中の漢字・ひらがな・カタカナ・英数字の比率を分析。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })()}
          </div>

          {/* Colored segments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">文字ハイライト</h2>
            <div className="flex flex-wrap gap-0.5 font-mono text-base leading-loose">
              {result.segments.map((seg, i) => (
                <span
                  key={i}
                  className={`px-0.5 rounded border ${typeColor[seg.type]}`}
                  title={seg.type}
                >
                  {seg.char}
                </span>
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 text-xs">
              {(
                [
                  { type: "kanji", label: "漢字" },
                  { type: "hiragana", label: "ひらがな" },
                  { type: "katakana", label: "カタカナ" },
                  { type: "ascii", label: "ASCII" },
                  { type: "other", label: "その他" },
                ] as const
              ).map(({ type, label }) => (
                <span key={type} className={`px-2 py-0.5 rounded border ${typeColor[type]}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "漢字含有率計算",
  "description": "テキスト中の漢字・ひらがな・カタカナ・英数字の比率を分析",
  "url": "https://tools.loresync.dev/kanji-ganyuu-ritsu",
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
