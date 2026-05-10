"use client";

import { useMemo, useState } from "react";

type ToolInput = {
  id: number;
  name: string;
  monthlyCost: string;
  setupCost: string;
  seats: string;
  hourlyRate: string;
  dailySavingMin: string;
  workDays: string;
  adoptionRate: string;
};

type ToolResult = {
  tool: ToolInput;
  monthlyCostTotal: number;
  monthlyHoursSaved: number;
  monthlyValue: number;
  monthlyNet: number;
  annualNet: number;
  twelveMonthNet: number;
  roi: number;
  paybackMonths: number;
};

type CopiedTarget = "summary" | "csv" | null;

const DEFAULT_TOOLS: ToolInput[] = [
  {
    id: 1,
    name: "AIチャットツール",
    monthlyCost: "3000",
    setupCost: "0",
    seats: "1",
    hourlyRate: "3000",
    dailySavingMin: "45",
    workDays: "20",
    adoptionRate: "80",
  },
];

const EXAMPLES: Array<{ label: string; tools: ToolInput[] }> = [
  { label: "個人利用", tools: DEFAULT_TOOLS },
  {
    label: "5人チーム",
    tools: [
      {
        id: 1,
        name: "AIコーディング支援",
        monthlyCost: "3000",
        setupCost: "50000",
        seats: "5",
        hourlyRate: "4000",
        dailySavingMin: "30",
        workDays: "20",
        adoptionRate: "70",
      },
    ],
  },
  {
    label: "2ツール比較",
    tools: [
      {
        id: 1,
        name: "議事録AI",
        monthlyCost: "1500",
        setupCost: "0",
        seats: "3",
        hourlyRate: "3000",
        dailySavingMin: "15",
        workDays: "16",
        adoptionRate: "90",
      },
      {
        id: 2,
        name: "AIライティング",
        monthlyCost: "2500",
        setupCost: "10000",
        seats: "2",
        hourlyRate: "3500",
        dailySavingMin: "25",
        workDays: "20",
        adoptionRate: "75",
      },
    ],
  },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeDecimal(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [first, ...rest] = cleaned.split(".");
  return rest.length ? `${first}.${rest.join("")}` : first;
}

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function validateTool(tool: ToolInput) {
  const monthlyCost = parseNumber(tool.monthlyCost);
  const setupCost = parseNumber(tool.setupCost);
  const seats = parseNumber(tool.seats);
  const hourlyRate = parseNumber(tool.hourlyRate);
  const dailySavingMin = parseNumber(tool.dailySavingMin);
  const workDays = parseNumber(tool.workDays);
  const adoptionRate = parseNumber(tool.adoptionRate);

  if (!tool.name.trim()) return "入力エラー: ツール名を入力してください。";
  if (monthlyCost < 0 || monthlyCost > 10_000_000) return `${tool.name}: 月額コストは0円〜1,000万円で入力してください。`;
  if (setupCost < 0 || setupCost > 100_000_000) return `${tool.name}: 初期導入費は0円〜1億円で入力してください。`;
  if (seats <= 0 || seats > 10_000) return `${tool.name}: 利用人数は1〜10,000人で入力してください。`;
  if (hourlyRate <= 0 || hourlyRate > 100_000) return `${tool.name}: 時給換算は1円〜10万円で入力してください。`;
  if (dailySavingMin <= 0 || dailySavingMin > 480) return `${tool.name}: 1日の時短効果は1〜480分で入力してください。`;
  if (workDays <= 0 || workDays > 31) return `${tool.name}: 月の稼働日数は1〜31日で入力してください。`;
  if (adoptionRate < 0 || adoptionRate > 100) return `${tool.name}: 定着率は0%〜100%で入力してください。`;
  return "";
}

function calcTool(tool: ToolInput): ToolResult | null {
  const error = validateTool(tool);
  if (error) return null;

  const monthlyCost = parseNumber(tool.monthlyCost);
  const setupCost = parseNumber(tool.setupCost);
  const seats = parseNumber(tool.seats);
  const hourlyRate = parseNumber(tool.hourlyRate);
  const dailySavingMin = parseNumber(tool.dailySavingMin);
  const workDays = parseNumber(tool.workDays);
  const adoptionRate = parseNumber(tool.adoptionRate) / 100;
  const monthlyCostTotal = monthlyCost * seats;
  const monthlyHoursSaved = (dailySavingMin * workDays * seats * adoptionRate) / 60;
  const monthlyValue = monthlyHoursSaved * hourlyRate;
  const monthlyNet = monthlyValue - monthlyCostTotal;
  const annualNet = monthlyNet * 12;
  const twelveMonthNet = annualNet - setupCost;
  const roi = monthlyCostTotal === 0 ? Infinity : ((monthlyValue - monthlyCostTotal) / monthlyCostTotal) * 100;
  const paybackMonths = monthlyNet <= 0 ? Infinity : setupCost / monthlyNet;

  return { tool, monthlyCostTotal, monthlyHoursSaved, monthlyValue, monthlyNet, annualNet, twelveMonthNet, roi, paybackMonths };
}

function makeCsv(results: ToolResult[]) {
  const totals = summarize(results);
  const rows = [
    ["項目", "値"],
    ["月額コスト合計", Math.round(totals.monthlyCost).toString()],
    ["月の時短価値合計", Math.round(totals.monthlyValue).toString()],
    ["月の純効果", Math.round(totals.monthlyNet).toString()],
    ["12ヶ月純効果", Math.round(totals.twelveMonthNet).toString()],
    ["月の時短時間", formatNumber(totals.monthlyHoursSaved, 2)],
    [],
    ["ツール", "人数", "月額/人", "初期費", "時給", "時短分/日", "稼働日/月", "定着率", "月の時短時間", "月の時短価値", "月の純効果", "12ヶ月純効果", "ROI", "回収期間月"],
    ...results.map((result) => [
      result.tool.name,
      result.tool.seats,
      result.tool.monthlyCost,
      result.tool.setupCost,
      result.tool.hourlyRate,
      result.tool.dailySavingMin,
      result.tool.workDays,
      result.tool.adoptionRate,
      formatNumber(result.monthlyHoursSaved, 2),
      Math.round(result.monthlyValue).toString(),
      Math.round(result.monthlyNet).toString(),
      Math.round(result.twelveMonthNet).toString(),
      Number.isFinite(result.roi) ? formatNumber(result.roi, 1) : "Infinity",
      Number.isFinite(result.paybackMonths) ? formatNumber(result.paybackMonths, 2) : "回収不可",
    ]),
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function buildSummary(results: ToolResult[]) {
  const totals = summarize(results);
  return [
    "AIツール導入ROI計算結果",
    `月額コスト合計: ${formatYen(totals.monthlyCost)}`,
    `月の時短価値合計: ${formatYen(totals.monthlyValue)}`,
    `月の純効果: ${formatYen(totals.monthlyNet)}`,
    `12ヶ月純効果: ${formatYen(totals.twelveMonthNet)}`,
    `月の時短時間: ${formatNumber(totals.monthlyHoursSaved, 1)}時間`,
    "",
    ...results.map((result) => `${result.tool.name}: 月純効果 ${formatYen(result.monthlyNet)} / 12ヶ月 ${formatYen(result.twelveMonthNet)}`),
  ].join("\n");
}

function summarize(results: ToolResult[]) {
  return results.reduce(
    (acc, result) => ({
      monthlyCost: acc.monthlyCost + result.monthlyCostTotal,
      monthlyValue: acc.monthlyValue + result.monthlyValue,
      monthlyNet: acc.monthlyNet + result.monthlyNet,
      annualNet: acc.annualNet + result.annualNet,
      twelveMonthNet: acc.twelveMonthNet + result.twelveMonthNet,
      monthlyHoursSaved: acc.monthlyHoursSaved + result.monthlyHoursSaved,
    }),
    { monthlyCost: 0, monthlyValue: 0, monthlyNet: 0, annualNet: 0, twelveMonthNet: 0, monthlyHoursSaved: 0 }
  );
}

function paybackLabel(months: number) {
  if (!Number.isFinite(months)) return "回収不可";
  if (months <= 0) return "即時";
  if (months < 1) return `${formatNumber(months * 30, 0)}日`;
  return `${formatNumber(months, 1)}ヶ月`;
}

export default function AiToolRoi() {
  const [tools, setTools] = useState<ToolInput[]>(DEFAULT_TOOLS);
  const [nextId, setNextId] = useState(2);
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);
  const errors = tools.map(validateTool).filter(Boolean);
  const results = useMemo(
    () => tools.map(calcTool).filter((result): result is ToolResult => result !== null),
    [tools]
  );
  const totals = summarize(results);
  const csv = results.length ? makeCsv(results) : "";
  const summary = results.length ? buildSummary(results) : "";
  const sortedResults = [...results].sort((a, b) => b.twelveMonthNet - a.twelveMonthNet);

  function updateTool(id: number, updates: Partial<ToolInput>) {
    setTools((previous) => previous.map((tool) => (tool.id === id ? { ...tool, ...updates } : tool)));
    setCopiedTarget(null);
  }

  function addTool() {
    setTools((previous) => [
      ...previous,
      {
        id: nextId,
        name: "",
        monthlyCost: "",
        setupCost: "0",
        seats: "1",
        hourlyRate: "",
        dailySavingMin: "",
        workDays: "20",
        adoptionRate: "70",
      },
    ]);
    setNextId((value) => value + 1);
    setCopiedTarget(null);
  }

  function removeTool(id: number) {
    setTools((previous) => previous.filter((tool) => tool.id !== id));
    setCopiedTarget(null);
  }

  function reset() {
    setTools(DEFAULT_TOOLS);
    setNextId(2);
    setCopiedTarget(null);
  }

  async function copy(text: string, target: CopiedTarget) {
    if (!text || !target) return;
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  }

  function downloadCsv() {
    if (!csv) return;
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-tool-roi.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">導入条件</h2>
              <p className="mt-1 text-sm text-slate-500">月額、初期費、時短、定着率を入力します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <p id="ai-roi-input-error" className={`mt-4 min-h-5 text-sm ${errors[0] ? "text-red-600" : "text-slate-500"}`}>
            {errors[0] || "計算はブラウザ上で完結し、入力値を外部に送信しません。"}
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setTools(example.tools);
                    setNextId(Math.max(...example.tools.map((tool) => tool.id)) + 1);
                    setCopiedTarget(null);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {tools.map((tool, index) => (
              <ToolEditor
                key={tool.id}
                tool={tool}
                index={index}
                canRemove={tools.length > 1}
                onChange={updateTool}
                onRemove={removeTool}
              />
            ))}
            <button
              type="button"
              onClick={addTool}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-950"
            >
              ツールを追加
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {results.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-medium text-slate-700">入力を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">有効な値を入れるとROIが表示されます。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className={`rounded-2xl border p-5 ${totals.monthlyNet >= 0 ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-red-200 bg-red-50 text-red-950"}`}>
                <p className={`text-sm font-medium ${totals.monthlyNet >= 0 ? "text-emerald-700" : "text-red-700"}`}>月の純効果</p>
                <p className="mt-1 text-4xl font-bold tracking-tight">{formatYen(totals.monthlyNet)}</p>
                <p className="mt-2 text-sm">
                  月の時短価値 {formatYen(totals.monthlyValue)} から、月額コスト {formatYen(totals.monthlyCost)} を差し引いた概算です。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="12ヶ月純効果" value={formatYen(totals.twelveMonthNet)} note="初期導入費も控除" />
                <ResultCard label="月の時短時間" value={`${formatNumber(totals.monthlyHoursSaved, 1)}時間`} note="定着率を反映" />
                <ResultCard label="月額コスト合計" value={formatYen(totals.monthlyCost)} note={`${results.length}ツールを集計`} />
                <ResultCard label="月の時短価値" value={formatYen(totals.monthlyValue)} note="時給換算した価値" />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">導入判断の目安</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  月の純効果がプラスで、初期導入費を12ヶ月以内に回収できるなら導入優先度は高めです。定着率が低い場合は、教育コストや運用ルールも見積もってください。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy(summary, "summary")}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {copiedTarget === "summary" ? "コピーしました" : "結果をコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => copy(csv, "csv")}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedTarget === "csv" ? "CSVコピー済み" : "CSVをコピー"}
                </button>
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  CSVダウンロード
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <div className="border-t border-slate-200 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">ツール別比較</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-3 text-left font-medium">ツール</th>
                  <th className="px-3 py-2 text-right font-medium">月額コスト</th>
                  <th className="px-3 py-2 text-right font-medium">月の時短価値</th>
                  <th className="px-3 py-2 text-right font-medium">月純効果</th>
                  <th className="px-3 py-2 text-right font-medium">12ヶ月純効果</th>
                  <th className="px-3 py-2 text-right font-medium">ROI</th>
                  <th className="py-2 pl-3 text-right font-medium">回収期間</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result) => (
                  <tr key={result.tool.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 font-medium text-slate-800">{result.tool.name}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatYen(result.monthlyCostTotal)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatYen(result.monthlyValue)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-semibold ${result.monthlyNet >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {formatYen(result.monthlyNet)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{formatYen(result.twelveMonthNet)}</td>
                    <td className="px-3 py-2 text-right font-mono">{Number.isFinite(result.roi) ? `${formatNumber(result.roi, 1)}%` : "∞"}</td>
                    <td className="py-2 pl-3 text-right font-mono">{paybackLabel(result.paybackMonths)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function ToolEditor({
  tool,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  tool: ToolInput;
  index: number;
  canRemove: boolean;
  onChange: (id: number, updates: Partial<ToolInput>) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
            {index + 1}
          </span>
          <input
            type="text"
            value={tool.name}
            onChange={(event) => onChange(tool.id, { name: event.target.value })}
            placeholder="ツール名"
            className="min-w-0 flex-1 border-b border-slate-200 py-1 text-sm font-semibold outline-none focus:border-slate-900"
            aria-describedby="ai-roi-input-error"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(tool.id)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            削除
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SmallNumberInput id={`${tool.id}-monthly`} label="月額/人" suffix="円" value={tool.monthlyCost} onChange={(value) => onChange(tool.id, { monthlyCost: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${tool.id}-setup`} label="初期導入費" suffix="円" value={tool.setupCost} onChange={(value) => onChange(tool.id, { setupCost: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${tool.id}-seats`} label="利用人数" suffix="人" value={tool.seats} onChange={(value) => onChange(tool.id, { seats: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${tool.id}-rate`} label="時給換算" suffix="円/h" value={tool.hourlyRate} onChange={(value) => onChange(tool.id, { hourlyRate: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${tool.id}-saving`} label="時短/日" suffix="分" value={tool.dailySavingMin} onChange={(value) => onChange(tool.id, { dailySavingMin: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${tool.id}-days`} label="稼働日/月" suffix="日" value={tool.workDays} onChange={(value) => onChange(tool.id, { workDays: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${tool.id}-adoption`} label="定着率" suffix="%" value={tool.adoptionRate} onChange={(value) => onChange(tool.id, { adoptionRate: sanitizeDecimal(value) })} />
      </div>
    </div>
  );
}

function SmallNumberInput({
  id,
  label,
  suffix,
  value,
  onChange,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-500">
        {label}
      </label>
      <div className="mt-1 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-3 py-2 text-right font-mono outline-none"
          aria-describedby="ai-roi-input-error"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}

function ResultCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
