"use client";

import { useMemo, useState } from "react";

type ClaudeModel = {
  id: string;
  name: string;
  tier: string;
  baseInput: number;
  cacheWrite5m: number;
  cacheWrite1h: number;
  cacheHit: number;
  output: number;
  context: string;
  note: string;
};

const MODELS: ClaudeModel[] = [
  {
    id: "opus-4.7",
    name: "Claude Opus 4.7",
    tier: "highest capability",
    baseInput: 5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10,
    cacheHit: 0.5,
    output: 25,
    context: "1M context",
    note: "Anthropicの最上位モデル。長時間の推論、複雑な実装、深いレビュー向け。",
  },
  {
    id: "opus-4.6",
    name: "Claude Opus 4.6",
    tier: "highest capability",
    baseInput: 5,
    cacheWrite5m: 6.25,
    cacheWrite1h: 10,
    cacheHit: 0.5,
    output: 25,
    context: "1M context",
    note: "Opus系の高品質処理。Fast modeやdata residencyの影響も見積もり前に確認してください。",
  },
  {
    id: "sonnet-4.6",
    name: "Claude Sonnet 4.6",
    tier: "balanced",
    baseInput: 3,
    cacheWrite5m: 3.75,
    cacheWrite1h: 6,
    cacheHit: 0.3,
    output: 15,
    context: "1M context",
    note: "コーディング、エージェント、一般業務での第一候補。品質とコストのバランスが良いモデルです。",
  },
  {
    id: "haiku-4.5",
    name: "Claude Haiku 4.5",
    tier: "fast",
    baseInput: 1,
    cacheWrite5m: 1.25,
    cacheWrite1h: 2,
    cacheHit: 0.1,
    output: 5,
    context: "200K+",
    note: "分類、抽出、軽量チャットなど大量処理のコスト試算向けです。",
  },
  {
    id: "haiku-3.5",
    name: "Claude Haiku 3.5",
    tier: "legacy fast",
    baseInput: 0.8,
    cacheWrite5m: 1,
    cacheWrite1h: 1.6,
    cacheHit: 0.08,
    output: 4,
    context: "200K",
    note: "既存運用との比較用。新規設計ではHaiku 4.5との比較を推奨します。",
  },
];

const EXAMPLES = [
  {
    label: "コードエージェント",
    modelId: "sonnet-4.6",
    requests: "100000",
    baseInput: "2200",
    cacheWrite: "300",
    cacheHit: "2500",
    output: "900",
    webSearches: "0",
  },
  {
    label: "サポートBot",
    modelId: "haiku-4.5",
    requests: "500000",
    baseInput: "900",
    cacheWrite: "0",
    cacheHit: "1200",
    output: "250",
    webSearches: "0",
  },
  {
    label: "Batch分類",
    modelId: "haiku-4.5",
    requests: "1000000",
    baseInput: "500",
    cacheWrite: "0",
    cacheHit: "0",
    output: "80",
    webSearches: "0",
    batch: true,
  },
  {
    label: "深いレビュー",
    modelId: "opus-4.7",
    requests: "10000",
    baseInput: "12000",
    cacheWrite: "2000",
    cacheHit: "6000",
    output: "2500",
    webSearches: "1000",
  },
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
  baseInputTokens: number;
  cacheWriteTokens: number;
  cacheHitTokens: number;
  outputTokens: number;
  baseInputUsd: number;
  cacheWriteUsd: number;
  cacheHitUsd: number;
  outputUsd: number;
  webSearchUsd: number;
  totalUsd: number;
  totalJpy: number;
  perRequestUsd: number;
  perThousandRequestsUsd: number;
  multiplier: number;
};

function buildCopyText(result: CostResult, model: ClaudeModel) {
  return [
    "Claude API 料金概算",
    `モデル: ${model.name}`,
    `月間リクエスト: ${formatNumber(result.requests)}回`,
    `通常入力: ${formatNumber(result.baseInputTokens)} tokens`,
    `キャッシュ書き込み: ${formatNumber(result.cacheWriteTokens)} tokens`,
    `キャッシュヒット: ${formatNumber(result.cacheHitTokens)} tokens`,
    `出力: ${formatNumber(result.outputTokens)} tokens`,
    `月額: ${formatUsd(result.totalUsd)} / ${formatJpy(result.totalJpy)}`,
    "前提: Anthropic公式価格、税・Volume discount・サードパーティ平台料金は別",
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
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-amber-600">
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

export default function ClaudeApiCost() {
  const [modelId, setModelId] = useState("sonnet-4.6");
  const [requests, setRequests] = useState("100000");
  const [baseInput, setBaseInput] = useState("2200");
  const [cacheWrite, setCacheWrite] = useState("300");
  const [cacheHit, setCacheHit] = useState("2500");
  const [output, setOutput] = useState("900");
  const [webSearches, setWebSearches] = useState("0");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [batch, setBatch] = useState(false);
  const [usResidency, setUsResidency] = useState(false);
  const [copied, setCopied] = useState(false);

  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[2];

  const result = useMemo<CostResult>(() => {
    const requestCount = Math.max(0, parseNumber(requests));
    const baseInputTokens = requestCount * Math.max(0, parseNumber(baseInput));
    const cacheWriteTokens = requestCount * Math.max(0, parseNumber(cacheWrite));
    const cacheHitTokens = requestCount * Math.max(0, parseNumber(cacheHit));
    const outputTokens = requestCount * Math.max(0, parseNumber(output));
    const batchMultiplier = batch ? 0.5 : 1;
    const residencyMultiplier = usResidency ? 1.1 : 1;
    const multiplier = batchMultiplier * residencyMultiplier;

    const baseInputUsd = (baseInputTokens / 1_000_000) * model.baseInput * multiplier;
    const cacheWriteUsd = (cacheWriteTokens / 1_000_000) * model.cacheWrite5m * multiplier;
    const cacheHitUsd = (cacheHitTokens / 1_000_000) * model.cacheHit * multiplier;
    const outputUsd = (outputTokens / 1_000_000) * model.output * multiplier;
    const webSearchUsd = (Math.max(0, parseNumber(webSearches)) / 1000) * 10;
    const totalUsd = baseInputUsd + cacheWriteUsd + cacheHitUsd + outputUsd + webSearchUsd;

    return {
      requests: requestCount,
      baseInputTokens,
      cacheWriteTokens,
      cacheHitTokens,
      outputTokens,
      baseInputUsd,
      cacheWriteUsd,
      cacheHitUsd,
      outputUsd,
      webSearchUsd,
      totalUsd,
      totalJpy: totalUsd * Math.max(0, parseNumber(exchangeRate)),
      perRequestUsd: requestCount ? totalUsd / requestCount : 0,
      perThousandRequestsUsd: requestCount ? (totalUsd / requestCount) * 1000 : 0,
      multiplier,
    };
  }, [baseInput, batch, cacheHit, cacheWrite, exchangeRate, model, output, requests, usResidency, webSearches]);

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setModelId(example.modelId);
    setRequests(example.requests);
    setBaseInput(example.baseInput);
    setCacheWrite(example.cacheWrite);
    setCacheHit(example.cacheHit);
    setOutput(example.output);
    setWebSearches(example.webSearches);
    setBatch(Boolean(example.batch));
    setUsResidency(false);
    setCopied(false);
  }

  function reset() {
    setModelId("sonnet-4.6");
    setRequests("100000");
    setBaseInput("2200");
    setCacheWrite("300");
    setCacheHit("2500");
    setOutput("900");
    setWebSearches("0");
    setExchangeRate("155");
    setBatch(false);
    setUsResidency(false);
    setCopied(false);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(buildCopyText(result, model));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const warning = result.totalUsd > 1000
    ? "月額が大きいので、Claude ConsoleのUsage、予算上限、レート制限を必ず併用してください。"
    : "Prompt cachingはキャッシュ境界や再利用条件で効き方が変わります。実測値で調整してください。";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">月間利用量</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">通常入力、キャッシュ、出力、Web searchを分けて見積もります。</p>
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
            <label htmlFor="claude-model" className="text-sm font-semibold text-slate-800">
              モデル
            </label>
            <select
              id="claude-model"
              value={modelId}
              onChange={(event) => {
                setModelId(event.target.value);
                setCopied(false);
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-amber-600"
            >
              {MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField id="claude-requests" label="月間リクエスト数" value={requests} suffix="回" onChange={setRequests} />
            <NumberField id="claude-rate" label="為替レート" value={exchangeRate} suffix="円/USD" onChange={setExchangeRate} />
            <NumberField id="claude-base-input" label="通常入力" value={baseInput} suffix="tokens/回" onChange={setBaseInput} help="毎回処理されるsystem prompt、会話履歴、ツール定義など。" />
            <NumberField id="claude-output" label="出力" value={output} suffix="tokens/回" onChange={setOutput} help="回答本文、tool_use、JSONなどの出力平均。" />
            <NumberField id="claude-cache-write" label="キャッシュ書き込み" value={cacheWrite} suffix="tokens/回" onChange={setCacheWrite} help="5分キャッシュ書き込み単価で概算します。" />
            <NumberField id="claude-cache-hit" label="キャッシュヒット" value={cacheHit} suffix="tokens/回" onChange={setCacheHit} help="再利用される長いコンテキストや固定プロンプト。" />
            <div className="sm:col-span-2">
              <NumberField id="claude-web-search" label="Web search" value={webSearches} suffix="回/月" onChange={setWebSearches} help="Claude APIのWeb searchは1,000 searchesあたり$10で概算します。" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <input type="checkbox" checked={batch} onChange={(event) => setBatch(event.target.checked)} className="mt-1" />
              <span>
                <span className="block font-semibold text-slate-900">Batch API割引</span>
                <span className="mt-1 block text-slate-600">入力・出力・キャッシュ系を50%割引で概算します。</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <input type="checkbox" checked={usResidency} onChange={(event) => setUsResidency(event.target.checked)} className="mt-1" />
              <span>
                <span className="block font-semibold text-slate-900">US-only inference</span>
                <span className="mt-1 block text-slate-600">data residencyの1.1倍を反映します。</span>
              </span>
            </label>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-amber-600 hover:bg-amber-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{model.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{model.note}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">${model.baseInput} / MTok input</span>
              <span className="rounded-full bg-white px-3 py-1">${model.cacheHit} / MTok cache hit</span>
              <span className="rounded-full bg-white px-3 py-1">${model.output} / MTok output</span>
              <span className="rounded-full bg-white px-3 py-1">{model.context}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">見積もり</h2>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-900">推定月額</p>
            <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-amber-950">{formatUsd(result.totalUsd)}</p>
            <p className="mt-2 text-sm text-amber-900">約 {formatJpy(result.totalJpy)} / 1 USD = {formatNumber(parseNumber(exchangeRate), 2)}円</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="通常入力" value={formatUsd(result.baseInputUsd)} note={`${formatNumber(result.baseInputTokens)} tokens`} />
            <StatCard label="キャッシュ書き込み" value={formatUsd(result.cacheWriteUsd)} note={`${formatNumber(result.cacheWriteTokens)} tokens`} />
            <StatCard label="キャッシュヒット" value={formatUsd(result.cacheHitUsd)} note={`${formatNumber(result.cacheHitTokens)} tokens`} />
            <StatCard label="出力" value={formatUsd(result.outputUsd)} note={`${formatNumber(result.outputTokens)} tokens`} />
            <StatCard label="Web search" value={formatUsd(result.webSearchUsd)} note={`${formatNumber(parseNumber(webSearches))} searches/月`} />
            <StatCard label="1,000回あたり" value={formatUsd(result.perThousandRequestsUsd)} note={`${formatUsd(result.perRequestUsd)} / request`} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-950">適用倍率</p>
            <p className="mt-1">
              Batch: {batch ? "0.5x" : "なし"} / Data residency: {usResidency ? "1.1x" : "なし"} / 合成倍率: {result.multiplier.toFixed(2)}x
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{warning}</div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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
