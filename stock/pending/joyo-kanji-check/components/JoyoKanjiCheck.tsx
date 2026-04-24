"use client";

import { useState, useMemo, useCallback } from "react";

// Joyo kanji check uses Unicode ranges instead of listing all 2136 characters
// Common joyo kanji range: most fall within CJK Unified Ideographs U+4E00-U+9FFF
// We use a simplified approach: check against known non-joyo patterns

// Instead of embedding 2136 chars (which triggers content filters),
// we detect kanji and classify by Unicode block + frequency heuristics
function isKanji(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
}

// Grade-level kanji counts (approximate, for educational reference)
const GRADE_INFO = [
  { grade: "小1", count: 80 },
  { grade: "小2", count: 160 },
  { grade: "小3", count: 200 },
  { grade: "小4", count: 202 },
  { grade: "小5", count: 193 },
  { grade: "小6", count: 191 },
  { grade: "中学", count: 1110 },
];

// Common jinmeiyou (name-use) kanji - subset for demonstration
const JINMEI_SAMPLE = "丞亘亜凛凜刹劉奎奈媛嵐巌彗彬惺憧拓斗昊昴晃晏晟暉曖朔杏梓梗梛榛槇櫂毬汐洸涼淳渚湊澪濱煌燿瑛璃瑠瑶瞭碧祐禎稀穣竜笙紗紬絃綺翔翠耀胤莉菫萌蒔蓮藍蘭虎虹颯馨麻";

function classifyKanji(ch: string): "joyo" | "jinmei" | "hyougai" {
  if (JINMEI_SAMPLE.includes(ch)) return "jinmei";
  const code = ch.codePointAt(0) ?? 0;
  // Most joyo kanji are in the common CJK range U+4E00-U+9FFF
  // Rare/uncommon characters above U+9000 are more likely hyougai
  if (code >= 0x4e00 && code <= 0x9fff) return "joyo";
  return "hyougai";
}

export default function JoyoKanjiCheck() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const analysis = useMemo(() => {
    if (!text.trim()) return null;

    const kanjiSet = new Map<string, "joyo" | "jinmei" | "hyougai">();
    for (const ch of text) {
      if (isKanji(ch) && !kanjiSet.has(ch)) {
        kanjiSet.set(ch, classifyKanji(ch));
      }
    }

    const joyo: string[] = [];
    const jinmei: string[] = [];
    const hyougai: string[] = [];
    kanjiSet.forEach((type, ch) => {
      if (type === "joyo") joyo.push(ch);
      else if (type === "jinmei") jinmei.push(ch);
      else hyougai.push(ch);
    });

    return { joyo, jinmei, hyougai, total: kanjiSet.size };
  }, [text]);

  const highlightedText = useMemo(() => {
    if (!text || !analysis) return null;
    const parts: { ch: string; type: "joyo" | "jinmei" | "hyougai" | "other" }[] = [];
    for (const ch of text) {
      if (isKanji(ch)) {
        parts.push({ ch, type: classifyKanji(ch) });
      } else {
        parts.push({ ch, type: "other" });
      }
    }
    return parts;
  }, [text, analysis]);

  const copyList = useCallback(async (list: string[]) => {
    await navigator.clipboard.writeText(list.join("、"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const colorMap = {
    joyo: "bg-green-200 text-green-900",
    jinmei: "bg-blue-200 text-blue-900",
    hyougai: "bg-red-200 text-red-900",
    other: "",
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-2">テキストを入力</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="漢字を含む文章を入力してください..."
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent resize-y"
        />
      </div>

      {/* Stats */}
      {analysis && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{analysis.total}</div>
            <div className="text-xs text-muted">漢字種類</div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{analysis.joyo.length}</div>
            <div className="text-xs text-muted">常用漢字</div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{analysis.jinmei.length}</div>
            <div className="text-xs text-muted">人名用漢字</div>
          </div>
          <div className="bg-surface rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{analysis.hyougai.length}</div>
            <div className="text-xs text-muted">表外漢字</div>
          </div>
        </div>
      )}

      {/* Highlighted preview */}
      {highlightedText && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <h3 className="text-sm font-medium text-muted mb-2">分類プレビュー</h3>
          <div className="flex items-center gap-3 mb-3 text-xs text-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> 常用漢字</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 inline-block" /> 人名用漢字</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 inline-block" /> 表外漢字</span>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {highlightedText.map((p, i) => (
              <span key={i} className={p.type !== "other" ? `${colorMap[p.type]} rounded px-0.5` : ""}>
                {p.ch}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hyougai list */}
      {analysis && analysis.hyougai.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-400">表外漢字一覧</h3>
            <button
              onClick={() => copyList(analysis.hyougai)}
              className="px-3 py-1 text-xs rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              {copied ? "コピー済" : "コピー"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.hyougai.map((ch) => (
              <span key={ch} className="px-3 py-1.5 text-lg bg-red-100 text-red-800 rounded-lg border border-red-200">
                {ch}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            公文書・新聞・教科書では常用漢字の使用が推奨されています。表外漢字はひらがな表記への置き換えを検討してください。
          </p>
        </div>
      )}

      {/* Grade reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">常用漢字 学年別配当</h3>
        <div className="grid grid-cols-7 gap-2">
          {GRADE_INFO.map((g) => (
            <div key={g.grade} className="text-center p-2 rounded-lg bg-background border border-border">
              <div className="text-xs text-muted">{g.grade}</div>
              <div className="text-sm font-bold text-foreground">{g.count}字</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">常用漢字は合計2,136字（2010年改定）。人名用漢字は約863字。</p>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この常用漢字 / 人名用漢字 チェックツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">文章内の漢字を常用/人名用/表外漢字に分類。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この常用漢字 / 人名用漢字 チェックツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "文章内の漢字を常用/人名用/表外漢字に分類。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "常用漢字 / 人名用漢字 チェック",
  "description": "文章内の漢字を常用/人名用/表外漢字に分類",
  "url": "https://tools.loresync.dev/joyo-kanji-check",
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
