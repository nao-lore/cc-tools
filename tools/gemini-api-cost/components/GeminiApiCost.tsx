"use client";

import { useMemo, useState } from "react";

type ServiceMode = "standard" | "batch" | "priority";

type GeminiModel = {
  id: string;
  name: string;
  tier: string;
  input: number;
  output: number;
  cache: number;
  storagePerHour: number;
  longInput?: number;
  longOutput?: number;
  longCache?: number;
  longThreshold?: number;
  note: string;
};

const MODELS: GeminiModel[] = [
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    tier: "flagship",
    input: 3.6,
    output: 21.6,
    cache: 0.36,
    storagePerHour: 8.1,
    longInput: 7.2,
    longOutput: 32.4,
    longCache: 0.72,
    longThreshold: 200000,
    note: "高性能なGemini 3.1系。200K tokensを超えるpromptでは高い単価を使います。",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash-Lite Preview",
    tier: "efficient preview",
    input: 0.25,
    output: 1.5,
    cache: 0.025,
    storagePerHour: 1,
    note: "3.1系の低コストpreview。大量処理や軽量分類の比較用です。",
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash Preview",
    tier: "fast preview",
    input: 0.5,
    output: 3,
    cache: 0.05,
    storagePerHour: 1,
    note: "Gemini 3系の高速preview。Search/Maps groundingの新料金体系にも対応します。",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tier: "pro",
    input: 1.25,
    output: 10,
    cache: 0.125,
    storagePerHour: 4.5,
    longInput: 2.5,
    longOutput: 15,
    longCache: 0.25,
    longThreshold: 200000,
    note: "2.5 Proは200K tokensを境に入力・出力・cache単価が変わります。",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tier: "hybrid reasoning",
    input: 0.3,
    output: 2.5,
    cache: 0.03,
    storagePerHour: 1,
    note: "1M contextのhybrid reasoningモデル。速度と品質のバランス用途向けです。",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    tier: "lowest cost",
    input: 0.1,
    output: 0.4,
    cache: 0.01,
    storagePerHour: 1,
    note: "大量の分類・抽出・定型処理向けの最小コストモデルです。",
  },
];

const EXAMPLES = [
  { label: "RAG検索", modelId: "gemini-3-flash", requests: "300000", input: "2500", cache: "1800", output: "350", storage: "0", search: "8000", maps: "0" },
  { label: "大量分類", modelId: "gemini-2.5-flash-lite", requests: "1000000", input: "300", cache: "0", output: "80", storage: "0", search: "0", maps: "0", batch: true },
  { label: "長文分析", modelId: "gemini-2.5-pro", requests: "50000", input: "220000", cache: "120000", output: "2500", storage: "12", search: "0", maps: "0" },
  { label: "Pro深掘り", modelId: "gemini-3.1-pro", requests: "10000", input: "60000", cache: "20000", output: "3000", storage: "6", search: "2000", maps: "0" },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeNumber(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function formatUsd(value: number) {
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 100) return `$${value.toFixed(2)}`;
  return `$${formatNumber(value, 2)}`;
}

function formatJpy(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

type CostResult = {
  requests: number;
  inputTokens: number;
  cacheTokens: number;
  outputTokens: number;
  inputUsd: number;
  cacheUsd: number;
  outputUsd: number;
  storageUsd: number;
  searchUsd: number;
  mapsUsd: number;
  totalUsd: number;
  totalJpy: number;
  perRequestUsd: number;
  perThousandRequestsUsd: number;
  modeMultiplier: number;
  longPricing: boolean;
};

function modeMultiplier(mode: ServiceMode) {
  if (mode === "batch") return 0.5;
  if (mode === "priority") return 1.8;
  return 1;
}

function buildCopyText(result: CostResult, model: GeminiModel) {
  return [
    "Gemini API 料金概算",
    `モデル: ${model.name}`,
    `月間リクエスト: ${formatNumber(result.requests)}回`,
    `入力: ${formatNumber(result.inputTokens)} tokens`,
    `cache: ${formatNumber(result.cacheTokens)} tokens`,
    `出力: ${formatNumber(result.outputTokens)} tokens`,
    `月額: ${formatUsd(result.totalUsd)} / ${formatJpy(result.totalJpy)}`,
    "前提: Google AI公式Pricing、税・無料枠・プロジェクト別上限は別",
  ].join("\n");
}

function NumberField({
  id,
  label,
  value,
  suffix,
  onChange,
  help,
}: {
  id: string;
  label: string;
  value: string;
  suffix: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-600">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(sanitizeNumber(event.target.value))}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
      {help && <p className="mt-1 text-xs leading-5 text-slate-500">{help}</p>}
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{value}</p>
      {note && <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  );
}

export default function GeminiApiCost() {
  const [modelId, setModelId] = useState("gemini-3-flash");
  const [mode, setMode] = useState<ServiceMode>("standard");
  const [requests, setRequests] = useState("300000");
  const [inputTokens, setInputTokens] = useState("2500");
  const [cacheTokens, setCacheTokens] = useState("1800");
  const [outputTokens, setOutputTokens] = useState("350");
  const [storageHours, setStorageHours] = useState("0");
  const [searchQueries, setSearchQueries] = useState("0");
  const [mapsQueries, setMapsQueries] = useState("0");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [copied, setCopied] = useState(false);

  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[2];

  const result = useMemo<CostResult>(() => {
    const requestCount = Math.max(0, parseNumber(requests));
    const inputPerRequest = Math.max(0, parseNumber(inputTokens));
    const cachePerRequest = Math.max(0, parseNumber(cacheTokens));
    const outputPerRequest = Math.max(0, parseNumber(outputTokens));
    const longPricing = Boolean(model.longThreshold && inputPerRequest > model.longThreshold);
    const inputRate = longPricing ? model.longInput ?? model.input : model.input;
    const outputRate = longPricing ? model.longOutput ?? model.output : model.output;
    const cacheRate = longPricing ? model.longCache ?? model.cache : model.cache;
    const multiplier = modeMultiplier(mode);

    const totalInputTokens = inputPerRequest * requestCount;
    const totalCacheTokens = cachePerRequest * requestCount;
    const totalOutputTokens = outputPerRequest * requestCount;
    const inputUsd = (totalInputTokens / 1_000_000) * inputRate * multiplier;
    const cacheUsd = (totalCacheTokens / 1_000_000) * cacheRate * multiplier;
    const outputUsd = (totalOutputTokens / 1_000_000) * outputRate * multiplier;
    const storageUsd = (totalCacheTokens / 1_000_000) * model.storagePerHour * Math.max(0, parseNumber(storageHours));
    const paidSearch = Math.max(0, parseNumber(searchQueries) - 5000);
    const paidMaps = Math.max(0, parseNumber(mapsQueries) - 5000);
    const searchUsd = (paidSearch / 1000) * 14;
    const mapsUsd = (paidMaps / 1000) * 14;
    const totalUsd = inputUsd + cacheUsd + outputUsd + storageUsd + searchUsd + mapsUsd;

    return {
      requests: requestCount,
      inputTokens: totalInputTokens,
      cacheTokens: totalCacheTokens,
      outputTokens: totalOutputTokens,
      inputUsd,
      cacheUsd,
      outputUsd,
      storageUsd,
      searchUsd,
      mapsUsd,
      totalUsd,
      totalJpy: totalUsd * Math.max(0, parseNumber(exchangeRate)),
      perRequestUsd: requestCount ? totalUsd / requestCount : 0,
      perThousandRequestsUsd: requestCount ? (totalUsd / requestCount) * 1000 : 0,
      modeMultiplier: multiplier,
      longPricing,
    };
  }, [cacheTokens, exchangeRate, inputTokens, mapsQueries, mode, model, outputTokens, requests, searchQueries, storageHours]);

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setModelId(example.modelId);
    setRequests(example.requests);
    setInputTokens(example.input);
    setCacheTokens(example.cache);
    setOutputTokens(example.output);
    setStorageHours(example.storage);
    setSearchQueries(example.search);
    setMapsQueries(example.maps);
    setMode(example.batch ? "batch" : "standard");
    setCopied(false);
  }

  function reset() {
    setModelId("gemini-3-flash");
    setMode("standard");
    setRequests("300000");
    setInputTokens("2500");
    setCacheTokens("1800");
    setOutputTokens("350");
    setStorageHours("0");
    setSearchQueries("0");
    setMapsQueries("0");
    setExchangeRate("155");
    setCopied(false);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(buildCopyText(result, model));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">月間利用量</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">入力、context cache、出力、Groundingを分けて見積もります。</p>
            </div>
            <button type="button" onClick={reset} className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5">
            <label htmlFor="gemini-model" className="text-sm font-semibold text-slate-800">
              モデル
            </label>
            <select
              id="gemini-model"
              value={modelId}
              onChange={(event) => {
                setModelId(event.target.value);
                setCopied(false);
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
            >
              {MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(["standard", "batch", "priority"] as ServiceMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${mode === item ? "border-blue-500 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField id="gemini-requests" label="月間リクエスト数" value={requests} suffix="回" onChange={setRequests} />
            <NumberField id="gemini-rate" label="為替レート" value={exchangeRate} suffix="円/USD" onChange={setExchangeRate} />
            <NumberField id="gemini-input" label="入力" value={inputTokens} suffix="tokens/回" onChange={setInputTokens} />
            <NumberField id="gemini-output" label="出力" value={outputTokens} suffix="tokens/回" onChange={setOutputTokens} />
            <NumberField id="gemini-cache" label="Context cache" value={cacheTokens} suffix="tokens/回" onChange={setCacheTokens} help="再利用する文脈。別途storage時間も設定できます。" />
            <NumberField id="gemini-storage" label="Cache storage" value={storageHours} suffix="時間/月" onChange={setStorageHours} help="cache tokensの保持時間を月間合計で入力します。" />
            <NumberField id="gemini-search" label="Google Search Grounding" value={searchQueries} suffix="queries/月" onChange={setSearchQueries} help="Gemini 3系は5,000/月無料、その後$14/1Kで概算します。" />
            <NumberField id="gemini-maps" label="Google Maps Grounding" value={mapsQueries} suffix="queries/月" onChange={setMapsQueries} />
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button key={example.label} type="button" onClick={() => applyExample(example)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-blue-600 hover:bg-blue-50">
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{model.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{model.note}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">${model.input} / 1M input</span>
              <span className="rounded-full bg-white px-3 py-1">${model.output} / 1M output</span>
              <span className="rounded-full bg-white px-3 py-1">${model.cache} / 1M cache</span>
              {result.longPricing && <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">long-context pricing</span>}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">見積もり</h2>
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-medium text-blue-900">推定月額</p>
            <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-blue-950">{formatUsd(result.totalUsd)}</p>
            <p className="mt-2 text-sm text-blue-900">約 {formatJpy(result.totalJpy)} / 1 USD = {formatNumber(parseNumber(exchangeRate), 2)}円</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="入力" value={formatUsd(result.inputUsd)} note={`${formatNumber(result.inputTokens)} tokens`} />
            <StatCard label="Context cache" value={formatUsd(result.cacheUsd)} note={`${formatNumber(result.cacheTokens)} tokens`} />
            <StatCard label="出力" value={formatUsd(result.outputUsd)} note={`${formatNumber(result.outputTokens)} tokens`} />
            <StatCard label="Cache storage" value={formatUsd(result.storageUsd)} note={`${formatNumber(parseNumber(storageHours), 2)} hours`} />
            <StatCard label="Grounding" value={formatUsd(result.searchUsd + result.mapsUsd)} note="Search / Maps" />
            <StatCard label="1,000回あたり" value={formatUsd(result.perThousandRequestsUsd)} note={`${formatUsd(result.perRequestUsd)} / request`} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Service mode: {mode} / token multiplier: {result.modeMultiplier.toFixed(2)}x / Search・Mapsは無料枠超過分だけを概算しています。
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              入力をクリア
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
