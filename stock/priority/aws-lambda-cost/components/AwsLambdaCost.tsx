"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---

type Architecture = "x86" | "arm";
type Region = "us-east-1" | "ap-northeast-1" | "eu-west-1";

// リージョン別料金乗数
const REGION_MULTIPLIERS: Record<Region, number> = {
  "us-east-1":      1.0,
  "ap-northeast-1": 1.1,
  "eu-west-1":      1.05,
};

const REGION_LABELS: Record<Region, string> = {
  "us-east-1":      "US East (バージニア北部)",
  "ap-northeast-1": "アジアパシフィック (東京) +10%",
  "eu-west-1":      "EU (アイルランド) +5%",
};

// 基準単価 (us-east-1)
const REQUEST_RATE_PER_M = 0.20;           // USD / 100万リクエスト
const DURATION_RATE_X86  = 0.0000166667;  // USD / GB-second
const DURATION_RATE_ARM  = 0.0000133334;  // USD / GB-second

// 無料枠（永久・毎月）
const FREE_REQUESTS = 1_000_000;   // リクエスト/月
const FREE_GB_SECONDS = 400_000;   // GB-seconds/月

// Provisioned Concurrency 単価 (us-east-1)
const PC_IDLE_RATE    = 0.0000041667;  // USD / GB-second (待機)
const PC_EXEC_RATE    = 0.0000097222;  // USD / GB-second (実行)

// メモリプリセット (MB)
const MEMORY_PRESETS = [128, 256, 512, 1024, 2048, 3008, 4096, 10240];

// --- フォーマット ---
function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

// 無料枠バー
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
          {fmtNum(Math.round(used))} / {fmtNum(total)} {unit}
          {over && <span className="ml-1 text-red-500">（超過）</span>}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all ${
            over ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-[#FF9900]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`text-right text-xs mt-0.5 ${over ? "text-red-500" : "text-gray-400"}`}>
        {pct.toFixed(1)}% 使用
      </div>
    </div>
  );
}

// 数値入力コンポーネント
function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-gray-700 flex-1">
          {label}
          {hint && <span className="text-xs text-gray-400 ml-1">({hint})</span>}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min ?? 0}
            max={max}
            step={step ?? 1}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v >= (min ?? 0)) onChange(v);
            }}
            className="w-32 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function AwsLambdaCost() {
  const [architecture, setArchitecture] = useState<Architecture>("x86");
  const [region, setRegion] = useState<Region>("us-east-1");
  const [memoryMB, setMemoryMB] = useState<number>(512);
  const [durationMs, setDurationMs] = useState<number>(200);
  const [requestsPerMonth, setRequestsPerMonth] = useState<number>(10_000_000);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  // Provisioned Concurrency
  const [usePC, setUsePC] = useState<boolean>(false);
  const [pcConcurrency, setPcConcurrency] = useState<number>(10);
  const [pcHoursPerDay, setPcHoursPerDay] = useState<number>(24);

  const calc = useMemo(() => {
    const regionMul = REGION_MULTIPLIERS[region];
    const durationRateBase = architecture === "x86" ? DURATION_RATE_X86 : DURATION_RATE_ARM;
    const durationRate = durationRateBase * regionMul;
    const requestRatePerM = REQUEST_RATE_PER_M * regionMul;

    // GB-seconds計算
    const memoryGB = memoryMB / 1024;
    const durationSec = durationMs / 1000;
    const gbSecondsPerRequest = memoryGB * durationSec;
    const totalGbSeconds = gbSecondsPerRequest * requestsPerMonth;

    // 無料枠差し引き
    const billableRequests = Math.max(0, requestsPerMonth - FREE_REQUESTS);
    const billableGbSeconds = Math.max(0, totalGbSeconds - FREE_GB_SECONDS);

    // リクエスト料金
    const requestCost = (billableRequests / 1_000_000) * requestRatePerM;

    // 実行時間料金
    const durationCost = billableGbSeconds * durationRate;

    // Provisioned Concurrency
    let pcIdleCost = 0;
    let pcExecCost = 0;
    if (usePC && pcConcurrency > 0) {
      const hoursPerMonth = pcHoursPerDay * 30;
      const secondsPerMonth = hoursPerMonth * 3600;
      const pcGbSeconds = memoryGB * pcConcurrency * secondsPerMonth;
      pcIdleCost = pcGbSeconds * PC_IDLE_RATE * regionMul;
      // PC実行時は通常実行時間料金の代わりにPC実行料金（全リクエスト想定）
      pcExecCost = totalGbSeconds * PC_EXEC_RATE * regionMul;
    }

    const pcTotal = pcIdleCost + pcExecCost;
    const totalUSD = requestCost + durationCost + (usePC ? pcTotal : 0);

    return {
      memoryGB,
      gbSecondsPerRequest,
      totalGbSeconds,
      billableRequests,
      billableGbSeconds,
      requestCost,
      durationCost,
      pcIdleCost,
      pcExecCost,
      pcTotal,
      totalUSD,
      durationRate,
      requestRatePerM,
    };
  }, [architecture, region, memoryMB, durationMs, requestsPerMonth, usePC, pcConcurrency, pcHoursPerDay]);

  // ARM vs x86 比較
  const armCost = useMemo(() => {
    const regionMul = REGION_MULTIPLIERS[region];
    const durationRate = DURATION_RATE_ARM * regionMul;
    const requestRatePerM = REQUEST_RATE_PER_M * regionMul;
    const memoryGB = memoryMB / 1024;
    const durationSec = durationMs / 1000;
    const totalGbSeconds = memoryGB * durationSec * requestsPerMonth;
    const billableRequests = Math.max(0, requestsPerMonth - FREE_REQUESTS);
    const billableGbSeconds = Math.max(0, totalGbSeconds - FREE_GB_SECONDS);
    return (billableRequests / 1_000_000) * requestRatePerM + billableGbSeconds * durationRate;
  }, [region, memoryMB, durationMs, requestsPerMonth]);

  const x86Cost = useMemo(() => {
    const regionMul = REGION_MULTIPLIERS[region];
    const durationRate = DURATION_RATE_X86 * regionMul;
    const requestRatePerM = REQUEST_RATE_PER_M * regionMul;
    const memoryGB = memoryMB / 1024;
    const durationSec = durationMs / 1000;
    const totalGbSeconds = memoryGB * durationSec * requestsPerMonth;
    const billableRequests = Math.max(0, requestsPerMonth - FREE_REQUESTS);
    const billableGbSeconds = Math.max(0, totalGbSeconds - FREE_GB_SECONDS);
    return (billableRequests / 1_000_000) * requestRatePerM + billableGbSeconds * durationRate;
  }, [region, memoryMB, durationMs, requestsPerMonth]);

  const armSaving = x86Cost > 0 ? ((x86Cost - armCost) / x86Cost) * 100 : 0;
  const maxArch = Math.max(x86Cost, armCost);

  return (
    <div className="space-y-6">

      {/* ===== アーキテクチャ選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">アーキテクチャ</h2>
        <div className="flex gap-3 flex-wrap">
          {([
            { id: "x86" as Architecture, label: "x86_64", desc: "汎用プロセッサ・標準価格" },
            { id: "arm" as Architecture, label: "ARM (Graviton2)", desc: "20%安い・対応ランタイム限定" },
          ]).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setArchitecture(opt.id)}
              className={`flex flex-col px-5 py-3 rounded-xl border text-left transition-all ${
                architecture === opt.id
                  ? "bg-orange-50 border-[#FF9900] ring-2 ring-orange-200 shadow-sm"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50/30 hover:border-orange-200"
              }`}
            >
              <span className={`text-sm font-semibold ${architecture === opt.id ? "text-[#FF9900]" : ""}`}>
                {opt.label}
              </span>
              <span className="text-xs opacity-75 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== リージョン選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">リージョン</h2>
        <div className="flex flex-col gap-2">
          {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-all ${
                region === r
                  ? "bg-orange-50 border-[#FF9900] ring-1 ring-orange-200"
                  : "bg-gray-50 border-gray-200 hover:bg-orange-50/30 hover:border-orange-200"
              }`}
            >
              <span className={`text-sm font-medium ${region === r ? "text-[#FF9900]" : "text-gray-700"}`}>
                {REGION_LABELS[r]}
              </span>
              <span className="text-xs text-gray-400 font-mono">{r}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== メモリ設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">メモリ割当</h2>
        <p className="text-xs text-gray-500 mb-4">128MB〜10,240MB（64MB単位）。CPUコア数はメモリに比例して割り当て。</p>

        {/* プリセット */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MEMORY_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setMemoryMB(m)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                memoryMB === m
                  ? "bg-orange-50 border-[#FF9900] text-[#FF9900]"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50/30 hover:border-orange-200"
              }`}
            >
              {m >= 1024 ? `${m / 1024}GB` : `${m}MB`}
            </button>
          ))}
        </div>

        {/* スライダー */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={128}
            max={10240}
            step={64}
            value={memoryMB}
            onChange={(e) => setMemoryMB(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF9900]"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={128}
              max={10240}
              step={64}
              value={memoryMB}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v) && v >= 128 && v <= 10240) setMemoryMB(Math.round(v / 64) * 64);
              }}
              className="w-24 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
            />
            <span className="text-sm text-gray-500">MB</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          = {(memoryMB / 1024).toFixed(3)} GB（{(memoryMB / 1769).toFixed(2)} vCPU相当）
        </div>
      </div>

      {/* ===== 実行設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">実行設定</h2>
        <p className="text-xs text-gray-500 mb-5">月間のリクエスト数と1回あたりの平均実行時間を入力。</p>
        <div className="space-y-5">
          <NumericInput
            label="月間リクエスト数"
            value={requestsPerMonth}
            onChange={setRequestsPerMonth}
            step={100000}
            suffix="リクエスト/月"
            hint="無料枠: 100万/月"
          />
          <NumericInput
            label="平均実行時間"
            value={durationMs}
            onChange={setDurationMs}
            min={1}
            max={900000}
            step={10}
            suffix="ms"
            hint="最大15分"
          />
        </div>

        {/* GB-seconds可視化 */}
        <div className="mt-5 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="text-xs font-semibold text-orange-800 mb-2">GB-seconds 計算</div>
          <div className="text-xs text-orange-700 space-y-1">
            <div className="flex justify-between">
              <span>メモリ: {(calc.memoryGB).toFixed(4)} GB</span>
              <span>実行時間: {(durationMs / 1000).toFixed(3)} 秒</span>
            </div>
            <div className="flex justify-between font-medium border-t border-orange-200 pt-1 mt-1">
              <span>1リクエストあたり</span>
              <span>{calc.gbSecondsPerRequest.toFixed(6)} GB-sec</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>月間合計</span>
              <span>{fmtNum(Math.round(calc.totalGbSeconds))} GB-sec</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>無料枠 ({fmtNum(FREE_GB_SECONDS)} GB-sec)</span>
              <span>差し引き後: {fmtNum(Math.round(calc.billableGbSeconds))} GB-sec</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Provisioned Concurrency ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-1">
          <input
            type="checkbox"
            id="use-pc"
            checked={usePC}
            onChange={(e) => setUsePC(e.target.checked)}
            className="w-4 h-4 accent-[#FF9900] cursor-pointer"
          />
          <label htmlFor="use-pc" className="text-lg font-semibold text-gray-900 cursor-pointer">
            Provisioned Concurrency
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-4 ml-7">コールドスタートを排除する有料オプション（待機時間も課金）</p>

        {usePC && (
          <div className="ml-7 space-y-4">
            <NumericInput
              label="プロビジョニング同時実行数"
              value={pcConcurrency}
              onChange={setPcConcurrency}
              min={1}
              step={1}
              suffix="同時実行"
            />
            <NumericInput
              label="有効時間"
              value={pcHoursPerDay}
              onChange={setPcHoursPerDay}
              min={1}
              max={24}
              step={1}
              suffix="時間/日"
              hint="最大24時間"
            />
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700 space-y-1">
              <div className="flex justify-between">
                <span>待機コスト ($0.0000041667/GB-sec)</span>
                <span className="font-medium">{fmtUSD(calc.pcIdleCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>実行コスト ($0.0000097222/GB-sec)</span>
                <span className="font-medium">{fmtUSD(calc.pcExecCost)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-amber-200 pt-1">
                <span>PC合計</span>
                <span>{fmtUSD(calc.pcTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== 為替レート ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">為替レート</h2>
        <div className="flex items-center gap-2 w-fit">
          <span className="text-sm text-gray-500">1 USD =</span>
          <input
            type="number"
            min={50}
            max={500}
            step={1}
            value={exchangeRate}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v > 0) setExchangeRate(v);
            }}
            className="w-24 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
      </div>

      {/* ===== 無料枠消費状況 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">無料枠の消費状況</h2>
        <div className="space-y-5">
          <UsageBar
            label="リクエスト"
            used={requestsPerMonth}
            total={FREE_REQUESTS}
            unit="リクエスト"
          />
          <UsageBar
            label="実行時間"
            used={Math.round(calc.totalGbSeconds)}
            total={FREE_GB_SECONDS}
            unit="GB-sec"
          />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          無料枠は毎月リセットされます（AWS アカウント全体で共有）
        </p>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-[#FF9900] p-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900">月額コスト</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-[#CC7A00] border border-orange-200">
              {architecture === "x86" ? "x86_64" : "ARM Graviton2"}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {region}
            </span>
          </div>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">月額合計（無料枠差し引き後）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-5xl font-bold text-gray-900">{fmtUSD(calc.totalUSD)}</span>
            <span className="text-2xl text-gray-600">{fmtJPY(calc.totalUSD * exchangeRate)}</span>
          </div>
        </div>

        {/* 内訳カード */}
        <div className={`grid grid-cols-1 gap-3 mb-5 ${usePC ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">リクエスト料金</div>
            <div className="text-xl font-bold text-gray-900">{fmtUSD(calc.requestCost)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.requestCost * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {fmtNum(calc.billableRequests)}件 × ${calc.requestRatePerM.toFixed(2)}/100万
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">実行時間料金</div>
            <div className="text-xl font-bold text-gray-900">{fmtUSD(calc.durationCost)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.durationCost * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {fmtNum(Math.round(calc.billableGbSeconds))} GB-sec × ${calc.durationRate.toFixed(10)}/GB-sec
            </div>
          </div>
          {usePC && (
            <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Provisioned Concurrency</div>
              <div className="text-xl font-bold text-gray-900">{fmtUSD(calc.pcTotal)}</div>
              <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.pcTotal * exchangeRate)}</div>
              <div className="text-xs text-gray-400 mt-1">
                待機 + 実行
              </div>
            </div>
          )}
        </div>

        {/* 詳細内訳 */}
        <div className="p-4 bg-white bg-opacity-60 rounded-xl text-xs text-gray-600 space-y-2">
          <div className="font-medium text-gray-700 mb-2">コスト内訳</div>
          <div className="flex justify-between">
            <span>
              リクエスト {fmtNum(requestsPerMonth)}件（無料枠 {fmtNum(FREE_REQUESTS)}件差し引き後 {fmtNum(calc.billableRequests)}件）
            </span>
            <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.requestCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              実行時間 {fmtNum(Math.round(calc.totalGbSeconds))} GB-sec（無料枠 {fmtNum(FREE_GB_SECONDS)} GB-sec差し引き後 {fmtNum(Math.round(calc.billableGbSeconds))} GB-sec）
            </span>
            <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.durationCost)}</span>
          </div>
          {usePC && (
            <>
              <div className="flex justify-between">
                <span>PC待機コスト（{pcConcurrency}同時実行 × {pcHoursPerDay}時間/日 × 30日）</span>
                <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.pcIdleCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>PC実行コスト</span>
                <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.pcExecCost)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-1 font-semibold text-gray-800">
            <span>合計</span>
            <span>{fmtUSD(calc.totalUSD)}</span>
          </div>
        </div>
      </div>

      {/* ===== ARM vs x86 比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">ARM vs x86 コスト比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          同じ設定でアーキテクチャのみ変えた場合の料金差（Provisioned Concurrency除く）
        </p>
        <div className="space-y-3">
          {([
            { id: "x86" as Architecture, label: "x86_64",  cost: x86Cost, color: "bg-gray-400" },
            { id: "arm" as Architecture, label: "ARM Graviton2", cost: armCost, color: "bg-[#FF9900]" },
          ]).map(({ id, label, cost, color }) => {
            const barPct = maxArch > 0 ? (cost / maxArch) * 100 : 0;
            return (
              <div key={id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium w-36 ${architecture === id ? "text-[#FF9900]" : "text-gray-700"}`}>
                      {label}
                      {architecture === id && <span className="ml-1 text-xs">(選択中)</span>}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {fmtUSD(cost)}
                    <span className="text-xs text-gray-500 ml-1">{fmtJPY(cost * exchangeRate)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${color}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAWS Lambda 料金計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">AWS Lambdaの月額コストをリクエスト数・実行時間・メモリサイズから試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAWS Lambda 料金計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "AWS Lambdaの月額コストをリクエスト数・実行時間・メモリサイズから試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
        {armSaving > 0 && (
          <div className="mt-4 px-3 py-2 bg-green-50 rounded-lg border border-green-100 text-xs text-green-700">
            ARM Graviton2 に切り替えると月額 <strong>{fmtUSD(x86Cost - armCost)}</strong>（{armSaving.toFixed(1)}%）節約できます。
            Python・Node.js・Java・Goなど主要ランタイムが対応済みです。
          </div>
        )}
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。リージョン別料金の差異は概算です。最新の料金は{" "}
        <a
          href="https://aws.amazon.com/lambda/pricing/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#FF9900] transition-colors"
        >
          AWS Lambda 料金ページ
        </a>
        {" "}をご確認ください。
      </p>
    </div>
  );
}
