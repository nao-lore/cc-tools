"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---

type Plan = "free" | "pro" | "team" | "enterprise";
type RepoType = "public" | "private";
type RunnerOS = "linux" | "windows" | "macos";
type LargerRunnerSize = "4vcpu" | "8vcpu" | "16vcpu" | "32vcpu" | "64vcpu";

const PLANS: { id: Plan; name: string; freeMinutes: number; freeStorageGB: number }[] = [
  { id: "free",       name: "Free",       freeMinutes: 2000,  freeStorageGB: 0.5  },
  { id: "pro",        name: "Pro",        freeMinutes: 3000,  freeStorageGB: 1    },
  { id: "team",       name: "Team",       freeMinutes: 3000,  freeStorageGB: 2    },
  { id: "enterprise", name: "Enterprise", freeMinutes: 50000, freeStorageGB: 50   },
];

// ランナー分単価 (USD/分)
const RUNNER_RATES: Record<RunnerOS, number> = {
  linux:   0.008,
  windows: 0.016,
  macos:   0.08,
};

// OS名表示
const OS_LABELS: Record<RunnerOS, string> = {
  linux:   "Linux",
  windows: "Windows",
  macos:   "macOS",
};

// Larger Runners (Linux only)
const LARGER_RUNNERS: { id: LargerRunnerSize; label: string; ratePerMin: number }[] = [
  { id: "4vcpu",  label: "4 vCPU",  ratePerMin: 0.016  },
  { id: "8vcpu",  label: "8 vCPU",  ratePerMin: 0.032  },
  { id: "16vcpu", label: "16 vCPU", ratePerMin: 0.064  },
  { id: "32vcpu", label: "32 vCPU", ratePerMin: 0.128  },
  { id: "64vcpu", label: "64 vCPU", ratePerMin: 0.256  },
];

// ストレージ超過単価
const STORAGE_OVERAGE_PER_GB = 0.25;

// --- フォーマット ---
function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

// 無料枠消費状況バー
function UsageBar({
  used,
  total,
  label,
  unit,
}: {
  used: number;
  total: number;
  label: string;
  unit: string;
}) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 100;
  const over = used > total;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <span className={`text-xs font-semibold ${over ? "text-red-600" : "text-gray-700"}`}>
          {used.toLocaleString()} / {total.toLocaleString()} {unit}
          {over && <span className="ml-1 text-red-500">（超過）</span>}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-[#0366d6]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`text-right text-xs mt-0.5 ${over ? "text-red-500" : "text-gray-400"}`}>
        {pct.toFixed(1)}% 使用
      </div>
    </div>
  );
}

// 数値入力
function MinuteInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-gray-700 flex-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={999999}
          step={10}
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v) && v >= 0) onChange(v);
          }}
          className="w-28 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0366d6]"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">分/月</span>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function GithubActionsCost() {
  const [plan, setPlan] = useState<Plan>("free");
  const [repoType, setRepoType] = useState<RepoType>("private");
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  // ワークフロー分数
  const [linuxMinutes, setLinuxMinutes] = useState<number>(500);
  const [windowsMinutes, setWindowsMinutes] = useState<number>(0);
  const [macosMinutes, setMacosMinutes] = useState<number>(0);

  // Larger Runner
  const [useLargerRunner, setUseLargerRunner] = useState<boolean>(false);
  const [largerRunnerSize, setLargerRunnerSize] = useState<LargerRunnerSize>("4vcpu");
  const [largerRunnerMinutes, setLargerRunnerMinutes] = useState<number>(0);

  // ストレージ
  const [storageGB, setStorageGB] = useState<number>(1);

  const currentPlan = PLANS.find((p) => p.id === plan)!;

  const calc = useMemo(() => {
    const isPublic = repoType === "public";

    // publicリポは全て無料
    if (isPublic) {
      return {
        freeMinutes: Infinity,
        freeStorageGB: Infinity,
        usedMinutes: linuxMinutes + windowsMinutes + macosMinutes,
        overageMinutes: 0,
        overageCost: 0,
        storageCost: 0,
        largerRunnerCost: 0,
        totalUSD: 0,
        perOSCost: { linux: 0, windows: 0, macos: 0 },
        minutesUsedPct: 0,
        storageUsedPct: 0,
        linuxOverage: 0,
        windowsOverage: 0,
        macosOverage: 0,
        isPublic: true,
      };
    }

    const freeMinutes = currentPlan.freeMinutes;
    const freeStorage = currentPlan.freeStorageGB;

    // 分数の合計（Larger Runnerは別途）
    const totalStandardMinutes = linuxMinutes + windowsMinutes + macosMinutes;

    // 無料枠を按分消費（Linux→Windows→macOS順）
    let remaining = freeMinutes;

    const linuxBillable = Math.max(0, linuxMinutes - remaining);
    remaining = Math.max(0, remaining - linuxMinutes);

    const windowsBillable = Math.max(0, windowsMinutes - remaining);
    remaining = Math.max(0, remaining - windowsMinutes);

    const macosBillable = Math.max(0, macosMinutes - remaining);

    const linuxCost = linuxBillable * RUNNER_RATES.linux;
    const windowsCost = windowsBillable * RUNNER_RATES.windows;
    const macosCost = macosBillable * RUNNER_RATES.macos;
    const overageCost = linuxCost + windowsCost + macosCost;

    // ストレージ超過
    const storageOverage = Math.max(0, storageGB - freeStorage);
    const storageCost = storageOverage * STORAGE_OVERAGE_PER_GB;

    // Larger Runner (無料枠対象外)
    const largerRunner = LARGER_RUNNERS.find((r) => r.id === largerRunnerSize)!;
    const largerRunnerCost = useLargerRunner ? largerRunnerMinutes * largerRunner.ratePerMin : 0;

    const totalUSD = overageCost + storageCost + largerRunnerCost;

    const minutesUsedPct = Math.min((totalStandardMinutes / freeMinutes) * 100, 100);
    const storageUsedPct = Math.min((storageGB / freeStorage) * 100, 100);

    return {
      freeMinutes,
      freeStorageGB: freeStorage,
      usedMinutes: totalStandardMinutes,
      overageMinutes: linuxBillable + windowsBillable + macosBillable,
      overageCost,
      storageCost,
      largerRunnerCost,
      totalUSD,
      perOSCost: { linux: linuxCost, windows: windowsCost, macos: macosCost },
      minutesUsedPct,
      storageUsedPct,
      linuxOverage: linuxBillable,
      windowsOverage: windowsBillable,
      macosOverage: macosBillable,
      isPublic: false,
    };
  }, [
    plan, repoType, linuxMinutes, windowsMinutes, macosMinutes,
    useLargerRunner, largerRunnerSize, largerRunnerMinutes, storageGB, currentPlan,
  ]);

  // OS別コスト比較（同じ分数をOS別に実行した場合）
  const sameJobMinutes = linuxMinutes || 100;
  const osComparison = (["linux", "windows", "macos"] as RunnerOS[]).map((os) => ({
    os,
    cost: sameJobMinutes * RUNNER_RATES[os],
  }));

  const largerRunner = LARGER_RUNNERS.find((r) => r.id === largerRunnerSize)!;

  return (
    <div className="space-y-6">

      {/* ===== プラン選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#24292e] mb-4">プランを選択</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                plan === p.id
                  ? "bg-blue-50 border-[#0366d6] ring-2 ring-blue-200 shadow-sm"
                  : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/40"
              }`}
            >
              <div className="font-semibold text-[#24292e] text-sm mb-2">{p.name}</div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <div>
                  <span className="font-medium text-[#0366d6]">{p.freeMinutes.toLocaleString()}</span>
                  <span> 分/月</span>
                </div>
                <div>
                  <span className="font-medium text-[#0366d6]">{p.freeStorageGB}</span>
                  <span> GB</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== リポジトリ種別 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#24292e] mb-4">リポジトリ種別</h2>
        <div className="flex gap-3 flex-wrap">
          {([
            { id: "public",  label: "Public",  desc: "実行時間・ストレージ無制限無料" },
            { id: "private", label: "Private", desc: "プランの無料枠を消費" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRepoType(opt.id)}
              className={`flex flex-col px-5 py-3 rounded-xl border text-left transition-all ${
                repoType === opt.id
                  ? "bg-blue-50 border-[#0366d6] text-[#0366d6] shadow-sm"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50/30"
              }`}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs opacity-75 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
        {repoType === "public" && (
          <p className="mt-3 text-xs text-[#0366d6] bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
            Publicリポジトリは GitHub Actions の実行時間・ストレージが無制限で無料です。料金は発生しません。
          </p>
        )}
      </div>

      {/* ===== ワークフロー設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#24292e] mb-1">ワークフロー実行時間（月間）</h2>
        <p className="text-xs text-gray-500 mb-5">ランナーOS別の月間合計実行分数を入力してください。</p>
        <div className="space-y-4">
          <MinuteInput label="Linux ランナー ($0.008/分)" value={linuxMinutes} onChange={setLinuxMinutes} />
          <MinuteInput label="Windows ランナー ($0.016/分 — 2倍)" value={windowsMinutes} onChange={setWindowsMinutes} />
          <MinuteInput label="macOS ランナー ($0.080/分 — 10倍)" value={macosMinutes} onChange={setMacosMinutes} />
        </div>

        {/* Larger Runner */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="larger-runner"
              checked={useLargerRunner}
              onChange={(e) => setUseLargerRunner(e.target.checked)}
              className="w-4 h-4 accent-[#0366d6] cursor-pointer"
            />
            <label htmlFor="larger-runner" className="text-sm font-medium text-[#24292e] cursor-pointer">
              Larger Runner（Linux）を使用する
            </label>
          </div>
          {useLargerRunner && (
            <div className="pl-7 space-y-4">
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">ランナーサイズを選択</div>
                <div className="flex flex-wrap gap-2">
                  {LARGER_RUNNERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setLargerRunnerSize(r.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        largerRunnerSize === r.id
                          ? "bg-blue-50 border-[#0366d6] text-[#0366d6]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50/30"
                      }`}
                    >
                      {r.label}
                      <span className="ml-1 opacity-70">${r.ratePerMin}/分</span>
                    </button>
                  ))}
                </div>
              </div>
              <MinuteInput
                label={`Larger Runner 実行時間 (${largerRunner.label} — $${largerRunner.ratePerMin}/分)`}
                value={largerRunnerMinutes}
                onChange={setLargerRunnerMinutes}
              />
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100">
                Larger Runner の実行時間は無料枠の対象外です。全て従量課金となります。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== ストレージ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#24292e] mb-1">ストレージ使用量</h2>
        <p className="text-xs text-gray-500 mb-4">GitHub Packages・Actions キャッシュ・アーティファクト等の合計</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={200}
            step={0.5}
            value={storageGB}
            onChange={(e) => setStorageGB(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0366d6]"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={9999}
              step={0.5}
              value={storageGB}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v) && v >= 0) setStorageGB(v);
              }}
              className="w-24 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0366d6]"
            />
            <span className="text-sm text-gray-500">GB</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">超過分: $0.25/GB/月</p>
      </div>

      {/* ===== 為替レート ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#24292e] mb-4">為替レート</h2>
        <div className="flex items-center gap-2 w-fit">
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
            className="w-24 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0366d6]"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
      </div>

      {/* ===== 無料枠消費状況 ===== */}
      {!calc.isPublic && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#24292e] mb-4">
            無料枠の消費状況 <span className="text-sm font-normal text-gray-500">— {currentPlan.name} プラン</span>
          </h2>
          <div className="space-y-5">
            <UsageBar
              label="実行時間"
              used={calc.usedMinutes}
              total={currentPlan.freeMinutes}
              unit="分"
            />
            <UsageBar
              label="ストレージ"
              used={storageGB}
              total={currentPlan.freeStorageGB}
              unit="GB"
            />
          </div>
        </div>
      )}

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-[#0366d6] p-6 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-[#24292e]">月額コスト</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-[#0366d6] border border-blue-200">
              {currentPlan.name}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {repoType === "public" ? "Public" : "Private"}
            </span>
          </div>
        </div>

        {calc.isPublic ? (
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-[#0366d6] mb-2">$0.00</div>
            <p className="text-gray-500 text-sm">Publicリポジトリは無料です</p>
          </div>
        ) : (
          <>
            {/* 合計 */}
            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-1">月額合計（超過分）</div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-5xl font-bold text-[#24292e]">{fmtUSD(calc.totalUSD)}</span>
                <span className="text-2xl text-gray-600">{fmtJPY(calc.totalUSD * exchangeRate)}</span>
              </div>
            </div>

            {/* 内訳カード */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">実行時間 超過料金</div>
                <div className="text-xl font-bold text-[#24292e]">{fmtUSD(calc.overageCost)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.overageCost * exchangeRate)}</div>
              </div>
              <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">ストレージ 超過料金</div>
                <div className="text-xl font-bold text-[#24292e]">{fmtUSD(calc.storageCost)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.storageCost * exchangeRate)}</div>
              </div>
              <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Larger Runner 料金</div>
                <div className="text-xl font-bold text-[#24292e]">{fmtUSD(calc.largerRunnerCost)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.largerRunnerCost * exchangeRate)}</div>
              </div>
            </div>

            {/* 詳細内訳 */}
            <div className="p-4 bg-white bg-opacity-60 rounded-xl text-xs text-gray-600 space-y-2">
              <div className="font-medium text-gray-700 mb-2">コスト内訳</div>
              {(["linux", "windows", "macos"] as RunnerOS[]).map((os) => {
                const minutes = os === "linux" ? linuxMinutes : os === "windows" ? windowsMinutes : macosMinutes;
                const overageMin = os === "linux" ? calc.linuxOverage : os === "windows" ? calc.windowsOverage : calc.macosOverage;
                const cost = calc.perOSCost[os];
                if (minutes === 0) return null;
                return (
                  <div key={os} className="flex justify-between">
                    <span>
                      {OS_LABELS[os]} {minutes.toLocaleString()}分
                      {overageMin > 0
                        ? ` (無料枠内: ${(minutes - overageMin).toLocaleString()}分 / 超過: ${overageMin.toLocaleString()}分 × $${RUNNER_RATES[os]}/分)`
                        : " (無料枠内)"}
                    </span>
                    <span className="font-medium ml-4 shrink-0">{fmtUSD(cost)}</span>
                  </div>
                );
              })}
              {useLargerRunner && largerRunnerMinutes > 0 && (
                <div className="flex justify-between">
                  <span>
                    Larger Runner ({largerRunner.label}) {largerRunnerMinutes.toLocaleString()}分 × ${largerRunner.ratePerMin}/分
                  </span>
                  <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.largerRunnerCost)}</span>
                </div>
              )}
              {calc.storageCost > 0 && (
                <div className="flex justify-between">
                  <span>
                    ストレージ超過 {Math.max(0, storageGB - currentPlan.freeStorageGB).toFixed(1)} GB × $0.25/GB
                  </span>
                  <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.storageCost)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-1 font-semibold text-gray-800">
                <span>合計</span>
                <span>{fmtUSD(calc.totalUSD)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== OS別コスト比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#24292e] mb-1">OS別コスト比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          同じジョブを各 OS で実行した場合の料金差（Linux分数 {(linuxMinutes || 100).toLocaleString()}分 基準、無料枠除外）
        </p>
        <div className="space-y-3">
          {osComparison.map(({ os, cost }, i) => {
            const maxCost = osComparison[osComparison.length - 1].cost;
            const barPct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
            const multipliers = [1, 2, 10];
            return (
              <div key={os}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#24292e] w-20">{OS_LABELS[os]}</span>
                    <span className="text-xs text-gray-400">${RUNNER_RATES[os]}/分 ({multipliers[i]}x)</span>
                  </div>
                  <div className="text-sm font-semibold text-[#24292e]">
                    {fmtUSD(cost)}
                    <span className="text-xs text-gray-500 ml-1">{fmtJPY(cost * exchangeRate)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${
                      os === "linux" ? "bg-[#0366d6]" : os === "windows" ? "bg-purple-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このGitHub Actions 料金計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">GitHub Actionsの月額コストをランナー種別・実行時間・ストレージから計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このGitHub Actions 料金計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "GitHub Actionsの月額コストをランナー種別・実行時間・ストレージから計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          macOS は Linux の10倍、Windows は2倍のコストになります。CI は可能な限り Linux で実行することを推奨します。
        </p>
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金は{" "}
        <a
          href="https://docs.github.com/ja/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#0366d6] transition-colors"
        >
          GitHub Actions 公式ドキュメント
        </a>
        {" "}をご確認ください。
      </p>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "GitHub Actions 料金計算",
  "description": "GitHub Actionsの月額コストをランナー種別・実行時間・ストレージから計算",
  "url": "https://tools.loresync.dev/github-actions-cost",
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
