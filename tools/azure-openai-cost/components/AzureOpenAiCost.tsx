"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// 料金データ (2025年4月時点 / Azure OpenAI Service 公式価格)
// PTU = Provisioned Throughput Unit (予約型)
// PAYG = Pay-As-You-Go (従量課金)
// ---------------------------------------------------------------------------

type DeployMode = "payg" | "ptu";

type RegionMultiplier = {
  id: string;
  name: string;
  /** East US を 1.0 として相対倍率 */
  multiplier: number;
  note?: string;
};

const REGIONS: RegionMultiplier[] = [
  { id: "eastus",      name: "East US",       multiplier: 1.00 },
  { id: "eastus2",     name: "East US 2",     multiplier: 1.00 },
  { id: "westus",      name: "West US",       multiplier: 1.00 },
  { id: "westus3",     name: "West US 3",     multiplier: 1.00 },
  { id: "northeu",     name: "North Europe",  multiplier: 1.00 },
  { id: "westeu",      name: "West Europe",   multiplier: 1.00 },
  { id: "japaneast",   name: "Japan East",    multiplier: 1.00, note: "東日本リージョン" },
  { id: "japanwest",   name: "Japan West",    multiplier: 1.00, note: "西日本リージョン" },
  { id: "uksouth",     name: "UK South",      multiplier: 1.00 },
  { id: "australiaeast", name: "Australia East", multiplier: 1.00 },
  { id: "swedencentral", name: "Sweden Central", multiplier: 1.00 },
];

type Model = {
  id: string;
  name: string;
  shortName: string;
  tier: "flagship" | "standard" | "mini";
  /** PAYG: USD per 1M tokens */
  paygInputPer1M: number;
  paygOutputPer1M: number;
  /** PTU 最小 PTU 数 */
  ptuMin: number;
  /** PTU USD/hour/100PTU */
  ptuPricePerHourPer100: number;
  /** 直接OpenAI APIとの価格比較用 (USD/1M, null=同等) */
  openaiInputPer1M: number | null;
  openaiOutputPer1M: number | null;
  contextWindow: string;
  note?: string;
};

const MODELS: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    shortName: "4o",
    tier: "flagship",
    paygInputPer1M: 2.50,
    paygOutputPer1M: 10.00,
    ptuMin: 50,
    ptuPricePerHourPer100: 2.00,
    openaiInputPer1M: 2.50,
    openaiOutputPer1M: 10.00,
    contextWindow: "128K",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    shortName: "4o-mini",
    tier: "mini",
    paygInputPer1M: 0.15,
    paygOutputPer1M: 0.60,
    ptuMin: 25,
    ptuPricePerHourPer100: 0.20,
    openaiInputPer1M: 0.15,
    openaiOutputPer1M: 0.60,
    contextWindow: "128K",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    shortName: "4.1",
    tier: "flagship",
    paygInputPer1M: 2.00,
    paygOutputPer1M: 8.00,
    ptuMin: 50,
    ptuPricePerHourPer100: 1.80,
    openaiInputPer1M: 2.00,
    openaiOutputPer1M: 8.00,
    contextWindow: "1M",
    note: "最新フラッグシップ",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 mini",
    shortName: "4.1-mini",
    tier: "mini",
    paygInputPer1M: 0.40,
    paygOutputPer1M: 1.60,
    ptuMin: 25,
    ptuPricePerHourPer100: 0.35,
    openaiInputPer1M: 0.40,
    openaiOutputPer1M: 1.60,
    contextWindow: "1M",
  },
  {
    id: "o3",
    name: "o3",
    shortName: "o3",
    tier: "flagship",
    paygInputPer1M: 10.00,
    paygOutputPer1M: 40.00,
    ptuMin: 100,
    ptuPricePerHourPer100: 8.00,
    openaiInputPer1M: 10.00,
    openaiOutputPer1M: 40.00,
    contextWindow: "200K",
    note: "高度な推論モデル",
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    shortName: "o3-mini",
    tier: "standard",
    paygInputPer1M: 1.10,
    paygOutputPer1M: 4.40,
    ptuMin: 50,
    ptuPricePerHourPer100: 0.90,
    openaiInputPer1M: 1.10,
    openaiOutputPer1M: 4.40,
    contextWindow: "200K",
    note: "軽量推論モデル",
  },
  {
    id: "o4-mini",
    name: "o4-mini",
    shortName: "o4-mini",
    tier: "standard",
    paygInputPer1M: 1.10,
    paygOutputPer1M: 4.40,
    ptuMin: 50,
    ptuPricePerHourPer100: 0.90,
    openaiInputPer1M: 1.10,
    openaiOutputPer1M: 4.40,
    contextWindow: "200K",
    note: "推論特化・軽量版",
  },
];

// ---------------------------------------------------------------------------
// フォーマット
// ---------------------------------------------------------------------------

function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.000001) return `$${n.toExponential(2)}`;
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 0.01) return `${n.toFixed(4)}円`;
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("ja-JP");
}

// ---------------------------------------------------------------------------
// サブコンポーネント
// ---------------------------------------------------------------------------

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(Math.max(v, min), max));
            }}
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// コスト計算
// ---------------------------------------------------------------------------

function calcPaygCost(
  inputTokens: number,
  outputTokens: number,
  requestsPerDay: number,
  model: Model,
  regionMultiplier: number
) {
  const inputCost = (inputTokens / 1_000_000) * model.paygInputPer1M * regionMultiplier;
  const outputCost = (outputTokens / 1_000_000) * model.paygOutputPer1M * regionMultiplier;
  const perRequest = inputCost + outputCost;
  const perDay = perRequest * requestsPerDay;
  return {
    inputCost,
    outputCost,
    perRequest,
    perDay,
    perMonth: perDay * 30,
    perYear: perDay * 365,
  };
}

/** PTUの推定: 1時間あたりトークン数からPTU数を概算 */
function estimatePtuNeeded(inputTokens: number, outputTokens: number, requestsPerHour: number): number {
  // 概算: 1 PTU ≈ 1,500 tokens/min = 90,000 tokens/hour (input+output合算)
  const tokensPerHour = (inputTokens + outputTokens) * requestsPerHour;
  const ptu = Math.ceil(tokensPerHour / 90_000);
  return Math.max(ptu, 1);
}

function calcPtuMonthlyCost(ptuCount: number, model: Model, regionMultiplier: number): number {
  // PTU料金: USD/hour/100PTU × PTU数/100 × 24h × 30日
  return (model.ptuPricePerHourPer100 * (ptuCount / 100)) * regionMultiplier * 24 * 30;
}

// ---------------------------------------------------------------------------
// メインコンポーネント
// ---------------------------------------------------------------------------

export default function AzureOpenAiCost() {
  const [modelId, setModelId] = useState<string>("gpt-4o");
  const [regionId, setRegionId] = useState<string>("eastus");
  const [deployMode, setDeployMode] = useState<DeployMode>("payg");
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [requestsPerDay, setRequestsPerDay] = useState<number>(100);
  const [ptuCount, setPtuCount] = useState<number>(100);
  const [exchangeRate, setExchangeRate] = useState<number>(150);
  const [showOpenAiComparison, setShowOpenAiComparison] = useState<boolean>(true);

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[0];

  const paygCost = useMemo(
    () => calcPaygCost(inputTokens, outputTokens, requestsPerDay, model, region.multiplier),
    [inputTokens, outputTokens, requestsPerDay, model, region.multiplier]
  );

  const ptuMonthlyCost = useMemo(
    () => calcPtuMonthlyCost(ptuCount, model, region.multiplier),
    [ptuCount, model, region.multiplier]
  );

  // PTU損益分岐点: PAYGが月いくら以上ならPTUが得か
  const ptuBreakevenMonthlyRequests = useMemo(() => {
    if (paygCost.perRequest === 0) return 0;
    return Math.ceil(ptuMonthlyCost / paygCost.perRequest);
  }, [ptuMonthlyCost, paygCost.perRequest]);

  const requestsPerHour = requestsPerDay / 24;
  const estimatedPtu = useMemo(
    () => estimatePtuNeeded(inputTokens, outputTokens, requestsPerHour),
    [inputTokens, outputTokens, requestsPerHour]
  );

  // OpenAI APIとのコスト比較
  const openaiCost = useMemo(() => {
    if (!model.openaiInputPer1M || !model.openaiOutputPer1M) return null;
    const ic = (inputTokens / 1_000_000) * model.openaiInputPer1M;
    const oc = (outputTokens / 1_000_000) * model.openaiOutputPer1M;
    const perRequest = ic + oc;
    const perDay = perRequest * requestsPerDay;
    return { perRequest, perDay, perMonth: perDay * 30 };
  }, [model, inputTokens, outputTokens, requestsPerDay]);

  // 全モデル比較
  const comparisonData = useMemo(() =>
    MODELS.map((m) => ({
      ...m,
      cost: calcPaygCost(inputTokens, outputTokens, requestsPerDay, m, region.multiplier),
    })),
    [inputTokens, outputTokens, requestsPerDay, region.multiplier]
  );

  const tierLabel: Record<string, string> = {
    flagship: "フラッグシップ",
    standard: "スタンダード",
    mini: "ミニ",
  };

  const tierBadgeClass: Record<string, string> = {
    flagship: "bg-blue-50 text-blue-700 border-blue-200",
    standard: "bg-sky-50 text-sky-700 border-sky-200",
    mini: "bg-green-50 text-green-700 border-green-200",
  };

  const activeCost = deployMode === "payg" ? paygCost : null;

  return (
    <div className="space-y-6">

      {/* ===== モデル選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">モデルを選択</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODELS.map((m) => {
            const isSelected = modelId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-sm"
                    : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tierBadgeClass[m.tier]}`}>
                    {tierLabel[m.tier]}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>入力: <span className="font-medium text-gray-700">${m.paygInputPer1M}/1M</span></div>
                  <div>出力: <span className="font-medium text-gray-700">${m.paygOutputPer1M}/1M</span></div>
                  <div>コンテキスト: <span className="text-gray-600">{m.contextWindow}</span></div>
                </div>
                {m.note && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">{m.note}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== リージョン選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">リージョンを選択</h2>
        <p className="text-xs text-gray-500 mb-4">
          Azure OpenAI Serviceの料金はリージョン間で一律です。データ主権・レイテンシ要件に応じて選択してください。
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {REGIONS.map((r) => {
            const isSelected = regionId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRegionId(r.id)}
                className={`px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm font-medium"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <div className="font-medium">{r.name}</div>
                {r.note && (
                  <div className={`text-xs mt-0.5 ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                    {r.note}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
          Japan East / Japan West を選択すると日本国内でデータが処理されます。
          データ所在地の規制がある場合は日本リージョンを推奨します。
        </p>
      </div>

      {/* ===== デプロイ方式 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">デプロイ方式</h2>
        <div className="flex gap-3 flex-wrap">
          {([
            {
              id: "payg" as DeployMode,
              label: "従量課金 (PAYG)",
              desc: "使った分だけ課金 / スモールスタート向け",
            },
            {
              id: "ptu" as DeployMode,
              label: "予約スループット (PTU)",
              desc: "固定月額 / 大量利用・低レイテンシ向け",
            },
          ]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setDeployMode(opt.id)}
              className={`flex flex-col px-5 py-3 rounded-xl border text-left transition-all ${
                deployMode === opt.id
                  ? "bg-blue-50 border-blue-400 text-blue-800 shadow-sm"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50/30 hover:border-blue-200"
              }`}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs opacity-75 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>

        {deployMode === "ptu" && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
            <div className="text-sm font-medium text-blue-900">PTU 設定</div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                PTU 数（最小: {model.ptuMin} PTU）
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={model.ptuMin}
                  max={10000}
                  step={model.ptuMin}
                  value={ptuCount}
                  onChange={(e) => setPtuCount(Number(e.target.value))}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={model.ptuMin}
                    max={10000}
                    step={model.ptuMin}
                    value={ptuCount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= model.ptuMin) setPtuCount(v);
                    }}
                    className="w-24 px-2 py-1 text-right border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                  <span className="text-sm text-gray-500">PTU</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>月額固定コスト: <span className="font-bold text-blue-900">{fmtUSD(ptuMonthlyCost)}</span> / <span className="font-bold">{fmtJPY(ptuMonthlyCost * exchangeRate)}</span></div>
              <div>PTU単価: ${model.ptuPricePerHourPer100}/時間/100PTU</div>
              <div className="text-gray-500">推定必要PTU数（現在のリクエスト量）: <span className="font-medium text-blue-700">≈ {estimatedPtu} PTU</span></div>
            </div>
          </div>
        )}
      </div>

      {/* ===== パラメーター設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">パラメーター設定</h2>
        <div className="space-y-5">
          <SliderInput
            label="入力トークン数（1リクエストあたり）"
            value={inputTokens}
            onChange={setInputTokens}
            min={100}
            max={128000}
            step={100}
            unit="tokens"
          />
          <SliderInput
            label="出力トークン数（1リクエストあたり）"
            value={outputTokens}
            onChange={setOutputTokens}
            min={100}
            max={16000}
            step={100}
            unit="tokens"
          />
          <SliderInput
            label="1日あたりのリクエスト数"
            value={requestsPerDay}
            onChange={setRequestsPerDay}
            min={1}
            max={100000}
            step={1}
            unit="回/日"
          />

          {/* 為替レート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">為替レート</label>
            <div className="flex items-center gap-2 w-fit">
              <span className="text-sm text-gray-500">1 USD =</span>
              <input
                type="number"
                min={50}
                max={300}
                step={1}
                value={exchangeRate}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v) && v > 0) setExchangeRate(v);
                }}
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 計算結果 (PAYG) ===== */}
      {deployMode === "payg" && activeCost && (
        <div className="rounded-2xl shadow-sm border border-blue-300 bg-gradient-to-br from-blue-50 to-sky-50 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-800">計算結果（従量課金）</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                {model.name}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-gray-600 border border-gray-200">
                {region.name}
              </span>
            </div>
          </div>

          {/* 1リクエストあたり */}
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-1">1リクエストあたり</div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-gray-900">{fmtUSD(activeCost.perRequest)}</span>
              <span className="text-xl text-gray-600">{fmtJPY(activeCost.perRequest * exchangeRate)}</span>
            </div>
          </div>

          {/* 日/月/年 */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "日額", usd: activeCost.perDay },
              { label: "月額", usd: activeCost.perMonth },
              { label: "年額", usd: activeCost.perYear },
            ].map(({ label, usd }) => (
              <div key={label} className="bg-white bg-opacity-70 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-lg font-bold text-gray-900">{fmtUSD(usd)}</div>
                <div className="text-xs text-gray-600 mt-0.5">{fmtJPY(usd * exchangeRate)}</div>
              </div>
            ))}
          </div>

          {/* コスト内訳 */}
          <div className="p-3 bg-white bg-opacity-50 rounded-xl text-xs text-gray-600 space-y-1.5">
            <div className="font-medium text-gray-700 mb-1.5">コスト内訳（1リクエスト）</div>
            <div className="flex justify-between">
              <span>入力 {fmtNum(inputTokens)} tokens × ${model.paygInputPer1M}/1M</span>
              <span className="font-medium ml-2 shrink-0">{fmtUSD(activeCost.inputCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>出力 {fmtNum(outputTokens)} tokens × ${model.paygOutputPer1M}/1M</span>
              <span className="font-medium ml-2 shrink-0">{fmtUSD(activeCost.outputCost)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
              <span>1日 {fmtNum(requestsPerDay)} リクエスト × {fmtUSD(activeCost.perRequest)}</span>
              <span className="font-medium ml-2 shrink-0">{fmtUSD(activeCost.perDay)}/日</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== 計算結果 (PTU) ===== */}
      {deployMode === "ptu" && (
        <div className="rounded-2xl shadow-sm border border-blue-300 bg-gradient-to-br from-blue-50 to-sky-50 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-800">計算結果（PTU）</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                {model.name}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-gray-600 border border-gray-200">
                {ptuCount} PTU
              </span>
            </div>
          </div>

          {/* 月額固定 */}
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-1">月額固定コスト</div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-gray-900">{fmtUSD(ptuMonthlyCost)}</span>
              <span className="text-xl text-gray-600">{fmtJPY(ptuMonthlyCost * exchangeRate)}</span>
            </div>
          </div>

          {/* 日/年 換算 */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "日額換算", usd: ptuMonthlyCost / 30 },
              { label: "月額", usd: ptuMonthlyCost },
              { label: "年額換算", usd: ptuMonthlyCost * 12 },
            ].map(({ label, usd }) => (
              <div key={label} className="bg-white bg-opacity-70 rounded-xl p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-lg font-bold text-gray-900">{fmtUSD(usd)}</div>
                <div className="text-xs text-gray-600 mt-0.5">{fmtJPY(usd * exchangeRate)}</div>
              </div>
            ))}
          </div>

          {/* PTU vs PAYG 損益分岐点 */}
          <div className="p-4 bg-white bg-opacity-60 rounded-xl space-y-2">
            <div className="text-sm font-medium text-gray-700">PTU vs PAYG 損益分岐点</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>PAYGでの同月額リクエスト数</span>
                <span className="font-semibold text-gray-900">{fmtNum(ptuBreakevenMonthlyRequests)} 回/月</span>
              </div>
              <div className="flex justify-between">
                <span>日換算</span>
                <span className="font-semibold text-gray-900">{fmtNum(Math.ceil(ptuBreakevenMonthlyRequests / 30))} 回/日</span>
              </div>
              {paygCost.perMonth > 0 && (
                <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium ${
                  paygCost.perMonth > ptuMonthlyCost
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {paygCost.perMonth > ptuMonthlyCost
                    ? `現在の利用量ではPTUが有利（月 ${fmtUSD(paygCost.perMonth - ptuMonthlyCost)} お得）`
                    : `現在の利用量ではPAYGが有利（月 ${fmtUSD(ptuMonthlyCost - paygCost.perMonth)} 高い）`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== OpenAI API との比較 ===== */}
      {openaiCost && (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">OpenAI API との比較</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Azure OpenAI（PAYG）と直接 OpenAI API のコスト差
              </p>
            </div>
            <button
              onClick={() => setShowOpenAiComparison((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showOpenAiComparison ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  showOpenAiComparison ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {showOpenAiComparison && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium"></th>
                      <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">1リクエスト</th>
                      <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">日額</th>
                      <th className="text-right py-2 text-xs text-gray-500 font-medium">月額</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50 bg-blue-50">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-blue-800 text-sm">Azure OpenAI (PAYG)</div>
                        <div className="text-xs text-blue-600">{region.name}</div>
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold text-gray-900">{fmtUSD(paygCost.perRequest)}</td>
                      <td className="py-3 pr-3 text-right text-gray-700">{fmtUSD(paygCost.perDay)}</td>
                      <td className="py-3 text-right text-gray-700">{fmtUSD(paygCost.perMonth)}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-700 text-sm">OpenAI API (直接)</div>
                        <div className="text-xs text-gray-400">api.openai.com</div>
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold text-gray-900">{fmtUSD(openaiCost.perRequest)}</td>
                      <td className="py-3 pr-3 text-right text-gray-700">{fmtUSD(openaiCost.perDay)}</td>
                      <td className="py-3 text-right text-gray-700">{fmtUSD(openaiCost.perMonth)}</td>
                    </tr>
                    {paygCost.perMonth !== openaiCost.perMonth && (
                      <tr>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-500 text-sm">差額（Azure − OpenAI）</div>
                        </td>
                        <td className="py-3 pr-3 text-right">
                          <span className={`font-semibold ${paygCost.perRequest > openaiCost.perRequest ? "text-red-600" : "text-green-600"}`}>
                            {paygCost.perRequest > openaiCost.perRequest ? "+" : ""}{fmtUSD(paygCost.perRequest - openaiCost.perRequest)}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-right">
                          <span className={`font-semibold ${paygCost.perDay > openaiCost.perDay ? "text-red-600" : "text-green-600"}`}>
                            {paygCost.perDay > openaiCost.perDay ? "+" : ""}{fmtUSD(paygCost.perDay - openaiCost.perDay)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`font-semibold ${paygCost.perMonth > openaiCost.perMonth ? "text-red-600" : "text-green-600"}`}>
                            {paygCost.perMonth > openaiCost.perMonth ? "+" : ""}{fmtUSD(paygCost.perMonth - openaiCost.perMonth)}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {paygCost.perMonth === openaiCost.perMonth && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {model.name} の Azure OpenAI と OpenAI API の料金は同等です
                </p>
              )}
              <div className="mt-3 text-xs text-gray-400 space-y-1">
                <p>Azure OpenAI の主なメリット: Microsoft Entra ID認証、VNet統合、コンプライアンス（ISO/SOC/GDPR）、SLA保証</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== 全モデル比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">全モデル比較（従量課金）</h2>
        <p className="text-xs text-gray-500 mb-4">
          入力 {fmtNum(inputTokens)} / 出力 {fmtNum(outputTokens)} tokens、{fmtNum(requestsPerDay)} 回/日
          — リージョン: {region.name}
        </p>

        {/* デスクトップ: テーブル */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">in/1M</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">out/1M</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">1リクエスト</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">日額</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">月額</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((m) => {
                const isSelected = m.id === modelId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-blue-50/40"
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? "text-blue-800" : "text-gray-700"}`}>
                          {m.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">
                            選択中
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{tierLabel[m.tier]}</div>
                    </td>
                    <td className="py-3 pr-3 text-right text-gray-600">${m.paygInputPer1M}</td>
                    <td className="py-3 pr-3 text-right text-gray-600">${m.paygOutputPer1M}</td>
                    <td className="py-3 pr-3 text-right font-semibold text-gray-900">{fmtUSD(m.cost.perRequest)}</td>
                    <td className="py-3 pr-3 text-right text-gray-700">{fmtUSD(m.cost.perDay)}</td>
                    <td className="py-3 text-right text-gray-700">{fmtUSD(m.cost.perMonth)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">行をクリックするとそのモデルに切り替わります</p>
        </div>

        {/* モバイル: カード形式 */}
        <div className="sm:hidden space-y-3">
          {comparisonData.map((m) => {
            const isSelected = m.id === modelId;
            return (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-50 border-blue-400 ring-1 ring-blue-300"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`font-semibold text-sm ${isSelected ? "text-blue-800" : "text-gray-800"}`}>
                      {m.name}
                    </span>
                    {isSelected && (
                      <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">
                        選択中
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{fmtUSD(m.cost.perRequest)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div>日: <span className="font-medium text-gray-700">{fmtUSD(m.cost.perDay)}</span></div>
                  <div>月: <span className="font-medium text-gray-700">{fmtUSD(m.cost.perMonth)}</span></div>
                  <div>in: <span className="font-medium text-gray-700">${m.paygInputPer1M}/1M</span></div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAzure OpenAI 料金計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Azure OpenAI Serviceの料金をリージョン・モデル・トークン数から試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAzure OpenAI 料金計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Azure OpenAI Serviceの料金をリージョン・モデル・トークン数から試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== フッター注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金は
        <a
          href="https://azure.microsoft.com/ja-jp/pricing/details/cognitive-services/openai-service/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-600 transition-colors"
        >
          Azure OpenAI Service公式ページ
        </a>
        をご確認ください。
      </p>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Azure OpenAI 料金計算",
  "description": "Azure OpenAI Serviceの料金をリージョン・モデル・トークン数から試算",
  "url": "https://tools.loresync.dev/azure-openai-cost",
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
