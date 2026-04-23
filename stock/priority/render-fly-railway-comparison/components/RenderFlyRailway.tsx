"use client";

import { useState, useMemo } from "react";

// ── 型定義 ────────────────────────────────────────────────────────────────────

type Provider = "Render" | "Fly.io" | "Railway";

interface UserInput {
  cpuShared: number;      // shared vCPU数
  memoryGB: number;       // GB
  storageGB: number;      // GB
  bandwidthGB: number;    // GB/月
  hoursPerMonth: number;  // 稼働時間
  includeDB: boolean;     // DB付きかどうか
  dbStorageGB: number;    // DB ストレージ GB
}

interface CostResult {
  provider: Provider;
  monthlyCost: number;
  breakdown: { label: string; cost: number }[];
  freeNote?: string;
  isCheapest?: boolean;
  withinFree: boolean;
}

// ── 為替レート ─────────────────────────────────────────────────────────────────

const USD_TO_JPY = 155;

// ── 料金定数 ──────────────────────────────────────────────────────────────────

// Render
const RENDER = {
  individual: 7,           // $7/月 (512MB RAM, 0.5 CPU)
  instancePerGBRAM: 7,     // 簡略: $7/512MB → ~$14/GB RAM
  freeBandwidthGB: 100,
  bandwidthOveragePerGB: 0.10,
  dbFree: { storageGB: 0.256, durationDays: 90 },
  dbStarter: { cost: 7, storageGB: 1 },
  dbStorageOveragePerGB: 1.00, // Starter超過分
};

// Fly.io
const FLY = {
  hobbyCredit: 5,          // $5/月クレジット
  sharedCpu1xPerMonth: 1.94,
  dedicatedCpu1xPerMonth: 31,
  memoryPerGBPerMonth: 5,  // ~$0.00694/h → $5/月/GB (概算)
  volumePerGBPerMonth: 0.15,
  freeBandwidthGB: 100,
  bandwidthOveragePerGB: 0.02,
};

// Railway
const RAILWAY = {
  hobbyBase: 5,            // $5/月(使用量$5含む)
  cpuPerMinPerVCPU: 0.000463,
  memPerMinPerGB: 0.000231,
  bandwidthPerGB: 0.10,
  diskPerGBPerMonth: 0.25,
};

// ── 計算ロジック ───────────────────────────────────────────────────────────────

function calcRender(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  // インスタンス費用: $7/月〜(512MB)、メモリに応じてスケール
  const ramTiers = Math.max(1, Math.ceil(input.memoryGB / 0.5));
  const instanceCost = ramTiers * 7;
  breakdown.push({ label: `Webサービス (${input.memoryGB}GB RAM)`, cost: instanceCost });

  // 帯域超過
  const bwOverage = Math.max(0, input.bandwidthGB - RENDER.freeBandwidthGB) * RENDER.bandwidthOveragePerGB;
  if (bwOverage > 0) breakdown.push({ label: "帯域超過", cost: bwOverage });

  // DB
  let dbCost = 0;
  if (input.includeDB) {
    if (input.dbStorageGB <= 1) {
      dbCost = RENDER.dbStarter.cost;
      breakdown.push({ label: "DB Starter (1GB)", cost: dbCost });
    } else {
      const extra = Math.max(0, input.dbStorageGB - RENDER.dbStarter.storageGB);
      dbCost = RENDER.dbStarter.cost + extra * RENDER.dbStorageOveragePerGB;
      breakdown.push({ label: `DB Starter + ストレージ超過`, cost: dbCost });
    }
  }

  const total = instanceCost + bwOverage + dbCost;
  const withinFree = input.memoryGB <= 0 && !input.includeDB && input.bandwidthGB <= RENDER.freeBandwidthGB;

  return { provider: "Render", monthlyCost: total, breakdown, withinFree };
}

function calcFly(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  // VM費用: shared-cpu-1x $1.94/月 × vCPU数
  const vmCount = Math.max(1, input.cpuShared);
  const vmCost = vmCount * FLY.sharedCpu1xPerMonth;
  breakdown.push({ label: `shared-cpu-1x × ${vmCount}`, cost: vmCost });

  // メモリ費用
  const memCost = input.memoryGB * FLY.memoryPerGBPerMonth;
  if (memCost > 0) breakdown.push({ label: `メモリ (${input.memoryGB}GB)`, cost: memCost });

  // ボリューム
  const volCost = input.storageGB * FLY.volumePerGBPerMonth;
  if (volCost > 0) breakdown.push({ label: `Volume (${input.storageGB}GB)`, cost: volCost });

  // 帯域超過
  const bwOverage = Math.max(0, input.bandwidthGB - FLY.freeBandwidthGB) * FLY.bandwidthOveragePerGB;
  if (bwOverage > 0) breakdown.push({ label: "帯域超過", cost: bwOverage });

  // DB (Fly Postgres は VM + Volume)
  let dbCost = 0;
  if (input.includeDB) {
    const dbVm = FLY.sharedCpu1xPerMonth;
    const dbVol = input.dbStorageGB * FLY.volumePerGBPerMonth;
    dbCost = dbVm + dbVol;
    breakdown.push({ label: `Fly Postgres VM + Volume`, cost: dbCost });
  }

  let subtotal = vmCost + memCost + volCost + bwOverage + dbCost;

  // Hobbyクレジット $5 を差し引き
  const credit = FLY.hobbyCredit;
  breakdown.push({ label: "Hobbyクレジット (-$5)", cost: -credit });
  const total = Math.max(0, subtotal - credit);

  const withinFree = subtotal <= credit;

  return { provider: "Fly.io", monthlyCost: total, breakdown, freeNote: "$5クレジット適用後", withinFree };
}

function calcRailway(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const minutes = input.hoursPerMonth * 60;

  // CPU費用
  const cpuCost = input.cpuShared * minutes * RAILWAY.cpuPerMinPerVCPU;
  breakdown.push({ label: `CPU (${input.cpuShared} vCPU × ${input.hoursPerMonth}h)`, cost: cpuCost });

  // メモリ費用
  const memCost = input.memoryGB * minutes * RAILWAY.memPerMinPerGB;
  breakdown.push({ label: `メモリ (${input.memoryGB}GB × ${input.hoursPerMonth}h)`, cost: memCost });

  // ディスク
  const diskCost = input.storageGB * RAILWAY.diskPerGBPerMonth;
  if (diskCost > 0) breakdown.push({ label: `ディスク (${input.storageGB}GB)`, cost: diskCost });

  // 帯域
  const bwCost = input.bandwidthGB * RAILWAY.bandwidthPerGB;
  if (bwCost > 0) breakdown.push({ label: `帯域 (${input.bandwidthGB}GB)`, cost: bwCost });

  // DB
  let dbCost = 0;
  if (input.includeDB) {
    const dbMem = 0.5; // Railway Postgres デフォルト 512MB
    const dbCpu = 0.5;
    const dbDisk = input.dbStorageGB * RAILWAY.diskPerGBPerMonth;
    const dbCompute = (dbCpu * minutes * RAILWAY.cpuPerMinPerVCPU) + (dbMem * minutes * RAILWAY.memPerMinPerGB);
    dbCost = dbCompute + dbDisk;
    breakdown.push({ label: `Postgres (0.5 vCPU, 512MB + ${input.dbStorageGB}GB disk)`, cost: dbCost });
  }

  const subtotal = cpuCost + memCost + diskCost + bwCost + dbCost;
  const base = RAILWAY.hobbyBase;
  breakdown.push({ label: "Hobby基本料 ($5含む)", cost: base });

  // Hobbyプランは$5の使用量込み
  const usageBeyondBase = Math.max(0, subtotal - base);
  const total = base + usageBeyondBase;

  const withinFree = subtotal <= base;

  return {
    provider: "Railway",
    monthlyCost: total,
    breakdown,
    freeNote: "使用量$5まで込み",
    withinFree,
  };
}

// ── 定数: ブランドカラー ───────────────────────────────────────────────────────

const BRAND: Record<Provider, { bg: string; border: string; badge: string; text: string; dot: string }> = {
  Render: {
    bg: "bg-violet-50",
    border: "border-violet-300",
    badge: "bg-violet-100 text-violet-800",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  "Fly.io": {
    bg: "bg-sky-50",
    border: "border-sky-300",
    badge: "bg-sky-100 text-sky-800",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  Railway: {
    bg: "bg-rose-50",
    border: "border-rose-300",
    badge: "bg-rose-100 text-rose-800",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

// ── 定数: リージョン ──────────────────────────────────────────────────────────

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

// ── 定数: 用途別おすすめ ───────────────────────────────────────────────────────

const USE_CASES = [
  {
    label: "静的サイト",
    icon: "🌐",
    color: "bg-violet-50 border-violet-200",
    winner: "Render" as Provider,
    reason: "静的サイト無制限無料",
  },
  {
    label: "APIサーバー",
    icon: "⚡",
    color: "bg-sky-50 border-sky-200",
    winner: "Fly.io" as Provider,
    reason: "東京リージョン対応・低レイテンシ",
  },
  {
    label: "フルスタック",
    icon: "🏗️",
    color: "bg-rose-50 border-rose-200",
    winner: "Railway" as Provider,
    reason: "従量課金で小規模に最適",
  },
  {
    label: "DB付き",
    icon: "🗄️",
    color: "bg-green-50 border-green-200",
    winner: "Railway" as Provider,
    reason: "Postgres込みで従量が安い",
  },
];

// ── スライダー入力コンポーネント ───────────────────────────────────────────────

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
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold tabular-nums">
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
        className="w-full accent-indigo-500 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
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

  const set = (key: keyof UserInput) => (v: number | boolean) =>
    setInput((prev) => ({ ...prev, [key]: v }));

  const results = useMemo<CostResult[]>(() => {
    const r = [calcRender(input), calcFly(input), calcRailway(input)];
    const minCost = Math.min(...r.map((x) => x.monthlyCost));
    return r.map((x) => ({ ...x, isCheapest: x.monthlyCost === minCost }));
  }, [input]);

  const fmt = (usd: number) => {
    if (showJpy) {
      return `¥${Math.round(usd * USD_TO_JPY).toLocaleString()}`;
    }
    return `$${usd.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["calculator", "regions", "usecases"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "calculator" ? "料金計算" : tab === "regions" ? "リージョン" : "用途別おすすめ"}
          </button>
        ))}
        <button
          onClick={() => setShowJpy((v) => !v)}
          className="ml-4 px-3 py-2 rounded-lg text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
        >
          {showJpy ? "USD表示" : "JPY表示"}
        </button>
      </div>

      {/* 料金計算タブ */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 入力パネル */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 text-lg">リソース設定</h2>

            <Slider label="CPU (shared vCPU)" value={input.cpuShared} min={0.5} max={8} step={0.5} unit="vCPU" onChange={set("cpuShared") as (v: number) => void} />
            <Slider label="メモリ" value={input.memoryGB} min={0.25} max={8} step={0.25} unit="GB" onChange={set("memoryGB") as (v: number) => void} />
            <Slider label="ストレージ" value={input.storageGB} min={0} max={100} step={1} unit="GB" onChange={set("storageGB") as (v: number) => void} />
            <Slider label="帯域幅" value={input.bandwidthGB} min={0} max={500} step={10} unit="GB/月" onChange={set("bandwidthGB") as (v: number) => void} />
            <Slider label="稼働時間" value={input.hoursPerMonth} min={100} max={720} step={10} unit="h/月" onChange={set("hoursPerMonth") as (v: number) => void} />

            <div className="pt-2 border-t border-gray-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={input.includeDB}
                  onChange={(e) => set("includeDB")(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">データベース追加</span>
              </label>
              {input.includeDB && (
                <Slider label="DBストレージ" value={input.dbStorageGB} min={0.25} max={20} step={0.25} unit="GB" onChange={set("dbStorageGB") as (v: number) => void} />
              )}
            </div>

            <p className="text-xs text-gray-400">
              ※ 為替レート: 1 USD = {USD_TO_JPY} 円（概算）
            </p>
          </div>

          {/* 結果カード */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((r) => {
              const b = BRAND[r.provider];
              return (
                <div
                  key={r.provider}
                  className={`rounded-2xl border-2 p-5 shadow-sm transition-all ${
                    r.isCheapest ? `${b.bg} ${b.border}` : "bg-white border-gray-200"
                  }`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${b.dot}`} />
                      <span className="font-bold text-gray-900">{r.provider}</span>
                    </div>
                    {r.isCheapest && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.badge}`}>
                        最安
                      </span>
                    )}
                  </div>

                  {/* 金額 */}
                  <div className="mb-3">
                    <span className={`text-3xl font-black ${r.isCheapest ? b.text : "text-gray-800"}`}>
                      {fmt(r.monthlyCost)}
                    </span>
                    <span className="text-gray-400 text-sm">/月</span>
                  </div>

                  {/* 無料枠内判定 */}
                  {r.withinFree && (
                    <div className="mb-2 text-xs font-semibold text-green-700 bg-green-50 rounded-lg px-2 py-1 text-center">
                      無料枠内
                    </div>
                  )}
                  {r.freeNote && (
                    <div className="mb-2 text-xs text-gray-400 text-center">{r.freeNote}</div>
                  )}

                  {/* 内訳 */}
                  <div className="space-y-1.5 border-t border-gray-100 pt-3">
                    {r.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate max-w-[130px]">{item.label}</span>
                        <span className="font-medium tabular-nums shrink-0 ml-1">
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

      {/* リージョンタブ */}
      {activeTab === "regions" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REGIONS.map((r) => {
            const b = BRAND[r.provider];
            return (
              <div key={r.provider} className={`rounded-2xl border-2 p-6 ${b.bg} ${b.border}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-3 h-3 rounded-full ${b.dot}`} />
                  <span className="font-bold text-gray-900 text-lg">{r.provider}</span>
                  {r.tokyoAvailable && (
                    <span className="ml-auto text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      東京 ✓
                    </span>
                  )}
                </div>
                <ul className="space-y-2">
                  {r.regions.map((reg) => (
                    <li key={reg} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`w-1.5 h-1.5 rounded-full ${b.dot} shrink-0`} />
                      {reg}
                      {reg.includes("Tokyo") && (
                        <span className="text-xs text-green-600 font-semibold">(東京)</span>
                      )}
                      {reg.includes("Osaka") && (
                        <span className="text-xs text-blue-600 font-semibold">(大阪)</span>
                      )}
                    </li>
                  ))}
                </ul>
                {!r.tokyoAvailable && (
                  <p className="mt-4 text-xs text-gray-400">
                    ※ 東京リージョンなし。日本からのレイテンシに注意。
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 用途別おすすめタブ */}
      {activeTab === "usecases" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {USE_CASES.map((uc) => {
            const b = BRAND[uc.winner];
            return (
              <div
                key={uc.label}
                className={`rounded-2xl border p-6 ${uc.color}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{uc.icon}</span>
                  <div>
                    <div className="font-bold text-gray-900">{uc.label}</div>
                    <div className={`text-xs font-semibold mt-0.5 ${b.text}`}>
                      おすすめ: {uc.winner}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{uc.reason}</p>
              </div>
            );
          })}

          {/* 概要比較テーブル */}
          <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">項目</th>
                  {(["Render", "Fly.io", "Railway"] as Provider[]).map((p) => (
                    <th key={p} className="text-center px-4 py-3 font-semibold text-gray-700">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${BRAND[p].dot}`} />
                        {p}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: "無料枠", render: "静的無制限 / サービス750h", fly: "$5クレジット", railway: "$5クレジット(初回)" },
                  { label: "最小プラン", render: "$7/月", fly: "$5/月〜", railway: "$5/月" },
                  { label: "東京リージョン", render: "×", fly: "◎", railway: "×" },
                  { label: "自動スリープ", render: "あり(無料)", fly: "なし", railway: "なし" },
                  { label: "課金方式", render: "プラン固定", fly: "リソース従量", railway: "秒単位従量" },
                  { label: "DB無料枠", render: "90日間", fly: "なし", railway: "なし" },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.render}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.fly}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.railway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        ※ 料金は2026年概算。最新情報は各社公式サイトを確認してください。
      </p>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "リソース設定を入力", desc: "CPU・メモリ・ストレージ・帯域幅をスライダーで設定します。実際のアプリ要件に合わせて調整してください。" },
            { step: "2", title: "DB の有無を選択", desc: "データベースが必要な場合はチェックをオンにし、DB ストレージ容量を入力します。各プロバイダーの DB 料金が自動で加算されます。" },
            { step: "3", title: "3社の料金を比較", desc: "Render・Fly.io・Railway の月額コストが並んで表示されます。最安プロバイダーには「最安」バッジが付きます。JPY 表示ボタンで日本円に切り替えできます。" },
            { step: "4", title: "リージョン・用途も確認", desc: "「リージョン」タブで東京リージョンの有無を確認。「用途別おすすめ」タブでユースケースごとの推奨を参照してください。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">{item.step}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問（FAQ）</h2>
        <div className="space-y-4">
          {[
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
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-gray-800 text-sm mb-1">{item.q}</div>
              <div className="text-sm text-gray-600">{item.a}</div>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/vercel-pricing", title: "Vercel 料金計算", desc: "フロントエンドデプロイの定番。Hobby・Pro・Enterprise の料金を試算。" },
            { href: "/netlify-pricing", title: "Netlify 料金計算", desc: "静的サイト・JAMstack 向けホスティングのコスト比較。" },
            { href: "/aws-lambda-cost", title: "AWS Lambda コスト計算", desc: "サーバーレス関数の実行コストを試算。Fly.io・Railway との比較に。" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
            >
              <div className="font-medium text-gray-800 text-sm group-hover:text-indigo-700">{link.title}</div>
              <div className="text-xs text-gray-500 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
