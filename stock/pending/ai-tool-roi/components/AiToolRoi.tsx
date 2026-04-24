"use client";

import { useState, useMemo } from "react";

interface Tool {
  id: number;
  name: string;
  monthlyCost: string;
  hourlyRate: string;
  dailySavingMin: string;
  workDays: string;
}

function formatJPY(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function formatDecimal(n: number, digits = 1): string {
  return n.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

let nextId = 2;

const defaultTools: Tool[] = [
  {
    id: 1,
    name: "Claude Pro",
    monthlyCost: "3000",
    hourlyRate: "3000",
    dailySavingMin: "60",
    workDays: "20",
  },
];

function calcTool(t: Tool) {
  const cost = parseFloat(t.monthlyCost);
  const rate = parseFloat(t.hourlyRate);
  const minPerDay = parseFloat(t.dailySavingMin);
  const days = parseFloat(t.workDays);

  if (
    isNaN(cost) || cost < 0 ||
    isNaN(rate) || rate <= 0 ||
    isNaN(minPerDay) || minPerDay <= 0 ||
    isNaN(days) || days <= 0
  ) {
    return null;
  }

  const monthlyHours = (minPerDay * days) / 60;
  const monthlyValue = monthlyHours * rate;
  const roi = cost === 0 ? Infinity : ((monthlyValue - cost) / cost) * 100;
  const payback = cost === 0 ? 0 : monthlyValue <= 0 ? Infinity : cost / monthlyValue;

  return { monthlyHours, monthlyValue, roi, payback };
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  type = "number",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type={type}
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {suffix && (
          <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function BreakEvenChart({
  monthlyCost,
  monthlyValue,
}: {
  monthlyCost: number;
  monthlyValue: number;
}) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxVal = Math.max(monthlyCost * 12, monthlyValue * 12, 1);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        12ヶ月コスト vs 時短価値
      </p>
      <div className="space-y-1">
        {months.map((m) => {
          const cumCost = monthlyCost * m;
          const cumValue = monthlyValue * m;
          const costPct = Math.min((cumCost / maxVal) * 100, 100);
          const valuePct = Math.min((cumValue / maxVal) * 100, 100);
          const breakEven = cumValue >= cumCost;

          return (
            <div key={m} className="flex items-center gap-2 text-xs">
              <span className="w-8 text-right text-gray-400 shrink-0">{m}ヶ月</span>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1">
                  <div
                    className="h-2 rounded bg-red-300"
                    style={{ width: `${costPct}%`, minWidth: costPct > 0 ? "2px" : 0 }}
                  />
                  <span className="text-gray-400 text-[10px]">¥{formatJPY(cumCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`h-2 rounded ${breakEven ? "bg-green-400" : "bg-blue-300"}`}
                    style={{ width: `${valuePct}%`, minWidth: valuePct > 0 ? "2px" : 0 }}
                  />
                  <span className="text-gray-400 text-[10px]">¥{formatJPY(cumValue)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 text-[10px] text-gray-500 pt-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded bg-red-300" />累積コスト
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded bg-blue-300" />累積時短価値（損益分岐前）
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded bg-green-400" />累積時短価値（損益分岐後）
        </span>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  onUpdate,
  onRemove,
  canRemove,
}: {
  tool: Tool;
  onUpdate: (t: Tool) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const result = useMemo(() => calcTool(tool), [tool]);
  const set = (field: keyof Tool) => (v: string) => onUpdate({ ...tool, [field]: v });

  const roiPositive = result && result.roi >= 0;
  const paybackStr =
    result === null
      ? "—"
      : !isFinite(result.payback)
      ? "回収不可"
      : result.payback < 1
      ? `${formatDecimal(result.payback * 30, 0)}日`
      : `${formatDecimal(result.payback)}ヶ月`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={tool.name}
          onChange={(e) => set("name")(e.target.value)}
          placeholder="ツール名（任意）"
          className="flex-1 text-base font-semibold text-gray-800 border-b border-dashed border-gray-300 bg-transparent focus:outline-none focus:border-blue-400 placeholder:text-gray-300"
        />
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded border border-gray-200 hover:border-red-300"
          >
            削除
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InputField
          label="月額コスト"
          value={tool.monthlyCost}
          onChange={set("monthlyCost")}
          placeholder="3000"
          suffix="円/月"
        />
        <InputField
          label="時給"
          value={tool.hourlyRate}
          onChange={set("hourlyRate")}
          placeholder="3000"
          suffix="円/時"
        />
        <InputField
          label="1日の時短効果"
          value={tool.dailySavingMin}
          onChange={set("dailySavingMin")}
          placeholder="60"
          suffix="分/日"
        />
        <InputField
          label="月の稼働日数"
          value={tool.workDays}
          onChange={set("workDays")}
          placeholder="20"
          suffix="日/月"
        />
      </div>

      {/* Results */}
      {result ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">月の時短時間</p>
              <p className="text-xl font-bold text-gray-800">
                {formatDecimal(result.monthlyHours)}h
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">月の時短価値</p>
              <p className="text-xl font-bold text-gray-800">
                ¥{formatJPY(result.monthlyValue)}
              </p>
            </div>
            <div
              className={`rounded-xl border px-4 py-3 ${
                roiPositive
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">ROI</p>
              <p
                className={`text-xl font-bold ${
                  roiPositive ? "text-green-700" : "text-red-600"
                }`}
              >
                {isFinite(result.roi)
                  ? `${result.roi >= 0 ? "+" : ""}${formatDecimal(result.roi)}%`
                  : "∞"}
              </p>
            </div>
            <div
              className={`rounded-xl border px-4 py-3 ${
                isFinite(result.payback) && result.payback <= 1
                  ? "bg-green-50 border-green-200"
                  : isFinite(result.payback)
                  ? "bg-blue-50 border-blue-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">回収期間</p>
              <p
                className={`text-xl font-bold ${
                  isFinite(result.payback) && result.payback <= 1
                    ? "text-green-700"
                    : isFinite(result.payback)
                    ? "text-blue-700"
                    : "text-red-600"
                }`}
              >
                {paybackStr}
              </p>
            </div>
          </div>

          {/* Break-even chart */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4">
            <BreakEvenChart
              monthlyCost={parseFloat(tool.monthlyCost) || 0}
              monthlyValue={result.monthlyValue}
            />
          </div>

          {/* Verdict */}
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              roiPositive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {roiPositive
              ? `月に¥${formatJPY(result.monthlyValue - parseFloat(tool.monthlyCost))}のプラス。導入コスト${paybackStr}で回収できます。`
              : `月に¥${formatJPY(parseFloat(tool.monthlyCost) - result.monthlyValue)}のマイナス。時短効果か月額コストを見直してください。`}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
          有効な値を入力してください
        </div>
      )}
    </div>
  );
}

export default function AiToolRoi() {
  const [tools, setTools] = useState<Tool[]>(defaultTools);

  const addTool = () => {
    setTools((prev) => [
      ...prev,
      {
        id: nextId++,
        name: "",
        monthlyCost: "",
        hourlyRate: "",
        dailySavingMin: "",
        workDays: "20",
      },
    ]);
  };

  const updateTool = (id: number, t: Tool) => {
    setTools((prev) => prev.map((x) => (x.id === id ? t : x)));
  };

  const removeTool = (id: number) => {
    setTools((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Tool cards */}
      {tools.map((t) => (
        <ToolCard
          key={t.id}
          tool={t}
          onUpdate={(updated) => updateTool(t.id, updated)}
          onRemove={() => removeTool(t.id)}
          canRemove={tools.length > 1}
        />
      ))}

      {/* Add tool button */}
      <button
        onClick={addTool}
        className="w-full rounded-2xl border-2 border-dashed border-gray-300 py-4 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        + ツールを追加して比較
      </button>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Explanation */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
        <p>月の時短時間 = 1日の時短（分）× 稼働日数 ÷ 60</p>
        <p>月の時短価値 = 月の時短時間 × 時給</p>
        <p>ROI = (時短価値 − 月額コスト) ÷ 月額コスト × 100</p>
        <p>回収期間 = 月額コスト ÷ 月の時短価値</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAIツール導入 ROI計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">月額コスト vs 時短効果 × 時給で投資回収期間を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAIツール導入 ROI計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "月額コスト vs 時短効果 × 時給で投資回収期間を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
