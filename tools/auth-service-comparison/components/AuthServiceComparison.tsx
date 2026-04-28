"use client";
import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

type ServiceName = "Auth0" | "Clerk" | "Supabase Auth" | "Firebase Auth" | "Cognito";

interface Plan {
  name: string;
  baseUSD: number; // monthly base price
  includedMAU: number; // MAU included in base price
  overagePerMAU: number | null; // USD per MAU over included (null = contact)
  isEnterprise: boolean;
}

interface FeatureSupport {
  sso: boolean | "paid"; // true=included, false=no, "paid"=extra cost
  mfa: boolean | "paid";
  rbac: boolean | "paid";
  socialLogin: boolean | "paid";
  webhook: boolean | "paid";
  customDomain: boolean | "paid";
}

interface Service {
  name: ServiceName;
  company: string;
  plans: Plan[];
  features: FeatureSupport;
  notes: string;
  brandColor: string;
  badgeBg: string;
  badgeText: string;
  rowHover: string;
  accentGradient: string;
}

// ---------------------------------------------------------------------------
// Service data (2026 estimates)
// ---------------------------------------------------------------------------

const SERVICES: Service[] = [
  {
    name: "Auth0",
    company: "Okta",
    plans: [
      { name: "Free", baseUSD: 0, includedMAU: 25000, overagePerMAU: null, isEnterprise: false },
      { name: "Essentials", baseUSD: 35, includedMAU: 500, overagePerMAU: 0.07, isEnterprise: false },
      { name: "Professional", baseUSD: 240, includedMAU: 1000, overagePerMAU: 0.07, isEnterprise: false },
      { name: "Enterprise", baseUSD: 0, includedMAU: 0, overagePerMAU: null, isEnterprise: true },
    ],
    features: {
      sso: "paid",
      mfa: "paid",
      rbac: "paid",
      socialLogin: true,
      webhook: "paid",
      customDomain: "paid",
    },
    notes: "エンタープライズ向け機能が豊富。SSO・RBACはProfessional以上",
    brandColor: "from-orange-400 to-red-500",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    rowHover: "hover:bg-orange-50/40",
    accentGradient: "from-orange-400 to-red-500",
  },
  {
    name: "Clerk",
    company: "Clerk Inc.",
    plans: [
      { name: "Free", baseUSD: 0, includedMAU: 10000, overagePerMAU: null, isEnterprise: false },
      { name: "Pro", baseUSD: 25, includedMAU: 10000, overagePerMAU: 0.02, isEnterprise: false },
      { name: "Enterprise", baseUSD: 0, includedMAU: 0, overagePerMAU: null, isEnterprise: true },
    ],
    features: {
      sso: "paid",
      mfa: true,
      rbac: "paid",
      socialLogin: true,
      webhook: true,
      customDomain: "paid",
    },
    notes: "Next.js・React向けDX最優秀。UIコンポーネント同梱",
    brandColor: "from-violet-400 to-purple-500",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-800",
    rowHover: "hover:bg-violet-50/40",
    accentGradient: "from-violet-400 to-purple-500",
  },
  {
    name: "Supabase Auth",
    company: "Supabase",
    plans: [
      { name: "Free", baseUSD: 0, includedMAU: 50000, overagePerMAU: null, isEnterprise: false },
      { name: "Pro", baseUSD: 25, includedMAU: 100000, overagePerMAU: 0.00325, isEnterprise: false },
      { name: "Team", baseUSD: 599, includedMAU: 100000, overagePerMAU: 0.00325, isEnterprise: false },
    ],
    features: {
      sso: "paid",
      mfa: true,
      rbac: false,
      socialLogin: true,
      webhook: true,
      customDomain: "paid",
    },
    notes: "無料MAU枠が最大。Supabase DB/Storage込みで最安クラス",
    brandColor: "from-emerald-400 to-teal-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    rowHover: "hover:bg-emerald-50/40",
    accentGradient: "from-emerald-400 to-teal-500",
  },
  {
    name: "Firebase Auth",
    company: "Google",
    plans: [
      { name: "Spark (無料)", baseUSD: 0, includedMAU: 999999999, overagePerMAU: null, isEnterprise: false },
      { name: "Blaze (従量)", baseUSD: 0, includedMAU: 999999999, overagePerMAU: 0, isEnterprise: false },
    ],
    features: {
      sso: "paid",
      mfa: true,
      rbac: false,
      socialLogin: true,
      webhook: false,
      customDomain: false,
    },
    notes: "メール/Google認証は実質無制限無料。電話認証・SAMLは別途課金",
    brandColor: "from-yellow-400 to-amber-500",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
    rowHover: "hover:bg-yellow-50/40",
    accentGradient: "from-yellow-400 to-amber-500",
  },
  {
    name: "Cognito",
    company: "Amazon",
    plans: [
      { name: "Free Tier", baseUSD: 0, includedMAU: 50000, overagePerMAU: null, isEnterprise: false },
      { name: "従量課金", baseUSD: 0, includedMAU: 50000, overagePerMAU: 0.0055, isEnterprise: false },
    ],
    features: {
      sso: "paid",
      mfa: true,
      rbac: false,
      socialLogin: true,
      webhook: false,
      customDomain: true,
    },
    notes: "AWS統合で最強。SAML/OIDC($0.015/MAU)は別途課金",
    brandColor: "from-sky-400 to-blue-500",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-800",
    rowHover: "hover:bg-sky-50/40",
    accentGradient: "from-sky-400 to-blue-500",
  },
];

// ---------------------------------------------------------------------------
// Use case recommendations
// ---------------------------------------------------------------------------

const USE_CASES_JA = [
  {
    label: "個人開発",
    icon: "🧑‍💻",
    services: ["Supabase Auth", "Firebase Auth"] as ServiceName[],
    desc: "無料MAU枠が最大。フルスタック構築が容易",
  },
  {
    label: "スタートアップ",
    icon: "🚀",
    services: ["Clerk", "Supabase Auth"] as ServiceName[],
    desc: "DX重視・低コスト・Next.js対応",
  },
  {
    label: "エンタープライズ",
    icon: "🏢",
    services: ["Auth0", "Cognito"] as ServiceName[],
    desc: "SSO/SAML・RBAC・監査ログ・コンプライアンス対応",
  },
  {
    label: "AWS環境",
    icon: "☁️",
    services: ["Cognito"] as ServiceName[],
    desc: "IAM統合・Lambda・API Gateway連携が最強",
  },
];

const USE_CASES_EN = [
  {
    label: "Personal / Indie",
    icon: "🧑‍💻",
    services: ["Supabase Auth", "Firebase Auth"] as ServiceName[],
    desc: "Largest free MAU quota. Easy full-stack setup.",
  },
  {
    label: "Startup",
    icon: "🚀",
    services: ["Clerk", "Supabase Auth"] as ServiceName[],
    desc: "DX-first, low cost, Next.js-friendly.",
  },
  {
    label: "Enterprise",
    icon: "🏢",
    services: ["Auth0", "Cognito"] as ServiceName[],
    desc: "SSO/SAML, RBAC, audit logs, compliance.",
  },
  {
    label: "AWS Stack",
    icon: "☁️",
    services: ["Cognito"] as ServiceName[],
    desc: "Best IAM, Lambda & API Gateway integration.",
  },
];

// ---------------------------------------------------------------------------
// Feature matrix labels
// ---------------------------------------------------------------------------

const FEATURE_LABELS_JA: { key: keyof FeatureSupport; label: string }[] = [
  { key: "sso", label: "SSO / SAML" },
  { key: "mfa", label: "MFA" },
  { key: "rbac", label: "RBAC" },
  { key: "socialLogin", label: "Social Login" },
  { key: "webhook", label: "Webhook" },
  { key: "customDomain", label: "カスタムドメイン" },
];

const FEATURE_LABELS_EN: { key: keyof FeatureSupport; label: string }[] = [
  { key: "sso", label: "SSO / SAML" },
  { key: "mfa", label: "MFA" },
  { key: "rbac", label: "RBAC" },
  { key: "socialLogin", label: "Social Login" },
  { key: "webhook", label: "Webhook" },
  { key: "customDomain", label: "Custom Domain" },
];

// ---------------------------------------------------------------------------
// Translation constants
// ---------------------------------------------------------------------------

type Lang = "ja" | "en";

const T = {
  ja: {
    // Tabs
    simulator: "MAUシミュレーター",
    plans: "全プラン比較",
    features: "機能比較",
    chart: "MAU帯グラフ",
    // Section headings
    useCasesTitle: "用途別おすすめ",
    fxRateLabel: "為替レート (円/ドル)",
    fxRateNote: (rate: number) => `$1 = ¥${rate}`,
    mauInputTitle: "月間アクティブユーザー数 (MAU) を入力",
    mauUnit: "MAU",
    chartDesc: "MAU帯ごとの最安月額コスト比較（CSSバー表示）",
    chartNote: "※ Enterpriseプランは除外。Firebase AuthはメールOAuth認証の料金。Cognito無料枠は12ヶ月間限定。",
    plansNote: "※ 料金は2026年概算。為替レートは設定値を使用。",
    simNote: "※ Firebase AuthはメールおよびOAuth認証が実質無制限無料。電話認証・SAMLは追加課金。",
    legendNote: "料金は2026年概算。実際の料金は各サービスの公式サイトをご確認ください。",
    // Table headers
    rank: "順位",
    service: "サービス",
    plan: "プラン",
    monthlyUSD: "月額 (USD)",
    monthlyJPY: "月額 (JPY)",
    notes: "備考",
    planName: "プラン",
    includedMAU: "含まれるMAU",
    overageRate: "超過単価",
    feature: "機能",
    // Values
    free: "無料",
    unlimited: "無制限",
    contactSales: "要問合せ",
    overLimit: "上限超",
    includedOrLimited: "含む or 制限",
    usageBased: "従量(別途)",
    // Feature legend
    featureFreeLabel: "無料で利用可",
    featurePaidLabel: "上位プランまたは追加費用",
    featureNoneLabel: "非対応",
    featurePaidText: "有料",
    // Guide
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "MAU を入力", desc: "月間アクティブユーザー数（MAU）を入力するか、プリセットボタンで選択します。MAU とはログインしたユニークユーザーの月間数です。" },
      { step: "2", title: "コスト比較を確認", desc: "「MAUシミュレーター」タブで各サービスの月額コストを安い順に表示します。為替レートを変更して円換算も確認できます。" },
      { step: "3", title: "機能要件を確認", desc: "「機能比較」タブで SSO・MFA・RBAC などの機能対応状況を確認します。エンタープライズ要件には Auth0・Cognito が強いです。" },
      { step: "4", title: "用途別おすすめを参考に", desc: "個人開発・スタートアップ・エンタープライズ・AWS 環境など、用途に合ったサービスを選びましょう。" },
    ],
    // FAQ
    faqTitle: "よくある質問（FAQ）",
    faq: [
      {
        q: "Auth0 の料金は？無料プランはある？",
        a: "Auth0 の無料プランは MAU 25,000 まで使えます。Essentials プランは月 $35 から、Professional は月 $240 からです。SSO・RBAC などエンタープライズ機能は Professional 以上が必要です。",
      },
      {
        q: "Clerk の料金は？Next.js との相性は？",
        a: "Clerk の無料プランは MAU 10,000 まで。Pro プランは月 $25 で 10,000 MAU 含み、超過は $0.02/MAU です。Next.js・React との統合に特化した UI コンポーネントが同梱されており、開発体験が非常に優れています。",
      },
      {
        q: "個人開発に最適な認証サービスはどれ？",
        a: "Supabase Auth（無料で 50,000 MAU）または Firebase Auth（メール・Google 認証は実質無制限無料）が最もコストパフォーマンスに優れています。どちらも BaaS として DB・Storage と一体で使えます。",
      },
      {
        q: "Auth0 と Clerk の違いは？",
        a: "Auth0 は歴史が長くエンタープライズ実績が豊富で、複雑なルールエンジン・監査ログ・コンプライアンス対応が強みです。Clerk は Next.js・React 向けの DX に優れ、組み込み UI コンポーネントで実装が高速です。スタートアップには Clerk、大企業には Auth0 が向いています。",
      },
      {
        q: "Cognito は MAU 課金？",
        a: "AWS Cognito は最初の 50,000 MAU が無料（12 ヶ月間）、超過は $0.0055/MAU です。SAML/OIDC 連携は $0.015/MAU の追加費用が発生します。AWS の他サービスとの統合が最強です。",
      },
    ],
    // Related tools
    relatedTitle: "関連ツール",
    relatedLinks: [
      { href: "/firebase-pricing", title: "Firebase 料金計算", desc: "Firestore・Storage・Functions など Firebase サービスの月額コストを試算。" },
      { href: "/supabase-pricing", title: "Supabase 料金計算", desc: "Supabase の Auth・DB・Storage を含む月額コストを計算。" },
    ],
    // MAU tier label
    mauTierLabel: (tier: number) => `MAU: ${tier >= 1000 ? `${(tier / 1000).toLocaleString()}K` : tier.toLocaleString()}`,
  },
  en: {
    // Tabs
    simulator: "MAU Simulator",
    plans: "All Plans",
    features: "Features",
    chart: "MAU Chart",
    // Section headings
    useCasesTitle: "Recommended by Use Case",
    fxRateLabel: "Exchange Rate (JPY/USD)",
    fxRateNote: (rate: number) => `$1 = ¥${rate}`,
    mauInputTitle: "Enter Monthly Active Users (MAU)",
    mauUnit: "MAU",
    chartDesc: "Cheapest monthly cost by MAU tier (CSS bar chart)",
    chartNote: "* Enterprise plans excluded. Firebase Auth price for email/OAuth auth. Cognito free tier valid for 12 months.",
    plansNote: "* Prices are 2026 estimates. Exchange rate from your setting above.",
    simNote: "* Firebase Auth email & OAuth auth is effectively unlimited free. Phone auth & SAML are extra.",
    legendNote: "Prices are 2026 estimates. Check each service's official site for current rates.",
    // Table headers
    rank: "Rank",
    service: "Service",
    plan: "Plan",
    monthlyUSD: "Monthly (USD)",
    monthlyJPY: "Monthly (JPY)",
    notes: "Notes",
    planName: "Plan",
    includedMAU: "Included MAU",
    overageRate: "Overage Rate",
    feature: "Feature",
    // Values
    free: "Free",
    unlimited: "Unlimited",
    contactSales: "Contact",
    overLimit: "Over limit",
    includedOrLimited: "Included / limited",
    usageBased: "Usage-based",
    // Feature legend
    featureFreeLabel: "Free to use",
    featurePaidLabel: "Higher plan or extra cost",
    featureNoneLabel: "Not supported",
    featurePaidText: "Paid",
    // Guide
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Enter MAU", desc: "Type your monthly active user count or click a preset button. MAU = unique users who logged in during the month." },
      { step: "2", title: "Check Cost Comparison", desc: "The 'MAU Simulator' tab shows monthly costs sorted cheapest first. Adjust the FX rate to see JPY equivalents." },
      { step: "3", title: "Check Feature Requirements", desc: "Use the 'Features' tab to verify SSO, MFA, RBAC support. Auth0 and Cognito are strongest for enterprise needs." },
      { step: "4", title: "Use the Recommendations", desc: "Pick the right service for your use case: indie dev, startup, enterprise, or AWS-native stack." },
    ],
    // FAQ
    faqTitle: "FAQ",
    faq: [
      {
        q: "How much does Auth0 cost? Is there a free plan?",
        a: "Auth0's free plan covers up to 25,000 MAU. Essentials starts at $35/mo, Professional at $240/mo. Enterprise features like SSO and RBAC require Professional or above.",
      },
      {
        q: "How much does Clerk cost? Is it good with Next.js?",
        a: "Clerk's free plan covers 10,000 MAU. Pro is $25/mo with 10,000 MAU included; overages are $0.02/MAU. Built-in UI components make Next.js/React integration fast.",
      },
      {
        q: "Which auth service is best for indie dev?",
        a: "Supabase Auth (50,000 MAU free) or Firebase Auth (email & Google auth effectively unlimited free) offer the best cost-efficiency. Both work as full BaaS with DB and Storage.",
      },
      {
        q: "What is the difference between Auth0 and Clerk?",
        a: "Auth0 has deep enterprise pedigree with rule engines, audit logs, and compliance. Clerk excels at DX for Next.js/React with embedded UI components. Choose Clerk for startups, Auth0 for large orgs.",
      },
      {
        q: "How does Cognito charge per MAU?",
        a: "AWS Cognito is free for the first 50,000 MAU (first 12 months), then $0.0055/MAU. SAML/OIDC federation costs an extra $0.015/MAU. Best-in-class AWS service integration.",
      },
    ],
    // Related tools
    relatedTitle: "Related Tools",
    relatedLinks: [
      { href: "/firebase-pricing", title: "Firebase Pricing Calculator", desc: "Estimate monthly costs for Firestore, Storage, Functions and more." },
      { href: "/supabase-pricing", title: "Supabase Pricing Calculator", desc: "Calculate monthly costs for Supabase Auth, DB, and Storage." },
    ],
    // MAU tier label
    mauTierLabel: (tier: number) => `MAU: ${tier >= 1000 ? `${(tier / 1000).toLocaleString()}K` : tier.toLocaleString()}`,
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtUSD(n: number) {
  return n === 0 ? "$0" : `$${n % 1 === 0 ? n : n.toFixed(4)}`;
}

function fmtJPY(usd: number, rate: number) {
  const jpy = Math.round(usd * rate);
  return `¥${jpy.toLocaleString()}`;
}

/** Calculate monthly cost for given MAU */
function calcMonthlyCost(plan: Plan, mau: number): number | null {
  if (plan.isEnterprise) return null;
  // Firebase/Cognito free tiers: unlimited MAU effectively
  if (plan.includedMAU >= 999999999) return plan.baseUSD;
  if (mau <= plan.includedMAU) return plan.baseUSD;
  if (plan.overagePerMAU === null) return null; // contact sales
  return plan.baseUSD + (mau - plan.includedMAU) * plan.overagePerMAU;
}

/** Find cheapest applicable plan for a given MAU */
function bestPlan(service: Service, mau: number): { plan: Plan; costUSD: number } | null {
  let best: { plan: Plan; costUSD: number } | null = null;
  for (const plan of service.plans) {
    if (plan.isEnterprise) continue;
    const cost = calcMonthlyCost(plan, mau);
    if (cost === null) continue;
    if (best === null || cost < best.costUSD) {
      best = { plan, costUSD: cost };
    }
  }
  return best;
}

function FeatureBadge({ value, paidText }: { value: boolean | "paid"; paidText: string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
        ✓
      </span>
    );
  }
  if (value === "paid") {
    return (
      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        {paidText}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-white/30 text-xs font-bold border border-white/10">
      —
    </span>
  );
}

function ServiceBadge({ service }: { service: Service }) {
  // Map light badge colors to dark-theme equivalents
  const darkBg: Record<string, string> = {
    "bg-orange-100": "bg-orange-500/20",
    "bg-violet-100": "bg-violet-500/20",
    "bg-emerald-100": "bg-emerald-500/20",
    "bg-yellow-100": "bg-yellow-500/20",
    "bg-sky-100": "bg-sky-500/20",
  };
  const darkText: Record<string, string> = {
    "text-orange-800": "text-orange-300",
    "text-violet-800": "text-violet-300",
    "text-emerald-800": "text-emerald-300",
    "text-yellow-800": "text-yellow-300",
    "text-sky-800": "text-sky-300",
  };
  const bg = darkBg[service.badgeBg] ?? "bg-white/10";
  const text = darkText[service.badgeText] ?? "text-white";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border border-white/10 ${bg} ${text}`}>
      {service.name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Bar chart helpers
// ---------------------------------------------------------------------------

const MAU_TIERS = [1000, 5000, 10000, 25000, 50000, 100000, 200000, 500000];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AuthServiceComparison() {
  const [fxRate, setFxRate] = useState(150);
  const [mauInput, setMauInput] = useState("10000");
  const [activeTab, setActiveTab] = useState<"simulator" | "plans" | "features" | "chart">("simulator");
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];
  const USE_CASES = lang === "ja" ? USE_CASES_JA : USE_CASES_EN;
  const FEATURE_LABELS = lang === "ja" ? FEATURE_LABELS_JA : FEATURE_LABELS_EN;

  const mau = Math.max(0, parseInt(mauInput) || 0);

  // Best plan per service for current MAU
  const simResults = useMemo(() => {
    return SERVICES.map((svc) => {
      const result = bestPlan(svc, mau);
      return { service: svc, ...result };
    }).sort((a, b) => {
      if (a.costUSD === undefined || a.costUSD === null) return 1;
      if (b.costUSD === undefined || b.costUSD === null) return -1;
      return (a.costUSD ?? Infinity) - (b.costUSD ?? Infinity);
    });
  }, [mau]);

  // Chart data: cost per MAU tier
  const chartData = useMemo(() => {
    return MAU_TIERS.map((tier) => {
      const costs = SERVICES.map((svc) => {
        const r = bestPlan(svc, tier);
        return { service: svc, costUSD: r?.costUSD ?? null };
      });
      const maxCost = Math.max(...costs.map((c) => c.costUSD ?? 0));
      return { tier, costs, maxCost };
    });
  }, []);

  const cheapestIdx = simResults.findIndex((r) => r.costUSD !== null && r.costUSD !== undefined);

  const TABS: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: "simulator", label: t.simulator, icon: "◎" },
    { id: "plans", label: t.plans, icon: "⊞" },
    { id: "features", label: t.features, icon: "✦" },
    { id: "chart", label: t.chart, icon: "∿" },
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
        .use-case-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .use-case-card:hover {
          background: rgba(139,92,246,0.08);
          border-color: rgba(167,139,250,0.3);
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

      {/* 用途別おすすめ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.useCasesTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className="use-case-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{uc.icon}</span>
                <span className="font-semibold text-white text-sm">{uc.label}</span>
              </div>
              <p className="text-xs text-violet-200 mb-3">{uc.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {uc.services.map((s) => {
                  const svc = SERVICES.find((sv) => sv.name === s)!;
                  return <ServiceBadge key={s} service={svc} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 為替レート */}
      <div className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-violet-100 whitespace-nowrap">{t.fxRateLabel}</label>
        <input
          type="number"
          value={fxRate}
          onChange={(e) => setFxRate(Number(e.target.value))}
          className="number-input w-28 px-3 py-1.5 rounded-xl text-sm font-mono neon-focus transition-all"
        />
        <span className="text-xs text-violet-300 font-mono">{t.fxRateNote(fxRate)}</span>
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

      {/* ---- MAUシミュレーター ---- */}
      {activeTab === "simulator" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.mauInputTitle}</h3>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <input
                type="number"
                value={mauInput}
                onChange={(e) => setMauInput(e.target.value)}
                placeholder="例: 10000"
                className="number-input w-48 px-3 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
              />
              <span className="text-sm text-violet-200">{t.mauUnit}</span>
              <div className="flex gap-1.5 flex-wrap">
                {[1000, 5000, 10000, 50000, 100000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setMauInput(String(v))}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-mono ${
                      mau === v
                        ? "preset-active"
                        : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
                    }`}
                  >
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.rank}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.service}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.planName}</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.monthlyUSD}</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.monthlyJPY}</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.notes}</th>
                  </tr>
                </thead>
                <tbody>
                  {simResults.map((r, i) => {
                    const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                    const isEnterprise = r.plan?.isEnterprise ?? false;
                    const costUSD = r.costUSD ?? null;
                    return (
                      <tr
                        key={r.service.name}
                        className={`border-b border-white/5 table-row-stripe ${i === cheapestIdx ? "bg-violet-500/10" : ""}`}
                      >
                        <td className="px-3 py-3 text-sm text-violet-200 font-mono">{rank}</td>
                        <td className="px-3 py-3 text-sm">
                          <ServiceBadge service={r.service} />
                        </td>
                        <td className="px-3 py-3 text-sm text-white/80">
                          {r.plan?.name ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-sm text-right font-mono font-semibold">
                          {isEnterprise ? (
                            <span className="text-violet-300 text-xs">{t.contactSales}</span>
                          ) : costUSD === null ? (
                            <span className="text-violet-300 text-xs">{t.overLimit}</span>
                          ) : (
                            <span className={i === cheapestIdx ? "text-cyan-300" : "text-white/90"}>
                              {costUSD === 0 ? t.free : `$${costUSD % 1 === 0 ? costUSD : costUSD.toFixed(2)}`}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-right font-mono text-violet-200">
                          {!isEnterprise && costUSD !== null && costUSD > 0
                            ? fmtJPY(costUSD, fxRate)
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-violet-200 max-w-xs truncate">
                          {r.service.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-violet-300 mt-3">{t.simNote}</p>
          </div>
        </div>
      )}

      {/* ---- 全プラン比較 ---- */}
      {activeTab === "plans" && (
        <div className="tab-panel">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.service}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.planName}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.monthlyUSD}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.monthlyJPY}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.includedMAU}</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.overageRate}</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICES.flatMap((svc) =>
                    svc.plans.map((plan, pi) => (
                      <tr key={`${svc.name}-${plan.name}`} className="border-b border-white/5 table-row-stripe">
                        <td className="px-3 py-3 text-sm font-semibold whitespace-nowrap">
                          {pi === 0 ? <ServiceBadge service={svc} /> : ""}
                        </td>
                        <td className="px-3 py-3 text-sm text-white/80 whitespace-nowrap">
                          {plan.isEnterprise ? (
                            <span className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              Enterprise
                            </span>
                          ) : (
                            plan.name
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                          <span className="font-mono font-semibold text-white/90">
                            {plan.isEnterprise ? t.contactSales : plan.baseUSD === 0 ? t.free : `$${plan.baseUSD}`}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                          <span className="font-mono text-violet-200">
                            {plan.isEnterprise || plan.baseUSD === 0
                              ? "—"
                              : fmtJPY(plan.baseUSD, fxRate)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                          {plan.isEnterprise ? "—" : plan.includedMAU >= 999999999 ? (
                            <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                              {t.unlimited}
                            </span>
                          ) : (
                            <span className="font-mono text-white/80">{plan.includedMAU.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm whitespace-nowrap">
                          {plan.isEnterprise ? "—" : plan.overagePerMAU === null ? (
                            <span className="text-violet-300 text-xs">{t.includedOrLimited}</span>
                          ) : plan.overagePerMAU === 0 ? (
                            <span className="text-violet-300 text-xs">{t.usageBased}</span>
                          ) : (
                            <span className="font-mono text-cyan-300">${plan.overagePerMAU}/MAU</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-violet-300 px-4 py-3">{t.plansNote}</p>
          </div>
        </div>
      )}

      {/* ---- 機能比較 ---- */}
      {activeTab === "features" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.feature}</th>
                    {SERVICES.map((svc) => (
                      <th key={svc.name} className="px-3 py-3 text-center text-xs font-semibold text-violet-200 uppercase tracking-wider whitespace-nowrap">
                        <ServiceBadge service={svc} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_LABELS.map(({ key, label }) => (
                    <tr key={key} className="border-b border-white/5 table-row-stripe">
                      <td className="px-3 py-3 text-sm font-medium text-white/90 whitespace-nowrap">{label}</td>
                      {SERVICES.map((svc) => (
                        <td key={svc.name} className="px-3 py-3 text-center">
                          <FeatureBadge value={svc.features[key]} paidText={t.featurePaidText} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <td className="px-3 py-3 text-sm font-medium text-white/90">{t.notes}</td>
                    {SERVICES.map((svc) => (
                      <td key={svc.name} className="px-3 py-3 text-xs text-violet-200 max-w-[140px]">
                        {svc.notes}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass-card rounded-2xl px-5 py-4 flex gap-5 text-xs text-violet-200 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">✓</span>
              {t.featureFreeLabel}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30">{t.featurePaidText}</span>
              {t.featurePaidLabel}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-white/30 font-bold text-xs border border-white/10">—</span>
              {t.featureNoneLabel}
            </div>
          </div>
        </div>
      )}

      {/* ---- MAU帯グラフ ---- */}
      {activeTab === "chart" && (
        <div className="space-y-4 tab-panel">
          <p className="text-sm text-violet-100">{t.chartDesc}</p>
          {chartData.map(({ tier, costs, maxCost }) => (
            <div key={tier} className="glass-card rounded-2xl p-5">
              <div className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {t.mauTierLabel(tier)}
              </div>
              <div className="space-y-2.5">
                {costs.map(({ service, costUSD }) => {
                  const displayCost = costUSD ?? 0;
                  const barPct = maxCost > 0 ? (displayCost / maxCost) * 100 : 0;
                  return (
                    <div key={service.name} className="flex items-center gap-3">
                      <div className="w-28 shrink-0">
                        <ServiceBadge service={service} />
                      </div>
                      <div className="flex-1 rounded-full h-4 overflow-hidden relative" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${service.accentGradient} transition-all duration-300`}
                          style={{ width: `${Math.max(barPct, costUSD === 0 ? 2 : 0)}%`, opacity: 0.85 }}
                        />
                      </div>
                      <div className="w-32 text-right text-sm font-mono shrink-0">
                        {costUSD === null ? (
                          <span className="text-xs text-violet-300">{t.contactSales}</span>
                        ) : costUSD === 0 ? (
                          <span className="text-emerald-400 font-semibold">{t.free}</span>
                        ) : (
                          <>
                            <span className="font-semibold text-white/90">${costUSD % 1 === 0 ? costUSD : costUSD.toFixed(2)}</span>
                            <span className="text-xs text-violet-300 ml-1">({fmtJPY(costUSD, fxRate)})</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-xs text-violet-300">{t.chartNote}</p>
        </div>
      )}

      {/* 凡例・注記 */}
      <div className="glass-card rounded-2xl px-5 py-4 flex flex-wrap gap-4 text-xs text-violet-200 items-center">
        {SERVICES.map((svc) => (
          <div key={svc.name} className="flex items-center gap-1.5">
            <ServiceBadge service={svc} />
          </div>
        ))}
        <span className="ml-auto text-right text-violet-300">{t.legendNote}</span>
      </div>

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

      {/* ===== JSON-LD FAQPage (Japanese for SEO) ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Auth0 の料金は？無料プランはある？",
                "acceptedAnswer": { "@type": "Answer", "text": "Auth0 の無料プランは MAU 25,000 まで。Essentials は月 $35、Professional は月 $240 から。SSO・RBAC は Professional 以上が必要です。" },
              },
              {
                "@type": "Question",
                "name": "Clerk の料金は？",
                "acceptedAnswer": { "@type": "Answer", "text": "Clerk の無料プランは MAU 10,000 まで。Pro は月 $25 で超過 $0.02/MAU。Next.js・React との統合に特化しています。" },
              },
              {
                "@type": "Question",
                "name": "個人開発に最適な認証サービスはどれ？",
                "acceptedAnswer": { "@type": "Answer", "text": "Supabase Auth（無料 50,000 MAU）または Firebase Auth（メール・Google 認証は実質無制限無料）がコスパ最良です。" },
              },
              {
                "@type": "Question",
                "name": "Auth0 と Clerk の違いは？",
                "acceptedAnswer": { "@type": "Answer", "text": "Auth0 はエンタープライズ実績が豊富。Clerk は Next.js 向け DX に優れ実装が高速。スタートアップには Clerk、大企業には Auth0 が向いています。" },
              },
            ],
          }),
        }}
      />

      {/* ===== 関連ツール ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
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
    </div>
  );
}
