"use client";
import { useState, useMemo } from "react";

interface Round {
  id: string;
  score: number;
  courseRating: number;
  slopeRating: number;
  date: string;
}

function calcDifferential(score: number, courseRating: number, slopeRating: number): number {
  return ((score - courseRating) * 113) / slopeRating;
}

const SAMPLE_ROUNDS: Round[] = [
  { id: "1", score: 95, courseRating: 71.5, slopeRating: 125, date: "2024-03-01" },
  { id: "2", score: 92, courseRating: 72.0, slopeRating: 130, date: "2024-03-08" },
  { id: "3", score: 98, courseRating: 70.5, slopeRating: 120, date: "2024-03-15" },
  { id: "4", score: 89, courseRating: 71.0, slopeRating: 128, date: "2024-03-22" },
  { id: "5", score: 93, courseRating: 72.5, slopeRating: 132, date: "2024-04-01" },
];

// USGA: use best N differentials from last 20 rounds
function countToUse(total: number): number {
  if (total <= 3) return 1;
  if (total <= 4) return 1;
  if (total <= 5) return 1;
  if (total <= 6) return 2;
  if (total <= 8) return 2;
  if (total <= 9) return 3;
  if (total <= 10) return 3;
  if (total <= 11) return 4;
  if (total <= 12) return 4;
  if (total <= 13) return 5;
  if (total <= 14) return 5;
  if (total <= 15) return 6;
  if (total <= 16) return 6;
  if (total <= 17) return 7;
  if (total <= 18) return 8;
  if (total <= 19) return 9;
  return 10;
}

export default function GolfHandicapCalculator() {
  const [rounds, setRounds] = useState<Round[]>(SAMPLE_ROUNDS);
  const [newScore, setNewScore] = useState(90);
  const [newCR, setNewCR] = useState(71.5);
  const [newSR, setNewSR] = useState(125);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  const differentials = useMemo(() =>
    rounds.map((r) => ({ ...r, diff: calcDifferential(r.score, r.courseRating, r.slopeRating) }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20),
    [rounds]
  );

  const handicapIndex = useMemo(() => {
    if (differentials.length < 3) return null;
    const n = countToUse(differentials.length);
    const sorted = [...differentials].sort((a, b) => a.diff - b.diff);
    const best = sorted.slice(0, n);
    const avg = best.reduce((s, r) => s + r.diff, 0) / n;
    return Math.min(avg * 0.96, 54);
  }, [differentials]);

  const courseHandicap = useMemo(() => {
    if (handicapIndex === null) return null;
    // Most recent course
    const last = differentials[0];
    if (!last) return null;
    return Math.round((handicapIndex * last.slopeRating) / 113 + (last.courseRating - 72));
  }, [handicapIndex, differentials]);

  const addRound = () => {
    const id = String(Date.now());
    setRounds((prev) => [...prev, { id, score: newScore, courseRating: newCR, slopeRating: newSR, date: newDate }]);
  };

  const removeRound = (id: string) => setRounds((prev) => prev.filter((r) => r.id !== id));

  const getHcpCategory = (hcp: number | null) => {
    if (hcp === null) return "";
    if (hcp <= 5) return "エキスパート";
    if (hcp <= 11.4) return "上級者";
    if (hcp <= 18.4) return "中級者";
    if (hcp <= 26.4) return "初中級者";
    return "初心者";
  };

  return (
    <div className="space-y-6">
      {/* Result */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-700 text-white rounded-2xl p-6 text-center shadow-lg sm:col-span-2">
          <p className="text-green-200 text-sm mb-1">ハンディキャップインデックス (USGA方式)</p>
          {handicapIndex !== null ? (
            <>
              <p className="text-6xl font-bold">{handicapIndex.toFixed(1)}</p>
              <p className="text-green-200 mt-2">{getHcpCategory(handicapIndex)}</p>
            </>
          ) : (
            <p className="text-2xl font-semibold text-green-200 mt-2">スコアを3ラウンド以上入力してください</p>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-1">コースハンディキャップ</p>
          <p className="text-4xl font-bold text-gray-900">{courseHandicap !== null ? courseHandicap : "—"}</p>
          <p className="text-xs text-gray-400 mt-2">直近ラウンドのコース基準</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">使用ラウンド数</p>
            <p className="text-lg font-semibold text-gray-800">{differentials.length > 0 ? `${countToUse(differentials.length)} / ${differentials.length}` : "—"}</p>
          </div>
        </div>
      </div>

      {/* Add round */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">ラウンドを追加</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">スコア</label>
            <input type="number" value={newScore} onChange={(e) => setNewScore(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">コースレーティング</label>
            <input type="number" step="0.1" value={newCR} onChange={(e) => setNewCR(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">スロープレーティング</label>
            <input type="number" value={newSR} onChange={(e) => setNewSR(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">日付</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={addRound} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
          ラウンドを追加
        </button>
      </div>

      {/* Rounds table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">スコア履歴 (最新20ラウンド)</h2>
          <span className="text-xs text-gray-500">{differentials.length} ラウンド</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">日付</th>
                <th className="px-4 py-3 text-right text-gray-600">スコア</th>
                <th className="px-4 py-3 text-right text-gray-600">CR</th>
                <th className="px-4 py-3 text-right text-gray-600">SR</th>
                <th className="px-4 py-3 text-right text-gray-600">差分</th>
                <th className="px-4 py-3 text-center text-gray-600">採用</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sorted = [...differentials].sort((a, b) => a.diff - b.diff);
                const n = countToUse(differentials.length);
                const usedIds = new Set(sorted.slice(0, n).map((r) => r.id));
                return differentials.map((r) => (
                  <tr key={r.id} className={`border-b border-gray-100 ${usedIds.has(r.id) ? "bg-green-50" : ""}`}>
                    <td className="px-4 py-2 text-gray-700">{r.date}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">{r.score}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{r.courseRating.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{r.slopeRating}</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-800">{r.diff.toFixed(1)}</td>
                    <td className="px-4 py-2 text-center">{usedIds.has(r.id) ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                    <td className="px-2 py-2"><button onClick={() => removeRound(r.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button></td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800">
        <p className="font-semibold mb-1">USGA計算方式</p>
        <p>ハンディキャップ差分 = (スコア − コースレーティング) × 113 ÷ スロープレーティング。直近20ラウンドから最良N件の平均 × 0.96。スロープ基準値は113。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このゴルフハンディキャップ計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">スコア履歴を入力してUSGA/JGA方式のハンディキャップインデックスを計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このゴルフハンディキャップ計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "スコア履歴を入力してUSGA/JGA方式のハンディキャップインデックスを計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ゴルフハンディキャップ計算",
  "description": "スコア履歴を入力してUSGA/JGA方式のハンディキャップインデックスを計算",
  "url": "https://tools.loresync.dev/golf-score-handicap",
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
