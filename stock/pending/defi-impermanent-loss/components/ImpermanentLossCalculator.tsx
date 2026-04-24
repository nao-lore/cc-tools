"use client";
import { useState, useMemo } from "react";

interface SimRow {
  priceRatio: number;
  ilPct: number;
  lpValue: number;
  hodlValue: number;
  difference: number;
  feeBreakeven: number;
}

export default function ImpermanentLossCalculator() {
  const [initialPrice, setInitialPrice] = useState(100);
  const [initialAmount, setInitialAmount] = useState(1000000);
  const [feeApy, setFeeApy] = useState(20);
  const [days, setDays] = useState(30);
  const [customRatio, setCustomRatio] = useState(200);

  // IL formula: IL = 2*sqrt(r)/(1+r) - 1, where r = newPrice/initialPrice
  const calcIL = (ratio: number): number => {
    const r = ratio;
    return (2 * Math.sqrt(r)) / (1 + r) - 1;
  };

  const scenarios = useMemo((): SimRow[] => {
    const ratios = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0, 5.0];
    return ratios.map((r) => {
      const ilPct = calcIL(r) * 100;
      const hodlValue = initialAmount * ((1 + r) / 2);
      const lpValue = hodlValue * (1 + ilPct / 100);
      const difference = lpValue - hodlValue;
      // fee per day
      const dailyFeeReturn = (feeApy / 100) / 365;
      const feeBreakeven = ilPct < 0 ? Math.abs(ilPct / 100) / dailyFeeReturn : 0;
      return { priceRatio: r, ilPct, lpValue, hodlValue, difference, feeBreakeven };
    });
  }, [initialAmount, feeApy]);

  const customResult = useMemo(() => {
    const r = customRatio / 100;
    const ilPct = calcIL(r) * 100;
    const hodlValue = initialAmount * ((1 + r) / 2);
    const lpValue = hodlValue * (1 + ilPct / 100);
    const difference = lpValue - hodlValue;
    const dailyFeeReturn = (feeApy / 100) / 365;
    const daysReturn = dailyFeeReturn * days;
    const netReturn = daysReturn + ilPct / 100;
    const feeBreakeven = ilPct < 0 ? Math.abs(ilPct / 100) / dailyFeeReturn : 0;
    return { r, ilPct, hodlValue, lpValue, difference, daysReturn, netReturn, feeBreakeven };
  }, [initialAmount, feeApy, days, customRatio]);

  const fmt = (n: number) => `¥${Math.abs(n).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">基本設定</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">初期投資額 (JPY)</label>
            <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">初期トークン価格 (円)</label>
            <input type="number" value={initialPrice} onChange={(e) => setInitialPrice(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">手数料年利 APY (%)</label>
            <input type="number" step="0.5" value={feeApy} onChange={(e) => setFeeApy(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <p className="text-xs text-gray-400 mt-1">LP提供で得られる取引手数料収入</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">保有期間 (日)</label>
            <input type="number" min={1} max={3650} value={days} onChange={(e) => setDays(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* Custom scenario */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">カスタム価格変動シミュレーション</h2>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">価格変動 (初期比)</label>
            <span className="text-sm font-bold text-gray-900">{customRatio}%</span>
          </div>
          <input type="range" min={10} max={1000} step={5} value={customRatio}
            onChange={(e) => setCustomRatio(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>-90%</span><span>初期値</span><span>+900%</span></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-600">インパーマネントロス</p>
            <p className={`text-2xl font-bold mt-1 ${customResult.ilPct < 0 ? "text-red-600" : "text-green-600"}`}>
              {customResult.ilPct.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">LP価値</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{fmt(customResult.lpValue)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">HODL価値</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{fmt(customResult.hodlValue)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">LP vs HODL 差</p>
            <p className={`text-xl font-bold mt-1 ${customResult.difference < 0 ? "text-red-600" : "text-green-600"}`}>
              {customResult.difference < 0 ? "-" : "+"}{fmt(customResult.difference)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600">{days}日間の手数料収入</p>
            <p className="text-lg font-bold text-blue-800 mt-1">{(customResult.daysReturn * 100).toFixed(2)}%</p>
            <p className="text-xs text-blue-600">{fmt(initialAmount * customResult.daysReturn)}</p>
          </div>
          <div className={`rounded-lg p-3 ${customResult.netReturn >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className={`text-xs ${customResult.netReturn >= 0 ? "text-green-600" : "text-red-600"}`}>手数料込み損益</p>
            <p className={`text-lg font-bold mt-1 ${customResult.netReturn >= 0 ? "text-green-800" : "text-red-800"}`}>
              {(customResult.netReturn * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-600">IL回収に必要な日数</p>
            <p className="text-lg font-bold text-orange-800 mt-1">
              {customResult.ilPct < 0 ? `${Math.ceil(customResult.feeBreakeven)}日` : "損失なし"}
            </p>
          </div>
        </div>
      </div>

      {/* Scenarios table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">価格変動別 IL一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">価格変動</th>
                <th className="px-4 py-3 text-right text-gray-600">IL</th>
                <th className="px-4 py-3 text-right text-gray-600">HODL価値</th>
                <th className="px-4 py-3 text-right text-gray-600">LP価値</th>
                <th className="px-4 py-3 text-right text-gray-600">損失</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.priceRatio} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {s.priceRatio === 1 ? "変化なし" : `${s.priceRatio >= 1 ? "+" : ""}${((s.priceRatio - 1) * 100).toFixed(0)}%`}
                  </td>
                  <td className={`px-4 py-2 text-right font-semibold ${s.ilPct < -5 ? "text-red-600" : s.ilPct < -1 ? "text-yellow-600" : "text-gray-600"}`}>
                    {s.ilPct.toFixed(2)}%
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{fmt(s.hodlValue)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{fmt(s.lpValue)}</td>
                  <td className={`px-4 py-2 text-right font-medium ${s.difference < 0 ? "text-red-600" : "text-gray-400"}`}>
                    {s.difference < 0 ? `-${fmt(s.difference)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">インパーマネントロスとは</p>
        <p>AMM（自動マーケットメーカー）にLPとして流動性提供した際、両トークンの価格比が変動することで発生する機会損失。価格が元に戻れば消滅するため「一時的な損失」とも呼ばれます。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このインパーマネントロス計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">DeFiのLPトークン提供時に発生するインパーマネントロスを価格変動率から計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このインパーマネントロス計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "DeFiのLPトークン提供時に発生するインパーマネントロスを価格変動率から計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
