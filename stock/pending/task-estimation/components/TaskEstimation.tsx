"use client";
import { useState, useMemo } from "react";

interface Task {
  id: number;
  name: string;
  optimistic: number;
  nominal: number;
  pessimistic: number;
  unit: "h" | "d" | "pt";
}

const UNITS = [
  { value: "h", label: "時間" },
  { value: "d", label: "日" },
  { value: "pt", label: "pt（ストーリーポイント）" },
];

function pertExpected(o: number, n: number, p: number): number {
  return (o + 4 * n + p) / 6;
}

function pertStdDev(o: number, p: number): number {
  return (p - o) / 6;
}

function pertVariance(o: number, p: number): number {
  const sd = pertStdDev(o, p);
  return sd * sd;
}

const DEFAULT_TASKS: Task[] = [
  { id: 1, name: "要件定義", optimistic: 1, nominal: 2, pessimistic: 5, unit: "d" },
  { id: 2, name: "UIデザイン", optimistic: 2, nominal: 4, pessimistic: 8, unit: "d" },
  { id: 3, name: "バックエンド実装", optimistic: 3, nominal: 6, pessimistic: 14, unit: "d" },
  { id: 4, name: "テスト", optimistic: 1, nominal: 2, pessimistic: 4, unit: "d" },
];

export default function TaskEstimation() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [confidenceLevel, setConfidenceLevel] = useState<68 | 90 | 95>(95);

  const taskResults = useMemo(
    () =>
      tasks.map((t) => ({
        ...t,
        expected: pertExpected(t.optimistic, t.nominal, t.pessimistic),
        stdDev: pertStdDev(t.optimistic, t.pessimistic),
        variance: pertVariance(t.optimistic, t.pessimistic),
      })),
    [tasks]
  );

  const totalExpected = taskResults.reduce((s, r) => s + r.expected, 0);
  const totalVariance = taskResults.reduce((s, r) => s + r.variance, 0);
  const totalStdDev = Math.sqrt(totalVariance);

  const zScores: Record<68 | 90 | 95, number> = { 68: 1, 90: 1.645, 95: 1.96 };
  const z = zScores[confidenceLevel];

  const optimisticTotal = tasks.reduce((s, t) => s + t.optimistic, 0);
  const pessimisticTotal = tasks.reduce((s, t) => s + t.pessimistic, 0);
  const confidenceUpper = totalExpected + z * totalStdDev;
  const confidenceLower = Math.max(0, totalExpected - z * totalStdDev);

  const unit = tasks[0]?.unit ?? "d";
  const unitLabel = UNITS.find((u) => u.value === unit)?.label ?? "";

  const addTask = () =>
    setTasks([...tasks, { id: Date.now(), name: `タスク${tasks.length + 1}`, optimistic: 1, nominal: 2, pessimistic: 4, unit }]);

  const removeTask = (id: number) => setTasks(tasks.filter((t) => t.id !== id));

  const updateTask = (id: number, field: keyof Task, value: string | number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: field === "name" || field === "unit" ? value : Number(value) } : t)));
  };

  const updateAllUnits = (newUnit: "h" | "d" | "pt") => {
    setTasks(tasks.map((t) => ({ ...t, unit: newUnit })));
  };

  const maxExpected = Math.max(...taskResults.map((r) => r.expected), 1);

  return (
    <div className="space-y-6">
      {/* Unit selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">単位の選択</h2>
          <div className="flex gap-2">
            {UNITS.map((u) => (
              <button
                key={u.value}
                onClick={() => updateAllUnits(u.value as "h" | "d" | "pt")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${unit === u.value ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">タスク一覧</h2>
          <button onClick={addTask} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            + タスク追加
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 font-medium text-gray-600">タスク名</th>
                <th className="pb-2 font-medium text-green-600 text-center">楽観値 (O)</th>
                <th className="pb-2 font-medium text-blue-600 text-center">標準値 (M)</th>
                <th className="pb-2 font-medium text-red-600 text-center">悲観値 (P)</th>
                <th className="pb-2 font-medium text-indigo-600 text-center">PERT期待値</th>
                <th className="pb-2 font-medium text-gray-500 text-center">標準偏差</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {taskResults.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => updateTask(r.id, "name", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </td>
                  {(["optimistic", "nominal", "pessimistic"] as const).map((field, fi) => (
                    <td key={field} className="py-2 px-1">
                      <input
                        type="number"
                        value={r[field]}
                        onChange={(e) => updateTask(r.id, field, e.target.value)}
                        min={0}
                        step={0.5}
                        className={`w-16 border rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          fi === 0 ? "border-green-300 focus:ring-green-400" : fi === 1 ? "border-blue-300 focus:ring-blue-400" : "border-red-300 focus:ring-red-400"
                        }`}
                      />
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center font-bold text-indigo-700">
                    {r.expected.toFixed(1)}{unit}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-500">
                    ±{r.stdDev.toFixed(1)}
                  </td>
                  <td className="py-2 pl-2">
                    {tasks.length > 1 && (
                      <button onClick={() => removeTask(r.id)} className="text-red-400 hover:text-red-600 text-xs">
                        削除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">タスク別期待工数</h2>
        <div className="space-y-3">
          {taskResults.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32 truncate">{r.name}</span>
              <div className="flex-1 relative h-6 bg-gray-100 rounded-full overflow-hidden">
                {/* Range bar */}
                <div
                  className="absolute h-6 bg-indigo-100 rounded-full"
                  style={{
                    left: `${(r.optimistic / pessimisticTotal) * 100}%`,
                    width: `${((r.pessimistic - r.optimistic) / pessimisticTotal) * 100}%`,
                  }}
                />
                {/* Expected marker */}
                <div
                  className="absolute h-6 w-1 bg-indigo-600 rounded"
                  style={{ left: `${(r.expected / maxExpected) * 90}%` }}
                />
              </div>
              <span className="text-sm font-bold text-indigo-600 w-16 text-right">
                {r.expected.toFixed(1)}{unit}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">バー幅=楽観〜悲観の範囲、縦線=PERT期待値</p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">プロジェクト全体の見積もり</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-700">{optimisticTotal.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">楽観合計 ({unitLabel})</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <p className="text-2xl font-bold text-indigo-700">{totalExpected.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">PERT期待値 ({unitLabel})</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-600">±{totalStdDev.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">標準偏差 ({unitLabel})</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-red-600">{pessimisticTotal.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">悲観合計 ({unitLabel})</p>
          </div>
        </div>

        {/* Confidence interval */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-medium text-gray-700">信頼区間:</label>
            {([68, 90, 95] as const).map((cl) => (
              <button
                key={cl}
                onClick={() => setConfidenceLevel(cl)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${confidenceLevel === cl ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cl}%
              </button>
            ))}
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm text-indigo-800 font-medium">
              {confidenceLevel}%信頼区間：<strong>{confidenceLower.toFixed(1)} 〜 {confidenceUpper.toFixed(1)} {unitLabel}</strong>
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              スケジュールバッファとして <strong>+{(confidenceUpper - totalExpected).toFixed(1)} {unitLabel}</strong> を確保することを推奨
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
          <p className="font-medium mb-1">PERT法とは</p>
          <p className="text-gray-600">期待値 = (楽観 + 4×最頻 + 悲観) / 6。単純平均より悲観値の影響を抑え、現実的な工数を算出します。複数タスクの標準偏差は独立性を仮定して合算します。</p>
        </div>
      </div>
    </div>
  );
}
