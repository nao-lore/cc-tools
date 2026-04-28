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

type Lang = "ja" | "en";

// --- 翻訳定数 ---
const T = {
  ja: {
    // Employment types
    seishain: "正社員",
    part: "パート",
    freelance: "フリーランス",
    // Tabs
    tabHourlyToAnnual: "時給 → 年収",
    tabAnnualToHourly: "年収 → 時給",
    tabMonthlyToHourly: "月収 → 時給",
    // Section headings
    inputHeading: "入力",
    conditionsHeading: "勤務条件",
    takeHomeHeading: "手取り概算",
    comparisonHeading: "全国・東京平均との比較",
    tableHeading: "時給別 年収・月収一覧",
    guideHeading: "時給・年収 計算ツールの使い方",
    faqHeading: "よくある質問",
    relatedHeading: "関連ツール",
    // Labels
    hourlyLabel: "時給",
    annualLabel: "年収",
    monthlyLabel: "月収",
    dailyHoursLabel: "1日の労働時間",
    weekDaysLabel: "週の勤務日数",
    paidLeaveLabel: "年間有給日数",
    overtimeLabel: "月平均残業時間",
    expenseRateLabel: "経費率（売上に対する割合）",
    // Units
    hourlyUnit: "円/時",
    annualUnit: "円/年",
    monthlyUnit: "円/月",
    hoursUnit: "時間",
    daysUnit: "日",
    hoursPerMonthUnit: "時間/月",
    percentUnit: "%",
    // Result labels
    resultHeading: "換算結果",
    annualGrossLabel: "年収（額面）",
    monthlyGrossLabel: "月収（額面）",
    hourlyConvLabel: "時給換算",
    perHourSub: "円/時間",
    overtimeNote: "残業割増（25%）込み",
    annualTakeHome: "年間手取り",
    monthlyTakeHome: "月間手取り",
    faceMaskPct: "額面の",
    freelanceNetNote: "経費率",
    freelanceNetSuffix: "%控除後の実質年収：",
    // Work summary
    annualWorkDays: "年間勤務日数",
    weekFormula: "52週 × ",
    weekSuffix: "日 - 祝日",
    holidaySuffix: "日 - 有給",
    paidLeaveSuffix: "日",
    annualHours: "年間総労働時間",
    monthlyHours: "月平均労働時間",
    hoursShort: "時間",
    daysShort: "日",
    // Comparison
    nationalAvg: "全国平均時給",
    tokyoAvg: "東京都平均時給",
    sourceNote: "出典: 厚生労働省 賃金構造基本統計調査（参考値）",
    avgLabel: "平均",
    youLabel: "あなた",
    aboveAvg: "平均以上",
    belowAvg: "平均以下",
    // Table
    tableSubtitle: "現在の勤務条件（",
    tableSubtitleMid: "日/年・",
    tableSubtitleEnd: "時間/日）で計算",
    hourlyCol: "時給",
    annualCol: "年収（額面）",
    monthlyCol: "月収（額面）",
    // Calc note
    calcNote: "年間勤務日数 = 52週 × 週",
    calcNote2: "日 - 祝日",
    calcNote3: "日 - 有給",
    calcNote4: "日 =",
    calcNote5: "日。残業代は月",
    calcNote6: "時間 × 割増率25%で計算。手取り概算は給与所得控除・社会保険料（正社員のみ）・所得税・住民税を簡易計算したものです。実際の金額は源泉徴収票や給与明細でご確認ください。",
    // Deduction notes
    deductionSeishain: "社会保険料（約14.5%）・所得税・住民税を概算控除。扶養・各種控除は含みません。",
    deductionPart: "社会保険料なし（週20時間未満想定）。所得税・住民税のみ概算控除。",
    deductionFreelance: "国民健康保険・国民年金は含みません。所得税・住民税のみ概算控除。青色申告特別控除等は未考慮。",
    // Guide
    guide: [
      { step: "1", title: "雇用形態を選ぶ", body: "正社員・パート・フリーランスを選択すると、社会保険料の控除有無が自動で切り替わります。" },
      { step: "2", title: "変換タブを選択", body: "「時給 → 年収」「年収 → 時給」「月収 → 時給」の3方向から目的に合ったタブを選んでください。" },
      { step: "3", title: "勤務条件を入力", body: "1日の労働時間・週勤務日数・有給日数・月平均残業時間を入力すると、より正確な換算結果が得られます。" },
      { step: "4", title: "手取りと全国平均を確認", body: "手取り概算と全国・東京都の平均時給との比較が自動で表示されます。転職・副業の収入検討にご活用ください。" },
    ],
    // FAQ
    faq: [
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
    ],
    // Related links
    relatedLinks: [
      { href: "/tools/zangyou-dai", label: "残業代計算ツール", desc: "割増賃金を自動計算" },
      { href: "/tools/gyomu-itaku-hikaku", label: "業務委託 vs 正社員比較", desc: "契約形態ごとの実質収入を比較" },
      { href: "/tools/tedori-keisan", label: "手取り計算ツール", desc: "社会保険・税金を詳細計算" },
    ],
    // CTA
    ctaHeading: "給与・収入に関する他のツールもチェック",
    ctaSubtitle: "残業代・手取り・業務委託など、収入にまつわる計算を無料で。",
    ctaButton: "全ツール一覧を見る",
  },
  en: {
    // Employment types
    seishain: "Full-time",
    part: "Part-time",
    freelance: "Freelance",
    // Tabs
    tabHourlyToAnnual: "Hourly → Annual",
    tabAnnualToHourly: "Annual → Hourly",
    tabMonthlyToHourly: "Monthly → Hourly",
    // Section headings
    inputHeading: "Input",
    conditionsHeading: "Work Conditions",
    takeHomeHeading: "Take-home Estimate",
    comparisonHeading: "vs. National & Tokyo Average",
    tableHeading: "Annual/Monthly Income by Hourly Rate",
    guideHeading: "How to Use This Calculator",
    faqHeading: "FAQ",
    relatedHeading: "Related Tools",
    // Labels
    hourlyLabel: "Hourly Rate",
    annualLabel: "Annual Income",
    monthlyLabel: "Monthly Income",
    dailyHoursLabel: "Daily Work Hours",
    weekDaysLabel: "Work Days per Week",
    paidLeaveLabel: "Paid Leave Days (annual)",
    overtimeLabel: "Avg. Monthly Overtime",
    expenseRateLabel: "Expense Rate (% of revenue)",
    // Units
    hourlyUnit: "¥/hr",
    annualUnit: "¥/yr",
    monthlyUnit: "¥/mo",
    hoursUnit: "hrs",
    daysUnit: "days",
    hoursPerMonthUnit: "hrs/mo",
    percentUnit: "%",
    // Result labels
    resultHeading: "Conversion Result",
    annualGrossLabel: "Annual (gross)",
    monthlyGrossLabel: "Monthly (gross)",
    hourlyConvLabel: "Hourly rate",
    perHourSub: "¥/hour",
    overtimeNote: "incl. overtime premium (25%)",
    annualTakeHome: "Annual Take-home",
    monthlyTakeHome: "Monthly Take-home",
    faceMaskPct: "",
    freelanceNetNote: "After ",
    freelanceNetSuffix: "% expense deduction, net annual income: ",
    // Work summary
    annualWorkDays: "Annual Work Days",
    weekFormula: "52wks × ",
    weekSuffix: "d - holidays ",
    holidaySuffix: "d - leave ",
    paidLeaveSuffix: "d",
    annualHours: "Annual Work Hours",
    monthlyHours: "Monthly Avg. Hours",
    hoursShort: "hrs",
    daysShort: "days",
    // Comparison
    nationalAvg: "National Avg. Hourly",
    tokyoAvg: "Tokyo Avg. Hourly",
    sourceNote: "Source: MHLW Basic Survey on Wage Structure (reference)",
    avgLabel: "Avg",
    youLabel: "You",
    aboveAvg: "above avg",
    belowAvg: "below avg",
    // Table
    tableSubtitle: "Calculated with current conditions (",
    tableSubtitleMid: "days/yr · ",
    tableSubtitleEnd: "hrs/day)",
    hourlyCol: "Hourly",
    annualCol: "Annual (gross)",
    monthlyCol: "Monthly (gross)",
    // Calc note
    calcNote: "Annual work days = 52wks × ",
    calcNote2: "d - holidays ",
    calcNote3: "d - leave ",
    calcNote4: "d =",
    calcNote5: "days. Overtime calculated at 25% premium for ",
    calcNote6: "hrs/mo. Take-home is estimated using employment income deduction, social insurance (full-time only), income tax, and resident tax. Please verify with your payslip or tax certificate.",
    // Deduction notes
    deductionSeishain: "Social insurance (~14.5%), income tax, and resident tax deducted. Dependent/individual deductions not included.",
    deductionPart: "No social insurance assumed (< 20hrs/week). Only income and resident tax estimated.",
    deductionFreelance: "National health insurance and pension not included. Only income and resident tax estimated. Blue-form deduction not applied.",
    // Guide
    guide: [
      { step: "1", title: "Select Employment Type", body: "Choose full-time, part-time, or freelance. Social insurance deductions switch automatically." },
      { step: "2", title: "Select a Tab", body: "Pick 'Hourly → Annual', 'Annual → Hourly', or 'Monthly → Hourly' based on what you know." },
      { step: "3", title: "Enter Work Conditions", body: "Enter daily hours, work days per week, paid leave, and monthly overtime for accurate results." },
      { step: "4", title: "Check Take-home & Comparison", body: "Take-home estimate and comparison with national/Tokyo averages display automatically." },
    ],
    // FAQ
    faq: [
      {
        q: "How much is ¥1,500/hr as an annual salary?",
        a: "Under standard conditions (5 days/week, 8 hrs/day, 10 days paid leave), the gross annual income is approximately ¥2.98M. Overtime adds a 25% premium.",
      },
      {
        q: "What is ¥4M annual income as an hourly rate?",
        a: "Under standard full-time conditions (5 days/week, 8 hrs/day, 10 days leave), it's approximately ¥2,000/hr. Adjust the conditions to match your actual situation.",
      },
      {
        q: "How is take-home pay calculated?",
        a: "We apply the employment income deduction, basic exemption, progressive income tax, and ~10% resident tax. Full-time employees also have ~14.5% social insurance deducted. Individual deductions are not included — use this as a rough guide.",
      },
      {
        q: "What's different for freelancers?",
        a: "Freelancers pay national health insurance and pension separately. This tool lets you input an expense rate to estimate net income. Blue-form deductions are not applied; consult a tax accountant for accuracy.",
      },
      {
        q: "How does take-home differ between full-time and part-time?",
        a: "With the same income, full-time employees have ~14.5% social insurance deducted, reducing take-home. Part-timers under 20 hrs/week often skip social insurance, resulting in a higher take-home rate.",
      },
    ],
    // Related links
    relatedLinks: [
      { href: "/tools/zangyou-dai", label: "Overtime Pay Calculator", desc: "Auto-calculate overtime premium wages" },
      { href: "/tools/gyomu-itaku-hikaku", label: "Contract vs. Full-time", desc: "Compare net income by employment type" },
      { href: "/tools/tedori-keisan", label: "Take-home Calculator", desc: "Detailed social insurance & tax calc" },
    ],
    // CTA
    ctaHeading: "Check More Salary & Income Tools",
    ctaSubtitle: "Overtime, take-home, contract work — all free.",
    ctaButton: "View All Tools",
  },
} as const;

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
function calcAnnualWorkDays(weekDays: number, paidLeave: number): number {
  return Math.max(0, 52 * weekDays - HOLIDAYS_JP - paidLeave);
}

// --- 手取り概算（年収ベース） ---
function calcTakeHome(annualIncome: number, hasShaho: boolean): number {
  if (annualIncome <= 0) return 0;
  let deduction = 0;
  if (hasShaho) {
    deduction += annualIncome * 0.145;
  }
  let kyuyoKoujo = 0;
  if (annualIncome <= 1_800_000) kyuyoKoujo = annualIncome * 0.4 - 100_000;
  else if (annualIncome <= 3_600_000) kyuyoKoujo = annualIncome * 0.3 + 80_000;
  else if (annualIncome <= 6_600_000) kyuyoKoujo = annualIncome * 0.2 + 440_000;
  else if (annualIncome <= 8_500_000) kyuyoKoujo = annualIncome * 0.1 + 1_100_000;
  else kyuyoKoujo = 1_950_000;
  kyuyoKoujo = Math.max(kyuyoKoujo, 550_000);

  const taxableBase = Math.max(0, annualIncome - deduction - kyuyoKoujo - 480_000);

  let incomeTax = 0;
  if (taxableBase <= 1_950_000) incomeTax = taxableBase * 0.05;
  else if (taxableBase <= 3_300_000) incomeTax = taxableBase * 0.10 - 97_500;
  else if (taxableBase <= 6_950_000) incomeTax = taxableBase * 0.20 - 427_500;
  else if (taxableBase <= 9_000_000) incomeTax = taxableBase * 0.23 - 636_000;
  else if (taxableBase <= 18_000_000) incomeTax = taxableBase * 0.33 - 1_536_000;
  else incomeTax = taxableBase * 0.40 - 2_796_000;

  const residentTax = taxableBase * 0.10;

  return Math.max(0, annualIncome - deduction - Math.max(0, incomeTax) - residentTax);
}

// --- フリーランス経費考慮後の実質年収 ---
function calcFreelanceNet(annualIncome: number, expenseRate: number): number {
  return annualIncome * (1 - expenseRate / 100);
}

// --- メインコンポーネント ---
export default function HourlyToAnnual() {
  const [tab, setTab] = useState<Tab>("hourly-to-annual");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("seishain");
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

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
  const hourlyResults = useMemo(() => {
    const h = parseNum(hourlyInput);
    if (h <= 0 || annualWorkHours <= 0) return null;

    const overtimeBonus = parseNum(overtimeMonthly) * 12 * h * 0.25;
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

  const EMPLOYMENT_TYPES: EmploymentType[] = ["seishain", "part", "freelance"];
  const TABS: { key: Tab; label: string }[] = [
    { key: "hourly-to-annual", label: t.tabHourlyToAnnual },
    { key: "annual-to-hourly", label: t.tabAnnualToHourly },
    { key: "monthly-to-hourly", label: t.tabMonthlyToHourly },
  ];

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2); }
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
        .method-btn:hover {
          box-shadow: 0 0 16px rgba(167,139,250,0.2);
        }
        .method-btn-active {
          box-shadow: 0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          background: rgba(139,92,246,0.2);
          border-color: rgba(167,139,250,0.6) !important;
        }
        .preset-active {
          background: rgba(139,92,246,0.25);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
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
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
        .compare-bar-bg {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
        }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* 雇用形態 */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {EMPLOYMENT_TYPES.map((empType) => (
          <button
            key={empType}
            onClick={() => setEmploymentType(empType)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              employmentType === empType
                ? "bg-violet-600 text-white tab-active-glow"
                : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
            }`}
          >
            {t[empType]}
          </button>
        ))}
      </div>

      {/* 変換タブ */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1 flex-wrap">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === key
                ? "bg-violet-600 text-white tab-active-glow"
                : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 入力フォーム */}
      <div className="glass-card rounded-2xl p-6 space-y-4 tab-panel">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.inputHeading}</h2>

        {tab === "hourly-to-annual" && (
          <GlassInputRow
            label={t.hourlyLabel}
            value={hourlyInput}
            onChange={setHourlyInput}
            unit={t.hourlyUnit}
            placeholder="1,500"
          />
        )}
        {tab === "annual-to-hourly" && (
          <GlassInputRow
            label={t.annualLabel}
            value={annualInput}
            onChange={setAnnualInput}
            unit={t.annualUnit}
            placeholder="4,000,000"
          />
        )}
        {tab === "monthly-to-hourly" && (
          <GlassInputRow
            label={t.monthlyLabel}
            value={monthlyInput}
            onChange={setMonthlyInput}
            unit={t.monthlyUnit}
            placeholder="300,000"
          />
        )}
      </div>

      {/* 勤務条件 */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.conditionsHeading}</h2>

        <div className="grid grid-cols-2 gap-4">
          <GlassInputRow
            label={t.dailyHoursLabel}
            value={dailyHours}
            onChange={setDailyHours}
            unit={t.hoursUnit}
            placeholder="8"
            inputMode="decimal"
          />
          <GlassInputRow
            label={t.weekDaysLabel}
            value={weekDays}
            onChange={setWeekDays}
            unit={t.daysUnit}
            placeholder="5"
            inputMode="decimal"
          />
          <GlassInputRow
            label={t.paidLeaveLabel}
            value={paidLeave}
            onChange={setPaidLeave}
            unit={t.daysUnit}
            placeholder="10"
          />
          <GlassInputRow
            label={t.overtimeLabel}
            value={overtimeMonthly}
            onChange={setOvertimeMonthly}
            unit={t.hoursPerMonthUnit}
            placeholder="0"
            inputMode="decimal"
          />
        </div>

        {employmentType === "freelance" && (
          <div className="mt-4 border-t border-white/8 pt-4">
            <GlassInputRow
              label={t.expenseRateLabel}
              value={expenseRate}
              onChange={setExpenseRate}
              unit={t.percentUnit}
              placeholder="20"
              inputMode="decimal"
            />
          </div>
        )}

        {/* 勤務条件サマリ */}
        <div className="mt-5 glass-card rounded-xl p-4 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-violet-200">{t.annualWorkDays}</span>
            <span className="font-mono font-semibold text-white">{Math.round(annualWorkDays)}{t.daysShort}</span>
          </div>
          <div className="text-violet-200 text-xs pl-1 opacity-70">
            {t.weekFormula}{weekDays || 5}{t.weekSuffix}{HOLIDAYS_JP}{t.holidaySuffix}{paidLeave || 0}{t.paidLeaveSuffix}
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-violet-200">{t.annualHours}</span>
            <span className="font-mono font-semibold text-white">{Math.round(annualWorkHours)}{t.hoursShort}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-violet-200">{t.monthlyHours}</span>
            <span className="font-mono font-semibold text-white">{Math.round(monthlyWorkHours * 10) / 10}{t.hoursShort}</span>
          </div>
        </div>
      </div>

      {/* ===== 時給 → 年収 結果 ===== */}
      {tab === "hourly-to-annual" && hourlyResults && (
        <div className="space-y-4 tab-panel">
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">
              {t.resultHeading} — {fmtJPYUnit(parseNum(hourlyInput), t.hourlyUnit)}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-xs text-violet-200 mb-1.5">{t.annualGrossLabel}</div>
                <div className="text-3xl font-bold text-white glow-text font-mono tracking-tight">{fmtJPY(hourlyResults.annualGross)}</div>
              </div>
              <div>
                <div className="text-xs text-violet-200 mb-1.5">{t.monthlyGrossLabel}</div>
                <div className="text-3xl font-bold text-white glow-text font-mono tracking-tight">{fmtJPY(hourlyResults.monthlyGross)}</div>
              </div>
            </div>
            {parseNum(overtimeMonthly) > 0 && (
              <div className="text-xs text-violet-200 mb-4">{t.overtimeNote} / {overtimeMonthly}{lang === "ja" ? "時間/月" : "hrs/mo"}</div>
            )}

            <h3 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-3">{t.takeHomeHeading}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3.5 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.annualTakeHome}</div>
                <div className="font-bold text-xl text-white font-mono">{fmtJPY(hourlyResults.takeHome)}</div>
                <div className="text-xs text-cyan-300 mt-1">{t.faceMaskPct}{Math.round((hourlyResults.takeHome / hourlyResults.annualGross) * 100)}%</div>
              </div>
              <div className="glass-card rounded-xl p-3.5 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.monthlyTakeHome}</div>
                <div className="font-bold text-xl text-white font-mono">{fmtJPY(hourlyResults.takeHome / 12)}</div>
              </div>
            </div>
            {employmentType === "freelance" && hourlyResults.freelanceNet !== null && (
              <div className="mt-3 glass-card rounded-xl px-4 py-2.5 text-xs text-violet-100 border border-amber-500/20">
                {t.freelanceNetNote}{expenseRate}{t.freelanceNetSuffix}{fmtJPY(hourlyResults.freelanceNet)}
              </div>
            )}
            <DeductionNote employmentType={employmentType} t={t} />
          </div>
        </div>
      )}

      {/* ===== 年収 → 時給 結果 ===== */}
      {tab === "annual-to-hourly" && annualResults && (
        <div className="space-y-4 tab-panel">
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">
              {t.resultHeading} — {fmtJPYUnit(parseNum(annualInput), lang === "ja" ? "円" : "¥")}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-xs text-violet-200 mb-1.5">{t.hourlyConvLabel}</div>
                <div className="text-3xl font-bold text-white glow-text font-mono tracking-tight">{fmtJPY(annualResults.hourly)}</div>
                <div className="text-xs text-violet-200 mt-0.5">{t.perHourSub}</div>
              </div>
              <div>
                <div className="text-xs text-violet-200 mb-1.5">{t.monthlyGrossLabel}</div>
                <div className="text-3xl font-bold text-white glow-text font-mono tracking-tight">{fmtJPY(annualResults.monthlyGross)}</div>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-3">{t.takeHomeHeading}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3.5 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.annualTakeHome}</div>
                <div className="font-bold text-xl text-white font-mono">{fmtJPY(annualResults.takeHome)}</div>
                <div className="text-xs text-cyan-300 mt-1">{t.faceMaskPct}{Math.round((annualResults.takeHome / parseNum(annualInput)) * 100)}%</div>
              </div>
              <div className="glass-card rounded-xl p-3.5 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.monthlyTakeHome}</div>
                <div className="font-bold text-xl text-white font-mono">{fmtJPY(annualResults.takeHome / 12)}</div>
              </div>
            </div>
            {employmentType === "freelance" && annualResults.freelanceNet !== null && (
              <div className="mt-3 glass-card rounded-xl px-4 py-2.5 text-xs text-violet-100 border border-amber-500/20">
                {t.freelanceNetNote}{expenseRate}{t.freelanceNetSuffix}{fmtJPY(annualResults.freelanceNet)}
              </div>
            )}
            <DeductionNote employmentType={employmentType} t={t} />
          </div>
        </div>
      )}

      {/* ===== 月収 → 時給 結果 ===== */}
      {tab === "monthly-to-hourly" && monthlyResults && (
        <div className="space-y-4 tab-panel">
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">
              {t.resultHeading} — {fmtJPYUnit(parseNum(monthlyInput), t.monthlyUnit)}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-xs text-violet-200 mb-1.5">{t.hourlyConvLabel}</div>
                <div className="text-3xl font-bold text-white glow-text font-mono tracking-tight">{fmtJPY(monthlyResults.hourly)}</div>
                <div className="text-xs text-violet-200 mt-0.5">{t.perHourSub}</div>
              </div>
              <div>
                <div className="text-xs text-violet-200 mb-1.5">{t.annualGrossLabel}</div>
                <div className="text-3xl font-bold text-white glow-text font-mono tracking-tight">{fmtJPY(monthlyResults.annualGross)}</div>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-3">{t.takeHomeHeading}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-3.5 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.annualTakeHome}</div>
                <div className="font-bold text-xl text-white font-mono">{fmtJPY(monthlyResults.takeHome)}</div>
                <div className="text-xs text-cyan-300 mt-1">{t.faceMaskPct}{Math.round((monthlyResults.takeHome / monthlyResults.annualGross) * 100)}%</div>
              </div>
              <div className="glass-card rounded-xl p-3.5 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.monthlyTakeHome}</div>
                <div className="font-bold text-xl text-white font-mono">{fmtJPY(monthlyResults.takeHome / 12)}</div>
              </div>
            </div>
            {employmentType === "freelance" && monthlyResults.freelanceNet !== null && (
              <div className="mt-3 glass-card rounded-xl px-4 py-2.5 text-xs text-violet-100 border border-amber-500/20">
                {t.freelanceNetNote}{expenseRate}{t.freelanceNetSuffix}{fmtJPY(monthlyResults.freelanceNet)}
              </div>
            )}
            <DeductionNote employmentType={employmentType} t={t} />
          </div>
        </div>
      )}

      {/* 業界平均比較 */}
      {hourlyForComparison > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.comparisonHeading}</h2>
          <div className="space-y-3">
            <GlassCompareBar
              label={t.nationalAvg}
              avg={NATIONAL_AVG_HOURLY}
              yours={hourlyForComparison}
              avgLabel={t.avgLabel}
              youLabel={t.youLabel}
            />
            <GlassCompareBar
              label={t.tokyoAvg}
              avg={TOKYO_AVG_HOURLY}
              yours={hourlyForComparison}
              avgLabel={t.avgLabel}
              youLabel={t.youLabel}
            />
          </div>
          <p className="text-xs text-violet-200 mt-3">{t.sourceNote}</p>
        </div>
      )}

      {/* 比較表 */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.tableHeading}</h2>
        <p className="text-xs text-violet-200 mb-5">
          {t.tableSubtitle}{Math.round(annualWorkDays)}{t.tableSubtitleMid}{dailyHours}{t.tableSubtitleEnd}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2.5 pr-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.hourlyCol}</th>
                <th className="text-right py-2.5 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.annualCol}</th>
                <th className="text-right py-2.5 pl-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.monthlyCol}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonTable.map(({ hourly, annual, monthly }) => {
                const isHighlighted = hourlyForComparison > 0 &&
                  Math.abs(hourly - hourlyForComparison) < 250;
                return (
                  <tr
                    key={hourly}
                    className={`border-b border-white/5 table-row-stripe ${isHighlighted ? "bg-violet-500/10" : ""}`}
                  >
                    <td className={`py-3 pr-3 font-bold font-mono text-sm ${isHighlighted ? "text-violet-200" : "text-white/90"}`}>
                      ¥{hourly.toLocaleString()}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono text-sm ${isHighlighted ? "text-white" : "text-white/80"}`}>
                      {fmtJPY(annual)}
                    </td>
                    <td className={`py-3 pl-3 text-right font-mono text-sm ${isHighlighted ? "text-white" : "text-white/80"}`}>
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
      <p className="text-xs text-violet-200 text-center pb-2">
        {t.calcNote}{weekDays || 5}{t.calcNote2}{HOLIDAYS_JP}{t.calcNote3}{paidLeave || 0}{t.calcNote4} {Math.round(annualWorkDays)}{lang === "ja" ? "日" : ""}。{t.calcNote5}{overtimeMonthly || 0}{t.calcNote6}
      </p>

      {/* ── SEO: 使い方ガイド ── */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideHeading}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white/90 text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── SEO: FAQ ── */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqHeading}</h2>
        <div className="space-y-3">
          {t.faq.map(({ q, a }, i) => (
            <details key={i} className="glass-card rounded-xl overflow-hidden group">
              <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none hover:bg-white/4 transition-colors">
                <span className="text-sm font-semibold text-white/90">Q. {q}</span>
                <span className="text-violet-400 text-lg leading-none group-open:rotate-45 transition-transform shrink-0 ml-2">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-violet-100 border-t border-white/6 leading-relaxed">{a}</div>
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
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedHeading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {t.relatedLinks.map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200 group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm group-hover:text-violet-100 transition-colors">{label}</div>
              <div className="text-xs text-violet-100 mt-1">{desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── SEO: CTA ── */}
      <div
        className="rounded-2xl p-5 text-center space-y-3"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.3) 100%)", border: "1px solid rgba(139,92,246,0.3)" }}
      >
        <p className="text-base font-bold text-white">{t.ctaHeading}</p>
        <p className="text-xs text-violet-200">{t.ctaSubtitle}</p>
        <a href="/tools" className="inline-block glass-card text-violet-100 text-sm font-bold px-5 py-2 rounded-xl hover:text-white transition-colors">
          {t.ctaButton}
        </a>
      </div>

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

// --- Glass Input Row ---
interface GlassInputRowProps {
  label: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
}

function GlassInputRow({ label, sub, value, onChange, unit, placeholder = "0", inputMode = "numeric" }: GlassInputRowProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">
        {label}
        {sub && <span className="text-violet-200 ml-1.5 normal-case">{sub}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="number-input flex-1 px-4 py-2.5 text-right text-base font-mono rounded-xl neon-focus transition-all"
        />
        <span className="text-violet-200 text-sm w-16 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

// --- Glass Compare Bar ---
interface GlassCompareBarProps {
  label: string;
  avg: number;
  yours: number;
  avgLabel: string;
  youLabel: string;
}

function GlassCompareBar({ label, avg, yours, avgLabel, youLabel }: GlassCompareBarProps) {
  const diff = yours - avg;
  const pct = Math.round((diff / avg) * 100);
  const isAbove = diff >= 0;
  const barWidth = Math.min(100, Math.round((Math.min(yours, avg * 2) / (avg * 2)) * 100));
  const avgBarWidth = Math.min(100, Math.round((avg / (avg * 2)) * 100));

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-violet-100">{label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${isAbove ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-400"}`}>
          {isAbove ? "+" : ""}{pct}% ({isAbove ? "+" : ""}{Math.abs(diff).toLocaleString()}円)
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-violet-200 w-10 shrink-0">{avgLabel}</span>
          <div className="flex-1 rounded-full h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-2 rounded-full" style={{ width: `${avgBarWidth}%`, background: "rgba(167,139,250,0.4)" }} />
          </div>
          <span className="text-xs text-violet-200 w-16 text-right shrink-0 font-mono">¥{avg.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-violet-100 w-10 shrink-0 font-medium">{youLabel}</span>
          <div className="flex-1 rounded-full h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className={`h-2 rounded-full`} style={{ width: `${barWidth}%`, background: isAbove ? "linear-gradient(90deg, #818cf8, #a78bfa)" : "#f87171" }} />
          </div>
          <span className={`text-xs w-16 text-right shrink-0 font-mono font-semibold ${isAbove ? "text-cyan-300" : "text-red-400"}`}>¥{Math.round(yours).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// --- 手取り注記 ---
type DeductionLang = {
  deductionSeishain: string;
  deductionPart: string;
  deductionFreelance: string;
};

function DeductionNote({ employmentType, t }: { employmentType: EmploymentType; t: DeductionLang }) {
  return (
    <div className="mt-4 glass-card rounded-xl px-4 py-3 text-xs text-violet-200">
      {employmentType === "seishain" && t.deductionSeishain}
      {employmentType === "part" && t.deductionPart}
      {employmentType === "freelance" && t.deductionFreelance}
    </div>
  );
}
