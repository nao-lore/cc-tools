"use client";

import { useState, useCallback } from "react";

interface Row {
  id: number;
  observed: string;
  expected: string;
}

interface Result {
  chiSquare: number;
  df: number;
  pValue: number;
  significant05: boolean;
  significant01: boolean;
  rows: { observed: number; expected: number; contribution: number }[];
}

// Regularized incomplete gamma function via series expansion
function gammaIncomplete(a: number, x: number): number {
  if (x < 0) return 0;
  if (x === 0) return 0;
  let sum = 1 / a;
  let term = 1 / a;
  for (let k = 1; k <= 200; k++) {
    term *= x / (a + k);
    sum += term;
    if (Math.abs(term) < 1e-12) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

function logGamma(z: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = z;
  let x = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += c[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

// chi-square survival function: P(X > x) for chi-sq with df degrees of freedom
function chiSquarePValue(chiSq: number, df: number): number {
  if (chiSq <= 0) return 1;
  // P-value = 1 - regularizedGammaP(df/2, chiSq/2)
  const p = gammaIncomplete(df / 2, chiSq / 2);
  return Math.max(0, Math.min(1, 1 - p));
}

function fmt(n: number, decimals = 4): string {
  return n.toFixed(decimals);
}

export default function ChiSquareTest() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, observed: "30", expected: "25" },
    { id: 2, observed: "20", expected: "25" },
    { id: 3, observed: "25", expected: "25" },
    { id: 4, observed: "25", expected: "25" },
  ]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const nextId = Math.max(...rows.map((r) => r.id)) + 1;

  const addRow = () =>
    setRows((prev) => [...prev, { id: nextId, observed: "", expected: "" }]);

  const removeRow = (id: number) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: "observed" | "expected", val: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const calculate = useCallback(() => {
    setError("");
    const parsed = rows.map((r) => ({
      observed: parseFloat(r.observed),
      expected: parseFloat(r.expected),
    }));

    if (parsed.some((r) => isNaN(r.observed) || isNaN(r.expected))) {
      setError("すべてのセルに数値を入力してください。");
      return;
    }
    if (parsed.some((r) => r.observed < 0 || r.expected <= 0)) {
      setError("観測値は0以上、期待値は0より大きい値を入力してください。");
      return;
    }

    const df = rows.length - 1;
    let chiSq = 0;
    const rowResults = parsed.map((r) => {
      const contribution = Math.pow(r.observed - r.expected, 2) / r.expected;
      chiSq += contribution;
      return { ...r, contribution };
    });

    const pVal = chiSquarePValue(chiSq, df);
    setResult({
      chiSquare: chiSq,
      df,
      pValue: pVal,
      significant05: pVal < 0.05,
      significant01: pVal < 0.01,
      rows: rowResults,
    });
  }, [rows]);

  const reset = () => {
    setRows([
      { id: 1, observed: "30", expected: "25" },
      { id: 2, observed: "20", expected: "25" },
      { id: 3, observed: "25", expected: "25" },
      { id: 4, observed: "25", expected: "25" },
    ]);
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">データ入力</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-600 font-medium">カテゴリ</th>
                <th className="text-left py-2 px-3 text-gray-600 font-medium">観測値 (O)</th>
                <th className="text-left py-2 px-3 text-gray-600 font-medium">期待値 (E)</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-500 font-medium">カテゴリ {idx + 1}</td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={row.observed}
                      onChange={(e) => updateRow(row.id, "observed", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 30"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={row.expected}
                      onChange={(e) => updateRow(row.id, "expected", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 25"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 2}
                      className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={addRow}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ＋ 行を追加
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={calculate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            計算する
          </button>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            リセット
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
              <div className="text-sm text-gray-500 mb-1">カイ二乗値 (χ²)</div>
              <div className="text-3xl font-bold text-blue-600">{fmt(result.chiSquare)}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
              <div className="text-sm text-gray-500 mb-1">自由度 (df)</div>
              <div className="text-3xl font-bold text-gray-800">{result.df}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
              <div className="text-sm text-gray-500 mb-1">p値</div>
              <div className="text-3xl font-bold text-purple-600">
                {result.pValue < 0.0001 ? "< 0.0001" : fmt(result.pValue)}
              </div>
            </div>
          </div>

          {/* Significance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">有意差判定</h2>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl ${result.significant05 ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                <span className={`text-xl ${result.significant05 ? "text-green-500" : "text-gray-400"}`}>
                  {result.significant05 ? "✓" : "✗"}
                </span>
                <div>
                  <div className="font-medium text-gray-800">有意水準 5%（α = 0.05）</div>
                  <div className="text-sm text-gray-500">
                    {result.significant05 ? "有意差あり（帰無仮説を棄却）" : "有意差なし（帰無仮説を保持）"}
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${result.significant01 ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                <span className={`text-xl ${result.significant01 ? "text-green-500" : "text-gray-400"}`}>
                  {result.significant01 ? "✓" : "✗"}
                </span>
                <div>
                  <div className="font-medium text-gray-800">有意水準 1%（α = 0.01）</div>
                  <div className="text-sm text-gray-500">
                    {result.significant01 ? "有意差あり（帰無仮説を棄却）" : "有意差なし（帰無仮説を保持）"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">各カテゴリの寄与度</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600">カテゴリ</th>
                    <th className="text-right py-2 px-3 text-gray-600">観測値 (O)</th>
                    <th className="text-right py-2 px-3 text-gray-600">期待値 (E)</th>
                    <th className="text-right py-2 px-3 text-gray-600">O − E</th>
                    <th className="text-right py-2 px-3 text-gray-600">(O−E)²/E</th>
                    <th className="text-right py-2 px-3 text-gray-600">寄与率</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-500">カテゴリ {i + 1}</td>
                      <td className="py-2 px-3 text-right">{r.observed}</td>
                      <td className="py-2 px-3 text-right">{r.expected}</td>
                      <td className={`py-2 px-3 text-right font-medium ${r.observed - r.expected > 0 ? "text-blue-600" : r.observed - r.expected < 0 ? "text-red-600" : "text-gray-600"}`}>
                        {(r.observed - r.expected) > 0 ? "+" : ""}{fmt(r.observed - r.expected, 2)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">{fmt(r.contribution)}</td>
                      <td className="py-2 px-3 text-right text-gray-500">
                        {fmt((r.contribution / result.chiSquare) * 100, 1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-2 px-3" colSpan={4}>合計</td>
                    <td className="py-2 px-3 text-right text-blue-600">{fmt(result.chiSquare)}</td>
                    <td className="py-2 px-3 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
            <h3 className="font-semibold text-blue-800 mb-2">計算式</h3>
            <p className="text-blue-700 text-sm font-mono">χ² = Σ (O − E)² / E</p>
            <p className="text-blue-600 text-sm mt-2">
              O = 観測値、E = 期待値、Σ = 全カテゴリの合計。自由度 = カテゴリ数 − 1
            </p>
          </div>
        </>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このカイ二乗検定 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">観測値と期待値からカイ二乗値・p値・自由度を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このカイ二乗検定 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "観測値と期待値からカイ二乗値・p値・自由度を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "カイ二乗検定 計算",
  "description": "観測値と期待値からカイ二乗値・p値・自由度を計算",
  "url": "https://tools.loresync.dev/chi-square-test",
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
