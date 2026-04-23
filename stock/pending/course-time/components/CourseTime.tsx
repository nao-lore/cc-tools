"use client";

import { useState, useMemo } from "react";

const FITNESS_LEVELS = [
  { label: "初心者", value: 1.2 },
  { label: "標準", value: 1.0 },
  { label: "健脚", value: 0.8 },
] as const;

const REST_RATES = [
  { label: "少なめ (+10%)", value: 0.1 },
  { label: "標準 (+15%)", value: 0.15 },
  { label: "多め (+20%)", value: 0.2 },
] as const;

function formatHM(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

function addHours(base: Date, hours: number): string {
  const d = new Date(base.getTime() + hours * 3600 * 1000);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function CourseTime() {
  const [distance, setDistance] = useState("8");
  const [ascentM, setAscentM] = useState("600");
  const [descentM, setDescentM] = useState("600");
  const [fitnessIdx, setFitnessIdx] = useState(1);
  const [restRateIdx, setRestRateIdx] = useState(1);
  const [departureH, setDepartureH] = useState("06");
  const [departureMin, setDepartureMin] = useState("00");

  const result = useMemo(() => {
    const dist = parseFloat(distance);
    const asc = parseFloat(ascentM);
    const desc = parseFloat(descentM);
    if (isNaN(dist) || dist <= 0 || isNaN(asc) || asc < 0 || isNaN(desc) || desc < 0) return null;

    const factor = FITNESS_LEVELS[fitnessIdx].value;

    // 昭文社方式
    // 登り時間: 標高差 / 300 m/h
    const ascentH = (asc / 300) * factor;
    // 下り時間: 標高差 / 500 m/h
    const descentH = (desc / 500) * factor;
    // 水平時間: 距離 / 4 km/h
    const horizontalH = (dist / 4) * factor;

    // 合計 = max(登り, 水平) + 短い方の半分
    const longer = Math.max(ascentH, horizontalH);
    const shorter = Math.min(ascentH, horizontalH);
    const movingH = longer + shorter * 0.5 + descentH;

    const restRate = REST_RATES[restRateIdx].value;
    const totalH = movingH * (1 + restRate);
    const restH = totalH - movingH;

    return { ascentH, descentH, horizontalH, movingH, restH, totalH };
  }, [distance, ascentM, descentM, fitnessIdx, restRateIdx]);

  const departureDate = useMemo(() => {
    const h = parseInt(departureH, 10);
    const m = parseInt(departureMin, 10);
    if (isNaN(h) || isNaN(m)) return null;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }, [departureH, departureMin]);

  const arrivalTime = useMemo(() => {
    if (!result || !departureDate) return null;
    return addHours(departureDate, result.totalH);
  }, [result, departureDate]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">コース情報</h2>

        {/* 水平距離 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">水平距離</label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="例: 8"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
              km
            </span>
          </div>
        </div>

        {/* 標高差 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">累積標高差（登り）</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={ascentM}
                onChange={(e) => setAscentM(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="例: 600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">m</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">累積標高差（下り）</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={descentM}
                onChange={(e) => setDescentM(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="例: 600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">m</span>
            </div>
          </div>
        </div>

        {/* 体力レベル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">体力レベル</label>
          <div className="grid grid-cols-3 gap-2">
            {FITNESS_LEVELS.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setFitnessIdx(i)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  fitnessIdx === i
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"
                }`}
              >
                {f.label}
                <span className="block text-xs opacity-70">×{f.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 休憩 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">休憩の割合</label>
          <div className="grid grid-cols-3 gap-2">
            {REST_RATES.map((r, i) => (
              <button
                key={r.label}
                onClick={() => setRestRateIdx(i)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  restRateIdx === i
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* 出発時刻 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">出発時刻</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="23"
              value={departureH}
              onChange={(e) => setDepartureH(e.target.value.padStart(2, "0"))}
              className="w-20 rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <span className="text-gray-500 font-medium">:</span>
            <input
              type="number"
              min="0"
              max="59"
              step="5"
              value={departureMin}
              onChange={(e) => setDepartureMin(e.target.value.padStart(2, "0"))}
              className="w-20 rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Result */}
      {result ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-6 space-y-5">
          <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide">計算結果</h2>

          {/* Main numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-green-100 px-4 py-4 text-center">
              <p className="text-xs text-green-600 font-semibold mb-1">行動時間（休憩なし）</p>
              <p className="text-3xl font-extrabold text-green-700">{formatHM(result.movingH)}</p>
            </div>
            <div className="bg-white rounded-xl border border-green-100 px-4 py-4 text-center">
              <p className="text-xs text-green-600 font-semibold mb-1">休憩込み総時間</p>
              <p className="text-3xl font-extrabold text-green-700">{formatHM(result.totalH)}</p>
              <p className="text-xs text-gray-400 mt-0.5">休憩 {formatHM(result.restH)}</p>
            </div>
          </div>

          {/* Arrival */}
          {arrivalTime && (
            <div className="bg-white rounded-xl border border-green-200 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">出発</p>
                <p className="text-xl font-bold text-gray-800">{departureH}:{departureMin}</p>
              </div>
              <div className="text-gray-300 text-2xl">→</div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-0.5">到着（目安）</p>
                <p className="text-xl font-bold text-green-700">{arrivalTime}</p>
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="bg-white/70 rounded-xl border border-green-100 px-5 py-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 mb-3">内訳（昭文社方式）</p>
            {[
              { label: "登り時間", value: result.ascentH },
              { label: "下り時間", value: result.descentH },
              { label: "水平移動時間", value: result.horizontalH },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-800">{formatHM(value)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <p className="text-xs text-gray-400">
                体力係数 ×{FITNESS_LEVELS[fitnessIdx].value}（{FITNESS_LEVELS[fitnessIdx].label}）
              </p>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-400 leading-relaxed">
            ※ 昭文社コースタイム方式に基づく計算です。天候・装備・個人差により実際の所要時間は大きく異なります。余裕を持った計画を立ててください。
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          コース情報を入力すると所要時間が表示されます
        </div>
      )}

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告
      </div>
    </div>
  );
}
