"use client";
import { useState } from "react";

const VISA_TYPES = [
  { id: "tourist-90", label: "観光ビザ（90日間有効）", maxDays: 90 },
  { id: "tourist-60", label: "観光ビザ（60日間有効）", maxDays: 60 },
  { id: "tourist-30", label: "観光ビザ（30日間有効）", maxDays: 30 },
  { id: "schengen", label: "シェンゲンビザ（90/180日ルール）", maxDays: 90, schengen: true },
  { id: "working-holiday", label: "ワーキングホリデービザ（1年）", maxDays: 365 },
  { id: "student", label: "学生ビザ（指定期間）", maxDays: 180 },
  { id: "business-90", label: "ビジネスビザ（90日）", maxDays: 90 },
  { id: "evisa-30", label: "電子ビザ（30日）", maxDays: 30 },
];

interface Stay {
  id: number;
  entry: string;
  exit: string;
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function daysInLast180(stays: Stay[], today: string): number {
  const todayDate = new Date(today);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 179);

  let total = 0;
  for (const stay of stays) {
    if (!stay.entry || !stay.exit) continue;
    const entry = new Date(stay.entry);
    const exit = new Date(stay.exit);
    const start = entry < windowStart ? windowStart : entry;
    const end = exit > todayDate ? todayDate : exit;
    if (start <= end) {
      total += Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
  }
  return total;
}

export default function VisaDurationCheck() {
  const [visaType, setVisaType] = useState("tourist-90");
  const [visaStart, setVisaStart] = useState("");
  const [stays, setStays] = useState<Stay[]>([{ id: 1, entry: "", exit: "" }]);
  const today = new Date().toISOString().split("T")[0];

  const selectedVisa = VISA_TYPES.find((v) => v.id === visaType)!;

  const addStay = () => {
    setStays([...stays, { id: Date.now(), entry: "", exit: "" }]);
  };

  const removeStay = (id: number) => {
    setStays(stays.filter((s) => s.id !== id));
  };

  const updateStay = (id: number, field: "entry" | "exit", value: string) => {
    setStays(stays.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const validStays = stays.filter((s) => s.entry && s.exit && s.exit >= s.entry);

  const totalStayDays = validStays.reduce(
    (sum, s) => sum + daysBetween(s.entry, s.exit),
    0
  );

  const isSchengen = selectedVisa.schengen;
  const schengenDays = isSchengen ? daysInLast180(validStays, today) : 0;

  const usedDays = isSchengen ? schengenDays : totalStayDays;
  const maxDays = selectedVisa.maxDays;
  const remainingDays = Math.max(0, maxDays - usedDays);
  const overDays = Math.max(0, usedDays - maxDays);
  const pct = Math.min(100, (usedDays / maxDays) * 100);

  const visaExpiry =
    visaStart
      ? (() => {
          const d = new Date(visaStart);
          d.setDate(d.getDate() + maxDays - 1);
          return d.toISOString().split("T")[0];
        })()
      : null;

  const barColor =
    pct >= 100
      ? "bg-red-500"
      : pct >= 80
      ? "bg-orange-500"
      : "bg-green-500";

  return (
    <div className="space-y-6">
      {/* Visa Type */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ビザ種別の選択</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {VISA_TYPES.map((v) => (
            <label
              key={v.id}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                visaType === v.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="visaType"
                value={v.id}
                checked={visaType === v.id}
                onChange={() => setVisaType(v.id)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">{v.label}</span>
            </label>
          ))}
        </div>

        {isSchengen && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <strong>シェンゲン90/180日ルール：</strong>過去180日以内に90日以内の滞在が上限。複数の渡航歴を入力してください。
          </div>
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ビザ発行日（任意）
          </label>
          <input
            type="date"
            value={visaStart}
            onChange={(e) => setVisaStart(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {visaExpiry && (
            <span className="ml-3 text-sm text-gray-600">
              有効期限：<strong>{visaExpiry}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Stay Periods */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">滞在期間の入力</h2>
        <div className="space-y-3">
          {stays.map((stay, idx) => (
            <div key={stay.id} className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-500 w-16">
                {idx + 1}回目
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">入国</label>
                <input
                  type="date"
                  value={stay.entry}
                  onChange={(e) => updateStay(stay.id, "entry", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">出国</label>
                <input
                  type="date"
                  value={stay.exit}
                  onChange={(e) => updateStay(stay.id, "exit", e.target.value)}
                  min={stay.entry}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {stay.entry && stay.exit && stay.exit >= stay.entry && (
                <span className="text-sm text-indigo-600 font-medium">
                  {daysBetween(stay.entry, stay.exit)}日
                </span>
              )}
              {stays.length > 1 && (
                <button
                  onClick={() => removeStay(stay.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addStay}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + 滞在期間を追加
        </button>
      </div>

      {/* Results */}
      {validStays.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">計算結果</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{usedDays}</p>
              <p className="text-xs text-gray-500 mt-1">
                {isSchengen ? "過去180日の滞在日数" : "累計滞在日数"}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{maxDays}</p>
              <p className="text-xs text-gray-500 mt-1">上限日数</p>
            </div>
            <div className={`text-center p-4 rounded-xl ${overDays > 0 ? "bg-red-50" : "bg-green-50"}`}>
              <p className={`text-3xl font-bold ${overDays > 0 ? "text-red-600" : "text-green-600"}`}>
                {overDays > 0 ? `-${overDays}` : remainingDays}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {overDays > 0 ? "超過日数" : "残り日数"}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{pct.toFixed(0)}%</p>
              <p className="text-xs text-gray-500 mt-1">使用率</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0日</span>
              <span>{maxDays}日（上限）</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {overDays > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
              <strong>警告：</strong>ビザ滞在期間を{overDays}日超過しています。不法滞在となり入国拒否・罰金のリスクがあります。
            </div>
          )}
          {remainingDays <= 7 && overDays === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
              <strong>注意：</strong>残り{remainingDays}日です。ビザ延長または出国の準備をしてください。
            </div>
          )}
          {remainingDays > 7 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              あと<strong>{remainingDays}日</strong>滞在可能です。
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        ※本ツールは参考情報です。実際のビザ条件は各国大使館・入国管理局でご確認ください。
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このビザ滞在日数計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">入国日・出国日からビザ滞在日数と残日数を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このビザ滞在日数計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "入国日・出国日からビザ滞在日数と残日数を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ビザ滞在日数計算",
  "description": "入国日・出国日からビザ滞在日数と残日数を計算",
  "url": "https://tools.loresync.dev/visa-duration-check",
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
