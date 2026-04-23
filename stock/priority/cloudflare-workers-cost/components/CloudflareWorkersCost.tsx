"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// 料金定数
// ---------------------------------------------------------------------------

const CF_ORANGE = "#F6821F";

// Workers Paid 基本料金
const PAID_BASE_USD = 5;

// Workers リクエスト
const REQUESTS_FREE_DAILY = 100_000; // Free: 10万/日
const REQUESTS_FREE_MONTHLY = REQUESTS_FREE_DAILY * 30; // ≈3M
const REQUESTS_PAID_INCLUDED = 10_000_000; // Paid: 10M含む
const REQUESTS_OVERAGE_PER_M = 0.30; // $0.30/1M超過

// CPU時間
const CPU_FREE_MS_PER_INVOCATION = 10; // Free: 10ms/call (制限)
const CPU_PAID_INCLUDED_MS = 30_000_000; // Paid: 30M ms含む
const CPU_OVERAGE_PER_M_MS = 0.02; // $0.02/1M ms超過

// KV
const KV_PAID_READS_INCLUDED = 10_000_000; // 10M reads/月
const KV_PAID_WRITES_INCLUDED = 1_000_000; // 1M writes/月
const KV_PAID_STORAGE_INCLUDED_GB = 1;
const KV_OVERAGE_READS_PER_M = 0.50;
const KV_OVERAGE_WRITES_PER_M = 5.00;
const KV_OVERAGE_STORAGE_PER_GB = 0.50;

// R2
const R2_STORAGE_INCLUDED_GB = 10;
const R2_CLASS_A_INCLUDED = 1_000_000;
const R2_CLASS_B_INCLUDED = 10_000_000;
const R2_OVERAGE_STORAGE_PER_GB = 0.015;
const R2_OVERAGE_CLASS_A_PER_M = 4.50;
const R2_OVERAGE_CLASS_B_PER_M = 0.36;

// D1
const D1_PAID_ROWS_READ_INCLUDED = 25_000_000_000; // 25B
const D1_PAID_ROWS_WRITTEN_INCLUDED = 50_000_000; // 50M
const D1_PAID_STORAGE_INCLUDED_GB = 5;
const D1_OVERAGE_ROWS_READ_PER_M = 0.001;
const D1_OVERAGE_ROWS_WRITTEN_PER_M = 1.00;
const D1_OVERAGE_STORAGE_PER_GB = 0.75;

// ---------------------------------------------------------------------------
// 型
// ---------------------------------------------------------------------------
type Plan = "free" | "paid";

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------
function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.001) return `<$0.001`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function overage(used: number, included: number): number {
  return Math.max(0, used - included);
}

// ---------------------------------------------------------------------------
// 小コンポーネント
// ---------------------------------------------------------------------------

/** セクションヘッダー + ON/OFFトグル */
function SectionHeader({
  title,
  enabled,
  onToggle,
  badge,
}: {
  title: string;
  enabled: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-medium">
            {badge}
          </span>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
          enabled ? "bg-[#F6821F]" : "bg-gray-300"
        }`}
        aria-label={`${title}を${enabled ? "無効化" : "有効化"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/** 数値入力行 */
function NumInput({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  step?: number;
  min?: number;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <label className="text-sm text-gray-700">{label}</label>
        {hint && <div className="text-xs text-gray-400 mt-0.5">{hint}</div>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= min) onChange(v);
          }}
          className="w-32 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F6821F] focus:border-transparent"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap w-16">{unit}</span>
      </div>
    </div>
  );
}

/** 無料枠使用状況バー */
function UsageBar({
  label,
  used,
  included,
  unit,
  formatFn = fmtNum,
}: {
  label: string;
  used: number;
  included: number;
  unit: string;
  formatFn?: (n: number) => string;
}) {
  const pct = included > 0 ? Math.min((used / included) * 100, 100) : 100;
  const over = used > included;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <span className={`text-xs font-semibold ${over ? "text-red-600" : "text-gray-700"}`}>
          {formatFn(used)} / {formatFn(included)} {unit}
          {over && <span className="ml-1 text-red-500">（超過）</span>}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? "#ef4444" : pct > 80 ? "#f59e0b" : CF_ORANGE,
          }}
        />
      </div>
    </div>
  );
}

/** コスト内訳行 */
function CostRow({
  label,
  cost,
  exchangeRate,
  highlight = false,
}: {
  label: string;
  cost: number;
  exchangeRate: number;
  highlight?: boolean;
}) {
  if (cost === 0 && !highlight) return null;
  return (
    <div
      className={`flex justify-between items-center py-1.5 ${
        highlight ? "border-t border-gray-200 font-semibold text-gray-800 pt-2 mt-1" : "text-gray-600"
      }`}
    >
      <span className="text-xs">{label}</span>
      <div className="text-right">
        <span className="text-xs font-medium">{fmtUSD(cost)}</span>
        {exchangeRate > 0 && cost > 0 && (
          <span className="text-xs text-gray-400 ml-1.5">{fmtJPY(cost * exchangeRate)}</span>
        )}
      </div>
    </div>
  );
}

/** サービス別コストカード */
function ServiceCard({
  title,
  cost,
  exchangeRate,
  free,
}: {
  title: string;
  cost: number;
  exchangeRate: number;
  free: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className={`text-lg font-bold ${free ? "text-green-600" : "text-gray-800"}`}>
        {free ? "無料" : fmtUSD(cost)}
      </div>
      {!free && cost > 0 && (
        <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(cost * exchangeRate)}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// メインコンポーネント
// ---------------------------------------------------------------------------
export default function CloudflareWorkersCost() {
  const [plan, setPlan] = useState<Plan>("paid");
  const [exchangeRate, setExchangeRate] = useState(150);

  // Workers
  const [requestsPerMonth, setRequestsPerMonth] = useState(5_000_000);
  const [avgCpuMs, setAvgCpuMs] = useState(5);

  // KV
  const [kvEnabled, setKvEnabled] = useState(false);
  const [kvReads, setKvReads] = useState(1_000_000);
  const [kvWrites, setKvWrites] = useState(100_000);
  const [kvStorageGB, setKvStorageGB] = useState(1);

  // R2
  const [r2Enabled, setR2Enabled] = useState(false);
  const [r2StorageGB, setR2StorageGB] = useState(10);
  const [r2ClassA, setR2ClassA] = useState(500_000);
  const [r2ClassB, setR2ClassB] = useState(5_000_000);

  // D1
  const [d1Enabled, setD1Enabled] = useState(false);
  const [d1RowsRead, setD1RowsRead] = useState(10_000_000);
  const [d1RowsWritten, setD1RowsWritten] = useState(1_000_000);
  const [d1StorageGB, setD1StorageGB] = useState(1);

  const calc = useMemo(() => {
    const isFree = plan === "free";

    // --- Workers ---
    const totalCpuMs = requestsPerMonth * avgCpuMs;
    let workersCost = 0;
    let requestsOverage = 0;
    let cpuOverage = 0;

    if (isFree) {
      // Free: 制限のみ（超過課金なし）
    } else {
      requestsOverage = overage(requestsPerMonth, REQUESTS_PAID_INCLUDED);
      cpuOverage = overage(totalCpuMs, CPU_PAID_INCLUDED_MS);
      workersCost =
        (requestsOverage / 1_000_000) * REQUESTS_OVERAGE_PER_M +
        (cpuOverage / 1_000_000) * CPU_OVERAGE_PER_M_MS;
    }

    // --- KV ---
    let kvCost = 0;
    let kvReadsOverage = 0;
    let kvWritesOverage = 0;
    let kvStorageOverage = 0;
    if (kvEnabled && !isFree) {
      kvReadsOverage = overage(kvReads, KV_PAID_READS_INCLUDED);
      kvWritesOverage = overage(kvWrites, KV_PAID_WRITES_INCLUDED);
      kvStorageOverage = Math.max(0, kvStorageGB - KV_PAID_STORAGE_INCLUDED_GB);
      kvCost =
        (kvReadsOverage / 1_000_000) * KV_OVERAGE_READS_PER_M +
        (kvWritesOverage / 1_000_000) * KV_OVERAGE_WRITES_PER_M +
        kvStorageOverage * KV_OVERAGE_STORAGE_PER_GB;
    }

    // --- R2 ---
    let r2Cost = 0;
    let r2StorageOverage = 0;
    let r2ClassAOverage = 0;
    let r2ClassBOverage = 0;
    if (r2Enabled && !isFree) {
      r2StorageOverage = Math.max(0, r2StorageGB - R2_STORAGE_INCLUDED_GB);
      r2ClassAOverage = overage(r2ClassA, R2_CLASS_A_INCLUDED);
      r2ClassBOverage = overage(r2ClassB, R2_CLASS_B_INCLUDED);
      r2Cost =
        r2StorageOverage * R2_OVERAGE_STORAGE_PER_GB +
        (r2ClassAOverage / 1_000_000) * R2_OVERAGE_CLASS_A_PER_M +
        (r2ClassBOverage / 1_000_000) * R2_OVERAGE_CLASS_B_PER_M;
    }

    // --- D1 ---
    let d1Cost = 0;
    let d1RowsReadOverage = 0;
    let d1RowsWrittenOverage = 0;
    let d1StorageOverage = 0;
    if (d1Enabled && !isFree) {
      d1RowsReadOverage = overage(d1RowsRead, D1_PAID_ROWS_READ_INCLUDED);
      d1RowsWrittenOverage = overage(d1RowsWritten, D1_PAID_ROWS_WRITTEN_INCLUDED);
      d1StorageOverage = Math.max(0, d1StorageGB - D1_PAID_STORAGE_INCLUDED_GB);
      d1Cost =
        (d1RowsReadOverage / 1_000_000) * D1_OVERAGE_ROWS_READ_PER_M +
        (d1RowsWrittenOverage / 1_000_000) * D1_OVERAGE_ROWS_WRITTEN_PER_M +
        d1StorageOverage * D1_OVERAGE_STORAGE_PER_GB;
    }

    const baseSubscription = isFree ? 0 : PAID_BASE_USD;
    const overageCost = workersCost + kvCost + r2Cost + d1Cost;
    const totalUSD = baseSubscription + overageCost;

    return {
      isFree,
      totalCpuMs,
      workersCost,
      requestsOverage,
      cpuOverage,
      kvCost,
      kvReadsOverage,
      kvWritesOverage,
      kvStorageOverage,
      r2Cost,
      r2StorageOverage,
      r2ClassAOverage,
      r2ClassBOverage,
      d1Cost,
      d1RowsReadOverage,
      d1RowsWrittenOverage,
      d1StorageOverage,
      baseSubscription,
      overageCost,
      totalUSD,
    };
  }, [
    plan,
    requestsPerMonth, avgCpuMs,
    kvEnabled, kvReads, kvWrites, kvStorageGB,
    r2Enabled, r2StorageGB, r2ClassA, r2ClassB,
    d1Enabled, d1RowsRead, d1RowsWritten, d1StorageGB,
  ]);

  const isFree = plan === "free";

  return (
    <div className="space-y-5">

      {/* ===== プラン選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">プランを選択</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            {
              id: "free" as Plan,
              name: "Free",
              price: "$0/月",
              desc: "100K req/日, 10ms CPU/call",
            },
            {
              id: "paid" as Plan,
              name: "Workers Paid",
              price: "$5/月〜",
              desc: "10M req/月含む, 30M ms CPU含む",
            },
          ]).map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                plan === p.id
                  ? "border-[#F6821F] bg-orange-50 ring-2 ring-orange-200 shadow-sm"
                  : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
                {p.id === "paid" && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-medium">
                    推奨
                  </span>
                )}
              </div>
              <div className="text-base font-bold" style={{ color: CF_ORANGE }}>{p.price}</div>
              <div className="text-xs text-gray-500 mt-1">{p.desc}</div>
            </button>
          ))}
        </div>
        {isFree && (
          <p className="mt-3 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700">
            Freeプランは超過課金がありません。制限を超えたリクエストはスロットルされます。
          </p>
        )}
      </div>

      {/* ===== Workers ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Workers 使用量</h2>
        <div className="space-y-4">
          <NumInput
            label="リクエスト数/月"
            value={requestsPerMonth}
            onChange={setRequestsPerMonth}
            unit="req/月"
            step={100_000}
            hint={isFree ? `無料枠: ${fmtNum(REQUESTS_FREE_MONTHLY)} req/月 (${fmtNum(REQUESTS_FREE_DAILY)}/日)` : `含む: ${fmtNum(REQUESTS_PAID_INCLUDED)} req/月`}
          />
          <NumInput
            label="平均 CPU 時間/リクエスト"
            value={avgCpuMs}
            onChange={setAvgCpuMs}
            unit="ms/req"
            step={1}
            hint={isFree ? "上限: 10ms/invocation" : `含む: ${fmtNum(CPU_PAID_INCLUDED_MS)} ms/月 合計`}
          />
        </div>

        {/* 無料枠バー */}
        <div className="mt-5 space-y-3">
          {isFree ? (
            <>
              <UsageBar
                label="リクエスト（日次）"
                used={Math.round(requestsPerMonth / 30)}
                included={REQUESTS_FREE_DAILY}
                unit="req/日"
              />
              <UsageBar
                label="CPU 時間（上限 10ms/call、表示のみ）"
                used={avgCpuMs}
                included={CPU_FREE_MS_PER_INVOCATION}
                unit="ms"
              />
            </>
          ) : (
            <>
              <UsageBar
                label="リクエスト/月"
                used={requestsPerMonth}
                included={REQUESTS_PAID_INCLUDED}
                unit="req"
              />
              <UsageBar
                label="CPU 時間合計/月"
                used={calc.totalCpuMs}
                included={CPU_PAID_INCLUDED_MS}
                unit="ms"
              />
            </>
          )}
        </div>
      </div>

      {/* ===== KV ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <SectionHeader
          title="KV Storage"
          enabled={kvEnabled}
          onToggle={() => setKvEnabled((v) => !v)}
          badge={isFree ? "Free枠あり" : undefined}
        />
        {kvEnabled && (
          <div className="mt-4 space-y-4">
            {isFree ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                Free: 100K reads/日・1K writes/日・1GB storage まで無料
              </p>
            ) : (
              <>
                <NumInput
                  label="KV reads/月"
                  value={kvReads}
                  onChange={setKvReads}
                  unit="reads/月"
                  step={100_000}
                  hint={`含む: ${fmtNum(KV_PAID_READS_INCLUDED)} reads`}
                />
                <NumInput
                  label="KV writes/月"
                  value={kvWrites}
                  onChange={setKvWrites}
                  unit="writes/月"
                  step={10_000}
                  hint={`含む: ${fmtNum(KV_PAID_WRITES_INCLUDED)} writes`}
                />
                <NumInput
                  label="KV storage"
                  value={kvStorageGB}
                  onChange={setKvStorageGB}
                  unit="GB"
                  step={0.5}
                  hint={`含む: ${KV_PAID_STORAGE_INCLUDED_GB} GB`}
                />
                <div className="space-y-2.5 pt-1">
                  <UsageBar label="reads" used={kvReads} included={KV_PAID_READS_INCLUDED} unit="reads" />
                  <UsageBar label="writes" used={kvWrites} included={KV_PAID_WRITES_INCLUDED} unit="writes" />
                  <UsageBar
                    label="storage"
                    used={kvStorageGB}
                    included={KV_PAID_STORAGE_INCLUDED_GB}
                    unit="GB"
                    formatFn={(n) => `${n.toFixed(1)}`}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== R2 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <SectionHeader
          title="R2 Object Storage"
          enabled={r2Enabled}
          onToggle={() => setR2Enabled((v) => !v)}
          badge={isFree ? "Free枠あり" : undefined}
        />
        {r2Enabled && (
          <div className="mt-4 space-y-4">
            {isFree ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                Free: 10GB storage・1M Class A ops・10M Class B ops まで無料
              </p>
            ) : (
              <>
                <NumInput
                  label="R2 storage"
                  value={r2StorageGB}
                  onChange={setR2StorageGB}
                  unit="GB"
                  step={1}
                  hint={`含む: ${R2_STORAGE_INCLUDED_GB} GB`}
                />
                <NumInput
                  label="Class A ops（PUT/DELETE）/月"
                  value={r2ClassA}
                  onChange={setR2ClassA}
                  unit="ops/月"
                  step={100_000}
                  hint={`含む: ${fmtNum(R2_CLASS_A_INCLUDED)} ops`}
                />
                <NumInput
                  label="Class B ops（GET/HEAD）/月"
                  value={r2ClassB}
                  onChange={setR2ClassB}
                  unit="ops/月"
                  step={1_000_000}
                  hint={`含む: ${fmtNum(R2_CLASS_B_INCLUDED)} ops`}
                />
                <div className="space-y-2.5 pt-1">
                  <UsageBar
                    label="storage"
                    used={r2StorageGB}
                    included={R2_STORAGE_INCLUDED_GB}
                    unit="GB"
                    formatFn={(n) => `${n.toFixed(1)}`}
                  />
                  <UsageBar label="Class A ops" used={r2ClassA} included={R2_CLASS_A_INCLUDED} unit="ops" />
                  <UsageBar label="Class B ops" used={r2ClassB} included={R2_CLASS_B_INCLUDED} unit="ops" />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== D1 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <SectionHeader
          title="D1 Database"
          enabled={d1Enabled}
          onToggle={() => setD1Enabled((v) => !v)}
          badge={isFree ? "Free枠あり" : undefined}
        />
        {d1Enabled && (
          <div className="mt-4 space-y-4">
            {isFree ? (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                Free: 5M rows read/日・100K rows written/日・5GB storage まで無料
              </p>
            ) : (
              <>
                <NumInput
                  label="rows read/月"
                  value={d1RowsRead}
                  onChange={setD1RowsRead}
                  unit="rows/月"
                  step={1_000_000}
                  hint={`含む: ${fmtNum(D1_PAID_ROWS_READ_INCLUDED)} rows`}
                />
                <NumInput
                  label="rows written/月"
                  value={d1RowsWritten}
                  onChange={setD1RowsWritten}
                  unit="rows/月"
                  step={100_000}
                  hint={`含む: ${fmtNum(D1_PAID_ROWS_WRITTEN_INCLUDED)} rows`}
                />
                <NumInput
                  label="D1 storage"
                  value={d1StorageGB}
                  onChange={setD1StorageGB}
                  unit="GB"
                  step={0.5}
                  hint={`含む: ${D1_PAID_STORAGE_INCLUDED_GB} GB`}
                />
                <div className="space-y-2.5 pt-1">
                  <UsageBar label="rows read" used={d1RowsRead} included={D1_PAID_ROWS_READ_INCLUDED} unit="rows" />
                  <UsageBar label="rows written" used={d1RowsWritten} included={D1_PAID_ROWS_WRITTEN_INCLUDED} unit="rows" />
                  <UsageBar
                    label="storage"
                    used={d1StorageGB}
                    included={D1_PAID_STORAGE_INCLUDED_GB}
                    unit="GB"
                    formatFn={(n) => `${n.toFixed(1)}`}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== 為替レート ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">為替レート</h2>
        <div className="flex items-center gap-2 w-fit">
          <span className="text-sm text-gray-500">1 USD =</span>
          <input
            type="number"
            min={1}
            max={500}
            step={1}
            value={exchangeRate}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v > 0) setExchangeRate(v);
            }}
            className="w-24 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F6821F]"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div
        className="rounded-2xl shadow-sm border p-6"
        style={{ borderColor: CF_ORANGE, background: "linear-gradient(135deg, #fff8f2 0%, #fff 100%)" }}
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-base font-semibold text-gray-800">月額コスト</h2>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: CF_ORANGE }}
          >
            {plan === "free" ? "Free" : "Workers Paid"}
          </span>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">月額合計</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-5xl font-bold text-gray-900">{fmtUSD(calc.totalUSD)}</span>
            <span className="text-2xl text-gray-500">{fmtJPY(calc.totalUSD * exchangeRate)}</span>
          </div>
          {!isFree && (
            <p className="text-xs text-gray-400 mt-1.5">
              基本料金 $5 + 超過料金 {fmtUSD(calc.overageCost)}
            </p>
          )}
        </div>

        {/* サービス別カード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <ServiceCard
            title="Workers"
            cost={calc.baseSubscription + calc.workersCost}
            exchangeRate={exchangeRate}
            free={isFree}
          />
          <ServiceCard
            title="KV Storage"
            cost={kvEnabled ? calc.kvCost : 0}
            exchangeRate={exchangeRate}
            free={isFree || !kvEnabled}
          />
          <ServiceCard
            title="R2 Storage"
            cost={r2Enabled ? calc.r2Cost : 0}
            exchangeRate={exchangeRate}
            free={isFree || !r2Enabled}
          />
          <ServiceCard
            title="D1 Database"
            cost={d1Enabled ? calc.d1Cost : 0}
            exchangeRate={exchangeRate}
            free={isFree || !d1Enabled}
          />
        </div>

        {/* 詳細内訳 */}
        {!isFree && (
          <div className="bg-white rounded-xl p-4 text-xs border border-gray-100 shadow-sm">
            <div className="font-semibold text-gray-700 mb-2">コスト内訳</div>

            {/* Workers Paid基本料金 */}
            <CostRow label="Workers Paid 基本料金" cost={PAID_BASE_USD} exchangeRate={exchangeRate} />

            {/* Workers超過 */}
            {calc.requestsOverage > 0 && (
              <CostRow
                label={`リクエスト超過 ${fmtNum(calc.requestsOverage)} req × $${REQUESTS_OVERAGE_PER_M}/1M`}
                cost={(calc.requestsOverage / 1_000_000) * REQUESTS_OVERAGE_PER_M}
                exchangeRate={exchangeRate}
              />
            )}
            {calc.cpuOverage > 0 && (
              <CostRow
                label={`CPU時間超過 ${fmtNum(calc.cpuOverage)} ms × $${CPU_OVERAGE_PER_M_MS}/1M ms`}
                cost={(calc.cpuOverage / 1_000_000) * CPU_OVERAGE_PER_M_MS}
                exchangeRate={exchangeRate}
              />
            )}

            {/* KV超過 */}
            {kvEnabled && calc.kvReadsOverage > 0 && (
              <CostRow
                label={`KV reads超過 ${fmtNum(calc.kvReadsOverage)} × $${KV_OVERAGE_READS_PER_M}/1M`}
                cost={(calc.kvReadsOverage / 1_000_000) * KV_OVERAGE_READS_PER_M}
                exchangeRate={exchangeRate}
              />
            )}
            {kvEnabled && calc.kvWritesOverage > 0 && (
              <CostRow
                label={`KV writes超過 ${fmtNum(calc.kvWritesOverage)} × $${KV_OVERAGE_WRITES_PER_M}/1M`}
                cost={(calc.kvWritesOverage / 1_000_000) * KV_OVERAGE_WRITES_PER_M}
                exchangeRate={exchangeRate}
              />
            )}
            {kvEnabled && calc.kvStorageOverage > 0 && (
              <CostRow
                label={`KV storage超過 ${calc.kvStorageOverage.toFixed(1)} GB × $${KV_OVERAGE_STORAGE_PER_GB}/GB`}
                cost={calc.kvStorageOverage * KV_OVERAGE_STORAGE_PER_GB}
                exchangeRate={exchangeRate}
              />
            )}

            {/* R2超過 */}
            {r2Enabled && calc.r2StorageOverage > 0 && (
              <CostRow
                label={`R2 storage超過 ${calc.r2StorageOverage.toFixed(1)} GB × $${R2_OVERAGE_STORAGE_PER_GB}/GB`}
                cost={calc.r2StorageOverage * R2_OVERAGE_STORAGE_PER_GB}
                exchangeRate={exchangeRate}
              />
            )}
            {r2Enabled && calc.r2ClassAOverage > 0 && (
              <CostRow
                label={`R2 Class A超過 ${fmtNum(calc.r2ClassAOverage)} ops × $${R2_OVERAGE_CLASS_A_PER_M}/1M`}
                cost={(calc.r2ClassAOverage / 1_000_000) * R2_OVERAGE_CLASS_A_PER_M}
                exchangeRate={exchangeRate}
              />
            )}
            {r2Enabled && calc.r2ClassBOverage > 0 && (
              <CostRow
                label={`R2 Class B超過 ${fmtNum(calc.r2ClassBOverage)} ops × $${R2_OVERAGE_CLASS_B_PER_M}/1M`}
                cost={(calc.r2ClassBOverage / 1_000_000) * R2_OVERAGE_CLASS_B_PER_M}
                exchangeRate={exchangeRate}
              />
            )}

            {/* D1超過 */}
            {d1Enabled && calc.d1RowsReadOverage > 0 && (
              <CostRow
                label={`D1 rows read超過 ${fmtNum(calc.d1RowsReadOverage)} × $${D1_OVERAGE_ROWS_READ_PER_M}/1M`}
                cost={(calc.d1RowsReadOverage / 1_000_000) * D1_OVERAGE_ROWS_READ_PER_M}
                exchangeRate={exchangeRate}
              />
            )}
            {d1Enabled && calc.d1RowsWrittenOverage > 0 && (
              <CostRow
                label={`D1 rows written超過 ${fmtNum(calc.d1RowsWrittenOverage)} × $${D1_OVERAGE_ROWS_WRITTEN_PER_M}/1M`}
                cost={(calc.d1RowsWrittenOverage / 1_000_000) * D1_OVERAGE_ROWS_WRITTEN_PER_M}
                exchangeRate={exchangeRate}
              />
            )}
            {d1Enabled && calc.d1StorageOverage > 0 && (
              <CostRow
                label={`D1 storage超過 ${calc.d1StorageOverage.toFixed(1)} GB × $${D1_OVERAGE_STORAGE_PER_GB}/GB`}
                cost={calc.d1StorageOverage * D1_OVERAGE_STORAGE_PER_GB}
                exchangeRate={exchangeRate}
              />
            )}

            <CostRow label="月額合計" cost={calc.totalUSD} exchangeRate={exchangeRate} highlight />
          </div>
        )}

        {isFree && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 text-center">
            Free プランは無料です。制限を超えるとリクエストがスロットルされます。
          </div>
        )}
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金は{" "}
        <a
          href="https://developers.cloudflare.com/workers/platform/pricing/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#F6821F] transition-colors"
        >
          Cloudflare Workers 公式ドキュメント
        </a>
        {" "}をご確認ください。
      </p>
    </div>
  );
}
