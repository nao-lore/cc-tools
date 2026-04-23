"use client";

import { useState, useCallback } from "react";

interface CIResult {
  mean: number;
  se: number;
  margin90: number;
  margin95: number;
  margin99: number;
  lower90: number;
  upper90: number;
  lower95: number;
  upper95: number;
  lower99: number;
  upper99: number;
}

// Percent point function (inverse normal) approximation via rational approximation
function normPPF(p: number): number {
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    const r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

const Z90 = normPPF(0.95); // 1.6449
const Z95 = normPPF(0.975); // 1.9600
const Z99 = normPPF(0.995); // 2.5758

function fmt(n: number, d = 4): string {
  return n.toFixed(d);
}

type Mode = "z" | "t";

export default function ConfidenceInterval() {
  const [n, setN] = useState("100");
  const [mean, setMean] = useState("50");
  const [sd, setSd] = useState("10");
  const [mode, setMode] = useState<Mode>("z");
  const [result, setResult] = useState<CIResult | null>(null);
  const [error, setError] = useState("");

  // t-distribution inverse CDF via approximation (Cornish-Fisher)
  function tPPF(p: number, df: number): number {
    if (df >= 120) return normPPF(p);
    // Use Abramowitz & Stegun approximation
    const z = normPPF(p);
    const g1 = (z ** 3 + z) / 4;
    const g2 = (5 * z ** 5 + 16 * z ** 3 + 3 * z) / 96;
    const g3 = (3 * z ** 7 + 19 * z ** 5 + 17 * z ** 3 - 15 * z) / 384;
    const g4 =
      (79 * z ** 9 + 776 * z ** 7 + 1482 * z ** 5 - 1920 * z ** 3 - 945 * z) / 92160;
    return z + g1 / df + g2 / df ** 2 + g3 / df ** 3 + g4 / df ** 4;
  }

  const calculate = useCallback(() => {
    setError("");
    const nVal = parseInt(n);
    const meanVal = parseFloat(mean);
    const sdVal = parseFloat(sd);

    if (isNaN(nVal) || nVal < 2) {
      setError("サンプルサイズは2以上の整数を入力してください。");
      return;
    }
    if (isNaN(meanVal)) {
      setError("平均値を入力してください。");
      return;
    }
    if (isNaN(sdVal) || sdVal <= 0) {
      setError("標準偏差は0より大きい値を入力してください。");
      return;
    }

    const se = sdVal / Math.sqrt(nVal);
    const df = nVal - 1;

    let z90: number, z95: number, z99: number;
    if (mode === "z") {
      z90 = Z90;
      z95 = Z95;
      z99 = Z99;
    } else {
      z90 = tPPF(0.95, df);
      z95 = tPPF(0.975, df);
      z99 = tPPF(0.995, df);
    }

    const m90 = z90 * se;
    const m95 = z95 * se;
    const m99 = z99 * se;

    setResult({
      mean: meanVal,
      se,
      margin90: m90,
      margin95: m95,
      margin99: m99,
      lower90: meanVal - m90,
      upper90: meanVal + m90,
      lower95: meanVal - m95,
      upper95: meanVal + m95,
      lower99: meanVal - m99,
      upper99: meanVal + m99,
    });
  }, [n, mean, sd, mode]);

  const levels = [
    { label: "90%", lower: result?.lower90, upper: result?.upper90, margin: result?.margin90, color: "blue" },
    { label: "95%", lower: result?.lower95, upper: result?.upper95, margin: result?.margin95, color: "indigo" },
    { label: "99%", lower: result?.lower99, upper: result?.upper99, margin: result?.margin99, color: "purple" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">パラメータ入力</h2>

        {/* Mode selector */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">検定方法</label>
          <div className="flex gap-3">
            {([["z", "Z検定（母標準偏差既知 / n≥30）"], ["t", "t検定（母標準偏差未知）"]] as [Mode, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  mode === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "サンプルサイズ (n)", value: n, set: setN, placeholder: "例: 100", type: "number" },
            { label: "標本平均 (x̄)", value: mean, set: setMean, placeholder: "例: 50" },
            { label: "標本標準偏差 (s)", value: sd, set: setSd, placeholder: "例: 10" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={calculate}
          className="mt-5 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          信頼区間を計算
        </button>
      </div>

      {result && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-800">標準誤差</h2>
              <span className="text-2xl font-bold text-gray-700">{fmt(result.se)}</span>
            </div>
            <p className="text-sm text-gray-500">SE = s / √n = {fmt(parseFloat(sd))} / √{n} = {fmt(result.se)}</p>
          </div>

          <div className="space-y-4">
            {levels.map(({ label, lower, upper, margin, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{label} 信頼区間</h3>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full bg-${color}-100 text-${color}-700`}>
                    ± {fmt(margin ?? 0)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">下限</div>
                    <div className={`text-xl font-bold text-${color}-600`}>{fmt(lower ?? 0)}</div>
                  </div>
                  <div className="flex-1 relative h-6">
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                      <div className={`w-full h-1.5 bg-${color}-100 rounded-full`}>
                        <div className={`h-full bg-${color}-400 rounded-full`} style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div className="absolute inset-y-0 left-1/2 flex items-center -translate-x-1/2">
                      <div className={`text-xs font-medium text-${color}-700 bg-white px-1`}>
                        {fmt(result.mean)}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">上限</div>
                    <div className={`text-xl font-bold text-${color}-600`}>{fmt(upper ?? 0)}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  [ {fmt(lower ?? 0)} , {fmt(upper ?? 0)} ] — 幅: {fmt((upper ?? 0) - (lower ?? 0))}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-5">
            <h3 className="font-semibold text-indigo-800 mb-2">計算式</h3>
            <p className="text-indigo-700 text-sm font-mono">CI = x̄ ± z × (s / √n)</p>
            <p className="text-indigo-600 text-sm mt-2">
              z90 = {fmt(Z90, 4)}、z95 = {fmt(Z95, 4)}、z99 = {fmt(Z99, 4)}（Z検定の場合）
            </p>
          </div>
        </>
      )}
    </div>
  );
}
