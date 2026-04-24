"use client";

import { useState, useCallback } from "react";

interface NPSResult {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoterPct: number;
  passivePct: number;
  detractorPct: number;
  nps: number;
  distribution: number[];
}

function npsCategory(score: number): { label: string; color: string; bg: string } {
  if (score >= 70) return { label: "Excellent（最優秀）", color: "text-green-700", bg: "bg-green-100 border-green-300" };
  if (score >= 50) return { label: "Excellent（優秀）", color: "text-green-600", bg: "bg-green-50 border-green-200" };
  if (score >= 30) return { label: "Great（良好）", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
  if (score >= 0) return { label: "Good（普通）", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" };
  return { label: "Needs Improvement（要改善）", color: "text-red-600", bg: "bg-red-50 border-red-200" };
}

export default function NpsScore() {
  const [counts, setCounts] = useState<string[]>(Array(11).fill(""));
  const [result, setResult] = useState<NPSResult | null>(null);
  const [error, setError] = useState("");

  const updateCount = (index: number, val: string) => {
    setCounts((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const calculate = useCallback(() => {
    setError("");
    const parsed = counts.map((c) => (c === "" ? 0 : parseInt(c)));
    if (parsed.some((v) => isNaN(v) || v < 0)) {
      setError("各スコアの回答数は0以上の整数を入力してください。");
      return;
    }
    const total = parsed.reduce((s, v) => s + v, 0);
    if (total === 0) {
      setError("少なくとも1件の回答を入力してください。");
      return;
    }

    // 0-6: Detractors, 7-8: Passives, 9-10: Promoters
    const detractors = parsed.slice(0, 7).reduce((s, v) => s + v, 0);
    const passives = parsed.slice(7, 9).reduce((s, v) => s + v, 0);
    const promoters = parsed.slice(9, 11).reduce((s, v) => s + v, 0);

    const promoterPct = (promoters / total) * 100;
    const passivePct = (passives / total) * 100;
    const detractorPct = (detractors / total) * 100;
    const nps = promoterPct - detractorPct;

    setResult({ total, promoters, passives, detractors, promoterPct, passivePct, detractorPct, nps, distribution: parsed });
  }, [counts]);

  const reset = () => {
    setCounts(Array(11).fill(""));
    setResult(null);
    setError("");
  };

  const loadSample = () => {
    setCounts(["2", "1", "3", "4", "5", "8", "12", "15", "20", "18", "12"]);
    setResult(null);
  };

  const scoreColors = [
    "bg-red-500", "bg-red-500", "bg-red-400", "bg-red-400", "bg-orange-400",
    "bg-orange-400", "bg-yellow-400", "bg-yellow-300", "bg-yellow-300",
    "bg-green-400", "bg-green-500",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">回答数を入力（0〜10点）</h2>
          <button onClick={loadSample} className="text-sm text-blue-600 hover:text-blue-800">
            サンプルデータ
          </button>
        </div>

        <div className="grid grid-cols-11 gap-1 mb-2">
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-600">{i}</div>
          ))}
        </div>
        <div className="grid grid-cols-11 gap-1 mb-3">
          {Array.from({ length: 11 }, (_, i) => (
            <div key={i} className={`h-2 rounded-full ${scoreColors[i]}`} />
          ))}
        </div>
        <div className="grid grid-cols-11 gap-1 mb-3">
          {counts.map((c, i) => (
            <input
              key={i}
              type="number"
              value={c}
              onChange={(e) => updateCount(i, e.target.value)}
              min="0"
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-1 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <div className="flex gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />批判者 (0〜6)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-300 inline-block" />中立者 (7〜8)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" />推奨者 (9〜10)</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button onClick={calculate} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            NPSを計算
          </button>
          <button onClick={reset} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            リセット
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* NPS Score */}
          <div className={`rounded-2xl border-2 p-6 text-center ${npsCategory(result.nps).bg}`}>
            <div className="text-sm font-medium text-gray-600 mb-1">NPSスコア</div>
            <div className={`text-6xl font-bold mb-2 ${npsCategory(result.nps).color}`}>
              {result.nps > 0 ? "+" : ""}{result.nps.toFixed(1)}
            </div>
            <div className={`text-sm font-medium ${npsCategory(result.nps).color}`}>
              {npsCategory(result.nps).label}
            </div>
            <div className="text-xs text-gray-500 mt-1">総回答数: {result.total}件</div>
          </div>

          {/* Distribution */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "推奨者", count: result.promoters, pct: result.promoterPct, color: "green", range: "9〜10点" },
              { label: "中立者", count: result.passives, pct: result.passivePct, color: "yellow", range: "7〜8点" },
              { label: "批判者", count: result.detractors, pct: result.detractorPct, color: "red", range: "0〜6点" },
            ].map(({ label, count, pct, color, range }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">{label} ({range})</div>
                <div className={`text-2xl font-bold text-${color}-600`}>{pct.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">{count}件</div>
                <div className={`mt-2 h-2 bg-${color}-100 rounded-full overflow-hidden`}>
                  <div className={`h-full bg-${color}-400 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Full distribution bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">スコア分布</h2>
            <div className="space-y-2">
              {result.distribution.map((count, i) => {
                const pct = result.total > 0 ? (count / result.total) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 text-sm text-gray-600 text-right">{i}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreColors[i]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">{count}件 ({pct.toFixed(1)}%)</div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このNPS スコア計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">アンケート結果からNPSスコアと推奨者・中立者・批判者の分布を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このNPS スコア計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "アンケート結果からNPSスコアと推奨者・中立者・批判者の分布を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
            <h3 className="font-semibold text-blue-800 mb-2">計算式</h3>
            <p className="text-blue-700 text-sm font-mono">NPS = 推奨者(%) − 批判者(%)</p>
            <p className="text-blue-600 text-sm mt-2">
              = {result.promoterPct.toFixed(1)}% − {result.detractorPct.toFixed(1)}% = <strong>{result.nps > 0 ? "+" : ""}{result.nps.toFixed(1)}</strong>
            </p>
            <p className="text-blue-500 text-xs mt-2">スコア範囲: −100〜+100。50以上が優秀、70以上が最優秀とされる。</p>
          </div>
        </>
      )}
    </div>
  );
}
