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

const USE_CASES = [
  {
    label: "個人開発",
    icon: "🧑‍💻",
    color: "bg-violet-50 border-violet-200",
    services: ["Supabase Auth", "Firebase Auth"],
    desc: "無料MAU枠が最大。フルスタック構築が容易",
  },
  {
    label: "スタートアップ",
    icon: "🚀",
    color: "bg-blue-50 border-blue-200",
    services: ["Clerk", "Supabase Auth"],
    desc: "DX重視・低コスト・Next.js対応",
  },
  {
    label: "エンタープライズ",
    icon: "🏢",
    color: "bg-orange-50 border-orange-200",
    services: ["Auth0", "Cognito"],
    desc: "SSO/SAML・RBAC・監査ログ・コンプライアンス対応",
  },
  {
    label: "AWS環境",
    icon: "☁️",
    color: "bg-sky-50 border-sky-200",
    services: ["Cognito"],
    desc: "IAM統合・Lambda・API Gateway連携が最強",
  },
];

// ---------------------------------------------------------------------------
// Feature matrix labels
// ---------------------------------------------------------------------------

const FEATURE_LABELS: { key: keyof FeatureSupport; label: string }[] = [
  { key: "sso", label: "SSO / SAML" },
  { key: "mfa", label: "MFA" },
  { key: "rbac", label: "RBAC" },
  { key: "socialLogin", label: "Social Login" },
  { key: "webhook", label: "Webhook" },
  { key: "customDomain", label: "カスタムドメイン" },
];

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

function FeatureBadge({ value }: { value: boolean | "paid" }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
        ✓
      </span>
    );
  }
  if (value === "paid") {
    return (
      <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
        有料
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-bold">
      —
    </span>
  );
}

function ServiceBadge({ service }: { service: Service }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${service.badgeBg} ${service.badgeText}`}>
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

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-white text-violet-700 shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`;

  const thClass = "px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap";
  const tdClass = "px-3 py-3 text-sm text-gray-800 whitespace-nowrap";

  const cheapestIdx = simResults.findIndex((r) => r.costUSD !== null && r.costUSD !== undefined);

  return (
    <div className="space-y-8">
      {/* 用途別おすすめ */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">用途別おすすめ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className={`rounded-xl border p-4 ${uc.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{uc.icon}</span>
                <span className="font-semibold text-gray-800 text-sm">{uc.label}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{uc.desc}</p>
              <div className="flex flex-wrap gap-1">
                {uc.services.map((s) => {
                  const svc = SERVICES.find((sv) => sv.name === s)!;
                  return <ServiceBadge key={s} service={svc} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 為替レート */}
      <section className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">為替レート (円/ドル)</label>
        <input
          type="number"
          value={fxRate}
          onChange={(e) => setFxRate(Number(e.target.value))}
          className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <span className="text-xs text-gray-400">$1 = ¥{fxRate}</span>
      </section>

      {/* タブ */}
      <section>
        <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 mb-6 flex-wrap">
          <button className={tabClass("simulator")} onClick={() => setActiveTab("simulator")}>MAUシミュレーター</button>
          <button className={tabClass("plans")} onClick={() => setActiveTab("plans")}>全プラン比較</button>
          <button className={tabClass("features")} onClick={() => setActiveTab("features")}>機能比較</button>
          <button className={tabClass("chart")} onClick={() => setActiveTab("chart")}>MAU帯グラフ</button>
        </div>

        {/* ---- MAUシミュレーター ---- */}
        {activeTab === "simulator" && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">月間アクティブユーザー数 (MAU) を入力</h3>
              <div className="flex items-center gap-3 mb-6">
                <input
                  type="number"
                  value={mauInput}
                  onChange={(e) => setMauInput(e.target.value)}
                  placeholder="例: 10000"
                  className="w-48 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
                <span className="text-sm text-gray-500">MAU</span>
                <div className="flex gap-1 flex-wrap">
                  {[1000, 5000, 10000, 50000, 100000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMauInput(String(v))}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        mau === v
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                      }`}
                    >
                      {v >= 1000 ? `${v / 1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">順位</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">サービス</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">プラン</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">月額 (USD)</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">月額 (JPY)</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">備考</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {simResults.map((r, i) => {
                      const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}位`;
                      const isEnterprise = r.plan?.isEnterprise ?? false;
                      const costUSD = r.costUSD ?? null;
                      return (
                        <tr
                          key={r.service.name}
                          className={`transition-colors ${r.service.rowHover} ${i === cheapestIdx ? "bg-violet-50/50" : ""}`}
                        >
                          <td className="px-3 py-3 text-sm text-gray-500 font-mono">{rank}</td>
                          <td className="px-3 py-3 text-sm">
                            <ServiceBadge service={r.service} />
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700">
                            {r.plan?.name ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-sm text-right font-mono font-semibold">
                            {isEnterprise ? (
                              <span className="text-gray-400 text-xs">要問合せ</span>
                            ) : costUSD === null ? (
                              <span className="text-gray-400 text-xs">上限超</span>
                            ) : (
                              <span className={i === cheapestIdx ? "text-violet-700" : ""}>
                                {costUSD === 0 ? "無料" : `$${costUSD % 1 === 0 ? costUSD : costUSD.toFixed(2)}`}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-sm text-right font-mono text-gray-500">
                            {!isEnterprise && costUSD !== null && costUSD > 0
                              ? fmtJPY(costUSD, fxRate)
                              : "—"}
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-500 max-w-xs truncate">
                            {r.service.notes}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">※ Firebase AuthはメールおよびOAuth認証が実質無制限無料。電話認証・SAMLは追加課金。</p>
            </div>
          </div>
        )}

        {/* ---- 全プラン比較 ---- */}
        {activeTab === "plans" && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thClass}>サービス</th>
                  <th className={thClass}>プラン</th>
                  <th className={thClass}>月額 (USD)</th>
                  <th className={thClass}>月額 (JPY)</th>
                  <th className={thClass}>含まれるMAU</th>
                  <th className={thClass}>超過単価</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {SERVICES.flatMap((svc) =>
                  svc.plans.map((plan, pi) => (
                    <tr key={`${svc.name}-${plan.name}`} className={`transition-colors ${svc.rowHover}`}>
                      <td className={`${tdClass} font-semibold`}>
                        {pi === 0 ? <ServiceBadge service={svc} /> : ""}
                      </td>
                      <td className={tdClass}>
                        {plan.isEnterprise ? (
                          <span className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            Enterprise
                          </span>
                        ) : (
                          plan.name
                        )}
                      </td>
                      <td className={tdClass}>
                        <span className="font-mono font-semibold">
                          {plan.isEnterprise ? "要問合せ" : plan.baseUSD === 0 ? "無料" : `$${plan.baseUSD}`}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className="font-mono text-gray-500">
                          {plan.isEnterprise || plan.baseUSD === 0
                            ? "—"
                            : fmtJPY(plan.baseUSD, fxRate)}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {plan.isEnterprise ? "—" : plan.includedMAU >= 999999999 ? (
                          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            無制限
                          </span>
                        ) : (
                          <span className="font-mono">{plan.includedMAU.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        {plan.isEnterprise ? "—" : plan.overagePerMAU === null ? (
                          <span className="text-gray-400 text-xs">含む or 制限</span>
                        ) : plan.overagePerMAU === 0 ? (
                          <span className="text-gray-400 text-xs">従量(別途)</span>
                        ) : (
                          <span className="font-mono text-violet-700">${plan.overagePerMAU}/MAU</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 px-4 py-2">※ 料金は2026年概算。為替レートは設定値を使用。</p>
          </div>
        )}

        {/* ---- 機能比較 ---- */}
        {activeTab === "features" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thClass}>機能</th>
                    {SERVICES.map((svc) => (
                      <th key={svc.name} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        <ServiceBadge service={svc} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {FEATURE_LABELS.map(({ key, label }) => (
                    <tr key={key} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">{label}</td>
                      {SERVICES.map((svc) => (
                        <td key={svc.name} className="px-3 py-3 text-center">
                          <FeatureBadge value={svc.features[key]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-50/60">
                    <td className="px-3 py-3 text-sm font-medium text-gray-700">備考</td>
                    {SERVICES.map((svc) => (
                      <td key={svc.name} className="px-3 py-3 text-xs text-gray-500 max-w-[140px]">
                        {svc.notes}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">✓</span>
                無料で利用可
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold text-xs">有料</span>
                上位プランまたは追加費用
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 font-bold text-xs">—</span>
                非対応
              </div>
            </div>
          </div>
        )}

        {/* ---- MAU帯グラフ ---- */}
        {activeTab === "chart" && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">MAU帯ごとの最安月額コスト比較（CSSバー表示）</p>
            {chartData.map(({ tier, costs, maxCost }) => (
              <div key={tier} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  MAU: {tier >= 1000 ? `${(tier / 1000).toLocaleString()}K` : tier.toLocaleString()}
                </div>
                <div className="space-y-2">
                  {costs.map(({ service, costUSD }) => {
                    const displayCost = costUSD ?? 0;
                    const barPct = maxCost > 0 ? (displayCost / maxCost) * 100 : 0;
                    return (
                      <div key={service.name} className="flex items-center gap-3">
                        <div className="w-28 shrink-0">
                          <ServiceBadge service={service} />
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden relative">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${service.accentGradient} transition-all duration-300`}
                            style={{ width: `${Math.max(barPct, costUSD === 0 ? 2 : 0)}%` }}
                          />
                        </div>
                        <div className="w-28 text-right text-sm font-mono text-gray-700 shrink-0">
                          {costUSD === null ? (
                            <span className="text-xs text-gray-400">要問合せ</span>
                          ) : costUSD === 0 ? (
                            <span className="text-emerald-600 font-semibold">無料</span>
                          ) : (
                            <>
                              <span className="font-semibold">${costUSD % 1 === 0 ? costUSD : costUSD.toFixed(2)}</span>
                              <span className="text-xs text-gray-400 ml-1">({fmtJPY(costUSD, fxRate)})</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">※ Enterpriseプランは除外。Firebase AuthはメールOAuth認証の料金。Cognito無料枠は12ヶ月間限定。</p>
          </div>
        )}
      </section>

      {/* 凡例・注記 */}
      <section className="flex flex-wrap gap-4 text-xs text-gray-500">
        {SERVICES.map((svc) => (
          <div key={svc.name} className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-full ${svc.badgeBg}`}></span>
            {svc.name}
          </div>
        ))}
        <span className="ml-auto text-right">料金は2026年概算。実際の料金は各サービスの公式サイトをご確認ください。</span>
      </section>
    </div>
  );
}
