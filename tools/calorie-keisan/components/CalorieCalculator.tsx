"use client";

import { useState, useMemo } from "react";

type ActivityLevel = {
  label: string;
  description: string;
  multiplier: number;
};

const ACTIVITY_LEVELS: ActivityLevel[] = [
  { label: "ほとんど運動しない", description: "デスクワーク中心・座りがち", multiplier: 1.2 },
  { label: "軽い運動", description: "週1〜3回の軽い運動", multiplier: 1.375 },
  { label: "中程度の運動", description: "週3〜5回の運動", multiplier: 1.55 },
  { label: "激しい運動", description: "週6〜7回の激しい運動", multiplier: 1.725 },
  { label: "非常に激しい運動", description: "アスリート・肉体労働", multiplier: 1.9 },
];

type Result = {
  bmr: number;
  tdee: number;
  lossCalorie: number;
  gainCalorie: number;
  protein: number;
  fat: number;
  carbs: number;
};

function calculateBMR(gender: string, age: number, height: number, weight: number): number {
  if (gender === "male") {
    // Harris-Benedict 改訂版（男性）
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    // Harris-Benedict 改訂版（女性）
    return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  }
}

function ResultRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
      <div>
        <span className="text-sm text-foreground">{label}</span>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
      <span className="text-base font-bold font-mono">{value}</span>
    </div>
  );
}

export default function CalorieCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityIndex, setActivityIndex] = useState(1);

  const result = useMemo((): Result | null => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!a || !h || !w || a <= 0 || h <= 0 || w <= 0 || a > 120 || h > 300 || w > 500) return null;

    const bmr = calculateBMR(gender, a, h, w);
    const multiplier = ACTIVITY_LEVELS[activityIndex].multiplier;
    const tdee = bmr * multiplier;
    const lossCalorie = tdee - 500;
    const gainCalorie = tdee + 500;

    // PFC balance: protein 30%, fat 25%, carbs 45% of TDEE
    const protein = (tdee * 0.30) / 4;
    const fat = (tdee * 0.25) / 9;
    const carbs = (tdee * 0.45) / 4;

    return { bmr, tdee, lossCalorie, gainCalorie, protein, fat, carbs };
  }, [gender, age, height, weight, activityIndex]);

  const fmt = (n: number) => Math.round(n).toLocaleString();
  const fmtG = (n: number) => `${Math.round(n)}g`;

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10";

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">身体情報を入力</h2>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">性別</label>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                  gender === g
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-accent border-border text-muted hover:border-primary/50"
                }`}
              >
                {g === "male" ? "男性" : "女性"}
              </button>
            ))}
          </div>
        </div>

        {/* Age / Height / Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-muted mb-1">年齢</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="30"
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">歳</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">身長（cm）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">体重（kg）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="65"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
            </div>
          </div>
        </div>

        {/* Activity level */}
        <div>
          <label className="block text-xs text-muted mb-2">活動レベル</label>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((level, i) => (
              <button
                key={i}
                onClick={() => setActivityIndex(i)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  activityIndex === i
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-accent border-border text-muted hover:border-primary/40"
                }`}
              >
                <span className="font-medium">{level.label}</span>
                <span className="ml-2 text-xs opacity-70">— {level.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <>
          {/* Calorie results */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-1">カロリー計算結果</h3>
            <p className="text-xs text-muted mb-4">Harris-Benedict 改訂式による算出値</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 mb-1">基礎代謝量（BMR）</p>
                <p className="text-3xl font-bold text-blue-700 font-mono">{fmt(result.bmr)}</p>
                <p className="text-xs text-blue-500 mt-1">kcal/日</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-xs text-green-600 mb-1">1日の消費カロリー（TDEE）</p>
                <p className="text-3xl font-bold text-green-700 font-mono">{fmt(result.tdee)}</p>
                <p className="text-xs text-green-500 mt-1">kcal/日</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              <ResultRow
                label="減量目標カロリー"
                value={`${fmt(result.lossCalorie)} kcal`}
                sub="TDEE より 500kcal 減（週約 0.5kg 減）"
              />
              <ResultRow
                label="増量目標カロリー"
                value={`${fmt(result.gainCalorie)} kcal`}
                sub="TDEE より 500kcal 増（週約 0.5kg 増）"
              />
            </div>
          </div>

          {/* PFC balance */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-1">三大栄養素の目安（PFCバランス）</h3>
            <p className="text-xs text-muted mb-4">TDEE に対してタンパク質30% / 脂質25% / 炭水化物45% を想定</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "タンパク質", value: fmtG(result.protein), pct: "30%", color: "bg-red-50 border-red-200 text-red-700", sub: "4kcal/g" },
                { label: "脂質", value: fmtG(result.fat), pct: "25%", color: "bg-yellow-50 border-yellow-200 text-yellow-700", sub: "9kcal/g" },
                { label: "炭水化物", value: fmtG(result.carbs), pct: "45%", color: "bg-purple-50 border-purple-200 text-purple-700", sub: "4kcal/g" },
              ].map(({ label, value, pct, color, sub }) => (
                <div key={label} className={`border rounded-xl p-3 text-center ${color}`}>
                  <p className="text-xs mb-1 opacity-80">{label}</p>
                  <p className="text-2xl font-bold font-mono">{value}</p>
                  <p className="text-xs mt-1 opacity-70">{pct} / {sub}</p>
                </div>
              ))}
            </div>

            {/* PFC bar */}
            <div className="mt-4 h-4 rounded-full overflow-hidden flex">
              <div className="bg-red-400 h-full" style={{ width: "30%" }} />
              <div className="bg-yellow-400 h-full" style={{ width: "25%" }} />
              <div className="bg-purple-400 h-full" style={{ width: "45%" }} />
            </div>
            <div className="flex gap-4 mt-2 justify-center">
              {[
                { label: "P タンパク質", color: "bg-red-400" },
                { label: "F 脂質", color: "bg-yellow-400" },
                { label: "C 炭水化物", color: "bg-purple-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1 text-xs text-muted">
                  <span className={`w-3 h-3 rounded-sm ${item.color} inline-block`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
