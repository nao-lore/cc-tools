"use client";

import { useState, useMemo } from "react";

// --- 料金定数 ---

// リージョン別の料金乗数（us-central1 = 1.0 基準）
const REGION_MULTIPLIER: Record<string, number> = {
  "us-central1": 1.0,
  "asia-northeast1": 1.2, // tokyo
};

const REGION_LABEL: Record<string, string> = {
  "us-central1": "US (Iowa)",
  "asia-northeast1": "Asia (Tokyo)",
};

// Compute Engine 料金（us-central1、$/時間）
const CE_MACHINES: {
  name: string;
  vcpu: number;
  memGb: number;
  pricePerHour: number;
  freeTier: boolean;
}[] = [
  { name: "e2-micro", vcpu: 0.25, memGb: 1, pricePerHour: 0.0, freeTier: true },
  { name: "e2-small", vcpu: 0.5, memGb: 2, pricePerHour: 0.0134, freeTier: false },
  { name: "e2-medium", vcpu: 1, memGb: 4, pricePerHour: 0.034, freeTier: false },
  { name: "e2-standard-2", vcpu: 2, memGb: 8, pricePerHour: 0.0672, freeTier: false },
  { name: "e2-standard-4", vcpu: 4, memGb: 16, pricePerHour: 0.1344, freeTier: false },
  { name: "e2-standard-8", vcpu: 8, memGb: 32, pricePerHour: 0.2688, freeTier: false },
  { name: "n2-standard-2", vcpu: 2, memGb: 8, pricePerHour: 0.0971, freeTier: false },
  { name: "n2-standard-4", vcpu: 4, memGb: 16, pricePerHour: 0.1942, freeTier: false },
];

// 確約利用割引
const CUD: Record<string, number> = {
  none: 0,
  "1year": 0.37,
  "3year": 0.55,
};

const CUD_LABEL: Record<string, string> = {
  none: "なし",
  "1year": "1年確約 (-37%)",
  "3year": "3年確約 (-55%)",
};

// Cloud Run 料金（us-central1 基準）
const CLOUD_RUN = {
  freeRequests: 2_000_000,        // 2M req/月 無料
  requestPer1M: 0.40,             // $0.40 / 1M requests
  cpuPerVcpuSec: 0.00002400,      // $0.00002400 / vCPU-second
  memPerGbSec: 0.00000250,        // $0.00000250 / GB-second
  freeCpuVcpuSec: 180_000,        // 180,000 vCPU-seconds/月 無料
  freeMemGbSec: 360_000,          // 360,000 GB-seconds/月 無料
};

// Cloud Storage 料金（us-central1 基準、$/GB/月）
const GCS_STORAGE_PRICE: Record<string, number> = {
  standard: 0.020,
  nearline: 0.010,
  coldline: 0.004,
  archive: 0.0012,
};

const GCS_CLASS_LABEL: Record<string, string> = {
  standard: "Standard",
  nearline: "Nearline",
  coldline: "Coldline",
  archive: "Archive",
};

// GCS オペレーション料金（/10,000 ops）
const GCS_OPS_PRICE: Record<string, { classA: number; classB: number }> = {
  standard: { classA: 0.05, classB: 0.004 },
  nearline: { classA: 0.10, classB: 0.01 },
  coldline: { classA: 0.10, classB: 0.05 },
  archive: { classA: 0.50, classB: 0.50 },
};

// GCS ネットワーク出力料金（$/ GB）
const GCS_EGRESS_PRICE = 0.12; // internet egress

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

// --- バッジ ---
function UsageBadge({ used, included, unit }: { used: number; included: number; unit: string }) {
  const over = used > included;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        over ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {over
        ? `+${fmtNum(used - included)} ${unit} 超過`
        : `枠内 (${fmtNum(included)} ${unit}まで)`}
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
    <div className={`rounded-2xl border transition-all ${enabled ? "border-blue-200 bg-white shadow-sm" : "border-gray-100 bg-gray-50"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              enabled ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
            }`}
          >
            {enabled && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={`font-semibold text-base ${enabled ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
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
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {badge}
      </div>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(value, max)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function GcpPricing() {
  const [region, setRegion] = useState<"us-central1" | "asia-northeast1">("us-central1");
  const [exchangeRate, setExchangeRate] = useState(150);

  // Compute Engine
  const [ceEnabled, setCeEnabled] = useState(true);
  const [ceMachineIdx, setCeMachineIdx] = useState(2); // e2-medium
  const [ceCount, setCeCount] = useState(1);
  const [ceHoursPerMonth, setCeHoursPerMonth] = useState(730); // 24h × ~30.4d
  const [ceCud, setCeCud] = useState<"none" | "1year" | "3year">("none");

  // Cloud Run
  const [crEnabled, setCrEnabled] = useState(false);
  const [crRequests, setCrRequests] = useState(10_000_000); // 10M/月
  const [crVcpu, setCrVcpu] = useState(1);
  const [crMemGb, setCrMemGb] = useState(0.5);
  const [crAvgMs, setCrAvgMs] = useState(200); // avg response time

  // Cloud Storage
  const [gcsEnabled, setGcsEnabled] = useState(false);
  const [gcsStorageGb, setGcsStorageGb] = useState(100);
  const [gcsClass, setGcsClass] = useState<"standard" | "nearline" | "coldline" | "archive">("standard");
  const [gcsClassAOps, setGcsClassAOps] = useState(100_000); // write/list ops / month
  const [gcsClassBOps, setGcsClassBOps] = useState(1_000_000); // read ops / month
  const [gcsEgressGb, setGcsEgressGb] = useState(10); // internet egress GB / month

  const regionMul = REGION_MULTIPLIER[region];

  const result = useMemo(() => {
    const breakdown: { label: string; cost: number; note: string }[] = [];

    // Compute Engine
    let ceCost = 0;
    if (ceEnabled) {
      const machine = CE_MACHINES[ceMachineIdx];
      if (machine.freeTier && ceCount === 1 && ceHoursPerMonth <= 730) {
        // e2-micro: 1台まで無料（us-central1のみ）
        const freeTierApplies = region === "us-central1";
        if (!freeTierApplies) {
          const basePrice = machine.pricePerHour === 0 ? 0.0076 : machine.pricePerHour; // e2-micro non-free price
          ceCost = basePrice * regionMul * ceHoursPerMonth * ceCount;
          breakdown.push({ label: "Compute Engine", cost: ceCost, note: `${machine.name} × ${ceCount}台（無料枠対象外リージョン）` });
        } else {
          ceCost = 0;
          breakdown.push({ label: "Compute Engine（無料枠）", cost: 0, note: `${machine.name} × 1台 / us-central1 無料` });
        }
      } else {
        const baseHourly = machine.freeTier ? 0.0076 : machine.pricePerHour; // e2-micro paid price
        const discounted = baseHourly * (1 - CUD[ceCud]);
        ceCost = discounted * regionMul * ceHoursPerMonth * ceCount;
        breakdown.push({
          label: "Compute Engine",
          cost: ceCost,
          note: `${machine.name} × ${ceCount}台 × ${ceHoursPerMonth}h${ceCud !== "none" ? ` (${CUD_LABEL[ceCud]})` : ""}`,
        });
      }
    }

    // Cloud Run
    let crCost = 0;
    if (crEnabled) {
      const reqCost =
        crRequests > CLOUD_RUN.freeRequests
          ? ((crRequests - CLOUD_RUN.freeRequests) / 1_000_000) * CLOUD_RUN.requestPer1M * regionMul
          : 0;

      // vCPU-seconds: requests × avg_seconds × vcpu
      const vcpuSec = crRequests * (crAvgMs / 1000) * crVcpu;
      const cpuCost =
        vcpuSec > CLOUD_RUN.freeCpuVcpuSec
          ? (vcpuSec - CLOUD_RUN.freeCpuVcpuSec) * CLOUD_RUN.cpuPerVcpuSec * regionMul
          : 0;

      // GB-seconds: requests × avg_seconds × memory_gb
      const gbSec = crRequests * (crAvgMs / 1000) * crMemGb;
      const memCost =
        gbSec > CLOUD_RUN.freeMemGbSec
          ? (gbSec - CLOUD_RUN.freeMemGbSec) * CLOUD_RUN.memPerGbSec * regionMul
          : 0;

      crCost = reqCost + cpuCost + memCost;

      if (reqCost > 0) breakdown.push({ label: "Cloud Run リクエスト", cost: reqCost, note: `${fmtNum(crRequests - CLOUD_RUN.freeRequests)}req超過` });
      else if (crRequests > 0) breakdown.push({ label: "Cloud Run リクエスト（無料枠内）", cost: 0, note: `${fmtNum(crRequests)}req / 2M枠内` });
      if (cpuCost > 0) breakdown.push({ label: "Cloud Run CPU", cost: cpuCost, note: `${fmtNum(Math.round(vcpuSec))} vCPU-sec` });
      if (memCost > 0) breakdown.push({ label: "Cloud Run メモリ", cost: memCost, note: `${fmtNum(Math.round(gbSec))} GB-sec` });
      if (crCost === 0 && crRequests > 0) breakdown.push({ label: "Cloud Run（無料枠内）", cost: 0, note: "すべて無料枠内" });
    }

    // Cloud Storage
    let gcsCost = 0;
    if (gcsEnabled) {
      const storagePrice = GCS_STORAGE_PRICE[gcsClass] * regionMul;
      const storageCost = gcsStorageGb * storagePrice;

      const classAPricePer10K = GCS_OPS_PRICE[gcsClass].classA * regionMul;
      const classBPricePer10K = GCS_OPS_PRICE[gcsClass].classB * regionMul;
      const classACost = (gcsClassAOps / 10_000) * classAPricePer10K;
      const classBCost = (gcsClassBOps / 10_000) * classBPricePer10K;
      const egressCost = gcsEgressGb * GCS_EGRESS_PRICE;

      gcsCost = storageCost + classACost + classBCost + egressCost;

      if (storageCost > 0) breakdown.push({ label: `GCS Storage (${GCS_CLASS_LABEL[gcsClass]})`, cost: storageCost, note: `${gcsStorageGb}GB` });
      if (classACost > 0) breakdown.push({ label: "GCS Class A オペレーション", cost: classACost, note: `${fmtNum(gcsClassAOps)}回` });
      if (classBCost > 0) breakdown.push({ label: "GCS Class B オペレーション", cost: classBCost, note: `${fmtNum(gcsClassBOps)}回` });
      if (egressCost > 0) breakdown.push({ label: "GCS ネットワーク出力", cost: egressCost, note: `${gcsEgressGb}GB` });
    }

    const total = ceCost + crCost + gcsCost;
    return { ce: ceCost, cr: crCost, gcs: gcsCost, total, breakdown };
  }, [
    region,
    ceEnabled, ceMachineIdx, ceCount, ceHoursPerMonth, ceCud,
    crEnabled, crRequests, crVcpu, crMemGb, crAvgMs,
    gcsEnabled, gcsStorageGb, gcsClass, gcsClassAOps, gcsClassBOps, gcsEgressGb,
  ]);

  const selectedMachine = CE_MACHINES[ceMachineIdx];

  return (
    <div className="space-y-5">
      {/* ===== グローバル設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">設定</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* リージョン */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">リージョン</label>
            <div className="flex flex-col gap-2">
              {(["us-central1", "asia-northeast1"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-4 py-2.5 rounded-xl border text-sm text-left transition-all ${
                    region === r
                      ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400 font-medium text-blue-900"
                      : "border-gray-200 text-gray-600 hover:border-blue-200"
                  }`}
                >
                  <span className="font-medium">{r}</span>
                  <span className="ml-2 text-gray-400 text-xs">— {REGION_LABEL[r]}</span>
                  {r === "asia-northeast1" && (
                    <span className="ml-2 text-xs text-orange-500">+20%</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* 為替レート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">為替レート</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">1 USD =</span>
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
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">月額合計の円換算に使用</p>
          </div>
        </div>
      </div>

      {/* ===== サービス別 ===== */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 px-1">サービス別使用量</h2>

        {/* Compute Engine */}
        <ServiceSection
          enabled={ceEnabled}
          onToggle={() => setCeEnabled((v) => !v)}
          label="Compute Engine (VM)"
          badge={
            ceEnabled && result.ce > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.ce)}/月</span>
            ) : ceEnabled ? (
              <span className="text-xs font-medium text-green-600">
                {selectedMachine.freeTier && region === "us-central1" && ceCount === 1 ? "無料枠" : "有効"}
              </span>
            ) : undefined
          }
        >
          {/* マシンタイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">マシンタイプ</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CE_MACHINES.map((m, i) => (
                <button
                  key={m.name}
                  onClick={() => setCeMachineIdx(i)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    ceMachineIdx === i
                      ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-800">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.vcpu}vCPU / {m.memGb}GB</div>
                  {m.freeTier ? (
                    <div className="text-xs text-green-600 font-medium mt-0.5">無料枠対象</div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-0.5">${m.pricePerHour.toFixed(4)}/h</div>
                  )}
                </button>
              ))}
            </div>
            {selectedMachine.freeTier && (
              <p className="text-xs text-green-600 mt-2">
                e2-micro は us-central1 で月730時間まで1台無料（非永続ディスク30GBも無料）
              </p>
            )}
          </div>

          <SliderField
            label="台数"
            value={ceCount}
            onChange={setCeCount}
            min={1}
            max={20}
            step={1}
            unit="台"
          />
          <SliderField
            label="稼働時間 / 月"
            value={ceHoursPerMonth}
            onChange={setCeHoursPerMonth}
            min={1}
            max={730}
            step={1}
            unit="時間"
            hint="24時間 × 30.4日 ≈ 730時間（常時稼働）"
          />

          {/* 確約利用割引 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">確約利用割引 (CUD)</label>
            <div className="flex flex-wrap gap-2">
              {(["none", "1year", "3year"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCeCud(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    ceCud === c
                      ? "bg-blue-500 border-blue-500 text-white font-medium"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {CUD_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
        </ServiceSection>

        {/* Cloud Run */}
        <ServiceSection
          enabled={crEnabled}
          onToggle={() => setCrEnabled((v) => !v)}
          label="Cloud Run"
          badge={
            crEnabled && result.cr > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.cr)}/月</span>
            ) : crEnabled ? (
              <span className="text-xs font-medium text-green-600">無料枠内</span>
            ) : undefined
          }
        >
          <SliderField
            label="リクエスト数 / 月"
            value={crRequests}
            onChange={setCrRequests}
            min={0}
            max={100_000_000}
            step={500_000}
            unit="req"
            hint="2,000,000 req/月まで無料"
            badge={<UsageBadge used={crRequests} included={CLOUD_RUN.freeRequests} unit="req" />}
          />
          {/* vCPU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">割り当て vCPU</label>
            <div className="flex flex-wrap gap-2">
              {[0.08333, 0.1667, 0.25, 0.5, 1, 2, 4, 8].map((v) => (
                <button
                  key={v}
                  onClick={() => setCrVcpu(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    crVcpu === v
                      ? "bg-blue-500 border-blue-500 text-white font-medium"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {v < 1 ? `${Math.round(v * 1000) / 1000}` : v} vCPU
                </button>
              ))}
            </div>
          </div>
          {/* メモリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">メモリ</label>
            <div className="flex flex-wrap gap-2">
              {[0.125, 0.25, 0.5, 1, 2, 4, 8].map((gb) => (
                <button
                  key={gb}
                  onClick={() => setCrMemGb(gb)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                    crMemGb === gb
                      ? "bg-blue-500 border-blue-500 text-white font-medium"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {gb < 1 ? `${gb * 1024}MB` : `${gb}GB`}
                </button>
              ))}
            </div>
          </div>
          <SliderField
            label="平均レスポンスタイム"
            value={crAvgMs}
            onChange={setCrAvgMs}
            min={10}
            max={10_000}
            step={10}
            unit="ms"
            hint="CPU・メモリ料金の計算に使用"
          />
          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-100 space-y-0.5">
            <div>無料枠: リクエスト 2M/月 · CPU 180,000 vCPU-sec/月 · メモリ 360,000 GB-sec/月</div>
            <div>超過料金: $0.40/100万req · $0.00002400/vCPU-sec · $0.0000025/GB-sec</div>
          </div>
        </ServiceSection>

        {/* Cloud Storage */}
        <ServiceSection
          enabled={gcsEnabled}
          onToggle={() => setGcsEnabled((v) => !v)}
          label="Cloud Storage (GCS)"
          badge={
            gcsEnabled && result.gcs > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.gcs)}/月</span>
            ) : gcsEnabled ? (
              <span className="text-xs font-medium text-blue-600">有効</span>
            ) : undefined
          }
        >
          {/* ストレージクラス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ストレージクラス</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["standard", "nearline", "coldline", "archive"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setGcsClass(c)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    gcsClass === c
                      ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-800">{GCS_CLASS_LABEL[c]}</div>
                  <div className="text-xs text-gray-500">${GCS_STORAGE_PRICE[c].toFixed(4)}/GB/月</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {c === "standard" && "頻繁アクセス"}
                    {c === "nearline" && "月1回未満"}
                    {c === "coldline" && "四半期1回未満"}
                    {c === "archive" && "年1回未満"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <SliderField
            label="保存容量"
            value={gcsStorageGb}
            onChange={setGcsStorageGb}
            min={0}
            max={10_000}
            step={10}
            unit="GB"
            hint={`${GCS_CLASS_LABEL[gcsClass]}: $${GCS_STORAGE_PRICE[gcsClass].toFixed(4)}/GB/月${region === "asia-northeast1" ? "（Tokyo +20%）" : ""}`}
          />
          <SliderField
            label="Class A オペレーション / 月"
            value={gcsClassAOps}
            onChange={setGcsClassAOps}
            min={0}
            max={10_000_000}
            step={10_000}
            unit="回"
            hint="書き込み・リスト操作など"
          />
          <SliderField
            label="Class B オペレーション / 月"
            value={gcsClassBOps}
            onChange={setGcsClassBOps}
            min={0}
            max={100_000_000}
            step={100_000}
            unit="回"
            hint="読み取り操作など"
          />
          <SliderField
            label="ネットワーク出力（インターネット）/ 月"
            value={gcsEgressGb}
            onChange={setGcsEgressGb}
            min={0}
            max={1_000}
            step={1}
            unit="GB"
            hint="$0.12/GB（GCP内転送は別途）"
          />
        </ServiceSection>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border bg-blue-50 border-blue-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">月額試算結果</h2>
          <span className="text-xs font-medium px-3 py-1 rounded-full border bg-blue-100 text-blue-700 border-blue-300">
            {REGION_LABEL[region]}
          </span>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">月額合計（税別・USD）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">
              {fmtUSD(result.total)}
            </span>
            <span className="text-xl text-gray-600">{fmtJPY(result.total * exchangeRate)}</span>
          </div>
        </div>

        {/* 内訳 */}
        <div className="bg-white bg-opacity-70 rounded-xl p-4 space-y-2 text-sm mb-4">
          <div className="font-medium text-gray-700 mb-2">料金内訳</div>

          {result.breakdown.length === 0 ? (
            <div className="text-green-600 text-xs py-1">サービスを有効にして試算してください</div>
          ) : (
            result.breakdown.map((item, i) => (
              <div key={i} className={`flex justify-between ${item.cost > 0 ? "text-red-600" : "text-green-600"}`}>
                <span>{item.label}{item.note ? ` (${item.note})` : ""}</span>
                <span className="font-medium">{item.cost > 0 ? fmtUSD(item.cost) : "無料"}</span>
              </div>
            ))
          )}

          {result.total > 0 && (
            <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between font-semibold text-gray-900">
              <span>月額合計</span>
              <span>{fmtUSD(result.total)}</span>
            </div>
          )}
        </div>

        {/* サービス別割合バー */}
        {result.total > 0 && (
          <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-4">
            <div className="font-medium text-gray-700 mb-3 text-sm">サービス別割合</div>
            <div className="space-y-2">
              {[
                { label: "Compute Engine", cost: result.ce, color: "bg-blue-400" },
                { label: "Cloud Run", cost: result.cr, color: "bg-cyan-400" },
                { label: "Cloud Storage", cost: result.gcs, color: "bg-sky-400" },
              ]
                .filter((s) => s.cost > 0)
                .map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-gray-600 text-xs shrink-0">{s.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${s.color}`}
                        style={{ width: `${Math.min((s.cost / result.total) * 100, 100).toFixed(1)}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-medium text-gray-700 text-xs">{fmtUSD(s.cost)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 為替換算 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 whitespace-nowrap">1 USD =</span>
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
            className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-sm text-gray-500">円</span>
          <span className="text-sm text-gray-700 font-medium ml-auto">
            ≈ {fmtJPY(result.total * exchangeRate)}/月
          </span>
        </div>
      </div>

      {/* ===== 料金参考表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">料金参考表（us-central1 基準）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">サービス</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">無料枠</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">超過単価</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "CE e2-micro", free: "1台 / 730h/月 (us-central1)", unit: "$0.0076/h" },
                { label: "CE e2-medium", free: "なし", unit: "$0.034/h" },
                { label: "CE 確約1年", free: "—", unit: "-37%割引" },
                { label: "CE 確約3年", free: "—", unit: "-55%割引" },
                { label: "Cloud Run リクエスト", free: "2,000,000 req/月", unit: "$0.40/100万req" },
                { label: "Cloud Run CPU", free: "180,000 vCPU-sec/月", unit: "$0.00002400/vCPU-sec" },
                { label: "Cloud Run メモリ", free: "360,000 GB-sec/月", unit: "$0.0000025/GB-sec" },
                { label: "GCS Standard", free: "—", unit: "$0.020/GB/月" },
                { label: "GCS Nearline", free: "—", unit: "$0.010/GB/月" },
                { label: "GCS ネットワーク出力", free: "—", unit: "$0.12/GB" },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium text-gray-700 text-xs">{row.label}</td>
                  <td className="py-2 pr-4 text-right text-gray-500 text-xs">{row.free}</td>
                  <td className="py-2 text-right text-gray-500 text-xs">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新情報は{" "}
        <a
          href="https://cloud.google.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          cloud.google.com/pricing
        </a>{" "}
        でご確認ください。asia-northeast1（Tokyo）は us-central1 比約1.2倍。確約利用割引はE2/N2シリーズに適用。Cloud Run の CPU・メモリ料金は概算です。
      </p>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このGoogle Cloud 料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Google Cloudの主要サービス料金をリソース量から日本円で試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このGoogle Cloud 料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Google Cloudの主要サービス料金をリソース量から日本円で試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Google Cloud 料金試算",
  "description": "Google Cloudの主要サービス料金をリソース量から日本円で試算",
  "url": "https://tools.loresync.dev/gcp-pricing",
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
