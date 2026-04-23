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

const USE_CASES = [
  {
    label: "SNS用ショート",
    icon: "📱",
    color: "bg-pink-50 border-pink-200",
    services: ["Pika", "Kling"],
    desc: "3〜5秒・音響効果・リップシンク対応",
  },
  {
    label: "プロモーション",
    icon: "🎬",
    color: "bg-blue-50 border-blue-200",
    services: ["Runway", "Sora"],
    desc: "カメラコントロール・高解像度・長尺",
  },
  {
    label: "プロトタイプ",
    icon: "⚡",
    color: "bg-yellow-50 border-yellow-200",
    services: ["Luma", "Kling"],
    desc: "高速生成・無料枠が充実",
  },
  {
    label: "高品質CM",
    icon: "🏆",
    color: "bg-purple-50 border-purple-200",
    services: ["Sora", "Runway"],
    desc: "1080p・最大20秒・プロ品質",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtUSD(n: number) {
  return n === 0 ? "無料" : `$${n.toFixed(2)}`;
}

function fmtJPY(usd: number, rate: number) {
  if (usd === 0) return "無料";
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
  const [fxRate, setFxRate] = useState(150);
  const [monthlyVideos, setMonthlyVideos] = useState("");
  const [avgDurationSec, setAvgDurationSec] = useState("5");
  const [activeTab, setActiveTab] = useState<"comparison" | "efficiency" | "simulator" | "free">("comparison");

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
      // Find cheapest plan that covers the needed seconds
      const creditsNeeded = totalSecs / svc.secPerCredit;

      // Check unlimited plans first
      const unlimitedPlan = svc.plans.find((p) => p.isUnlimited);

      // Find cheapest paid plan that has enough credits
      const sufficientPaidPlans = svc.plans
        .filter((p) => p.credits !== null && !p.isUnlimited && p.credits >= creditsNeeded)
        .sort((a, b) => a.priceUSD - b.priceUSD);

      let recommended: Plan | null = sufficientPaidPlans[0] ?? null;

      // If unlimited is cheaper than sufficient paid plan, prefer unlimited
      if (unlimitedPlan && recommended && unlimitedPlan.priceUSD < recommended.priceUSD) {
        recommended = unlimitedPlan;
      }

      // If no sufficient plan, use unlimited or most expensive plan
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

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-white text-purple-700 shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`;

  const thClass = "px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap";
  const tdClass = "px-3 py-3 text-sm text-gray-800 whitespace-nowrap";

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
          className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <span className="text-xs text-gray-400">$1 = ¥{fxRate}</span>
      </section>

      {/* タブ */}
      <section>
        <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 mb-6">
          <button className={tabClass("comparison")} onClick={() => setActiveTab("comparison")}>料金比較表</button>
          <button className={tabClass("efficiency")} onClick={() => setActiveTab("efficiency")}>コスト効率</button>
          <button className={tabClass("simulator")} onClick={() => setActiveTab("simulator")}>利用シミュレーター</button>
          <button className={tabClass("free")} onClick={() => setActiveTab("free")}>無料枠比較</button>
        </div>

        {/* ---- 料金比較表 ---- */}
        {activeTab === "comparison" && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className={thClass}>サービス</th>
                  <th className={thClass}>プラン</th>
                  <th className={thClass}>月額 (USD)</th>
                  <th className={thClass}>月額 (JPY)</th>
                  <th className={thClass}>クレジット/月</th>
                  <th className={thClass}>最大解像度</th>
                  <th className={thClass}>最大尺</th>
                  <th className={thClass}>特徴</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {SERVICES.flatMap((svc) =>
                  svc.plans.map((plan, pi) => (
                    <tr key={`${svc.name}-${plan.name}`} className={`transition-colors ${svc.rowHover}`}>
                      <td className={`${tdClass} font-semibold text-gray-900`}>
                        {pi === 0 ? <ServiceBadge service={svc} /> : ""}
                      </td>
                      <td className={tdClass}>{plan.name}</td>
                      <td className={tdClass}>
                        <span className="font-mono font-semibold">{fmtUSD(plan.priceUSD)}</span>
                      </td>
                      <td className={tdClass}>
                        <span className="font-mono text-gray-500">{fmtJPY(plan.priceUSD, fxRate)}</span>
                      </td>
                      <td className={tdClass}>
                        {plan.isUnlimited ? (
                          <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            無制限
                          </span>
                        ) : (
                          <span className="font-mono">
                            {plan.credits?.toLocaleString()} {plan.creditUnit}
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>{pi === 0 ? svc.maxResolution : ""}</td>
                      <td className={tdClass}>{pi === 0 ? `${svc.maxDurationSec}秒` : ""}</td>
                      <td className={tdClass}>
                        {pi === 0 && (
                          <div className="flex flex-wrap gap-1">
                            {svc.features.map((f) => (
                              <span key={f} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
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
            <p className="text-xs text-gray-400 px-4 py-2">※ 料金は2026年概算。為替レートは設定値を使用。</p>
          </div>
        )}

        {/* ---- コスト効率 ---- */}
        {activeTab === "efficiency" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">有料プランの「1秒あたり生成コスト」で横並び比較します。数値が小さいほどコスパ優秀です。</p>
            {efficiencyData.map(({ service, entries }) => (
              <div key={service.name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ServiceBadge service={service} />
                  <span className="text-sm text-gray-500">{service.company}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {entries.map(({ plan, cps }) => (
                    <div
                      key={plan.name}
                      className={`rounded-lg border p-3 ${plan.isUnlimited ? "border-purple-200 bg-purple-50" : "border-gray-100 bg-gray-50"}`}
                    >
                      <div className={`text-xs font-medium mb-1 ${plan.isUnlimited ? "text-purple-600" : "text-gray-500"}`}>
                        {plan.name}
                      </div>
                      <div className="text-lg font-bold text-gray-900 font-mono">
                        {plan.isUnlimited ? (
                          <span className="text-purple-600">無制限</span>
                        ) : cps === null ? (
                          <span className="text-gray-400 text-sm">-</span>
                        ) : (
                          <>
                            <span className={`bg-gradient-to-r ${service.brandColor} bg-clip-text text-transparent`}>
                              ${cps.toFixed(4)}
                            </span>
                            <span className="text-xs font-normal text-gray-400 ml-1">/秒</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {plan.isUnlimited
                          ? `$${plan.priceUSD}/月`
                          : `$${plan.priceUSD}/月 · ${plan.credits?.toLocaleString()} ${plan.creditUnit}`}
                      </div>
                      {cps !== null && !plan.isUnlimited && (
                        <div className="text-xs text-gray-400">
                          ≒ ¥{Math.round(cps * fxRate * 100) / 100}/秒
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
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">月間利用量を入力</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">月間生成本数</label>
                  <input
                    type="number"
                    value={monthlyVideos}
                    onChange={(e) => setMonthlyVideos(e.target.value)}
                    placeholder="例: 30"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1">平均尺 (秒)</label>
                  <input
                    type="number"
                    value={avgDurationSec}
                    onChange={(e) => setAvgDurationSec(e.target.value)}
                    placeholder="例: 5"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
              </div>
              {simResults.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">順位</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">サービス</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">おすすめプラン</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">月額 (USD)</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">月額 (JPY)</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase">1本あたり</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {simResults.map((r, i) => (
                        <tr key={r.service.name} className={`transition-colors ${r.service.rowHover} ${i === 0 ? "bg-yellow-50" : ""}`}>
                          <td className="px-3 py-2 text-sm text-gray-500 font-mono">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}位`}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <ServiceBadge service={r.service} />
                            {!r.canCover && (
                              <span className="ml-1 text-xs text-orange-500">※上限超</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-700">{r.plan.name}</td>
                          <td className="px-3 py-2 text-sm text-right font-mono font-semibold">
                            {fmtUSD(r.monthlyCostUSD)}
                          </td>
                          <td className="px-3 py-2 text-sm text-right font-mono text-gray-500">
                            {fmtJPY(r.monthlyCostUSD, fxRate)}
                          </td>
                          <td className="px-3 py-2 text-sm text-right font-mono text-gray-500">
                            {r.monthlyCostUSD === 0
                              ? "無料"
                              : `$${r.costPerVideoUSD.toFixed(3)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {monthlyVideos === "" && (
                <div className="text-center py-8 text-sm text-gray-400">
                  月間生成本数を入力すると最安プランを判定します
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- 無料枠比較 ---- */}
        {activeTab === "free" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">登録直後に無料で生成できる量を比較します。</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeTiers.map(({ service, plan, totalSecs }) => (
                <div key={service.name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.brandColor}`} />
                  <ServiceBadge service={service} />
                  <div className="mt-3 mb-1">
                    <span className="text-3xl font-bold text-gray-900 font-mono">
                      {plan.credits?.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{plan.creditUnit}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    約 <span className="font-semibold text-gray-800">{Math.floor(totalSecs)}秒</span> 分の動画を生成可能
                  </div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <div>最大解像度: {service.maxResolution}</div>
                    <div>最大尺: {service.maxDurationSec}秒/本</div>
                  </div>
                </div>
              ))}
              {/* Soraの無料枠なし */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 relative overflow-hidden opacity-60">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                <ServiceBadge service={SERVICES[0]} />
                <div className="mt-3 mb-1">
                  <span className="text-xl font-bold text-gray-500">無料枠なし</span>
                </div>
                <div className="text-sm text-gray-500">ChatGPT Plus ($20/月) から利用可能</div>
              </div>
            </div>
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
