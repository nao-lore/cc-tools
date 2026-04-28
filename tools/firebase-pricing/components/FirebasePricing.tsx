"use client";

import { useState, useMemo } from "react";

// --- 料金定数 ---

// Spark（無料プラン）の無料枠
const SPARK = {
  firestore: {
    readsPerDay: 50_000,
    writesPerDay: 20_000,
    deletesPerDay: 20_000,
    storageGb: 1,
  },
  storage: {
    storageGb: 5,
    downloadGbPerDay: 1,
    uploadsPerDay: 50_000,
  },
  auth: {
    phoneMAU: 10_000,
    emailUnlimited: true,
  },
  hosting: {
    storageGb: 10,
    transferMbPerDay: 360,
  },
};

// Blaze（従量課金）の単価
const BLAZE = {
  firestore: {
    readPer100K: 0.06,      // $0.06 / 100,000 reads
    writePer100K: 0.18,     // $0.18 / 100,000 writes
    deletePer100K: 0.02,    // $0.02 / 100,000 deletes
    storagePerGb: 0.18,     // $0.18 / GB / month
  },
  storage: {
    storagePerGb: 0.026,    // $0.026 / GB
    downloadPerGb: 0.12,    // $0.12 / GB
  },
  functions: {
    invocationPer1M: 0.40,       // $0.40 / 1M invocations
    cpuPerMs: 0.0000025,         // $0.0000025 / ms (200MHz CPU)
    memoryPerMbMs: 0.0000025,    // $0.0000025 / MB-ms
    freeInvocations: 2_000_000,  // 2M/月無料
    freeCpuGhzSeconds: 400,      // 400 GHz-seconds/月 → 400,000 ms at 1GHz
    freeMemoryGbSeconds: 200,    // 200 GB-seconds/月
  },
  auth: {
    phonePerMAU: 0.06,           // $0.06/件（50K超え分）
    phoneFreeMAU: 50_000,
    samlOidcPerMAU: 0.015,
  },
  hosting: {
    storagePerGb: 0.026,
    transferPerGb: 0.15,
  },
};

type Lang = "ja" | "en";

// --- 翻訳定数 ---
const T = {
  ja: {
    // Plan
    selectPlan: "プランを選択",
    sparkFree: "無料",
    blazePay: "従量課金",
    sparkFeatures: ["Firestore: 読取50K/日, 書込20K/日", "Storage: 5GB, DL 1GB/日", "Functions: 利用不可", "Auth: メール/Google 無制限"],
    blazeFeatures: ["Firestore: $0.06/10万読取〜", "Storage: $0.026/GB〜", "Functions: 200万回/月無料〜", "クレジットカード登録必須"],
    // Services
    serviceUsage: "サービス別使用量",
    enabled: "有効",
    freeRange: "無料枠内",
    // Firestore
    readsPerDay: "読取 / 日",
    writesPerDay: "書込 / 日",
    deletesPerDay: "削除 / 日",
    storageCapacity: "ストレージ容量",
    storageHint: "Blaze: $0.18/GB/月",
    // Storage
    saveCapacity: "保存容量",
    saveHint: "Blaze: $0.026/GB/月",
    downloadPerMonth: "ダウンロード / 月",
    // Functions
    functionsBlaze: "Cloud Functions（Blazeのみ）",
    functionsSparkNote: "Cloud Functions は Blaze プランのみ利用できます。プランを Blaze に変更してください。",
    invocationsPerMonth: "実行回数 / 月",
    invocationsHint: "2,000,000回/月まで無料",
    avgExecTime: "平均実行時間",
    cpuMemHint: "CPU・メモリ料金の計算に使用",
    memoryAlloc: "メモリ割り当て",
    // Auth
    authPaidFeatures: "Authentication（有料機能）",
    authNote: "メール/Google/GitHub 等の認証は全プランで無制限無料。以下は有料機能のみ。",
    phoneAuthMAU: "電話（SMS）認証 MAU",
    phoneHint: "50,000 MAU/月まで無料。超過: $0.06/件",
    samlOidcMAU: "SAML/OIDC MAU",
    samlHint: "$0.015/MAU（無料枠なし）",
    // Hosting
    hostingStorage: "ホスティング容量",
    hostingStorageHint: "Spark: 10GBまで無料",
    hostingTransfer: "転送量 / 月",
    // Results
    monthlyEstimate: "月額試算結果",
    plan: "プラン",
    monthlyTotal: "月額合計（税別・USD）",
    free: "無料",
    sparkNote: "Spark プランは常に $0（無料枠を超えると利用がブロックされます）",
    breakdown: "料金内訳",
    allFree: "すべて無料枠内に収まっています 🎉",
    serviceShare: "サービス別割合",
    exchangeRate: "1 USD =",
    yen: "円",
    approx: "≈",
    perMonth: "/月",
    // Spark fit
    sparkFitTitle: "Spark vs Blaze 判断ガイド",
    sparkFitYes: "⚡ 現在の使用量は Spark プランで収まります",
    sparkFitYesDesc: "すべての使用量が Spark の無料枠内に収まっています。Spark プランからスタートするのがおすすめです。スケールが必要になったら Blaze へ移行しましょう。",
    sparkFitNo: "🔥 Spark の無料枠を超えています → Blaze が必要です",
    sparkFitNoDesc: "現在の使用量は Spark プランの無料枠を超えています。Blaze プランに移行してください。",
    switchToBlaze: "Blaze プランに切り替えて詳細を試算する →",
    // Table
    serviceResource: "サービス / リソース",
    sparkFreeQuota: "Spark 無料枠",
    blazeOverage: "Blaze 超過単価",
    tableRows: [
      { label: "Firestore 読取", free: "50,000回/日", unit: "$0.06/10万回" },
      { label: "Firestore 書込", free: "20,000回/日", unit: "$0.18/10万回" },
      { label: "Firestore Storage", free: "1GB", unit: "$0.18/GB/月" },
      { label: "Cloud Storage", free: "5GB", unit: "$0.026/GB/月" },
      { label: "Storage DL", free: "30GB/月", unit: "$0.12/GB" },
      { label: "Functions 実行", free: "なし（Blaze必須）", unit: "$0.40/100万回" },
      { label: "Functions 無料枠", free: "—", unit: "2M回/月 無料" },
      { label: "Auth 電話", free: "10,000 MAU", unit: "$0.06/件（50K超え）" },
      { label: "Hosting Storage", free: "10GB", unit: "$0.026/GB" },
      { label: "Hosting 転送", free: "~10.5GB/月", unit: "$0.15/GB" },
    ],
    // Breakdown labels
    firestoreReadOver: "Firestore 読取超過",
    firestoreWriteOver: "Firestore 書込超過",
    firestoreDeleteOver: "Firestore 削除超過",
    firestoreStorageOver: "Firestore Storage超過",
    storageOver: "Storage 保存超過",
    storageDownloadOver: "Storage ダウンロード超過",
    functionsInvocOver: "Functions 実行回数超過",
    functionsCpu: "Functions CPU",
    functionsMemory: "Functions メモリ",
    functionsFreeRange: "Functions（無料枠内）",
    authPhoneOver: "Auth 電話認証超過",
    authSaml: "Auth SAML/OIDC",
    hostingStorageOver: "Hosting Storage超過",
    hostingTransferOver: "Hosting 転送超過",
    monthlyTotalLabel: "月額合計",
    // Badge labels
    times: "回",
    mau: "MAU",
    gb: "GB",
    overSuffix: "超過",
    withinFree: "枠内",
    // Guide
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "プランを選択", desc: "開発中は Spark（無料）、本番運用は Blaze（従量課金）を選びましょう。Blaze でもほとんどの小規模アプリは無料枠内に収まります。" },
      { step: "2", title: "使用するサービスをオン", desc: "Firestore・Cloud Storage など、実際に使うサービスのトグルをオンにします。使わないサービスはオフのままで構いません。" },
      { step: "3", title: "使用量を入力", desc: "スライダーまたは数値入力で、1日あたりの読み書き回数やストレージ容量を入力します。実際のアクセスログやモニタリングデータを参考にしてください。" },
      { step: "4", title: "月額コストを確認", desc: "為替レートを調整して円換算額を確認します。内訳バーでどのサービスがコストを押し上げているかを把握し、最適化に役立ててください。" },
    ],
    // FAQ
    faqTitle: "よくある質問（FAQ）",
    faq: [
      {
        q: "Firebase の無料プラン（Spark）でできることは？",
        a: "Firestore の読取 50,000回/日・書込 20,000回/日、Cloud Storage 5GB、Firebase Hosting 10GB など豊富な無料枠があります。メール・Google 認証は実質無制限で利用できます。小規模アプリや個人開発には十分なケースが多いです。",
      },
      {
        q: "Blaze プランに変更すると必ず料金が発生する？",
        a: "いいえ。Blaze プランはクレジットカード登録が必要ですが、Spark と同じ無料枠が引き続き適用されます。無料枠を超えた分だけ課金されるため、使用量が少なければ $0 のままです。Cloud Functions を使いたい場合は Blaze が必須です。",
      },
      {
        q: "Firestore のコストを抑えるには？",
        a: "最も効果的なのは読取回数の削減です。クライアント側のキャッシュ活用・クエリの絞り込み・リアルタイムリスナーの適切な解除が有効です。また、1 ドキュメントに複数フィールドをまとめることで読取回数を減らせます。",
      },
      {
        q: "Firebase と Supabase、どちらが安い？",
        a: "小規模では Firebase の無料枠が広く有利です。Supabase は月額 $25 の Pro プランから始まりますが、PostgreSQL ベースで複雑なクエリが使いやすい利点があります。MAU 10 万以上になると Supabase の従量単価が低くなる傾向があります。",
      },
      {
        q: "Firebase の料金はドル建て？日本円では？",
        a: "Firebase の料金は USD 建てです。このツールの為替レート欄で任意のレートを設定し、日本円換算額をご確認ください。請求は Google Cloud の請求書（Google アカウント）を通じて行われます。",
      },
    ],
    // Related
    relatedTools: "関連ツール",
    relatedLinks: [
      { href: "/supabase-pricing", title: "Supabase 料金計算", desc: "Firebase の代替として人気の BaaS。PostgreSQL ベースのコスト試算。" },
      { href: "/gcp-pricing", title: "GCP 料金計算", desc: "Firebase の基盤となる Google Cloud Platform 全体のコスト試算。" },
      { href: "/auth-service-comparison", title: "Auth サービス比較", desc: "Auth0・Clerk・Firebase Auth・Supabase Auth を MAU 別に比較。" },
    ],
    // Footer
    footerNote: "料金は変更される場合があります。最新情報は",
    footerLink: "firebase.google.com/pricing",
    footerNote2: "でご確認ください。Firestore は日次無料枠×30日で月換算。Functions の CPU/メモリ計算は概算です。",
    // Units
    unitPerDay: "回/日",
    unitPerMonth: "回",
    unitGb: "GB",
    unitMs: "ms",
    unitPeople: "人",
    downloadHint: "Blaze: $0.12/GB。Spark無料枠 = 1GB/日 × 30日 = 30GB/月",
  },
  en: {
    // Plan
    selectPlan: "Select Plan",
    sparkFree: "Free",
    blazePay: "Pay-as-you-go",
    sparkFeatures: ["Firestore: 50K reads/day, 20K writes/day", "Storage: 5GB, DL 1GB/day", "Functions: Not available", "Auth: Email/Google unlimited"],
    blazeFeatures: ["Firestore: $0.06/100K reads~", "Storage: $0.026/GB~", "Functions: 2M/mo free~", "Credit card required"],
    // Services
    serviceUsage: "Service Usage",
    enabled: "Active",
    freeRange: "Within free tier",
    // Firestore
    readsPerDay: "Reads / Day",
    writesPerDay: "Writes / Day",
    deletesPerDay: "Deletes / Day",
    storageCapacity: "Storage",
    storageHint: "Blaze: $0.18/GB/mo",
    // Storage
    saveCapacity: "Storage",
    saveHint: "Blaze: $0.026/GB/mo",
    downloadPerMonth: "Download / Month",
    // Functions
    functionsBlaze: "Cloud Functions (Blaze only)",
    functionsSparkNote: "Cloud Functions requires the Blaze plan. Please switch to Blaze.",
    invocationsPerMonth: "Invocations / Month",
    invocationsHint: "First 2,000,000/mo are free",
    avgExecTime: "Avg Execution Time",
    cpuMemHint: "Used to calculate CPU & memory cost",
    memoryAlloc: "Memory Allocation",
    // Auth
    authPaidFeatures: "Authentication (paid features)",
    authNote: "Email/Google/GitHub auth is free & unlimited on all plans. Only paid features below.",
    phoneAuthMAU: "Phone (SMS) Auth MAU",
    phoneHint: "50,000 MAU/mo free. Overage: $0.06/MAU",
    samlOidcMAU: "SAML/OIDC MAU",
    samlHint: "$0.015/MAU (no free tier)",
    // Hosting
    hostingStorage: "Hosting Storage",
    hostingStorageHint: "Spark: 10GB free",
    hostingTransfer: "Transfer / Month",
    // Results
    monthlyEstimate: "Monthly Estimate",
    plan: "Plan",
    monthlyTotal: "Monthly Total (excl. tax, USD)",
    free: "Free",
    sparkNote: "Spark plan is always $0 (usage is blocked when limits are exceeded)",
    breakdown: "Cost Breakdown",
    allFree: "All usage within free tier 🎉",
    serviceShare: "Share by Service",
    exchangeRate: "1 USD =",
    yen: "JPY",
    approx: "≈",
    perMonth: "/mo",
    // Spark fit
    sparkFitTitle: "Spark vs Blaze Guide",
    sparkFitYes: "⚡ Current usage fits within the Spark plan",
    sparkFitYesDesc: "All usage is within Spark's free tier. We recommend starting with Spark and migrating to Blaze when you need to scale.",
    sparkFitNo: "🔥 Exceeds Spark free tier → Blaze required",
    sparkFitNoDesc: "Current usage exceeds Spark's free tier. Please migrate to the Blaze plan.",
    switchToBlaze: "Switch to Blaze and estimate →",
    // Table
    serviceResource: "Service / Resource",
    sparkFreeQuota: "Spark Free Tier",
    blazeOverage: "Blaze Overage Rate",
    tableRows: [
      { label: "Firestore Reads", free: "50,000/day", unit: "$0.06/100K" },
      { label: "Firestore Writes", free: "20,000/day", unit: "$0.18/100K" },
      { label: "Firestore Storage", free: "1GB", unit: "$0.18/GB/mo" },
      { label: "Cloud Storage", free: "5GB", unit: "$0.026/GB/mo" },
      { label: "Storage DL", free: "30GB/mo", unit: "$0.12/GB" },
      { label: "Functions Invoc.", free: "None (Blaze req.)", unit: "$0.40/1M" },
      { label: "Functions Free", free: "—", unit: "2M/mo free" },
      { label: "Auth Phone", free: "10,000 MAU", unit: "$0.06/MAU (>50K)" },
      { label: "Hosting Storage", free: "10GB", unit: "$0.026/GB" },
      { label: "Hosting Transfer", free: "~10.5GB/mo", unit: "$0.15/GB" },
    ],
    // Breakdown labels
    firestoreReadOver: "Firestore Read Overage",
    firestoreWriteOver: "Firestore Write Overage",
    firestoreDeleteOver: "Firestore Delete Overage",
    firestoreStorageOver: "Firestore Storage Overage",
    storageOver: "Storage Overage",
    storageDownloadOver: "Storage Download Overage",
    functionsInvocOver: "Functions Invocation Overage",
    functionsCpu: "Functions CPU",
    functionsMemory: "Functions Memory",
    functionsFreeRange: "Functions (within free tier)",
    authPhoneOver: "Auth Phone Overage",
    authSaml: "Auth SAML/OIDC",
    hostingStorageOver: "Hosting Storage Overage",
    hostingTransferOver: "Hosting Transfer Overage",
    monthlyTotalLabel: "Monthly Total",
    // Badge labels
    times: "",
    mau: "MAU",
    gb: "GB",
    overSuffix: "over",
    withinFree: "within free",
    // Guide
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Select Plan", desc: "Use Spark (free) during development, Blaze (pay-as-you-go) for production. Most small apps stay within the free tier even on Blaze." },
      { step: "2", title: "Enable Services", desc: "Toggle on the services you actually use — Firestore, Cloud Storage, etc. Leave unused services off." },
      { step: "3", title: "Enter Usage", desc: "Use sliders or number inputs to enter daily read/write counts and storage. Refer to access logs or monitoring data for accuracy." },
      { step: "4", title: "Check Monthly Cost", desc: "Adjust the exchange rate to see the JPY equivalent. Use the service share bar to identify cost drivers and optimize." },
    ],
    // FAQ
    faqTitle: "FAQ",
    faq: [
      {
        q: "What can I do on Firebase's free plan (Spark)?",
        a: "Spark includes 50,000 Firestore reads/day, 20,000 writes/day, 5GB Cloud Storage, 10GB Hosting, and effectively unlimited email/Google authentication. It's sufficient for most small apps and personal projects.",
      },
      {
        q: "Will I be charged immediately after switching to Blaze?",
        a: "No. Blaze requires a credit card, but the same free tier as Spark still applies. You're only charged for usage beyond the free tier — if usage is low, you'll still pay $0. Blaze is required to use Cloud Functions.",
      },
      {
        q: "How can I reduce Firestore costs?",
        a: "The most effective approach is reducing read counts. Use client-side caching, narrow your queries, and properly unsubscribe real-time listeners. Consolidating multiple fields into one document also reduces reads.",
      },
      {
        q: "Firebase vs Supabase — which is cheaper?",
        a: "For small scale, Firebase's free tier is broader. Supabase starts at $25/mo (Pro) but offers PostgreSQL for complex queries. Above ~100K MAU, Supabase's per-unit pricing tends to be lower.",
      },
      {
        q: "Is Firebase pricing in USD? What about JPY?",
        a: "Firebase is billed in USD via your Google Cloud account. Use the exchange rate field in this tool to see the JPY equivalent at any rate.",
      },
    ],
    // Related
    relatedTools: "Related Tools",
    relatedLinks: [
      { href: "/supabase-pricing", title: "Supabase Pricing", desc: "Popular Firebase alternative BaaS. Cost estimate for PostgreSQL-based apps." },
      { href: "/gcp-pricing", title: "GCP Pricing Calculator", desc: "Estimate costs across Google Cloud Platform — the infrastructure behind Firebase." },
      { href: "/auth-service-comparison", title: "Auth Service Comparison", desc: "Compare Auth0, Clerk, Firebase Auth, and Supabase Auth by MAU." },
    ],
    // Footer
    footerNote: "Pricing may change. Check ",
    footerLink: "firebase.google.com/pricing",
    footerNote2: " for the latest. Firestore daily quotas are multiplied by 30 for monthly estimates. Functions CPU/memory are approximate.",
    // Units
    unitPerDay: "/day",
    unitPerMonth: "",
    unitGb: "GB",
    unitMs: "ms",
    unitPeople: "people",
    downloadHint: "Blaze: $0.12/GB. Spark free = 1GB/day × 30 = 30GB/mo",
  },
} as const;

// --- ユーティリティ ---
function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.001) return `$${n.toFixed(5)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

// 超過コスト計算（線形）
function overageCost(used: number, free: number, ratePerUnit: number, unitSize: number): number {
  if (used <= free) return 0;
  return ((used - free) / unitSize) * ratePerUnit;
}

// --- バッジ ---
function UsageBadge({ used, included, unit, lang }: { used: number; included: number; unit: string; lang: Lang }) {
  const t = T[lang];
  const over = used > included;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        over
          ? "bg-red-500/20 text-red-300 border border-red-500/30"
          : "bg-amber-500/15 text-amber-300 border border-amber-500/25"
      }`}
    >
      {over
        ? `+${fmtNum(used - included)} ${unit} ${t.overSuffix}`
        : `${t.withinFree} (${fmtNum(included)} ${unit})`}
    </span>
  );
}

// --- トグル付きセクション ---
function ServiceSection({
  enabled,
  onToggle,
  label,
  badge,
  children,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl transition-all ${enabled ? "glass-card-bright border-violet-500/20" : "glass-card"}`}
      style={{ border: enabled ? "1px solid rgba(139,92,246,0.2)" : undefined }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              enabled ? "border-violet-400 bg-violet-500" : "border-white/20 bg-white/5"
            }`}
          >
            {enabled && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={`font-semibold text-base ${enabled ? "text-white" : "text-violet-200/60"}`}>{label}</span>
        </div>
        {badge}
      </button>
      {enabled && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

// --- スライダー付き数値入力 ---
function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  hint,
  badge,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-violet-100 uppercase tracking-wider">{label}</label>
        {badge}
      </div>
      {hint && <p className="text-xs text-violet-200/60 mb-1">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(value, max)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 cursor-pointer"
        />
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={min}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v >= 0) onChange(v);
            }}
            className="number-input w-28 px-2 py-1.5 text-right rounded-xl text-sm font-mono neon-focus"
          />
          {unit && <span className="text-xs text-violet-200 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function FirebasePricing() {
  const [lang, setLang] = useState<Lang>("ja");
  const t = T[lang];

  const [plan, setPlan] = useState<"spark" | "blaze">("blaze");
  const [exchangeRate, setExchangeRate] = useState(150);

  // Firestore
  const [fsEnabled, setFsEnabled] = useState(true);
  const [fsReadsPerDay, setFsReadsPerDay] = useState(100_000);
  const [fsWritesPerDay, setFsWritesPerDay] = useState(30_000);
  const [fsDeletesPerDay, setFsDeletesPerDay] = useState(5_000);
  const [fsStorageGb, setFsStorageGb] = useState(2);

  // Storage
  const [stEnabled, setStEnabled] = useState(true);
  const [stStorageGb, setStStorageGb] = useState(10);
  const [stDownloadGb, setStDownloadGb] = useState(5); // per month

  // Functions
  const [fnEnabled, setFnEnabled] = useState(false);
  const [fnInvocations, setFnInvocations] = useState(5_000_000);
  const [fnAvgMs, setFnAvgMs] = useState(200); // avg execution ms
  const [fnMemoryMb, setFnMemoryMb] = useState(256);

  // Auth (Blaze extras)
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authPhoneMAU, setAuthPhoneMAU] = useState(0);
  const [authSamlMAU, setAuthSamlMAU] = useState(0);

  // Hosting
  const [hostEnabled, setHostEnabled] = useState(false);
  const [hostStorageGb, setHostStorageGb] = useState(1);
  const [hostTransferGb, setHostTransferGb] = useState(5);

  const result = useMemo(() => {
    if (plan === "spark") {
      return {
        firestore: 0,
        storage: 0,
        functions: 0,
        auth: 0,
        hosting: 0,
        total: 0,
        breakdown: [] as { label: string; cost: number; note: string }[],
      };
    }

    const breakdown: { label: string; cost: number; note: string }[] = [];

    // Firestore（月換算: 日次 × 30）
    let fsCost = 0;
    if (fsEnabled) {
      const readsMonth = fsReadsPerDay * 30;
      const writesMonth = fsWritesPerDay * 30;
      const deletesMonth = fsDeletesPerDay * 30;
      const freeReads = SPARK.firestore.readsPerDay * 30;
      const freeWrites = SPARK.firestore.writesPerDay * 30;
      const freeDeletes = SPARK.firestore.deletesPerDay * 30;

      const readCost = overageCost(readsMonth, freeReads, BLAZE.firestore.readPer100K, 100_000);
      const writeCost = overageCost(writesMonth, freeWrites, BLAZE.firestore.writePer100K, 100_000);
      const deleteCost = overageCost(deletesMonth, freeDeletes, BLAZE.firestore.deletePer100K, 100_000);
      const storageCost = overageCost(fsStorageGb, SPARK.firestore.storageGb, BLAZE.firestore.storagePerGb, 1);

      fsCost = readCost + writeCost + deleteCost + storageCost;
      if (readCost > 0) breakdown.push({ label: t.firestoreReadOver, cost: readCost, note: `${fmtNum(readsMonth - freeReads)}${t.times}` });
      if (writeCost > 0) breakdown.push({ label: t.firestoreWriteOver, cost: writeCost, note: `${fmtNum(writesMonth - freeWrites)}${t.times}` });
      if (deleteCost > 0) breakdown.push({ label: t.firestoreDeleteOver, cost: deleteCost, note: `${fmtNum(deletesMonth - freeDeletes)}${t.times}` });
      if (storageCost > 0) breakdown.push({ label: t.firestoreStorageOver, cost: storageCost, note: `${(fsStorageGb - SPARK.firestore.storageGb).toFixed(1)}GB` });
    }

    // Storage
    let stCost = 0;
    if (stEnabled) {
      const storageCost = overageCost(stStorageGb, SPARK.storage.storageGb, BLAZE.storage.storagePerGb, 1);
      const downloadCost = overageCost(stDownloadGb, SPARK.storage.downloadGbPerDay * 30, BLAZE.storage.downloadPerGb, 1);
      stCost = storageCost + downloadCost;
      if (storageCost > 0) breakdown.push({ label: t.storageOver, cost: storageCost, note: `${(stStorageGb - SPARK.storage.storageGb).toFixed(1)}GB` });
      if (downloadCost > 0) breakdown.push({ label: t.storageDownloadOver, cost: downloadCost, note: `${(stDownloadGb - SPARK.storage.downloadGbPerDay * 30).toFixed(1)}GB` });
    }

    // Functions（Blazeのみ）
    let fnCost = 0;
    if (fnEnabled) {
      const invocCost = overageCost(fnInvocations, BLAZE.functions.freeInvocations, BLAZE.functions.invocationPer1M, 1_000_000);
      const cpuMs = fnInvocations * fnAvgMs * 0.2;
      const freeCpuMs = BLAZE.functions.freeCpuGhzSeconds * 1000;
      const cpuCost = Math.max(0, cpuMs - freeCpuMs) * BLAZE.functions.cpuPerMs;
      const memMbMs = fnInvocations * fnAvgMs * fnMemoryMb;
      const freeMemMbMs = BLAZE.functions.freeMemoryGbSeconds * 1024 * 1000;
      const memCost = Math.max(0, memMbMs - freeMemMbMs) * BLAZE.functions.memoryPerMbMs;
      fnCost = invocCost + cpuCost + memCost;
      if (invocCost > 0) breakdown.push({ label: t.functionsInvocOver, cost: invocCost, note: `${fmtNum(fnInvocations - BLAZE.functions.freeInvocations)}${t.times}` });
      if (cpuCost > 0) breakdown.push({ label: t.functionsCpu, cost: cpuCost, note: `${(cpuMs / 1000).toFixed(0)}K CPU-ms` });
      if (memCost > 0) breakdown.push({ label: t.functionsMemory, cost: memCost, note: `${fnMemoryMb}MB × ${fmtNum(fnInvocations)}${t.times}` });
      if (fnCost === 0 && fnInvocations > 0) breakdown.push({ label: t.functionsFreeRange, cost: 0, note: `${fmtNum(fnInvocations)}${t.times} / 2M${lang === "ja" ? "枠内" : " free tier"}` });
    }

    // Auth
    let authCost = 0;
    if (authEnabled) {
      const phoneCost = overageCost(authPhoneMAU, BLAZE.auth.phoneFreeMAU, BLAZE.auth.phonePerMAU, 1);
      const samlCost = authSamlMAU > 0 ? authSamlMAU * BLAZE.auth.samlOidcPerMAU : 0;
      authCost = phoneCost + samlCost;
      if (phoneCost > 0) breakdown.push({ label: t.authPhoneOver, cost: phoneCost, note: `${fmtNum(authPhoneMAU - BLAZE.auth.phoneFreeMAU)}MAU` });
      if (samlCost > 0) breakdown.push({ label: t.authSaml, cost: samlCost, note: `${fmtNum(authSamlMAU)}MAU` });
    }

    // Hosting
    let hostCost = 0;
    if (hostEnabled) {
      const storageCost = overageCost(hostStorageGb, SPARK.hosting.storageGb, BLAZE.hosting.storagePerGb, 1);
      const transferGbFree = (SPARK.hosting.transferMbPerDay * 30) / 1024;
      const transferCost = overageCost(hostTransferGb, transferGbFree, BLAZE.hosting.transferPerGb, 1);
      hostCost = storageCost + transferCost;
      if (storageCost > 0) breakdown.push({ label: t.hostingStorageOver, cost: storageCost, note: `${(hostStorageGb - SPARK.hosting.storageGb).toFixed(1)}GB` });
      if (transferCost > 0) breakdown.push({ label: t.hostingTransferOver, cost: transferCost, note: `${(hostTransferGb - transferGbFree).toFixed(1)}GB` });
    }

    const total = fsCost + stCost + fnCost + authCost + hostCost;
    return { firestore: fsCost, storage: stCost, functions: fnCost, auth: authCost, hosting: hostCost, total, breakdown };
  }, [
    plan, fsEnabled, fsReadsPerDay, fsWritesPerDay, fsDeletesPerDay, fsStorageGb,
    stEnabled, stStorageGb, stDownloadGb,
    fnEnabled, fnInvocations, fnAvgMs, fnMemoryMb,
    authEnabled, authPhoneMAU, authSamlMAU,
    hostEnabled, hostStorageGb, hostTransferGb,
    t, lang,
  ]);

  // Spark vs Blaze 損益分岐
  const sparkFit = useMemo(() => {
    if (!fsEnabled) return true;
    const readsOk = fsReadsPerDay <= SPARK.firestore.readsPerDay;
    const writesOk = fsWritesPerDay <= SPARK.firestore.writesPerDay;
    const deletesOk = fsDeletesPerDay <= SPARK.firestore.deletesPerDay;
    const storageOk = fsStorageGb <= SPARK.firestore.storageGb;
    const stOk = !stEnabled || (stStorageGb <= SPARK.storage.storageGb && stDownloadGb <= SPARK.storage.downloadGbPerDay * 30);
    const hostOk = !hostEnabled || (hostStorageGb <= SPARK.hosting.storageGb && hostTransferGb <= (SPARK.hosting.transferMbPerDay * 30) / 1024);
    return readsOk && writesOk && deletesOk && storageOk && stOk && hostOk;
  }, [fsEnabled, fsReadsPerDay, fsWritesPerDay, fsDeletesPerDay, fsStorageGb, stEnabled, stStorageGb, stDownloadGb, hostEnabled, hostStorageGb, hostTransferGb]);

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
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* ===== プラン選択 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.selectPlan}</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["spark", "blaze"] as const).map((p) => {
            const selected = plan === p;
            const isSpark = p === "spark";
            return (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`method-btn p-5 rounded-xl border text-left transition-all duration-200 ${
                  selected ? "method-btn-active border-violet-500/60" : "border-white/8 hover:border-violet-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{isSpark ? "⚡" : "🔥"}</span>
                  <span className={`font-bold text-lg ${selected ? "text-violet-100" : "text-white/90"}`}>{isSpark ? "Spark" : "Blaze"}</span>
                </div>
                <div className={`text-2xl font-bold mb-2 font-mono ${selected ? "text-white glow-text" : "text-white/80"}`}>
                  {isSpark ? t.sparkFree : t.blazePay}
                </div>
                <ul className="text-xs text-violet-200 space-y-0.5">
                  {(isSpark ? t.sparkFeatures : t.blazeFeatures).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== サービス別使用量 ===== */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest px-1">{t.serviceUsage}</h2>

        {/* Firestore */}
        <ServiceSection
          enabled={fsEnabled}
          onToggle={() => setFsEnabled((v) => !v)}
          label="Cloud Firestore"
          badge={
            fsEnabled && plan === "blaze" && result.firestore > 0 ? (
              <span className="text-xs font-semibold text-red-400 font-mono">{fmtUSD(result.firestore)}/mo</span>
            ) : fsEnabled ? (
              <span className="text-xs font-medium text-amber-300">{t.enabled}</span>
            ) : undefined
          }
        >
          <SliderField
            label={t.readsPerDay}
            value={fsReadsPerDay}
            onChange={setFsReadsPerDay}
            min={0}
            max={1_000_000}
            step={10_000}
            unit={t.unitPerDay}
            badge={<UsageBadge used={fsReadsPerDay} included={SPARK.firestore.readsPerDay} unit={t.unitPerDay} lang={lang} />}
          />
          <SliderField
            label={t.writesPerDay}
            value={fsWritesPerDay}
            onChange={setFsWritesPerDay}
            min={0}
            max={500_000}
            step={5_000}
            unit={t.unitPerDay}
            badge={<UsageBadge used={fsWritesPerDay} included={SPARK.firestore.writesPerDay} unit={t.unitPerDay} lang={lang} />}
          />
          <SliderField
            label={t.deletesPerDay}
            value={fsDeletesPerDay}
            onChange={setFsDeletesPerDay}
            min={0}
            max={200_000}
            step={1_000}
            unit={t.unitPerDay}
            badge={<UsageBadge used={fsDeletesPerDay} included={SPARK.firestore.deletesPerDay} unit={t.unitPerDay} lang={lang} />}
          />
          <SliderField
            label={t.storageCapacity}
            value={fsStorageGb}
            onChange={setFsStorageGb}
            min={0}
            max={100}
            step={0.5}
            unit={t.unitGb}
            hint={t.storageHint}
            badge={<UsageBadge used={fsStorageGb} included={SPARK.firestore.storageGb} unit="GB" lang={lang} />}
          />
        </ServiceSection>

        {/* Storage */}
        <ServiceSection
          enabled={stEnabled}
          onToggle={() => setStEnabled((v) => !v)}
          label="Cloud Storage"
          badge={
            stEnabled && plan === "blaze" && result.storage > 0 ? (
              <span className="text-xs font-semibold text-red-400 font-mono">{fmtUSD(result.storage)}/mo</span>
            ) : stEnabled ? (
              <span className="text-xs font-medium text-amber-300">{t.enabled}</span>
            ) : undefined
          }
        >
          <SliderField
            label={t.saveCapacity}
            value={stStorageGb}
            onChange={setStStorageGb}
            min={0}
            max={500}
            step={1}
            unit={t.unitGb}
            hint={t.saveHint}
            badge={<UsageBadge used={stStorageGb} included={SPARK.storage.storageGb} unit="GB" lang={lang} />}
          />
          <SliderField
            label={t.downloadPerMonth}
            value={stDownloadGb}
            onChange={setStDownloadGb}
            min={0}
            max={1000}
            step={1}
            unit={t.unitGb}
            hint={t.downloadHint}
            badge={<UsageBadge used={stDownloadGb} included={SPARK.storage.downloadGbPerDay * 30} unit="GB/mo" lang={lang} />}
          />
        </ServiceSection>

        {/* Functions */}
        <ServiceSection
          enabled={fnEnabled}
          onToggle={() => setFnEnabled((v) => !v)}
          label={t.functionsBlaze}
          badge={
            fnEnabled && result.functions > 0 ? (
              <span className="text-xs font-semibold text-red-400 font-mono">{fmtUSD(result.functions)}/mo</span>
            ) : fnEnabled ? (
              <span className="text-xs font-medium text-emerald-400">{t.freeRange}</span>
            ) : undefined
          }
        >
          {plan === "spark" && (
            <div className="p-3 glass-card rounded-xl text-sm text-amber-300 border border-amber-500/20">
              {t.functionsSparkNote}
            </div>
          )}
          {plan === "blaze" && (
            <>
              <SliderField
                label={t.invocationsPerMonth}
                value={fnInvocations}
                onChange={setFnInvocations}
                min={0}
                max={50_000_000}
                step={100_000}
                unit={t.unitPerMonth}
                hint={t.invocationsHint}
                badge={<UsageBadge used={fnInvocations} included={BLAZE.functions.freeInvocations} unit={lang === "ja" ? "回" : ""} lang={lang} />}
              />
              <SliderField
                label={t.avgExecTime}
                value={fnAvgMs}
                onChange={setFnAvgMs}
                min={10}
                max={10_000}
                step={10}
                unit={t.unitMs}
                hint={t.cpuMemHint}
              />
              <div>
                <label className="block text-xs font-medium text-violet-100 uppercase tracking-wider mb-2">{t.memoryAlloc}</label>
                <div className="flex flex-wrap gap-2">
                  {[128, 256, 512, 1024, 2048, 4096].map((mb) => (
                    <button
                      key={mb}
                      onClick={() => setFnMemoryMb(mb)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-mono ${
                        fnMemoryMb === mb
                          ? "preset-active"
                          : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
                      }`}
                    >
                      {mb >= 1024 ? `${mb / 1024}GB` : `${mb}MB`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </ServiceSection>

        {/* Auth */}
        <ServiceSection
          enabled={authEnabled}
          onToggle={() => setAuthEnabled((v) => !v)}
          label={t.authPaidFeatures}
          badge={
            authEnabled && result.auth > 0 ? (
              <span className="text-xs font-semibold text-red-400 font-mono">{fmtUSD(result.auth)}/mo</span>
            ) : authEnabled ? (
              <span className="text-xs font-medium text-emerald-400">{t.freeRange}</span>
            ) : undefined
          }
        >
          <p className="text-xs text-violet-200/70">{t.authNote}</p>
          <SliderField
            label={t.phoneAuthMAU}
            value={authPhoneMAU}
            onChange={setAuthPhoneMAU}
            min={0}
            max={500_000}
            step={1_000}
            unit={t.unitPeople}
            hint={t.phoneHint}
            badge={<UsageBadge used={authPhoneMAU} included={BLAZE.auth.phoneFreeMAU} unit="MAU" lang={lang} />}
          />
          <SliderField
            label={t.samlOidcMAU}
            value={authSamlMAU}
            onChange={setAuthSamlMAU}
            min={0}
            max={100_000}
            step={100}
            unit={t.unitPeople}
            hint={t.samlHint}
          />
        </ServiceSection>

        {/* Hosting */}
        <ServiceSection
          enabled={hostEnabled}
          onToggle={() => setHostEnabled((v) => !v)}
          label="Firebase Hosting"
          badge={
            hostEnabled && plan === "blaze" && result.hosting > 0 ? (
              <span className="text-xs font-semibold text-red-400 font-mono">{fmtUSD(result.hosting)}/mo</span>
            ) : hostEnabled ? (
              <span className="text-xs font-medium text-amber-300">{t.enabled}</span>
            ) : undefined
          }
        >
          <SliderField
            label={t.hostingStorage}
            value={hostStorageGb}
            onChange={setHostStorageGb}
            min={0}
            max={100}
            step={0.5}
            unit={t.unitGb}
            hint={t.hostingStorageHint}
            badge={<UsageBadge used={hostStorageGb} included={SPARK.hosting.storageGb} unit="GB" lang={lang} />}
          />
          <SliderField
            label={t.hostingTransfer}
            value={hostTransferGb}
            onChange={setHostTransferGb}
            min={0}
            max={500}
            step={1}
            unit={t.unitGb}
            hint={`Spark: ${((SPARK.hosting.transferMbPerDay * 30) / 1024).toFixed(1)}GB/mo free`}
            badge={<UsageBadge used={hostTransferGb} included={(SPARK.hosting.transferMbPerDay * 30) / 1024} unit="GB/mo" lang={lang} />}
          />
        </ServiceSection>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
        <div className="flex items-center justify-between mb-5">
          <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.monthlyEstimate}</div>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
            plan === "spark"
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-violet-500/15 text-violet-300 border-violet-500/30"
          }`}>
            {plan === "spark" ? "⚡ Spark" : "🔥 Blaze"} {t.plan}
          </span>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-violet-200 mb-2">{t.monthlyTotal}</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-white glow-text tracking-tight font-mono">
              {plan === "spark" ? t.free : fmtUSD(result.total)}
            </span>
            {plan === "blaze" && (
              <span className="text-xl text-violet-100 font-mono">{fmtJPY(result.total * exchangeRate)}</span>
            )}
          </div>
          {plan === "spark" && (
            <p className="text-xs text-amber-300 mt-2 glass-card rounded-xl px-4 py-2.5 border border-amber-500/20">{t.sparkNote}</p>
          )}
        </div>

        {/* 内訳 */}
        {plan === "blaze" && (
          <div className="glass-card rounded-xl p-4 space-y-2 text-sm mb-4">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-wider mb-2">{t.breakdown}</div>

            {result.breakdown.length === 0 ? (
              <div className="text-emerald-400 text-xs py-1">{t.allFree}</div>
            ) : (
              result.breakdown.map((item, i) => (
                <div key={i} className={`flex justify-between ${item.cost > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  <span className="text-xs">{item.label}{item.note ? ` (${item.note})` : ""}</span>
                  <span className="font-medium font-mono text-xs">{item.cost > 0 ? fmtUSD(item.cost) : t.free}</span>
                </div>
              ))
            )}

            {result.total > 0 && (
              <div className="border-t border-white/10 pt-2 mt-1 flex justify-between font-semibold text-white/90">
                <span className="text-xs">{t.monthlyTotalLabel}</span>
                <span className="font-mono text-xs">{fmtUSD(result.total)}</span>
              </div>
            )}
          </div>
        )}

        {/* サービス別内訳バー */}
        {plan === "blaze" && result.total > 0 && (
          <div className="glass-card rounded-xl p-4 mb-4">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-wider mb-3">{t.serviceShare}</div>
            <div className="space-y-2">
              {[
                { label: "Firestore", cost: result.firestore, color: "bg-blue-400" },
                { label: "Storage", cost: result.storage, color: "bg-emerald-400" },
                { label: "Functions", cost: result.functions, color: "bg-violet-400" },
                { label: "Auth", cost: result.auth, color: "bg-amber-400" },
                { label: "Hosting", cost: result.hosting, color: "bg-pink-400" },
              ]
                .filter((s) => s.cost > 0)
                .map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <span className="w-20 text-violet-200 text-xs shrink-0">{s.label}</span>
                    <div className="flex-1 rounded-full h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div
                        className={`h-2 rounded-full ${s.color}`}
                        style={{ width: `${Math.min((s.cost / result.total) * 100, 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-medium text-white/90 text-xs font-mono">{fmtUSD(s.cost)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 為替換算 */}
        {plan === "blaze" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-violet-200 whitespace-nowrap">{t.exchangeRate}</span>
            <input
              type="number"
              min={50}
              max={300}
              step={1}
              value={exchangeRate}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v) && v > 0) setExchangeRate(v);
              }}
              className="number-input w-24 px-2 py-1.5 text-right rounded-xl text-sm font-mono neon-focus"
            />
            <span className="text-xs text-violet-200">{t.yen}</span>
            <span className="text-sm text-white/90 font-medium font-mono ml-auto">
              {t.approx} {fmtJPY(result.total * exchangeRate)}{t.perMonth}
            </span>
          </div>
        )}
      </div>

      {/* ===== Spark vs Blaze 損益分岐 ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.sparkFitTitle}</h2>

        {sparkFit ? (
          <div className="p-4 glass-card rounded-xl border border-amber-500/20 mb-4">
            <div className="font-medium text-amber-300 mb-1 text-sm">{t.sparkFitYes}</div>
            <p className="text-xs text-violet-100">{t.sparkFitYesDesc}</p>
          </div>
        ) : (
          <div className="p-4 glass-card rounded-xl border border-violet-500/25 mb-4">
            <div className="font-medium text-violet-300 mb-1 text-sm">{t.sparkFitNo}</div>
            <p className="text-xs text-violet-100">
              {t.sparkFitNoDesc}
              {plan === "blaze" && result.total > 0 && ` ${t.approx}: ${fmtUSD(result.total)}`}
            </p>
            {plan === "spark" && (
              <button
                onClick={() => setPlan("blaze")}
                className="mt-2 text-xs font-medium text-violet-300 underline hover:text-violet-100"
              >
                {t.switchToBlaze}
              </button>
            )}
          </div>
        )}

        {/* 比較テーブル */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.serviceResource}</th>
                <th className="text-right py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.sparkFreeQuota}</th>
                <th className="text-right py-2.5 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.blazeOverage}</th>
              </tr>
            </thead>
            <tbody>
              {t.tableRows.map((row) => (
                <tr key={row.label} className="border-b border-white/5 table-row-stripe">
                  <td className="py-2.5 pr-4 font-medium text-white/90 text-xs">{row.label}</td>
                  <td className="py-2.5 pr-4 text-right text-violet-200 text-xs font-mono">{row.free}</td>
                  <td className="py-2.5 text-right text-cyan-300 text-xs font-mono">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-violet-200 text-center pb-2">
        {t.footerNote}{" "}
        <a
          href="https://firebase.google.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-violet-100"
        >
          {t.footerLink}
        </a>{" "}
        {t.footerNote2}
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
                "name": "Firebase の無料プラン（Spark）でできることは？",
                "acceptedAnswer": { "@type": "Answer", "text": "Firestore の読取 50,000回/日・書込 20,000回/日、Cloud Storage 5GB、Firebase Hosting 10GB など豊富な無料枠があります。メール・Google 認証は実質無制限で利用できます。" },
              },
              {
                "@type": "Question",
                "name": "Blaze プランに変更すると必ず料金が発生する？",
                "acceptedAnswer": { "@type": "Answer", "text": "いいえ。Blaze プランはクレジットカード登録が必要ですが、Spark と同じ無料枠が引き続き適用されます。無料枠を超えた分だけ課金されます。" },
              },
              {
                "@type": "Question",
                "name": "Firestore のコストを抑えるには？",
                "acceptedAnswer": { "@type": "Answer", "text": "クライアント側のキャッシュ活用・クエリの絞り込み・リアルタイムリスナーの適切な解除が有効です。1 ドキュメントに複数フィールドをまとめることで読取回数を減らせます。" },
              },
              {
                "@type": "Question",
                "name": "Firebase の料金はドル建て？",
                "acceptedAnswer": { "@type": "Answer", "text": "Firebase の料金は USD 建てです。Google Cloud の請求書を通じて請求されます。" },
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
  "name": "Firebase 料金試算",
  "description": "Firebaseの月額料金をFirestore読み書き数・Storage・Functions実行回数から試算",
  "url": "https://tools.loresync.dev/firebase-pricing",
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
