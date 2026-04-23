"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface VectorDB {
  name: string;
  icon: string;
  type: "managed" | "self-hosted" | "both";
  license: string;
  pricingModel: string;
  freeTier: string;
  costPerMillionVectors: number; // USD
  costPerMillionQueries: number; // USD
  dimensions: number[];
  maxVectors: string;
  latencyMs: string;
  features: string[];
  hosting: string[];
  pros: string[];
  cons: string[];
  color: string;
  url: string;
}

const VECTOR_DBS: VectorDB[] = [
  {
    name: "Pinecone",
    icon: "🌲",
    type: "managed",
    license: "プロプライエタリ",
    pricingModel: "Serverless従量課金",
    freeTier: "2GBストレージ・100万ベクトル",
    costPerMillionVectors: 0.04, // $0.04/100万ベクトル/月（Serverless）
    costPerMillionQueries: 0.04, // $4/100万クエリ
    dimensions: [1536, 3072],
    maxVectors: "無制限（従量制）",
    latencyMs: "10〜50ms",
    features: ["フルマネージド", "メタデータフィルタリング", "ハイブリッド検索", "スパースベクター"],
    hosting: ["AWS", "GCP", "Azure"],
    pros: ["セットアップ簡単", "高スケーラビリティ", "安定したSLA"],
    cons: ["コスト高め", "ベンダーロックイン", "オープンでない"],
    color: "green",
    url: "https://pinecone.io",
  },
  {
    name: "Weaviate",
    icon: "🕸️",
    type: "both",
    license: "BSD-3-Clause (OSS)",
    pricingModel: "WCS: Serverless従量課金",
    freeTier: "Sandboxクラスタ（無料・14日）",
    costPerMillionVectors: 0.05,
    costPerMillionQueries: 0.05,
    dimensions: [1536, 3072, 65535],
    maxVectors: "無制限",
    latencyMs: "5〜30ms",
    features: ["GraphQLクエリ", "モジュールシステム", "ハイブリッド検索", "BM25+Vector"],
    hosting: ["セルフホスト", "WCS（マネージド）"],
    pros: ["OSS", "GraphQL対応", "強力なフィルタ", "マルチモーダル"],
    cons: ["学習コスト高め", "WCSはやや高価"],
    color: "orange",
    url: "https://weaviate.io",
  },
  {
    name: "Qdrant",
    icon: "🎯",
    type: "both",
    license: "Apache 2.0 (OSS)",
    pricingModel: "Cloud: 従量課金 / セルフホスト: 無料",
    freeTier: "1GBストレージ・1クラスタ",
    costPerMillionVectors: 0.02,
    costPerMillionQueries: 0.02,
    dimensions: [1, 65535],
    maxVectors: "無制限",
    latencyMs: "5〜20ms",
    features: ["Rust実装（高速）", "ペイロードフィルタ", "スパーシングベクター", "量子化対応"],
    hosting: ["セルフホスト", "Qdrant Cloud"],
    pros: ["高性能・低コスト", "OSS", "Rustによる安定性", "豊富なフィルタ"],
    cons: ["コミュニティ規模小さめ", "ドキュメント英語中心"],
    color: "purple",
    url: "https://qdrant.tech",
  },
  {
    name: "Chroma",
    icon: "🎨",
    type: "both",
    license: "Apache 2.0 (OSS)",
    pricingModel: "完全無料（OSS） / Cloud版は検討中",
    freeTier: "完全無料（ローカル）",
    costPerMillionVectors: 0,
    costPerMillionQueries: 0,
    dimensions: [1, 65535],
    maxVectors: "ローカルRAM依存",
    latencyMs: "1〜10ms（ローカル）",
    features: ["Pythonネイティブ", "埋め込み自動生成", "永続化対応", "LangChain統合"],
    hosting: ["ローカル", "セルフホスト"],
    pros: ["完全無料", "Python連携簡単", "LLMアプリ開発に最適", "学習コスト低"],
    cons: ["本番スケール未熟", "クラウド版なし", "分散非対応"],
    color: "pink",
    url: "https://trychroma.com",
  },
  {
    name: "Milvus",
    icon: "⚡",
    type: "both",
    license: "Apache 2.0 (OSS)",
    pricingModel: "Zilliz Cloud: 従量課金 / OSS: 無料",
    freeTier: "Zilliz: 1CU無料（Serverless）",
    costPerMillionVectors: 0.04,
    costPerMillionQueries: 0.03,
    dimensions: [1, 32768],
    maxVectors: "数十億規模対応",
    latencyMs: "5〜30ms",
    features: ["大規模スケール", "多様なインデックス（IVF/HNSW）", "GPU対応", "ハイブリッド検索"],
    hosting: ["セルフホスト", "Zilliz Cloud"],
    pros: ["大規模データ対応", "OSS", "インデックス種類豊富"],
    cons: ["セットアップ複雑", "リソース消費大"],
    color: "blue",
    url: "https://milvus.io",
  },
  {
    name: "pgvector",
    icon: "🐘",
    type: "self-hosted",
    license: "PostgreSQL License (OSS)",
    pricingModel: "PostgreSQLと同じ（無料）",
    freeTier: "PostgreSQL使えば完全無料",
    costPerMillionVectors: 0,
    costPerMillionQueries: 0,
    dimensions: [1, 16000],
    maxVectors: "PostgreSQL依存",
    latencyMs: "10〜100ms",
    features: ["PostgreSQL拡張", "SQL対応", "既存DBに統合", "HNSW/IVFFlat"],
    hosting: ["PostgreSQL上", "Supabase", "Neon等"],
    pros: ["SQLと統合", "既存インフラ活用", "完全無料", "RLSなどPG機能"],
    cons: ["専用VDBより低速", "大規模不向き"],
    color: "slate",
    url: "https://github.com/pgvector/pgvector",
  },
];

function getColorClasses(color: string) {
  const map: Record<string, { header: string; badge: string; border: string }> = {
    green: { header: "bg-green-500", badge: "bg-green-100 text-green-700", border: "border-green-300" },
    orange: { header: "bg-orange-500", badge: "bg-orange-100 text-orange-700", border: "border-orange-300" },
    purple: { header: "bg-purple-500", badge: "bg-purple-100 text-purple-700", border: "border-purple-300" },
    pink: { header: "bg-pink-500", badge: "bg-pink-100 text-pink-700", border: "border-pink-300" },
    blue: { header: "bg-blue-500", badge: "bg-blue-100 text-blue-700", border: "border-blue-300" },
    slate: { header: "bg-slate-500", badge: "bg-slate-100 text-slate-700", border: "border-slate-300" },
  };
  return map[color] ?? map.slate;
}

type SortKey = "cost" | "latency" | "name";

export default function VectorDbComparison() {
  const [vectorCount, setVectorCount] = useState(100);  // 万ベクトル
  const [queryCount, setQueryCount] = useState(10);    // 万クエリ/月
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);
  const [sortBy, setSortBy] = useState<SortKey>("cost");
  const [selectedDbs, setSelectedDbs] = useState<string[]>(VECTOR_DBS.map((d) => d.name));
  const [useCase, setUseCase] = useState<"rag" | "search" | "rec">("rag");

  const vectorCountM = vectorCount / 100; // million
  const queryCountM = queryCount / 100;

  const results = useMemo(() => {
    return VECTOR_DBS.filter((db) => selectedDbs.includes(db.name)).map((db) => {
      const vectorCostUSD = db.costPerMillionVectors * vectorCountM;
      const queryCostUSD = db.costPerMillionQueries * queryCountM;
      const totalUSD = vectorCostUSD + queryCostUSD;
      const totalJPY = totalUSD * usdRate;
      return { ...db, vectorCostUSD, queryCostUSD, totalUSD, totalJPY };
    }).sort((a, b) => {
      if (sortBy === "cost") return a.totalUSD - b.totalUSD;
      if (sortBy === "latency") {
        const aMs = parseInt(a.latencyMs.split("〜")[0]);
        const bMs = parseInt(b.latencyMs.split("〜")[0]);
        return aMs - bMs;
      }
      return a.name.localeCompare(b.name);
    });
  }, [vectorCount, queryCount, usdRate, sortBy, selectedDbs, vectorCountM, queryCountM]);

  const toggleDb = (name: string) => {
    setSelectedDbs((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    );
  };

  const useCaseRec: Record<string, string[]> = {
    rag: ["Chroma", "Qdrant", "pgvector"],
    search: ["Pinecone", "Milvus", "Weaviate"],
    rec: ["Milvus", "Pinecone", "Qdrant"],
  };

  const useCaseLabel: Record<string, string> = {
    rag: "RAG（LLMアプリ）",
    search: "大規模セマンティック検索",
    rec: "レコメンデーション",
  };

  return (
    <div className="space-y-6">
      {/* Use case guide */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">ユースケースから選ぶ</h2>
        <div className="flex gap-2 flex-wrap mb-3">
          {(["rag", "search", "rec"] as const).map((uc) => (
            <button
              key={uc}
              onClick={() => setUseCase(uc)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                useCase === uc
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {useCaseLabel[uc]}
            </button>
          ))}
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 text-sm">
          <span className="font-medium text-indigo-800">{useCaseLabel[useCase]}におすすめ: </span>
          <span className="text-indigo-700">{useCaseRec[useCase].join(" / ")}</span>
        </div>
      </div>

      {/* Cost calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">料金試算</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">ベクトル数</label>
              <span className="text-sm font-bold text-indigo-600">{vectorCount.toLocaleString()}万件</span>
            </div>
            <input
              type="range"
              min={1}
              max={10000}
              step={10}
              value={vectorCount}
              onChange={(e) => setVectorCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1万</span><span>1億</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">月間クエリ数</label>
              <span className="text-sm font-bold text-indigo-600">{queryCount.toLocaleString()}万回/月</span>
            </div>
            <input
              type="range"
              min={1}
              max={10000}
              step={10}
              value={queryCount}
              onChange={(e) => setQueryCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">為替レート（1 USD =）</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={usdRate}
                min={100}
                max={200}
                step={1}
                onChange={(e) => setUsdRate(Number(e.target.value))}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-sm text-gray-600">円</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">並び替え</label>
            <div className="flex gap-2">
              {(["cost", "latency", "name"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === s
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "cost" ? "料金順" : s === "latency" ? "速度順" : "名前順"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">表示するDB</label>
          <div className="flex gap-2 flex-wrap">
            {VECTOR_DBS.map((db) => {
              const c = getColorClasses(db.color);
              return (
                <button
                  key={db.name}
                  onClick={() => toggleDb(db.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedDbs.includes(db.name)
                      ? `${c.badge} ${c.border}`
                      : "border-gray-200 text-gray-400 bg-gray-50"
                  }`}
                >
                  {db.icon} {db.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost comparison table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            コスト比較（{vectorCount.toLocaleString()}万ベクトル / {queryCount.toLocaleString()}万クエリ/月）
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">DB</th>
                <th className="text-right px-4 py-2 text-gray-600">月額（円）</th>
                <th className="text-right px-4 py-2 text-gray-600">月額（USD）</th>
                <th className="text-left px-4 py-2 text-gray-600">レイテンシ</th>
                <th className="text-left px-4 py-2 text-gray-600">フリー枠</th>
                <th className="text-left px-4 py-2 text-gray-600">ライセンス</th>
              </tr>
            </thead>
            <tbody>
              {results.map((db, i) => {
                const c = getColorClasses(db.color);
                return (
                  <tr
                    key={db.name}
                    className={`border-t border-gray-100 ${i === 0 && sortBy === "cost" ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{db.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{db.name}</div>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.badge}`}>
                            {db.type === "managed" ? "マネージド" : db.type === "self-hosted" ? "セルフホスト" : "両対応"}
                          </span>
                        </div>
                        {i === 0 && sortBy === "cost" && (
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full">最安</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-gray-900">
                        {db.totalJPY === 0
                          ? "無料"
                          : `¥${Math.round(db.totalJPY).toLocaleString("ja-JP")}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {db.totalUSD === 0 ? "Free" : `$${db.totalUSD.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{db.latencyMs}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{db.freeTier}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{db.license}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((db) => {
          const c = getColorClasses(db.color);
          return (
            <div key={db.name} className={`rounded-2xl border overflow-hidden ${c.border}`}>
              <div className={`${c.header} text-white p-3 flex items-center gap-2`}>
                <span className="text-xl">{db.icon}</span>
                <div>
                  <div className="font-bold">{db.name}</div>
                  <div className="text-xs opacity-80">{db.pricingModel}</div>
                </div>
              </div>
              <div className="bg-white p-4">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {db.totalJPY === 0 ? "無料" : `¥${Math.round(db.totalJPY).toLocaleString()}/月`}
                </div>
                <div className="text-xs text-gray-500 mb-3">{db.freeTier}</div>

                <div className="space-y-2 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">最大次元数</span>
                    <span className="font-medium">{db.dimensions[db.dimensions.length - 1].toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">レイテンシ目安</span>
                    <span className="font-medium">{db.latencyMs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ホスティング</span>
                    <span className="font-medium">{db.hosting.join(", ")}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">主な機能</div>
                  <div className="flex flex-wrap gap-1">
                    {db.features.map((f) => (
                      <span key={f} className={`text-xs px-1.5 py-0.5 rounded ${c.badge}`}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs">
                    <span className="text-green-600 font-medium">✓ </span>
                    <span className="text-gray-600">{db.pros.join(" / ")}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-red-500 font-medium">✗ </span>
                    <span className="text-gray-600">{db.cons.join(" / ")}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 料金は2024年時点の公式サイト情報をもとにした概算です。従量課金は利用パターンにより変動します。</p>
        <p>※ Chroma・pgvectorはOSSのため、セルフホストの場合はインフラ費用のみです。</p>
        <p>※ レイテンシはベクトル数・インフラ・インデックス設定により大きく変わります。</p>
        <p>※ 各サービスの最新料金・仕様は公式サイトでご確認ください。</p>
      </div>
    </div>
  );
}
