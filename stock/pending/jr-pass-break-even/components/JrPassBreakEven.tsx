"use client";
import { useState } from "react";

const JR_PASS_PRICES = [
  { days: 7, price: 50000, label: "7日間パス" },
  { days: 14, price: 80000, label: "14日間パス" },
  { days: 21, price: 100000, label: "21日間パス" },
];

const COMMON_ROUTES = [
  { from: "東京", to: "大阪（新幹線のぞみ）", price: 13870, note: "のぞみはJRパス不可" },
  { from: "東京", to: "大阪（新幹線ひかり）", price: 13870, note: "ひかりはJRパス対応" },
  { from: "東京", to: "京都（新幹線）", price: 13320, note: "" },
  { from: "東京", to: "広島（新幹線）", price: 18380, note: "" },
  { from: "東京", to: "博多（新幹線）", price: 22950, note: "" },
  { from: "東京", to: "仙台（新幹線）", price: 11410, note: "" },
  { from: "東京", to: "新函館北斗（新幹線）", price: 22690, note: "" },
  { from: "大阪", to: "広島（新幹線）", price: 9440, note: "" },
  { from: "大阪", to: "博多（新幹線）", price: 14720, note: "" },
  { from: "大阪", to: "金沢（サンダーバード）", price: 7570, note: "" },
  { from: "東京", to: "名古屋（新幹線）", price: 11090, note: "" },
  { from: "名古屋", to: "博多（新幹線）", price: 19130, note: "" },
];

interface RouteEntry {
  id: number;
  from: string;
  to: string;
  price: number;
  roundTrip: boolean;
}

export default function JrPassBreakEven() {
  const [selectedPass, setSelectedPass] = useState(0);
  const [routes, setRoutes] = useState<RouteEntry[]>([
    { id: 1, from: "東京", to: "京都（新幹線）", price: 13320, roundTrip: true },
  ]);
  const [showPresets, setShowPresets] = useState(false);

  const passPrice = JR_PASS_PRICES[selectedPass].price;
  const totalFare = routes.reduce(
    (sum, r) => sum + r.price * (r.roundTrip ? 2 : 1),
    0
  );
  const savings = totalFare - passPrice;
  const breakEven = passPrice;
  const pct = Math.min(150, (totalFare / passPrice) * 100);

  const addRoute = () => {
    setRoutes([
      ...routes,
      { id: Date.now(), from: "", to: "", price: 0, roundTrip: false },
    ]);
  };

  const removeRoute = (id: number) => {
    setRoutes(routes.filter((r) => r.id !== id));
  };

  const updateRoute = (id: number, field: keyof RouteEntry, value: string | number | boolean) => {
    setRoutes(routes.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addPreset = (route: typeof COMMON_ROUTES[0]) => {
    setRoutes([
      ...routes,
      { id: Date.now(), from: route.from, to: route.to, price: route.price, roundTrip: false },
    ]);
    setShowPresets(false);
  };

  return (
    <div className="space-y-6">
      {/* Pass selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">JRパスの種類を選択</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {JR_PASS_PRICES.map((pass, idx) => (
            <button
              key={pass.days}
              onClick={() => setSelectedPass(idx)}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${
                selectedPass === idx
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-bold text-gray-900">{pass.label}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ¥{pass.price.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                1日あたり ¥{Math.round(pass.price / pass.days).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ※2024年時点の外国人向けJRパス料金。のぞみ・みずほは別途特急券が必要です（JRパス対象外）。
        </p>
      </div>

      {/* Route input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">利用区間の入力</h2>
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            よく使うルートから追加
          </button>
        </div>

        {showPresets && (
          <div className="mb-4 bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {COMMON_ROUTES.map((route, idx) => (
                <button
                  key={idx}
                  onClick={() => addPreset(route)}
                  className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm"
                >
                  <span className="font-medium text-gray-800">
                    {route.from} → {route.to}
                  </span>
                  <span className="ml-2 text-indigo-600 font-semibold">
                    ¥{route.price.toLocaleString()}
                  </span>
                  {route.note && (
                    <span className="block text-xs text-orange-500 mt-0.5">{route.note}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {routes.map((route, idx) => (
            <div key={route.id} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500 w-6">{idx + 1}</span>
              <input
                type="text"
                placeholder="出発地"
                value={route.from}
                onChange={(e) => updateRoute(route.id, "from", e.target.value)}
                className="flex-1 min-w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-400">→</span>
              <input
                type="text"
                placeholder="到着地"
                value={route.to}
                onChange={(e) => updateRoute(route.id, "to", e.target.value)}
                className="flex-1 min-w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">¥</span>
                <input
                  type="number"
                  placeholder="片道運賃"
                  value={route.price || ""}
                  onChange={(e) => updateRoute(route.id, "price", Number(e.target.value))}
                  className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <label className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={route.roundTrip}
                  onChange={(e) => updateRoute(route.id, "roundTrip", e.target.checked)}
                  className="accent-indigo-600"
                />
                往復
              </label>
              {routes.length > 1 && (
                <button
                  onClick={() => removeRoute(route.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addRoute}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + 区間を追加
        </button>
      </div>

      {/* Result */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">損益分岐の判定</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">JRパス料金</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{passPrice.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">個別購入合計</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{totalFare.toLocaleString()}
            </p>
          </div>
          <div className={`text-center p-4 rounded-xl ${savings >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-xs text-gray-500 mb-1">
              {savings >= 0 ? "節約額" : "割高額"}
            </p>
            <p className={`text-2xl font-bold ${savings >= 0 ? "text-green-600" : "text-red-600"}`}>
              {savings >= 0 ? "+" : ""}¥{savings.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>¥0</span>
            <span>損益分岐点 ¥{breakEven.toLocaleString()}</span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-5">
            <div
              className={`h-5 rounded-full transition-all ${savings >= 0 ? "bg-green-500" : "bg-red-400"}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
              style={{ left: "66.67%" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            あと ¥{Math.max(0, breakEven - totalFare).toLocaleString()} で元が取れます
          </p>
        </div>

        <div className={`rounded-xl p-4 text-sm font-medium ${savings >= 0 ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {savings >= 0
            ? `JRパスを購入すると ¥${savings.toLocaleString()} お得です！`
            : `個別購入の方が ¥${Math.abs(savings).toLocaleString()} 安いです。JRパスは不要かもしれません。`}
        </div>

        {/* Per route breakdown */}
        <div className="mt-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">区間ごとの内訳</h3>
          <div className="space-y-1">
            {routes.filter((r) => r.price > 0).map((r, idx) => (
              <div key={r.id} className="flex justify-between text-sm text-gray-600">
                <span>
                  {r.from || "??"} → {r.to || "??"}
                  {r.roundTrip ? "（往復）" : "（片道）"}
                </span>
                <span className="font-medium">
                  ¥{(r.price * (r.roundTrip ? 2 : 1)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このJRパス損益分岐計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ルート別の運賃合計とJRパス料金を比較して損益分岐を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このJRパス損益分岐計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ルート別の運賃合計とJRパス料金を比較して損益分岐を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JRパス損益分岐計算",
  "description": "ルート別の運賃合計とJRパス料金を比較して損益分岐を計算",
  "url": "https://tools.loresync.dev/jr-pass-break-even",
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
