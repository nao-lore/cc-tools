"use client";
import { useState, useMemo } from "react";

const COINS = [
  { symbol: "ETH", name: "Ethereum", defaultApy: 4.2 },
  { symbol: "SOL", name: "Solana", defaultApy: 7.5 },
  { symbol: "ADA", name: "Cardano", defaultApy: 3.8 },
  { symbol: "DOT", name: "Polkadot", defaultApy: 14.5 },
  { symbol: "ATOM", name: "Cosmos", defaultApy: 19.0 },
  { symbol: "MATIC", name: "Polygon", defaultApy: 5.2 },
  { symbol: "カスタム", name: "カスタム通貨", defaultApy: 10.0 },
];

const COMPOUND_FREQ = [
  { label: "なし (単利)", value: 0 },
  { label: "毎日", value: 365 },
  { label: "毎週", value: 52 },
  { label: "毎月", value: 12 },
  { label: "四半期", value: 4 },
  { label: "年1回", value: 1 },
];

interface YearRow {
  year: number;
  principal: number;
  rewards: number;
  total: number;
  afterTax: number;
  tax: number;
}

export default function StakingYieldCalculator() {
  const [coin, setCoin] = useState(COINS[0]);
  const [principal, setPrincipal] = useState(1000000);
  const [apy, setApy] = useState(COINS[0].defaultApy);
  const [years, setYears] = useState(5);
  const [compoundFreq, setCompoundFreq] = useState(12);
  const [taxRate, setTaxRate] = useState(20);
  const [coinPrice, setCoinPrice] = useState(400000);
  const [currency, setCurrency] = useState<"JPY" | "USD">("JPY");

  const fmt = (n: number) => currency === "JPY" ? `¥${n.toLocaleString("ja-JP", { maximumFractionDigits: 0 })}` : `$${(n / 150).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  const rows = useMemo((): YearRow[] => {
    const r = apy / 100;
    const result: YearRow[] = [];
    for (let y = 1; y <= years; y++) {
      let total: number;
      if (compoundFreq === 0) {
        total = principal * (1 + r * y);
      } else {
        total = principal * Math.pow(1 + r / compoundFreq, compoundFreq * y);
      }
      const rewards = total - principal;
      const tax = rewards * (taxRate / 100);
      const afterTax = total - tax;
      result.push({ year: y, principal, rewards, total, afterTax, tax });
    }
    return result;
  }, [principal, apy, years, compoundFreq, taxRate]);

  const last = rows[rows.length - 1];
  const annualRewards = last ? last.rewards / years : 0;

  const handleCoinChange = (symbol: string) => {
    const c = COINS.find((c) => c.symbol === symbol) ?? COINS[0];
    setCoin(c);
    if (c.symbol !== "カスタム") setApy(c.defaultApy);
  };

  return (
    <div className="space-y-6">
      {/* Coin selector */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-3">通貨・基本設定</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {COINS.map((c) => (
            <button
              key={c.symbol}
              onClick={() => handleCoinChange(c.symbol)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${coin.symbol === c.symbol ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}
            >
              {c.symbol}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">元本 (JPY)</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">年利 (APY %)</label>
            <input type="number" step="0.1" value={apy} onChange={(e) => setApy(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">運用期間 (年)</label>
            <input type="number" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">複利頻度</label>
            <select value={compoundFreq} onChange={(e) => setCompoundFreq(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {COMPOUND_FREQ.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">税率 (%)</label>
            <input type="number" min={0} max={55} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <p className="text-xs text-gray-400 mt-1">日本: 雑所得 最大55% / 申告分離20.315%</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">表示通貨</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as "JPY" | "USD")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="JPY">JPY (円)</option>
              <option value="USD">USD (ドル/150換算)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {last && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: `${years}年後 総資産`, value: fmt(last.total), color: "text-blue-700" },
            { label: "総報酬", value: fmt(last.rewards), color: "text-green-700" },
            { label: "税金合計", value: fmt(last.tax), color: "text-red-600" },
            { label: "税引後", value: fmt(last.afterTax), color: "text-purple-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Year-by-year table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">年次シミュレーション</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">年</th>
                <th className="px-4 py-3 text-right text-gray-600">累計報酬</th>
                <th className="px-4 py-3 text-right text-gray-600">税金</th>
                <th className="px-4 py-3 text-right text-gray-600">税引後総資産</th>
                <th className="px-4 py-3 text-right text-gray-600">リターン率</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-800">{r.year}年目</td>
                  <td className="px-4 py-2 text-right text-green-700 font-medium">{fmt(r.rewards)}</td>
                  <td className="px-4 py-2 text-right text-red-600">{fmt(r.tax)}</td>
                  <td className="px-4 py-2 text-right text-gray-900 font-semibold">{fmt(r.afterTax)}</td>
                  <td className="px-4 py-2 text-right text-blue-700">{((r.afterTax / principal - 1) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">注意事項</p>
        <p>本ツールは参考値です。実際のAPYはバリデーター手数料・ネットワーク状況により変動します。税務については税理士にご相談ください。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このステーキング利回り計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">PoS通貨のステーキング報酬を年利・複利・税引後で計算するシミュレーター。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このステーキング利回り計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "PoS通貨のステーキング報酬を年利・複利・税引後で計算するシミュレーター。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ステーキング利回り計算",
  "description": "PoS通貨のステーキング報酬を年利・複利・税引後で計算するシミュレーター",
  "url": "https://tools.loresync.dev/staking-yield",
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
