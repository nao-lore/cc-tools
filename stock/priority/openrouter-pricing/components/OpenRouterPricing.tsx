"use client";

import { useState, useMemo } from "react";

// ─────────────────────────────────────────────
// データ定義
// ─────────────────────────────────────────────

type Provider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "Other";

type Model = {
  id: string;
  name: string;
  provider: Provider;
  inputPer1M: number;   // USD per 1M input tokens (OpenRouter価格)
  outputPer1M: number;  // USD per 1M output tokens
  directInputPer1M: number;  // 直接API価格
  directOutputPer1M: number;
  contextK: number;     // context window in K tokens
  orMarginPct: number;  // OpenRouterのマージン率 (%)
  tags: string[];       // "oss", "fast", "long-ctx", "reasoning"
};

const MODELS: Model[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    inputPer1M: 2.75,
    outputPer1M: 11.0,
    directInputPer1M: 2.5,
    directOutputPer1M: 10.0,
    contextK: 128,
    orMarginPct: 10,
    tags: ["fast"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    inputPer1M: 0.165,
    outputPer1M: 0.66,
    directInputPer1M: 0.15,
    directOutputPer1M: 0.6,
    contextK: 128,
    orMarginPct: 10,
    tags: ["fast"],
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    inputPer1M: 2.2,
    outputPer1M: 8.8,
    directInputPer1M: 2.0,
    directOutputPer1M: 8.0,
    contextK: 1000,
    orMarginPct: 10,
    tags: ["long-ctx"],
  },
  {
    id: "o3",
    name: "o3",
    provider: "OpenAI",
    inputPer1M: 11.0,
    outputPer1M: 44.0,
    directInputPer1M: 10.0,
    directOutputPer1M: 40.0,
    contextK: 200,
    orMarginPct: 10,
    tags: ["reasoning"],
  },
  // Anthropic
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    inputPer1M: 16.5,
    outputPer1M: 82.5,
    directInputPer1M: 15.0,
    directOutputPer1M: 75.0,
    contextK: 200,
    orMarginPct: 10,
    tags: ["reasoning"],
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    inputPer1M: 3.3,
    outputPer1M: 16.5,
    directInputPer1M: 3.0,
    directOutputPer1M: 15.0,
    contextK: 200,
    orMarginPct: 10,
    tags: ["fast"],
  },
  {
    id: "claude-haiku-3.5",
    name: "Claude Haiku 3.5",
    provider: "Anthropic",
    inputPer1M: 0.88,
    outputPer1M: 4.4,
    directInputPer1M: 0.8,
    directOutputPer1M: 4.0,
    contextK: 200,
    orMarginPct: 10,
    tags: ["fast"],
  },
  // Google
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    inputPer1M: 1.375,
    outputPer1M: 11.0,
    directInputPer1M: 1.25,
    directOutputPer1M: 10.0,
    contextK: 1000,
    orMarginPct: 10,
    tags: ["long-ctx", "reasoning"],
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    inputPer1M: 0.165,
    outputPer1M: 0.66,
    directInputPer1M: 0.15,
    directOutputPer1M: 0.6,
    contextK: 1000,
    orMarginPct: 10,
    tags: ["fast", "long-ctx"],
  },
  // Meta
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    inputPer1M: 0.4,
    outputPer1M: 0.4,
    directInputPer1M: 0.4,
    directOutputPer1M: 0.4,
    contextK: 128,
    orMarginPct: 0,
    tags: ["oss", "fast"],
  },
  {
    id: "llama-3.1-405b",
    name: "Llama 3.1 405B",
    provider: "Meta",
    inputPer1M: 2.0,
    outputPer1M: 2.0,
    directInputPer1M: 2.0,
    directOutputPer1M: 2.0,
    contextK: 128,
    orMarginPct: 0,
    tags: ["oss"],
  },
  // Mistral
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    inputPer1M: 2.0,
    outputPer1M: 6.0,
    directInputPer1M: 2.0,
    directOutputPer1M: 6.0,
    contextK: 128,
    orMarginPct: 0,
    tags: [],
  },
  {
    id: "mistral-small",
    name: "Mistral Small",
    provider: "Mistral",
    inputPer1M: 0.1,
    outputPer1M: 0.3,
    directInputPer1M: 0.1,
    directOutputPer1M: 0.3,
    contextK: 32,
    orMarginPct: 0,
    tags: ["fast"],
  },
  // Other
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "Other",
    inputPer1M: 0.14,
    outputPer1M: 0.28,
    directInputPer1M: 0.14,
    directOutputPer1M: 0.28,
    contextK: 64,
    orMarginPct: 0,
    tags: ["oss"],
  },
  {
    id: "qwen-2.5-72b",
    name: "Qwen 2.5 72B",
    provider: "Other",
    inputPer1M: 0.4,
    outputPer1M: 0.4,
    directInputPer1M: 0.4,
    directOutputPer1M: 0.4,
    contextK: 128,
    orMarginPct: 0,
    tags: ["oss"],
  },
  {
    id: "command-r-plus",
    name: "Command R+",
    provider: "Other",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    directInputPer1M: 2.5,
    directOutputPer1M: 10.0,
    contextK: 128,
    orMarginPct: 0,
    tags: [],
  },
];

const PROVIDER_COLORS: Record<Provider, { bg: string; text: string; dot: string }> = {
  OpenAI:    { bg: "bg-emerald-900/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  Anthropic: { bg: "bg-orange-900/40",  text: "text-orange-300",  dot: "bg-orange-400" },
  Google:    { bg: "bg-blue-900/40",    text: "text-blue-300",    dot: "bg-blue-400" },
  Meta:      { bg: "bg-indigo-900/40",  text: "text-indigo-300",  dot: "bg-indigo-400" },
  Mistral:   { bg: "bg-violet-900/40",  text: "text-violet-300",  dot: "bg-violet-400" },
  Other:     { bg: "bg-gray-800/60",    text: "text-gray-300",    dot: "bg-gray-400" },
};

type SortKey = "inputPer1M" | "outputPer1M" | "contextK" | "name";
type PriceRange = "all" | "cheap" | "mid" | "expensive";
type ContextFilter = "all" | "long" | "short";

const RECOMMENDATIONS = [
  { label: "最安",       icon: "💰", modelId: "deepseek-v3",    reason: "入力$0.14/1Mトークン。コスト最優先ならこれ" },
  { label: "バランス",   icon: "⚖️", modelId: "gemini-2.5-flash", reason: "低価格 × 100万トークンコンテキスト × 高速" },
  { label: "高性能",     icon: "🏆", modelId: "claude-opus-4",  reason: "Anthropic最上位。複雑な推論・長文分析に" },
  { label: "長文処理",   icon: "📄", modelId: "gpt-4.1",        reason: "100万トークンコンテキスト。書籍丸ごと処理可" },
  { label: "OSS",       icon: "🔓", modelId: "llama-3.3-70b",  reason: "Metaのオープンウェイト。マージン0%で安価" },
];

// ─────────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────────

export default function OpenRouterPricing() {
  const [sortKey, setSortKey] = useState<SortKey>("inputPer1M");
  const [sortAsc, setSortAsc] = useState(true);
  const [providerFilter, setProviderFilter] = useState<Provider | "all">("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [contextFilter, setContextFilter] = useState<ContextFilter>("all");
  const [inputTokens, setInputTokens] = useState(100000);
  const [outputTokens, setOutputTokens] = useState(20000);
  const [usdJpy, setUsdJpy] = useState(155);
  const [showDirect, setShowDirect] = useState(false);
  const [highlightCheapest, setHighlightCheapest] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const filtered = useMemo(() => {
    return MODELS.filter((m) => {
      if (providerFilter !== "all" && m.provider !== providerFilter) return false;
      if (priceRange === "cheap" && m.inputPer1M > 0.5) return false;
      if (priceRange === "mid" && (m.inputPer1M <= 0.5 || m.inputPer1M > 3)) return false;
      if (priceRange === "expensive" && m.inputPer1M <= 3) return false;
      if (contextFilter === "long" && m.contextK < 200) return false;
      if (contextFilter === "short" && m.contextK >= 200) return false;
      return true;
    });
  }, [providerFilter, priceRange, contextFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string")
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortAsc]);

  const cheapestId = useMemo(() => {
    if (!highlightCheapest || filtered.length === 0) return null;
    const costs = filtered.map((m) => ({
      id: m.id,
      cost: (m.inputPer1M * inputTokens + m.outputPer1M * outputTokens) / 1_000_000,
    }));
    return costs.reduce((a, b) => (a.cost < b.cost ? a : b)).id;
  }, [filtered, inputTokens, outputTokens, highlightCheapest]);

  const calcCost = (m: Model) =>
    ((m.inputPer1M * inputTokens + m.outputPer1M * outputTokens) / 1_000_000);

  const calcDirectCost = (m: Model) =>
    ((m.directInputPer1M * inputTokens + m.directOutputPer1M * outputTokens) / 1_000_000);

  const fmtUSD = (v: number) => v < 0.001 ? `$${(v * 1000).toFixed(3)}m` : `$${v.toFixed(4)}`;
  const fmtJPY = (v: number) => `¥${Math.round(v * usdJpy).toLocaleString()}`;

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(col)}
      className={`flex items-center gap-1 text-xs font-semibold whitespace-nowrap px-2 py-1 rounded transition-colors ${
        sortKey === col
          ? "text-violet-300 bg-violet-900/40"
          : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {label}
      {sortKey === col ? (sortAsc ? " ↑" : " ↓") : " ⇅"}
    </button>
  );

  const providers: Provider[] = ["OpenAI", "Anthropic", "Google", "Meta", "Mistral", "Other"];

  return (
    <div className="space-y-6 text-sm">
      {/* ─── 用途別おすすめ ─── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {RECOMMENDATIONS.map((r) => {
          const m = MODELS.find((x) => x.id === r.modelId)!;
          const col = PROVIDER_COLORS[m.provider];
          return (
            <div key={r.modelId} className={`rounded-xl border border-white/10 p-3 ${col.bg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{r.icon}</span>
                <span className={`text-xs font-bold ${col.text}`}>{r.label}</span>
              </div>
              <div className="text-white font-semibold text-sm mb-1">{m.name}</div>
              <div className="text-gray-400 text-xs leading-tight">{r.reason}</div>
              <div className="mt-2 text-xs">
                <span className="text-white/70">${m.inputPer1M}</span>
                <span className="text-gray-500"> / 1M in</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── コスト試算 ─── */}
      <section className="bg-[#1a1a22] rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-base">コスト試算</h2>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-xs">最安ハイライト</label>
            <button
              onClick={() => setHighlightCheapest((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                highlightCheapest ? "bg-violet-600" : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  highlightCheapest ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1">入力トークン数</label>
            <input
              type="number"
              value={inputTokens}
              onChange={(e) => setInputTokens(Number(e.target.value))}
              className="w-full bg-[#0f0f11] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
            <div className="text-gray-500 text-xs mt-0.5">約 {Math.round(inputTokens / 750)} 単語</div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">出力トークン数</label>
            <input
              type="number"
              value={outputTokens}
              onChange={(e) => setOutputTokens(Number(e.target.value))}
              className="w-full bg-[#0f0f11] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
            <div className="text-gray-500 text-xs mt-0.5">約 {Math.round(outputTokens / 750)} 単語</div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">USD/JPY レート</label>
            <input
              type="number"
              value={usdJpy}
              onChange={(e) => setUsdJpy(Number(e.target.value))}
              className="w-full bg-[#0f0f11] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
            <div className="text-gray-500 text-xs mt-0.5">参考: 2026年4月 ≈ ¥155</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <label className="text-gray-400 text-xs">直接API価格と比較表示</label>
          <button
            onClick={() => setShowDirect((v) => !v)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              showDirect ? "bg-violet-600" : "bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                showDirect ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-gray-500 text-xs">OpenRouterのマージン分を可視化</span>
        </div>
      </section>

      {/* ─── フィルタ ─── */}
      <section className="bg-[#1a1a22] rounded-2xl border border-white/10 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-400 text-xs self-center mr-1">プロバイダー</span>
            {(["all", ...providers] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  providerFilter === p
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {p === "all" ? "すべて" : p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-400 text-xs self-center mr-1">価格帯</span>
            {([
              ["all", "すべて"],
              ["cheap", "$0.5以下"],
              ["mid", "$0.5〜$3"],
              ["expensive", "$3超"],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setPriceRange(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  priceRange === v
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-400 text-xs self-center mr-1">コンテキスト</span>
            {([
              ["all", "すべて"],
              ["long", "200K+"],
              ["short", "〜128K"],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setContextFilter(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  contextFilter === v
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 比較表 ─── */}
      <section className="bg-[#1a1a22] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-gray-400 font-medium w-48">
                  <SortBtn col="name" label="モデル" />
                </th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">
                  <SortBtn col="inputPer1M" label="入力/1M" />
                </th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium">
                  <SortBtn col="outputPer1M" label="出力/1M" />
                </th>
                {showDirect && (
                  <th className="text-right px-4 py-3 text-gray-400 font-medium whitespace-nowrap">
                    直接API差額
                  </th>
                )}
                <th className="text-right px-4 py-3 text-gray-400 font-medium">
                  <SortBtn col="contextK" label="CTX" />
                </th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium whitespace-nowrap">
                  試算コスト
                </th>
                <th className="text-right px-4 py-3 text-gray-400 font-medium whitespace-nowrap">
                  円換算
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => {
                const col = PROVIDER_COLORS[m.provider];
                const isCheapest = m.id === cheapestId;
                const cost = calcCost(m);
                const directCost = calcDirectCost(m);
                const diff = cost - directCost;
                const diffPct = directCost > 0 ? (diff / directCost) * 100 : 0;

                return (
                  <tr
                    key={m.id}
                    className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                      isCheapest ? "bg-yellow-900/10" : i % 2 === 0 ? "" : "bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isCheapest && (
                          <span className="text-yellow-400 text-base" title="最安">★</span>
                        )}
                        <div>
                          <div className="text-white font-medium">{m.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                            <span className={`text-xs ${col.text}`}>{m.provider}</span>
                            {m.tags.includes("oss") && (
                              <span className="text-xs text-gray-500 bg-gray-800 px-1 rounded">OSS</span>
                            )}
                            {m.tags.includes("reasoning") && (
                              <span className="text-xs text-purple-400 bg-purple-900/30 px-1 rounded">推論</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-mono">${m.inputPer1M.toFixed(m.inputPer1M < 1 ? 3 : 2)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-mono">${m.outputPer1M.toFixed(m.outputPer1M < 1 ? 3 : 2)}</span>
                    </td>
                    {showDirect && (
                      <td className="px-4 py-3 text-right">
                        {diff > 0.0001 ? (
                          <span className="text-red-400 font-mono text-xs">
                            +${diff.toFixed(4)} (+{diffPct.toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-green-400 text-xs">直接と同額</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <span className="text-gray-300 font-mono text-xs">
                        {m.contextK >= 1000 ? `${m.contextK / 1000}M` : `${m.contextK}K`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono text-sm font-semibold ${
                          isCheapest ? "text-yellow-300" : "text-white"
                        }`}
                      >
                        {fmtUSD(cost)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-xs text-gray-400">{fmtJPY(cost)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="py-16 text-center text-gray-500">フィルタ条件に一致するモデルがありません</div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
          <span>入力 {inputTokens.toLocaleString()} tok + 出力 {outputTokens.toLocaleString()} tok での試算</span>
          <span>★ = 現在の試算条件で最安モデル</span>
          <span>CTX = コンテキストウィンドウ長</span>
        </div>
      </section>

      {/* ─── OpenRouter vs 直接API 解説 ─── */}
      <section className="bg-[#1a1a22] rounded-2xl border border-white/10 p-5">
        <h2 className="text-white font-bold text-base mb-3">OpenRouter vs 直接API — どちらを使うべき？</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-violet-300 font-bold">OpenRouter のメリット</span>
            </div>
            <ul className="text-gray-400 text-xs space-y-1.5">
              <li>• 1つのAPIキーで20社以上のモデルを切り替え可能</li>
              <li>• プロバイダーごとの請求管理が不要</li>
              <li>• フォールバック設定でAPI障害に自動対応</li>
              <li>• OSSモデル（Llama, DeepSeek等）へのゲートウェイ</li>
              <li>• クレジットカード1枚で全モデル利用可能</li>
            </ul>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-300 font-bold">直接APIのメリット</span>
            </div>
            <ul className="text-gray-400 text-xs space-y-1.5">
              <li>• マージン分（通常0〜20%）コストが安い</li>
              <li>• バッチAPI・プロンプトキャッシュなど最新機能を即利用</li>
              <li>• SLA保証・エンタープライズサポート</li>
              <li>• データプライバシーポリシーが明確</li>
              <li>• 高頻度・大量利用なら割引契約が可能</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-4 py-3 text-xs text-yellow-300/80">
          <strong>目安：</strong>月1,000万トークン未満の開発・検証用途ならOpenRouterが便利。本番大量利用は直接APIが有利なケースが多い。
        </div>
      </section>

      {/* ─── 注釈 ─── */}
      <p className="text-gray-600 text-xs text-center pb-2">
        ※ 料金は2026年4月時点の概算です。OpenRouterのマージンはモデル・プランにより変動します。最新価格は openrouter.ai でご確認ください。
      </p>
    </div>
  );
}
