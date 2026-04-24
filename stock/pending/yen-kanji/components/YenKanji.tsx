"use client";

import { useState, useCallback } from "react";

// 通常漢数字マッピング
const KANJI_DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const KANJI_UNITS = ["", "十", "百", "千"];
const KANJI_LARGE = ["", "万", "億", "兆"];

// 大字マッピング
const DAIJI_DIGITS = ["零", "壱", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖"];
const DAIJI_UNITS = ["", "拾", "佰", "阡"];
const DAIJI_LARGE = ["", "萬", "億", "兆"];

function groupOf4(n: number): number[] {
  const groups: number[] = [];
  let remaining = n;
  while (remaining > 0) {
    groups.push(remaining % 10000);
    remaining = Math.floor(remaining / 10000);
  }
  return groups;
}

function convert4Digits(
  n: number,
  digits: string[],
  units: string[],
  omitOne: boolean
): string {
  if (n === 0) return "";
  let result = "";
  const thousands = Math.floor(n / 1000);
  const hundreds = Math.floor((n % 1000) / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;

  if (thousands > 0) {
    result += (omitOne && thousands === 1 ? "" : digits[thousands]) + units[3];
  }
  if (hundreds > 0) {
    result += (omitOne && hundreds === 1 ? "" : digits[hundreds]) + units[2];
  }
  if (tens > 0) {
    result += (omitOne && tens === 1 ? "" : digits[tens]) + units[1];
  }
  if (ones > 0) {
    result += digits[ones];
  }
  return result;
}

function toKanji(n: number): string {
  if (n === 0) return "零円";
  const groups = groupOf4(n);
  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const part = convert4Digits(groups[i], KANJI_DIGITS, KANJI_UNITS, true);
    result += part + KANJI_LARGE[i];
  }
  return result + "円";
}

function toDaiji(n: number): string {
  if (n === 0) return "零圓";
  const groups = groupOf4(n);
  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const part = convert4Digits(groups[i], DAIJI_DIGITS, DAIJI_UNITS, false);
    result += part + DAIJI_LARGE[i];
  }
  return result + "圓";
}

function toKingaku(n: number): string {
  if (n === 0) return "金零圓也";
  const groups = groupOf4(n);
  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const part = convert4Digits(groups[i], DAIJI_DIGITS, DAIJI_UNITS, false);
    result += part + DAIJI_LARGE[i];
  }
  return "金" + result + "圓也";
}

const MAX = 999999999999999; // 999兆

export default function YenKanji() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const rawNum = parseInt(input.replace(/[,，]/g, ""), 10);
  const num = input === "" ? null : isNaN(rawNum) || rawNum < 0 || rawNum > MAX ? null : rawNum;
  const isInvalid = input !== "" && num === null;

  const formats = num !== null
    ? [
        { label: "通常漢数字", value: toKanji(num) },
        { label: "大字", value: toDaiji(num) },
        { label: "円也付き（正式）", value: toKingaku(num) },
      ]
    : [];

  const handleCopy = useCallback((text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <label className="block text-sm font-medium text-muted">
          金額（円）を入力
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="例: 12345"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^\d,，]/g, ""))}
          className={`w-full border rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 transition-colors ${
            isInvalid
              ? "border-red-400 focus:ring-red-300 text-red-700"
              : "border-border focus:ring-accent/40 text-foreground"
          }`}
        />
        {isInvalid && (
          <p className="text-red-500 text-xs">
            0〜999,999,999,999,999（999兆）の整数を入力してください
          </p>
        )}
      </div>

      {/* Results */}
      {formats.length > 0 && (
        <div className="space-y-3">
          {formats.map((row, idx) => (
            <div
              key={row.label}
              className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted mb-1">{row.label}</p>
                <p className="text-lg font-bold text-foreground break-all">
                  {row.value}
                </p>
              </div>
              <button
                onClick={() => handleCopy(row.value, idx)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                {copied === idx ? "コピー済" : "コピー"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mapping table */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-bold mb-3 text-foreground">漢数字・大字 対照表</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-xs mb-2">
          {[
            ["0", "零", "零"],
            ["1", "一", "壱"],
            ["2", "二", "弐"],
            ["3", "三", "参"],
            ["4", "四", "肆"],
            ["5", "五", "伍"],
            ["6", "六", "陸"],
            ["7", "七", "漆"],
            ["8", "八", "捌"],
            ["9", "九", "玖"],
          ].map(([arabic, kanji, daiji]) => (
            <div key={arabic} className="bg-white border border-border rounded-lg py-2">
              <span className="block text-muted text-[10px]">{arabic}</span>
              <span className="block text-foreground">{kanji}</span>
              <span className="block font-bold text-foreground">{daiji}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            ["十", "拾"],
            ["百", "佰"],
            ["千", "阡"],
            ["万", "萬"],
            ["億", "億"],
          ].map(([kanji, daiji]) => (
            <div key={kanji} className="bg-white border border-border rounded-lg py-2">
              <span className="block text-foreground">{kanji}</span>
              <span className="block font-bold text-foreground">{daiji}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-muted text-sm">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この金額漢字変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">数字の金額を漢数字・大字（壱・弐・参）に変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この金額漢字変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "数字の金額を漢数字・大字（壱・弐・参）に変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
