"use client";

import { useState, useMemo } from "react";

type BmiCategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  min: number;
  max: number;
};

const BMI_CATEGORIES: BmiCategory[] = [
  { label: "低体重（やせ）", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-300", min: 0, max: 18.5 },
  { label: "普通体重", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-300", min: 18.5, max: 25 },
  { label: "肥満（1度）", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-300", min: 25, max: 30 },
  { label: "肥満（2度）", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-300", min: 30, max: 35 },
  { label: "肥満（3度）", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-300", min: 35, max: 40 },
  { label: "肥満（4度）", color: "text-red-700", bgColor: "bg-red-100", borderColor: "border-red-400", min: 40, max: Infinity },
];

function getCategory(bmi: number): BmiCategory {
  return BMI_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

function BmiGauge({ bmi }: { bmi: number }) {
  // Scale: 10 to 40 displayed, clamp pointer
  const MIN_SCALE = 10;
  const MAX_SCALE = 40;
  const pct = Math.min(100, Math.max(0, ((bmi - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100));

  const segments = [
    { label: "やせ", width: ((18.5 - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100, color: "bg-blue-400" },
    { label: "普通", width: ((25 - 18.5) / (MAX_SCALE - MIN_SCALE)) * 100, color: "bg-green-400" },
    { label: "肥満1", width: ((30 - 25) / (MAX_SCALE - MIN_SCALE)) * 100, color: "bg-yellow-400" },
    { label: "肥満2", width: ((35 - 30) / (MAX_SCALE - MIN_SCALE)) * 100, color: "bg-orange-400" },
    { label: "肥満3+", width: ((MAX_SCALE - 35) / (MAX_SCALE - MIN_SCALE)) * 100, color: "bg-red-500" },
  ];

  return (
    <div className="mt-4">
      <div className="relative h-6 rounded-full overflow-hidden flex">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`${seg.color} h-full`}
            style={{ width: `${seg.width}%` }}
          />
        ))}
      </div>
      {/* Pointer */}
      <div className="relative h-3 mt-1">
        <div
          className="absolute top-0 w-0.5 h-3 bg-gray-800 rounded"
          style={{ left: `calc(${pct}% - 1px)` }}
        />
      </div>
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>10</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>40</span>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {[
          { label: "やせ", color: "bg-blue-400" },
          { label: "普通", color: "bg-green-400" },
          { label: "肥満1", color: "bg-yellow-400" },
          { label: "肥満2", color: "bg-orange-400" },
          { label: "肥満3+", color: "bg-red-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-xs text-muted">
            <span className={`w-3 h-3 rounded-sm ${item.color} inline-block`} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BmiCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;

    const hm = h / 100;
    const bmi = w / (hm * hm);
    const standardWeight = 22 * hm * hm; // BMI 22
    const minWeight = 18.5 * hm * hm;
    const maxWeight = 25 * hm * hm;
    const category = getCategory(bmi);

    return { bmi, standardWeight, minWeight, maxWeight, category };
  }, [height, weight]);

  const fmt = (n: number) => n.toFixed(1);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">身体情報を入力</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1">身長（cm）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1">体重（kg）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="60"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className={`bg-card border-2 ${result.category.borderColor} rounded-xl p-5 shadow-sm`}>
          {/* BMI value + category */}
          <div className={`flex items-center justify-between mb-4 p-4 ${result.category.bgColor} rounded-lg`}>
            <div>
              <p className="text-xs text-muted mb-1">あなたのBMI</p>
              <p className={`text-4xl font-bold ${result.category.color}`}>{fmt(result.bmi)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted mb-1">肥満度判定</p>
              <p className={`text-xl font-bold ${result.category.color}`}>{result.category.label}</p>
            </div>
          </div>

          {/* BMI gauge */}
          <BmiGauge bmi={result.bmi} />

          {/* Details */}
          <div className="mt-4 divide-y divide-border">
            {[
              { label: "標準体重（BMI 22）", value: `${fmt(result.standardWeight)} kg` },
              { label: "理想体重（BMI 22）", value: `${fmt(result.standardWeight)} kg` },
              { label: "適正体重範囲", value: `${fmt(result.minWeight)} 〜 ${fmt(result.maxWeight)} kg` },
              { label: "現体重との差（標準比）", value: (() => {
                const diff = parseFloat(weight) - result.standardWeight;
                return `${diff >= 0 ? "+" : ""}${fmt(diff)} kg`;
              })() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5">
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">日本肥満学会の判定基準</h3>
        <div className="space-y-1">
          {BMI_CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm ${
                result && result.category.label === cat.label
                  ? `${cat.bgColor} ${cat.borderColor} border font-bold`
                  : ""
              }`}
            >
              <span className={cat.color}>{cat.label}</span>
              <span className="text-muted text-xs">
                {cat.max === Infinity ? `${cat.min} 以上` : `${cat.min} 〜 ${cat.max} 未満`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
