"use client";
import { useState } from "react";

interface FarmSpot {
  id: number;
  name: string;
  expPerRun: number;
  runTimeMin: number;
  itemDropRate: number;
  itemValue: number;
  staminaCost: number;
}

const DEFAULT_SPOTS: FarmSpot[] = [
  { id: 1, name: "スライムの洞窟", expPerRun: 1200, runTimeMin: 3, itemDropRate: 25, itemValue: 500, staminaCost: 10 },
  { id: 2, name: "森の迷宮B3F", expPerRun: 3500, runTimeMin: 8, itemDropRate: 40, itemValue: 2000, staminaCost: 20 },
  { id: 3, name: "竜の巣穴", expPerRun: 9000, runTimeMin: 18, itemDropRate: 15, itemValue: 8000, staminaCost: 40 },
];

interface CalcResult {
  expPerHour: number;
  runsPerHour: number;
  expPerStamina: number;
  itemExpectedPerHour: number;
  goldPerHour: number;
  efficiencyScore: number;
}

function calcSpot(spot: FarmSpot): CalcResult {
  const runsPerHour = 60 / spot.runTimeMin;
  const expPerHour = spot.expPerRun * runsPerHour;
  const expPerStamina = spot.staminaCost > 0 ? spot.expPerRun / spot.staminaCost : 0;
  const itemExpectedPerHour = (spot.itemDropRate / 100) * runsPerHour;
  const goldPerHour = itemExpectedPerHour * spot.itemValue;
  const efficiencyScore = (expPerHour / 10000) + (goldPerHour / 100000);
  return { expPerHour, runsPerHour, expPerStamina, itemExpectedPerHour, goldPerHour, efficiencyScore };
}

export default function ExpFarmCalc() {
  const [spots, setSpots] = useState<FarmSpot[]>(DEFAULT_SPOTS);
  const [sessionHours, setSessionHours] = useState(2);
  const [targetLevel, setTargetLevel] = useState(50);
  const [currentExp, setCurrentExp] = useState(12000);
  const [targetExp, setTargetExp] = useState(100000);

  const results = spots.map((s) => ({ spot: s, ...calcSpot(s) }));
  const maxExp = Math.max(...results.map((r) => r.expPerHour), 1);
  const maxGold = Math.max(...results.map((r) => r.goldPerHour), 1);

  const addSpot = () => {
    setSpots([
      ...spots,
      {
        id: Date.now(),
        name: `新スポット ${spots.length + 1}`,
        expPerRun: 2000,
        runTimeMin: 5,
        itemDropRate: 20,
        itemValue: 1000,
        staminaCost: 15,
      },
    ]);
  };

  const removeSpot = (id: number) => {
    setSpots(spots.filter((s) => s.id !== id));
  };

  const updateSpot = (id: number, field: keyof FarmSpot, value: string | number) => {
    setSpots(spots.map((s) => (s.id === id ? { ...s, [field]: Number(value) } : s)));
  };

  const updateSpotName = (id: number, name: string) => {
    setSpots(spots.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const expNeeded = Math.max(0, targetExp - currentExp);
  const bestByExp = results.length > 0 ? results.reduce((a, b) => (a.expPerHour > b.expPerHour ? a : b)) : null;
  const hoursNeeded = bestByExp ? expNeeded / bestByExp.expPerHour : 0;

  return (
    <div className="space-y-6">
      {/* Spot Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">周回スポットの設定</h2>
          <button onClick={addSpot} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            + スポット追加
          </button>
        </div>
        <div className="space-y-4">
          {spots.map((spot) => (
            <div key={spot.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={spot.name}
                  onChange={(e) => updateSpotName(spot.id, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {spots.length > 1 && (
                  <button onClick={() => removeSpot(spot.id)} className="text-red-400 hover:text-red-600 text-sm">
                    削除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "EXP/周", field: "expPerRun" as const, suffix: "exp" },
                  { label: "周回時間", field: "runTimeMin" as const, suffix: "分" },
                  { label: "ドロップ率", field: "itemDropRate" as const, suffix: "%" },
                  { label: "アイテム価値", field: "itemValue" as const, suffix: "G" },
                  { label: "スタミナ消費", field: "staminaCost" as const, suffix: "pt" },
                ].map(({ label, field, suffix }) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={spot[field]}
                        onChange={(e) => updateSpot(spot.id, field, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min={0}
                      />
                      <span className="text-xs text-gray-400 whitespace-nowrap">{suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">効率比較</h2>
        <div className="space-y-4">
          {results.map((r, idx) => (
            <div key={r.spot.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{r.spot.name}</span>
                <span className="text-indigo-600 font-bold">{Math.round(r.expPerHour).toLocaleString()} EXP/h</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${(r.expPerHour / maxExp) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                <span>周回: {r.runsPerHour.toFixed(1)}回/h</span>
                <span>EXP/スタミナ: {r.expPerStamina.toFixed(0)}</span>
                <span>アイテム期待値: {r.itemExpectedPerHour.toFixed(2)}/h</span>
                <span>ゴールド: {Math.round(r.goldPerHour).toLocaleString()}G/h</span>
              </div>
              {/* Gold bar */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${(r.goldPerHour / maxGold) * 100}%` }}
                />
              </div>
              <p className="text-xs text-yellow-600">{Math.round(r.goldPerHour).toLocaleString()}G/h</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level-up planner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">レベルアップ計画</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">現在のEXP</label>
            <input
              type="number"
              value={currentExp}
              onChange={(e) => setCurrentExp(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">目標EXP（次レベル）</label>
            <input
              type="number"
              value={targetExp}
              onChange={(e) => setTargetExp(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">セッション時間（h）</label>
            <input
              type="number"
              value={sessionHours}
              onChange={(e) => setSessionHours(Number(e.target.value))}
              min={0.5}
              step={0.5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">目標レベル</label>
            <input
              type="number"
              value={targetLevel}
              onChange={(e) => setTargetLevel(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        {bestByExp && (
          <div className="space-y-3">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-indigo-800 mb-2">
                最高効率スポット：{bestByExp.spot.name}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">必要EXP</p>
                  <p className="font-bold text-gray-900">{expNeeded.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">必要時間</p>
                  <p className="font-bold text-gray-900">{hoursNeeded.toFixed(1)}時間</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{sessionHours}hで獲得できるEXP</p>
                  <p className="font-bold text-gray-900">
                    {Math.round(bestByExp.expPerHour * sessionHours).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
