"use client";
import { useState, useCallback } from "react";

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function variance(arr: number[], ddof = 1): number {
  const m = mean(arr);
  return arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / (arr.length - ddof);
}

// Incomplete beta function approximation for p-value from F distribution
// Using a simple approximation via regularized incomplete beta function
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // Lanczos-like continued fraction approximation
  const lbeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  // Simple continued fraction (Lentz method simplified)
  let cf = 0;
  const maxIter = 200;
  const eps = 1e-10;
  let h = 1;
  let c = 1;
  let d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  h = d;
  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let num = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
    d = 1 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    num = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
    d = 1 + num * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + num / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < eps) break;
  }
  cf = front * h;
  return cf;
}

function lgamma(x: number): number {
  // Stirling approximation
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) { y++; ser += c[j] / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function fPValue(F: number, df1: number, df2: number): number {
  if (F <= 0 || df1 <= 0 || df2 <= 0) return 1;
  const x = df2 / (df2 + df1 * F);
  return incompleteBeta(x, df2 / 2, df1 / 2);
}

function oneWayAnova(groups: number[][]): {
  F: number; pValue: number; eta2: number;
  dfBetween: number; dfWithin: number; dfTotal: number;
  ssBetween: number; ssWithin: number; ssTotal: number;
  msBetween: number; msWithin: number;
  grandMean: number; groupStats: { n: number; mean: number; sd: number }[];
} | null {
  if (groups.length < 2) return null;
  const allData = groups.flat();
  const N = allData.length;
  if (N < groups.length + 1) return null;

  const grandMean = mean(allData);
  const k = groups.length;

  let ssBetween = 0;
  let ssWithin = 0;
  const groupStats = groups.map(g => {
    const n = g.length;
    const gm = mean(g);
    ssBetween += n * Math.pow(gm - grandMean, 2);
    ssWithin += g.reduce((s, v) => s + Math.pow(v - gm, 2), 0);
    const sd = g.length > 1 ? Math.sqrt(variance(g)) : 0;
    return { n, mean: gm, sd };
  });

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const dfTotal = N - 1;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const F = msBetween / msWithin;
  const pValue = fPValue(F, dfBetween, dfWithin);
  const eta2 = ssBetween / ssTotal;

  return { F, pValue, eta2, dfBetween, dfWithin, dfTotal, ssBetween, ssWithin, ssTotal, msBetween, msWithin, grandMean, groupStats };
}

function parseGroupData(text: string): number[] {
  return text.split(/[\s,;\n]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
}

const EXAMPLE_DATA = [
  { name: "グループ A", data: "23 25 28 22 26 24" },
  { name: "グループ B", data: "30 32 35 31 33 29" },
  { name: "グループ C", data: "18 20 22 19 21 17" },
];

export default function AnovaCalc() {
  const [groups, setGroups] = useState<{ id: number; name: string; data: string }[]>(
    EXAMPLE_DATA.map((g, i) => ({ id: i + 1, name: g.name, data: g.data }))
  );
  const [alpha, setAlpha] = useState("0.05");

  const addGroup = () => {
    const id = Math.max(...groups.map(g => g.id)) + 1;
    setGroups(prev => [...prev, { id, name: `グループ ${String.fromCharCode(64 + prev.length + 1)}`, data: "" }]);
  };

  const removeGroup = (id: number) => {
    if (groups.length <= 2) return;
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const updateGroup = (id: number, field: "name" | "data", value: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const parsedGroups = groups.map(g => parseGroupData(g.data)).filter(g => g.length >= 2);
  const alphaVal = parseFloat(alpha) || 0.05;
  const result = parsedGroups.length >= 2 ? oneWayAnova(parsedGroups) : null;

  const fmt = (n: number, dec = 4) => isNaN(n) ? "—" : n.toFixed(dec);
  const fmtP = (p: number) => p < 0.001 ? "< 0.001" : p.toFixed(4);

  const significantGroups = groups.filter(g => parseGroupData(g.data).length >= 2);

  return (
    <div className="space-y-6">
      {/* データ入力 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">グループデータ入力</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">有意水準 α =</label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0.01">0.01</option>
                <option value="0.05">0.05</option>
                <option value="0.10">0.10</option>
              </select>
            </div>
            <button
              onClick={addGroup}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              + グループ追加
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">数値をスペース・カンマ・改行で区切って入力してください。各グループ2件以上必要です。</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map((g) => {
            const parsed = parseGroupData(g.data);
            const gm = parsed.length > 0 ? mean(parsed) : null;
            const sd = parsed.length > 1 ? Math.sqrt(variance(parsed)) : null;
            return (
              <div key={g.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => updateGroup(g.id, "name", e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {groups.length > 2 && (
                    <button onClick={() => removeGroup(g.id)} className="text-red-400 hover:text-red-600 text-xs">削除</button>
                  )}
                </div>
                <textarea
                  value={g.data}
                  onChange={(e) => updateGroup(g.id, "data", e.target.value)}
                  rows={4}
                  placeholder="例: 23 25 28 22"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {gm !== null && (
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <div>n={parsed.length} / 平均={gm.toFixed(2)}{sd !== null ? ` / SD=${sd.toFixed(2)}` : ""}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 結果 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ANOVA 結果</h2>
        {result ? (
          <div className="space-y-4">
            {/* 主要指標 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">F値</p>
                <p className="text-2xl font-bold font-mono text-blue-800 mt-1">{fmt(result.F, 3)}</p>
              </div>
              <div className={`rounded-lg p-4 text-center border ${result.pValue < alphaVal ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <p className={`text-xs font-medium ${result.pValue < alphaVal ? "text-red-600" : "text-green-600"}`}>p値</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${result.pValue < alphaVal ? "text-red-700" : "text-green-700"}`}>
                  {fmtP(result.pValue)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">効果量 η²</p>
                <p className="text-2xl font-bold font-mono text-purple-800 mt-1">{fmt(result.eta2, 3)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <p className="text-xs text-gray-600 font-medium">自由度 (df₁, df₂)</p>
                <p className="text-2xl font-bold font-mono text-gray-800 mt-1">{result.dfBetween}, {result.dfWithin}</p>
              </div>
            </div>

            {/* 判定 */}
            <div className={`rounded-lg p-4 border ${result.pValue < alphaVal ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"}`}>
              <p className={`font-bold ${result.pValue < alphaVal ? "text-red-700" : "text-green-700"}`}>
                {result.pValue < alphaVal
                  ? `有意差あり (p = ${fmtP(result.pValue)} < α = ${alpha}) — 群間に統計的に有意な差があります`
                  : `有意差なし (p = ${fmtP(result.pValue)} ≥ α = ${alpha}) — 群間に統計的な差は認められません`}
              </p>
              {result.pValue < alphaVal && (
                <p className="text-sm mt-1 text-red-600">
                  効果量 η² = {fmt(result.eta2, 3)}（{result.eta2 < 0.06 ? "小" : result.eta2 < 0.14 ? "中" : "大"}）。事後検定（Tukey HSD等）で群の比較を行ってください。
                </p>
              )}
            </div>

            {/* 分散分析表 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">分散分析表</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left">要因</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">SS（偏差平方和）</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">df（自由度）</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">MS（平均平方）</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">F値</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">p値</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 font-medium">群間（Between）</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{fmt(result.ssBetween, 3)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{result.dfBetween}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{fmt(result.msBetween, 3)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono font-semibold">{fmt(result.F, 3)}</td>
                      <td className={`border border-gray-200 px-3 py-2 text-right font-mono font-semibold ${result.pValue < alphaVal ? "text-red-600" : "text-green-600"}`}>{fmtP(result.pValue)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 font-medium">群内（Within）</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{fmt(result.ssWithin, 3)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{result.dfWithin}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{fmt(result.msWithin, 3)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">—</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">—</td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-200 px-3 py-2">合計（Total）</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{fmt(result.ssTotal, 3)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{result.dfTotal}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">—</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">—</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 群別統計 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">群別記述統計</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left">グループ</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">n</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">平均</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">SD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {significantGroups.map((g, i) => {
                      const st = result.groupStats[i];
                      if (!st) return null;
                      return (
                        <tr key={g.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-3 py-2">{g.name}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right font-mono">{st.n}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right font-mono">{st.mean.toFixed(3)}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right font-mono">{st.sd.toFixed(3)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 font-medium">全体</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{result.dfTotal + 1}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right font-mono">{result.grandMean.toFixed(3)}</td>
                      <td className="border border-gray-200 px-3 py-2 text-right">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            2グループ以上のデータを入力してください（各グループ2件以上）
          </div>
        )}
      </div>
    </div>
  );
}
