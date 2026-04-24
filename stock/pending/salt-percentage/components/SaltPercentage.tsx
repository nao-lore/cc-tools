"use client";
import { useState } from "react";

const INGREDIENT_PRESETS = [
  { name: "鶏むね肉", weight: 250, recommended: 0.9 },
  { name: "豚バラ", weight: 300, recommended: 1.0 },
  { name: "牛肉", weight: 200, recommended: 0.9 },
  { name: "鮭", weight: 150, recommended: 1.0 },
  { name: "白身魚", weight: 200, recommended: 0.8 },
  { name: "ブロッコリー", weight: 200, recommended: 0.6 },
  { name: "ほうれん草", weight: 150, recommended: 0.5 },
  { name: "パスタ（茹で水）", weight: 2000, recommended: 1.0 },
];

const SEASONINGS = [
  { name: "食塩", saltRatio: 0.99, unit: "g", color: "bg-gray-100 border-gray-300" },
  { name: "濃口醤油", saltRatio: 0.16, unit: "g", color: "bg-amber-50 border-amber-300" },
  { name: "薄口醤油", saltRatio: 0.19, unit: "g", color: "bg-yellow-50 border-yellow-300" },
  { name: "白味噌", saltRatio: 0.12, unit: "g", color: "bg-orange-50 border-orange-300" },
  { name: "赤味噌", saltRatio: 0.13, unit: "g", color: "bg-red-50 border-red-300" },
  { name: "塩麹", saltRatio: 0.13, unit: "g", color: "bg-amber-50 border-amber-200" },
  { name: "ナンプラー", saltRatio: 0.23, unit: "g", color: "bg-yellow-50 border-yellow-200" },
  { name: "塩昆布（per 1g）", saltRatio: 0.20, unit: "g", color: "bg-green-50 border-green-300" },
];

const SALT_GUIDES = [
  { category: "お肉料理", range: "0.8〜1.0%", note: "下味・マリネ" },
  { category: "魚料理", range: "0.8〜1.2%", note: "臭み消し効果も" },
  { category: "野菜の塩もみ", range: "1.0〜2.0%", note: "水分を出す" },
  { category: "パスタの茹で水", range: "0.8〜1.2%", note: "海水の約1/3" },
  { category: "スープ", range: "0.6〜0.9%", note: "飲んで丁度よい濃度" },
  { category: "ご飯のお供（漬物等）", range: "2.0〜3.0%", note: "保存目的も兼ねる" },
];

export default function SaltPercentage() {
  const [weight, setWeight] = useState<string>("300");
  const [saltPct, setSaltPct] = useState<string>("0.9");
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const w = parseFloat(weight) || 0;
  const pct = parseFloat(saltPct) || 0;
  const saltGrams = (w * pct) / 100;

  const applyPreset = (idx: number) => {
    const p = INGREDIENT_PRESETS[idx];
    setWeight(String(p.weight));
    setSaltPct(String(p.recommended));
    setActivePreset(idx);
  };

  const getSaltLevel = (p: number) => {
    if (p < 0.5) return { label: "薄め", color: "text-blue-500" };
    if (p < 1.0) return { label: "ちょうど良い", color: "text-green-600" };
    if (p < 2.0) return { label: "しっかり", color: "text-yellow-600" };
    return { label: "濃い", color: "text-red-600" };
  };

  const level = getSaltLevel(pct);

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <p className="text-xs text-gray-500 mb-2">よく使う食材から選ぶ</p>
        <div className="flex flex-wrap gap-2">
          {INGREDIENT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(idx)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activePreset === idx
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-teal-300 hover:bg-teal-50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            食材の重量（g）
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setActivePreset(null); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="例: 300"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            塩分パーセント（%）
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.1"
              value={saltPct}
              onChange={(e) => { setSaltPct(e.target.value); setActivePreset(null); }}
              className="flex-1 accent-teal-500"
            />
            <input
              type="number"
              value={saltPct}
              onChange={(e) => { setSaltPct(e.target.value); setActivePreset(null); }}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
              step="0.1"
              min="0"
              max="10"
            />
          </div>
          <p className={`text-xs mt-1 font-medium ${level.color}`}>{level.label}</p>
        </div>
      </div>

      {/* Main Result */}
      <div className="bg-teal-50 rounded-xl border border-teal-200 p-5 text-center">
        <p className="text-sm text-teal-700 mb-1">必要な塩分量</p>
        <p className="text-5xl font-bold text-teal-600">
          {w > 0 ? saltGrams.toFixed(2) : "—"}
          <span className="text-2xl ml-1">g</span>
        </p>
        {w > 0 && (
          <p className="text-xs text-teal-600 mt-2">
            {w}g × {pct}% = {saltGrams.toFixed(2)}g の塩分
          </p>
        )}
      </div>

      {/* Seasoning Conversions */}
      {w > 0 && saltGrams > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">調味料換算</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SEASONINGS.map((s, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-center ${s.color}`}
              >
                <p className="text-xs text-gray-600 mb-1">{s.name}</p>
                <p className="text-lg font-bold text-gray-800">
                  {(saltGrams / s.saltRatio).toFixed(1)}g
                </p>
                <p className="text-xs text-gray-500">塩分{(s.saltRatio * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teaspoon reference */}
      {w > 0 && saltGrams > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">スプーン換算（食塩）</p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥄</span>
              <div>
                <p className="text-xs text-gray-500">小さじ1 = 6g</p>
                <p className="font-semibold text-gray-800">{(saltGrams / 6).toFixed(2)} 杯</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥄</span>
              <div>
                <p className="text-xs text-gray-500">大さじ1 = 18g</p>
                <p className="font-semibold text-gray-800">{(saltGrams / 18).toFixed(2)} 杯</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">料理別 塩分パーセントの目安</h3>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-gray-600 font-medium">料理カテゴリ</th>
                <th className="text-center px-4 py-2.5 text-gray-600 font-medium">塩分%</th>
                <th className="text-left px-4 py-2.5 text-gray-600 font-medium hidden sm:table-cell">備考</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SALT_GUIDES.map((g, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSaltPct(g.range.split("〜")[0].replace("%", ""))}
                  className="hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-800">{g.category}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-teal-700">{g.range}</td>
                  <td className="px-4 py-2.5 text-gray-500 hidden sm:table-cell">{g.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-1">行をクリックすると最小値をセット</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この塩分パーセント計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">食材重量から適切な塩分量を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この塩分パーセント計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "食材重量から適切な塩分量を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "塩分パーセント計算",
  "description": "食材重量から適切な塩分量を計算",
  "url": "https://tools.loresync.dev/salt-percentage",
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
