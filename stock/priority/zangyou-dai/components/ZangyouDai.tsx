"use client";

import { useState, useMemo } from "react";

// --- 定数 ---
const OVERTIME_LIMIT_MONTHLY = 45;
const OVERTIME_LIMIT_ANNUAL = 360;
const OVERTIME_60H_THRESHOLD = 60;

// --- 割増率 ---
const RATE = {
  legal: 0.25,
  midnight: 0.25,
  legalMidnight: 0.50,
  holiday: 0.35,
  holidayMidnight: 0.60,
  over60: 0.50,
  over60Midnight: 0.75,
} as const;

// --- 翻訳 ---
type Lang = "ja" | "en";

const T = {
  ja: {
    salaryInfo: "給与情報",
    monthly: "月給制",
    hourly: "時給制",
    basicSalary: "基本給",
    allowances: "算入する手当",
    allowancesSub: "（役職手当・資格手当等）",
    excludedAllowances: "除外手当",
    excludedAllowancesSub: "（家族・通勤・住宅・臨時等）",
    dailyHours: "1日の所定労働時間",
    annualHolidays: "年間休日数",
    hourlyWage: "時給",
    baseHourlyLabel: "基礎時給（自動計算）",
    perHour: "/時間",
    monthlyWorkHoursNote: "月平均所定労働時間",
    overtimeTitle: "残業時間（今月）",
    overtimeNote: "深夜は22:00〜5:00の時間帯。法定休日は週1回の休日。",
    legalOT: "法定時間外（通常）",
    legalOTSub: "1日8h超 or 週40h超",
    midnightOT: "深夜時間外",
    midnightOTSub: "22:00〜5:00の残業",
    holidayOT: "法定休日",
    holidayOTSub: "週1回の法定休日出勤",
    holidayMidnightOT: "法定休日・深夜",
    holidayMidnightOTSub: "法定休日の22:00〜5:00",
    monthlyOTLimit: "月間時間外",
    limit: "上限",
    exceedsMonthly: "（36協定上限超過）",
    annualEstimate: "年間換算",
    exceedsAnnual: "（36協定上限超過）",
    thisMonthOT: "今月の残業代",
    baseHourlyShort: "基礎時給",
    over60Note: "月60時間超",
    over60Applied: "割増率50%が適用されています",
    breakdown: "区分別内訳",
    legalCard: "法定時間外（通常）",
    legalCardSub: "1日8h超・週40h超",
    midnightCard: "深夜時間外",
    midnightCardSub: "22:00〜5:00",
    holidayCard: "法定休日",
    holidayCardSub: "週1回の法定休日",
    holidayMidnightCard: "法定休日・深夜",
    holidayMidnightCardSub: "法定休日の深夜帯",
    over60Card: "月60時間超（通常）",
    over60CardSub: "2023年4月〜中小企業も適用",
    over60MidnightCard: "月60時間超・深夜",
    over60MidnightCardSub: "60h超かつ22:00〜5:00",
    totalOT: "合計残業代",
    calcProcess: "計算過程",
    monthlyAvgHours: "月平均所定労働時間",
    baseHourlyCalc: "基礎時給",
    totalLabel: "合計",
    annualSim: "年間シミュレーション",
    annualSimNote: "今月の残業時間が毎月続いた場合の年間試算",
    annualOTPay: "年間残業代",
    monthlyAvgOT: "月平均残業時間",
    annualLimitOver: "36協定 年間上限超過",
    annualLimitOverDesc1: "年間換算",
    annualLimitOverDesc2: "時間が36協定の一般条項上限360時間を超えています。特別条項が必要です（上限720時間）。",
    rateTable: "割増賃金率一覧（労働基準法）",
    rateRows: [
      { label: "法定時間外（1日8h超 or 週40h超）", rate: "25%以上", note: "" },
      { label: "深夜（22:00〜5:00）のみ", rate: "25%以上", note: "時間外でない深夜" },
      { label: "法定時間外 + 深夜", rate: "50%以上", note: "25% + 25%" },
      { label: "法定休日（週1回）", rate: "35%以上", note: "振替休日は除く" },
      { label: "法定休日 + 深夜", rate: "60%以上", note: "35% + 25%" },
      { label: "月60時間超の時間外", rate: "50%以上", note: "2023年4月〜中小企業も適用" },
      { label: "月60時間超 + 深夜", rate: "75%以上", note: "50% + 25%" },
    ],
    rateNote: "所定時間外（所定労働時間を超えるが法定時間内）は割増不要ですが、会社の就業規則で割増を定めている場合があります。",
    excludedTitle: "基礎賃金から除外できる手当",
    excludedItems: ["家族手当", "通勤手当", "別居手当", "子女教育手当", "住宅手当", "臨時に支払われる賃金", "1ヶ月を超える期間ごとの賞与"],
    excludedNote: "※ 除外できるのは「実費弁償的」または「個人的事情による」手当のみ。職務・技能に対する手当（役職手当等）は含めて計算します。",
    disclaimer: "本ツールは概算計算を目的としており、実際の残業代と異なる場合があります。正確な判断は社会保険労務士等の専門家にご相談ください。2023年4月施行の月60時間超割増率引き上げ（中小企業）に対応しています。",
    mhlwLink: "厚生労働省「時間外労働の上限規制」を確認する",
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "給与タイプを選択", desc: "月給制の場合は基本給・手当・年間休日数を入力します。時給制の場合は時給を直接入力します。" },
      { step: "2", title: "基礎時給を確認", desc: "月給制では入力内容から基礎時給が自動計算されます。残業代の計算ベースとなる金額を確認してください。" },
      { step: "3", title: "残業時間を入力", desc: "法定時間外・深夜・法定休日など種別ごとに時間を入力します。36協定の上限チェックも自動で行います。" },
      { step: "4", title: "残業代と年間シミュレーションを確認", desc: "今月の残業代と、同じペースで働き続けた場合の年間残業代が計算されます。" },
    ],
    faqTitle: "よくある質問",
    faq: [
      { q: "残業代の計算方法を教えてください。", a: "残業代 = 基礎時給 × 割増率 × 残業時間 で計算されます。基礎時給は「月給 ÷ 月平均所定労働時間」です。月平均所定労働時間は「(365日 − 年間休日数) × 1日の労働時間 ÷ 12」で求めます。" },
      { q: "深夜残業の割増率は何パーセントですか？", a: "深夜（22:00〜5:00）の法定時間外残業は50%割増（通常25%＋深夜25%）です。深夜のみで法定時間外に該当しない場合は25%割増となります。" },
      { q: "月60時間超の残業は何が変わりましたか？", a: "2023年4月から中小企業にも月60時間超の割増率引き上げが適用されました。月60時間を超えた部分の時間外残業は50%以上の割増賃金が必要です（従来は25%）。" },
      { q: "家族手当・通勤手当は残業代の計算に含めますか？", a: "家族手当・通勤手当・住宅手当・臨時払いの賃金など7種類は基礎賃金から除外できます。「除外手当」欄に入力してください。役職手当など職務に関連する手当は含めて計算します。" },
    ],
    relatedTools: "関連ツール",
    relatedLinks: [
      { href: "/hourly-to-annual", icon: "💴", label: "時給換算・年収計算" },
      { href: "/teigaku-genzei", icon: "📊", label: "定額減税 計算" },
      { href: "/yukyu-nissuu", icon: "🏖️", label: "有給日数 計算" },
    ],
    unitYenMonth: "円/月",
    unitHour: "時間",
    unitDay: "日",
    unitYenHour: "円/時",
    hours: "時間",
  },
  en: {
    salaryInfo: "Salary Information",
    monthly: "Monthly Salary",
    hourly: "Hourly Wage",
    basicSalary: "Base Salary",
    allowances: "Included Allowances",
    allowancesSub: "(position, skill allowances, etc.)",
    excludedAllowances: "Excluded Allowances",
    excludedAllowancesSub: "(family, commute, housing, irregular, etc.)",
    dailyHours: "Daily Scheduled Hours",
    annualHolidays: "Annual Holidays",
    hourlyWage: "Hourly Wage",
    baseHourlyLabel: "Base Hourly Rate (auto-calculated)",
    perHour: "/hr",
    monthlyWorkHoursNote: "Monthly scheduled hours",
    overtimeTitle: "Overtime Hours (This Month)",
    overtimeNote: "Late night = 22:00–5:00. Statutory holiday = 1 day/week.",
    legalOT: "Statutory Overtime (Regular)",
    legalOTSub: "Over 8h/day or 40h/week",
    midnightOT: "Late Night Overtime",
    midnightOTSub: "22:00–5:00 overtime",
    holidayOT: "Statutory Holiday Work",
    holidayOTSub: "Weekly statutory holiday",
    holidayMidnightOT: "Holiday + Late Night",
    holidayMidnightOTSub: "Statutory holiday 22:00–5:00",
    monthlyOTLimit: "Monthly overtime",
    limit: "Limit",
    exceedsMonthly: "(Exceeds 36-Agreement limit)",
    annualEstimate: "Annual estimate",
    exceedsAnnual: "(Exceeds 36-Agreement annual limit)",
    thisMonthOT: "This Month's Overtime Pay",
    baseHourlyShort: "Base hourly",
    over60Note: "Over 60h/month",
    over60Applied: "50% premium rate applied",
    breakdown: "Breakdown by Category",
    legalCard: "Statutory Overtime (Regular)",
    legalCardSub: "Over 8h/day or 40h/week",
    midnightCard: "Late Night Overtime",
    midnightCardSub: "22:00–5:00",
    holidayCard: "Statutory Holiday",
    holidayCardSub: "Weekly statutory holiday",
    holidayMidnightCard: "Holiday + Late Night",
    holidayMidnightCardSub: "Statutory holiday late night",
    over60Card: "Over 60h/month (Regular)",
    over60CardSub: "Applies to SMEs from Apr 2023",
    over60MidnightCard: "Over 60h + Late Night",
    over60MidnightCardSub: "Over 60h and 22:00–5:00",
    totalOT: "Total Overtime Pay",
    calcProcess: "Calculation Details",
    monthlyAvgHours: "Monthly scheduled hours",
    baseHourlyCalc: "Base hourly rate",
    totalLabel: "Total",
    annualSim: "Annual Simulation",
    annualSimNote: "Annual estimate if this month's hours continue every month",
    annualOTPay: "Annual Overtime Pay",
    monthlyAvgOT: "Monthly Avg. OT Hours",
    annualLimitOver: "36-Agreement Annual Limit Exceeded",
    annualLimitOverDesc1: "Annual estimate",
    annualLimitOverDesc2: "hours exceeds the 36-Agreement general limit of 360 hours. Special provisions are required (max 720h).",
    rateTable: "Premium Wage Rates (Labor Standards Act)",
    rateRows: [
      { label: "Statutory OT (over 8h/day or 40h/week)", rate: "≥25%", note: "" },
      { label: "Late night (22:00–5:00) only", rate: "≥25%", note: "Not statutory OT" },
      { label: "Statutory OT + Late night", rate: "≥50%", note: "25% + 25%" },
      { label: "Statutory holiday (1/week)", rate: "≥35%", note: "Excludes substitute holidays" },
      { label: "Statutory holiday + Late night", rate: "≥60%", note: "35% + 25%" },
      { label: "OT over 60h/month", rate: "≥50%", note: "Applies to SMEs from Apr 2023" },
      { label: "Over 60h/month + Late night", rate: "≥75%", note: "50% + 25%" },
    ],
    rateNote: "Scheduled OT (beyond company hours but within statutory limit) requires no premium by law, but company rules may apply.",
    excludedTitle: "Allowances Excluded from Base Wage",
    excludedItems: ["Family allowance", "Commuting allowance", "Separation allowance", "Education allowance", "Housing allowance", "Irregular wages", "Bonuses (over 1 month cycle)"],
    excludedNote: "Only 'expense-reimbursement' or 'personal circumstances' allowances may be excluded. Job/skill-related allowances (position, etc.) must be included.",
    disclaimer: "This tool provides estimates only and may differ from actual overtime pay. Consult a licensed labor/social insurance consultant for accurate calculations. Updated for the April 2023 60h+ overtime rule (SMEs).",
    mhlwLink: "Ministry of Health: Overtime Hour Limits (Japanese)",
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Select Salary Type", desc: "For monthly salary, enter base salary, allowances, and annual holidays. For hourly, enter your wage directly." },
      { step: "2", title: "Verify Base Hourly Rate", desc: "For monthly salary, the base hourly rate is calculated automatically. Confirm this as the basis for overtime calculations." },
      { step: "3", title: "Enter Overtime Hours", desc: "Enter hours by category: statutory, late night, statutory holiday, etc. The tool also checks 36-Agreement limits." },
      { step: "4", title: "Review Results", desc: "See this month's overtime pay and an annual estimate if this pace continues." },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "How is overtime pay calculated?", a: "Overtime pay = base hourly rate × premium rate × overtime hours. Base hourly rate = monthly salary ÷ monthly scheduled hours. Monthly scheduled hours = (365 − annual holidays) × daily hours ÷ 12." },
      { q: "What is the late night overtime premium?", a: "Late night (22:00–5:00) statutory overtime is +50% (25% statutory + 25% late night). Late night alone (not statutory OT) is +25%." },
      { q: "What changed for over-60h overtime?", a: "From April 2023, SMEs must also pay ≥50% premium for overtime exceeding 60 hours/month (previously 25%)." },
      { q: "Are family and commuting allowances included in the base?", a: "7 allowance types (family, commuting, housing, irregular pay, etc.) may be excluded from the base wage. Enter them in the 'Excluded Allowances' field. Job-related allowances must be included." },
    ],
    relatedTools: "Related Tools",
    relatedLinks: [
      { href: "/hourly-to-annual", icon: "💴", label: "Hourly to Annual Salary" },
      { href: "/teigaku-genzei", icon: "📊", label: "Fixed Tax Reduction" },
      { href: "/yukyu-nissuu", icon: "🏖️", label: "Paid Leave Days" },
    ],
    unitYenMonth: "¥/mo",
    unitHour: "hrs",
    unitDay: "days",
    unitYenHour: "¥/hr",
    hours: "h",
  },
} as const;

// --- フォーマット ---
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtHours(n: number, lang: Lang): string {
  return `${n}${T[lang].hours}`;
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
  legalOT: number;
  midnightOT: number;
  holidayOT: number;
  holidayMidnightOT: number;
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

  const legalPay = normal60Hours * baseHourly * RATE.legal;
  const midnightNormal60 = Math.min(midnightOT, Math.max(0, OVERTIME_60H_THRESHOLD - legalOT));
  const midnightPay = midnightNormal60 * baseHourly * RATE.legalMidnight;
  const holidayPay = holidayOT * baseHourly * RATE.holiday;
  const holidayMidnightPay = holidayMidnightOT * baseHourly * RATE.holidayMidnight;
  const over60Pay = over60NormalOnlyHours * baseHourly * RATE.over60;
  const over60MidnightPay = over60MidnightHours * baseHourly * RATE.over60Midnight;

  const total = legalPay + midnightPay + holidayPay + holidayMidnightPay + over60Pay + over60MidnightPay;
  const annual = total * 12;

  return {
    legalPay, midnightPay, holidayPay, holidayMidnightPay,
    over60Pay, over60MidnightPay, totalOTHours, over60Hours,
    total, annual,
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
      <label className="block text-sm font-medium text-violet-100 mb-1">
        {label}
        {sub && <span className="text-xs text-violet-200 ml-1.5">{sub}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="number-input neon-focus flex-1 px-4 py-2.5 text-right text-base font-mono font-semibold rounded-xl transition-all"
        />
        <span className="text-violet-200 font-medium text-sm w-14 shrink-0">{unit}</span>
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
  lang: Lang;
}

function ResultCard({ label, sublabel, rate, hours, amount, lang }: ResultCardProps) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-semibold text-violet-100">{label}</div>
          {sublabel && <div className="text-xs text-violet-200 mt-0.5">{sublabel}</div>}
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full text-cyan-300 border border-cyan-500/30 bg-cyan-500/10">
          +{rate}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xs text-violet-200">{fmtHours(hours, lang)}</span>
        <span className={`text-xl font-bold font-mono ${amount > 0 ? "text-white" : "text-violet-200/50"}`}>
          {fmtJPY(amount)}
        </span>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
type SalaryType = "monthly" | "hourly";

export default function ZangyouDai() {
  const [lang, setLang] = useState<Lang>("ja");
  const [salaryType, setSalaryType] = useState<SalaryType>("monthly");

  // 月給モード
  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [excludedAllowances, setExcludedAllowances] = useState("");
  const [dailyHours, setDailyHours] = useState("8");
  const [annualHolidays, setAnnualHolidays] = useState("120");

  // 時給モード
  const [hourlyWage, setHourlyWage] = useState("");

  // 残業時間
  const [legalOT, setLegalOT] = useState("");
  const [midnightOT, setMidnightOT] = useState("");
  const [holidayOT, setHolidayOT] = useState("");
  const [holidayMidnightOT, setHolidayMidnightOT] = useState("");

  const t = T[lang];

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
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .tab-active-glow {
          box-shadow: 0 0 16px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .tab-panel {
          animation: float-in 0.25s ease-out;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .number-input::-webkit-inner-spin-button,
        .number-input::-webkit-outer-spin-button { opacity: 0.3; }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .row-hover:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
      `}</style>

      {/* JP/EN toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* 給与タイプ切り替え */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {(["monthly", "hourly"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSalaryType(type)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              salaryType === type
                ? "bg-violet-600 text-white tab-active-glow"
                : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
            }`}
          >
            {t[type]}
          </button>
        ))}
      </div>

      {/* 給与入力 */}
      <div className="glass-card rounded-2xl p-6 tab-panel">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.salaryInfo}</h2>

        {salaryType === "monthly" ? (
          <div className="space-y-4">
            <InputRow
              label={t.basicSalary}
              value={basicSalary}
              onChange={setBasicSalary}
              unit={t.unitYenMonth}
              placeholder="250,000"
            />
            <InputRow
              label={t.allowances}
              sub={t.allowancesSub}
              value={allowances}
              onChange={setAllowances}
              unit={t.unitYenMonth}
              placeholder="30,000"
            />
            <InputRow
              label={t.excludedAllowances}
              sub={t.excludedAllowancesSub}
              value={excludedAllowances}
              onChange={setExcludedAllowances}
              unit={t.unitYenMonth}
              placeholder="20,000"
            />

            <div className="border-t border-white/8 pt-4 grid grid-cols-2 gap-4">
              <InputRow
                label={t.dailyHours}
                value={dailyHours}
                onChange={setDailyHours}
                unit={t.unitHour}
                placeholder="8"
                inputMode="decimal"
              />
              <InputRow
                label={t.annualHolidays}
                value={annualHolidays}
                onChange={setAnnualHolidays}
                unit={t.unitDay}
                placeholder="120"
              />
            </div>

            {/* 基礎時給表示 */}
            {baseHourly > 0 && (
              <div className="glass-card-bright rounded-xl p-4 border border-violet-500/20">
                <div className="text-xs text-violet-100 font-medium mb-1">{t.baseHourlyLabel}</div>
                <div className="text-2xl font-bold text-white font-mono">
                  {fmtJPY(Math.round(baseHourly))}
                  <span className="text-sm font-medium text-violet-200 ml-1">{t.perHour}</span>
                </div>
                {monthlyWorkHours !== null && (
                  <div className="text-xs text-violet-200 mt-1">
                    {t.monthlyWorkHoursNote}: {monthlyWorkHours}{t.unitHour} ÷ {lang === "ja" ? "月給" : "salary"}{fmtJPY(
                      parseNum(basicSalary) + parseNum(allowances) - parseNum(excludedAllowances)
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <InputRow
            label={t.hourlyWage}
            value={hourlyWage}
            onChange={setHourlyWage}
            unit={t.unitYenHour}
            placeholder="1,500"
          />
        )}
      </div>

      {/* 残業時間入力 */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.overtimeTitle}</h2>
        <p className="text-xs text-violet-200 mb-5">{t.overtimeNote}</p>

        <div className="space-y-4">
          <InputRow label={t.legalOT} sub={t.legalOTSub} value={legalOT} onChange={setLegalOT} unit={t.unitHour} placeholder="20" inputMode="decimal" />
          <InputRow label={t.midnightOT} sub={t.midnightOTSub} value={midnightOT} onChange={setMidnightOT} unit={t.unitHour} placeholder="5" inputMode="decimal" />
          <InputRow label={t.holidayOT} sub={t.holidayOTSub} value={holidayOT} onChange={setHolidayOT} unit={t.unitHour} placeholder="0" inputMode="decimal" />
          <InputRow label={t.holidayMidnightOT} sub={t.holidayMidnightOTSub} value={holidayMidnightOT} onChange={setHolidayMidnightOT} unit={t.unitHour} placeholder="0" inputMode="decimal" />
        </div>

        {/* 36協定チェック */}
        {totalOTHours > 0 && (
          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
              exceedsMonthly
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            }`}>
              <span>{exceedsMonthly ? "⚠️" : "✓"}</span>
              <span>
                {t.monthlyOTLimit}: {totalOTHours}{t.hours} / {t.limit}{OVERTIME_LIMIT_MONTHLY}{t.hours}
                {exceedsMonthly && t.exceedsMonthly}
              </span>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium ${
              exceedsAnnual
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            }`}>
              <span>{exceedsAnnual ? "⚠️" : "✓"}</span>
              <span>
                {t.annualEstimate}: {Math.round(annualOT)}{t.hours} / {t.limit}{OVERTIME_LIMIT_ANNUAL}{t.hours}
                {exceedsAnnual && t.exceedsAnnual}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 計算結果 */}
      {result && (
        <>
          {/* 合計カード */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-4">{t.thisMonthOT}</div>

            <div className="text-5xl font-bold text-white glow-text tracking-tight mb-1">{fmtJPY(result.total)}</div>
            <div className="text-violet-200 text-sm">{t.baseHourlyShort} {fmtJPY(Math.round(baseHourly))}{t.perHour}</div>

            {result.over60Hours > 0 && (
              <div className="mt-3 px-3 py-2 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-300">
                {t.over60Note}: {result.over60Hours.toFixed(1)}{t.hours} — {t.over60Applied}
              </div>
            )}
          </div>

          {/* 区分別内訳 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.breakdown}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ResultCard
                label={t.legalCard}
                sublabel={t.legalCardSub}
                rate="25%"
                hours={Math.max(0, parseHours(legalOT) - Math.max(0, result.over60Hours - parseHours(midnightOT)))}
                amount={result.legalPay}
                lang={lang}
              />
              <ResultCard
                label={t.midnightCard}
                sublabel={t.midnightCardSub}
                rate="50%"
                hours={Math.max(0, parseHours(midnightOT) - Math.max(0, result.over60Hours - parseHours(legalOT)))}
                amount={result.midnightPay}
                lang={lang}
              />
              <ResultCard
                label={t.holidayCard}
                sublabel={t.holidayCardSub}
                rate="35%"
                hours={parseHours(holidayOT)}
                amount={result.holidayPay}
                lang={lang}
              />
              <ResultCard
                label={t.holidayMidnightCard}
                sublabel={t.holidayMidnightCardSub}
                rate="60%"
                hours={parseHours(holidayMidnightOT)}
                amount={result.holidayMidnightPay}
                lang={lang}
              />
              {result.over60Hours > 0 && (
                <>
                  <ResultCard
                    label={t.over60Card}
                    sublabel={t.over60CardSub}
                    rate="50%"
                    hours={Math.max(0, result.over60Hours - Math.min(parseHours(midnightOT), result.over60Hours))}
                    amount={result.over60Pay}
                    lang={lang}
                  />
                  {result.over60MidnightPay > 0 && (
                    <ResultCard
                      label={t.over60MidnightCard}
                      sublabel={t.over60MidnightCardSub}
                      rate="75%"
                      hours={Math.min(parseHours(midnightOT), result.over60Hours)}
                      amount={result.over60MidnightPay}
                      lang={lang}
                    />
                  )}
                </>
              )}
            </div>

            {/* 合計行 */}
            <div className="mt-4 p-4 glass-card-bright rounded-xl flex justify-between items-center border border-violet-500/20">
              <span className="font-semibold text-violet-100">{t.totalOT}</span>
              <span className="text-2xl font-bold text-white font-mono">{fmtJPY(result.total)}</span>
            </div>
          </div>

          {/* 計算過程 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">{t.calcProcess}</h2>
            <div className="space-y-2 text-sm text-violet-100">
              {salaryType === "monthly" && monthlyWorkHours !== null && (
                <>
                  <div className="flex justify-between">
                    <span>{t.monthlyAvgHours}</span>
                    <span className="font-medium text-white font-mono">{monthlyWorkHours}{t.hours}</span>
                  </div>
                  <div className="text-xs text-violet-200 flex justify-between pl-4">
                    <span>(365 - {parseNum(annualHolidays)}{t.unitDay}) × {parseNum(dailyHours)}{t.hours} ÷ 12</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>{t.baseHourlyCalc}</span>
                <span className="font-medium text-white font-mono">{fmtJPY(Math.round(baseHourly))}{t.perHour}</span>
              </div>
              {salaryType === "monthly" && (
                <div className="text-xs text-violet-200 flex justify-between pl-4">
                  <span>{lang === "ja" ? "月給" : "Salary"} {fmtJPY(parseNum(basicSalary) + parseNum(allowances) - parseNum(excludedAllowances))} ÷ {monthlyWorkHours}{t.hours}</span>
                </div>
              )}
              <div className="border-t border-white/8 pt-2">
                {parseHours(legalOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>{lang === "ja" ? "法定時間外" : "Statutory OT"} {parseHours(legalOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.25</span>
                    <span className="font-medium font-mono text-white">{fmtJPY(result.legalPay + result.over60Pay)}</span>
                  </div>
                )}
                {parseHours(midnightOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>{lang === "ja" ? "深夜時間外" : "Late night OT"} {parseHours(midnightOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.50</span>
                    <span className="font-medium font-mono text-white">{fmtJPY(result.midnightPay + result.over60MidnightPay)}</span>
                  </div>
                )}
                {parseHours(holidayOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>{lang === "ja" ? "法定休日" : "Holiday"} {parseHours(holidayOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.35</span>
                    <span className="font-medium font-mono text-white">{fmtJPY(result.holidayPay)}</span>
                  </div>
                )}
                {parseHours(holidayMidnightOT) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>{lang === "ja" ? "法定休日深夜" : "Holiday late night"} {parseHours(holidayMidnightOT)}h × {fmtJPY(Math.round(baseHourly))} × 1.60</span>
                    <span className="font-medium font-mono text-white">{fmtJPY(result.holidayMidnightPay)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-white/8 pt-2 flex justify-between font-semibold">
                <span>{t.totalLabel}</span>
                <span className="text-white font-mono">{fmtJPY(result.total)}</span>
              </div>
            </div>
          </div>

          {/* 年間シミュレーション */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.annualSim}</h2>
            <p className="text-xs text-violet-200 mb-4">{t.annualSimNote}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card-bright rounded-xl p-4 text-center border border-violet-500/20">
                <div className="text-xs text-violet-100 mb-1">{t.annualOTPay}</div>
                <div className="text-xl font-bold text-white font-mono">{fmtJPY(result.annual)}</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-xs text-violet-200 mb-1">{t.monthlyAvgOT}</div>
                <div className="text-xl font-bold text-white font-mono">{result.totalOTHours.toFixed(1)}{t.hours}</div>
              </div>
            </div>

            {exceedsAnnual && (
              <div className="mt-3 p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                <div className="text-xs font-medium text-red-400">{t.annualLimitOver}</div>
                <p className="text-xs text-red-300 mt-0.5">
                  {t.annualLimitOverDesc1} {Math.round(annualOT)}{t.hours} {t.annualLimitOverDesc2}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* 割増率一覧 */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.rateTable}</h2>

        <div className="space-y-2">
          {t.rateRows.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 glass-card rounded-xl row-hover">
              <div className="flex-1">
                <div className="text-sm font-medium text-violet-100">{item.label}</div>
                {item.note && <div className="text-xs text-violet-200 mt-0.5">{item.note}</div>}
              </div>
              <div className="text-sm font-bold text-cyan-300 shrink-0">{item.rate}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 glass-card-bright rounded-xl border border-violet-500/20">
          <p className="text-xs text-violet-100">{t.rateNote}</p>
        </div>
      </div>

      {/* 除外手当の説明 */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">{t.excludedTitle}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {t.excludedItems.map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-violet-100 glass-card rounded-lg px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <p className="text-xs text-violet-200 mt-3">{t.excludedNote}</p>
      </div>

      {/* 免責・参考リンク */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs text-violet-200 mb-2">{t.disclaimer}</p>
        <a
          href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/roudouzikan/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-300 hover:text-violet-100 underline transition-colors"
        >
          {t.mhlwLink}
        </a>
      </div>

      {/* 使い方ガイド */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-white text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 関連ツール */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
        <div className="flex flex-wrap gap-2">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 px-3 py-2 glass-card rounded-xl text-sm text-violet-100 hover:text-white hover:border-violet-500/40 transition-all"
            >
              <span>{link.icon}</span> {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage (stays Japanese) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "残業代の計算方法を教えてください。",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "残業代 = 基礎時給 × 割増率 × 残業時間 で計算されます。基礎時給は月給 ÷ 月平均所定労働時間です。",
                },
              },
              {
                "@type": "Question",
                "name": "深夜残業の割増率は何パーセントですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "深夜（22:00〜5:00）の法定時間外残業は50%割増（通常25%＋深夜25%）です。",
                },
              },
              {
                "@type": "Question",
                "name": "月60時間超の残業は何が変わりましたか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "2023年4月から中小企業にも月60時間超の割増率引き上げが適用され、50%以上の割増賃金が必要になりました。",
                },
              },
              {
                "@type": "Question",
                "name": "家族手当・通勤手当は残業代の計算に含めますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "家族手当・通勤手当・住宅手当など7種類は基礎賃金から除外できます。役職手当など職務関連手当は含めて計算します。",
                },
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
  "name": "残業代 計算機",
  "description": "残業代を法定時間外・所定時間外・深夜・休日・月60時間超に区分して正確に計算",
  "url": "https://tools.loresync.dev/zangyou-dai",
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
