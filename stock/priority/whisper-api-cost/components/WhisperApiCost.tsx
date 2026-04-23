"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---
// Whisper: $0.006/分
// Google Speech-to-Text: $0.006–$0.009/15秒 → 分換算: $0.024–$0.036/分
//   Standard: $0.006/15秒 = $0.024/分
//   Enhanced: $0.009/15秒 = $0.036/分
// Amazon Transcribe: $0.024/分（最初250,000分/月まで）
const SERVICES = [
  {
    id: "whisper",
    name: "OpenAI Whisper",
    label: "Whisper API",
    costPerMin: 0.006,
    freeMinutes: 0,
    note: "$0.006/分",
    tier: "低コスト",
    color: "teal",
  },
  {
    id: "google",
    name: "Google Speech-to-Text",
    label: "Google STT",
    costPerMin: 0.024, // Standard: $0.006/15秒
    costPerMinHigh: 0.036, // Enhanced: $0.009/15秒
    freeMinutes: 60, // 毎月60分無料
    note: "$0.024–$0.036/分（毎月60分無料）",
    tier: "中コスト",
    color: "blue",
  },
  {
    id: "amazon",
    name: "Amazon Transcribe",
    label: "Amazon Transcribe",
    costPerMin: 0.024,
    freeMinutes: 250000, // 最初250K分/月
    note: "$0.024/分（初回250,000分/月まで無料）",
    tier: "中コスト",
    color: "orange",
  },
] as const;

type ServiceId = (typeof SERVICES)[number]["id"];

// 用途別おすすめ
const USE_CASES = [
  {
    id: "meeting",
    label: "会議録音",
    icon: "🎤",
    avgMinutesPerFile: 60,
    filesPerMonth: 20,
    desc: "週5回・1時間の会議",
    recommended: "whisper",
    reason: "コスト最安。精度も実用十分。",
  },
  {
    id: "podcast",
    label: "ポッドキャスト",
    icon: "🎙️",
    avgMinutesPerFile: 45,
    filesPerMonth: 8,
    desc: "週2本・45分",
    recommended: "whisper",
    reason: "長尺音声も安定。コスト優位。",
  },
  {
    id: "callcenter",
    label: "コールセンター",
    icon: "📞",
    avgMinutesPerFile: 5,
    filesPerMonth: 2000,
    desc: "1日100件・5分",
    recommended: "google",
    reason: "大量処理はGoogle Enhanced の精度が有利。初回60分無料も加算。",
  },
] as const;

// 数値フォーマット
function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 0.01) return `${n.toFixed(4)}円`;
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}分`;
  if (min === 0) return `${h}時間`;
  return `${h}時間${min}分`;
}

// コスト計算（Whisper用シンプル版）
function calcWhisperCost(totalMinutes: number): number {
  return totalMinutes * 0.006;
}

// Google STT（Standard）
function calcGoogleCost(totalMinutes: number, mode: "standard" | "enhanced"): number {
  const rate = mode === "enhanced" ? 0.036 : 0.024;
  const billable = Math.max(0, totalMinutes - 60); // 60分無料
  return billable * rate;
}

// Amazon Transcribe
function calcAmazonCost(totalMinutes: number): number {
  const billable = Math.max(0, totalMinutes - 250000);
  return billable * 0.024;
}

// --- サブコンポーネント: スライダー+数値入力 ---
function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  label,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(Math.max(v, min), max));
            }}
            className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function WhisperApiCost() {
  // 入力モード: 「時間指定」か「ファイル数×平均長」
  const [inputMode, setInputMode] = useState<"duration" | "files">("duration");

  // 時間指定
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(0);

  // ファイル数×平均長
  const [filesPerMonth, setFilesPerMonth] = useState<number>(100);
  const [avgMinutes, setAvgMinutes] = useState<number>(10);

  // Google STT モード
  const [googleMode, setGoogleMode] = useState<"standard" | "enhanced">("standard");

  // 為替レート
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  // 月間総分数
  const totalMinutes = useMemo(() => {
    if (inputMode === "duration") {
      return hours * 60 + minutes;
    } else {
      return filesPerMonth * avgMinutes;
    }
  }, [inputMode, hours, minutes, filesPerMonth, avgMinutes]);

  // 各サービスコスト
  const costs = useMemo(() => ({
    whisper: calcWhisperCost(totalMinutes),
    google: calcGoogleCost(totalMinutes, googleMode),
    amazon: calcAmazonCost(totalMinutes),
  }), [totalMinutes, googleMode]);

  // 最安サービス
  const cheapest = useMemo(() => {
    const entries = Object.entries(costs) as [ServiceId, number][];
    return entries.reduce((a, b) => (a[1] <= b[1] ? a : b))[0];
  }, [costs]);

  return (
    <div className="space-y-6">

      {/* ===== 入力モード切替 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">音声量の入力方法</h2>
        <div className="flex gap-2 mb-5">
          {([
            { id: "duration", label: "時間で指定", desc: "合計 時間:分 を入力" },
            { id: "files", label: "ファイル数で指定", desc: "ファイル数 × 平均長" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setInputMode(opt.id)}
              className={`flex flex-col px-4 py-2.5 rounded-lg border text-left transition-all ${
                inputMode === opt.id
                  ? "bg-teal-50 border-teal-400 text-teal-800 shadow-sm"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-teal-50/30"
              }`}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="text-xs opacity-75">{opt.desc}</span>
            </button>
          ))}
        </div>

        {inputMode === "duration" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NumberInput
              label="時間"
              value={hours}
              onChange={setHours}
              min={0}
              max={1000}
              step={1}
              unit="時間"
            />
            <NumberInput
              label="分"
              value={minutes}
              onChange={setMinutes}
              min={0}
              max={59}
              step={1}
              unit="分"
            />
          </div>
        ) : (
          <div className="space-y-5">
            <NumberInput
              label="月間ファイル数"
              value={filesPerMonth}
              onChange={setFilesPerMonth}
              min={1}
              max={10000}
              step={1}
              unit="ファイル/月"
            />
            <NumberInput
              label="1ファイルあたりの平均長"
              value={avgMinutes}
              onChange={setAvgMinutes}
              min={1}
              max={300}
              step={1}
              unit="分"
            />
          </div>
        )}

        {/* 合計表示 */}
        <div className="mt-4 p-3 bg-teal-50 rounded-xl border border-teal-200">
          <div className="text-sm text-teal-700">
            月間音声量:{" "}
            <span className="font-bold text-teal-900 text-base">
              {fmtMinutes(totalMinutes)}
            </span>
            <span className="text-xs ml-2 text-teal-600">（{totalMinutes.toLocaleString()} 分）</span>
            {inputMode === "files" && (
              <span className="text-xs ml-2 text-teal-600">
                = {filesPerMonth.toLocaleString()} ファイル × {avgMinutes} 分
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== Google STT モード ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Google Speech-to-Text モード</h2>
        <div className="flex gap-2 flex-wrap">
          {([
            { id: "standard", label: "Standard", desc: "$0.024/分（汎用）" },
            { id: "enhanced", label: "Enhanced", desc: "$0.036/分（高精度）" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setGoogleMode(opt.id)}
              className={`flex flex-col px-4 py-2.5 rounded-lg border text-left transition-all ${
                googleMode === opt.id
                  ? "bg-teal-50 border-teal-400 text-teal-800 shadow-sm"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-teal-50/30"
              }`}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="text-xs opacity-75">{opt.desc}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">毎月60分は無料。比較表にも反映されます。</p>
      </div>

      {/* ===== 為替レート ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">為替レート</span>
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
            className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
      </div>

      {/* ===== Whisper 計算結果（メイン） ===== */}
      <div className="rounded-2xl shadow-sm border border-teal-300 p-6 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Whisper API コスト</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
            $0.006/分
          </span>
        </div>

        <div className="mb-5">
          <div className="text-xs text-gray-500 mb-1">月間コスト（{fmtMinutes(totalMinutes)}）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">{fmtUSD(costs.whisper)}</span>
            <span className="text-xl text-gray-600">{fmtJPY(costs.whisper * exchangeRate)}</span>
          </div>
        </div>

        <div className="p-3 bg-white bg-opacity-60 rounded-xl text-xs text-gray-600 space-y-1.5">
          <div className="font-medium text-gray-700 mb-1">内訳</div>
          <div className="flex justify-between">
            <span>{totalMinutes.toLocaleString()} 分 × $0.006/分</span>
            <span className="font-medium">{fmtUSD(costs.whisper)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1.5">
            <span>円換算（1 USD = {exchangeRate}円）</span>
            <span className="font-medium">{fmtJPY(costs.whisper * exchangeRate)}</span>
          </div>
          {inputMode === "files" && (
            <div className="flex justify-between text-gray-400">
              <span>1ファイルあたり（{avgMinutes}分）</span>
              <span>{fmtUSD(avgMinutes * 0.006)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== 3サービス比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">3サービス比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          月間 {fmtMinutes(totalMinutes)}（{totalMinutes.toLocaleString()}分）での試算
          {googleMode === "enhanced" && "（Google: Enhanced モード）"}
        </p>

        {/* デスクトップ: テーブル */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">サービス</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">料金単価</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">無料枠</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">月額（USD）</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">月額（円）</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "whisper" as ServiceId,
                  name: "OpenAI Whisper",
                  unitPrice: "$0.006/分",
                  free: "なし",
                  cost: costs.whisper,
                },
                {
                  id: "google" as ServiceId,
                  name: `Google STT (${googleMode === "enhanced" ? "Enhanced" : "Standard"})`,
                  unitPrice: googleMode === "enhanced" ? "$0.036/分" : "$0.024/分",
                  free: "60分/月",
                  cost: costs.google,
                },
                {
                  id: "amazon" as ServiceId,
                  name: "Amazon Transcribe",
                  unitPrice: "$0.024/分",
                  free: "250,000分/月*",
                  cost: costs.amazon,
                },
              ].map((row) => {
                const isCheapest = row.id === cheapest;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-50 ${isCheapest ? "bg-teal-50" : ""}`}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isCheapest ? "text-teal-800" : "text-gray-700"}`}>
                          {row.name}
                        </span>
                        {isCheapest && (
                          <span className="text-xs bg-teal-200 text-teal-800 px-1.5 py-0.5 rounded-full font-medium">
                            最安
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-right text-gray-600 text-xs">{row.unitPrice}</td>
                    <td className="py-3 pr-3 text-right text-gray-500 text-xs">{row.free}</td>
                    <td className="py-3 pr-3 text-right font-semibold text-gray-900">
                      {fmtUSD(row.cost)}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {fmtJPY(row.cost * exchangeRate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">
            * Amazon Transcribe の250,000分無料枠は初回登録から12ヶ月間のみ
          </p>
        </div>

        {/* モバイル用カード */}
        <div className="sm:hidden space-y-3">
          {[
            {
              id: "whisper" as ServiceId,
              name: "OpenAI Whisper",
              unitPrice: "$0.006/分",
              free: "無料枠なし",
              cost: costs.whisper,
            },
            {
              id: "google" as ServiceId,
              name: `Google STT (${googleMode === "enhanced" ? "Enhanced" : "Standard"})`,
              unitPrice: googleMode === "enhanced" ? "$0.036/分" : "$0.024/分",
              free: "60分/月無料",
              cost: costs.google,
            },
            {
              id: "amazon" as ServiceId,
              name: "Amazon Transcribe",
              unitPrice: "$0.024/分",
              free: "250,000分/月（初回12ヶ月）",
              cost: costs.amazon,
            },
          ].map((row) => {
            const isCheapest = row.id === cheapest;
            return (
              <div
                key={row.id}
                className={`p-4 rounded-xl border ${
                  isCheapest ? "bg-teal-50 border-teal-300" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isCheapest ? "text-teal-800" : "text-gray-800"}`}>
                      {row.name}
                    </span>
                    {isCheapest && (
                      <span className="text-xs bg-teal-200 text-teal-800 px-1.5 py-0.5 rounded-full">
                        最安
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{fmtUSD(row.cost)}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>単価: <span className="font-medium text-gray-700">{row.unitPrice}</span></span>
                  <span>{row.free}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  円換算: <span className="font-medium text-gray-700">{fmtJPY(row.cost * exchangeRate)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 用途別おすすめ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">用途別おすすめ</h2>
        <p className="text-xs text-gray-500 mb-4">クリックすると音声量を自動入力します</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {USE_CASES.map((uc) => {
            const ucTotalMin = uc.filesPerMonth * uc.avgMinutesPerFile;
            const whisperCost = calcWhisperCost(ucTotalMin);
            return (
              <button
                key={uc.id}
                onClick={() => {
                  setInputMode("files");
                  setFilesPerMonth(uc.filesPerMonth);
                  setAvgMinutes(uc.avgMinutesPerFile);
                }}
                className="flex flex-col p-4 rounded-xl border border-gray-200 text-left hover:border-teal-300 hover:bg-teal-50/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{uc.icon}</span>
                  <span className="font-semibold text-gray-900 text-sm">{uc.label}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">{uc.desc}</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">月間音声量</span>
                    <span className="font-medium text-gray-700">{fmtMinutes(ucTotalMin)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Whisper月額</span>
                    <span className="font-medium text-teal-700">{fmtUSD(whisperCost)}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-medium text-teal-700">
                    おすすめ: {uc.recommended === "whisper" ? "Whisper" : "Google STT"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{uc.reason}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== フッター ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新情報は
        <a
          href="https://openai.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-teal-600 transition-colors mx-1"
        >
          OpenAI公式
        </a>
        /
        <a
          href="https://cloud.google.com/speech-to-text/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-teal-600 transition-colors mx-1"
        >
          Google公式
        </a>
        /
        <a
          href="https://aws.amazon.com/transcribe/pricing/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-teal-600 transition-colors mx-1"
        >
          AWS公式
        </a>
        をご確認ください。
      </p>
    </div>
  );
}
