"use client";

import { useState, useMemo } from "react";

// --- 定数 ---
const TAX_RATE_LOW = 0.1021; // 100万円以下
const TAX_RATE_HIGH = 0.2042; // 100万円超の超過分
const THRESHOLD = 1_000_000; // 100万円
const TAX_AT_THRESHOLD = 102_100; // 100万円の源泉徴収額

// --- 計算ロジック ---
function calcWithholding(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= THRESHOLD) {
    return Math.floor(amount * TAX_RATE_LOW);
  }
  return Math.floor((amount - THRESHOLD) * TAX_RATE_HIGH) + TAX_AT_THRESHOLD;
}

// 手取りから報酬額を逆算
// 手取り = 報酬 - 源泉
// 100万円以下の場合: 手取り = 報酬 × (1 - 0.1021) → 報酬 = 手取り / 0.8979
// 100万円超の場合: 手取り = 報酬 - ((報酬 - 100万) × 0.2042 + 102100)
//                         = 報酬 × (1 - 0.2042) + 100万 × 0.2042 - 102100
//                         = 報酬 × 0.7958 + 204200 - 102100
//                         = 報酬 × 0.7958 + 102100
//   → 報酬 = (手取り - 102100) / 0.7958
function calcRewardFromNet(net: number): number {
  if (net <= 0) return 0;
  // まず100万円以下として計算
  const rewardLow = net / (1 - TAX_RATE_LOW);
  if (rewardLow <= THRESHOLD) return Math.ceil(rewardLow);
  // 100万円超の場合
  const rewardHigh = (net - TAX_AT_THRESHOLD) / (1 - TAX_RATE_HIGH);
  return Math.ceil(rewardHigh);
}

// --- フォーマット ---
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtJPYInput(n: number): string {
  if (isNaN(n) || n === 0) return "";
  return Math.round(n).toLocaleString("ja-JP");
}

// 入力値のカンマ除去してparseInt
function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

// --- 対象報酬の一覧 ---
const TARGET_INCOMES = [
  { category: "原稿・講演・デザイン料", examples: "原稿料、翻訳料、著作権料、デザイン料、講演料、脚本料" },
  { category: "弁護士・司法書士等の報酬", examples: "弁護士、税理士、司法書士、社会保険労務士、行政書士" },
  { category: "外交員・集金人等の報酬", examples: "外交員報酬、集金人報酬、電力量計の検針人報酬" },
  { category: "プロスポーツ選手の報酬", examples: "プロ野球、サッカー、ゴルフ選手等への報酬" },
  { category: "芸能人・モデルの報酬", examples: "芸能人、テレビ出演料、モデル料" },
  { category: "ホステス等の報酬", examples: "バー・キャバレー等のホステス、コンパニオンへの報酬" },
];

// --- コンポーネント ---
type Mode = "forward" | "reverse";

export default function WithholdingTaxCalculator() {
  const [mode, setMode] = useState<Mode>("forward");

  // 順算: 報酬額入力
  const [rewardInput, setRewardInput] = useState<string>("");
  const [taxIncluded, setTaxIncluded] = useState<boolean>(false); // 消費税込みかどうか
  const [showConsumptionTax, setShowConsumptionTax] = useState<boolean>(true); // 消費税を別途記載するか
  const [consumptionTaxRate, setConsumptionTaxRate] = useState<10 | 8>(10);

  // 逆算: 手取り額入力
  const [netInput, setNetInput] = useState<string>("");

  // --- 計算 ---
  const forwardResult = useMemo(() => {
    const raw = parseAmount(rewardInput);
    if (!raw) return null;

    // 消費税の計算
    const taxBase = showConsumptionTax ? raw : raw; // 区分記載あり→税抜で計算
    const consumptionTax = showConsumptionTax ? Math.floor(raw * (consumptionTaxRate / 100)) : 0;
    const invoiceAmount = raw + consumptionTax;

    // 源泉徴収の計算基準
    // 消費税区分記載あり: 税抜金額で計算
    // 消費税区分記載なし(込み): 税込金額で計算
    const withholdingBase = showConsumptionTax ? taxBase : invoiceAmount;
    const withholding = calcWithholding(withholdingBase);
    const netPay = invoiceAmount - withholding;

    // 年間シミュレーション（月額想定）
    const annualWithholding = withholding * 12;
    const annualInvoice = invoiceAmount * 12;

    return {
      rewardExTax: raw,
      consumptionTax,
      invoiceAmount,
      withholding,
      netPay,
      annualWithholding,
      annualInvoice,
      isHighTier: withholdingBase > THRESHOLD,
      withholdingBase,
    };
  }, [rewardInput, showConsumptionTax, consumptionTaxRate]);

  const reverseResult = useMemo(() => {
    const net = parseAmount(netInput);
    if (!net) return null;

    const reward = calcRewardFromNet(net);
    const withholding = reward - net;
    const isHighTier = reward > THRESHOLD;

    return { reward, withholding, net, isHighTier };
  }, [netInput]);

  const handleRewardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setRewardInput(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };

  const handleNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setNetInput(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };

  return (
    <div className="space-y-6">
      {/* ===== モード切り替え ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2">
        {(["forward", "reverse"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === m
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {m === "forward" ? "順算（報酬額 → 源泉・手取り）" : "逆算（手取り → 請求額）"}
          </button>
        ))}
      </div>

      {/* ===== 順算モード ===== */}
      {mode === "forward" && (
        <>
          {/* 入力 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">報酬額を入力</h2>

            <div className="space-y-5">
              {/* 報酬額（税抜） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  報酬額（税抜）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={rewardInput}
                    onChange={handleRewardChange}
                    placeholder="500,000"
                    className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  />
                  <span className="text-gray-600 font-medium text-lg">円</span>
                </div>
              </div>

              {/* 消費税の取り扱い */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">消費税の取り扱い</div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType"
                      checked={showConsumptionTax}
                      onChange={() => setShowConsumptionTax(true)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">消費税を区分記載する（推奨）</div>
                      <div className="text-xs text-gray-500">請求書に消費税を別途明記 → 税抜金額で源泉計算</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="taxType"
                      checked={!showConsumptionTax}
                      onChange={() => setShowConsumptionTax(false)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">消費税込みで請求する</div>
                      <div className="text-xs text-gray-500">消費税が区分記載されていない → 税込金額で源泉計算</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 消費税率（区分記載あり時のみ） */}
              {showConsumptionTax && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">消費税率</div>
                  <div className="flex gap-2">
                    {([10, 8] as const).map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setConsumptionTaxRate(rate)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          consumptionTaxRate === rate
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 計算結果 */}
          {forwardResult && (
            <>
              {/* フロー図カード */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-base font-semibold opacity-90 mb-5">計算結果</h2>

                {/* フロー */}
                <div className="space-y-3">
                  {/* 報酬（税抜） */}
                  <div className="bg-white bg-opacity-15 rounded-xl p-4">
                    <div className="text-xs opacity-75 mb-1">報酬額（税抜）</div>
                    <div className="text-2xl font-bold">{fmtJPY(forwardResult.rewardExTax)}</div>
                  </div>

                  {showConsumptionTax && (
                    <>
                      <div className="flex items-center gap-2 px-2">
                        <div className="flex-1 border-t border-white border-opacity-30" />
                        <span className="text-xs opacity-60">+ 消費税（{consumptionTaxRate}%）</span>
                        <div className="flex-1 border-t border-white border-opacity-30" />
                      </div>
                      <div className="bg-white bg-opacity-10 rounded-xl p-4">
                        <div className="text-xs opacity-75 mb-1">消費税額</div>
                        <div className="text-2xl font-bold">+ {fmtJPY(forwardResult.consumptionTax)}</div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2 px-2">
                    <div className="flex-1 border-t border-white border-opacity-30" />
                    <span className="text-xs opacity-60">= 請求額</span>
                    <div className="flex-1 border-t border-white border-opacity-30" />
                  </div>

                  {/* 請求額 */}
                  <div className="bg-white bg-opacity-15 rounded-xl p-4">
                    <div className="text-xs opacity-75 mb-1">請求額（税込）</div>
                    <div className="text-2xl font-bold">{fmtJPY(forwardResult.invoiceAmount)}</div>
                  </div>

                  <div className="flex items-center gap-2 px-2">
                    <div className="flex-1 border-t border-white border-opacity-30" />
                    <span className="text-xs opacity-60">- 源泉徴収</span>
                    <div className="flex-1 border-t border-white border-opacity-30" />
                  </div>

                  {/* 源泉徴収税額 */}
                  <div className="bg-red-500 bg-opacity-40 rounded-xl p-4 border border-red-300 border-opacity-40">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs opacity-75 mb-1">源泉徴収税額</div>
                        <div className="text-2xl font-bold">- {fmtJPY(forwardResult.withholding)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          forwardResult.isHighTier
                            ? "bg-red-400 bg-opacity-50"
                            : "bg-white bg-opacity-20"
                        }`}>
                          {forwardResult.isHighTier ? "20.42%（超過分）" : "10.21%"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2">
                    <div className="flex-1 border-t border-white border-opacity-30" />
                    <span className="text-xs opacity-60">= 差引支払額</span>
                    <div className="flex-1 border-t border-white border-opacity-30" />
                  </div>

                  {/* 手取り */}
                  <div className="bg-white rounded-xl p-4 text-emerald-900">
                    <div className="text-xs text-emerald-700 mb-1">差引支払額（手取り）</div>
                    <div className="text-3xl font-bold text-emerald-700">{fmtJPY(forwardResult.netPay)}</div>
                  </div>
                </div>
              </div>

              {/* 計算根拠 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-3">計算根拠</h2>
                <div className="text-sm text-gray-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>源泉計算の基準額</span>
                    <span className="font-medium text-gray-900">{fmtJPY(forwardResult.withholdingBase)}</span>
                  </div>
                  {forwardResult.isHighTier ? (
                    <>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>100万円部分 × 10.21%</span>
                        <span>{fmtJPY(TAX_AT_THRESHOLD)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          超過分 {fmtJPY(forwardResult.withholdingBase - THRESHOLD)} × 20.42%
                        </span>
                        <span>{fmtJPY(forwardResult.withholding - TAX_AT_THRESHOLD)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{fmtJPY(forwardResult.withholdingBase)} × 10.21%</span>
                      <span>{fmtJPY(forwardResult.withholding)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-1.5 flex justify-between font-medium">
                    <span>源泉徴収税額合計</span>
                    <span className="text-gray-900">{fmtJPY(forwardResult.withholding)}</span>
                  </div>
                </div>
              </div>

              {/* 年間シミュレーション */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-1">年間シミュレーション</h2>
                <p className="text-xs text-gray-500 mb-4">この金額が毎月続いた場合の年間試算</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-emerald-700 mb-1">年間請求額（税込）</div>
                    <div className="text-xl font-bold text-emerald-800">{fmtJPY(forwardResult.annualInvoice)}</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <div className="text-xs text-red-700 mb-1">年間源泉徴収額</div>
                    <div className="text-xl font-bold text-red-800">{fmtJPY(forwardResult.annualWithholding)}</div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-xs font-medium text-amber-800 mb-1">確定申告での還付について</div>
                  <p className="text-xs text-amber-700">
                    源泉徴収された税額は確定申告で精算されます。経費控除・各種控除の結果、
                    実際の所得税が源泉徴収額より少なければ差額が還付されます。
                    年間 {fmtJPY(forwardResult.annualWithholding)} が概算の源泉徴収合計です。
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ===== 逆算モード ===== */}
      {mode === "reverse" && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">手取り額を入力</h2>
            <p className="text-sm text-gray-500 mb-4">
              実際に受け取りたい金額（差引支払額）から、必要な請求額を逆算します。
              消費税なし・税抜報酬額の逆算です。
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                手取り額（差引支払額）
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={netInput}
                  onChange={handleNetChange}
                  placeholder="450,000"
                  className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
                <span className="text-gray-600 font-medium text-lg">円</span>
              </div>
            </div>
          </div>

          {reverseResult && (
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-base font-semibold opacity-90 mb-5">逆算結果</h2>

              <div className="space-y-3">
                {/* 必要な請求額 */}
                <div className="bg-white rounded-xl p-4 text-emerald-900">
                  <div className="text-xs text-emerald-700 mb-1">必要な請求額（税抜報酬額）</div>
                  <div className="text-3xl font-bold text-emerald-700">{fmtJPY(reverseResult.reward)}</div>
                </div>

                <div className="flex items-center gap-2 px-2">
                  <div className="flex-1 border-t border-white border-opacity-30" />
                  <span className="text-xs opacity-60">- 源泉徴収</span>
                  <div className="flex-1 border-t border-white border-opacity-30" />
                </div>

                <div className="bg-red-500 bg-opacity-40 rounded-xl p-4 border border-red-300 border-opacity-40">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs opacity-75 mb-1">源泉徴収税額</div>
                      <div className="text-2xl font-bold">- {fmtJPY(reverseResult.withholding)}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      reverseResult.isHighTier ? "bg-red-400 bg-opacity-50" : "bg-white bg-opacity-20"
                    }`}>
                      {reverseResult.isHighTier ? "20.42%（超過分）" : "10.21%"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-2">
                  <div className="flex-1 border-t border-white border-opacity-30" />
                  <span className="text-xs opacity-60">= 手取り</span>
                  <div className="flex-1 border-t border-white border-opacity-30" />
                </div>

                <div className="bg-white bg-opacity-15 rounded-xl p-4">
                  <div className="text-xs opacity-75 mb-1">差引支払額（手取り）</div>
                  <div className="text-2xl font-bold">{fmtJPY(reverseResult.net)}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== 対象報酬の解説 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">源泉徴収の対象となる報酬</h2>
        <p className="text-xs text-gray-500 mb-4">
          以下の報酬・料金は所得税法第204条により源泉徴収が必要です。
        </p>

        <div className="space-y-2">
          {TARGET_INCOMES.map((item) => (
            <div key={item.category} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-800">{item.category}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.examples}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-medium">法人への支払い</span>は原則として源泉徴収不要（一部例外あり）。
            個人事業主への報酬に適用されます。
          </p>
        </div>
      </div>

      {/* ===== 税率の解説 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">源泉徴収税率の内訳</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-emerald-200 rounded-xl p-4">
            <div className="text-xs text-emerald-700 font-medium mb-2">100万円以下の部分</div>
            <div className="text-2xl font-bold text-gray-900">10.21%</div>
            <div className="text-xs text-gray-500 mt-1">所得税 10% + 復興特別所得税 0.21%</div>
          </div>
          <div className="border border-orange-200 rounded-xl p-4">
            <div className="text-xs text-orange-700 font-medium mb-2">100万円超の超過部分</div>
            <div className="text-2xl font-bold text-gray-900">20.42%</div>
            <div className="text-xs text-gray-500 mt-1">所得税 20% + 復興特別所得税 0.42%</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          復興特別所得税は2013年〜2037年の25年間、所得税額の2.1%が加算されます。
        </div>
      </div>

      {/* ===== 免責・参考リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500 mb-2">
          本ツールは概算計算を目的としており、実際の税額と異なる場合があります。
          正確な判断は税理士等の専門家にご相談ください。
        </p>
        <a
          href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/gensen.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 hover:text-emerald-700 underline"
        >
          国税庁「源泉徴収のあらまし」を確認する
        </a>
      </div>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">源泉徴収計算ツールの使い方</h2>
        <ol className="space-y-4">
          {[
            { step: "1", title: "モードを選択", desc: "「順算」は報酬額から源泉徴収額と手取りを計算します。「逆算」は受け取りたい手取り額から必要な請求額を算出します。" },
            { step: "2", title: "報酬額を入力", desc: "税抜の報酬額を入力してください。消費税を区分記載する場合は税抜金額が源泉計算の基準になります（推奨）。" },
            { step: "3", title: "消費税の取り扱いを選択", desc: "請求書に消費税を別途明記する場合は「区分記載する」を選択。税込一括請求の場合は「税込みで請求する」を選択します。" },
            { step: "4", title: "結果を確認・コピー", desc: "源泉徴収税額・請求額・手取り額がフロー形式で表示されます。年間シミュレーションで確定申告での還付額の目安も確認できます。" },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">よくある質問（FAQ）</h2>
        {[
          {
            q: "源泉徴収の対象になる報酬と対象外の報酬の違いは何ですか？",
            a: "所得税法第204条に列挙されたもの（原稿料・デザイン料・翻訳料・弁護士・税理士・司法書士報酬など）が対象です。物品の売買代金やシステム開発費（請負）などは原則対象外です。",
          },
          {
            q: "報酬が100万円を超えると税率が変わるのはなぜですか？",
            a: "所得税法の規定により、1回の支払いが100万円を超える部分は税率が10.21%から20.42%に上がります。100万円以下の部分は10.21%のまま計算し、超過分に20.42%を適用して合算します。",
          },
          {
            q: "消費税を区分記載すると源泉徴収額が減るのはなぜですか？",
            a: "消費税を請求書に明記（区分記載）した場合、源泉徴収の計算基準は税抜の報酬額になります。税込で請求すると税込金額全体が基準になるため源泉徴収額が多くなります。",
          },
          {
            q: "法人への支払いでも源泉徴収は必要ですか？",
            a: "原則不要です。源泉徴収は個人事業主への報酬に適用されます。ただし弁護士法人など一部の法人への特定報酬は例外的に源泉徴収が必要な場合があります。",
          },
          {
            q: "源泉徴収された税金は確定申告で戻ってきますか？",
            a: "確定申告で源泉徴収額を申告すると、実際の所得税額との差額が還付または追加納税になります。経費控除・各種所得控除後の実際の税額が源泉徴収総額より少なければ差額が還付されます。",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <p className="text-sm font-semibold text-emerald-700 mb-1">Q. {q}</p>
            <p className="text-xs text-gray-600">A. {a}</p>
          </div>
        ))}
      </div>

      {/* ===== 関連ツール ===== */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
        <h2 className="text-sm font-semibold text-emerald-800 mb-3">関連ツール</h2>
        <div className="space-y-2">
          {[
            { href: "/tools/invoice-qualified-checker", label: "適格請求書（インボイス）チェッカー", desc: "請求書の6項目を即チェック" },
            { href: "/tools/tedori-keisan", label: "手取り計算ツール", desc: "給与・フリーランス収入の手取りを計算" },
            { href: "/tools/zangyou-dai", label: "残業代計算ツール", desc: "残業・深夜・休日割増賃金を自動計算" },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 transition-colors group">
              <svg className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-emerald-700 group-hover:text-emerald-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </a>
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
            mainEntity: [
              {
                "@type": "Question",
                name: "源泉徴収の対象になる報酬と対象外の報酬の違いは何ですか？",
                acceptedAnswer: { "@type": "Answer", text: "所得税法第204条に列挙されたもの（原稿料・デザイン料・翻訳料・弁護士・税理士・司法書士報酬など）が対象です。物品の売買代金などは原則対象外です。" },
              },
              {
                "@type": "Question",
                name: "報酬が100万円を超えると税率が変わるのはなぜですか？",
                acceptedAnswer: { "@type": "Answer", text: "所得税法の規定により、1回の支払いが100万円を超える部分は税率が10.21%から20.42%に上がります。" },
              },
              {
                "@type": "Question",
                name: "消費税を区分記載すると源泉徴収額が減るのはなぜですか？",
                acceptedAnswer: { "@type": "Answer", text: "消費税を請求書に明記した場合、源泉徴収の計算基準は税抜の報酬額になります。税込で請求すると税込金額全体が基準になるため源泉徴収額が多くなります。" },
              },
              {
                "@type": "Question",
                name: "法人への支払いでも源泉徴収は必要ですか？",
                acceptedAnswer: { "@type": "Answer", text: "原則不要です。源泉徴収は個人事業主への報酬に適用されます。" },
              },
              {
                "@type": "Question",
                name: "源泉徴収された税金は確定申告で戻ってきますか？",
                acceptedAnswer: { "@type": "Answer", text: "確定申告で源泉徴収額を申告すると、実際の所得税額との差額が還付または追加納税になります。" },
              },
            ],
          }),
        }}
      />
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "源泉徴収税 計算",
  "description": "フリーランス・個人事業主への報酬にかかる源泉徴収税額を計算。税込/税抜・消費税考慮対応",
  "url": "https://tools.loresync.dev/withholding-tax-calculator",
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
