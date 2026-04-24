"use client";

import { useState, useMemo } from "react";

// --- Ebbinghaus forgetting curve model ---
// R(t) = e^(-t/S) where S = stability factor
// With each review, stability roughly doubles

interface ReviewSession {
  day: number;
  retention: number;
  label: string;
}

function retentionAt(daysSinceLearn: number, stability: number): number {
  return Math.exp(-daysSinceLearn / stability) * 100;
}

// Standard Ebbinghaus review intervals (days after initial learning)
const STANDARD_INTERVALS = [1, 3, 7, 14, 30, 90];

// Stability multiplier per review
const STABILITY_MULTIPLIER = 2.2;

function generateSchedule(learnDate: Date, totalDays: number): ReviewSession[] {
  let stability = 1.5; // initial stability in days
  const sessions: ReviewSession[] = [];

  for (let i = 0; i < STANDARD_INTERVALS.length; i++) {
    const interval = STANDARD_INTERVALS[i];
    if (interval > totalDays) break;

    const reviewDate = new Date(learnDate);
    reviewDate.setDate(reviewDate.getDate() + interval);

    // Retention at review time
    const retention = retentionAt(interval, stability);
    stability *= STABILITY_MULTIPLIER;

    sessions.push({
      day: interval,
      retention: Math.min(retention, 100),
      label: `第${i + 1}回`,
    });
  }
  return sessions;
}

function formatDate(base: Date, daysOffset: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + daysOffset);
  return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
}

function getDayLabel(days: number): string {
  if (days === 0) return "学習当日";
  if (days === 1) return "翌日";
  return `${days}日後`;
}

// --- Curve data for SVG chart ---
function buildCurvePoints(stability: number, maxDay: number, width: number, height: number): string {
  const pts: string[] = [];
  for (let d = 0; d <= maxDay; d += 0.5) {
    const r = retentionAt(d, stability);
    const x = (d / maxDay) * width;
    const y = height - (r / 100) * height;
    pts.push(`${x},${y}`);
  }
  return pts.join(" ");
}

const RETENTION_COLORS = (r: number) => {
  if (r >= 70) return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" };
  if (r >= 40) return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" };
  return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
};

export default function EbbinghausCurve() {
  const [learnDateStr, setLearnDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [topic, setTopic] = useState("");
  const [generated, setGenerated] = useState(false);

  const learnDate = useMemo(() => new Date(learnDateStr + "T00:00:00"), [learnDateStr]);
  const schedule = useMemo(() => generateSchedule(learnDate, 120), [learnDate]);

  // Build curve segments between reviews
  const chartW = 500;
  const chartH = 160;
  const maxDay = 92;

  const curveSegments = useMemo(() => {
    const segments: { points: string; color: string }[] = [];
    let stability = 1.5;
    const reviewDays = [0, ...STANDARD_INTERVALS.filter((d) => d <= maxDay)];

    for (let i = 0; i < reviewDays.length - 1; i++) {
      const startDay = reviewDays[i];
      const endDay = reviewDays[i + 1];
      const pts: string[] = [];
      for (let d = startDay; d <= endDay; d += 0.5) {
        const r = retentionAt(d - startDay, stability);
        const x = (d / maxDay) * chartW;
        const y = chartH - (r / 100) * chartH;
        pts.push(`${x},${y}`);
      }
      const startR = retentionAt(0, stability);
      const colors = RETENTION_COLORS(startR);
      segments.push({ points: pts.join(" "), color: colors.text.replace("text-", "stroke-") });
      stability *= STABILITY_MULTIPLIER;
    }
    return segments;
  }, []);

  const reviewDayXPositions = STANDARD_INTERVALS.filter((d) => d <= maxDay).map(
    (d) => (d / maxDay) * chartW
  );

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">学習情報を入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">学習日</label>
            <input
              type="date"
              value={learnDateStr}
              onChange={(e) => setLearnDateStr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">学習内容（任意）</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例: 英単語 Unit 5、歴史の年号..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>
        <button
          onClick={() => setGenerated(true)}
          className="mt-4 w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
        >
          復習スケジュールを生成
        </button>
      </div>

      {/* Forgetting curve chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">エビングハウス忘却曲線</h2>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartW + 40} ${chartH + 40}`} className="w-full max-w-full">
            {/* Grid */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = chartH - (pct / 100) * chartH;
              return (
                <g key={pct}>
                  <line x1={30} y1={y} x2={chartW + 30} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                  <text x={26} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{pct}%</text>
                </g>
              );
            })}

            {/* Curve segments */}
            <g transform="translate(30, 0)">
              {curveSegments.map((seg, i) => (
                <polyline
                  key={i}
                  points={seg.points}
                  fill="none"
                  className={seg.color}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Review markers */}
              {reviewDayXPositions.map((x, i) => (
                <g key={i}>
                  <line x1={x} y1={0} x2={x} y2={chartH} stroke="#6366f1" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                  <circle cx={x} cy={chartH - ((retentionAt(0, 1.5 * Math.pow(STABILITY_MULTIPLIER, i))) / 100) * chartH} r="4" fill="#6366f1" />
                  <text x={x} y={chartH + 20} textAnchor="middle" fontSize="9" fill="#6366f1">
                    {getDayLabel(STANDARD_INTERVALS[i])}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        <p className="text-xs text-gray-400 mt-2">各復習後に記憶の安定度が高まり、忘却が緩やかになります。</p>
      </div>

      {/* Schedule */}
      {generated && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            復習スケジュール
            {topic && <span className="ml-2 text-gray-400">— {topic}</span>}
          </h2>
          <div className="space-y-3">
            {/* Learning day */}
            <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                0
              </div>
              <div className="flex-1">
                <div className="font-semibold text-indigo-800">初回学習</div>
                <div className="text-xs text-indigo-600">{formatDate(learnDate, 0)} — 今日</div>
              </div>
              <div className="text-sm font-bold text-indigo-600">100%</div>
            </div>

            {schedule.map((s, i) => {
              const { bg, text, border } = RETENTION_COLORS(s.retention);
              return (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border ${bg} ${border}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white ${
                    s.retention >= 70 ? "bg-green-500" : s.retention >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${text}`}>{s.label} 復習</div>
                    <div className={`text-xs ${text} opacity-80`}>
                      {formatDate(learnDate, s.day)} ({getDayLabel(s.day)})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${text}`}>{s.retention.toFixed(0)}%</div>
                    <div className={`text-xs ${text} opacity-70`}>残存率</div>
                  </div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この忘却曲線 復習計画ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">エビングハウスの忘却曲線に基づく最適な復習スケジュールを自動生成。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この忘却曲線 復習計画ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "エビングハウスの忘却曲線に基づく最適な復習スケジュールを自動生成。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="mt-5 p-4 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
            <div className="font-semibold text-gray-700 mb-2">効果を高めるコツ</div>
            <div>• 復習前に自力で思い出そうとする（アクティブリコール）</div>
            <div>• 思い出せなかった項目は次の復習で優先する</div>
            <div>• フラッシュカードや問題演習を活用すると効果的</div>
          </div>
        </div>
      )}
    </div>
  );
}
