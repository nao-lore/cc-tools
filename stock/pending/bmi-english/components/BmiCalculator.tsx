"use client";

import { useState, useMemo } from "react";

type Unit = "metric" | "imperial";

type BmiCategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  min: number;
  max: number;
};

const BMI_CATEGORIES: BmiCategory[] = [
  {
    label: "Underweight",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    badgeClass: "bg-blue-100 text-blue-700",
    min: 0,
    max: 18.5,
  },
  {
    label: "Normal weight",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    badgeClass: "bg-green-100 text-green-700",
    min: 18.5,
    max: 25,
  },
  {
    label: "Overweight",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    badgeClass: "bg-yellow-100 text-yellow-700",
    min: 25,
    max: 30,
  },
  {
    label: "Obese",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    badgeClass: "bg-red-100 text-red-700",
    min: 30,
    max: Infinity,
  },
];

function getCategory(bmi: number): BmiCategory {
  return (
    BMI_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ??
    BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
  );
}

// Clamp BMI to [10, 45] for scale bar position
function scalePosition(bmi: number): number {
  const min = 10;
  const max = 45;
  return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-12";

export default function BmiCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");

  const fmt = (n: number, digits = 1) => n.toFixed(digits);

  const result = useMemo(() => {
    let heightM: number;
    let weightKg: number;

    if (unit === "metric") {
      const h = parseFloat(heightCm);
      const w = parseFloat(weight);
      if (!h || !w || h <= 0 || w <= 0) return null;
      heightM = h / 100;
      weightKg = w;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const w = parseFloat(weight);
      const totalInches = ft * 12 + inch;
      if (!totalInches || !w || totalInches <= 0 || w <= 0) return null;
      heightM = totalInches * 0.0254;
      weightKg = w * 0.453592;
    }

    const bmi = weightKg / (heightM * heightM);
    if (bmi < 5 || bmi > 80) return null;

    const category = getCategory(bmi);

    // Healthy weight range (BMI 18.5–24.9) for the given height
    const minHealthyKg = 18.5 * heightM * heightM;
    const maxHealthyKg = 24.9 * heightM * heightM;
    const idealKg = 22 * heightM * heightM;

    const toDisplay = (kg: number) => {
      if (unit === "metric") return `${fmt(kg)} kg`;
      const lbs = kg / 0.453592;
      return `${fmt(lbs)} lbs`;
    };

    return {
      bmi,
      category,
      minHealthy: toDisplay(minHealthyKg),
      maxHealthy: toDisplay(maxHealthyKg),
      ideal: toDisplay(idealKg),
      scalePos: scalePosition(bmi),
    };
  }, [unit, heightCm, heightFt, heightIn, weight]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">Enter your measurements</h2>

        {/* Unit toggle */}
        <div className="mb-5">
          <label className="block text-xs text-muted mb-2">Unit system</label>
          <div className="flex gap-2">
            {(["metric", "imperial"] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => {
                  setUnit(u);
                  setWeight("");
                  setHeightCm("");
                  setHeightFt("");
                  setHeightIn("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  unit === u
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {u === "metric" ? "Metric (cm / kg)" : "Imperial (ft·in / lbs)"}
              </button>
            ))}
          </div>
        </div>

        {/* Height */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">Height</label>
          {unit === "metric" ? (
            <div className="relative max-w-[200px]">
              <input
                type="text"
                inputMode="decimal"
                placeholder="170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative w-[110px]">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="5"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">ft</span>
              </div>
              <div className="relative w-[110px]">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="7"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value.replace(/[^0-9.]/g, ""))}
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">in</span>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-xs text-muted mb-1">Weight</label>
          <div className="relative max-w-[200px]">
            <input
              type="text"
              inputMode="decimal"
              placeholder={unit === "metric" ? "70" : "154"}
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              {unit === "metric" ? "kg" : "lbs"}
            </span>
          </div>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className={`bg-card border-2 ${result.category.borderColor} rounded-xl p-5 shadow-sm`}>
          {/* Main BMI result */}
          <div className={`flex items-center justify-between mb-5 p-4 ${result.category.bgColor} rounded-lg`}>
            <div>
              <p className="text-xs text-muted mb-1">Your BMI</p>
              <p className={`text-4xl font-bold ${result.category.color}`}>
                {fmt(result.bmi)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted mb-1">WHO Category</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${result.category.badgeClass}`}>
                {result.category.label}
              </span>
            </div>
          </div>

          {/* BMI scale bar */}
          <div className="mb-5">
            <p className="text-xs text-muted mb-2">BMI Scale</p>
            <div className="relative h-4 rounded-full overflow-hidden flex">
              {/* Underweight: 10–18.5 out of 10–45 => 24.3% */}
              <div className="bg-blue-200" style={{ width: "24.3%" }} />
              {/* Normal: 18.5–25 => 18.6% */}
              <div className="bg-green-300" style={{ width: "18.6%" }} />
              {/* Overweight: 25–30 => 14.3% */}
              <div className="bg-yellow-300" style={{ width: "14.3%" }} />
              {/* Obese: 30–45 => 42.8% */}
              <div className="bg-red-300" style={{ width: "42.8%" }} />
            </div>
            {/* Marker */}
            <div className="relative h-4 -mt-4 pointer-events-none">
              <div
                className="absolute top-0 w-1 h-4 bg-gray-800 rounded-full shadow"
                style={{ left: `calc(${result.scalePos}% - 2px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>10</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>45+</span>
            </div>
          </div>

          {/* Weight info rows */}
          <div className="divide-y divide-border">
            {[
              { label: "Healthy weight range", value: `${result.minHealthy} – ${result.maxHealthy}` },
              { label: "Ideal weight (BMI 22)", value: result.ideal },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5">
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WHO category reference */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">WHO BMI Categories</h3>
        <div className="space-y-1">
          {BMI_CATEGORIES.map((cat) => {
            const isActive = result?.category.label === cat.label;
            return (
              <div
                key={cat.label}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? `${cat.bgColor} ${cat.borderColor} border font-bold`
                    : ""
                }`}
              >
                <span className={cat.color}>{cat.label}</span>
                <span className="text-muted text-xs">
                  {cat.max === Infinity ? `≥ ${cat.min}` : `${cat.min} – ${cat.max}`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-3">
          Source: World Health Organization. Applies to adults 18+.
        </p>
      </div>
    </div>
  );
}
