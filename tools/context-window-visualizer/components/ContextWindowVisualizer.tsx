"use client";

import { useMemo, useState } from "react";

type Provider = "OpenAI" | "Anthropic" | "Google";
type Model = {
  name: string;
  provider: Provider;
  contextTokens: number;
  outputTokens: number;
  source: string;
  note: string;
};

const MODELS: Model[] = [
  {
    name: "GPT-4.1",
    provider: "OpenAI",
    contextTokens: 1_047_576,
    outputTokens: 32_768,
    source: "OpenAI model docs",
    note: "1M-token non-reasoning model.",
  },
  {
    name: "GPT-5.2",
    provider: "OpenAI",
    contextTokens: 400_000,
    outputTokens: 128_000,
    source: "OpenAI model comparison",
    note: "Frontier coding and agentic model.",
  },
  {
    name: "GPT-4o",
    provider: "OpenAI",
    contextTokens: 128_000,
    outputTokens: 16_384,
    source: "OpenAI conversation state docs",
    note: "Common multimodal API model.",
  },
  {
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    contextTokens: 1_000_000,
    outputTokens: 64_000,
    source: "Claude context windows",
    note: "1M context model according to Claude docs.",
  },
  {
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    contextTokens: 1_000_000,
    outputTokens: 64_000,
    source: "Claude context windows",
    note: "1M context model with context awareness.",
  },
  {
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    contextTokens: 200_000,
    outputTokens: 64_000,
    source: "Claude context windows",
    note: "200k context; plan and endpoint limits may vary.",
  },
  {
    name: "Gemini 2.5 Pro",
    provider: "Google",
    contextTokens: 1_048_576,
    outputTokens: 65_536,
    source: "Google Gemini model docs",
    note: "Long-context thinking model.",
  },
  {
    name: "Gemini 2.5 Flash",
    provider: "Google",
    contextTokens: 1_048_576,
    outputTokens: 65_536,
    source: "Google Gemini model docs",
    note: "Long-context price-performance model.",
  },
  {
    name: "Gemini 2.0 Flash",
    provider: "Google",
    contextTokens: 1_048_576,
    outputTokens: 8_192,
    source: "Google Gemini model docs",
    note: "Second-generation workhorse model.",
  },
];

const PROVIDERS: Array<Provider | "All"> = ["All", "OpenAI", "Anthropic", "Google"];
const EXAMPLES = [
  { label: "A4 10 pages", chars: "8000" },
  { label: "Novel draft", chars: "120000" },
  { label: "Large codebase", chars: "900000" },
];

function providerTone(provider: Provider) {
  return {
    OpenAI: "bg-emerald-500",
    Anthropic: "bg-orange-500",
    Google: "bg-sky-500",
  }[provider];
}

function providerCard(provider: Provider) {
  return {
    OpenAI: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Anthropic: "border-orange-200 bg-orange-50 text-orange-800",
    Google: "border-sky-200 bg-sky-50 text-sky-800",
  }[provider];
}

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return value.toLocaleString();
}

function formatFull(value: number) {
  return `${value.toLocaleString()} tokens`;
}

function tokenEstimate(chars: number, charsPerToken: number) {
  if (!chars || !charsPerToken) return 0;
  return Math.ceil(chars / charsPerToken);
}

function a4Pages(tokens: number, charsPerToken: number) {
  return Math.round((tokens * charsPerToken) / 800);
}

function bookCount(tokens: number, charsPerToken: number) {
  return Number(((tokens * charsPerToken) / 200_000).toFixed(1));
}

function sanitizeNumber(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function buildCopyText(models: Model[], inputTokens: number, chars: number) {
  const lines = [
    `Context window estimate`,
    `Input: ${chars.toLocaleString()} chars ≈ ${inputTokens.toLocaleString()} tokens`,
    "",
    ...models.map((model) => {
      const remaining = model.contextTokens - inputTokens;
      return `${model.name}: ${remaining >= 0 ? "fits" : "over"} (${formatFull(model.contextTokens)} context, ${formatFull(model.outputTokens)} output)`;
    }),
  ];
  return lines.join("\n");
}

export default function ContextWindowVisualizer() {
  const [inputChars, setInputChars] = useState("120000");
  const [charsPerToken, setCharsPerToken] = useState("1.5");
  const [provider, setProvider] = useState<Provider | "All">("All");
  const [metric, setMetric] = useState<"context" | "output">("context");
  const [copied, setCopied] = useState(false);

  const charCount = Number.parseInt(inputChars || "0", 10);
  const ratio = Number.parseFloat(charsPerToken || "1.5");
  const inputTokens = tokenEstimate(charCount, ratio);
  const filtered = useMemo(() => {
    return MODELS.filter((model) => provider === "All" || model.provider === provider).sort((a, b) => {
      const key = metric === "context" ? "contextTokens" : "outputTokens";
      return b[key] - a[key];
    });
  }, [metric, provider]);
  const maxValue = Math.max(...filtered.map((model) => (metric === "context" ? model.contextTokens : model.outputTokens)));
  const largestContext = Math.max(...MODELS.map((model) => model.contextTokens));
  const fitsCount = MODELS.filter((model) => model.contextTokens >= inputTokens).length;
  const error = charCount < 0 || ratio <= 0 ? "入力値を確認してください。" : "";

  function reset() {
    setInputChars("120000");
    setCharsPerToken("1.5");
    setProvider("All");
    setMetric("context");
    setCopied(false);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(buildCopyText(filtered, inputTokens, charCount));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between xl:flex-col">
            <div>
              <h2 className="text-base font-semibold text-slate-950">入力サイズ</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">文字数をトークンに概算し、各モデルのコンテキストに収まるか確認します。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              リセット
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <NumberField label="文字数" value={inputChars} onChange={setInputChars} suffix="chars" />
            <NumberField label="1 token あたり文字数" value={charsPerToken} onChange={setCharsPerToken} suffix="chars/token" decimal />
          </div>
          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "日本語は 1 token ≈ 1〜2文字、英語は 1 token ≈ 0.75語程度の粗い換算です。"}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MetricCard label="推定トークン" value={formatFull(inputTokens)} />
            <MetricCard label="A4換算" value={`約${a4Pages(inputTokens, ratio).toLocaleString()}ページ`} />
            <MetricCard label="書籍換算" value={`約${bookCount(inputTokens, ratio)}冊`} />
            <MetricCard label="収まるモデル" value={`${fitsCount}/${MODELS.length}`} />
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setInputChars(example.chars)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <h2 className="font-semibold text-slate-950">Privacy</h2>
            <p className="mt-1">計算はブラウザ内で完結します。入力した文字数や見積もり内容は外部送信されません。</p>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="最大コンテキスト" value={formatFull(largestContext)} note="Gemini 2.5 / GPT-4.1級" />
            <MetricCard label="入力の残り余裕" value={`${MODELS.filter((model) => model.contextTokens >= inputTokens).length} models`} note="現在の入力条件" />
            <MetricCard label="確認日" value="2026-05-11" note="公式docsベース" />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setProvider(item)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${provider === item ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                >
                  {item === "All" ? "すべて" : item}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMetric("context")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${metric === "context" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
              >
                Context
              </button>
              <button
                type="button"
                onClick={() => setMetric("output")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${metric === "output" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
              >
                Output
              </button>
              <button
                type="button"
                onClick={copyResult}
                className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {copied ? "コピーしました" : "結果をコピー"}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.map((model) => {
              const value = metric === "context" ? model.contextTokens : model.outputTokens;
              const pct = Math.max(2, (value / maxValue) * 100);
              const fits = model.contextTokens >= inputTokens;
              const remaining = model.contextTokens - inputTokens;
              return (
                <div key={model.name} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${providerTone(model.provider)}`} />
                        <h2 className="font-semibold text-slate-950">{model.name}</h2>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${providerCard(model.provider)}`}>{model.provider}</span>
                        {inputTokens > 0 && (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${fits ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                            {fits ? "収まる" : "超過"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{model.note}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-lg font-bold text-slate-950">{formatFull(value)}</p>
                      <p className="text-xs text-slate-500">{metric === "context" ? "context window" : "max output"}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${providerTone(model.provider)}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Context: {formatTokens(model.contextTokens)}</span>
                    <span>Output: {formatTokens(model.outputTokens)}</span>
                    <span>{remaining >= 0 ? `残り約${formatTokens(remaining)}` : `約${formatTokens(Math.abs(remaining))}超過`}</span>
                    <span>Source: {model.source}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  decimal = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  decimal?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2 flex min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          type="text"
          inputMode={decimal ? "decimal" : "numeric"}
          value={value}
          onChange={(event) => onChange(decimal ? event.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1") : sanitizeNumber(event.target.value))}
          className="w-0 min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-slate-950">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}
