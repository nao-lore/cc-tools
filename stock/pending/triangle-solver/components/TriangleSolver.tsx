"use client";

import { useState } from "react";

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

interface TriResult {
  a: number; b: number; c: number;
  A: number; B: number; C: number;
  area: number;
  perimeter: number;
  inradius: number;
  circumradius: number;
  valid: boolean;
}

type SolveMode = "SSS" | "SAS" | "ASA" | "AAS" | "SSA";

function fmt(n: number, d = 4): string {
  return isFinite(n) ? n.toFixed(d) : "—";
}

function solveSSS(a: number, b: number, c: number): TriResult | null {
  if (a <= 0 || b <= 0 || c <= 0) return null;
  if (a + b <= c || a + c <= b || b + c <= a) return null;
  const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * RAD;
  const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * RAD;
  const C = 180 - A - B;
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return { a, b, c, A, B, C, area, perimeter: a + b + c, inradius: area / s, circumradius: (a * b * c) / (4 * area), valid: true };
}

function solveSAS(a: number, C: number, b: number): TriResult | null {
  if (a <= 0 || b <= 0 || C <= 0 || C >= 180) return null;
  const cRad = C * DEG;
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(cRad));
  return solveSSS(a, b, c);
}

function solveASA(A: number, c: number, B: number): TriResult | null {
  if (A <= 0 || B <= 0 || c <= 0 || A + B >= 180) return null;
  const C = 180 - A - B;
  const a = (c / Math.sin(C * DEG)) * Math.sin(A * DEG);
  const b = (c / Math.sin(C * DEG)) * Math.sin(B * DEG);
  return solveSSS(a, b, c);
}

function solveAAS(A: number, B: number, a: number): TriResult | null {
  if (A <= 0 || B <= 0 || a <= 0 || A + B >= 180) return null;
  const C = 180 - A - B;
  const b = (a / Math.sin(A * DEG)) * Math.sin(B * DEG);
  const c = (a / Math.sin(A * DEG)) * Math.sin(C * DEG);
  return solveSSS(a, b, c);
}

function solveSSA(a: number, b: number, A: number): TriResult | null {
  if (a <= 0 || b <= 0 || A <= 0 || A >= 180) return null;
  const sinB = (b * Math.sin(A * DEG)) / a;
  if (sinB > 1) return null;
  const B = Math.asin(sinB) * RAD;
  return solveAAS(A, B, a);
}

export default function TriangleSolver() {
  const [mode, setMode] = useState<SolveMode>("SSS");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TriResult | null>(null);
  const [error, setError] = useState("");

  const modes: { key: SolveMode; label: string; desc: string }[] = [
    { key: "SSS", label: "SSS", desc: "3辺既知" },
    { key: "SAS", label: "SAS", desc: "2辺と挟む角" },
    { key: "ASA", label: "ASA", desc: "2角と挟む辺" },
    { key: "AAS", label: "AAS", desc: "2角と対辺" },
    { key: "SSA", label: "SSA", desc: "2辺と対角" },
  ];

  const inputFields: Record<SolveMode, { key: string; label: string; unit: string }[]> = {
    SSS: [
      { key: "a", label: "辺 a", unit: "単位" },
      { key: "b", label: "辺 b", unit: "単位" },
      { key: "c", label: "辺 c", unit: "単位" },
    ],
    SAS: [
      { key: "a", label: "辺 a", unit: "単位" },
      { key: "C", label: "角 C（a と b の挟む角）", unit: "°" },
      { key: "b", label: "辺 b", unit: "単位" },
    ],
    ASA: [
      { key: "A", label: "角 A", unit: "°" },
      { key: "c", label: "辺 c（A と B の挟む辺）", unit: "単位" },
      { key: "B", label: "角 B", unit: "°" },
    ],
    AAS: [
      { key: "A", label: "角 A", unit: "°" },
      { key: "B", label: "角 B", unit: "°" },
      { key: "a", label: "辺 a（角 A の対辺）", unit: "単位" },
    ],
    SSA: [
      { key: "a", label: "辺 a", unit: "単位" },
      { key: "b", label: "辺 b", unit: "単位" },
      { key: "A", label: "角 A（辺 a の対角）", unit: "°" },
    ],
  };

  const v = (key: string) => parseFloat(vals[key] ?? "");

  const calculate = () => {
    setError("");
    let res: TriResult | null = null;

    try {
      switch (mode) {
        case "SSS": res = solveSSS(v("a"), v("b"), v("c")); break;
        case "SAS": res = solveSAS(v("a"), v("C"), v("b")); break;
        case "ASA": res = solveASA(v("A"), v("c"), v("B")); break;
        case "AAS": res = solveAAS(v("A"), v("B"), v("a")); break;
        case "SSA": res = solveSSA(v("a"), v("b"), v("A")); break;
      }
    } catch {
      setError("計算中にエラーが発生しました。入力値を確認してください。");
      return;
    }

    if (!res) {
      setError("入力値から三角形を作ることができません。値を確認してください。");
      return;
    }
    setResult(res);
  };

  const reset = () => { setVals({}); setResult(null); setError(""); };

  // Simple SVG triangle visualization
  const renderSVG = (r: TriResult) => {
    const scale = 120 / Math.max(r.a, r.b, r.c);
    const ax = 20, ay = 150;
    const bx = ax + r.c * scale, by = 150;
    const cx2 = ax + r.b * scale * Math.cos(r.A * DEG);
    const cy2 = 150 - r.b * scale * Math.sin(r.A * DEG);
    return (
      <svg viewBox="0 0 200 180" className="w-full max-w-xs mx-auto">
        <polygon
          points={`${ax},${ay} ${bx},${by} ${cx2},${cy2}`}
          fill="#eff6ff" stroke="#3b82f6" strokeWidth="2"
        />
        <text x={(ax + bx) / 2} y={ay + 15} textAnchor="middle" className="text-xs" fontSize="11" fill="#374151">c={fmt(r.c, 2)}</text>
        <text x={(ax + cx2) / 2 - 10} y={(ay + cy2) / 2} textAnchor="middle" fontSize="11" fill="#374151">b={fmt(r.b, 2)}</text>
        <text x={(bx + cx2) / 2 + 8} y={(by + cy2) / 2} textAnchor="middle" fontSize="11" fill="#374151">a={fmt(r.a, 2)}</text>
        <text x={ax - 12} y={ay + 4} fontSize="11" fill="#6366f1" fontWeight="bold">A</text>
        <text x={bx + 4} y={by + 4} fontSize="11" fill="#6366f1" fontWeight="bold">B</text>
        <text x={cx2 - 4} y={cy2 - 6} fontSize="11" fill="#6366f1" fontWeight="bold">C</text>
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算モードを選択</h2>
        <div className="flex flex-wrap gap-2">
          {modes.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setVals({}); setResult(null); setError(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div>{label}</div>
              <div className="text-xs opacity-75">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">値を入力（{mode} モード）</h2>
        <div className="space-y-3">
          {inputFields[mode].map(({ key, label, unit }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-40 text-sm font-medium text-gray-700">{label}</label>
              <input
                type="number"
                value={vals[key] ?? ""}
                onChange={(e) => setVals((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={unit === "°" ? "例: 60" : "例: 5"}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <span className="text-sm text-gray-500 w-10">{unit}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <div className="mt-5 flex gap-3">
          <button onClick={calculate} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            計算する
          </button>
          <button onClick={reset} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            リセット
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">三角形の図</h2>
              {renderSVG(result)}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>
              <div className="space-y-2 text-sm">
                {[
                  { label: "辺 a", val: fmt(result.a, 4), unit: "" },
                  { label: "辺 b", val: fmt(result.b, 4), unit: "" },
                  { label: "辺 c", val: fmt(result.c, 4), unit: "" },
                  { label: "角 A", val: fmt(result.A, 2), unit: "°" },
                  { label: "角 B", val: fmt(result.B, 2), unit: "°" },
                  { label: "角 C", val: fmt(result.C, 2), unit: "°" },
                ].map(({ label, val, unit }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-indigo-700">{val}{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "面積", val: fmt(result.area, 4), unit: "単位²", color: "blue" },
              { label: "周長", val: fmt(result.perimeter, 4), unit: "単位", color: "green" },
              { label: "内接円半径", val: fmt(result.inradius, 4), unit: "単位", color: "purple" },
              { label: "外接円半径", val: fmt(result.circumradius, 4), unit: "単位", color: "orange" },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className={`text-xl font-bold text-${color}-600`}>{val}</div>
                <div className="text-xs text-gray-400">{unit}</div>
              </div>
            ))}
          </div>
        </>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この三角形 計算機ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">辺と角の値から残りの辺・角・面積・周長を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この三角形 計算機ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "辺と角の値から残りの辺・角・面積・周長を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
