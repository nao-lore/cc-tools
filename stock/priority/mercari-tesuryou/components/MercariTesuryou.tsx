"use client";
import { useState, useCallback } from "react";

// ---- 送料データ ----
type ShippingOption = {
  id: string;
  carrier: "rakuraku" | "yuyuu";
  name: string;
  fee: number;
  note?: string;
};

const SHIPPING_OPTIONS: ShippingOption[] = [
  // らくらくメルカリ便
  { id: "nekoposu", carrier: "rakuraku", name: "ネコポス", fee: 210, note: "A4・3cm・1kg" },
  { id: "compact", carrier: "rakuraku", name: "宅急便コンパクト", fee: 520, note: "専用箱¥70込" },
  { id: "takkyubin60", carrier: "rakuraku", name: "宅急便60", fee: 750 },
  { id: "takkyubin80", carrier: "rakuraku", name: "宅急便80", fee: 850 },
  { id: "takkyubin100", carrier: "rakuraku", name: "宅急便100", fee: 1050 },
  { id: "takkyubin120", carrier: "rakuraku", name: "宅急便120", fee: 1200 },
  { id: "takkyubin140", carrier: "rakuraku", name: "宅急便140", fee: 1450 },
  { id: "takkyubin160", carrier: "rakuraku", name: "宅急便160", fee: 1700 },
  // ゆうゆうメルカリ便
  { id: "yupacket", carrier: "yuyuu", name: "ゆうパケット", fee: 230, note: "A4・3cm・1kg" },
  { id: "yupacket-post", carrier: "yuyuu", name: "ゆうパケットポスト", fee: 215 },
  { id: "yupack60", carrier: "yuyuu", name: "ゆうパック60", fee: 770 },
  { id: "yupack80", carrier: "yuyuu", name: "ゆうパック80", fee: 870 },
  { id: "yupack100", carrier: "yuyuu", name: "ゆうパック100", fee: 1070 },
  { id: "yupack120", carrier: "yuyuu", name: "ゆうパック120", fee: 1200 },
  { id: "yupack140", carrier: "yuyuu", name: "ゆうパック140", fee: 1450 },
  { id: "yupack160", carrier: "yuyuu", name: "ゆうパック160", fee: 1700 },
  { id: "yupack170", carrier: "yuyuu", name: "ゆうパック170", fee: 1900 },
];

const MERCARI_FEE_RATE = 0.1;

// ---- 比較テーブル用ペア ----
type ComparisonPair = { label: string; rakuraku: ShippingOption; yuyuu: ShippingOption };
const COMPARISON_PAIRS: ComparisonPair[] = [
  {
    label: "小型 (A4・3cm以内)",
    rakuraku: SHIPPING_OPTIONS.find((o) => o.id === "nekoposu")!,
    yuyuu: SHIPPING_OPTIONS.find((o) => o.id === "yupacket")!,
  },
  {
    label: "60サイズ",
    rakuraku: SHIPPING_OPTIONS.find((o) => o.id === "takkyubin60")!,
    yuyuu: SHIPPING_OPTIONS.find((o) => o.id === "yupack60")!,
  },
  {
    label: "80サイズ",
    rakuraku: SHIPPING_OPTIONS.find((o) => o.id === "takkyubin80")!,
    yuyuu: SHIPPING_OPTIONS.find((o) => o.id === "yupack80")!,
  },
  {
    label: "100サイズ",
    rakuraku: SHIPPING_OPTIONS.find((o) => o.id === "takkyubin100")!,
    yuyuu: SHIPPING_OPTIONS.find((o) => o.id === "yupack100")!,
  },
  {
    label: "120サイズ",
    rakuraku: SHIPPING_OPTIONS.find((o) => o.id === "takkyubin120")!,
    yuyuu: SHIPPING_OPTIONS.find((o) => o.id === "yupack120")!,
  },
];

// ---- ユーティリティ ----
const fmt = (n: number) =>
  n.toLocaleString("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });

const parseNum = (v: string): number => {
  const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

// ---- コンポーネント ----
export default function MercariTesuryou() {
  const [mode, setMode] = useState<"forward" | "reverse">("forward");

  // 順算
  const [salePrice, setSalePrice] = useState("");
  // 逆算
  const [targetProfit, setTargetProfit] = useState("");

  // 共通
  const [shippingId, setShippingId] = useState("nekoposu");
  const [packagingCost, setPackagingCost] = useState("0");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [targetTotal, setTargetTotal] = useState("");

  const selectedShipping = SHIPPING_OPTIONS.find((o) => o.id === shippingId)!;

  const calcForward = useCallback(() => {
    const price = parseNum(salePrice);
    if (price <= 0) return null;
    const fee = Math.floor(price * MERCARI_FEE_RATE);
    const shipping = selectedShipping.fee;
    const packaging = parseNum(packagingCost);
    const purchase = parseNum(purchaseCost);
    const profit = price - fee - shipping - packaging - purchase;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    return { price, fee, shipping, packaging, purchase, profit, margin };
  }, [salePrice, selectedShipping, packagingCost, purchaseCost]);

  const calcReverse = useCallback(() => {
    const profit = parseNum(targetProfit);
    const shipping = selectedShipping.fee;
    const packaging = parseNum(packagingCost);
    const purchase = parseNum(purchaseCost);
    // price * (1 - 0.1) = profit + shipping + packaging + purchase
    // price = (profit + shipping + packaging + purchase) / 0.9
    const price = Math.ceil((profit + shipping + packaging + purchase) / (1 - MERCARI_FEE_RATE));
    const fee = Math.floor(price * MERCARI_FEE_RATE);
    const actualProfit = price - fee - shipping - packaging - purchase;
    const margin = price > 0 ? (actualProfit / price) * 100 : 0;
    return { price, fee, shipping, packaging, purchase, profit: actualProfit, margin };
  }, [targetProfit, selectedShipping, packagingCost, purchaseCost]);

  const result = mode === "forward" ? calcForward() : calcReverse();

  // 複数出品シミュレーション
  const simQty = parseNum(quantity);
  const simTarget = parseNum(targetTotal);
  const profitPerItem = result?.profit ?? 0;
  const itemsNeeded =
    profitPerItem > 0 && simTarget > 0 ? Math.ceil(simTarget / profitPerItem) : null;
  const totalProfit = result && simQty > 0 ? profitPerItem * simQty : null;

  return (
    <div className="space-y-6">
      {/* モード切替 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex">
        <button
          onClick={() => setMode("forward")}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            mode === "forward"
              ? "bg-[#FF0211] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          順算：販売価格 → 実利益
        </button>
        <button
          onClick={() => setMode("reverse")}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
            mode === "reverse"
              ? "bg-[#FF0211] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          逆算：目標利益 → 販売価格
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 入力パネル */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-800">入力</h2>

          {/* メイン入力 */}
          {mode === "forward" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                販売価格 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
                <input
                  type="number"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="例: 3000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0211] focus:border-transparent text-lg"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目標利益 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
                <input
                  type="number"
                  min="0"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(e.target.value)}
                  placeholder="例: 1000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0211] focus:border-transparent text-lg"
                />
              </div>
            </div>
          )}

          {/* 配送方法 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">配送方法</label>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-orange-600 mb-1">らくらくメルカリ便（ヤマト）</p>
                <select
                  value={
                    selectedShipping.carrier === "rakuraku" ? shippingId : ""
                  }
                  onChange={(e) => e.target.value && setShippingId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0211]"
                >
                  <option value="">-- 選択 --</option>
                  {SHIPPING_OPTIONS.filter((o) => o.carrier === "rakuraku").map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}　¥{o.fee.toLocaleString()}
                      {o.note ? `（${o.note}）` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">ゆうゆうメルカリ便（日本郵便）</p>
                <select
                  value={
                    selectedShipping.carrier === "yuyuu" ? shippingId : ""
                  }
                  onChange={(e) => e.target.value && setShippingId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0211]"
                >
                  <option value="">-- 選択 --</option>
                  {SHIPPING_OPTIONS.filter((o) => o.carrier === "yuyuu").map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}　¥{o.fee.toLocaleString()}
                      {o.note ? `（${o.note}）` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              選択中: {selectedShipping.name}（{fmt(selectedShipping.fee)}）
            </p>
          </div>

          {/* 梱包費 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">梱包費（任意）</label>
            <div className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
              <input
                type="number"
                min="0"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0211] text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[0, 50, 100, 200, 300].map((v) => (
                <button
                  key={v}
                  onClick={() => setPackagingCost(String(v))}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    packagingCost === String(v)
                      ? "bg-[#FF0211] text-white border-[#FF0211]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#FF0211]"
                  }`}
                >
                  ¥{v}
                </button>
              ))}
            </div>
          </div>

          {/* 仕入れ原価 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">仕入れ原価（任意）</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">¥</span>
              <input
                type="number"
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0211] text-sm"
              />
            </div>
          </div>
        </div>

        {/* 結果パネル */}
        <div className="space-y-4">
          {/* フロー図 */}
          {result ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">計算結果</h2>

              {/* 販売価格 */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-600">販売価格</span>
                <span className="font-semibold text-gray-900">{fmt(result.price)}</span>
              </div>

              {/* メルカリ手数料 */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold text-lg leading-none">−</span>
                  <span className="text-sm text-gray-600">メルカリ手数料（10%）</span>
                </div>
                <span className="font-medium text-red-500">{fmt(result.fee)}</span>
              </div>

              {/* 送料 */}
              <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold text-lg leading-none">−</span>
                  <span className="text-sm text-gray-600">
                    配送料（{selectedShipping.name}）
                  </span>
                </div>
                <span className="font-medium text-red-500">{fmt(result.shipping)}</span>
              </div>

              {/* 梱包費 */}
              {result.packaging > 0 && (
                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold text-lg leading-none">−</span>
                    <span className="text-sm text-gray-600">梱包費</span>
                  </div>
                  <span className="font-medium text-red-500">{fmt(result.packaging)}</span>
                </div>
              )}

              {/* 仕入れ原価 */}
              {result.purchase > 0 && (
                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold text-lg leading-none">−</span>
                    <span className="text-sm text-gray-600">仕入れ原価</span>
                  </div>
                  <span className="font-medium text-red-500">{fmt(result.purchase)}</span>
                </div>
              )}

              {/* 実利益 */}
              <div
                className={`mt-4 rounded-xl p-4 text-center ${
                  result.profit < 0 ? "bg-red-50 border-2 border-red-300" : "bg-[#FF0211]/5 border-2 border-[#FF0211]/20"
                }`}
              >
                <p className="text-sm font-medium text-gray-500 mb-1">実利益</p>
                <p
                  className={`text-4xl font-extrabold tracking-tight ${
                    result.profit < 0 ? "text-red-600" : "text-[#FF0211]"
                  }`}
                >
                  {fmt(result.profit)}
                </p>
                {result.profit < 0 && (
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    赤字です。価格を上げるか、コストを下げてください。
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  利益率：
                  <span
                    className={`font-semibold ${
                      result.margin < 0 ? "text-red-600" : result.margin >= 20 ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {result.margin.toFixed(1)}%
                  </span>
                </p>
                {mode === "reverse" && (
                  <p className="text-sm text-gray-500 mt-1">
                    必要な販売価格：
                    <span className="font-semibold text-gray-800">{fmt(result.price)}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-48">
              <p className="text-gray-400 text-sm">
                {mode === "forward" ? "販売価格" : "目標利益"}を入力すると計算結果が表示されます
              </p>
            </div>
          )}

          {/* 複数出品シミュレーション */}
          {result && result.profit > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">複数出品シミュレーション</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    出品数（個）
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0211]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    目標合計金額（¥）
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={targetTotal}
                    onChange={(e) => setTargetTotal(e.target.value)}
                    placeholder="例: 10000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF0211]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {totalProfit !== null && simQty > 0 && (
                  <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {simQty}個売った場合の合計利益
                    </span>
                    <span className="font-bold text-[#FF0211]">{fmt(totalProfit)}</span>
                  </div>
                )}
                {itemsNeeded !== null && (
                  <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {fmt(simTarget)}を達成するのに必要な出品数
                    </span>
                    <span className="font-bold text-gray-800">{itemsNeeded.toLocaleString()}個</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 配送方法比較表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">配送方法比較（らくらく vs ゆうゆう）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-600">サイズ</th>
                <th className="text-center py-2 px-3 font-semibold text-orange-600">らくらく（ヤマト）</th>
                <th className="text-center py-2 px-3 font-semibold text-red-600">ゆうゆう（郵便）</th>
                <th className="text-center py-2 pl-3 font-semibold text-green-600">最安</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_PAIRS.map((pair) => {
                const cheaper =
                  pair.rakuraku.fee < pair.yuyuu.fee
                    ? "rakuraku"
                    : pair.yuyuu.fee < pair.rakuraku.fee
                    ? "yuyuu"
                    : "same";
                return (
                  <tr key={pair.label} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pr-4 text-gray-700 font-medium">{pair.label}</td>
                    <td
                      className={`text-center py-3 px-3 font-medium ${
                        cheaper === "rakuraku" ? "text-orange-600 font-bold" : "text-gray-600"
                      }`}
                    >
                      {pair.rakuraku.name}
                      <br />
                      <span className="text-xs">{fmt(pair.rakuraku.fee)}</span>
                    </td>
                    <td
                      className={`text-center py-3 px-3 font-medium ${
                        cheaper === "yuyuu" ? "text-red-600 font-bold" : "text-gray-600"
                      }`}
                    >
                      {pair.yuyuu.name}
                      <br />
                      <span className="text-xs">{fmt(pair.yuyuu.fee)}</span>
                    </td>
                    <td className="text-center py-3 pl-3">
                      {cheaper === "same" ? (
                        <span className="text-xs text-gray-400">同額</span>
                      ) : (
                        <span className="text-xs font-bold text-green-600">
                          {cheaper === "rakuraku" ? "らくらく" : "ゆうゆう"}
                          <br />
                          {fmt(Math.abs(pair.rakuraku.fee - pair.yuyuu.fee))}安
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 注記 */}
      <p className="text-xs text-gray-400 text-center pb-4">
        ※ 手数料・送料は変更される場合があります。最新情報はメルカリ公式サイトでご確認ください。
      </p>
    </div>
  );
}
