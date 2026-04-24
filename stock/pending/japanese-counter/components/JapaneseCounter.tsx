"use client";

import { useState, useMemo } from "react";

type Reading = { num: number; reading: string; irregular?: boolean };

type Counter = {
  counter: string;
  reading: string;
  what: string;
  examples: string;
  readings: Reading[];
  tricky?: boolean;
  trickyNote?: string;
};

const COUNTERS: Counter[] = [
  {
    counter: "本",
    reading: "ほん・ぽん・ぼん",
    what: "細長いもの",
    examples: "鉛筆・ペン・ビン・木・川",
    readings: [
      { num: 1, reading: "いっぽん", irregular: true },
      { num: 2, reading: "にほん" },
      { num: 3, reading: "さんぼん", irregular: true },
      { num: 4, reading: "よんほん" },
      { num: 5, reading: "ごほん" },
      { num: 6, reading: "ろっぽん", irregular: true },
      { num: 7, reading: "ななほん" },
      { num: 8, reading: "はっぽん", irregular: true },
      { num: 9, reading: "きゅうほん" },
      { num: 10, reading: "じゅっぽん", irregular: true },
    ],
    tricky: true,
    trickyNote: "1・3・6・8・10本で音が変わる（連濁・半濁音）",
  },
  {
    counter: "冊",
    reading: "さつ",
    what: "本・雑誌",
    examples: "本・ノート・雑誌・辞書",
    readings: [
      { num: 1, reading: "いっさつ", irregular: true },
      { num: 2, reading: "にさつ" },
      { num: 3, reading: "さんさつ" },
      { num: 4, reading: "よんさつ" },
      { num: 5, reading: "ごさつ" },
      { num: 6, reading: "ろくさつ" },
      { num: 7, reading: "ななさつ" },
      { num: 8, reading: "はっさつ", irregular: true },
      { num: 9, reading: "きゅうさつ" },
      { num: 10, reading: "じゅっさつ", irregular: true },
    ],
  },
  {
    counter: "匹",
    reading: "ひき・ぴき・びき",
    what: "小動物・魚・虫",
    examples: "犬・猫・魚・虫・ウサギ",
    readings: [
      { num: 1, reading: "いっぴき", irregular: true },
      { num: 2, reading: "にひき" },
      { num: 3, reading: "さんびき", irregular: true },
      { num: 4, reading: "よんひき" },
      { num: 5, reading: "ごひき" },
      { num: 6, reading: "ろっぴき", irregular: true },
      { num: 7, reading: "ななひき" },
      { num: 8, reading: "はっぴき", irregular: true },
      { num: 9, reading: "きゅうひき" },
      { num: 10, reading: "じゅっぴき", irregular: true },
    ],
    tricky: true,
    trickyNote: "大型動物（牛・馬）は「頭」、鳥類は「羽」を使う",
  },
  {
    counter: "羽",
    reading: "わ",
    what: "鳥・ウサギ",
    examples: "鶏・スズメ・ウサギ・ハト",
    readings: [
      { num: 1, reading: "いちわ" },
      { num: 2, reading: "にわ" },
      { num: 3, reading: "さんわ" },
      { num: 4, reading: "よんわ" },
      { num: 5, reading: "ごわ" },
      { num: 6, reading: "ろくわ" },
      { num: 7, reading: "ななわ" },
      { num: 8, reading: "はちわ" },
      { num: 9, reading: "きゅうわ" },
      { num: 10, reading: "じゅうわ" },
    ],
    tricky: true,
    trickyNote: "ウサギは鳥でないが「羽」を使う慣習がある",
  },
  {
    counter: "枚",
    reading: "まい",
    what: "薄いもの・平たいもの",
    examples: "紙・皿・シャツ・葉・板",
    readings: [
      { num: 1, reading: "いちまい" },
      { num: 2, reading: "にまい" },
      { num: 3, reading: "さんまい" },
      { num: 4, reading: "よんまい" },
      { num: 5, reading: "ごまい" },
      { num: 6, reading: "ろくまい" },
      { num: 7, reading: "ななまい" },
      { num: 8, reading: "はちまい" },
      { num: 9, reading: "きゅうまい" },
      { num: 10, reading: "じゅうまい" },
    ],
  },
  {
    counter: "個",
    reading: "こ",
    what: "小さい立体物・果物",
    examples: "りんご・石・卵・消しゴム",
    readings: [
      { num: 1, reading: "いっこ", irregular: true },
      { num: 2, reading: "にこ" },
      { num: 3, reading: "さんこ" },
      { num: 4, reading: "よんこ" },
      { num: 5, reading: "ごこ" },
      { num: 6, reading: "ろっこ", irregular: true },
      { num: 7, reading: "ななこ" },
      { num: 8, reading: "はっこ", irregular: true },
      { num: 9, reading: "きゅうこ" },
      { num: 10, reading: "じゅっこ", irregular: true },
    ],
  },
  {
    counter: "台",
    reading: "だい",
    what: "機械・乗り物",
    examples: "車・自転車・パソコン・テレビ",
    readings: [
      { num: 1, reading: "いちだい" },
      { num: 2, reading: "にだい" },
      { num: 3, reading: "さんだい" },
      { num: 4, reading: "よんだい" },
      { num: 5, reading: "ごだい" },
      { num: 6, reading: "ろくだい" },
      { num: 7, reading: "ななだい" },
      { num: 8, reading: "はちだい" },
      { num: 9, reading: "きゅうだい" },
      { num: 10, reading: "じゅうだい" },
    ],
  },
  {
    counter: "杯",
    reading: "はい・ぱい・ばい",
    what: "飲み物・器に入ったもの",
    examples: "コーヒー・お茶・ご飯・スープ",
    readings: [
      { num: 1, reading: "いっぱい", irregular: true },
      { num: 2, reading: "にはい" },
      { num: 3, reading: "さんばい", irregular: true },
      { num: 4, reading: "よんはい" },
      { num: 5, reading: "ごはい" },
      { num: 6, reading: "ろっぱい", irregular: true },
      { num: 7, reading: "ななはい" },
      { num: 8, reading: "はっぱい", irregular: true },
      { num: 9, reading: "きゅうはい" },
      { num: 10, reading: "じゅっぱい", irregular: true },
    ],
    tricky: true,
    trickyNote: "「いっぱい」は「満杯」の意味にもなる",
  },
  {
    counter: "着",
    reading: "ちゃく",
    what: "衣類一式",
    examples: "スーツ・着物・コート・制服",
    readings: [
      { num: 1, reading: "いちちゃく" },
      { num: 2, reading: "にちゃく" },
      { num: 3, reading: "さんちゃく" },
      { num: 4, reading: "よんちゃく" },
      { num: 5, reading: "ごちゃく" },
      { num: 6, reading: "ろくちゃく" },
      { num: 7, reading: "ななちゃく" },
      { num: 8, reading: "はちちゃく" },
      { num: 9, reading: "きゅうちゃく" },
      { num: 10, reading: "じゅうちゃく" },
    ],
    tricky: true,
    trickyNote: "靴下・手袋などペアのものは「足（そく）」を使う",
  },
  {
    counter: "足",
    reading: "そく",
    what: "靴・靴下などペアのもの",
    examples: "靴・靴下・ハイヒール・スリッパ",
    readings: [
      { num: 1, reading: "いっそく", irregular: true },
      { num: 2, reading: "にそく" },
      { num: 3, reading: "さんそく" },
      { num: 4, reading: "よんそく" },
      { num: 5, reading: "ごそく" },
      { num: 6, reading: "ろくそく" },
      { num: 7, reading: "ななそく" },
      { num: 8, reading: "はっそく", irregular: true },
      { num: 9, reading: "きゅうそく" },
      { num: 10, reading: "じゅっそく", irregular: true },
    ],
  },
  {
    counter: "軒",
    reading: "けん",
    what: "建物・家・お店",
    examples: "家・マンション・お店・工場",
    readings: [
      { num: 1, reading: "いっけん", irregular: true },
      { num: 2, reading: "にけん" },
      { num: 3, reading: "さんけん" },
      { num: 4, reading: "よんけん" },
      { num: 5, reading: "ごけん" },
      { num: 6, reading: "ろっけん", irregular: true },
      { num: 7, reading: "ななけん" },
      { num: 8, reading: "はっけん", irregular: true },
      { num: 9, reading: "きゅうけん" },
      { num: 10, reading: "じゅっけん", irregular: true },
    ],
  },
  {
    counter: "頭",
    reading: "とう",
    what: "大型動物",
    examples: "牛・馬・象・クジラ・ライオン",
    readings: [
      { num: 1, reading: "いっとう", irregular: true },
      { num: 2, reading: "にとう" },
      { num: 3, reading: "さんとう" },
      { num: 4, reading: "よんとう" },
      { num: 5, reading: "ごとう" },
      { num: 6, reading: "ろくとう" },
      { num: 7, reading: "ななとう" },
      { num: 8, reading: "はっとう", irregular: true },
      { num: 9, reading: "きゅうとう" },
      { num: 10, reading: "じゅっとう", irregular: true },
    ],
    tricky: true,
    trickyNote: "小動物は「匹」、鳥は「羽」。大型のみ「頭」",
  },
  {
    counter: "人",
    reading: "にん・り",
    what: "人",
    examples: "友達・学生・社員・家族",
    readings: [
      { num: 1, reading: "ひとり", irregular: true },
      { num: 2, reading: "ふたり", irregular: true },
      { num: 3, reading: "さんにん" },
      { num: 4, reading: "よにん" },
      { num: 5, reading: "ごにん" },
      { num: 6, reading: "ろくにん" },
      { num: 7, reading: "しちにん / ななにん", irregular: true },
      { num: 8, reading: "はちにん" },
      { num: 9, reading: "きゅうにん / くにん", irregular: true },
      { num: 10, reading: "じゅうにん" },
    ],
    tricky: true,
    trickyNote: "1人・2人は「ひとり・ふたり」と完全に別の読み",
  },
  {
    counter: "階",
    reading: "かい",
    what: "建物の階数",
    examples: "1階・2階・地下1階",
    readings: [
      { num: 1, reading: "いっかい", irregular: true },
      { num: 2, reading: "にかい" },
      { num: 3, reading: "さんかい / さんがい", irregular: true },
      { num: 4, reading: "よんかい" },
      { num: 5, reading: "ごかい" },
      { num: 6, reading: "ろっかい", irregular: true },
      { num: 7, reading: "ななかい" },
      { num: 8, reading: "はっかい / はちかい", irregular: true },
      { num: 9, reading: "きゅうかい" },
      { num: 10, reading: "じゅっかい", irregular: true },
    ],
    tricky: true,
    trickyNote: "3階は「さんがい」とも読む。回数の「回」と同じ読み",
  },
  {
    counter: "回",
    reading: "かい",
    what: "回数・頻度",
    examples: "1回目・2回戦・何回も",
    readings: [
      { num: 1, reading: "いっかい", irregular: true },
      { num: 2, reading: "にかい" },
      { num: 3, reading: "さんかい" },
      { num: 4, reading: "よんかい" },
      { num: 5, reading: "ごかい" },
      { num: 6, reading: "ろっかい", irregular: true },
      { num: 7, reading: "ななかい" },
      { num: 8, reading: "はっかい", irregular: true },
      { num: 9, reading: "きゅうかい" },
      { num: 10, reading: "じゅっかい", irregular: true },
    ],
  },
  {
    counter: "件",
    reading: "けん",
    what: "事柄・案件",
    examples: "メール・事件・問い合わせ・注文",
    readings: [
      { num: 1, reading: "いっけん", irregular: true },
      { num: 2, reading: "にけん" },
      { num: 3, reading: "さんけん" },
      { num: 4, reading: "よんけん" },
      { num: 5, reading: "ごけん" },
      { num: 6, reading: "ろっけん", irregular: true },
      { num: 7, reading: "ななけん" },
      { num: 8, reading: "はっけん", irregular: true },
      { num: 9, reading: "きゅうけん" },
      { num: 10, reading: "じゅっけん", irregular: true },
    ],
  },
  {
    counter: "通",
    reading: "つう",
    what: "手紙・メール・文書",
    examples: "手紙・メール・ファックス・通知",
    readings: [
      { num: 1, reading: "いっつう", irregular: true },
      { num: 2, reading: "につう" },
      { num: 3, reading: "さんつう" },
      { num: 4, reading: "よんつう" },
      { num: 5, reading: "ごつう" },
      { num: 6, reading: "ろくつう" },
      { num: 7, reading: "ななつう" },
      { num: 8, reading: "はっつう", irregular: true },
      { num: 9, reading: "きゅうつう" },
      { num: 10, reading: "じゅっつう", irregular: true },
    ],
  },
  {
    counter: "組",
    reading: "くみ",
    what: "セット・ペア",
    examples: "夫婦・親子・チーム・セット商品",
    readings: [
      { num: 1, reading: "ひとくみ" },
      { num: 2, reading: "ふたくみ" },
      { num: 3, reading: "みくみ / さんくみ" },
      { num: 4, reading: "よくみ / よんくみ" },
      { num: 5, reading: "いつくみ / ごくみ" },
      { num: 6, reading: "むくみ / ろくくみ" },
      { num: 7, reading: "ななくみ" },
      { num: 8, reading: "はちくみ" },
      { num: 9, reading: "きゅうくみ" },
      { num: 10, reading: "じゅうくみ" },
    ],
  },
  {
    counter: "丁",
    reading: "ちょう",
    what: "豆腐・刃物",
    examples: "豆腐・包丁・拳銃",
    readings: [
      { num: 1, reading: "いっちょう", irregular: true },
      { num: 2, reading: "にちょう" },
      { num: 3, reading: "さんちょう" },
      { num: 4, reading: "よんちょう" },
      { num: 5, reading: "ごちょう" },
      { num: 6, reading: "ろくちょう" },
      { num: 7, reading: "ななちょう" },
      { num: 8, reading: "はちちょう" },
      { num: 9, reading: "きゅうちょう" },
      { num: 10, reading: "じゅっちょう", irregular: true },
    ],
    tricky: true,
    trickyNote: "豆腐は「個」とも言えるが「丁」が正式",
  },
  {
    counter: "膳",
    reading: "ぜん",
    what: "箸・食事の膳",
    examples: "お箸・お膳・食事のセット",
    readings: [
      { num: 1, reading: "いちぜん" },
      { num: 2, reading: "にぜん" },
      { num: 3, reading: "さんぜん" },
      { num: 4, reading: "よんぜん" },
      { num: 5, reading: "ごぜん" },
      { num: 6, reading: "ろくぜん" },
      { num: 7, reading: "ななぜん" },
      { num: 8, reading: "はちぜん" },
      { num: 9, reading: "きゅうぜん" },
      { num: 10, reading: "じゅうぜん" },
    ],
  },
];

const TRICKY = COUNTERS.filter((c) => c.tricky);

export default function JapaneseCounter() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Counter | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTERS;
    const q = query.trim().toLowerCase();
    return COUNTERS.filter(
      (c) =>
        c.counter.includes(q) ||
        c.reading.includes(q) ||
        c.what.includes(q) ||
        c.examples.includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">助数詞ガイド</h1>
      <p className="text-muted text-sm mb-6">
        物・動物・薄いものなど、正しい助数詞と読み方を調べる
      </p>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例：犬、本、まい…"
          className="w-full border border-border rounded-xl px-4 py-2 bg-surface text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-4xl font-bold">{selected.counter}</span>
                <span className="ml-3 text-muted text-sm">{selected.reading}</span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-muted mb-1">
              <span className="font-medium text-foreground">数えるもの：</span>
              {selected.what}
            </p>
            <p className="text-sm text-muted mb-4">
              <span className="font-medium text-foreground">例：</span>
              {selected.examples}
            </p>

            {selected.tricky && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm text-yellow-800">
                <span className="font-semibold">注意：</span> {selected.trickyNote}
              </div>
            )}

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted font-normal w-10">数</th>
                  <th className="text-left py-2 text-muted font-normal">読み方</th>
                </tr>
              </thead>
              <tbody>
                {selected.readings.map((r) => (
                  <tr key={r.num} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">{r.num}</td>
                    <td className={`py-2 ${r.irregular ? "text-accent font-semibold" : ""}`}>
                      {r.reading}
                      {r.irregular && (
                        <span className="ml-2 text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                          変則
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Counter grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {filtered.length === 0 && (
          <p className="text-muted col-span-full text-center py-8">
            該当する助数詞が見つかりません
          </p>
        )}
        {filtered.map((c) => (
          <button
            key={c.counter}
            onClick={() => setSelected(c)}
            className="bg-surface rounded-2xl border border-border p-4 text-left hover:border-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl font-bold">{c.counter}</span>
              {c.tricky && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  要注意
                </span>
              )}
            </div>
            <p className="text-xs text-muted mb-1">{c.reading}</p>
            <p className="text-sm font-medium">{c.what}</p>
            <p className="text-xs text-muted mt-1 truncate">{c.examples}</p>
          </button>
        ))}
      </div>

      {/* Tricky section */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">よく間違われる助数詞</h2>
        <div className="flex flex-col gap-3">
          {TRICKY.map((c) => (
            <div
              key={`tricky-${c.counter}`}
              className="bg-surface rounded-2xl border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold">{c.counter}</span>
                <span className="text-sm text-muted">（{c.reading}）</span>
              </div>
              <p className="text-sm text-muted">{c.trickyNote}</p>
              <button
                onClick={() => setSelected(c)}
                className="mt-2 text-xs bg-accent text-white px-3 py-1 rounded-full"
              >
                読み方を見る
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Ad placeholder */}
      <div className="border border-dashed border-border rounded-2xl p-6 text-center text-muted text-sm">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この日本語助数詞ガイドツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">物・動物・薄いもの等の正しい助数詞を調べる。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この日本語助数詞ガイドツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "物・動物・薄いもの等の正しい助数詞を調べる。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "日本語助数詞ガイド",
  "description": "物・動物・薄いもの等の正しい助数詞を調べる",
  "url": "https://tools.loresync.dev/japanese-counter",
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
