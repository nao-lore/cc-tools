"use client";

import { useState, useMemo } from "react";

type Gender = "male" | "female";

type BodyFatCategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  maleMin: number;
  maleMax: number;
  femaleMin: number;
  femaleMax: number;
};

const BODY_FAT_CATEGORIES: BodyFatCategory[] = [
  {
    label: "やせ",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    maleMin: 0,
    maleMax: 10,
    femaleMin: 0,
    femaleMax: 20,
  },
  {
    label: "標準（低め）",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    maleMin: 10,
    maleMax: 17,
    femaleMin: 20,
    femaleMax: 27,
  },
  {
    label: "標準（高め）",
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-400",
    maleMin: 17,
    maleMax: 22,
    femaleMin: 27,
    femaleMax: 33,
  },
  {
    label: "軽肥満",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    maleMin: 22,
    maleMax: 25,
    femaleMin: 33,
    femaleMax: 36,
  },
  {
    label: "肥満",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    maleMin: 25,
    maleMax: Infinity,
    femaleMin: 36,
    femaleMax: Infinity,
  },
];

function getCategory(bodyFat: number, gender: Gender): BodyFatCategory {
  return (
    BODY_FAT_CATEGORIES.find((c) =>
      gender === "male"
        ? bodyFat >= c.maleMin && bodyFat < c.maleMax
        : bodyFat >= c.femaleMin && bodyFat < c.femaleMax
    ) ?? BODY_FAT_CATEGORIES[BODY_FAT_CATEGORIES.length - 1]
  );
}

function getCategoryColorClass(label: string): { text: string; badge: string } {
  switch (label) {
    case "やせ":
      return { text: "text-blue-600", badge: "bg-blue-100 text-blue-700" };
    case "標準（低め）":
    case "標準（高め）":
      return { text: "text-green-600", badge: "bg-green-100 text-green-700" };
    case "軽肥満":
      return { text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-700" };
    case "肥満":
      return { text: "text-red-600", badge: "bg-red-100 text-red-700" };
    default:
      return { text: "text-gray-600", badge: "bg-gray-100 text-gray-700" };
  }
}

export default function BodyFatCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");

  const fmt = (n: number, digits = 1) => n.toFixed(digits);

  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const wa = parseFloat(waist);
    const ne = parseFloat(neck);

    if (!h || !w || !wa || !ne) return null;
    if (h <= 0 || w <= 0 || wa <= 0 || ne <= 0) return null;
    if (wa <= ne) return null; // log of non-positive

    // Navy formula (male)
    // BF% = 86.010 × log10(waist - neck) − 70.041 × log10(height) + 36.76
    const bodyFat =
      86.010 * Math.log10(wa - ne) - 70.041 * Math.log10(h) + 36.76;

    if (bodyFat < 0 || bodyFat > 70) return null;

    const fatMass = (bodyFat / 100) * w;
    const leanMass = w - fatMass;

    // BMI
    const hm = h / 100;
    const bmi = w / (hm * hm);

    const category = getCategory(bodyFat, gender);

    return { bodyFat, fatMass, leanMass, bmi, category };
  }, [gender, height, weight, waist, neck]);

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10";

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">身体情報を入力</h2>

        {/* Gender toggle */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">性別</label>
          <div className="flex gap-2">
            {(["male", "female"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  gender === g
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {g === "male" ? "男性" : "女性"}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">年齢（歳）</label>
          <div className="relative max-w-[160px]">
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

        {/* Height / Weight */}
        <div className="grid grid-cols-2 gap-4 mb-4">
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

        {/* Waist / Neck */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">ウエスト周囲径（cm）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="80"
                value={waist}
                onChange={(e) => setWaist(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">首周り（cm）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="38"
                value={neck}
                onChange={(e) => setNeck(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">cm</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted mt-3">
          ※ ウエストはへその高さで測定。首周りは喉仏の直下を水平に測定。
        </p>
      </div>

      {/* Result card */}
      {result && (() => {
        const colors = getCategoryColorClass(result.category.label);
        return (
          <div className={`bg-card border-2 ${result.category.borderColor} rounded-xl p-5 shadow-sm`}>
            {/* Main result */}
            <div className={`flex items-center justify-between mb-4 p-4 ${result.category.bgColor} rounded-lg`}>
              <div>
                <p className="text-xs text-muted mb-1">推定体脂肪率</p>
                <p className={`text-4xl font-bold ${result.category.color}`}>
                  {fmt(result.bodyFat)}
                  <span className="text-xl ml-1">%</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted mb-1">判定</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${colors.badge}`}>
                  {result.category.label}
                </span>
              </div>
            </div>

            {/* Detail rows */}
            <div className="divide-y divide-border">
              {[
                { label: "体脂肪量", value: `${fmt(result.fatMass)} kg` },
                { label: "除脂肪体重（筋肉・骨等）", value: `${fmt(result.leanMass)} kg` },
                { label: "BMI（参考）", value: fmt(result.bmi) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-muted">{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Criteria table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">
          判定基準表（{gender === "male" ? "男性" : "女性"}）
        </h3>
        <div className="space-y-1">
          {BODY_FAT_CATEGORIES.map((cat) => {
            const min = gender === "male" ? cat.maleMin : cat.femaleMin;
            const max = gender === "male" ? cat.maleMax : cat.femaleMax;
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
                  {max === Infinity ? `${min}% 以上` : `${min} 〜 ${max}%`}
                </span>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この体脂肪率計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">体脂肪率の推定計算と判定。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この体脂肪率計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "体脂肪率の推定計算と判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-3">
          ※ 男女別の一般的な目安。年齢・体型・測定方法により異なる場合があります。
        </p>
      </div>
    </div>
  );
}
