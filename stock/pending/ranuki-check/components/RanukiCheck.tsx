"use client";

import { useState, useMemo } from "react";

type Category = "ら抜き" | "さ入れ" | "二重敬語" | "重複表現";

interface Rule {
  pattern: RegExp;
  category: Category;
  correction: string;
  label: string;
}

const RULES: Rule[] = [
  // ら抜き言葉
  { pattern: /見れる/g, category: "ら抜き", correction: "見られる", label: "見れる" },
  { pattern: /食べれる/g, category: "ら抜き", correction: "食べられる", label: "食べれる" },
  { pattern: /出れる/g, category: "ら抜き", correction: "出られる", label: "出れる" },
  { pattern: /来れる/g, category: "ら抜き", correction: "来られる", label: "来れる" },
  { pattern: /着れる/g, category: "ら抜き", correction: "着られる", label: "着れる" },
  { pattern: /起きれる/g, category: "ら抜き", correction: "起きられる", label: "起きれる" },
  { pattern: /寝れる/g, category: "ら抜き", correction: "寝られる", label: "寝れる" },
  { pattern: /受けれる/g, category: "ら抜き", correction: "受けられる", label: "受けれる" },
  { pattern: /得れる/g, category: "ら抜き", correction: "得られる", label: "得れる" },
  { pattern: /借りれる/g, category: "ら抜き", correction: "借りられる", label: "借りれる" },
  { pattern: /信じれる/g, category: "ら抜き", correction: "信じられる", label: "信じれる" },
  { pattern: /覚えれる/g, category: "ら抜き", correction: "覚えられる", label: "覚えれる" },
  { pattern: /考えれる/g, category: "ら抜き", correction: "考えられる", label: "考えれる" },
  // さ入れ言葉
  { pattern: /行かさせて/g, category: "さ入れ", correction: "行かせて", label: "行かさせて" },
  { pattern: /読まさせて/g, category: "さ入れ", correction: "読ませて", label: "読まさせて" },
  { pattern: /書かさせて/g, category: "さ入れ", correction: "書かせて", label: "書かさせて" },
  { pattern: /飲まさせて/g, category: "さ入れ", correction: "飲ませて", label: "飲まさせて" },
  { pattern: /聞かさせて/g, category: "さ入れ", correction: "聞かせて", label: "聞かさせて" },
  { pattern: /させていただきます/g, category: "さ入れ", correction: "いたします／します", label: "させていただきます（過剰使用）" },
  // 二重敬語
  { pattern: /おっしゃられる/g, category: "二重敬語", correction: "おっしゃる", label: "おっしゃられる" },
  { pattern: /ご覧になられる/g, category: "二重敬語", correction: "ご覧になる", label: "ご覧になられる" },
  { pattern: /お召し上がりになる/g, category: "二重敬語", correction: "召し上がる", label: "お召し上がりになる" },
  { pattern: /お伺いいたします/g, category: "二重敬語", correction: "伺います", label: "お伺いいたします" },
  { pattern: /いただけましたでしょうか/g, category: "二重敬語", correction: "いただけましたか", label: "いただけましたでしょうか" },
  { pattern: /拝見させていただく/g, category: "二重敬語", correction: "拝見する", label: "拝見させていただく" },
  // 重複表現
  { pattern: /まず最初に/g, category: "重複表現", correction: "まず／最初に", label: "まず最初に" },
  { pattern: /後で後悔/g, category: "重複表現", correction: "後悔", label: "後で後悔" },
  { pattern: /一番最初/g, category: "重複表現", correction: "最初", label: "一番最初" },
  { pattern: /必ず必要/g, category: "重複表現", correction: "必要", label: "必ず必要" },
  { pattern: /各それぞれ/g, category: "重複表現", correction: "それぞれ／各", label: "各それぞれ" },
  { pattern: /いまだ未/g, category: "重複表現", correction: "未〜", label: "いまだ未〜" },
  { pattern: /被害を被る/g, category: "重複表現", correction: "被害を受ける", label: "被害を被る" },
  { pattern: /過半数を超える/g, category: "重複表現", correction: "過半数に達する", label: "過半数を超える" },
  { pattern: /一日も早急に/g, category: "重複表現", correction: "早急に", label: "一日も早急に" },
];

const CATEGORY_META: Record<Category, { color: string; bg: string; border: string; desc: string }> = {
  "ら抜き": {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    desc: "一段動詞・カ変動詞の可能形で「ら」が抜けています",
  },
  "さ入れ": {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    desc: "五段動詞の使役形に余分な「さ」が入っています",
  },
  "二重敬語": {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    desc: "敬語表現が二重になっています",
  },
  "重複表現": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "同じ意味の語が重複しています",
  },
};

interface Match {
  ruleIndex: number;
  category: Category;
  label: string;
  correction: string;
  index: number;
  end: number;
  text: string;
}

function findMatches(input: string): Match[] {
  const matches: Match[] = [];
  for (let ri = 0; ri < RULES.length; ri++) {
    const rule = RULES[ri];
    const re = new RegExp(rule.pattern.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(input)) !== null) {
      matches.push({
        ruleIndex: ri,
        category: rule.category,
        label: rule.label,
        correction: rule.correction,
        index: m.index,
        end: m.index + m[0].length,
        text: m[0],
      });
    }
  }
  matches.sort((a, b) => a.index - b.index);
  return matches;
}

const HIGHLIGHT_CLASSES: Record<Category, string> = {
  "ら抜き": "bg-red-200 text-red-900 rounded px-0.5",
  "さ入れ": "bg-orange-200 text-orange-900 rounded px-0.5",
  "二重敬語": "bg-purple-200 text-purple-900 rounded px-0.5",
  "重複表現": "bg-blue-200 text-blue-900 rounded px-0.5",
};

function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  if (matches.length === 0) {
    return <span className="whitespace-pre-wrap text-sm text-gray-800">{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const m of matches) {
    if (m.index > cursor) {
      parts.push(
        <span key={`plain-${cursor}`} className="whitespace-pre-wrap">
          {text.slice(cursor, m.index)}
        </span>
      );
    }
    parts.push(
      <mark
        key={`match-${m.index}`}
        className={`${HIGHLIGHT_CLASSES[m.category]} font-semibold not-italic`}
        title={`${m.category}：「${m.correction}」が正しい表現`}
      >
        {text.slice(m.index, m.end)}
      </mark>
    );
    cursor = m.end;
  }

  if (cursor < text.length) {
    parts.push(
      <span key={`plain-end`} className="whitespace-pre-wrap">
        {text.slice(cursor)}
      </span>
    );
  }

  return <p className="text-sm text-gray-800 leading-relaxed">{parts}</p>;
}

function countByCategory(matches: Match[]): Record<Category, number> {
  const counts: Record<Category, number> = {
    "ら抜き": 0,
    "さ入れ": 0,
    "二重敬語": 0,
    "重複表現": 0,
  };
  for (const m of matches) {
    counts[m.category]++;
  }
  return counts;
}

export default function RanukiCheck() {
  const [text, setText] = useState("");

  const matches = useMemo(() => findMatches(text), [text]);
  const counts = useMemo(() => countByCategory(matches), [matches]);
  const totalIssues = matches.length;

  // Deduplicate for issue list (group by label+category)
  const uniqueIssues = useMemo(() => {
    const seen = new Set<string>();
    return matches.filter((m) => {
      const key = `${m.category}::${m.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [matches]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          ら抜き言葉・文章校正ツール
        </h1>
        <p className="text-muted text-sm">
          ら抜き言葉・さ入れ言葉・二重敬語・重複表現をリアルタイムで検出します。ビジネス文書・メール・SNS投稿の校正にどうぞ。
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <span
              key={cat}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}
            >
              {cat}
            </span>
          );
        })}
      </div>

      {/* Textarea */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-muted text-xs">テキストを入力</label>
          {text.length > 0 && (
            <button
              onClick={() => setText("")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              クリア
            </button>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="ここに文章を貼り付けてください…&#10;例：明日は早く起きれるか不安です。まず最初に確認させていただきます。"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const n = counts[cat];
          return (
            <div
              key={cat}
              className={`rounded-2xl border p-4 text-center ${n > 0 ? `${meta.bg} ${meta.border}` : "bg-surface border-border"}`}
            >
              <p className={`text-xs mb-1 ${n > 0 ? meta.color : "text-muted"}`}>{cat}</p>
              <p className={`text-3xl font-bold tabular-nums ${n > 0 ? meta.color : "text-gray-300"}`}>
                {n}
              </p>
              <p className={`text-xs mt-1 ${n > 0 ? meta.color : "text-muted"}`}>件</p>
            </div>
          );
        })}
      </div>

      {/* Result area */}
      {text.length > 0 && (
        <>
          {/* Highlighted preview */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 text-sm">プレビュー（問題箇所をハイライト）</h2>
              {totalIssues > 0 ? (
                <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
                  {totalIssues}件の問題を検出
                </span>
              ) : (
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                  問題なし
                </span>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 min-h-[80px]">
              <HighlightedText text={text} matches={matches} />
            </div>
          </div>

          {/* Issue list */}
          {uniqueIssues.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border p-4">
              <h2 className="font-semibold text-gray-900 text-sm mb-3">指摘一覧</h2>
              <div className="space-y-2">
                {uniqueIssues.map((m, i) => {
                  const meta = CATEGORY_META[m.category];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 rounded-xl border p-3 ${meta.bg} ${meta.border}`}
                    >
                      <span
                        className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${meta.bg} ${meta.color} ${meta.border}`}
                      >
                        {m.category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className={`font-semibold text-sm line-through ${meta.color}`}>
                            {m.label}
                          </span>
                          <span className="text-gray-400 text-xs">→</span>
                          <span className="font-semibold text-sm text-gray-900">
                            {m.correction}
                          </span>
                        </div>
                        <p className={`text-xs ${meta.color}`}>{CATEGORY_META[m.category].desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalIssues === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <p className="text-green-700 font-semibold text-sm">問題は検出されませんでした</p>
              <p className="text-green-600 text-xs mt-1">ら抜き・さ入れ・二重敬語・重複表現のいずれも見つかりませんでした。</p>
            </div>
          )}
        </>
      )}

      {text.length === 0 && (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <p className="text-muted text-sm">テキストを入力すると校正結果が表示されます</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    </div>
  );
}
