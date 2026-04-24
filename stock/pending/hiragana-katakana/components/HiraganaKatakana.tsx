"use client";

import { useState, useCallback, useMemo } from "react";

type Mode =
  | "hiragana-to-katakana"
  | "katakana-to-hiragana"
  | "hankaku-to-zenkaku"
  | "zenkaku-to-hankaku";

const MODES: { value: Mode; label: string }[] = [
  { value: "hiragana-to-katakana", label: "ひらがな → カタカナ" },
  { value: "katakana-to-hiragana", label: "カタカナ → ひらがな" },
  { value: "hankaku-to-zenkaku", label: "半角カタカナ → 全角カタカナ" },
  { value: "zenkaku-to-hankaku", label: "全角カタカナ → 半角カタカナ" },
];

// Hiragana: U+3041–U+3096, Katakana: U+30A1–U+30F6, offset = 0x60
const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const OFFSET = 0x60;

// Half-width katakana mapping (U+FF65–U+FF9F) to full-width katakana
// dakuten (U+FF9E) and handakuten (U+FF9F) combine with the preceding char
const HANKAKU_MAP: Record<string, string> = {
  "\uFF65": "\u30FB", // ･ → ・
  "\uFF66": "\u30F2", // ｦ → ヲ
  "\uFF67": "\u30A1", // ｧ → ァ
  "\uFF68": "\u30A3", // ｨ → ィ
  "\uFF69": "\u30A5", // ｩ → ゥ
  "\uFF6A": "\u30A7", // ｪ → ェ
  "\uFF6B": "\u30A9", // ｫ → ォ
  "\uFF6C": "\u30C3", // ｬ → ッ
  "\uFF6D": "\u30E5", // ｭ → ュ
  "\uFF6E": "\u30E7", // ｮ → ョ
  "\uFF6F": "\u30C3", // ｯ → ッ
  "\uFF70": "\u30FC", // ｰ → ー
  "\uFF71": "\u30A2", // ｱ → ア
  "\uFF72": "\u30A4", // ｲ → イ
  "\uFF73": "\u30A6", // ｳ → ウ
  "\uFF74": "\u30A8", // ｴ → エ
  "\uFF75": "\u30AA", // ｵ → オ
  "\uFF76": "\u30AB", // ｶ → カ
  "\uFF77": "\u30AD", // ｷ → キ
  "\uFF78": "\u30AF", // ｸ → ク
  "\uFF79": "\u30B1", // ｹ → ケ
  "\uFF7A": "\u30B3", // ｺ → コ
  "\uFF7B": "\u30B5", // ｻ → サ
  "\uFF7C": "\u30B7", // ｼ → シ
  "\uFF7D": "\u30B9", // ｽ → ス
  "\uFF7E": "\u30BB", // ｾ → セ
  "\uFF7F": "\u30BD", // ｿ → ソ
  "\uFF80": "\u30BF", // ﾀ → タ
  "\uFF81": "\u30C1", // ﾁ → チ
  "\uFF82": "\u30C4", // ﾂ → ツ
  "\uFF83": "\u30C6", // ﾃ → テ
  "\uFF84": "\u30C8", // ﾄ → ト
  "\uFF85": "\u30CA", // ﾅ → ナ
  "\uFF86": "\u30CB", // ﾆ → ニ
  "\uFF87": "\u30CC", // ﾇ → ヌ
  "\uFF88": "\u30CD", // ﾈ → ネ
  "\uFF89": "\u30CE", // ﾉ → ノ
  "\uFF8A": "\u30CF", // ﾊ → ハ
  "\uFF8B": "\u30D2", // ﾋ → ヒ
  "\uFF8C": "\u30D5", // ﾌ → フ
  "\uFF8D": "\u30D8", // ﾍ → ヘ
  "\uFF8E": "\u30DB", // ﾎ → ホ
  "\uFF8F": "\u30DE", // ﾏ → マ
  "\uFF90": "\u30DF", // ﾐ → ミ
  "\uFF91": "\u30E0", // ﾑ → ム
  "\uFF92": "\u30E1", // ﾒ → メ
  "\uFF93": "\u30E2", // ﾓ → モ
  "\uFF94": "\u30E4", // ﾔ → ヤ
  "\uFF95": "\u30E6", // ﾕ → ユ
  "\uFF96": "\u30E8", // ﾖ → ヨ
  "\uFF97": "\u30E9", // ﾗ → ラ
  "\uFF98": "\u30EA", // ﾘ → リ
  "\uFF99": "\u30EB", // ﾙ → ル
  "\uFF9A": "\u30EC", // ﾚ → レ
  "\uFF9B": "\u30ED", // ﾛ → ロ
  "\uFF9C": "\u30EF", // ﾜ → ワ
  "\uFF9D": "\u30F3", // ﾝ → ン
  "\uFF9E": "\u309B", // ﾞ → ゛ (dakuten, standalone fallback)
  "\uFF9F": "\u309C", // ﾟ → ゜ (handakuten, standalone fallback)
};

// Dakuten combinations: base full-width katakana + dakuten → voiced
const DAKUTEN_MAP: Record<string, string> = {
  "\u30AB": "\u30AC", // カ→ガ
  "\u30AD": "\u30AE", // キ→ギ
  "\u30AF": "\u30B0", // ク→グ
  "\u30B1": "\u30B2", // ケ→ゲ
  "\u30B3": "\u30B4", // コ→ゴ
  "\u30B5": "\u30B6", // サ→ザ
  "\u30B7": "\u30B8", // シ→ジ
  "\u30B9": "\u30BA", // ス→ズ
  "\u30BB": "\u30BC", // セ→ゼ
  "\u30BD": "\u30BE", // ソ→ゾ
  "\u30BF": "\u30C0", // タ→ダ
  "\u30C1": "\u30C2", // チ→ヂ
  "\u30C4": "\u30C5", // ツ→ヅ
  "\u30C6": "\u30C7", // テ→デ
  "\u30C8": "\u30C9", // ト→ド
  "\u30CF": "\u30D0", // ハ→バ
  "\u30D2": "\u30D3", // ヒ→ビ
  "\u30D5": "\u30D6", // フ→ブ
  "\u30D8": "\u30D9", // ヘ→ベ
  "\u30DB": "\u30DC", // ホ→ボ
  "\u30A6": "\u30F4", // ウ→ヴ
};

// Handakuten combinations: base full-width katakana + handakuten → semi-voiced
const HANDAKUTEN_MAP: Record<string, string> = {
  "\u30CF": "\u30D1", // ハ→パ
  "\u30D2": "\u30D4", // ヒ→ピ
  "\u30D5": "\u30D7", // フ→プ
  "\u30D8": "\u30DA", // ヘ→ペ
  "\u30DB": "\u30DD", // ホ→ポ
};

// Reverse map: full-width katakana → half-width katakana
// Build from HANKAKU_MAP (skipping dakuten/handakuten standalone)
const ZENKAKU_TO_HANKAKU_MAP: Record<string, string> = {};
for (const [han, zen] of Object.entries(HANKAKU_MAP)) {
  if (han === "\uFF9E" || han === "\uFF9F") continue;
  if (!ZENKAKU_TO_HANKAKU_MAP[zen]) {
    ZENKAKU_TO_HANKAKU_MAP[zen] = han;
  }
}
// Voiced/semi-voiced decompose back to base + dakuten/handakuten
for (const [base, voiced] of Object.entries(DAKUTEN_MAP)) {
  const baseHan = ZENKAKU_TO_HANKAKU_MAP[base];
  if (baseHan) ZENKAKU_TO_HANKAKU_MAP[voiced] = baseHan + "\uFF9E";
}
for (const [base, semiVoiced] of Object.entries(HANDAKUTEN_MAP)) {
  const baseHan = ZENKAKU_TO_HANKAKU_MAP[base];
  if (baseHan) ZENKAKU_TO_HANKAKU_MAP[semiVoiced] = baseHan + "\uFF9F";
}

function hiraganaToKatakana(text: string): string {
  return text
    .split("")
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (cp >= HIRAGANA_START && cp <= HIRAGANA_END) {
        return String.fromCodePoint(cp + OFFSET);
      }
      return ch;
    })
    .join("");
}

function katakanaToHiragana(text: string): string {
  return text
    .split("")
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (cp >= KATAKANA_START && cp <= KATAKANA_END) {
        return String.fromCodePoint(cp - OFFSET);
      }
      return ch;
    })
    .join("");
}

function hankakuToZenkaku(text: string): string {
  const chars = text.split("");
  const result: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1] ?? "";
    const zen = HANKAKU_MAP[ch];
    if (!zen) {
      result.push(ch);
      continue;
    }
    if (next === "\uFF9E" && DAKUTEN_MAP[zen]) {
      result.push(DAKUTEN_MAP[zen]);
      i++;
    } else if (next === "\uFF9F" && HANDAKUTEN_MAP[zen]) {
      result.push(HANDAKUTEN_MAP[zen]);
      i++;
    } else {
      result.push(zen);
    }
  }
  return result.join("");
}

function zenkakuToHankaku(text: string): string {
  return text
    .split("")
    .map((ch) => ZENKAKU_TO_HANKAKU_MAP[ch] ?? ch)
    .join("");
}

function convert(text: string, mode: Mode): string {
  switch (mode) {
    case "hiragana-to-katakana":
      return hiraganaToKatakana(text);
    case "katakana-to-hiragana":
      return katakanaToHiragana(text);
    case "hankaku-to-zenkaku":
      return hankakuToZenkaku(text);
    case "zenkaku-to-hankaku":
      return zenkakuToHankaku(text);
  }
}

export default function HiraganaKatakana() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("hiragana-to-katakana");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => convert(input, mode), [input, mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-sm font-medium text-muted mb-3">変換モード</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                mode === m.value
                  ? "bg-accent text-white"
                  : "bg-background border border-border text-foreground hover:border-accent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted">入力</p>
          <span className="text-xs text-muted">{input.length} 文字</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="テキストを入力してください…"
          rows={6}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground resize-y focus:outline-none focus:border-accent transition-colors leading-relaxed"
        />
      </div>

      {/* Output */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-muted">変換結果</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{output.length} 文字</span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? "コピー済み!" : "コピー"}
            </button>
          </div>
        </div>
        <textarea
          readOnly
          value={output}
          rows={6}
          placeholder="変換結果がここに表示されます"
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground resize-y focus:outline-none leading-relaxed"
        />
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このひらがな・カタカナ変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ひらがなとカタカナを相互変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このひらがな・カタカナ変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ひらがなとカタカナを相互変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ひらがな・カタカナ変換",
  "description": "ひらがなとカタカナを相互変換",
  "url": "https://tools.loresync.dev/hiragana-katakana",
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
