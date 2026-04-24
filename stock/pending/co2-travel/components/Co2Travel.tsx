"use client";
import { useState } from "react";

const TRANSPORT_MODES = [
  { name: "国内線（飛行機）", factor: 0.130, unit: "kg-CO₂/km/人", icon: "✈" },
  { name: "国際線（飛行機）", factor: 0.195, unit: "kg-CO₂/km/人", icon: "✈" },
  { name: "新幹線", factor: 0.017, unit: "kg-CO₂/km/人", icon: "🚄" },
  { name: "在来線（電車）", factor: 0.019, unit: "kg-CO₂/km/人", icon: "🚃" },
  { name: "地下鉄", factor: 0.020, unit: "kg-CO₂/km/人", icon: "🚇" },
  { name: "路線バス", factor: 0.057, unit: "kg-CO₂/km/人", icon: "🚌" },
  { name: "高速バス", factor: 0.030, unit: "kg-CO₂/km/人", icon: "🚌" },
  { name: "普通乗用車（1人）", factor: 0.169, unit: "kg-CO₂/km/人", icon: "🚗" },
  { name: "普通乗用車（4人乗り）", factor: 0.042, unit: "kg-CO₂/km/人", icon: "🚗" },
  { name: "電気自動車（EV）", factor: 0.048, unit: "kg-CO₂/km/人", icon: "⚡" },
  { name: "フェリー", factor: 0.025, unit: "kg-CO₂/km/人", icon: "🚢" },
  { name: "自転車・徒歩", factor: 0, unit: "kg-CO₂/km/人", icon: "🚴" },
];

const REFERENCE_ROUTES = [
  { name: "東京→大阪（新幹線）", distance: 553 },
  { name: "東京→大阪（飛行機）", distance: 400 },
  { name: "東京→札幌（飛行機）", distance: 835 },
  { name: "東京→福岡（飛行機）", distance: 890 },
  { name: "東京→名古屋（新幹線）", distance: 366 },
  { name: "東京→広島（新幹線）", distance: 816 },
  { name: "東京都内（自動車 20km）", distance: 20 },
];

// Tree absorption: ~25 kg CO₂/year per tree
const TREE_ABSORPTION = 25;
// LED bulb savings vs incandescent: ~30W * 8h/day * 365 = 87.6 kWh/year * 0.4 kg/kWh = 35 kg/year
const BULB_CO2_PER_YEAR = 35;

export default function Co2Travel() {
  const [selectedMode, setSelectedMode] = useState(0);
  const [distance, setDistance] = useState("553");
  const [passengers, setPassengers] = useState("1");
  const [roundTrip, setRoundTrip] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(-1);

  const mode = TRANSPORT_MODES[selectedMode];
  const dist = parseFloat(distance) || 0;
  const pax = parseInt(passengers) || 1;
  const tripMultiplier = roundTrip ? 2 : 1;

  const totalCo2 = mode.factor * dist * pax * tripMultiplier;
  const perPersonCo2 = mode.factor * dist * tripMultiplier;

  const handleRouteSelect = (idx: number) => {
    setSelectedRoute(idx);
    setDistance(String(REFERENCE_ROUTES[idx].distance));
  };

  const isValid = dist > 0;

  return (
    <div className="space-y-6">
      {/* 参考ルート */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">参考ルート（クリックで入力）</h2>
        <div className="flex flex-wrap gap-2">
          {REFERENCE_ROUTES.map((r, i) => (
            <button
              key={i}
              onClick={() => handleRouteSelect(i)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedRoute === i
                  ? "bg-blue-100 border-blue-400 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* 設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">移動条件</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">交通手段</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TRANSPORT_MODES.map((m, i) => (
                <option key={i} value={i}>{m.icon} {m.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">排出係数: {mode.factor} {mode.unit}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">距離（km）</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => { setDistance(e.target.value); setSelectedRoute(-1); }}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">人数</label>
            <input
              type="number"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              min={1}
              max={1000}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
                className="rounded w-4 h-4"
              />
              往復で計算する
            </label>
          </div>
        </div>
      </div>

      {/* 計算結果 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">CO₂排出量</h2>
        {isValid ? (
          <div className="space-y-4">
            {mode.factor === 0 ? (
              <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
                <p className="text-green-700 font-bold text-xl">CO₂排出ゼロ</p>
                <p className="text-green-600 text-sm mt-1">自転車・徒歩は化石燃料を使わないクリーンな移動手段です</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-5 border border-orange-200 text-center">
                    <p className="text-sm text-orange-600 font-medium">1人あたり排出量</p>
                    <p className="text-3xl font-bold font-mono text-orange-700 mt-1">
                      {perPersonCo2 < 1 ? perPersonCo2.toFixed(3) : perPersonCo2.toFixed(1)}
                    </p>
                    <p className="text-orange-600 text-sm">kg-CO₂</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-5 border border-red-200 text-center">
                    <p className="text-sm text-red-600 font-medium">合計排出量（{pax}人）</p>
                    <p className="text-3xl font-bold font-mono text-red-700 mt-1">
                      {totalCo2 < 1 ? totalCo2.toFixed(3) : totalCo2.toFixed(1)}
                    </p>
                    <p className="text-red-600 text-sm">kg-CO₂</p>
                  </div>
                </div>

                {/* 換算 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">排出量の目安換算</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">相殺に必要な植樹数（年間吸収量換算）</span>
                      <span className="font-mono font-semibold text-gray-800">{(perPersonCo2 / TREE_ABSORPTION).toFixed(2)} 本・年</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">LED電球を使い続けた場合の削減量換算</span>
                      <span className="font-mono font-semibold text-gray-800">{(perPersonCo2 / BULB_CO2_PER_YEAR * 365).toFixed(0)} 日分</span>
                    </div>
                  </div>
                </div>

                {/* 交通手段比較 */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">同区間の交通手段比較（1人あたり）</h3>
                  <div className="space-y-2">
                    {TRANSPORT_MODES.filter(m => m.factor > 0).sort((a, b) => a.factor - b.factor).map((m, i) => {
                      const co2 = m.factor * dist * tripMultiplier;
                      const maxCo2 = Math.max(...TRANSPORT_MODES.map(x => x.factor * dist * tripMultiplier));
                      const pct = maxCo2 > 0 ? (co2 / maxCo2) * 100 : 0;
                      const isCurrent = TRANSPORT_MODES[selectedMode].name === m.name;
                      return (
                        <div key={i} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isCurrent ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}>
                          <span className="text-sm w-40 shrink-0 text-gray-700">{m.icon} {m.name}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${isCurrent ? "bg-blue-500" : "bg-gray-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm w-20 text-right text-gray-700">{co2.toFixed(2)} kg</span>
                        
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この移動CO2排出量計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">距離と交通手段から移動に伴うCO2排出量を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この移動CO2排出量計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "距離と交通手段から移動に伴うCO2排出量を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            <p className="text-xs text-gray-400">
              ※ 排出係数は国土交通省・環境省の公表値（2023年度）を参考にした概算値です。
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">距離を入力してください</div>
        )}
      </div>
    </div>
  );
}
