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
function UsageBadge({ used, included, unit }: { used: number; included: number; unit: string }) {
  const over = used > included;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        over ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
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
    <div className={`rounded-2xl border transition-all ${enabled ? "border-amber-200 bg-white shadow-sm" : "border-gray-100 bg-gray-50"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              enabled ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white"
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
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
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
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function FirebasePricing() {
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
      if (readCost > 0) breakdown.push({ label: "Firestore 読取超過", cost: readCost, note: `${fmtNum(readsMonth - freeReads)}回` });
      if (writeCost > 0) breakdown.push({ label: "Firestore 書込超過", cost: writeCost, note: `${fmtNum(writesMonth - freeWrites)}回` });
      if (deleteCost > 0) breakdown.push({ label: "Firestore 削除超過", cost: deleteCost, note: `${fmtNum(deletesMonth - freeDeletes)}回` });
      if (storageCost > 0) breakdown.push({ label: "Firestore Storage超過", cost: storageCost, note: `${(fsStorageGb - SPARK.firestore.storageGb).toFixed(1)}GB` });
    }

    // Storage
    let stCost = 0;
    if (stEnabled) {
      const storageCost = overageCost(stStorageGb, SPARK.storage.storageGb, BLAZE.storage.storagePerGb, 1);
      const downloadCost = overageCost(stDownloadGb, SPARK.storage.downloadGbPerDay * 30, BLAZE.storage.downloadPerGb, 1);
      stCost = storageCost + downloadCost;
      if (storageCost > 0) breakdown.push({ label: "Storage 保存超過", cost: storageCost, note: `${(stStorageGb - SPARK.storage.storageGb).toFixed(1)}GB` });
      if (downloadCost > 0) breakdown.push({ label: "Storage ダウンロード超過", cost: downloadCost, note: `${(stDownloadGb - SPARK.storage.downloadGbPerDay * 30).toFixed(1)}GB` });
    }

    // Functions（Blazeのみ）
    let fnCost = 0;
    if (fnEnabled) {
      const invocCost = overageCost(fnInvocations, BLAZE.functions.freeInvocations, BLAZE.functions.invocationPer1M, 1_000_000);
      // CPU: assume 200MHz = 0.2 GHz → cpuMs = fnInvocations * fnAvgMs * 0.2GHz / 1GHz
      const cpuMs = fnInvocations * fnAvgMs * 0.2;
      const freeCpuMs = BLAZE.functions.freeCpuGhzSeconds * 1000; // convert to ms at 1GHz
      const cpuCost = Math.max(0, cpuMs - freeCpuMs) * BLAZE.functions.cpuPerMs;
      // Memory
      const memMbMs = fnInvocations * fnAvgMs * fnMemoryMb;
      const freeMemMbMs = BLAZE.functions.freeMemoryGbSeconds * 1024 * 1000; // GB-s → MB-ms
      const memCost = Math.max(0, memMbMs - freeMemMbMs) * BLAZE.functions.memoryPerMbMs;
      fnCost = invocCost + cpuCost + memCost;
      if (invocCost > 0) breakdown.push({ label: "Functions 実行回数超過", cost: invocCost, note: `${fmtNum(fnInvocations - BLAZE.functions.freeInvocations)}回` });
      if (cpuCost > 0) breakdown.push({ label: "Functions CPU", cost: cpuCost, note: `${(cpuMs / 1000).toFixed(0)}K CPU-ms` });
      if (memCost > 0) breakdown.push({ label: "Functions メモリ", cost: memCost, note: `${fnMemoryMb}MB × ${fmtNum(fnInvocations)}回` });
      if (fnCost === 0 && fnInvocations > 0) breakdown.push({ label: "Functions（無料枠内）", cost: 0, note: `${fmtNum(fnInvocations)}回 / 2M枠内` });
    }

    // Auth
    let authCost = 0;
    if (authEnabled) {
      const phoneCost = overageCost(authPhoneMAU, BLAZE.auth.phoneFreeMAU, BLAZE.auth.phonePerMAU, 1);
      const samlCost = authSamlMAU > 0 ? authSamlMAU * BLAZE.auth.samlOidcPerMAU : 0;
      authCost = phoneCost + samlCost;
      if (phoneCost > 0) breakdown.push({ label: "Auth 電話認証超過", cost: phoneCost, note: `${fmtNum(authPhoneMAU - BLAZE.auth.phoneFreeMAU)}MAU` });
      if (samlCost > 0) breakdown.push({ label: "Auth SAML/OIDC", cost: samlCost, note: `${fmtNum(authSamlMAU)}MAU` });
    }

    // Hosting
    let hostCost = 0;
    if (hostEnabled) {
      const storageCost = overageCost(hostStorageGb, SPARK.hosting.storageGb, BLAZE.hosting.storagePerGb, 1);
      const transferGbFree = (SPARK.hosting.transferMbPerDay * 30) / 1024;
      const transferCost = overageCost(hostTransferGb, transferGbFree, BLAZE.hosting.transferPerGb, 1);
      hostCost = storageCost + transferCost;
      if (storageCost > 0) breakdown.push({ label: "Hosting Storage超過", cost: storageCost, note: `${(hostStorageGb - SPARK.hosting.storageGb).toFixed(1)}GB` });
      if (transferCost > 0) breakdown.push({ label: "Hosting 転送超過", cost: transferCost, note: `${(hostTransferGb - transferGbFree).toFixed(1)}GB` });
    }

    const total = fsCost + stCost + fnCost + authCost + hostCost;
    return { firestore: fsCost, storage: stCost, functions: fnCost, auth: authCost, hosting: hostCost, total, breakdown };
  }, [
    plan, fsEnabled, fsReadsPerDay, fsWritesPerDay, fsDeletesPerDay, fsStorageGb,
    stEnabled, stStorageGb, stDownloadGb,
    fnEnabled, fnInvocations, fnAvgMs, fnMemoryMb,
    authEnabled, authPhoneMAU, authSamlMAU,
    hostEnabled, hostStorageGb, hostTransferGb,
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
      {/* ===== プラン選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">プランを選択</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["spark", "blaze"] as const).map((p) => {
            const selected = plan === p;
            const isSpark = p === "spark";
            const colors = isSpark
              ? selected
                ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400"
                : "border-gray-200 hover:border-amber-200"
              : selected
              ? "bg-orange-50 border-orange-400 ring-2 ring-orange-400"
              : "border-gray-200 hover:border-orange-200";

            return (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`p-5 rounded-xl border text-left transition-all ${colors}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{isSpark ? "⚡" : "🔥"}</span>
                  <span className="font-bold text-gray-900 text-lg">{isSpark ? "Spark" : "Blaze"}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {isSpark ? "無料" : "従量課金"}
                </div>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {isSpark ? (
                    <>
                      <li>Firestore: 読取50K/日, 書込20K/日</li>
                      <li>Storage: 5GB, DL 1GB/日</li>
                      <li>Functions: 利用不可</li>
                      <li>Auth: メール/Google 無制限</li>
                    </>
                  ) : (
                    <>
                      <li>Firestore: $0.06/10万読取〜</li>
                      <li>Storage: $0.026/GB〜</li>
                      <li>Functions: 200万回/月無料〜</li>
                      <li>クレジットカード登録必須</li>
                    </>
                  )}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== サービス別使用量 ===== */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 px-1">サービス別使用量</h2>

        {/* Firestore */}
        <ServiceSection
          enabled={fsEnabled}
          onToggle={() => setFsEnabled((v) => !v)}
          label="Cloud Firestore"
          badge={
            fsEnabled && plan === "blaze" && result.firestore > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.firestore)}/月</span>
            ) : fsEnabled ? (
              <span className="text-xs font-medium text-amber-600">有効</span>
            ) : undefined
          }
        >
          <SliderField
            label="読取 / 日"
            value={fsReadsPerDay}
            onChange={setFsReadsPerDay}
            min={0}
            max={1_000_000}
            step={10_000}
            unit="回"
            badge={<UsageBadge used={fsReadsPerDay} included={SPARK.firestore.readsPerDay} unit="回/日" />}
          />
          <SliderField
            label="書込 / 日"
            value={fsWritesPerDay}
            onChange={setFsWritesPerDay}
            min={0}
            max={500_000}
            step={5_000}
            unit="回"
            badge={<UsageBadge used={fsWritesPerDay} included={SPARK.firestore.writesPerDay} unit="回/日" />}
          />
          <SliderField
            label="削除 / 日"
            value={fsDeletesPerDay}
            onChange={setFsDeletesPerDay}
            min={0}
            max={200_000}
            step={1_000}
            unit="回"
            badge={<UsageBadge used={fsDeletesPerDay} included={SPARK.firestore.deletesPerDay} unit="回/日" />}
          />
          <SliderField
            label="ストレージ容量"
            value={fsStorageGb}
            onChange={setFsStorageGb}
            min={0}
            max={100}
            step={0.5}
            unit="GB"
            hint="Blaze: $0.18/GB/月"
            badge={<UsageBadge used={fsStorageGb} included={SPARK.firestore.storageGb} unit="GB" />}
          />
        </ServiceSection>

        {/* Storage */}
        <ServiceSection
          enabled={stEnabled}
          onToggle={() => setStEnabled((v) => !v)}
          label="Cloud Storage"
          badge={
            stEnabled && plan === "blaze" && result.storage > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.storage)}/月</span>
            ) : stEnabled ? (
              <span className="text-xs font-medium text-amber-600">有効</span>
            ) : undefined
          }
        >
          <SliderField
            label="保存容量"
            value={stStorageGb}
            onChange={setStStorageGb}
            min={0}
            max={500}
            step={1}
            unit="GB"
            hint="Blaze: $0.026/GB/月"
            badge={<UsageBadge used={stStorageGb} included={SPARK.storage.storageGb} unit="GB" />}
          />
          <SliderField
            label="ダウンロード / 月"
            value={stDownloadGb}
            onChange={setStDownloadGb}
            min={0}
            max={1000}
            step={1}
            unit="GB"
            hint={`Blaze: $0.12/GB。Spark無料枠 = 1GB/日 × 30日 = 30GB/月`}
            badge={<UsageBadge used={stDownloadGb} included={SPARK.storage.downloadGbPerDay * 30} unit="GB/月" />}
          />
        </ServiceSection>

        {/* Functions */}
        <ServiceSection
          enabled={fnEnabled}
          onToggle={() => setFnEnabled((v) => !v)}
          label="Cloud Functions（Blazeのみ）"
          badge={
            fnEnabled && result.functions > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.functions)}/月</span>
            ) : fnEnabled ? (
              <span className="text-xs font-medium text-green-600">無料枠内</span>
            ) : undefined
          }
        >
          {plan === "spark" && (
            <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700 border border-amber-200">
              Cloud Functions は Blaze プランのみ利用できます。プランを Blaze に変更してください。
            </div>
          )}
          {plan === "blaze" && (
            <>
              <SliderField
                label="実行回数 / 月"
                value={fnInvocations}
                onChange={setFnInvocations}
                min={0}
                max={50_000_000}
                step={100_000}
                unit="回"
                hint="2,000,000回/月まで無料"
                badge={<UsageBadge used={fnInvocations} included={BLAZE.functions.freeInvocations} unit="回" />}
              />
              <SliderField
                label="平均実行時間"
                value={fnAvgMs}
                onChange={setFnAvgMs}
                min={10}
                max={10_000}
                step={10}
                unit="ms"
                hint="CPU・メモリ料金の計算に使用"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メモリ割り当て</label>
                <div className="flex flex-wrap gap-2">
                  {[128, 256, 512, 1024, 2048, 4096].map((mb) => (
                    <button
                      key={mb}
                      onClick={() => setFnMemoryMb(mb)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        fnMemoryMb === mb
                          ? "bg-orange-500 border-orange-500 text-white font-medium"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
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
          label="Authentication（有料機能）"
          badge={
            authEnabled && result.auth > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.auth)}/月</span>
            ) : authEnabled ? (
              <span className="text-xs font-medium text-green-600">無料枠内</span>
            ) : undefined
          }
        >
          <p className="text-xs text-gray-500">メール/Google/GitHub 等の認証は全プランで無制限無料。以下は有料機能のみ。</p>
          <SliderField
            label="電話（SMS）認証 MAU"
            value={authPhoneMAU}
            onChange={setAuthPhoneMAU}
            min={0}
            max={500_000}
            step={1_000}
            unit="人"
            hint="50,000 MAU/月まで無料。超過: $0.06/件"
            badge={<UsageBadge used={authPhoneMAU} included={BLAZE.auth.phoneFreeMAU} unit="MAU" />}
          />
          <SliderField
            label="SAML/OIDC MAU"
            value={authSamlMAU}
            onChange={setAuthSamlMAU}
            min={0}
            max={100_000}
            step={100}
            unit="人"
            hint="$0.015/MAU（無料枠なし）"
          />
        </ServiceSection>

        {/* Hosting */}
        <ServiceSection
          enabled={hostEnabled}
          onToggle={() => setHostEnabled((v) => !v)}
          label="Firebase Hosting"
          badge={
            hostEnabled && plan === "blaze" && result.hosting > 0 ? (
              <span className="text-xs font-semibold text-red-600">{fmtUSD(result.hosting)}/月</span>
            ) : hostEnabled ? (
              <span className="text-xs font-medium text-amber-600">有効</span>
            ) : undefined
          }
        >
          <SliderField
            label="ホスティング容量"
            value={hostStorageGb}
            onChange={setHostStorageGb}
            min={0}
            max={100}
            step={0.5}
            unit="GB"
            hint="Spark: 10GBまで無料"
            badge={<UsageBadge used={hostStorageGb} included={SPARK.hosting.storageGb} unit="GB" />}
          />
          <SliderField
            label="転送量 / 月"
            value={hostTransferGb}
            onChange={setHostTransferGb}
            min={0}
            max={500}
            step={1}
            unit="GB"
            hint={`Spark: ${((SPARK.hosting.transferMbPerDay * 30) / 1024).toFixed(1)}GB/月まで無料`}
            badge={<UsageBadge used={hostTransferGb} included={(SPARK.hosting.transferMbPerDay * 30) / 1024} unit="GB/月" />}
          />
        </ServiceSection>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className={`rounded-2xl shadow-sm border p-6 ${plan === "spark" ? "bg-amber-50 border-amber-200" : "bg-orange-50 border-orange-200"}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">月額試算結果</h2>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
            plan === "spark" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-orange-100 text-orange-700 border-orange-300"
          }`}>
            {plan === "spark" ? "⚡ Spark" : "🔥 Blaze"} プラン
          </span>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">月額合計（税別・USD）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">
              {plan === "spark" ? "無料" : fmtUSD(result.total)}
            </span>
            {plan === "blaze" && (
              <span className="text-xl text-gray-600">{fmtJPY(result.total * exchangeRate)}</span>
            )}
          </div>
          {plan === "spark" && (
            <p className="text-xs text-amber-700 mt-1">Spark プランは常に $0（無料枠を超えると利用がブロックされます）</p>
          )}
        </div>

        {/* 内訳 */}
        {plan === "blaze" && (
          <div className="bg-white bg-opacity-70 rounded-xl p-4 space-y-2 text-sm mb-4">
            <div className="font-medium text-gray-700 mb-2">料金内訳</div>

            {result.breakdown.length === 0 ? (
              <div className="text-green-600 text-xs py-1">すべて無料枠内に収まっています 🎉</div>
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
        )}

        {/* サービス別内訳バー */}
        {plan === "blaze" && result.total > 0 && (
          <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-4">
            <div className="font-medium text-gray-700 mb-3 text-sm">サービス別割合</div>
            <div className="space-y-2">
              {[
                { label: "Firestore", cost: result.firestore, color: "bg-blue-400" },
                { label: "Storage", cost: result.storage, color: "bg-green-400" },
                { label: "Functions", cost: result.functions, color: "bg-purple-400" },
                { label: "Auth", cost: result.auth, color: "bg-yellow-400" },
                { label: "Hosting", cost: result.hosting, color: "bg-pink-400" },
              ]
                .filter((s) => s.cost > 0)
                .map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    <span className="w-20 text-gray-600 text-xs shrink-0">{s.label}</span>
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
        {plan === "blaze" && (
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
              className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <span className="text-sm text-gray-500">円</span>
            <span className="text-sm text-gray-700 font-medium ml-auto">
              ≈ {fmtJPY(result.total * exchangeRate)}/月
            </span>
          </div>
        )}
      </div>

      {/* ===== Spark vs Blaze 損益分岐 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Spark vs Blaze 判断ガイド</h2>

        {sparkFit ? (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
            <div className="font-medium text-amber-800 mb-1">⚡ 現在の使用量は Spark プランで収まります</div>
            <p className="text-sm text-amber-700">
              すべての使用量が Spark の無料枠内に収まっています。Spark プランからスタートするのがおすすめです。
              スケールが必要になったら Blaze へ移行しましょう。
            </p>
          </div>
        ) : (
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 mb-4">
            <div className="font-medium text-orange-800 mb-1">🔥 Spark の無料枠を超えています → Blaze が必要です</div>
            <p className="text-sm text-orange-700">
              現在の使用量は Spark プランの無料枠を超えています。Blaze プランに移行してください。
              {plan === "blaze" && result.total > 0 && ` 試算月額: ${fmtUSD(result.total)}`}
            </p>
            {plan === "spark" && (
              <button
                onClick={() => setPlan("blaze")}
                className="mt-2 text-xs font-medium text-orange-800 underline"
              >
                Blaze プランに切り替えて詳細を試算する →
              </button>
            )}
          </div>
        )}

        {/* 比較テーブル */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">サービス / リソース</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">Spark 無料枠</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">Blaze 超過単価</th>
              </tr>
            </thead>
            <tbody>
              {[
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
          href="https://firebase.google.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          firebase.google.com/pricing
        </a>{" "}
        でご確認ください。Firestore は日次無料枠×30日で月換算。Functions の CPU/メモリ計算は概算です。
      </p>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "プランを選択", desc: "開発中は Spark（無料）、本番運用は Blaze（従量課金）を選びましょう。Blaze でもほとんどの小規模アプリは無料枠内に収まります。" },
            { step: "2", title: "使用するサービスをオン", desc: "Firestore・Cloud Storage など、実際に使うサービスのトグルをオンにします。使わないサービスはオフのままで構いません。" },
            { step: "3", title: "使用量を入力", desc: "スライダーまたは数値入力で、1日あたりの読み書き回数やストレージ容量を入力します。実際のアクセスログやモニタリングデータを参考にしてください。" },
            { step: "4", title: "月額コストを確認", desc: "為替レートを調整して円換算額を確認します。内訳バーでどのサービスがコストを押し上げているかを把握し、最適化に役立ててください。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center">{item.step}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問（FAQ）</h2>
        <div className="space-y-4">
          {[
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/supabase-pricing", title: "Supabase 料金計算", desc: "Firebase の代替として人気の BaaS。PostgreSQL ベースのコスト試算。" },
            { href: "/gcp-pricing", title: "GCP 料金計算", desc: "Firebase の基盤となる Google Cloud Platform 全体のコスト試算。" },
            { href: "/auth-service-comparison", title: "Auth サービス比較", desc: "Auth0・Clerk・Firebase Auth・Supabase Auth を MAU 別に比較。" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="font-medium text-gray-800 text-sm group-hover:text-orange-700">{link.title}</div>
              <div className="text-xs text-gray-500 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
