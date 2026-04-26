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

/**
 * ベクトルのサイズ（バイト）を推定する。
 * 一般的な埋め込みモデルの次元数は1536前後。float32換算。
 */
function estimateStorageGB(vectorCount: number): number {
  const dims = 1536;
  const bytesPerVector = dims * 4; // float32
  const overheadFactor = 1.5; // インデックスオーバーヘッド
  return (vectorCount * bytesPerVector * overheadFactor) / (1024 ** 3);
}

type CostBreakdown = {
  embeddingInitial: number;       // 初回インジェスト embedding コスト
  embeddingMonthlyIncrement: number; // 月次増分 embedding コスト
  dbStorageMonth: number;         // DB保存コスト/月
  dbQueryMonth: number;           // DB検索コスト/月
  llmMonth: number;               // LLM推論コスト/月
  totalMonth: number;             // 月額合計
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

  // 1. Embedding コスト
  const embeddingInitial = (totalTokensInitial / 1_000_000) * embeddingProvider.pricePerMTokens;
  const embeddingMonthlyIncrement = (monthlyIncrementTokens / 1_000_000) * embeddingProvider.pricePerMTokens;

  // 2. Vector DB コスト
  const totalVectors = docCount + monthlyNewDocs; // 月末時点の概算
  const storageGB = estimateStorageGB(totalVectors);
  const db = vectorDBProvider;

  let dbStorageMonth = 0;
  let dbQueryMonth = 0;

  if (db.freeVectors > 0 && totalVectors <= db.freeVectors) {
    // 無料枠内
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

  // 3. LLM 推論コスト
  // 入力 = システムプロンプト(200) + topK×contextTokensPerChunk + クエリ(100)
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
        />
        <div className="flex items-center gap-1 shrink-0">
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
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium">{fmtUSD(value)} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

// ─── メインコンポーネント ──────────────────────────────────────────────────────

export default function RagCostEstimator() {
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
      }),
    [
      docCount, tokensPerDoc, monthlyNewDocs,
      queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery,
      embeddingProvider, vectorDBProvider, llmProvider,
    ]
  );

  // スケールシミュレーション
  const costsDoc10x = useMemo(
    () =>
      calcCosts({
        docCount: docCount * 10,
        tokensPerDoc,
        monthlyNewDocs: monthlyNewDocs * 10,
        queriesPerDay,
        topK,
        contextTokensPerChunk,
        outputTokensPerQuery,
        embeddingProvider,
        vectorDBProvider,
        llmProvider,
      }),
    [
      docCount, tokensPerDoc, monthlyNewDocs,
      queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery,
      embeddingProvider, vectorDBProvider, llmProvider,
    ]
  );

  const costsQuery10x = useMemo(
    () =>
      calcCosts({
        docCount,
        tokensPerDoc,
        monthlyNewDocs,
        queriesPerDay: queriesPerDay * 10,
        topK,
        contextTokensPerChunk,
        outputTokensPerQuery,
        embeddingProvider,
        vectorDBProvider,
        llmProvider,
      }),
    [
      docCount, tokensPerDoc, monthlyNewDocs,
      queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery,
      embeddingProvider, vectorDBProvider, llmProvider,
    ]
  );

  // 最安構成を判定
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
  }, [
    docCount, tokensPerDoc, monthlyNewDocs,
    queriesPerDay, topK, contextTokensPerChunk, outputTokensPerQuery,
  ]);

  const storageGB = estimateStorageGB(docCount + monthlyNewDocs);

  return (
    <div className="space-y-6">

      {/* ===== ドキュメント設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">ドキュメント設定</h2>
        <p className="text-xs text-gray-500 mb-5">
          推定ストレージ: <span className="font-medium text-gray-700">{storageGB < 1 ? `${(storageGB * 1024).toFixed(0)} MB` : `${storageGB.toFixed(2)} GB`}</span>
          （1536次元 float32 × オーバーヘッド1.5倍）
        </p>
        <div className="space-y-5">
          <SliderInput
            label="総ドキュメント数"
            value={docCount}
            onChange={setDocCount}
            min={100}
            max={1_000_000}
            step={100}
            unit="件"
            hint="（現在の全ドキュメント数）"
          />
          <SliderInput
            label="平均トークン数 / ドキュメント"
            value={tokensPerDoc}
            onChange={setTokensPerDoc}
            min={50}
            max={8_000}
            step={50}
            unit="tokens"
            hint="（チャンク後の1チャンク平均）"
          />
          <SliderInput
            label="月次追加ドキュメント数"
            value={monthlyNewDocs}
            onChange={setMonthlyNewDocs}
            min={0}
            max={500_000}
            step={100}
            unit="件/月"
            hint="（毎月の増分）"
          />
        </div>
      </div>

      {/* ===== クエリ設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">クエリ設定</h2>
        <div className="space-y-5">
          <SliderInput
            label="1日あたりのクエリ数"
            value={queriesPerDay}
            onChange={setQueriesPerDay}
            min={1}
            max={100_000}
            step={1}
            unit="回/日"
          />
          <SliderInput
            label="top-k（検索チャンク取得数）"
            value={topK}
            onChange={setTopK}
            min={1}
            max={20}
            step={1}
            unit="件"
            hint="（ベクトル検索で取得する上位件数）"
          />
          <SliderInput
            label="コンテキストトークン数 / チャンク"
            value={contextTokensPerChunk}
            onChange={setContextTokensPerChunk}
            min={50}
            max={2_000}
            step={50}
            unit="tokens"
            hint="（LLMに渡す1チャンクあたりのトークン数）"
          />
          <SliderInput
            label="LLM 出力トークン数 / クエリ"
            value={outputTokensPerQuery}
            onChange={setOutputTokensPerQuery}
            min={50}
            max={4_000}
            step={50}
            unit="tokens"
          />
        </div>
      </div>

      {/* ===== プロバイダー選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">プロバイダー選択</h2>

        {/* Embedding */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-violet-700 mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">1</span>
            Embedding モデル
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EMBEDDING_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setEmbeddingId(p.id)}
                className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                  embeddingId === p.id
                    ? "bg-violet-50 border-violet-400 ring-2 ring-violet-300 shadow-sm"
                    : "border-gray-200 hover:border-violet-200 hover:bg-violet-50/40"
                }`}
              >
                <div>
                  <div className="text-xs text-gray-500 font-medium">{p.name}</div>
                  <div className="font-semibold text-gray-900 text-sm">{p.model}</div>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <div className="text-sm font-bold text-gray-900">${p.pricePerMTokens}</div>
                  <div className="text-xs text-gray-400">/1Mトークン</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Vector DB */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">2</span>
            ベクトルDB
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VECTOR_DB_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setVectorDBId(p.id)}
                className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                  vectorDBId === p.id
                    ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300 shadow-sm"
                    : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/40"
                }`}
              >
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.note}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* LLM */}
        <div>
          <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">3</span>
            LLM 推論モデル
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {LLM_PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setLlmId(p.id)}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  llmId === p.id
                    ? "bg-purple-50 border-purple-400 ring-2 ring-purple-300 shadow-sm"
                    : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/40"
                }`}
              >
                <div className="text-xs text-gray-500 font-medium">{p.name}</div>
                <div className="font-semibold text-gray-900 text-sm mt-0.5">{p.model}</div>
                <div className="mt-2 space-y-0.5">
                  <div className="text-xs text-gray-500">in: <span className="font-medium text-gray-700">${p.inputPer1M}/1M</span></div>
                  <div className="text-xs text-gray-500">out: <span className="font-medium text-gray-700">${p.outputPer1M}/1M</span></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 為替レート ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">為替レート</span>
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
            className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-violet-300 p-6 bg-gradient-to-br from-violet-50 to-indigo-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">コスト内訳</h2>

        {/* 月額合計 */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">月額合計（継続コスト）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">{fmtUSD(costs.totalMonth)}</span>
            <span className="text-xl text-gray-600">{fmtJPY(costs.totalMonth * exchangeRate)}</span>
          </div>
          {costs.embeddingInitial > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              + 初回インジェスト: <span className="font-semibold text-gray-800">{fmtUSD(costs.embeddingInitial)}</span>
              <span className="text-xs text-gray-400 ml-1">（初期のみ一回払い）</span>
            </div>
          )}
        </div>

        {/* コストバー */}
        <div className="space-y-3 mb-6">
          <CostBar
            label={`Embedding 増分（${embeddingProvider.model}）`}
            value={costs.embeddingMonthlyIncrement}
            total={costs.totalMonth}
            color="bg-violet-400"
          />
          <CostBar
            label={`ベクトルDB 保存（${vectorDBProvider.name}）`}
            value={costs.dbStorageMonth}
            total={costs.totalMonth}
            color="bg-indigo-400"
          />
          <CostBar
            label="ベクトルDB 検索"
            value={costs.dbQueryMonth}
            total={costs.totalMonth}
            color="bg-blue-400"
          />
          <CostBar
            label={`LLM 推論（${llmProvider.model}）`}
            value={costs.llmMonth}
            total={costs.totalMonth}
            color="bg-purple-400"
          />
        </div>

        {/* 詳細内訳 */}
        <div className="p-4 bg-white bg-opacity-60 rounded-xl text-xs text-gray-600 space-y-2">
          <div className="font-semibold text-gray-700 mb-2">詳細内訳</div>

          <div className="flex justify-between">
            <span>Embedding 初回インジェスト（{(docCount * tokensPerDoc / 1_000_000).toFixed(2)}Mトークン × ${embeddingProvider.pricePerMTokens}/1M）</span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(costs.embeddingInitial)}</span>
          </div>
          <div className="flex justify-between">
            <span>Embedding 月次増分（{(monthlyNewDocs * tokensPerDoc / 1_000_000).toFixed(3)}Mトークン/月）</span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(costs.embeddingMonthlyIncrement)}/月</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
            <span>ベクトルDB 保存（{storageGB < 1 ? `${(storageGB * 1024).toFixed(0)}MB` : `${storageGB.toFixed(2)}GB`}）</span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(costs.dbStorageMonth)}/月</span>
          </div>
          <div className="flex justify-between">
            <span>ベクトルDB 検索（{(queriesPerDay * 30).toLocaleString()}クエリ/月）</span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(costs.dbQueryMonth)}/月</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
            <span>
              LLM 推論（入力 {(200 + topK * contextTokensPerChunk + 100).toLocaleString()} tokens + 出力 {outputTokensPerQuery.toLocaleString()} tokens）× {(queriesPerDay * 30).toLocaleString()}クエリ
            </span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(costs.llmMonth)}/月</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-1 font-semibold text-gray-800">
            <span>月額合計（継続）</span>
            <span className="ml-2 shrink-0">{fmtUSD(costs.totalMonth)}</span>
          </div>
        </div>
      </div>

      {/* ===== スケールシミュレーション ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">スケールシミュレーション</h2>
        <p className="text-xs text-gray-500 mb-5">現在の設定を基準にスケールした場合のコスト変化</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "現在", costs: costs, highlight: false },
            { label: "ドキュメント 10倍", costs: costsDoc10x, highlight: false },
            { label: "クエリ 10倍", costs: costsQuery10x, highlight: false },
          ].map(({ label, costs: c }) => (
            <div key={label} className="border border-gray-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 mb-3">{label}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{fmtUSD(c.totalMonth)}</div>
              <div className="text-sm text-gray-500 mb-3">{fmtJPY(c.totalMonth * exchangeRate)}/月</div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Embedding</span>
                  <span className="font-medium text-gray-700">{fmtUSD(c.embeddingMonthlyIncrement)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ベクトルDB</span>
                  <span className="font-medium text-gray-700">{fmtUSD(c.dbStorageMonth + c.dbQueryMonth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>LLM</span>
                  <span className="font-medium text-gray-700">{fmtUSD(c.llmMonth)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 最安構成 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">プロバイダー組み合わせ比較 — 最安 Top 3</h2>
        <p className="text-xs text-gray-500 mb-5">現在のドキュメント・クエリ設定で全組み合わせを試算した結果</p>

        <div className="space-y-3">
          {cheapestCombos.map((combo, i) => {
            const isCurrentSelection =
              combo.emb.id === embeddingId &&
              combo.db.id === vectorDBId &&
              combo.llm.id === llmId;
            const medals = ["gold", "silver", "bronze"] as const;
            const medalColors = {
              gold:   "bg-yellow-100 text-yellow-800 border-yellow-300",
              silver: "bg-gray-100   text-gray-700   border-gray-300",
              bronze: "bg-orange-100 text-orange-800 border-orange-300",
            };
            return (
              <div
                key={`${combo.emb.id}-${combo.db.id}-${combo.llm.id}`}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isCurrentSelection
                    ? "bg-violet-50 border-violet-300 ring-2 ring-violet-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${medalColors[medals[i]]}`}>
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {combo.emb.model} / {combo.db.name} / {combo.llm.model}
                    </div>
                    {isCurrentSelection && (
                      <div className="text-xs text-violet-600 font-medium mt-0.5">← 現在の選択</div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <div className="text-lg font-bold text-gray-900">{fmtUSD(combo.total)}</div>
                  <div className="text-xs text-gray-500">/月</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-violet-50 rounded-xl text-xs text-violet-700">
          <span className="font-semibold">注:</span> 無料枠（Weaviate Free / Qdrant Free）はドキュメント数・ストレージが上限内の場合のみ$0として計算されます。
        </div>
      </div>

      {/* ===== フッター ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。LLM入力トークンはシステムプロンプト200トークン+コンテキスト+クエリ100トークンで計算。最新の料金は各社公式サイトをご確認ください。
      </p>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "ドキュメント設定を入力", desc: "RAGに投入するドキュメント総数・平均トークン数・月次増分を設定します。チャンク後の1チャンクを1ドキュメントとして換算してください。" },
            { step: "2", title: "クエリ設定を調整", desc: "1日あたりのクエリ数・top-k・コンテキストトークン数を入力します。top-kはベクトル検索で取得するチャンク数です。" },
            { step: "3", title: "プロバイダーを選択", desc: "Embedding・ベクトルDB・LLMをそれぞれ選択します。組み合わせに応じてリアルタイムで月額コストが更新されます。" },
            { step: "4", title: "最安構成 Top 3 を確認", desc: "全組み合わせを自動試算した結果が下部に表示されます。無料枠（Weaviate・Qdrant）は条件内で$0として計算されます。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">{item.step}</span>
              <div>
                <span className="text-gray-800 font-bold text-sm">{item.title}</span>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "RAGのコストで最も高い部分はどこですか？",
              a: "クエリ数が多い場合はLLM推論コストが支配的になります。ドキュメント数が多い場合はEmbedding初回インジェストとベクトルDBストレージが大きくなります。",
            },
            {
              q: "Pineconeは高いですか？",
              a: "Serverlessプランは$0.33/GB/月+$8/1Mクエリです。小規模なら安価ですが、大量クエリ時はQdrantやWeaviateの定額プランの方が安くなる場合があります。",
            },
            {
              q: "top-kを増やすとコストが上がりますか？",
              a: "はい。top-kを増やすとLLMに渡すコンテキストトークン数が増えるため、LLM推論コストが線形に増加します。精度と費用のトレードオフを確認してください。",
            },
            {
              q: "無料枠だけでRAGを構築できますか？",
              a: "Weaviate Cloud Freeは100万ベクトルまで、Qdrant Freeは1GBまで無料です。小規模なPOCや個人プロジェクトなら無料枠のみで運用可能です。",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <p className="text-gray-800 font-bold text-sm mb-1">{faq.q}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{faq.a}</p>
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
      <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/embedding-cost-calculator", label: "Embedding料金計算機", desc: "OpenAI・Cohere・Voyage等のEmbeddingコストを詳細試算" },
            { href: "/vector-db-comparison", label: "ベクトルDB比較", desc: "Pinecone・Weaviate・Qdrant等の料金・機能を比較" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl p-3 transition-colors"
            >
              <p className="text-gray-800 font-bold text-sm">{link.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{link.desc}</p>
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
