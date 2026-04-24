"use client";
import { useState, useMemo } from "react";

interface Match {
  id: string;
  opponentUtr: number;
  myGames: number;
  opponentGames: number;
  sets: number;
  date: string;
  surface: "hard" | "clay" | "grass" | "indoor";
}

const SURFACE_LABELS: Record<string, string> = { hard: "ハード", clay: "クレー", grass: "グラス", indoor: "室内" };

function calcMatchScore(myGames: number, opponentGames: number, sets: number): number {
  const totalGames = myGames + opponentGames;
  if (totalGames === 0) return 0;
  const gameWinPct = myGames / totalGames;
  // UTR uses game win ratio as key signal
  return gameWinPct;
}

function estimateUtrDelta(match: Match, myCurrentUtr: number): number {
  const gameWinPct = calcMatchScore(match.myGames, match.opponentGames, match.sets);
  const expectedWinPct = 1 / (1 + Math.pow(10, (match.opponentUtr - myCurrentUtr) / 4));
  const performance = gameWinPct - expectedWinPct;
  // Scale: 1 UTR point = meaningful difference
  return performance * 2;
}

const DEFAULT_MATCHES: Match[] = [
  { id: "1", opponentUtr: 8.5, myGames: 12, opponentGames: 8, sets: 2, date: "2024-03-01", surface: "hard" },
  { id: "2", opponentUtr: 9.0, myGames: 6, opponentGames: 12, sets: 2, date: "2024-03-10", surface: "clay" },
  { id: "3", opponentUtr: 7.8, myGames: 16, opponentGames: 10, sets: 3, date: "2024-03-20", surface: "hard" },
];

export default function TennisUtrCalculator() {
  const [matches, setMatches] = useState<Match[]>(DEFAULT_MATCHES);
  const [baseUtr, setBaseUtr] = useState(8.0);
  const [newMatch, setNewMatch] = useState<Omit<Match, "id">>({
    opponentUtr: 8.0, myGames: 6, opponentGames: 6, sets: 2, date: new Date().toISOString().split("T")[0], surface: "hard",
  });

  const analysis = useMemo(() => {
    if (matches.length === 0) return null;
    const sorted = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = sorted.slice(0, 12);
    // Weight by recency (newer = higher weight)
    const totalWeight = recent.reduce((s, _, i) => s + (12 - i), 0);
    const weightedDelta = recent.reduce((s, m, i) => {
      const delta = estimateUtrDelta(m, baseUtr);
      return s + delta * (12 - i);
    }, 0);
    const estimatedUtr = Math.max(1, Math.min(16.5, baseUtr + weightedDelta / totalWeight));

    const wins = matches.filter((m) => m.myGames > m.opponentGames).length;
    const losses = matches.length - wins;
    const avgOpponentUtr = matches.reduce((s, m) => s + m.opponentUtr, 0) / matches.length;
    const avgGameWinPct = matches.reduce((s, m) => s + m.myGames / (m.myGames + m.opponentGames), 0) / matches.length;

    return { estimatedUtr, wins, losses, avgOpponentUtr, avgGameWinPct, recentCount: recent.length };
  }, [matches, baseUtr]);

  const addMatch = () => {
    setMatches((prev) => [...prev, { ...newMatch, id: String(Date.now()) }]);
  };

  const removeMatch = (id: string) => setMatches((prev) => prev.filter((m) => m.id !== id));

  const getUtrCategory = (utr: number) => {
    if (utr >= 14) return "プロ";
    if (utr >= 12) return "上位プロ候補";
    if (utr >= 10) return "大学トップ";
    if (utr >= 8) return "競技上級";
    if (utr >= 6) return "競技中級";
    if (utr >= 4) return "競技入門";
    return "レクリエーション";
  };

  const getUtrColor = (utr: number) => {
    if (utr >= 12) return "text-purple-700";
    if (utr >= 10) return "text-blue-700";
    if (utr >= 8) return "text-green-700";
    if (utr >= 6) return "text-yellow-700";
    return "text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Base UTR input */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">現在のUTR（既知の場合）</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input type="range" min={1} max={16.5} step={0.1} value={baseUtr}
              onChange={(e) => setBaseUtr(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1.0</span><span>16.5</span></div>
          </div>
          <div className="text-center min-w-[80px]">
            <input type="number" step="0.1" min={1} max={16.5} value={baseUtr}
              onChange={(e) => setBaseUtr(Number(e.target.value))}
              className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-center text-lg font-bold" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">UTRが不明な場合は推定値が計算されます</p>
      </div>

      {/* Estimated UTR */}
      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-6 text-center sm:col-span-2">
            <p className="text-sm text-gray-500 mb-1">推定 UTR</p>
            <p className={`text-6xl font-bold ${getUtrColor(analysis.estimatedUtr)}`}>{analysis.estimatedUtr.toFixed(1)}</p>
            <p className="text-gray-500 mt-2 text-sm">{getUtrCategory(analysis.estimatedUtr)}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${(analysis.estimatedUtr / 16.5) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1.0</span><span>16.5</span></div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">勝敗</span><span className="font-bold text-gray-900">{analysis.wins}勝 {analysis.losses}敗</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">勝率</span><span className="font-bold text-gray-900">{(analysis.wins / matches.length * 100).toFixed(0)}%</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">平均ゲーム勝率</span><span className="font-bold text-gray-900">{(analysis.avgGameWinPct * 100).toFixed(1)}%</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">平均相手UTR</span><span className="font-bold text-gray-900">{analysis.avgOpponentUtr.toFixed(1)}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">使用試合数</span><span className="font-bold text-gray-900">{analysis.recentCount}</span></div>
          </div>
        </div>
      )}

      {/* Add match */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">試合を追加</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">相手UTR</label>
            <input type="number" step="0.1" min={1} max={16.5} value={newMatch.opponentUtr}
              onChange={(e) => setNewMatch({ ...newMatch, opponentUtr: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">自分のゲーム数</label>
            <input type="number" min={0} value={newMatch.myGames}
              onChange={(e) => setNewMatch({ ...newMatch, myGames: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">相手のゲーム数</label>
            <input type="number" min={0} value={newMatch.opponentGames}
              onChange={(e) => setNewMatch({ ...newMatch, opponentGames: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">セット数</label>
            <select value={newMatch.sets} onChange={(e) => setNewMatch({ ...newMatch, sets: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value={2}>2セット</option>
              <option value={3}>3セット</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">サーフェス</label>
            <select value={newMatch.surface} onChange={(e) => setNewMatch({ ...newMatch, surface: e.target.value as Match["surface"] })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {Object.entries(SURFACE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">日付</label>
            <input type="date" value={newMatch.date} onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <button onClick={addMatch} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
          試合を追加
        </button>
      </div>

      {/* Match history */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">試合履歴</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">日付</th>
                <th className="px-4 py-3 text-center text-gray-600">相手UTR</th>
                <th className="px-4 py-3 text-center text-gray-600">スコア</th>
                <th className="px-4 py-3 text-center text-gray-600">ゲーム勝率</th>
                <th className="px-4 py-3 text-center text-gray-600">サーフェス</th>
                <th className="px-4 py-3 text-center text-gray-600">結果</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {[...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((m) => {
                const win = m.myGames > m.opponentGames;
                const gwp = (m.myGames / (m.myGames + m.opponentGames) * 100).toFixed(0);
                return (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{m.date}</td>
                    <td className="px-4 py-2 text-center font-medium text-gray-800">{m.opponentUtr.toFixed(1)}</td>
                    <td className="px-4 py-2 text-center font-mono text-gray-900">{m.myGames}-{m.opponentGames}</td>
                    <td className="px-4 py-2 text-center text-gray-700">{gwp}%</td>
                    <td className="px-4 py-2 text-center text-gray-600">{SURFACE_LABELS[m.surface]}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${win ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {win ? "勝" : "負"}
                      </span>
                    </td>
                    <td className="px-2 py-2"><button onClick={() => removeMatch(m.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800">
        <p className="font-semibold mb-1">UTR推定について</p>
        <p>UTR（Universal Tennis Rating）は試合のゲーム獲得率と相手レーティングに基づく計算です。本ツールの値は参考推定値であり、公式UTRとは異なる場合があります。公式レーティングはUniversalTennis.comで確認してください。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このテニス UTR換算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">テニスの試合結果（スコア・相手UTR）から自分のUTRレーティングを推定。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このテニス UTR換算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "テニスの試合結果（スコア・相手UTR）から自分のUTRレーティングを推定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
