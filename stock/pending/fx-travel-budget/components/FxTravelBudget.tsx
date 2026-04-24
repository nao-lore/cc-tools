"use client";
import { useState, useMemo } from "react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // JPY per 1 unit of currency
  tipCustomary: boolean;
  tipPercent: number;
}

const CURRENCIES: Currency[] = [
  { code: "USD", name: "米ドル", symbol: "$", flag: "🇺🇸", rate: 150, tipCustomary: true, tipPercent: 18 },
  { code: "EUR", name: "ユーロ", symbol: "€", flag: "🇪🇺", rate: 163, tipCustomary: false, tipPercent: 10 },
  { code: "GBP", name: "英ポンド", symbol: "£", flag: "🇬🇧", rate: 192, tipCustomary: true, tipPercent: 12 },
  { code: "AUD", name: "豪ドル", symbol: "A$", flag: "🇦🇺", rate: 97, tipCustomary: false, tipPercent: 0 },
  { code: "CAD", name: "カナダドル", symbol: "CA$", flag: "🇨🇦", rate: 110, tipCustomary: true, tipPercent: 15 },
  { code: "HKD", name: "香港ドル", symbol: "HK$", flag: "🇭🇰", rate: 19, tipCustomary: false, tipPercent: 10 },
  { code: "KRW", name: "韓国ウォン", symbol: "₩", flag: "🇰🇷", rate: 0.11, tipCustomary: false, tipPercent: 0 },
  { code: "CNY", name: "中国元", symbol: "¥", flag: "🇨🇳", rate: 21, tipCustomary: false, tipPercent: 0 },
  { code: "THB", name: "タイバーツ", symbol: "฿", flag: "🇹🇭", rate: 4.2, tipCustomary: false, tipPercent: 10 },
  { code: "SGD", name: "シンガポールドル", symbol: "S$", flag: "🇸🇬", rate: 112, tipCustomary: false, tipPercent: 0 },
  { code: "TWD", name: "台湾ドル", symbol: "NT$", flag: "🇹🇼", rate: 4.8, tipCustomary: false, tipPercent: 0 },
  { code: "VND", name: "ベトナムドン", symbol: "₫", flag: "🇻🇳", rate: 0.006, tipCustomary: false, tipPercent: 0 },
  { code: "MYR", name: "マレーシアリンギット", symbol: "RM", flag: "🇲🇾", rate: 33, tipCustomary: false, tipPercent: 0 },
  { code: "IDR", name: "インドネシアルピア", symbol: "Rp", flag: "🇮🇩", rate: 0.0095, tipCustomary: false, tipPercent: 0 },
];

interface ExpenseItem {
  id: number;
  label: string;
  amount: number;
  hasTip: boolean;
}

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: 1, label: "宿泊費（1泊）", amount: 150, hasTip: false },
  { id: 2, label: "食費（1日）", amount: 50, hasTip: true },
  { id: 3, label: "交通費（1日）", amount: 20, hasTip: false },
  { id: 4, label: "観光・入場料", amount: 30, hasTip: false },
  { id: 5, label: "お土産・買い物", amount: 100, hasTip: false },
];

const EXCHANGE_FEES = [
  { label: "銀行窓口", percent: 3.0 },
  { label: "空港両替", percent: 5.0 },
  { label: "クレカ海外利用", percent: 1.6 },
  { label: "海外ATM", percent: 2.5 },
  { label: "ネット両替", percent: 2.0 },
];

export default function FxTravelBudget() {
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [days, setDays] = useState(5);
  const [nights, setNights] = useState(4);
  const [feeIdx, setFeeIdx] = useState(2);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(DEFAULT_EXPENSES);
  const [addTip, setAddTip] = useState(true);
  const [safetyBuffer, setSafetyBuffer] = useState(20);

  const currency = CURRENCIES.find((c) => c.code === currencyCode)!;
  const rate = customRate ?? currency.rate;
  const fee = EXCHANGE_FEES[feeIdx];

  const updateExpense = (id: number, field: "label" | "amount" | "hasTip", value: string | number | boolean) => {
    setExpenses(expenses.map((e) => e.id === id ? { ...e, [field]: value } : e));
  };

  const addExpense = () => {
    setExpenses([...expenses, { id: Date.now(), label: "その他", amount: 0, hasTip: false }]);
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const result = useMemo(() => {
    const perDayBase = expenses.reduce((sum, e) => {
      const tipMult = (addTip && e.hasTip && currency.tipCustomary) ? (1 + currency.tipPercent / 100) : 1;
      return sum + e.amount * tipMult;
    }, 0);

    // accommodation is per night, others per day - simplified: assume all are "per unit"
    const accomExpense = expenses.find((e) => e.label.includes("宿泊"));
    const accomTotal = accomExpense ? accomExpense.amount * nights : 0;
    const otherBase = perDayBase - (accomExpense?.amount ?? 0);
    const otherTotal = otherBase * days;

    const subtotalLocal = accomTotal + otherTotal;
    const withBuffer = subtotalLocal * (1 + safetyBuffer / 100);
    const subtotalJpy = withBuffer * rate;
    const feeAmount = subtotalJpy * (fee.percent / 100);
    const totalJpy = subtotalJpy + feeAmount;

    return {
      subtotalLocal,
      withBufferLocal: withBuffer,
      subtotalJpy,
      feeAmount,
      totalJpy,
      perDayLocal: perDayBase,
      perDayJpy: perDayBase * rate,
    };
  }, [expenses, days, nights, rate, fee, addTip, safetyBuffer, currency]);

  return (
    <div className="space-y-5">
      {/* Currency selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">通貨を選ぶ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrencyCode(c.code); setCustomRate(null); }}
              className={`p-2 rounded-xl border text-xs font-medium text-left transition-all ${currencyCode === c.code ? "bg-sky-600 text-white border-sky-600" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"}`}
            >
              <span className="text-base mr-1">{c.flag}</span>
              <span className="font-bold">{c.code}</span>
              <span className={`block ${currencyCode === c.code ? "text-sky-200" : "text-gray-400"}`}>{c.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              為替レート（1{currency.code} = ? 円）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0.001}
                step={0.01}
                value={customRate ?? rate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button onClick={() => setCustomRate(null)} className="text-xs text-gray-400 hover:text-sky-600">参考値に戻す</button>
            </div>
            {!customRate && <p className="text-xs text-gray-400 mt-1">参考値（実際のレートで上書き可）</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">両替方法</label>
            <select
              value={feeIdx}
              onChange={(e) => setFeeIdx(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {EXCHANGE_FEES.map((f, i) => (
                <option key={i} value={i}>{f.label}（手数料 {f.percent}%）</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trip duration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">旅行期間</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">日数</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setDays(Math.max(1, days - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">−</button>
              <span className="text-xl font-bold w-8 text-center text-gray-800">{days}</span>
              <button onClick={() => setDays(days + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
              <span className="text-sm text-gray-500">日</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">宿泊数</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setNights(Math.max(0, nights - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">−</button>
              <span className="text-xl font-bold w-8 text-center text-gray-800">{nights}</span>
              <button onClick={() => setNights(nights + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
              <span className="text-sm text-gray-500">泊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">費用項目（{currency.symbol} {currency.code}）</h2>
          {currency.tipCustomary && (
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={addTip} onChange={(e) => setAddTip(e.target.checked)} className="accent-sky-600" />
              チップ加算（{currency.tipPercent}%）
            </label>
          )}
        </div>
        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              <input
                type="text"
                value={e.label}
                onChange={(ev) => updateExpense(e.id, "label", ev.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <input
                type="number"
                min={0}
                value={e.amount}
                onChange={(ev) => updateExpense(e.id, "amount", Number(ev.target.value))}
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <span className="text-xs text-gray-400 w-6">{currency.symbol}</span>
              {currency.tipCustomary && (
                <label className="flex items-center gap-1 text-xs cursor-pointer" title="チップ対象">
                  <input type="checkbox" checked={e.hasTip} onChange={(ev) => updateExpense(e.id, "hasTip", ev.target.checked)} className="accent-sky-600" />
                  <span className="text-gray-400">tip</span>
                </label>
              )}
              <button onClick={() => removeExpense(e.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <button onClick={addExpense} className="mt-3 w-full border border-dashed border-sky-300 text-sky-500 hover:bg-sky-50 rounded-xl py-2 text-sm transition-colors">
          ＋ 項目を追加
        </button>
      </div>

      {/* Safety buffer */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">予備費（バッファ）</h2>
        <div className="flex gap-2">
          {[0, 10, 20, 30].map((pct) => (
            <button
              key={pct}
              onClick={() => setSafetyBuffer(pct)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${safetyBuffer === pct ? "bg-sky-600 text-white border-sky-600" : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"}`}
            >
              +{pct}%
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">緊急時・予想外の出費に備えて予備費を追加</p>
      </div>

      {/* Result */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl p-6 text-white">
        <p className="text-sky-200 text-sm text-center mb-4">旅行予算の目安</p>
        <div className="text-center mb-4">
          <p className="text-5xl font-bold">¥{Math.ceil(result.totalJpy).toLocaleString()}</p>
          <p className="text-sky-200 mt-1">必要な日本円（両替手数料込み）</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-sky-200 text-xs">現地通貨合計</p>
            <p className="font-bold">{currency.symbol}{result.withBufferLocal.toFixed(0)}</p>
            <p className="text-xs text-sky-300">{currency.code}（バッファ+{safetyBuffer}%）</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-sky-200 text-xs">1日あたり目安</p>
            <p className="font-bold">¥{Math.ceil(result.perDayJpy).toLocaleString()}</p>
            <p className="text-xs text-sky-300">{currency.symbol}{result.perDayLocal.toFixed(0)}/日</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-sky-200 text-xs">両替手数料</p>
            <p className="font-bold">¥{Math.ceil(result.feeAmount).toLocaleString()}</p>
            <p className="text-xs text-sky-300">{fee.label}（{fee.percent}%）</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-sky-200 text-xs">適用レート</p>
            <p className="font-bold">1{currency.code} = {rate}円</p>
            <p className="text-xs text-sky-300">{customRate ? "カスタム" : "参考値"}</p>
          </div>
        </div>
        <p className="text-xs text-sky-300 mt-4 text-center">
          ※参考値です。実際のレートや手数料はご利用の金融機関でご確認ください
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この海外旅行予算換算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">現地通貨・為替手数料・チップ込みで必要日本円を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この海外旅行予算換算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "現地通貨・為替手数料・チップ込みで必要日本円を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "海外旅行予算換算",
  "description": "現地通貨・為替手数料・チップ込みで必要日本円を計算",
  "url": "https://tools.loresync.dev/fx-travel-budget",
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
