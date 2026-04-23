"use client";

import { useState, useMemo } from "react";

// --- 定数 ---
const OVERTIME_LIMIT_MONTHLY = 45; // 36協定 月上限
const OVERTIME_LIMIT_ANNUAL = 360; // 36協定 年上限
const OVERTIME_60H_THRESHOLD = 60; // 月60時間超

// --- 割増率 ---
const RATE = {
  legal: 0.25,        // 法定時間外
  midnight: 0.25,     // 深夜
  legalMidnight: 0.50, // 法定時間外+深夜
  holiday: 0.35,      // 法定休日
  holidayMidnight: 0.60, // 法定休日+深夜
  over60: 0.50,       // 月60時間超
  over60Midnight: 0.75, // 月60時間超+深夜
} as const;

// --- フォーマット ---
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtHours(n: number): string {
  return `${n}時間`;
}

function parseNum(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  return parseFloat(cleaned);
}

function parseHours(s: string): number {
  const cleaned = s.replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  return parseFloat(cleaned);
}

// --- 基礎時給計算 ---
function calcBaseHourlyWage(
  monthlySalary: number,
  dailyHours: number,
  annualHolidays: number
): number {
  if (monthlySalary <= 0 || dailyHours <= 0) return 0;
  const monthlyWorkDays = (365 - annualHolidays) / 12;
  const monthlyHours = monthlyWorkDays * dailyHours;
  if (monthlyHours <= 0) return 0;
  return monthlySalary / monthlyHours;
}

// --- 残業代計算 ---
interface OvertimeInput {
  baseHourly: number;
  legalOT: number;       // 法定時間外（通常）
  midnightOT: number;    // 深夜時間外
  holidayOT: number;     // 法定休日
  holidayMidnightOT: number; // 法定休日深夜
}

interface OvertimeResult {
  legalPay: number;
  midnightPay: number;
  holidayPay: number;
  holidayMidnightPay: number;
  over60Pay: number;
  over60MidnightPay: number;
  totalOTHours: number;
  over60Hours: number;
  total: number;
  annual: number;
}

function calcOvertime(input: OvertimeInput): OvertimeResult {
  const { baseHourly, legalOT, midnightOT, holidayOT, holidayMidnightOT } = input;

  const totalOTHours = legalOT + midnightOT;
  const over60Hours = Math.max(0, totalOTHours - OVERTIME_60H_THRESHOLD);
  const normal60Hours = Math.min(legalOT, Math.max(0, OVERTIME_60H_THRESHOLD - midnightOT));
  const over60NormalHours = Math.max(0, legalOT - normal60Hours);
  const over60MidnightHours = Math.max(0, totalOTHours > OVERTIME_60H_THRESHOLD
    ? Math.min(midnightOT, over60Hours)
    : 0);
  const over60NormalOnlyHours = Math.max(0, over60Hours - over60MidnightHours);

  // 通常法定時間外（60h以内）
  const legalPay = normal60Hours * baseHourly * RATE.legal;
  // 深夜時間外（60h以内）
  const midnightNormal60 = Math.min(midnightOT, Math.max(0, OVERTIME_60H_THRESHOLD - legalOT));
  const midnightPay = midnightNormal60 * baseHourly * RATE.legalMidnight;

  // 法定休日
  const holidayPay = holidayOT * baseHourly * RATE.holiday;
  const holidayMidnightPay = holidayMidnightOT * baseHourly * RATE.holidayMidnight;

  // 月60時間超
  const over60Pay = over60NormalOnlyHours * baseHourly * RATE.over60;
  const over60MidnightPay = over60MidnightHours * baseHourly * RATE.over60Midnight;

  const total = legalPay + midnightPay + holidayPay + holidayMidnightPay + over60Pay + over60MidnightPay;
  const annual = total * 12;

  return {
    legalPay,
    midnightPay,
    holidayPay,
    holidayMidnightPay,
    over60Pay,
    over60MidnightPay,
    totalOTHours,
    over60Hours,
    total,
    annual,
  };
}

// --- サブコンポーネント ---
interface InputRowProps {
  label: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
}

function InputRow({ label, sub, value, onChange, unit, placeholder = "0", inputMode = "numeric" }: InputRowProps) {
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
          className="flex-1 px-4 py-2.5 text-right text-base font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
        />
        <span className="text-gray-600 font-medium text-sm w-12 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  sublabel?: string;
  rate: string;
  hours: number;
  amount: number;
  color: "indigo" | "purple" | "red" | "orange" | "pink";
}

const colorMap = {
  indigo: { card: "bg-indigo-50 border-indigo-200", label: "text-indigo-700", amount: "text-indigo-900" },
  purple: { card: "bg-purple-50 border-purple-200", label: "text-purple-700", amount: "text-purple-900" },
  red: { card: "bg-red-50 border-red-200", label: "text-red-700", amount: "text-red-900" },
  orange: { card: "bg-orange-50 border-orange-200", label: "text-orange-700", amount: "text-orange-900" },
  pink: { card: "bg-pink-50 border-pink-200", label: "text-pink-700", amount: "text-pink-900" },
};

function ResultCard({ label, sublabel, rate, hours, amount, color }: ResultCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border p-4 ${c.card}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className={`text-sm font-semibold ${c.label}`}>{label}</div>
          {sublabel && <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.card} border ${c.label}`}>
          +{rate}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xs text-gray-500">{fmtHours(hours)}</span>
        <span className={`text-xl font-bold ${amount > 0 ? c.amount : "text-gray-400"}`}>
          {fmtJPY(amount)}
        </span>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
type SalaryType = "monthly" | "hourly";

export default function ZangyouDai() {
  const [salaryType, setSalaryType] = useState<SalaryType>("monthly");

  // 月給モード
  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("");       // 含める手当
  const [excludedAllowances, setExcludedAllowances] = useState(""); // 除外手当
  const [dailyHours, setDailyHours] = useState("8");
  const [annualHolidays, setAnnualHolidays] = useState("120");

  // 時給モード
  const [hourlyWage, setHourlyWage] = useState("");

  // 残業時間
  const [legalOT, setLegalOT] = useState("");
  const [midnightOT, setMidnightOT] = useState("");
  const [holidayOT, setHolidayOT] = useState("");
  const [holidayMidnightOT, setHolidayMidnightOT] = useState("");

  const baseHourly = useMemo(() => {
    if (salaryType === "hourly") {
      return parseNum(hourlyWage);
    }
    const basic = parseNum(basicSalary);
    const allow = parseNum(allowances);
    const excl = parseNum(excludedAllowances);
    const totalSalary = basic + allow - excl;
    const dh = parseNum(dailyHours) || 8;
    const ah = parseNum(annualHolidays);
    return calcBaseHourlyWage(totalSalary, dh, ah);
  }, [salaryType, basicSalary, allowances, excludedAllowances, dailyHours, annualHolidays, hourlyWage]);

  const monthlyWorkHours = useMemo(() => {
    if (salaryType === "hourly") return null;
    const dh = parseNum(dailyHours) || 8;
    const ah = parseNum(annualHolidays);
    const days = (365 - ah) / 12;
    return Math.round(days * dh * 10) / 10;
  }, [salaryType, dailyHours, annualHolidays]);

  const result = useMemo(() => {
    if (baseHourly <= 0) return null;
    const otHours = parseHours(legalOT) + parseHours(midnightOT) +
      parseHours(holidayOT) + parseHours(holidayMidnightOT);
    if (otHours === 0) return null;

    return calcOvertime({
      baseHourly,
      legalOT: parseHours(legalOT),
      midnightOT: parseHours(midnightOT),
      holidayOT: parseHours(holidayOT),
      holidayMidnightOT: parseHours(holidayMidnightOT),
    });
  }, [baseHourly, legalOT, midnightOT, holidayOT, holidayMidnightOT]);

  const totalOTHours = parseHours(legalOT) + parseHours(midnightOT);
  const exceedsMonthly = totalOTHours > OVERTIME_LIMIT_MONTHLY;
  const annualOT = totalOTHours * 12;
  const exceedsAnnual = annualOT > OVERTIME_LIMIT_ANNUAL;

  return (
    <div className="space-y-6">
      {/* 給与タイプ切り替え */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2">
        {(["monthly", "hourly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSalaryType(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              salaryType === t
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "monthly" ? "月給制" : "時給制"}
          </button>
        ))}
      </div>

      {/* 給与入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">給与情報</h2>

        {salaryType === "monthly" ? (
          <div className="space-y-4">
            <InputRow
              label="基本給"
              value={basicSalary}
              onChange={setBasicSalary}
              unit="円/月"
              placeholder="250,000"
            />
            <InputRow
              label="算入する手当"
              sub="（役職手当・資格手当等）"
              value={allowances}
              onChange={setAllowances}
              unit="円/月"
              placeholder="30,000"
            />
            <InputRow
              label="除外手当"
              sub="（家族・通勤・住宅・臨時等）"
              value={excludedAllowances}
              onChange={setExcludedAllowances}
              unit="円/月"
              placeholder="20,000"
            />

            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
              <InputRow
                label="1日の所定労働時間"
                value={dailyHours}
                onChange={setDailyHours}
                unit="時間"
                placeholder="8"
                inputMode="decimal"
              />
              <InputRow
                label="年間休日数"
                value={annualHolidays}
                onChange={setAnnualHolidays}
                unit="日"
                placeholder="120"
              />
            </div>

            {/* 基礎時給表示 */}
            {baseHourly > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="text-xs text-indigo-700 font-medium mb-1">基礎時給（自動計算）</div>
                <div className="text-2xl font-bold text-indigo-900">{fmtJPY(Math.round(baseHourly))}<span className="text-sm font-medium text-indigo-600 ml-1">/時間</span></div>
                {monthlyWorkHours !== null && (
                  <div className="text-xs text-indigo-600 mt-1">
                    月平均所定労働時間: {monthlyWorkHours}時間 ÷ 月給{fmtJPY(
                      parseNum(basicSalary) + parseNum(allowances) - parseNum(excludedAllowances)
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <InputRow
            label="時給"
            value={hourlyWage}
            onChange={setHourlyWage}
            unit="円/時"
            placeholder="1,500"
          />
        )}
      </div>

      {/* 残業時間入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">残業時間（今月）</h2>
        <p className="text-xs text-gray-500 mb-5">深夜は22:00〜5:00の時間帯。法定休日は週1回の休日。</p>

        <div className="space-y-4">
          <InputRow
            label="法定時間外（通常）"
            sub="1日8h超 or 週40h超"
            value={legalOT}
            onChange={setLegalOT}
            unit="時間"
            placeholder="20"
            inputMode="decimal"
          />
          <InputRow
            label="深夜時間外"
            sub="22:00〜5:00の残業"
            value={midnightOT}
            onChange={setMidnightOT}
            unit="時間"
            placeholder="5"
            inputMode="decimal"
          />
          <InputRow
            label="法定休日"
            sub="週1回の法定休日出勤"
            value={holidayOT}
            onChange={setHolidayOT}
            unit="時間"
            placeholder="0"
            inputMode="decimal"
          />
          <InputRow
            label="法定休日・深夜"
            sub="法定休日の22:00〜5:00"
            value={holidayMidnightOT}
            onChange={setHolidayMidnightOT}
            unit="時間"
            placeholder="0"
            inputMode="decimal"
          />
        </div>

        {/* 36協定チェック */}
        {totalOTHours > 0 && (
          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
              exceedsMonthly
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              <span>{exceedsMonthly ? "⚠️" : "✓"}</span>
              <span>
                月間時間外: {totalOTHours}時間 / 上限{OVERTIME_LIMIT_MONTHLY}時間
                {exceedsMonthly && "（36協定上限超過）"}
              </span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
              exceedsAnnual
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              <span>{exceedsAnnual ? "⚠️" : "✓"}</span>
              <span>
                年間換算: {Math.round(annualOT)}時間 / 上限{OVERTIME_LIMIT_ANNUAL}時間
                {exceedsAnnual && "（36協定上限超過）"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 計算結果 */}
      {result && (
        <>
          {/* 合計カード */}
          <div className="bg-gradient-to-br from-indigo-700 to-blue-800 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-base font-semibold opacity-90 mb-4">今月の残業代</div>

            <div className="text-4xl font-bold mb-1">{fmtJPY(result.total)}</div>
            <div className="text-indigo-200 text-sm">基礎時給 {fmtJPY(Math.round(baseHourly))}/時間</div>

            {result.over60Hours > 0 && (
              <div className="mt-3 px-3 py-2 bg-yellow-400 bg-opacity-20 rounded-xl border border-yellow-300 border-opacity-40 text-xs text-yellow-100">
                月60時間超: {result.over60Hours.toFixed(1)}時間 — 割増率50%が適用されています
              </div>
            )}
          </div>

          {/* 区分別内訳 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">区分別内訳</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ResultCard
                label="法定時間外（通常）"
                sublabel="1日8h超・週40h超"
                rate="25%"
                hours={Math.max(0, parseHours(legalOT) - Math.max(0, result.over60Hours - parseHours(midnightOT)))}
                amount={result.legalPay}
                color="indigo"
              />
              <ResultCard
                label="深夜時間外"
                sublabel="22:00〜5:00"
                rate="50%"
                hours={Math.max(0, parseHours(midnightOT) - Math.max(0, result.over60Hours - parseHours(legalOT)))}
                amount={result.midnightPay}
                color="purple"
              />
              <ResultCard
                label="法定休日"
                sublabel="週1回の法定休日"
                rate="35%"
                hours={parseHours(holidayOT)}
                amount={result.holidayPay}
                color="orange"
              />
              <ResultCard
                label="法定休日・深夜"
                sublabel="法定休日の深夜帯"
                rate="60%"
                hours={parseHours(holidayMidnightOT)}
                amount={result.holidayMidnightPay}
                color="red"
              />
              {result.over60Hours > 0 && (
                <>
                  <ResultCard
                    label="月60時間超（通常）"
                    sublabel="2023年4月〜中小企業も適用"
                    rate="50%"
                    hours={Math.max(0, result.over60Hours - Math.min(parseHours(midnightOT), result.over60Hours))}
                    amount={result.over60Pay}
                    color="pink"
                  />
                  {result.over60MidnightPay > 0 && (
                    <ResultCard
                      label="月60時間超・深夜"
                      sublabel="60h超かつ22:00〜5:00"
                      rate="75%"
                      hours={Math.min(parseHours(midnightOT), result.over60Hours)}
                      amount={result.over60MidnightPay}
                      color="pink"
                    />
                  )}
                </>
              )}
            </div>

            {/* 合計行 */}
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex justify-between items-center">
              <span className="font-semibold text-indigo-800">合計残業代</span>
              <span className="text-2xl font-bold text-indigo-900">{fmtJPY(result.total)}</span>
            </div>
          </div>

          {/* 計算過程 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">計算過程</h2>
            <div className="space-y-2 text-sm text-gray-600">
              {salaryType === "monthly" && monthlyWorkHours !== null && (
                <>
                  <div className="flex justify-between">
                    <span>月平均所定労働時間</span>
                    <span className="font-medium text-gray-900">{monthlyWorkHours}時間</span>
                  </div>
                  <div className="text-xs text-gray-400 flex justify-between pl-4">
                    <span>(365 - {parseNum(annualHolidays)}日) × {parseNum(dailyHours)}時間 ÷ 12</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>基礎時給</span>
                <span className="font-medium text-gray-900">{fmtJPY(Math.round(baseHourly))}/時</span>
              </div>
              {salaryType === "monthly" && (
                <div className="text-xs text-gray-400 flex justify-between pl-4">
                  <span>月給 {fmtJPY(parseNum(basicSalary) + parseNum(allowances) - parseNum(excludedAllowances))} ÷ {monthlyWorkHours}時間</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2">
                {parseHours(legalOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>法定時間外 {parseHours(legalOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.25</span>
                    <span className="font-medium">{fmtJPY(result.legalPay + result.over60Pay)}</span>
                  </div>
                )}
                {parseHours(midnightOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>深夜時間外 {parseHours(midnightOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.50</span>
                    <span className="font-medium">{fmtJPY(result.midnightPay + result.over60MidnightPay)}</span>
                  </div>
                )}
                {parseHours(holidayOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>法定休日 {parseHours(holidayOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.35</span>
                    <span className="font-medium">{fmtJPY(result.holidayPay)}</span>
                  </div>
                )}
                {parseHours(holidayMidnightOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>法定休日深夜 {parseHours(holidayMidnightOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.60</span>
                    <span className="font-medium">{fmtJPY(result.holidayMidnightPay)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                <span>合計</span>
                <span className="text-gray-900">{fmtJPY(result.total)}</span>
              </div>
            </div>
          </div>

          {/* 年間シミュレーション */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">年間シミュレーション</h2>
            <p className="text-xs text-gray-500 mb-4">今月の残業時間が毎月続いた場合の年間試算</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                <div className="text-xs text-indigo-700 mb-1">年間残業代</div>
                <div className="text-xl font-bold text-indigo-900">{fmtJPY(result.annual)}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <div className="text-xs text-gray-600 mb-1">月平均残業時間</div>
                <div className="text-xl font-bold text-gray-900">{result.totalOTHours.toFixed(1)}時間</div>
              </div>
            </div>

            {exceedsAnnual && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="text-xs font-medium text-red-800">36協定 年間上限超過</div>
                <p className="text-xs text-red-700 mt-0.5">
                  年間換算 {Math.round(annualOT)}時間 が36協定の一般条項上限360時間を超えています。
                  特別条項が必要です（上限720時間）。
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 割増率一覧 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">割増賃金率一覧（労働基準法）</h2>

        <div className="space-y-2">
          {[
            { label: "法定時間外（1日8h超 or 週40h超）", rate: "25%以上", note: "" },
            { label: "深夜（22:00〜5:00）のみ", rate: "25%以上", note: "時間外でない深夜" },
            { label: "法定時間外 + 深夜", rate: "50%以上", note: "25% + 25%" },
            { label: "法定休日（週1回）", rate: "35%以上", note: "振替休日は除く" },
            { label: "法定休日 + 深夜", rate: "60%以上", note: "35% + 25%" },
            { label: "月60時間超の時間外", rate: "50%以上", note: "2023年4月〜中小企業も適用" },
            { label: "月60時間超 + 深夜", rate: "75%以上", note: "50% + 25%" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{item.label}</div>
                {item.note && <div className="text-xs text-gray-500 mt-0.5">{item.note}</div>}
              </div>
              <div className="text-sm font-bold text-indigo-700 shrink-0">{item.rate}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-medium">所定時間外（所定労働時間を超えるが法定時間内）</span>は割増不要ですが、
            会社の就業規則で割増を定めている場合があります。
          </p>
        </div>
      </div>

      {/* 除外手当の説明 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">基礎賃金から除外できる手当</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["家族手当", "通勤手当", "別居手当", "子女教育手当", "住宅手当", "臨時に支払われる賃金", "1ヶ月を超える期間ごとの賞与"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ※ 除外できるのは「実費弁償的」または「個人的事情による」手当のみ。
          職務・技能に対する手当（役職手当等）は含めて計算します。
        </p>
      </div>

      {/* 免責・参考リンク */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500 mb-2">
          本ツールは概算計算を目的としており、実際の残業代と異なる場合があります。
          正確な判断は社会保険労務士等の専門家にご相談ください。
          2023年4月施行の月60時間超割増率引き上げ（中小企業）に対応しています。
        </p>
        <a
          href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/roudouzikan/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-700 underline"
        >
          厚生労働省「時間外労働の上限規制」を確認する
        </a>
      </div>
    </div>
  );
}
