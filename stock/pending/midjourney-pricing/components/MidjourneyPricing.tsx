"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface Plan {
  name: string;
  usdMonth: number;
  usdYear: number;
  fastHours: number;
  relaxed: boolean;
  stealth: boolean;
  concurrent: number;
  description: string;
}

const PLANS: Plan[] = [
  {
    name: "Basic",
    usdMonth: 10,
    usdYear: 96,
    fastHours: 3.33,
    relaxed: false,
    stealth: false,
    concurrent: 3,
    description: "個人利用・お試しに",
  },
  {
    name: "Standard",
    usdMonth: 30,
    usdYear: 288,
    fastHours: 15,
    relaxed: true,
    stealth: false,
    concurrent: 3,
    description: "一般的な利用に最適",
  },
  {
    name: "Pro",
    usdMonth: 60,
    usdYear: 576,
    fastHours: 30,
    relaxed: true,
    stealth: true,
    concurrent: 12,
    description: "ヘビーユーザー・商業利用",
  },
  {
    name: "Mega",
    usdMonth: 120,
    usdYear: 1152,
    fastHours: 60,
    relaxed: true,
    stealth: true,
    concurrent: 12,
    description: "大量生成・チーム利用",
  },
];

// Approximate: 1 fast GPU hour ≈ 60 images (standard quality)
const IMAGES_PER_FAST_HOUR = 60;
// Relaxed is roughly unlimited but slower
const RELAXED_IMAGES_APPROX = 999;

function formatJPY(usd: number): string {
  return Math.round(usd * USD_TO_JPY).toLocaleString("ja-JP");
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-indigo-600">
          {value.toLocaleString("ja-JP")} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function MidjourneyPricing() {
  const [monthlyImages, setMonthlyImages] = useState(200);
  const [useRelaxed, setUseRelaxed] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);

  const results = useMemo(() => {
    return PLANS.map((plan) => {
      const fastImages = Math.floor(plan.fastHours * IMAGES_PER_FAST_HOUR);
      const totalImages =
        useRelaxed && plan.relaxed
          ? fastImages + RELAXED_IMAGES_APPROX
          : fastImages;
      const canHandle = totalImages >= monthlyImages || (useRelaxed && plan.relaxed);
      const usdCost = billing === "monthly" ? plan.usdMonth : plan.usdYear / 12;
      const jpyCost = Math.round(usdCost * usdRate);
      const costPerImage = monthlyImages > 0 ? jpyCost / monthlyImages : 0;

      return {
        ...plan,
        fastImages,
        totalImages,
        canHandle,
        usdCost,
        jpyCost,
        costPerImage,
      };
    });
  }, [monthlyImages, useRelaxed, billing, usdRate]);

  const recommended = results.find((r) => r.canHandle) ?? results[0];

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">利用条件を入力</h2>

        <Slider
          label="月間生成枚数"
          value={monthlyImages}
          min={10}
          max={2000}
          step={10}
          unit="枚/月"
          onChange={setMonthlyImages}
        />

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">為替レート（1 USD =）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={usdRate}
              min={100}
              max={200}
              step={1}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <span className="text-sm text-gray-600">円</span>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">支払いサイクル</label>
            <div className="flex gap-2">
              {(["monthly", "annual"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    billing === b
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {b === "monthly" ? "月払い" : "年払い（20%オフ）"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Relaxedモード</label>
            <button
              onClick={() => setUseRelaxed(!useRelaxed)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                useRelaxed
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {useRelaxed ? "使用する（低速・無制限）" : "使用しない"}
            </button>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-indigo-600 text-xl">★</span>
          <span className="font-semibold text-indigo-800">おすすめプラン</span>
        </div>
        <p className="text-2xl font-bold text-indigo-900">
          {recommended.name} — 月{recommended.jpyCost.toLocaleString("ja-JP")}円
        </p>
        <p className="text-sm text-indigo-700 mt-1">
          月{monthlyImages}枚生成 → 1枚あたり約{Math.round(recommended.costPerImage)}円
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl border-2 p-5 transition-all ${
              plan.name === recommended.name
                ? "border-indigo-400 shadow-md"
                : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>
              {plan.name === recommended.name && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
                  おすすめ
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-gray-900 mb-1">
              ¥{plan.jpyCost.toLocaleString("ja-JP")}
              <span className="text-sm font-normal text-gray-500">/月</span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              ${plan.usdCost.toFixed(2)}/月
              {billing === "annual" && (
                <span className="ml-2 text-green-600 font-medium">（年払い）</span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fast GPU時間</span>
                <span className="font-medium">{plan.fastHours}時間/月</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fast生成枚数目安</span>
                <span className="font-medium">約{plan.fastImages}枚</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Relaxedモード</span>
                <span className={plan.relaxed ? "text-green-600 font-medium" : "text-gray-400"}>
                  {plan.relaxed ? "利用可能（実質無制限）" : "なし"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ステルスモード</span>
                <span className={plan.stealth ? "text-green-600 font-medium" : "text-gray-400"}>
                  {plan.stealth ? "あり" : "なし"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">同時生成数</span>
                <span className="font-medium">{plan.concurrent}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1枚あたりコスト</span>
                <span className="font-medium">
                  約{Math.round(plan.costPerImage)}円
                </span>
              </div>
            </div>

            <div
              className={`mt-4 text-center text-xs font-medium py-1 rounded-full ${
                plan.canHandle
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {plan.canHandle
                ? `月${monthlyImages}枚に対応可能`
                : `Fast枠のみでは不足（Relaxed有効化が必要）`}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 生成枚数目安はデフォルト品質（--q 1）での概算です。高品質設定では減少します。</p>
        <p>※ Fast GPU時間は余った分を翌月に繰越できません（年払いプランを除く）。</p>
        <p>※ 料金は2024年時点の公式サイト情報をもとにしています。最新料金はMidjourney公式でご確認ください。</p>
        <p>※ 為替レートは変動します。実際の請求額は変わる場合があります。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このMidjourney料金シミュレーターツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">プラン別生成枚数上限・Fast/Relaxedモード計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このMidjourney料金シミュレーターツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "プラン別生成枚数上限・Fast/Relaxedモード計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Midjourney料金シミュレーター",
  "description": "プラン別生成枚数上限・Fast/Relaxedモード計算",
  "url": "https://tools.loresync.dev/midjourney-pricing",
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
