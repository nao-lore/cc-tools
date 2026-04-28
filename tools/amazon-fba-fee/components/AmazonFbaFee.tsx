"use client";
import { useState, useCallback } from "react";

// ---- カテゴリ別販売手数料 ----
type Category = {
  id: string;
  name: string;
  rate: number;
  minFee?: number;
};

const CATEGORIES: Category[] = [
  { id: "electronics", name: "家電・カメラ・AV機器", rate: 0.08, minFee: 30 },
  { id: "pc", name: "パソコン・周辺機器", rate: 0.08, minFee: 30 },
  { id: "books", name: "本・コミック・雑誌", rate: 0.15, minFee: 1 },
  { id: "music", name: "CD・レコード", rate: 0.15, minFee: 1 },
  { id: "dvd", name: "DVD・Blu-ray", rate: 0.15, minFee: 1 },
  { id: "toys", name: "おもちゃ・ホビー", rate: 0.10, minFee: 30 },
  { id: "sports", name: "スポーツ・アウトドア", rate: 0.10, minFee: 30 },
  { id: "clothing", name: "服・ファッション小物", rate: 0.10, minFee: 30 },
  { id: "beauty", name: "ビューティー・ヘルスケア", rate: 0.08, minFee: 30 },
  { id: "food", name: "食品・飲料・お酒", rate: 0.08, minFee: 30 },
  { id: "home", name: "ホーム・キッチン", rate: 0.10, minFee: 30 },
  { id: "tools", name: "DIY・工具・ガーデン", rate: 0.12, minFee: 30 },
  { id: "automotive", name: "車・バイク用品", rate: 0.10, minFee: 30 },
  { id: "other", name: "その他（汎用）", rate: 0.10, minFee: 30 },
];

// ---- FBAサイズ区分 ----
type FbaSize = {
  id: string;
  name: string;
  fee: number;
  maxWeight: number; // kg
  maxL: number; // cm
  maxM: number; // cm
  maxS: number; // cm
  note: string;
};

// 2024年日本Amazon FBA配送代行手数料（参考値）
const FBA_SIZES: FbaSize[] = [
  {
    id: "small",
    name: "小型",
    fee: 288,
    maxWeight: 1,
    maxL: 35,
    maxM: 25,
    maxS: 12,
    note: "35×25×12cm・1kg以下",
  },
  {
    id: "standard_s",
    name: "標準（小）",
    fee: 434,
    maxWeight: 2,
    maxL: 60,
    maxM: 40,
    maxS: 40,
    note: "60×40×40cm・2kg以下",
  },
  {
    id: "standard_m",
    name: "標準（中）",
    fee: 514,
    maxWeight: 5,
    maxL: 80,
    maxM: 60,
    maxS: 60,
    note: "80×60×60cm・5kg以下",
  },
  {
    id: "standard_l",
    name: "標準（大）",
    fee: 714,
    maxWeight: 9,
    maxL: 100,
    maxM: 60,
    maxS: 60,
    note: "100×60×60cm・9kg以下",
  },
  {
    id: "large",
    name: "大型",
    fee: 1080,
    maxWeight: 15,
    maxL: 120,
    maxM: 75,
    maxS: 75,
    note: "120×75×75cm・15kg以下",
  },
  {
    id: "xlarge",
    name: "特大型",
    fee: 1620,
    maxWeight: 25,
    maxL: 150,
    maxM: 100,
    maxS: 100,
    note: "150×100×100cm・25kg以下",
  },
];

// ---- 月額保管料（参考：¥0.045/1,000cm³/月） ----
const STORAGE_RATE_NORMAL = 0.045; // ¥/1,000cm³/月（通常）
const STORAGE_RATE_LONG = 0.17; // ¥/1,000cm³/月（365日超）
const MONTHLY_FEE_PRO = 4900; // 大口出品 月額登録料

// ---- ユーティリティ ----
const fmt = (n: number) =>
  n.toLocaleString("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });

const parseNum = (v: string): number => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
};

function detectSize(l: number, m: number, s: number, w: number): FbaSize {
  for (const size of FBA_SIZES) {
    const sorted = [l, m, s].sort((a, b) => b - a);
    if (
      sorted[0] <= size.maxL &&
      sorted[1] <= size.maxM &&
      sorted[2] <= size.maxS &&
      w <= size.maxWeight
    ) {
      return size;
    }
  }
  return FBA_SIZES[FBA_SIZES.length - 1];
}

// ---- コンポーネント ----
export default function AmazonFbaFee() {
  // 入力
  const [salePrice, setSalePrice] = useState("");
  const [categoryId, setCategoryId] = useState("other");
  const [purchaseCost, setPurchaseCost] = useState("");
  const [monthlyQty, setMonthlyQty] = useState("10");

  // サイズ入力モード
  const [sizeMode, setSizeMode] = useState<"select" | "input">("select");
  const [selectedSizeId, setSelectedSizeId] = useState("standard_s");
  const [dimL, setDimL] = useState("");
  const [dimM, setDimM] = useState("");
  const [dimS, setDimS] = useState("");
  const [weight, setWeight] = useState("");

  // 保管・プラン
  const [storageMonths, setStorageMonths] = useState("1");
  const [isLongTerm, setIsLongTerm] = useState(false);
  const [isPro, setIsPro] = useState(true);

  // 自己発送比較
  const [selfShipFee, setSelfShipFee] = useState("500");

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId)!;

  const detectedSize: FbaSize = (() => {
    if (sizeMode === "select") {
      return FBA_SIZES.find((s) => s.id === selectedSizeId)!;
    }
    const l = parseNum(dimL);
    const m = parseNum(dimM);
    const s = parseNum(dimS);
    const w = parseNum(weight);
    if (l > 0 && m > 0 && s > 0 && w > 0) {
      return detectSize(l, m, s, w);
    }
    return FBA_SIZES.find((s) => s.id === selectedSizeId)!;
  })();

  const calc = useCallback(() => {
    const price = parseNum(salePrice);
    if (price <= 0) return null;

    // 販売手数料
    const rawFee = price * selectedCategory.rate;
    const salesFee = Math.max(Math.ceil(rawFee), selectedCategory.minFee ?? 0);

    // FBA配送代行手数料
    const fbaFee = detectedSize.fee;

    // 保管手数料（月額）
    const l = sizeMode === "input" ? parseNum(dimL) : 0;
    const m = sizeMode === "input" ? parseNum(dimM) : 0;
    const s = sizeMode === "input" ? parseNum(dimS) : 0;
    const volumeCm3 = l > 0 && m > 0 && s > 0 ? l * m * s : 0;
    const rate = isLongTerm ? STORAGE_RATE_LONG : STORAGE_RATE_NORMAL;
    const months = parseNum(storageMonths) || 1;
    const storageFeePerMonth = volumeCm3 > 0 ? (volumeCm3 / 1000) * rate : 0;
    const storageFeeTotal = storageFeePerMonth * months;

    // 仕入れ原価
    const purchase = parseNum(purchaseCost);

    // 月額登録料（大口）
    const monthlyFee = isPro ? MONTHLY_FEE_PRO : 0;

    // 月間販売数
    const qty = parseNum(monthlyQty) || 1;
    const monthlyFeePerItem = qty > 0 ? monthlyFee / qty : 0;

    // 利益計算
    const totalCostPerItem = salesFee + fbaFee + storageFeeTotal + purchase + monthlyFeePerItem;
    const profit = price - totalCostPerItem;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    // 月間利益
    const monthlyProfit = profit * qty;

    // 自己発送比較
    const selfShip = parseNum(selfShipFee);
    const selfProfit = price - salesFee - selfShip - purchase - monthlyFeePerItem;

    return {
      price,
      salesFee,
      fbaFee,
      storageFeePerMonth,
      storageFeeTotal,
      purchase,
      monthlyFeePerItem,
      totalCostPerItem,
      profit,
      margin,
      qty,
      monthlyProfit,
      selfProfit,
      selfShip,
      salesFeeRate: selectedCategory.rate,
    };
  }, [
    salePrice,
    selectedCategory,
    detectedSize,
    sizeMode,
    dimL,
    dimM,
    dimS,
    storageMonths,
    isLongTerm,
    purchaseCost,
    monthlyQty,
    isPro,
    selfShipFee,
  ]);

  const result = calc();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 入力パネル */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-800">商品情報</h2>

          {/* 販売価格 */}
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
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent text-lg"
              />
            </div>
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品カテゴリ
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}　({(c.rate * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              販売手数料率：<span className="font-semibold text-gray-600">{(selectedCategory.rate * 100).toFixed(0)}%</span>
              {selectedCategory.minFee ? `　最低手数料：¥${selectedCategory.minFee}` : ""}
            </p>
          </div>

          {/* サイズ・重量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品サイズ・重量</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSizeMode("select")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  sizeMode === "select"
                    ? "bg-[#FF9900] text-white border-[#FF9900]"
                    : "text-gray-500 border-gray-200 hover:border-[#FF9900]"
                }`}
              >
                区分から選ぶ
              </button>
              <button
                onClick={() => setSizeMode("input")}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  sizeMode === "input"
                    ? "bg-[#FF9900] text-white border-[#FF9900]"
                    : "text-gray-500 border-gray-200 hover:border-[#FF9900]"
                }`}
              >
                寸法を入力（自動判定）
              </button>
            </div>

            {sizeMode === "select" ? (
              <select
                value={selectedSizeId}
                onChange={(e) => setSelectedSizeId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              >
                {FBA_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}　¥{s.fee.toLocaleString()}　（{s.note}）
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "縦 (cm)", val: dimL, set: setDimL },
                    { label: "横 (cm)", val: dimM, set: setDimM },
                    { label: "高さ (cm)", val: dimS, set: setDimS },
                  ].map(({ label, val, set }) => (
                    <div key={label}>
                      <label className="block text-xs text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        min="0"
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">重量 (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                  />
                </div>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2">
              <span className="text-xs text-orange-700 font-medium">
                判定サイズ区分：
              </span>
              <span className="text-xs font-bold text-orange-900">
                {detectedSize.name}（FBA手数料 ¥{detectedSize.fee.toLocaleString()}）
              </span>
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
                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-sm"
              />
            </div>
          </div>

          {/* 保管期間・在庫設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">在庫保管設定（任意）</label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">保管期間（ヶ月）</label>
                  <input
                    type="number"
                    min="0"
                    value={storageMonths}
                    onChange={(e) => setStorageMonths(e.target.value)}
                    placeholder="1"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">月間販売数（個）</label>
                  <input
                    type="number"
                    min="1"
                    value={monthlyQty}
                    onChange={(e) => setMonthlyQty(e.target.value)}
                    placeholder="10"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLongTerm}
                  onChange={(e) => setIsLongTerm(e.target.checked)}
                  className="rounded accent-[#FF9900]"
                />
                <span className="text-xs text-gray-600">長期保管（365日超 ¥0.17/1,000cm³）</span>
              </label>
            </div>
          </div>

          {/* 出品プラン */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">出品プラン</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPro(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isPro
                    ? "bg-[#FF9900] text-white border-[#FF9900]"
                    : "text-gray-500 border-gray-200 hover:border-[#FF9900]"
                }`}
              >
                大口出品（¥4,900/月）
              </button>
              <button
                onClick={() => setIsPro(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  !isPro
                    ? "bg-[#FF9900] text-white border-[#FF9900]"
                    : "text-gray-500 border-gray-200 hover:border-[#FF9900]"
                }`}
              >
                小口出品（¥0）
              </button>
            </div>
            {isPro && (
              <p className="text-xs text-gray-400 mt-1">
                月間{monthlyQty || 1}個販売の場合、1個あたり ¥{Math.round(MONTHLY_FEE_PRO / (parseNum(monthlyQty) || 1)).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* 結果パネル */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* 費用内訳 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">費用内訳</h2>

                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-600">販売価格</span>
                  <span className="font-semibold text-gray-900">{fmt(result.price)}</span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold text-lg leading-none">−</span>
                    <span className="text-sm text-gray-600">
                      販売手数料（{(result.salesFeeRate * 100).toFixed(0)}%）
                    </span>
                  </div>
                  <span className="font-medium text-red-500">{fmt(result.salesFee)}</span>
                </div>

                <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold text-lg leading-none">−</span>
                    <span className="text-sm text-gray-600">
                      FBA配送代行手数料（{detectedSize.name}）
                    </span>
                  </div>
                  <span className="font-medium text-red-500">{fmt(result.fbaFee)}</span>
                </div>

                {result.storageFeeTotal > 0 && (
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-lg leading-none">−</span>
                      <span className="text-sm text-gray-600">
                        在庫保管料（{storageMonths}ヶ月）
                      </span>
                    </div>
                    <span className="font-medium text-red-500">{fmt(result.storageFeeTotal)}</span>
                  </div>
                )}

                {result.purchase > 0 && (
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-lg leading-none">−</span>
                      <span className="text-sm text-gray-600">仕入れ原価</span>
                    </div>
                    <span className="font-medium text-red-500">{fmt(result.purchase)}</span>
                  </div>
                )}

                {result.monthlyFeePerItem > 0 && (
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-lg leading-none">−</span>
                      <span className="text-sm text-gray-600">
                        月額登録料（1個あたり）
                      </span>
                    </div>
                    <span className="font-medium text-red-500">{fmt(result.monthlyFeePerItem)}</span>
                  </div>
                )}

                {/* 実利益 */}
                <div
                  className={`mt-4 rounded-xl p-4 text-center ${
                    result.profit < 0
                      ? "bg-red-50 border-2 border-red-300"
                      : "bg-orange-50 border-2 border-[#FF9900]/30"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-500 mb-1">1個あたり実利益</p>
                  <p
                    className={`text-4xl font-extrabold tracking-tight ${
                      result.profit < 0 ? "text-red-600" : "text-[#FF9900]"
                    }`}
                  >
                    {fmt(result.profit)}
                  </p>
                  {result.profit < 0 && (
                    <p className="text-sm font-semibold text-red-600 mt-1">
                      赤字です。販売価格を上げるかコストを下げてください。
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    利益率：
                    <span
                      className={`font-semibold ${
                        result.margin < 0
                          ? "text-red-600"
                          : result.margin >= 20
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {result.margin.toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>

              {/* 月間利益 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">月間利益シミュレーション</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-600">月{result.qty}個販売の合計利益</span>
                    <span
                      className={`font-bold text-lg ${
                        result.monthlyProfit < 0 ? "text-red-600" : "text-[#FF9900]"
                      }`}
                    >
                      {fmt(result.monthlyProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-600">月間総売上</span>
                    <span className="font-semibold text-gray-800">
                      {fmt(result.price * result.qty)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-gray-600">月間FBA手数料合計</span>
                    <span className="font-semibold text-red-500">
                      {fmt(result.fbaFee * result.qty)}
                    </span>
                  </div>
                </div>
              </div>

              {/* FBA vs 自己発送比較 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">FBA vs 自己発送 比較</h2>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    自己発送の送料
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">¥</span>
                    <input
                      type="number"
                      min="0"
                      value={selfShipFee}
                      onChange={(e) => setSelfShipFee(e.target.value)}
                      className="w-full pl-7 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9900] text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-xl p-4 text-center border-2 ${
                      result.profit >= result.selfProfit
                        ? "border-[#FF9900] bg-orange-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-500 mb-1">FBA利用</p>
                    <p
                      className={`text-2xl font-extrabold ${
                        result.profit < 0 ? "text-red-600" : "text-[#FF9900]"
                      }`}
                    >
                      {fmt(result.profit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">配送代行 {fmt(result.fbaFee)}</p>
                    {result.profit >= result.selfProfit && (
                      <span className="inline-block mt-2 text-xs font-bold text-[#FF9900] bg-orange-100 px-2 py-0.5 rounded-full">
                        有利
                      </span>
                    )}
                  </div>
                  <div
                    className={`rounded-xl p-4 text-center border-2 ${
                      result.selfProfit > result.profit
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-500 mb-1">自己発送</p>
                    <p
                      className={`text-2xl font-extrabold ${
                        result.selfProfit < 0 ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {fmt(result.selfProfit)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">送料 {fmt(result.selfShip)}</p>
                    {result.selfProfit > result.profit && (
                      <span className="inline-block mt-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        有利
                      </span>
                    )}
                  </div>
                </div>
                {Math.abs(result.profit - result.selfProfit) > 0 && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    差額：{fmt(Math.abs(result.profit - result.selfProfit))} /個
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-48">
              <p className="text-gray-400 text-sm">販売価格を入力すると計算結果が表示されます</p>
            </div>
          )}
        </div>
      </div>

      {/* FBAサイズ区分表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">FBAサイズ区分と配送代行手数料一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-600">区分</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">最大サイズ</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">最大重量</th>
                <th className="text-right py-2 pl-3 font-semibold text-[#FF9900]">手数料</th>
              </tr>
            </thead>
            <tbody>
              {FBA_SIZES.map((size) => (
                <tr
                  key={size.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    detectedSize.id === size.id ? "bg-orange-50" : ""
                  }`}
                >
                  <td className="py-3 pr-4 font-medium text-gray-800">
                    {size.name}
                    {detectedSize.id === size.id && (
                      <span className="ml-2 text-xs font-bold text-[#FF9900] bg-orange-100 px-1.5 py-0.5 rounded-full">
                        選択中
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 px-3 text-gray-600 text-xs">{size.note}</td>
                  <td className="text-center py-3 px-3 text-gray-600">{size.maxWeight} kg</td>
                  <td className="text-right py-3 pl-3 font-bold text-[#FF9900]">
                    ¥{size.fee.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* カテゴリ別販売手数料表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">カテゴリ別 販売手数料率</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-xl px-3 py-2.5 border ${
                cat.id === categoryId
                  ? "border-[#FF9900] bg-orange-50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <p className="text-xs font-medium text-gray-700 leading-snug">{cat.name}</p>
              <p className="text-sm font-bold text-[#FF9900] mt-0.5">
                {(cat.rate * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        ※ 手数料・サイズ区分はAmazon公式の変更により異なる場合があります。最新情報はAmazonセラーセントラルでご確認ください。
      </p>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAmazon FBA 手数料計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Amazon FBAの販売手数料・配送代行手数料・保管手数料を販売価格・サイズから計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAmazon FBA 手数料計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Amazon FBAの販売手数料・配送代行手数料・保管手数料を販売価格・サイズから計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Amazon FBA 手数料計算",
  "description": "Amazon FBAの販売手数料・配送代行手数料・保管手数料を販売価格・サイズから計算",
  "url": "https://tools.loresync.dev/amazon-fba-fee",
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
