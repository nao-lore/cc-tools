"use client";

import { useState, useCallback } from "react";

interface FunnelStep {
  id: number;
  name: string;
  count: string;
}

interface StepResult {
  name: string;
  count: number;
  dropRate: number;
  cvr: number; // from top
  stepCvr: number; // from prev step
}

interface FunnelResult {
  steps: StepResult[];
  overallCvr: number;
  bottleneckIndex: number;
}

const COLORS = [
  "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500",
  "bg-red-500", "bg-orange-500", "bg-yellow-500",
];

export default function FunnelConversion() {
  const [steps, setSteps] = useState<FunnelStep[]>([
    { id: 1, name: "訪問者", count: "10000" },
    { id: 2, name: "商品ページ閲覧", count: "4200" },
    { id: 3, name: "カートに追加", count: "1800" },
    { id: 4, name: "購入手続き開始", count: "900" },
    { id: 5, name: "購入完了", count: "320" },
  ]);
  const [result, setResult] = useState<FunnelResult | null>(null);
  const [error, setError] = useState("");
  const nextId = Math.max(...steps.map((s) => s.id)) + 1;

  const addStep = () =>
    setSteps((prev) => [...prev, { id: nextId, name: `ステップ ${prev.length + 1}`, count: "" }]);

  const removeStep = (id: number) => {
    if (steps.length <= 2) return;
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStep = (id: number, field: "name" | "count", val: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)));

  const calculate = useCallback(() => {
    setError("");
    const parsed = steps.map((s) => ({ name: s.name, count: parseInt(s.count) }));
    if (parsed.some((s) => isNaN(s.count) || s.count < 0)) {
      setError("すべてのステップに0以上の整数を入力してください。");
      return;
    }
    if (parsed[0].count === 0) {
      setError("最初のステップの人数は1以上を入力してください。");
      return;
    }

    const top = parsed[0].count;
    const stepResults: StepResult[] = parsed.map((step, i) => {
      const prev = i === 0 ? step.count : parsed[i - 1].count;
      const dropRate = prev > 0 ? ((prev - step.count) / prev) * 100 : 0;
      const cvr = (step.count / top) * 100;
      const stepCvr = i === 0 ? 100 : prev > 0 ? (step.count / prev) * 100 : 0;
      return { name: step.name, count: step.count, dropRate: i === 0 ? 0 : dropRate, cvr, stepCvr };
    });

    // Bottleneck = step with highest drop rate (excluding first)
    const bottleneckIndex = stepResults
      .slice(1)
      .reduce((maxIdx, s, i) => (s.dropRate > stepResults.slice(1)[maxIdx].dropRate ? i : maxIdx), 0) + 1;

    setResult({
      steps: stepResults,
      overallCvr: (parsed[parsed.length - 1].count / top) * 100,
      bottleneckIndex,
    });
  }, [steps]);

  const reset = () => {
    setSteps([
      { id: 1, name: "訪問者", count: "10000" },
      { id: 2, name: "商品ページ閲覧", count: "4200" },
      { id: 3, name: "カートに追加", count: "1800" },
      { id: 4, name: "購入手続き開始", count: "900" },
      { id: 5, name: "購入完了", count: "320" },
    ]);
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ファネルステップ入力</h2>
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full ${COLORS[idx % COLORS.length]} text-white text-xs flex items-center justify-center font-bold flex-shrink-0`}>
                {idx + 1}
              </div>
              <input
                type="text"
                value={step.name}
                onChange={(e) => updateStep(step.id, "name", e.target.value)}
                placeholder="ステップ名"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={step.count}
                onChange={(e) => updateStep(step.id, "count", e.target.value)}
                placeholder="人数"
                className="w-28 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
              <span className="text-sm text-gray-500 w-4">人</span>
              <button
                onClick={() => removeStep(step.id)}
                disabled={steps.length <= 2}
                className="text-red-400 hover:text-red-600 disabled:opacity-30 text-xl leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button onClick={addStep} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
          ＋ ステップを追加
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <div className="mt-4 flex gap-3">
          <button onClick={calculate} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            計算する
          </button>
          <button onClick={reset} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            リセット
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Overall CVR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
              <div className="text-sm text-gray-500 mb-1">全体コンバージョン率</div>
              <div className="text-4xl font-bold text-blue-600">{result.overallCvr.toFixed(2)}%</div>
            </div>
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5 text-center">
              <div className="text-sm text-orange-600 mb-1">ボトルネック（最大離脱）</div>
              <div className="text-xl font-bold text-orange-700">{result.steps[result.bottleneckIndex].name}</div>
              <div className="text-sm text-orange-500">離脱率 {result.steps[result.bottleneckIndex].dropRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Funnel visualization */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">ファネル可視化</h2>
            <div className="space-y-2">
              {result.steps.map((step, i) => {
                const width = Math.max(10, step.cvr);
                const isBottleneck = i === result.bottleneckIndex && i > 0;
                return (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-32 text-sm text-gray-700 truncate">{step.name}</div>
                      <div className="flex-1 relative h-10">
                        <div
                          className={`h-full ${COLORS[i % COLORS.length]} rounded-lg flex items-center justify-end pr-3 transition-all`}
                          style={{ width: `${width}%` }}
                        >
                          <span className="text-white text-sm font-bold">{step.count.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm">
                        <span className="font-medium text-gray-700">{step.cvr.toFixed(1)}%</span>
                      </div>
                    </div>
                    {i > 0 && (
                      <div className={`ml-32 flex items-center gap-2 text-xs mb-1 ${isBottleneck ? "text-orange-600 font-bold" : "text-gray-400"}`}>
                        <span>↓ ステップCVR: {step.stepCvr.toFixed(1)}%</span>
                        <span>（離脱: {step.dropRate.toFixed(1)}%）</span>
                        {isBottleneck && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">ボトルネック</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">詳細データ</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600">ステップ</th>
                    <th className="text-right py-2 px-3 text-gray-600">人数</th>
                    <th className="text-right py-2 px-3 text-gray-600">ステップCVR</th>
                    <th className="text-right py-2 px-3 text-gray-600">累計CVR</th>
                    <th className="text-right py-2 px-3 text-gray-600">離脱率</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((step, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i === result.bottleneckIndex && i > 0 ? "bg-orange-50" : ""}`}>
                      <td className="py-2 px-3 font-medium text-gray-700">{step.name}</td>
                      <td className="py-2 px-3 text-right">{step.count.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right">{i === 0 ? "—" : `${step.stepCvr.toFixed(1)}%`}</td>
                      <td className="py-2 px-3 text-right font-medium text-blue-600">{step.cvr.toFixed(2)}%</td>
                      <td className={`py-2 px-3 text-right ${i === result.bottleneckIndex && i > 0 ? "text-orange-600 font-bold" : "text-gray-600"}`}>
                        {i === 0 ? "—" : `${step.dropRate.toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
