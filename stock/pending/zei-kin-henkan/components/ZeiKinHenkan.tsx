"use client";

import { useState, useMemo } from "react";

type Direction = "excl_to_incl" | "incl_to_excl";
type Rounding = "floor" | "round" | "ceil";
type TaxRate = 8 | 10;

function applyRounding(value: number, rounding: Rounding): number {
  if (rounding === "floor") return Math.floor(value);
  if (rounding === "ceil") return Math.ceil(value);
  return Math.round(value);
}

function calcFromExcl(
  excl: number,
  rate: TaxRate,
  rounding: Rounding
): { excl: number; tax: number; incl: number } {
  const tax = applyRounding(excl * (rate / 100), rounding);
  return { excl, tax, incl: excl + tax };
}

function calcFromIncl(
  incl: number,
  rate: TaxRate,
  rounding: Rounding
): { excl: number; tax: number; incl: number } {
  const excl = applyRounding(incl / (1 + rate / 100), rounding);
  const tax = incl - excl;
  return { excl, tax, incl };
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

interface BatchRow {
  original: string;
  amount: number;
  rate: TaxRate;
  excl: number;
  tax: number;
  incl: number;
  error?: string;
}

function parseBatchLine(
  line: string,
  defaultRate: TaxRate,
  direction: Direction,
  rounding: Rounding
): BatchRow {
  const trimmed = line.trim();
  if (!trimmed) {
    return {
      original: line,
      amount: 0,
      rate: defaultRate,
      excl: 0,
      tax: 0,
      incl: 0,
      error: "空行",
    };
  }

  const parts = trimmed.split(/\s+/);
  const amountStr = parts[0].replace(/,/g, "");
  const amount = Number(amountStr);

  if (isNaN(amount) || amount < 0) {
    return {
      original: line,
      amount: 0,
      rate: defaultRate,
      excl: 0,
      tax: 0,
      incl: 0,
      error: "無効な金額",
    };
  }

  let rate: TaxRate = defaultRate;
  if (parts.length >= 2) {
    const rateStr = parts[1].replace("%", "");
    const parsed = Number(rateStr);
    if (parsed === 8 || parsed === 10) {
      rate = parsed as TaxRate;
    }
  }

  if (direction === "excl_to_incl") {
    const result = calcFromExcl(amount, rate, rounding);
    return { original: line, amount, rate, ...result };
  } else {
    const result = calcFromIncl(amount, rate, rounding);
    return { original: line, amount, rate, ...result };
  }
}

export default function ZeiKinHenkan() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [direction, setDirection] = useState<Direction>("excl_to_incl");
  const [rounding, setRounding] = useState<Rounding>("floor");

  // Single mode
  const [singleAmount, setSingleAmount] = useState("");
  const [singleRate, setSingleRate] = useState<TaxRate>(10);

  // Batch mode
  const [batchText, setBatchText] = useState("");
  const [defaultRate, setDefaultRate] = useState<TaxRate>(10);

  const [copied, setCopied] = useState(false);

  const singleResult = useMemo(() => {
    const raw = singleAmount.replace(/,/g, "");
    const amount = Number(raw);
    if (!raw || isNaN(amount) || amount < 0) return null;
    if (direction === "excl_to_incl") {
      return calcFromExcl(amount, singleRate, rounding);
    } else {
      return calcFromIncl(amount, singleRate, rounding);
    }
  }, [singleAmount, singleRate, direction, rounding]);

  const batchRows = useMemo<BatchRow[]>(() => {
    if (!batchText.trim()) return [];
    return batchText
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => parseBatchLine(line, defaultRate, direction, rounding));
  }, [batchText, defaultRate, direction, rounding]);

  const batchTotals = useMemo(() => {
    const valid = batchRows.filter((r) => !r.error);
    return {
      excl: valid.reduce((s, r) => s + r.excl, 0),
      tax: valid.reduce((s, r) => s + r.tax, 0),
      incl: valid.reduce((s, r) => s + r.incl, 0),
    };
  }, [batchRows]);

  function copyBatch() {
    const lines = batchRows
      .filter((r) => !r.error)
      .map(
        (r) =>
          `${r.original.trim()}\t税抜: ¥${fmt(r.excl)}\t消費税: ¥${fmt(r.tax)}\t税込: ¥${fmt(r.incl)}`
      );
    lines.push("");
    lines.push(
      `合計\t税抜: ¥${fmt(batchTotals.excl)}\t消費税: ¥${fmt(batchTotals.tax)}\t税込: ¥${fmt(batchTotals.incl)}`
    );
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copySingle() {
    if (!singleResult) return;
    const text = `税抜: ¥${fmt(singleResult.excl)}  消費税: ¥${fmt(singleResult.tax)}  税込: ¥${fmt(singleResult.incl)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const dirLabel = direction === "excl_to_incl" ? "税抜 → 税込" : "税込 → 税抜";
  const inputLabel = direction === "excl_to_incl" ? "税抜金額" : "税込金額";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            税込 ⇔ 税抜 一括変換ツール
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            8%/10%軽減税率対応・レシート複数行一括計算・内税外税両対応
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          {/* Direction toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              変換方向
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection("excl_to_incl")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  direction === "excl_to_incl"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                税抜 → 税込
              </button>
              <button
                onClick={() => setDirection("incl_to_excl")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  direction === "incl_to_excl"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                税込 → 税抜
              </button>
            </div>
          </div>

          {/* Rounding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              端数処理
            </label>
            <div className="flex gap-2">
              {(
                [
                  ["floor", "切り捨て"],
                  ["round", "四捨五入"],
                  ["ceil", "切り上げ"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRounding(val)}
                  className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium border transition-colors ${
                    rounding === val
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              モード
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  mode === "single"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                1件
              </button>
              <button
                onClick={() => setMode("batch")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  mode === "batch"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                複数行（一括）
              </button>
            </div>
          </div>
        </div>

        {/* Single mode */}
        {mode === "single" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {inputLabel}（円）
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={singleAmount}
                  onChange={(e) => setSingleAmount(e.target.value)}
                  placeholder="例: 1000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  税率
                </label>
                <div className="flex gap-1 h-[38px] items-center">
                  {([8, 10] as TaxRate[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSingleRate(r)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        singleRate === r
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {singleResult && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">税抜</div>
                    <div className="text-lg font-bold text-gray-900">
                      ¥{fmt(singleResult.excl)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      消費税（{singleRate}%）
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      ¥{fmt(singleResult.tax)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">税込</div>
                    <div className="text-lg font-bold text-blue-700">
                      ¥{fmt(singleResult.incl)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={copySingle}
                  className="w-full py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  {copied ? "コピーしました" : "結果をコピー"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Batch mode */}
        {mode === "batch" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                金額リスト（1行1件）
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>デフォルト税率:</span>
                {([8, 10] as TaxRate[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDefaultRate(r)}
                    className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                      defaultRate === r
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={
                direction === "excl_to_incl"
                  ? "1000\n2500 8\n3000 10\n800 8%"
                  : "1080\n2700 8\n3300 10\n864 8%"
              }
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <p className="text-xs text-gray-400">
              書式: <code>金額</code> または{" "}
              <code>金額 税率</code>（例: <code>1000 8</code>{" "}
              または <code>1000 8%</code>）。税率省略時は{defaultRate}%を使用。
            </p>

            {batchRows.length > 0 && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          入力
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          税率
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          税抜
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          消費税
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          税込
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchRows.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            row.error
                              ? "bg-red-50"
                              : i % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                          }
                        >
                          <td className="px-3 py-2 font-mono text-gray-700 border border-gray-200">
                            {row.original.trim()}
                          </td>
                          {row.error ? (
                            <td
                              colSpan={4}
                              className="px-3 py-2 text-red-500 border border-gray-200"
                            >
                              {row.error}
                            </td>
                          ) : (
                            <>
                              <td className="px-3 py-2 text-right text-gray-600 border border-gray-200">
                                {row.rate}%
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900 border border-gray-200">
                                ¥{fmt(row.excl)}
                              </td>
                              <td className="px-3 py-2 text-right text-orange-600 border border-gray-200">
                                ¥{fmt(row.tax)}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-blue-700 border border-gray-200">
                                ¥{fmt(row.incl)}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="bg-gray-800 text-white font-bold">
                        <td
                          colSpan={2}
                          className="px-3 py-2 border border-gray-600"
                        >
                          合計
                        </td>
                        <td className="px-3 py-2 text-right border border-gray-600">
                          ¥{fmt(batchTotals.excl)}
                        </td>
                        <td className="px-3 py-2 text-right border border-gray-600 text-orange-300">
                          ¥{fmt(batchTotals.tax)}
                        </td>
                        <td className="px-3 py-2 text-right border border-gray-600 text-blue-300">
                          ¥{fmt(batchTotals.incl)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={copyBatch}
                  className="w-full py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  {copied ? "コピーしました" : "結果をコピー（タブ区切り）"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ad placeholder */}
        <div className="w-full h-24 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          広告
        </div>
      </div>
    </div>
  );
}
