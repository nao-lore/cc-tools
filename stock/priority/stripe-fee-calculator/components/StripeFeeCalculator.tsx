"use client";

import { useState, useMemo } from "react";

// --- 手数料定数 ---
const CARD_RATE = 0.036; // 3.6%
const CONVENIENCE_RATE = 0.036; // 3.6%
const CONVENIENCE_CAP = 190; // ¥190上限
const BANK_TRANSFER_FEE = 190; // ¥190/件
const LINK_RATE = 0.036; // 3.6%
const APPLE_GOOGLE_PAY_RATE = 0.036; // 3.6%（カード手数料と同率）

// 振込手数料
const AUTO_PAYOUT_FEE = 0; // 無料
const INSTANT_PAYOUT_RATE = 0.005; // 0.5%
const INSTANT_PAYOUT_FIXED = 250; // ¥250

// 他社比較データ
type CompetitorRow = {
  name: string;
  cardRate: string;
  convenienceRate: string;
  monthlyFee: string;
  notes: string;
};

const COMPETITORS: CompetitorRow[] = [
  { name: "Stripe", cardRate: "3.6%", convenienceRate: "3.6%（¥190上限）", monthlyFee: "無料", notes: "即時振込: 0.5%+¥250" },
  { name: "PayPal", cardRate: "3.6%+¥40", convenienceRate: "非対応", monthlyFee: "無料", notes: "海外送金対応" },
  { name: "Square", cardRate: "3.25%〜3.75%", convenienceRate: "非対応", monthlyFee: "無料", notes: "実店舗向け強み" },
  { name: "PAY.JP", cardRate: "3.0%〜", convenienceRate: "非対応", monthlyFee: "¥1,980〜", notes: "国内特化" },
];

type PaymentMethod = "card" | "convenience" | "bank" | "link" | "apple_google";

type MethodConfig = {
  id: PaymentMethod;
  label: string;
  icon: string;
  description: string;
};

const METHODS: MethodConfig[] = [
  { id: "card", label: "クレジットカード", icon: "💳", description: "国内・JCB 3.6%" },
  { id: "convenience", label: "コンビニ決済", icon: "🏪", description: "3.6%（¥190上限）" },
  { id: "bank", label: "銀行振込", icon: "🏦", description: "¥190/件（顧客手数料別）" },
  { id: "link", label: "Link（ワンクリック）", icon: "⚡", description: "国内 3.6%" },
  { id: "apple_google", label: "Apple/Google Pay", icon: "📱", description: "カード同率 3.6%" },
];

function fmtJPY(n: number): string {
  if (n < 1 && n > 0) return `¥${n.toFixed(2)}`;
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function fmtRate(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

function calcFee(method: PaymentMethod, amount: number): number {
  switch (method) {
    case "card":
      return amount * CARD_RATE;
    case "convenience": {
      const rateFee = amount * CONVENIENCE_RATE;
      return Math.min(rateFee, CONVENIENCE_CAP);
    }
    case "bank":
      return BANK_TRANSFER_FEE;
    case "link":
      return amount * LINK_RATE;
    case "apple_google":
      return amount * APPLE_GOOGLE_PAY_RATE;
    default:
      return 0;
  }
}

function calcPayoutFee(
  type: "auto" | "instant",
  netAmount: number,
  payoutCount: number
): number {
  if (type === "auto") return AUTO_PAYOUT_FEE;
  return netAmount * INSTANT_PAYOUT_RATE + INSTANT_PAYOUT_FIXED * payoutCount;
}

// タブの種類
type Tab = "single" | "monthly" | "payout" | "compare" | "surcharge";

export default function StripeFeeCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("single");

  // 1回計算
  const [singleAmount, setSingleAmount] = useState<number>(10000);
  const [singleMethod, setSingleMethod] = useState<PaymentMethod>("card");

  // 月間シミュレーション
  const [monthlyCount, setMonthlyCount] = useState<number>(100);
  const [monthlyAvg, setMonthlyAvg] = useState<number>(5000);
  const [monthlyMethod, setMonthlyMethod] = useState<PaymentMethod>("card");

  // 振込手数料
  const [payoutType, setPayoutType] = useState<"auto" | "instant">("auto");
  const [payoutCount, setPayoutCount] = useState<number>(4);
  const [payoutNetAmount, setPayoutNetAmount] = useState<number>(100000);

  // 損益分岐
  const [surchargeAmount, setSurchargeAmount] = useState<number>(10000);
  const [surchargeMethod, setSurchargeMethod] = useState<PaymentMethod>("card");

  // --- 計算 ---
  const singleFee = useMemo(() => calcFee(singleMethod, singleAmount), [singleMethod, singleAmount]);
  const singleNet = useMemo(() => singleAmount - singleFee, [singleAmount, singleFee]);
  const singleEffectiveRate = useMemo(() => (singleAmount > 0 ? singleFee / singleAmount : 0), [singleFee, singleAmount]);

  const monthlyFeePerTx = useMemo(() => calcFee(monthlyMethod, monthlyAvg), [monthlyMethod, monthlyAvg]);
  const monthlyTotalFee = useMemo(() => monthlyFeePerTx * monthlyCount, [monthlyFeePerTx, monthlyCount]);
  const monthlyTotalRevenue = useMemo(() => monthlyAvg * monthlyCount, [monthlyAvg, monthlyCount]);
  const monthlyNet = useMemo(() => monthlyTotalRevenue - monthlyTotalFee, [monthlyTotalRevenue, monthlyTotalFee]);
  const monthlyEffectiveRate = useMemo(
    () => (monthlyTotalRevenue > 0 ? monthlyTotalFee / monthlyTotalRevenue : 0),
    [monthlyTotalFee, monthlyTotalRevenue]
  );

  const payoutFee = useMemo(
    () => calcPayoutFee(payoutType, payoutNetAmount, payoutCount),
    [payoutType, payoutNetAmount, payoutCount]
  );

  const surchargeFee = useMemo(() => calcFee(surchargeMethod, surchargeAmount), [surchargeMethod, surchargeAmount]);
  const surchargeRate = useMemo(
    () => (surchargeAmount > 0 ? surchargeFee / surchargeAmount : 0),
    [surchargeFee, surchargeAmount]
  );
  const surchargePriceNeeded = useMemo(
    () => (surchargeAmount > 0 && surchargeRate < 1 ? surchargeAmount / (1 - surchargeRate) : 0),
    [surchargeAmount, surchargeRate]
  );
  const surchargeAddAmount = useMemo(
    () => surchargePriceNeeded - surchargeAmount,
    [surchargePriceNeeded, surchargeAmount]
  );
  const surchargeAddRate = useMemo(
    () => (surchargeAmount > 0 ? surchargeAddAmount / surchargeAmount : 0),
    [surchargeAddAmount, surchargeAmount]
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: "single", label: "1回計算" },
    { id: "monthly", label: "月間シミュ" },
    { id: "payout", label: "振込手数料" },
    { id: "compare", label: "他社比較" },
    { id: "surcharge", label: "転嫁計算" },
  ];

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 1回計算 ===== */}
      {activeTab === "single" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">売上金額と決済方法</h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">売上金額（1回あたり）</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">¥</span>
                <input
                  type="number"
                  min={1}
                  step={100}
                  value={singleAmount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v) && v >= 0) setSingleAmount(v);
                  }}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[1000, 3000, 5000, 10000, 30000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSingleAmount(preset)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      singleAmount === preset
                        ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    ¥{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">決済方法</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSingleMethod(m.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      singleMethod === m.id
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{m.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 結果 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-base font-semibold text-indigo-100 mb-4">計算結果</h2>

            <div className="mb-5">
              <div className="text-indigo-200 text-xs mb-1">実収入（手数料差し引き後）</div>
              <div className="text-5xl font-bold">{fmtJPY(singleNet)}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <div className="text-indigo-200 text-xs mb-1">売上</div>
                <div className="font-bold text-lg">{fmtJPY(singleAmount)}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <div className="text-indigo-200 text-xs mb-1">手数料</div>
                <div className="font-bold text-lg text-red-300">{fmtJPY(singleFee)}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <div className="text-indigo-200 text-xs mb-1">実効手数料率</div>
                <div className="font-bold text-lg">{fmtRate(singleEffectiveRate)}</div>
              </div>
            </div>

            {singleMethod === "convenience" && singleAmount >= 5278 && (
              <div className="mt-4 text-xs text-indigo-200 bg-white bg-opacity-10 rounded-lg px-3 py-2">
                ¥5,278以上のため手数料は¥190の上限固定です
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 月間シミュレーション ===== */}
      {activeTab === "monthly" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">月間シミュレーション</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月間取引件数</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={10000}
                    step={1}
                    value={monthlyCount}
                    onChange={(e) => setMonthlyCount(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      value={monthlyCount}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v) && v > 0) setMonthlyCount(v);
                      }}
                      className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">件/月</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">平均単価</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">¥</span>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={monthlyAvg}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= 0) setMonthlyAvg(v);
                    }}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[1000, 3000, 5000, 10000, 30000, 50000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setMonthlyAvg(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        monthlyAvg === preset
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      ¥{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">決済方法</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMonthlyMethod(m.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        monthlyMethod === m.id
                          ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{m.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 月間結果 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-base font-semibold text-indigo-100 mb-4">月間集計</h2>

            <div className="mb-5">
              <div className="text-indigo-200 text-xs mb-1">月間実収入</div>
              <div className="text-4xl font-bold">{fmtJPY(monthlyNet)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white bg-opacity-15 rounded-xl p-3">
                <div className="text-indigo-200 text-xs mb-1">月間売上</div>
                <div className="font-bold text-xl">{fmtJPY(monthlyTotalRevenue)}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-3">
                <div className="text-indigo-200 text-xs mb-1">月間手数料合計</div>
                <div className="font-bold text-xl text-red-300">{fmtJPY(monthlyTotalFee)}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
                <div className="text-indigo-200 text-xs mb-1">取引件数</div>
                <div className="font-bold">{monthlyCount.toLocaleString()}件</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
                <div className="text-indigo-200 text-xs mb-1">1件あたり手数料</div>
                <div className="font-bold">{fmtJPY(monthlyFeePerTx)}</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
                <div className="text-indigo-200 text-xs mb-1">実効手数料率</div>
                <div className="font-bold">{fmtRate(monthlyEffectiveRate)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 振込手数料 ===== */}
      {activeTab === "payout" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">振込手数料（Stripe → 事業者口座）</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">振込タイプ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPayoutType("auto")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      payoutType === "auto"
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">自動振込</div>
                    <div className="text-sm text-green-600 font-medium">無料</div>
                    <div className="text-xs text-gray-500 mt-1">最低¥500/回、通常2〜4営業日</div>
                  </button>
                  <button
                    onClick={() => setPayoutType("instant")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      payoutType === "instant"
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">即時振込</div>
                    <div className="text-sm text-amber-600 font-medium">0.5% + ¥250/回</div>
                    <div className="text-xs text-gray-500 mt-1">30分以内着金</div>
                  </button>
                </div>
              </div>

              {payoutType === "instant" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">振込金額（Stripe残高）</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">¥</span>
                      <input
                        type="number"
                        min={500}
                        step={1000}
                        value={payoutNetAmount}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v) && v >= 0) setPayoutNetAmount(v);
                        }}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">月間振込回数</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={1}
                        max={30}
                        step={1}
                        value={payoutCount}
                        onChange={(e) => setPayoutCount(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={payoutCount}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (!isNaN(v) && v > 0) setPayoutCount(Math.min(v, 30));
                          }}
                          className="w-20 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">回/月</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 振込結果 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-base font-semibold text-indigo-100 mb-4">振込手数料</h2>

            {payoutType === "auto" ? (
              <div>
                <div className="text-indigo-200 text-xs mb-1">月間振込手数料</div>
                <div className="text-5xl font-bold">¥0</div>
                <div className="text-indigo-200 text-sm mt-3">自動振込は無料です（最低¥500/回）</div>
              </div>
            ) : (
              <div>
                <div className="text-indigo-200 text-xs mb-1">月間振込手数料合計</div>
                <div className="text-5xl font-bold text-red-300">{fmtJPY(payoutFee)}</div>
                <div className="mt-4 bg-white bg-opacity-10 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>比率手数料 ({fmtJPY(payoutNetAmount)} × 0.5%)</span>
                    <span>{fmtJPY(payoutNetAmount * INSTANT_PAYOUT_RATE)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>固定手数料 (¥250 × {payoutCount}回)</span>
                    <span>{fmtJPY(INSTANT_PAYOUT_FIXED * payoutCount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white border-opacity-20 pt-1 mt-1 font-semibold">
                    <span>合計</span>
                    <span>{fmtJPY(payoutFee)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 他社比較 ===== */}
      {activeTab === "compare" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">他社比較</h2>
            <p className="text-xs text-gray-500 mb-5">日本主要決済サービスのカード手数料比較</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">サービス</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">カード手数料</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">コンビニ</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">月額</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">備考</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((row, i) => (
                    <tr
                      key={row.name}
                      className={`border-b border-gray-50 ${
                        i === 0 ? "bg-indigo-50" : ""
                      }`}
                    >
                      <td className="py-3 pr-4">
                        <span
                          className={`font-semibold text-sm ${
                            i === 0 ? "text-indigo-700" : "text-gray-900"
                          }`}
                        >
                          {row.name}
                          {i === 0 && (
                            <span className="ml-1.5 text-xs font-normal text-indigo-500">← このツール</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700 text-sm">{row.cardRate}</td>
                      <td className="py-3 pr-4 text-gray-700 text-sm">{row.convenienceRate}</td>
                      <td className="py-3 pr-4 text-gray-700 text-sm">{row.monthlyFee}</td>
                      <td className="py-3 text-gray-500 text-xs">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              手数料は2026年時点の公開情報を基にしています。最新情報は各社公式サイトをご確認ください。
            </p>
          </div>

          {/* ポイント解説 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Stripe を選ぶメリット</h2>
            <div className="space-y-3">
              {[
                { icon: "✅", title: "初期費用・月額費用ゼロ", desc: "使った分だけ支払い。固定費不要。" },
                { icon: "🌏", title: "海外カード・複数通貨対応", desc: "海外顧客への販売も追加費用なし（為替手数料は別）。" },
                { icon: "⚡", title: "コンビニ¥190上限が強み", desc: "高額決済ではコンビニ払いが最安。¥5,278超で¥190固定。" },
                { icon: "🔧", title: "API・開発者体験が最高水準", desc: "Webhook、Billing、Connect等の豊富な機能。" },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== 転嫁計算 ===== */}
      {activeTab === "surcharge" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">手数料を顧客に転嫁する場合</h2>
            <p className="text-xs text-gray-500 mb-5">
              「希望受取額」を入力すると、手数料込みの請求価格と必要な上乗せ率を計算します。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">希望実収入（税抜）</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">¥</span>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={surchargeAmount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= 0) setSurchargeAmount(v);
                    }}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[1000, 3000, 5000, 10000, 30000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSurchargeAmount(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        surchargeAmount === preset
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      ¥{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">決済方法</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSurchargeMethod(m.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        surchargeMethod === m.id
                          ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <div className="font-medium text-gray-900 text-xs">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 転嫁結果 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-base font-semibold text-indigo-100 mb-4">転嫁後の請求価格</h2>

            <div className="mb-5">
              <div className="text-indigo-200 text-xs mb-1">顧客への請求価格</div>
              <div className="text-5xl font-bold">{fmtJPY(surchargePriceNeeded)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white bg-opacity-15 rounded-xl p-3">
                <div className="text-indigo-200 text-xs mb-1">上乗せ金額</div>
                <div className="font-bold text-xl">{fmtJPY(surchargeAddAmount)}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-3">
                <div className="text-indigo-200 text-xs mb-1">上乗せ率</div>
                <div className="font-bold text-xl">{fmtRate(surchargeAddRate)}</div>
              </div>
            </div>

            <div className="mt-4 bg-white bg-opacity-10 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span>希望実収入</span>
                <span>{fmtJPY(surchargeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Stripe手数料（請求額にかかる分）</span>
                <span>{fmtJPY(surchargeAddAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-white border-opacity-20 pt-1 mt-1 font-semibold">
                <span>顧客への請求価格</span>
                <span>{fmtJPY(surchargePriceNeeded)}</span>
              </div>
            </div>

            <p className="text-indigo-200 text-xs mt-3">
              ※ 手数料転嫁（サーチャージ）はStripeの利用規約・カードブランドルールを事前にご確認ください。
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        手数料は2026年時点の情報です。最新の料金はStripe公式サイトをご確認ください。
      </p>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "タブを選択", desc: "「1回計算」で単発の手数料確認、「月間シミュ」で月間収益シミュレーション、「転嫁計算」で顧客への手数料転嫁価格を計算できます。" },
            { step: "2", title: "決済金額を入力", desc: "売上金額を入力するかプリセットボタンを選択します。プリセットには ¥1,000〜¥100,000 の代表的な金額が用意されています。" },
            { step: "3", title: "決済方法を選択", desc: "クレジットカード・コンビニ決済・銀行振込など、実際に使用する決済方法を選択します。コンビニ決済は ¥5,278 以上で ¥190 の上限固定になります。" },
            { step: "4", title: "結果を確認", desc: "手数料・実収入・実効手数料率が表示されます。月間シミュでは年間換算も参考にしてください。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">{item.step}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問（FAQ）</h2>
        <div className="space-y-4">
          {[
            {
              q: "Stripe の手数料は日本でいくら？",
              a: "国内発行カードは 3.6%、コンビニ決済は 3.6%（¥190 上限）、銀行振込は ¥190/件です。月額固定費は不要で使った分だけ支払います。",
            },
            {
              q: "Stripe でコンビニ決済を使うメリットは？",
              a: "¥5,278 以上の決済では手数料が ¥190 の上限に固定されるため、高額商品ではカード決済より実質手数料率が低くなります。例えば ¥50,000 の決済なら手数料はわずか ¥190（実効 0.38%）です。",
            },
            {
              q: "Stripe の振込（ペイアウト）手数料は？",
              a: "自動振込は無料です。即時振込（30 分以内着金）は 0.5% + ¥250/回の手数料がかかります。週次・月次の自動振込を使えばコストゼロで資金を口座に移動できます。",
            },
            {
              q: "Stripe と PayPal、どちらが安い？",
              a: "国内取引なら Stripe の 3.6% に対し PayPal は 3.6%+¥40/件のため、少額決済では PayPal の方が割高になります。海外顧客への販売が多い場合は PayPal の知名度も考慮してください。",
            },
            {
              q: "Stripe の手数料を顧客に転嫁（サーチャージ）できる？",
              a: "法律上は禁止されていませんが、Stripe の利用規約およびカードブランドルール（Visa・Mastercard 等）で制限される場合があります。転嫁する場合は事前にご確認ください。このツールの「転嫁計算」タブで必要な上乗せ金額を計算できます。",
            },
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-gray-800 text-sm mb-1">{item.q}</div>
              <div className="text-sm text-gray-600">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== JSON-LD FAQPage ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Stripe の手数料は日本でいくら？",
                "acceptedAnswer": { "@type": "Answer", "text": "国内発行カードは 3.6%、コンビニ決済は 3.6%（¥190 上限）、銀行振込は ¥190/件です。月額固定費は不要です。" },
              },
              {
                "@type": "Question",
                "name": "Stripe でコンビニ決済を使うメリットは？",
                "acceptedAnswer": { "@type": "Answer", "text": "¥5,278 以上の決済では手数料が ¥190 の上限に固定されるため、高額商品ではカード決済より実質手数料率が低くなります。" },
              },
              {
                "@type": "Question",
                "name": "Stripe の振込手数料は？",
                "acceptedAnswer": { "@type": "Answer", "text": "自動振込は無料です。即時振込は 0.5% + ¥250/回かかります。" },
              },
              {
                "@type": "Question",
                "name": "Stripe の手数料を顧客に転嫁できる？",
                "acceptedAnswer": { "@type": "Answer", "text": "Stripe の利用規約およびカードブランドルールを事前に確認してください。転嫁計算タブで必要な上乗せ金額を計算できます。" },
              },
            ],
          }),
        }}
      />

      {/* ===== 関連ツール ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/mercari-tesuryou", title: "メルカリ手数料計算", desc: "フリマアプリ販売時の手数料・利益を自動計算。" },
            { href: "/shopify-fee-jp", title: "Shopify 手数料計算", desc: "Shopify プラン別の決済手数料と月額費用を試算。" },
            { href: "/paypal-fee-jp", title: "PayPal 手数料計算", desc: "PayPal の国内・海外送金手数料を計算。Stripe との比較に。" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
            >
              <div className="font-medium text-gray-800 text-sm group-hover:text-indigo-700">{link.title}</div>
              <div className="text-xs text-gray-500 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Stripe 手数料計算",
  "description": "Stripeの決済手数料を決済方法別に計算。売上から手数料を引いた実収入を即座に確認",
  "url": "https://tools.loresync.dev/stripe-fee-calculator",
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
