"use client";

import { useMemo, useState } from "react";

type Asset = {
  id: string;
  name: string;
  amount: string;
  target: string;
  color: string;
};

type PresetKey = "defensive" | "balanced" | "growth" | "equity";

const DEFAULT_ASSETS: Asset[] = [
  { id: "cash", name: "現金・預金", amount: "100", target: "10", color: "#64748b" },
  { id: "jp-bond", name: "国内債券", amount: "150", target: "20", color: "#0ea5e9" },
  { id: "global-bond", name: "海外債券", amount: "100", target: "20", color: "#22c55e" },
  { id: "jp-stock", name: "国内株式", amount: "250", target: "20", color: "#f59e0b" },
  { id: "global-stock", name: "海外株式", amount: "350", target: "25", color: "#ef4444" },
  { id: "other", name: "その他", amount: "50", target: "5", color: "#8b5cf6" },
];

const PRESETS: Record<PresetKey, { label: string; description: string; targets: Record<string, string> }> = {
  defensive: {
    label: "安定型",
    description: "現金・債券を厚めにする配分",
    targets: { cash: "20", "jp-bond": "35", "global-bond": "25", "jp-stock": "10", "global-stock": "10", other: "0" },
  },
  balanced: {
    label: "バランス型",
    description: "株式と債券をおおむね半分ずつ",
    targets: { cash: "10", "jp-bond": "20", "global-bond": "20", "jp-stock": "20", "global-stock": "25", other: "5" },
  },
  growth: {
    label: "成長型",
    description: "株式比率を高めにする配分",
    targets: { cash: "5", "jp-bond": "10", "global-bond": "10", "jp-stock": "25", "global-stock": "45", other: "5" },
  },
  equity: {
    label: "株式中心",
    description: "株式を中心に確認する配分",
    targets: { cash: "5", "jp-bond": "0", "global-bond": "5", "jp-stock": "30", "global-stock": "55", other: "5" },
  },
};

const EXAMPLES = [
  { label: "1000万円", values: ["100", "150", "100", "250", "350", "50"] },
  { label: "積立初期", values: ["30", "20", "20", "60", "120", "0"] },
  { label: "安全寄り", values: ["300", "300", "200", "100", "100", "0"] },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanNumericInput(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}万円`;
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

function getRiskTone(stockRatio: number) {
  if (stockRatio < 30) return { label: "値動きは比較的控えめ", className: "border-emerald-200 bg-emerald-50 text-emerald-900" };
  if (stockRatio < 60) return { label: "中程度の値動き", className: "border-amber-200 bg-amber-50 text-amber-900" };
  return { label: "値動きは大きめ", className: "border-red-200 bg-red-50 text-red-900" };
}

export default function AssetAllocation() {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [contribution, setContribution] = useState("0");
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    const total = assets.reduce((sum, asset) => sum + parseNumber(asset.amount), 0);
    const targetTotal = total + parseNumber(contribution);
    return assets.map((asset) => {
      const amount = parseNumber(asset.amount);
      const target = parseNumber(asset.target);
      const currentPct = total > 0 ? (amount / total) * 100 : 0;
      const targetAmount = targetTotal * (target / 100);
      const diff = targetAmount - amount;
      return { ...asset, amountValue: amount, targetValue: target, currentPct, targetAmount, diff };
    });
  }, [assets, contribution]);

  const totalAmount = rows.reduce((sum, row) => sum + row.amountValue, 0);
  const targetTotal = totalAmount + parseNumber(contribution);
  const targetSum = rows.reduce((sum, row) => sum + row.targetValue, 0);
  const stockRatio = rows
    .filter((row) => row.id.includes("stock"))
    .reduce((sum, row) => sum + row.targetValue, 0);
  const riskTone = getRiskTone(stockRatio);
  const targetError = Math.abs(targetSum - 100) > 0.05 ? `目標比率の合計が ${formatPct(targetSum)} です。100% に調整してください。` : "";

  function updateAsset(id: string, field: "name" | "amount" | "target", value: string) {
    setAssets((prev) =>
      prev.map((asset) => (
        asset.id === id
          ? { ...asset, [field]: field === "name" ? value : cleanNumericInput(value) }
          : asset
      ))
    );
    setCopied(false);
  }

  function applyPreset(key: PresetKey) {
    const preset = PRESETS[key];
    setAssets((prev) =>
      prev.map((asset) => ({ ...asset, target: preset.targets[asset.id] ?? asset.target }))
    );
    setCopied(false);
  }

  function applyExample(values: string[]) {
    setAssets((prev) => prev.map((asset, index) => ({ ...asset, amount: values[index] ?? asset.amount })));
    setContribution("0");
    setCopied(false);
  }

  function reset() {
    setAssets(DEFAULT_ASSETS);
    setContribution("0");
    setCopied(false);
  }

  async function copyResult() {
    const lines = [
      `現在資産: ${formatMoney(totalAmount)}`,
      `追加投資後の基準額: ${formatMoney(targetTotal)}`,
      `目標比率合計: ${formatPct(targetSum)}`,
      ...rows.map((row) => {
        const action = row.diff >= 0 ? "買い増し" : "売却/減額";
        return `${row.name}: 現在${formatPct(row.currentPct)} / 目標${formatPct(row.targetValue)} / ${action} ${formatMoney(Math.abs(row.diff))}`;
      }),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">現在金額と目標比率</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                金額は万円単位です。目標比率は合計100%になるように入力します。
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">目標プリセット</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(Object.entries(PRESETS) as [PresetKey, typeof PRESETS[PresetKey]][]).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-slate-400 hover:bg-white"
                >
                  <span className="block text-sm font-semibold text-slate-950">{preset.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_92px_86px] gap-0 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              <div>資産クラス</div>
              <div className="text-right">現在</div>
              <div className="text-right">目標</div>
            </div>
            <div className="divide-y divide-slate-200">
              {assets.map((asset) => (
                <div key={asset.id} className="grid grid-cols-[1fr_92px_86px] gap-2 px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: asset.color }} />
                    <input
                      type="text"
                      value={asset.name}
                      onChange={(event) => updateAsset(asset.id, "name", event.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-slate-950 outline-none focus:border-slate-300"
                    />
                  </div>
                  <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={asset.amount}
                      onChange={(event) => updateAsset(asset.id, "amount", event.target.value)}
                      className="min-w-0 flex-1 px-2 py-1.5 text-right font-mono text-sm outline-none"
                      aria-label={`${asset.name}の現在金額`}
                    />
                    <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">万</span>
                  </div>
                  <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={asset.target}
                      onChange={(event) => updateAsset(asset.id, "target", event.target.value)}
                      className="min-w-0 flex-1 px-2 py-1.5 text-right font-mono text-sm outline-none"
                      aria-label={`${asset.name}の目標比率`}
                    />
                    <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="asset-contribution" className="text-sm font-medium text-slate-700">
                追加投資額
              </label>
              <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
                <input
                  id="asset-contribution"
                  type="text"
                  inputMode="decimal"
                  value={contribution}
                  onChange={(event) => {
                    setContribution(cleanNumericInput(event.target.value));
                    setCopied(false);
                  }}
                  className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
                />
                <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">万円</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyExample(example.values)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${targetError ? "text-red-600" : "text-slate-500"}`}>
            {targetError || "計算はブラウザ上で完結し、入力値は外部に送信されません。"}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard label="現在資産" value={formatMoney(totalAmount)} note="入力した現在金額の合計" />
            <SummaryCard label="追加後基準額" value={formatMoney(targetTotal)} note="現在資産 + 追加投資額" />
            <SummaryCard label="目標比率合計" value={formatPct(targetSum)} note={targetError ? "要調整" : "100%です"} />
            <SummaryCard label="目標株式比率" value={formatPct(stockRatio)} note={riskTone.label} />
          </div>

          <div className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${riskTone.className}`}>
            このツールは配分の見える化と差分計算だけを行います。特定の資産配分や金融商品の購入を勧めるものではありません。
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-950">リバランス差分</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {rows.map((row) => (
                <div key={row.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{row.name}</p>
                        <p className="text-xs text-slate-500">
                          現在 {formatPct(row.currentPct)} / 目標 {formatPct(row.targetValue)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm font-bold ${row.diff >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {row.diff >= 0 ? "+" : "-"}{formatMoney(Math.abs(row.diff))}
                      </p>
                      <p className="text-xs text-slate-500">{row.diff >= 0 ? "買い増し目安" : "売却/減額目安"}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(100, row.currentPct)}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!!targetError || totalAmount <= 0}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              入力をクリア
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
