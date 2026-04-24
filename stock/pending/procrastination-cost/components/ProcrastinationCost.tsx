"use client";
import { useState, useMemo } from "react";

interface Task {
  id: number;
  name: string;
  estimatedMinutes: number;
  daysDelayed: number;
  hourlyRate: number;
  stressLevel: number; // 1-5
  importance: "low" | "medium" | "high" | "critical";
}

const IMPORTANCE_CONFIG = {
  low: { label: "低", color: "text-gray-600", bg: "bg-gray-100", multiplier: 1.0 },
  medium: { label: "中", color: "text-blue-600", bg: "bg-blue-100", multiplier: 1.5 },
  high: { label: "高", color: "text-orange-600", bg: "bg-orange-100", multiplier: 2.0 },
  critical: { label: "緊急", color: "text-red-600", bg: "bg-red-100", multiplier: 3.0 },
};

const STRESS_LABELS = ["", "少し気になる", "毎日思い出す", "かなり重い", "常に頭にある", "夜も眠れない"];
const STRESS_COLORS = ["", "text-green-600", "text-yellow-600", "text-orange-500", "text-red-500", "text-red-700"];

// Mental cost per stress level per day (in "equivalent minutes of productive work lost")
const MENTAL_COST_PER_DAY: Record<number, number> = { 1: 5, 2: 15, 3: 30, 4: 60, 5: 120 };

const DEFAULT_TASKS: Task[] = [
  { id: 1, name: "確定申告の書類準備", estimatedMinutes: 120, daysDelayed: 14, hourlyRate: 3000, stressLevel: 4, importance: "critical" },
  { id: 2, name: "メールの返信", estimatedMinutes: 15, daysDelayed: 5, hourlyRate: 3000, stressLevel: 2, importance: "medium" },
];

function calcTaskCost(task: Task) {
  const directCost = (task.estimatedMinutes / 60) * task.hourlyRate;
  const mentalMinutesPerDay = MENTAL_COST_PER_DAY[task.stressLevel];
  const mentalCost = (mentalMinutesPerDay / 60) * task.hourlyRate * task.daysDelayed;
  const importanceMultiplier = IMPORTANCE_CONFIG[task.importance].multiplier;
  const opportunityCost = directCost * (task.daysDelayed / 7) * (importanceMultiplier - 1);
  const total = (directCost + mentalCost + opportunityCost);
  return { directCost, mentalCost, opportunityCost, total };
}

function getMotivationMessage(totalCost: number): string {
  if (totalCost < 5000) return "まだ取り返せます。今すぐ15分だけ始めましょう。";
  if (totalCost < 20000) return "1日1時間の作業で状況が大きく変わります。";
  if (totalCost < 50000) return "先延ばしコストが積み上がっています。今日が最善のタイミングです。";
  if (totalCost < 100000) return "このコストは実際の損失につながっています。プロに頼むことも選択肢です。";
  return "早急な行動が必要です。まず1つだけ、今日終わらせましょう。";
}

export default function ProcrastinationCost() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [defaultRate, setDefaultRate] = useState(3000);

  const addTask = () => {
    setTasks([...tasks, {
      id: Date.now(),
      name: "新しいタスク",
      estimatedMinutes: 60,
      daysDelayed: 3,
      hourlyRate: defaultRate,
      stressLevel: 2,
      importance: "medium",
    }]);
  };

  const removeTask = (id: number) => setTasks(tasks.filter((t) => t.id !== id));

  const updateTask = <K extends keyof Task>(id: number, field: K, value: Task[K]) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const taskCosts = useMemo(() => tasks.map((t) => ({ task: t, ...calcTaskCost(t) })), [tasks]);
  const totalCost = taskCosts.reduce((sum, tc) => sum + tc.total, 0);
  const totalMentalCost = taskCosts.reduce((sum, tc) => sum + tc.mentalCost, 0);
  const totalOpportunityCost = taskCosts.reduce((sum, tc) => sum + tc.opportunityCost, 0);

  return (
    <div className="space-y-5">
      {/* Default hourly rate */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">あなたの時給（デフォルト）</h2>
            <p className="text-xs text-gray-400 mt-0.5">タスクごとに個別設定も可能</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={100}
              value={defaultRate}
              onChange={(e) => setDefaultRate(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-sm text-gray-500">円/時</span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {[1000, 2000, 3000, 5000, 10000].map((r) => (
            <button
              key={r}
              onClick={() => setDefaultRate(r)}
              className={`flex-1 py-1.5 rounded-lg text-xs border transition-all ${defaultRate === r ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-500 border-gray-200 hover:border-amber-300"}`}
            >
              {(r / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>

      {/* Tasks */}
      {tasks.map((task, idx) => {
        const costs = taskCosts[idx];
        return (
          <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <input
                type="text"
                value={task.name}
                onChange={(e) => updateTask(task.id, "name", e.target.value)}
                className="text-base font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-amber-400 focus:outline-none bg-transparent flex-1 mr-3"
              />
              <button onClick={() => removeTask(task.id)} className="text-gray-300 hover:text-red-500 text-xl leading-none ml-2">×</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">作業時間（分）</label>
                <input
                  type="number"
                  min={1}
                  value={task.estimatedMinutes}
                  onChange={(e) => updateTask(task.id, "estimatedMinutes", Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">先延ばし日数</label>
                <input
                  type="number"
                  min={0}
                  value={task.daysDelayed}
                  onChange={(e) => updateTask(task.id, "daysDelayed", Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">時給（円）</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={task.hourlyRate}
                  onChange={(e) => updateTask(task.id, "hourlyRate", Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">重要度</label>
                <select
                  value={task.importance}
                  onChange={(e) => updateTask(task.id, "importance", e.target.value as Task["importance"])}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {Object.entries(IMPORTANCE_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">
                精神的負担：<span className={STRESS_COLORS[task.stressLevel]}>{STRESS_LABELS[task.stressLevel]}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={task.stressLevel}
                onChange={(e) => updateTask(task.id, "stressLevel", Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>低</span>
                <span>高</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <p className="text-gray-500">作業コスト</p>
                <p className="font-bold text-amber-700">¥{Math.round(costs.directCost).toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-2 text-center">
                <p className="text-gray-500">精神的コスト</p>
                <p className="font-bold text-orange-700">¥{Math.round(costs.mentalCost).toLocaleString()}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center border-2 border-red-200">
                <p className="text-gray-500">累計損失</p>
                <p className="font-bold text-red-700">¥{Math.round(costs.total).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={addTask}
        className="w-full border-2 border-dashed border-amber-200 rounded-2xl py-4 text-amber-500 hover:text-amber-700 hover:border-amber-400 transition-colors text-sm font-medium"
      >
        ＋ タスクを追加
      </button>

      {/* Total result */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
        <p className="text-amber-200 text-sm text-center mb-3">先延ばし累計コスト（全タスク）</p>
        <div className="text-center mb-4">
          <p className="text-5xl font-bold">¥{Math.round(totalCost).toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
          <div className="bg-white/10 rounded-lg p-2">
            <p className="text-amber-200">作業コスト</p>
            <p className="font-bold text-sm">¥{Math.round(taskCosts.reduce((s, tc) => s + tc.directCost, 0)).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <p className="text-amber-200">精神的損失</p>
            <p className="font-bold text-sm">¥{Math.round(totalMentalCost).toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2">
            <p className="text-amber-200">機会損失</p>
            <p className="font-bold text-sm">¥{Math.round(totalOpportunityCost).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-xl p-3 text-sm text-center italic">
          {getMotivationMessage(totalCost)}
        </div>
      </div>

      {/* Task breakdown */}
      {taskCosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">タスク別コスト比較</h3>
          <div className="space-y-3">
            {taskCosts.sort((a, b) => b.total - a.total).map((tc) => {
              const pct = totalCost > 0 ? (tc.total / totalCost) * 100 : 0;
              const imp = IMPORTANCE_CONFIG[tc.task.importance];
              return (
                <div key={tc.task.id}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <div className="flex items-center gap-2">
                      <span>{tc.task.name}</span>
                      <span className={`${imp.bg} ${imp.color} px-1.5 py-0.5 rounded-full text-xs`}>{imp.label}</span>
                    </div>
                    <span className="font-bold">¥{Math.round(tc.total).toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この先延ばしコスト計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">タスク先延ばしの累積コスト可視化。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この先延ばしコスト計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "タスク先延ばしの累積コスト可視化。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })}
          </div>
        </div>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "先延ばしコスト計算",
  "description": "タスク先延ばしの累積コスト可視化",
  "url": "https://tools.loresync.dev/procrastination-cost",
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
