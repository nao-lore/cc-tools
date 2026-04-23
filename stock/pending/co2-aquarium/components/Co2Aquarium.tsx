"use client";
import { useState } from "react";

// CO2 concentration formula: CO2 (mg/L) = 3 * KH * 10^(7 - pH)
function calcCo2(kh: number, ph: number): number {
  return 3 * kh * Math.pow(10, 7 - ph);
}

const TANK_PRESETS = [
  { name: "20L（小型）", volume: 20 },
  { name: "30L", volume: 30 },
  { name: "45L", volume: 45 },
  { name: "60L（一般）", volume: 60 },
  { name: "90L", volume: 90 },
  { name: "120L", volume: 120 },
  { name: "180L（大型）", volume: 180 },
  { name: "カスタム", volume: null },
];

const TARGET_CO2_LEVELS = [
  { label: "低め（水草少）", co2: 10 },
  { label: "標準（水草適量）", co2: 15 },
  { label: "高め（水草多）", co2: 20 },
  { label: "最大（高光量）", co2: 30 },
];

export default function Co2Aquarium() {
  const [tankPreset, setTankPreset] = useState(3);
  const [customVolume, setCustomVolume] = useState("60");
  const [kh, setKh] = useState("4");
  const [currentPh, setCurrentPh] = useState("7.2");
  const [targetPh, setTargetPh] = useState("6.8");
  const [targetCo2, setTargetCo2] = useState("15");

  const volume =
    TANK_PRESETS[tankPreset].volume !== null
      ? TANK_PRESETS[tankPreset].volume!
      : parseFloat(customVolume) || 0;

  const khVal = parseFloat(kh) || 0;
  const currentPhVal = parseFloat(currentPh) || 7.0;
  const targetPhVal = parseFloat(targetPh) || 6.8;
  const targetCo2Val = parseFloat(targetCo2) || 15;

  const currentCo2 = khVal > 0 ? calcCo2(khVal, currentPhVal) : 0;
  const targetCalcCo2 = khVal > 0 ? calcCo2(khVal, targetPhVal) : 0;

  // Required additional CO2 per hour (assuming ~5% turnover/hour as gas loss estimate)
  const co2Diff = Math.max(0, targetCo2Val - currentCo2);
  const dailyAdditionMg = co2Diff * volume; // mg to add total
  const hourlyAdditionMg = dailyAdditionMg / 8; // over 8h photoperiod

  // Bubble count estimate: ~1mg CO2 per bubble at standard pressure
  const bubblesPerSec = hourlyAdditionMg / 3600;

  const getCo2Status = (co2: number) => {
    if (co2 < 5) return { label: "不足", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    if (co2 < 10) return { label: "やや不足", color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-200" };
    if (co2 <= 25) return { label: "適正範囲", color: "text-green-600", bg: "bg-green-50 border-green-200" };
    if (co2 <= 40) return { label: "やや過多", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    return { label: "危険（魚に有害）", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  };

  const currentStatus = getCo2Status(currentCo2);
  const targetStatus = getCo2Status(targetCalcCo2);

  const isValid = khVal > 0 && volume > 0;

  // pH → CO2 table
  const phRange = [6.0, 6.2, 6.4, 6.6, 6.8, 7.0, 7.2, 7.4, 7.6];

  return (
    <div className="space-y-6">
      {/* 水槽・水質設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">水槽・水質設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">水槽容量</label>
            <select
              value={tankPreset}
              onChange={(e) => setTankPreset(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TANK_PRESETS.map((t, i) => (
                <option key={i} value={i}>{t.name}</option>
              ))}
            </select>
            {TANK_PRESETS[tankPreset].volume === null && (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">容量（L）</label>
                <input
                  type="number"
                  value={customVolume}
                  onChange={(e) => setCustomVolume(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KH値（炭酸塩硬度）</label>
            <input
              type="number"
              value={kh}
              onChange={(e) => setKh(e.target.value)}
              min={0.5}
              max={20}
              step={0.5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">一般的な水草水槽の目安: KH 2〜5</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在のpH</label>
            <input
              type="number"
              value={currentPh}
              onChange={(e) => setCurrentPh(e.target.value)}
              min={5.0}
              max={9.0}
              step={0.1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標pH</label>
            <input
              type="number"
              value={targetPh}
              onChange={(e) => setTargetPh(e.target.value)}
              min={5.0}
              max={9.0}
              step={0.1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* CO2目標設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">目標CO₂濃度（mg/L）</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {TARGET_CO2_LEVELS.map((t) => (
            <button
              key={t.co2}
              onClick={() => setTargetCo2(String(t.co2))}
              className={`rounded-lg p-3 text-center border-2 transition-colors ${
                targetCo2 === String(t.co2)
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <div className="font-bold text-lg">{t.co2}</div>
              <div className="text-xs">{t.label}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 shrink-0">カスタム値:</label>
          <input
            type="number"
            value={targetCo2}
            onChange={(e) => setTargetCo2(e.target.value)}
            min={1}
            max={50}
            className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">mg/L</span>
        </div>
      </div>

      {/* 計算結果 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">CO₂計算結果</h2>
        {isValid ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-lg p-4 border ${currentStatus.bg}`}>
                <p className={`text-xs font-medium ${currentStatus.color}`}>現在のCO₂濃度（推定）</p>
                <p className={`text-2xl font-bold font-mono ${currentStatus.color} mt-1`}>
                  {currentCo2.toFixed(1)} mg/L
                </p>
                <p className={`text-xs mt-1 ${currentStatus.color}`}>状態: {currentStatus.label}</p>
              </div>
              <div className={`rounded-lg p-4 border ${targetStatus.bg}`}>
                <p className={`text-xs font-medium ${targetStatus.color}`}>目標pH時のCO₂濃度（推定）</p>
                <p className={`text-2xl font-bold font-mono ${targetStatus.color} mt-1`}>
                  {targetCalcCo2.toFixed(1)} mg/L
                </p>
                <p className={`text-xs mt-1 ${targetStatus.color}`}>状態: {targetStatus.label}</p>
              </div>
            </div>

            {co2Diff > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">添加量の目安（目標CO₂濃度: {targetCo2Val} mg/L）</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">水槽全体の必要CO₂量</span>
                    <span className="font-mono font-semibold text-blue-800">{dailyAdditionMg.toFixed(0)} mg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">点灯時間8h換算の毎時添加量</span>
                    <span className="font-mono font-semibold text-blue-800">{hourlyAdditionMg.toFixed(0)} mg/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">目安バブル数（1秒あたり）</span>
                    <span className="font-mono font-semibold text-blue-800">約 {bubblesPerSec.toFixed(2)} 泡/秒</span>
                  </div>
                </div>
              </div>
            )}

            {/* KH×pH→CO2テーブル */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">pH別CO₂濃度一覧（KH={khVal}）</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left">pH</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">CO₂濃度</th>
                      <th className="border border-gray-200 px-3 py-2 text-left">状態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phRange.map((p) => {
                      const co2 = calcCo2(khVal, p);
                      const st = getCo2Status(co2);
                      const isCurrent = Math.abs(p - currentPhVal) < 0.15;
                      const isTarget = Math.abs(p - targetPhVal) < 0.15;
                      return (
                        <tr key={p} className={isCurrent ? "bg-yellow-50 font-semibold" : isTarget ? "bg-green-50 font-semibold" : "hover:bg-gray-50"}>
                          <td className="border border-gray-200 px-3 py-1.5">
                            {p.toFixed(1)}
                            {isCurrent && <span className="ml-2 text-xs text-yellow-600">← 現在</span>}
                            {isTarget && <span className="ml-2 text-xs text-green-600">← 目標</span>}
                          </td>
                          <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{co2.toFixed(1)} mg/L</td>
                          <td className={`border border-gray-200 px-3 py-1.5 text-xs ${st.color}`}>{st.label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              ※ CO₂濃度はKH×pH法による理論値です。実際の値は温度・有機物量によって異なります。
              CO₂濃度が30mg/Lを超えると魚が酸欠になる危険があります。必ずエアレーションも確認してください。
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">KH値と水槽容量を入力してください</div>
        )}
      </div>
    </div>
  );
}
