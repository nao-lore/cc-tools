"use client";

import { useState, useMemo } from "react";

// --- 定数 ---
const INCOME_TAX_PER_PERSON = 30_000;
const RESIDENT_TAX_PER_PERSON = 10_000;
const REDUCTION_PER_PERSON = INCOME_TAX_PER_PERSON + RESIDENT_TAX_PER_PERSON;

const INCOME_LIMIT = 18_050_000;
const SALARY_LIMIT = 20_000_000;

const MONTHS_JA = ["6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const MONTHS_EN = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Lang = "ja" | "en";

// --- 翻訳 ---
const T = {
  ja: {
    inputTitle: "本人情報を入力",
    incomeKind: "所得の種類",
    salary: "給与所得者",
    business: "事業所得者",
    salaryLabel: "年間給与収入（額面）",
    businessLabel: "年間事業収入（売上）",
    dependentTitle: "扶養家族",
    dependentSubtitle: "控除対象配偶者・扶養親族が対象（所得48万円以下の家族）",
    spouse: "配偶者（控除対象）",
    spouseDesc: "合計所得48万円以下の配偶者",
    dependent: "扶養親族",
    dependentDesc: "子・親・兄弟姉妹等（合計所得48万円以下）",
    totalPersons: "減税対象人数（本人含む）",
    outOfScopeTitle: "対象外",
    outOfScopeBody: "給与収入2,000万円超のため、定額減税の対象外です。",
    outOfScopeNote: "合計所得金額1,805万円超（給与収入換算 約2,000万円超）は適用されません。",
    yourReduction: "あなたの定額減税額",
    personsNote: (n: number) => `${n}人分（本人＋扶養${n - 1}人）× 4万円`,
    incomeTaxPart: "所得税分",
    residentTaxPart: "住民税分",
    personsX3: (n: number) => `${n}人 × 3万円`,
    personsX1: (n: number) => `${n}人 × 1万円`,
    deductionTitle: "控除適用の見込み",
    deductionSubtitle: "年間所得税（参考値）との比較。社会保険料・各種控除は考慮していません。",
    annualIncomeTax: "年間所得税（参考試算）",
    incomeTaxReduction: "所得税からの減税額",
    appliedLabel: "所得税控除適用額",
    adjustmentTitle: "調整給付金が支給される見込みです",
    adjustmentBody: (n: string) => `控除しきれない分 ${n} は調整給付金として市区町村から支給されます。`,
    fullDeduction: "所得税・住民税ともに全額控除できる見込みです（参考試算）。",
    monthlyTitle: "給与明細への反映シミュレーション",
    monthlySubtitle: "給与所得者の場合、2024年6月〜の給与から所得税が順次控除されます（参考値）",
    colMonth: "月",
    colOriginal: "通常の所得税",
    colReduced: "減税後",
    colRemaining: "残り減税枠",
    monthlyNote: (n: string) => `月額所得税は年収・各種控除により異なります。実際の金額は給与明細をご確認ください。住民税分（${n}）は2024年6月の住民税から一括控除されます。`,
    tableTitle: "年収別 減税効果一覧",
    tableSubtitle: "本人のみ（扶養なし）の場合の参考値",
    colIncome: "年収",
    colSingle: "減税額（本人）",
    colCouple: "夫婦2人",
    colFamily: "4人家族",
    outOfScopeShort: "対象外",
    mechanismTitle: "定額減税の仕組み",
    formulaTitle: "減税額の計算式",
    formulaIncome: "所得税：3万円 × （本人 ＋ 扶養親族数）",
    formulaResident: "住民税：1万円 × （本人 ＋ 扶養親族数）",
    formulaTotal: "合計：4万円 × 人数",
    salaryMethod: "給与所得者の適用方法",
    salaryMethodBody: "2024年6月以降の給与・賞与から源泉徴収される所得税が、減税額に達するまで控除されます。",
    businessMethod: "事業所得者の適用方法",
    businessMethodBody: "予定納税・確定申告での税額から控除されます。第1期分予定納税から控除適用。",
    adjustmentNote: "調整給付金とは",
    adjustmentNoteBody: "減税額が所得税・住民税の年税額を上回る場合（低所得者等）、控除しきれない分が調整給付金として市区町村から給付されます。",
    targetNote: "対象者",
    targetNoteBody: "2024年分の合計所得金額が1,805万円以下の居住者（給与収入換算: 2,000万円以下）",
    disclaimer: "本ツールは概算計算を目的としており、実際の減税額・税額と異なる場合があります。所得税試算は基礎控除のみ適用した参考値です。正確な判断は税理士等の専門家または市区町村にご確認ください。",
    officialLink: "国税庁「定額減税について」を確認する",
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "所得の種類を選択", desc: "会社員・パートなどは「給与所得者」、フリーランス・個人事業主は「事業所得者」を選択します。" },
      { step: "2", title: "年収を入力", desc: "給与収入（額面）または年間事業収入を入力します。2,000万円超の場合は定額減税の対象外となります。" },
      { step: "3", title: "扶養家族を入力", desc: "控除対象配偶者と扶養親族の人数を入力します。1人増えるごとに減税額が4万円増えます。" },
      { step: "4", title: "減税額と月別反映を確認", desc: "合計減税額と、6〜12月の給与明細への反映シミュレーションが表示されます。" },
    ],
    faqTitle: "よくある質問",
    faq: [
      { q: "定額減税の金額はいくらですか？", a: "本人1人あたり所得税3万円＋住民税1万円の合計4万円です。扶養家族がいる場合は人数分追加されます。例えば夫婦と子1人の3人家族では合計12万円が減税されます。" },
      { q: "年収2,000万円以上の人は対象外ですか？", a: "はい。合計所得金額1,805万円超（給与収入換算で約2,000万円超）は定額減税の対象外です。本ツールでは給与収入2,000万円超と入力すると「対象外」と表示します。" },
      { q: "調整給付金とは何ですか？", a: "定額減税額が所得税・住民税の年税額を上回る場合（低所得者など）、控除しきれない差額が調整給付金として市区町村から給付されます。本ツールで自動判定して金額を表示します。" },
      { q: "給与明細のどこで確認できますか？", a: "2024年6月以降の給与明細の「源泉所得税」欄が通常より少なくなっているか、ゼロになっている場合に定額減税が適用されています。給与明細に「定額減税額」として記載されます。" },
    ],
    relatedTitle: "関連ツール",
    relatedLinks: [
      { href: "/iryouhi-koujo", icon: "🏥", label: "医療費控除 計算" },
      { href: "/withholding-tax-calculator", icon: "📋", label: "源泉徴収税 計算" },
      { href: "/zangyou-dai", icon: "⏰", label: "残業代 計算" },
    ],
    months: MONTHS_JA,
    unit: "人",
  },
  en: {
    inputTitle: "Enter Your Information",
    incomeKind: "Income Type",
    salary: "Employee",
    business: "Self-Employed",
    salaryLabel: "Annual Salary (gross)",
    businessLabel: "Annual Business Revenue",
    dependentTitle: "Dependents",
    dependentSubtitle: "Eligible spouse and dependents (income ≤ ¥480,000)",
    spouse: "Spouse (eligible)",
    spouseDesc: "Spouse with total income ≤ ¥480,000",
    dependent: "Dependents",
    dependentDesc: "Children, parents, siblings, etc. (income ≤ ¥480,000)",
    totalPersons: "Total eligible persons (incl. yourself)",
    outOfScopeTitle: "Not Eligible",
    outOfScopeBody: "Income exceeds ¥20M — not eligible for the lump-sum tax cut.",
    outOfScopeNote: "Taxpayers with total income over ¥18.05M (salary approx. ¥20M+) are excluded.",
    yourReduction: "Your Lump-Sum Tax Cut",
    personsNote: (n: number) => `${n} person${n > 1 ? "s" : ""} × ¥40,000`,
    incomeTaxPart: "Income Tax",
    residentTaxPart: "Resident Tax",
    personsX3: (n: number) => `${n}p × ¥30,000`,
    personsX1: (n: number) => `${n}p × ¥10,000`,
    deductionTitle: "Deduction Outlook",
    deductionSubtitle: "Compared to estimated annual income tax. Social insurance and other deductions are not included.",
    annualIncomeTax: "Annual Income Tax (estimate)",
    incomeTaxReduction: "Income Tax Reduction",
    appliedLabel: "Applied Income Tax Deduction",
    adjustmentTitle: "Adjustment benefit expected",
    adjustmentBody: (n: string) => `The unabsorbed amount of ${n} will be paid as an adjustment benefit by your municipality.`,
    fullDeduction: "Full deduction applicable for both income and resident tax (estimate).",
    monthlyTitle: "Monthly Payslip Simulation",
    monthlySubtitle: "For employees, income tax is reduced starting June 2024 until the full amount is absorbed (reference).",
    colMonth: "Month",
    colOriginal: "Normal Tax",
    colReduced: "After Cut",
    colRemaining: "Remaining",
    monthlyNote: (n: string) => `Actual amounts vary by income and deductions. Check your payslip. Resident tax portion (${n}) is deducted in a lump sum from June 2024 resident tax.`,
    tableTitle: "Tax Cut by Income Level",
    tableSubtitle: "Reference values for single person (no dependents)",
    colIncome: "Income",
    colSingle: "Cut (self only)",
    colCouple: "Couple",
    colFamily: "Family of 4",
    outOfScopeShort: "N/A",
    mechanismTitle: "How the Tax Cut Works",
    formulaTitle: "Calculation Formula",
    formulaIncome: "Income Tax: ¥30,000 × (self + dependents)",
    formulaResident: "Resident Tax: ¥10,000 × (self + dependents)",
    formulaTotal: "Total: ¥40,000 × number of persons",
    salaryMethod: "For Employees",
    salaryMethodBody: "Income tax withheld from salary/bonuses from June 2024 onward is reduced until the full cut amount is absorbed.",
    businessMethod: "For Self-Employed",
    businessMethodBody: "Deducted from estimated taxes and final tax return. Applied from the first installment of estimated tax.",
    adjustmentNote: "What is the Adjustment Benefit?",
    adjustmentNoteBody: "If the tax cut exceeds the actual tax liability (e.g., low-income earners), the unabsorbed amount is paid as a cash benefit by the municipality.",
    targetNote: "Who is Eligible?",
    targetNoteBody: "Residents with total income ≤ ¥18.05M for 2024 (salary equivalent: ≤ approx. ¥20M).",
    disclaimer: "This tool provides estimates only. Actual tax cut amounts may differ. Income tax estimates use only the basic deduction. For accurate figures, consult a tax professional or your municipality.",
    officialLink: "NTA official page on the lump-sum tax cut",
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Select Income Type", desc: "Choose 'Employee' for salaried workers, or 'Self-Employed' for freelancers and sole proprietors." },
      { step: "2", title: "Enter Your Income", desc: "Enter your gross annual salary or business revenue. Incomes over ¥20M are not eligible." },
      { step: "3", title: "Enter Dependents", desc: "Add your eligible spouse and dependents. Each additional person adds ¥40,000 to your tax cut." },
      { step: "4", title: "Review Results", desc: "See your total tax cut and a month-by-month payslip simulation from June through December." },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "How much is the lump-sum tax cut?", a: "¥40,000 per person (¥30,000 income tax + ¥10,000 resident tax). Dependents each add another ¥40,000. A family of 3 would receive ¥120,000 total." },
      { q: "Is income over ¥20M ineligible?", a: "Yes. Those with total income over ¥18.05M (salary approx. ¥20M+) are not eligible. This tool will show 'Not Eligible' for such inputs." },
      { q: "What is the adjustment benefit?", a: "If the tax cut exceeds the total tax liability (common for low-income earners), the unabsorbed difference is paid as a cash benefit by the municipality. This tool calculates and displays that amount." },
      { q: "Where can I see it on my payslip?", a: "From June 2024 onward, the 'income tax withheld' line on your payslip will be lower or zero when the cut is applied. It may also appear as a separate 'lump-sum tax cut' line." },
    ],
    relatedTitle: "Related Tools",
    relatedLinks: [
      { href: "/iryouhi-koujo", icon: "🏥", label: "Medical Expense Deduction" },
      { href: "/withholding-tax-calculator", icon: "📋", label: "Withholding Tax Calculator" },
      { href: "/zangyou-dai", icon: "⏰", label: "Overtime Pay Calculator" },
    ],
    months: MONTHS_EN,
    unit: "",
  },
} as const;

type IncomeType = "salary" | "business";

// --- 税計算ユーティリティ ---
function calcSalaryIncome(salary: number): number {
  if (salary <= 550_999) return 0;
  if (salary <= 1_618_999) return salary - 550_000;
  if (salary <= 1_619_999) return 1_069_000;
  if (salary <= 1_621_999) return 1_070_000;
  if (salary <= 1_623_999) return 1_072_000;
  if (salary <= 1_627_999) return 1_074_000;
  if (salary <= 1_799_999) return Math.floor(salary / 4_000) * 4_000 * 0.6;
  if (salary <= 3_599_999) return Math.floor(salary * 0.7) - 80_000;
  if (salary <= 6_599_999) return Math.floor(salary * 0.8) - 440_000;
  if (salary <= 8_499_999) return Math.floor(salary * 0.9) - 1_100_000;
  return salary - 1_950_000;
}

function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  if (taxableIncome <= 1_950_000) tax = taxableIncome * 0.05;
  else if (taxableIncome <= 3_300_000) tax = taxableIncome * 0.1 - 97_500;
  else if (taxableIncome <= 6_950_000) tax = taxableIncome * 0.2 - 427_500;
  else if (taxableIncome <= 9_000_000) tax = taxableIncome * 0.23 - 636_000;
  else if (taxableIncome <= 18_000_000) tax = taxableIncome * 0.33 - 1_536_000;
  else if (taxableIncome <= 40_000_000) tax = taxableIncome * 0.4 - 2_796_000;
  else tax = taxableIncome * 0.45 - 4_796_000;
  return Math.floor(tax * 1.021);
}

function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

const INCOME_TABLE_ROWS = [200, 300, 400, 500, 600, 700, 800, 1000, 1200, 1500, 2000].map(
  (wan) => wan * 10_000
);

export default function TeigakuGenzei() {
  const [lang, setLang] = useState<Lang>("ja");
  const [salaryInput, setSalaryInput] = useState<string>("");
  const [incomeType, setIncomeType] = useState<IncomeType>("salary");
  const [spouseCount, setSpouseCount] = useState<number>(0);
  const [dependentCount, setDependentCount] = useState<number>(0);

  const t = T[lang];

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setSalaryInput(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };

  const totalPersons = 1 + spouseCount + dependentCount;

  const result = useMemo(() => {
    const salary = parseAmount(salaryInput);
    if (!salary) return null;

    if (salary > SALARY_LIMIT) {
      return { outOfScope: true as const, salary };
    }

    const incomeTaxReduction = INCOME_TAX_PER_PERSON * totalPersons;
    const residentTaxReduction = RESIDENT_TAX_PER_PERSON * totalPersons;
    const totalReduction = incomeTaxReduction + residentTaxReduction;

    let annualIncomeTax = 0;
    if (incomeType === "salary") {
      const salaryIncome = calcSalaryIncome(salary);
      const taxableIncome = Math.max(0, salaryIncome - 480_000);
      annualIncomeTax = calcIncomeTax(taxableIncome);
    } else {
      const taxableIncome = Math.max(0, salary - 480_000);
      annualIncomeTax = calcIncomeTax(taxableIncome);
    }

    const monthlyIncomeTax = Math.floor(annualIncomeTax / 12);

    const canApplyIncomeTax = Math.min(incomeTaxReduction, annualIncomeTax);
    const residualIncomeTax = incomeTaxReduction - canApplyIncomeTax;
    const annualResidentTax = Math.floor(
      Math.max(0, (incomeType === "salary" ? calcSalaryIncome(salary) : salary) - 430_000) * 0.1
    );
    const canApplyResidentTax = Math.min(residentTaxReduction, annualResidentTax);
    const residualResidentTax = residentTaxReduction - canApplyResidentTax;
    const adjustmentPayment = residualIncomeTax + residualResidentTax;

    const monthlyRows: { month: string; original: number; reduced: number; remaining: number }[] = [];
    let remainingReduction = incomeTaxReduction;
    for (const month of t.months) {
      if (remainingReduction <= 0) {
        monthlyRows.push({ month, original: monthlyIncomeTax, reduced: monthlyIncomeTax, remaining: 0 });
      } else if (remainingReduction >= monthlyIncomeTax) {
        monthlyRows.push({ month, original: monthlyIncomeTax, reduced: 0, remaining: remainingReduction - monthlyIncomeTax });
        remainingReduction -= monthlyIncomeTax;
      } else {
        monthlyRows.push({ month, original: monthlyIncomeTax, reduced: monthlyIncomeTax - remainingReduction, remaining: 0 });
        remainingReduction = 0;
      }
    }

    return {
      outOfScope: false as const,
      salary,
      totalPersons,
      incomeTaxReduction,
      residentTaxReduction,
      totalReduction,
      annualIncomeTax,
      monthlyIncomeTax,
      adjustmentPayment,
      canApplyIncomeTax,
      canApplyResidentTax,
      monthlyRows,
    };
  }, [salaryInput, incomeType, totalPersons, t.months]);

  return (
    <div className="space-y-6">
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
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .float-panel {
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
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
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
        .counter-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: #c4b5fd;
          transition: all 0.15s ease;
        }
        .counter-btn:hover:not(:disabled) {
          background: rgba(139,92,246,0.2);
          border-color: rgba(167,139,250,0.4);
        }
        .counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
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

      {/* ===== 本人情報 ===== */}
      <div className="glass-card rounded-2xl p-6 float-panel">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.inputTitle}</h2>

        <div className="space-y-5">
          {/* 所得種別 */}
          <div>
            <div className="text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.incomeKind}</div>
            <div className="flex gap-2">
              {(["salary", "business"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setIncomeType(type)}
                  className={`method-btn flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                    incomeType === type
                      ? "method-btn-active border-violet-500/60 text-violet-100"
                      : "border-white/8 text-white/70 hover:border-violet-500/30"
                  }`}
                >
                  {type === "salary" ? t.salary : t.business}
                </button>
              ))}
            </div>
          </div>

          {/* 年収 */}
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">
              {incomeType === "salary" ? t.salaryLabel : t.businessLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={salaryInput}
                onChange={handleSalaryChange}
                placeholder="5,000,000"
                className="number-input flex-1 px-4 py-3 text-right text-xl font-mono font-semibold rounded-xl neon-focus transition-all"
              />
              <span className="text-violet-200 font-medium text-lg">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 扶養家族 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.dependentTitle}</h2>
        <p className="text-xs text-violet-200 mb-5">{t.dependentSubtitle}</p>

        <div className="space-y-3">
          {/* 配偶者 */}
          <div className="flex items-center justify-between glass-card rounded-xl p-4">
            <div>
              <div className="text-sm font-medium text-white/90">{t.spouse}</div>
              <div className="text-xs text-violet-200 mt-0.5">{t.spouseDesc}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSpouseCount(0)}
                disabled={spouseCount === 0}
                className="counter-btn w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium"
              >
                −
              </button>
              <span className="w-6 text-center text-lg font-bold text-white font-mono">{spouseCount}</span>
              <button
                onClick={() => setSpouseCount(1)}
                disabled={spouseCount === 1}
                className="counter-btn w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium"
              >
                ＋
              </button>
            </div>
          </div>

          {/* 扶養親族 */}
          <div className="flex items-center justify-between glass-card rounded-xl p-4">
            <div>
              <div className="text-sm font-medium text-white/90">{t.dependent}</div>
              <div className="text-xs text-violet-200 mt-0.5">{t.dependentDesc}</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDependentCount((n) => Math.max(0, n - 1))}
                disabled={dependentCount === 0}
                className="counter-btn w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium"
              >
                −
              </button>
              <span className="w-6 text-center text-lg font-bold text-white font-mono">{dependentCount}</span>
              <button
                onClick={() => setDependentCount((n) => n + 1)}
                className="counter-btn w-8 h-8 rounded-full flex items-center justify-center text-lg font-medium"
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        {/* 合計人数サマリ */}
        <div className="mt-4 p-3 glass-card-bright rounded-xl flex items-center justify-between border border-violet-500/20">
          <span className="text-sm text-violet-100">{t.totalPersons}</span>
          <span className="text-xl font-bold text-white font-mono">{totalPersons}{t.unit}</span>
        </div>
      </div>

      {/* ===== 対象外 ===== */}
      {result?.outOfScope && (
        <div className="glass-card rounded-2xl border border-white/20 p-6 text-center float-panel">
          <div className="text-2xl mb-2 text-white">{t.outOfScopeTitle}</div>
          <p className="text-white/80 font-medium">{t.outOfScopeBody}</p>
          <p className="text-sm text-violet-200 mt-2">{t.outOfScopeNote}</p>
        </div>
      )}

      {/* ===== 減税額サマリ ===== */}
      {result && !result.outOfScope && (
        <>
          {/* メインカード */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow float-panel">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-2">{t.yourReduction}</div>
            <div className="text-5xl font-bold text-white glow-text tracking-tight mb-1 font-mono">{fmtJPY(result.totalReduction)}</div>
            <div className="text-sm text-violet-200 mb-6">{t.personsNote(totalPersons)}</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-violet-200 mb-1">{t.incomeTaxPart}</div>
                <div className="text-2xl font-bold text-white font-mono">{fmtJPY(result.incomeTaxReduction)}</div>
                <div className="text-xs text-violet-200 mt-1">{t.personsX3(totalPersons)}</div>
              </div>
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-violet-200 mb-1">{t.residentTaxPart}</div>
                <div className="text-2xl font-bold text-white font-mono">{fmtJPY(result.residentTaxReduction)}</div>
                <div className="text-xs text-violet-200 mt-1">{t.personsX1(totalPersons)}</div>
              </div>
            </div>
          </div>

          {/* 控除しきれるか判定 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.deductionTitle}</h2>
            <p className="text-xs text-violet-200 mb-4">{t.deductionSubtitle}</p>

            <div className="space-y-3">
              <div className="glass-card rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-violet-100">{t.annualIncomeTax}</span>
                  <span className="font-semibold text-white font-mono">{fmtJPY(result.annualIncomeTax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-violet-100">{t.incomeTaxReduction}</span>
                  <span className="font-semibold text-red-400 font-mono">− {fmtJPY(result.incomeTaxReduction)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-medium">
                  <span className="text-violet-100">{t.appliedLabel}</span>
                  <span className={`font-mono ${result.canApplyIncomeTax < result.incomeTaxReduction ? "text-amber-400" : "text-emerald-400"}`}>
                    {fmtJPY(result.canApplyIncomeTax)}
                  </span>
                </div>
              </div>

              {result.adjustmentPayment > 0 && (
                <div className="glass-card rounded-xl border border-amber-500/20 p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-amber-400 text-lg leading-none">!</div>
                    <div>
                      <div className="text-sm font-medium text-amber-300 mb-1">{t.adjustmentTitle}</div>
                      <div className="text-sm text-violet-100">
                        {t.adjustmentBody(fmtJPY(result.adjustmentPayment))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.adjustmentPayment === 0 && (
                <div className="glass-card rounded-xl border border-emerald-500/20 p-3">
                  <p className="text-xs text-emerald-300">{t.fullDeduction}</p>
                </div>
              )}
            </div>
          </div>

          {/* 月別反映シミュレーション */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.monthlyTitle}</h2>
            <p className="text-xs text-violet-200 mb-4">{t.monthlySubtitle}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left py-2 pr-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.colMonth}</th>
                    <th className="text-right py-2 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.colOriginal}</th>
                    <th className="text-right py-2 px-3 text-xs text-red-400 font-medium uppercase tracking-wider">{t.colReduced}</th>
                    <th className="text-right py-2 pl-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.colRemaining}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthlyRows.map((row) => (
                    <tr key={row.month} className="border-b border-white/5 table-row-stripe">
                      <td className="py-2.5 pr-3 font-medium text-white/90">{row.month}</td>
                      <td className="py-2.5 px-3 text-right text-violet-100 font-mono">{fmtJPY(row.original)}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold font-mono ${row.reduced < row.original ? "text-red-400" : "text-white/70"}`}>
                        {fmtJPY(row.reduced)}
                        {row.reduced < row.original && (
                          <span className="text-xs text-red-400 ml-1">
                            (−{fmtJPY(row.original - row.reduced)})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pl-3 text-right text-violet-200 font-mono">{fmtJPY(row.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 glass-card rounded-xl border border-cyan-500/15 p-3">
              <p className="text-xs text-cyan-300">
                {t.monthlyNote(fmtJPY(result.residentTaxReduction))}
              </p>
            </div>
          </div>

          {/* 年収別一覧表 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.tableTitle}</h2>
            <p className="text-xs text-violet-200 mb-4">{t.tableSubtitle}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-right py-2 pr-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.colIncome}</th>
                    <th className="text-right py-2 px-3 text-xs text-red-400 font-medium uppercase tracking-wider">{t.colSingle}</th>
                    <th className="text-right py-2 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.colCouple}</th>
                    <th className="text-right py-2 pl-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.colFamily}</th>
                  </tr>
                </thead>
                <tbody>
                  {INCOME_TABLE_ROWS.map((income) => {
                    const isOver = income > SALARY_LIMIT;
                    const isHighlighted = parseAmount(salaryInput) === income;
                    return (
                      <tr
                        key={income}
                        className={`border-b border-white/5 table-row-stripe ${isHighlighted ? "bg-violet-500/10" : ""}`}
                      >
                        <td className="py-2 pr-3 text-right font-medium text-white/90 font-mono">
                          {income / 10_000}{lang === "ja" ? "万円" : "万"}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {isOver ? (
                            <span className="text-violet-200/50 text-xs">{t.outOfScopeShort}</span>
                          ) : (
                            <span className="font-semibold text-red-400">{fmtJPY(REDUCTION_PER_PERSON)}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-violet-100 font-mono">
                          {isOver ? "—" : fmtJPY(REDUCTION_PER_PERSON * 2)}
                        </td>
                        <td className="py-2 pl-3 text-right text-violet-100 font-mono">
                          {isOver ? "—" : fmtJPY(REDUCTION_PER_PERSON * 4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===== 制度説明 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.mechanismTitle}</h2>

        <div className="space-y-3">
          <div className="glass-card rounded-xl border border-violet-500/20 p-4">
            <div className="text-xs font-medium text-violet-100 mb-2">{t.formulaTitle}</div>
            <div className="text-sm text-violet-100 space-y-1 font-mono">
              <div>{t.formulaIncome}</div>
              <div>{t.formulaResident}</div>
              <div className="font-bold pt-1 border-t border-white/10 text-white">{t.formulaTotal}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-4">
              <div className="text-xs text-violet-200 font-medium mb-2">{t.salaryMethod}</div>
              <p className="text-sm text-violet-100">{t.salaryMethodBody}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-xs text-violet-200 font-medium mb-2">{t.businessMethod}</div>
              <p className="text-sm text-violet-100">{t.businessMethodBody}</p>
            </div>
          </div>

          <div className="glass-card rounded-xl border border-amber-500/20 p-4">
            <div className="text-xs font-medium text-amber-300 mb-1">{t.adjustmentNote}</div>
            <p className="text-xs text-violet-100">{t.adjustmentNoteBody}</p>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-medium text-violet-100 mb-1">{t.targetNote}</div>
            <p className="text-xs text-violet-200">{t.targetNoteBody}</p>
          </div>
        </div>
      </div>

      {/* ===== 免責・参考リンク ===== */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs text-violet-200 mb-2">{t.disclaimer}</p>
        <a
          href="https://www.nta.go.jp/users/gensen/teigakugenzei/index.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-cyan-300 hover:text-cyan-200 underline"
        >
          {t.officialLink}
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
                <div className="font-medium text-white/90 text-sm">{item.title}</div>
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
              <div className="font-bold text-white/90 text-sm mb-1.5">Q. {item.q}</div>
              <div className="text-xs text-violet-100 leading-relaxed">A. {item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 関連ツール */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 px-3 py-2 glass-card rounded-xl text-sm text-violet-100 hover:text-white border border-white/8 hover:border-violet-500/40 transition-colors"
            >
              <span>{link.icon}</span> {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage (Japanese — stays JP) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "定額減税の金額はいくらですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "本人1人あたり所得税3万円＋住民税1万円の合計4万円です。扶養家族がいる場合は人数分追加されます。",
                },
              },
              {
                "@type": "Question",
                "name": "年収2,000万円以上の人は対象外ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "はい。合計所得金額1,805万円超（給与収入換算で約2,000万円超）は定額減税の対象外です。",
                },
              },
              {
                "@type": "Question",
                "name": "調整給付金とは何ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "定額減税額が所得税・住民税の年税額を上回る場合に、控除しきれない差額が調整給付金として市区町村から給付されます。",
                },
              },
              {
                "@type": "Question",
                "name": "給与明細のどこで確認できますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "2024年6月以降の給与明細の「源泉所得税」欄が少なくなっているか、ゼロになっている場合に定額減税が適用されています。",
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
  "name": "定額減税 計算機",
  "description": "2024-2025年の定額減税（所得税3万円/住民税1万円）の適用額をシミュレーション。扶養家族数に応じた減税総額を即計算",
  "url": "https://tools.loresync.dev/teigaku-genzei",
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
