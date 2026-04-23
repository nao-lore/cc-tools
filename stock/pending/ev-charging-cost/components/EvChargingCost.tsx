"use client";

import { useState, useMemo } from "react";

type ChargingMode = "home" | "fast_kwh" | "fast_min";

interface BatteryPreset {
  name: string;
  capacity: number;
  efficiency: number; // km/kWh
}

const PRESETS: BatteryPreset[] = [
  { name: "日産リーフ 40kWh", capacity: 40, efficiency: 7.0 },
  { name: "日産リーフ 62kWh", capacity: 62, efficiency: 7.0 },
  { name: "テスラ モデル3 60kWh", capacity: 60, efficiency: 6.5 },
  { name: "テスラ モデルY 75kWh", capacity: 75, efficiency: 6.0 },
  { name: "カスタム", capacity: 0, efficiency: 7.0 },
];

const GASOLINE_PRICE_JPY = 175; // 円/L
const GASOLINE_EFFICIENCY = 15; // km/L

function fmt(n: number, decimals = 0): string {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function EvChargingCost() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [customCapacity, setCustomCapacity] = useState("50");
  const [currentSoc, setCurrentSoc] = useState(20);
  const [electricRate, setElectricRate] = useState("31");
  const [mode, setMode] = useState<ChargingMode>("home");
  const [fastKwhRate, setFastKwhRate] = useState("50");
  const [fastMinRate, setFastMinRate] = useState("50");
  const [fastMinutes, setFastMinutes] = useState("30");
  const [efficiency, setEfficiency] = useState("7");

  const preset = PRESETS[presetIndex];
  const isCustom = presetIndex === PRESETS.length - 1;

  const batteryCapacity = useMemo(() => {
    if (isCustom) {
      const v = parseFloat(customCapacity);
      return isNaN(v) || v <= 0 ? 0 : v;
    }
    return preset.capacity;
  }, [isCustom, customCapacity, preset.capacity]);

  const efficiencyKm = useMemo(() => {
    const v = parseFloat(efficiency);
    return isNaN(v) || v <= 0 ? 7 : v;
  }, [efficiency]);

  const results = useMemo(() => {
    if (batteryCapacity <= 0) return null;

    const chargeKwh = batteryCapacity * (1 - currentSoc / 100);
    if (chargeKwh <= 0) return null;

    let cost = 0;
    let costLabel = "";

    if (mode === "home") {
      const rate = parseFloat(electricRate);
      if (isNaN(rate) || rate <= 0) return null;
      cost = chargeKwh * rate;
      costLabel = `${fmt(chargeKwh, 1)} kWh × ${fmt(rate)} 円/kWh`;
    } else if (mode === "fast_kwh") {
      const rate = parseFloat(fastKwhRate);
      if (isNaN(rate) || rate <= 0) return null;
      cost = chargeKwh * rate;
      costLabel = `${fmt(chargeKwh, 1)} kWh × ${fmt(rate)} 円/kWh`;
    } else {
      const rate = parseFloat(fastMinRate);
      const mins = parseFloat(fastMinutes);
      if (isNaN(rate) || rate <= 0 || isNaN(mins) || mins <= 0) return null;
      cost = rate * mins;
      costLabel = `${fmt(rate)} 円/分 × ${fmt(mins)} 分`;
    }

    const range = chargeKwh * efficiencyKm;
    const kmCost = range > 0 ? cost / range : 0;

    // ガソリン車比較 (同距離)
    const gasolineCost = (range / GASOLINE_EFFICIENCY) * GASOLINE_PRICE_JPY;
    const saving = gasolineCost - cost;

    // 自宅充電コストも併記（急速充電モード時）
    let homeCost: number | null = null;
    if (mode !== "home") {
      const rate = parseFloat(electricRate);
      if (!isNaN(rate) && rate > 0) {
        homeCost = chargeKwh * rate;
      }
    }

    return { chargeKwh, cost, costLabel, range, kmCost, gasolineCost, saving, homeCost };
  }, [batteryCapacity, currentSoc, electricRate, mode, fastKwhRate, fastMinRate, fastMinutes, efficiencyKm]);

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">車両・充電設定</h2>

        {/* 車種プリセット */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">車種プリセット</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => {
                  setPresetIndex(i);
                  if (!isCustom && i !== PRESETS.length - 1) {
                    setEfficiency(p.efficiency.toString());
                  }
                }}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors text-left ${
                  presetIndex === i
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* カスタム容量 */}
        {isCustom && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">バッテリー容量 (kWh)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="0.5"
                value={customCapacity}
                onChange={(e) => setCustomCapacity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-14 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="例: 50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">kWh</span>
            </div>
          </div>
        )}

        {/* バッテリー容量表示 */}
        {!isCustom && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm text-gray-600">
            バッテリー容量: <span className="font-bold text-gray-900">{preset.capacity} kWh</span>
          </div>
        )}

        {/* 現在残量 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">現在の残量 (SOC)</label>
            <span className="text-sm font-bold text-green-600">{currentSoc}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={currentSoc}
            onChange={(e) => setCurrentSoc(parseInt(e.target.value, 10))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span className="text-gray-500">充電量: {batteryCapacity > 0 ? fmt(batteryCapacity * (1 - currentSoc / 100), 1) : "—"} kWh</span>
            <span>95%</span>
          </div>
        </div>

        {/* 電費 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">電費 (目安)</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="0.5"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-20 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">km/kWh</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">国内平均目安: 6〜8 km/kWh</p>
        </div>

        {/* 充電方式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">充電方式</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "home" as ChargingMode, label: "自宅\n普通充電" },
              { key: "fast_kwh" as ChargingMode, label: "急速充電\n(kWh単価)" },
              { key: "fast_min" as ChargingMode, label: "急速充電\n(分単価)" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors whitespace-pre-line leading-tight ${
                  mode === key
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 充電方式別入力 */}
        {mode === "home" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電気単価 (円/kWh)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="0.5"
                value={electricRate}
                onChange={(e) => setElectricRate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-20 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">円/kWh</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">夜間割引なし目安: 31円/kWh</p>
          </div>
        )}

        {mode === "fast_kwh" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">急速充電単価 (円/kWh)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={fastKwhRate}
                onChange={(e) => setFastKwhRate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-20 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">円/kWh</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">急速充電器目安: 40〜80円/kWh</p>
          </div>
        )}

        {mode === "fast_min" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分単価 (円/分)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={fastMinRate}
                  onChange={(e) => setFastMinRate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-16 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">円/分</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">e-Mobility Power目安: 約50円/分</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">充電時間 (分)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={fastMinutes}
                  onChange={(e) => setFastMinutes(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">分</span>
              </div>
            </div>
          </div>
        )}

        {/* 急速充電時の電気単価（比較用） */}
        {mode !== "home" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">自宅電気単価 (比較用)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="0.5"
                value={electricRate}
                onChange={(e) => setElectricRate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-20 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">円/kWh</span>
            </div>
          </div>
        )}
      </div>

      {/* 広告プレースホルダー */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 h-20 flex items-center justify-center text-xs text-gray-300">
        AD
      </div>

      {/* 結果 */}
      {results ? (
        <div className="space-y-4">
          {/* メイン結果 */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-6 space-y-4">
            <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wide">充電コスト</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">1回の充電コスト</p>
                <p className="text-4xl font-extrabold text-green-700">{fmt(results.cost)}<span className="text-lg font-medium ml-1">円</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">充電量</p>
                <p className="text-3xl font-bold text-gray-800">{fmt(results.chargeKwh, 1)}<span className="text-base font-medium ml-1">kWh</span></p>
              </div>
            </div>

            <div className="rounded-lg bg-white/70 border border-green-100 px-4 py-2.5 text-xs text-gray-500 font-mono">
              {results.costLabel} = {fmt(results.cost)} 円
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white border border-green-100 px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">走行可能距離</p>
                <p className="text-xl font-bold text-gray-800">{fmt(results.range, 0)} <span className="text-sm font-medium">km</span></p>
                <p className="text-xs text-gray-400 mt-0.5">{fmt(efficiencyKm, 1)} km/kWh 換算</p>
              </div>
              <div className="rounded-lg bg-white border border-green-100 px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">1kmあたりのコスト</p>
                <p className="text-xl font-bold text-gray-800">{fmt(results.kmCost, 1)} <span className="text-sm font-medium">円/km</span></p>
              </div>
            </div>
          </div>

          {/* 急速充電 vs 自宅充電比較 */}
          {results.homeCost !== null && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">充電方式比較</h3>
              <div className="space-y-2">
                {[
                  { label: "急速充電", cost: results.cost, color: "bg-amber-400" },
                  { label: "自宅充電 (参考)", cost: results.homeCost, color: "bg-green-400" },
                ].map(({ label, cost, color }) => {
                  const max = Math.max(results.cost, results.homeCost ?? 0);
                  const pct = max > 0 ? (cost / max) * 100 : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-bold text-gray-900">{fmt(cost)} 円</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">
                急速充電は自宅の {results.homeCost > 0 ? fmt(results.cost / results.homeCost, 1) : "—"} 倍のコスト
              </p>
            </div>
          )}

          {/* ガソリン車比較 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">ガソリン車との比較</h3>
            <p className="text-xs text-gray-400">同距離 ({fmt(results.range, 0)} km) を走行した場合 / ガソリン {GASOLINE_PRICE_JPY}円/L・燃費 {GASOLINE_EFFICIENCY}km/L 想定</p>
            <div className="space-y-2">
              {[
                { label: "EV (今回の充電)", cost: results.cost, color: "bg-green-400" },
                { label: "ガソリン車", cost: results.gasolineCost, color: "bg-gray-300" },
              ].map(({ label, cost, color }) => {
                const max = Math.max(results.cost, results.gasolineCost);
                const pct = max > 0 ? (cost / max) * 100 : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="font-bold text-gray-900">{fmt(cost)} 円</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={`rounded-lg px-4 py-2.5 text-sm font-medium ${results.saving > 0 ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {results.saving > 0
                ? `EV の方が ${fmt(results.saving)} 円お得`
                : `ガソリン車の方が ${fmt(-results.saving)} 円お得`}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          バッテリー容量と残量を設定すると結果が表示されます
        </div>
      )}
    </div>
  );
}
