"use client";

import { useState, useCallback } from "react";

// Hepburn romanization table
const HEBON_MAP: [string, string][] = [
  // Special combinations first
  ["しゃ", "sha"], ["しゅ", "shu"], ["しょ", "sho"], ["し", "shi"],
  ["ちゃ", "cha"], ["ちゅ", "chu"], ["ちょ", "cho"], ["ち", "chi"],
  ["つ", "tsu"],
  ["じゃ", "ja"], ["じゅ", "ju"], ["じょ", "jo"], ["じ", "ji"],
  ["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"],
  ["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"],
  ["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"],
  ["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"],
  ["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"],
  ["ぎゃ", "gya"], ["ぎゅ", "gyu"], ["ぎょ", "gyo"],
  ["びゃ", "bya"], ["びゅ", "byu"], ["びょ", "byo"],
  ["ぴゃ", "pya"], ["ぴゅ", "pyu"], ["ぴょ", "pyo"],
  // Basic
  ["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"],
  ["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"],
  ["さ", "sa"], ["す", "su"], ["せ", "se"], ["そ", "so"],
  ["た", "ta"], ["て", "te"], ["と", "to"],
  ["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"],
  ["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"],
  ["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"],
  ["や", "ya"], ["ゆ", "yu"], ["よ", "yo"],
  ["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"],
  ["わ", "wa"], ["を", "o"], ["ん", "n"],
  ["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"],
  ["ざ", "za"], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"],
  ["だ", "da"], ["で", "de"], ["ど", "do"],
  ["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"],
  ["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"],
  // Katakana
  ["シャ", "sha"], ["シュ", "shu"], ["ショ", "sho"], ["シ", "shi"],
  ["チャ", "cha"], ["チュ", "chu"], ["チョ", "cho"], ["チ", "chi"],
  ["ツ", "tsu"],
  ["ジャ", "ja"], ["ジュ", "ju"], ["ジョ", "jo"], ["ジ", "ji"],
  ["ニャ", "nya"], ["ニュ", "nyu"], ["ニョ", "nyo"],
  ["ヒャ", "hya"], ["ヒュ", "hyu"], ["ヒョ", "hyo"],
  ["ミャ", "mya"], ["ミュ", "myu"], ["ミョ", "myo"],
  ["リャ", "rya"], ["リュ", "ryu"], ["リョ", "ryo"],
  ["キャ", "kya"], ["キュ", "kyu"], ["キョ", "kyo"],
  ["ギャ", "gya"], ["ギュ", "gyu"], ["ギョ", "gyo"],
  ["ビャ", "bya"], ["ビュ", "byu"], ["ビョ", "byo"],
  ["ピャ", "pya"], ["ピュ", "pyu"], ["ピョ", "pyo"],
  ["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"],
  ["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"],
  ["サ", "sa"], ["ス", "su"], ["セ", "se"], ["ソ", "so"],
  ["タ", "ta"], ["テ", "te"], ["ト", "to"],
  ["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"],
  ["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"],
  ["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"],
  ["ヤ", "ya"], ["ユ", "yu"], ["ヨ", "yo"],
  ["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"],
  ["ワ", "wa"], ["ヲ", "o"], ["ン", "n"],
  ["ガ", "ga"], ["ギ", "gi"], ["グ", "gu"], ["ゲ", "ge"], ["ゴ", "go"],
  ["ザ", "za"], ["ズ", "zu"], ["ゼ", "ze"], ["ゾ", "zo"],
  ["ダ", "da"], ["デ", "de"], ["ド", "do"],
  ["バ", "ba"], ["ビ", "bi"], ["ブ", "bu"], ["ベ", "be"], ["ボ", "bo"],
  ["パ", "pa"], ["ピ", "pi"], ["プ", "pu"], ["ペ", "pe"], ["ポ", "po"],
  // Long vowels (passport style — just drop the macron)
  ["ー", ""],
  // Small tsu (double consonant)
  ["っ", ""], ["ッ", ""],
];

function toHebon(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    // Handle small tsu (double next consonant)
    if (text[i] === "っ" || text[i] === "ッ") {
      // Find the consonant of the next mora
      let found = false;
      for (const [kana, roma] of HEBON_MAP) {
        if (text.startsWith(kana, i + 1) && roma.length > 0) {
          result += roma[0]; // double the consonant
          found = true;
          break;
        }
      }
      if (!found) result += "";
      i++;
      continue;
    }
    // Try 2-char combo first, then 1-char
    let matched = false;
    for (const [kana, roma] of HEBON_MAP) {
      if (text.startsWith(kana, i)) {
        result += roma;
        i += kana.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
}

function toPassport(text: string): string {
  // Passport Hepburn: uppercase, long vowels elided, ん before b/m/p → m
  let r = toHebon(text).toUpperCase();
  // ん + b/m/p → M
  r = r.replace(/N([BMP])/g, "M$1");
  return r;
}

export default function HebonRomaji() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"standard" | "passport">("passport");
  const [copied, setCopied] = useState(false);

  const output = useCallback(() => {
    if (!input.trim()) return "";
    return mode === "passport" ? toPassport(input) : toHebon(input).toUpperCase();
  }, [input, mode]);

  const result = output();

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-xs text-muted mb-3 font-medium">変換モード</p>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setMode("passport")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === "passport" ? "bg-primary text-white" : "bg-accent text-muted hover:text-foreground"
            }`}
          >
            パスポート用（推奨）
          </button>
          <button
            onClick={() => setMode("standard")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === "standard" ? "bg-primary text-white" : "bg-accent text-muted hover:text-foreground"
            }`}
          >
            標準ヘボン式
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          {mode === "passport"
            ? "外務省パスポート申請基準。大文字・長音省略・ん→m（b/m/p前）。"
            : "標準ヘボン式ローマ字。大文字表記。"}
        </p>
      </div>

      {/* Input */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1 font-medium">日本語（ひらがな・カタカナ・漢字混じり可）</label>
          <textarea
            rows={3}
            placeholder="例: やまだ たろう / ヤマダ タロウ"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent text-foreground resize-none"
          />
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted font-medium">ヘボン式ローマ字</label>
            <button
              onClick={handleCopy}
              disabled={!result}
              className="text-xs text-primary hover:text-primary/80 disabled:text-muted disabled:cursor-not-allowed transition-colors"
            >
              {copied ? "コピー済み ✓" : "コピー"}
            </button>
          </div>
          <div className="w-full px-3 py-3 border border-border rounded-lg bg-accent min-h-[60px] font-mono text-lg tracking-widest text-foreground select-all">
            {result || <span className="text-muted text-sm font-sans">変換結果がここに表示されます</span>}
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">変換例</h2>
        <div className="space-y-2">
          {[
            ["やまだ たろう", "YAMADA TARO"],
            ["さとう はなこ", "SATO HANAKO"],
            ["しんじゅく", "SHINJUKU"],
            ["ほっかいどう", "HOKKAIDO"],
            ["ふじさん", "FUJISAN"],
          ].map(([jp, en]) => (
            <button
              key={jp}
              onClick={() => setInput(jp)}
              className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
            >
              <span className="text-foreground">{jp}</span>
              <span className="font-mono text-primary">{en}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
