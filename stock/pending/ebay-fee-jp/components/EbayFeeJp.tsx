"use client";

import { useState, useMemo } from "react";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}
function fmtUSD(n: number) {
  return n.toFixed(2);
}

// eBay 落札手数料（Final Value Fee）
// カテゴリ別
interface Category {
  name: string;
  fvfRate: number; // パーセント
  fvfCap?: number; // USD上限
}

const CATEGORIES: Category[] = [
  { name: "一般商品（ほとんどのカテゴリ）", fvfRate: 13.25, fvfCap: 750 },
  { name: "時計（$1,000以上）", fvfRate: 6.5 },
  { name: "高級品（バッグ・宝飾など$2,000以上）", fvfRate: 9 },
  { name: "自動車部品", fvfRate: 8.7, fvfCap: 350 },
  { name: "書籍・DVD・音楽CD", fvfRate: 14.95, fvfCap: 7500 },
  { name: "スポーツカード・コレクション", fvfRate: 8, fvfCap: 350 },
  { name: "コイン・紙幣", fvfRate: 6.5, fvfCap: 350 },
  { name: "ビジネス・産業機器", fvfRate: 3, fvfCap: 750 },
  { name: "楽器", fvfRate: 6.35, fvfCap: 350 },
  { name: "ゲーム機・ビデオゲーム", fvfRate: 8, fvfCap: 750 },
];

const PAYMENT_METHODS = [
  { id: "payoneer", name: "Payoneer", rate: 2.0, note: "eBay標準、JPY引出し時手数料別途" },
  { id: "paypal", name: "PayPal（旧方式・一部対応）", rate: 3.49, note: "+固定手数料$0.49/件" },
];

const SHIPPING_OPTIONS = [
  { name: "EMS（国際スピード郵便）小型（500g以下）", priceJPY: 1800 },
  { name: "EMS 中型（1kg以下）", priceJPY: 2300 },
  { name: "EMS 大型（2kg以下）", priceJPY: 3200 },
  { name: "EMS 重量（5kg以下）", priceJPY: 5000 },
  { name: "SAL便（航空補助便）小型", priceJPY: 800 },
  { name: "SAL便 中型（1kg以下）", priceJPY: 1200 },
  { name: "国際eパケット（追跡付き）", priceJPY: 700 },
  { name: "国際eパケットライト", priceJPY: 450 },
  { name: "FedEx International Priority（1kg）", priceJPY: 4500 },
  { name: "DHL Express（1kg）", priceJPY: 5200 },
  { name: "カスタム入力", priceJPY: 0 },
];

export default function EbayFeeJp() {
  const [sellPriceUSD, setSellPriceUSD] = useState("50");
  const [shippingChargeUSD, setShippingChargeUSD] = useState("15");
  const [categoryName, setCategoryName] = useState(CATEGORIES[0].name);
  const [paymentMethod, setPaymentMethod] = useState("payoneer");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0].name);
  const [customShippingJPY, setCustomShippingJPY] = useState("1800");
  const [purchasePriceJPY, setPurchasePriceJPY] = useState("3000");
  const [otherCostJPY, setOtherCostJPY] = useState("0");
  const [internationalFeeRate, setInternationalFeeRate] = useState("1.65");

  const cat = CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[0];
  const pm = PAYMENT_METHODS.find((p) => p.id === paymentMethod) || PAYMENT_METHODS[0];
  const shippingOption = SHIPPING_OPTIONS.find((s) => s.name === selectedShipping) || SHIPPING_OPTIONS[0];
  const actualShippingJPY = selectedShipping === "カスタム入力" ? parseFloat(customShippingJPY) || 0 : shippingOption.priceJPY;

  const result = useMemo(() => {
    const rate = parseFloat(exchangeRate) || 155;
    const priceUSD = parseFloat(sellPriceUSD) || 0;
    const shipChargeUSD = parseFloat(shippingChargeUSD) || 0;
    const intlFeeRate = parseFloat(internationalFeeRate) / 100;

    // 売上合計 (USD)
    const totalSaleUSD = priceUSD + shipChargeUSD;

    // 落札手数料 (FVF): 商品価格+送料請求額に対して
    let fvfUSD = totalSaleUSD * (cat.fvfRate / 100);
    if (cat.fvfCap) fvfUSD = Math.min(fvfUSD, cat.fvfCap);

    // 国際手数料 (International fee): 商品価格に対して
    const intlFeeUSD = priceUSD * intlFeeRate;

    // 決済手数料
    let paymentFeeUSD = totalSaleUSD * (pm.rate / 100);
    if (paymentMethod === "paypal") paymentFeeUSD += 0.49;

    // 為替変換
    const totalSaleJPY = totalSaleUSD * rate;
    const fvfJPY = fvfUSD * rate;
    const intlFeeJPY = intlFeeUSD * rate;
    const paymentFeeJPY = paymentFeeUSD * rate;

    // 実際の送料
    const shippingCostJPY = actualShippingJPY;

    // 仕入れ原価
    const purchaseJPY = parseFloat(purchasePriceJPY) || 0;
    const otherJPY = parseFloat(otherCostJPY) || 0;

    // 利益計算
    const totalCostJPY = fvfJPY + intlFeeJPY + paymentFeeJPY + shippingCostJPY + purchaseJPY + otherJPY;
    const profitJPY = totalSaleJPY - totalCostJPY;
    const profitRate = totalSaleJPY > 0 ? (profitJPY / totalSaleJPY) * 100 : 0;

    return {
      totalSaleUSD,
      totalSaleJPY,
      fvfUSD,
      fvfJPY,
      intlFeeUSD,
      intlFeeJPY,
      paymentFeeUSD,
      paymentFeeJPY,
      shippingCostJPY,
      purchaseJPY,
      otherJPY,
      totalCostJPY,
      profitJPY,
      profitRate,
    };
  }, [sellPriceUSD, shippingChargeUSD, cat, pm, exchangeRate, actualShippingJPY, purchasePriceJPY, otherCostJPY, internationalFeeRate, paymentMethod]);

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">出品情報を入力</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">販売価格<span className="text-gray-400 text-xs ml-1">USD</span></label>
            <input type="number" value={sellPriceUSD} onChange={(e) => setSellPriceUSD(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">買い手への請求送料<span className="text-gray-400 text-xs ml-1">USD</span></label>
            <input type="number" value={shippingChargeUSD} onChange={(e) => setShippingChargeUSD(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="15" />
            <p className="text-xs text-gray-400 mt-1">送料も手数料の対象になります</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}（{c.fvfRate}%{c.fvfCap ? `、上限$${c.fvfCap}` : ""}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">受取方法</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {PAYMENT_METHODS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}（{p.rate}%）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">為替レート<span className="text-gray-400 text-xs ml-1">円/USD</span></label>
            <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">国際取引手数料率<span className="text-gray-400 text-xs ml-1">%</span></label>
            <input type="number" value={internationalFeeRate} onChange={(e) => setInternationalFeeRate(e.target.value)} step="0.05"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">通常1.65%（海外への販売）</p>
          </div>
        </div>
      </div>

      {/* コスト */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">コストを入力</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">発送方法（実際にかかる送料）</label>
            <select value={selectedShipping} onChange={(e) => setSelectedShipping(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SHIPPING_OPTIONS.map((s) => (
                <option key={s.name} value={s.name}>{s.name}{s.priceJPY > 0 ? `（約${s.priceJPY.toLocaleString()}円）` : ""}</option>
              ))}
            </select>
          </div>
          {selectedShipping === "カスタム入力" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">送料（実費）<span className="text-gray-400 text-xs ml-1">円</span></label>
              <input type="number" value={customShippingJPY} onChange={(e) => setCustomShippingJPY(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">仕入れ原価<span className="text-gray-400 text-xs ml-1">円</span></label>
            <input type="number" value={purchasePriceJPY} onChange={(e) => setPurchasePriceJPY(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">その他費用（梱包材等）<span className="text-gray-400 text-xs ml-1">円</span></label>
            <input type="number" value={otherCostJPY} onChange={(e) => setOtherCostJPY(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
          </div>
        </div>
      </div>

      {/* 結果 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>

        {/* 利益メイン */}
        <div className={`rounded-xl p-6 text-center mb-6 ${result.profitJPY >= 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <p className="text-sm text-gray-500 mb-1">純利益（日本円換算）</p>
          <p className={`text-4xl font-bold ${result.profitJPY >= 0 ? "text-green-700" : "text-red-700"}`}>
            {result.profitJPY >= 0 ? "" : "−"}{fmt(Math.abs(result.profitJPY))} <span className="text-xl font-normal">円</span>
          </p>
          <p className={`text-sm mt-1 ${result.profitJPY >= 0 ? "text-green-600" : "text-red-600"}`}>
            利益率: {result.profitRate.toFixed(1)}%
          </p>
        </div>

        {/* 内訳 */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">売上合計（${fmtUSD(result.totalSaleUSD)} × {exchangeRate}円）</span>
            <span className="font-medium text-green-700">+{fmt(result.totalSaleJPY)} 円</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">落札手数料 FVF（{cat.fvfRate}%）</span>
            <span className="text-red-600">−{fmt(result.fvfJPY)} 円（${fmtUSD(result.fvfUSD)}）</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">国際取引手数料（{internationalFeeRate}%）</span>
            <span className="text-red-600">−{fmt(result.intlFeeJPY)} 円（${fmtUSD(result.intlFeeUSD)}）</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">決済手数料（{pm.name}）</span>
            <span className="text-red-600">−{fmt(result.paymentFeeJPY)} 円（${fmtUSD(result.paymentFeeUSD)}）</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">実際の送料</span>
            <span className="text-red-600">−{fmt(result.shippingCostJPY)} 円</span>
          </div>
          {result.purchaseJPY > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">仕入れ原価</span>
              <span className="text-red-600">−{fmt(result.purchaseJPY)} 円</span>
            </div>
          )}
          {result.otherJPY > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">その他費用</span>
              <span className="text-red-600">−{fmt(result.otherJPY)} 円</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-200 font-bold text-sm">
            <span>総コスト</span>
            <span className="text-red-700">−{fmt(result.totalCostJPY)} 円</span>
          </div>
        </div>
      </div>

      {/* 費用構成比 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">費用の内訳</h2>
        {[
          { label: "落札手数料 (FVF)", value: result.fvfJPY, color: "bg-red-400" },
          { label: "国際取引手数料", value: result.intlFeeJPY, color: "bg-orange-400" },
          { label: "決済手数料", value: result.paymentFeeJPY, color: "bg-yellow-400" },
          { label: "実際の送料", value: result.shippingCostJPY, color: "bg-blue-400" },
          { label: "仕入れ原価", value: result.purchaseJPY, color: "bg-purple-400" },
        ].filter((item) => item.value > 0).map((item) => {
          const pct = result.totalCostJPY > 0 ? (item.value / result.totalCostJPY) * 100 : 0;
          return (
            <div key={item.label} className="mb-2">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-600">{item.label}</span>
                <span className="text-gray-700 font-medium">{fmt(item.value)}円 ({pct.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800">
        <p className="font-semibold mb-1">注意事項</p>
        <ul className="list-disc list-inside space-y-1">
          <li>為替レートは変動します。実際の受取額は確定時レートに依存します</li>
          <li>出品手数料（Insertion Fee）は月50件まで無料。超過分は別途発生します</li>
          <li>Managed PaymentsはPayoneerやACH振込で受け取ります</li>
          <li>関税・輸入税の負担は買い手・売り手の設定によります</li>
        </ul>
      </div>
    </div>
  );
}
