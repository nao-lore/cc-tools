"use client";
import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

type ServiceName = "Sora" | "Runway" | "Pika" | "Kling" | "Luma";

interface Plan {
  name: string;
  priceUSD: number; // per month
  credits: number | null; // null = unlimited
  creditUnit: string; // "クレジット" | "回"
  isUnlimited: boolean;
}

interface Service {
  name: ServiceName;
  company: string;
  maxResolution: string;
  maxDurationSec: number;
  secPerCredit: number; // seconds of video per 1 credit (at base quality)
  plans: Plan[];
  features: string[];
  brandColor: string; // Tailwind bg class for accent
  badgeBg: string;
  badgeText: string;
  rowHover: string;
}

// ---------------------------------------------------------------------------
// Service data (2026 estimates)
// ---------------------------------------------------------------------------

const SERVICES: Service[] = [
  {
    name: "Sora",
    company: "OpenAI",
    maxResolution: "1080p",
    maxDurationSec: 20,
    secPerCredit: 5, // 720p 5秒 = 1クレジット
    plans: [
      { name: "ChatGPT Plus", priceUSD: 20, credits: 50, creditUnit: "クレジット", isUnlimited: false },
      { name: "ChatGPT Pro", priceUSD: 200, credits: null, creditUnit: "クレジット", isUnlimited: true },
    ],
    features: ["テキスト→動画", "画像→動画", "リミックス"],
    brandColor: "from-green-400 to-emerald-500",
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
    rowHover: "hover:bg-green-50/40",
  },
  {
    name: "Runway",
    company: "Runway AI",
    maxResolution: "1080p",
    maxDurationSec: 10,
    secPerCredit: 0.2, // ~5クレジット/秒
    plans: [
      { name: "Free", priceUSD: 0, credits: 125, creditUnit: "クレジット", isUnlimited: false },
      { name: "Standard", priceUSD: 12, credits: 625, creditUnit: "クレジット", isUnlimited: false },
      { name: "Pro", priceUSD: 28, credits: 2250, creditUnit: "クレジット", isUnlimited: false },
      { name: "Unlimited", priceUSD: 76, credits: null, creditUnit: "クレジット", isUnlimited: true },
    ],
    features: ["Motion Brush", "カメラコントロール", "Act-One"],
    brandColor: "from-blue-400 to-indigo-500",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    rowHover: "hover:bg-blue-50/40",
  },
  {
    name: "Pika",
    company: "Pika Labs",
    maxResolution: "1080p",
    maxDurationSec: 10,
    secPerCredit: 0.15, // ~7クレジット/秒
    plans: [
      { name: "Free", priceUSD: 0, credits: 150, creditUnit: "クレジット", isUnlimited: false },
      { name: "Standard", priceUSD: 8, credits: 700, creditUnit: "クレジット", isUnlimited: false },
      { name: "Pro", priceUSD: 28, credits: 2000, creditUnit: "クレジット", isUnlimited: false },
      { name: "Unlimited", priceUSD: 58, credits: null, creditUnit: "クレジット", isUnlimited: true },
    ],
    features: ["リップシンク", "Sound Effects", "Pikaffects"],
    brandColor: "from-pink-400 to-rose-500",
    badgeBg: "bg-pink-100",
    badgeText: "text-pink-800",
    rowHover: "hover:bg-pink-50/40",
  },
  {
    name: "Kling",
    company: "Kuaishou",
    maxResolution: "1080p",
    maxDurationSec: 10,
    secPerCredit: 0.33, // ~3クレジット/秒
    plans: [
      { name: "Free", priceUSD: 0, credits: 66, creditUnit: "クレジット/日", isUnlimited: false },
      { name: "Standard", priceUSD: 5.99, credits: 660, creditUnit: "クレジット", isUnlimited: false },
      { name: "Pro", priceUSD: 27.99, credits: 3000, creditUnit: "クレジット", isUnlimited: false },
    ],
    features: ["モーションブラシ", "高品質出力", "キャラクター一貫性"],
    brandColor: "from-orange-400 to-amber-500",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    rowHover: "hover:bg-orange-50/40",
  },
  {
    name: "Luma",
    company: "Luma AI",
    maxResolution: "1080p",
    maxDurationSec: 5,
    secPerCredit: 5, // 1回 = 5秒
    plans: [
      { name: "Free", priceUSD: 0, credits: 30, creditUnit: "回/月", isUnlimited: false },
      { name: "Standard", priceUSD: 23.99, credits: 120, creditUnit: "回", isUnlimited: false },
      { name: "Plus", priceUSD: 29.99, credits: 400, creditUnit: "回", isUnlimited: false },
      { name: "Pro", priceUSD: 99.99, credits: 2000, creditUnit: "回", isUnlimited: false },
    ],
    features: ["高速生成", "一貫性", "ループ動画"],
    brandColor: "from-purple-400 to-violet-500",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    rowHover: "hover:bg-purple-50/40",
  },
];

// ---------------------------------------------------------------------------
// Use case recommendations
// ---------------------------------------------------------------------------

const USE_CASES_JA = [
  { label: "SNS用ショート", icon: "📱", services: ["Pika", "Kling"] as ServiceName[], desc: "3〜5秒・音響効果・リップシンク対応" },
  { label: "プロモーション", icon: "🎬", services: ["Runway", "Sora"] as ServiceName[], desc: "カメラコントロール・高解像度・長尺" },
  { label: "プロトタイプ", icon: "⚡", services: ["Luma", "Kling"] as ServiceName[], desc: "高速生成・無料枠が充実" },
  { label: "高品質CM", icon: "🏆", services: ["Sora", "Runway"] as ServiceName[], desc: "1080p・最大20秒・プロ品質" },
];

const USE_CASES_EN = [
  { label: "Social Shorts", icon: "📱", services: ["Pika", "Kling"] as ServiceName[], desc: "3–5 sec · audio effects · lip sync" },
  { label: "Promotion", icon: "🎬", services: ["Runway", "Sora"] as ServiceName[], desc: "Camera control · high-res · long clips" },
  { label: "Prototyping", icon: "⚡", services: ["Luma", "Kling"] as ServiceName[], desc: "Fast generation · generous free tiers" },
  { label: "High-end CM", icon: "🏆", services: ["Sora", "Runway"] as ServiceName[], desc: "1080p · up to 20 sec · pro quality" },
];

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

type Lang = "ja" | "en";

const T = {
  ja: {
    langToggle: "EN",
    // Tabs
    comparison: "料金比較表",
    efficiency: "コスト効率",
    simulator: "シミュレーター",
    free: "無料枠比較",
    // Section headings
    useCaseTitle: "用途別おすすめ",
    fxRateLabel: "為替レート (円/ドル)",
    fxRateNote: (rate: number) => `$1 = ¥${rate}`,
    comparisonNote: "※ 料金は2026年概算。為替レートは設定値を使用。",
    efficiencyDesc: "有料プランの「1秒あたり生成コスト」で横並び比較します。数値が小さいほどコスパ優秀です。",
    simulatorHeading: "月間利用量を入力",
    monthlyVideosLabel: "月間生成本数",
    monthlyVideosPlaceholder: "例: 30",
    avgDurationLabel: "平均尺 (秒)",
    avgDurationPlaceholder: "例: 5",
    simulatorEmpty: "月間生成本数を入力すると最安プランを判定します",
    freeDesc: "登録直後に無料で生成できる量を比較します。",
    soraNoFree: "無料枠なし",
    soraNoFreeDesc: "ChatGPT Plus ($20/月) から利用可能",
    legendNote: "料金は2026年概算。実際の料金は各サービスの公式サイトをご確認ください。",
    guideTitle: "使い方ガイド",
    faqTitle: "よくある質問",
    relatedTitle: "関連ツール",
    // Table headers
    thService: "サービス",
    thPlan: "プラン",
    thMonthlyUSD: "月額 (USD)",
    thMonthlyJPY: "月額 (JPY)",
    thCredits: "クレジット/月",
    thMaxRes: "最大解像度",
    thMaxDur: "最大尺",
    thFeatures: "特徴",
    // Sim table headers
    thRank: "順位",
    thRecommended: "おすすめプラン",
    thMonthlyUSDSim: "月額 (USD)",
    thMonthlyJPYSim: "月額 (JPY)",
    thPerVideo: "1本あたり",
    overLimit: "※上限超",
    // Free tier
    freeTierSecs: (n: number) => `約 ${Math.floor(n)}秒 分の動画を生成可能`,
    freeTierMaxRes: (s: string) => `最大解像度: ${s}`,
    freeTierMaxDur: (n: number) => `最大尺: ${n}秒/本`,
    unlimited: "無制限",
    freeLabel: "無料",
    perSec: "/秒",
    // Guide
    guide: [
      { step: "1", title: "為替レートを設定", desc: "ページ上部の為替レート入力欄で現在のUSD/JPYレートに合わせてください。円換算金額がリアルタイムで更新されます。" },
      { step: "2", title: "料金比較表タブで概要を確認", desc: "全サービスのプラン・クレジット数・最大解像度を一覧で比較できます。" },
      { step: "3", title: "利用シミュレーターで最適プランを判定", desc: "月間生成本数と平均尺（秒）を入力すると、最安プランが自動でランキング表示されます。" },
      { step: "4", title: "無料枠タブで試用量を確認", desc: "各サービスの無料枠で生成できる合計秒数を確認し、まず無料で試せるサービスを選びましょう。" },
    ],
    // FAQ
    faq: [
      { q: "SoraとRunwayはどちらが安いですか？", a: "月間利用量によります。Soraは月50クレジット（$20 Plus）から、Runwayは月625クレジット（$12 Standard）から利用可能です。少量ならRunway Standardがコスパ優秀です。" },
      { q: "AI動画生成の「クレジット」とは何ですか？", a: "各サービス独自の消費単位です。解像度・尺・品質設定によって消費量が変わります。1クレジットあたり生成できる動画秒数はサービスごとに異なります。" },
      { q: "無料で試せるサービスはありますか？", a: "Runway・Pika・Kling・LumaはすべてFreeプランを提供しています。Soraのみ無料枠がなく、ChatGPT Plus（$20/月）が最低プランです。" },
      { q: "商用利用は可能ですか？", a: "有料プランでは基本的に商用利用が許可されていますが、生成物のライセンスは各サービスの利用規約を必ず確認してください。" },
    ],
    // Related tools
    relatedLinks: [
      { href: "/ai-model-comparison", label: "AIモデル比較", desc: "GPT・Claude・Geminiの性能・料金を横断比較" },
      { href: "/youtube-revenue", label: "YouTube収益計算機", desc: "再生数から広告収益を試算" },
    ],
  },
  en: {
    langToggle: "JP",
    // Tabs
    comparison: "Price Table",
    efficiency: "Cost Efficiency",
    simulator: "Simulator",
    free: "Free Tiers",
    // Section headings
    useCaseTitle: "Use Case Picks",
    fxRateLabel: "FX Rate (JPY/USD)",
    fxRateNote: (rate: number) => `$1 = ¥${rate}`,
    comparisonNote: "* Prices are 2026 estimates. JPY uses the rate you set above.",
    efficiencyDesc: "Comparing cost per second of generated video across paid plans. Lower = better value.",
    simulatorHeading: "Enter Monthly Usage",
    monthlyVideosLabel: "Videos per Month",
    monthlyVideosPlaceholder: "e.g. 30",
    avgDurationLabel: "Avg Duration (sec)",
    avgDurationPlaceholder: "e.g. 5",
    simulatorEmpty: "Enter monthly video count to find the cheapest plan",
    freeDesc: "Compare how much you can generate on the free tier right after sign-up.",
    soraNoFree: "No free tier",
    soraNoFreeDesc: "Requires ChatGPT Plus ($20/mo) at minimum",
    legendNote: "Prices are 2026 estimates. Please check each service's official site for current rates.",
    guideTitle: "How to Use",
    faqTitle: "FAQ",
    relatedTitle: "Related Tools",
    // Table headers
    thService: "Service",
    thPlan: "Plan",
    thMonthlyUSD: "Monthly (USD)",
    thMonthlyJPY: "Monthly (JPY)",
    thCredits: "Credits/mo",
    thMaxRes: "Max Res",
    thMaxDur: "Max Len",
    thFeatures: "Features",
    // Sim table headers
    thRank: "Rank",
    thRecommended: "Best Plan",
    thMonthlyUSDSim: "Monthly (USD)",
    thMonthlyJPYSim: "Monthly (JPY)",
    thPerVideo: "Per Video",
    overLimit: "* over cap",
    // Free tier
    freeTierSecs: (n: number) => `≈ ${Math.floor(n)} sec of video`,
    freeTierMaxRes: (s: string) => `Max resolution: ${s}`,
    freeTierMaxDur: (n: number) => `Max length: ${n}s/clip`,
    unlimited: "Unlimited",
    freeLabel: "Free",
    perSec: "/sec",
    // Guide
    guide: [
      { step: "1", title: "Set FX Rate", desc: "Update the USD/JPY rate at the top to reflect the current exchange rate. JPY amounts update in real time." },
      { step: "2", title: "Check the Price Table", desc: "Compare plans, credit counts, and max resolution across all services at a glance." },
      { step: "3", title: "Use the Simulator", desc: "Enter your monthly video count and average duration to get an automatic cheapest-plan ranking." },
      { step: "4", title: "Review Free Tiers", desc: "See how many seconds you can generate for free on each service before committing to a paid plan." },
    ],
    // FAQ
    faq: [
      { q: "Which is cheaper — Sora or Runway?", a: "It depends on your usage. Sora starts at 50 credits/mo ($20 Plus); Runway starts at 625 credits/mo ($12 Standard). For low volume, Runway Standard offers better value." },
      { q: "What is a 'credit' in AI video generation?", a: "Credits are each service's own consumption unit. Consumption varies by resolution, duration, and quality settings. The seconds of video you get per credit differ by service." },
      { q: "Which services have a free tier?", a: "Runway, Pika, Kling, and Luma all offer free plans. Sora has no free tier — the minimum is ChatGPT Plus ($20/mo)." },
      { q: "Can I use generated videos commercially?", a: "Paid plans generally allow commercial use, but always review each service's Terms of Service regarding the license for generated content." },
    ],
    // Related tools
    relatedLinks: [
      { href: "/ai-model-comparison", label: "AI Model Comparison", desc: "Compare performance & pricing for GPT, Claude, and Gemini" },
      { href: "/youtube-revenue", label: "YouTube Revenue Calculator", desc: "Estimate ad revenue from view counts" },
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtUSD(n: number, t: typeof T["ja"] | typeof T["en"]) {
  return n === 0 ? t.freeLabel : `$${n.toFixed(2)}`;
}

function fmtJPY(usd: number, rate: number, t: typeof T["ja"] | typeof T["en"]) {
  if (usd === 0) return t.freeLabel;
  const jpy = Math.round(usd * rate);
  return `¥${jpy.toLocaleString()}`;
}

/** Cost in USD per 1 second of generated video */
function costPerSec(plan: Plan, service: Service): number | null {
  if (plan.isUnlimited) return null;
  if (plan.credits === null) return null;
  if (plan.priceUSD === 0) return null; // free tier — not comparable
  const totalSecs = plan.credits * service.secPerCredit;
  if (totalSecs === 0) return null;
  return plan.priceUSD / totalSecs;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ServiceBadge({ service }: { service: Service }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${service.badgeBg} ${service.badgeText}`}>
      {service.name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AiVideoPricing() {
  const [lang, setLang] = useState<Lang>("ja");
  const [fxRate, setFxRate] = useState(150);
  const [monthlyVideos, setMonthlyVideos] = useState("");
  const [avgDurationSec, setAvgDurationSec] = useState("5");
  const [activeTab, setActiveTab] = useState<"comparison" | "efficiency" | "simulator" | "free">("comparison");

  const t = T[lang];
  const USE_CASES = lang === "ja" ? USE_CASES_JA : USE_CASES_EN;

  // -------------------------------------------------------------------------
  // Cost efficiency: cheapest paid plan cost-per-second per service
  // -------------------------------------------------------------------------
  const efficiencyData = useMemo(() => {
    return SERVICES.map((svc) => {
      const paidPlans = svc.plans.filter((p) => p.priceUSD > 0);
      const entries = paidPlans.map((p) => {
        const cps = costPerSec(p, svc);
        return { plan: p, cps };
      });
      return { service: svc, entries };
    });
  }, []);

  // -------------------------------------------------------------------------
  // Simulator: find cheapest plan per service for given monthly usage
  // -------------------------------------------------------------------------
  const simResults = useMemo(() => {
    const videos = parseFloat(monthlyVideos) || 0;
    const duration = parseFloat(avgDurationSec) || 5;
    if (videos === 0) return [];

    const totalSecs = videos * duration;

    return SERVICES.map((svc) => {
      const creditsNeeded = totalSecs / svc.secPerCredit;
      const unlimitedPlan = svc.plans.find((p) => p.isUnlimited);
      const sufficientPaidPlans = svc.plans
        .filter((p) => p.credits !== null && !p.isUnlimited && p.credits >= creditsNeeded)
        .sort((a, b) => a.priceUSD - b.priceUSD);

      let recommended: Plan | null = sufficientPaidPlans[0] ?? null;

      if (unlimitedPlan && recommended && unlimitedPlan.priceUSD < recommended.priceUSD) {
        recommended = unlimitedPlan;
      }
      if (!recommended) {
        recommended = unlimitedPlan ?? svc.plans[svc.plans.length - 1];
      }

      const monthlyCostUSD = recommended.priceUSD;
      const costPerVideoUSD = videos > 0 ? monthlyCostUSD / videos : 0;

      return {
        service: svc,
        plan: recommended,
        monthlyCostUSD,
        monthlyCostJPY: monthlyCostUSD * fxRate,
        costPerVideoUSD,
        canCover: recommended.isUnlimited || (recommended.credits !== null && recommended.credits >= creditsNeeded),
      };
    }).sort((a, b) => a.monthlyCostUSD - b.monthlyCostUSD);
  }, [monthlyVideos, avgDurationSec, fxRate]);

  // -------------------------------------------------------------------------
  // Free tier summary
  // -------------------------------------------------------------------------
  const freeTiers = useMemo(() => {
    return SERVICES.map((svc) => {
      const free = svc.plans.find((p) => p.priceUSD === 0);
      if (!free || free.credits === null) return null;
      const totalSecs = free.credits * svc.secPerCredit;
      return { service: svc, plan: free, totalSecs };
    }).filter(Boolean) as { service: Service; plan: Plan; totalSecs: number }[];
  }, []);

  const TABS: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: "comparison", label: t.comparison, icon: "⊞" },
    { id: "efficiency", label: t.efficiency, icon: "◎" },
    { id: "simulator", label: t.simulator, icon: "∿" },
    { id: "free", label: t.free, icon: "★" },
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
        .use-case-card:hover {
          box-shadow: 0 0 16px rgba(167,139,250,0.15);
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

      {/* 用途別おすすめ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.useCaseTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className="use-case-card glass-card rounded-xl p-4 transition-all duration-200 hover:border-violet-500/30">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{uc.icon}</span>
                <span className="font-semibold text-white/90 text-sm">{uc.label}</span>
              </div>
              <p className="text-xs text-violet-200 mb-2.5">{uc.desc}</p>
              <div className="flex flex-wrap gap-1">
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
      <div className="glass-card rounded-2xl px-6 py-4 flex items-center gap-4">
        <label className="text-xs font-medium text-violet-100 uppercase tracking-wider whitespace-nowrap">{t.fxRateLabel}</label>
        <input
          type="number"
          value={fxRate}
          onChange={(e) => setFxRate(Number(e.target.value))}
          className="number-input w-28 px-4 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
        />
        <span className="text-xs text-violet-200 font-mono">{t.fxRateNote(fxRate)}</span>
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

      {/* ---- 料金比較表 ---- */}
      {activeTab === "comparison" && (
        <div className="tab-panel glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.thService}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.thPlan}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.thMonthlyUSD}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.thMonthlyJPY}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.thCredits}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.thMaxRes}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider whitespace-nowrap">{t.thMaxDur}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-violet-200 uppercase tracking-wider">{t.thFeatures}</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.flatMap((svc) =>
                  svc.plans.map((plan, pi) => (
                    <tr key={`${svc.name}-${plan.name}`} className={`border-b border-white/5 table-row-stripe ${pi === 0 ? "" : ""}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {pi === 0 ? <ServiceBadge service={svc} /> : ""}
                      </td>
                      <td className="px-4 py-3 text-white/90 whitespace-nowrap">{plan.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-white/90">{fmtUSD(plan.priceUSD, t)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-violet-200">{fmtJPY(plan.priceUSD, fxRate, t)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {plan.isUnlimited ? (
                          <span className="inline-block bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {t.unlimited}
                          </span>
                        ) : (
                          <span className="font-mono text-cyan-300">
                            {plan.credits?.toLocaleString()} {plan.creditUnit}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/90 whitespace-nowrap">{pi === 0 ? svc.maxResolution : ""}</td>
                      <td className="px-4 py-3 text-white/90 whitespace-nowrap">{pi === 0 ? `${svc.maxDurationSec}${lang === "ja" ? "秒" : "s"}` : ""}</td>
                      <td className="px-4 py-3">
                        {pi === 0 && (
                          <div className="flex flex-wrap gap-1">
                            {svc.features.map((f) => (
                              <span key={f} className="inline-block glass-card text-violet-200 text-xs px-2 py-0.5 rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-violet-200 px-4 py-3">{t.comparisonNote}</p>
        </div>
      )}

      {/* ---- コスト効率 ---- */}
      {activeTab === "efficiency" && (
        <div className="space-y-4 tab-panel">
          <p className="text-sm text-violet-100">{t.efficiencyDesc}</p>
          {efficiencyData.map(({ service, entries }) => (
            <div key={service.name} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <ServiceBadge service={service} />
                <span className="text-sm text-violet-200">{service.company}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {entries.map(({ plan, cps }) => (
                  <div
                    key={plan.name}
                    className={`rounded-xl p-3 ${plan.isUnlimited ? "glass-card-bright border-violet-500/30" : "glass-card"}`}
                  >
                    <div className={`text-xs font-medium mb-1 ${plan.isUnlimited ? "text-violet-300" : "text-violet-200"}`}>
                      {plan.name}
                    </div>
                    <div className="text-lg font-bold font-mono">
                      {plan.isUnlimited ? (
                        <span className="text-violet-300">{t.unlimited}</span>
                      ) : cps === null ? (
                        <span className="text-white/30 text-sm">-</span>
                      ) : (
                        <>
                          <span className={`bg-gradient-to-r ${service.brandColor} bg-clip-text text-transparent`}>
                            ${cps.toFixed(4)}
                          </span>
                          <span className="text-xs font-normal text-violet-200 ml-1">{t.perSec}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-violet-200 mt-1">
                      {plan.isUnlimited
                        ? `$${plan.priceUSD}/${lang === "ja" ? "月" : "mo"}`
                        : `$${plan.priceUSD}/${lang === "ja" ? "月" : "mo"} · ${plan.credits?.toLocaleString()} ${plan.creditUnit}`}
                    </div>
                    {cps !== null && !plan.isUnlimited && (
                      <div className="text-xs text-violet-200">
                        ≒ ¥{Math.round(cps * fxRate * 100) / 100}{t.perSec}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- シミュレーター ---- */}
      {activeTab === "simulator" && (
        <div className="space-y-4 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.simulatorHeading}</h3>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.monthlyVideosLabel}</label>
                <input
                  type="number"
                  value={monthlyVideos}
                  onChange={(e) => setMonthlyVideos(e.target.value)}
                  placeholder={t.monthlyVideosPlaceholder}
                  className="number-input w-full px-4 py-2.5 rounded-xl text-sm font-mono neon-focus transition-all"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.avgDurationLabel}</label>
                <input
                  type="number"
                  value={avgDurationSec}
                  onChange={(e) => setAvgDurationSec(e.target.value)}
                  placeholder={t.avgDurationPlaceholder}
                  className="number-input w-full px-4 py-2.5 rounded-xl text-sm font-mono neon-focus transition-all"
                />
              </div>
            </div>

            {simResults.length > 0 && (
              <div className="overflow-x-auto rounded-xl glass-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-violet-200 uppercase tracking-wider">{t.thRank}</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-violet-200 uppercase tracking-wider">{t.thService}</th>
                      <th className="px-3 py-2.5 text-left text-xs font-medium text-violet-200 uppercase tracking-wider">{t.thRecommended}</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-violet-200 uppercase tracking-wider">{t.thMonthlyUSDSim}</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-violet-200 uppercase tracking-wider">{t.thMonthlyJPYSim}</th>
                      <th className="px-3 py-2.5 text-right text-xs font-medium text-violet-200 uppercase tracking-wider">{t.thPerVideo}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simResults.map((r, i) => (
                      <tr key={r.service.name} className={`border-b border-white/5 table-row-stripe ${i === 0 ? "bg-violet-500/10" : ""}`}>
                        <td className="px-3 py-2.5 text-sm text-violet-200 font-mono">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                        </td>
                        <td className="px-3 py-2.5 text-sm">
                          <ServiceBadge service={r.service} />
                          {!r.canCover && (
                            <span className="ml-1 text-xs text-amber-400">{t.overLimit}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-white/90">{r.plan.name}</td>
                        <td className="px-3 py-2.5 text-sm text-right font-mono font-semibold text-white/90">
                          {fmtUSD(r.monthlyCostUSD, t)}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-right font-mono text-violet-200">
                          {fmtJPY(r.monthlyCostUSD, fxRate, t)}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-right font-mono text-cyan-300">
                          {r.monthlyCostUSD === 0
                            ? t.freeLabel
                            : `$${r.costPerVideoUSD.toFixed(3)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {monthlyVideos === "" && (
              <div className="text-center py-8 text-sm text-violet-200">
                {t.simulatorEmpty}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- 無料枠比較 ---- */}
      {activeTab === "free" && (
        <div className="space-y-4 tab-panel">
          <p className="text-sm text-violet-100">{t.freeDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeTiers.map(({ service, plan, totalSecs }) => (
              <div key={service.name} className="gradient-border-box glass-card-bright rounded-2xl p-5 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.brandColor}`} />
                <ServiceBadge service={service} />
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-bold text-white font-mono glow-text">
                    {plan.credits?.toLocaleString()}
                  </span>
                  <span className="text-sm text-violet-200 ml-1">{plan.creditUnit}</span>
                </div>
                <div className="text-sm text-violet-100 mb-3">
                  {t.freeTierSecs(totalSecs)}
                </div>
                <div className="text-xs text-violet-200 space-y-0.5">
                  <div>{t.freeTierMaxRes(service.maxResolution)}</div>
                  <div>{t.freeTierMaxDur(service.maxDurationSec)}</div>
                </div>
              </div>
            ))}
            {/* Soraの無料枠なし */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden opacity-50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
              <ServiceBadge service={SERVICES[0]} />
              <div className="mt-3 mb-1">
                <span className="text-xl font-bold text-violet-200">{t.soraNoFree}</span>
              </div>
              <div className="text-sm text-violet-200">{t.soraNoFreeDesc}</div>
            </div>
          </div>
        </div>
      )}

      {/* 凡例・注記 */}
      <div className="flex flex-wrap gap-4 text-xs text-violet-200">
        {SERVICES.map((svc) => (
          <div key={svc.name} className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-full ${svc.badgeBg}`}></span>
            <span className="text-violet-100">{svc.name}</span>
          </div>
        ))}
        <span className="ml-auto text-right text-violet-200">{t.legendNote}</span>
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
              <div className="font-bold text-white/90 text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage (Japanese, SEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "SoraとRunwayはどちらが安いですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "月間利用量によります。Soraは月50クレジット（$20 Plus）から、Runwayは月625クレジット（$12 Standard）から利用可能です。少量ならRunway Standardがコスパ優秀です。" },
              },
              {
                "@type": "Question",
                "name": "AI動画生成の「クレジット」とは何ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "各サービス独自の消費単位です。解像度・尺・品質設定によって消費量が変わります。1クレジットあたり生成できる動画秒数はサービスごとに異なります。" },
              },
              {
                "@type": "Question",
                "name": "無料で試せるサービスはありますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "Runway・Pika・Kling・LumaはすべてFreeプランを提供しています。Soraのみ無料枠がなく、ChatGPT Plus（$20/月）が最低プランです。" },
              },
            ],
          }),
        }}
      />

      {/* 関連ツール */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200 group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm group-hover:text-violet-100 transition-colors">{link.label}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
