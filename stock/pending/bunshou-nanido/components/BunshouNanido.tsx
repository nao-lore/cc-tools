"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------
// Analysis helpers
// ---------------------------------------------------------------

function isKanji(cp: number): boolean {
  return (
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0x20000 && cp <= 0x2a6df)
  );
}

function isHiragana(cp: number): boolean {
  return cp >= 0x3040 && cp <= 0x309f;
}

function isKatakana(cp: number): boolean {
  return (
    (cp >= 0x30a0 && cp <= 0x30ff) ||
    (cp >= 0xff65 && cp <= 0xff9f)
  );
}

function isCJKOrKana(cp: number): boolean {
  return isKanji(cp) || isHiragana(cp) || isKatakana(cp);
}

interface AnalysisResult {
  charCount: number;
  sentenceCount: number;
  avgSentenceLen: number;
  kanjiRate: number;
  hiraganaRate: number;
  katakanaRate: number;
  kanjiCount: number;
  hiraganaCount: number;
  katakanaCount: number;
  level: string;
  levelIndex: number; // 0-5
  kanjiDifficulty: "易" | "中" | "難";
  sentenceDifficulty: "易" | "中" | "難";
}

const LEVELS = [
  "小学生低学年",
  "小学生高学年",
  "中学生",
  "高校生",
  "大学生",
  "専門書",
] as const;

function analyze(text: string): AnalysisResult | null {
  if (!text.trim()) return null;

  const chars = [...text];
  const charCount = chars.length;

  // Count character types
  let kanjiCount = 0;
  let hiraganaCount = 0;
  let katakanaCount = 0;
  let cjkTotal = 0;

  for (const ch of chars) {
    const cp = ch.codePointAt(0) ?? 0;
    if (isKanji(cp)) {
      kanjiCount++;
      cjkTotal++;
    } else if (isHiragana(cp)) {
      hiraganaCount++;
      cjkTotal++;
    } else if (isKatakana(cp)) {
      katakanaCount++;
      cjkTotal++;
    }
  }

  // Sentence split on 。！？ (and their fullwidth variants), ignore empty
  const sentences = text
    .split(/[。！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentenceCount = sentences.length;

  const avgSentenceLen =
    sentenceCount > 0
      ? Math.round(
          sentences.reduce((sum, s) => sum + [...s].length, 0) / sentenceCount
        )
      : 0;

  const kanjiRate = charCount > 0 ? kanjiCount / charCount : 0;
  const hiraganaRate = charCount > 0 ? hiraganaCount / charCount : 0;
  const katakanaRate = charCount > 0 ? katakanaCount / charCount : 0;

  // Kanji difficulty
  const kanjiDifficulty: "易" | "中" | "難" =
    kanjiRate >= 0.30 ? "難" : kanjiRate >= 0.20 ? "中" : "易";

  // Sentence length difficulty
  const sentenceDifficulty: "易" | "中" | "難" =
    avgSentenceLen >= 50 ? "難" : avgSentenceLen >= 30 ? "中" : "易";

  // Combined level index (0-5)
  const kanjiScore =
    kanjiDifficulty === "難" ? 2 : kanjiDifficulty === "中" ? 1 : 0;
  const sentScore =
    sentenceDifficulty === "難" ? 2 : sentenceDifficulty === "中" ? 1 : 0;

  const rawScore = kanjiScore * 2 + sentScore; // 0-6
  const levelIndex = Math.min(Math.round((rawScore / 6) * 5), 5);
  const level = LEVELS[levelIndex];

  return {
    charCount,
    sentenceCount,
    avgSentenceLen,
    kanjiRate,
    hiraganaRate,
    katakanaRate,
    kanjiCount,
    hiraganaCount,
    katakanaCount,
    kanjiDifficulty,
    sentenceDifficulty,
    level,
    levelIndex,
  };
}

// ---------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------

function DifficultyBadge({ label }: { label: "易" | "中" | "難" }) {
  const colors = {
    易: "bg-green-100 text-green-700 border-green-300",
    中: "bg-yellow-100 text-yellow-700 border-yellow-300",
    難: "bg-red-100 text-red-700 border-red-300",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded border text-sm font-bold ${colors[label]}`}
    >
      {label}
    </span>
  );
}

const LEVEL_COLORS = [
  "bg-green-400",
  "bg-lime-400",
  "bg-yellow-400",
  "bg-orange-400",
  "bg-red-400",
  "bg-red-700",
];

function LevelGauge({ levelIndex }: { levelIndex: number }) {
  return (
    <div className="w-full">
      <div className="flex gap-1 mb-1">
        {LEVELS.map((name, i) => (
          <div key={name} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-6 w-full rounded transition-all duration-300 ${
                i === levelIndex
                  ? `${LEVEL_COLORS[i]} ring-2 ring-offset-1 ring-gray-400 scale-110`
                  : i < levelIndex
                  ? `${LEVEL_COLORS[i]} opacity-40`
                  : "bg-gray-200"
              }`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {LEVELS.map((name, i) => (
          <div key={name} className="flex-1 text-center">
            <span
              className={`text-[10px] leading-tight block ${
                i === levelIndex ? "font-bold text-gray-800" : "text-gray-400"
              }`}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "易" | "中" | "難";
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="flex items-center gap-2 font-mono font-semibold text-gray-800">
        {value}
        {badge && <DifficultyBadge label={badge} />}
      </span>
    </div>
  );
}

function CharBar({
  kanjiRate,
  hiraganaRate,
  katakanaRate,
}: {
  kanjiRate: number;
  hiraganaRate: number;
  katakanaRate: number;
}) {
  const otherRate = Math.max(
    0,
    1 - kanjiRate - hiraganaRate - katakanaRate
  );
  const pct = (r: number) => `${(r * 100).toFixed(1)}%`;

  return (
    <div className="w-full">
      <div className="flex h-5 rounded overflow-hidden w-full">
        <div
          className="bg-red-400 transition-all duration-300"
          style={{ width: pct(kanjiRate) }}
          title={`漢字 ${pct(kanjiRate)}`}
        />
        <div
          className="bg-blue-300 transition-all duration-300"
          style={{ width: pct(hiraganaRate) }}
          title={`ひらがな ${pct(hiraganaRate)}`}
        />
        <div
          className="bg-purple-300 transition-all duration-300"
          style={{ width: pct(katakanaRate) }}
          title={`カタカナ ${pct(katakanaRate)}`}
        />
        <div
          className="bg-gray-200 transition-all duration-300"
          style={{ width: pct(otherRate) }}
          title={`その他 ${pct(otherRate)}`}
        />
      </div>
      <div className="flex gap-3 mt-1 flex-wrap">
        {[
          { color: "bg-red-400", label: "漢字" },
          { color: "bg-blue-300", label: "ひらがな" },
          { color: "bg-purple-300", label: "カタカナ" },
          { color: "bg-gray-200", label: "その他" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1 text-xs text-gray-500">
            <span className={`inline-block w-3 h-3 rounded-sm ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------

const SAMPLE_TEXT =
  "人工知能の発展により、従来の業務プロセスは大きく変容しつつある。機械学習アルゴリズムの高度化と計算資源の低廉化が相まって、専門的知識を要する領域においても自動化が進展している。この潮流は産業構造の再編を促し、労働市場における人材需要の質的変化をもたらすと考えられる。";

export default function BunshouNanido() {
  const [text, setText] = useState("");

  const result = useMemo(() => analyze(text), [text]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            文章難易度判定ツール
          </h1>
          <p className="text-sm text-gray-500">
            漢字含有率・平均文長・文字数から可読性レベルを判定します
          </p>
        </div>

        {/* Ad placeholder top */}
        <div className="w-full h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
          <span className="text-xs text-gray-400">広告</span>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              判定したい文章を入力
            </label>
            <button
              onClick={() => setText(SAMPLE_TEXT)}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              サンプル文を試す
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ここに文章を貼り付けてください..."
            className="w-full h-40 resize-none rounded-lg border border-gray-200 p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">
              {[...text].length.toLocaleString()} 文字
            </span>
            {text && (
              <button
                onClick={() => setText("")}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                クリア
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="space-y-4">
            {/* Level gauge */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-3">
                総合難易度レベル
              </h2>
              <div className="mb-3 text-center">
                <span
                  className={`text-xl font-bold px-4 py-1 rounded-full text-white ${LEVEL_COLORS[result.levelIndex]}`}
                >
                  {result.level}
                </span>
              </div>
              <LevelGauge levelIndex={result.levelIndex} />
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-2">
                分析結果
              </h2>
              <StatRow
                label="総文字数"
                value={result.charCount.toLocaleString() + " 文字"}
              />
              <StatRow
                label="文数（句点区切り）"
                value={result.sentenceCount.toLocaleString() + " 文"}
              />
              <StatRow
                label="平均文長"
                value={result.avgSentenceLen + " 文字/文"}
                badge={result.sentenceDifficulty}
              />
              <StatRow
                label="漢字率"
                value={(result.kanjiRate * 100).toFixed(1) + "%"}
                badge={result.kanjiDifficulty}
              />
              <StatRow
                label="ひらがな率"
                value={(result.hiraganaRate * 100).toFixed(1) + "%"}
              />
              <StatRow
                label="カタカナ率"
                value={(result.katakanaRate * 100).toFixed(1) + "%"}
              />
            </div>

            {/* Char composition bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-3">
                文字構成
              </h2>
              <CharBar
                kanjiRate={result.kanjiRate}
                hiraganaRate={result.hiraganaRate}
                katakanaRate={result.katakanaRate}
              />
            </div>

            {/* Difficulty breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-3">
                判定根拠
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">漢字含有率</p>
                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    {(result.kanjiRate * 100).toFixed(1)}%
                  </p>
                  <DifficultyBadge label={result.kanjiDifficulty} />
                  <p className="text-xs text-gray-400 mt-1">
                    30%以上=難 / 20-30%=中 / 20%未満=易
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">平均文長</p>
                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    {result.avgSentenceLen}字
                  </p>
                  <DifficultyBadge label={result.sentenceDifficulty} />
                  <p className="text-xs text-gray-400 mt-1">
                    50字以上=難 / 30-50字=中 / 30字未満=易
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm">文章を入力すると難易度を判定します</p>
          </div>
        )}

        {/* Ad placeholder bottom */}
        <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center mt-8">
          <span className="text-xs text-gray-400">広告</span>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この文章難易度判定ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">文字数・漢字含有率・平均文長・語彙難易度から可読性スコア算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この文章難易度判定ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "文字数・漢字含有率・平均文長・語彙難易度から可読性スコア算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "文章難易度判定",
  "description": "文字数・漢字含有率・平均文長・語彙難易度から可読性スコア算出",
  "url": "https://tools.loresync.dev/bunshou-nanido",
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
