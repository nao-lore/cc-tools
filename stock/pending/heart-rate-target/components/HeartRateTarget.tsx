"use client";
import { useState } from "react";

const ZONES = [
  { name: "ゾーン1", label: "回復・ウォームアップ", pctMin: 50, pctMax: 60, color: "bg-blue-400", textColor: "text-blue-700", bgLight: "bg-blue-50 border-blue-200", effect: "体の回復、ウォームアップ、超低強度有酸素" },
  { name: "ゾーン2", label: "脂肪燃焼・基礎有酸素", pctMin: 60, pctMax: 70, color: "bg-green-400", textColor: "text-green-700", bgLight: "bg-green-50 border-green-200", effect: "脂肪燃焼率が最高、有酸素基礎能力向上" },
  { name: "ゾーン3", label: "有酸素能力向上", pctMin: 70, pctMax: 80, color: "bg-yellow-400", textColor: "text-yellow-700", bgLight: "bg-yellow-50 border-yellow-200", effect: "心肺機能強化、持久力向上" },
  { name: "ゾーン4", label: "乳酸閾値・高強度", pctMin: 80, pctMax: 90, color: "bg-orange-400", textColor: "text-orange-700", bgLight: "bg-orange-50 border-orange-200", effect: "スピード持久力、乳酸処理能力向上" },
  { name: "ゾーン5", label: "最大強度・無酸素", pctMin: 90, pctMax: 100, color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50 border-red-200", effect: "VO2max向上、最大スピード強化" },
];

const AGE_PRESETS = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];

export default function HeartRateTarget() {
  const [age, setAge] = useState<string>("35");
  const [restingHR, setRestingHR] = useState<string>("60");
  const [currentHR, setCurrentHR] = useState<string>("");

  const ageNum = parseInt(age) || 0;
  const restingHRNum = parseInt(restingHR) || 0;

  // Tanaka formula: MHR = 208 - (0.7 × age)
  const maxHR = 208 - 0.7 * ageNum;
  // Heart Rate Reserve
  const hrr = maxHR - restingHRNum;

  // Karvonen formula: target HR = (HRR × intensity%) + resting HR
  const calcZoneHR = (pct: number) => Math.round(hrr * (pct / 100) + restingHRNum);

  const currentHRNum = parseInt(currentHR) || 0;
  const currentZoneIdx = currentHRNum > 0
    ? ZONES.findIndex((z) => {
        const lo = calcZoneHR(z.pctMin);
        const hi = calcZoneHR(z.pctMax);
        return currentHRNum >= lo && currentHRNum <= hi;
      })
    : -1;

  const currentPct = maxHR > 0 && currentHRNum > 0
    ? Math.min(((currentHRNum - restingHRNum) / hrr) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                min="10"
                max="90"
                placeholder="例: 35"
              />
              <span className="flex items-center text-gray-500 text-sm">歳</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {AGE_PRESETS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAge(String(a))}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                    parseInt(age) === a
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-500 border-gray-200 hover:border-red-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              安静時心拍数
              <span className="text-xs text-gray-400 ml-1">（起床後すぐ計測）</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={restingHR}
                onChange={(e) => setRestingHR(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                min="30"
                max="100"
                placeholder="例: 60"
              />
              <span className="flex items-center text-gray-500 text-sm">bpm</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">一般的な目安: 60〜80bpm、アスリート: 40〜60bpm</p>
          </div>
        </div>

        {ageNum > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">推定最大心拍数（田中式）</p>
              <p className="text-2xl font-bold text-red-600">{maxHR.toFixed(0)}<span className="text-sm ml-1 text-gray-500">bpm</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">心拍予備量（HRR）</p>
              <p className="text-2xl font-bold text-gray-800">{hrr.toFixed(0)}<span className="text-sm ml-1 text-gray-500">bpm</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Zone Table */}
      {ageNum > 0 && restingHRNum > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">5段階トレーニングゾーン（カルボーネン法）</h3>
          <div className="space-y-2">
            {ZONES.map((zone, idx) => {
              const loHR = calcZoneHR(zone.pctMin);
              const hiHR = calcZoneHR(zone.pctMax);
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 transition-all ${zone.bgLight} ${
                    currentZoneIdx === idx ? "ring-2 ring-offset-1 ring-red-400 shadow-md" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${zone.color}`} />
                      <span className={`text-sm font-semibold ${zone.textColor}`}>{zone.name}</span>
                      <span className="text-xs text-gray-500">{zone.label}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${zone.textColor}`}>
                        {loHR}〜{hiHR}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">bpm</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-gray-200">
                      <div
                        className={`h-full ${zone.color} rounded-full`}
                        style={{ width: `${zone.pctMax - zone.pctMin + zone.pctMin - 50}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{zone.pctMin}〜{zone.pctMax}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5">{zone.effect}</p>
                  {currentZoneIdx === idx && (
                    <div className="mt-2 bg-red-100 rounded-lg px-3 py-1.5 text-xs text-red-700 font-medium">
                      現在の心拍数 {currentHRNum}bpm がこのゾーンに該当します
                    </div>
                  )}
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この目標心拍数ゾーン計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">年齢と安静時心拍数からトレーニングゾーンを計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この目標心拍数ゾーン計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "年齢と安静時心拍数からトレーニングゾーンを計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current HR Checker */}
      {ageNum > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">現在の心拍数でゾーンを確認</h3>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={currentHR}
              onChange={(e) => setCurrentHR(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="現在の心拍数 (bpm)"
              min="30"
              max="220"
            />
            <span className="text-gray-500 text-sm">bpm</span>
          </div>
          {currentHRNum > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>安静時 {restingHRNum}bpm</span>
                <span>最大 {maxHR.toFixed(0)}bpm</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all ${
                    currentZoneIdx >= 0 ? ZONES[currentZoneIdx].color : "bg-gray-400"
                  }`}
                  style={{ width: `${Math.max(Math.min(currentPct, 100), 0)}%` }}
                />
              </div>
              <p className="text-sm mt-2 text-gray-600">
                {currentZoneIdx >= 0
                  ? `${ZONES[currentZoneIdx].name}（${ZONES[currentZoneIdx].label}）`
                  : currentHRNum < calcZoneHR(50)
                  ? "ゾーン1以下（安静〜超低強度）"
                  : "最大心拍数付近（非常に高強度）"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">トレーニングの目安</h3>
        <div className="space-y-1.5 text-xs text-gray-600">
          <p>• <strong>ダイエット目的</strong>: ゾーン2（60〜70%）で30〜60分の長時間有酸素</p>
          <p>• <strong>持久力向上</strong>: ゾーン3〜4（70〜90%）でテンポ走・インターバル</p>
          <p>• <strong>回復日</strong>: ゾーン1（50〜60%）で軽いジョグやウォーキング</p>
          <p>• <strong>最大能力向上</strong>: ゾーン5（90〜100%）のインターバルを週1〜2回</p>
        </div>
      </div>
    </div>
  );
}
