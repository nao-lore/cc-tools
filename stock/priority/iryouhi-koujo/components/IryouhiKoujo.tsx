"use client";

import { useState, useMemo } from "react";

// --- 所得税率テーブル ---
const TAX_BRACKETS = [
  { label: "5%",  rate: 0.05,  min: 0,         max: 1_950_000 },
  { label: "10%", rate: 0.10,  min: 1_950_000,  max: 3_300_000 },
  { label: "20%", rate: 0.20,  min: 3_300_000,  max: 6_950_000 },
  { label: "23%", rate: 0.23,  min: 6_950_000,  max: 9_000_000 },
  { label: "33%", rate: 0.33,  min: 9_000_000,  max: 18_000_000 },
  { label: "40%", rate: 0.40,  min: 18_000_000, max: 40_000_000 },
  { label: "45%", rate: 0.45,  min: 40_000_000, max: Infinity },
] as const;

// 課税所得から適用税率を推定（概算）
function estimateTaxRate(taxableIncome: number): number {
  const bracket = TAX_BRACKETS.find(
    (b) => taxableIncome >= b.min && taxableIncome < b.max
  );
  return bracket?.rate ?? 0.05;
}

// 総所得から概算課税所得を計算（給与所得控除・基礎控除のみ簡易計算）
function estimateTaxableIncome(grossIncome: number): number {
  // 給与所得控除（簡易版）
  let employmentDeduction = 0;
  if (grossIncome <= 1_625_000) {
    employmentDeduction = 550_000;
  } else if (grossIncome <= 1_800_000) {
    employmentDeduction = grossIncome * 0.4 - 100_000;
  } else if (grossIncome <= 3_600_000) {
    employmentDeduction = grossIncome * 0.3 + 80_000;
  } else if (grossIncome <= 6_600_000) {
    employmentDeduction = grossIncome * 0.2 + 440_000;
  } else if (grossIncome <= 8_500_000) {
    employmentDeduction = grossIncome * 0.1 + 1_100_000;
  } else {
    employmentDeduction = 1_950_000;
  }
  const employmentIncome = Math.max(0, grossIncome - employmentDeduction);
  // 基礎控除 48万円
  return Math.max(0, employmentIncome - 480_000);
}

// 医療費控除額計算
function calcMedicalDeduction(
  totalMedical: number,
  insurance: number,
  totalIncome: number
): { deduction: number; threshold: number; netMedical: number } {
  const netMedical = Math.max(0, totalMedical - insurance);
  const threshold = Math.min(100_000, totalIncome * 0.05);
  const deduction = Math.min(2_000_000, Math.max(0, netMedical - threshold));
  return { deduction, threshold, netMedical };
}

// セルフメディケーション税制計算
function calcSelfMedication(selfMedAmount: number): {
  deduction: number;
  eligible: boolean;
} {
  if (selfMedAmount <= 12_000) return { deduction: 0, eligible: false };
  return {
    deduction: Math.min(88_000, selfMedAmount - 12_000),
    eligible: true,
  };
}

// --- フォーマット ---
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

function toInputStr(n: number): string {
  if (!n) return "";
  return n.toLocaleString("ja-JP");
}

// --- 家族メンバー型 ---
type Member = {
  id: number;
  name: string;
  amount: string;
};

// --- 医療費控除の対象/対象外 ---
const ELIGIBLE_EXAMPLES = [
  { item: "診療・治療費（病院・歯科）", eligible: true },
  { item: "医薬品（治療目的）", eligible: true },
  { item: "入院費・食事代（療養目的）", eligible: true },
  { item: "訪問看護・在宅療養費", eligible: true },
  { item: "通院交通費（電車・バス等）", eligible: true },
  { item: "レーシック・白内障手術", eligible: true },
  { item: "歯科矯正（噛み合わせ治療）", eligible: true },
  { item: "出産費用（正常分娩含む）", eligible: true },
  { item: "介護保険の自己負担額（医療系サービス）", eligible: true },
  { item: "美容整形・予防接種", eligible: false },
  { item: "健康診断（治療に至らない場合）", eligible: false },
  { item: "歯科矯正（美容目的）", eligible: false },
  { item: "マイカー通院のガソリン代・駐車場代", eligible: false },
  { item: "タクシー代（緊急時を除く）", eligible: false },
  { item: "サプリメント・栄養ドリンク", eligible: false },
];

let memberCounter = 3;

export default function IryouhiKoujo() {
  // 家族メンバーリスト
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "本人", amount: "" },
    { id: 2, name: "配偶者", amount: "" },
  ]);

  // 保険金等の補填額
  const [insuranceInput, setInsuranceInput] = useState("");

  // 総所得金額（入力 or 年収から概算）
  const [incomeMode, setIncomeMode] = useState<"direct" | "gross">("gross");
  const [totalIncomeInput, setTotalIncomeInput] = useState("");
  const [grossIncomeInput, setGrossIncomeInput] = useState("");

  // セルフメディケーション税制用
  const [selfMedInput, setSelfMedInput] = useState("");

  // --- 派生計算 ---
  const totalMedical = useMemo(
    () => members.reduce((sum, m) => sum + parseAmount(m.amount), 0),
    [members]
  );

  const insurance = parseAmount(insuranceInput);

  const totalIncome = useMemo(() => {
    if (incomeMode === "direct") return parseAmount(totalIncomeInput);
    const gross = parseAmount(grossIncomeInput);
    return gross ? estimateTaxableIncome(gross) : 0;
  }, [incomeMode, totalIncomeInput, grossIncomeInput]);

  const medResult = useMemo(
    () => calcMedicalDeduction(totalMedical, insurance, totalIncome),
    [totalMedical, insurance, totalIncome]
  );

  const selfMedResult = useMemo(
    () => calcSelfMedication(parseAmount(selfMedInput)),
    [selfMedInput]
  );

  const taxRate = useMemo(() => estimateTaxRate(totalIncome), [totalIncome]);

  const refundMed = Math.floor(medResult.deduction * taxRate);
  const refundSelf = Math.floor(selfMedResult.deduction * taxRate);

  const betterOption: "medical" | "self" | "none" =
    medResult.deduction === 0 && !selfMedResult.eligible
      ? "none"
      : medResult.deduction >= selfMedResult.deduction
      ? "medical"
      : "self";

  // 確定申告の要否（医療費控除を適用する場合）
  const needsFiling = medResult.deduction > 0 || selfMedResult.eligible;

  // --- ハンドラ ---
  function handleAmountChange(id: number, value: string) {
    const raw = value.replace(/,/g, "").replace(/[^\d]/g, "");
    const formatted = raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "";
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, amount: formatted } : m))
    );
  }

  function handleNameChange(id: number, value: string) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: value } : m))
    );
  }

  function addMember() {
    setMembers((prev) => [
      ...prev,
      { id: memberCounter++, name: `家族${prev.length - 1}`, amount: "" },
    ]);
  }

  function removeMember(id: number) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function handleNumericInput(
    setter: (v: string) => void
  ): React.ChangeEventHandler<HTMLInputElement> {
    return (e) => {
      const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
      setter(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
    };
  }

  const hasResult = totalMedical > 0 && totalIncome > 0;

  return (
    <div className="space-y-6">
      {/* ===== STEP 1: 医療費入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
          <h2 className="text-lg font-semibold text-gray-800">年間医療費の入力</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">同一生計の家族全員分を合算できます</p>

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleNameChange(member.id, e.target.value)}
                className="w-24 px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                placeholder="氏名"
              />
              <input
                type="text"
                inputMode="numeric"
                value={member.amount}
                onChange={(e) => handleAmountChange(member.id, e.target.value)}
                placeholder="0"
                className="flex-1 px-4 py-2.5 text-right text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
              <span className="text-gray-500 text-sm shrink-0">円</span>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="削除"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addMember}
          className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-base leading-none">+</span>
          家族を追加
        </button>

        {totalMedical > 0 && (
          <div className="mt-4 flex justify-between items-center px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-sm text-emerald-800 font-medium">医療費合計</span>
            <span className="text-xl font-bold text-emerald-700">{fmtJPY(totalMedical)}</span>
          </div>
        )}
      </div>

      {/* ===== STEP 2: 保険金等の補填額 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
          <h2 className="text-lg font-semibold text-gray-800">保険金・給付金の補填額</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">生命保険・健康保険・高額療養費などで補填された金額</p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={insuranceInput}
            onChange={handleNumericInput(setInsuranceInput)}
            placeholder="0"
            className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
          <span className="text-gray-600 font-medium text-lg">円</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">補填がない場合は 0 のままでOK</p>
      </div>

      {/* ===== STEP 3: 所得金額入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
          <h2 className="text-lg font-semibold text-gray-800">所得金額の入力</h2>
        </div>

        {/* モード切り替え */}
        <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
          {(["gross", "direct"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setIncomeMode(mode)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                incomeMode === mode
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode === "gross" ? "年収から概算" : "総所得を直接入力"}
            </button>
          ))}
        </div>

        {incomeMode === "gross" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              給与年収（源泉徴収票の「支払金額」）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={grossIncomeInput}
                onChange={handleNumericInput(setGrossIncomeInput)}
                placeholder="5,000,000"
                className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
              <span className="text-gray-600 font-medium text-lg">円</span>
            </div>
            {totalIncome > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                概算課税所得: <span className="font-semibold text-gray-700">{fmtJPY(totalIncome)}</span>
                （給与所得控除・基礎控除のみ適用）
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              総所得金額（確定申告書の「所得金額合計」）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={totalIncomeInput}
                onChange={handleNumericInput(setTotalIncomeInput)}
                placeholder="3,500,000"
                className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              />
              <span className="text-gray-600 font-medium text-lg">円</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== 計算結果 ===== */}
      {hasResult && (
        <>
          {/* メイン結果カード */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-base font-semibold opacity-90 mb-5">医療費控除 計算結果</h2>

            <div className="space-y-3">
              {/* 支払医療費 */}
              <div className="bg-white bg-opacity-15 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">支払った医療費合計</div>
                <div className="text-2xl font-bold">{fmtJPY(totalMedical)}</div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 border-t border-white border-opacity-30" />
                <span className="text-xs opacity-60">- 保険金等の補填額</span>
                <div className="flex-1 border-t border-white border-opacity-30" />
              </div>

              <div className="bg-white bg-opacity-10 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">補填された金額</div>
                <div className="text-xl font-bold">- {fmtJPY(insurance)}</div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 border-t border-white border-opacity-30" />
                <span className="text-xs opacity-60">- 足切り額（10万円 or 総所得の5%）</span>
                <div className="flex-1 border-t border-white border-opacity-30" />
              </div>

              <div className="bg-white bg-opacity-10 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">
                  足切り額（{totalIncome > 2_000_000 ? "10万円" : `総所得の5% = ${fmtJPY(totalIncome * 0.05)}`}）
                </div>
                <div className="text-xl font-bold">- {fmtJPY(medResult.threshold)}</div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 border-t border-white border-opacity-30" />
                <span className="text-xs opacity-60">= 医療費控除額</span>
                <div className="flex-1 border-t border-white border-opacity-30" />
              </div>

              {/* 控除額 */}
              <div className="bg-white rounded-xl p-4 text-emerald-900">
                <div className="text-xs text-emerald-700 mb-1">医療費控除額（上限200万円）</div>
                <div className="text-3xl font-bold text-emerald-700">
                  {medResult.deduction > 0 ? fmtJPY(medResult.deduction) : "0円（控除なし）"}
                </div>
              </div>

              {/* 還付見込み */}
              {medResult.deduction > 0 && (
                <div className="bg-amber-400 bg-opacity-30 rounded-xl p-4 border border-amber-300 border-opacity-40">
                  <div className="text-xs opacity-75 mb-1">
                    還付見込み額（所得税率 {Math.round(taxRate * 100)}% で計算）
                  </div>
                  <div className="text-3xl font-bold">{fmtJPY(refundMed)}</div>
                  <div className="text-xs opacity-70 mt-1">※住民税からの軽減分は含まず</div>
                </div>
              )}
            </div>
          </div>

          {/* 確定申告の要否 */}
          <div className={`rounded-2xl p-5 border ${
            needsFiling
              ? "bg-amber-50 border-amber-200"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${
                needsFiling ? "bg-amber-200 text-amber-800" : "bg-gray-200 text-gray-600"
              }`}>
                {needsFiling ? "!" : "–"}
              </div>
              <div>
                <div className={`font-semibold text-base mb-1 ${
                  needsFiling ? "text-amber-800" : "text-gray-600"
                }`}>
                  {needsFiling ? "確定申告が必要です" : "確定申告の必要はありません"}
                </div>
                <p className={`text-xs ${needsFiling ? "text-amber-700" : "text-gray-500"}`}>
                  {needsFiling
                    ? "医療費控除を受けるには確定申告が必要です。会社員の場合、年末調整では控除できません。翌年の1〜3月15日までに申告することで還付が受けられます。"
                    : "年間医療費が10万円（または総所得の5%）以下のため、医療費控除の適用はありません。"}
                </p>
              </div>
            </div>
          </div>

          {/* 所得税率別の還付額一覧 */}
          {medResult.deduction > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-1">所得税率別の還付見込み額</h2>
              <p className="text-xs text-gray-500 mb-4">控除額 {fmtJPY(medResult.deduction)} に各税率を掛けた試算</p>

              <div className="space-y-2">
                {TAX_BRACKETS.map((bracket) => {
                  const refund = Math.floor(medResult.deduction * bracket.rate);
                  const isActive = bracket.rate === taxRate;
                  return (
                    <div
                      key={bracket.label}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold w-8 ${isActive ? "text-white" : "text-gray-800"}`}>
                          {bracket.label}
                        </span>
                        {isActive && (
                          <span className="text-xs bg-white bg-opacity-25 px-1.5 py-0.5 rounded font-medium">
                            あなた
                          </span>
                        )}
                      </div>
                      <span className={`text-lg font-bold ${isActive ? "text-white" : "text-gray-900"}`}>
                        {fmtJPY(refund)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">復興特別所得税(2.1%)を加算すると還付額はわずかに増加します</p>
            </div>
          )}
        </>
      )}

      {/* ===== セルフメディケーション税制 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">セルフメディケーション税制（選択制）</h2>
        <p className="text-xs text-gray-500 mb-4">
          市販薬（スイッチOTC薬）の購入費が年間12,000円超の場合、超過分（上限88,000円）を控除できます。
          通常の医療費控除とどちらか有利な方を選択してください。
        </p>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            inputMode="numeric"
            value={selfMedInput}
            onChange={handleNumericInput(setSelfMedInput)}
            placeholder="0"
            className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
          <span className="text-gray-600 font-medium text-lg">円</span>
        </div>

        {selfMedResult.eligible && (
          <div className="mt-3 p-4 bg-teal-50 rounded-xl border border-teal-200 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-teal-800">控除額</span>
              <span className="font-bold text-teal-900">{fmtJPY(selfMedResult.deduction)}</span>
            </div>
            {totalIncome > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-teal-800">還付見込み（税率 {Math.round(taxRate * 100)}%）</span>
                <span className="font-bold text-teal-900">{fmtJPY(refundSelf)}</span>
              </div>
            )}
          </div>
        )}

        {/* 有利判定 */}
        {hasResult && selfMedResult.eligible && medResult.deduction > 0 && (
          <div className={`mt-3 p-4 rounded-xl border font-medium text-sm ${
            betterOption === "medical"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-teal-50 border-teal-300 text-teal-800"
          }`}>
            {betterOption === "medical"
              ? `通常の医療費控除の方が有利（還付額 +${fmtJPY(refundMed - refundSelf)}）`
              : `セルフメディケーション税制の方が有利（還付額 +${fmtJPY(refundSelf - refundMed)}）`}
          </div>
        )}

        {hasResult && !selfMedResult.eligible && medResult.deduction === 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
            どちらの控除も適用されません。市販薬購入費が12,000円超、または医療費が足切り額を超えた場合に控除が発生します。
          </div>
        )}
      </div>

      {/* ===== 医療費控除の対象/対象外一覧 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">医療費控除の対象・対象外</h2>

        <div className="space-y-2">
          {ELIGIBLE_EXAMPLES.map((ex) => (
            <div
              key={ex.item}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                ex.eligible ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              <span className={`text-base shrink-0 ${ex.eligible ? "text-emerald-600" : "text-red-500"}`}>
                {ex.eligible ? "○" : "×"}
              </span>
              <span className={`text-sm ${ex.eligible ? "text-emerald-900" : "text-red-800"}`}>
                {ex.item}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-3">
          ※ 判定は一般的な基準です。個別の状況により異なる場合があります。
        </p>
      </div>

      {/* ===== 免責・参考リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500 mb-2">
          本ツールは概算計算を目的としており、実際の控除額・還付額と異なる場合があります。
          所得税率の推定は給与所得控除・基礎控除のみを考慮した簡易計算です。
          正確な税額は税理士等の専門家または確定申告書作成コーナーをご利用ください。
        </p>
        <a
          href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1120.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 hover:text-emerald-700 underline"
        >
          国税庁「医療費を支払ったとき（医療費控除）」を確認する
        </a>
      </div>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">医療費控除 計算ツールの使い方</h2>
        <ol className="space-y-4">
          {[
            { step: "1", title: "家族全員の医療費を入力", desc: "同一生計の家族（配偶者・子・親など）の医療費は合算できます。メンバーを追加して各人の年間医療費を入力してください。" },
            { step: "2", title: "保険金・給付金の補填額を入力", desc: "生命保険や健康保険から給付された金額（高額療養費・入院給付金など）を入力します。補填がない場合は0のままでOKです。" },
            { step: "3", title: "年収または総所得を入力", desc: "「足切り額」の計算に使います。年収から概算するか、確定申告書の所得金額合計を直接入力できます。" },
            { step: "4", title: "控除額・還付見込みを確認", desc: "医療費控除額と、所得税率に応じた還付見込み額が表示されます。セルフメディケーション税制との比較もできます。" },
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
            q: "医療費控除は年間いくらから申請できますか？",
            a: "総所得が200万円以上の場合は医療費が10万円を超えた分が控除対象です。200万円未満の場合は「総所得の5%」を超えた分が対象になります。家族全員分を合算して計算します。",
          },
          {
            q: "医療費控除は会社員でも申請できますか？",
            a: "申請できますが、会社員の場合は年末調整では手続きできません。翌年1月〜3月15日の確定申告期間に確定申告書を提出することで還付を受けられます。",
          },
          {
            q: "医療費控除でいくら戻ってきますか？",
            a: "「控除額 × 所得税率」が還付される所得税の概算です。例えば控除額が20万円で所得税率20%なら4万円程度です。さらに住民税も翌年の税額から軽減されます（控除額×10%）。",
          },
          {
            q: "歯の治療費は医療費控除の対象になりますか？",
            a: "治療目的（虫歯・歯周病・かみ合わせ改善のための矯正など）は対象です。美容目的の歯列矯正やホワイトニングは対象外です。インプラントは一般的に対象となります。",
          },
          {
            q: "セルフメディケーション税制とはどう違いますか？",
            a: "セルフメディケーション税制は市販のスイッチOTC薬（処方薬から転換された市販薬）の購入費12,000円超の部分（上限8.8万円）を控除する制度です。通常の医療費控除と選択適用になるため、有利な方を使います。",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <p className="text-sm font-semibold text-emerald-700 mb-1">Q. {q}</p>
            <p className="text-xs text-gray-600">A. {a}</p>
          </div>
        ))}
      </div>

      {/* ===== CTA ===== */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5">
        <p className="text-sm font-semibold text-emerald-900 mb-1">確定申告ソフトで医療費控除を簡単に申請</p>
        <p className="text-xs text-emerald-700 mb-3">freee・弥生・マネーフォワードクラウドなどの確定申告ソフトは医療費の集計・申告書の自動作成に対応しています。マイナポータルと連携すれば医療費データの自動取得も可能です。</p>
        <a href="/tools/aojiro-shinkoku-sim" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-900 underline">
          青色申告の節税効果もあわせてシミュレーションする
        </a>
      </div>

      {/* ===== 関連ツール ===== */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
        <h2 className="text-sm font-semibold text-emerald-800 mb-3">関連ツール</h2>
        <div className="space-y-2">
          {[
            { href: "/tools/aojiro-shinkoku-sim", label: "青色申告控除 節税シミュレーター", desc: "青色65万円控除の節税効果を計算" },
            { href: "/tools/teigaku-genzei", label: "定額減税 計算ツール", desc: "2024年定額減税の還付額を確認" },
            { href: "/tools/ideco-tax-saving", label: "iDeCo 節税シミュレーター", desc: "iDeCo掛金による節税効果を計算" },
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
                name: "医療費控除は年間いくらから申請できますか？",
                acceptedAnswer: { "@type": "Answer", text: "総所得が200万円以上の場合は医療費が10万円を超えた分が控除対象です。200万円未満の場合は「総所得の5%」を超えた分が対象になります。家族全員分を合算して計算します。" },
              },
              {
                "@type": "Question",
                name: "医療費控除は会社員でも申請できますか？",
                acceptedAnswer: { "@type": "Answer", text: "申請できますが、年末調整では手続きできません。翌年の確定申告期間に申告書を提出することで還付を受けられます。" },
              },
              {
                "@type": "Question",
                name: "医療費控除でいくら戻ってきますか？",
                acceptedAnswer: { "@type": "Answer", text: "「控除額 × 所得税率」が還付される所得税の概算です。控除額が20万円で所得税率20%なら約4万円です。さらに住民税も翌年の税額から軽減されます。" },
              },
              {
                "@type": "Question",
                name: "歯の治療費は医療費控除の対象になりますか？",
                acceptedAnswer: { "@type": "Answer", text: "治療目的（虫歯・歯周病・かみ合わせ改善のための矯正など）は対象です。美容目的のホワイトニングは対象外です。" },
              },
              {
                "@type": "Question",
                name: "セルフメディケーション税制とはどう違いますか？",
                acceptedAnswer: { "@type": "Answer", text: "セルフメディケーション税制は市販のスイッチOTC薬の購入費12,000円超の部分（上限8.8万円）を控除する制度で、通常の医療費控除と選択適用になります。" },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
