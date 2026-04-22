"use client";

import { useState, useCallback } from "react";

// 通常漢数字
const KANJI_DIGITS = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const KANJI_UNITS = ["", "十", "百", "千"];
const KANJI_LARGE = ["", "万", "億"];

// 大字
const DAIJI_DIGITS = ["〇", "壱", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖"];
const DAIJI_UNITS = ["", "拾", "阡", "阡"]; // 拾・佰・阡
const DAIJI_UNITS_FULL = ["", "拾", "佰", "阡"];
const DAIJI_LARGE = ["", "萬", "億"];

function groupOf4(n: number): number[] {
  // Returns groups of 4 digits from least significant
  const groups: number[] = [];
  while (n > 0) {
    groups.push(n % 10000);
    n = Math.floor(n / 10000);
  }
  return groups;
}

function convert4Digits(
  n: number,
  digits: string[],
  units: string[],
  omitOne = true
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
  if (n === 0) return "〇";
  const groups = groupOf4(n);
  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const part = convert4Digits(groups[i], KANJI_DIGITS, KANJI_UNITS, true);
    result += part + KANJI_LARGE[i];
  }
  return result;
}

function toDaiji(n: number): string {
  if (n === 0) return "零";
  const groups = groupOf4(n);
  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const part = convert4Digits(groups[i], DAIJI_DIGITS, DAIJI_UNITS_FULL, false);
    result += part + DAIJI_LARGE[i];
  }
  return result;
}

function toKuraidori(n: number): string {
  if (n === 0) return "0";
  const groups = groupOf4(n);
  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    result += groups[i].toLocaleString("ja-JP") + KANJI_LARGE[i];
  }
  return result;
}

function toKingaku(n: number): string {
  return "金" + toDaiji(n) + "円也";
}

// Reverse: kanji/daiji → number
const KANJI_TO_NUM: Record<string, number> = {
  〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
  壱: 1, 弐: 2, 参: 3, 肆: 4, 伍: 5, 陸: 6, 漆: 7, 捌: 8, 玖: 9,
  零: 0,
};
const UNIT_TO_NUM: Record<string, number> = {
  十: 10, 拾: 10,
  百: 100, 佰: 100,
  千: 1000, 阡: 1000,
  万: 10000, 萬: 10000,
  億: 100000000,
};

function kanjiToNumber(input: string): number | null {
  // Strip 金/円也 for kingaku form
  let s = input.replace(/^金/, "").replace(/円也$/, "").replace(/円$/, "").trim();
  if (s === "" || s === "〇" || s === "零") return 0;

  // Try simple digit-only parse
  let result = 0;
  let current = 0; // accumulator within current large unit group
  let small = 0;   // accumulator within current 4-digit group

  const chars = Array.from(s);
  for (const ch of chars) {
    if (ch in KANJI_TO_NUM) {
      small = KANJI_TO_NUM[ch];
    } else if (ch in UNIT_TO_NUM) {
      const u = UNIT_TO_NUM[ch];
      if (u >= 10000) {
        // large unit
        current += small || 1;
        result += current * u;
        current = 0;
        small = 0;
      } else {
        // small unit
        current += (small || 1) * u;
        small = 0;
      }
    } else {
      return null; // unrecognized character
    }
  }
  result += current + small;
  return result > 999999999999 ? null : result;
}

interface FormatRow {
  label: string;
  value: string;
  color: string;
}

export default function SuujiKanjiConverter() {
  const [mode, setMode] = useState<"toKanji" | "toNumber">("toKanji");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const num = (() => {
    if (mode === "toKanji") {
      const n = parseInt(input.replace(/,/g, ""), 10);
      if (isNaN(n) || n < 0 || n > 999999999999) return null;
      return n;
    }
    return null;
  })();

  const reverseResult = (() => {
    if (mode === "toNumber" && input.trim()) {
      const n = kanjiToNumber(input.trim());
      return n;
    }
    return null;
  })();

  const formats: FormatRow[] = num !== null
    ? [
        { label: "通常漢数字", value: toKanji(num), color: "blue" },
        { label: "大字", value: toDaiji(num), color: "purple" },
        { label: "位取り式", value: toKuraidori(num), color: "green" },
        { label: "金額表示", value: toKingaku(num), color: "amber" },
      ]
    : [];

  const handleCopy = useCallback((text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  const colorMap: Record<string, string> = {
    blue:   "bg-blue-50 border-blue-200 text-blue-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    green:  "bg-green-50 border-green-200 text-green-800",
    amber:  "bg-amber-50 border-amber-200 text-amber-800",
  };
  const btnMap: Record<string, string> = {
    blue:   "bg-blue-100 hover:bg-blue-200 text-blue-700",
    purple: "bg-purple-100 hover:bg-purple-200 text-purple-700",
    green:  "bg-green-100 hover:bg-green-200 text-green-700",
    amber:  "bg-amber-100 hover:bg-amber-200 text-amber-700",
  };

  const isInvalid =
    mode === "toKanji" &&
    input !== "" &&
    (isNaN(parseInt(input.replace(/,/g, ""), 10)) ||
      parseInt(input.replace(/,/g, ""), 10) > 999999999999 ||
      parseInt(input.replace(/,/g, ""), 10) < 0);

  const reverseInvalid =
    mode === "toNumber" && input.trim() !== "" && reverseResult === null;

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex gap-2">
        <button
          onClick={() => { setMode("toKanji"); setInput(""); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
            mode === "toKanji"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          数字 → 漢数字
        </button>
        <button
          onClick={() => { setMode("toNumber"); setInput(""); }}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
            mode === "toNumber"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          漢数字 → 数字
        </button>
      </div>

      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        {mode === "toKanji" ? (
          <>
            <label className="block text-sm font-medium text-gray-700">
              数字を入力（最大 999,999,999,999）
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="例: 12345"
              value={input}
              onChange={(e) => setInput(e.target.value.replace(/[^\d,]/g, ""))}
              className={`w-full border rounded-lg px-4 py-3 text-gray-800 text-lg focus:outline-none focus:ring-2 ${
                isInvalid
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {isInvalid && (
              <p className="text-red-500 text-xs">
                0〜999,999,999,999（9999億）の範囲で入力してください
              </p>
            )}
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700">
              漢数字・大字を入力
            </label>
            <input
              type="text"
              placeholder="例: 壱萬弐阡三百四拾伍"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full border rounded-lg px-4 py-3 text-gray-800 text-lg focus:outline-none focus:ring-2 ${
                reverseInvalid
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {reverseInvalid && (
              <p className="text-red-500 text-xs">
                変換できませんでした。漢数字・大字を正しく入力してください
              </p>
            )}
          </>
        )}
      </div>

      {/* Results: toKanji mode */}
      {mode === "toKanji" && formats.length > 0 && (
        <div className="space-y-3">
          {formats.map((row, idx) => (
            <div
              key={row.label}
              className={`border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 ${colorMap[row.color]}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium opacity-70 mb-1">{row.label}</p>
                <p className="text-lg font-bold break-all">{row.value}</p>
              </div>
              <button
                onClick={() => handleCopy(row.value, idx)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${btnMap[row.color]}`}
              >
                {copied === idx ? "コピー済" : "コピー"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Result: toNumber mode */}
      {mode === "toNumber" && reverseResult !== null && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-indigo-600 mb-1">数字</p>
            <p className="text-2xl font-bold text-indigo-800">
              {reverseResult.toLocaleString("ja-JP")}
            </p>
          </div>
          <button
            onClick={() => handleCopy(String(reverseResult), 99)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors cursor-pointer"
          >
            {copied === 99 ? "コピー済" : "コピー"}
          </button>
        </div>
      )}

      {/* Cheat sheet */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">大字一覧</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            ["0", "零"],["1", "壱"],["2", "弐"],["3", "参"],["4", "肆"],
            ["5", "伍"],["6", "陸"],["7", "漆"],["8", "捌"],["9", "玖"],
          ].map(([arabic, daiji]) => (
            <div key={arabic} className="bg-white border border-gray-200 rounded-lg py-2">
              <span className="block text-gray-400">{arabic}</span>
              <span className="block font-bold text-gray-800">{daiji}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2">
          {[
            ["十", "拾"],["百", "佰"],["千", "阡"],["万", "萬"],
          ].map(([kanji, daiji]) => (
            <div key={kanji} className="bg-white border border-gray-200 rounded-lg py-2">
              <span className="block text-gray-400">{kanji}</span>
              <span className="block font-bold text-gray-800">{daiji}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
