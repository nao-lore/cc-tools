"use client";

import { useMemo, useState } from "react";

type Region = "na_eu" | "asia_oceania";
type CloudflarePlan = "free" | "pro" | "business";
type EstimateTone = "orange" | "yellow" | "red" | "green" | "slate" | "blue";

type Estimate = {
  id: string;
  name: string;
  model: string;
  tone: EstimateTone;
  monthlyUsd: number | null;
  confidence: "高" | "中" | "要確認";
  summary: string;
  breakdown: { label: string; value: string }[];
  notes: string[];
  sourceLabel: string;
};

type Sample = {
  label: string;
  trafficGB: number;
  requestsM: number;
  region: Region;
  cloudflarePlan: CloudflarePlan;
};

const SOURCE_DATE = "2026-05-11";
const DEFAULT_EXCHANGE_RATE = 155;

const REGION_LABELS: Record<Region, string> = {
  na_eu: "北米・欧州",
  asia_oceania: "アジア・オセアニア",
};

const CLOUDFRONT_DTO_RATE: Record<Region, number> = {
  na_eu: 0.085,
  asia_oceania: 0.12,
};

const BUNNY_STANDARD_RATE: Record<Region, number> = {
  na_eu: 0.01,
  asia_oceania: 0.03,
};

const CLOUDFLARE_PLANS: Record<CloudflarePlan, { label: string; monthlyUsd: number; note: string }> = {
  free: {
    label: "Free",
    monthlyUsd: 0,
    note: "小規模サイトや検証向け。SLAや高度な制御は限定的です。",
  },
  pro: {
    label: "Pro",
    monthlyUsd: 25,
    note: "月払い想定。年払いでは公式表示上 $20/月 相当です。",
  },
  business: {
    label: "Business",
    monthlyUsd: 250,
    note: "月払い想定。年払いでは公式表示上 $200/月 相当です。",
  },
};

const SAMPLES: Sample[] = [
  { label: "個人ブログ", trafficGB: 100, requestsM: 1, region: "na_eu", cloudflarePlan: "free" },
  { label: "SaaS LP", trafficGB: 1000, requestsM: 10, region: "na_eu", cloudflarePlan: "pro" },
  { label: "画像多めメディア", trafficGB: 5000, requestsM: 40, region: "asia_oceania", cloudflarePlan: "pro" },
  { label: "大規模配信", trafficGB: 50000, requestsM: 200, region: "asia_oceania", cloudflarePlan: "business" },
];

const TONE_CLASSES: Record<EstimateTone, { card: string; badge: string; dot: string; price: string }> = {
  orange: {
    card: "border-orange-200 bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    dot: "bg-orange-500",
    price: "text-orange-700",
  },
  yellow: {
    card: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    price: "text-amber-700",
  },
  red: {
    card: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500",
    price: "text-red-700",
  },
  green: {
    card: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
    price: "text-emerald-700",
  },
  slate: {
    card: "border-slate-200 bg-slate-50",
    badge: "bg-slate-100 text-slate-800",
    dot: "bg-slate-500",
    price: "text-slate-800",
  },
  blue: {
    card: "border-sky-200 bg-sky-50",
    badge: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
    price: "text-sky-700",
  },
};

function clampNumber(value: string, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function formatUsd(value: number | null) {
  if (value === null) return "要見積";
  if (value >= 1000) return `$${Math.round(value).toLocaleString()}`;
  return `$${value.toFixed(value < 10 ? 2 : 0)}`;
}

function formatJpy(value: number | null, exchangeRate: number) {
  if (value === null) return "要見積";
  return `約${Math.round(value * exchangeRate).toLocaleString()}円`;
}

function formatGb(gb: number) {
  if (gb >= 1_000_000) return `${(gb / 1_000_000).toFixed(2)}PB`;
  if (gb >= 1000) return `${(gb / 1000).toFixed(gb >= 10_000 ? 0 : 1)}TB`;
  return `${gb.toLocaleString()}GB`;
}

function calcBunnyVolume(trafficGB: number) {
  const tiers = [
    { sizeGB: 500_000, rate: 0.005 },
    { sizeGB: 500_000, rate: 0.004 },
    { sizeGB: 1_000_000, rate: 0.002 },
  ];
  let remaining = trafficGB;
  let total = 0;

  for (const tier of tiers) {
    const used = Math.min(remaining, tier.sizeGB);
    if (used <= 0) break;
    total += used * tier.rate;
    remaining -= used;
  }

  return remaining > 0 ? null : Math.max(1, total);
}

function chooseCloudFrontFlat(trafficGB: number, requestsM: number) {
  const plans = [
    { name: "Free", price: 0, trafficGB: 100, requestsM: 1 },
    { name: "Pro", price: 15, trafficGB: 50_000, requestsM: 10 },
    { name: "Business", price: 200, trafficGB: 50_000, requestsM: 125 },
    { name: "Premium", price: 1000, trafficGB: 50_000, requestsM: 500 },
  ];
  return plans.find((plan) => trafficGB <= plan.trafficGB && requestsM <= plan.requestsM) ?? null;
}

function chooseFastlyPackage(requestsM: number) {
  if (requestsM <= 100) return { name: "Basic", price: 1500, requestsM: 100 };
  if (requestsM <= 500) return { name: "Starter", price: 6000, requestsM: 500 };
  return null;
}

function buildEstimates({
  trafficGB,
  requestsM,
  region,
  cloudflarePlan,
}: {
  trafficGB: number;
  requestsM: number;
  region: Region;
  cloudflarePlan: CloudflarePlan;
}): Estimate[] {
  const cloudflare = CLOUDFLARE_PLANS[cloudflarePlan];
  const cloudFrontPaygTransfer = trafficGB * CLOUDFRONT_DTO_RATE[region];
  const cloudFrontPaygRequests = requestsM * 100;
  const cloudFrontFlat = chooseCloudFrontFlat(trafficGB, requestsM);
  const fastlyPackage = chooseFastlyPackage(requestsM);
  const bunnyStandard = Math.max(1, trafficGB * BUNNY_STANDARD_RATE[region]);
  const bunnyVolume = calcBunnyVolume(trafficGB);

  return [
    {
      id: "cloudflare",
      name: "Cloudflare",
      model: `${cloudflare.label} 固定プラン`,
      tone: "orange",
      monthlyUsd: cloudflare.monthlyUsd,
      confidence: "中",
      summary: "一般的なWebサイトなら最初に検討しやすい固定プラン。動画配信・大容量ファイル・追加プロダクトは別扱いです。",
      breakdown: [
        { label: "選択プラン", value: `${cloudflare.label} / ${formatUsd(cloudflare.monthlyUsd)}` },
        { label: "帯域課金", value: "通常CDN用途ではGB単価を置かない比較" },
        { label: "前提", value: cloudflare.note },
      ],
      notes: ["高トラフィックや動画・ソフト配布は利用規約とEnterprise条件を確認してください。"],
      sourceLabel: "Cloudflare pricing / cache plan docs",
    },
    {
      id: "cloudfront-payg",
      name: "CloudFront",
      model: "従量課金の概算",
      tone: "yellow",
      monthlyUsd: cloudFrontPaygTransfer + cloudFrontPaygRequests,
      confidence: "中",
      summary: "AWS内の配信・細かい制御に強い従量課金モデル。WAF、ログ、S3、無効化などは別途見る必要があります。",
      breakdown: [
        { label: "データ転送", value: `${formatGb(trafficGB)} x $${CLOUDFRONT_DTO_RATE[region].toFixed(3)}/GB` },
        { label: "HTTPSリクエスト", value: `${requestsM.toLocaleString()}M x $0.01 / 10,000` },
        { label: "概算内訳", value: `${formatUsd(cloudFrontPaygTransfer)} + ${formatUsd(cloudFrontPaygRequests)}` },
      ],
      notes: ["無料枠、割引、Origin Shield、Lambda@Edge、WAF、ログはこの概算に含めていません。"],
      sourceLabel: "AWS CloudFront pricing / AWS docs",
    },
    {
      id: "cloudfront-flat",
      name: "CloudFront",
      model: "フラットレートプラン",
      tone: "blue",
      monthlyUsd: cloudFrontFlat?.price ?? null,
      confidence: cloudFrontFlat ? "高" : "要確認",
      summary: cloudFrontFlat
        ? "CloudFront CDN、WAF、DDoS、Route 53 DNS、ログ等を月額にまとめる新しいプラン体系です。"
        : "入力条件が公開フラットレートの上限を超えるため、Custom pricing の確認が必要です。",
      breakdown: [
        { label: "該当プラン", value: cloudFrontFlat ? cloudFrontFlat.name : "Custom pricing" },
        { label: "転送 allowance", value: cloudFrontFlat ? formatGb(cloudFrontFlat.trafficGB) : "No Limit は要相談" },
        { label: "リクエスト allowance", value: cloudFrontFlat ? `${cloudFrontFlat.requestsM.toLocaleString()}M/月` : "No Limit は要相談" },
      ],
      notes: ["フラットレートは対象機能が広い一方、ワークロード条件と含まれるサービスを確認してください。"],
      sourceLabel: "AWS CloudFront flat-rate plans",
    },
    {
      id: "fastly-package",
      name: "Fastly",
      model: "Network Services package",
      tone: "red",
      monthlyUsd: fastlyPackage?.price ?? null,
      confidence: fastlyPackage ? "高" : "要確認",
      summary: "低価格CDNというより、企業向けのパッケージとして見るべきサービスです。小規模サイトの単純な帯域コスト比較では不利になりやすいです。",
      breakdown: [
        { label: "該当パッケージ", value: fastlyPackage ? fastlyPackage.name : "Advantage / Ultimate or custom" },
        { label: "リクエスト allowance", value: fastlyPackage ? `${fastlyPackage.requestsM.toLocaleString()}M/月` : "2B/月以上は要相談" },
        { label: "注意", value: "Network Services package の下限比較" },
      ],
      notes: ["公式ページのパッケージ料金を使い、旧来の従量課金単価は使っていません。"],
      sourceLabel: "Fastly pricing packages",
    },
    {
      id: "bunny-standard",
      name: "bunny.net",
      model: "Standard network",
      tone: "green",
      monthlyUsd: bunnyStandard,
      confidence: "高",
      summary: "帯域単価が明快で、小〜中規模の静的配信や画像配信に強い選択肢です。リージョン課金と最低$1/月を反映しています。",
      breakdown: [
        { label: "データ転送", value: `${formatGb(trafficGB)} x $${BUNNY_STANDARD_RATE[region].toFixed(2)}/GB` },
        { label: "最低料金", value: "$1/月" },
        { label: "リクエスト課金", value: "なし" },
      ],
      notes: ["Optimizer、Storage、Streamなどは別プロダクトとして別料金です。"],
      sourceLabel: "bunny.net CDN pricing",
    },
    {
      id: "bunny-volume",
      name: "bunny.net",
      model: "Volume network",
      tone: "slate",
      monthlyUsd: bunnyVolume,
      confidence: bunnyVolume === null ? "要確認" : "中",
      summary: "大容量配信向けの低単価ネットワーク。PoP数が少ないため、価格だけでなく配信地域と性能を確認する前提です。",
      breakdown: [
        { label: "最初の500TB", value: "$0.005/GB" },
        { label: "500TB - 1PB", value: "$0.004/GB" },
        { label: "1PB - 2PB", value: "$0.002/GB" },
      ],
      notes: ["2PB超は公式上 Contact us です。Standard network とはPoP数が異なります。"],
      sourceLabel: "bunny.net volume pricing",
    },
  ];
}

function getInputError(trafficGB: number, requestsM: number, exchangeRate: number) {
  if (trafficGB < 1 || trafficGB > 2_000_000) return "月間トラフィックは 1GB〜2PB の範囲で入力してください。";
  if (requestsM < 0 || requestsM > 10_000) return "月間リクエスト数は 0〜10,000M の範囲で入力してください。";
  if (exchangeRate < 50 || exchangeRate > 300) return "為替レートは 50〜300 円/USD の範囲で入力してください。";
  return "";
}

export default function CdnPricingComparison() {
  const [trafficGB, setTrafficGB] = useState(1000);
  const [requestsM, setRequestsM] = useState(10);
  const [region, setRegion] = useState<Region>("na_eu");
  const [cloudflarePlan, setCloudflarePlan] = useState<CloudflarePlan>("pro");
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  const [copied, setCopied] = useState(false);

  const error = getInputError(trafficGB, requestsM, exchangeRate);
  const estimates = useMemo(
    () => buildEstimates({ trafficGB, requestsM, region, cloudflarePlan }),
    [trafficGB, requestsM, region, cloudflarePlan]
  );
  const cheapest = estimates
    .filter((estimate) => estimate.monthlyUsd !== null)
    .sort((a, b) => Number(a.monthlyUsd) - Number(b.monthlyUsd))[0];

  function applySample(sample: Sample) {
    setTrafficGB(sample.trafficGB);
    setRequestsM(sample.requestsM);
    setRegion(sample.region);
    setCloudflarePlan(sample.cloudflarePlan);
    setCopied(false);
  }

  function reset() {
    setTrafficGB(1000);
    setRequestsM(10);
    setRegion("na_eu");
    setCloudflarePlan("pro");
    setExchangeRate(DEFAULT_EXCHANGE_RATE);
    setCopied(false);
  }

  async function copySummary() {
    const lines = [
      "CDN料金比較 概算",
      `更新日: ${SOURCE_DATE}`,
      `条件: ${formatGb(trafficGB)} / ${requestsM.toLocaleString()}M requests / ${REGION_LABELS[region]}`,
      ...estimates.map((estimate) => {
        const usd = formatUsd(estimate.monthlyUsd);
        const jpy = formatJpy(estimate.monthlyUsd, exchangeRate);
        return `${estimate.name} (${estimate.model}): ${usd} / ${jpy}`;
      }),
      cheapest ? `最安候補: ${cheapest.name} (${cheapest.model})` : "最安候補: 要見積",
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="space-y-6">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">比較条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                公開料金を使った月額の荒い見積もりです。契約割引、WAF、ログ、ストレージ、動画配信は別途確認してください。
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <NumberInput
              id="cdn-traffic"
              label="月間トラフィック"
              value={trafficGB}
              suffix="GB"
              min={1}
              max={2_000_000}
              step={100}
              onChange={setTrafficGB}
            />
            <NumberInput
              id="cdn-requests"
              label="月間HTTPSリクエスト"
              value={requestsM}
              suffix="M requests"
              min={0}
              max={10_000}
              step={1}
              onChange={setRequestsM}
            />
            <NumberInput
              id="cdn-exchange-rate"
              label="為替レート"
              value={exchangeRate}
              suffix="円/USD"
              min={50}
              max={300}
              step={1}
              onChange={setExchangeRate}
            />
          </div>

          <div className="mt-5 grid gap-4">
            <Segmented<Region>
              label="主な配信地域"
              value={region}
              options={[
                { value: "na_eu", label: "北米・欧州" },
                { value: "asia_oceania", label: "アジア・オセアニア" },
              ]}
              onChange={setRegion}
            />
            <Segmented<CloudflarePlan>
              label="Cloudflare比較プラン"
              value={cloudflarePlan}
              options={[
                { value: "free", label: "Free" },
                { value: "pro", label: "Pro" },
                { value: "business", label: "Business" },
              ]}
              onChange={setCloudflarePlan}
            />
          </div>

          <p className={`mt-4 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || `計算はブラウザ内で完結します。料金参照日: ${SOURCE_DATE}`}
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-sm font-medium text-slate-300">最安候補</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-3xl font-bold tracking-tight">{cheapest?.name ?? "要見積"}</p>
              <p className="mt-1 text-sm text-slate-300">{cheapest?.model ?? "公開料金では判断できません"}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-4xl font-bold">{formatUsd(cheapest?.monthlyUsd ?? null)}</p>
              <p className="mt-1 text-sm text-slate-300">{formatJpy(cheapest?.monthlyUsd ?? null, exchangeRate)} / 月</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="転送量" value={formatGb(trafficGB)} />
            <Metric label="リクエスト" value={`${requestsM.toLocaleString()}M/月`} />
            <Metric label="地域" value={REGION_LABELS[region]} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              disabled={Boolean(error)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <a
              href="https://aws.amazon.com/cloudfront/pricing/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              公式料金を確認
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {estimates.map((estimate) => (
          <EstimateCard
            key={estimate.id}
            estimate={estimate}
            isCheapest={estimate.id === cheapest?.id}
            exchangeRate={exchangeRate}
          />
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">料金モデルの読み方</h2>
        <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600 md:grid-cols-3">
          <InfoBlock
            title="固定プランと従量課金を分ける"
            body="CloudflareやCloudFrontのフラットレートは、単純なGB単価比較ではなく、WAFやDDoS、DNS、ログを含むパッケージとして判断します。"
          />
          <InfoBlock
            title="Fastlyは企業向け寄り"
            body="Fastlyは公開パッケージの下限が高いため、小規模な静的配信だけなら割高に見えます。高度な制御や運用要件がある場合に比較します。"
          />
          <InfoBlock
            title="Bunnyは帯域単価が明快"
            body="bunny.netは地域別GB単価と最低$1/月が分かりやすく、画像・静的ファイル配信の初期比較に向いています。"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">公式ソースと反映内容</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">サービス</th>
                <th className="py-2 pr-4">このツールで使う値</th>
                <th className="py-2 pr-4">含めないもの</th>
                <th className="py-2">ソース</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <SourceRow
                name="Cloudflare"
                values="Free / Pro $25月払い / Business $250月払い"
                excluded="Stream、Images、R2、Argo、Enterprise契約"
                href="https://www.cloudflare.com/ja-jp/application-services/products/analytics/"
              />
              <SourceRow
                name="CloudFront"
                values="$0.085/GBまたは$0.120/GB、HTTPS $0.01/10k、Flat-rate $0/$15/$200/$1000"
                excluded="WAF詳細、ログ、Origin Shield、割引、エッジ関数"
                href="https://aws.amazon.com/cloudfront/pricing/"
              />
              <SourceRow
                name="Fastly"
                values="Network Services package Basic $1,500 / Starter $6,000"
                excluded="契約割引、Advantage/Ultimate、旧従量課金"
                href="https://www.fastly.co.jp/pricing"
              />
              <SourceRow
                name="bunny.net"
                values="Standard $0.01/$0.03 per GB、Volume $0.005から、最低$1/月"
                excluded="Storage、Optimizer、Stream、Shield"
                href="https://bunny.net/pricing/"
              />
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function NumberInput({
  id,
  label,
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-950">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clampNumber(event.target.value, value, min, max))}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-slate-950"
        aria-label={`${label} slider`}
      />
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              value === option.value
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EstimateCard({
  estimate,
  isCheapest,
  exchangeRate,
}: {
  estimate: Estimate;
  isCheapest: boolean;
  exchangeRate: number;
}) {
  const tone = TONE_CLASSES[estimate.tone];

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${isCheapest ? tone.card : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
            <h2 className="font-bold text-slate-950">{estimate.name}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">{estimate.model}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isCheapest && <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone.badge}`}>最安候補</span>}
          <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-slate-600">確度: {estimate.confidence}</span>
        </div>
      </div>

      <div className="mt-5">
        <p className={`text-3xl font-bold tracking-tight ${tone.price}`}>{formatUsd(estimate.monthlyUsd)}</p>
        <p className="mt-1 text-sm text-slate-500">{formatJpy(estimate.monthlyUsd, exchangeRate)} / 月</p>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{estimate.summary}</p>

      <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
        {estimate.breakdown.map((item) => (
          <div key={`${estimate.id}-${item.label}`} className="flex justify-between gap-3 text-sm">
            <span className="text-slate-500">{item.label}</span>
            <span className="text-right font-medium text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white/70 p-3 text-xs leading-5 text-slate-600">
        <div className="font-semibold text-slate-800">{estimate.sourceLabel}</div>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {estimate.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1">{body}</p>
    </div>
  );
}

function SourceRow({
  name,
  values,
  excluded,
  href,
}: {
  name: string;
  values: string;
  excluded: string;
  href: string;
}) {
  return (
    <tr>
      <td className="py-3 pr-4 font-semibold text-slate-900">{name}</td>
      <td className="py-3 pr-4">{values}</td>
      <td className="py-3 pr-4">{excluded}</td>
      <td className="py-3">
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 underline underline-offset-4">
          公式ページ
        </a>
      </td>
    </tr>
  );
}
