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
type Lang = "ja" | "en";

// ─────────────────────────────────────────────
// 翻訳定数
// ─────────────────────────────────────────────
const T = {
  ja: {
    // Recommendations
    recCheapest: "最安",
    recBalance: "バランス",
    recHighPerf: "高性能",
    recLongCtx: "長文処理",
    recOss: "OSS",
    recReasons: {
      "deepseek-v3":    "入力$0.14/1Mトークン。コスト最優先ならこれ",
      "gemini-2.5-flash": "低価格 × 100万トークンコンテキスト × 高速",
      "claude-opus-4":  "Anthropic最上位。複雑な推論・長文分析に",
      "gpt-4.1":        "100万トークンコンテキスト。書籍丸ごと処理可",
      "llama-3.3-70b":  "Metaのオープンウェイト。マージン0%で安価",
    } as Record<string, string>,
    // Sections
    costSimTitle: "コスト試算",
    cheapestHighlight: "最安ハイライト",
    inputTokens: "入力トークン数",
    outputTokens: "出力トークン数",
    usdJpyRate: "USD/JPY レート",
    rateNote: "参考: 2026年4月 ≈ ¥155",
    showDirect: "直接API価格と比較表示",
    showDirectNote: "OpenRouterのマージン分を可視化",
    wordApprox: (n: number) => `約 ${n} 単語`,
    // Filters
    filterProvider: "プロバイダー",
    filterAll: "すべて",
    filterPrice: "価格帯",
    filterCheap: "$0.5以下",
    filterMid: "$0.5〜$3",
    filterExpensive: "$3超",
    filterCtx: "コンテキスト",
    filterLong: "200K+",
    filterShort: "〜128K",
    // Table headers
    colModel: "モデル",
    colInput: "入力/1M",
    colOutput: "出力/1M",
    colDirectDiff: "直接API差額",
    colCtx: "CTX",
    colCost: "試算コスト",
    colJpy: "円換算",
    tagOss: "OSS",
    tagReasoning: "推論",
    noResults: "フィルタ条件に一致するモデルがありません",
    tableFooter: (inTok: number, outTok: number) =>
      `入力 ${inTok.toLocaleString()} tok + 出力 ${outTok.toLocaleString()} tok での試算`,
    cheapestNote: "★ = 現在の試算条件で最安モデル",
    ctxNote: "CTX = コンテキストウィンドウ長",
    sameAsDirectLabel: "直接と同額",
    // OR vs Direct
    orVsDirectTitle: "OpenRouter vs 直接API — どちらを使うべき？",
    orMeritsTitle: "OpenRouter のメリット",
    orMerits: [
      "1つのAPIキーで20社以上のモデルを切り替え可能",
      "プロバイダーごとの請求管理が不要",
      "フォールバック設定でAPI障害に自動対応",
      "OSSモデル（Llama, DeepSeek等）へのゲートウェイ",
      "クレジットカード1枚で全モデル利用可能",
    ],
    directMeritsTitle: "直接APIのメリット",
    directMerits: [
      "マージン分（通常0〜20%）コストが安い",
      "バッチAPI・プロンプトキャッシュなど最新機能を即利用",
      "SLA保証・エンタープライズサポート",
      "データプライバシーポリシーが明確",
      "高頻度・大量利用なら割引契約が可能",
    ],
    orVsDirectTip: "目安：月1,000万トークン未満の開発・検証用途ならOpenRouterが便利。本番大量利用は直接APIが有利なケースが多い。",
    // Footer note
    footerNote: "※ 料金は2026年4月時点の概算です。OpenRouterのマージンはモデル・プランにより変動します。最新価格は openrouter.ai でご確認ください。",
    // Guide
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "トークン数を入力", desc: "「コスト試算」セクションで入力・出力トークン数を設定します。1,000文字≒750トークンが目安です。" },
      { step: "2", title: "フィルタで絞り込む", desc: "プロバイダー・価格帯・コンテキスト長でモデルを絞り込めます。OSSのみ・高性能のみなど用途に合わせて使ってください。" },
      { step: "3", title: "最安モデルを確認", desc: "★マークが現在の試算条件での最安モデルです。「最安ハイライト」トグルで全体コストを把握できます。" },
      { step: "4", title: "直接APIと比較", desc: "「直接API価格と比較表示」をオンにするとOpenRouterのマージン分を可視化できます。大量利用時の判断材料になります。" },
    ],
    // FAQ
    faqTitle: "よくある質問",
    faq: [
      {
        q: "OpenRouterの料金は直接APIより高いですか？",
        a: "多くのモデルで0〜10%程度のマージンが上乗せされます。GPT-4oやClaude等は約10%高くなりますが、Llama・DeepSeekなどのOSSモデルは直接APIと同価格です。",
      },
      {
        q: "無料で使えるモデルはありますか？",
        a: "OpenRouterでは一部のOSSモデル（Llama等）を無料枠で試すことができます。ただし制限があるため本番利用にはクレジットが必要です。",
      },
      {
        q: "1Mトークンとはどのくらいの量ですか？",
        a: "英語で約75万語、日本語で約60万文字程度です。中程度の小説1冊分、またはコードベース数万行に相当します。",
      },
      {
        q: "Gemini 2.5 Proが安い理由は何ですか？",
        a: "Googleは独自のインフラを持ち、AI普及を優先して競争力ある価格を設定しています。コンテキスト長も100万トークンと非常に長く、コスパが際立ちます。",
      },
      {
        q: "日本円での支払いは可能ですか？",
        a: "OpenRouterはUSD決済のみです。クレジットカード（海外決済対応）でプリペイドクレジットを購入する形式です。",
      },
    ],
    // CTA
    ctaTitle: "OpenRouterを始める",
    ctaDesc: "APIキー1つで20社以上のLLMを即利用。無料枠あり。",
    ctaBtn: "OpenRouterを始める →",
    // Related tools
    relatedTitle: "関連ツール",
    relatedLinks: [
      { href: "/ai-model-comparison", label: "AIモデル比較", desc: "GPT・Claude・Geminiの性能を横断比較" },
      { href: "/claude-api-cost", label: "Claude API料金計算", desc: "Anthropic直接APIのコストを試算" },
      { href: "/gemini-api-cost", label: "Gemini API料金計算", desc: "Google Gemini APIのトークン料金を計算" },
    ],
    // Per 1M in label
    per1Min: "/ 1M in",
  },
  en: {
    // Recommendations
    recCheapest: "Cheapest",
    recBalance: "Balanced",
    recHighPerf: "High Perf",
    recLongCtx: "Long Ctx",
    recOss: "OSS",
    recReasons: {
      "deepseek-v3":    "$0.14/1M input. Best for cost-first use cases.",
      "gemini-2.5-flash": "Low price × 1M token context × fast",
      "claude-opus-4":  "Anthropic's flagship. Best for complex reasoning.",
      "gpt-4.1":        "1M token context. Process entire books.",
      "llama-3.3-70b":  "Meta open-weight. 0% margin, very affordable.",
    } as Record<string, string>,
    // Sections
    costSimTitle: "Cost Estimator",
    cheapestHighlight: "Highlight Cheapest",
    inputTokens: "Input Tokens",
    outputTokens: "Output Tokens",
    usdJpyRate: "USD/JPY Rate",
    rateNote: "Ref: Apr 2026 ≈ ¥155",
    showDirect: "Compare with Direct API",
    showDirectNote: "Visualize OpenRouter's margin",
    wordApprox: (n: number) => `≈ ${n} words`,
    // Filters
    filterProvider: "Provider",
    filterAll: "All",
    filterPrice: "Price",
    filterCheap: "≤$0.5",
    filterMid: "$0.5–$3",
    filterExpensive: ">$3",
    filterCtx: "Context",
    filterLong: "200K+",
    filterShort: "≤128K",
    // Table headers
    colModel: "Model",
    colInput: "Input/1M",
    colOutput: "Output/1M",
    colDirectDiff: "Direct Diff",
    colCtx: "CTX",
    colCost: "Est. Cost",
    colJpy: "JPY",
    tagOss: "OSS",
    tagReasoning: "Reasoning",
    noResults: "No models match the current filters.",
    tableFooter: (inTok: number, outTok: number) =>
      `Estimated for ${inTok.toLocaleString()} input + ${outTok.toLocaleString()} output tokens`,
    cheapestNote: "★ = cheapest model for current estimate",
    ctxNote: "CTX = context window length",
    sameAsDirectLabel: "Same as direct",
    // OR vs Direct
    orVsDirectTitle: "OpenRouter vs Direct API — Which Should You Use?",
    orMeritsTitle: "Benefits of OpenRouter",
    orMerits: [
      "Switch between 20+ providers with a single API key",
      "No need to manage separate billing per provider",
      "Automatic fallback for API outages",
      "Gateway to OSS models (Llama, DeepSeek, etc.)",
      "One credit card for all models",
    ],
    directMeritsTitle: "Benefits of Direct API",
    directMerits: [
      "Lower cost (no margin, usually 0–20% savings)",
      "Immediate access to latest features (batch API, prompt cache)",
      "SLA guarantees and enterprise support",
      "Clear data privacy policies",
      "Volume discounts available for heavy usage",
    ],
    orVsDirectTip: "Rule of thumb: OpenRouter is great for dev/testing under 10M tokens/month. Direct API is often better for high-volume production.",
    // Footer note
    footerNote: "* Prices are estimates as of April 2026. OpenRouter margins vary by model and plan. Check openrouter.ai for the latest pricing.",
    // Guide
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Enter Token Counts", desc: "Set input/output token counts in the Cost Estimator. A rough guide: 1,000 characters ≈ 750 tokens." },
      { step: "2", title: "Filter Models", desc: "Narrow down by provider, price range, or context length. Use filters to find OSS-only or high-performance models." },
      { step: "3", title: "Find the Cheapest", desc: "The ★ mark shows the cheapest model for your current estimate. Use the highlight toggle for an overview." },
      { step: "4", title: "Compare with Direct API", desc: "Enable 'Compare with Direct API' to visualize OpenRouter's margin. Useful for high-volume cost decisions." },
    ],
    // FAQ
    faqTitle: "FAQ",
    faq: [
      {
        q: "Is OpenRouter more expensive than direct APIs?",
        a: "Most models include a 0–10% margin. GPT-4o and Claude are about 10% higher, but OSS models like Llama and DeepSeek are the same price as direct API.",
      },
      {
        q: "Are there free models available?",
        a: "Some OSS models (e.g., Llama) have a free tier on OpenRouter. However, there are limits, so production use requires credits.",
      },
      {
        q: "How much is 1M tokens?",
        a: "Roughly 750,000 English words, or a medium-length novel. It's also equivalent to tens of thousands of lines of code.",
      },
      {
        q: "Why is Gemini 2.5 Pro so affordable?",
        a: "Google operates its own infrastructure and prices competitively to drive AI adoption. It also offers a 1M token context window, making its value exceptional.",
      },
      {
        q: "Can I pay in Japanese Yen?",
        a: "OpenRouter only accepts USD payments. You purchase prepaid credits via an international credit card.",
      },
    ],
    // CTA
    ctaTitle: "Get Started with OpenRouter",
    ctaDesc: "Access 20+ LLMs with a single API key. Free tier available.",
    ctaBtn: "Start with OpenRouter →",
    // Related tools
    relatedTitle: "Related Tools",
    relatedLinks: [
      { href: "/ai-model-comparison", label: "AI Model Comparison", desc: "Compare GPT, Claude, Gemini performance side by side." },
      { href: "/claude-api-cost", label: "Claude API Cost Calculator", desc: "Estimate costs for Anthropic's direct API." },
      { href: "/gemini-api-cost", label: "Gemini API Cost Calculator", desc: "Calculate token costs for Google Gemini API." },
    ],
    // Per 1M in label
    per1Min: "/ 1M in",
  },
} as const;

const RECOMMENDATIONS: { labelKey: keyof typeof T.ja; icon: string; modelId: string }[] = [
  { labelKey: "recCheapest", icon: "💰", modelId: "deepseek-v3" },
  { labelKey: "recBalance",  icon: "⚖️", modelId: "gemini-2.5-flash" },
  { labelKey: "recHighPerf", icon: "🏆", modelId: "claude-opus-4" },
  { labelKey: "recLongCtx",  icon: "📄", modelId: "gpt-4.1" },
  { labelKey: "recOss",      icon: "🔓", modelId: "llama-3.3-70b" },
];

// ─────────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────────

export default function OpenRouterPricing() {
  const [lang, setLang] = useState<Lang>("ja");
  const t = T[lang];

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
          : "text-violet-200 hover:text-white"
      }`}
    >
      {label}
      {sortKey === col ? (sortAsc ? " ↑" : " ↓") : " ⇅"}
    </button>
  );

  const providers: Provider[] = ["OpenAI", "Anthropic", "Google", "Meta", "Mistral", "Other"];

  return (
    <div className="space-y-5 text-sm">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .tab-active-glow {
          box-shadow: 0 0 16px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .tab-panel {
          animation: float-in 0.25s ease-out;
        }
        .method-btn:hover {
          box-shadow: 0 0 16px rgba(167,139,250,0.2);
        }
        .method-btn-active {
          box-shadow: 0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          background: rgba(139,92,246,0.2);
          border-color: rgba(167,139,250,0.6) !important;
        }
        .preset-active {
          background: rgba(139,92,246,0.25);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .number-input::-webkit-inner-spin-button,
        .number-input::-webkit-outer-spin-button { opacity: 0.3; }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
        .toggle-track {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .toggle-track-on {
          background: rgba(139,92,246,0.6);
          border-color: rgba(167,139,250,0.4);
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* ─── 用途別おすすめ ─── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {RECOMMENDATIONS.map((r) => {
          const m = MODELS.find((x) => x.id === r.modelId)!;
          const col = PROVIDER_COLORS[m.provider];
          const label = t[r.labelKey] as string;
          const reason = t.recReasons[r.modelId] ?? "";
          return (
            <div key={r.modelId} className={`glass-card rounded-xl p-3 ${col.bg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{r.icon}</span>
                <span className={`text-xs font-bold ${col.text}`}>{label}</span>
              </div>
              <div className="text-white font-semibold text-sm mb-1">{m.name}</div>
              <div className="text-violet-200 text-xs leading-tight">{reason}</div>
              <div className="mt-2 text-xs">
                <span className="text-white/70 font-mono">${m.inputPer1M}</span>
                <span className="text-violet-300"> {t.per1Min}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── コスト試算 ─── */}
      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-base">{t.costSimTitle}</h2>
          <div className="flex items-center gap-2">
            <label className="text-violet-200 text-xs">{t.cheapestHighlight}</label>
            <button
              onClick={() => setHighlightCheapest((v) => !v)}
              className={`w-9 h-5 rounded-full transition-all relative toggle-track ${highlightCheapest ? "toggle-track-on" : ""}`}
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
            <label className="block text-violet-100 text-xs mb-1 uppercase tracking-wider">{t.inputTokens}</label>
            <input
              type="number"
              value={inputTokens}
              onChange={(e) => setInputTokens(Number(e.target.value))}
              className="number-input w-full rounded-xl px-3 py-2 text-sm neon-focus"
            />
            <div className="text-violet-300 text-xs mt-0.5">{t.wordApprox(Math.round(inputTokens / 750))}</div>
          </div>
          <div>
            <label className="block text-violet-100 text-xs mb-1 uppercase tracking-wider">{t.outputTokens}</label>
            <input
              type="number"
              value={outputTokens}
              onChange={(e) => setOutputTokens(Number(e.target.value))}
              className="number-input w-full rounded-xl px-3 py-2 text-sm neon-focus"
            />
            <div className="text-violet-300 text-xs mt-0.5">{t.wordApprox(Math.round(outputTokens / 750))}</div>
          </div>
          <div>
            <label className="block text-violet-100 text-xs mb-1 uppercase tracking-wider">{t.usdJpyRate}</label>
            <input
              type="number"
              value={usdJpy}
              onChange={(e) => setUsdJpy(Number(e.target.value))}
              className="number-input w-full rounded-xl px-3 py-2 text-sm neon-focus"
            />
            <div className="text-violet-300 text-xs mt-0.5">{t.rateNote}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <label className="text-violet-100 text-xs">{t.showDirect}</label>
          <button
            onClick={() => setShowDirect((v) => !v)}
            className={`w-9 h-5 rounded-full transition-all relative toggle-track ${showDirect ? "toggle-track-on" : ""}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                showDirect ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-violet-300 text-xs">{t.showDirectNote}</span>
        </div>
      </section>

      {/* ─── フィルタ ─── */}
      <section className="glass-card rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-violet-200 text-xs self-center mr-1">{t.filterProvider}</span>
            {(["all", ...providers] as const).map((p) => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  providerFilter === p
                    ? "bg-violet-600 text-white tab-active-glow"
                    : "glass-card text-violet-200 hover:text-white"
                }`}
              >
                {p === "all" ? t.filterAll : p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-violet-200 text-xs self-center mr-1">{t.filterPrice}</span>
            {([
              ["all", t.filterAll],
              ["cheap", t.filterCheap],
              ["mid", t.filterMid],
              ["expensive", t.filterExpensive],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setPriceRange(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  priceRange === v
                    ? "bg-violet-600 text-white tab-active-glow"
                    : "glass-card text-violet-200 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-violet-200 text-xs self-center mr-1">{t.filterCtx}</span>
            {([
              ["all", t.filterAll],
              ["long", t.filterLong],
              ["short", t.filterShort],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setContextFilter(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  contextFilter === v
                    ? "bg-violet-600 text-white tab-active-glow"
                    : "glass-card text-violet-200 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 比較表 ─── */}
      <section className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                <th className="text-left px-4 py-3 text-violet-200 font-medium w-48">
                  <SortBtn col="name" label={t.colModel} />
                </th>
                <th className="text-right px-4 py-3 text-violet-200 font-medium">
                  <SortBtn col="inputPer1M" label={t.colInput} />
                </th>
                <th className="text-right px-4 py-3 text-violet-200 font-medium">
                  <SortBtn col="outputPer1M" label={t.colOutput} />
                </th>
                {showDirect && (
                  <th className="text-right px-4 py-3 text-violet-200 font-medium whitespace-nowrap">
                    {t.colDirectDiff}
                  </th>
                )}
                <th className="text-right px-4 py-3 text-violet-200 font-medium">
                  <SortBtn col="contextK" label={t.colCtx} />
                </th>
                <th className="text-right px-4 py-3 text-violet-200 font-medium whitespace-nowrap">
                  {t.colCost}
                </th>
                <th className="text-right px-4 py-3 text-violet-200 font-medium whitespace-nowrap">
                  {t.colJpy}
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
                    className={`border-b border-white/5 table-row-stripe ${
                      isCheapest ? "bg-yellow-900/10" : i % 2 === 0 ? "" : "bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isCheapest && (
                          <span className="text-yellow-400 text-base" title="Cheapest">★</span>
                        )}
                        <div>
                          <div className="text-white font-medium">{m.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                            <span className={`text-xs ${col.text}`}>{m.provider}</span>
                            {m.tags.includes("oss") && (
                              <span className="text-xs text-violet-300 bg-violet-900/30 px-1 rounded">{t.tagOss}</span>
                            )}
                            {m.tags.includes("reasoning") && (
                              <span className="text-xs text-purple-400 bg-purple-900/30 px-1 rounded">{t.tagReasoning}</span>
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
                          <span className="text-cyan-300 text-xs">{t.sameAsDirectLabel}</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <span className="text-violet-200 font-mono text-xs">
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
                      <span className="font-mono text-xs text-cyan-300">{fmtJPY(cost)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="py-16 text-center text-violet-300">{t.noResults}</div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-violet-200">
          <span>{t.tableFooter(inputTokens, outputTokens)}</span>
          <span>{t.cheapestNote}</span>
          <span>{t.ctxNote}</span>
        </div>
      </section>

      {/* ─── OpenRouter vs 直接API 解説 ─── */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-white font-bold text-base mb-3">{t.orVsDirectTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-violet-200 font-bold">{t.orMeritsTitle}</span>
            </div>
            <ul className="text-violet-100 text-xs space-y-1.5">
              {t.orMerits.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-300 font-bold">{t.directMeritsTitle}</span>
            </div>
            <ul className="text-violet-100 text-xs space-y-1.5">
              {t.directMerits.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-4 py-3 text-xs text-yellow-300/80">
          <strong>{lang === "ja" ? "目安：" : "Rule of thumb: "}</strong>{t.orVsDirectTip}
        </div>
      </section>

      {/* ─── 注釈 ─── */}
      <p className="text-violet-200 text-xs text-center pb-2">
        {t.footerNote}
      </p>

      {/* ─── 使い方ガイド ─── */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white/90 text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── FAQ ─── */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-white/90 text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── JSON-LD FAQPage ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "OpenRouterの料金は直接APIより高いですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "多くのモデルで0〜10%程度のマージンが上乗せされます。GPT-4oやClaude等は約10%高くなりますが、Llama・DeepSeekなどのOSSモデルは直接APIと同価格です。" },
              },
              {
                "@type": "Question",
                "name": "1Mトークンとはどのくらいの量ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "英語で約75万語、日本語で約60万文字程度です。中程度の小説1冊分、またはコードベース数万行に相当します。" },
              },
              {
                "@type": "Question",
                "name": "日本円での支払いは可能ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "OpenRouterはUSD決済のみです。クレジットカード（海外決済対応）でプリペイドクレジットを購入する形式です。" },
              },
            ],
          }),
        }}
      />

      {/* ─── CTA ─── */}
      <section className="gradient-border-box glass-card-bright rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3 result-card-glow">
        <div>
          <p className="text-white font-bold text-sm">{t.ctaTitle}</p>
          <p className="text-violet-200 text-xs mt-0.5">{t.ctaDesc}</p>
        </div>
        <a
          href="https://openrouter.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap tab-active-glow"
        >
          {t.ctaBtn}
        </a>
      </section>

      {/* ─── 関連ツール ─── */}
      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200 group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm group-hover:text-violet-100 transition-colors">{link.label}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "OpenRouter 料金比較",
  "description": "OpenRouter経由で使える主要LLMモデルのAPI料金・速度・性能を一覧比較",
  "url": "https://tools.loresync.dev/openrouter-pricing",
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
