"use client";

import { useState, useCallback } from "react";

// --- Romaji to Hiragana mapping (Hepburn + common IME) ---
const ROMAJI_TABLE: [string, string][] = [
  // 3-char first
  ["sha", "しゃ"], ["shi", "し"], ["shu", "しゅ"], ["she", "しぇ"], ["sho", "しょ"],
  ["chi", "ち"], ["cha", "ちゃ"], ["chu", "ちゅ"], ["che", "ちぇ"], ["cho", "ちょ"],
  ["tsu", "つ"], ["thi", "てぃ"],
  ["dzu", "づ"], ["dzi", "ぢ"],
  ["kya", "きゃ"], ["kyu", "きゅ"], ["kyo", "きょ"],
  ["nya", "にゃ"], ["nyu", "にゅ"], ["nyo", "にょ"],
  ["hya", "ひゃ"], ["hyu", "ひゅ"], ["hyo", "ひょ"],
  ["mya", "みゃ"], ["myu", "みゅ"], ["myo", "みょ"],
  ["rya", "りゃ"], ["ryu", "りゅ"], ["ryo", "りょ"],
  ["gya", "ぎゃ"], ["gyu", "ぎゅ"], ["gyo", "ぎょ"],
  ["bya", "びゃ"], ["byu", "びゅ"], ["byo", "びょ"],
  ["pya", "ぴゃ"], ["pyu", "ぴゅ"], ["pyo", "ぴょ"],
  // 2-char
  ["ka", "か"], ["ki", "き"], ["ku", "く"], ["ke", "け"], ["ko", "こ"],
  ["sa", "さ"], ["si", "し"], ["su", "す"], ["se", "せ"], ["so", "そ"],
  ["ta", "た"], ["ti", "ち"], ["tu", "つ"], ["te", "て"], ["to", "と"],
  ["na", "な"], ["ni", "に"], ["nu", "ぬ"], ["ne", "ね"], ["no", "の"],
  ["ha", "は"], ["hi", "ひ"], ["hu", "ふ"], ["he", "へ"], ["ho", "ほ"],
  ["ma", "ま"], ["mi", "み"], ["mu", "む"], ["me", "め"], ["mo", "も"],
  ["ya", "や"], ["yu", "ゆ"], ["yo", "よ"],
  ["ra", "ら"], ["ri", "り"], ["ru", "る"], ["re", "れ"], ["ro", "ろ"],
  ["wa", "わ"], ["wi", "ゐ"], ["we", "ゑ"], ["wo", "を"],
  ["ga", "が"], ["gi", "ぎ"], ["gu", "ぐ"], ["ge", "げ"], ["go", "ご"],
  ["za", "ざ"], ["zi", "じ"], ["zu", "ず"], ["ze", "ぜ"], ["zo", "ぞ"],
  ["da", "だ"], ["di", "ぢ"], ["du", "づ"], ["de", "で"], ["do", "ど"],
  ["ba", "ば"], ["bi", "び"], ["bu", "ぶ"], ["be", "べ"], ["bo", "ぼ"],
  ["pa", "ぱ"], ["pi", "ぴ"], ["pu", "ぷ"], ["pe", "ぺ"], ["po", "ぽ"],
  ["fa", "ふぁ"], ["fi", "ふぃ"], ["fu", "ふ"], ["fe", "ふぇ"], ["fo", "ふぉ"],
  ["ja", "じゃ"], ["ji", "じ"], ["ju", "じゅ"], ["je", "じぇ"], ["jo", "じょ"],
  ["va", "ゔぁ"], ["vi", "ゔぃ"], ["vu", "ゔ"], ["ve", "ゔぇ"], ["vo", "ゔぉ"],
  // 1-char vowels
  ["a", "あ"], ["i", "い"], ["u", "う"], ["e", "え"], ["o", "お"],
  // n
  ["nn", "ん"], ["n'", "ん"],
];

function romajiToHiragana(input: string): string {
  let result = "";
  let i = 0;
  const lower = input.toLowerCase();
  while (i < lower.length) {
    // double consonant = っ
    if (
      lower[i] === lower[i + 1] &&
      lower[i] !== "n" &&
      /[a-z]/.test(lower[i])
    ) {
      result += "っ";
      i++;
      continue;
    }
    // try 3-char
    let matched = false;
    for (const [r, h] of ROMAJI_TABLE) {
      if (r.length <= lower.length - i && lower.slice(i, i + r.length) === r) {
        result += h;
        i += r.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // pass through non-alphabetic as-is
      result += input[i];
      i++;
    }
  }
  return result;
}

// Hiragana to Romaji (Hepburn)
const HIRAGANA_TO_ROMAJI: Record<string, string> = {
  "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
  "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
  "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
  "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
  "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
  "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
  "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
  "や": "ya", "ゆ": "yu", "よ": "yo",
  "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
  "わ": "wa", "ゐ": "i", "ゑ": "e", "を": "wo", "ん": "n",
  "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
  "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
  "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
  "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
  "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
  "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
  "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
  "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
  "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
  "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
  "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
  "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
  "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
  "じゃ": "ja", "じゅ": "ju", "じょ": "jo",
  "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
  "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
  "っ": "",  // handled specially
};

function hiraganaToRomaji(input: string): string {
  let result = "";
  let i = 0;
  while (i < input.length) {
    // Try 2-char combo
    const two = input.slice(i, i + 2);
    if (HIRAGANA_TO_ROMAJI[two] !== undefined) {
      result += HIRAGANA_TO_ROMAJI[two];
      i += 2;
      continue;
    }
    const one = input[i];
    if (one === "っ") {
      // double next consonant
      const next = input[i + 1];
      const nextRomaji = next ? HIRAGANA_TO_ROMAJI[next] ?? "" : "";
      result += nextRomaji[0] ?? "t";
      i++;
      continue;
    }
    if (HIRAGANA_TO_ROMAJI[one] !== undefined) {
      result += HIRAGANA_TO_ROMAJI[one];
    } else {
      result += one;
    }
    i++;
  }
  return result;
}

type Mode = "toHiragana" | "toRomaji";

export default function RomajiImeHenkan() {
  const [mode, setMode] = useState<Mode>("toHiragana");
  const [input, setInput] = useState("");

  const output = useCallback(() => {
    if (!input) return "";
    return mode === "toHiragana" ? romajiToHiragana(input) : hiraganaToRomaji(input);
  }, [input, mode])();

  const swap = () => {
    setInput(output);
    setMode((m) => (m === "toHiragana" ? "toRomaji" : "toHiragana"));
  };

  const examples =
    mode === "toHiragana"
      ? ["konnichiwa", "arigatou", "tokyo", "sakura", "nihongo"]
      : ["こんにちは", "ありがとう", "とうきょう", "さくら", "にほんご"];

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode("toHiragana")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              mode === "toHiragana"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ローマ字 → ひらがな
          </button>
          <button
            onClick={() => setMode("toRomaji")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
              mode === "toRomaji"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ひらがな → ローマ字
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
          {/* Input */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              {mode === "toHiragana" ? "ローマ字" : "ひらがな"}
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-200 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono"
              placeholder={mode === "toHiragana" ? "例: konnichiwa" : "例: こんにちは"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center pt-6">
            <button
              onClick={swap}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="入れ替え"
            >
              ⇄
            </button>
          </div>

          {/* Output */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              {mode === "toHiragana" ? "ひらがな" : "ローマ字"}
            </label>
            <div className="w-full h-32 p-3 border border-gray-100 bg-gray-50 rounded-xl text-base font-mono overflow-auto whitespace-pre-wrap">
              {output || <span className="text-gray-300">変換結果がここに表示されます</span>}
            </div>
          </div>
        </div>

        {output && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-xs px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
            >
              コピー
            </button>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">サンプル入力</h2>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setInput(ex)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-lg border border-blue-200 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">ヘボン式 対応表（主要）</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-xs">
          {[
            ["ka","か"],["ki","き"],["ku","く"],["ke","け"],["ko","こ"],
            ["sa","さ"],["shi","し"],["su","す"],["se","せ"],["so","そ"],
            ["ta","た"],["chi","ち"],["tsu","つ"],["te","て"],["to","と"],
            ["na","な"],["ni","に"],["nu","ぬ"],["ne","ね"],["no","の"],
            ["ha","は"],["hi","ひ"],["fu","ふ"],["he","へ"],["ho","ほ"],
            ["ma","ま"],["mi","み"],["mu","む"],["me","め"],["mo","も"],
            ["ya","や"],["",""],["yu","ゆ"],["",""],["yo","よ"],
            ["ra","ら"],["ri","り"],["ru","る"],["re","れ"],["ro","ろ"],
            ["wa","わ"],["",""],["",""],["",""],["wo","を"],
            ["",""],["",""],["n","ん"],["",""],["",""],
          ].map(([r, h], i) => (
            <div key={i} className={`text-center p-1 rounded ${r ? "bg-gray-50 border border-gray-100" : ""}`}>
              {r && (
                <>
                  <div className="text-gray-400 leading-none">{r}</div>
                  <div className="font-bold text-gray-800">{h}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
