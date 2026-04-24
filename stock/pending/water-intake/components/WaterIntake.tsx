"use client";

import { useState, useMemo } from "react";

type WeightUnit = "kg" | "lbs";
type ActivityLevel = "sedentary" | "lightly" | "moderate" | "active" | "very";
type Climate = "temperate" | "hot" | "cold";

const ACTIVITY_LABELS: { key: ActivityLevel; label: string; desc: string }[] = [
  { key: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { key: "lightly", label: "Lightly Active", desc: "1–3 days/week" },
  { key: "moderate", label: "Moderate", desc: "3–5 days/week" },
  { key: "active", label: "Active", desc: "6–7 days/week" },
  { key: "very", label: "Very Active", desc: "Hard exercise daily" },
];

// ml per kg base multiplier
const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 30,
  lightly: 33,
  moderate: 35,
  active: 38,
  very: 40,
};

const CLIMATE_LABELS: { key: Climate; label: string; emoji: string }[] = [
  { key: "temperate", label: "Temperate", emoji: "🌤" },
  { key: "hot", label: "Hot / Humid", emoji: "☀️" },
  { key: "cold", label: "Cold / Dry", emoji: "❄️" },
];

const CLIMATE_EXTRA_ML: Record<Climate, number> = {
  temperate: 0,
  hot: 500,
  cold: -100,
};

// Exercise adds ~12ml per minute of moderate exercise
const EXERCISE_ML_PER_MIN = 12;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function mlToLiters(ml: number) {
  return round1(ml / 1000);
}

function mlToCups(ml: number) {
  // 1 US cup = 236.588 ml
  return round1(ml / 236.588);
}

interface Result {
  liters: number;
  cups: number;
  ml: number;
  fillPct: number;
}

function compute(
  weightKg: number,
  activity: ActivityLevel,
  climate: Climate,
  exerciseMin: number
): Result {
  const base = weightKg * ACTIVITY_MULTIPLIER[activity];
  const climateAdj = CLIMATE_EXTRA_ML[climate];
  const exerciseAdj = exerciseMin > 0 ? exerciseMin * EXERCISE_ML_PER_MIN : 0;
  const totalMl = Math.max(1000, base + climateAdj + exerciseAdj);
  // Fill percentage relative to a reference of 4000 ml (visual max)
  const fillPct = Math.min(100, Math.round((totalMl / 4000) * 100));
  return {
    liters: mlToLiters(totalMl),
    cups: mlToCups(totalMl),
    ml: Math.round(totalMl),
    fillPct,
  };
}

function WaterBottle({ fillPct }: { fillPct: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Bottle SVG shape via CSS */}
      <div className="relative w-20 h-40 flex flex-col items-center">
        {/* Bottle neck */}
        <div className="w-8 h-5 bg-blue-100 border-2 border-blue-300 rounded-t-lg border-b-0 relative z-10" />
        {/* Bottle body */}
        <div className="relative w-full flex-1 border-2 border-blue-300 rounded-b-2xl overflow-hidden bg-blue-50">
          {/* Water fill */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-700"
            style={{ height: `${fillPct}%` }}
          >
            {/* Wave effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-400 opacity-60 rounded-full -translate-y-1" />
          </div>
          {/* Percentage label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-700 font-bold text-sm drop-shadow-sm">{fillPct}%</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">Daily target</p>
    </div>
  );
}

function ResultCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div
      className={`rounded-xl border px-5 py-4 flex flex-col gap-1 ${
        highlight ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-bold ${highlight ? "text-blue-700" : "text-gray-800"}`}>
          {value}
        </span>
        <button
          onClick={handleCopy}
          className="ml-auto px-2 py-0.5 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

export default function WaterIntake() {
  const [weightStr, setWeightStr] = useState("70");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [climate, setClimate] = useState<Climate>("temperate");
  const [exerciseStr, setExerciseStr] = useState("");

  const weightRaw = parseFloat(weightStr);
  const weightKg = isNaN(weightRaw) || weightRaw <= 0
    ? 0
    : unit === "lbs"
    ? weightRaw * 0.453592
    : weightRaw;
  const exerciseMin = exerciseStr === "" ? 0 : Math.max(0, parseFloat(exerciseStr) || 0);
  const valid = weightKg > 0;

  const result = useMemo<Result | null>(() => {
    if (!valid) return null;
    return compute(weightKg, activity, climate, exerciseMin);
  }, [valid, weightKg, activity, climate, exerciseMin]);

  const formulaStr = valid && result
    ? `Base: ${Math.round(weightKg)} kg × ${ACTIVITY_MULTIPLIER[activity]} ml = ${Math.round(weightKg * ACTIVITY_MULTIPLIER[activity])} ml` +
      (CLIMATE_EXTRA_ML[climate] !== 0 ? ` + Climate adj: ${CLIMATE_EXTRA_ML[climate] > 0 ? "+" : ""}${CLIMATE_EXTRA_ML[climate]} ml` : "") +
      (exerciseMin > 0 ? ` + Exercise: ${exerciseMin} min × ${EXERCISE_ML_PER_MIN} ml = ${exerciseMin * EXERCISE_ML_PER_MIN} ml` : "") +
      ` = ${result.ml} ml/day`
    : "";

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Your Details</h2>

        {/* Weight + unit toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body Weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={weightStr}
              onChange={(e) => setWeightStr(e.target.value)}
              placeholder={unit === "kg" ? "e.g. 70" : "e.g. 154"}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {(["kg", "lbs"] as WeightUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    unit === u
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {unit === "lbs" && weightKg > 0 && (
            <p className="text-xs text-gray-400 mt-1">≈ {round1(weightKg)} kg</p>
          )}
        </div>

        {/* Activity level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTIVITY_LABELS.map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setActivity(key)}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  activity === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-700"
                }`}
              >
                <span className="font-medium block">{label}</span>
                <span className={`text-xs ${activity === key ? "text-blue-100" : "text-gray-400"}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Climate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Climate</label>
          <div className="flex gap-2 flex-wrap">
            {CLIMATE_LABELS.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setClimate(key)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  climate === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Exercise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exercise Duration{" "}
            <span className="text-gray-400 font-normal">(min/day, optional)</span>
          </label>
          <input
            type="number"
            min="0"
            max="600"
            value={exerciseStr}
            onChange={(e) => setExerciseStr(e.target.value)}
            placeholder="e.g. 45"
            className="w-full sm:w-48 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results */}
      {valid && result ? (
        <>
          {/* Summary cards + bottle */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
            <div className="flex justify-center sm:py-4 sm:px-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <WaterBottle fillPct={result.fillPct} />
            </div>
            <div className="flex-1 grid grid-cols-1 gap-3">
              <ResultCard
                label="Liters per Day"
                value={`${result.liters} L`}
                highlight
              />
              <ResultCard
                label="Cups per Day"
                value={`${result.cups} cups`}
                sub="1 cup = 236.6 ml (US)"
              />
              <ResultCard
                label="Milliliters per Day"
                value={`${result.ml.toLocaleString()} ml`}
              />
            </div>
          </div>

          {/* Formula */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Formula Used
            </p>
            <p className="text-sm text-gray-700 font-mono break-all">{formulaStr}</p>
          </div>

          {/* Hourly breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Hourly Drinking Guide
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {[
                { label: "Every hour (16h awake)", ml: Math.round(result.ml / 16) },
                { label: "Every 2 hours", ml: Math.round(result.ml / 8) },
                { label: "With each meal (3×)", ml: Math.round(result.ml / 3) },
                { label: "Morning glass", ml: 300 },
              ].map(({ label, ml }) => (
                <div key={label} className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-3">
                  <p className="text-blue-700 font-bold text-lg">{ml} ml</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Hydration Tips
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                "Start your day with a large glass of water (300–500 ml) before coffee or tea.",
                "Drink a glass of water before each meal — it also helps with portion control.",
                "Check your urine color: pale yellow means well-hydrated; dark yellow means drink more.",
                "Increase intake during illness, hot weather, or when sweating heavily.",
                "Coffee and tea count toward hydration, but alcohol and sugary drinks do not.",
                "Eating water-rich foods (cucumber, watermelon, lettuce) contributes to daily intake.",
              ].map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          Enter your body weight above to see your recommended daily intake
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Daily Water Intake Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate recommended daily water intake based on body weight and activity. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Daily Water Intake Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate recommended daily water intake based on body weight and activity. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Daily Water Intake Calculator",
  "description": "Calculate recommended daily water intake based on body weight and activity",
  "url": "https://tools.loresync.dev/water-intake",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
