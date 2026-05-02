"use client";

import { useState, useMemo } from "react";

// ── 型定義 ────────────────────────────────────────────────────────────────────

type Provider = "Neon" | "PlanetScale" | "Turso";

interface UserInput {
  storageGB: number;       // ストレージ GB
  computeHours: number;    // コンピュート時間 h/月 (Neon)
  rowReadsB: number;       // 行読み取り 億/月 (PlanetScale)
  rowWritesM: number;      // 行書き込み 百万/月 (PlanetScale)
  dbCount: number;         // DB数 (Turso)
  readRequestsM: number;   // 読み取りリクエスト 百万/月 (Turso)
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

// Neon
const NEON = {
  free: {
    storageGB: 0.5,
    computeHours: 191.9, // ~0.5 CU × 720h (Free Tier)
  },
  pro: {
    base: 19,             // $19/月
    storagePerGB: 1.75,   // $1.75/GB/月 (Pro超過分)
    computePerHour: 0.16, // $0.16/compute-unit-hour (CU-hour)
    freeStorageGB: 10,    // Proプランの無料ストレージ
    freeComputeHours: 300,
  },
};

// PlanetScale
const PLANETSCALE = {
  scaler: {
    base: 29,              // $29/月
    storageGB: 25,         // 含まれるストレージ
    rowReadsB: 10,         // 含まれる行読み取り 10億
    rowWritesM: 10,        // 含まれる行書き込み 1000万
    extraStoragePerGB: 1.50,
    extraRowReadsPer100M: 1.00,  // 1億reads=$1
    extraRowWritesPer1M: 1.50,   // 100万writes=$1.5
  },
};

// Turso
const TURSO = {
  starter: {
    base: 0,
    storageGB: 9,
    dbCount: 500,
    readRequestsB: 1,     // 10億
    rowWritesM: 25,
  },
  scaler: {
    base: 29,             // $29/月
    storageGB: 24,        // 含まれるストレージ
    dbCount: 10000,
    readRequestsB: 100,
    rowWritesM: 100,
    extraStoragePerGB: 1.00,
    extraReadsPer1B: 1.00,
    extraWritesPer25M: 2.00,
  },
};

// ── 計算ロジック ───────────────────────────────────────────────────────────────

function calcNeon(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  // 無料枠チェック
  if (
    input.storageGB <= NEON.free.storageGB &&
    input.computeHours <= NEON.free.computeHours
  ) {
    breakdown.push({ label: "Free Tier (0.5GB / 191.9h)", cost: 0 });
    return {
      provider: "Neon",
      monthlyCost: 0,
      breakdown,
      freeNote: "Free Tier内",
      withinFree: true,
    };
  }

  // Pro プラン
  breakdown.push({ label: "Pro 基本料", cost: NEON.pro.base });

  // ストレージ超過
  const storageOverage = Math.max(0, input.storageGB - NEON.pro.freeStorageGB);
  if (storageOverage > 0) {
    const sc = storageOverage * NEON.pro.storagePerGB;
    breakdown.push({ label: `ストレージ超過 (${storageOverage.toFixed(1)}GB)`, cost: sc });
  }

  // コンピュート超過
  const computeOverage = Math.max(0, input.computeHours - NEON.pro.freeComputeHours);
  if (computeOverage > 0) {
    const cc = computeOverage * NEON.pro.computePerHour;
    breakdown.push({ label: `コンピュート超過 (${computeOverage.toFixed(0)}h)`, cost: cc });
  }

  const total =
    NEON.pro.base +
    Math.max(0, storageOverage * NEON.pro.storagePerGB) +
    Math.max(0, computeOverage * NEON.pro.computePerHour);

  return { provider: "Neon", monthlyCost: total, breakdown, withinFree: false };
}

function calcPlanetScale(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const ps = PLANETSCALE.scaler;
  breakdown.push({ label: "Scaler 基本料", cost: ps.base });

  // ストレージ超過
  const storageOverage = Math.max(0, input.storageGB - ps.storageGB);
  if (storageOverage > 0) {
    const sc = storageOverage * ps.extraStoragePerGB;
    breakdown.push({ label: `ストレージ超過 (${storageOverage.toFixed(1)}GB)`, cost: sc });
  }

  // 行読み取り超過 (単位: 億)
  const readOverageB = Math.max(0, input.rowReadsB - ps.rowReadsB);
  if (readOverageB > 0) {
    const rc = readOverageB * ps.extraRowReadsPer100M * 10; // 億→$1/億
    breakdown.push({ label: `行読み取り超過 (${readOverageB.toFixed(1)}億)`, cost: rc });
  }

  // 行書き込み超過 (単位: 百万)
  const writeOverageM = Math.max(0, input.rowWritesM - ps.rowWritesM);
  if (writeOverageM > 0) {
    const wc = (writeOverageM / 1) * ps.extraRowWritesPer1M;
    breakdown.push({ label: `行書き込み超過 (${writeOverageM.toFixed(0)}M)`, cost: wc });
  }

  const total =
    ps.base +
    Math.max(0, storageOverage * ps.extraStoragePerGB) +
    (readOverageB > 0 ? readOverageB * ps.extraRowReadsPer100M * 10 : 0) +
    (writeOverageM > 0 ? writeOverageM * ps.extraRowWritesPer1M : 0);

  return { provider: "PlanetScale", monthlyCost: total, breakdown, withinFree: false };
}

function calcTurso(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const free = TURSO.starter;

  // Starterプラン(無料)で収まるか
  if (
    input.storageGB <= free.storageGB &&
    input.dbCount <= free.dbCount &&
    input.readRequestsM / 1000 <= free.readRequestsB
  ) {
    breakdown.push({ label: "Starter (無料)", cost: 0 });
    return {
      provider: "Turso",
      monthlyCost: 0,
      breakdown,
      freeNote: "Starter内 (無料)",
      withinFree: true,
    };
  }

  // Scalerプラン
  const sc = TURSO.scaler;
  breakdown.push({ label: "Scaler 基本料", cost: sc.base });

  // ストレージ超過
  const storageOverage = Math.max(0, input.storageGB - sc.storageGB);
  if (storageOverage > 0) {
    const sv = storageOverage * sc.extraStoragePerGB;
    breakdown.push({ label: `ストレージ超過 (${storageOverage.toFixed(1)}GB)`, cost: sv });
  }

  // 読み取りリクエスト超過 (百万→10億換算)
  const readB = input.readRequestsM / 1000;
  const readOverageB = Math.max(0, readB - sc.readRequestsB);
  if (readOverageB > 0) {
    const rv = readOverageB * sc.extraReadsPer1B;
    breakdown.push({ label: `読み取り超過 (${readOverageB.toFixed(2)}B req)`, cost: rv });
  }

  const total =
    sc.base +
    Math.max(0, storageOverage * sc.extraStoragePerGB) +
    (readOverageB > 0 ? readOverageB * sc.extraReadsPer1B : 0);

  return { provider: "Turso", monthlyCost: total, breakdown, withinFree: false };
}

// ── ブランドカラー ─────────────────────────────────────────────────────────────

const BRAND: Record<Provider, { bg: string; border: string; badge: string; text: string; dot: string; accent: string }> = {
  Neon: {
    bg: "bg-violet-50",
    border: "border-violet-300",
    badge: "bg-violet-100 text-violet-800",
    text: "text-violet-700",
    dot: "bg-violet-500",
    accent: "violet",
  },
  PlanetScale: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    badge: "bg-purple-100 text-purple-800",
    text: "text-purple-700",
    dot: "bg-purple-500",
    accent: "purple",
  },
  Turso: {
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-300",
    badge: "bg-fuchsia-100 text-fuchsia-800",
    text: "text-fuchsia-700",
    dot: "bg-fuchsia-500",
    accent: "fuchsia",
  },
};

// ── 機能比較データ ─────────────────────────────────────────────────────────────

const FEATURES = [
  { label: "DB種別", neon: "Postgres", ps: "MySQL (Vitess)", turso: "SQLite (libSQL)" },
  { label: "無料枠ストレージ", neon: "0.5 GB", ps: "なし", turso: "9 GB" },
  { label: "無料枠コンピュート", neon: "191.9 h/月", ps: "なし", turso: "1B reads/月" },
  { label: "最小有料プラン", neon: "$19/月 (Pro)", ps: "$29/月 (Scaler)", turso: "$29/月 (Scaler)" },
  { label: "ブランチング", neon: "◎ (標準機能)", ps: "◎ (標準機能)", turso: "△ (DB複製で代替)" },
  { label: "エッジ展開", neon: "○ (HTTP経由)", ps: "○", turso: "◎ (エッジネイティブ)" },
  { label: "リードレプリカ", neon: "○ (Pro+)", ps: "○", turso: "◎ (組み込み)" },
  { label: "コネクションプール", neon: "◎ (PgBouncer内蔵)", ps: "◎", turso: "○" },
  { label: "東京リージョン", neon: "○", ps: "○", turso: "◎ (分散DB)" },
  { label: "オートスケール", neon: "◎", ps: "◎", turso: "◎" },
  { label: "スリープ/ウェイクアップ", neon: "◎ (自動)", ps: "なし", turso: "なし" },
  { label: "DB数上限(無料)", neon: "10", ps: "なし(有料のみ)", turso: "500" },
];

// ── 用途別おすすめ ─────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    label: "個人開発・趣味",
    icon: "🧑‍💻",
    winner: "Turso" as Provider,
    reason: "9GB無料・500DBまで無料。ホビープロジェクトに最適。",
    color: "bg-fuchsia-50 border-fuchsia-200",
  },
  {
    label: "Next.js / Vercel連携",
    icon: "▲",
    winner: "Neon" as Provider,
    reason: "Vercel公式パートナー。ブランチと同期するDBプレビューが強力。",
    color: "bg-violet-50 border-violet-200",
  },
  {
    label: "高トラフィックSaaS",
    icon: "🚀",
    winner: "PlanetScale" as Provider,
    reason: "Vitessベースで水平スケール。大規模MySQL実績多数。",
    color: "bg-purple-50 border-purple-200",
  },
  {
    label: "エッジ/分散アプリ",
    icon: "🌍",
    winner: "Turso" as Provider,
    reason: "SQLiteをエッジに複製。レイテンシ最小化に特化。",
    color: "bg-fuchsia-50 border-fuchsia-200",
  },
];

// ── スライダー ────────────────────────────────────────────────────────────────

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
        className="w-full accent-violet-500 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// ── セクションタイトル ─────────────────────────────────────────────────────────

function SectionNote({ text }: { text: string }) {
  return (
    <p className="text-xs text-gray-400 italic mt-1">{text}</p>
  );
}

// ── メインコンポーネント ───────────────────────────────────────────────────────

export default function NeonPlanetscaleComparison() {
  const [input, setInput] = useState<UserInput>({
    storageGB: 1,
    computeHours: 100,
    rowReadsB: 1,
    rowWritesM: 5,
    dbCount: 3,
    readRequestsM: 50,
  });

  const [showJpy, setShowJpy] = useState(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "features" | "usecases">("calculator");

  const set = (key: keyof UserInput) => (v: number) =>
    setInput((prev) => ({ ...prev, [key]: v }));

  const results = useMemo<CostResult[]>(() => {
    const r = [calcNeon(input), calcPlanetScale(input), calcTurso(input)];
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
      {/* タブ + 通貨切替 */}
      <div className="flex flex-wrap gap-1 items-center">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["calculator", "features", "usecases"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "calculator" ? "料金計算" : tab === "features" ? "機能比較" : "用途別おすすめ"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowJpy((v) => !v)}
          className="ml-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
        >
          {showJpy ? "USD表示" : "JPY表示"}
        </button>
      </div>

      {/* ─── 料金計算タブ ─────────────────────────────────────────────────────── */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 入力パネル */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 text-lg">使用量設定</h2>

            <div>
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">共通</p>
              <div className="space-y-4">
                <Slider label="ストレージ" value={input.storageGB} min={0.5} max={100} step={0.5} unit="GB" onChange={set("storageGB")} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">Neon</p>
              <div className="space-y-4">
                <Slider label="コンピュート時間" value={input.computeHours} min={0} max={720} step={10} unit="h/月" onChange={set("computeHours")} />
                <SectionNote text="1 CU = 0.25 vCPU + 1GB RAM。Free: 191.9h、Pro: 300h無料" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">PlanetScale</p>
              <div className="space-y-4">
                <Slider label="行読み取り" value={input.rowReadsB} min={0} max={50} step={1} unit="億/月" onChange={set("rowReadsB")} />
                <Slider label="行書き込み" value={input.rowWritesM} min={0} max={100} step={1} unit="M/月" onChange={set("rowWritesM")} />
                <SectionNote text="Scaler: 10億reads / 1000万writes 込み" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-fuchsia-600 uppercase tracking-wide mb-3">Turso</p>
              <div className="space-y-4">
                <Slider label="DB数" value={input.dbCount} min={1} max={1000} step={1} unit="個" onChange={set("dbCount")} />
                <Slider label="読み取りリクエスト" value={input.readRequestsM} min={0} max={5000} step={50} unit="M/月" onChange={set("readRequestsM")} />
                <SectionNote text="Starter: 9GB / 500DB / 1B reads 無料" />
              </div>
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
                      <span className="font-bold text-gray-900 text-sm">{r.provider}</span>
                    </div>
                    {r.isCheapest && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.badge}`}>
                        最安
                      </span>
                    )}
                  </div>

                  {/* DB種別バッジ */}
                  <div className="mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.badge}`}>
                      {r.provider === "Neon" ? "Postgres" : r.provider === "PlanetScale" ? "MySQL" : "SQLite"}
                    </span>
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

      {/* ─── 機能比較タブ ─────────────────────────────────────────────────────── */}
      {activeTab === "features" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/4">項目</th>
                {(["Neon", "PlanetScale", "Turso"] as Provider[]).map((p) => (
                  <th key={p} className="text-center px-4 py-3 font-semibold text-gray-700">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${BRAND[p].dot}`} />
                        <span>{p}</span>
                      </div>
                      <span className={`text-xs font-normal ${BRAND[p].text}`}>
                        {p === "Neon" ? "Postgres" : p === "PlanetScale" ? "MySQL (Vitess)" : "SQLite (libSQL)"}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FEATURES.map((row) => (
                <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.neon}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.ps}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{row.turso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── 用途別おすすめタブ ───────────────────────────────────────────────── */}
      {activeTab === "usecases" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {USE_CASES.map((uc) => {
            const b = BRAND[uc.winner];
            return (
              <div key={uc.label} className={`rounded-2xl border p-6 ${uc.color}`}>
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
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このNeon / PlanetScale / Turso 比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">モダンサーバーレスDB 3社の料金・機能・レイテンシを横断比較。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このNeon / PlanetScale / Turso 比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "モダンサーバーレスDB 3社の料金・機能・レイテンシを横断比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}

          {/* プラン概要テーブル */}
          <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">プラン</th>
                  {(["Neon", "PlanetScale", "Turso"] as Provider[]).map((p) => (
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
                  { label: "無料プラン", neon: "Free (0.5GB)", ps: "なし", turso: "Starter (9GB)" },
                  { label: "最小有料プラン", neon: "Pro $19/月", ps: "Scaler $29/月", turso: "Scaler $29/月" },
                  { label: "無料ストレージ", neon: "0.5 GB", ps: "—", turso: "9 GB" },
                  { label: "ブランチング", neon: "◎ 標準装備", ps: "◎ 標準装備", turso: "△ 手動複製" },
                  { label: "エッジ対応", neon: "○", ps: "○", turso: "◎ ネイティブ" },
                  { label: "コネクションプール", neon: "◎ 内蔵", ps: "◎ 内蔵", turso: "○" },
                  { label: "スリープ機能", neon: "◎ 自動", ps: "なし", turso: "なし" },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.neon}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.ps}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.turso}</td>
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
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Neon / PlanetScale / Turso 比較",
  "description": "モダンサーバーレスDB 3社の料金・機能・レイテンシを横断比較",
  "url": "https://tools.loresync.dev/neon-planetscale-comparison",
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
