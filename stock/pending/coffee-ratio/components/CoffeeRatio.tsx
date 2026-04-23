"use client";

import { useState, useMemo } from "react";

// --- 抽出方式データ ---
type Method = {
  id: string;
  name: string;
  ratio: number; // 豆:水 = 1:ratio
  mlPerCup: number;
  brewTime: string;
  waterTemp: string;
  grind: string;
  notes: string;
};

const METHODS: Method[] = [
  {
    id: "drip",
    name: "ドリップ",
    ratio: 15,
    mlPerCup: 120,
    brewTime: "3〜4分",
    waterTemp: "90〜96℃",
    grind: "中挽き",
    notes: "ペーパーフィルターで余分な油分を除去。クリアな味わい。",
  },
  {
    id: "espresso",
    name: "エスプレッソ",
    ratio: 2,
    mlPerCup: 30,
    brewTime: "25〜30秒",
    waterTemp: "90〜95℃",
    grind: "極細挽き",
    notes: "9気圧で高速抽出。濃厚でクレマが特徴。",
  },
  {
    id: "french-press",
    name: "フレンチプレス",
    ratio: 12,
    mlPerCup: 120,
    brewTime: "4分",
    waterTemp: "93〜96℃",
    grind: "粗挽き",
    notes: "金属フィルターで油分も抽出。コクのある味わい。",
  },
  {
    id: "cold-brew",
    name: "水出し",
    ratio: 8,
    mlPerCup: 120,
    brewTime: "8〜12時間（冷蔵）",
    waterTemp: "常温〜4℃",
    grind: "中粗挽き",
    notes: "低温でゆっくり抽出。酸味が少なくまろやか。",
  },
];

// 強度オフセット (ratio への加算)
const STRENGTH_OFFSETS: Record<string, number> = {
  light: 2,    // 薄め: 水多め
  standard: 0, // 標準
  strong: -2,  // 濃いめ: 水少なめ
};

const STRENGTH_LABELS = [
  { key: "light", label: "薄め" },
  { key: "standard", label: "標準" },
  { key: "strong", label: "濃いめ" },
] as const;

type Strength = "light" | "standard" | "strong";
type InputMode = "cups" | "beans";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export default function CoffeeRatio() {
  const [methodId, setMethodId] = useState<string>("drip");
  const [strength, setStrength] = useState<Strength>("standard");
  const [inputMode, setInputMode] = useState<InputMode>("cups");

  // カップ数入力
  const [cups, setCups] = useState<number>(2);
  // 豆量入力（逆算モード）
  const [beansInput, setBeansInput] = useState<number>(20);

  const method = METHODS.find((m) => m.id === methodId) ?? METHODS[0];
  const effectiveRatio = Math.max(1, method.ratio + STRENGTH_OFFSETS[strength]);

  const result = useMemo(() => {
    if (inputMode === "cups") {
      const totalMl = cups * method.mlPerCup;
      const beans = round1(totalMl / effectiveRatio);
      const water = round1(beans * effectiveRatio);
      return { beans, water, totalMl };
    } else {
      const beans = beansInput;
      const water = round1(beans * effectiveRatio);
      const totalMl = water;
      const estimatedCups = round1(totalMl / method.mlPerCup);
      return { beans, water, totalMl, estimatedCups };
    }
  }, [inputMode, cups, beansInput, method, effectiveRatio]);

  return (
    <div className="space-y-6">
      {/* ===== 抽出方式タブ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">抽出方式を選択</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodId(m.id)}
              className={`flex flex-col items-center py-3 px-2 rounded-xl border text-center transition-all ${
                methodId === m.id
                  ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300 text-amber-800"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              <span className="font-medium text-sm">{m.name}</span>
              <span className="text-xs mt-1 text-gray-500">1:{m.ratio}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== 強度スライダー ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">濃さ</h2>
        <div className="flex gap-2">
          {STRENGTH_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStrength(key)}
              className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                strength === key
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          実効比率: 1:{effectiveRatio}（豆1gに対して水{effectiveRatio}ml）
        </p>
      </div>

      {/* ===== 入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setInputMode("cups")}
            className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
              inputMode === "cups"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            杯数から計算
          </button>
          <button
            onClick={() => setInputMode("beans")}
            className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
              inputMode === "beans"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            豆量から逆算
          </button>
        </div>

        {inputMode === "cups" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              杯数（1杯 = {method.mlPerCup}ml）
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={cups}
                onChange={(e) => setCups(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={cups}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) setCups(Math.min(Math.max(v, 1), 10));
                  }}
                  className="w-16 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-500">杯</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              豆の量
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={200}
                step={1}
                value={beansInput}
                onChange={(e) => setBeansInput(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={5}
                  max={200}
                  step={1}
                  value={beansInput}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) setBeansInput(Math.min(Math.max(v, 5), 200));
                  }}
                  className="w-20 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-500">g</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">豆の量</div>
            <div className="text-3xl font-bold text-amber-700">{result.beans}</div>
            <div className="text-sm text-gray-500 mt-0.5">g</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">
              {methodId === "cold-brew" ? "水の量" : "湯の量"}
            </div>
            <div className="text-3xl font-bold text-blue-600">{result.water}</div>
            <div className="text-sm text-gray-500 mt-0.5">ml</div>
          </div>
        </div>

        {inputMode === "beans" && result.estimatedCups !== undefined && (
          <p className="text-sm text-gray-600 text-center mb-3">
            約 <span className="font-semibold">{result.estimatedCups}</span> 杯分（1杯 {method.mlPerCup}ml 換算）
          </p>
        )}

        <div className="bg-white bg-opacity-70 rounded-xl p-4 text-sm text-gray-600 space-y-1.5">
          <div className="flex justify-between">
            <span>抽出方式</span>
            <span className="font-medium text-gray-800">{method.name}</span>
          </div>
          <div className="flex justify-between">
            <span>比率</span>
            <span className="font-medium text-gray-800">1:{effectiveRatio}</span>
          </div>
          <div className="flex justify-between">
            <span>湯温</span>
            <span className="font-medium text-gray-800">{method.waterTemp}</span>
          </div>
          <div className="flex justify-between">
            <span>抽出時間</span>
            <span className="font-medium text-gray-800">{method.brewTime}</span>
          </div>
          <div className="flex justify-between">
            <span>挽き目</span>
            <span className="font-medium text-gray-800">{method.grind}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">{method.notes}</p>
      </div>

      {/* ===== 広告プレースホルダー ===== */}
      <div className="w-full h-24 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
        <span className="text-xs text-gray-400">広告</span>
      </div>

      {/* ===== 抽出方式別参考表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">抽出方式別 参考レシピ</h2>
        <p className="text-xs text-gray-500 mb-4">標準比率・標準濃さでの目安値</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">方式</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">比率</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">豆(1杯)</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">湯量(1杯)</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">抽出時間</th>
              </tr>
            </thead>
            <tbody>
              {METHODS.map((m) => {
                const beansPerCup = round1(m.mlPerCup / m.ratio);
                const isActive = m.id === methodId;
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isActive ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setMethodId(m.id)}
                  >
                    <td className="py-2 pr-3">
                      <span className={`font-medium ${isActive ? "text-amber-700" : "text-gray-700"}`}>
                        {m.name}
                        {isActive && <span className="ml-1.5 text-xs text-gray-400">← 選択中</span>}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-gray-600">1:{m.ratio}</td>
                    <td className="py-2 pr-3 text-right text-gray-600">{beansPerCup}g</td>
                    <td className="py-2 pr-3 text-right text-gray-600">{m.mlPerCup}ml</td>
                    <td className="py-2 text-right text-gray-600">{m.brewTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">行をクリックすると方式が切り替わります</p>
      </div>

      {/* ===== フッター ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        比率は目安です。豆の種類・焙煎度・好みに合わせて調整してください。
      </p>
    </div>
  );
}
