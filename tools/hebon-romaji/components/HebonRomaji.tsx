"use client";

import { useMemo, useState } from "react";

type Mode = "passport" | "standard";
type LongVowelMode = "omit" | "keep";

const KANA_MAP: Record<string, string> = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  ゔぁ: "va", ゔぃ: "vi", ゔ: "vu", ゔぇ: "ve", ゔぉ: "vo",
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "o",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
};

const EXAMPLES = [
  "やまだ たろう",
  "さとう はなこ",
  "しんばし",
  "とうきょう",
  "おおさか",
  "ほっかいどう",
];

function toHiragana(input: string) {
  return input.replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60)).replace(/ヴ/g, "ゔ");
}

function lastVowel(value: string) {
  const match = value.match(/[aeiou]$/);
  return match?.[0] ?? "";
}

function nextMora(text: string, index: number) {
  return KANA_MAP[text.slice(index, index + 2)] ?? KANA_MAP[text[index]] ?? "";
}

function shouldSkipLongVowel(previousRoma: string, currentKana: string) {
  const vowel = lastVowel(previousRoma);
  return (vowel === "o" && (currentKana === "う" || currentKana === "お")) || (vowel === "u" && currentKana === "う");
}

function romanize(input: string, mode: Mode, longVowelMode: LongVowelMode) {
  const text = toHiragana(input);
  const parts: string[] = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (/\s/.test(char)) {
      parts.push(" ");
      i++;
      continue;
    }

    if (char === "ー") {
      if (longVowelMode === "keep") {
        const vowel = lastVowel(parts[parts.length - 1] ?? "");
        if (vowel) parts.push(vowel);
      }
      i++;
      continue;
    }

    if ((char === "っ" || char === "ッ") && i + 1 < text.length) {
      const next = nextMora(text, i + 1);
      if (next) parts.push(next.startsWith("ch") ? "t" : next[0]);
      i++;
      continue;
    }

    if (char === "ん") {
      const next = nextMora(text, i + 1);
      if (/^[bmp]/.test(next)) parts.push("m");
      else if (mode === "standard" && /^[aiueoyn]/.test(next)) parts.push("n'");
      else parts.push("n");
      i++;
      continue;
    }

    const two = text.slice(i, i + 2);
    const roma = KANA_MAP[two] ?? KANA_MAP[char];

    if (roma) {
      if (longVowelMode === "omit" && shouldSkipLongVowel(parts[parts.length - 1] ?? "", char)) {
        i++;
        continue;
      }
      parts.push(roma);
      i += KANA_MAP[two] ? 2 : 1;
      continue;
    }

    parts.push(char);
    i++;
  }

  const compact = parts.join("").replace(/\s+/g, " ").trim();
  return mode === "passport" ? compact.toUpperCase() : compact;
}

function buildCsv(input: string, passport: string, standard: string) {
  const rows = [
    ["input", "passport_hepburn", "standard_hepburn"],
    [input, passport, standard],
  ];
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "hebon-romaji.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function HebonRomaji() {
  const [input, setInput] = useState("やまだ たろう");
  const [mode, setMode] = useState<Mode>("passport");
  const [longVowelMode, setLongVowelMode] = useState<LongVowelMode>("omit");
  const [copied, setCopied] = useState("");

  const passport = useMemo(() => romanize(input, "passport", "omit"), [input]);
  const standard = useMemo(() => romanize(input, "standard", longVowelMode), [input, longVowelMode]);
  const result = mode === "passport" ? passport : standard;
  const validationError = /[\u4E00-\u9FFF]/.test(input) ? "入力エラー: 漢字の読み取りには対応していません。ひらがな・カタカナの読みを入力してください。" : "";

  async function copy(label: string, value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  function reset() {
    setInput("");
    setMode("passport");
    setLongVowelMode("omit");
    setCopied("");
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">読み仮名を入力</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">ひらがな・カタカナをヘボン式ローマ字に変換します。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {[
              { value: "passport" as const, label: "パスポート用" },
              { value: "standard" as const, label: "標準表示" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setMode(item.value);
                  setCopied("");
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700" htmlFor="hebon-input">
            氏名の読み
            <textarea
              id="hebon-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setCopied("");
              }}
              rows={4}
              className="resize-y rounded-2xl border border-slate-300 bg-white p-4 text-lg leading-8 outline-none focus:border-slate-900"
              placeholder="やまだ たろう"
              spellCheck={false}
            />
          </label>

          <p className={`mt-3 min-h-5 text-sm ${validationError ? "text-red-600" : "text-slate-500"}`}>
            {validationError || "入力値はブラウザ内で処理され、外部に送信されません。パスポート申請では最終的に申請窓口の案内を確認してください。"}
          </p>

          {mode === "standard" && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">長音の扱い</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { value: "omit" as const, label: "省略" },
                  { value: "keep" as const, label: "母音を残す" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setLongVowelMode(item.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${longVowelMode === item.value ? "bg-slate-950 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setInput(example);
                    setCopied("");
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 bg-slate-50 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">変換結果</h2>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <p className="text-sm font-medium opacity-80">{mode === "passport" ? "パスポート用表記" : "標準表示"}</p>
            <p className="mt-2 break-all font-mono text-3xl font-bold tracking-wide">{result || "-"}</p>
          </div>

          <div className="mt-4 grid gap-3">
            <ResultLine label="パスポート用" value={passport || "-"} />
            <ResultLine label="標準表示" value={standard || "-"} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => copy("result", result)} disabled={!result} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {copied === "result" ? "コピー済み" : "結果をコピー"}
            </button>
            <button type="button" onClick={() => downloadCsv(buildCsv(input, passport, standard))} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              CSVダウンロード
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-950">処理ルール</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>し=SHI、ち=CHI、つ=TSU、ふ=FU として変換します。</li>
              <li>撥音「ん」は B/M/P の前では M として扱います。</li>
              <li>パスポート用では、オ段・ウ段の長音を省略する目安で表示します。</li>
              <li>漢字の読み取り、例外的な非ヘボン式表記、別名併記には対応していません。</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-all font-mono text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}
