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

function estimateTaxRate(taxableIncome: number): number {
  const bracket = TAX_BRACKETS.find(
    (b) => taxableIncome >= b.min && taxableIncome < b.max
  );
  return bracket?.rate ?? 0.05;
}

function estimateTaxableIncome(grossIncome: number): number {
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
  return Math.max(0, employmentIncome - 480_000);
}

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

function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

type Member = {
  id: number;
  name: string;
  amount: string;
};

type Lang = "ja" | "en";

// --- 翻訳定数 ---
const T = {
  ja: {
    langToggle: "EN",
    step1Title: "年間医療費の入力",
    step1Sub: "同一生計の家族全員分を合算できます",
    addMember: "家族を追加",
    totalMedical: "医療費合計",
    step2Title: "保険金・給付金の補填額",
    step2Sub: "生命保険・健康保険・高額療養費などで補填された金額",
    step2Hint: "補填がない場合は 0 のままでOK",
    step3Title: "所得金額の入力",
    modeGross: "年収から概算",
    modeDirect: "総所得を直接入力",
    grossLabel: "給与年収（源泉徴収票の「支払金額」）",
    grossPlaceholder: "5,000,000",
    estimatedIncome: "概算課税所得",
    estimatedNote: "（給与所得控除・基礎控除のみ適用）",
    directLabel: "総所得金額（確定申告書の「所得金額合計」）",
    directPlaceholder: "3,500,000",
    resultTitle: "医療費控除 計算結果",
    paidMedical: "支払った医療費合計",
    insuranceFill: "補填された金額",
    threshold: "足切り額",
    threshold10: "10万円",
    threshold5pct: "総所得の5%",
    deductionLabel: "医療費控除額（上限200万円）",
    noDeduction: "0円（控除なし）",
    refundLabel: "還付見込み額（所得税率",
    refundNote: "で計算）",
    refundSub: "※住民税からの軽減分は含まず",
    needsFilingYes: "確定申告が必要です",
    needsFilingNo: "確定申告の必要はありません",
    needsFilingYesDesc: "医療費控除を受けるには確定申告が必要です。会社員の場合、年末調整では控除できません。翌年の1〜3月15日までに申告することで還付が受けられます。",
    needsFilingNoDesc: "年間医療費が10万円（または総所得の5%）以下のため、医療費控除の適用はありません。",
    taxTableTitle: "所得税率別の還付見込み額",
    taxTableSub: "控除額",
    taxTableSub2: "に各税率を掛けた試算",
    you: "あなた",
    taxNote: "復興特別所得税(2.1%)を加算すると還付額はわずかに増加します",
    selfMedTitle: "セルフメディケーション税制（選択制）",
    selfMedDesc: "市販薬（スイッチOTC薬）の購入費が年間12,000円超の場合、超過分（上限88,000円）を控除できます。通常の医療費控除とどちらか有利な方を選択してください。",
    selfMedDeduction: "控除額",
    selfMedRefund: "還付見込み（税率",
    selfMedRefundEnd: "）",
    betterMedical: "通常の医療費控除の方が有利（還付額 +",
    betterSelf: "セルフメディケーション税制の方が有利（還付額 +",
    betterEnd: "）",
    noDeductionBoth: "どちらの控除も適用されません。市販薬購入費が12,000円超、または医療費が足切り額を超えた場合に控除が発生します。",
    eligibleTitle: "医療費控除の対象・対象外",
    eligibleNote: "※ 判定は一般的な基準です。個別の状況により異なる場合があります。",
    disclaimerText: "本ツールは概算計算を目的としており、実際の控除額・還付額と異なる場合があります。所得税率の推定は給与所得控除・基礎控除のみを考慮した簡易計算です。正確な税額は税理士等の専門家または確定申告書作成コーナーをご利用ください。",
    disclaimerLink: "国税庁「医療費を支払ったとき（医療費控除）」を確認する",
    guideTitle: "医療費控除 計算ツールの使い方",
    guide: [
      { step: "1", title: "家族全員の医療費を入力", desc: "同一生計の家族（配偶者・子・親など）の医療費は合算できます。メンバーを追加して各人の年間医療費を入力してください。" },
      { step: "2", title: "保険金・給付金の補填額を入力", desc: "生命保険や健康保険から給付された金額（高額療養費・入院給付金など）を入力します。補填がない場合は0のままでOKです。" },
      { step: "3", title: "年収または総所得を入力", desc: "「足切り額」の計算に使います。年収から概算するか、確定申告書の所得金額合計を直接入力できます。" },
      { step: "4", title: "控除額・還付見込みを確認", desc: "医療費控除額と、所得税率に応じた還付見込み額が表示されます。セルフメディケーション税制との比較もできます。" },
    ],
    faqTitle: "よくある質問（FAQ）",
    faq: [
      { q: "医療費控除は年間いくらから申請できますか？", a: "総所得が200万円以上の場合は医療費が10万円を超えた分が控除対象です。200万円未満の場合は「総所得の5%」を超えた分が対象になります。家族全員分を合算して計算します。" },
      { q: "医療費控除は会社員でも申請できますか？", a: "申請できますが、会社員の場合は年末調整では手続きできません。翌年1月〜3月15日の確定申告期間に確定申告書を提出することで還付を受けられます。" },
      { q: "医療費控除でいくら戻ってきますか？", a: "「控除額 × 所得税率」が還付される所得税の概算です。例えば控除額が20万円で所得税率20%なら4万円程度です。さらに住民税も翌年の税額から軽減されます（控除額×10%）。" },
      { q: "歯の治療費は医療費控除の対象になりますか？", a: "治療目的（虫歯・歯周病・かみ合わせ改善のための矯正など）は対象です。美容目的の歯列矯正やホワイトニングは対象外です。インプラントは一般的に対象となります。" },
      { q: "セルフメディケーション税制とはどう違いますか？", a: "セルフメディケーション税制は市販のスイッチOTC薬（処方薬から転換された市販薬）の購入費12,000円超の部分（上限8.8万円）を控除する制度です。通常の医療費控除と選択適用になるため、有利な方を使います。" },
    ],
    ctaTitle: "確定申告ソフトで医療費控除を簡単に申請",
    ctaDesc: "freee・弥生・マネーフォワードクラウドなどの確定申告ソフトは医療費の集計・申告書の自動作成に対応しています。マイナポータルと連携すれば医療費データの自動取得も可能です。",
    ctaLink: "青色申告の節税効果もあわせてシミュレーションする",
    relatedTitle: "関連ツール",
    relatedLinks: [
      { href: "/tools/aojiro-shinkoku-sim", label: "青色申告控除 節税シミュレーター", desc: "青色65万円控除の節税効果を計算" },
      { href: "/tools/teigaku-genzei", label: "定額減税 計算ツール", desc: "2024年定額減税の還付額を確認" },
      { href: "/tools/ideco-tax-saving", label: "iDeCo 節税シミュレーター", desc: "iDeCo掛金による節税効果を計算" },
    ],
    namePlaceholder: "氏名",
    defaultMember1: "本人",
    defaultMember2: "配偶者",
    defaultMemberN: "家族",
    yen: "円",
    minusYen: "- ",
    eligibleItems: [
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
    ],
  },
  en: {
    langToggle: "JP",
    step1Title: "Enter Annual Medical Expenses",
    step1Sub: "You can combine expenses for all household members",
    addMember: "Add Member",
    totalMedical: "Total Medical Expenses",
    step2Title: "Insurance / Benefit Reimbursements",
    step2Sub: "Amounts reimbursed by life insurance, health insurance, high-cost medical care, etc.",
    step2Hint: "Leave as 0 if no reimbursements",
    step3Title: "Enter Income",
    modeGross: "Estimate from gross income",
    modeDirect: "Enter taxable income directly",
    grossLabel: "Annual Salary (\"Payment Amount\" on withholding slip)",
    grossPlaceholder: "5,000,000",
    estimatedIncome: "Estimated taxable income",
    estimatedNote: "(employment deduction & basic deduction only)",
    directLabel: "Total Income (\"Total Income\" on tax return)",
    directPlaceholder: "3,500,000",
    resultTitle: "Medical Deduction Result",
    paidMedical: "Total Medical Expenses Paid",
    insuranceFill: "Reimbursed Amount",
    threshold: "Floor Amount",
    threshold10: "¥100,000",
    threshold5pct: "5% of income",
    deductionLabel: "Medical Deduction (max ¥2,000,000)",
    noDeduction: "¥0 (no deduction)",
    refundLabel: "Estimated Refund (tax rate",
    refundNote: ")",
    refundSub: "* Does not include municipal tax reduction",
    needsFilingYes: "Tax Return Required",
    needsFilingNo: "No Tax Return Needed",
    needsFilingYesDesc: "To claim the medical deduction you must file a tax return. Employees cannot claim it through year-end adjustment. File between January and March 15 of the following year.",
    needsFilingNoDesc: "Medical expenses did not exceed ¥100,000 (or 5% of income), so the deduction does not apply.",
    taxTableTitle: "Estimated Refund by Tax Rate",
    taxTableSub: "Deduction",
    taxTableSub2: "× each tax rate",
    you: "You",
    taxNote: "Adding the surtax (2.1%) will slightly increase the refund.",
    selfMedTitle: "Self-Medication Tax System (Alternative)",
    selfMedDesc: "If OTC switch drug purchases exceed ¥12,000/year, the excess (up to ¥88,000) is deductible. Choose whichever is more advantageous.",
    selfMedDeduction: "Deduction",
    selfMedRefund: "Estimated refund (rate",
    selfMedRefundEnd: ")",
    betterMedical: "Standard medical deduction is better (refund +",
    betterSelf: "Self-medication system is better (refund +",
    betterEnd: ")",
    noDeductionBoth: "Neither deduction applies. Deductions activate when OTC purchases exceed ¥12,000 or medical expenses exceed the floor.",
    eligibleTitle: "Eligible vs. Ineligible Expenses",
    eligibleNote: "* Based on general criteria. Individual situations may vary.",
    disclaimerText: "This tool provides estimates only and may differ from actual deduction/refund amounts. Tax rate estimation uses only employment deduction and basic deduction. For accurate figures, consult a tax professional or the official tax return preparation service.",
    disclaimerLink: "NTA: \"Medical Expense Deduction\" (Japanese)",
    guideTitle: "How to Use This Calculator",
    guide: [
      { step: "1", title: "Enter household medical expenses", desc: "Medical expenses for family members (spouse, children, parents, etc.) sharing the same household can be combined. Add members and enter each person's annual expenses." },
      { step: "2", title: "Enter insurance reimbursements", desc: "Enter amounts reimbursed by insurance (high-cost medical care, hospitalization benefits, etc.). Leave as 0 if none." },
      { step: "3", title: "Enter income", desc: "Used to calculate the floor amount. Estimate from gross income or enter the total income from your tax return directly." },
      { step: "4", title: "Review deduction & refund", desc: "The deduction amount and estimated refund based on your tax rate are displayed. You can also compare with the self-medication tax system." },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "How much do I need to spend to claim the medical deduction?", a: "If total income is ¥2,000,000 or more, expenses exceeding ¥100,000 are deductible. If under ¥2,000,000, amounts exceeding 5% of income are deductible. All household members' expenses are combined." },
      { q: "Can employees claim the medical deduction?", a: "Yes, but it cannot be done through year-end adjustment. You must file a tax return between January and March 15 of the following year." },
      { q: "How much will I get back?", a: "The refund is approximately deduction × income tax rate. For example, a ¥200,000 deduction at 20% rate yields about ¥40,000. Municipal tax is also reduced the following year (deduction × 10%)." },
      { q: "Are dental costs deductible?", a: "Treatment-purpose costs (cavities, periodontal disease, bite-correction orthodontics, etc.) are eligible. Cosmetic orthodontics and whitening are not. Implants are generally eligible." },
      { q: "How is the self-medication system different?", a: "The self-medication system deducts OTC switch drug purchases exceeding ¥12,000/year (up to ¥88,000). It is mutually exclusive with the standard medical deduction — choose whichever gives a larger benefit." },
    ],
    ctaTitle: "File the Medical Deduction Easily with Tax Software",
    ctaDesc: "Tax apps like freee, Yayoi, and MoneyForward Cloud automate expense aggregation and tax return creation. Linking with My Number Portal enables automatic medical data import.",
    ctaLink: "Also simulate the Blue Return deduction savings",
    relatedTitle: "Related Tools",
    relatedLinks: [
      { href: "/tools/aojiro-shinkoku-sim", label: "Blue Return Deduction Simulator", desc: "Calculate tax savings from the ¥650,000 blue return deduction" },
      { href: "/tools/teigaku-genzei", label: "Fixed-Amount Tax Cut Calculator", desc: "Check your 2024 fixed-amount tax cut refund" },
      { href: "/tools/ideco-tax-saving", label: "iDeCo Tax Savings Simulator", desc: "Calculate tax savings from iDeCo contributions" },
    ],
    namePlaceholder: "Name",
    defaultMember1: "Self",
    defaultMember2: "Spouse",
    defaultMemberN: "Member",
    yen: "¥",
    minusYen: "- ¥",
    eligibleItems: [
      { item: "Doctor / dental treatment fees", eligible: true },
      { item: "Medicines (for treatment)", eligible: true },
      { item: "Hospitalization & meal costs (therapeutic)", eligible: true },
      { item: "Home nursing / home care fees", eligible: true },
      { item: "Commuting to hospital (train/bus)", eligible: true },
      { item: "LASIK / cataract surgery", eligible: true },
      { item: "Orthodontics (bite correction)", eligible: true },
      { item: "Childbirth expenses (including normal delivery)", eligible: true },
      { item: "Long-term care insurance co-pay (medical services)", eligible: true },
      { item: "Cosmetic surgery / vaccinations", eligible: false },
      { item: "Health checkups (no treatment required)", eligible: false },
      { item: "Orthodontics (cosmetic purpose)", eligible: false },
      { item: "Gas / parking for driving to hospital", eligible: false },
      { item: "Taxi fares (except emergencies)", eligible: false },
      { item: "Supplements / energy drinks", eligible: false },
    ],
  },
} as const;

let memberCounter = 3;

export default function IryouhiKoujo() {
  const [lang, setLang] = useState<Lang>("ja");
  const t = T[lang];

  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: T.ja.defaultMember1, amount: "" },
    { id: 2, name: T.ja.defaultMember2, amount: "" },
  ]);

  const [insuranceInput, setInsuranceInput] = useState("");
  const [incomeMode, setIncomeMode] = useState<"direct" | "gross">("gross");
  const [totalIncomeInput, setTotalIncomeInput] = useState("");
  const [grossIncomeInput, setGrossIncomeInput] = useState("");
  const [selfMedInput, setSelfMedInput] = useState("");

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

  const needsFiling = medResult.deduction > 0 || selfMedResult.eligible;

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
      { id: memberCounter++, name: `${t.defaultMemberN}${prev.length - 1}`, amount: "" },
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

  const fmtDisplay = (n: number): string => {
    if (lang === "en") {
      if (n === 0) return "¥0";
      return `¥${Math.round(n).toLocaleString("ja-JP")}`;
    }
    return fmtJPY(n);
  };

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
        .mode-btn-active {
          background: rgba(139,92,246,0.25);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {t.langToggle}
        </button>
      </div>

      {/* ===== STEP 1: 医療費入力 ===== */}
      <div className="glass-card rounded-2xl p-6 tab-panel">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-full bg-violet-600/40 text-violet-100 text-sm font-bold flex items-center justify-center shrink-0 border border-violet-500/40">1</span>
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.step1Title}</h2>
        </div>
        <p className="text-xs text-violet-200 mb-4">{t.step1Sub}</p>

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleNameChange(member.id, e.target.value)}
                className="number-input w-24 px-3 py-2.5 text-sm rounded-xl neon-focus transition-all"
                placeholder={t.namePlaceholder}
              />
              <input
                type="text"
                inputMode="numeric"
                value={member.amount}
                onChange={(e) => handleAmountChange(member.id, e.target.value)}
                placeholder="0"
                className="number-input flex-1 px-4 py-2.5 text-right text-lg font-semibold font-mono rounded-xl neon-focus transition-all"
              />
              <span className="text-violet-300 text-sm shrink-0">{t.yen}</span>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-violet-400 hover:bg-red-500/15 hover:text-red-400 transition-colors"
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
          className="mt-3 flex items-center gap-1.5 text-sm text-violet-300 hover:text-violet-100 font-medium transition-colors"
        >
          <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-base leading-none border border-violet-500/30">+</span>
          {t.addMember}
        </button>

        {totalMedical > 0 && (
          <div className="mt-4 flex justify-between items-center px-4 py-3 glass-card-bright rounded-xl border border-violet-500/20">
            <span className="text-sm text-violet-100 font-medium">{t.totalMedical}</span>
            <span className="text-xl font-bold text-white font-mono glow-text">{fmtDisplay(totalMedical)}</span>
          </div>
        )}
      </div>

      {/* ===== STEP 2: 保険金等の補填額 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-violet-600/40 text-violet-100 text-sm font-bold flex items-center justify-center shrink-0 border border-violet-500/40">2</span>
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.step2Title}</h2>
        </div>
        <p className="text-xs text-violet-200 mb-4">{t.step2Sub}</p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={insuranceInput}
            onChange={handleNumericInput(setInsuranceInput)}
            placeholder="0"
            className="number-input flex-1 px-4 py-3 text-right text-xl font-semibold font-mono rounded-xl neon-focus transition-all"
          />
          <span className="text-violet-300 font-medium text-lg">{t.yen}</span>
        </div>
        <p className="text-xs text-violet-200 mt-2">{t.step2Hint}</p>
      </div>

      {/* ===== STEP 3: 所得金額入力 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-7 h-7 rounded-full bg-violet-600/40 text-violet-100 text-sm font-bold flex items-center justify-center shrink-0 border border-violet-500/40">3</span>
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.step3Title}</h2>
        </div>

        <div className="flex gap-2 mb-4 glass-card rounded-xl p-1">
          {(["gross", "direct"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setIncomeMode(mode)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                incomeMode === mode
                  ? "mode-btn-active text-violet-100"
                  : "text-violet-300 hover:text-violet-100"
              }`}
            >
              {mode === "gross" ? t.modeGross : t.modeDirect}
            </button>
          ))}
        </div>

        {incomeMode === "gross" ? (
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-1.5 uppercase tracking-wider">
              {t.grossLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={grossIncomeInput}
                onChange={handleNumericInput(setGrossIncomeInput)}
                placeholder={t.grossPlaceholder}
                className="number-input flex-1 px-4 py-3 text-right text-xl font-semibold font-mono rounded-xl neon-focus transition-all"
              />
              <span className="text-violet-300 font-medium text-lg">{t.yen}</span>
            </div>
            {totalIncome > 0 && (
              <p className="text-xs text-violet-200 mt-2">
                {t.estimatedIncome}: <span className="font-semibold text-white font-mono">{fmtDisplay(totalIncome)}</span>
                {t.estimatedNote}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-1.5 uppercase tracking-wider">
              {t.directLabel}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={totalIncomeInput}
                onChange={handleNumericInput(setTotalIncomeInput)}
                placeholder={t.directPlaceholder}
                className="number-input flex-1 px-4 py-3 text-right text-xl font-semibold font-mono rounded-xl neon-focus transition-all"
              />
              <span className="text-violet-300 font-medium text-lg">{t.yen}</span>
            </div>
          </div>
        )}
      </div>

      {/* ===== 計算結果 ===== */}
      {hasResult && (
        <>
          {/* メイン結果カード */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.resultTitle}</div>

            <div className="space-y-3">
              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-violet-200 mb-1">{t.paidMedical}</div>
                <div className="text-2xl font-bold text-white font-mono">{fmtDisplay(totalMedical)}</div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 border-t border-white/10" />
                <span className="text-xs text-violet-200">- {t.insuranceFill}</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-violet-200 mb-1">{t.insuranceFill}</div>
                <div className="text-xl font-bold text-red-400 font-mono">- {fmtDisplay(insurance)}</div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 border-t border-white/10" />
                <span className="text-xs text-violet-200">- {t.threshold}</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="text-xs text-violet-200 mb-1">
                  {t.threshold}（{totalIncome > 2_000_000 ? t.threshold10 : `${t.threshold5pct} = ${fmtDisplay(totalIncome * 0.05)}`}）
                </div>
                <div className="text-xl font-bold text-red-400 font-mono">- {fmtDisplay(medResult.threshold)}</div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 border-t border-white/10" />
                <span className="text-xs text-violet-200">= {t.deductionLabel}</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <div className="glass-card-bright rounded-xl p-4 border border-violet-500/25">
                <div className="text-xs text-violet-200 mb-1">{t.deductionLabel}</div>
                <div className="text-3xl font-bold text-white glow-text font-mono">
                  {medResult.deduction > 0 ? fmtDisplay(medResult.deduction) : t.noDeduction}
                </div>
              </div>

              {medResult.deduction > 0 && (
                <div className="glass-card rounded-xl p-4 border border-cyan-500/20">
                  <div className="text-xs text-violet-200 mb-1">
                    {t.refundLabel} {Math.round(taxRate * 100)}%{t.refundNote}
                  </div>
                  <div className="text-3xl font-bold text-cyan-300 font-mono">{fmtDisplay(refundMed)}</div>
                  <div className="text-xs text-violet-200 mt-1">{t.refundSub}</div>
                </div>
              )}
            </div>
          </div>

          {/* 確定申告の要否 */}
          <div className={`glass-card rounded-2xl p-5 ${
            needsFiling ? "border border-amber-500/25" : "border border-white/8"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${
                needsFiling ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-white/5 text-violet-300 border border-white/10"
              }`}>
                {needsFiling ? "!" : "–"}
              </div>
              <div>
                <div className={`font-semibold text-base mb-1 ${
                  needsFiling ? "text-amber-300" : "text-violet-200"
                }`}>
                  {needsFiling ? t.needsFilingYes : t.needsFilingNo}
                </div>
                <p className={`text-xs ${needsFiling ? "text-amber-200/80" : "text-violet-200"}`}>
                  {needsFiling ? t.needsFilingYesDesc : t.needsFilingNoDesc}
                </p>
              </div>
            </div>
          </div>

          {/* 所得税率別の還付額一覧 */}
          {medResult.deduction > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.taxTableTitle}</h2>
              <p className="text-xs text-violet-200 mb-4">{t.taxTableSub} {fmtDisplay(medResult.deduction)} {t.taxTableSub2}</p>

              <div className="space-y-2">
                {TAX_BRACKETS.map((bracket) => {
                  const refund = Math.floor(medResult.deduction * bracket.rate);
                  const isActive = bracket.rate === taxRate;
                  return (
                    <div
                      key={bracket.label}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl table-row-stripe ${
                        isActive
                          ? "bg-violet-600/25 border border-violet-500/40"
                          : "glass-card"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold w-8 font-mono ${isActive ? "text-violet-100" : "text-white/80"}`}>
                          {bracket.label}
                        </span>
                        {isActive && (
                          <span className="text-xs bg-violet-500/20 text-violet-200 px-1.5 py-0.5 rounded font-medium border border-violet-500/30">
                            {t.you}
                          </span>
                        )}
                      </div>
                      <span className={`text-lg font-bold font-mono ${isActive ? "text-cyan-300" : "text-white/80"}`}>
                        {fmtDisplay(refund)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-violet-200 mt-3">{t.taxNote}</p>
            </div>
          )}
        </>
      )}

      {/* ===== セルフメディケーション税制 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.selfMedTitle}</h2>
        <p className="text-xs text-violet-200 mb-4">{t.selfMedDesc}</p>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            inputMode="numeric"
            value={selfMedInput}
            onChange={handleNumericInput(setSelfMedInput)}
            placeholder="0"
            className="number-input flex-1 px-4 py-3 text-right text-xl font-semibold font-mono rounded-xl neon-focus transition-all"
          />
          <span className="text-violet-300 font-medium text-lg">{t.yen}</span>
        </div>

        {selfMedResult.eligible && (
          <div className="mt-3 p-4 glass-card-bright rounded-xl border border-cyan-500/20 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-violet-100">{t.selfMedDeduction}</span>
              <span className="font-bold text-white font-mono">{fmtDisplay(selfMedResult.deduction)}</span>
            </div>
            {totalIncome > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-violet-100">{t.selfMedRefund} {Math.round(taxRate * 100)}%{t.selfMedRefundEnd}</span>
                <span className="font-bold text-cyan-300 font-mono">{fmtDisplay(refundSelf)}</span>
              </div>
            )}
          </div>
        )}

        {hasResult && selfMedResult.eligible && medResult.deduction > 0 && (
          <div className={`mt-3 p-4 rounded-xl glass-card border font-medium text-sm ${
            betterOption === "medical"
              ? "border-violet-500/30 text-violet-100"
              : "border-cyan-500/30 text-cyan-200"
          }`}>
            {betterOption === "medical"
              ? `${t.betterMedical}${fmtDisplay(refundMed - refundSelf)}${t.betterEnd}`
              : `${t.betterSelf}${fmtDisplay(refundSelf - refundMed)}${t.betterEnd}`}
          </div>
        )}

        {hasResult && !selfMedResult.eligible && medResult.deduction === 0 && (
          <div className="mt-3 p-3 glass-card rounded-xl text-xs text-violet-200">
            {t.noDeductionBoth}
          </div>
        )}
      </div>

      {/* ===== 医療費控除の対象/対象外一覧 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.eligibleTitle}</h2>

        <div className="space-y-2">
          {t.eligibleItems.map((ex) => (
            <div
              key={ex.item}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                ex.eligible
                  ? "bg-violet-500/8 border border-violet-500/15"
                  : "bg-red-500/8 border border-red-500/15"
              }`}
            >
              <span className={`text-base shrink-0 font-mono ${ex.eligible ? "text-violet-300" : "text-red-400"}`}>
                {ex.eligible ? "○" : "×"}
              </span>
              <span className={`text-sm ${ex.eligible ? "text-violet-100" : "text-red-200"}`}>
                {ex.item}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-violet-200 mt-3">{t.eligibleNote}</p>
      </div>

      {/* ===== 免責・参考リンク ===== */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs text-violet-200 mb-2">{t.disclaimerText}</p>
        <a
          href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1120.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-cyan-300 hover:text-cyan-200 underline"
        >
          {t.disclaimerLink}
        </a>
      </div>

      {/* ===== 使い方ガイド ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-4">
          {t.guide.map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{step}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                <p className="text-xs text-violet-200">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.faqTitle}</h2>
        {t.faq.map(({ q, a }) => (
          <div key={q} className="border-b border-white/6 last:border-0 pb-4 last:pb-0">
            <p className="text-sm font-semibold text-violet-100 mb-1">Q. {q}</p>
            <p className="text-xs text-violet-200">A. {a}</p>
          </div>
        ))}
      </div>

      {/* ===== CTA ===== */}
      <div className="glass-card rounded-2xl p-5 border border-violet-500/15">
        <p className="text-sm font-semibold text-white mb-1">{t.ctaTitle}</p>
        <p className="text-xs text-violet-200 mb-3">{t.ctaDesc}</p>
        <a href="/tools/aojiro-shinkoku-sim" className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200 underline">
          {t.ctaLink}
        </a>
      </div>

      {/* ===== 関連ツール ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="space-y-2">
          {t.relatedLinks.map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              className="flex items-start gap-3 p-3 glass-card rounded-xl hover:border-violet-500/30 transition-all group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <svg className="w-4 h-4 text-violet-400 group-hover:text-violet-200 mt-0.5 shrink-0 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-violet-100 group-hover:text-white transition-colors">{label}</p>
                <p className="text-xs text-violet-200">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ===== JSON-LD FAQPage (日本語固定) ===== */}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "医療費控除 シミュレーター",
  "description": "年間医療費・保険金・家族分を入力して医療費控除の還付額を計算",
  "url": "https://tools.loresync.dev/iryouhi-koujo",
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
