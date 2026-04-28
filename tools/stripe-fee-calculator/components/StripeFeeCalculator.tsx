"use client";

import { useState, useMemo } from "react";

// --- 手数料定数 ---
const CARD_RATE = 0.036; // 3.6%
const CONVENIENCE_RATE = 0.036; // 3.6%
const CONVENIENCE_CAP = 190; // ¥190上限
const BANK_TRANSFER_FEE = 190; // ¥190/件
const LINK_RATE = 0.036; // 3.6%
const APPLE_GOOGLE_PAY_RATE = 0.036; // 3.6%（カード手数料と同率）

// 振込手数料
const AUTO_PAYOUT_FEE = 0; // 無料
const INSTANT_PAYOUT_RATE = 0.005; // 0.5%
const INSTANT_PAYOUT_FIXED = 250; // ¥250

// 他社比較データ
type CompetitorRow = {
  name: string;
  cardRate: string;
  convenienceRate: string;
  monthlyFee: string;
  notes: string;
};

type Lang = "ja" | "en";

// --- 翻訳定数 ---
const T = {
  ja: {
    // Tabs
    single: "1回計算",
    monthly: "月間シミュ",
    payout: "振込手数料",
    compare: "他社比較",
    surcharge: "転嫁計算",
    // Section headings
    salesAmountAndMethod: "売上金額と決済方法",
    monthlySim: "月間シミュレーション",
    payoutFeeTitle: "振込手数料（Stripe → 事業者口座）",
    compareTitle: "他社比較",
    compareSubtitle: "日本主要決済サービスのカード手数料比較",
    stripeAdvantage: "Stripe を選ぶメリット",
    surchargeTitle: "手数料を顧客に転嫁する場合",
    surchargeSubtitle: "「希望受取額」を入力すると、手数料込みの請求価格と必要な上乗せ率を計算します。",
    guideTitle: "使い方ガイド",
    faqTitle: "よくある質問（FAQ）",
    relatedTools: "関連ツール",
    // Labels
    salesAmount: "売上金額（1回あたり）",
    paymentMethod: "決済方法",
    monthlyCount: "月間取引件数",
    avgPrice: "平均単価",
    payoutType: "振込タイプ",
    payoutAmount: "振込金額（Stripe残高）",
    monthlyPayoutCount: "月間振込回数",
    desiredIncome: "希望実収入（税抜）",
    // Result labels
    result: "計算結果",
    netIncome: "実収入（手数料差し引き後）",
    sales: "売上",
    fee: "手数料",
    effectiveRate: "実効手数料率",
    monthlyTotal: "月間集計",
    monthlyNetIncome: "月間実収入",
    monthlySales: "月間売上",
    monthlyTotalFee: "月間手数料合計",
    txCount: "取引件数",
    perTx: "1件あたり",
    payoutFeeResult: "振込手数料",
    monthlyPayoutFee: "月間振込手数料",
    monthlyPayoutFeeTotal: "月間振込手数料合計",
    autoPayoutNote: "自動振込は無料です（最低¥500/回）",
    surchargeResult: "転嫁後の請求価格",
    billingPrice: "顧客への請求価格",
    surchargeAmount: "上乗せ金額",
    surchargeRate: "上乗せ率",
    desiredIncomeLabel: "希望実収入",
    stripeFee: "Stripe手数料（請求額にかかる分）",
    billingPriceLabel: "顧客への請求価格",
    total: "合計",
    // Payout types
    autoPayout: "自動振込",
    autoPayoutFree: "無料",
    autoPayoutDesc: "最低¥500/回、通常2〜4営業日",
    instantPayout: "即時振込",
    instantPayoutFee: "0.5% + ¥250/回",
    instantPayoutDesc: "30分以内着金",
    // Breakdown
    rateFee: "比率手数料",
    fixedFee: "固定手数料",
    // Table headers
    service: "サービス",
    cardRate: "カード手数料",
    convenience: "コンビニ",
    monthlyFeeHeader: "月額",
    notes: "備考",
    thisTool: "このツール",
    // Footnotes
    feeNote: "手数料は2026年時点の情報です。最新の料金はStripe公式サイトをご確認ください。",
    compareNote: "手数料は2026年時点の公開情報を基にしています。最新情報は各社公式サイトをご確認ください。",
    surchargeNote: "※ 手数料転嫁（サーチャージ）はStripeの利用規約・カードブランドルールを事前にご確認ください。",
    convenienceCapNote: "¥5,278以上のため手数料は¥190の上限固定です",
    perMonth: "件/月",
    timesPerMonth: "回/月",
    // Methods
    cardLabel: "クレジットカード",
    cardDesc: "国内・JCB 3.6%",
    convenienceLabel: "コンビニ決済",
    convenienceDesc: "3.6%（¥190上限）",
    bankLabel: "銀行振込",
    bankDesc: "¥190/件（顧客手数料別）",
    linkLabel: "Link（ワンクリック）",
    linkDesc: "国内 3.6%",
    appleGoogleLabel: "Apple/Google Pay",
    appleGoogleDesc: "カード同率 3.6%",
    // Competitors
    competitorNotes: {
      Stripe: "即時振込: 0.5%+¥250",
      PayPal: "海外送金対応",
      Square: "実店舗向け強み",
      "PAY.JP": "国内特化",
    } as Record<string, string>,
    // Stripe advantages
    advantages: [
      { icon: "✅", title: "初期費用・月額費用ゼロ", desc: "使った分だけ支払い。固定費不要。" },
      { icon: "🌏", title: "海外カード・複数通貨対応", desc: "海外顧客への販売も追加費用なし（為替手数料は別）。" },
      { icon: "⚡", title: "コンビニ¥190上限が強み", desc: "高額決済ではコンビニ払いが最安。¥5,278超で¥190固定。" },
      { icon: "🔧", title: "API・開発者体験が最高水準", desc: "Webhook、Billing、Connect等の豊富な機能。" },
    ],
    // Guide
    guide: [
      { step: "1", title: "タブを選択", desc: "「1回計算」で単発の手数料確認、「月間シミュ」で月間収益シミュレーション、「転嫁計算」で顧客への手数料転嫁価格を計算できます。" },
      { step: "2", title: "決済金額を入力", desc: "売上金額を入力するかプリセットボタンを選択します。プリセットには ¥1,000〜¥100,000 の代表的な金額が用意されています。" },
      { step: "3", title: "決済方法を選択", desc: "クレジットカード・コンビニ決済・銀行振込など、実際に使用する決済方法を選択します。コンビニ決済は ¥5,278 以上で ¥190 の上限固定になります。" },
      { step: "4", title: "結果を確認", desc: "手数料・実収入・実効手数料率が表示されます。月間シミュでは年間換算も参考にしてください。" },
    ],
    // FAQ
    faq: [
      {
        q: "Stripe の手数料は日本でいくら？",
        a: "国内発行カードは 3.6%、コンビニ決済は 3.6%（¥190 上限）、銀行振込は ¥190/件です。月額固定費は不要で使った分だけ支払います。",
      },
      {
        q: "Stripe でコンビニ決済を使うメリットは？",
        a: "¥5,278 以上の決済では手数料が ¥190 の上限に固定されるため、高額商品ではカード決済より実質手数料率が低くなります。例えば ¥50,000 の決済なら手数料はわずか ¥190（実効 0.38%）です。",
      },
      {
        q: "Stripe の振込（ペイアウト）手数料は？",
        a: "自動振込は無料です。即時振込（30 分以内着金）は 0.5% + ¥250/回の手数料がかかります。週次・月次の自動振込を使えばコストゼロで資金を口座に移動できます。",
      },
      {
        q: "Stripe と PayPal、どちらが安い？",
        a: "国内取引なら Stripe の 3.6% に対し PayPal は 3.6%+¥40/件のため、少額決済では PayPal の方が割高になります。海外顧客への販売が多い場合は PayPal の知名度も考慮してください。",
      },
      {
        q: "Stripe の手数料を顧客に転嫁（サーチャージ）できる？",
        a: "法律上は禁止されていませんが、Stripe の利用規約およびカードブランドルール（Visa・Mastercard 等）で制限される場合があります。転嫁する場合は事前にご確認ください。このツールの「転嫁計算」タブで必要な上乗せ金額を計算できます。",
      },
    ],
    // Related tools
    relatedLinks: [
      { href: "/mercari-tesuryou", title: "メルカリ手数料計算", desc: "フリマアプリ販売時の手数料・利益を自動計算。" },
      { href: "/shopify-fee-jp", title: "Shopify 手数料計算", desc: "Shopify プラン別の決済手数料と月額費用を試算。" },
      { href: "/paypal-fee-jp", title: "PayPal 手数料計算", desc: "PayPal の国内・海外送金手数料を計算。Stripe との比較に。" },
    ],
  },
  en: {
    // Tabs
    single: "Single",
    monthly: "Monthly",
    payout: "Payout Fee",
    compare: "Compare",
    surcharge: "Surcharge",
    // Section headings
    salesAmountAndMethod: "Sales Amount & Payment Method",
    monthlySim: "Monthly Simulation",
    payoutFeeTitle: "Payout Fee (Stripe → Bank Account)",
    compareTitle: "Competitor Comparison",
    compareSubtitle: "Card fee comparison for major Japan payment services",
    stripeAdvantage: "Why Choose Stripe",
    surchargeTitle: "Pass Fee to Customer (Surcharge)",
    surchargeSubtitle: "Enter your desired net income to calculate the gross charge price and required markup rate.",
    guideTitle: "How to Use",
    faqTitle: "FAQ",
    relatedTools: "Related Tools",
    // Labels
    salesAmount: "Sales Amount (per transaction)",
    paymentMethod: "Payment Method",
    monthlyCount: "Monthly Transaction Count",
    avgPrice: "Average Price",
    payoutType: "Payout Type",
    payoutAmount: "Payout Amount (Stripe Balance)",
    monthlyPayoutCount: "Monthly Payout Count",
    desiredIncome: "Desired Net Income (excl. tax)",
    // Result labels
    result: "Calculation Result",
    netIncome: "Net Income (after fees)",
    sales: "Sales",
    fee: "Fee",
    effectiveRate: "Effective Fee Rate",
    monthlyTotal: "Monthly Summary",
    monthlyNetIncome: "Monthly Net Income",
    monthlySales: "Monthly Sales",
    monthlyTotalFee: "Total Monthly Fees",
    txCount: "Transactions",
    perTx: "Per Transaction",
    payoutFeeResult: "Payout Fee",
    monthlyPayoutFee: "Monthly Payout Fee",
    monthlyPayoutFeeTotal: "Total Monthly Payout Fee",
    autoPayoutNote: "Automatic payouts are free (min ¥500/payout)",
    surchargeResult: "Gross Charge Price",
    billingPrice: "Customer Billing Price",
    surchargeAmount: "Markup Amount",
    surchargeRate: "Markup Rate",
    desiredIncomeLabel: "Desired Net Income",
    stripeFee: "Stripe Fee (on gross amount)",
    billingPriceLabel: "Customer Billing Price",
    total: "Total",
    // Payout types
    autoPayout: "Automatic Payout",
    autoPayoutFree: "Free",
    autoPayoutDesc: "Min ¥500/payout, usually 2–4 business days",
    instantPayout: "Instant Payout",
    instantPayoutFee: "0.5% + ¥250/payout",
    instantPayoutDesc: "Arrives within 30 minutes",
    // Breakdown
    rateFee: "Rate fee",
    fixedFee: "Fixed fee",
    // Table headers
    service: "Service",
    cardRate: "Card Rate",
    convenience: "Convenience",
    monthlyFeeHeader: "Monthly",
    notes: "Notes",
    thisTool: "this tool",
    // Footnotes
    feeNote: "Fees are based on information as of 2026. Please check each company's official site for the latest rates.",
    compareNote: "Fees are based on publicly available information as of 2026. Please verify with each company's official site.",
    surchargeNote: "* Surcharging may be subject to Stripe's Terms of Service and card brand rules. Please review before implementing.",
    convenienceCapNote: "Amount ≥ ¥5,278 — fee is capped at ¥190",
    perMonth: "tx/mo",
    timesPerMonth: "times/mo",
    // Methods
    cardLabel: "Credit Card",
    cardDesc: "Domestic / JCB 3.6%",
    convenienceLabel: "Convenience Store",
    convenienceDesc: "3.6% (¥190 cap)",
    bankLabel: "Bank Transfer",
    bankDesc: "¥190/tx (customer fee separate)",
    linkLabel: "Link (one-click)",
    linkDesc: "Domestic 3.6%",
    appleGoogleLabel: "Apple/Google Pay",
    appleGoogleDesc: "Same as card 3.6%",
    // Competitors
    competitorNotes: {
      Stripe: "Instant payout: 0.5%+¥250",
      PayPal: "International transfers",
      Square: "Strong for physical stores",
      "PAY.JP": "Japan-focused",
    } as Record<string, string>,
    // Stripe advantages
    advantages: [
      { icon: "✅", title: "No setup or monthly fees", desc: "Pay only for what you use. No fixed costs." },
      { icon: "🌏", title: "Foreign cards & multi-currency", desc: "Sell to overseas customers at no extra cost (FX fees apply)." },
      { icon: "⚡", title: "Convenience store ¥190 cap", desc: "For high-value sales, convenience is cheapest. ¥190 fixed above ¥5,278." },
      { icon: "🔧", title: "Best-in-class API & DX", desc: "Rich features: Webhooks, Billing, Connect and more." },
    ],
    // Guide
    guide: [
      { step: "1", title: "Select a Tab", desc: "Use 'Single' for one-off fee checks, 'Monthly' for revenue simulation, or 'Surcharge' to calculate the gross price to charge customers." },
      { step: "2", title: "Enter Amount", desc: "Type a sales amount or click a preset button. Presets range from ¥1,000 to ¥100,000." },
      { step: "3", title: "Select Payment Method", desc: "Choose the payment method you actually use. Convenience store payments are capped at ¥190 for amounts ≥ ¥5,278." },
      { step: "4", title: "Check Results", desc: "Fee, net income, and effective rate are shown instantly. In Monthly view, use the annual estimate as a reference." },
    ],
    // FAQ
    faq: [
      {
        q: "How much does Stripe charge in Japan?",
        a: "Domestic cards: 3.6%, convenience store: 3.6% (¥190 cap), bank transfer: ¥190/tx. No monthly fees — you only pay per transaction.",
      },
      {
        q: "What is the benefit of convenience store payments on Stripe?",
        a: "For amounts ≥ ¥5,278 the fee is capped at ¥190, making it cheaper than card payments for high-value items. A ¥50,000 transaction costs just ¥190 (0.38% effective rate).",
      },
      {
        q: "What are Stripe's payout fees?",
        a: "Automatic payouts are free. Instant payouts (within 30 min) cost 0.5% + ¥250 per payout. Using weekly/monthly auto payouts means zero cost to move funds.",
      },
      {
        q: "Stripe vs PayPal — which is cheaper?",
        a: "For domestic transactions, Stripe charges 3.6% vs PayPal's 3.6%+¥40/tx, making PayPal more expensive for small amounts. If you have many overseas customers, also consider PayPal's brand recognition.",
      },
      {
        q: "Can I pass Stripe fees to customers (surcharge)?",
        a: "It is not prohibited by law, but Stripe's Terms of Service and card brand rules (Visa, Mastercard, etc.) may apply restrictions. Please review before implementing. Use the 'Surcharge' tab to calculate the required markup.",
      },
    ],
    // Related tools
    relatedLinks: [
      { href: "/mercari-tesuryou", title: "Mercari Fee Calculator", desc: "Auto-calculate fees and profit for flea market sales." },
      { href: "/shopify-fee-jp", title: "Shopify Fee Calculator", desc: "Estimate payment fees and monthly costs by Shopify plan." },
      { href: "/paypal-fee-jp", title: "PayPal Fee Calculator", desc: "Calculate PayPal domestic & international transfer fees. Compare with Stripe." },
    ],
  },
} as const;

type PaymentMethod = "card" | "convenience" | "bank" | "link" | "apple_google";

type MethodConfig = {
  id: PaymentMethod;
  label: string;
  icon: string;
  description: string;
};

function getMethods(lang: Lang): MethodConfig[] {
  const t = T[lang];
  return [
    { id: "card", label: t.cardLabel, icon: "💳", description: t.cardDesc },
    { id: "convenience", label: t.convenienceLabel, icon: "🏪", description: t.convenienceDesc },
    { id: "bank", label: t.bankLabel, icon: "🏦", description: t.bankDesc },
    { id: "link", label: t.linkLabel, icon: "⚡", description: t.linkDesc },
    { id: "apple_google", label: t.appleGoogleLabel, icon: "📱", description: t.appleGoogleDesc },
  ];
}

const COMPETITORS_BASE: Omit<CompetitorRow, "notes">[] = [
  { name: "Stripe", cardRate: "3.6%", convenienceRate: "3.6%（¥190上限）", monthlyFee: "無料" },
  { name: "PayPal", cardRate: "3.6%+¥40", convenienceRate: "非対応", monthlyFee: "無料" },
  { name: "Square", cardRate: "3.25%〜3.75%", convenienceRate: "非対応", monthlyFee: "無料" },
  { name: "PAY.JP", cardRate: "3.0%〜", convenienceRate: "非対応", monthlyFee: "¥1,980〜" },
];

function getCompetitors(lang: Lang): CompetitorRow[] {
  return COMPETITORS_BASE.map((row) => ({
    ...row,
    notes: T[lang].competitorNotes[row.name] ?? "",
  }));
}

function fmtJPY(n: number): string {
  if (n < 1 && n > 0) return `¥${n.toFixed(2)}`;
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function fmtRate(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

function calcFee(method: PaymentMethod, amount: number): number {
  switch (method) {
    case "card":
      return amount * CARD_RATE;
    case "convenience": {
      const rateFee = amount * CONVENIENCE_RATE;
      return Math.min(rateFee, CONVENIENCE_CAP);
    }
    case "bank":
      return BANK_TRANSFER_FEE;
    case "link":
      return amount * LINK_RATE;
    case "apple_google":
      return amount * APPLE_GOOGLE_PAY_RATE;
    default:
      return 0;
  }
}

function calcPayoutFee(
  type: "auto" | "instant",
  netAmount: number,
  payoutCount: number
): number {
  if (type === "auto") return AUTO_PAYOUT_FEE;
  return netAmount * INSTANT_PAYOUT_RATE + INSTANT_PAYOUT_FIXED * payoutCount;
}

// タブの種類
type Tab = "single" | "monthly" | "payout" | "compare" | "surcharge";

export default function StripeFeeCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>("single");
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];
  const METHODS = getMethods(lang);
  const COMPETITORS = getCompetitors(lang);

  // 1回計算
  const [singleAmount, setSingleAmount] = useState<number>(10000);
  const [singleMethod, setSingleMethod] = useState<PaymentMethod>("card");

  // 月間シミュレーション
  const [monthlyCount, setMonthlyCount] = useState<number>(100);
  const [monthlyAvg, setMonthlyAvg] = useState<number>(5000);
  const [monthlyMethod, setMonthlyMethod] = useState<PaymentMethod>("card");

  // 振込手数料
  const [payoutType, setPayoutType] = useState<"auto" | "instant">("auto");
  const [payoutCount, setPayoutCount] = useState<number>(4);
  const [payoutNetAmount, setPayoutNetAmount] = useState<number>(100000);

  // 損益分岐
  const [surchargeAmount, setSurchargeAmount] = useState<number>(10000);
  const [surchargeMethod, setSurchargeMethod] = useState<PaymentMethod>("card");

  // --- 計算 ---
  const singleFee = useMemo(() => calcFee(singleMethod, singleAmount), [singleMethod, singleAmount]);
  const singleNet = useMemo(() => singleAmount - singleFee, [singleAmount, singleFee]);
  const singleEffectiveRate = useMemo(() => (singleAmount > 0 ? singleFee / singleAmount : 0), [singleFee, singleAmount]);

  const monthlyFeePerTx = useMemo(() => calcFee(monthlyMethod, monthlyAvg), [monthlyMethod, monthlyAvg]);
  const monthlyTotalFee = useMemo(() => monthlyFeePerTx * monthlyCount, [monthlyFeePerTx, monthlyCount]);
  const monthlyTotalRevenue = useMemo(() => monthlyAvg * monthlyCount, [monthlyAvg, monthlyCount]);
  const monthlyNet = useMemo(() => monthlyTotalRevenue - monthlyTotalFee, [monthlyTotalRevenue, monthlyTotalFee]);
  const monthlyEffectiveRate = useMemo(
    () => (monthlyTotalRevenue > 0 ? monthlyTotalFee / monthlyTotalRevenue : 0),
    [monthlyTotalFee, monthlyTotalRevenue]
  );

  const payoutFee = useMemo(
    () => calcPayoutFee(payoutType, payoutNetAmount, payoutCount),
    [payoutType, payoutNetAmount, payoutCount]
  );

  const surchargeFee = useMemo(() => calcFee(surchargeMethod, surchargeAmount), [surchargeMethod, surchargeAmount]);
  const surchargeRate = useMemo(
    () => (surchargeAmount > 0 ? surchargeFee / surchargeAmount : 0),
    [surchargeFee, surchargeAmount]
  );
  const surchargePriceNeeded = useMemo(
    () => (surchargeAmount > 0 && surchargeRate < 1 ? surchargeAmount / (1 - surchargeRate) : 0),
    [surchargeAmount, surchargeRate]
  );
  const surchargeAddAmount = useMemo(
    () => surchargePriceNeeded - surchargeAmount,
    [surchargePriceNeeded, surchargeAmount]
  );
  const surchargeAddRate = useMemo(
    () => (surchargeAmount > 0 ? surchargeAddAmount / surchargeAmount : 0),
    [surchargeAddAmount, surchargeAmount]
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "single", label: t.single, icon: "◎" },
    { id: "monthly", label: t.monthly, icon: "∿" },
    { id: "payout", label: t.payout, icon: "→" },
    { id: "compare", label: t.compare, icon: "⊞" },
    { id: "surcharge", label: t.surcharge, icon: "↑" },
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
        .stat-divider {
          background: linear-gradient(to bottom, transparent, rgba(167,139,250,0.3), transparent);
          width: 1px;
        }
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
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(139,92,246,0.3);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #818cf8);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139,92,246,0.5), 0 2px 6px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 16px rgba(139,92,246,0.7), 0 2px 8px rgba(0,0,0,0.5);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* タブ */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-violet-600 text-white tab-active-glow"
                : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
            }`}
          >
            <span className="text-xs opacity-70">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 1回計算 ===== */}
      {activeTab === "single" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.salesAmountAndMethod}</h2>

            <div className="mb-6">
              <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.salesAmount}</label>
              <div className="flex items-center gap-3">
                <span className="text-violet-400 text-lg font-light">¥</span>
                <input
                  type="number"
                  min={1}
                  step={100}
                  value={singleAmount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v) && v >= 0) setSingleAmount(v);
                  }}
                  className="number-input w-44 px-4 py-2.5 rounded-xl text-base font-mono neon-focus transition-all"
                />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {[1000, 3000, 5000, 10000, 30000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSingleAmount(preset)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-mono ${
                      singleAmount === preset
                        ? "preset-active"
                        : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
                    }`}
                  >
                    ¥{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.paymentMethod}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSingleMethod(m.id)}
                    className={`method-btn flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      singleMethod === m.id
                        ? "method-btn-active border-violet-500/60"
                        : "border-white/8 hover:border-violet-500/30"
                    }`}
                  >
                    <span className="text-xl leading-none mt-0.5">{m.icon}</span>
                    <div>
                      <div className={`font-medium text-sm ${singleMethod === m.id ? "text-violet-100" : "text-white/90"}`}>{m.label}</div>
                      <div className="text-xs text-violet-200 mt-0.5">{m.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 結果 */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.result}</div>

            <div className="mb-6">
              <div className="text-xs text-violet-200 mb-2">{t.netIncome}</div>
              <div className="text-5xl font-bold text-white glow-text tracking-tight">{fmtJPY(singleNet)}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.sales}</div>
                <div className="font-bold text-base text-white/90 font-mono">{fmtJPY(singleAmount)}</div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.fee}</div>
                <div className="font-bold text-base text-red-400 font-mono">{fmtJPY(singleFee)}</div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.effectiveRate}</div>
                <div className="font-bold text-base text-cyan-400 font-mono">{fmtRate(singleEffectiveRate)}</div>
              </div>
            </div>

            {singleMethod === "convenience" && singleAmount >= 5278 && (
              <div className="mt-4 text-xs text-cyan-300 glass-card rounded-xl px-4 py-2.5 border border-cyan-500/20">
                {t.convenienceCapNote}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 月間シミュレーション ===== */}
      {activeTab === "monthly" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.monthlySim}</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.monthlyCount}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={10000}
                    step={1}
                    value={monthlyCount}
                    onChange={(e) => setMonthlyCount(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      value={monthlyCount}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v) && v > 0) setMonthlyCount(v);
                      }}
                      className="number-input w-24 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus"
                    />
                    <span className="text-xs text-violet-200 whitespace-nowrap">{t.perMonth}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.avgPrice}</label>
                <div className="flex items-center gap-3">
                  <span className="text-violet-400 text-lg font-light">¥</span>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={monthlyAvg}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= 0) setMonthlyAvg(v);
                    }}
                    className="number-input w-40 px-4 py-2.5 rounded-xl text-base font-mono neon-focus"
                  />
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[1000, 3000, 5000, 10000, 30000, 50000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setMonthlyAvg(preset)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-mono ${
                        monthlyAvg === preset
                          ? "preset-active"
                          : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
                      }`}
                    >
                      ¥{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.paymentMethod}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMonthlyMethod(m.id)}
                      className={`method-btn flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                        monthlyMethod === m.id
                          ? "method-btn-active border-violet-500/60"
                          : "border-white/8 hover:border-violet-500/30"
                      }`}
                    >
                      <span className="text-lg leading-none">{m.icon}</span>
                      <div className={`font-medium text-xs ${monthlyMethod === m.id ? "text-violet-100" : "text-white/90"}`}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 月間結果 */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.monthlyTotal}</div>

            <div className="mb-6">
              <div className="text-xs text-violet-200 mb-2">{t.monthlyNetIncome}</div>
              <div className="text-4xl font-bold text-white glow-text tracking-tight">{fmtJPY(monthlyNet)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="glass-card rounded-xl p-3.5">
                <div className="text-violet-200 text-xs mb-1.5">{t.monthlySales}</div>
                <div className="font-bold text-xl text-white/90 font-mono">{fmtJPY(monthlyTotalRevenue)}</div>
              </div>
              <div className="glass-card rounded-xl p-3.5">
                <div className="text-violet-200 text-xs mb-1.5">{t.monthlyTotalFee}</div>
                <div className="font-bold text-xl text-red-400 font-mono">{fmtJPY(monthlyTotalFee)}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.txCount}</div>
                <div className="font-bold text-sm text-white/90 font-mono">{monthlyCount.toLocaleString()}{lang === "ja" ? "件" : ""}</div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.perTx}</div>
                <div className="font-bold text-sm text-white/90 font-mono">{fmtJPY(monthlyFeePerTx)}</div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-violet-200 text-xs mb-1.5">{t.effectiveRate}</div>
                <div className="font-bold text-sm text-cyan-400 font-mono">{fmtRate(monthlyEffectiveRate)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 振込手数料 ===== */}
      {activeTab === "payout" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.payoutFeeTitle}</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.payoutType}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPayoutType("auto")}
                    className={`method-btn p-4 rounded-xl border text-left transition-all duration-200 ${
                      payoutType === "auto"
                        ? "method-btn-active border-violet-500/60"
                        : "border-white/8 hover:border-violet-500/30"
                    }`}
                  >
                    <div className={`font-semibold mb-1.5 text-sm ${payoutType === "auto" ? "text-violet-100" : "text-white/90"}`}>{t.autoPayout}</div>
                    <div className="text-sm text-emerald-400 font-medium font-mono">{t.autoPayoutFree}</div>
                    <div className="text-xs text-violet-100 mt-1.5">{t.autoPayoutDesc}</div>
                  </button>
                  <button
                    onClick={() => setPayoutType("instant")}
                    className={`method-btn p-4 rounded-xl border text-left transition-all duration-200 ${
                      payoutType === "instant"
                        ? "method-btn-active border-violet-500/60"
                        : "border-white/8 hover:border-violet-500/30"
                    }`}
                  >
                    <div className={`font-semibold mb-1.5 text-sm ${payoutType === "instant" ? "text-violet-100" : "text-white/90"}`}>{t.instantPayout}</div>
                    <div className="text-sm text-amber-400 font-medium font-mono">{t.instantPayoutFee}</div>
                    <div className="text-xs text-violet-100 mt-1.5">{t.instantPayoutDesc}</div>
                  </button>
                </div>
              </div>

              {payoutType === "instant" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.payoutAmount}</label>
                    <div className="flex items-center gap-3">
                      <span className="text-violet-400 text-lg font-light">¥</span>
                      <input
                        type="number"
                        min={500}
                        step={1000}
                        value={payoutNetAmount}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v) && v >= 0) setPayoutNetAmount(v);
                        }}
                        className="number-input w-44 px-4 py-2.5 rounded-xl text-base font-mono neon-focus"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.monthlyPayoutCount}</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={1}
                        max={30}
                        step={1}
                        value={payoutCount}
                        onChange={(e) => setPayoutCount(Number(e.target.value))}
                        className="flex-1 cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={payoutCount}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (!isNaN(v) && v > 0) setPayoutCount(Math.min(v, 30));
                          }}
                          className="number-input w-20 px-3 py-2 text-right rounded-xl text-sm font-mono neon-focus"
                        />
                        <span className="text-xs text-violet-200 whitespace-nowrap">{t.timesPerMonth}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 振込結果 */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.payoutFeeResult}</div>

            {payoutType === "auto" ? (
              <div>
                <div className="text-xs text-violet-200 mb-2">{t.monthlyPayoutFee}</div>
                <div className="text-5xl font-bold text-emerald-400 glow-text tracking-tight">¥0</div>
                <div className="text-violet-200 text-sm mt-4 glass-card rounded-xl px-4 py-2.5">{t.autoPayoutNote}</div>
              </div>
            ) : (
              <div>
                <div className="text-xs text-violet-200 mb-2">{t.monthlyPayoutFeeTotal}</div>
                <div className="text-5xl font-bold text-red-400 glow-text tracking-tight">{fmtJPY(payoutFee)}</div>
                <div className="mt-5 glass-card rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between text-violet-100">
                    <span>{t.rateFee} ({fmtJPY(payoutNetAmount)} × 0.5%)</span>
                    <span className="font-mono text-white/90">{fmtJPY(payoutNetAmount * INSTANT_PAYOUT_RATE)}</span>
                  </div>
                  <div className="flex justify-between text-violet-100">
                    <span>{t.fixedFee} (¥250 × {payoutCount}{lang === "ja" ? "回" : "x"})</span>
                    <span className="font-mono text-white/90">{fmtJPY(INSTANT_PAYOUT_FIXED * payoutCount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 mt-1 font-semibold text-white/90">
                    <span>{t.total}</span>
                    <span className="font-mono">{fmtJPY(payoutFee)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 他社比較 ===== */}
      {activeTab === "compare" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.compareTitle}</h2>
            <p className="text-xs text-violet-100 mb-5">{t.compareSubtitle}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.service}</th>
                    <th className="text-left py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.cardRate}</th>
                    <th className="text-left py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.convenience}</th>
                    <th className="text-left py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.monthlyFeeHeader}</th>
                    <th className="text-left py-2.5 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.notes}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((row, i) => (
                    <tr
                      key={row.name}
                      className={`border-b border-white/5 table-row-stripe ${
                        i === 0 ? "bg-violet-500/10" : ""
                      }`}
                    >
                      <td className="py-3.5 pr-4">
                        <span
                          className={`font-semibold text-sm ${
                            i === 0 ? "text-violet-200" : "text-white/90"
                          }`}
                        >
                          {row.name}
                          {i === 0 && (
                            <span className="ml-2 text-xs font-normal text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full">{t.thisTool}</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-white/90 text-sm font-mono">{row.cardRate}</td>
                      <td className="py-3.5 pr-4 text-white/90 text-sm font-mono">{row.convenienceRate}</td>
                      <td className="py-3.5 pr-4 text-white/90 text-sm font-mono">{row.monthlyFee}</td>
                      <td className="py-3.5 text-violet-200 text-xs">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-violet-200 mt-4">
              {t.compareNote}
            </p>
          </div>

          {/* ポイント解説 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.stripeAdvantage}</h2>
            <div className="space-y-3.5">
              {t.advantages.map((item) => (
                <div key={item.title} className="flex gap-3.5 glass-card rounded-xl p-3.5 hover:border-violet-500/20 transition-all border border-transparent">
                  <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                  <div>
                    <div className="font-medium text-white/90 text-sm">{item.title}</div>
                    <div className="text-xs text-violet-200 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== 転嫁計算 ===== */}
      {activeTab === "surcharge" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-1">{t.surchargeTitle}</h2>
            <p className="text-xs text-violet-100 mb-5">
              {t.surchargeSubtitle}
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.desiredIncome}</label>
                <div className="flex items-center gap-3">
                  <span className="text-violet-400 text-lg font-light">¥</span>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={surchargeAmount}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= 0) setSurchargeAmount(v);
                    }}
                    className="number-input w-44 px-4 py-2.5 rounded-xl text-base font-mono neon-focus"
                  />
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[1000, 3000, 5000, 10000, 30000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSurchargeAmount(preset)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-mono ${
                        surchargeAmount === preset
                          ? "preset-active"
                          : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
                      }`}
                    >
                      ¥{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.paymentMethod}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSurchargeMethod(m.id)}
                      className={`method-btn flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                        surchargeMethod === m.id
                          ? "method-btn-active border-violet-500/60"
                          : "border-white/8 hover:border-violet-500/30"
                      }`}
                    >
                      <span className="text-lg leading-none">{m.icon}</span>
                      <div className={`font-medium text-xs ${surchargeMethod === m.id ? "text-violet-100" : "text-white/90"}`}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 転嫁結果 */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.surchargeResult}</div>

            <div className="mb-6">
              <div className="text-xs text-violet-200 mb-2">{t.billingPrice}</div>
              <div className="text-5xl font-bold text-white glow-text tracking-tight">{fmtJPY(surchargePriceNeeded)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass-card rounded-xl p-3.5">
                <div className="text-violet-200 text-xs mb-1.5">{t.surchargeAmount}</div>
                <div className="font-bold text-xl text-amber-400 font-mono">{fmtJPY(surchargeAddAmount)}</div>
              </div>
              <div className="glass-card rounded-xl p-3.5">
                <div className="text-violet-200 text-xs mb-1.5">{t.surchargeRate}</div>
                <div className="font-bold text-xl text-cyan-400 font-mono">{fmtRate(surchargeAddRate)}</div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-violet-100">
                <span>{t.desiredIncomeLabel}</span>
                <span className="font-mono text-white/90">{fmtJPY(surchargeAmount)}</span>
              </div>
              <div className="flex justify-between text-violet-100">
                <span>{t.stripeFee}</span>
                <span className="font-mono text-white/90">{fmtJPY(surchargeAddAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 mt-1 font-semibold text-white/90">
                <span>{t.billingPriceLabel}</span>
                <span className="font-mono">{fmtJPY(surchargePriceNeeded)}</span>
              </div>
            </div>

            <p className="text-violet-100 text-xs mt-4">
              {t.surchargeNote}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-violet-200 text-center pb-2">
        {t.feeNote}
      </p>

      {/* ===== 使い方ガイド ===== */}
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

      {/* ===== FAQ ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-white/90 text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
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
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Stripe の手数料は日本でいくら？",
                "acceptedAnswer": { "@type": "Answer", "text": "国内発行カードは 3.6%、コンビニ決済は 3.6%（¥190 上限）、銀行振込は ¥190/件です。月額固定費は不要です。" },
              },
              {
                "@type": "Question",
                "name": "Stripe でコンビニ決済を使うメリットは？",
                "acceptedAnswer": { "@type": "Answer", "text": "¥5,278 以上の決済では手数料が ¥190 の上限に固定されるため、高額商品ではカード決済より実質手数料率が低くなります。" },
              },
              {
                "@type": "Question",
                "name": "Stripe の振込手数料は？",
                "acceptedAnswer": { "@type": "Answer", "text": "自動振込は無料です。即時振込は 0.5% + ¥250/回かかります。" },
              },
              {
                "@type": "Question",
                "name": "Stripe の手数料を顧客に転嫁できる？",
                "acceptedAnswer": { "@type": "Answer", "text": "Stripe の利用規約およびカードブランドルールを事前に確認してください。転嫁計算タブで必要な上乗せ金額を計算できます。" },
              },
            ],
          }),
        }}
      />

      {/* ===== 関連ツール ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200 group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm group-hover:text-violet-100 transition-colors">{link.title}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Stripe 手数料計算",
  "description": "Stripeの決済手数料を決済方法別に計算。売上から手数料を引いた実収入を即座に確認",
  "url": "https://tools.loresync.dev/stripe-fee-calculator",
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
