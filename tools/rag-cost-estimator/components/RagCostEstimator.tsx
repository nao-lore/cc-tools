"use client";

import { useState, useMemo } from "react";

// ─── 料金データ ────────────────────────────────────────────────────────────────

type EmbeddingProvider = {
  id: string;
  name: string;
  model: string;
  pricePerMTokens: number; // USD per 1M tokens
};

type VectorDBProvider = {
  id: string;
  name: string;
  storagePerGBMonth: number;  // USD/GB/month (0 = included in flat fee)
  readsPer1MQueries: number;  // USD per 1M read queries (0 = included)
  flatFeeMonth: number;       // USD/month flat fee (0 = none)
  freeVectors: number;        // free vector count (0 = none)
  freeStorageGB: number;      // free storage GB (0 = none)
  note: string;
};

type LLMProvider = {
  id: string;
  name: string;
  model: string;
  inputPer1M: number;   // USD per 1M input tokens
  outputPer1M: number;  // USD per 1M output tokens
};

const EMBEDDING_PROVIDERS: EmbeddingProvider[] = [
  { id: "oai-small",   name: "OpenAI",  model: "text-embedding-3-small", pricePerMTokens: 0.02  },
  { id: "oai-large",   name: "OpenAI",  model: "text-embedding-3-large", pricePerMTokens: 0.13  },
  { id: "cohere",      name: "Cohere",  model: "embed-v3",               pricePerMTokens: 0.10  },
  { id: "voyage",      name: "Voyage",  model: "voyage-3",               pricePerMTokens: 0.06  },
];

const VECTOR_DB_PROVIDERS: VectorDBProvider[] = [
  {
    id: "pinecone",
    name: "Pinecone Serverless",
    storagePerGBMonth: 0.33,
    readsPer1MQueries: 8.0,
    flatFeeMonth: 0,
    freeVectors: 0,
    freeStorageGB: 0,
    note: "$0.33/GB保存 + $8/1Mクエリ",
  },
  {
    id: "weaviate-free",
    name: "Weaviate Cloud Free",
    storagePerGBMonth: 0,
    readsPer1MQueries: 0,
    flatFeeMonth: 0,
    freeVectors: 1_000_000,
    freeStorageGB: 0,
    note: "100万ベクトルまで無料",
  },
  {
    id: "weaviate-std",
    name: "Weaviate Cloud Standard",
    storagePerGBMonth: 0,
    readsPer1MQueries: 0,
    flatFeeMonth: 25,
    freeVectors: 0,
    freeStorageGB: 0,
    note: "月額$25固定",
  },
  {
    id: "qdrant-free",
    name: "Qdrant Cloud Free",
    storagePerGBMonth: 0,
    readsPer1MQueries: 0,
    flatFeeMonth: 0,
    freeVectors: 0,
    freeStorageGB: 1,
    note: "1GBまで無料",
  },
  {
    id: "qdrant-paid",
    name: "Qdrant Cloud Paid",
    storagePerGBMonth: 0.085,
    readsPer1MQueries: 0,
    flatFeeMonth: 0,
    freeVectors: 0,
    freeStorageGB: 0,
    note: "$0.085/GB/月",
  },
  {
    id: "supabase",
    name: "Supabase pgvector",
    storagePerGBMonth: 0,
    readsPer1MQueries: 0,
    flatFeeMonth: 25,
    freeVectors: 0,
    freeStorageGB: 0,
    note: "Pro $25/月に含む",
  },
];

const LLM_PROVIDERS: LLMProvider[] = [
  { id: "gpt4o",        name: "OpenAI",    model: "GPT-4o",            inputPer1M: 2.50,  outputPer1M: 10.00 },
  { id: "sonnet4",      name: "Anthropic", model: "Claude Sonnet 4",   inputPer1M: 3.00,  outputPer1M: 15.00 },
  { id: "gemini-flash", name: "Google",    model: "Gemini 2.5 Flash",  inputPer1M: 0.15,  outputPer1M: 0.60  },
];

// ─── 翻訳定数 ─────────────────────────────────────────────────────────────────

type Lang = "ja" | "en";

const T = {
  ja: {
    // Section headings
    docSettings: "ドキュメント設定",
    querySettings: "クエリ設定",
    providerSelection: "プロバイダー選択",
    embeddingModel: "Embedding モデル",
    vectorDB: "ベクトルDB",
    llmModel: "LLM 推論モデル",
    exchangeRate: "為替レート",
    costBreakdown: "コスト内訳",
    scaleSim: "スケールシミュレーション",
    scaleSimSub: "現在の設定を基準にスケールした場合のコスト変化",
    topCombos: "プロバイダー組み合わせ比較 — 最安 Top 3",
    topCombosSub: "現在のドキュメント・クエリ設定で全組み合わせを試算した結果",
    guideTitle: "使い方ガイド",
    faqTitle: "よくある質問",
    relatedTools: "関連ツール",
    // Labels
    docCount: "総ドキュメント数",
    docCountHint: "（現在の全ドキュメント数）",
    tokensPerDoc: "平均トークン数 / ドキュメント",
    tokensPerDocHint: "（チャンク後の1チャンク平均）",
    monthlyNewDocs: "月次追加ドキュメント数",
    monthlyNewDocsHint: "（毎月の増分）",
    queriesPerDay: "1日あたりのクエリ数",
    topK: "top-k（検索チャンク取得数）",
    topKHint: "（ベクトル検索で取得する上位件数）",
    contextTokens: "コンテキストトークン数 / チャンク",
    contextTokensHint: "（LLMに渡す1チャンクあたりのトークン数）",
    outputTokens: "LLM 出力トークン数 / クエリ",
    usd: "1 USD =",
    yen: "円",
    // Result labels
    monthlyTotal: "月額合計（継続コスト）",
    initialIngest: "初回インジェスト",
    initialIngestNote: "（初期のみ一回払い）",
    detailBreakdown: "詳細内訳",
    embeddingInitialDetail: "Embedding 初回インジェスト",
    embeddingMonthlyDetail: "Embedding 月次増分",
    dbStorageDetail: "ベクトルDB 保存",
    dbQueryDetail: "ベクトルDB 検索",
    llmDetail: "LLM 推論",
    monthlyTotalDetail: "月額合計（継続）",
    perMonth: "/月",
    perMonthUnit: "件/月",
    perDayUnit: "回/日",
    unit: "件",
    tokensUnit: "tokens",
    // Scale labels
    current: "現在",
    doc10x: "ドキュメント 10倍",
    query10x: "クエリ 10倍",
    embedding: "Embedding",
    vectorDBLabel: "ベクトルDB",
    llm: "LLM",
    // Cost bar labels
    embeddingIncrement: "Embedding 増分",
    dbStorage: "ベクトルDB 保存",
    dbQuery: "ベクトルDB 検索",
    llmInference: "LLM 推論",
    // Combo
    currentSelection: "← 現在の選択",
    freeNote: "注: 無料枠（Weaviate Free / Qdrant Free）はドキュメント数・ストレージが上限内の場合のみ$0として計算されます。",
    perMToken: "/1Mトークン",
    // Guide steps
    guide: [
      { step: "1", title: "ドキュメント設定を入力", desc: "RAGに投入するドキュメント総数・平均トークン数・月次増分を設定します。チャンク後の1チャンクを1ドキュメントとして換算してください。" },
      { step: "2", title: "クエリ設定を調整", desc: "1日あたりのクエリ数・top-k・コンテキストトークン数を入力します。top-kはベクトル検索で取得するチャンク数です。" },
      { step: "3", title: "プロバイダーを選択", desc: "Embedding・ベクトルDB・LLMをそれぞれ選択します。組み合わせに応じてリアルタイムで月額コストが更新されます。" },
      { step: "4", title: "最安構成 Top 3 を確認", desc: "全組み合わせを自動試算した結果が下部に表示されます。無料枠（Weaviate・Qdrant）は条件内で$0として計算されます。" },
    ],
    // FAQ
    faq: [
      { q: "RAGのコストで最も高い部分はどこですか？", a: "クエリ数が多い場合はLLM推論コストが支配的になります。ドキュメント数が多い場合はEmbedding初回インジェストとベクトルDBストレージが大きくなります。" },
      { q: "Pineconeは高いですか？", a: "Serverlessプランは$0.33/GB/月+$8/1Mクエリです。小規模なら安価ですが、大量クエリ時はQdrantやWeaviateの定額プランの方が安くなる場合があります。" },
      { q: "top-kを増やすとコストが上がりますか？", a: "はい。top-kを増やすとLLMに渡すコンテキストトークン数が増えるため、LLM推論コストが線形に増加します。精度と費用のトレードオフを確認してください。" },
      { q: "無料枠だけでRAGを構築できますか？", a: "Weaviate Cloud Freeは100万ベクトルまで、Qdrant Freeは1GBまで無料です。小規模なPOCや個人プロジェクトなら無料枠のみで運用可能です。" },
    ],
    // Related links
    relatedLinks: [
      { href: "/embedding-cost-calculator", title: "Embedding料金計算機", desc: "OpenAI・Cohere・Voyage等のEmbeddingコストを詳細試算" },
      { href: "/vector-db-comparison", title: "ベクトルDB比較", desc: "Pinecone・Weaviate・Qdrant等の料金・機能を比較" },
    ],
    footerNote: "料金は変更される場合があります。LLM入力トークンはシステムプロンプト200トークン+コンテキスト+クエリ100トークンで計算。最新の料金は各社公式サイトをご確認ください。",
    storageSuffix: "（1536次元 float32 × オーバーヘッド1.5倍）",
    estimatedStorage: "推定ストレージ:",
    mTokens: "Mトークン",
    queriesPerMonth: "クエリ/月",
    tokens: "tokens",
    inputLabel: "in:",
    outputLabel: "out:",
  },
  en: {
    // Section headings
    docSettings: "Document Settings",
    querySettings: "Query Settings",
    providerSelection: "Provider Selection",
    embeddingModel: "Embedding Model",
    vectorDB: "Vector DB",
    llmModel: "LLM Inference Model",
    exchangeRate: "Exchange Rate",
    costBreakdown: "Cost Breakdown",
    scaleSim: "Scale Simulation",
    scaleSimSub: "Cost changes when scaling from the current configuration",
    topCombos: "Provider Combos — Cheapest Top 3",
    topCombosSub: "All combinations estimated with current document & query settings",
    guideTitle: "How to Use",
    faqTitle: "FAQ",
    relatedTools: "Related Tools",
    // Labels
    docCount: "Total Document Count",
    docCountHint: "(current total documents)",
    tokensPerDoc: "Avg Tokens / Document",
    tokensPerDocHint: "(avg tokens per chunk after chunking)",
    monthlyNewDocs: "Monthly New Documents",
    monthlyNewDocsHint: "(monthly increment)",
    queriesPerDay: "Queries per Day",
    topK: "top-k (chunks retrieved)",
    topKHint: "(top results from vector search)",
    contextTokens: "Context Tokens / Chunk",
    contextTokensHint: "(tokens per chunk sent to LLM)",
    outputTokens: "LLM Output Tokens / Query",
    usd: "1 USD =",
    yen: "JPY",
    // Result labels
    monthlyTotal: "Monthly Total (recurring cost)",
    initialIngest: "Initial Ingest",
    initialIngestNote: "(one-time only)",
    detailBreakdown: "Detailed Breakdown",
    embeddingInitialDetail: "Embedding Initial Ingest",
    embeddingMonthlyDetail: "Embedding Monthly Increment",
    dbStorageDetail: "Vector DB Storage",
    dbQueryDetail: "Vector DB Queries",
    llmDetail: "LLM Inference",
    monthlyTotalDetail: "Monthly Total (recurring)",
    perMonth: "/mo",
    perMonthUnit: "docs/mo",
    perDayUnit: "req/day",
    unit: "docs",
    tokensUnit: "tokens",
    // Scale labels
    current: "Current",
    doc10x: "Docs ×10",
    query10x: "Queries ×10",
    embedding: "Embedding",
    vectorDBLabel: "Vector DB",
    llm: "LLM",
    // Cost bar labels
    embeddingIncrement: "Embedding Increment",
    dbStorage: "Vector DB Storage",
    dbQuery: "Vector DB Queries",
    llmInference: "LLM Inference",
    // Combo
    currentSelection: "← current selection",
    freeNote: "Note: Free tiers (Weaviate Free / Qdrant Free) are calculated as $0 only when document count / storage is within the free limit.",
    perMToken: "/1M tokens",
    // Guide steps
    guide: [
      { step: "1", title: "Enter Document Settings", desc: "Set total documents, average tokens per chunk, and monthly increment. Treat each post-chunking chunk as one document." },
      { step: "2", title: "Adjust Query Settings", desc: "Enter daily queries, top-k, and context token counts. top-k is the number of chunks retrieved per vector search." },
      { step: "3", title: "Select Providers", desc: "Choose Embedding, Vector DB, and LLM separately. Monthly cost updates in real-time as you change the combination." },
      { step: "4", title: "Review Cheapest Top 3", desc: "All combinations are automatically estimated and shown at the bottom. Free tiers (Weaviate/Qdrant) are $0 when within limits." },
    ],
    // FAQ
    faq: [
      { q: "Which part of RAG costs the most?", a: "When query volume is high, LLM inference dominates. When document count is high, the initial embedding ingest and vector DB storage become significant." },
      { q: "Is Pinecone expensive?", a: "The Serverless plan charges $0.33/GB/month + $8/1M queries. It's cheap at small scale, but at high query volumes Qdrant or Weaviate flat-fee plans may be cheaper." },
      { q: "Does increasing top-k raise costs?", a: "Yes. More top-k means more context tokens sent to the LLM, so LLM inference cost grows linearly. Balance accuracy against cost." },
      { q: "Can I build a RAG system on free tiers only?", a: "Weaviate Cloud Free supports up to 1M vectors; Qdrant Free up to 1GB. Small POCs and personal projects can run entirely on free tiers." },
    ],
    // Related links
    relatedLinks: [
      { href: "/embedding-cost-calculator", title: "Embedding Cost Calculator", desc: "Detailed cost estimates for OpenAI, Cohere, Voyage and more." },
      { href: "/vector-db-comparison", title: "Vector DB Comparison", desc: "Compare pricing and features of Pinecone, Weaviate, Qdrant and more." },
    ],
    footerNote: "Prices are subject to change. LLM input tokens calculated as system prompt 200 tokens + context + query 100 tokens. Check each provider's official site for the latest rates.",
    storageSuffix: "(1536-dim float32 × 1.5× overhead)",
    estimatedStorage: "Est. Storage:",
    mTokens: "M tokens",
    queriesPerMonth: "queries/mo",
    tokens: "tokens",
    inputLabel: "in:",
    outputLabel: "out:",
  },
} as const;

// ─── ユーティリティ ────────────────────────────────────────────────────────────

function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.001) return `$${n.toFixed(5)}`;
  if (n < 0.01)  return `$${n.toFixed(4)}`;
  if (n < 1)     return `$${n.toFixed(3)}`;
  if (n < 100)   return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

// ─── 計算ロジック ──────────────────────────────────────────────────────────────

function estimateStorageGB(vectorCount: number): number {
  const dims = 1536;
  const bytesPerVector = dims * 4; // float32
  const overheadFactor = 1.5;
  return (vectorCount * bytesPerVector * overheadFactor) / (1024 ** 3);
}

type CostBreakdown = {
  embeddingInitial: number;
  embeddingMonthlyIncrement: number;
  dbStorageMonth: number;
  dbQueryMonth: number;
  llmMonth: number;
  totalMonth: number;
};

function calcCosts({
  docCount,
  tokensPerDoc,
  monthlyNewDocs,
  queriesPerDay,
  topK,
  contextTokensPerChunk,
  outputTokensPerQuery,
  embeddingProvider,
  vectorDBProvider,
  llmProvider,
}: {
  docCount: number;
  tokensPerDoc: number;
  monthlyNewDocs: number;
  queriesPerDay: number;
  topK: number;
  contextTokensPerChunk: number;
  outputTokensPerQuery: number;
  embeddingProvider: EmbeddingProvider;
  vectorDBProvider: VectorDBProvider;
  llmProvider: LLMProvider;
}): CostBreakdown {
  const queriesPerMonth = queriesPerDay * 30;
  const totalTokensInitial = docCount * tokensPerDoc;
  const monthlyIncrementTokens = monthlyNewDocs * tokensPerDoc;

  const embeddingInitial = (totalTokensInitial / 1_000_000) * embeddingProvider.pricePerMTokens;
  const embeddingMonthlyIncrement = (monthlyIncrementTokens / 1_000_000) * embeddingProvider.pricePerMTokens;

  const totalVectors = docCount + monthlyNewDocs;
  const storageGB = estimateStorageGB(totalVectors);
  const db = vectorDBProvider;

  let dbStorageMonth = 0;
  let dbQueryMonth = 0;

  if (db.freeVectors > 0 && totalVectors <= db.freeVectors) {
    dbStorageMonth = 0;
    dbQueryMonth = 0;
  } else if (db.freeStorageGB > 0 && storageGB <= db.freeStorageGB) {
    dbStorageMonth = 0;
    dbQueryMonth = db.readsPer1MQueries > 0 ? (queriesPerMonth / 1_000_000) * db.readsPer1MQueries : 0;
  } else {
    dbStorageMonth = db.flatFeeMonth > 0
      ? db.flatFeeMonth
      : db.storagePerGBMonth * Math.max(0, storageGB - db.freeStorageGB);
    dbQueryMonth = db.readsPer1MQueries > 0 ? (queriesPerMonth / 1_000_000) * db.readsPer1MQueries : 0;
  }

  const inputTokensPerQuery = 200 + topK * contextTokensPerChunk + 100;
  const llmInputMonth = (inputTokensPerQuery / 1_000_000) * llmProvider.inputPer1M * queriesPerMonth;
  const llmOutputMonth = (outputTokensPerQuery / 1_000_000) * llmProvider.outputPer1M * queriesPerMonth;
  const llmMonth = llmInputMonth + llmOutputMonth;

  const totalMonth = embeddingMonthlyIncrement + dbStorageMonth + dbQueryMonth + llmMonth;

  return {
    embeddingInitial,
    embeddingMonthlyIncrement,
    dbStorageMonth,
    dbQueryMonth,
    llmMonth,
    totalMonth,
  };
}

// ─── サブコンポーネント ────────────────────────────────────────────────────────

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">
        {label}
        {hint && <span className="ml-1.5 text-violet-300 font-normal normal-case">{hint}</span>}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 cursor-pointer"
        />
        <div className="flex items-center gap-1.5 shrink-0">
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
            className="number-input w-28 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus transition-all"
          />
          {unit && <span className="text-xs text-violet-200 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function CostBar({ label, value, total, colorClass }: { label: string; value: number; total: number; colorClass: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-violet-200 mb-1.5">
        <span>{label}</span>
        <span className="font-mono text-white/90">{fmtUSD(value)} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function RagCostEstimator() {
  const [lang, setLang] = useState<Lang>("ja");
  const t = T[lang];

  // ドキュメント設定
  const [docCount, setDocCount] = useState(10_000);
  const [tokensPerDoc, setTokensPerDoc] = useState(500);
  const [monthlyNewDocs, setMonthlyNewDocs] = useState(1_000);

  // クエリ設定
  const [queriesPerDay, setQueriesPerDay] = useState(500);
  const [topK, setTopK] = useState(5);
  const [contextTokensPerChunk, setContextTokensPerChunk] = useState(200);
  const [outputTokensPerQuery, setOutputTokensPerQuery] = useState(300);

  // プロバイダー選択
  const [embeddingId, setEmbeddingId] = useState("oai-small");
  const [vectorDBId, setVectorDBId] = useState("pinecone");
  const [llmId, setLlmId] = useState("gpt4o");

  // 為替レート
  const [exchangeRate, setExchangeRate] = useState(150);

  const embeddingProvider = EMBEDDING_PROVIDERS.find((p) => p.id === embeddingId) ?? EMBEDDING_PROVIDERS[0];
  const vectorDBProvider  = VECTOR_DB_PROVIDERS.find((p) => p.id === vectorDBId)  ?? VECTOR_DB_PROVIDERS[0];
  const llmProvider       = LLM_PROVIDERS.find((p) => p.id === llmId)             ?? LLM_PROVIDERS[0];

  const costs = useMemo(
    () =>
      calcCosts({
        docCount, tokensPerDoc, monthlyNewDocs,
        queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery,
        embeddingProvider, vectorDBProvider, llmProvider,
      }),
    [docCount, tokensPerDoc, monthlyNewDocs, queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery, embeddingProvider, vectorDBProvider, llmProvider]
  );

  const costsDoc10x = useMemo(
    () =>
      calcCosts({
        docCount: docCount * 10, tokensPerDoc, monthlyNewDocs: monthlyNewDocs * 10,
        queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery,
        embeddingProvider, vectorDBProvider, llmProvider,
      }),
    [docCount, tokensPerDoc, monthlyNewDocs, queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery, embeddingProvider, vectorDBProvider, llmProvider]
  );

  const costsQuery10x = useMemo(
    () =>
      calcCosts({
        docCount, tokensPerDoc, monthlyNewDocs, queriesPerDay: queriesPerDay * 10,
        topK, contextTokensPerChunk, outputTokensPerQuery,
        embeddingProvider, vectorDBProvider, llmProvider,
      }),
    [docCount, tokensPerDoc, monthlyNewDocs, queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery, embeddingProvider, vectorDBProvider, llmProvider]
  );

  const cheapestCombos = useMemo(() => {
    const results: { emb: EmbeddingProvider; db: VectorDBProvider; llm: LLMProvider; total: number }[] = [];
    for (const emb of EMBEDDING_PROVIDERS) {
      for (const db of VECTOR_DB_PROVIDERS) {
        for (const llm of LLM_PROVIDERS) {
          const c = calcCosts({
            docCount, tokensPerDoc, monthlyNewDocs,
            queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery,
            embeddingProvider: emb, vectorDBProvider: db, llmProvider: llm,
          });
          results.push({ emb, db, llm, total: c.totalMonth });
        }
      }
    }
    return results.sort((a, b) => a.total - b.total).slice(0, 3);
  }, [docCount, tokensPerDoc, monthlyNewDocs, queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery]);

  const storageGB = estimateStorageGB(docCount + monthlyNewDocs);

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
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* ===== ドキュメント設定 ===== */}
      <div className="glass-card rounded-2xl p-6 tab-panel">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.docSettings}</h2>
        <p className="text-xs text-violet-200 mb-5">
          {t.estimatedStorage} <span className="font-medium text-cyan-300 font-mono">{storageGB < 1 ? `${(storageGB * 1024).toFixed(0)} MB` : `${storageGB.toFixed(2)} GB`}</span>
          <span className="text-violet-300 ml-1">{t.storageSuffix}</span>
        </p>
        <div className="space-y-5">
          <SliderInput
            label={t.docCount}
            value={docCount}
            onChange={setDocCount}
            min={100}
            max={1_000_000}
            step={100}
            unit={t.unit}
            hint={t.docCountHint}
          />
          <SliderInput
            label={t.tokensPerDoc}
            value={tokensPerDoc}
            onChange={setTokensPerDoc}
            min={50}
            max={8_000}
            step={50}
            unit={t.tokensUnit}
            hint={t.tokensPerDocHint}
          />
          <SliderInput
            label={t.monthlyNewDocs}
            value={monthlyNewDocs}
            onChange={setMonthlyNewDocs}
            min={0}
            max={500_000}
            step={100}
            unit={t.perMonthUnit}
            hint={t.monthlyNewDocsHint}
          />
        </div>
      </div>

      {/* ===== クエリ設定 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.querySettings}</h2>
        <div className="space-y-5">
          <SliderInput
            label={t.queriesPerDay}
            value={queriesPerDay}
            onChange={setQueriesPerDay}
            min={1}
            max={100_000}
            step={1}
            unit={t.perDayUnit}
          />
          <SliderInput
            label={t.topK}
            value={topK}
            onChange={setTopK}
            min={1}
            max={20}
            step={1}
            unit={t.unit}
            hint={t.topKHint}
          />
          <SliderInput
            label={t.contextTokens}
            value={contextTokensPerChunk}
            onChange={setContextTokensPerChunk}
            min={50}
            max={2_000}
            step={50}
            unit={t.tokensUnit}
            hint={t.contextTokensHint}
          />
          <SliderInput
            label={t.outputTokens}
            value={outputTokensPerQuery}
            onChange={setOutputTokensPerQuery}
            min={50}
            max={4_000}
            step={50}
            unit={t.tokensUnit}
          />
        </div>
      </div>

      {/* ===== プロバイダー選択 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.providerSelection}</h2>

        {/* Embedding */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-violet-200 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-500/20 text-violet-300 rounded-full text-xs font-bold border border-violet-500/30">1</span>
            {t.embeddingModel}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EMBEDDING_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setEmbeddingId(p.id)}
                className={`method-btn flex items-start justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  embeddingId === p.id
                    ? "method-btn-active border-violet-500/60"
                    : "border-white/8 hover:border-violet-500/30"
                }`}
              >
                <div>
                  <div className="text-xs text-violet-300 font-medium">{p.name}</div>
                  <div className={`font-semibold text-sm mt-0.5 ${embeddingId === p.id ? "text-violet-100" : "text-white/90"}`}>{p.model}</div>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <div className="text-sm font-bold text-white/90 font-mono">${p.pricePerMTokens}</div>
                  <div className="text-xs text-violet-300">{t.perMToken}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vector DB */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-violet-200 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-500/20 text-violet-300 rounded-full text-xs font-bold border border-violet-500/30">2</span>
            {t.vectorDB}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VECTOR_DB_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setVectorDBId(p.id)}
                className={`method-btn flex items-start justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  vectorDBId === p.id
                    ? "method-btn-active border-violet-500/60"
                    : "border-white/8 hover:border-violet-500/30"
                }`}
              >
                <div>
                  <div className={`font-semibold text-sm ${vectorDBId === p.id ? "text-violet-100" : "text-white/90"}`}>{p.name}</div>
                  <div className="text-xs text-violet-300 mt-0.5">{p.note}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* LLM */}
        <div>
          <h3 className="text-xs font-semibold text-violet-200 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-500/20 text-violet-300 rounded-full text-xs font-bold border border-violet-500/30">3</span>
            {t.llmModel}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {LLM_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setLlmId(p.id)}
                className={`method-btn flex flex-col p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  llmId === p.id
                    ? "method-btn-active border-violet-500/60"
                    : "border-white/8 hover:border-violet-500/30"
                }`}
              >
                <div className="text-xs text-violet-300 font-medium">{p.name}</div>
                <div className={`font-semibold text-sm mt-0.5 ${llmId === p.id ? "text-violet-100" : "text-white/90"}`}>{p.model}</div>
                <div className="mt-2 space-y-0.5">
                  <div className="text-xs text-violet-300">{t.inputLabel} <span className="font-medium text-white/80 font-mono">${p.inputPer1M}/1M</span></div>
                  <div className="text-xs text-violet-300">{t.outputLabel} <span className="font-medium text-white/80 font-mono">${p.outputPer1M}/1M</span></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 為替レート ===== */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-violet-100 uppercase tracking-wider">{t.exchangeRate}</span>
          <span className="text-sm text-violet-300">{t.usd}</span>
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
            className="number-input w-24 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus transition-all"
          />
          <span className="text-sm text-violet-300">{t.yen}</span>
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.costBreakdown}</h2>

        {/* 月額合計 */}
        <div className="mb-6">
          <div className="text-xs text-violet-200 mb-2">{t.monthlyTotal}</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-5xl font-bold text-white glow-text tracking-tight font-mono">{fmtUSD(costs.totalMonth)}</span>
            <span className="text-xl text-violet-200 font-mono">{fmtJPY(costs.totalMonth * exchangeRate)}</span>
          </div>
          {costs.embeddingInitial > 0 && (
            <div className="mt-3 text-sm text-violet-100 glass-card rounded-xl px-4 py-2.5">
              + {t.initialIngest}: <span className="font-semibold text-white font-mono">{fmtUSD(costs.embeddingInitial)}</span>
              <span className="text-xs text-violet-300 ml-1">{t.initialIngestNote}</span>
            </div>
          )}
        </div>

        {/* コストバー */}
        <div className="space-y-3.5 mb-6">
          <CostBar
            label={`${t.embeddingIncrement}（${embeddingProvider.model}）`}
            value={costs.embeddingMonthlyIncrement}
            total={costs.totalMonth}
            colorClass="bg-violet-400"
          />
          <CostBar
            label={`${t.dbStorage}（${vectorDBProvider.name}）`}
            value={costs.dbStorageMonth}
            total={costs.totalMonth}
            colorClass="bg-indigo-400"
          />
          <CostBar
            label={t.dbQuery}
            value={costs.dbQueryMonth}
            total={costs.totalMonth}
            colorClass="bg-blue-400"
          />
          <CostBar
            label={`${t.llmInference}（${llmProvider.model}）`}
            value={costs.llmMonth}
            total={costs.totalMonth}
            colorClass="bg-purple-400"
          />
        </div>

        {/* 詳細内訳 */}
        <div className="glass-card rounded-xl p-4 text-xs space-y-2">
          <div className="font-semibold text-violet-100 mb-2">{t.detailBreakdown}</div>

          <div className="flex justify-between text-violet-200">
            <span>{t.embeddingInitialDetail}（{(docCount * tokensPerDoc / 1_000_000).toFixed(2)}{t.mTokens} × ${embeddingProvider.pricePerMTokens}/1M）</span>
            <span className="font-mono text-white/90 ml-2 shrink-0">{fmtUSD(costs.embeddingInitial)}</span>
          </div>
          <div className="flex justify-between text-violet-200">
            <span>{t.embeddingMonthlyDetail}（{(monthlyNewDocs * tokensPerDoc / 1_000_000).toFixed(3)}{t.mTokens}/{lang === "ja" ? "月" : "mo"}）</span>
            <span className="font-mono text-white/90 ml-2 shrink-0">{fmtUSD(costs.embeddingMonthlyIncrement)}{t.perMonth}</span>
          </div>
          <div className="flex justify-between text-violet-200 border-t border-white/10 pt-2 mt-1">
            <span>{t.dbStorageDetail}（{storageGB < 1 ? `${(storageGB * 1024).toFixed(0)}MB` : `${storageGB.toFixed(2)}GB`}）</span>
            <span className="font-mono text-white/90 ml-2 shrink-0">{fmtUSD(costs.dbStorageMonth)}{t.perMonth}</span>
          </div>
          <div className="flex justify-between text-violet-200">
            <span>{t.dbQueryDetail}（{(queriesPerDay * 30).toLocaleString()} {t.queriesPerMonth}）</span>
            <span className="font-mono text-white/90 ml-2 shrink-0">{fmtUSD(costs.dbQueryMonth)}{t.perMonth}</span>
          </div>
          <div className="flex justify-between text-violet-200 border-t border-white/10 pt-2 mt-1">
            <span>
              {t.llmDetail}（{lang === "ja" ? "入力" : "in"} {(200 + topK * contextTokensPerChunk + 100).toLocaleString()} {t.tokens} + {lang === "ja" ? "出力" : "out"} {outputTokensPerQuery.toLocaleString()} {t.tokens}）× {(queriesPerDay * 30).toLocaleString()} {t.queriesPerMonth}
            </span>
            <span className="font-mono text-white/90 ml-2 shrink-0">{fmtUSD(costs.llmMonth)}{t.perMonth}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 mt-1 font-semibold text-white/90">
            <span>{t.monthlyTotalDetail}</span>
            <span className="font-mono ml-2 shrink-0">{fmtUSD(costs.totalMonth)}</span>
          </div>
        </div>
      </div>

      {/* ===== スケールシミュレーション ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.scaleSim}</h2>
        <p className="text-xs text-violet-200 mb-5">{t.scaleSimSub}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: t.current, costs: costs },
            { label: t.doc10x, costs: costsDoc10x },
            { label: t.query10x, costs: costsQuery10x },
          ].map(({ label, costs: c }) => (
            <div key={label} className="glass-card-bright rounded-xl p-4">
              <div className="text-xs font-semibold text-violet-200 mb-3 uppercase tracking-wider">{label}</div>
              <div className="text-2xl font-bold text-white font-mono mb-1">{fmtUSD(c.totalMonth)}</div>
              <div className="text-sm text-violet-300 font-mono mb-3">{fmtJPY(c.totalMonth * exchangeRate)}{t.perMonth}</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-violet-200">
                  <span>{t.embedding}</span>
                  <span className="font-mono text-white/80">{fmtUSD(c.embeddingMonthlyIncrement)}</span>
                </div>
                <div className="flex justify-between text-violet-200">
                  <span>{t.vectorDBLabel}</span>
                  <span className="font-mono text-white/80">{fmtUSD(c.dbStorageMonth + c.dbQueryMonth)}</span>
                </div>
                <div className="flex justify-between text-violet-200">
                  <span>{t.llm}</span>
                  <span className="font-mono text-white/80">{fmtUSD(c.llmMonth)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 最安構成 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.topCombos}</h2>
        <p className="text-xs text-violet-200 mb-5">{t.topCombosSub}</p>

        <div className="space-y-3">
          {cheapestCombos.map((combo, i) => {
            const isCurrentSelection =
              combo.emb.id === embeddingId &&
              combo.db.id === vectorDBId &&
              combo.llm.id === llmId;
            const medalColors = [
              "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
              "bg-white/10 text-white/70 border-white/20",
              "bg-orange-500/15 text-orange-300 border-orange-500/30",
            ];
            return (
              <div
                key={`${combo.emb.id}-${combo.db.id}-${combo.llm.id}`}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isCurrentSelection
                    ? "method-btn-active border-violet-500/60"
                    : "border-white/8 table-row-stripe"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${medalColors[i]}`}>
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/90 truncate">
                      {combo.emb.model} / {combo.db.name} / {combo.llm.model}
                    </div>
                    {isCurrentSelection && (
                      <div className="text-xs text-cyan-300 font-medium mt-0.5">{t.currentSelection}</div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <div className="text-lg font-bold text-white font-mono">{fmtUSD(combo.total)}</div>
                  <div className="text-xs text-violet-300">{t.perMonth}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 glass-card rounded-xl px-4 py-3 text-xs text-violet-200 border border-violet-500/15">
          <span className="font-semibold text-violet-100">{lang === "ja" ? "注:" : "Note:"}</span> {t.freeNote.replace(/^注: |^Note: /, "")}
        </div>
      </div>

      {/* フッター */}
      <p className="text-xs text-violet-300 text-center pb-2">
        {t.footerNote}
      </p>

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

      {/* ===== JSON-LD FAQPage ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "RAGのコストで最も高い部分はどこですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "クエリ数が多い場合はLLM推論コストが支配的になります。ドキュメント数が多い場合はEmbedding初回インジェストとベクトルDBストレージが大きくなります。" },
              },
              {
                "@type": "Question",
                "name": "top-kを増やすとコストが上がりますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "はい。top-kを増やすとLLMに渡すコンテキストトークン数が増えるため、LLM推論コストが線形に増加します。精度と費用のトレードオフを確認してください。" },
              },
              {
                "@type": "Question",
                "name": "無料枠だけでRAGを構築できますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "Weaviate Cloud Freeは100万ベクトルまで、Qdrant Freeは1GBまで無料です。小規模なPOCや個人プロジェクトなら無料枠のみで運用可能です。" },
              },
            ],
          }),
        }}
      />

      {/* ===== 関連ツール ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
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
              <div className="font-medium text-white/90 text-sm group-hover:text-violet-100 transition-colors">{link.title}</div>
              <div className="text-xs text-violet-200 mt-0.5">{link.desc}</div>
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
  "name": "RAG 運用コスト試算",
  "description": "RAGシステムの月額コストをドキュメント数・クエリ数・モデル選択から試算",
  "url": "https://tools.loresync.dev/rag-cost-estimator",
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
