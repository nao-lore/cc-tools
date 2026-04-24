"use client";

import { useState, useMemo } from "react";

// --- 所得税率テーブル（累進課税） ---
const TAX_BRACKETS = [
  { label: "5%",  rate: 0.05,  min: 0,          max: 1_950_000 },
  { label: "10%", rate: 0.10,  min: 1_950_000,   max: 3_300_000 },
  { label: "20%", rate: 0.20,  min: 3_300_000,   max: 6_950_000 },
  { label: "23%", rate: 0.23,  min: 6_950_000,   max: 9_000_000 },
  { label: "33%", rate: 0.33,  min: 9_000_000,   max: 18_000_000 },
  { label: "40%", rate: 0.40,  min: 18_000_000,  max: 40_000_000 },
  { label: "45%", rate: 0.45,  min: 40_000_000,  max: Infinity },
] as const;

// 控除方式
type FilingType = "blue65" | "blue55" | "blue10" | "white";

const FILING_OPTIONS: { type: FilingType; label: string; deduction: number; color: string; bgColor: string; borderColor: string }[] = [
  {
    type: "blue65",
    label: "青色65万円",
    deduction: 650_000,
    color: "text-blue-700",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-300",
  },
  {
    type: "blue55",
    label: "青色55万円",
    deduction: 550_000,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-200",
  },
  {
    type: "blue10",
    label: "青色10万円",
    deduction: 100_000,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500",
    borderColor: "border-indigo-200",
  },
  {
    type: "white",
    label: "白色申告",
    deduction: 0,
    color: "text-gray-600",
    bgColor: "bg-gray-500",
    borderColor: "border-gray-200",
  },
];

// 適用条件
const CONDITIONS: Record<FilingType, string[]> = {
  blue65: ["青色申告承認申請書を提出済み", "複式簿記（正規の簿記）で記帳", "e-Tax（電子申告）で申告 または 電子帳簿保存を実施"],
  blue55: ["青色申告承認申請書を提出済み", "複式簿記（正規の簿記）で記帳", "紙で確定申告書を提出（e-Tax不使用・電子帳簿保存なし）"],
  blue10: ["青色申告承認申請書を提出済み", "簡易簿記（現金出納帳等）で記帳"],
  white: ["特に条件なし（誰でも選択可）"],
};

// 基礎控除（所得税）
const BASIC_DEDUCTION = 480_000;
// 住民税率
const JUMIN_RATE = 0.10;
// 国保料率（概算）
const KOKUHO_RATE = 0.10;

// 累進税額を正確に計算
function calcProgressiveTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  // 速算表を使った累進計算
  const PROGRESSIVE = [
    { max: 1_950_000,  rate: 0.05,  deduct: 0 },
    { max: 3_300_000,  rate: 0.10,  deduct: 97_500 },
    { max: 6_950_000,  rate: 0.20,  deduct: 427_500 },
    { max: 9_000_000,  rate: 0.23,  deduct: 636_000 },
    { max: 18_000_000, rate: 0.33,  deduct: 1_536_000 },
    { max: 40_000_000, rate: 0.40,  deduct: 2_796_000 },
    { max: Infinity,   rate: 0.45,  deduct: 4_796_000 },
  ];
  const bracket = PROGRESSIVE.find((b) => taxableIncome <= b.max)!;
  return Math.max(0, Math.floor(taxableIncome * bracket.rate - bracket.deduct));
}

// 課税所得（事業所得 - 各種控除）
function calcTaxableIncome(businessIncome: number, specialDeduction: number): number {
  return Math.max(0, businessIncome - specialDeduction - BASIC_DEDUCTION);
}

// 節税効果を計算する
function calcResult(businessIncome: number, deduction: number) {
  const taxableIncome = calcTaxableIncome(businessIncome, deduction);
  const incomeTax = calcProgressiveTax(taxableIncome);
  // 住民税は概算（所得割のみ）
  const juminTax = Math.max(0, Math.floor(taxableIncome * JUMIN_RATE));
  // 国保料（概算、所得割のみ）
  const kokuhoRyou = Math.max(0, Math.floor(taxableIncome * KOKUHO_RATE));
  const total = incomeTax + juminTax + kokuhoRyou;
  return { taxableIncome, incomeTax, juminTax, kokuhoRyou, total };
}

// 実効税率を返す（節税額の概算用）
function getMarginalRate(taxableIncome: number): number {
  const bracket = TAX_BRACKETS.find(
    (b) => taxableIncome >= b.min && taxableIncome < b.max
  );
  return (bracket?.rate ?? 0.05) + JUMIN_RATE + KOKUHO_RATE;
}

// フォーマット
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

function handleNumericInput(
  setter: (v: string) => void
): React.ChangeEventHandler<HTMLInputElement> {
  return (e) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setter(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };
}

// グラフの最大値
function calcBarWidth(value: number, maxValue: number): string {
  if (maxValue === 0) return "0%";
  return `${Math.min(100, Math.round((value / maxValue) * 100))}%`;
}

// 年収レンジ（グラフ用）
const INCOME_RANGES = [
  1_000_000,
  2_000_000,
  3_000_000,
  4_000_000,
  5_000_000,
  6_000_000,
  8_000_000,
  10_000_000,
];

export default function AojiroShinkokuSim() {
  const [revenueInput, setRevenueInput] = useState("");
  const [expenseInput, setExpenseInput] = useState("");
  const [selectedFiling, setSelectedFiling] = useState<FilingType>("blue65");
  const [showGuide, setShowGuide] = useState(false);
  const [showConditions, setShowConditions] = useState<FilingType | null>(null);

  const revenue = parseAmount(revenueInput);
  const expense = parseAmount(expenseInput);
  const businessIncome = Math.max(0, revenue - expense);

  // 4方式の計算
  const results = useMemo(() => {
    return Object.fromEntries(
      FILING_OPTIONS.map((opt) => [opt.type, calcResult(businessIncome, opt.deduction)])
    ) as Record<FilingType, ReturnType<typeof calcResult>>;
  }, [businessIncome]);

  // 節税額（白色比較）
  const whiteTotal = results.white.total;

  // 有効入力チェック
  const hasInput = revenue > 0;
  const selectedResult = results[selectedFiling];
  const selectedOption = FILING_OPTIONS.find((o) => o.type === selectedFiling)!;
  const selectedDeduction = selectedOption.deduction;
  const savingsFromWhite = Math.max(0, whiteTotal - selectedResult.total);

  // 実効税率（白色の課税所得ベースで概算）
  const marginalRate = getMarginalRate(results.white.taxableIncome);

  return (
    <div className="space-y-6">
      {/* ===== STEP 1: 事業所得入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
          <h2 className="text-lg font-semibold text-gray-800">事業所得の入力</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">青色申告特別控除を差し引く前の事業所得を入力してください</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">売上（年間）</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={revenueInput}
                onChange={handleNumericInput(setRevenueInput)}
                placeholder="5,000,000"
                className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              <span className="text-gray-600 font-medium text-lg shrink-0">円</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">経費（年間）</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={expenseInput}
                onChange={handleNumericInput(setExpenseInput)}
                placeholder="1,000,000"
                className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              <span className="text-gray-600 font-medium text-lg shrink-0">円</span>
            </div>
          </div>

          {hasInput && (
            <div className="flex justify-between items-center px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-sm text-blue-800 font-medium">事業所得（控除前）</span>
              <span className="text-xl font-bold text-blue-700">{fmtJPY(businessIncome)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== STEP 2: 申告方式選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
          <h2 className="text-lg font-semibold text-gray-800">申告方式の選択</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">現在の申告方式（または予定）を選択してください</p>

        <div className="grid grid-cols-2 gap-3">
          {FILING_OPTIONS.map((opt) => {
            const isSelected = selectedFiling === opt.type;
            const savings = hasInput ? Math.max(0, whiteTotal - results[opt.type].total) : null;
            return (
              <button
                key={opt.type}
                onClick={() => setSelectedFiling(opt.type)}
                className={`relative flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? `border-blue-500 bg-blue-50`
                    : `border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30`
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <span className={`text-sm font-bold mb-1 ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                <span className={`text-xs font-semibold ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                  控除額: {opt.deduction === 0 ? "なし" : fmtJPY(opt.deduction)}
                </span>
                {savings !== null && opt.type !== "white" && savings > 0 && (
                  <span className="mt-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    節税 {fmtJPY(savings)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 4方式 並列比較 ===== */}
      {hasInput && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">4方式の税負担比較</h2>
            <p className="text-xs text-gray-500 mb-4">所得税＋住民税＋国保料の合計（概算）</p>

            <div className="space-y-3">
              {FILING_OPTIONS.map((opt) => {
                const res = results[opt.type];
                const maxTotal = results.white.total;
                const savings = Math.max(0, whiteTotal - res.total);
                const isSelected = selectedFiling === opt.type;
                const barWidth = calcBarWidth(res.total, maxTotal > 0 ? maxTotal : 1);

                return (
                  <div
                    key={opt.type}
                    className={`rounded-xl border p-4 transition-all ${
                      isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                        {opt.label}
                      </span>
                      <div className="flex items-center gap-2">
                        {savings > 0 && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            -{fmtJPY(savings)}
                          </span>
                        )}
                        <span className={`text-base font-bold ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                          {fmtJPY(res.total)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${opt.bgColor}`}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== 節税額ハイライト ===== */}
          {selectedFiling !== "white" && savingsFromWhite > 0 && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-base font-semibold opacity-90 mb-4">{selectedOption.label}の節税効果（白色比）</h2>

              <div className="text-center mb-5">
                <div className="text-xs opacity-75 mb-1">年間節税額（概算）</div>
                <div className="text-5xl font-bold">{fmtJPY(savingsFromWhite)}</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "所得税", white: results.white.incomeTax, selected: selectedResult.incomeTax },
                  { label: "住民税", white: results.white.juminTax, selected: selectedResult.juminTax },
                  { label: "国保料", white: results.white.kokuhoRyou, selected: selectedResult.kokuhoRyou },
                ].map(({ label, white, selected }) => (
                  <div key={label} className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                    <div className="text-xs opacity-75 mb-1">{label}削減</div>
                    <div className="text-base font-bold">
                      {fmtJPY(Math.max(0, white - selected))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-white bg-opacity-10 rounded-xl p-3 text-xs opacity-80 space-y-1">
                <div className="flex justify-between">
                  <span>白色申告 合計税負担</span>
                  <span className="font-semibold">{fmtJPY(whiteTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedOption.label} 合計税負担</span>
                  <span className="font-semibold">{fmtJPY(selectedResult.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ===== 内訳カード ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">
              {selectedOption.label}の税負担内訳
            </h2>

            <div className="space-y-2">
              {[
                { label: "事業所得（控除前）", value: businessIncome, note: "" },
                { label: `青色申告特別控除`, value: -selectedDeduction, note: selectedDeduction > 0 ? `-${fmtJPY(selectedDeduction)}` : "なし" },
                { label: "基礎控除", value: -BASIC_DEDUCTION, note: "-48万円" },
                { label: "課税所得", value: selectedResult.taxableIncome, note: "", highlight: true },
              ].map(({ label, value, note, highlight }) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
                    highlight ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <span className={`text-sm ${highlight ? "font-semibold text-blue-800" : "text-gray-600"}`}>
                    {label}
                    {note && !highlight && (
                      <span className="ml-1 text-xs text-gray-400">({note})</span>
                    )}
                  </span>
                  <span className={`text-sm font-bold ${highlight ? "text-blue-700" : value < 0 ? "text-red-500" : "text-gray-800"}`}>
                    {highlight ? fmtJPY(value) : value < 0 ? `-${fmtJPY(-value)}` : fmtJPY(value)}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-2 space-y-2">
                {[
                  { label: "所得税（累進課税）", value: selectedResult.incomeTax },
                  { label: "住民税（概算・所得割）", value: selectedResult.juminTax },
                  { label: "国民健康保険料（概算）", value: selectedResult.kokuhoRyou },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-bold text-gray-800">{fmtJPY(value)}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-xl text-white">
                  <span className="text-sm font-bold">合計税負担（概算）</span>
                  <span className="text-lg font-bold">{fmtJPY(selectedResult.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 年収別節税グラフ ===== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">年収別の節税効果（青色65万円 vs 白色）</h2>
            <p className="text-xs text-gray-500 mb-4">経費率50%と仮定した場合の参考値</p>

            <div className="space-y-2">
              {INCOME_RANGES.map((income) => {
                const estimatedExpense = Math.floor(income * 0.5);
                const bIncome = Math.max(0, income - estimatedExpense);
                const blue65 = calcResult(bIncome, 650_000);
                const white = calcResult(bIncome, 0);
                const saving = Math.max(0, white.total - blue65.total);
                const maxSaving = 300_000;
                const barW = calcBarWidth(saving, maxSaving);
                const isCurrentRange =
                  hasInput &&
                  income >= revenue * 0.8 &&
                  income <= revenue * 1.2;

                return (
                  <div
                    key={income}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                      isCurrentRange ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                    }`}
                  >
                    <span className={`text-xs w-20 shrink-0 font-medium ${isCurrentRange ? "text-blue-700" : "text-gray-600"}`}>
                      {income >= 10_000_000 ? "1,000万" : `${income / 10_000}万`}円
                      {isCurrentRange && <span className="ml-1 text-blue-500">←</span>}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-500"
                        style={{ width: barW }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-20 text-right shrink-0 ${isCurrentRange ? "text-blue-700" : "text-gray-700"}`}>
                      {fmtJPY(saving)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">※ 経費50%・基礎控除のみ適用の簡易計算</p>
          </div>
        </>
      )}

      {/* ===== 適用条件チェックリスト ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">適用条件チェックリスト</h2>

        <div className="space-y-3">
          {FILING_OPTIONS.map((opt) => {
            const isOpen = showConditions === opt.type;
            return (
              <div key={opt.type} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowConditions(isOpen ? null : opt.type)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${opt.color}`}>{opt.label}</span>
                    {opt.deduction > 0 && (
                      <span className="text-xs text-gray-500">（控除 {fmtJPY(opt.deduction)}）</span>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50">
                    <ul className="space-y-2">
                      {Conditions[opt.type].map((cond, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {cond}
                        </li>
                      ))}
                    </ul>
                    {opt.type === "blue65" && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                        e-Taxでの申告（電子申告）または電子帳簿保存が必要です。どちらか一方でOK。
                      </div>
                    )}
                    {opt.type === "blue10" && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                        最も手軽に始められる青色申告。帳簿は現金出納帳・売掛帳等の簡易なもので可。
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 青色申告の始め方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowGuide((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-800">青色申告の始め方（簡易ガイド）</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showGuide ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showGuide && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="space-y-4 pt-4">
              {[
                {
                  step: "1",
                  title: "青色申告承認申請書を提出",
                  desc: "開業日から2ヶ月以内、または前年の12月31日までに税務署へ提出。e-Taxからも申請可。",
                  note: "※ 提出期限を過ぎると当年は白色申告のみになります",
                },
                {
                  step: "2",
                  title: "帳簿ソフトを準備",
                  desc: "65万/55万控除には複式簿記対応ソフトが必須。freee・弥生・マネーフォワードクラウドが定番。",
                  note: "※ 10万円控除なら現金出納帳のみでも可",
                },
                {
                  step: "3",
                  title: "日々の取引を記帳",
                  desc: "売上・経費・振替等を随時入力。レシート・領収書は7年間保存が義務。",
                  note: "",
                },
                {
                  step: "4",
                  title: "確定申告書を作成・提出",
                  desc: "翌年2月16日〜3月15日。e-Taxで電子申告すると65万円控除が確定（紙提出は55万円）。",
                  note: "※ マイナンバーカード or ID・パスワード方式でe-Tax利用可",
                },
              ].map(({ step, title, desc, note }) => (
                <div key={step} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {step}
                  </span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm mb-0.5">{title}</div>
                    <p className="text-xs text-gray-600">{desc}</p>
                    {note && <p className="text-xs text-amber-700 mt-1">{note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== 免責 + 国税庁リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs text-gray-500">
          本ツールは概算計算を目的としており、実際の税額と異なる場合があります。
          住民税・国保料は所得割のみの簡易計算です。社会保険料控除・配偶者控除等は考慮していません。
          正確な税額は税理士等の専門家または国税庁の確定申告書等作成コーナーをご利用ください。
        </p>
        <div className="flex flex-col gap-1.5">
          <a
            href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2072.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            国税庁「青色申告特別控除」を確認する
          </a>
          <a
            href="https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/shinkoku/annai/09.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            青色申告承認申請書の提出方法（国税庁）
          </a>
        </div>
      </div>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">青色申告控除 節税シミュレーターの使い方</h2>
        <ol className="space-y-4">
          {[
            { step: "1", title: "年間の売上と経費を入力", desc: "青色申告特別控除を差し引く前の数字を入力します。売上から経費を引いた事業所得が自動計算されます。" },
            { step: "2", title: "申告方式を選択", desc: "現在の申告方式または今後予定している方式を選びます。青色65万円控除が最も節税効果が高く、e-Taxでの電子申告が必要です。" },
            { step: "3", title: "4方式の税負担を比較", desc: "白色申告を基準に、各青色申告方式でどれだけ節税できるかが一覧で表示されます。所得税・住民税・国民健康保険料の合計で比較します。" },
            { step: "4", title: "適用条件を確認", desc: "青色申告を始めるには「青色申告承認申請書」の事前提出が必要です。提出期限を確認してチェックリストを活用してください。" },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</span>
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
            q: "青色申告65万円控除と55万円控除の違いは何ですか？",
            a: "どちらも複式簿記で記帳する必要がありますが、65万円控除はe-Tax（電子申告）または電子帳簿保存が必要です。紙で申告すると55万円控除になります。10万円の差額に対し所得税・住民税・国保料が軽減されます。",
          },
          {
            q: "青色申告を始めるにはいつまでに何をすればいいですか？",
            a: "開業から2ヶ月以内、または青色申告を適用したい年の3月15日までに「青色申告承認申請書」を税務署に提出する必要があります。e-Taxからも申請できます。",
          },
          {
            q: "青色申告の節税効果は年収いくらから大きくなりますか？",
            a: "所得税の累進課税率が上がるほど節税効果が大きくなります。課税所得が195万円超（税率10%）から効果が出始め、330万円超（税率20%）以上では特に有効です。年収500万円の個人事業主なら10〜15万円程度の節税になることが多いです。",
          },
          {
            q: "白色申告から青色申告に途中で変更できますか？",
            a: "変更したい年の3月15日までに「青色申告承認申請書」を提出すれば、その年から青色申告が適用されます。ただし帳簿の記帳方法も複式簿記に変える必要があります。",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <p className="text-sm font-semibold text-blue-700 mb-1">Q. {q}</p>
            <p className="text-xs text-gray-600">A. {a}</p>
          </div>
        ))}
      </div>

      {/* ===== CTA ===== */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
        <p className="text-sm font-semibold text-blue-900 mb-1">確定申告ソフトを比較する</p>
        <p className="text-xs text-blue-700 mb-3">青色申告65万円控除を受けるには複式簿記対応の会計ソフトが便利です。freee・弥生・マネーフォワードクラウドが3大定番です。</p>
        <a href="/tools/consumption-tax-choice" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-800 hover:text-blue-900 underline">
          消費税の課税方式（簡易課税/本則課税）も比較する
        </a>
      </div>

      {/* ===== 関連ツール ===== */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <h2 className="text-sm font-semibold text-blue-800 mb-3">関連ツール</h2>
        <div className="space-y-2">
          {[
            { href: "/tools/consumption-tax-choice", label: "簡易課税・本則課税 比較シミュレーター", desc: "消費税の課税方式を3方式で比較" },
            { href: "/tools/houjin-nari", label: "法人成り 損益分岐シミュレーター", desc: "個人事業主と法人の手取りを比較" },
            { href: "/tools/iryouhi-koujo", label: "医療費控除 計算ツール", desc: "医療費控除と還付額を自動計算" },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 hover:border-blue-300 transition-colors group">
              <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-700 group-hover:text-blue-900">{label}</p>
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
                name: "青色申告65万円控除と55万円控除の違いは何ですか？",
                acceptedAnswer: { "@type": "Answer", text: "どちらも複式簿記で記帳する必要がありますが、65万円控除はe-Tax（電子申告）または電子帳簿保存が必要です。紙で申告すると55万円控除になります。" },
              },
              {
                "@type": "Question",
                name: "青色申告を始めるにはいつまでに何をすればいいですか？",
                acceptedAnswer: { "@type": "Answer", text: "開業から2ヶ月以内、または青色申告を適用したい年の3月15日までに「青色申告承認申請書」を税務署に提出する必要があります。" },
              },
              {
                "@type": "Question",
                name: "青色申告の節税効果は年収いくらから大きくなりますか？",
                acceptedAnswer: { "@type": "Answer", text: "課税所得が195万円超（税率10%）から効果が出始め、330万円超（税率20%）以上では特に有効です。年収500万円の個人事業主なら10〜15万円程度の節税になることが多いです。" },
              },
              {
                "@type": "Question",
                name: "白色申告から青色申告に途中で変更できますか？",
                acceptedAnswer: { "@type": "Answer", text: "変更したい年の3月15日までに「青色申告承認申請書」を提出すれば、その年から青色申告が適用されます。" },
              },
            ],
          }),
        }}
      />
    </div>
  );
}

// 定数を外部で宣言（コンポーネント外参照用）
const Conditions = CONDITIONS;
