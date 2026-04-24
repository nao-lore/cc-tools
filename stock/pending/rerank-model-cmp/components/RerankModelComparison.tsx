"use client";
import { useState, useMemo } from "react";

interface Model {
  id: string;
  name: string;
  vendor: string;
  pricePerK: number; // USD per 1000 queries
  beirNdcg: number | null; // BEIR NDCG@10
  latencyMs: number | null;
  maxContextTokens: number;
  maxDocuments: number;
  multilingual: boolean;
  freeQuota: number; // free queries per month
  notes: string;
}

const MODELS: Model[] = [
  {
    id: "cohere-v3",
    name: "Rerank 3",
    vendor: "Cohere",
    pricePerK: 2.0,
    beirNdcg: 55.2,
    latencyMs: 120,
    maxContextTokens: 4096,
    maxDocuments: 1000,
    multilingual: true,
    freeQuota: 1000,
    notes: "業界標準。多言語対応、高精度。RAGパイプラインで広く採用。",
  },
  {
    id: "voyage-rerank-2",
    name: "rerank-2",
    vendor: "Voyage AI",
    pricePerK: 0.5,
    beirNdcg: 57.1,
    latencyMs: 80,
    maxContextTokens: 16000,
    maxDocuments: 1000,
    multilingual: false,
    freeQuota: 200000,
    notes: "コスパ最高クラス。長文対応(16K)、高速。英語特化。",
  },
  {
    id: "jina-reranker-v2",
    name: "reranker-v2-base-multilingual",
    vendor: "Jina AI",
    pricePerK: 0.018,
    beirNdcg: 52.4,
    latencyMs: 200,
    maxContextTokens: 8192,
    maxDocuments: 2048,
    multilingual: true,
    freeQuota: 1000000,
    notes: "超低価格・多言語対応。OSS版あり。コスト重視に最適。",
  },
  {
    id: "mixedbread-rerank",
    name: "mxbai-rerank-large-v1",
    vendor: "Mixedbread",
    pricePerK: 0.1,
    beirNdcg: 53.8,
    latencyMs: 150,
    maxContextTokens: 512,
    maxDocuments: 100,
    multilingual: false,
    freeQuota: 0,
    notes: "OSS・セルフホスト可。HuggingFaceで公開。プライバシー重視向け。",
  },
  {
    id: "flashrank",
    name: "FlashRank",
    vendor: "PrithiviRaj",
    pricePerK: 0,
    beirNdcg: 48.5,
    latencyMs: 30,
    maxContextTokens: 512,
    maxDocuments: 100,
    multilingual: false,
    freeQuota: -1, // fully free
    notes: "完全無料OSS。超高速（CPU動作）。精度はやや低め。",
  },
  {
    id: "bge-reranker-v2",
    name: "bge-reranker-v2-m3",
    vendor: "BAAI",
    pricePerK: 0,
    beirNdcg: 56.3,
    latencyMs: 100,
    maxContextTokens: 8192,
    maxDocuments: 512,
    multilingual: true,
    freeQuota: -1,
    notes: "OSS最高精度クラス。多言語対応。セルフホスト必要。",
  },
];

export default function RerankModelComparison() {
  const [monthlyQueries, setMonthlyQueries] = useState(100000);
  const [selectedIds, setSelectedIds] = useState<string[]>(["cohere-v3", "voyage-rerank-2", "jina-reranker-v2"]);
  const [sortBy, setSortBy] = useState<"price" | "accuracy" | "latency">("price");
  const [filterMultilingual, setFilterMultilingual] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const calcMonthlyCost = (m: Model): number => {
    if (m.pricePerK <= 0) return 0;
    const billableQueries = Math.max(0, monthlyQueries - m.freeQuota);
    return (billableQueries / 1000) * m.pricePerK;
  };

  const filtered = useMemo(() =>
    MODELS.filter((m) => !filterMultilingual || m.multilingual),
    [filterMultilingual]
  );

  const selected = MODELS.filter((m) => selectedIds.includes(m.id));

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortBy === "price") return calcMonthlyCost(a) - calcMonthlyCost(b);
    if (sortBy === "accuracy") return (b.beirNdcg ?? 0) - (a.beirNdcg ?? 0);
    return (a.latencyMs ?? 9999) - (b.latencyMs ?? 9999);
  }), [filtered, sortBy, monthlyQueries]);

  const fmtUsd = (n: number) => n < 1 ? `$${n.toFixed(3)}` : `$${n.toFixed(2)}`;
  const fmtMonthly = (m: Model) => {
    const cost = calcMonthlyCost(m);
    if (m.pricePerK <= 0) return "無料";
    return `$${cost.toFixed(2)}/月`;
  };

  const ScoreBadge = ({ value, max }: { value: number | null; max: number }) => {
    if (value === null) return <span className="text-gray-300">—</span>;
    const pct = (value / max) * 100;
    const color = pct >= 90 ? "text-green-700 bg-green-100" : pct >= 80 ? "text-blue-700 bg-blue-100" : "text-gray-700 bg-gray-100";
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{value.toFixed(1)}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">コスト試算設定</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">月間クエリ数</label>
            <input type="number" min={1000} step={1000} value={monthlyQueries}
              onChange={(e) => setMonthlyQueries(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <p className="text-xs text-gray-400 mt-1">= 1ドキュメントをリランクするAPI呼び出し回数</p>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ソート</label>
              <div className="flex gap-1">
                {(["price", "accuracy", "latency"] as const).map((s) => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${sortBy === s ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>
                    {s === "price" ? "料金" : s === "accuracy" ? "精度" : "速度"}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filterMultilingual} onChange={(e) => setFilterMultilingual(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-gray-700">多言語対応のみ表示</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sorted.map((m) => (
            <label key={m.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${selectedIds.includes(m.id) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggleSelect(m.id)} className="accent-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">{m.vendor}</p>
                <p className="text-xs text-gray-500">{fmtMonthly(m)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cost chart */}
      {selected.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-4">月額コスト比較 ({monthlyQueries.toLocaleString()}クエリ/月)</h2>
          <div className="space-y-3">
            {[...selected].sort((a, b) => calcMonthlyCost(a) - calcMonthlyCost(b)).map((m) => {
              const cost = calcMonthlyCost(m);
              const maxCost = Math.max(...selected.map(calcMonthlyCost), 1);
              return (
                <div key={m.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800">{m.vendor} {m.name}</span>
                    <span className={`text-sm font-bold ${cost === 0 ? "text-green-600" : "text-gray-900"}`}>{cost === 0 ? "無料" : `$${cost.toFixed(2)}/月`}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${cost === 0 ? "bg-green-400" : "bg-blue-500"}`} style={{ width: cost === 0 ? "3%" : `${(cost / maxCost) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full comparison table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">モデル詳細比較</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">モデル</th>
                <th className="px-4 py-3 text-right text-gray-600">1Kクエリ単価</th>
                <th className="px-4 py-3 text-right text-gray-600">月額({(monthlyQueries/1000).toFixed(0)}Kクエリ)</th>
                <th className="px-4 py-3 text-center text-gray-600">BEIR NDCG@10</th>
                <th className="px-4 py-3 text-center text-gray-600">レイテンシ</th>
                <th className="px-4 py-3 text-center text-gray-600">最大トークン</th>
                <th className="px-4 py-3 text-center text-gray-600">多言語</th>
                <th className="px-4 py-3 text-right text-gray-600">無料枠</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => {
                const maxNdcg = Math.max(...MODELS.map((x) => x.beirNdcg ?? 0));
                return (
                  <tr key={m.id} className={`border-b border-gray-100 hover:bg-gray-50 ${selectedIds.includes(m.id) ? "bg-blue-50/50" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{m.vendor}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">{m.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{m.pricePerK <= 0 ? <span className="text-green-600 font-bold">無料</span> : fmtUsd(m.pricePerK)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{calcMonthlyCost(m) === 0 ? <span className="text-green-600">$0</span> : `$${calcMonthlyCost(m).toFixed(2)}`}</td>
                    <td className="px-4 py-3 text-center"><ScoreBadge value={m.beirNdcg} max={maxNdcg} /></td>
                    <td className="px-4 py-3 text-center text-gray-700">{m.latencyMs !== null ? `${m.latencyMs}ms` : "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{m.maxContextTokens >= 1000 ? `${(m.maxContextTokens / 1000).toFixed(0)}K` : m.maxContextTokens}</td>
                    <td className="px-4 py-3 text-center">{m.multilingual ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{m.freeQuota < 0 ? "∞" : m.freeQuota === 0 ? "なし" : `${(m.freeQuota / 1000).toFixed(0)}K`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sorted.filter((m) => selectedIds.includes(m.id)).map((m) => (
          <div key={m.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900">{m.vendor}</h3>
              {m.pricePerK <= 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">OSS/無料</span>}
            </div>
            <p className="text-xs text-gray-500 mb-2">{m.name}</p>
            <p className="text-sm text-gray-700">{m.notes}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Rerankモデルとは</p>
        <p>RAGパイプラインで検索結果の順位を再評価するモデル。ベクター検索の精度を大幅に改善できます。BEIR NDCG@10は標準ベンチマーク（高いほど高精度）。料金はAPI利用の場合の参考値です。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このRerankモデル料金・性能比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">CohereやVoyage、JinaなどのReranking APIの料金・性能・特徴を横断比較。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このRerankモデル料金・性能比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "CohereやVoyage、JinaなどのReranking APIの料金・性能・特徴を横断比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Rerankモデル料金・性能比較",
  "description": "CohereやVoyage、JinaなどのReranking APIの料金・性能・特徴を横断比較",
  "url": "https://tools.loresync.dev/rerank-model-cmp",
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
