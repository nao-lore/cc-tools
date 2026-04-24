"use client";
import { useState } from "react";

const SIZE_PRESETS = [
  { name: "超小型犬", weight: 3, example: "チワワ・ポメラニアン" },
  { name: "小型犬", weight: 6, example: "トイプードル・シーズー" },
  { name: "中型犬", weight: 15, example: "柴犬・ビーグル" },
  { name: "大型犬", weight: 30, example: "ラブラドール・ゴールデン" },
  { name: "超大型犬", weight: 50, example: "グレートデン・セントバーナード" },
];

const LIFE_STAGES = [
  { name: "子犬（〜12ヶ月）", factor: 2.0, description: "成長に多くのエネルギーが必要" },
  { name: "成犬（1〜7歳）", factor: 1.6, description: "維持に必要な標準量" },
  { name: "避妊・去勢済", factor: 1.4, description: "代謝が落ちるため少し少なめ" },
  { name: "シニア犬（7歳〜）", factor: 1.2, description: "活動量が減り必要量が少ない" },
];

const ACTIVITY_LEVELS = [
  { name: "低活動（室内中心）", modifier: 0.9 },
  { name: "標準（毎日散歩）", modifier: 1.0 },
  { name: "高活動（運動多め）", modifier: 1.2 },
  { name: "作業犬・競技", modifier: 1.5 },
];

const DRY_FOOD_KCAL = 350; // kcal per 100g (standard dry kibble)
const WET_FOOD_KCAL = 80;  // kcal per 100g (standard wet food)

export default function DogFoodAmount() {
  const [weight, setWeight] = useState<string>("6");
  const [stageIdx, setStageIdx] = useState(1);
  const [activityIdx, setActivityIdx] = useState(1);
  const [dryFoodKcal, setDryFoodKcal] = useState<string>(String(DRY_FOOD_KCAL));
  const [wetFoodKcal, setWetFoodKcal] = useState<string>(String(WET_FOOD_KCAL));

  const w = parseFloat(weight) || 0;
  const stage = LIFE_STAGES[stageIdx];
  const activity = ACTIVITY_LEVELS[activityIdx];

  // RER = 70 × (weight_kg ^ 0.75)
  const rer = 70 * Math.pow(w, 0.75);
  // DER = RER × life stage factor × activity modifier
  const der = rer * stage.factor * activity.modifier;

  const dryFoodKcalPer100 = parseFloat(dryFoodKcal) || DRY_FOOD_KCAL;
  const wetFoodKcalPer100 = parseFloat(wetFoodKcal) || WET_FOOD_KCAL;

  const dryGrams = (der / dryFoodKcalPer100) * 100;
  const wetGrams = (der / wetFoodKcalPer100) * 100;

  // Meals per day suggestion
  const mealsPerDay = stageIdx === 0 ? 3 : 2;
  const dryPerMeal = dryGrams / mealsPerDay;
  const wetPerMeal = wetGrams / mealsPerDay;

  return (
    <div className="space-y-6">
      {/* Size Presets */}
      <div>
        <p className="text-xs text-gray-500 mb-2">体格から選ぶ</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SIZE_PRESETS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setWeight(String(s.weight))}
              className={`p-2 rounded-lg border text-center text-xs transition-colors ${
                Math.abs(parseFloat(weight) - s.weight) < 0.1
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
              }`}
            >
              <p className="font-medium">{s.name}</p>
              <p className="text-gray-400 text-xs mt-0.5 group-hover:text-orange-200">{s.example}</p>
              <p className="font-bold mt-1">{s.weight}kg</p>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            体重（kg）
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="例: 6"
            min="0.5"
            max="90"
            step="0.5"
          />
        </div>

        {/* Life Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ライフステージ</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LIFE_STAGES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setStageIdx(idx)}
                className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                  stageIdx === idx
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-orange-200"
                }`}
              >
                <p className="font-medium text-gray-800">{s.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">活動量</label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_LEVELS.map((a, idx) => (
              <button
                key={idx}
                onClick={() => setActivityIdx(idx)}
                className={`p-2.5 rounded-lg border text-sm text-left transition-colors ${
                  activityIdx === idx
                    ? "border-orange-400 bg-orange-50 text-orange-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-200"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {w > 0 && (
        <div className="space-y-4">
          {/* Energy */}
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
            <p className="text-sm text-orange-700 mb-3 font-medium">必要カロリー（1日）</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-orange-600 mb-1">安静時代謝（RER）</p>
                <p className="text-2xl font-bold text-orange-700">{rer.toFixed(0)}<span className="text-sm ml-1">kcal</span></p>
              </div>
              <div className="text-center">
                <p className="text-xs text-orange-600 mb-1">1日必要量（DER）</p>
                <p className="text-3xl font-bold text-orange-600">{der.toFixed(0)}<span className="text-sm ml-1">kcal</span></p>
              </div>
            </div>
          </div>

          {/* Food Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🦴</span>
                <p className="text-sm font-semibold text-gray-700">ドライフード</p>
              </div>
              <div className="mb-2">
                <label className="text-xs text-gray-500">フードのカロリー（kcal/100g）</label>
                <input
                  type="number"
                  value={dryFoodKcal}
                  onChange={(e) => setDryFoodKcal(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <p className="text-3xl font-bold text-gray-800">{dryGrams.toFixed(0)}<span className="text-sm ml-1 text-gray-500">g/日</span></p>
              <p className="text-sm text-gray-500 mt-1">{mealsPerDay}回に分けて <strong>{dryPerMeal.toFixed(0)}g</strong> ずつ</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🥩</span>
                <p className="text-sm font-semibold text-gray-700">ウェットフード</p>
              </div>
              <div className="mb-2">
                <label className="text-xs text-gray-500">フードのカロリー（kcal/100g）</label>
                <input
                  type="number"
                  value={wetFoodKcal}
                  onChange={(e) => setWetFoodKcal(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <p className="text-3xl font-bold text-gray-800">{wetGrams.toFixed(0)}<span className="text-sm ml-1 text-gray-500">g/日</span></p>
              <p className="text-sm text-gray-500 mt-1">{mealsPerDay}回に分けて <strong>{wetPerMeal.toFixed(0)}g</strong> ずつ</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
            ※フードのカロリーはパッケージの栄養成分表示を確認してください。この計算は目安であり、個体差があります。定期的に体重チェックをして調整してください。
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この犬の給餌量計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">体重・年齢・活動量から1日の給餌量を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この犬の給餌量計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "体重・年齢・活動量から1日の給餌量を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "犬の給餌量計算",
  "description": "体重・年齢・活動量から1日の給餌量を計算",
  "url": "https://tools.loresync.dev/dog-food-amount",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
