"use client";

import { useState, useCallback, useMemo } from "react";

// ---------------------------------------------------------------------------
// Mapping tables
// Each entry: [hiragana, hepburn, kunrei, nihon]
// ---------------------------------------------------------------------------

type Style = "hepburn" | "kunrei" | "nihon";

interface KanaRow {
  kana: string;
  hepburn: string;
  kunrei: string;
  nihon: string;
}

// Basic 50-on + voiced + semi-voiced
const KANA_TABLE: KanaRow[] = [
  // あ行
  { kana: "あ", hepburn: "a",   kunrei: "a",   nihon: "a"   },
  { kana: "い", hepburn: "i",   kunrei: "i",   nihon: "i"   },
  { kana: "う", hepburn: "u",   kunrei: "u",   nihon: "u"   },
  { kana: "え", hepburn: "e",   kunrei: "e",   nihon: "e"   },
  { kana: "お", hepburn: "o",   kunrei: "o",   nihon: "o"   },
  // か行
  { kana: "か", hepburn: "ka",  kunrei: "ka",  nihon: "ka"  },
  { kana: "き", hepburn: "ki",  kunrei: "ki",  nihon: "ki"  },
  { kana: "く", hepburn: "ku",  kunrei: "ku",  nihon: "ku"  },
  { kana: "け", hepburn: "ke",  kunrei: "ke",  nihon: "ke"  },
  { kana: "こ", hepburn: "ko",  kunrei: "ko",  nihon: "ko"  },
  // さ行
  { kana: "さ", hepburn: "sa",  kunrei: "sa",  nihon: "sa"  },
  { kana: "し", hepburn: "shi", kunrei: "si",  nihon: "si"  },
  { kana: "す", hepburn: "su",  kunrei: "su",  nihon: "su"  },
  { kana: "せ", hepburn: "se",  kunrei: "se",  nihon: "se"  },
  { kana: "そ", hepburn: "so",  kunrei: "so",  nihon: "so"  },
  // た行
  { kana: "た", hepburn: "ta",  kunrei: "ta",  nihon: "ta"  },
  { kana: "ち", hepburn: "chi", kunrei: "ti",  nihon: "ti"  },
  { kana: "つ", hepburn: "tsu", kunrei: "tu",  nihon: "tu"  },
  { kana: "て", hepburn: "te",  kunrei: "te",  nihon: "te"  },
  { kana: "と", hepburn: "to",  kunrei: "to",  nihon: "to"  },
  // な行
  { kana: "な", hepburn: "na",  kunrei: "na",  nihon: "na"  },
  { kana: "に", hepburn: "ni",  kunrei: "ni",  nihon: "ni"  },
  { kana: "ぬ", hepburn: "nu",  kunrei: "nu",  nihon: "nu"  },
  { kana: "ね", hepburn: "ne",  kunrei: "ne",  nihon: "ne"  },
  { kana: "の", hepburn: "no",  kunrei: "no",  nihon: "no"  },
  // は行
  { kana: "は", hepburn: "ha",  kunrei: "ha",  nihon: "ha"  },
  { kana: "ひ", hepburn: "hi",  kunrei: "hi",  nihon: "hi"  },
  { kana: "ふ", hepburn: "fu",  kunrei: "hu",  nihon: "hu"  },
  { kana: "へ", hepburn: "he",  kunrei: "he",  nihon: "he"  },
  { kana: "ほ", hepburn: "ho",  kunrei: "ho",  nihon: "ho"  },
  // ま行
  { kana: "ま", hepburn: "ma",  kunrei: "ma",  nihon: "ma"  },
  { kana: "み", hepburn: "mi",  kunrei: "mi",  nihon: "mi"  },
  { kana: "む", hepburn: "mu",  kunrei: "mu",  nihon: "mu"  },
  { kana: "め", hepburn: "me",  kunrei: "me",  nihon: "me"  },
  { kana: "も", hepburn: "mo",  kunrei: "mo",  nihon: "mo"  },
  // や行
  { kana: "や", hepburn: "ya",  kunrei: "ya",  nihon: "ya"  },
  { kana: "ゆ", hepburn: "yu",  kunrei: "yu",  nihon: "yu"  },
  { kana: "よ", hepburn: "yo",  kunrei: "yo",  nihon: "yo"  },
  // ら行
  { kana: "ら", hepburn: "ra",  kunrei: "ra",  nihon: "ra"  },
  { kana: "り", hepburn: "ri",  kunrei: "ri",  nihon: "ri"  },
  { kana: "る", hepburn: "ru",  kunrei: "ru",  nihon: "ru"  },
  { kana: "れ", hepburn: "re",  kunrei: "re",  nihon: "re"  },
  { kana: "ろ", hepburn: "ro",  kunrei: "ro",  nihon: "ro"  },
  // わ行
  { kana: "わ", hepburn: "wa",  kunrei: "wa",  nihon: "wa"  },
  { kana: "を", hepburn: "o",   kunrei: "wo",  nihon: "wo"  },
  { kana: "ん", hepburn: "n",   kunrei: "n",   nihon: "n"   },
  // が行
  { kana: "が", hepburn: "ga",  kunrei: "ga",  nihon: "ga"  },
  { kana: "ぎ", hepburn: "gi",  kunrei: "gi",  nihon: "gi"  },
  { kana: "ぐ", hepburn: "gu",  kunrei: "gu",  nihon: "gu"  },
  { kana: "げ", hepburn: "ge",  kunrei: "ge",  nihon: "ge"  },
  { kana: "ご", hepburn: "go",  kunrei: "go",  nihon: "go"  },
  // ざ行
  { kana: "ざ", hepburn: "za",  kunrei: "za",  nihon: "za"  },
  { kana: "じ", hepburn: "ji",  kunrei: "zi",  nihon: "zi"  },
  { kana: "ず", hepburn: "zu",  kunrei: "zu",  nihon: "zu"  },
  { kana: "ぜ", hepburn: "ze",  kunrei: "ze",  nihon: "ze"  },
  { kana: "ぞ", hepburn: "zo",  kunrei: "zo",  nihon: "zo"  },
  // だ行
  { kana: "だ", hepburn: "da",  kunrei: "da",  nihon: "da"  },
  { kana: "ぢ", hepburn: "ji",  kunrei: "di",  nihon: "di"  },
  { kana: "づ", hepburn: "zu",  kunrei: "du",  nihon: "du"  },
  { kana: "で", hepburn: "de",  kunrei: "de",  nihon: "de"  },
  { kana: "ど", hepburn: "do",  kunrei: "do",  nihon: "do"  },
  // ば行
  { kana: "ば", hepburn: "ba",  kunrei: "ba",  nihon: "ba"  },
  { kana: "び", hepburn: "bi",  kunrei: "bi",  nihon: "bi"  },
  { kana: "ぶ", hepburn: "bu",  kunrei: "bu",  nihon: "bu"  },
  { kana: "べ", hepburn: "be",  kunrei: "be",  nihon: "be"  },
  { kana: "ぼ", hepburn: "bo",  kunrei: "bo",  nihon: "bo"  },
  // ぱ行
  { kana: "ぱ", hepburn: "pa",  kunrei: "pa",  nihon: "pa"  },
  { kana: "ぴ", hepburn: "pi",  kunrei: "pi",  nihon: "pi"  },
  { kana: "ぷ", hepburn: "pu",  kunrei: "pu",  nihon: "pu"  },
  { kana: "ぺ", hepburn: "pe",  kunrei: "pe",  nihon: "pe"  },
  { kana: "ぽ", hepburn: "po",  kunrei: "po",  nihon: "po"  },
  // 拗音 き
  { kana: "きゃ", hepburn: "kya", kunrei: "kya", nihon: "kya" },
  { kana: "きゅ", hepburn: "kyu", kunrei: "kyu", nihon: "kyu" },
  { kana: "きょ", hepburn: "kyo", kunrei: "kyo", nihon: "kyo" },
  // 拗音 し
  { kana: "しゃ", hepburn: "sha", kunrei: "sya", nihon: "sya" },
  { kana: "しゅ", hepburn: "shu", kunrei: "syu", nihon: "syu" },
  { kana: "しょ", hepburn: "sho", kunrei: "syo", nihon: "syo" },
  // 拗音 ち
  { kana: "ちゃ", hepburn: "cha", kunrei: "tya", nihon: "tya" },
  { kana: "ちゅ", hepburn: "chu", kunrei: "tyu", nihon: "tyu" },
  { kana: "ちょ", hepburn: "cho", kunrei: "tyo", nihon: "tyo" },
  // 拗音 に
  { kana: "にゃ", hepburn: "nya", kunrei: "nya", nihon: "nya" },
  { kana: "にゅ", hepburn: "nyu", kunrei: "nyu", nihon: "nyu" },
  { kana: "にょ", hepburn: "nyo", kunrei: "nyo", nihon: "nyo" },
  // 拗音 ひ
  { kana: "ひゃ", hepburn: "hya", kunrei: "hya", nihon: "hya" },
  { kana: "ひゅ", hepburn: "hyu", kunrei: "hyu", nihon: "hyu" },
  { kana: "ひょ", hepburn: "hyo", kunrei: "hyo", nihon: "hyo" },
  // 拗音 み
  { kana: "みゃ", hepburn: "mya", kunrei: "mya", nihon: "mya" },
  { kana: "みゅ", hepburn: "myu", kunrei: "myu", nihon: "myu" },
  { kana: "みょ", hepburn: "myo", kunrei: "myo", nihon: "myo" },
  // 拗音 り
  { kana: "りゃ", hepburn: "rya", kunrei: "rya", nihon: "rya" },
  { kana: "りゅ", hepburn: "ryu", kunrei: "ryu", nihon: "ryu" },
  { kana: "りょ", hepburn: "ryo", kunrei: "ryo", nihon: "ryo" },
  // 拗音 ぎ
  { kana: "ぎゃ", hepburn: "gya", kunrei: "gya", nihon: "gya" },
  { kana: "ぎゅ", hepburn: "gyu", kunrei: "gyu", nihon: "gyu" },
  { kana: "ぎょ", hepburn: "gyo", kunrei: "gyo", nihon: "gyo" },
  // 拗音 じ
  { kana: "じゃ", hepburn: "ja",  kunrei: "zya", nihon: "zya" },
  { kana: "じゅ", hepburn: "ju",  kunrei: "zyu", nihon: "zyu" },
  { kana: "じょ", hepburn: "jo",  kunrei: "zyo", nihon: "zyo" },
  // 拗音 び
  { kana: "びゃ", hepburn: "bya", kunrei: "bya", nihon: "bya" },
  { kana: "びゅ", hepburn: "byu", kunrei: "byu", nihon: "byu" },
  { kana: "びょ", hepburn: "byo", kunrei: "byo", nihon: "byo" },
  // 拗音 ぴ
  { kana: "ぴゃ", hepburn: "pya", kunrei: "pya", nihon: "pya" },
  { kana: "ぴゅ", hepburn: "pyu", kunrei: "pyu", nihon: "pyu" },
  { kana: "ぴょ", hepburn: "pyo", kunrei: "pyo", nihon: "pyo" },
];

// Katakana offset: each katakana char = hiragana + 0x60
function toHiragana(str: string): string {
  return Array.from(str)
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      // Katakana range: 0x30A1–0x30F6
      if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCodePoint(code - 0x60);
      }
      return ch;
    })
    .join("");
}

// Build lookup: sorted longest-first so 3-char entries match before 2-char, etc.
function buildLookup(style: Style): [string, string][] {
  return KANA_TABLE.map((row): [string, string] => [row.kana, row[style]]).sort(
    (a, b) => b[0].length - a[0].length
  );
}

// Long vowel macron maps (Hepburn with macrons)
const MACRON_MAP: Record<string, string> = {
  aa: "ā", ii: "ī", uu: "ū", ee: "ē", oo: "ō", ou: "ō",
};

function applyMacrons(romaji: string): string {
  return romaji.replace(/aa|ii|uu|ee|oo|ou/g, (m) => MACRON_MAP[m] ?? m);
}

function convertKana(input: string, style: Style, passport: boolean): string {
  // Normalize katakana → hiragana
  const hira = toHiragana(input);
  const lookup = buildLookup(style);

  let result = "";
  let i = 0;

  while (i < hira.length) {
    const ch = hira[i];

    // 促音 (っ): double the first consonant of next syllable
    if (ch === "っ") {
      // Find what the next character converts to
      let nextRomaji = "";
      for (const [kana, rom] of lookup) {
        if (hira.startsWith(kana, i + 1)) {
          nextRomaji = rom;
          break;
        }
      }
      if (nextRomaji) {
        result += nextRomaji[0]; // double first consonant
      } else {
        result += "tt"; // fallback
      }
      i++;
      continue;
    }

    // 長音符 (ー): repeat previous vowel or use macron
    if (ch === "ー") {
      const lastChar = result[result.length - 1] ?? "";
      if ("aeiouāīūēō".includes(lastChar)) {
        result += lastChar;
      } else {
        result += "-";
      }
      i++;
      continue;
    }

    // Try longest match first
    let matched = false;
    for (const [kana, rom] of lookup) {
      if (hira.startsWith(kana, i)) {
        // 撥音 (ん): n→m before b, m, p
        if (kana === "ん") {
          const nextKana = hira[i + 1] ?? "";
          const nextHira = toHiragana(nextKana);
          if (["ば","び","ぶ","べ","ぼ","ま","み","む","め","も","ぱ","ぴ","ぷ","ぺ","ぽ"].includes(nextHira)) {
            result += "m";
          } else {
            result += rom;
          }
        } else {
          result += rom;
        }
        i += kana.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Pass through non-kana characters (spaces, punctuation, ASCII, kanji)
      result += ch;
      i++;
    }
  }

  // Apply macrons for hepburn (unless passport mode or nihon/kunrei)
  if (style === "hepburn" && !passport) {
    result = applyMacrons(result);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const STYLE_LABELS: { value: Style; label: string; desc: string }[] = [
  { value: "hepburn", label: "ヘボン式", desc: "外国人向け・パスポート標準" },
  { value: "kunrei", label: "訓令式", desc: "JIS・学校教育標準" },
  { value: "nihon", label: "日本式", desc: "旧来の体系的ローマ字" },
];

export default function NihongoRomaji() {
  const [input, setInput] = useState("こんにちは、世界！\nしんじゅく\nとうきょう\nっぱった");
  const [style, setStyle] = useState<Style>("hepburn");
  const [passport, setPassport] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => convertKana(input, style, passport),
    [input, style, passport]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Style selector */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">ローマ字方式</h3>
        <div className="flex flex-wrap gap-2">
          {STYLE_LABELS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setStyle(value)}
              title={desc}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                style === value
                  ? "bg-accent text-white"
                  : "border border-border text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          {STYLE_LABELS.find((s) => s.value === style)?.desc}
        </p>
      </div>

      {/* Passport mode (Hepburn only) */}
      {style === "hepburn" && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={passport}
              onChange={(e) => setPassport(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm font-medium text-foreground">
              パスポートモード
            </span>
            <span className="text-xs text-muted">
              （長音マクロン なし・おう→OU）
            </span>
          </label>
        </div>
      )}

      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">ひらがな・カタカナ入力</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ひらがな・カタカナを入力してください…"
          rows={5}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
          aria-label="かな入力"
        />
      </div>

      {/* Output */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted">ローマ字出力</h3>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-40"
          >
            {copied ? "コピー済み!" : "コピー"}
          </button>
        </div>
        <p className="text-lg font-mono text-foreground break-all select-all whitespace-pre-wrap min-h-[3rem]">
          {output || <span className="text-muted text-sm">変換結果がここに表示されます</span>}
        </p>
      </div>

      {/* Comparison table (when input exists) */}
      {input.trim().length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <h3 className="text-sm font-medium text-muted mb-3">方式別比較</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted font-medium">方式</th>
                  <th className="text-left py-2 text-muted font-medium">変換結果</th>
                </tr>
              </thead>
              <tbody>
                {STYLE_LABELS.map(({ value, label }) => (
                  <tr
                    key={value}
                    className={`border-b border-border/50 last:border-0 ${
                      style === value ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="py-2 pr-4 font-medium whitespace-nowrap">
                      {label}
                      {style === value && (
                        <span className="ml-1.5 text-xs text-accent">選択中</span>
                      )}
                    </td>
                    <td className="py-2 font-mono text-foreground break-all">
                      {convertKana(input, value, value === "hepburn" && passport)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">主な違い（方式別）</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 pr-3 text-muted font-medium">かな</th>
                <th className="text-left py-1.5 pr-3 text-muted font-medium">ヘボン式</th>
                <th className="text-left py-1.5 pr-3 text-muted font-medium">訓令式</th>
                <th className="text-left py-1.5 text-muted font-medium">日本式</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                ["し", "shi", "si", "si"],
                ["ち", "chi", "ti", "ti"],
                ["つ", "tsu", "tu", "tu"],
                ["ふ", "fu", "hu", "hu"],
                ["じ", "ji", "zi", "zi"],
                ["しゃ", "sha", "sya", "sya"],
                ["じゃ", "ja", "zya", "zya"],
                ["を", "o", "wo", "wo"],
              ].map(([kana, h, k, n]) => (
                <tr key={kana} className="border-b border-border/40 last:border-0">
                  <td className="py-1.5 pr-3 font-sans">{kana}</td>
                  <td className="py-1.5 pr-3">{h}</td>
                  <td className="py-1.5 pr-3">{k}</td>
                  <td className="py-1.5">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この日本語ローマ字変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ひらがな・カタカナをローマ字（ヘボン式・訓令式）に変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この日本語ローマ字変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ひらがな・カタカナをローマ字（ヘボン式・訓令式）に変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "日本語ローマ字変換",
  "description": "ひらがな・カタカナをローマ字（ヘボン式・訓令式）に変換",
  "url": "https://tools.loresync.dev/nihongo-romaji",
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
