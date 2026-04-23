"use client";
import { useState } from "react";

// マイナンバーのチェックディジット検証
// JIS X 0213 / 行政手続における特定の個人を識別するための番号の利用等に関する法律施行令
// p = sum of (d_i * q_i) for i=1..11, where q_i is based on position
// check digit = 0 if p mod 11 <= 1, else (11 - p mod 11)

function validateMyNumber(num: string): {
  valid: boolean;
  reason: string;
  steps: { i: number; digit: number; weight: number; product: number }[];
  sum: number;
  remainder: number;
  expectedCheck: number;
  actualCheck: number;
} {
  const digits = num.replace(/[^0-9]/g, "");

  if (digits.length !== 12) {
    return {
      valid: false,
      reason: `桁数エラー：${digits.length}桁（12桁必要）`,
      steps: [],
      sum: 0,
      remainder: 0,
      expectedCheck: -1,
      actualCheck: -1,
    };
  }

  // 先頭が0の場合は無効
  if (digits[0] === "0") {
    return {
      valid: false,
      reason: "先頭桁は0以外の数字が必要です",
      steps: [],
      sum: 0,
      remainder: 0,
      expectedCheck: -1,
      actualCheck: -1,
    };
  }

  const steps: { i: number; digit: number; weight: number; product: number }[] = [];
  let sum = 0;

  // 下位11桁（index 0〜10）について検算
  // p番目の桁（右から数えてp番目）の重みは p+1 (2〜7)→ p+1, (8〜11)→p-5
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(digits[10 - i], 10); // 右から i+1番目
    const weight = i < 6 ? i + 2 : i - 4; // 2,3,4,5,6,7 → 8,9,10,11,12... wait, spec
    // 実際の重み：右から1番目(チェックディジット除く)から順に 2,3,4,5,6,7,2,3,4,5,6
    // i=0 → weight=2, i=1→3, ..., i=5→7, i=6→2, i=7→3, i=8→4, i=9→5, i=10→6
    const w = i <= 5 ? i + 2 : i - 4;
    const product = digit * w;
    steps.push({ i: i + 1, digit, weight: w, product });
    sum += product;
  }

  const remainder = sum % 11;
  const expectedCheck = remainder <= 1 ? 0 : 11 - remainder;
  const actualCheck = parseInt(digits[11], 10);
  const valid = expectedCheck === actualCheck;

  return {
    valid,
    reason: valid ? "有効なマイナンバーです" : `チェックディジット不一致：期待値 ${expectedCheck}、入力値 ${actualCheck}`,
    steps,
    sum,
    remainder,
    expectedCheck,
    actualCheck,
  };
}

function formatMyNumber(num: string) {
  const d = num.replace(/[^0-9]/g, "").slice(0, 12);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
}

// サンプルの有効なマイナンバー（チェックディジット計算済み）
// これは架空の番号です
function generateSampleNumber(): string {
  const base = "12345678901";
  const digits = base.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const w = i <= 5 ? i + 2 : i - 4;
    sum += digits[10 - i] * w;
  }
  const r = sum % 11;
  const check = r <= 1 ? 0 : 11 - r;
  return base + check;
}

export default function MyNumberValidator() {
  const [input, setInput] = useState("");
  const [showSteps, setShowSteps] = useState(false);

  const raw = input.replace(/[^0-9]/g, "");
  const result = raw.length > 0 ? validateMyNumber(raw) : null;

  const sample = generateSampleNumber();

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">マイナンバーを入力（12桁）</h2>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/[^0-9\-\s]/g, ""))}
            placeholder="例：1234-5678-9012"
            maxLength={16}
            className="border border-gray-300 rounded-lg px-4 py-3 w-56 text-gray-900 text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <span className="text-sm text-gray-500">{raw.length} / 12桁</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setInput(formatMyNumber(sample))}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            サンプル番号を入力（架空）
          </button>
          <button
            onClick={() => setInput("")}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            クリア
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ※ このツールはチェックディジットの形式検証のみを行います。実在するマイナンバーの確認はできません。
        </p>
      </div>

      {/* 結果 */}
      {result && (
        <div className={`rounded-2xl border-2 p-6 ${result.valid ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{result.valid ? "✅" : "❌"}</span>
            <span className={`text-xl font-bold ${result.valid ? "text-green-800" : "text-red-800"}`}>
              {result.valid ? "有効" : "無効"}
            </span>
          </div>
          <p className={`text-sm ${result.valid ? "text-green-700" : "text-red-700"}`}>{result.reason}</p>
          {result.actualCheck >= 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">入力値（12桁目）</div>
                <div className="text-2xl font-bold text-gray-900">{result.actualCheck}</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">期待チェック値</div>
                <div className={`text-2xl font-bold ${result.valid ? "text-green-700" : "text-red-700"}`}>
                  {result.expectedCheck}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">合計 mod 11</div>
                <div className="text-2xl font-bold text-gray-900">{result.remainder}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 計算ステップ */}
      {result && result.steps.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">チェックディジット計算過程</h2>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showSteps ? "折りたたむ" : "詳細を表示"}
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-4 text-sm text-blue-800">
            <p className="font-medium mb-1">アルゴリズム（番号法施行令）</p>
            <p>右から2〜7桁目の重みは 2,3,4,5,6,7、右から8〜12桁目の重みは 2,3,4,5,6</p>
            <p className="mt-1">合計 mod 11 が 0 または 1 → チェックディジット＝0、それ以外 → 11 − 余り</p>
          </div>

          {showSteps && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="px-3 py-2 text-left">右からの位置</th>
                    <th className="px-3 py-2 text-center">桁の値</th>
                    <th className="px-3 py-2 text-center">重み</th>
                    <th className="px-3 py-2 text-center">積</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.steps.map((s) => (
                    <tr key={s.i}>
                      <td className="px-3 py-2 text-gray-600">右{s.i + 1}桁目</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-gray-900">{s.digit}</td>
                      <td className="px-3 py-2 text-center text-gray-600">× {s.weight}</td>
                      <td className="px-3 py-2 text-center font-bold text-blue-700">{s.product}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-3 py-2 font-semibold text-gray-700">合計</td>
                    <td className="px-3 py-2 text-center font-bold text-gray-900">{result.sum}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-gray-600">{result.sum} mod 11</td>
                    <td className="px-3 py-2 text-center font-bold text-gray-900">{result.remainder}</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td colSpan={3} className="px-3 py-2 font-semibold text-blue-800">チェックディジット</td>
                    <td className="px-3 py-2 text-center font-bold text-blue-900">{result.expectedCheck}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        ※ 実際のマイナンバーは絶対に入力しないでください。このツールはアルゴリズム学習目的です。
      </div>
    </div>
  );
}
