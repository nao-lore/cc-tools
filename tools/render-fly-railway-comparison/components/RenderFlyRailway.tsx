"use client";

import { useState, useMemo } from "react";

// ── 型定義 ────────────────────────────────────────────────────────────────────

type Provider = "Render" | "Fly.io" | "Railway";
type Lang = "ja" | "en";

interface UserInput {
  cpuShared: number;
  memoryGB: number;
  storageGB: number;
  bandwidthGB: number;
  hoursPerMonth: number;
  includeDB: boolean;
  dbStorageGB: number;
}

interface CostResult {
  provider: Provider;
  monthlyCost: number;
  breakdown: { label: string; cost: number }[];
  freeNote?: string;
  isCheapest?: boolean;
  withinFree: boolean;
}

// ── 翻訳定数 ──────────────────────────────────────────────────────────────────

const T = {
  ja: {
    // Tabs
    calculator: "料金計算",
    regions: "リージョン",
    usecases: "用途別おすすめ",
    // Currency toggle
    usd: "USD表示",
    jpy: "JPY表示",
    // Section headings
    resourceSettings: "リソース設定",
    cheapest: "最安",
    perMonth: "/月",
    withinFree: "無料枠内",
    // Sliders
    cpu: "CPU (shared vCPU)",
    memory: "メモリ",
    storage: "ストレージ",
    bandwidth: "帯域幅",
    uptime: "稼働時間",
    addDB: "データベース追加",
    dbStorage: "DBストレージ",
    exchangeNote: "※ 為替レート: 1 USD = {rate} 円（概算）",
    // Region tab
    tokyo: "東京 ✓",
    noTokyoNote: "※ 東京リージョンなし。日本からのレイテンシに注意。",
    // Usecases
    recommended: "おすすめ:",
    // Comparison table headers
    tableItem: "項目",
    freeQuota: "無料枠",
    minPlan: "最小プラン",
    tokyoRegion: "東京リージョン",
    autoSleep: "自動スリープ",
    billingModel: "課金方式",
    dbFreeQuota: "DB無料枠",
    // Table values
    renderFreeQuota: "静的無制限 / サービス750h",
    flyFreeQuota: "$5クレジット",
    railwayFreeQuota: "$5クレジット(初回)",
    renderMinPlan: "$7/月",
    flyMinPlan: "$5/月〜",
    railwayMinPlan: "$5/月",
    renderTokyo: "×",
    flyTokyo: "◎",
    railwayTokyo: "×",
    renderSleep: "あり(無料)",
    flySleep: "なし",
    railwaySleep: "なし",
    renderBilling: "プラン固定",
    flyBilling: "リソース従量",
    railwayBilling: "秒単位従量",
    renderDBFree: "90日間",
    flyDBFree: "なし",
    railwayDBFree: "なし",
    // Footer note
    footerNote: "※ 料金は2026年概算。最新情報は各社公式サイトを確認してください。",
    // Guide
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "リソース設定を入力", desc: "CPU・メモリ・ストレージ・帯域幅をスライダーで設定します。実際のアプリ要件に合わせて調整してください。" },
      { step: "2", title: "DB の有無を選択", desc: "データベースが必要な場合はチェックをオンにし、DB ストレージ容量を入力します。各プロバイダーの DB 料金が自動で加算されます。" },
      { step: "3", title: "3社の料金を比較", desc: "Render・Fly.io・Railway の月額コストが並んで表示されます。最安プロバイダーには「最安」バッジが付きます。JPY 表示ボタンで日本円に切り替えできます。" },
      { step: "4", title: "リージョン・用途も確認", desc: "「リージョン」タブで東京リージョンの有無を確認。「用途別おすすめ」タブでユースケースごとの推奨を参照してください。" },
    ],
    // FAQ
    faqTitle: "よくある質問（FAQ）",
    faq: [
      {
        q: "Render の料金は？無料プランはある？",
        a: "Render は静的サイトが無制限無料です。Web サービスは $7/月から（512MB RAM）。無料プランの Web サービスは 15 分間操作がないとスリープするため、本番用途は有料プランを推奨します。",
      },
      {
        q: "Fly.io の料金は？日本（東京）リージョンは使える？",
        a: "Fly.io は月 $5 のホビークレジットが付きます。東京（NRT）・大阪（ITM）リージョンが利用可能で、3 社の中で唯一日本リージョンがあります。低レイテンシが必要な日本向けアプリに最適です。",
      },
      {
        q: "Railway と Render の違いは？どちらがおすすめ？",
        a: "Railway は秒単位の従量課金で小規模・バースト的な利用に向いています。Render はプラン固定課金で予算が読みやすく、静的サイトの無料ホスティングが強みです。フルスタックアプリには Railway、静的サイト重視なら Render がおすすめです。",
      },
      {
        q: "3社でデータベース込みの最安は？",
        a: "小規模なら Railway が従量課金で安くなるケースが多いです。Render は DB Starter が $7/月固定、Fly.io は Fly Postgres として VM + Volume 課金です。DB ストレージを増やすと Render の超過料金（$1/GB）が高くなる場合があります。",
      },
    ],
    // Related tools
    relatedTools: "関連ツール",
    relatedLinks: [
      { href: "/vercel-pricing", title: "Vercel 料金計算", desc: "フロントエンドデプロイの定番。Hobby・Pro・Enterprise の料金を試算。" },
      { href: "/netlify-pricing", title: "Netlify 料金計算", desc: "静的サイト・JAMstack 向けホスティングのコスト比較。" },
      { href: "/aws-lambda-cost", title: "AWS Lambda コスト計算", desc: "サーバーレス関数の実行コストを試算。Fly.io・Railway との比較に。" },
    ],
    // Breakdown labels (dynamic, used in calcXxx)
    webService: "Webサービス",
    ramLabel: "GB RAM",
    bwOverage: "帯域超過",
    dbStarter: "DB Starter (1GB)",
    dbStarterOverage: "DB Starter + ストレージ超過",
    sharedCpu: "shared-cpu-1x ×",
    memLabel: "メモリ",
    volumeLabel: "Volume",
    flyPostgres: "Fly Postgres VM + Volume",
    hobbyCredit: "Hobbyクレジット (-$5)",
    cpuLabel: "CPU",
    diskLabel: "ディスク",
    bwLabel: "帯域",
    postgresLabel: "Postgres",
    railwayFreeNote: "使用量$5まで込み",
    hobbyBase: "Hobby基本料 ($5含む)",
    // Use cases
    useCases: [
      { label: "静的サイト", icon: "🌐", winner: "Render" as Provider, reason: "静的サイト無制限無料" },
      { label: "APIサーバー", icon: "⚡", winner: "Fly.io" as Provider, reason: "東京リージョン対応・低レイテンシ" },
      { label: "フルスタック", icon: "🏗️", winner: "Railway" as Provider, reason: "従量課金で小規模に最適" },
      { label: "DB付き", icon: "🗄️", winner: "Railway" as Provider, reason: "Postgres込みで従量が安い" },
    ],
  },
  en: {
    // Tabs
    calculator: "Calculator",
    regions: "Regions",
    usecases: "Use Cases",
    // Currency toggle
    usd: "Show USD",
    jpy: "Show JPY",
    // Section headings
    resourceSettings: "Resource Settings",
    cheapest: "Cheapest",
    perMonth: "/mo",
    withinFree: "Within Free Tier",
    // Sliders
    cpu: "CPU (shared vCPU)",
    memory: "Memory",
    storage: "Storage",
    bandwidth: "Bandwidth",
    uptime: "Uptime",
    addDB: "Add Database",
    dbStorage: "DB Storage",
    exchangeNote: "* Exchange rate: 1 USD = {rate} JPY (approx.)",
    // Region tab
    tokyo: "Tokyo ✓",
    noTokyoNote: "* No Tokyo region. Note latency from Japan.",
    // Usecases
    recommended: "Recommended:",
    // Comparison table headers
    tableItem: "Item",
    freeQuota: "Free Tier",
    minPlan: "Min Plan",
    tokyoRegion: "Tokyo Region",
    autoSleep: "Auto Sleep",
    billingModel: "Billing",
    dbFreeQuota: "DB Free Tier",
    // Table values
    renderFreeQuota: "Static unlimited / Service 750h",
    flyFreeQuota: "$5 credit",
    railwayFreeQuota: "$5 credit (first)",
    renderMinPlan: "$7/mo",
    flyMinPlan: "$5/mo+",
    railwayMinPlan: "$5/mo",
    renderTokyo: "×",
    flyTokyo: "◎",
    railwayTokyo: "×",
    renderSleep: "Yes (free)",
    flySleep: "No",
    railwaySleep: "No",
    renderBilling: "Fixed plan",
    flyBilling: "Resource usage",
    railwayBilling: "Per-second",
    renderDBFree: "90 days",
    flyDBFree: "None",
    railwayDBFree: "None",
    // Footer note
    footerNote: "* Pricing as of 2026 (estimate). Check each provider's official site for the latest.",
    // Guide
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Set Resources", desc: "Adjust CPU, memory, storage, and bandwidth with sliders to match your app requirements." },
      { step: "2", title: "Add Database (optional)", desc: "Toggle the database checkbox and set DB storage. Each provider's DB cost is added automatically." },
      { step: "3", title: "Compare 3 Providers", desc: "Monthly costs for Render, Fly.io, and Railway are shown side by side. The cheapest gets a badge. Toggle JPY for Japanese yen." },
      { step: "4", title: "Check Regions & Use Cases", desc: "Use the Regions tab to check Tokyo availability. The Use Cases tab shows which provider fits each scenario." },
    ],
    // FAQ
    faqTitle: "FAQ",
    faq: [
      {
        q: "What does Render cost? Is there a free plan?",
        a: "Render offers unlimited free static sites. Web services start at $7/mo (512MB RAM). Free-tier web services sleep after 15 min of inactivity — use a paid plan for production.",
      },
      {
        q: "What does Fly.io cost? Is Tokyo available?",
        a: "Fly.io includes a $5/mo hobby credit. Tokyo (NRT) and Osaka (ITM) regions are available — the only provider of the three with Japan regions. Ideal for low-latency Japan-facing apps.",
      },
      {
        q: "Railway vs Render — which should I choose?",
        a: "Railway uses per-second metered billing, great for small or bursty workloads. Render uses fixed-plan billing for predictable costs and excels at free static hosting. Railway for full-stack, Render for static-site focus.",
      },
      {
        q: "Which is cheapest with a database?",
        a: "For small scale, Railway is often cheapest on metered billing. Render's DB Starter is $7/mo fixed. Fly.io charges VM + Volume for Fly Postgres. Render's overage fee ($1/GB) can get expensive as DB storage grows.",
      },
    ],
    // Related tools
    relatedTools: "Related Tools",
    relatedLinks: [
      { href: "/vercel-pricing", title: "Vercel Pricing Calculator", desc: "The go-to for frontend deploys. Estimate Hobby, Pro, and Enterprise costs." },
      { href: "/netlify-pricing", title: "Netlify Pricing Calculator", desc: "Cost comparison for static sites and JAMstack hosting." },
      { href: "/aws-lambda-cost", title: "AWS Lambda Cost Calculator", desc: "Estimate serverless function costs. Compare with Fly.io and Railway." },
    ],
    // Breakdown labels (dynamic)
    webService: "Web service",
    ramLabel: "GB RAM",
    bwOverage: "Bandwidth overage",
    dbStarter: "DB Starter (1GB)",
    dbStarterOverage: "DB Starter + storage overage",
    sharedCpu: "shared-cpu-1x ×",
    memLabel: "Memory",
    volumeLabel: "Volume",
    flyPostgres: "Fly Postgres VM + Volume",
    hobbyCredit: "Hobby credit (-$5)",
    cpuLabel: "CPU",
    diskLabel: "Disk",
    bwLabel: "Bandwidth",
    postgresLabel: "Postgres",
    railwayFreeNote: "Usage up to $5 incl.",
    hobbyBase: "Hobby base ($5 incl.)",
    // Use cases
    useCases: [
      { label: "Static Site", icon: "🌐", winner: "Render" as Provider, reason: "Unlimited free static hosting" },
      { label: "API Server", icon: "⚡", winner: "Fly.io" as Provider, reason: "Tokyo region — low latency" },
      { label: "Full-stack", icon: "🏗️", winner: "Railway" as Provider, reason: "Metered billing great for small apps" },
      { label: "With DB", icon: "🗄️", winner: "Railway" as Provider, reason: "Postgres included, metered is cheap" },
    ],
  },
} as const;

// ── 為替レート ─────────────────────────────────────────────────────────────────

const USD_TO_JPY = 155;

// ── 料金定数 ──────────────────────────────────────────────────────────────────

const RENDER = {
  individual: 7,
  instancePerGBRAM: 7,
  freeBandwidthGB: 100,
  bandwidthOveragePerGB: 0.10,
  dbFree: { storageGB: 0.256, durationDays: 90 },
  dbStarter: { cost: 7, storageGB: 1 },
  dbStorageOveragePerGB: 1.00,
};

const FLY = {
  hobbyCredit: 5,
  sharedCpu1xPerMonth: 1.94,
  dedicatedCpu1xPerMonth: 31,
  memoryPerGBPerMonth: 5,
  volumePerGBPerMonth: 0.15,
  freeBandwidthGB: 100,
  bandwidthOveragePerGB: 0.02,
};

const RAILWAY = {
  hobbyBase: 5,
  cpuPerMinPerVCPU: 0.000463,
  memPerMinPerGB: 0.000231,
  bandwidthPerGB: 0.10,
  diskPerGBPerMonth: 0.25,
};

// ── 計算ロジック ───────────────────────────────────────────────────────────────

type TDict = typeof T["ja"] | typeof T["en"];

function calcRender(input: UserInput, t: TDict): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const ramTiers = Math.max(1, Math.ceil(input.memoryGB / 0.5));
  const instanceCost = ramTiers * 7;
  breakdown.push({ label: `${t.webService} (${input.memoryGB}${t.ramLabel})`, cost: instanceCost });

  const bwOverage = Math.max(0, input.bandwidthGB - RENDER.freeBandwidthGB) * RENDER.bandwidthOveragePerGB;
  if (bwOverage > 0) breakdown.push({ label: t.bwOverage, cost: bwOverage });

  let dbCost = 0;
  if (input.includeDB) {
    if (input.dbStorageGB <= 1) {
      dbCost = RENDER.dbStarter.cost;
      breakdown.push({ label: t.dbStarter, cost: dbCost });
    } else {
      const extra = Math.max(0, input.dbStorageGB - RENDER.dbStarter.storageGB);
      dbCost = RENDER.dbStarter.cost + extra * RENDER.dbStorageOveragePerGB;
      breakdown.push({ label: t.dbStarterOverage, cost: dbCost });
    }
  }

  const total = instanceCost + bwOverage + dbCost;
  const withinFree = input.memoryGB <= 0 && !input.includeDB && input.bandwidthGB <= RENDER.freeBandwidthGB;

  return { provider: "Render", monthlyCost: total, breakdown, withinFree };
}

function calcFly(input: UserInput, t: TDict): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const vmCount = Math.max(1, input.cpuShared);
  const vmCost = vmCount * FLY.sharedCpu1xPerMonth;
  breakdown.push({ label: `${t.sharedCpu} ${vmCount}`, cost: vmCost });

  const memCost = input.memoryGB * FLY.memoryPerGBPerMonth;
  if (memCost > 0) breakdown.push({ label: `${t.memLabel} (${input.memoryGB}GB)`, cost: memCost });

  const volCost = input.storageGB * FLY.volumePerGBPerMonth;
  if (volCost > 0) breakdown.push({ label: `${t.volumeLabel} (${input.storageGB}GB)`, cost: volCost });

  const bwOverage = Math.max(0, input.bandwidthGB - FLY.freeBandwidthGB) * FLY.bandwidthOveragePerGB;
  if (bwOverage > 0) breakdown.push({ label: t.bwOverage, cost: bwOverage });

  let dbCost = 0;
  if (input.includeDB) {
    const dbVm = FLY.sharedCpu1xPerMonth;
    const dbVol = input.dbStorageGB * FLY.volumePerGBPerMonth;
    dbCost = dbVm + dbVol;
    breakdown.push({ label: t.flyPostgres, cost: dbCost });
  }

  let subtotal = vmCost + memCost + volCost + bwOverage + dbCost;

  const credit = FLY.hobbyCredit;
  breakdown.push({ label: t.hobbyCredit, cost: -credit });
  const total = Math.max(0, subtotal - credit);

  const withinFree = subtotal <= credit;

  return { provider: "Fly.io", monthlyCost: total, breakdown, freeNote: "$5クレジット適用後", withinFree };
}

function calcRailway(input: UserInput, t: TDict): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const minutes = input.hoursPerMonth * 60;

  const cpuCost = input.cpuShared * minutes * RAILWAY.cpuPerMinPerVCPU;
  breakdown.push({ label: `${t.cpuLabel} (${input.cpuShared} vCPU × ${input.hoursPerMonth}h)`, cost: cpuCost });

  const memCost = input.memoryGB * minutes * RAILWAY.memPerMinPerGB;
  breakdown.push({ label: `${t.memLabel} (${input.memoryGB}GB × ${input.hoursPerMonth}h)`, cost: memCost });

  const diskCost = input.storageGB * RAILWAY.diskPerGBPerMonth;
  if (diskCost > 0) breakdown.push({ label: `${t.diskLabel} (${input.storageGB}GB)`, cost: diskCost });

  const bwCost = input.bandwidthGB * RAILWAY.bandwidthPerGB;
  if (bwCost > 0) breakdown.push({ label: `${t.bwLabel} (${input.bandwidthGB}GB)`, cost: bwCost });

  let dbCost = 0;
  if (input.includeDB) {
    const dbMem = 0.5;
    const dbCpu = 0.5;
    const dbDisk = input.dbStorageGB * RAILWAY.diskPerGBPerMonth;
    const dbCompute = (dbCpu * minutes * RAILWAY.cpuPerMinPerVCPU) + (dbMem * minutes * RAILWAY.memPerMinPerGB);
    dbCost = dbCompute + dbDisk;
    breakdown.push({ label: `${t.postgresLabel} (0.5 vCPU, 512MB + ${input.dbStorageGB}GB disk)`, cost: dbCost });
  }

  const subtotal = cpuCost + memCost + diskCost + bwCost + dbCost;
  const base = RAILWAY.hobbyBase;
  breakdown.push({ label: t.hobbyBase, cost: base });

  const usageBeyondBase = Math.max(0, subtotal - base);
  const total = base + usageBeyondBase;

  const withinFree = subtotal <= base;

  return {
    provider: "Railway",
    monthlyCost: total,
    breakdown,
    freeNote: t.railwayFreeNote,
    withinFree,
  };
}

// ── ブランドカラー (dark glass theme) ─────────────────────────────────────────

const BRAND: Record<Provider, { glow: string; badge: string; text: string; dot: string; border: string; bg: string }> = {
  Render: {
    glow: "rgba(139,92,246,0.3)",
    badge: "bg-violet-500/20 text-violet-200",
    text: "text-violet-300",
    dot: "bg-violet-400",
    border: "border-violet-500/40",
    bg: "bg-violet-500/8",
  },
  "Fly.io": {
    glow: "rgba(6,182,212,0.3)",
    badge: "bg-cyan-500/20 text-cyan-200",
    text: "text-cyan-300",
    dot: "bg-cyan-400",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/8",
  },
  Railway: {
    glow: "rgba(244,63,94,0.3)",
    badge: "bg-rose-500/20 text-rose-200",
    text: "text-rose-300",
    dot: "bg-rose-400",
    border: "border-rose-500/40",
    bg: "bg-rose-500/8",
  },
};

// ── リージョン ────────────────────────────────────────────────────────────────

const REGIONS: { provider: Provider; regions: string[]; tokyoAvailable: boolean }[] = [
  {
    provider: "Render",
    regions: ["Oregon (US)", "Ohio (US)", "Virginia (US)", "Frankfurt (EU)", "Singapore (AP)"],
    tokyoAvailable: false,
  },
  {
    provider: "Fly.io",
    regions: ["Tokyo (NRT)", "Osaka (ITM)", "Singapore (SIN)", "Sydney (SYD)", "US/EU 多数"],
    tokyoAvailable: true,
  },
  {
    provider: "Railway",
    regions: ["US West", "US East", "EU West", "AP Southeast (Singapore)"],
    tokyoAvailable: false,
  },
];

// ── スライダーコンポーネント ───────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-violet-100 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-white font-semibold font-mono tabular-nums">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
      <div className="flex justify-between text-xs text-violet-200/60">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────────────────────────────────

export default function RenderFlyRailway() {
  const [input, setInput] = useState<UserInput>({
    cpuShared: 1,
    memoryGB: 0.5,
    storageGB: 1,
    bandwidthGB: 10,
    hoursPerMonth: 720,
    includeDB: false,
    dbStorageGB: 1,
  });

  const [showJpy, setShowJpy] = useState(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "regions" | "usecases">("calculator");
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

  const set = (key: keyof UserInput) => (v: number | boolean) =>
    setInput((prev) => ({ ...prev, [key]: v }));

  const results = useMemo<CostResult[]>(() => {
    const r = [calcRender(input, t), calcFly(input, t), calcRailway(input, t)];
    const minCost = Math.min(...r.map((x) => x.monthlyCost));
    return r.map((x) => ({ ...x, isCheapest: x.monthlyCost === minCost }));
  }, [input, t]);

  const fmt = (usd: number) => {
    if (showJpy) {
      return `¥${Math.round(usd * USD_TO_JPY).toLocaleString()}`;
    }
    return `$${usd.toFixed(2)}`;
  };

  const TABS = [
    { id: "calculator" as const, label: t.calculator, icon: "◎" },
    { id: "regions" as const, label: t.regions, icon: "🌏" },
    { id: "usecases" as const, label: t.usecases, icon: "⊞" },
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
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
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
        .provider-card-cheapest {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        input[type="checkbox"] {
          accent-color: #a78bfa;
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

      {/* タブ + 通貨切替 */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1 flex-wrap items-center">
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
        <button
          onClick={() => setShowJpy((v) => !v)}
          className="ml-auto px-3 py-1.5 rounded-xl text-xs font-medium glass-card text-violet-200 hover:text-violet-100 transition-colors"
        >
          {showJpy ? t.usd : t.jpy}
        </button>
      </div>

      {/* ===== 料金計算タブ ===== */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 tab-panel">
          {/* 入力パネル */}
          <div className="lg:col-span-1 glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.resourceSettings}</h2>

            <Slider label={t.cpu} value={input.cpuShared} min={0.5} max={8} step={0.5} unit="vCPU" onChange={set("cpuShared") as (v: number) => void} />
            <Slider label={t.memory} value={input.memoryGB} min={0.25} max={8} step={0.25} unit="GB" onChange={set("memoryGB") as (v: number) => void} />
            <Slider label={t.storage} value={input.storageGB} min={0} max={100} step={1} unit="GB" onChange={set("storageGB") as (v: number) => void} />
            <Slider label={t.bandwidth} value={input.bandwidthGB} min={0} max={500} step={10} unit="GB/月" onChange={set("bandwidthGB") as (v: number) => void} />
            <Slider label={t.uptime} value={input.hoursPerMonth} min={100} max={720} step={10} unit="h/月" onChange={set("hoursPerMonth") as (v: number) => void} />

            <div className="pt-3 border-t border-white/8 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.includeDB}
                  onChange={(e) => set("includeDB")(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs font-medium text-violet-100 uppercase tracking-wider">{t.addDB}</span>
              </label>
              {input.includeDB && (
                <Slider label={t.dbStorage} value={input.dbStorageGB} min={0.25} max={20} step={0.25} unit="GB" onChange={set("dbStorageGB") as (v: number) => void} />
              )}
            </div>

            <p className="text-xs text-violet-200/60">
              {t.exchangeNote.replace("{rate}", String(USD_TO_JPY))}
            </p>
          </div>

          {/* 結果カード */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((r) => {
              const b = BRAND[r.provider];
              return (
                <div
                  key={r.provider}
                  className={`gradient-border-box glass-card rounded-2xl p-5 transition-all ${
                    r.isCheapest ? "provider-card-cheapest" : ""
                  }`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${b.dot}`} />
                      <span className="font-bold text-white text-sm">{r.provider}</span>
                    </div>
                    {r.isCheapest && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.badge}`}>
                        {t.cheapest}
                      </span>
                    )}
                  </div>

                  {/* 金額 */}
                  <div className="mb-3">
                    <span className={`text-3xl font-black glow-text ${b.text}`}>
                      {fmt(r.monthlyCost)}
                    </span>
                    <span className="text-violet-200 text-sm">{t.perMonth}</span>
                  </div>

                  {/* 無料枠内判定 */}
                  {r.withinFree && (
                    <div className="mb-2 text-xs font-semibold text-emerald-300 glass-card rounded-lg px-2 py-1 text-center border border-emerald-500/20">
                      {t.withinFree}
                    </div>
                  )}
                  {r.freeNote && (
                    <div className="mb-2 text-xs text-violet-200 text-center">{r.freeNote}</div>
                  )}

                  {/* 内訳 */}
                  <div className="space-y-1.5 border-t border-white/8 pt-3">
                    {r.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-violet-100">
                        <span className="truncate max-w-[130px]">{item.label}</span>
                        <span className="font-mono text-white/90 shrink-0 ml-1">
                          {item.cost < 0
                            ? `−${fmt(Math.abs(item.cost))}`
                            : fmt(item.cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== リージョンタブ ===== */}
      {activeTab === "regions" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 tab-panel">
          {REGIONS.map((r) => {
            const b = BRAND[r.provider];
            return (
              <div key={r.provider} className={`gradient-border-box glass-card rounded-2xl p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-3 h-3 rounded-full ${b.dot}`} />
                  <span className="font-bold text-white text-base">{r.provider}</span>
                  {r.tokyoAvailable && (
                    <span className="ml-auto text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {t.tokyo}
                    </span>
                  )}
                </div>
                <ul className="space-y-2">
                  {r.regions.map((reg) => (
                    <li key={reg} className="flex items-center gap-2 text-sm text-violet-100">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.dot} shrink-0`} />
                      {reg}
                      {reg.includes("Tokyo") && (
                        <span className="text-xs text-emerald-300 font-semibold">(東京)</span>
                      )}
                      {reg.includes("Osaka") && (
                        <span className="text-xs text-cyan-300 font-semibold">(大阪)</span>
                      )}
                    </li>
                  ))}
                </ul>
                {!r.tokyoAvailable && (
                  <p className="mt-4 text-xs text-violet-200/60">
                    {t.noTokyoNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== 用途別おすすめタブ ===== */}
      {activeTab === "usecases" && (
        <div className="space-y-4 tab-panel">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.useCases.map((uc) => {
              const b = BRAND[uc.winner];
              return (
                <div
                  key={uc.label}
                  className={`glass-card rounded-2xl p-6 border ${b.border}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{uc.icon}</span>
                    <div>
                      <div className="font-bold text-white">{uc.label}</div>
                      <div className={`text-xs font-semibold mt-0.5 ${b.text}`}>
                        {t.recommended} {uc.winner}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-violet-100">{uc.reason}</p>
                </div>
              );
            })}
          </div>

          {/* 概要比較テーブル */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.tableItem}</th>
                  {(["Render", "Fly.io", "Railway"] as Provider[]).map((p) => (
                    <th key={p} className="text-center px-4 py-3 text-xs text-violet-200 font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${BRAND[p].dot}`} />
                        {p}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: t.freeQuota, render: t.renderFreeQuota, fly: t.flyFreeQuota, railway: t.railwayFreeQuota },
                  { label: t.minPlan, render: t.renderMinPlan, fly: t.flyMinPlan, railway: t.railwayMinPlan },
                  { label: t.tokyoRegion, render: t.renderTokyo, fly: t.flyTokyo, railway: t.railwayTokyo },
                  { label: t.autoSleep, render: t.renderSleep, fly: t.flySleep, railway: t.railwaySleep },
                  { label: t.billingModel, render: t.renderBilling, fly: t.flyBilling, railway: t.railwayBilling },
                  { label: t.dbFreeQuota, render: t.renderDBFree, fly: t.flyDBFree, railway: t.railwayDBFree },
                ].map((row) => (
                  <tr key={row.label} className="table-row-stripe">
                    <td className="px-4 py-3 font-medium text-violet-100 text-xs uppercase tracking-wider">{row.label}</td>
                    <td className="px-4 py-3 text-center text-white/90 text-sm font-mono">{row.render}</td>
                    <td className="px-4 py-3 text-center text-white/90 text-sm font-mono">{row.fly}</td>
                    <td className="px-4 py-3 text-center text-white/90 text-sm font-mono">{row.railway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-violet-200 text-center pb-2">
        {t.footerNote}
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
                "name": "Render の料金は？無料プランはある？",
                "acceptedAnswer": { "@type": "Answer", "text": "静的サイトは無制限無料。Web サービスは $7/月から。無料プランは 15 分でスリープします。" },
              },
              {
                "@type": "Question",
                "name": "Fly.io の東京リージョンは使える？",
                "acceptedAnswer": { "@type": "Answer", "text": "Fly.io は東京（NRT）・大阪（ITM）リージョンが利用可能で、3 社で唯一日本リージョンがあります。" },
              },
              {
                "@type": "Question",
                "name": "Railway と Render の違いは？",
                "acceptedAnswer": { "@type": "Answer", "text": "Railway は秒単位従量課金で小規模に向き、Render はプラン固定課金で静的サイト無料ホスティングが強みです。" },
              },
              {
                "@type": "Question",
                "name": "3社でデータベース込みの最安は？",
                "acceptedAnswer": { "@type": "Answer", "text": "小規模なら Railway が従量課金で安いケースが多いです。Render DB Starter は $7/月固定です。" },
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
  "name": "Render / Fly / Railway 料金比較",
  "description": "Render・Fly.io・Railwayの料金・リソース・リージョンを横断比較",
  "url": "https://tools.loresync.dev/render-fly-railway-comparison",
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
