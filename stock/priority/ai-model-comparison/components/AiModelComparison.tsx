"use client";
import { useState, useMemo } from "react";

type Provider = "OpenAI" | "Anthropic" | "Google";

interface Model {
  name: string;
  provider: Provider;
  inputPer1M: number;
  outputPer1M: number;
  contextK: number;
  maxOutK: number;
  tags: string[];
}

const MODELS: Model[] = [
  { name: "GPT-4o", provider: "OpenAI", inputPer1M: 2.50, outputPer1M: 10.00, contextK: 128, maxOutK: 16, tags: ["バランス"] },
  { name: "GPT-4o-mini", provider: "OpenAI", inputPer1M: 0.15, outputPer1M: 0.60, contextK: 128, maxOutK: 16, tags: ["低コスト"] },
  { name: "GPT-4.1", provider: "OpenAI", inputPer1M: 2.00, outputPer1M: 8.00, contextK: 1000, maxOutK: 32, tags: ["コーディング", "バランス"] },
  { name: "GPT-4.1-mini", provider: "OpenAI", inputPer1M: 0.40, outputPer1M: 1.60, contextK: 1000, maxOutK: 32, tags: ["低コスト"] },
  { name: "GPT-4.1-nano", provider: "OpenAI", inputPer1M: 0.10, outputPer1M: 0.40, contextK: 1000, maxOutK: 32, tags: ["最安", "大量処理"] },
  { name: "o3", provider: "OpenAI", inputPer1M: 10.00, outputPer1M: 40.00, contextK: 200, maxOutK: 100, tags: ["最高性能"] },
  { name: "o3-mini", provider: "OpenAI", inputPer1M: 1.10, outputPer1M: 4.40, contextK: 200, maxOutK: 100, tags: [] },
  { name: "o4-mini", provider: "OpenAI", inputPer1M: 1.10, outputPer1M: 4.40, contextK: 200, maxOutK: 100, tags: [] },
  { name: "Claude Opus 4", provider: "Anthropic", inputPer1M: 15.00, outputPer1M: 75.00, contextK: 200, maxOutK: 32, tags: ["最高性能"] },
  { name: "Claude Sonnet 4", provider: "Anthropic", inputPer1M: 3.00, outputPer1M: 15.00, contextK: 200, maxOutK: 64, tags: ["バランス", "コーディング"] },
  { name: "Claude Haiku 3.5", provider: "Anthropic", inputPer1M: 0.80, outputPer1M: 4.00, contextK: 200, maxOutK: 8, tags: ["低コスト"] },
  { name: "Gemini 2.5 Pro", provider: "Google", inputPer1M: 1.25, outputPer1M: 10.00, contextK: 1000, maxOutK: 64, tags: ["最高性能", "バランス"] },
  { name: "Gemini 2.5 Flash", provider: "Google", inputPer1M: 0.15, outputPer1M: 0.60, contextK: 1000, maxOutK: 64, tags: ["バランス", "最安"] },
  { name: "Gemini 2.0 Flash", provider: "Google", inputPer1M: 0.10, outputPer1M: 0.40, contextK: 1000, maxOutK: 8, tags: ["最安", "大量処理"] },
];

type SortKey = "name" | "provider" | "inputPer1M" | "outputPer1M" | "contextK" | "maxOutK";
type SortDir = "asc" | "desc";

const PROVIDER_STYLES: Record<Provider, { badge: string; row: string }> = {
  OpenAI: { badge: "bg-green-100 text-green-800", row: "hover:bg-green-50/50" },
  Anthropic: { badge: "bg-orange-100 text-orange-800", row: "hover:bg-orange-50/50" },
  Google: { badge: "bg-blue-100 text-blue-800", row: "hover:bg-blue-50/50" },
};

const PRICE_TIERS = [
  { label: "すべて", min: 0, max: Infinity },
  { label: "低価格 (< $1)", min: 0, max: 1 },
  { label: "中価格 ($1〜$5)", min: 1, max: 5 },
  { label: "高価格 (> $5)", min: 5, max: Infinity },
];

const USE_CASES = [
  {
    label: "最安",
    icon: "💰",
    color: "bg-yellow-50 border-yellow-200",
    models: ["GPT-4.1-nano", "Gemini 2.0 Flash"],
    desc: "大量処理・プロトタイプ向け",
  },
  {
    label: "バランス",
    icon: "⚖️",
    color: "bg-blue-50 border-blue-200",
    models: ["GPT-4o", "Claude Sonnet 4", "Gemini 2.5 Flash"],
    desc: "コスパ重視の本番利用",
  },
  {
    label: "最高性能",
    icon: "🏆",
    color: "bg-purple-50 border-purple-200",
    models: ["o3", "Claude Opus 4", "Gemini 2.5 Pro"],
    desc: "複雑な推論・高精度が必要な場面",
  },
  {
    label: "コーディング",
    icon: "💻",
    color: "bg-green-50 border-green-200",
    models: ["Claude Sonnet 4", "GPT-4.1"],
    desc: "コード生成・レビュー・デバッグ",
  },
  {
    label: "大量処理",
    icon: "⚡",
    color: "bg-orange-50 border-orange-200",
    models: ["GPT-4.1-nano", "Gemini 2.0 Flash"],
    desc: "バッチ処理・分類・要約",
  },
];

function fmt(n: number, digits = 2) {
  return n.toFixed(digits);
}

function fmtK(k: number) {
  return k >= 1000 ? `${k / 1000}M` : `${k}K`;
}

export default function AiModelComparison() {
  const [sortKey, setSortKey] = useState<SortKey>("inputPer1M");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [providerFilter, setProviderFilter] = useState<Provider | "すべて">("すべて");
  const [tierFilter, setTierFilter] = useState(0);
  const [fxRate, setFxRate] = useState(150);
  const [calcInput, setCalcInput] = useState("");
  const [calcOutput, setCalcOutput] = useState("");

  const tier = PRICE_TIERS[tierFilter];

  const sorted = useMemo(() => {
    return [...MODELS]
      .filter((m) => providerFilter === "すべて" || m.provider === providerFilter)
      .filter((m) => m.inputPer1M >= tier.min && m.inputPer1M < tier.max)
      .sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (typeof va === "string" && typeof vb === "string") {
          return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
      });
  }, [sortKey, sortDir, providerFilter, tier]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-gray-700 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const inputTokens = parseFloat(calcInput) || 0;
  const outputTokens = parseFloat(calcOutput) || 0;

  const calcResults = useMemo(() => {
    if (inputTokens === 0 && outputTokens === 0) return [];
    return [...MODELS]
      .map((m) => {
        const costUSD = (inputTokens / 1_000_000) * m.inputPer1M + (outputTokens / 1_000_000) * m.outputPer1M;
        const costJPY = costUSD * fxRate;
        return { ...m, costUSD, costJPY };
      })
      .sort((a, b) => a.costUSD - b.costUSD);
  }, [inputTokens, outputTokens, fxRate]);

  const thClass = "px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap";
  const tdClass = "px-3 py-3 text-sm text-gray-800 whitespace-nowrap";

  return (
    <div className="space-y-8">
      {/* 用途別おすすめ */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">用途別おすすめ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className={`rounded-xl border p-4 ${uc.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{uc.icon}</span>
                <span className="font-semibold text-gray-800 text-sm">{uc.label}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{uc.desc}</p>
              <div className="space-y-1">
                {uc.models.map((m) => (
                  <span key={m} className="inline-block text-xs bg-white/70 rounded px-2 py-0.5 mr-1 font-mono font-medium text-gray-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* フィルタ */}
      <section className="flex flex-wrap gap-3 items-center">
        <div>
          <span className="text-xs text-gray-500 mr-2 font-medium">プロバイダー</span>
          {(["すべて", "OpenAI", "Anthropic", "Google"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`mr-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                providerFilter === p
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div>
          <span className="text-xs text-gray-500 mr-2 font-medium">価格帯</span>
          {PRICE_TIERS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTierFilter(i)}
              className={`mr-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                tierFilter === i
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* 比較テーブル */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          全モデル比較表
          <span className="ml-2 text-sm font-normal text-gray-400">{sorted.length} モデル表示中</span>
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className={thClass} onClick={() => toggleSort("name")}>
                  モデル名 <SortIcon col="name" />
                </th>
                <th className={thClass} onClick={() => toggleSort("provider")}>
                  プロバイダー <SortIcon col="provider" />
                </th>
                <th className={thClass} onClick={() => toggleSort("inputPer1M")}>
                  入力 / 1Mトークン <SortIcon col="inputPer1M" />
                </th>
                <th className={thClass} onClick={() => toggleSort("outputPer1M")}>
                  出力 / 1Mトークン <SortIcon col="outputPer1M" />
                </th>
                <th className={thClass} onClick={() => toggleSort("contextK")}>
                  コンテキスト長 <SortIcon col="contextK" />
                </th>
                <th className={thClass} onClick={() => toggleSort("maxOutK")}>
                  最大出力 <SortIcon col="maxOutK" />
                </th>
                <th className={`${thClass} cursor-default`}>タグ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {sorted.map((m) => (
                <tr key={m.name} className={`transition-colors ${PROVIDER_STYLES[m.provider].row}`}>
                  <td className={`${tdClass} font-semibold text-gray-900`}>{m.name}</td>
                  <td className={tdClass}>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PROVIDER_STYLES[m.provider].badge}`}>
                      {m.provider}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className="font-mono">${fmt(m.inputPer1M)}</span>
                    <span className="text-xs text-gray-400 ml-1">(¥{Math.round(m.inputPer1M * fxRate)})</span>
                  </td>
                  <td className={tdClass}>
                    <span className="font-mono">${fmt(m.outputPer1M)}</span>
                    <span className="text-xs text-gray-400 ml-1">(¥{Math.round(m.outputPer1M * fxRate)})</span>
                  </td>
                  <td className={`${tdClass} font-mono`}>{fmtK(m.contextK)}</td>
                  <td className={`${tdClass} font-mono`}>{fmtK(m.maxOutK)}</td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap gap-1">
                      {m.tags.map((tag) => (
                        <span key={tag} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-400">
                    条件に一致するモデルがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">※ 料金は2025年4月時点の公式情報。為替レートは設定値を使用。</p>
      </section>

      {/* コスト試算 */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">コスト一括試算</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-wrap gap-4 mb-5">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">入力トークン数</label>
              <input
                type="number"
                value={calcInput}
                onChange={(e) => setCalcInput(e.target.value)}
                placeholder="例: 10000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">出力トークン数</label>
              <input
                type="number"
                value={calcOutput}
                onChange={(e) => setCalcOutput(e.target.value)}
                placeholder="例: 2000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="min-w-[120px]">
              <label className="block text-xs font-medium text-gray-600 mb-1">為替レート (円/ドル)</label>
              <input
                type="number"
                value={fxRate}
                onChange={(e) => setFxRate(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>

          {calcResults.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">モデル</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">プロバイダー</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">コスト (USD)</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">コスト (JPY)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {calcResults.map((m, i) => (
                    <tr key={m.name} className={`transition-colors ${PROVIDER_STYLES[m.provider].row} ${i === 0 ? "bg-yellow-50" : ""}`}>
                      <td className="px-3 py-2 text-sm font-semibold text-gray-900 flex items-center gap-1">
                        {i === 0 && <span className="text-xs">🏅</span>}
                        {m.name}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PROVIDER_STYLES[m.provider].badge}`}>
                          {m.provider}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-mono">
                        ${m.costUSD < 0.0001 ? m.costUSD.toExponential(2) : fmt(m.costUSD, 4)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right font-mono">
                        ¥{m.costJPY < 0.01 ? m.costJPY.toExponential(2) : fmt(m.costJPY, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-400">
              入力・出力トークン数を入力すると全モデルのコストを一括表示します
            </div>
          )}
        </div>
      </section>

      {/* 凡例 */}
      <section className="flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-green-200"></span>OpenAI
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-200"></span>Anthropic
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-200"></span>Google
        </div>
        <span className="ml-auto">料金は税抜き・API利用料のみ。実際の請求は使用条件により異なります。</span>
      </section>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAIモデル比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">主要AIモデル（GPT-4o, Claude Opus, Gemini Pro等）の料金・コンテキスト長・特徴を一覧比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAIモデル比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "主要AIモデル（GPT-4o, Claude Opus, Gemini Pro等）の料金・コンテキスト長・特徴を一覧比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
