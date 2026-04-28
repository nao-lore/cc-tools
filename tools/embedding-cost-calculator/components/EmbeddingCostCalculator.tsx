"use client";

import { useState, useMemo, useCallback } from "react";

// --- 型定義 ---
type PricingUnit = "per_1m_tokens" | "per_1k_chars";

type EmbeddingModel = {
  id: string;
  name: string;
  provider: string;
  price: number;
  unit: PricingUnit;
  dimensions: number;
  notes?: string;
};

// --- 料金データ ---
const MODELS: EmbeddingModel[] = [
  {
    id: "openai-small",
    name: "text-embedding-3-small",
    provider: "OpenAI",
    price: 0.02,
    unit: "per_1m_tokens",
    dimensions: 1536,
  },
  {
    id: "openai-large",
    name: "text-embedding-3-large",
    provider: "OpenAI",
    price: 0.13,
    unit: "per_1m_tokens",
    dimensions: 3072,
  },
  {
    id: "cohere-english",
    name: "embed-english-v3",
    provider: "Cohere",
    price: 0.10,
    unit: "per_1m_tokens",
    dimensions: 1024,
  },
  {
    id: "cohere-multilingual",
    name: "embed-multilingual-v3",
    provider: "Cohere",
    price: 0.10,
    unit: "per_1m_tokens",
    dimensions: 1024,
    notes: "多言語対応",
  },
  {
    id: "voyage-3",
    name: "voyage-3",
    provider: "Voyage",
    price: 0.06,
    unit: "per_1m_tokens",
    dimensions: 1024,
  },
  {
    id: "voyage-3-lite",
    name: "voyage-3-lite",
    provider: "Voyage",
    price: 0.02,
    unit: "per_1m_tokens",
    dimensions: 512,
  },
  {
    id: "google-text-004",
    name: "text-embedding-004",
    provider: "Google",
    price: 0.00025,
    unit: "per_1k_chars",
    dimensions: 768,
    notes: "$0.00025/1K文字",
  },
  {
    id: "jina-v3",
    name: "jina-embeddings-v3",
    provider: "Jina",
    price: 0.02,
    unit: "per_1m_tokens",
    dimensions: 1024,
  },
];

const PROVIDER_COLORS: Record<string, { badge: string }> = {
  OpenAI:  { badge: "bg-green-500/20 text-green-300 border border-green-500/30" },
  Cohere:  { badge: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  Voyage:  { badge: "bg-orange-500/20 text-orange-300 border border-orange-500/30" },
  Google:  { badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  Jina:    { badge: "bg-pink-500/20 text-pink-300 border border-pink-500/30" },
};

type Lang = "ja" | "en";

// --- 翻訳定数 ---
const T = {
  ja: {
    // Section headings
    inputTitle: "データ規模を入力",
    compareTitle: "全プロバイダー 料金比較",
    detailTitle: "詳細コスト分析",
    monthlyTitle: "月間更新（増分Embedding）コスト",
    storageTitle: "ベクトルストレージ見積もり",
    guideTitle: "使い方ガイド",
    faqTitle: "よくある質問",
    relatedTitle: "関連ツール",
    // Input labels
    numDocsLabel: "ドキュメント数（ベクトル化する件数）",
    numDocsHint: "RAGのドキュメント数、商品数、記事数など",
    numDocsUnit: "件",
    inputModeChars: "文字数で入力",
    inputModeTokens: "トークン数で入力",
    charsLabel: "1ドキュメントあたりの平均文字数",
    charsUnit: "文字",
    tokensLabel: "1ドキュメントあたりのトークン数",
    tokensUnit: "tokens",
    tokenEstHint: (n: number) => `推定トークン数: ${n.toLocaleString()} tokens/doc（日本語換算 × 1.7）`,
    exchangeLabel: "為替レート",
    exchangePrefix: "1 USD =",
    exchangeUnit: "円",
    // Summary labels
    totalDocsLabel: "総ドキュメント数",
    totalDocsUnit: "件",
    totalTokensLabel: "総トークン数",
    totalCharsLabel: "総文字数",
    // Table headers
    provider: "プロバイダー",
    model: "モデル",
    unitPrice: "単価",
    dimensions: "次元数",
    initialCost: "初回コスト",
    storage: "ストレージ",
    selected: "← 選択中",
    cheapest: "最安",
    tableHint: "行をクリックすると詳細パネルに反映されます",
    // Detail panel
    initialCostLabel: (n: number) => `初回埋め込みコスト（${n.toLocaleString()} 件）`,
    realtimeLabel: "リアルタイム処理",
    batchLabel: "バッチ処理（-50%）",
    monthlyIncrLabel: (n: number) => `月間増分（${n.toLocaleString()} 件）`,
    storageLabel: "ストレージ（float32）",
    breakdownTitle: "コスト内訳",
    batchNote: "バッチ処理（-50%）の場合",
    // Monthly table
    monthlyNewDocsLabel: "月間追加ドキュメント数",
    monthlyNewDocsHint: "新規記事・商品・データの毎月の追加件数",
    monthlyNewDocsUnit: "件/月",
    providerModel: "プロバイダー / モデル",
    monthlyCostHeader: "月間コスト",
    yearlyCostHeader: "年間コスト",
    jpyMonthHeader: "円換算/月",
    // Storage
    storageHint: (n: number) => `float32（4 bytes）× 次元数 × ${n.toLocaleString()} ベクトル数`,
    storageNote: "※ メタデータ・インデックス・オーバーヘッドは含みません。実際のDBサイズはこの1.5〜3倍程度になることがあります。",
    // Footer note
    footerNote: "料金は変更される場合があります。バッチ割引はOpenAI Batch APIを参考値として使用（50%割引）。最新の料金は各社の公式サイトをご確認ください。",
    // Guide
    guide: [
      { step: "1", title: "ドキュメント数を入力", desc: "RAGに投入するファイル・記事・商品数など、ベクトル化するデータ件数をスライダーで設定します。" },
      { step: "2", title: "文字数またはトークン数を指定", desc: "1件あたりの平均文字数を入力してください。日本語は1文字≒1.7トークンで自動換算されます。" },
      { step: "3", title: "比較表で最安モデルを確認", desc: "全プロバイダーのコストが安い順に並びます。行をクリックすると詳細パネルに反映されます。" },
      { step: "4", title: "月間コスト・ストレージも確認", desc: "月間追加件数を設定すると運用コストも試算できます。ストレージ見積もりも同時に表示されます。" },
    ],
    // FAQ
    faq: [
      {
        q: "Embeddingとは何ですか？",
        a: "テキストを数値ベクトルに変換する処理です。RAGやセマンティック検索でテキストの「意味的な近さ」を計算するために使われます。",
      },
      {
        q: "text-embedding-3-smallとlargeの違いは？",
        a: "smallは1536次元・$0.02/1Mトークン、largeは3072次元・$0.13/1Mトークンです。精度が必要な本番用途にはlarge、コスト重視ならsmallが一般的です。",
      },
      {
        q: "バッチ処理で50%割引とはどういう意味ですか？",
        a: "OpenAI Batch APIを使うと、即時処理ではなく数時間以内の非同期処理と引き換えにコストが半額になります。初回インジェストなど急がない処理に最適です。",
      },
      {
        q: "ストレージのサイズはどう計算されますか？",
        a: "float32（4バイト）×次元数×ベクトル数で計算しています。メタデータやインデックスのオーバーヘッドは含まないため、実際のDBサイズはこの1.5〜3倍程度になります。",
      },
    ],
    // Related
    relatedLinks: [
      { href: "/rag-cost-estimator", label: "RAGコスト見積もり", desc: "Embedding+ベクトルDB+LLM推論の総コストを試算" },
      { href: "/ai-cost-calculator", label: "AIコスト計算機", desc: "LLM APIの料金を用途別に計算" },
    ],
    // Provider notes (multilingual)
    multilingualNote: "多言語対応",
  },
  en: {
    // Section headings
    inputTitle: "Enter Data Scale",
    compareTitle: "All Providers — Price Comparison",
    detailTitle: "Detailed Cost Analysis",
    monthlyTitle: "Monthly Update (Incremental Embedding) Cost",
    storageTitle: "Vector Storage Estimate",
    guideTitle: "How to Use",
    faqTitle: "FAQ",
    relatedTitle: "Related Tools",
    // Input labels
    numDocsLabel: "Document Count (vectors to embed)",
    numDocsHint: "RAG docs, product listings, articles, etc.",
    numDocsUnit: "docs",
    inputModeChars: "Enter by characters",
    inputModeTokens: "Enter by tokens",
    charsLabel: "Average characters per document",
    charsUnit: "chars",
    tokensLabel: "Tokens per document",
    tokensUnit: "tokens",
    tokenEstHint: (n: number) => `Estimated tokens: ${n.toLocaleString()} tokens/doc (JP × 1.7)`,
    exchangeLabel: "Exchange Rate",
    exchangePrefix: "1 USD =",
    exchangeUnit: "JPY",
    // Summary labels
    totalDocsLabel: "Total Documents",
    totalDocsUnit: "docs",
    totalTokensLabel: "Total Tokens",
    totalCharsLabel: "Total Characters",
    // Table headers
    provider: "Provider",
    model: "Model",
    unitPrice: "Unit Price",
    dimensions: "Dimensions",
    initialCost: "Initial Cost",
    storage: "Storage",
    selected: "← selected",
    cheapest: "cheapest",
    tableHint: "Click a row to reflect in the detail panel",
    // Detail panel
    initialCostLabel: (n: number) => `Initial embedding cost (${n.toLocaleString()} docs)`,
    realtimeLabel: "Realtime",
    batchLabel: "Batch (-50%)",
    monthlyIncrLabel: (n: number) => `Monthly incr. (${n.toLocaleString()} docs)`,
    storageLabel: "Storage (float32)",
    breakdownTitle: "Cost Breakdown",
    batchNote: "With batch processing (-50%)",
    // Monthly table
    monthlyNewDocsLabel: "Monthly new documents",
    monthlyNewDocsHint: "New articles, products, or data added each month",
    monthlyNewDocsUnit: "docs/mo",
    providerModel: "Provider / Model",
    monthlyCostHeader: "Monthly Cost",
    yearlyCostHeader: "Yearly Cost",
    jpyMonthHeader: "JPY/mo",
    // Storage
    storageHint: (n: number) => `float32 (4 bytes) × dimensions × ${n.toLocaleString()} vectors`,
    storageNote: "* Excludes metadata, index, and overhead. Actual DB size is typically 1.5–3× this value.",
    // Footer note
    footerNote: "Prices may change. Batch discount uses OpenAI Batch API as reference (50% off). Check each provider's official site for the latest rates.",
    // Guide
    guide: [
      { step: "1", title: "Enter document count", desc: "Set the number of files, articles, or products to vectorize using the slider." },
      { step: "2", title: "Specify characters or tokens", desc: "Enter average characters per document. Japanese text auto-converts at ≈1.7 tokens/char." },
      { step: "3", title: "Find the cheapest model", desc: "All providers are sorted by cost ascending. Click a row to see details." },
      { step: "4", title: "Check monthly cost and storage", desc: "Set monthly additions to estimate ongoing costs. Storage estimates are shown simultaneously." },
    ],
    // FAQ
    faq: [
      {
        q: "What is Embedding?",
        a: "Embedding converts text into numerical vectors. Used in RAG and semantic search to compute the 'semantic closeness' of texts.",
      },
      {
        q: "What is the difference between text-embedding-3-small and large?",
        a: "Small: 1536 dims at $0.02/1M tokens. Large: 3072 dims at $0.13/1M tokens. Use large for production accuracy, small for cost-sensitive workloads.",
      },
      {
        q: "What does 50% batch discount mean?",
        a: "Using OpenAI Batch API halves the cost in exchange for async processing (within a few hours). Ideal for non-urgent initial ingests.",
      },
      {
        q: "How is storage size calculated?",
        a: "float32 (4 bytes) × dimensions × vector count. Metadata, indexes, and overhead are excluded — actual DB size is typically 1.5–3× this value.",
      },
    ],
    // Related
    relatedLinks: [
      { href: "/rag-cost-estimator", label: "RAG Cost Estimator", desc: "Estimate total cost: Embedding + vector DB + LLM inference" },
      { href: "/ai-cost-calculator", label: "AI Cost Calculator", desc: "Calculate LLM API costs by use case" },
    ],
    // Provider notes (multilingual)
    multilingualNote: "multilingual",
  },
} as const;

// --- ユーティリティ ---
function fmtUSD(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// トークン数の計算: char数から推定
function charsToTokens(chars: number): number {
  // 日本語平均: 1文字 ≈ 1.7 tokens
  return Math.round(chars * 1.7);
}

// モデルのコストを計算 (USD)
function calcCost(model: EmbeddingModel, numDocs: number, tokensPerDoc: number, charsPerDoc: number): number {
  if (model.unit === "per_1m_tokens") {
    const totalTokens = numDocs * tokensPerDoc;
    return (totalTokens / 1_000_000) * model.price;
  } else {
    // per_1k_chars
    const totalChars = numDocs * charsPerDoc;
    return (totalChars / 1000) * model.price;
  }
}

// ストレージ計算 (bytes): float32 = 4 bytes/次元
function calcStorage(dimensions: number, numVectors: number): number {
  return 4 * dimensions * numVectors;
}

// --- メインコンポーネント ---
export default function EmbeddingCostCalculator() {
  const [lang, setLang] = useState<Lang>("ja");
  const t = T[lang];

  // 入力パラメーター
  const [numDocs, setNumDocs] = useState<number>(100_000);
  const [avgCharsPerDoc, setAvgCharsPerDoc] = useState<number>(500);
  const [useTokenMode, setUseTokenMode] = useState<boolean>(false);
  const [manualTokens, setManualTokens] = useState<number>(300);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  // 月間更新
  const [monthlyNewDocs, setMonthlyNewDocs] = useState<number>(10_000);

  // バッチ割引率
  const BATCH_DISCOUNT = 0.5;

  // トークン数（モード依存）
  const tokensPerDoc = useMemo(() => {
    if (useTokenMode) return manualTokens;
    return charsToTokens(avgCharsPerDoc);
  }, [useTokenMode, manualTokens, avgCharsPerDoc]);

  const charsPerDoc = avgCharsPerDoc;

  // 全モデルのコスト計算
  const modelResults = useMemo(() => {
    return MODELS.map((m) => {
      const totalCost = calcCost(m, numDocs, tokensPerDoc, charsPerDoc);
      const monthlyCost = calcCost(m, monthlyNewDocs, tokensPerDoc, charsPerDoc);
      const storage = calcStorage(m.dimensions, numDocs);
      return { ...m, totalCost, monthlyCost, storage };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [numDocs, tokensPerDoc, charsPerDoc, monthlyNewDocs]);

  const minCost = modelResults[0]?.totalCost ?? 0;

  // 選択モデルの詳細表示用
  const [selectedId, setSelectedId] = useState<string>("openai-small");
  const selected = modelResults.find((m) => m.id === selectedId) ?? modelResults[0];

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const totalTokens = numDocs * tokensPerDoc;
  const totalChars = numDocs * charsPerDoc;

  return (
    <div className="space-y-5">
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
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(139,92,246,0.3);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #818cf8);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139,92,246,0.5), 0 2px 6px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 16px rgba(139,92,246,0.7), 0 2px 8px rgba(0,0,0,0.5);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* ===== 入力パラメーター ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.inputTitle}</h2>
        <div className="space-y-5">
          {/* ドキュメント数 */}
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-1 uppercase tracking-wider">{t.numDocsLabel}</label>
            <p className="text-xs text-violet-200 mb-2">{t.numDocsHint}</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1000}
                max={10_000_000}
                step={1000}
                value={numDocs}
                onChange={(e) => setNumDocs(Number(e.target.value))}
                className="flex-1 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={1000}
                  max={10_000_000}
                  step={1000}
                  value={numDocs}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) setNumDocs(Math.min(Math.max(v, 1000), 10_000_000));
                  }}
                  className="number-input w-28 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus"
                />
                <span className="text-xs text-violet-200 whitespace-nowrap">{t.numDocsUnit}</span>
              </div>
            </div>
          </div>

          {/* 入力モード切り替え */}
          <div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setUseTokenMode(false)}
                className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all ${
                  !useTokenMode
                    ? "bg-violet-600 text-white border-violet-600"
                    : "glass-card text-violet-200 hover:text-violet-100"
                }`}
              >
                {t.inputModeChars}
              </button>
              <button
                onClick={() => setUseTokenMode(true)}
                className={`px-3 py-1.5 text-xs rounded-xl border font-medium transition-all ${
                  useTokenMode
                    ? "bg-violet-600 text-white border-violet-600"
                    : "glass-card text-violet-200 hover:text-violet-100"
                }`}
              >
                {t.inputModeTokens}
              </button>
            </div>

            {!useTokenMode ? (
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-1 uppercase tracking-wider">{t.charsLabel}</label>
                <p className="text-xs text-violet-200 mb-2">{t.tokenEstHint(tokensPerDoc)}</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={50}
                    max={10000}
                    step={50}
                    value={avgCharsPerDoc}
                    onChange={(e) => setAvgCharsPerDoc(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={50}
                      max={10000}
                      step={50}
                      value={avgCharsPerDoc}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v)) setAvgCharsPerDoc(Math.min(Math.max(v, 50), 10000));
                      }}
                      className="number-input w-28 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus"
                    />
                    <span className="text-xs text-violet-200 whitespace-nowrap">{t.charsUnit}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.tokensLabel}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={10}
                    max={8192}
                    step={10}
                    value={manualTokens}
                    onChange={(e) => setManualTokens(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={10}
                      max={8192}
                      step={10}
                      value={manualTokens}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v)) setManualTokens(Math.min(Math.max(v, 10), 8192));
                      }}
                      className="number-input w-28 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus"
                    />
                    <span className="text-xs text-violet-200 whitespace-nowrap">{t.tokensUnit}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 総量サマリー */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-violet-200 mb-1">{t.totalDocsLabel}</div>
              <div className="text-base font-bold text-white font-mono">{numDocs.toLocaleString()} {t.totalDocsUnit}</div>
            </div>
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-violet-200 mb-1">{t.totalTokensLabel}</div>
              <div className="text-base font-bold text-white font-mono">{(totalTokens / 1_000_000).toFixed(2)} M tokens</div>
            </div>
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-violet-200 mb-1">{t.totalCharsLabel}</div>
              <div className="text-base font-bold text-white font-mono">{(totalChars / 1_000_000).toFixed(1)} M {lang === "ja" ? "文字" : "chars"}</div>
            </div>
          </div>

          {/* 為替レート */}
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.exchangeLabel}</label>
            <div className="flex items-center gap-2 w-fit">
              <span className="text-xs text-violet-200">{t.exchangePrefix}</span>
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
                className="number-input w-24 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus"
              />
              <span className="text-xs text-violet-200">{t.exchangeUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 全モデル比較表 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.compareTitle}</h2>
        <p className="text-xs text-violet-100 mb-5">
          {numDocs.toLocaleString()} {lang === "ja" ? "件" : "docs"} × {tokensPerDoc.toLocaleString()} tokens/doc {lang === "ja" ? "の初回埋め込みコスト（安い順）" : "initial embedding cost (sorted by price)"}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.provider}</th>
                <th className="text-left py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.model}</th>
                <th className="text-right py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.unitPrice}</th>
                <th className="text-right py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.dimensions}</th>
                <th className="text-right py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.initialCost}</th>
                <th className="text-right py-2.5 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.storage}</th>
              </tr>
            </thead>
            <tbody>
              {modelResults.map((m, i) => {
                const colors = PROVIDER_COLORS[m.provider] ?? PROVIDER_COLORS["OpenAI"];
                const isCheapest = m.totalCost === minCost;
                const isSelected = m.id === selectedId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => handleSelect(m.id)}
                    className={`border-b border-white/5 cursor-pointer table-row-stripe transition-colors ${
                      isSelected ? "bg-violet-500/10" : ""
                    }`}
                  >
                    <td className="py-3 pr-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {m.provider}
                      </span>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`font-medium text-sm ${isSelected ? "text-violet-100" : "text-white/90"}`}>
                        {m.name}
                      </span>
                      {m.notes && (
                        <span className="ml-1 text-xs text-violet-200">
                          {lang === "en" && m.notes === "多言語対応" ? t.multilingualNote : m.notes}
                        </span>
                      )}
                      {isSelected && <span className="ml-1.5 text-xs text-violet-400">{t.selected}</span>}
                    </td>
                    <td className="py-3 pr-2 text-right text-xs text-violet-200 font-mono">
                      {m.unit === "per_1m_tokens"
                        ? `$${m.price}/1M tok`
                        : `$${m.price}/1K chars`}
                    </td>
                    <td className="py-3 pr-2 text-right text-white/80 font-mono text-sm">{m.dimensions.toLocaleString()}</td>
                    <td className="py-3 pr-2 text-right">
                      <span className={`font-semibold font-mono ${isCheapest ? "text-cyan-300" : "text-white/90"}`}>
                        {fmtUSD(m.totalCost)}
                      </span>
                      {isCheapest && i === 0 && (
                        <span className="ml-1.5 text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-medium">{t.cheapest}</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-violet-200 text-xs font-mono">{fmtBytes(m.storage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-violet-200 mt-3">{t.tableHint}</p>
      </div>

      {/* ===== 選択モデル詳細 ===== */}
      {selected && (
        <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.detailTitle}</div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${(PROVIDER_COLORS[selected.provider] ?? PROVIDER_COLORS["OpenAI"]).badge}`}>
              {selected.provider} / {selected.name}
            </span>
          </div>

          {/* 初回コスト */}
          <div className="mb-6">
            <div className="text-xs text-violet-200 mb-2">{t.initialCostLabel(numDocs)}</div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-white glow-text tracking-tight font-mono">{fmtUSD(selected.totalCost)}</span>
              <span className="text-xl text-violet-100 font-mono">{fmtJPY(selected.totalCost * exchangeRate)}</span>
            </div>
          </div>

          {/* グリッド */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-violet-200 mb-1">{t.realtimeLabel}</div>
              <div className="text-base font-bold text-white/90 font-mono">{fmtUSD(selected.totalCost)}</div>
              <div className="text-xs text-violet-200 font-mono">{fmtJPY(selected.totalCost * exchangeRate)}</div>
            </div>
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-violet-200 mb-1">{t.batchLabel}</div>
              <div className="text-base font-bold text-cyan-300 font-mono">{fmtUSD(selected.totalCost * BATCH_DISCOUNT)}</div>
              <div className="text-xs text-violet-200 font-mono">{fmtJPY(selected.totalCost * BATCH_DISCOUNT * exchangeRate)}</div>
            </div>
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-violet-200 mb-1">{t.monthlyIncrLabel(monthlyNewDocs)}</div>
              <div className="text-base font-bold text-white/90 font-mono">{fmtUSD(selected.monthlyCost)}</div>
              <div className="text-xs text-violet-200 font-mono">{fmtJPY(selected.monthlyCost * exchangeRate)}</div>
            </div>
            <div className="glass-card rounded-xl p-3">
              <div className="text-xs text-violet-200 mb-1">{t.storageLabel}</div>
              <div className="text-base font-bold text-white/90 font-mono">{fmtBytes(selected.storage)}</div>
              <div className="text-xs text-violet-200">{selected.dimensions}{lang === "ja" ? "次元" : "dims"} × {numDocs.toLocaleString()}{lang === "ja" ? "件" : ""}</div>
            </div>
          </div>

          {/* コスト内訳 */}
          <div className="glass-card rounded-xl p-4 text-xs space-y-2">
            <div className="font-medium text-violet-100 mb-2">{t.breakdownTitle}</div>
            {selected.unit === "per_1m_tokens" ? (
              <>
                <div className="flex justify-between text-violet-200">
                  <span>{numDocs.toLocaleString()} {lang === "ja" ? "件" : "docs"} × {tokensPerDoc.toLocaleString()} tokens = {totalTokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-violet-200">{(totalTokens / 1_000_000).toFixed(4)} M tokens × ${selected.price}/1M</span>
                  <span className="font-mono text-white/90">{fmtUSD(selected.totalCost)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-violet-200">
                  <span>{numDocs.toLocaleString()} {lang === "ja" ? "件" : "docs"} × {charsPerDoc.toLocaleString()} {lang === "ja" ? "文字" : "chars"} = {totalChars.toLocaleString()} {lang === "ja" ? "文字" : "chars"}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-violet-200">{(totalChars / 1000).toFixed(1)} K chars × ${selected.price}/1K</span>
                  <span className="font-mono text-white/90">{fmtUSD(selected.totalCost)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-white/10 pt-2 text-cyan-300">
              <span>{t.batchNote}</span>
              <span className="font-mono">{fmtUSD(selected.totalCost * BATCH_DISCOUNT)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== 月間更新コスト設定 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.monthlyTitle}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-1 uppercase tracking-wider">{t.monthlyNewDocsLabel}</label>
            <p className="text-xs text-violet-200 mb-2">{t.monthlyNewDocsHint}</p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={100}
                max={1_000_000}
                step={100}
                value={monthlyNewDocs}
                onChange={(e) => setMonthlyNewDocs(Number(e.target.value))}
                className="flex-1 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={100}
                  max={1_000_000}
                  step={100}
                  value={monthlyNewDocs}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) setMonthlyNewDocs(Math.min(Math.max(v, 100), 1_000_000));
                  }}
                  className="number-input w-28 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus"
                />
                <span className="text-xs text-violet-200 whitespace-nowrap">{t.monthlyNewDocsUnit}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.providerModel}</th>
                  <th className="text-right py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.monthlyCostHeader}</th>
                  <th className="text-right py-2.5 pr-2 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.yearlyCostHeader}</th>
                  <th className="text-right py-2.5 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.jpyMonthHeader}</th>
                </tr>
              </thead>
              <tbody>
                {modelResults.map((m) => {
                  const colors = PROVIDER_COLORS[m.provider] ?? PROVIDER_COLORS["OpenAI"];
                  const isCheapest = m.monthlyCost === Math.min(...modelResults.map((r) => r.monthlyCost));
                  return (
                    <tr key={m.id} className="border-b border-white/5 table-row-stripe">
                      <td className="py-3 pr-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-1.5 ${colors.badge}`}>
                          {m.provider}
                        </span>
                        <span className="text-white/80 text-sm">{m.name}</span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <span className={`font-semibold font-mono ${isCheapest ? "text-cyan-300" : "text-white/90"}`}>
                          {fmtUSD(m.monthlyCost)}
                        </span>
                        {isCheapest && <span className="ml-1 text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-medium">{t.cheapest}</span>}
                      </td>
                      <td className="py-3 pr-2 text-right text-violet-200 font-mono text-sm">{fmtUSD(m.monthlyCost * 12)}</td>
                      <td className="py-3 text-right text-violet-200 text-xs font-mono">{fmtJPY(m.monthlyCost * exchangeRate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== ストレージ比較 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.storageTitle}</h2>
        <p className="text-xs text-violet-100 mb-5">{t.storageHint(numDocs)}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modelResults.map((m) => {
            const colors = PROVIDER_COLORS[m.provider] ?? PROVIDER_COLORS["OpenAI"];
            const minStorage = Math.min(...modelResults.map((r) => r.storage));
            const isSmallest = m.storage === minStorage;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isSmallest
                    ? "border-cyan-500/30 bg-cyan-500/10"
                    : "border-white/8 glass-card"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}>
                    {m.provider}
                  </span>
                  <span className="text-sm text-white/80 truncate">{m.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold font-mono ${isSmallest ? "text-cyan-300" : "text-white/90"}`}>
                    {fmtBytes(m.storage)}
                  </div>
                  <div className="text-xs text-violet-200">{m.dimensions}{lang === "ja" ? "次元" : "dims"}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-violet-200 mt-3">{t.storageNote}</p>
      </div>

      {/* フッター */}
      <p className="text-xs text-violet-200 text-center pb-2">{t.footerNote}</p>

      {/* ===== 使い方ガイド ===== */}
      <div className="glass-card rounded-2xl p-6">
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
      </div>

      {/* ===== FAQ ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-white/90 text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== JSON-LD FAQPage (日本語固定) ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Embeddingとは何ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "テキストを数値ベクトルに変換する処理です。RAGやセマンティック検索でテキストの「意味的な近さ」を計算するために使われます。" },
              },
              {
                "@type": "Question",
                "name": "バッチ処理で50%割引とはどういう意味ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "OpenAI Batch APIを使うと、即時処理ではなく数時間以内の非同期処理と引き換えにコストが半額になります。初回インジェストなど急がない処理に最適です。" },
              },
              {
                "@type": "Question",
                "name": "ストレージのサイズはどう計算されますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "float32（4バイト）×次元数×ベクトル数で計算しています。メタデータやインデックスのオーバーヘッドは含まないため、実際のDBサイズはこの1.5〜3倍程度になります。" },
              },
            ],
          }),
        }}
      />

      {/* ===== 関連ツール ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "埋め込みAPI 料金計算",
  "description": "テキスト埋め込み（Embedding）APIの料金をドキュメント数・トークン数から計算",
  "url": "https://tools.loresync.dev/embedding-cost-calculator",
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
