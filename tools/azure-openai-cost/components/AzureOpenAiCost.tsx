"use client";

import { useMemo, useState } from "react";

type ModelPrice = {
  id: string;
  name: string;
  family: string;
  inputPer1M: number;
  cachedInputPer1M: number;
  outputPer1M: number;
  context: string;
  note: string;
  checked: string;
};

const MODEL_PRICES: ModelPrice[] = [
  {
    id: "gpt-5",
    name: "GPT-5 2025-08-07 Global",
    family: "GPT-5",
    inputPer1M: 1.25,
    cachedInputPer1M: 0.125,
    outputPer1M: 10,
    context: "Azure公式価格ページ掲載モデル",
    note: "標準的な汎用・推論ワークロード向け。公開価格ページのGlobal Standard単価を初期値にしています。",
    checked: "2026-05-11",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1 2025-04-14 Global",
    family: "GPT-4.1",
    inputPer1M: 2,
    cachedInputPer1M: 0.5,
    outputPer1M: 8,
    context: "1M context",
    note: "長いコンテキスト、エージェント、コード/文書処理の比較用に残しています。",
    checked: "2026-05-11",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 mini 2025-04-14 Global",
    family: "GPT-4.1 mini",
    inputPer1M: 0.4,
    cachedInputPer1M: 0.1,
    outputPer1M: 1.6,
    context: "1M context",
    note: "低コストな長文処理や軽量エージェントの概算に向いています。",
    checked: "2026-05-11",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o 2024-1120 Global",
    family: "GPT-4o",
    inputPer1M: 2.5,
    cachedInputPer1M: 1.25,
    outputPer1M: 10,
    context: "128K context",
    note: "既存のGPT-4o運用と新モデル移行の比較用です。",
    checked: "2026-05-11",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini 0718 Global",
    family: "GPT-4o mini",
    inputPer1M: 0.15,
    cachedInputPer1M: 0.075,
    outputPer1M: 0.6,
    context: "128K context",
    note: "チャットボット、分類、軽量抽出など大量リクエストの試算向けです。",
    checked: "2026-05-11",
  },
  {
    id: "o4-mini",
    name: "o4-mini 2025-04-16 Global",
    family: "o4-mini",
    inputPer1M: 1.1,
    cachedInputPer1M: 0.275,
    outputPer1M: 4.4,
    context: "200K context",
    note: "推論寄りの軽量モデル。数学・コード・分析系の概算に使います。",
    checked: "2026-05-11",
  },
];

const EXAMPLES = [
  {
    label: "SaaSチャット",
    modelId: "gpt-4.1-mini",
    requests: "100000",
    inputTokens: "1200",
    cachedPercent: "20",
    outputTokens: "400",
  },
  {
    label: "RAG検索",
    modelId: "gpt-5",
    requests: "300000",
    inputTokens: "2500",
    cachedPercent: "50",
    outputTokens: "300",
  },
  {
    label: "軽量Bot大量処理",
    modelId: "gpt-4o-mini",
    requests: "1000000",
    inputTokens: "400",
    cachedPercent: "0",
    outputTokens: "100",
  },
  {
    label: "長文分析",
    modelId: "gpt-4.1",
    requests: "50000",
    inputTokens: "8000",
    cachedPercent: "10",
    outputTokens: "1200",
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

function buildCopyText(result: CostResult, model: ModelPrice) {
  return [
    `Azure OpenAI Service 料金概算`,
    `モデル: ${model.name}`,
    `月間リクエスト: ${formatNumber(result.requests)}回`,
    `入力: ${formatNumber(result.totalInputTokens)} tokens`,
    `うちキャッシュ入力: ${formatNumber(result.cachedInputTokens)} tokens`,
    `出力: ${formatNumber(result.totalOutputTokens)} tokens`,
    `月額: ${formatUsd(result.totalUsd)} / ${formatJpy(result.totalJpy)}`,
    `前提: Global Standardの公開単価、税・契約割引・PTU・Batch APIは別`,
  ].join("\n");
}

type CostResult = {
  requests: number;
  totalInputTokens: number;
  cachedInputTokens: number;
  billableInputTokens: number;
  totalOutputTokens: number;
  inputUsd: number;
  cachedInputUsd: number;
  outputUsd: number;
  totalUsd: number;
  totalJpy: number;
  costPerRequestUsd: number;
  costPerThousandRequestsUsd: number;
};

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

export default function AzureOpenAiCost() {
  const [modelId, setModelId] = useState("gpt-5");
  const [requests, setRequests] = useState("100000");
  const [inputTokens, setInputTokens] = useState("1200");
  const [cachedPercent, setCachedPercent] = useState("20");
  const [outputTokens, setOutputTokens] = useState("400");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [copied, setCopied] = useState(false);

  const model = MODEL_PRICES.find((item) => item.id === modelId) ?? MODEL_PRICES[0];

  const result = useMemo<CostResult>(() => {
    const requestCount = Math.max(0, parseNumber(requests));
    const inputPerRequest = Math.max(0, parseNumber(inputTokens));
    const outputPerRequest = Math.max(0, parseNumber(outputTokens));
    const cachedRatio = Math.min(100, Math.max(0, parseNumber(cachedPercent))) / 100;
    const rate = Math.max(0, parseNumber(exchangeRate));

    const totalInputTokens = requestCount * inputPerRequest;
    const totalOutputTokens = requestCount * outputPerRequest;
    const cachedInputTokens = totalInputTokens * cachedRatio;
    const billableInputTokens = totalInputTokens - cachedInputTokens;
    const inputUsd = (billableInputTokens / 1_000_000) * model.inputPer1M;
    const cachedInputUsd = (cachedInputTokens / 1_000_000) * model.cachedInputPer1M;
    const outputUsd = (totalOutputTokens / 1_000_000) * model.outputPer1M;
    const totalUsd = inputUsd + cachedInputUsd + outputUsd;

    return {
      requests: requestCount,
      totalInputTokens,
      cachedInputTokens,
      billableInputTokens,
      totalOutputTokens,
      inputUsd,
      cachedInputUsd,
      outputUsd,
      totalUsd,
      totalJpy: totalUsd * rate,
      costPerRequestUsd: requestCount ? totalUsd / requestCount : 0,
      costPerThousandRequestsUsd: requestCount ? (totalUsd / requestCount) * 1000 : 0,
    };
  }, [cachedPercent, exchangeRate, inputTokens, model, outputTokens, requests]);

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setModelId(example.modelId);
    setRequests(example.requests);
    setInputTokens(example.inputTokens);
    setCachedPercent(example.cachedPercent);
    setOutputTokens(example.outputTokens);
    setCopied(false);
  }

  function reset() {
    setModelId("gpt-5");
    setRequests("100000");
    setInputTokens("1200");
    setCachedPercent("20");
    setOutputTokens("400");
    setExchangeRate("155");
    setCopied(false);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(buildCopyText(result, model));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const warnings = [
    result.totalUsd > 1000 ? "月額が大きいので、Azure Cost Managementの実績値・予算アラートと併用してください。" : "",
    parseNumber(cachedPercent) > 0 ? "キャッシュ入力はモデル・API・プロンプト再利用条件で効き方が変わります。" : "",
  ].filter(Boolean);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">月間利用量</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Global Standardの公開単価で、月額のAPI利用料を概算します。</p>
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
            <label htmlFor="azure-openai-model" className="text-sm font-semibold text-slate-800">
              モデル
            </label>
            <select
              id="azure-openai-model"
              value={modelId}
              onChange={(event) => {
                setModelId(event.target.value);
                setCopied(false);
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600"
            >
              {MODEL_PRICES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField id="azure-requests" label="月間リクエスト数" value={requests} suffix="回" onChange={setRequests} />
            <NumberField id="azure-rate" label="為替レート" value={exchangeRate} suffix="円/USD" onChange={setExchangeRate} />
            <NumberField
              id="azure-input"
              label="平均入力"
              value={inputTokens}
              suffix="tokens/回"
              onChange={setInputTokens}
              help="system prompt、履歴、RAG文脈を含めた入力側の平均です。"
            />
            <NumberField
              id="azure-output"
              label="平均出力"
              value={outputTokens}
              suffix="tokens/回"
              onChange={setOutputTokens}
              help="回答本文、JSON、関数呼び出し結果などの出力側平均です。"
            />
            <div className="sm:col-span-2">
              <NumberField
                id="azure-cache"
                label="キャッシュ入力率"
                value={cachedPercent}
                suffix="%"
                onChange={setCachedPercent}
                help="再利用できる入力の割合。分からない場合は0%で保守的に見積もります。"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-blue-600 hover:bg-blue-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{model.family}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{model.note}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">${model.inputPer1M} / 1M input</span>
              <span className="rounded-full bg-white px-3 py-1">${model.cachedInputPer1M} / 1M cached</span>
              <span className="rounded-full bg-white px-3 py-1">${model.outputPer1M} / 1M output</span>
              <span className="rounded-full bg-white px-3 py-1">{model.context}</span>
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
            <StatCard label="入力コスト" value={formatUsd(result.inputUsd)} note={`${formatNumber(result.billableInputTokens)} tokens`} />
            <StatCard label="キャッシュ入力" value={formatUsd(result.cachedInputUsd)} note={`${formatNumber(result.cachedInputTokens)} tokens`} />
            <StatCard label="出力コスト" value={formatUsd(result.outputUsd)} note={`${formatNumber(result.totalOutputTokens)} tokens`} />
            <StatCard label="1,000回あたり" value={formatUsd(result.costPerThousandRequestsUsd)} note={`${formatUsd(result.costPerRequestUsd)} / request`} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">内訳</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between gap-3">
                <span>月間入力 tokens</span>
                <span className="font-mono text-slate-950">{formatNumber(result.totalInputTokens)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>月間出力 tokens</span>
                <span className="font-mono text-slate-950">{formatNumber(result.totalOutputTokens)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>価格確認日</span>
                <span className="font-mono text-slate-950">{model.checked}</span>
              </div>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              {warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

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
