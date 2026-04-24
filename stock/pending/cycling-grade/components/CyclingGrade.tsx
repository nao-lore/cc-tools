"use client";
import { useState } from "react";

const FAMOUS_CLIMBS = [
  { name: "Mt. Fuji（富士山スカイライン）", dist: 24, elev: 2400, grade: 10.0 },
  { name: "乗鞍岳（エコーライン）", dist: 20, elev: 1260, grade: 6.3 },
  { name: "箱根ターンパイク", dist: 15, elev: 850, grade: 5.7 },
  { name: "ヤビツ峠", dist: 12, elev: 650, grade: 5.4 },
  { name: "美ヶ原高原", dist: 32, elev: 1270, grade: 4.0 },
  { name: "Alpe d'Huez（Tour de France）", dist: 13.8, elev: 1071, grade: 7.9 },
  { name: "Mont Ventoux（Tour de France）", dist: 21.5, elev: 1610, grade: 7.5 },
];

// Power estimation (simplified Chung / physics model)
function estimatePower(
  distKm: number,
  elevM: number,
  weightKg: number,
  bikeWeightKg: number,
  timeMin: number
): number {
  const totalWeight = weightKg + bikeWeightKg;
  const timeS = timeMin * 60;
  const speedMs = (distKm * 1000) / timeS;
  const gradeDecimal = elevM / (distKm * 1000);

  // Gravity component
  const gravityPower = totalWeight * 9.81 * speedMs * gradeDecimal;
  // Rolling resistance (Crr ≈ 0.004)
  const rollingPower = totalWeight * 9.81 * 0.004 * speedMs;
  // Aero drag (CdA ≈ 0.32 for road bike, rho = 1.2)
  const aeroPower = 0.5 * 1.2 * 0.32 * speedMs * speedMs * speedMs;

  return Math.max(gravityPower + rollingPower + aeroPower, 0);
}

// Calorie estimation
function estimateCalories(powerW: number, timeMin: number, efficiencyFactor = 0.22): number {
  // Energy = Power × Time / Mechanical efficiency
  return (powerW * (timeMin * 60)) / (efficiencyFactor * 4184) * 1000;
}

export default function CyclingGrade() {
  const [distance, setDistance] = useState<string>("20");
  const [elevation, setElevation] = useState<string>("1000");
  const [weight, setWeight] = useState<string>("70");
  const [bikeWeight, setBikeWeight] = useState<string>("8");
  const [timeMin, setTimeMin] = useState<string>("80");
  const [activeClimb, setActiveClimb] = useState<number | null>(null);

  const dist = parseFloat(distance) || 0;
  const elev = parseFloat(elevation) || 0;
  const w = parseFloat(weight) || 70;
  const bw = parseFloat(bikeWeight) || 8;
  const t = parseFloat(timeMin) || 0;

  const grade = dist > 0 ? (elev / (dist * 1000)) * 100 : 0;
  const speedKmh = t > 0 ? (dist / t) * 60 : 0;
  const power = dist > 0 && elev >= 0 && t > 0 ? estimatePower(dist, elev, w, bw, t) : 0;
  const calories = power > 0 && t > 0 ? estimateCalories(power, t) : 0;
  const wpkg = power > 0 && w > 0 ? power / w : 0;

  const applyClimb = (idx: number) => {
    const c = FAMOUS_CLIMBS[idx];
    setDistance(String(c.dist));
    setElevation(String(c.elev));
    setActiveClimb(idx);
  };

  const getGradeLabel = (g: number) => {
    if (g < 2) return { label: "平坦", color: "text-green-600" };
    if (g < 5) return { label: "緩坂", color: "text-yellow-600" };
    if (g < 8) return { label: "中級", color: "text-orange-600" };
    if (g < 12) return { label: "急坂", color: "text-red-600" };
    return { label: "激坂", color: "text-red-700" };
  };

  const gradeInfo = getGradeLabel(grade);

  const getWpkgLevel = (wpkg: number) => {
    if (wpkg < 1.5) return { label: "初心者", color: "text-gray-500" };
    if (wpkg < 2.5) return { label: "アンチュラン", color: "text-blue-600" };
    if (wpkg < 3.5) return { label: "ファンライダー", color: "text-green-600" };
    if (wpkg < 4.5) return { label: "レーサー", color: "text-yellow-600" };
    if (wpkg < 5.5) return { label: "エリート", color: "text-orange-600" };
    return { label: "プロ級", color: "text-red-600" };
  };

  const wpkgLevel = getWpkgLevel(wpkg);

  return (
    <div className="space-y-6">
      {/* Famous Climbs */}
      <div>
        <p className="text-xs text-gray-500 mb-2">有名な峠・コースから選ぶ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FAMOUS_CLIMBS.map((c, idx) => (
            <button
              key={idx}
              onClick={() => applyClimb(idx)}
              className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                activeClimb === idx
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/40"
              }`}
            >
              <p className="font-medium text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {c.dist}km / 標高差{c.elev}m / 平均勾配{c.grade}%
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">距離（km）</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => { setDistance(e.target.value); setActiveClimb(null); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標高差（m）</label>
            <input
              type="number"
              value={elevation}
              onChange={(e) => { setElevation(e.target.value); setActiveClimb(null); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">体重（kg）</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              min="30"
              max="200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">自転車重量（kg）</label>
            <input
              type="number"
              value={bikeWeight}
              onChange={(e) => setBikeWeight(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              min="3"
              max="30"
              step="0.5"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">走行時間（分）</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="10"
              max="360"
              value={timeMin}
              onChange={(e) => setTimeMin(e.target.value)}
              className="flex-1 accent-green-500"
            />
            <input
              type="number"
              value={timeMin}
              onChange={(e) => setTimeMin(e.target.value)}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              min="1"
            />
            <span className="text-gray-500 text-sm">分</span>
          </div>
        </div>
      </div>

      {/* Results */}
      {dist > 0 && (
        <div className="space-y-4">
          {/* Grade */}
          <div className="bg-green-50 rounded-xl border border-green-200 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-green-700 mb-1">平均勾配</p>
                <p className={`text-3xl font-bold ${gradeInfo.color}`}>
                  {grade.toFixed(1)}<span className="text-lg ml-0.5">%</span>
                </p>
                <p className={`text-xs font-medium ${gradeInfo.color}`}>{gradeInfo.label}</p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">平均速度</p>
                <p className="text-3xl font-bold text-green-700">
                  {t > 0 ? speedKmh.toFixed(1) : "—"}<span className="text-lg ml-0.5">km/h</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">平均パワー</p>
                <p className="text-3xl font-bold text-green-700">
                  {t > 0 ? power.toFixed(0) : "—"}<span className="text-lg ml-0.5">W</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">消費カロリー</p>
                <p className="text-3xl font-bold text-green-700">
                  {t > 0 ? calories.toFixed(0) : "—"}<span className="text-lg ml-0.5">kcal</span>
                </p>
              </div>
            </div>
          </div>

          {/* W/kg */}
          {t > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">体重あたりパワー（W/kg）</p>
                  <p className="text-xs text-gray-500">クライマーの実力指標</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{wpkg.toFixed(2)}<span className="text-sm ml-1">W/kg</span></p>
                  <p className={`text-sm font-medium ${wpkgLevel.color}`}>{wpkgLevel.label}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: "〜1.5 W/kg", desc: "初心者", w: 1.5 },
                  { label: "1.5〜2.5 W/kg", desc: "アンチュラン", w: 2.5 },
                  { label: "2.5〜3.5 W/kg", desc: "ファンライダー", w: 3.5 },
                  { label: "3.5〜4.5 W/kg", desc: "レーサー", w: 4.5 },
                  { label: "4.5〜5.5 W/kg", desc: "エリート", w: 5.5 },
                  { label: "5.5+ W/kg", desc: "プロ級", w: 99 },
                ].map((r, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between px-2 py-1 rounded ${
                      wpkg <= r.w && (idx === 0 || wpkg > [0, 1.5, 2.5, 3.5, 4.5, 5.5][idx])
                        ? "bg-green-100 text-green-800 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    <span>{r.label}</span>
                    <span>{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calorie context */}
          {calories > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-1">消費カロリーの目安</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p>おにぎり</p>
                  <p className="font-semibold text-gray-800">{(calories / 180).toFixed(1)}個分</p>
                </div>
                <div className="text-center">
                  <p>ラーメン</p>
                  <p className="font-semibold text-gray-800">{(calories / 500).toFixed(1)}杯分</p>
                </div>
                <div className="text-center">
                  <p>ショートケーキ</p>
                  <p className="font-semibold text-gray-800">{(calories / 350).toFixed(1)}個分</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このサイクリング勾配・消費計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">距離・標高差・体重からカロリーとパワー計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このサイクリング勾配・消費計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "距離・標高差・体重からカロリーとパワー計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "サイクリング勾配・消費計算",
  "description": "距離・標高差・体重からカロリーとパワー計算",
  "url": "https://tools.loresync.dev/cycling-grade",
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
