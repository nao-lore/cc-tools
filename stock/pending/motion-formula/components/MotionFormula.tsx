"use client";

import { useState } from "react";

type UnknownVar = "displacement" | "finalVelocity" | "time" | "acceleration" | "initialVelocity";

interface MotionResult {
  v0: number;
  a: number;
  t: number;
  vf: number;
  s: number;
  vAvg: number;
}

function fmt(n: number, d = 3): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(d);
}

export default function MotionFormula() {
  const [v0, setV0] = useState("0");
  const [a, setA] = useState("9.8");
  const [t, setT] = useState("5");
  const [vf, setVf] = useState("");
  const [s, setS] = useState("");
  const [solveFor, setSolveFor] = useState<UnknownVar>("displacement");
  const [result, setResult] = useState<MotionResult | null>(null);
  const [error, setError] = useState("");

  const variables: { key: UnknownVar; label: string; unit: string; symbol: string }[] = [
    { key: "displacement", label: "変位", unit: "m", symbol: "s" },
    { key: "finalVelocity", label: "終速度", unit: "m/s", symbol: "v" },
    { key: "time", label: "時間", unit: "s", symbol: "t" },
    { key: "acceleration", label: "加速度", unit: "m/s²", symbol: "a" },
    { key: "initialVelocity", label: "初速度", unit: "m/s", symbol: "v₀" },
  ];

  const calculate = () => {
    setError("");
    const vals: Record<string, number | null> = {
      v0: v0 !== "" ? parseFloat(v0) : null,
      a: a !== "" ? parseFloat(a) : null,
      t: t !== "" ? parseFloat(t) : null,
      vf: vf !== "" ? parseFloat(vf) : null,
      s: s !== "" ? parseFloat(s) : null,
    };

    // Validate non-null inputs
    for (const [k, v] of Object.entries(vals)) {
      if (v !== null && isNaN(v as number)) {
        setError(`${k} に無効な値が入力されています。`);
        return;
      }
    }

    let rv0 = vals.v0, ra = vals.a, rt = vals.t, rvf = vals.vf, rs = vals.s;

    try {
      switch (solveFor) {
        case "displacement":
          if (rv0 === null || ra === null || rt === null) throw new Error("v₀、a、t を入力してください。");
          if (rt < 0) throw new Error("時間は0以上を入力してください。");
          rs = rv0 * rt + 0.5 * ra * rt * rt;
          rvf = rv0 + ra * rt;
          break;
        case "finalVelocity":
          if (rv0 === null || ra === null || rt === null) throw new Error("v₀、a、t を入力してください。");
          if (rt < 0) throw new Error("時間は0以上を入力してください。");
          rvf = rv0 + ra * rt;
          rs = rv0 * rt + 0.5 * ra * rt * rt;
          break;
        case "time":
          if (rv0 === null || ra === null || rvf === null) throw new Error("v₀、a、v を入力してください。");
          if (ra === 0) throw new Error("加速度が0の場合、時間は計算できません。");
          rt = (rvf - rv0) / ra;
          if (rt < 0) throw new Error("計算結果の時間が負になります。入力値を確認してください。");
          rs = rv0 * rt + 0.5 * ra * rt * rt;
          break;
        case "acceleration":
          if (rv0 === null || rvf === null || rt === null) throw new Error("v₀、v、t を入力してください。");
          if (rt === 0) throw new Error("時間は0より大きい値を入力してください。");
          ra = (rvf - rv0) / rt;
          rs = rv0 * rt + 0.5 * ra * rt * rt;
          break;
        case "initialVelocity":
          if (ra === null || rt === null || rs === null) throw new Error("a、t、s を入力してください。");
          if (rt === 0) throw new Error("時間は0より大きい値を入力してください。");
          rv0 = (rs - 0.5 * ra * rt * rt) / rt;
          rvf = rv0 + ra * rt;
          break;
      }
    } catch (e) {
      setError((e as Error).message);
      return;
    }

    if (rv0 === null || ra === null || rt === null || rvf === null || rs === null) {
      setError("計算に必要な値が不足しています。");
      return;
    }

    setResult({
      v0: rv0,
      a: ra,
      t: rt,
      vf: rvf,
      s: rs,
      vAvg: (rv0 + rvf) / 2,
    });
  };

  const inputConfig: { key: UnknownVar; label: string; symbol: string; unit: string; state: string; setter: (v: string) => void }[] = [
    { key: "initialVelocity", label: "初速度 v₀", symbol: "v₀", unit: "m/s", state: v0, setter: setV0 },
    { key: "acceleration", label: "加速度 a", symbol: "a", unit: "m/s²", state: a, setter: setA },
    { key: "time", label: "時間 t", symbol: "t", unit: "s", state: t, setter: setT },
    { key: "finalVelocity", label: "終速度 v", symbol: "v", unit: "m/s", state: vf, setter: setVf },
    { key: "displacement", label: "変位 s", symbol: "s", unit: "m", state: s, setter: setS },
  ];

  return (
    <div className="space-y-6">
      {/* Solve for selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">求める値を選択</h2>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => (
            <button
              key={v.key}
              onClick={() => { setSolveFor(v.key); setResult(null); setError(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                solveFor === v.key
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {v.symbol} ({v.label})
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">既知の値を入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputConfig.map(({ key, label, unit, state, setter }) => {
            const isTarget = solveFor === key;
            return (
              <div key={key} className={`rounded-xl p-4 ${isTarget ? "bg-orange-50 border-2 border-orange-300" : "bg-gray-50 border border-gray-200"}`}>
                <label className={`block text-sm font-medium mb-1 ${isTarget ? "text-orange-700" : "text-gray-700"}`}>
                  {label} {isTarget && <span className="text-xs">(求める値)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={isTarget ? "" : state}
                    onChange={(e) => !isTarget && setter(e.target.value)}
                    disabled={isTarget}
                    placeholder={isTarget ? "自動計算" : `${unit}`}
                    className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                      isTarget ? "bg-orange-100 border-orange-300 text-orange-400 cursor-not-allowed" : "bg-white border-gray-300"
                    }`}
                  />
                  <span className="text-sm text-gray-500 w-12 text-right">{unit}</span>
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この等加速度運動計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">初速・加速度・時間から変位・終速・平均速度を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この等加速度運動計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "初速・加速度・時間から変位・終速・平均速度を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={calculate}
          className="mt-5 px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          計算する
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "初速度 v₀", value: fmt(result.v0), unit: "m/s", color: "blue" },
              { label: "加速度 a", value: fmt(result.a), unit: "m/s²", color: "green" },
              { label: "時間 t", value: fmt(result.t), unit: "s", color: "yellow" },
              { label: "終速度 v", value: fmt(result.vf), unit: "m/s", color: "orange" },
              { label: "変位 s", value: fmt(result.s), unit: "m", color: "red" },
              { label: "平均速度", value: fmt(result.vAvg), unit: "m/s", color: "purple" },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
                <div className="text-xs text-gray-400">{unit}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">計算式の確認</h2>
            <div className="space-y-2 text-sm font-mono text-gray-700">
              <div className="p-3 bg-gray-50 rounded-xl">v = v₀ + at → {fmt(result.v0)} + {fmt(result.a)} × {fmt(result.t)} = <span className="text-orange-600 font-bold">{fmt(result.vf)}</span></div>
              <div className="p-3 bg-gray-50 rounded-xl">s = v₀t + ½at² → {fmt(result.v0)} × {fmt(result.t)} + ½ × {fmt(result.a)} × {fmt(result.t)}² = <span className="text-orange-600 font-bold">{fmt(result.s)}</span></div>
              <div className="p-3 bg-gray-50 rounded-xl">v² = v₀² + 2as → {fmt(result.vf)}² = {fmt(result.v0)}² + 2 × {fmt(result.a)} × {fmt(result.s)} ✓</div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5">
            <h3 className="font-semibold text-orange-800 mb-3">等加速度運動の3公式</h3>
            <div className="space-y-1 text-orange-700 text-sm font-mono">
              <div>① v = v₀ + at</div>
              <div>② s = v₀t + ½at²</div>
              <div>③ v² = v₀² + 2as</div>
            </div>
          </div>
        </>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "等加速度運動計算",
  "description": "初速・加速度・時間から変位・終速・平均速度を計算",
  "url": "https://tools.loresync.dev/motion-formula",
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
