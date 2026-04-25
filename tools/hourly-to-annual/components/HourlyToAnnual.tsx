"use client";

import { useState, useMemo } from "react";

// --- 定数 ---
const NATIONAL_AVG_HOURLY = 1004; // 全国平均時給
const TOKYO_AVG_HOURLY = 1113;    // 東京平均時給
const HOLIDAYS_JP = 16;           // 年間祝日数

// --- 雇用形態 ---
type EmploymentType = "seishain" | "part" | "freelance";

// --- タブ ---
type Tab = "hourly-to-annual" | "annual-to-hourly" | "monthly-to-hourly";

// --- フォーマット ---
function fmtJPY(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function fmtJPYUnit(n: number, unit: string): string {
  if (!isFinite(n) || n <= 0) return "—";
  return `¥${Math.round(n).toLocaleString("ja-JP")} ${unit}`;
}

function parseNum(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  const v = parseFloat(cleaned);
  return isFinite(v) ? v : 0;
}

// --- 年間労働日数計算 ---
// 52週 × 週勤務日数 - 祝日 - 有給
function calcAnnualWorkDays(weekDays: number, paidLeave: number): number {
  return Math.max(0, 52 * weekDays - HOLIDAYS_JP - paidLeave);
}

// --- 手取り概算（年収ベース） ---
// 社保: ~14.5%, 所得税+住民税: 簡易推計
function calcTakeHome(annualIncome: number, hasShaho: boolean): number {
  if (annualIncome <= 0) return 0;
  let deduction = 0;
  if (hasShaho) {
    // 社会保険料概算 (健保+厚年+雇用) ≈ 14.5%
    deduction += annualIncome * 0.145;
  }
  // 給与所得控除
  let kyuyoKoujo = 0;
  if (annualIncome <= 1_800_000) kyuyoKoujo = annualIncome * 0.4 - 100_000;
  else if (annualIncome <= 3_600_000) kyuyoKoujo = annualIncome * 0.3 + 80_000;
  else if (annualIncome <= 6_600_000) kyuyoKoujo = annualIncome * 0.2 + 440_000;
  else if (annualIncome <= 8_500_000) kyuyoKoujo = annualIncome * 0.1 + 1_100_000;
  else kyuyoKoujo = 1_950_000;
  kyuyoKoujo = Math.max(kyuyoKoujo, 550_000);

  const taxableBase = Math.max(0, annualIncome - deduction - kyuyoKoujo - 480_000); // 基礎控除48万

  // 所得税（簡易）
  let incomeTax = 0;
  if (taxableBase <= 1_950_000) incomeTax = taxableBase * 0.05;
  else if (taxableBase <= 3_300_000) incomeTax = taxableBase * 0.10 - 97_500;
  else if (taxableBase <= 6_950_000) incomeTax = taxableBase * 0.20 - 427_500;
  else if (taxableBase <= 9_000_000) incomeTax = taxableBase * 0.23 - 636_000;
  else if (taxableBase <= 18_000_000) incomeTax = taxableBase * 0.33 - 1_536_000;
  else incomeTax = taxableBase * 0.40 - 2_796_000;

  // 住民税（簡易） ≈ 10%
  const residentTax = taxableBase * 0.10;

  return Math.max(0, annualIncome - deduction - Math.max(0, incomeTax) - residentTax);
}

// --- フリーランス経費考慮後の実質年収 ---
function calcFreelanceNet(annualIncome: number, expenseRate: number): number {
  return annualIncome * (1 - expenseRate / 100);
}

// --- InputRow ---
interface InputRowProps {
  label: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
  accent?: string;
}

function InputRow({ label, sub, value, onChange, unit, placeholder = "0", inputMode = "numeric", accent = "sky" }: InputRowProps) {
  const focusRing = accent === "sky" ? "focus:ring-sky-400 focus:border-sky-400" : "focus:ring-blue-400 focus:border-blue-400";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {sub && <span className="text-xs text-gray-400 ml-1.5">{sub}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-4 py-2.5 text-right text-base font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${focusRing}`}
        />
        <span className="text-gray-600 font-medium text-sm w-14 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

// --- ResultBig ---
interface ResultBigProps {
  label: string;
  value: string;
  sub?: string;
}

function ResultBig({ label, value, sub }: ResultBigProps) {
  return (
    <div className="bg-sky-50 rounded-xl border border-sky-200 p-4 text-center">
      <div className="text-xs font-medium text-sky-700 mb-1">{label}</div>
      <div className="text-3xl font-bold text-sky-900">{value}</div>
      {sub && <div className="text-xs text-sky-600 mt-1">{sub}</div>}
    </div>
  );
}

// --- メインコンポーネント ---
export default function HourlyToAnnual() {
  const [tab, setTab] = useState<Tab>("hourly-to-annual");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("seishain");

  // 共通勤務条件
  const [dailyHours, setDailyHours] = useState("8");
  const [weekDays, setWeekDays] = useState("5");
  const [paidLeave, setPaidLeave] = useState("10");
  const [overtimeMonthly, setOvertimeMonthly] = useState("0");

  // フリーランス経費率
  const [expenseRate, setExpenseRate] = useState("20");

  // タブごとの入力
  const [hourlyInput, setHourlyInput] = useState("");
  const [annualInput, setAnnualInput] = useState("");
  const [monthlyInput, setMonthlyInput] = useState("");

  // --- 共通計算値 ---
  const annualWorkDays = useMemo(() => {
    const wd = parseNum(weekDays) || 5;
    const pl = parseNum(paidLeave);
    return calcAnnualWorkDays(wd, pl);
  }, [weekDays, paidLeave]);

  const annualWorkHours = useMemo(() => {
    const dh = parseNum(dailyHours) || 8;
    const ot = parseNum(overtimeMonthly);
    return annualWorkDays * dh + ot * 12;
  }, [annualWorkDays, dailyHours, overtimeMonthly]);

  const monthlyWorkDays = useMemo(() => annualWorkDays / 12, [annualWorkDays]);
  const monthlyWorkHours = useMemo(() => {
    const dh = parseNum(dailyHours) || 8;
    const ot = parseNum(overtimeMonthly);
    return monthlyWorkDays * dh + ot;
  }, [monthlyWorkDays, dailyHours, overtimeMonthly]);

  const hasShaho = employmentType === "seishain";

  // --- タブ別計算 ---

  // 時給 → 年収・月収
  const hourlyResults = useMemo(() => {
    const h = parseNum(hourlyInput);
    if (h <= 0 || annualWorkHours <= 0) return null;

    const overtimeBonus = parseNum(overtimeMonthly) * 12 * h * 0.25; // 残業割増25%
    const annualGross = h * annualWorkDays * (parseNum(dailyHours) || 8) + overtimeBonus;
    const monthlyGross = annualGross / 12;

    let freelanceNet: number | null = null;
    if (employmentType === "freelance") {
      freelanceNet = calcFreelanceNet(annualGross, parseNum(expenseRate));
    }

    const takeHome = calcTakeHome(
      employmentType === "freelance" ? (freelanceNet ?? annualGross) : annualGross,
      hasShaho
    );

    return { annualGross, monthlyGross, takeHome, freelanceNet };
  }, [hourlyInput, annualWorkDays, annualWorkHours, dailyHours, overtimeMonthly, employmentType, expenseRate, hasShaho]);

  // 年収 → 時給・月収
  const annualResults = useMemo(() => {
    const a = parseNum(annualInput);
    if (a <= 0 || annualWorkHours <= 0) return null;

    const hourly = a / annualWorkHours;
    const monthlyGross = a / 12;

    let freelanceNet: number | null = null;
    if (employmentType === "freelance") {
      freelanceNet = calcFreelanceNet(a, parseNum(expenseRate));
    }

    const takeHome = calcTakeHome(
      employmentType === "freelance" ? (freelanceNet ?? a) : a,
      hasShaho
    );

    return { hourly, monthlyGross, takeHome, freelanceNet };
  }, [annualInput, annualWorkHours, employmentType, expenseRate, hasShaho]);

  // 月収 → 時給・年収
  const monthlyResults = useMemo(() => {
    const m = parseNum(monthlyInput);
    if (m <= 0 || monthlyWorkHours <= 0) return null;

    const hourly = m / monthlyWorkHours;
    const annualGross = m * 12;

    let freelanceNet: number | null = null;
    if (employmentType === "freelance") {
      freelanceNet = calcFreelanceNet(annualGross, parseNum(expenseRate));
    }

    const takeHome = calcTakeHome(
      employmentType === "freelance" ? (freelanceNet ?? annualGross) : annualGross,
      hasShaho
    );

    return { hourly, annualGross, takeHome, freelanceNet };
  }, [monthlyInput, monthlyWorkHours, employmentType, expenseRate, hasShaho]);

  // --- 業界平均比較 ---
  const hourlyForComparison: number = useMemo(() => {
    if (tab === "hourly-to-annual") return parseNum(hourlyInput);
    if (tab === "annual-to-hourly") return annualResults?.hourly ?? 0;
    if (tab === "monthly-to-hourly") return monthlyResults?.hourly ?? 0;
    return 0;
  }, [tab, hourlyInput, annualResults, monthlyResults]);

  // --- 比較表データ ---
  const comparisonTable = useMemo(() => {
    const dh = parseNum(dailyHours) || 8;
    return [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000].map((h) => {
      const ot = parseNum(overtimeMonthly) * 12 * h * 0.25;
      const annual = h * annualWorkDays * dh + ot;
      const monthly = annual / 12;
      return { hourly: h, annual, monthly };
    });
  }, [annualWorkDays, dailyHours, overtimeMonthly]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "hourly-to-annual", label: "時給 → 年収" },
    { key: "annual-to-hourly", label: "年収 → 時給" },
    { key: "monthly-to-hourly", label: "月収 → 時給" },
  ];

  const employmentLabels: Record<EmploymentType, string> = {
    seishain: "正社員",
    part: "パート",
    freelance: "フリーランス",
  };

  return (
    <div className="space-y-6">
      {/* 雇用形態 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2">
        {(["seishain", "part", "freelance"] as EmploymentType[]).map((t) => (
          <button
            key={t}
            onClick={() => setEmploymentType(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              employmentType === t
                ? "bg-sky-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {employmentLabels[t]}
          </button>
        ))}
      </div>

      {/* 変換タブ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === key
                ? "bg-sky-100 text-sky-800 font-semibold"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 入力フォーム */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">入力</h2>

        {tab === "hourly-to-annual" && (
          <InputRow label="時給" value={hourlyInput} onChange={setHourlyInput} unit="円/時" placeholder="1,500" />
        )}
        {tab === "annual-to-hourly" && (
          <InputRow label="年収" value={annualInput} onChange={setAnnualInput} unit="円/年" placeholder="4,000,000" />
        )}
        {tab === "monthly-to-hourly" && (
          <InputRow label="月収" value={monthlyInput} onChange={setMonthlyInput} unit="円/月" placeholder="300,000" />
        )}
      </div>

      {/* 勤務条件 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">勤務条件</h2>

        <div className="grid grid-cols-2 gap-4">
          <InputRow
            label="1日の労働時間"
            value={dailyHours}
            onChange={setDailyHours}
            unit="時間"
            placeholder="8"
            inputMode="decimal"
          />
          <InputRow
            label="週の勤務日数"
            value={weekDays}
            onChange={setWeekDays}
            unit="日"
            placeholder="5"
            inputMode="decimal"
          />
          <InputRow
            label="年間有給日数"
            value={paidLeave}
            onChange={setPaidLeave}
            unit="日"
            placeholder="10"
          />
          <InputRow
            label="月平均残業時間"
            value={overtimeMonthly}
            onChange={setOvertimeMonthly}
            unit="時間/月"
            placeholder="0"
            inputMode="decimal"
          />
        </div>

        {employmentType === "freelance" && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <InputRow
              label="経費率（売上に対する割合）"
              value={expenseRate}
              onChange={setExpenseRate}
              unit="%"
              placeholder="20"
              inputMode="decimal"
            />
          </div>
        )}

        {/* 勤務条件サマリ */}
        <div className="mt-4 p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800 space-y-0.5">
          <div className="flex justify-between">
            <span>年間勤務日数</span>
            <span className="font-semibold">{Math.round(annualWorkDays)}日</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sky-500 text-xs pl-2">52週 × {weekDays || 5}日 - 祝日{HOLIDAYS_JP}日 - 有給{paidLeave || 0}日</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>年間総労働時間</span>
            <span className="font-semibold">{Math.round(annualWorkHours)}時間</span>
          </div>
          <div className="flex justify-between">
            <span>月平均労働時間</span>
            <span className="font-semibold">{Math.round(monthlyWorkHours * 10) / 10}時間</span>
          </div>
        </div>
      </div>

      {/* 変換結果 */}
      {tab === "hourly-to-annual" && hourlyResults && (
        <div className="space-y-4">
          {/* メイン結果 */}
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm font-semibold opacity-80 mb-4">換算結果（時給 {fmtJPYUnit(parseNum(hourlyInput), "円/時")}）</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs opacity-70 mb-1">年収（額面）</div>
                <div className="text-3xl font-bold">{fmtJPY(hourlyResults.annualGross)}</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">月収（額面）</div>
                <div className="text-3xl font-bold">{fmtJPY(hourlyResults.monthlyGross)}</div>
              </div>
            </div>
            {parseNum(overtimeMonthly) > 0 && (
              <div className="mt-3 text-xs opacity-70">残業割増（25%）込み / 月{overtimeMonthly}時間</div>
            )}
          </div>

          {/* 手取り概算 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">手取り概算</h2>
            <div className="grid grid-cols-2 gap-3">
              <ResultBig
                label="年間手取り"
                value={fmtJPY(hourlyResults.takeHome)}
                sub={`額面の${Math.round((hourlyResults.takeHome / hourlyResults.annualGross) * 100)}%`}
              />
              <ResultBig
                label="月間手取り"
                value={fmtJPY(hourlyResults.takeHome / 12)}
              />
            </div>
            {employmentType === "freelance" && hourlyResults.freelanceNet !== null && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                経費率{expenseRate}%控除後の実質年収: {fmtJPY(hourlyResults.freelanceNet)}
              </div>
            )}
            <DeductionNote employmentType={employmentType} />
          </div>
        </div>
      )}

      {tab === "annual-to-hourly" && annualResults && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm font-semibold opacity-80 mb-4">換算結果（年収 {fmtJPYUnit(parseNum(annualInput), "円")}）</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs opacity-70 mb-1">時給換算</div>
                <div className="text-3xl font-bold">{fmtJPY(annualResults.hourly)}</div>
                <div className="text-xs opacity-60 mt-0.5">円/時間</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">月収（額面）</div>
                <div className="text-3xl font-bold">{fmtJPY(annualResults.monthlyGross)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">手取り概算</h2>
            <div className="grid grid-cols-2 gap-3">
              <ResultBig
                label="年間手取り"
                value={fmtJPY(annualResults.takeHome)}
                sub={`額面の${Math.round((annualResults.takeHome / parseNum(annualInput)) * 100)}%`}
              />
              <ResultBig
                label="月間手取り"
                value={fmtJPY(annualResults.takeHome / 12)}
              />
            </div>
            {employmentType === "freelance" && annualResults.freelanceNet !== null && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                経費率{expenseRate}%控除後の実質年収: {fmtJPY(annualResults.freelanceNet)}
              </div>
            )}
            <DeductionNote employmentType={employmentType} />
          </div>
        </div>
      )}

      {tab === "monthly-to-hourly" && monthlyResults && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm font-semibold opacity-80 mb-4">換算結果（月収 {fmtJPYUnit(parseNum(monthlyInput), "円/月")}）</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs opacity-70 mb-1">時給換算</div>
                <div className="text-3xl font-bold">{fmtJPY(monthlyResults.hourly)}</div>
                <div className="text-xs opacity-60 mt-0.5">円/時間</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">年収（額面）</div>
                <div className="text-3xl font-bold">{fmtJPY(monthlyResults.annualGross)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">手取り概算</h2>
            <div className="grid grid-cols-2 gap-3">
              <ResultBig
                label="年間手取り"
                value={fmtJPY(monthlyResults.takeHome)}
                sub={`額面の${Math.round((monthlyResults.takeHome / monthlyResults.annualGross) * 100)}%`}
              />
              <ResultBig
                label="月間手取り"
                value={fmtJPY(monthlyResults.takeHome / 12)}
              />
            </div>
            {employmentType === "freelance" && monthlyResults.freelanceNet !== null && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                経費率{expenseRate}%控除後の実質年収: {fmtJPY(monthlyResults.freelanceNet)}
              </div>
            )}
            <DeductionNote employmentType={employmentType} />
          </div>
        </div>
      )}

      {/* 業界平均比較 */}
      {hourlyForComparison > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">全国・東京平均との比較</h2>
          <div className="space-y-3">
            <CompareBar
              label="全国平均時給"
              avg={NATIONAL_AVG_HOURLY}
              yours={hourlyForComparison}
            />
            <CompareBar
              label="東京都平均時給"
              avg={TOKYO_AVG_HOURLY}
              yours={hourlyForComparison}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">出典: 厚生労働省 賃金構造基本統計調査（参考値）</p>
        </div>
      )}

      {/* 比較表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">時給別 年収・月収一覧</h2>
        <p className="text-xs text-gray-500 mb-4">現在の勤務条件（{Math.round(annualWorkDays)}日/年・{dailyHours}時間/日）で計算</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-3 font-semibold text-gray-600 text-xs">時給</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600 text-xs">年収（額面）</th>
                <th className="text-right py-2 pl-3 font-semibold text-gray-600 text-xs">月収（額面）</th>
              </tr>
            </thead>
            <tbody>
              {comparisonTable.map(({ hourly, annual, monthly }) => {
                const isHighlighted = hourlyForComparison > 0 &&
                  Math.abs(hourly - hourlyForComparison) < 250;
                return (
                  <tr
                    key={hourly}
                    className={`border-b border-gray-50 ${isHighlighted ? "bg-sky-50" : "hover:bg-gray-50"}`}
                  >
                    <td className={`py-2.5 pr-3 font-bold ${isHighlighted ? "text-sky-700" : "text-gray-800"}`}>
                      ¥{hourly.toLocaleString()}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-medium ${isHighlighted ? "text-sky-800" : "text-gray-700"}`}>
                      {fmtJPY(annual)}
                    </td>
                    <td className={`py-2.5 pl-3 text-right font-medium ${isHighlighted ? "text-sky-800" : "text-gray-700"}`}>
                      {fmtJPY(monthly)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 計算メモ */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500">
          年間勤務日数 = 52週 × 週{weekDays || 5}日 - 祝日{HOLIDAYS_JP}日 - 有給{paidLeave || 0}日 = <strong>{Math.round(annualWorkDays)}日</strong>。
          残業代は月{overtimeMonthly || 0}時間 × 割増率25%で計算。
          手取り概算は給与所得控除・社会保険料（正社員のみ）・所得税・住民税を簡易計算したものです。
          実際の金額は源泉徴収票や給与明細でご確認ください。
        </p>
      </div>

      {/* ── SEO: 使い方ガイド ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">時給・年収 計算ツールの使い方</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "雇用形態を選ぶ", body: "正社員・パート・フリーランスを選択すると、社会保険料の控除有無が自動で切り替わります。" },
            { step: "2", title: "変換タブを選択", body: "「時給 → 年収」「年収 → 時給」「月収 → 時給」の3方向から目的に合ったタブを選んでください。" },
            { step: "3", title: "勤務条件を入力", body: "1日の労働時間・週勤務日数・有給日数・月平均残業時間を入力すると、より正確な換算結果が得られます。" },
            { step: "4", title: "手取りと全国平均を確認", body: "手取り概算と全国・東京都の平均時給との比較が自動で表示されます。転職・副業の収入検討にご活用ください。" },
          ].map(({ step, title, body }) => (
            <li key={step} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-sm font-bold flex items-center justify-center">{step}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── SEO: FAQ ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "時給1,500円だと年収はいくらになりますか？",
              a: "週5日・1日8時間・有給10日の標準条件で計算すると、年収は約298万円（額面）になります。残業がある場合は割増25%が加算されます。",
            },
            {
              q: "年収400万円は時給換算でいくらですか？",
              a: "標準的な正社員条件（週5日・8時間・有給10日）では、約2,000円/時間が目安です。勤務条件を変えると結果も変わるので、実際の条件を入力して確認してください。",
            },
            {
              q: "手取り額はどうやって計算していますか？",
              a: "給与所得控除・基礎控除・所得税（累進課税）・住民税（約10%）を簡易計算しています。正社員は社会保険料（約14.5%）も控除します。扶養控除や各種保険料の個人差は含まないため、目安としてご利用ください。",
            },
            {
              q: "フリーランスの場合、何が違いますか？",
              a: "フリーランスは社会保険料（国民健康保険・国民年金）が別途かかります。このツールでは経費率を入力して実質収入を概算できます。青色申告特別控除等は未考慮のため、税理士への相談をおすすめします。",
            },
            {
              q: "パートと正社員で手取りはどれくらい違いますか？",
              a: "同じ年収でも、正社員は社会保険料（約14.5%）が控除される分、手取りが少なくなります。一方でパートは週20時間未満の場合、社会保険に加入しないケースが多く、手取り率が高くなります。",
            },
          ].map(({ q, a }, i) => (
            <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-gray-800 hover:bg-sky-50 list-none">
                <span>Q. {q}</span>
                <span className="text-sky-500 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-gray-600 border-t border-gray-100">{a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* ── SEO: JSON-LD FAQPage ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "時給1,500円だと年収はいくらになりますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "週5日・1日8時間・有給10日の標準条件で計算すると、年収は約298万円（額面）になります。残業がある場合は割増25%が加算されます。" },
              },
              {
                "@type": "Question",
                "name": "年収400万円は時給換算でいくらですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "標準的な正社員条件（週5日・8時間・有給10日）では、約2,000円/時間が目安です。" },
              },
              {
                "@type": "Question",
                "name": "手取り額はどうやって計算していますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "給与所得控除・基礎控除・所得税・住民税（約10%）を簡易計算しています。正社員は社会保険料（約14.5%）も控除します。" },
              },
            ],
          }),
        }}
      />

      {/* ── SEO: 関連ツール ── */}
      <div className="bg-sky-50 rounded-2xl border border-sky-100 p-5">
        <h2 className="text-sm font-bold text-sky-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { href: "/tools/zangyou-dai", label: "残業代計算ツール", desc: "割増賃金を自動計算" },
            { href: "/tools/gyomu-itaku-hikaku", label: "業務委託 vs 正社員比較", desc: "契約形態ごとの実質収入を比較" },
            { href: "/tools/tedori-keisan", label: "手取り計算ツール", desc: "社会保険・税金を詳細計算" },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} className="flex flex-col gap-0.5 bg-white rounded-xl p-3 border border-sky-100 hover:border-sky-300 transition-colors">
              <span className="text-sm font-semibold text-sky-700">{label}</span>
              <span className="text-xs text-gray-500">{desc}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── SEO: CTA ── */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-5 text-white text-center space-y-3">
        <p className="text-base font-bold">給与・収入に関する他のツールもチェック</p>
        <p className="text-xs opacity-80">残業代・手取り・業務委託など、収入にまつわる計算を無料で。</p>
        <a href="/tools" className="inline-block bg-white text-sky-700 text-sm font-bold px-5 py-2 rounded-xl hover:bg-sky-50 transition-colors">
          全ツール一覧を見る
        </a>
      </div>
    </div>
  );
}

// --- 比較バー ---
interface CompareBarProps {
  label: string;
  avg: number;
  yours: number;
}

function CompareBar({ label, avg, yours }: CompareBarProps) {
  const diff = yours - avg;
  const pct = Math.round((diff / avg) * 100);
  const isAbove = diff >= 0;
  const barWidth = Math.min(100, Math.round((Math.min(yours, avg * 2) / (avg * 2)) * 100));
  const avgBarWidth = Math.min(100, Math.round((avg / (avg * 2)) * 100));

  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600">{label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAbove ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {isAbove ? "+" : ""}{pct}% ({isAbove ? "+" : ""}{Math.abs(diff).toLocaleString()}円)
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-10 shrink-0">平均</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${avgBarWidth}%` }} />
          </div>
          <span className="text-xs text-gray-600 w-16 text-right shrink-0">¥{avg.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sky-600 w-10 shrink-0 font-medium">あなた</span>
          <div className="flex-1 bg-sky-100 rounded-full h-2">
            <div className={`h-2 rounded-full ${isAbove ? "bg-sky-500" : "bg-red-400"}`} style={{ width: `${barWidth}%` }} />
          </div>
          <span className="text-xs text-sky-700 font-semibold w-16 text-right shrink-0">¥{Math.round(yours).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// --- 手取り注記 ---
function DeductionNote({ employmentType }: { employmentType: EmploymentType }) {
  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
      {employmentType === "seishain" && "社会保険料（約14.5%）・所得税・住民税を概算控除。扶養・各種控除は含みません。"}
      {employmentType === "part" && "社会保険料なし（週20時間未満想定）。所得税・住民税のみ概算控除。"}
      {employmentType === "freelance" && "国民健康保険・国民年金は含みません。所得税・住民税のみ概算控除。青色申告特別控除等は未考慮。"}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "時給 ↔ 年収 ↔ 月収 逆算",
  "description": "時給から年収、年収から時給を即変換。勤務時間・日数・有給・残業込みで正確に計算",
  "url": "https://tools.loresync.dev/hourly-to-annual",
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
