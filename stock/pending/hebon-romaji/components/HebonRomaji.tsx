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

function convertToRomaji(
  input: string,
  table: Record<string, string>,
  passportMode: boolean,
  macronMode: MacronMode
): string {
  const hira = kataToHira(hiraToKata(input));
  let result = "";
  let i = 0;

  while (i < hira.length) {
    const ch = hira[i];
    const ch2 = hira[i] + hira[i + 1];

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

    if (hira[i + 1] && table[ch2]) {
      result += table[ch2];
      i += 2;
      continue;
    }

    if (table[ch]) {
      result += table[ch];
      i++;
      continue;
    }

    if (ch === "　") {
      result += " ";
    } else if (ch === "・") {
      result += " ";
    } else if (ch === "ー") {
      result += "—CHOON—";
    } else {
      result += ch;
    }
    i++;
  }

  result = result.replace(/([AEIOU])—CHOON—/g, (_, v) => {
    if (passportMode) return v;
    if (macronMode === "macron") {
      const macrons: Record<string, string> = {
        A: "Ā", I: "Ī", U: "Ū", E: "Ē", O: "Ō",
      };
      return macrons[v] ?? v + v;
    }
    return v + v;
  });
  result = result.replace(/—CHOON—/g, "");

  if (passportMode) {
    result = result
      .replace(/OU/g, "O")
      .replace(/OO/g, "O")
      .replace(/UU/g, "U");
  } else if (macronMode === "macron") {
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
type Lang = "ja" | "en";

const T = {
  ja: {
    conversionMode: "変換方式",
    hepburnLabel: "ヘボン式",
    hepburnBadge: "パスポート標準",
    kunreiLabel: "訓令式",
    kunreiBadge: "JIS X 4012",
    passportMode: "パスポートモード",
    passportDesc: "（おう→O、うう→U等）",
    longVowel: "長音表記:",
    noneLabel: "なし（OU/UU）",
    macronLabel: "マクロン（Ō/Ū）",
    lastNameLabel: "姓（苗字）",
    firstNameLabel: "名（名前）",
    lastPlaceholder: "例：田中",
    firstPlaceholder: "例：たろう",
    sampleBtn: "サンプルを使う",
    clearBtn: "クリア",
    convertBtn: "ローマ字に変換",
    passportNotice: "PASSPORT / パスポート表記",
    romajiNotice: "ローマ字表記",
    lastLabel: "姓",
    firstLabel: "名",
    fullNameLabel: "フルネーム（姓→名順）",
    copyBtn: "フルネームをコピー",
    copiedBtn: "コピーしました",
    passportTitle: "パスポート申請上の注意",
    passportNotes: [
      "本ツールの出力はあくまで参考です。最終確認は戸籍・住民票の氏名で行ってください。",
      "「おう」「おお」は原則 O（例：TARO、ONO）。ただし戸籍表記が優先される場合があります。",
      "外務省指定のヘボン式に準拠しない表記を希望する場合は申請時に申し出が必要です。",
    ],
    specialCasesTitle: "特殊表記・注意ケース一覧",
    caseHeader: "ケース",
    correctHeader: "正しい表記",
    wrongHeader: "誤りやすい表記",
    ruleHeader: "ルール",
  },
  en: {
    conversionMode: "Conversion Mode",
    hepburnLabel: "Hepburn",
    hepburnBadge: "Passport standard",
    kunreiLabel: "Kunrei-shiki",
    kunreiBadge: "JIS X 4012",
    passportMode: "Passport Mode",
    passportDesc: "(ou→O, uu→U, etc.)",
    longVowel: "Long vowels:",
    noneLabel: "None (OU/UU)",
    macronLabel: "Macron (Ō/Ū)",
    lastNameLabel: "Last Name",
    firstNameLabel: "First Name",
    lastPlaceholder: "e.g. たなか",
    firstPlaceholder: "e.g. たろう",
    sampleBtn: "Use sample",
    clearBtn: "Clear",
    convertBtn: "Convert to Romaji",
    passportNotice: "PASSPORT notation",
    romajiNotice: "Romaji notation",
    lastLabel: "Last",
    firstLabel: "First",
    fullNameLabel: "Full name (Last → First)",
    copyBtn: "Copy full name",
    copiedBtn: "Copied!",
    passportTitle: "Passport application note",
    passportNotes: [
      "This tool's output is for reference only. Confirm against your official family register.",
      "OU/OO → O in principle (e.g. TARO, ONO), but official register spelling takes priority.",
      "If you wish to use a non-standard spelling, declare it at the application counter.",
    ],
    specialCasesTitle: "Special cases reference",
    caseHeader: "Case",
    correctHeader: "Correct",
    wrongHeader: "Incorrect",
    ruleHeader: "Rule",
  },
} as const;

export default function HebonRomaji() {
  const [lang, setLang] = useState<Lang>("ja");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mode, setMode] = useState<Mode>("hepburn");
  const [passportMode, setPassportMode] = useState(true);
  const [macronMode, setMacronMode] = useState<MacronMode>("none");
  const [result, setResult] = useState<{ last: string; first: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const t = T[lang];
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
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .float-in {
          animation: float-in 0.25s ease-out;
        }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .method-btn-active {
          box-shadow: 0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          background: rgba(139,92,246,0.2);
          border-color: rgba(167,139,250,0.6) !important;
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Mode selector */}
      <div className="glass-card rounded-2xl p-6">
        <p className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-4">{t.conversionMode}</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "hepburn" as Mode, label: t.hepburnLabel, badge: t.hepburnBadge },
              { value: "kunrei" as Mode, label: t.kunreiLabel, badge: t.kunreiBadge },
            ]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setMode(opt.value);
                setResult(null);
              }}
              className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                mode === opt.value
                  ? "method-btn-active border-violet-500/60"
                  : "border-white/8 hover:border-violet-500/30"
              }`}
            >
              <span className="block text-sm font-semibold text-white">{opt.label}</span>
              <span className="inline-block text-xs mt-1 px-2 py-0.5 rounded-full font-medium bg-violet-500/20 text-violet-200">
                {opt.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Passport options */}
      <div className="glass-card rounded-2xl p-5 border border-violet-500/20">
        <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
          <input
            type="checkbox"
            checked={passportMode}
            onChange={(e) => {
              setPassportMode(e.target.checked);
              setResult(null);
            }}
            className="w-4 h-4 accent-violet-500 rounded"
          />
          <span className="text-sm font-medium text-white">{t.passportMode}</span>
          <span className="text-xs text-violet-200">{t.passportDesc}</span>
        </label>

        {!passportMode && (
          <div className="flex items-center gap-3 mt-2 float-in">
            <span className="text-xs font-medium text-violet-100">{t.longVowel}</span>
            {(
              [
                { value: "none" as MacronMode, label: t.noneLabel },
                { value: "macron" as MacronMode, label: t.macronLabel },
              ]
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
                  className="w-3.5 h-3.5 accent-violet-500"
                />
                <span className="text-sm text-violet-100">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Name inputs */}
      <div className="glass-card rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">
              {t.lastNameLabel}
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setResult(null);
              }}
              placeholder={t.lastPlaceholder}
              className="number-input w-full px-4 py-3 rounded-xl text-base neon-focus transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">
              {t.firstNameLabel}
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setResult(null);
              }}
              placeholder={t.firstPlaceholder}
              className="number-input w-full px-4 py-3 rounded-xl text-base neon-focus transition-all"
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
            className="text-sm text-violet-300 hover:text-violet-100 underline underline-offset-2 transition-colors"
          >
            {t.sampleBtn}
          </button>
          {(lastName || firstName) && (
            <button
              onClick={handleClear}
              className="text-sm text-violet-200/60 hover:text-violet-100 underline underline-offset-2 transition-colors"
            >
              {t.clearBtn}
            </button>
          )}
        </div>
      </div>

      {/* Convert button */}
      <button
        onClick={handleConvert}
        disabled={!lastName.trim() && !firstName.trim()}
        className="w-full py-3 px-6 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg"
        style={{ boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
      >
        {t.convertBtn}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-4 float-in">
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <p className="text-xs text-violet-200 uppercase tracking-widest mb-4 font-mono">
              {passportMode ? t.passportNotice : t.romajiNotice}
            </p>
            <div className="space-y-3">
              {result.last && (
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-violet-200 w-8 shrink-0">{t.lastLabel}</span>
                  <span className="text-3xl font-bold tracking-widest text-white font-mono glow-text">
                    {result.last}
                  </span>
                </div>
              )}
              {result.first && (
                <div className="flex items-baseline gap-3">
                  <span className="text-xs text-violet-200 w-8 shrink-0">{t.firstLabel}</span>
                  <span className="text-3xl font-bold tracking-widest text-white font-mono glow-text">
                    {result.first}
                  </span>
                </div>
              )}
            </div>
            {result.last && result.first && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-violet-200 block mb-1">{t.fullNameLabel}</span>
                <span className="text-xl font-bold tracking-widest text-cyan-300 font-mono">
                  {result.last} {result.first}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
              copied
                ? "glass-card-bright text-cyan-300 border border-cyan-500/30"
                : "glass-card text-violet-100 hover:text-white border border-white/8 hover:border-violet-500/40"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.copiedBtn}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t.copyBtn}
              </>
            )}
          </button>

          {passportMode && (
            <div className="glass-card rounded-2xl p-5 border border-amber-500/20">
              <p className="font-semibold text-white text-sm mb-2">{t.passportTitle}</p>
              <ul className="space-y-1.5 text-xs text-violet-100 list-disc list-inside">
                {t.passportNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Special cases reference table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left"
        >
          <span className="text-sm font-semibold text-white">{t.specialCasesTitle}</span>
          <svg
            className={`w-4 h-4 text-violet-200 transition-transform ${showTable ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTable && (
          <div className="overflow-x-auto border-t border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-4 py-2.5 text-left text-xs text-violet-200 font-medium uppercase tracking-wider">{t.caseHeader}</th>
                  <th className="px-4 py-2.5 text-left text-xs text-cyan-300 font-medium uppercase tracking-wider">{t.correctHeader}</th>
                  <th className="px-4 py-2.5 text-left text-xs text-red-400 font-medium uppercase tracking-wider">{t.wrongHeader}</th>
                  <th className="px-4 py-2.5 text-left text-xs text-violet-200 font-medium uppercase tracking-wider">{t.ruleHeader}</th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL_CASES.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 table-row-stripe">
                    <td className="px-4 py-2.5 text-white/90 text-xs">{row.jp}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-cyan-300">{row.standard}</td>
                    <td className="px-4 py-2.5 font-mono text-red-400 line-through">{row.not}</td>
                    <td className="px-4 py-2.5 text-violet-200 text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このヘボン式ローマ字変換（パスポート対応）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ひらがな/カタカナ→ヘボン式/訓令式、パスポート特殊表記対応。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ヘボン式ローマ字変換（パスポート対応）",
  "description": "ひらがな/カタカナ→ヘボン式/訓令式、パスポート特殊表記対応",
  "url": "https://tools.loresync.dev/hebon-romaji",
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
