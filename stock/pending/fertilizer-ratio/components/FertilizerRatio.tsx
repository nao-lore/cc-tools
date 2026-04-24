"use client";

import { useState, useCallback } from "react";

interface Fertilizer {
  id: number;
  name: string;
  n: string;
  p: string;
  k: string;
}

interface FertilizerResult {
  id: number;
  name: string;
  amount: number;
  providedN: number;
  providedP: number;
  providedK: number;
}

interface CalcResult {
  fertilizers: FertilizerResult[];
  totalN: number;
  totalP: number;
  totalK: number;
  targetN: number;
  targetP: number;
  targetK: number;
  area: number;
}

const PRESETS: Fertilizer[] = [
  { id: 1, name: "化成肥料 8-8-8", n: "8", p: "8", k: "8" },
  { id: 2, name: "尿素（N46）", n: "46", p: "0", k: "0" },
  { id: 3, name: "過リン酸石灰", n: "0", p: "17", k: "0" },
  { id: 4, name: "塩化カリウム", n: "0", p: "0", k: "60" },
];

export default function FertilizerRatio() {
  const [area, setArea] = useState("10");
  const [targetN, setTargetN] = useState("10");
  const [targetP, setTargetP] = useState("8");
  const [targetK, setTargetK] = useState("10");
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([
    { id: 1, name: "化成肥料 8-8-8", n: "8", p: "8", k: "8" },
    { id: 2, name: "尿素（N46）", n: "46", p: "0", k: "0" },
  ]);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");
  const nextId = Math.max(...fertilizers.map((f) => f.id)) + 1;

  const addFertilizer = () =>
    setFertilizers((prev) => [...prev, { id: nextId, name: "", n: "", p: "", k: "" }]);

  const removeFertilizer = (id: number) => {
    if (fertilizers.length <= 1) return;
    setFertilizers((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFertilizer = (id: number, field: keyof Fertilizer, val: string) =>
    setFertilizers((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: val } : f)));

  const addPreset = (preset: Fertilizer) => {
    setFertilizers((prev) => [...prev, { ...preset, id: nextId }]);
  };

  const calculate = useCallback(() => {
    setError("");
    const areaVal = parseFloat(area);
    const tN = parseFloat(targetN);
    const tP = parseFloat(targetP);
    const tK = parseFloat(targetK);

    if (isNaN(areaVal) || areaVal <= 0) { setError("面積は0より大きい値を入力してください。"); return; }
    if (isNaN(tN) || tN < 0 || isNaN(tP) || tP < 0 || isNaN(tK) || tK < 0) {
      setError("NPK目標量は0以上の値を入力してください。"); return;
    }

    const parsed = fertilizers.map((f) => ({
      id: f.id,
      name: f.name || `肥料 ${f.id}`,
      n: parseFloat(f.n) || 0,
      p: parseFloat(f.p) || 0,
      k: parseFloat(f.k) || 0,
    }));

    // Simple greedy: use first fertilizer for max coverage
    // Algorithm: for each nutrient, figure out how much of each fertilizer is needed
    // Strategy: use least-squares-style approach - scale fertilizers proportionally
    // For single-nutrient fertilizers, solve directly; for multi-nutrient, use primary constraint

    // Determine primary driver per fertilizer using ratio
    // Simple approach: distribute load proportionally based on dominant nutrient
    const totalInputN = parsed.reduce((s, f) => s + f.n, 0);
    const totalInputP = parsed.reduce((s, f) => s + f.p, 0);
    const totalInputK = parsed.reduce((s, f) => s + f.k, 0);

    // Required amount (g/m²) * area = total required per nutrient
    const reqN = tN * areaVal; // g total
    const reqP = tP * areaVal;
    const reqK = tK * areaVal;

    // For each fertilizer, compute the kg to apply based on its dominant nutrient contribution
    // Use weighted assignment
    const fertResults: FertilizerResult[] = parsed.map((f) => {
      let amount = 0;
      const nShare = totalInputN > 0 ? f.n / totalInputN : 0;
      const pShare = totalInputP > 0 ? f.p / totalInputP : 0;
      const kShare = totalInputK > 0 ? f.k / totalInputK : 0;

      // Compute amounts needed for each nutrient from this fertilizer
      const amountForN = f.n > 0 ? (reqN * nShare * 100) / f.n : 0;
      const amountForP = f.p > 0 ? (reqP * pShare * 100) / f.p : 0;
      const amountForK = f.k > 0 ? (reqK * kShare * 100) / f.k : 0;

      // Use max of non-zero amounts
      const candidates = [amountForN, amountForP, amountForK].filter((v) => v > 0);
      amount = candidates.length > 0 ? Math.max(...candidates) : 0;

      return {
        id: f.id,
        name: f.name,
        amount,
        providedN: (amount * f.n) / 100,
        providedP: (amount * f.p) / 100,
        providedK: (amount * f.k) / 100,
      };
    });

    const totalN = fertResults.reduce((s, f) => s + f.providedN, 0);
    const totalP = fertResults.reduce((s, f) => s + f.providedP, 0);
    const totalK = fertResults.reduce((s, f) => s + f.providedK, 0);

    setResult({ fertilizers: fertResults, totalN, totalP, totalK, targetN: reqN, targetP: reqP, targetK: reqK, area: areaVal });
  }, [area, targetN, targetP, targetK, fertilizers]);

  const npkBar = (provided: number, target: number) => {
    const pct = target > 0 ? Math.min(100, (provided / target) * 100) : 0;
    const over = provided > target;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${over ? "bg-orange-400" : "bg-green-400"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs w-10 text-right ${over ? "text-orange-600" : "text-gray-600"}`}>{pct.toFixed(0)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Target inputs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">目標NPK量を入力</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">栽培面積</label>
            <div className="flex items-center gap-1">
              <input type="number" value={area} onChange={(e) => setArea(e.target.value)} className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <span className="text-sm text-gray-500">m²</span>
            </div>
          </div>
          {[
            { label: "窒素 N", val: targetN, set: setTargetN, color: "blue" },
            { label: "リン酸 P", val: targetP, set: setTargetP, color: "orange" },
            { label: "カリ K", val: targetK, set: setTargetK, color: "purple" },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="flex items-center gap-1">
                <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder="g/m²" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <span className="text-xs text-gray-500">g/m²</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fertilizer list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使用する肥料</h2>
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">プリセットから追加:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => addPreset(p)} className="px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
            <div className="col-span-4">肥料名</div>
            <div className="col-span-2 text-center">N(%)</div>
            <div className="col-span-2 text-center">P(%)</div>
            <div className="col-span-2 text-center">K(%)</div>
            <div className="col-span-2"></div>
          </div>
          {fertilizers.map((f) => (
            <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
              <input value={f.name} onChange={(e) => updateFertilizer(f.id, "name", e.target.value)} placeholder="肥料名" className="col-span-4 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              {(["n", "p", "k"] as const).map((key) => (
                <input key={key} type="number" value={f[key]} onChange={(e) => updateFertilizer(f.id, key, e.target.value)} placeholder="0" className="col-span-2 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500" />
              ))}
              <div className="col-span-2 text-center">
                <button onClick={() => removeFertilizer(f.id)} disabled={fertilizers.length <= 1} className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg">×</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addFertilizer} className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium">＋ 肥料を追加</button>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <button onClick={calculate} className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">配合量を計算</button>
      </div>

      {result && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">必要な施肥量（全体 {result.area}m²）</h2>
            <div className="space-y-4">
              {result.fertilizers.map((f) => (
                <div key={f.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{f.name}</span>
                    <span className="text-xl font-bold text-green-600">{(f.amount / 1000).toFixed(2)} kg</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    N: {f.providedN.toFixed(1)}g / P: {f.providedP.toFixed(1)}g / K: {f.providedK.toFixed(1)}g
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    1m²あたり: {(f.amount / result.area).toFixed(1)}g
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">NPK充足率</h2>
            <div className="space-y-3">
              {[
                { label: "窒素 (N)", provided: result.totalN, target: result.targetN },
                { label: "リン酸 (P)", provided: result.totalP, target: result.targetP },
                { label: "カリ (K)", provided: result.totalK, target: result.targetK },
              ].map(({ label, provided, target }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className="text-gray-600">{provided.toFixed(1)}g / {target.toFixed(1)}g 目標</span>
                  </div>
                  {npkBar(provided, target)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この肥料 NPK配合計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">窒素・リン酸・カリの必要量から肥料の配合量を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この肥料 NPK配合計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "窒素・リン酸・カリの必要量から肥料の配合量を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
