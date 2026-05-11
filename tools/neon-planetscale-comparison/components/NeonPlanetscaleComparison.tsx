"use client";

import { useMemo, useState } from "react";

type Provider = "Neon" | "PlanetScale" | "Turso";
type PlanetScaleCluster = "postgres-single" | "ps-10" | "ps-20" | "ps-40";

type CostLine = {
  label: string;
  cost: number;
};

type CostResult = {
  provider: Provider;
  plan: string;
  database: string;
  monthlyCost: number;
  breakdown: CostLine[];
  notes: string[];
  withinFree: boolean;
};

const PLANETSCALE_CLUSTERS: Record<PlanetScaleCluster, { label: string; base: number; database: string; storageOverage: number }> = {
  "postgres-single": {
    label: "Postgres Single node",
    base: 5,
    database: "Postgres",
    storageOverage: 0.5,
  },
  "ps-10": {
    label: "Vitess PS-10",
    base: 39,
    database: "MySQL / Vitess",
    storageOverage: 1.5,
  },
  "ps-20": {
    label: "Vitess PS-20",
    base: 59,
    database: "MySQL / Vitess",
    storageOverage: 1.5,
  },
  "ps-40": {
    label: "Vitess PS-40",
    base: 99,
    database: "MySQL / Vitess",
    storageOverage: 1.5,
  },
};

const EXAMPLES = [
  {
    label: "個人開発",
    storageGB: "1",
    neonCuHours: "80",
    rowsReadB: "0.2",
    rowsWrittenM: "2",
    dbCount: "3",
    exchangeRate: "155",
    planetScaleCluster: "postgres-single" as PlanetScaleCluster,
  },
  {
    label: "小規模SaaS",
    storageGB: "8",
    neonCuHours: "220",
    rowsReadB: "3",
    rowsWrittenM: "20",
    dbCount: "10",
    exchangeRate: "155",
    planetScaleCluster: "ps-10" as PlanetScaleCluster,
  },
  {
    label: "成長中プロダクト",
    storageGB: "50",
    neonCuHours: "900",
    rowsReadB: "80",
    rowsWrittenM: "120",
    dbCount: "100",
    exchangeRate: "155",
    planetScaleCluster: "ps-20" as PlanetScaleCluster,
  },
];

const FEATURE_ROWS = [
  { label: "DB種別", neon: "Postgres", planetScale: "Postgres / MySQL(Vitess)", turso: "SQLite(libSQL)" },
  { label: "無料枠", neon: "0.5GB・100 CU-hours / project", planetScale: "なし", turso: "5GB・100 DB・500M reads" },
  { label: "最小有料", neon: "Launch usage-based", planetScale: "Postgres single node $5/mo", turso: "Developer $5.99/mo" },
  { label: "ストレージ課金", neon: "$0.35/GB-month", planetScale: "10GB込み、追加$0.50〜$1.50/GB", turso: "Developer $0.75/GB、Scaler $0.50/GB" },
  { label: "スケールの得意領域", neon: "サーバーレスPostgres・branch", planetScale: "Vitess/PlanetScale Postgresの本番運用", turso: "エッジ・埋め込み・分散SQLite" },
  { label: "注意点", neon: "CU-hoursと履歴ストレージを監視", planetScale: "選ぶclusterとbranchで費用が変わる", turso: "rows read/writeとsync量を監視" },
];

function num(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(usd: number) {
  return `$${usd.toFixed(2)}`;
}

function sanitizeDecimal(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function calcNeon(storageGB: number, cuHours: number): CostResult {
  const free = storageGB <= 0.5 && cuHours <= 100;
  if (free) {
    return {
      provider: "Neon",
      plan: "Free",
      database: "Postgres",
      monthlyCost: 0,
      breakdown: [{ label: "Free plan allowance", cost: 0 }],
      notes: ["100 CU-hours/month/project and 0.5GB storage/project"],
      withinFree: true,
    };
  }

  const compute = cuHours * 0.106;
  const storage = storageGB * 0.35;
  return {
    provider: "Neon",
    plan: "Launch estimate",
    database: "Postgres",
    monthlyCost: compute + storage,
    breakdown: [
      { label: `${cuHours.toFixed(0)} CU-hours × $0.106`, cost: compute },
      { label: `${storageGB.toFixed(1)}GB × $0.35`, cost: storage },
    ],
    notes: ["Paid plans are usage-based; history storage, egress, and branch overages are excluded."],
    withinFree: false,
  };
}

function calcPlanetScale(storageGB: number, clusterKey: PlanetScaleCluster): CostResult {
  const cluster = PLANETSCALE_CLUSTERS[clusterKey];
  const storageOver = Math.max(0, storageGB - 10);
  const storageCost = storageOver * cluster.storageOverage;
  return {
    provider: "PlanetScale",
    plan: cluster.label,
    database: cluster.database,
    monthlyCost: cluster.base + storageCost,
    breakdown: [
      { label: `${cluster.label} base`, cost: cluster.base },
      { label: storageOver > 0 ? `${storageOver.toFixed(1)}GB storage overage` : "10GB included storage", cost: storageCost },
    ],
    notes: [
      clusterKey === "postgres-single" ? "Single-node Postgres starts at $5/mo." : "Vitess production storage is modeled as HA storage overage.",
      "Additional production branches and add-ons are excluded.",
    ],
    withinFree: false,
  };
}

function tursoPlanCost(plan: "Developer" | "Scaler" | "Pro", storageGB: number, rowsReadB: number, rowsWrittenM: number): CostResult {
  const config = {
    Developer: { base: 5.99, storage: 9, storageOverage: 0.75, readsB: 2.5, readOverage: 1.0, writesM: 25, writeOverage: 1.0 },
    Scaler: { base: 29, storage: 24, storageOverage: 0.5, readsB: 100, readOverage: 0.8, writesM: 100, writeOverage: 0.8 },
    Pro: { base: 499, storage: 50, storageOverage: 0.45, readsB: 250, readOverage: 0.75, writesM: 250, writeOverage: 0.75 },
  }[plan];
  const storageOver = Math.max(0, storageGB - config.storage);
  const readOver = Math.max(0, rowsReadB - config.readsB);
  const writeOver = Math.max(0, rowsWrittenM - config.writesM);
  const storageCost = storageOver * config.storageOverage;
  const readCost = readOver * config.readOverage;
  const writeCost = writeOver * config.writeOverage;

  return {
    provider: "Turso",
    plan,
    database: "SQLite / libSQL",
    monthlyCost: config.base + storageCost + readCost + writeCost,
    breakdown: [
      { label: `${plan} base`, cost: config.base },
      { label: storageOver > 0 ? `${storageOver.toFixed(1)}GB storage overage` : `${config.storage}GB included storage`, cost: storageCost },
      { label: readOver > 0 ? `${readOver.toFixed(1)}B rows read overage` : `${config.readsB}B rows read included`, cost: readCost },
      { label: writeOver > 0 ? `${writeOver.toFixed(0)}M rows written overage` : `${config.writesM}M rows written included`, cost: writeCost },
    ],
    notes: ["Lowest eligible paid Turso plan is selected automatically.", "Embedded sync overages are excluded."],
    withinFree: false,
  };
}

function calcTurso(storageGB: number, rowsReadB: number, rowsWrittenM: number, dbCount: number): CostResult {
  const free = storageGB <= 5 && rowsReadB <= 0.5 && rowsWrittenM <= 10 && dbCount <= 100;
  if (free) {
    return {
      provider: "Turso",
      plan: "Free",
      database: "SQLite / libSQL",
      monthlyCost: 0,
      breakdown: [{ label: "Free plan allowance", cost: 0 }],
      notes: ["Free plan includes 5GB storage, 100 databases, 500M rows read, and 10M rows written."],
      withinFree: true,
    };
  }

  return [tursoPlanCost("Developer", storageGB, rowsReadB, rowsWrittenM), tursoPlanCost("Scaler", storageGB, rowsReadB, rowsWrittenM), tursoPlanCost("Pro", storageGB, rowsReadB, rowsWrittenM)].sort(
    (a, b) => a.monthlyCost - b.monthlyCost,
  )[0];
}

function providerTone(provider: Provider) {
  return {
    Neon: "border-emerald-200 bg-emerald-50 text-emerald-800",
    PlanetScale: "border-slate-200 bg-slate-50 text-slate-800",
    Turso: "border-sky-200 bg-sky-50 text-sky-800",
  }[provider];
}

function buildCopyText(results: CostResult[], exchangeRate: number) {
  return results
    .map((result) => {
      const jpy = Math.round(result.monthlyCost * exchangeRate).toLocaleString();
      return `${result.provider}: ${result.plan} / ${money(result.monthlyCost)} (約${jpy}円)`;
    })
    .join("\n");
}

export default function NeonPlanetscaleComparison() {
  const [storageGB, setStorageGB] = useState("8");
  const [neonCuHours, setNeonCuHours] = useState("220");
  const [rowsReadB, setRowsReadB] = useState("3");
  const [rowsWrittenM, setRowsWrittenM] = useState("20");
  const [dbCount, setDbCount] = useState("10");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [planetScaleCluster, setPlanetScaleCluster] = useState<PlanetScaleCluster>("ps-10");
  const [showJpy, setShowJpy] = useState(false);
  const [copied, setCopied] = useState(false);

  const storage = num(storageGB);
  const cuHours = num(neonCuHours);
  const readB = num(rowsReadB);
  const writeM = num(rowsWrittenM);
  const dbs = num(dbCount);
  const fx = num(exchangeRate) || 155;

  const results = useMemo(() => {
    const list = [
      calcNeon(storage, cuHours),
      calcPlanetScale(storage, planetScaleCluster),
      calcTurso(storage, readB, writeM, dbs),
    ];
    const cheapest = Math.min(...list.map((item) => item.monthlyCost));
    return list.map((item) => ({ ...item, isCheapest: item.monthlyCost === cheapest }));
  }, [cuHours, dbs, planetScaleCluster, readB, storage, writeM]);

  const inputError = storage < 0 || cuHours < 0 || readB < 0 || writeM < 0 || dbs < 0 || fx <= 0;

  function formatPrice(usd: number) {
    if (showJpy) return `約${Math.round(usd * fx).toLocaleString()}円`;
    return money(usd);
  }

  function reset() {
    setStorageGB("8");
    setNeonCuHours("220");
    setRowsReadB("3");
    setRowsWrittenM("20");
    setDbCount("10");
    setExchangeRate("155");
    setPlanetScaleCluster("ps-10");
    setShowJpy(false);
    setCopied(false);
  }

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setStorageGB(example.storageGB);
    setNeonCuHours(example.neonCuHours);
    setRowsReadB(example.rowsReadB);
    setRowsWrittenM(example.rowsWrittenM);
    setDbCount(example.dbCount);
    setExchangeRate(example.exchangeRate);
    setPlanetScaleCluster(example.planetScaleCluster);
    setCopied(false);
  }

  async function copyResults() {
    await navigator.clipboard.writeText(buildCopyText(results, fx));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid min-w-0 gap-0 xl:grid-cols-[390px_minmax(0,1fr)]">
        <div className="min-w-0 border-b border-slate-200 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between xl:flex-col">
            <div>
              <h2 className="text-base font-semibold text-slate-950">想定使用量</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">各社の課金単位が違うため、共通の規模感を入力して概算します。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowJpy((value) => !value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {showJpy ? "USD表示" : "円表示"}
              </button>
              <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                リセット
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <NumberField label="ストレージ" value={storageGB} onChange={setStorageGB} suffix="GB" />
            <NumberField label="Neon CU-hours" value={neonCuHours} onChange={setNeonCuHours} suffix="CUh/月" />
            <NumberField label="Turso rows read" value={rowsReadB} onChange={setRowsReadB} suffix="B/月" />
            <NumberField label="Turso rows written" value={rowsWrittenM} onChange={setRowsWrittenM} suffix="M/月" />
            <NumberField label="DB数" value={dbCount} onChange={setDbCount} suffix="個" />
            <NumberField label="為替レート" value={exchangeRate} onChange={setExchangeRate} suffix="円/USD" />
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">PlanetScale構成</p>
            <div className="mt-2 grid gap-2">
              {(Object.keys(PLANETSCALE_CLUSTERS) as PlanetScaleCluster[]).map((key) => {
                const cluster = PLANETSCALE_CLUSTERS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlanetScaleCluster(key)}
                    className={`rounded-xl border p-3 text-left transition ${
                      planetScaleCluster === key ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{cluster.label}</span>
                    <span className={`mt-1 block text-xs ${planetScaleCluster === key ? "text-slate-300" : "text-slate-500"}`}>
                      {money(cluster.base)} / month, 10GB included
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${inputError ? "text-red-600" : "text-slate-500"}`}>
            {inputError ? "入力値は0以上で指定してください。" : "料金は公式価格をもとにした概算です。税、クレジット、転送量、履歴保存、アドオンは除外しています。"}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            {results.map((result) => (
              <ProviderCard key={result.provider} result={result} formatPrice={formatPrice} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResults}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              条件を初期化
            </button>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
            <div className="bg-slate-50 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-950">機能・課金軸の比較</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-white text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">項目</th>
                    <th className="px-4 py-3 font-medium">Neon</th>
                    <th className="px-4 py-3 font-medium">PlanetScale</th>
                    <th className="px-4 py-3 font-medium">Turso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {FEATURE_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.label}</td>
                      <td className="px-4 py-3 text-slate-600">{row.neon}</td>
                      <td className="px-4 py-3 text-slate-600">{row.planetScale}</td>
                      <td className="px-4 py-3 text-slate-600">{row.turso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <h2 className="font-semibold">この比較の限界</h2>
            <p className="mt-1">
              各社の課金単位が違うため、完全な同条件比較ではありません。NeonはCU-hoursとstorage、PlanetScaleはcluster/branch/storage、Tursoはstorage/rows/syncsを中心に請求が変わります。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2 flex min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(sanitizeDecimal(event.target.value))}
          className="w-0 min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function ProviderCard({
  result,
  formatPrice,
}: {
  result: CostResult & { isCheapest: boolean };
  formatPrice: (usd: number) => string;
}) {
  return (
    <div className={`min-w-0 rounded-2xl border p-5 ${result.isCheapest ? providerTone(result.provider) : "border-slate-200 bg-white text-slate-800"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium opacity-80">{result.database}</p>
          <h2 className="mt-1 text-xl font-bold">{result.provider}</h2>
        </div>
        {result.isCheapest && <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold">最安</span>}
      </div>
      <p className="mt-4 text-sm font-semibold opacity-80">{result.plan}</p>
      <p className="mt-1 text-4xl font-bold tracking-tight">{formatPrice(result.monthlyCost)}</p>
      <p className="mt-1 text-xs opacity-70">monthly estimate</p>

      {result.withinFree && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700">無料枠内</div>
      )}

      <div className="mt-4 space-y-2 border-t border-current/10 pt-4">
        {result.breakdown.map((line) => (
          <div key={line.label} className="flex justify-between gap-3 text-sm">
            <span className="text-current/70">{line.label}</span>
            <span className="font-mono font-semibold">{money(line.cost)}</span>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-1 text-xs leading-5 text-current/70">
        {result.notes.map((note) => (
          <li key={note}>- {note}</li>
        ))}
      </ul>
    </div>
  );
}
