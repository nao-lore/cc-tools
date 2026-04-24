"use client";
import { useState } from "react";

const DAYS = ["月", "火", "水", "木", "金", "土", "日"];

const IDEAL_BY_AGE: Record<string, number> = {
  "teen": 9,
  "adult": 8,
  "middle": 7.5,
  "senior": 7,
};

const AGE_GROUPS = [
  { key: "teen", label: "10代", hours: 9 },
  { key: "adult", label: "20〜40代", hours: 8 },
  { key: "middle", label: "50〜60代", hours: 7.5 },
  { key: "senior", label: "70代以上", hours: 7 },
];

const HEALTH_RISKS: { hours: number; risks: string[] }[] = [
  { hours: 10, risks: ["過眠症の可能性", "慢性疾患のサイン"] },
  { hours: 7, risks: [] },
  { hours: 6, risks: ["集中力・反応速度低下", "免疫力低下"] },
  { hours: 5, risks: ["認知機能障害（飲酒相当）", "肥満リスク増加", "心疾患リスク増加"] },
  { hours: 4, risks: ["深刻な認知障害", "事故リスク大幅増加", "免疫機能著しく低下"] },
];

interface DayEntry {
  actual: string;
}

export default function SleepDebt() {
  const [ageGroup, setAgeGroup] = useState("adult");
  const [idealHours, setIdealHours] = useState<string>("8");
  const [days, setDays] = useState<DayEntry[]>(
    DAYS.map(() => ({ actual: "7" }))
  );

  const ideal = parseFloat(idealHours) || 8;

  const updateDay = (idx: number, value: string) => {
    setDays((prev) => prev.map((d, i) => i === idx ? { actual: value } : d));
  };

  const dailyDebts = days.map((d) => {
    const actual = parseFloat(d.actual) || 0;
    return ideal - actual;
  });

  const totalDebt = dailyDebts.reduce((sum, d) => sum + d, 0);
  const avgSleep = days.reduce((sum, d) => sum + (parseFloat(d.actual) || 0), 0) / days.length;
  const debtDays = totalDebt > 0 ? Math.ceil(totalDebt / 1.5) : 0;

  const applyAgeGroup = (key: string) => {
    setAgeGroup(key);
    setIdealHours(String(IDEAL_BY_AGE[key]));
  };

  const getDebtColor = (debt: number) => {
    if (debt <= 0) return "text-green-600";
    if (debt < 2) return "text-yellow-600";
    if (debt < 5) return "text-orange-600";
    return "text-red-600";
  };

  const getDebtBg = (debt: number) => {
    if (debt <= 0) return "bg-green-50 border-green-200";
    if (debt < 2) return "bg-yellow-50 border-yellow-200";
    if (debt < 5) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const maxBarHeight = Math.max(...days.map((d) => Math.abs(ideal - (parseFloat(d.actual) || 0))), 1);

  const getRecoveryPlan = (debt: number) => {
    if (debt <= 0) return null;
    if (debt < 3) return "週末に1〜2時間多く寝ることで回復可能です。";
    if (debt < 7) return "毎日30分早く就寝し、2週間かけて徐々に回復しましょう。";
    if (debt < 14) return "毎日1時間早く就寝し、睡眠スケジュールを固定してください。専門医への相談も検討を。";
    return "深刻な睡眠負債です。生活習慣を見直し、睡眠専門医への相談をお勧めします。";
  };

  const getCurrentRisks = (avgHrs: number) => {
    const match = HEALTH_RISKS.find((r) => avgHrs <= r.hours);
    return match?.risks ?? [];
  };

  const risks = getCurrentRisks(avgSleep);

  return (
    <div className="space-y-6">
      {/* Ideal Sleep Setup */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">年代</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag.key}
                onClick={() => applyAgeGroup(ag.key)}
                className={`p-2.5 rounded-lg border text-sm transition-colors ${
                  ageGroup === ag.key
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200"
                }`}
              >
                <p>{ag.label}</p>
                <p className="text-xs text-gray-400">{ag.hours}時間推奨</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            理想の睡眠時間（時間）
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="5"
              max="12"
              step="0.5"
              value={idealHours}
              onChange={(e) => setIdealHours(e.target.value)}
              className="flex-1 accent-indigo-500"
            />
            <input
              type="number"
              value={idealHours}
              onChange={(e) => setIdealHours(e.target.value)}
              className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              min="4"
              max="12"
              step="0.5"
            />
            <span className="text-gray-500 text-sm">時間</span>
          </div>
        </div>
      </div>

      {/* Daily Sleep Log */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">直近1週間の睡眠記録</h3>
        <div className="space-y-3">
          {DAYS.map((day, idx) => {
            const actual = parseFloat(days[idx].actual) || 0;
            const debt = ideal - actual;
            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-5 text-sm font-medium text-gray-500">{day}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={days[idx].actual}
                    onChange={(e) => updateDay(idx, e.target.value)}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-center text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    min="0"
                    max="16"
                    step="0.5"
                  />
                  <span className="text-xs text-gray-400">時間</span>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      debt > 0 ? "bg-orange-400" : "bg-green-400"
                    }`}
                    style={{ width: `${Math.min((actual / (ideal * 1.5)) * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-16 text-right ${getDebtColor(debt)}`}>
                  {debt > 0 ? `-${debt.toFixed(1)}h` : debt === 0 ? "±0" : `+${Math.abs(debt).toFixed(1)}h`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">睡眠負債の推移</h3>
        <div className="flex items-end justify-around h-24 gap-1">
          {days.map((d, idx) => {
            const actual = parseFloat(d.actual) || 0;
            const debt = ideal - actual;
            const height = Math.abs(debt / maxBarHeight) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex flex-col items-center justify-end" style={{ height: "80px" }}>
                  <div
                    className={`w-full rounded-t transition-all ${debt > 0 ? "bg-red-400" : "bg-green-400"}`}
                    style={{ height: `${height}%`, minHeight: debt !== 0 ? "4px" : "0" }}
                    title={`${DAYS[idx]}: ${debt > 0 ? "負債" : "余剰"} ${Math.abs(debt).toFixed(1)}h`}
                  />
                </div>
                <span className="text-xs text-gray-400">{DAYS[idx]}</span>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この睡眠負債計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">理想睡眠時間との差分から累積睡眠負債を可視化。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この睡眠負債計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "理想睡眠時間との差分から累積睡眠負債を可視化。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
        <div className="flex gap-3 text-xs mt-2">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block"></span>睡眠不足</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block"></span>余裕あり</span>
        </div>
      </div>

      {/* Summary */}
      <div className={`rounded-xl border p-5 ${getDebtBg(totalDebt)}`}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">累積睡眠負債</p>
            <p className={`text-3xl font-bold ${getDebtColor(totalDebt)}`}>
              {totalDebt > 0 ? totalDebt.toFixed(1) : "0"}
              <span className="text-lg ml-1">時間</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">平均睡眠時間</p>
            <p className="text-3xl font-bold text-gray-800">
              {avgSleep.toFixed(1)}
              <span className="text-lg ml-1">h</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">回復目安</p>
            <p className={`text-3xl font-bold ${getDebtColor(totalDebt)}`}>
              {totalDebt > 0 ? debtDays : 0}
              <span className="text-lg ml-1">日</span>
            </p>
          </div>
        </div>

        {totalDebt > 0 && (
          <div className="mt-4 bg-white/60 rounded-lg p-3 text-sm text-gray-700">
            <p className="font-medium mb-1">回復アドバイス</p>
            <p>{getRecoveryPlan(totalDebt)}</p>
          </div>
        )}

        {totalDebt <= 0 && (
          <div className="mt-4 bg-green-100 rounded-lg p-3 text-sm text-green-800 text-center">
            十分な睡眠が取れています。この睡眠習慣を維持しましょう。
          </div>
        )}
      </div>

      {/* Health Risks */}
      {risks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            平均{avgSleep.toFixed(1)}時間睡眠の健康リスク
          </h3>
          <ul className="space-y-1">
            {risks.map((r, idx) => (
              <li key={idx} className="text-sm text-red-700 flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-indigo-700 mb-2">睡眠改善のヒント</h3>
        <ul className="space-y-1.5 text-sm text-indigo-700">
          <li>• 就寝・起床時刻を毎日同じにする（週末も±1時間以内）</li>
          <li>• 就寝1〜2時間前はスマホ・PC画面を見ない</li>
          <li>• 寝室を暗く、涼しく（18〜20℃）、静かに保つ</li>
          <li>• 午後3時以降のカフェイン摂取を控える</li>
          <li>• 昼寝は20分以内、15時前に済ませる</li>
        </ul>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "睡眠負債計算",
  "description": "理想睡眠時間との差分から累積睡眠負債を可視化",
  "url": "https://tools.loresync.dev/sleep-debt",
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
