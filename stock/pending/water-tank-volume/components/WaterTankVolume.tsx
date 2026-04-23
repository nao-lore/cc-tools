"use client";

import { useState, useCallback } from "react";

interface TankResult {
  grossVolume: number;
  netVolume: number;
  waterWeight: number;
  totalWeight: number;
  heaterWatt: number;
  filterLPH: number;
  lightLumen: number;
  co2Bubble: number;
  fishCapacity: number;
}

type Shape = "rectangle" | "cylinder";

function heaterRecommendation(liters: number): { watt: number; note: string } {
  if (liters <= 10) return { watt: 50, note: "〜10L" };
  if (liters <= 20) return { watt: 100, note: "〜20L" };
  if (liters <= 40) return { watt: 150, note: "〜40L" };
  if (liters <= 60) return { watt: 200, note: "〜60L" };
  if (liters <= 90) return { watt: 300, note: "〜90L" };
  if (liters <= 120) return { watt: 400, note: "〜120L" };
  return { watt: Math.ceil(liters * 3.5 / 100) * 100, note: "大型水槽" };
}

function filterRecommendation(liters: number): { lph: number; note: string } {
  const recommended = liters * 5; // turnover 5x per hour is standard
  return { lph: Math.ceil(recommended / 100) * 100, note: "水量の5〜10倍/時を目安" };
}

export default function WaterTankVolume() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [length, setLength] = useState("60");
  const [width, setWidth] = useState("30");
  const [height, setHeight] = useState("36");
  const [diameter, setDiameter] = useState("40");
  const [fillPct, setFillPct] = useState("90");
  const [glassThickness, setGlassThickness] = useState("5");
  const [tankWeight, setTankWeight] = useState("8");
  const [result, setResult] = useState<TankResult | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    setError("");
    const fp = parseFloat(fillPct) / 100;
    const gt = parseFloat(glassThickness);
    const tw = parseFloat(tankWeight);

    if (fp <= 0 || fp > 1) { setError("水量割合は1〜100%を入力してください。"); return; }
    if (isNaN(gt) || gt < 0) { setError("ガラス厚は0以上を入力してください。"); return; }
    if (isNaN(tw) || tw < 0) { setError("水槽重量は0以上を入力してください。"); return; }

    let grossVolume: number;
    let netVolume: number;

    if (shape === "rectangle") {
      const l = parseFloat(length), w = parseFloat(width), h = parseFloat(height);
      if ([l, w, h].some((v) => isNaN(v) || v <= 0)) { setError("縦・横・高さを正の値で入力してください。"); return; }
      grossVolume = (l * w * h) / 1000; // cm³ to liters
      const innerL = l - gt * 2, innerW = w - gt * 2, innerH = h - gt;
      netVolume = innerL > 0 && innerW > 0 && innerH > 0 ? (innerL * innerW * innerH) / 1000 : grossVolume;
    } else {
      const d = parseFloat(diameter), h = parseFloat(height);
      if ([d, h].some((v) => isNaN(v) || v <= 0)) { setError("直径・高さを正の値で入力してください。"); return; }
      grossVolume = Math.PI * (d / 2) ** 2 * h / 1000;
      const innerD = d - gt * 2;
      netVolume = innerD > 0 ? Math.PI * (innerD / 2) ** 2 * (h - gt) / 1000 : grossVolume;
    }

    const waterVolume = netVolume * fp;
    const waterWeight = waterVolume * 1.0; // kg (1L = 1kg)
    const totalWeight = waterWeight + tw;
    const heater = heaterRecommendation(waterVolume);
    const filter = filterRecommendation(waterVolume);
    const lightLumen = waterVolume * 20; // rough: 20 lumen per liter for planted
    const co2Bubble = Math.ceil(waterVolume / 10); // ~1 bubble/sec per 10L
    const fishCapacity = Math.floor(waterVolume / 3); // rough: 1 small fish per 3L

    setResult({
      grossVolume,
      netVolume: waterVolume,
      waterWeight,
      totalWeight,
      heaterWatt: heater.watt,
      filterLPH: filter.lph,
      lightLumen,
      co2Bubble,
      fishCapacity,
    });
  }, [shape, length, width, height, diameter, fillPct, glassThickness, tankWeight]);

  return (
    <div className="space-y-6">
      {/* Shape selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">水槽の形状と寸法</h2>
        <div className="flex gap-3 mb-5">
          {([["rectangle", "直方体（一般的な水槽）"], ["cylinder", "円柱（円形水槽）"]] as [Shape, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setShape(key); setResult(null); setError(""); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${shape === key ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {shape === "rectangle" ? (
            <>
              {[
                { label: "長さ（前後）", val: length, set: setLength },
                { label: "幅（左右）", val: width, set: setWidth },
                { label: "高さ", val: height, set: setHeight },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder="cm" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-500">cm</span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">直径</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={diameter} onChange={(e) => setDiameter(e.target.value)} className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  <span className="text-sm text-gray-500">cm</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">高さ</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  <span className="text-sm text-gray-500">cm</span>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">水量割合</label>
            <div className="flex items-center gap-1">
              <input type="number" value={fillPct} onChange={(e) => setFillPct(e.target.value)} min="1" max="100" className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ガラス厚</label>
            <div className="flex items-center gap-1">
              <input type="number" value={glassThickness} onChange={(e) => setGlassThickness(e.target.value)} className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <span className="text-sm text-gray-500">mm</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">水槽重量（空）</label>
            <div className="flex items-center gap-1">
              <input type="number" value={tankWeight} onChange={(e) => setTankWeight(e.target.value)} className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <span className="text-sm text-gray-500">kg</span>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <button onClick={calculate} className="mt-5 px-6 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors">
          計算する
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "外寸容量", val: result.grossVolume.toFixed(1), unit: "L", color: "cyan" },
              { label: "実水量", val: result.netVolume.toFixed(1), unit: "L", color: "blue" },
              { label: "水の重さ", val: result.waterWeight.toFixed(1), unit: "kg", color: "indigo" },
              { label: "総重量", val: result.totalWeight.toFixed(1), unit: "kg", color: "purple" },
            ].map(({ label, val, unit, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className={`text-2xl font-bold text-${color}-600`}>{val}</div>
                <div className="text-xs text-gray-400">{unit}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">推奨機材スペック</h2>
            <div className="space-y-3">
              {[
                { label: "ヒーター", val: `${result.heaterWatt}W以上`, icon: "🌡️", note: "水温維持（夏季不要の場合あり）" },
                { label: "フィルター", val: `${result.filterLPH.toLocaleString()} L/h以上`, icon: "💧", note: "水量の5〜10倍/時が目安" },
                { label: "照明（水草あり）", val: `${result.lightLumen.toLocaleString()} lm以上`, icon: "💡", note: "20 lm/L を目安" },
                { label: "CO2添加（水草あり）", val: `約 ${result.co2Bubble} 泡/秒`, icon: "🌿", note: "10L あたり1泡/秒が目安" },
                { label: "小型魚の収容目安", val: `約 ${result.fishCapacity} 匹`, icon: "🐟", note: "3L あたり1匹（小型魚基準）" },
              ].map(({ label, val, icon, note }) => (
                <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span className="text-sm font-bold text-cyan-700">{val}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cyan-50 rounded-2xl border border-cyan-200 p-5">
            <h3 className="font-semibold text-cyan-800 mb-2">注意事項</h3>
            <ul className="text-cyan-700 text-sm space-y-1">
              <li>• 推奨値は一般的な目安です。魚種・水草の種類・室温により異なります。</li>
              <li>• 総重量には底砂・流木・石等の重量は含まれていません。</li>
              <li>• 設置場所の耐荷重（通常 180kg/m²）を必ず確認してください。</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
