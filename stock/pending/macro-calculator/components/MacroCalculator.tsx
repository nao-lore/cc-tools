"use client";

import { useState, useMemo } from "react";

type Gender = "M" | "F";
type ActivityLevel = 1 | 2 | 3 | 4 | 5;
type Goal = "cut" | "maintain" | "bulk";

interface Inputs {
  age: string;
  gender: Gender;
  height: string;
  weight: string;
  activity: ActivityLevel;
  goal: Goal;
}

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  1: "Sedentary (desk job, little exercise)",
  2: "Lightly active (1–3 days/week)",
  3: "Moderately active (3–5 days/week)",
  4: "Very active (6–7 days/week)",
  5: "Extra active (physical job + training)",
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  1: 1.2,
  2: 1.375,
  3: 1.55,
  4: 1.725,
  5: 1.9,
};

const GOAL_LABELS: Record<Goal, string> = {
  cut: "Cut (lose fat, −500 kcal)",
  maintain: "Maintain (hold current weight)",
  bulk: "Bulk (gain muscle, +500 kcal)",
};

// Macro split: [protein%, carb%, fat%]
const MACRO_SPLITS: Record<Goal, [number, number, number]> = {
  cut: [0.4, 0.3, 0.3],
  maintain: [0.3, 0.4, 0.3],
  bulk: [0.3, 0.45, 0.25],
};

const GOAL_COLORS: Record<Goal, { bg: string; accent: string; badge: string }> = {
  cut: { bg: "bg-blue-500", accent: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  maintain: { bg: "bg-green-500", accent: "text-green-600", badge: "bg-green-100 text-green-700" },
  bulk: { bg: "bg-orange-500", accent: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
};

function calcMifflin(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  // Mifflin-St Jeor BMR
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "M" ? base + 5 : base - 161;
}

export default function MacroCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    age: "",
    gender: "M",
    height: "",
    weight: "",
    activity: 3,
    goal: "maintain",
  });

  const results = useMemo(() => {
    const age = parseInt(inputs.age, 10);
    const height = parseFloat(inputs.height);
    const weight = parseFloat(inputs.weight);

    if (!age || !height || !weight || age < 10 || age > 120 || height < 50 || weight < 20) {
      return null;
    }

    const bmr = calcMifflin(inputs.gender, weight, height, age);
    const tdee = bmr * ACTIVITY_MULTIPLIERS[inputs.activity];

    const adjustments: Record<Goal, number> = { cut: -500, maintain: 0, bulk: 500 };
    const targetCals = Math.round(tdee + adjustments[inputs.goal]);

    const [pPct, cPct, fPct] = MACRO_SPLITS[inputs.goal];
    const proteinG = Math.round((targetCals * pPct) / 4);
    const carbsG = Math.round((targetCals * cPct) / 4);
    const fatG = Math.round((targetCals * fPct) / 9);

    return { tdee: Math.round(tdee), targetCals, proteinG, carbsG, fatG, pPct, cPct, fPct };
  }, [inputs]);

  const colors = GOAL_COLORS[inputs.goal];

  function setField<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-6">
      {/* Inputs card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              min={10}
              max={120}
              placeholder="e.g. 28"
              value={inputs.age}
              onChange={(e) => setField("age", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div className="flex gap-2">
              {(["M", "F"] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setField("gender", g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    inputs.gender === g
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {g === "M" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Height + Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number"
              min={50}
              max={250}
              placeholder="e.g. 175"
              value={inputs.height}
              onChange={(e) => setField("height", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              min={20}
              max={300}
              placeholder="e.g. 70"
              value={inputs.weight}
              onChange={(e) => setField("weight", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
          <div className="space-y-2">
            {([1, 2, 3, 4, 5] as ActivityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setField("activity", level)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  inputs.activity === level
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="font-medium mr-1">{level}.</span>
                {ACTIVITY_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
          <div className="grid grid-cols-3 gap-2">
            {(["cut", "maintain", "bulk"] as Goal[]).map((g) => (
              <button
                key={g}
                onClick={() => setField("goal", g)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border capitalize transition-colors ${
                  inputs.goal === g
                    ? `${GOAL_COLORS[g].bg} text-white border-transparent`
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                {g === "cut" ? "Cut" : g === "maintain" ? "Maintain" : "Bulk"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          {/* Calorie summary */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${colors.accent}`}>
              {results.targetCals.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">kcal / day</div>
            <div className="text-xs text-gray-400 mt-1">
              TDEE: {results.tdee.toLocaleString()} kcal &nbsp;·&nbsp;{" "}
              <span className={`font-medium ${colors.accent}`}>{GOAL_LABELS[inputs.goal]}</span>
            </div>
          </div>

          {/* Macro cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Protein", g: results.proteinG, pct: Math.round(results.pPct * 100), color: "bg-red-500", light: "bg-red-50 text-red-700" },
              { label: "Carbs", g: results.carbsG, pct: Math.round(results.cPct * 100), color: "bg-yellow-400", light: "bg-yellow-50 text-yellow-700" },
              { label: "Fat", g: results.fatG, pct: Math.round(results.fPct * 100), color: "bg-purple-500", light: "bg-purple-50 text-purple-700" },
            ].map(({ label, g, pct, light }) => (
              <div key={label} className={`${light} rounded-xl p-3 text-center`}>
                <div className="text-xl font-bold">{g}g</div>
                <div className="text-xs font-medium opacity-80 mt-0.5">{label}</div>
                <div className="text-xs opacity-60">{pct}%</div>
              </div>
            ))}
          </div>

          {/* PFC Ratio bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Macro split</span>
              <span>
                P {Math.round(results.pPct * 100)}% / C {Math.round(results.cPct * 100)}% / F{" "}
                {Math.round(results.fPct * 100)}%
              </span>
            </div>
            <div className="flex h-5 rounded-full overflow-hidden">
              <div
                className="bg-red-400 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${results.pPct * 100}%` }}
                title={`Protein ${Math.round(results.pPct * 100)}%`}
              >
                P
              </div>
              <div
                className="bg-yellow-400 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${results.cPct * 100}%` }}
                title={`Carbs ${Math.round(results.cPct * 100)}%`}
              >
                C
              </div>
              <div
                className="bg-purple-400 flex items-center justify-center text-white text-xs font-bold"
                style={{ width: `${results.fPct * 100}%` }}
                title={`Fat ${Math.round(results.fPct * 100)}%`}
              >
                F
              </div>
            </div>
          </div>

          {/* Per-meal breakdown */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Per meal (3 meals/day)</p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs text-gray-600">
              <div>
                <div className="font-semibold text-gray-800">{Math.round(results.targetCals / 3)}</div>
                <div>kcal</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">{Math.round(results.proteinG / 3)}g</div>
                <div>protein</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">{Math.round(results.carbsG / 3)}g</div>
                <div>carbs</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">{Math.round(results.fatG / 3)}g</div>
                <div>fat</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
          Enter your details above to see your macro targets
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Macronutrient Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate daily protein, carb, and fat targets for fitness goals. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Macronutrient Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate daily protein, carb, and fat targets for fitness goals. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
