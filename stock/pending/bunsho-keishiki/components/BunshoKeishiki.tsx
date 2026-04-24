"use client";

import { useState } from "react";

// 頭語・結語ペア
const TOGO_KETSUGO_PAIRS: Record<string, string> = {
  拝啓: "敬具",
  謹啓: "謹白",
  前略: "草々",
  急啓: "敬具",
};

// 月別時候の挨拶
const JIKO_BY_MONTH: Record<number, { formal: string; casual: string }> = {
  1: { formal: "厳寒の候", casual: "寒さ厳しい折" },
  2: { formal: "余寒の候", casual: "梅の便りも聞かれる頃" },
  3: { formal: "早春の候", casual: "春めいてまいりました" },
  4: { formal: "陽春の候", casual: "花見の季節となりました" },
  5: { formal: "新緑の候", casual: "新緑の美しい季節" },
  6: { formal: "梅雨の候", casual: "紫陽花の花が咲く頃" },
  7: { formal: "盛夏の候", casual: "暑さ厳しい折" },
  8: { formal: "晩夏の候", casual: "残暑お見舞い申し上げます" },
  9: { formal: "初秋の候", casual: "秋風が感じられる頃" },
  10: { formal: "秋冷の候", casual: "秋も深まってまいりました" },
  11: { formal: "晩秋の候", casual: "木枯らしが吹く季節" },
  12: { formal: "師走の候", casual: "年の瀬も押し迫った頃" },
};

// プリセットテンプレート
const PRESETS: Record<string, { name: string; body: string }> = {
  orei: {
    name: "お礼状",
    body: "先日はお心遣いをいただきまして、誠にありがとうございました。\nご厚情に深く感謝申し上げます。\n今後ともどうぞよろしくお願い申し上げます。",
  },
  owabi: {
    name: "お詫び状",
    body: "この度は弊社の不手際により、多大なるご迷惑をおかけいたしましたことを、深くお詫び申し上げます。\n今後このようなことが再び起きないよう、再発防止に努めてまいります。\n何卒ご容赦くださいますよう、お願い申し上げます。",
  },
  annai: {
    name: "案内状",
    body: "この度、下記のとおりご案内申し上げます。\n\n【日時】〇〇年〇〇月〇〇日（〇）〇〇時〜\n【場所】〇〇\n【内容】〇〇\n\nお誘い合わせのうえ、ぜひご参加くださいますようお願い申し上げます。",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
    >
      {copied ? "コピー済" : "コピー"}
    </button>
  );
}

export default function BunshoKeishiki() {
  const currentMonth = new Date().getMonth() + 1;

  const [body, setBody] = useState("");
  const [month, setMonth] = useState<number>(currentMonth);
  const [togo, setTogo] = useState<string>("拝啓");
  const [vertical, setVertical] = useState(false);

  const ketsug0 = TOGO_KETSUGO_PAIRS[togo] ?? "敬具";
  const jiko = JIKO_BY_MONTH[month];
  const jikoText = jiko ? `${jiko.formal}、${jiko.casual}折柄、` : "";

  const formattedLetter = [
    togo,
    "",
    `　${jikoText}ますますご清栄のこととお慶び申し上げます。`,
    "",
    body
      .split("\n")
      .map((line) => (line.trim() ? `　${line}` : ""))
      .join("\n"),
    "",
    `　　　　　　　　　　　　　　　　${ketsug0}`,
  ]
    .join("\n")
    .trim();

  const handlePreset = (key: string) => {
    setBody(PRESETS[key]?.body ?? "");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">ビジネスレター整形ツール</h1>
        <p className="text-muted text-sm">
          本文を入力すると、拝啓・時候の挨拶・敬具を自動で付けた正式な書式に整形します。
        </p>
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 頭語 */}
          <div>
            <label className="text-muted text-xs block mb-1">頭語</label>
            <select
              value={togo}
              onChange={(e) => setTogo(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(TOGO_KETSUG0_PAIRS).map((t) => (
                <option key={t} value={t}>
                  {t}（結語: {TOGO_KETSUG0_PAIRS[t]}）
                </option>
              ))}
            </select>
          </div>

          {/* 月 */}
          <div>
            <label className="text-muted text-xs block mb-1">月（時候の挨拶）</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}月 — {JIKO_BY_MONTH[m].formal}
                </option>
              ))}
            </select>
          </div>

          {/* 縦書き */}
          <div className="flex flex-col justify-end">
            <label className="text-muted text-xs block mb-1">出力形式</label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                className={`relative w-10 h-5 rounded-full transition-colors ${vertical ? "bg-accent" : "bg-gray-300"}`}
                onClick={() => setVertical(!vertical)}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${vertical ? "translate-x-5" : ""}`}
                />
              </div>
              <span className="text-sm text-gray-700">縦書き表示</span>
            </label>
          </div>
        </div>

        {/* プリセット */}
        <div>
          <label className="text-muted text-xs block mb-2">プリセット</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePreset(key)}
                className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {preset.name}
              </button>
            ))}
            <button
              onClick={() => setBody("")}
              className="px-3 py-1.5 text-sm border border-border rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
            >
              クリア
            </button>
          </div>
        </div>
      </div>

      {/* 本文入力 */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <label className="text-muted text-xs block mb-2">本文（拝啓〜敬具の間に入る内容）</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="本文を入力してください。プリセットから選ぶこともできます。"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* プレビュー */}
      {(body || true) && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">プレビュー</h2>
            <CopyButton text={formattedLetter} />
          </div>

          {vertical ? (
            <div
              className="border border-border rounded-lg p-6 bg-white overflow-x-auto"
              style={{
                writingMode: "vertical-rl",
                minHeight: "200px",
                maxHeight: "480px",
              }}
            >
              <pre
                className="text-sm text-gray-800 font-serif whitespace-pre-wrap leading-loose"
                style={{ writingMode: "vertical-rl" }}
              >
                {formattedLetter}
              </pre>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-serif leading-loose border border-border rounded-lg p-4 bg-white">
              {formattedLetter}
            </pre>
          )}

          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-muted text-xs">
              <span className="font-medium">時候の挨拶：</span>
              {JIKO_BY_MONTH[month].formal}（{JIKO_BY_MONTH[month].casual}）
            </p>
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この文書テンプレート整形ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ビジネス文書の形式（拝啓・敬具・時候の挨拶）を整える。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この文書テンプレート整形ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ビジネス文書の形式（拝啓・敬具・時候の挨拶）を整える。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
