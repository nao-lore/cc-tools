"use client";

import { useState, useCallback } from "react";

// ---- Conversion tables ----

// Hepburn (passport-style)
const HEPBURN: Record<string, string> = {
  // あ行
  あ: "A", い: "I", う: "U", え: "E", お: "O",
  // か行
  か: "KA", き: "KI", く: "KU", け: "KE", こ: "KO",
  // さ行
  さ: "SA", し: "SHI", す: "SU", せ: "SE", そ: "SO",
  // た行
  た: "TA", ち: "CHI", つ: "TSU", て: "TE", と: "TO",
  // な行
  な: "NA", に: "NI", ぬ: "NU", ね: "NE", の: "NO",
  // は行
  は: "HA", ひ: "HI", ふ: "FU", へ: "HE", ほ: "HO",
  // ま行
  ま: "MA", み: "MI", む: "MU", め: "ME", も: "MO",
  // や行
  や: "YA", ゆ: "YU", よ: "YO",
  // ら行
  ら: "RA", り: "RI", る: "RU", れ: "RE", ろ: "RO",
  // わ行
  わ: "WA", ゐ: "I", ゑ: "E", を: "O",
  // ん
  ん: "N",
  // が行
  が: "GA", ぎ: "GI", ぐ: "GU", げ: "GE", ご: "GO",
  // ざ行
  ざ: "ZA", じ: "JI", ず: "ZU", ぜ: "ZE", ぞ: "ZO",
  // だ行
  だ: "DA", ぢ: "JI", づ: "ZU", で: "DE", ど: "DO",
  // ば行
  ば: "BA", び: "BI", ぶ: "BU", べ: "BE", ぼ: "BO",
  // ぱ行
  ぱ: "PA", ぴ: "PI", ぷ: "PU", ぺ: "PE", ぽ: "PO",
  // 拗音 き
  きゃ: "KYA", きゅ: "KYU", きょ: "KYO",
  // 拗音 し
  しゃ: "SHA", しゅ: "SHU", しょ: "SHO",
  // 拗音 ち
  ちゃ: "CHA", ちゅ: "CHU", ちょ: "CHO",
  // 拗音 に
  にゃ: "NYA", にゅ: "NYU", にょ: "NYO",
  // 拗音 ひ
  ひゃ: "HYA", ひゅ: "HYU", ひょ: "HYO",
  // 拗音 み
  みゃ: "MYA", みゅ: "MYU", みょ: "MYO",
  // 拗音 り
  りゃ: "RYA", りゅ: "RYU", りょ: "RYO",
  // 拗音 ぎ
  ぎゃ: "GYA", ぎゅ: "GYU", ぎょ: "GYO",
  // 拗音 じ
  じゃ: "JA", じゅ: "JU", じょ: "JO",
  // 拗音 ぢ
  ぢゃ: "JA", ぢゅ: "JU", ぢょ: "JO",
  // 拗音 び
  びゃ: "BYA", びゅ: "BYU", びょ: "BYO",
  // 拗音 ぴ
  ぴゃ: "PYA", ぴゅ: "PYU", ぴょ: "PYO",
};

// Kunrei-shiki overrides
const KUNREI: Record<string, string> = {
  ...HEPBURN,
  し: "SI", しゃ: "SYA", しゅ: "SYU", しょ: "SYO",
  ち: "TI", ちゃ: "TYA", ちゅ: "TYU", ちょ: "TYO",
  つ: "TU",
  ふ: "HU",
  じ: "ZI", じゃ: "ZYA", じゅ: "ZYU", じょ: "ZYO",
  ぢ: "DI", ぢゃ: "DYA", ぢゅ: "DYU", ぢょ: "DYO",
  づ: "DU",
};

function hiraToKata(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 0x60)
  );
}

function kataToHira(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

type MacronMode = "none" | "macron";

// Passport special rules applied after basic conversion:
// おう / おお → O (long O, not OU/OO)
// うう → U (long U, not UU)
// Hepburn passport spec: long vowels are NOT written with macrons or double letters.
// However: OU in names like 大野 → ONO is standard. We apply these as post-processing
// on the phoneme sequence.

function convertToRomaji(
  input: string,
  table: Record<string, string>,
  passportMode: boolean,
  macronMode: MacronMode
): string {
  // Normalize katakana → hiragana for uniform processing
  const hira = kataToHira(hiraToKata(input));
  let result = "";
  let i = 0;

  while (i < hira.length) {
    const ch = hira[i];
    const ch2 = hira[i] + hira[i + 1];

    // っ / ッ doubling
    if (ch === "っ") {
      const next2 = hira[i + 1] + hira[i + 2];
      const next1 = hira[i + 1];
      const nextRomaji = table[next2] ?? table[next1];
      if (nextRomaji) {
        result += nextRomaji[0];
      } else {
        result += "TT";
      }
      i++;
      continue;
    }

    // ん before b/m/p → M (Hepburn rule)
    if (ch === "ん") {
      const next1 = hira[i + 1];
      const nextRomaji = next1 ? (table[next1] ?? "") : "";
      if (
        passportMode &&
        (nextRomaji.startsWith("B") ||
          nextRomaji.startsWith("M") ||
          nextRomaji.startsWith("P"))
      ) {
        result += "M";
      } else {
        result += "N";
      }
      i++;
      continue;
    }

    // 2-char lookup first
    if (hira[i + 1] && table[ch2]) {
      result += table[ch2];
      i += 2;
      continue;
    }

    // 1-char lookup
    if (table[ch]) {
      result += table[ch];
      i++;
      continue;
    }

    // Pass through (spaces, punctuation, etc.)
    // Convert Japanese punctuation
    if (ch === "　") {
      result += " ";
    } else if (ch === "・") {
      result += " ";
    } else if (ch === "ー") {
      // Long vowel mark: handled per vowel rules below
      // We append a marker and handle in post-processing
      result += "—CHOON—";
    } else {
      result += ch;
    }
    i++;
  }

  // Post-process long vowel mark
  result = result.replace(/([AEIOU])—CHOON—/g, (_, v) => {
    if (passportMode) {
      // Passport: suppress doubling
      return v;
    }
    if (macronMode === "macron") {
      const macrons: Record<string, string> = {
        A: "Ā", I: "Ī", U: "Ū", E: "Ē", O: "Ō",
      };
      return macrons[v] ?? v + v;
    }
    return v + v;
  });
  result = result.replace(/—CHOON—/g, ""); // orphaned

  if (passportMode) {
    // おう → O: in phoneme stream "OU" → "O" when second O comes from う
    // We apply simple bigram rules on the romaji output
    // Rule: OU → O, OO → O, UU → U, II stays II per passport
    // These are the Ministry of Foreign Affairs rules
    result = result
      .replace(/OU/g, "O")
      .replace(/OO/g, "O")
      .replace(/UU/g, "U");
  } else if (macronMode === "macron") {
    // Non-passport macron mode: replace doubled vowels with macron
    result = result
      .replace(/AA/g, "Ā")
      .replace(/II/g, "Ī")
      .replace(/UU/g, "Ū")
      .replace(/EE/g, "Ē")
      .replace(/OO/g, "Ō")
      .replace(/OU/g, "Ō");
  }

  return result;
}

// ---- Special cases reference table ----
const SPECIAL_CASES = [
  { jp: "おう（例：太郎 たろう）", standard: "TARO", not: "TAROU", note: "語尾・語中のOU→O" },
  { jp: "おお（例：大野 おおの）", standard: "ONO", not: "OONO", note: "OO→O" },
  { jp: "うう（例：空 くう）", standard: "KU", not: "KUU", note: "UU→U" },
  { jp: "ん＋b/m/p（例：難波 なんば）", standard: "NAMBA", not: "NANBA", note: "ん→M（唇音前）" },
  { jp: "っ（例：北っぽい きっぽい）", standard: "KIPPOI", not: "KITUPOI", note: "次の子音を重ねる" },
  { jp: "じ", standard: "JI", not: "ZI", note: "ヘボン式はJI" },
  { jp: "し", standard: "SHI", not: "SI", note: "ヘボン式はSHI" },
  { jp: "ち", standard: "CHI", not: "TI", note: "ヘボン式はCHI" },
  { jp: "つ", standard: "TSU", not: "TU", note: "ヘボン式はTSU" },
  { jp: "ふ", standard: "FU", not: "HU", note: "ヘボン式はFU" },
];

type Mode = "hepburn" | "kunrei";

export default function HebonRomaji() {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mode, setMode] = useState<Mode>("hepburn");
  const [passportMode, setPassportMode] = useState(true);
  const [macronMode, setMacronMode] = useState<MacronMode>("none");
  const [result, setResult] = useState<{ last: string; first: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const table = mode === "hepburn" ? HEPBURN : KUNREI;

  const handleConvert = useCallback(() => {
    if (!lastName.trim() && !firstName.trim()) return;
    const last = convertToRomaji(lastName.trim(), table, passportMode, macronMode);
    const first = convertToRomaji(firstName.trim(), table, passportMode, macronMode);
    setResult({ last, first });
    setCopied(false);
  }, [lastName, firstName, table, passportMode, macronMode]);

  const fullName = result ? `${result.last} ${result.first}`.trim() : "";

  const handleCopy = useCallback(async () => {
    if (!fullName) return;
    try {
      await navigator.clipboard.writeText(fullName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = fullName;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fullName]);

  const handleClear = useCallback(() => {
    setLastName("");
    setFirstName("");
    setResult(null);
    setCopied(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">変換方式</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "hepburn", label: "ヘボン式", badge: "パスポート標準", color: "indigo" },
              { value: "kunrei", label: "訓令式", badge: "JIS X 4012", color: "teal" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setMode(opt.value);
                setResult(null);
              }}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                mode === opt.value
                  ? opt.color === "indigo"
                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                    : "border-teal-500 bg-teal-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
              <span
                className={`inline-block text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${
                  opt.color === "indigo"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-teal-100 text-teal-700"
                }`}
              >
                {opt.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Passport options */}
      <div className="flex flex-wrap gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={passportMode}
            onChange={(e) => {
              setPassportMode(e.target.checked);
              setResult(null);
            }}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className="text-sm font-medium text-blue-900">パスポートモード</span>
          <span className="text-xs text-blue-600">（おう→O、うう→U等）</span>
        </label>

        {!passportMode && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">長音表記:</span>
            {(
              [
                { value: "none", label: "なし（OU/UU）" },
                { value: "macron", label: "マクロン（Ō/Ū）" },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="macron"
                  value={opt.value}
                  checked={macronMode === opt.value}
                  onChange={() => {
                    setMacronMode(opt.value);
                    setResult(null);
                  }}
                  className="w-3.5 h-3.5 text-indigo-600"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Name inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            姓（苗字）
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setResult(null);
            }}
            placeholder="例：田中"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-base text-gray-900 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            名（名前）
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setResult(null);
            }}
            placeholder="例：たろう"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-base text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setLastName("たなか");
            setFirstName("たろう");
            setResult(null);
          }}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
        >
          サンプルを使う
        </button>
        {(lastName || firstName) && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            クリア
          </button>
        )}
      </div>

      {/* Convert button */}
      <button
        onClick={handleConvert}
        disabled={!lastName.trim() && !firstName.trim()}
        className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg shadow-md hover:shadow-lg"
      >
        ローマ字に変換
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Passport-style output */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-lg">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-mono">
              {passportMode ? "PASSPORT / パスポート表記" : "ローマ字表記"}
            </p>
            <div className="space-y-3">
              {result.last && (
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-gray-500 w-6 shrink-0">姓</span>
                  <span className="text-3xl font-bold tracking-widest text-white font-mono">
                    {result.last}
                  </span>
                </div>
              )}
              {result.first && (
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-gray-500 w-6 shrink-0">名</span>
                  <span className="text-3xl font-bold tracking-widest text-white font-mono">
                    {result.first}
                  </span>
                </div>
              )}
            </div>
            {result.last && result.first && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <span className="text-xs text-gray-500 block mb-1">フルネーム（姓→名順）</span>
                <span className="text-xl font-bold tracking-widest text-amber-400 font-mono">
                  {result.last} {result.first}
                </span>
              </div>
            )}
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-colors ${
              copied
                ? "bg-green-100 text-green-700 border-2 border-green-300"
                : "bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                コピーしました
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                フルネームをコピー
              </>
            )}
          </button>

          {/* Passport notice */}
          {passportMode && (
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">パスポート申請上の注意</p>
                <ul className="space-y-1 text-xs text-amber-700 list-disc list-inside">
                  <li>本ツールの出力はあくまで参考です。最終確認は戸籍・住民票の氏名で行ってください。</li>
                  <li>「おう」「おお」は原則 O（例：TARO、ONO）。ただし戸籍表記が優先される場合があります。</li>
                  <li>外務省指定のヘボン式に準拠しない表記を希望する場合は申請時に申し出が必要です。</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Special cases reference table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <span className="text-sm font-semibold text-gray-700">特殊表記・注意ケース一覧</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${showTable ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 text-left font-semibold">ケース</th>
                  <th className="px-4 py-2 text-left font-semibold text-green-700">正しい表記</th>
                  <th className="px-4 py-2 text-left font-semibold text-red-600">誤りやすい表記</th>
                  <th className="px-4 py-2 text-left font-semibold">ルール</th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL_CASES.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2.5 text-gray-800">{row.jp}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-green-700">{row.standard}</td>
                    <td className="px-4 py-2.5 font-mono text-red-500 line-through">{row.not}</td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
        <span className="text-xs text-gray-400">Advertisement</span>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このヘボン式ローマ字変換（パスポート対応）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ひらがな/カタカナ→ヘボン式/訓令式、パスポート特殊表記対応。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このヘボン式ローマ字変換（パスポート対応）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ひらがな/カタカナ→ヘボン式/訓令式、パスポート特殊表記対応。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
