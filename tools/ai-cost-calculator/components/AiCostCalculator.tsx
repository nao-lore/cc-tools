"use client";

import { useMemo, useState } from "react";

type Provider = "OpenAI" | "Anthropic" | "Google";
type Mode = "standard" | "batch";

type ModelPrice = {
  id: string;
  provider: Provider;
  name: string;
  input: number;
  cached?: number | null;
  output: number;
  batchInput?: number;
  batchCached?: number | null;
  batchOutput?: number;
  note: string;
};

const SOURCE_DATE = "2026-05-11";
const DEFAULT_FX = 155;

const MODELS: ModelPrice[] = [
  { id: "gpt-5.5", provider: "OpenAI", name: "GPT-5.5", input: 5, cached: 0.5, output: 30, batchInput: 2.5, batchCached: 0.25, batchOutput: 15, note: "OpenAI flagship. 標準/Batch/cached inputに対応。" },
  { id: "gpt-5.4", provider: "OpenAI", name: "GPT-5.4", input: 2.5, cached: 0.25, output: 15, batchInput: 1.25, batchCached: 0.13, batchOutput: 7.5, note: "高性能とコストのバランスを取りやすい最新世代モデル。" },
  { id: "gpt-5.4-mini", provider: "OpenAI", name: "GPT-5.4 mini", input: 0.75, cached: 0.075, output: 4.5, batchInput: 0.375, batchCached: 0.0375, batchOutput: 2.25, note: "高頻度処理向けの小型モデル。" },
  { id: "gpt-5.4-nano", provider: "OpenAI", name: "GPT-5.4 nano", input: 0.2, cached: 0.02, output: 1.25, batchInput: 0.1, batchCached: 0.01, batchOutput: 0.625, note: "単純処理・大量処理向けの低単価モデル。" },
  { id: "claude-opus-4.7", provider: "Anthropic", name: "Claude Opus 4.7", input: 5, cached: 0.5, output: 25, batchInput: 2.5, batchCached: 0.25, batchOutput: 12.5, note: "Claude上位モデル。cache writeは別料金。" },
  { id: "claude-sonnet-4.6", provider: "Anthropic", name: "Claude Sonnet 4.6", input: 3, cached: 0.3, output: 15, batchInput: 1.5, batchCached: 0.15, batchOutput: 7.5, note: "複雑な推論・コーディング向け。" },
  { id: "claude-haiku-4.5", provider: "Anthropic", name: "Claude Haiku 4.5", input: 1, cached: 0.1, output: 5, batchInput: 0.5, batchCached: 0.05, batchOutput: 2.5, note: "Claude系の高速・低単価モデル。" },
  { id: "gemini-3.1-pro-preview", provider: "Google", name: "Gemini 3.1 Pro Preview", input: 2, cached: 0.2, output: 12, batchInput: 1, batchCached: 0.2, batchOutput: 6, note: "200k tokens以下の標準単価。" },
  { id: "gemini-2.5-pro", provider: "Google", name: "Gemini 2.5 Pro", input: 1.25, cached: 0.125, output: 10, batchInput: 0.625, batchCached: 0.125, batchOutput: 5, note: "長文・複雑タスク向け。" },
  { id: "gemini-2.5-flash", provider: "Google", name: "Gemini 2.5 Flash", input: 0.3, cached: 0.03, output: 2.5, batchInput: 0.15, batchCached: 0.03, batchOutput: 1.25, note: "価格性能重視の1M contextモデル。" },
  { id: "gemini-2.5-flash-lite", provider: "Google", name: "Gemini 2.5 Flash-Lite", input: 0.1, cached: 0.01, output: 0.4, batchInput: 0.05, batchCached: 0.01, batchOutput: 0.2, note: "高スループット・低単価。" },
];

const PRESETS = [
  { label: "チャットbot", input: 1200, cached: 0, output: 600, requests: 300 },
  { label: "RAG検索", input: 8000, cached: 5000, output: 900, requests: 800 },
  { label: "Coding agent", input: 45000, cached: 28000, output: 3500, requests: 80 },
  { label: "Batch要約", input: 120000, cached: 0, output: 2500, requests: 200 },
];

function providerTone(provider: Provider) {
  return {
    OpenAI: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Anthropic: "border-orange-200 bg-orange-50 text-orange-800",
    Google: "border-sky-200 bg-sky-50 text-sky-800",
  }[provider];
}

function dotTone(provider: Provider) {
  return { OpenAI: "bg-emerald-500", Anthropic: "bg-orange-500", Google: "bg-sky-500" }[provider];
}

function ratesFor(model: ModelPrice, mode: Mode) {
  if (mode === "batch") {
    return {
      input: model.batchInput ?? model.input * 0.5,
      cached: model.batchCached ?? model.cached ?? null,
      output: model.batchOutput ?? model.output * 0.5,
    };
  }
  return { input: model.input, cached: model.cached ?? null, output: model.output };
}

function calculate(model: ModelPrice, mode: Mode, inputTokens: number, cachedInputTokens: number, outputTokens: number, requestsPerDay: number) {
  const rates = ratesFor(model, mode);
  const cachedTokens = rates.cached === null ? 0 : Math.min(cachedInputTokens, inputTokens);
  const uncachedTokens = Math.max(0, inputTokens - cachedTokens);
  const inputCost = (uncachedTokens / 1_000_000) * rates.input;
  const cachedCost = rates.cached === null ? 0 : (cachedTokens / 1_000_000) * rates.cached;
  const outputCost = (outputTokens / 1_000_000) * rates.output;
  const perRequest = inputCost + cachedCost + outputCost;
  return {
    rates,
    cachedTokens,
    uncachedTokens,
    inputCost,
    cachedCost,
    outputCost,
    perRequest,
    perDay: perRequest * requestsPerDay,
    perMonth: perRequest * requestsPerDay * 30,
    perYear: perRequest * requestsPerDay * 365,
  };
}

function usd(value: number) {
  if (value < 0.0001) return `$${value.toFixed(6)}`;
  if (value < 0.01) return `$${value.toFixed(5)}`;
  if (value < 1) return `$${value.toFixed(4)}`;
  if (value < 1000) return `$${value.toFixed(2)}`;
  return `$${Math.round(value).toLocaleString()}`;
}

function jpy(value: number, fx: number) {
  const amount = value * fx;
  return amount < 1 ? `${amount.toFixed(2)}円` : `約${Math.round(amount).toLocaleString()}円`;
}

function compact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return value.toLocaleString();
}

function estimateTokens(text: string, language: "ja" | "en" | "code") {
  if (!text.trim()) return 0;
  if (language === "en") return Math.ceil(text.trim().split(/\s+/).length * 1.33);
  if (language === "code") return Math.ceil(text.length / 3.2);
  return Math.ceil(text.length / 1.5);
}

function validate(inputTokens: number, cachedInputTokens: number, outputTokens: number, requestsPerDay: number, fx: number) {
  if (inputTokens < 0 || inputTokens > 1_000_000) return "入力トークンは0〜1,000,000の範囲で指定してください。";
  if (cachedInputTokens < 0 || cachedInputTokens > inputTokens) return "cached input は入力トークン以下にしてください。";
  if (outputTokens < 0 || outputTokens > 200_000) return "出力トークンは0〜200,000の範囲で指定してください。";
  if (requestsPerDay < 1 || requestsPerDay > 1_000_000) return "リクエスト数は1〜1,000,000回/日の範囲で指定してください。";
  if (fx < 50 || fx > 300) return "為替レートは50〜300円/USDの範囲で指定してください。";
  return "";
}

export default function AiCostCalculator() {
  const [modelId, setModelId] = useState("gpt-5.4");
  const [mode, setMode] = useState<Mode>("standard");
  const [provider, setProvider] = useState<Provider | "All">("All");
  const [inputTokens, setInputTokens] = useState(8000);
  const [cachedInputTokens, setCachedInputTokens] = useState(3000);
  const [outputTokens, setOutputTokens] = useState(1200);
  const [requestsPerDay, setRequestsPerDay] = useState(500);
  const [fx, setFx] = useState(DEFAULT_FX);
  const [sampleText, setSampleText] = useState("");
  const [sampleLanguage, setSampleLanguage] = useState<"ja" | "en" | "code">("ja");
  const [copied, setCopied] = useState(false);

  const selected = MODELS.find((model) => model.id === modelId) ?? MODELS[0];
  const error = validate(inputTokens, cachedInputTokens, outputTokens, requestsPerDay, fx);
  const selectedCost = useMemo(
    () => calculate(selected, mode, inputTokens, cachedInputTokens, outputTokens, requestsPerDay),
    [cachedInputTokens, inputTokens, mode, outputTokens, requestsPerDay, selected],
  );
  const visibleModels = useMemo(() => MODELS.filter((model) => provider === "All" || model.provider === provider), [provider]);
  const comparisons = useMemo(
    () =>
      visibleModels
        .map((model) => ({ model, cost: calculate(model, mode, inputTokens, cachedInputTokens, outputTokens, requestsPerDay) }))
        .sort((a, b) => a.cost.perMonth - b.cost.perMonth),
    [cachedInputTokens, inputTokens, mode, outputTokens, requestsPerDay, visibleModels],
  );
  const cheapest = comparisons[0];
  const estimatedTokens = estimateTokens(sampleText, sampleLanguage);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setInputTokens(preset.input);
    setCachedInputTokens(preset.cached);
    setOutputTokens(preset.output);
    setRequestsPerDay(preset.requests);
    setCopied(false);
  }

  function reset() {
    setModelId("gpt-5.4");
    setMode("standard");
    setProvider("All");
    setInputTokens(8000);
    setCachedInputTokens(3000);
    setOutputTokens(1200);
    setRequestsPerDay(500);
    setFx(DEFAULT_FX);
    setSampleText("");
    setSampleLanguage("ja");
    setCopied(false);
  }

  async function copySummary() {
    const lines = [
      "AI API コスト計算",
      `料金確認日: ${SOURCE_DATE}`,
      `モデル: ${selected.provider} / ${selected.name}`,
      `モード: ${mode}`,
      `入力: ${inputTokens.toLocaleString()} tokens`,
      `cached input: ${selectedCost.cachedTokens.toLocaleString()} tokens`,
      `出力: ${outputTokens.toLocaleString()} tokens`,
      `リクエスト: ${requestsPerDay.toLocaleString()}回/日`,
      `1リクエスト: ${usd(selectedCost.perRequest)} (${jpy(selectedCost.perRequest, fx)})`,
      `月額: ${usd(selectedCost.perMonth)} (${jpy(selectedCost.perMonth, fx)})`,
      `最安候補: ${cheapest.model.provider} / ${cheapest.model.name} ${usd(cheapest.cost.perMonth)}/月`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="space-y-6">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">利用条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">入力・cached input・出力トークンとリクエスト数からAPI費用を概算します。</p>
            </div>
            <button type="button" onClick={reset} className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              リセット
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <NumberField label="入力トークン/回" value={inputTokens} min={0} max={1_000_000} step={500} onChange={setInputTokens} suffix="tokens" />
            <NumberField label="cached input/回" value={cachedInputTokens} min={0} max={1_000_000} step={500} onChange={setCachedInputTokens} suffix="tokens" />
            <NumberField label="出力トークン/回" value={outputTokens} min={0} max={200_000} step={100} onChange={setOutputTokens} suffix="tokens" />
            <NumberField label="リクエスト数" value={requestsPerDay} min={1} max={1_000_000} step={10} onChange={setRequestsPerDay} suffix="回/日" />
            <NumberField label="為替レート" value={fx} min={50} max={300} step={1} onChange={setFx} suffix="円/USD" />
          </div>

          <div className="mt-5 grid gap-4">
            <Segmented label="課金モード" value={mode} options={[{ value: "standard", label: "Standard" }, { value: "batch", label: "Batch" }]} onChange={setMode} />
            <Segmented
              label="比較プロバイダー"
              value={provider}
              options={[
                { value: "All", label: "すべて" },
                { value: "OpenAI", label: "OpenAI" },
                { value: "Anthropic", label: "Claude" },
                { value: "Google", label: "Gemini" },
              ]}
              onChange={setProvider}
            />
          </div>

          <p className={`mt-4 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || `計算はブラウザ上で完結し、入力情報は外部に送信されません。料金確認日: ${SOURCE_DATE}`}
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50">
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-sm font-medium text-slate-300">選択モデルの月額概算</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-4xl font-bold tracking-tight">{usd(selectedCost.perMonth)}</p>
              <p className="mt-1 text-sm text-slate-300">{jpy(selectedCost.perMonth, fx)} / 月</p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-sm font-semibold ${providerTone(selected.provider)}`}>{selected.provider}</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label="1リクエスト" value={usd(selectedCost.perRequest)} />
            <Metric label="1日" value={usd(selectedCost.perDay)} />
            <Metric label="年額" value={usd(selectedCost.perYear)} />
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            <div className="font-semibold text-white">{selected.name}</div>
            <p className="mt-1">{selected.note}</p>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
              <span>Input ${selectedCost.rates.input}/1M</span>
              <span>Cached {selectedCost.rates.cached === null ? "なし" : `$${selectedCost.rates.cached}/1M`}</span>
              <span>Output ${selectedCost.rates.output}/1M</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copySummary} disabled={Boolean(error)} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50">
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <a href="https://platform.openai.com/docs/pricing" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              公式料金を確認
            </a>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">モデル比較</h2>
        <p className="mt-1 text-sm text-slate-500">現在の条件で月額が安い順に並べています。Batchは各社の公開割引を反映した概算です。</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {comparisons.map(({ model, cost }, index) => (
            <button key={model.id} type="button" onClick={() => setModelId(model.id)} className={`rounded-xl border p-4 text-left transition ${model.id === selected.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotTone(model.provider)}`} />
                    <span className="font-semibold">{model.name}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${providerTone(model.provider)}`}>{model.provider}</span>
                    {index === 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">最安候補</span>}
                  </div>
                  <p className={`mt-1 text-sm ${model.id === selected.id ? "text-slate-300" : "text-slate-500"}`}>{model.note}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-mono text-lg font-bold">{usd(cost.perMonth)}</div>
                  <div className={`text-xs ${model.id === selected.id ? "text-slate-300" : "text-slate-500"}`}>{usd(cost.perRequest)}/req</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">テキストからトークン概算</h2>
          <p className="mt-1 text-sm text-slate-500">正確なtoken countは各社SDKやAPIで確認してください。ここでは見積もり用に粗く換算します。</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Segmented label="換算タイプ" value={sampleLanguage} options={[{ value: "ja", label: "日本語" }, { value: "en", label: "English" }, { value: "code", label: "Code" }]} onChange={setSampleLanguage} compact />
          </div>
          <textarea value={sampleText} onChange={(event) => setSampleText(event.target.value)} placeholder="ここにプロンプト例を貼り付け" className="mt-4 h-36 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-600">推定: <strong className="font-mono text-slate-950">{estimatedTokens.toLocaleString()}</strong> tokens</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setInputTokens(estimatedTokens)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">入力に反映</button>
              <button type="button" onClick={() => setOutputTokens(estimatedTokens)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">出力に反映</button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">内訳</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Breakdown label={`通常入力 ${compact(selectedCost.uncachedTokens)}`} value={usd(selectedCost.inputCost)} />
            <Breakdown label={`cached input ${compact(selectedCost.cachedTokens)}`} value={usd(selectedCost.cachedCost)} />
            <Breakdown label={`出力 ${compact(outputTokens)}`} value={usd(selectedCost.outputCost)} />
            <Breakdown label={`${requestsPerDay.toLocaleString()}回/日 x 30日`} value={usd(selectedCost.perMonth)} strong />
          </div>
        </div>
      </section>
    </section>
  );
}

function NumberField({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2 flex min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-950">
        <input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value) || 0)))} className="w-0 min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none" />
        <span className="flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function Segmented<T extends string>({ label, value, options, onChange, compact: isCompact = false }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; compact?: boolean }) {
  return (
    <div className={isCompact ? "w-full" : ""}>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className={`mt-2 grid gap-2 ${options.length > 3 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        {options.map((option) => (
          <button key={option.value} type="button" onClick={() => onChange(option.value)} className={`rounded-xl border px-3 py-2 text-sm font-medium ${value === option.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function Breakdown({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${strong ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}>
      <span>{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
