"use client";

import { useState, useMemo } from "react";

// --- 所得税速算表 ---
function calcProgressiveTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const BRACKETS = [
    { max: 1_950_000,  rate: 0.05,  deduct: 0 },
    { max: 3_300_000,  rate: 0.10,  deduct: 97_500 },
    { max: 6_950_000,  rate: 0.20,  deduct: 427_500 },
    { max: 9_000_000,  rate: 0.23,  deduct: 636_000 },
    { max: 18_000_000, rate: 0.33,  deduct: 1_536_000 },
    { max: 40_000_000, rate: 0.40,  deduct: 2_796_000 },
    { max: Infinity,   rate: 0.45,  deduct: 4_796_000 },
  ];
  const b = BRACKETS.find((x) => taxableIncome <= x.max)!;
  return Math.max(0, Math.floor(taxableIncome * b.rate - b.deduct));
}

// 所得税の限界税率（節税計算用）
function getMarginalRate(taxableIncome: number): number {
  const BRACKETS = [
    { max: 1_950_000,  rate: 0.05 },
    { max: 3_300_000,  rate: 0.10 },
    { max: 6_950_000,  rate: 0.20 },
    { max: 9_000_000,  rate: 0.23 },
    { max: 18_000_000, rate: 0.33 },
    { max: 40_000_000, rate: 0.40 },
    { max: Infinity,   rate: 0.45 },
  ];
  return BRACKETS.find((x) => taxableIncome <= x.max)?.rate ?? 0.05;
}

// 住民税率（一律）
const JUMIN_RATE = 0.10;
// 基礎控除
const BASIC_DEDUCTION = 480_000;

// --- 解約返戻金テーブル（掛金納付月数 × 解約種別） ---
// 実際の共済金額は掛金額・付加共済金で変わるが、
// ここでは「掛金合計に対する返戻率」で近似する
// 任意解約: 加入年数に応じて 80〜100% 程度
// 廃業解約: 加入年数に応じて 100〜120% 程度（付加共済金含む）
type CancelType = "voluntary" | "closure";

function getReturnRate(years: number, type: CancelType): number {
  if (type === "closure") {
    if (years < 1) return 0;
    if (years < 2) return 0.80;
    if (years < 3) return 0.85;
    if (years < 5) return 0.90;
    if (years < 10) return 1.00;
    if (years < 15) return 1.05;
    if (years < 20) return 1.10;
    return 1.20;
  } else {
    // 任意解約（不利）
    if (years < 1) return 0;
    if (years < 2) return 0;
    if (years < 3) return 0.60;
    if (years < 5) return 0.70;
    if (years < 10) return 0.80;
    if (years < 15) return 0.85;
    if (years < 20) return 0.90;
    return 1.00;
  }
}

// 解約手当金の税区分
// 廃業解約→退職所得扱い（1/2課税）、任意解約→一時所得扱い（50万控除後1/2）
function calcCancelTax(
  cancelAmount: number,
  type: CancelType,
  annualIncome: number
): { tax: number; takeHome: number; taxNote: string } {
  // 課税所得の簡易計算（掛金控除済みの所得）
  const baseTaxable = Math.max(0, annualIncome - BASIC_DEDUCTION);

  if (type === "closure") {
    // 退職所得: (受取額 - 退職所得控除) × 1/2 に課税
    // 退職所得控除: 勤続年数相当で概算（ここでは加入年数を使用）
    // 簡易: 受取額 × 1/2 に対して累進課税
    const taxableHalf = Math.floor(cancelAmount / 2);
    // 退職所得は分離課税なので単独で計算
    const tax = calcProgressiveTax(taxableHalf);
    return {
      tax,
      takeHome: cancelAmount - tax,
      taxNote: "退職所得扱い（受取額×1/2に課税）",
    };
  } else {
    // 一時所得: (受取額 - 掛金総額 - 特別控除50万) × 1/2 に課税
    // 掛金総額 = cancelAmount / returnRate × returnRate ≈ cancelAmountで近似
    // 利益部分 = cancelAmount - 掛金総額（マイナスの場合は0）
    // 簡易: 利益部分 - 50万 の正の部分の 1/2 を他所得に加算
    const profit = Math.max(0, cancelAmount - cancelAmount); // 任意解約は元本割れ多いため
    const taxableAddition = Math.max(0, Math.floor((profit - 500_000) / 2));
    // 限界税率で概算
    const marginalRate = getMarginalRate(baseTaxable);
    const tax = Math.floor(taxableAddition * (marginalRate + JUMIN_RATE));
    return {
      tax,
      takeHome: cancelAmount - tax,
      taxNote: "一時所得扱い（利益部分に課税）",
    };
  }
}

// フォーマット
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtMan(n: number): string {
  if (n < 10_000) return fmtJPY(n);
  const man = n / 10_000;
  return man % 1 === 0 ? `${man}万円` : `${man.toFixed(1)}万円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

// 掛金の刻み（500円単位、1,000〜70,000円）
const MONTHLY_OPTIONS = Array.from({ length: 139 }, (_, i) => 1_000 + i * 500);

// iDeCo月額上限（自営業の場合）
const IDECO_MAX_MONTHLY = 68_000;

// グラフ用の年数
const CHART_YEARS = [1, 3, 5, 10, 15, 20, 25, 30];

function calcBarWidth(value: number, maxValue: number): string {
  if (maxValue === 0) return "0%";
  return `${Math.min(100, Math.round((value / maxValue) * 100))}%`;
}

export default function ShoKigyoKyosai() {
  const [monthlyPremium, setMonthlyPremium] = useState<number>(30_000);
  const [incomeInput, setIncomeInput] = useState<string>("");
  const [cancelYears, setCancelYears] = useState<number>(20);
  const [cancelType, setCancelType] = useState<CancelType>("closure");
  const [showIdeco, setShowIdeco] = useState<boolean>(false);

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setIncomeInput(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };

  const annualIncome = parseAmount(incomeInput);
  const annualPremium = monthlyPremium * 12;

  // 節税計算
  const taxResult = useMemo(() => {
    if (!annualIncome) return null;
    // 掛金控除前の課税所得
    const taxableBefore = Math.max(0, annualIncome - BASIC_DEDUCTION);
    // 掛金控除後の課税所得
    const taxableAfter = Math.max(0, taxableBefore - annualPremium);
    // 所得税
    const incomeTaxBefore = calcProgressiveTax(taxableBefore);
    const incomeTaxAfter = calcProgressiveTax(taxableAfter);
    const incomeTaxSaving = incomeTaxBefore - incomeTaxAfter;
    // 住民税（概算）
    const juminBefore = Math.floor(taxableBefore * JUMIN_RATE);
    const juminAfter = Math.floor(taxableAfter * JUMIN_RATE);
    const juminSaving = juminBefore - juminAfter;
    // 合計節税
    const totalSaving = incomeTaxSaving + juminSaving;
    // 実質負担（月額）
    const effectiveMonthly = Math.max(0, monthlyPremium - Math.floor(totalSaving / 12));
    // 限界税率
    const marginalRate = getMarginalRate(taxableBefore);

    return {
      taxableBefore,
      taxableAfter,
      incomeTaxSaving,
      juminSaving,
      totalSaving,
      effectiveMonthly,
      marginalRate,
    };
  }, [annualIncome, annualPremium, monthlyPremium]);

  // 解約シミュレーション
  const cancelResult = useMemo(() => {
    const totalPaid = annualPremium * cancelYears;
    const returnRate = getReturnRate(cancelYears, cancelType);
    const cancelAmount = Math.floor(totalPaid * returnRate);
    const totalSaving = taxResult ? taxResult.totalSaving * cancelYears : 0;
    const { tax, takeHome, taxNote } = calcCancelTax(cancelAmount, cancelType, annualIncome || 5_000_000);
    const netBenefit = takeHome + totalSaving - totalPaid;
    return { totalPaid, returnRate, cancelAmount, totalSaving, tax, takeHome, netBenefit, taxNote };
  }, [annualPremium, cancelYears, cancelType, taxResult, annualIncome]);

  // iDeCo併用節税
  const idecoResult = useMemo(() => {
    if (!annualIncome || !taxResult) return null;
    const idecoMonthly = Math.min(IDECO_MAX_MONTHLY, 68_000);
    const idecoAnnual = idecoMonthly * 12;
    const taxableWithIdeco = Math.max(0, taxResult.taxableAfter - idecoAnnual);
    const incomeTaxWithIdeco = calcProgressiveTax(taxableWithIdeco);
    const juminWithIdeco = Math.floor(taxableWithIdeco * JUMIN_RATE);
    const totalWithIdeco = incomeTaxWithIdeco + juminWithIdeco;
    const currentTotal = calcProgressiveTax(taxResult.taxableAfter) + Math.floor(taxResult.taxableAfter * JUMIN_RATE);
    const idecoSaving = Math.max(0, currentTotal - totalWithIdeco);
    const combinedSaving = taxResult.totalSaving + idecoSaving;
    return { idecoMonthly, idecoAnnual, idecoSaving, combinedSaving };
  }, [annualIncome, taxResult]);

  // グラフデータ（累計掛金 vs 節税額）
  const chartData = useMemo(() => {
    return CHART_YEARS.map((y) => ({
      year: y,
      totalPaid: annualPremium * y,
      totalSaving: taxResult ? taxResult.totalSaving * y : 0,
    }));
  }, [annualPremium, taxResult]);

  const maxChartValue = chartData[chartData.length - 1].totalPaid;

  return (
    <div className="space-y-6">
      {/* ===== STEP 1: 掛金設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
          <h2 className="text-lg font-semibold text-gray-800">月額掛金を選択</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">月額1,000〜70,000円（500円刻み）で設定できます</p>

        <div className="space-y-4">
          {/* スライダー */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">月額掛金</span>
              <span className="text-2xl font-bold text-emerald-700">{fmtJPY(monthlyPremium)}</span>
            </div>
            <input
              type="range"
              min={1_000}
              max={70_000}
              step={500}
              value={monthlyPremium}
              onChange={(e) => setMonthlyPremium(Number(e.target.value))}
              className="w-full h-2 bg-emerald-100 rounded-full appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1,000円</span>
              <span>70,000円</span>
            </div>
          </div>

          {/* クイック選択 */}
          <div>
            <p className="text-xs text-gray-500 mb-2">よく使われる金額</p>
            <div className="flex flex-wrap gap-2">
              {[10_000, 20_000, 30_000, 50_000, 70_000].map((v) => (
                <button
                  key={v}
                  onClick={() => setMonthlyPremium(v)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    monthlyPremium === v
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {fmtMan(v)}
                </button>
              ))}
            </div>
          </div>

          {/* 年額サマリ */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-sm text-emerald-800 font-medium">年間掛金合計</span>
            <span className="text-xl font-bold text-emerald-700">{fmtJPY(annualPremium)}</span>
          </div>
        </div>
      </div>

      {/* ===== STEP 2: 所得入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
          <h2 className="text-lg font-semibold text-gray-800">年間所得を入力</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">事業所得・不動産所得など（掛金控除前の金額）</p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={incomeInput}
            onChange={handleIncomeChange}
            placeholder="5,000,000"
            className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
          <span className="text-gray-600 font-medium text-lg shrink-0">円</span>
        </div>

        {/* クイック選択 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[3_000_000, 5_000_000, 7_000_000, 10_000_000].map((v) => (
            <button
              key={v}
              onClick={() => setIncomeInput(v.toLocaleString("ja-JP"))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                annualIncome === v
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {fmtMan(v)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== 節税効果カード ===== */}
      {taxResult && (
        <>
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-base font-semibold opacity-90 mb-2">年間節税効果（概算）</h2>
            <div className="text-5xl font-bold mb-1">{fmtJPY(taxResult.totalSaving)}</div>
            <div className="text-sm opacity-75 mb-6">
              実質月額負担: <span className="font-bold text-white">{fmtJPY(taxResult.effectiveMonthly)}</span>／月
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white bg-opacity-15 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">所得税の節税</div>
                <div className="text-2xl font-bold">{fmtJPY(taxResult.incomeTaxSaving)}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">住民税の節税</div>
                <div className="text-2xl font-bold">{fmtJPY(taxResult.juminSaving)}</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="opacity-80">掛金控除前 課税所得</span>
                <span className="font-semibold">{fmtJPY(taxResult.taxableBefore)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">掛金控除後 課税所得</span>
                <span className="font-semibold">{fmtJPY(taxResult.taxableAfter)}</span>
              </div>
              <div className="flex justify-between border-t border-white border-opacity-20 pt-1">
                <span className="opacity-80">適用限界税率（所得税）</span>
                <span className="font-semibold">{Math.round(taxResult.marginalRate * 100)}%</span>
              </div>
            </div>
          </div>

          {/* ===== 累計グラフ ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">累計掛金 vs 節税累計</h2>
            <p className="text-xs text-gray-500 mb-4">現在の掛金・所得が継続した場合の参考値</p>

            <div className="space-y-3">
              {chartData.map(({ year, totalPaid, totalSaving: saving }) => {
                const paidWidth = calcBarWidth(totalPaid, maxChartValue);
                const savingWidth = calcBarWidth(saving, maxChartValue);
                return (
                  <div key={year} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-700 w-12">{year}年後</span>
                      <span className="text-gray-500">{fmtMan(totalPaid)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-12 shrink-0">累計掛金</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gray-400 transition-all duration-500"
                            style={{ width: paidWidth }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-20 text-right shrink-0">{fmtMan(totalPaid)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 w-12 shrink-0">節税累計</span>
                        <div className="flex-1 bg-emerald-50 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: savingWidth }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-700 w-20 text-right shrink-0">{fmtMan(saving)}</span>
                      </div>
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この小規模企業共済 節税計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">小規模企業共済の掛金による節税効果と解約時の手取り額を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この小規模企業共済 節税計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "小規模企業共済の掛金による節税効果と解約時の手取り額を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mt-3">※ 所得・税制が変わらない場合の試算です</p>
          </div>
        </>
      )}

      {/* ===== STEP 3: 解約シミュレーション ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
          <h2 className="text-lg font-semibold text-gray-800">解約時シミュレーション</h2>
        </div>

        <div className="space-y-4">
          {/* 加入年数 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">加入年数</label>
              <span className="text-xl font-bold text-emerald-700">{cancelYears}年</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={cancelYears}
              onChange={(e) => setCancelYears(Number(e.target.value))}
              className="w-full h-2 bg-emerald-100 rounded-full appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1年</span>
              <span>40年</span>
            </div>
          </div>

          {/* クイック選択 */}
          <div className="flex flex-wrap gap-2">
            {[5, 10, 15, 20, 25, 30].map((y) => (
              <button
                key={y}
                onClick={() => setCancelYears(y)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  cancelYears === y
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {y}年
              </button>
            ))}
          </div>

          {/* 解約種別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">解約理由</label>
            <div className="grid grid-cols-2 gap-2">
              {(["closure", "voluntary"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCancelType(type)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                    cancelType === type
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                  }`}
                >
                  <div className="font-bold">{type === "closure" ? "廃業解約" : "任意解約"}</div>
                  <div className="text-xs mt-0.5 opacity-70">
                    {type === "closure" ? "退職所得扱い・有利" : "一時所得扱い・不利"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 解約結果 */}
        <div className="mt-5 space-y-3">
          {cancelResult.returnRate === 0 ? (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm font-medium text-red-800">
                {cancelType === "voluntary"
                  ? "加入から2年未満の任意解約は掛け捨てになります。"
                  : "加入から1年未満は共済金が支払われません。"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">累計掛金</div>
                  <div className="text-lg font-bold text-gray-800">{fmtMan(cancelResult.totalPaid)}</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-xs text-emerald-600 mb-1">解約手当金（概算）</div>
                  <div className="text-lg font-bold text-emerald-700">{fmtMan(cancelResult.cancelAmount)}</div>
                  <div className="text-xs text-emerald-600 mt-0.5">返戻率 {Math.round(cancelResult.returnRate * 100)}%</div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>解約手当金</span>
                  <span className="font-medium">{fmtMan(cancelResult.cancelAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>税金（概算・{cancelResult.taxNote}）</span>
                  <span className="font-medium text-red-600">− {fmtJPY(cancelResult.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
                  <span>手取り額（概算）</span>
                  <span className="text-emerald-700">{fmtMan(cancelResult.takeHome)}</span>
                </div>
              </div>

              {taxResult && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-medium mb-2">節税メリット込みの実質収支</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-emerald-800">
                      <span>手取り額</span>
                      <span className="font-medium">{fmtMan(cancelResult.takeHome)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>節税累計（{cancelYears}年分）</span>
                      <span className="font-medium">+ {fmtMan(cancelResult.totalSaving)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>掛金合計</span>
                      <span className="font-medium">− {fmtMan(cancelResult.totalPaid)}</span>
                    </div>
                    <div className={`flex justify-between font-bold border-t border-emerald-200 pt-1 ${cancelResult.netBenefit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      <span>実質純利益</span>
                      <span>{cancelResult.netBenefit >= 0 ? "+" : ""}{fmtMan(cancelResult.netBenefit)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===== iDeCo併用効果 ===== */}
      {taxResult && idecoResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <button
            onClick={() => setShowIdeco((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-base font-semibold text-gray-800">iDeCoとの併用効果</h2>
              <p className="text-xs text-gray-500 mt-0.5">自営業者はiDeCo月額最大68,000円と併用可能</p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${showIdeco ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showIdeco && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-1">小規模共済のみ</div>
                  <div className="text-xl font-bold text-emerald-700">{fmtJPY(taxResult.totalSaving)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">年間節税</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-center">
                  <div className="text-xs text-emerald-600 mb-1">共済＋iDeCo</div>
                  <div className="text-xl font-bold text-emerald-700">{fmtJPY(idecoResult.combinedSaving)}</div>
                  <div className="text-xs text-emerald-600 mt-0.5">年間節税</div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-800">iDeCo追加節税（月{fmtMan(idecoResult.idecoMonthly)}）</span>
                  <span className="text-lg font-bold text-emerald-700">+ {fmtJPY(idecoResult.idecoSaving)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                iDeCoは60歳まで原則引き出し不可。小規模共済と合わせて老後・廃業時の備えになります。
                加入前にご自身の状況を確認してください。
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== 制度概要 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">小規模企業共済とは</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "対象者", body: "小規模企業の個人事業主・会社役員・共同経営者" },
              { title: "掛金", body: "月額1,000〜70,000円（500円刻み）。全額所得控除" },
              { title: "運営", body: "中小機構（独立行政法人中小企業基盤整備機構）が運営" },
              { title: "共済金の受取", body: "廃業・退職時に退職金代わりとして受け取り可能" },
            ].map(({ title, body }) => (
              <div key={title} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">{title}</div>
                <p className="text-sm text-gray-700">{body}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-xs font-medium text-emerald-700 mb-1">掛金は全額所得控除</div>
            <p className="text-sm text-emerald-800">
              支払った掛金の全額が「小規模企業共済等掛金控除」として所得控除の対象になります。
              節税しながら将来の退職金を積み立てられる点が最大のメリットです。
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-xs font-medium text-amber-700 mb-1">注意点</div>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
              <li>任意解約は元本割れのリスクあり（特に加入年数が短い場合）</li>
              <li>20年未満の任意解約は掛金合計を下回る可能性があります</li>
              <li>受取時に課税されます（廃業解約は退職所得、任意解約は一時所得）</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== 免責・参考リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs text-gray-500">
          本ツールは概算計算を目的としており、実際の共済金額・税額と異なる場合があります。
          解約返戻率は公式の付加共済金を含まない簡易計算です。
          住民税は所得割のみの概算で、均等割・社会保険料等は考慮していません。
          正確な金額は中小機構または税理士等の専門家にご確認ください。
        </p>
        <div className="flex flex-col gap-1.5">
          <a
            href="https://www.smrj.go.jp/kyosai/skyosai/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            中小機構「小規模企業共済」公式サイト
          </a>
          <a
            href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1135.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            国税庁「小規模企業共済等掛金控除」
          </a>
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "小規模企業共済 節税計算",
  "description": "小規模企業共済の掛金による節税効果と解約時の手取り額を計算",
  "url": "https://tools.loresync.dev/sho-kigyo-kyosai",
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
