"use client";

import { useState, useMemo, useCallback } from "react";

// --- seeded PRNG (mulberry32) ---
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SimResult {
  months: number;
  prices: number[]; // length = months+1 (month 0 = initial)
  dcaFinalAsset: number;
  lumpFinalAsset: number;
  totalInvested: number; // DCA total invested
  lumpInvested: number; // same as totalInvested (one-shot at month 0)
}

function runSim(
  monthlyAmount: number, // 万円
  years: number,
  annualReturn: number, // %
  annualVol: number, // %
  seed: number
): SimResult {
  const months = years * 12;
  const mu = annualReturn / 100 / 12;
  const sigma = annualVol / 100 / Math.sqrt(12);
  const rand = mulberry32(seed);

  // generate monthly prices via geometric random walk
  const prices: number[] = [1000];
  for (let i = 0; i < months; i++) {
    // Box-Muller for normal variate
    const u1 = rand();
    const u2 = rand();
    const z = Math.sqrt(-2 * Math.log(u1 + 1e-12)) * Math.cos(2 * Math.PI * u2);
    const r = Math.exp((mu - 0.5 * sigma * sigma) + sigma * z);
    prices.push(prices[prices.length - 1] * r);
  }

  // DCA: invest monthlyAmount every month, buy at that month's price
  let dcaUnits = 0;
  const totalInvested = monthlyAmount * months;
  for (let i = 1; i <= months; i++) {
    dcaUnits += monthlyAmount / prices[i];
  }
  const dcaFinalAsset = dcaUnits * prices[months];

  // Lump-sum: invest totalInvested at month 0 price
  const lumpInvested = totalInvested;
  const lumpUnits = lumpInvested / prices[0];
  const lumpFinalAsset = lumpUnits * prices[months];

  return { months, prices, dcaFinalAsset, lumpFinalAsset, totalInvested, lumpInvested };
}

function formatMan(n: number): string {
  return (n / 10000).toFixed(1) + "万円";
}

function formatPct(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}

// Simple bar chart showing price path
function PriceChart({ prices, months }: { prices: number[]; months: number }) {
  const step = Math.max(1, Math.floor(months / 36));
  const sampled = prices.filter((_, i) => i % step === 0 || i === prices.length - 1);
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const range = max - min || 1;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        シミュレーション価格推移（基準価格1,000）
      </p>
      <div className="flex items-end gap-px h-20">
        {sampled.map((p, i) => {
          const heightPct = ((p - min) / range) * 80 + 20; // 20-100%
          const isAboveStart = p >= prices[0];
          return (
            <div
              key={i}
              className={`flex-1 rounded-t-sm ${isAboveStart ? "bg-blue-400" : "bg-red-300"}`}
              style={{ height: `${heightPct}%` }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>開始</span>
        <span>最終: {prices[prices.length - 1].toFixed(0)}</span>
      </div>
    </div>
  );
}

// Comparison bar for DCA vs Lump
function CompareBar({
  label,
  value,
  maxValue,
  color,
  invested,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  invested: number;
}) {
  const pct = Math.min((value / maxValue) * 100, 100);
  const gain = value - invested;
  const gainPct = (gain / invested) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline text-xs text-gray-600">
        <span className="font-medium">{label}</span>
        <span className="font-bold text-gray-800">{formatMan(value)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>投資総額: {formatMan(invested)}</span>
        <span className={gain >= 0 ? "text-green-600" : "text-red-500"}>
          損益: {gain >= 0 ? "+" : ""}{formatMan(gain)} ({formatPct(gainPct)})
        </span>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {suffix && (
          <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">{suffix}</span>
        )}
      </div>
    </div>
  );
}

let currentSeed = 42;

export default function DollarCostAverageSim() {
  const [monthlyAmount, setMonthlyAmount] = useState("5");
  const [years, setYears] = useState("10");
  const [annualReturn, setAnnualReturn] = useState("5");
  const [annualVol, setAnnualVol] = useState("15");
  const [seed, setSeed] = useState(42);

  const rerun = useCallback(() => {
    currentSeed = Math.floor(Math.random() * 999999);
    setSeed(currentSeed);
  }, []);

  const result = useMemo<SimResult | null>(() => {
    const ma = parseFloat(monthlyAmount) * 10000;
    const y = parseInt(years);
    const ar = parseFloat(annualReturn);
    const av = parseFloat(annualVol);

    if (
      isNaN(ma) || ma <= 0 ||
      isNaN(y) || y < 1 || y > 40 ||
      isNaN(ar) || ar < -20 || ar > 50 ||
      isNaN(av) || av < 0 || av > 100
    ) {
      return null;
    }

    return runSim(ma, y, ar, av, seed);
  }, [monthlyAmount, years, annualReturn, annualVol, seed]);

  const dcaWins = result ? result.dcaFinalAsset >= result.lumpFinalAsset : false;
  const diff = result ? Math.abs(result.dcaFinalAsset - result.lumpFinalAsset) : 0;
  const maxFinal = result ? Math.max(result.dcaFinalAsset, result.lumpFinalAsset) : 1;

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700">シミュレーション設定</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InputField
            label="月額投資額"
            value={monthlyAmount}
            onChange={setMonthlyAmount}
            suffix="万円"
            min={0.1}
            step={0.5}
          />
          <InputField
            label="投資期間"
            value={years}
            onChange={setYears}
            suffix="年"
            min={1}
            max={40}
            step={1}
          />
          <InputField
            label="年間リターン"
            value={annualReturn}
            onChange={setAnnualReturn}
            suffix="%"
            min={-20}
            max={50}
            step={0.5}
          />
          <InputField
            label="年間ボラティリティ"
            value={annualVol}
            onChange={setAnnualVol}
            suffix="%"
            min={0}
            max={100}
            step={1}
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-[10px] text-gray-400">
            ※ ランダムウォークによる確率的シミュレーション。毎回結果が変わります。
          </p>
          <button
            onClick={rerun}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            再実行
          </button>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">投資総額（DCA）</p>
              <p className="text-xl font-bold text-gray-800">{formatMan(result.totalInvested)}</p>
            </div>
            <div
              className={`rounded-xl border px-4 py-3 ${
                dcaWins ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">最終資産（DCA）</p>
              <p className={`text-xl font-bold ${dcaWins ? "text-green-700" : "text-gray-800"}`}>
                {formatMan(result.dcaFinalAsset)}
              </p>
            </div>
            <div
              className={`rounded-xl border px-4 py-3 ${
                !dcaWins ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <p className="text-xs text-gray-500 mb-1">最終資産（一括）</p>
              <p className={`text-xl font-bold ${!dcaWins ? "text-blue-700" : "text-gray-800"}`}>
                {formatMan(result.lumpFinalAsset)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">リターン差</p>
              <p className={`text-xl font-bold ${dcaWins ? "text-green-700" : "text-blue-700"}`}>
                {dcaWins ? "DCA +" : "一括 +"}{formatMan(diff)}
              </p>
            </div>
          </div>

          {/* Comparison bars */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
            <p className="text-sm font-semibold text-gray-700">最終資産比較</p>
            <CompareBar
              label="ドルコスト平均法（DCA）"
              value={result.dcaFinalAsset}
              maxValue={maxFinal}
              color="bg-green-400"
              invested={result.totalInvested}
            />
            <CompareBar
              label="一括投資"
              value={result.lumpFinalAsset}
              maxValue={maxFinal}
              color="bg-blue-400"
              invested={result.lumpInvested}
            />
          </div>

          {/* Price chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
            <PriceChart prices={result.prices} months={result.months} />
          </div>

          {/* Verdict */}
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              dcaWins ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {dcaWins
              ? `このシナリオでは DCA が一括投資より ${formatMan(diff)} 有利でした。価格下落期に安く買えた効果が出ています。`
              : `このシナリオでは一括投資が DCA より ${formatMan(diff)} 有利でした。右肩上がりの相場では早期投資が有利になる傾向があります。`}
          </div>

          {/* Formula note */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">シミュレーション方式</p>
            <p>幾何ブラウン運動（対数正規乱数）で月次価格を生成</p>
            <p>DCA: 毎月同額を当月価格で購入 → 最終月価格で評価</p>
            <p>一括: 初月に全額（= 月額 × 期間）を投入 → 最終月価格で評価</p>
            <p>結果は確率的シミュレーションであり、実際の投資成績を保証しません。</p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center text-sm text-gray-400">
          有効な値を入力してください
        </div>
      )}

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このドルコスト平均法 シミュレーションツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">月額投資 vs 一括投資の成績比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このドルコスト平均法 シミュレーションツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "月額投資 vs 一括投資の成績比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
