"use client";

import { useState, useCallback } from "react";

interface EloResult {
  currentRating: number;
  winRate: number;
  expectedWinRate: number;
  kFactor: number;
  gamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  ratingChange: number;
  newRating: number;
  performanceRating: number;
}

function expectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

function performanceRating(winRate: number, opponentAvg: number): number {
  if (winRate >= 1) return opponentAvg + 800;
  if (winRate <= 0) return opponentAvg - 800;
  // Performance rating = opponent average + 400 * log10(W/L)
  const w = winRate;
  const l = 1 - w;
  return opponentAvg + 400 * Math.log10(w / l);
}

const K_PRESETS = [
  { label: "K=10（上級者・マスター）", value: 10 },
  { label: "K=20（中級者・標準）", value: 20 },
  { label: "K=32（初心者・急成長）", value: 32 },
  { label: "K=40（超初心者）", value: 40 },
];

export default function WinRateRating() {
  const [rating, setRating] = useState("1500");
  const [opponentRating, setOpponentRating] = useState("1500");
  const [kFactor, setKFactor] = useState("20");
  const [games, setGames] = useState("100");
  const [winRate, setWinRate] = useState("55");
  const [result, setResult] = useState<EloResult | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    setError("");
    const ratingVal = parseFloat(rating);
    const oppVal = parseFloat(opponentRating);
    const kVal = parseFloat(kFactor);
    const gamesVal = parseInt(games);
    const wrVal = parseFloat(winRate) / 100;

    if (isNaN(ratingVal) || ratingVal < 0) { setError("現在のレートを入力してください。"); return; }
    if (isNaN(oppVal) || oppVal < 0) { setError("対戦相手の平均レートを入力してください。"); return; }
    if (isNaN(kVal) || kVal <= 0) { setError("K係数を正の値で入力してください。"); return; }
    if (isNaN(gamesVal) || gamesVal < 1) { setError("対戦数は1以上を入力してください。"); return; }
    if (isNaN(wrVal) || wrVal < 0 || wrVal > 1) { setError("勝率は0〜100%を入力してください。"); return; }

    const expWinRate = expectedScore(ratingVal, oppVal);
    const wins = Math.round(gamesVal * wrVal);
    const losses = gamesVal - wins;

    // Total Elo change over N games
    // Each game: Δ = K * (actual - expected)
    // Win: actual = 1, Loss: actual = 0
    const ratingChange = kVal * (wins * (1 - expWinRate) + losses * (0 - expWinRate));
    const newRating = ratingVal + ratingChange;
    const perfRating = performanceRating(wrVal, oppVal);

    setResult({
      currentRating: ratingVal,
      winRate: wrVal,
      expectedWinRate: expWinRate,
      kFactor: kVal,
      gamesPlayed: gamesVal,
      totalWins: wins,
      totalLosses: losses,
      ratingChange,
      newRating,
      performanceRating: perfRating,
    });
  }, [rating, opponentRating, kFactor, games, winRate]);

  // Simulate rating curve
  const simulationPoints = result
    ? Array.from({ length: 11 }, (_, i) => {
        const wr = i * 10;
        const w = Math.round(result.gamesPlayed * (wr / 100));
        const l = result.gamesPlayed - w;
        const rc = result.kFactor * (w * (1 - result.expectedWinRate) + l * (0 - result.expectedWinRate));
        return { wr, newRating: result.currentRating + rc };
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">パラメータ入力</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {[
            { label: "現在のレート", val: rating, set: setRating, placeholder: "例: 1500" },
            { label: "対戦相手の平均レート", val: opponentRating, set: setOpponentRating, placeholder: "例: 1500" },
            { label: "対戦数", val: games, set: setGames, placeholder: "例: 100" },
            { label: "勝率 (%)", val: winRate, set: setWinRate, placeholder: "例: 55" },
          ].map(({ label, val, set, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">K係数（レート変動幅）</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {K_PRESETS.map((p) => (
              <button key={p.value} onClick={() => setKFactor(String(p.value))}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${kFactor === String(p.value) ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <input type="number" value={kFactor} onChange={(e) => setKFactor(e.target.value)} placeholder="例: 20"
            className="w-32 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <button onClick={calculate} className="mt-5 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors">
          計算する
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "現在レート", val: Math.round(result.currentRating).toLocaleString(), color: "gray" },
              { label: "予測新レート", val: Math.round(result.newRating).toLocaleString(), color: result.ratingChange >= 0 ? "green" : "red" },
              { label: "レート変動", val: `${result.ratingChange >= 0 ? "+" : ""}${Math.round(result.ratingChange)}`, color: result.ratingChange >= 0 ? "green" : "red" },
              { label: "パフォーマンスレート", val: Math.round(result.performanceRating).toLocaleString(), color: "violet" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className={`text-2xl font-bold text-${color}-600`}>{val}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">詳細分析</h2>
            <div className="space-y-2 text-sm">
              {[
                { label: "実際の勝率", val: `${(result.winRate * 100).toFixed(1)}%` },
                { label: "Elo期待勝率（対戦相手比）", val: `${(result.expectedWinRate * 100).toFixed(1)}%` },
                { label: "勝率差（実績 − 期待）", val: `${((result.winRate - result.expectedWinRate) * 100) >= 0 ? "+" : ""}${((result.winRate - result.expectedWinRate) * 100).toFixed(1)}%` },
                { label: "総勝利数", val: `${result.totalWins}勝` },
                { label: "総敗北数", val: `${result.totalLosses}敗` },
                { label: "K係数", val: result.kFactor },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-800">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">勝率別レート予測（{result.gamesPlayed}戦）</h2>
            <div className="space-y-1">
              {simulationPoints.map(({ wr, newRating }) => {
                const change = newRating - result.currentRating;
                const isCurrentWr = Math.abs(wr - result.winRate * 100) < 6;
                return (
                  <div key={wr} className={`flex items-center gap-3 px-3 py-1.5 rounded-lg ${isCurrentWr ? "bg-violet-50 border border-violet-200" : ""}`}>
                    <div className="w-12 text-sm font-medium text-gray-700">{wr}%</div>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${change >= 0 ? "bg-green-400" : "bg-red-400"}`}
                        style={{ width: `${Math.min(100, Math.abs(change) / 5)}%`, marginLeft: change < 0 ? `${100 - Math.min(100, Math.abs(change) / 5)}%` : undefined }}
                      />
                    </div>
                    <div className={`w-24 text-sm font-medium text-right ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {change >= 0 ? "+" : ""}{Math.round(change)} ({Math.round(newRating)})
                    </div>
                    {isCurrentWr && <span className="text-xs text-violet-600 font-medium">← 現在</span>}
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この対戦ゲーム勝率 → レート予測ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">勝率・対戦数・現在レートからEloレート変動を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この対戦ゲーム勝率 → レート予測ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "勝率・対戦数・現在レートからEloレート変動を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
          </div>

          <div className="bg-violet-50 rounded-2xl border border-violet-200 p-5">
            <h3 className="font-semibold text-violet-800 mb-2">Eloレーティング計算式</h3>
            <div className="text-violet-700 text-sm space-y-1 font-mono">
              <div>E = 1 / (1 + 10^((Rb − Ra) / 400))</div>
              <div>ΔR = K × (W − E × n)</div>
            </div>
            <p className="text-violet-600 text-xs mt-2">E = 期待スコア、Ra = 自分のレート、Rb = 相手レート、W = 実際の勝利数、n = 対戦数</p>
          </div>
        </>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "対戦ゲーム勝率 → レート予測",
  "description": "勝率・対戦数・現在レートからEloレート変動を計算",
  "url": "https://tools.loresync.dev/win-rate-rating",
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
