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

const PROVIDER_COLORS: Record<string, { bg: string; text: string; border: string; ring: string; badge: string }> = {
  OpenAI:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-300",  ring: "ring-green-400",  badge: "bg-green-100 text-green-700" },
  Cohere:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300", ring: "ring-purple-400", badge: "bg-purple-100 text-purple-700" },
  Voyage:  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", ring: "ring-orange-400", badge: "bg-orange-100 text-orange-700" },
  Google:  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-300",   ring: "ring-blue-400",   badge: "bg-blue-100 text-blue-700" },
  Jina:    { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-300",   ring: "ring-pink-400",   badge: "bg-pink-100 text-pink-700" },
};

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

// --- サブコンポーネント ---
function NumberInput({
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
      <label className="block text-sm font-medium text-teal-900 mb-1">{label}</label>
      {hint && <p className="text-xs text-teal-600 mb-1.5">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-teal-600"
          style={{ background: "linear-gradient(to right, #0d9488, #e2e8f0)" }}
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
            className="w-28 px-2 py-1 text-right border border-teal-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
          />
          {unit && <span className="text-sm text-teal-600 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
      <h2 className="text-lg font-semibold text-teal-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}

// --- メインコンポーネント ---
export default function EmbeddingCostCalculator() {
  // 入力パラメーター
  const [numDocs, setNumDocs] = useState<number>(100_000);
  const [avgCharsPerDoc, setAvgCharsPerDoc] = useState<number>(500);
  const [useTokenMode, setUseTokenMode] = useState<boolean>(false);
  const [manualTokens, setManualTokens] = useState<number>(300);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  // 月間更新
  const [monthlyNewDocs, setMonthlyNewDocs] = useState<number>(10_000);

  // バッチ vs リアルタイム（バッチ割引率、プロバイダーによって異なるが目安）
  const BATCH_DISCOUNT = 0.5; // OpenAI Batch API: 50% off

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
  const pc = PROVIDER_COLORS[selected?.provider] ?? PROVIDER_COLORS["OpenAI"];

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const totalTokens = numDocs * tokensPerDoc;
  const totalChars = numDocs * charsPerDoc;

  return (
    <div className="space-y-6">
      {/* ===== 入力パラメーター ===== */}
      <Section title="データ規模を入力">
        <div className="space-y-5">
          <NumberInput
            label="ドキュメント数（ベクトル化する件数）"
            value={numDocs}
            onChange={setNumDocs}
            min={1000}
            max={10_000_000}
            step={1000}
            unit="件"
            hint="RAGのドキュメント数、商品数、記事数など"
          />

          {/* 入力モード切り替え */}
          <div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setUseTokenMode(false)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  !useTokenMode
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                文字数で入力
              </button>
              <button
                onClick={() => setUseTokenMode(true)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  useTokenMode
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                トークン数で入力
              </button>
            </div>

            {!useTokenMode ? (
              <NumberInput
                label="1ドキュメントあたりの平均文字数"
                value={avgCharsPerDoc}
                onChange={setAvgCharsPerDoc}
                min={50}
                max={10000}
                step={50}
                unit="文字"
                hint={`推定トークン数: ${tokensPerDoc.toLocaleString()} tokens/doc（日本語換算 × 1.7）`}
              />
            ) : (
              <NumberInput
                label="1ドキュメントあたりのトークン数"
                value={manualTokens}
                onChange={setManualTokens}
                min={10}
                max={8192}
                step={10}
                unit="tokens"
              />
            )}
          </div>

          {/* 総量サマリー */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
            <div>
              <div className="text-xs text-teal-600 mb-0.5">総ドキュメント数</div>
              <div className="text-base font-bold text-teal-900">{numDocs.toLocaleString()} 件</div>
            </div>
            <div>
              <div className="text-xs text-teal-600 mb-0.5">総トークン数</div>
              <div className="text-base font-bold text-teal-900">{(totalTokens / 1_000_000).toFixed(2)} M tokens</div>
            </div>
            <div>
              <div className="text-xs text-teal-600 mb-0.5">総文字数</div>
              <div className="text-base font-bold text-teal-900">{(totalChars / 1_000_000).toFixed(1)} M 文字</div>
            </div>
          </div>

          {/* 為替レート */}
          <div>
            <label className="block text-sm font-medium text-teal-900 mb-1">為替レート</label>
            <div className="flex items-center gap-2 w-fit">
              <span className="text-sm text-teal-600">1 USD =</span>
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
                className="w-24 px-2 py-1 text-right border border-teal-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              />
              <span className="text-sm text-teal-600">円</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== 全モデル比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-teal-900 mb-1">全プロバイダー 料金比較</h2>
        <p className="text-xs text-teal-600 mb-4">
          {numDocs.toLocaleString()} 件 × {tokensPerDoc.toLocaleString()} tokens/doc の初回埋め込みコスト（安い順）
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-teal-100">
                <th className="text-left py-2 pr-2 text-xs text-teal-600 font-medium">プロバイダー</th>
                <th className="text-left py-2 pr-2 text-xs text-teal-600 font-medium">モデル</th>
                <th className="text-right py-2 pr-2 text-xs text-teal-600 font-medium">単価</th>
                <th className="text-right py-2 pr-2 text-xs text-teal-600 font-medium">次元数</th>
                <th className="text-right py-2 pr-2 text-xs text-teal-600 font-medium">初回コスト</th>
                <th className="text-right py-2 text-xs text-teal-600 font-medium">ストレージ</th>
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
                    className={`border-b border-teal-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-teal-50" : "hover:bg-teal-50/50"
                    }`}
                  >
                    <td className="py-2 pr-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                        {m.provider}
                      </span>
                    </td>
                    <td className="py-2 pr-2">
                      <span className={`font-medium ${isSelected ? "text-teal-900" : "text-gray-700"}`}>
                        {m.name}
                      </span>
                      {m.notes && <span className="ml-1 text-xs text-gray-400">{m.notes}</span>}
                      {isSelected && <span className="ml-1.5 text-xs text-teal-500">← 選択中</span>}
                    </td>
                    <td className="py-2 pr-2 text-right text-xs text-gray-500">
                      {m.unit === "per_1m_tokens"
                        ? `$${m.price}/1M tok`
                        : `$${m.price}/1K chars`}
                    </td>
                    <td className="py-2 pr-2 text-right text-gray-600">{m.dimensions.toLocaleString()}</td>
                    <td className="py-2 pr-2 text-right">
                      <span className={`font-semibold ${isCheapest ? "text-teal-600" : "text-gray-900"}`}>
                        {fmtUSD(m.totalCost)}
                      </span>
                      {isCheapest && i === 0 && (
                        <span className="ml-1.5 text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">最安</span>
                      )}
                    </td>
                    <td className="py-2 text-right text-gray-600 text-xs">{fmtBytes(m.storage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">行をクリックすると詳細パネルに反映されます</p>
      </div>

      {/* ===== 選択モデル詳細 ===== */}
      {selected && (
        <div className={`rounded-2xl shadow-sm border p-6 ${pc.bg} ${pc.border}`}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-800">詳細コスト分析</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}>
              {selected.provider} / {selected.name}
            </span>
          </div>

          {/* 初回コスト */}
          <div className="mb-5">
            <div className="text-xs text-gray-500 mb-1">初回埋め込みコスト（{numDocs.toLocaleString()} 件）</div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-bold text-gray-900">{fmtUSD(selected.totalCost)}</span>
              <span className="text-xl text-gray-600">{fmtJPY(selected.totalCost * exchangeRate)}</span>
            </div>
          </div>

          {/* グリッド: バッチ/リアルタイム/月間更新/ストレージ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white bg-opacity-70 rounded-xl p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">リアルタイム処理</div>
              <div className="text-base font-bold text-gray-900">{fmtUSD(selected.totalCost)}</div>
              <div className="text-xs text-gray-500">{fmtJPY(selected.totalCost * exchangeRate)}</div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-xl p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">バッチ処理（-50%）</div>
              <div className="text-base font-bold text-teal-700">{fmtUSD(selected.totalCost * BATCH_DISCOUNT)}</div>
              <div className="text-xs text-gray-500">{fmtJPY(selected.totalCost * BATCH_DISCOUNT * exchangeRate)}</div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-xl p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">月間増分（{monthlyNewDocs.toLocaleString()} 件）</div>
              <div className="text-base font-bold text-gray-900">{fmtUSD(selected.monthlyCost)}</div>
              <div className="text-xs text-gray-500">{fmtJPY(selected.monthlyCost * exchangeRate)}</div>
            </div>
            <div className="bg-white bg-opacity-70 rounded-xl p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">ストレージ（float32）</div>
              <div className="text-base font-bold text-gray-900">{fmtBytes(selected.storage)}</div>
              <div className="text-xs text-gray-500">{selected.dimensions}次元 × {numDocs.toLocaleString()}件</div>
            </div>
          </div>

          {/* コスト内訳 */}
          <div className="p-3 bg-white bg-opacity-50 rounded-xl text-xs text-gray-600 space-y-1.5">
            <div className="font-medium text-gray-700 mb-1.5">コスト内訳</div>
            {selected.unit === "per_1m_tokens" ? (
              <>
                <div className="flex justify-between">
                  <span>{numDocs.toLocaleString()} 件 × {tokensPerDoc.toLocaleString()} tokens = {totalTokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1">
                  <span>{(totalTokens / 1_000_000).toFixed(4)} M tokens × ${selected.price}/1M</span>
                  <span className="font-medium">{fmtUSD(selected.totalCost)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>{numDocs.toLocaleString()} 件 × {charsPerDoc.toLocaleString()} 文字 = {totalChars.toLocaleString()} 文字</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1">
                  <span>{(totalChars / 1000).toFixed(1)} K chars × ${selected.price}/1K</span>
                  <span className="font-medium">{fmtUSD(selected.totalCost)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-1 text-teal-700">
              <span>バッチ処理（-50%）の場合</span>
              <span className="font-medium">{fmtUSD(selected.totalCost * BATCH_DISCOUNT)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== 月間更新コスト設定 ===== */}
      <Section title="月間更新（増分Embedding）コスト">
        <div className="space-y-4">
          <NumberInput
            label="月間追加ドキュメント数"
            value={monthlyNewDocs}
            onChange={setMonthlyNewDocs}
            min={100}
            max={1_000_000}
            step={100}
            unit="件/月"
            hint="新規記事・商品・データの毎月の追加件数"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-teal-100">
                  <th className="text-left py-2 pr-2 text-xs text-teal-600 font-medium">プロバイダー / モデル</th>
                  <th className="text-right py-2 pr-2 text-xs text-teal-600 font-medium">月間コスト</th>
                  <th className="text-right py-2 pr-2 text-xs text-teal-600 font-medium">年間コスト</th>
                  <th className="text-right py-2 text-xs text-teal-600 font-medium">円換算/月</th>
                </tr>
              </thead>
              <tbody>
                {modelResults.map((m) => {
                  const colors = PROVIDER_COLORS[m.provider] ?? PROVIDER_COLORS["OpenAI"];
                  const isCheapest = m.monthlyCost === Math.min(...modelResults.map((r) => r.monthlyCost));
                  return (
                    <tr key={m.id} className="border-b border-teal-50">
                      <td className="py-2 pr-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mr-1.5 ${colors.badge}`}>
                          {m.provider}
                        </span>
                        <span className="text-gray-700">{m.name}</span>
                      </td>
                      <td className="py-2 pr-2 text-right">
                        <span className={`font-semibold ${isCheapest ? "text-teal-600" : "text-gray-900"}`}>
                          {fmtUSD(m.monthlyCost)}
                        </span>
                        {isCheapest && <span className="ml-1 text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">最安</span>}
                      </td>
                      <td className="py-2 pr-2 text-right text-gray-600">{fmtUSD(m.monthlyCost * 12)}</td>
                      <td className="py-2 text-right text-gray-500 text-xs">{fmtJPY(m.monthlyCost * exchangeRate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ===== ストレージ比較 ===== */}
      <Section title="ベクトルストレージ見積もり">
        <p className="text-xs text-teal-600 mb-4 -mt-2">
          float32（4 bytes）× 次元数 × {numDocs.toLocaleString()} ベクトル数
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modelResults.map((m) => {
            const colors = PROVIDER_COLORS[m.provider] ?? PROVIDER_COLORS["OpenAI"];
            const minStorage = Math.min(...modelResults.map((r) => r.storage));
            const isSmallest = m.storage === minStorage;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isSmallest ? "border-teal-300 bg-teal-50" : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}>
                    {m.provider}
                  </span>
                  <span className="text-sm text-gray-700 truncate">{m.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${isSmallest ? "text-teal-700" : "text-gray-900"}`}>
                    {fmtBytes(m.storage)}
                  </div>
                  <div className="text-xs text-gray-400">{m.dimensions}次元</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ※ メタデータ・インデックス・オーバーヘッドは含みません。実際のDBサイズはこの1.5〜3倍程度になることがあります。
        </p>
      </Section>

      {/* ===== フッター ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。バッチ割引はOpenAI Batch APIを参考値として使用（50%割引）。最新の料金は各社の公式サイトをご確認ください。
      </p>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-teal-900 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "ドキュメント数を入力", desc: "RAGに投入するファイル・記事・商品数など、ベクトル化するデータ件数をスライダーで設定します。" },
            { step: "2", title: "文字数またはトークン数を指定", desc: "1件あたりの平均文字数を入力してください。日本語は1文字≒1.7トークンで自動換算されます。" },
            { step: "3", title: "比較表で最安モデルを確認", desc: "全プロバイダーのコストが安い順に並びます。行をクリックすると詳細パネルに反映されます。" },
            { step: "4", title: "月間コスト・ストレージも確認", desc: "月間追加件数を設定すると運用コストも試算できます。ストレージ見積もりも同時に表示されます。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">{item.step}</span>
              <div>
                <span className="text-teal-900 font-bold text-sm">{item.title}</span>
                <p className="text-teal-700 text-xs mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-teal-900 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
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
          ].map((faq, i) => (
            <div key={i} className="border-b border-teal-50 pb-3 last:border-0 last:pb-0">
              <p className="text-teal-900 font-bold text-sm mb-1">{faq.q}</p>
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
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-teal-900 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/rag-cost-estimator", label: "RAGコスト見積もり", desc: "Embedding+ベクトルDB+LLM推論の総コストを試算" },
            { href: "/ai-cost-calculator", label: "AIコスト計算機", desc: "LLM APIの料金を用途別に計算" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl p-3 transition-colors"
            >
              <p className="text-teal-900 font-bold text-sm">{link.label}</p>
              <p className="text-teal-600 text-xs mt-0.5">{link.desc}</p>
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
