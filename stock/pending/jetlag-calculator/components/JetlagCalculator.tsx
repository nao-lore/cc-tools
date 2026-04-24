"use client";
import { useState } from "react";

const TIMEZONES = [
  { label: "東京 (JST, UTC+9)", value: 9, city: "Tokyo" },
  { label: "ソウル (KST, UTC+9)", value: 9, city: "Seoul" },
  { label: "北京・上海 (CST, UTC+8)", value: 8, city: "Beijing" },
  { label: "バンコク (ICT, UTC+7)", value: 7, city: "Bangkok" },
  { label: "ドバイ (GST, UTC+4)", value: 4, city: "Dubai" },
  { label: "モスクワ (MSK, UTC+3)", value: 3, city: "Moscow" },
  { label: "パリ・ベルリン (CET, UTC+1)", value: 1, city: "Paris" },
  { label: "ロンドン (GMT, UTC+0)", value: 0, city: "London" },
  { label: "ニューヨーク (EST, UTC-5)", value: -5, city: "New York" },
  { label: "シカゴ (CST, UTC-6)", value: -6, city: "Chicago" },
  { label: "ロサンゼルス (PST, UTC-8)", value: -8, city: "Los Angeles" },
  { label: "ホノルル (HST, UTC-10)", value: -10, city: "Honolulu" },
  { label: "シドニー (AEST, UTC+10)", value: 10, city: "Sydney" },
  { label: "オークランド (NZST, UTC+12)", value: 12, city: "Auckland" },
];

interface DayPlan {
  day: number;
  label: string;
  lightExposure: string;
  avoidLight: string;
  sleep: string;
  meals: string;
  tips: string;
  phase: "preparation" | "arrival" | "adjustment" | "normalized";
}

function generateSchedule(
  fromOffset: number,
  toOffset: number,
  departureDate: string
): DayPlan[] {
  const diff = toOffset - fromOffset;
  const absDiff = Math.abs(diff);
  const isEastward = diff > 0;
  const totalDays = Math.min(Math.ceil(absDiff / 1.5) + 2, 10);
  const plans: DayPlan[] = [];

  const base = departureDate ? new Date(departureDate) : new Date();

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(base);
    date.setDate(base.getDate() + i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const adjustedHours = Math.min(i * 1.5, absDiff);
    const remaining = absDiff - adjustedHours;

    let phase: DayPlan["phase"] = "adjustment";
    if (i === 0) phase = "preparation";
    else if (i === 1) phase = "arrival";
    else if (remaining <= 0) phase = "normalized";

    let lightExposure = "";
    let avoidLight = "";
    let sleep = "";
    let meals = "";
    let tips = "";

    if (phase === "preparation") {
      if (isEastward) {
        lightExposure = "朝の光を積極的に浴びる（6:00-9:00）";
        avoidLight = "夜20時以降の強い光を避ける";
        sleep = "普段より1時間早めに就寝";
        meals = "夕食を30分早める";
        tips = "出発前日。東方向への移動は体内時計を前倒しに調整";
      } else {
        lightExposure = "夕方の光を積極的に浴びる（17:00-20:00）";
        avoidLight = "朝の強い光を避ける（カーテン閉める）";
        sleep = "普段より1時間遅めに就寝";
        meals = "夕食を30分遅らせる";
        tips = "出発前日。西方向への移動は体内時計を後ろ倒しに調整";
      }
    } else if (phase === "arrival") {
      if (isEastward) {
        lightExposure = `現地の朝に強い光を浴びる`;
        avoidLight = "現地の夕方以降は光を避ける";
        sleep = `眠くても現地の就寝時刻（22:00-23:00）まで我慢`;
        meals = "現地の食事時刻に合わせる";
        tips = "到着日。眠気があっても現地時刻に合わせることが最重要";
      } else {
        lightExposure = "現地の午後に光を浴びる";
        avoidLight = "早朝の光を避ける（遮光カーテン使用）";
        sleep = "現地の就寝時刻に合わせて就寝";
        meals = "現地の朝食・昼食・夕食時刻を守る";
        tips = "到着日。西向きは比較的楽だが睡眠の質を優先";
      }
    } else if (phase === "adjustment") {
      const progress = Math.round((adjustedHours / absDiff) * 100);
      if (isEastward) {
        lightExposure = `午前中の光を ${Math.min(30 + i * 10, 60)}分浴びる`;
        avoidLight = "夜21時以降はスマホ・PC画面を暗くする";
        sleep = `${remaining.toFixed(1)}時間分の時差が残っています`;
        meals = "3食の時刻を現地時間で固定する";
        tips = `調整${progress}%完了。カフェインは到着後14:00まで`;
      } else {
        lightExposure = `午後〜夕方の光を ${Math.min(30 + i * 10, 60)}分浴びる`;
        avoidLight = "朝7時前の光は遮断";
        sleep = `${remaining.toFixed(1)}時間分の時差が残っています`;
        meals = "現地の食事リズムを維持";
        tips = `調整${progress}%完了。短い昼寝（20分）はOK`;
      }
    } else {
      lightExposure = "通常の生活リズムでOK";
      avoidLight = "特別な制限なし";
      sleep = "現地時刻で通常就寝";
      meals = "通常の食事時刻";
      tips = "時差ボケ解消完了！通常の生活に戻れます";
    }

    plans.push({
      day: i + 1,
      label: i === 0 ? `出発日 (${dateStr})` : i === 1 ? `到着日 (${dateStr})` : `${dateStr} (${i}日目)`,
      lightExposure,
      avoidLight,
      sleep,
      meals,
      tips,
      phase,
    });
  }

  return plans;
}

const phaseColors: Record<DayPlan["phase"], string> = {
  preparation: "bg-blue-50 border-blue-200",
  arrival: "bg-orange-50 border-orange-200",
  adjustment: "bg-yellow-50 border-yellow-200",
  normalized: "bg-green-50 border-green-200",
};

const phaseLabels: Record<DayPlan["phase"], string> = {
  preparation: "準備",
  arrival: "到着",
  adjustment: "調整中",
  normalized: "回復完了",
};

const phaseBadge: Record<DayPlan["phase"], string> = {
  preparation: "bg-blue-100 text-blue-700",
  arrival: "bg-orange-100 text-orange-700",
  adjustment: "bg-yellow-100 text-yellow-700",
  normalized: "bg-green-100 text-green-700",
};

export default function JetlagCalculator() {
  const [fromTz, setFromTz] = useState("9");
  const [toTz, setToTz] = useState("-5");
  const [departureDate, setDepartureDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [plans, setPlans] = useState<DayPlan[]>([]);
  const [calculated, setCalculated] = useState(false);

  const fromOffset = parseFloat(fromTz);
  const toOffset = parseFloat(toTz);
  const diff = toOffset - fromOffset;
  const absDiff = Math.abs(diff);

  const handleCalc = () => {
    const result = generateSchedule(fromOffset, toOffset, departureDate);
    setPlans(result);
    setCalculated(true);
  };

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">旅程の入力</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出発地のタイムゾーン
            </label>
            <select
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={`from-${tz.city}`} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              到着地のタイムゾーン
            </label>
            <select
              value={toTz}
              onChange={(e) => setToTz(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={`to-${tz.city}`} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出発日
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Summary */}
        {absDiff > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full">
              時差：{absDiff}時間
            </span>
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full">
              方向：{diff > 0 ? "東向き（時計を進める）" : "西向き（時計を遅らせる）"}
            </span>
            <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-sm px-3 py-1 rounded-full">
              調整目安：{Math.ceil(absDiff / 1.5)}〜{Math.ceil(absDiff)}日
            </span>
          </div>
        )}

        <button
          onClick={handleCalc}
          disabled={absDiff === 0}
          className="mt-4 w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          調整スケジュールを生成
        </button>
      </div>

      {/* Tips box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">時差ボケ解消の3大原則</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>光：体内時計のリセットには光刺激が最も効果的</li>
          <li>食事：胃腸時計は食事時刻で独立してリセットされる</li>
          <li>睡眠：眠くても現地時刻の就寝時間まで耐える</li>
        </ul>
      </div>

      {/* Schedule */}
      {calculated && plans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">調整スケジュール</h2>
          {plans.map((plan) => (
            <div
              key={plan.day}
              className={`border rounded-xl p-5 ${phaseColors[plan.phase]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{plan.label}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${phaseBadge[plan.phase]}`}>
                  {phaseLabels[plan.phase]}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">☀</span>
                  <div>
                    <p className="font-medium text-gray-700">光を浴びる</p>
                    <p className="text-gray-600">{plan.lightExposure}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">🌙</span>
                  <div>
                    <p className="font-medium text-gray-700">光を避ける</p>
                    <p className="text-gray-600">{plan.avoidLight}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">💤</span>
                  <div>
                    <p className="font-medium text-gray-700">睡眠</p>
                    <p className="text-gray-600">{plan.sleep}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">🍽</span>
                  <div>
                    <p className="font-medium text-gray-700">食事</p>
                    <p className="text-gray-600">{plan.meals}</p>
                  </div>
                </div>
              </div>
              {plan.tips && (
                <div className="mt-3 text-xs text-gray-500 bg-white/60 rounded-lg px-3 py-2">
                  {plan.tips}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この時差ボケ調整計画ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">出発地・到着地の時差から体内時計の調整スケジュールを計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この時差ボケ調整計画ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "出発地・到着地の時差から体内時計の調整スケジュールを計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
