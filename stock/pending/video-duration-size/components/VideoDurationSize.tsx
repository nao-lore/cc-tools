"use client";

import { useState, useMemo } from "react";

// --- Types ---

type Resolution = "720p" | "1080p" | "1440p" | "4K";
type Fps = "24" | "30" | "60";
type Codec = "H.264" | "H.265" | "VP9" | "AV1";
type Mode = "size" | "duration";

// --- Constants ---

// Typical bitrates in Mbps per resolution+fps combination (approximate averages)
// Source: industry encoding guidelines
const BITRATE_TABLE: Record<Resolution, Record<Fps, Record<Codec, number>>> = {
  "720p": {
    "24": { "H.264": 5, "H.265": 2.5, "VP9": 2.5, "AV1": 2 },
    "30": { "H.264": 6, "H.265": 3, "VP9": 3, "AV1": 2.5 },
    "60": { "H.264": 9, "H.265": 4.5, "VP9": 4.5, "AV1": 3.5 },
  },
  "1080p": {
    "24": { "H.264": 12, "H.265": 6, "VP9": 6, "AV1": 5 },
    "30": { "H.264": 15, "H.265": 7.5, "VP9": 7.5, "AV1": 6 },
    "60": { "H.264": 22, "H.265": 11, "VP9": 11, "AV1": 9 },
  },
  "1440p": {
    "24": { "H.264": 24, "H.265": 12, "VP9": 12, "AV1": 10 },
    "30": { "H.264": 30, "H.265": 15, "VP9": 15, "AV1": 12 },
    "60": { "H.264": 45, "H.265": 22.5, "VP9": 22.5, "AV1": 18 },
  },
  "4K": {
    "24": { "H.264": 50, "H.265": 25, "VP9": 25, "AV1": 20 },
    "30": { "H.264": 60, "H.265": 30, "VP9": 30, "AV1": 25 },
    "60": { "H.264": 90, "H.265": 45, "VP9": 45, "AV1": 36 },
  },
};

const RESOLUTIONS: Resolution[] = ["720p", "1080p", "1440p", "4K"];
const FPS_OPTIONS: Fps[] = ["24", "30", "60"];
const CODECS: Codec[] = ["H.264", "H.265", "VP9", "AV1"];

const CODEC_LABELS: Record<Codec, string> = {
  "H.264": "H.264 (AVC) — 汎用・互換性最高",
  "H.265": "H.265 (HEVC) — 約50%小さい",
  "VP9": "VP9 — YouTube標準",
  "AV1": "AV1 — 最新・最高圧縮",
};

interface PlatformLimit {
  name: string;
  maxSize: string;
  maxDuration: string;
  notes: string;
}

const PLATFORM_LIMITS: PlatformLimit[] = [
  {
    name: "YouTube",
    maxSize: "256 GB",
    maxDuration: "12時間",
    notes: "確認済みアカウントは最大12時間・256GB",
  },
  {
    name: "TikTok",
    maxSize: "287 MB",
    maxDuration: "10分",
    notes: "モバイルアップロードは4分まで推奨",
  },
  {
    name: "Instagram",
    maxSize: "3.6 GB",
    maxDuration: "60分",
    notes: "フィード動画は最大60秒、リールは最大90秒",
  },
  {
    name: "X (Twitter)",
    maxSize: "512 MB",
    maxDuration: "140秒",
    notes: "無料プランは2分20秒・512MB",
  },
];

// --- Utilities ---

function bytesToHuman(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

function calcFileSizeBytes(bitrateMbps: number, durationMinutes: number): number {
  // bitrate (Mbps) * duration (s) / 8 = bytes
  return (bitrateMbps * 1e6 * durationMinutes * 60) / 8;
}

function calcMaxDurationMinutes(bitrateMbps: number, targetSizeMB: number): number {
  // targetSizeMB * 8 / (bitrateMbps * 1e6) = seconds → / 60 = minutes
  return (targetSizeMB * 1e6 * 8) / (bitrateMbps * 1e6 * 60);
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)}秒`;
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.round((minutes % 1) * 60);
  if (h > 0) return `${h}時間${m}分`;
  if (s > 0) return `${m}分${s}秒`;
  return `${m}分`;
}

// --- Sub-components ---

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labelFn,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labelFn?: (v: T) => string;
}) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 text-xs font-medium py-1.5 transition-colors ${
            value === opt
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {labelFn ? labelFn(opt) : opt}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-blue-700" : "text-gray-800"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// --- Main Component ---

export default function VideoDurationSize() {
  const [mode, setMode] = useState<Mode>("size");
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [fps, setFps] = useState<Fps>("30");
  const [codec, setCodec] = useState<Codec>("H.264");
  const [durationMin, setDurationMin] = useState("10");
  const [targetSizeMB, setTargetSizeMB] = useState("500");

  const bitrateMbps = BITRATE_TABLE[resolution][fps][codec];

  const result = useMemo(() => {
    if (mode === "size") {
      const d = parseFloat(durationMin);
      if (isNaN(d) || d <= 0) return null;
      const bytes = calcFileSizeBytes(bitrateMbps, d);
      return { type: "size" as const, bytes };
    } else {
      const mb = parseFloat(targetSizeMB);
      if (isNaN(mb) || mb <= 0) return null;
      const minutes = calcMaxDurationMinutes(bitrateMbps, mb);
      return { type: "duration" as const, minutes };
    }
  }, [mode, bitrateMbps, durationMin, targetSizeMB]);

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">計算モード</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("size")}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              mode === "size"
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <p className={`text-sm font-semibold ${mode === "size" ? "text-blue-700" : "text-gray-700"}`}>
              サイズ予測
            </p>
            <p className="text-xs text-gray-400 mt-0.5">時間 → ファイルサイズ</p>
          </button>
          <button
            onClick={() => setMode("duration")}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              mode === "duration"
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <p className={`text-sm font-semibold ${mode === "duration" ? "text-blue-700" : "text-gray-700"}`}>
              時間逆算
            </p>
            <p className="text-xs text-gray-400 mt-0.5">目標サイズ → 最大時間</p>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">動画設定</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">解像度</label>
            <SegmentedControl
              options={RESOLUTIONS}
              value={resolution}
              onChange={setResolution}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">フレームレート (fps)</label>
            <SegmentedControl
              options={FPS_OPTIONS}
              value={fps}
              onChange={setFps}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">コーデック</label>
            <div className="grid grid-cols-1 gap-1.5">
              {CODECS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCodec(c)}
                  className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                    codec === c
                      ? "border-blue-300 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-semibold">{c}</span>
                  <span className="ml-1 text-gray-400">{CODEC_LABELS[c].split("—")[1]?.trim()}</span>
                  <span className="float-right text-gray-400">{bitrateMbps} Mbps{codec === c ? "" : ""}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              選択中: {bitrateMbps} Mbps (標準ビットレート目安)
            </p>
          </div>

          {/* Variable input */}
          <div>
            {mode === "size" ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">撮影時間（分）</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">分</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">目標ファイルサイズ（MB）</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={targetSizeMB}
                    onChange={(e) => setTargetSizeMB(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">MB</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[287, 512, 1024, 3686].map((mb) => (
                    <button
                      key={mb}
                      onClick={() => setTargetSizeMB(String(mb))}
                      className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      {mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">計算結果</h2>

        {result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.type === "size" ? (
                <>
                  <StatCard
                    label="予測ファイルサイズ"
                    value={bytesToHuman(result.bytes)}
                    sub={`${(result.bytes / 1e6).toFixed(1)} MB`}
                    highlight
                  />
                  <StatCard
                    label="ビットレート"
                    value={`${bitrateMbps} Mbps`}
                    sub={`${resolution} / ${fps}fps / ${codec}`}
                  />
                  <StatCard
                    label="1分あたり"
                    value={bytesToHuman(calcFileSizeBytes(bitrateMbps, 1))}
                    sub="per minute"
                  />
                  <StatCard
                    label="1時間あたり"
                    value={bytesToHuman(calcFileSizeBytes(bitrateMbps, 60))}
                    sub="per hour"
                  />
                </>
              ) : (
                <>
                  <StatCard
                    label="最大撮影時間"
                    value={formatDuration(result.minutes)}
                    sub={`${result.minutes.toFixed(2)} 分`}
                    highlight
                  />
                  <StatCard
                    label="ビットレート"
                    value={`${bitrateMbps} Mbps`}
                    sub={`${resolution} / ${fps}fps / ${codec}`}
                  />
                  <StatCard
                    label="目標サイズ"
                    value={`${targetSizeMB} MB`}
                    sub={`= ${(parseFloat(targetSizeMB) / 1024).toFixed(2)} GB`}
                  />
                  <StatCard
                    label="1分あたりのサイズ"
                    value={bytesToHuman(calcFileSizeBytes(bitrateMbps, 1))}
                    sub="per minute"
                  />
                </>
              )}
            </div>

            {/* Codec comparison */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600">コーデック比較（同じ設定）</p>
              </div>
              <div className="divide-y divide-gray-100">
                {CODECS.map((c) => {
                  const br = BITRATE_TABLE[resolution][fps][c];
                  const val =
                    result.type === "size"
                      ? bytesToHuman(calcFileSizeBytes(br, parseFloat(durationMin)))
                      : formatDuration(calcMaxDurationMinutes(br, parseFloat(targetSizeMB)));
                  return (
                    <div
                      key={c}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                        c === codec ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className={`font-medium ${c === codec ? "text-blue-700" : "text-gray-700"}`}>
                        {c}
                        {c === codec && (
                          <span className="ml-1 text-xs text-blue-400">選択中</span>
                        )}
                      </span>
                      <span className={`font-semibold ${c === codec ? "text-blue-700" : "text-gray-600"}`}>
                        {val}
                      </span>
                    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この動画サイズ 予測計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">解像度・時間・コーデックからファイルサイズ予測。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この動画サイズ 予測計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "解像度・時間・コーデックからファイルサイズ予測。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
            有効な値を入力してください
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Platform limits */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">プラットフォーム制限</h2>
        <div className="divide-y divide-gray-100">
          {PLATFORM_LIMITS.map((p) => (
            <div key={p.name} className="py-3 grid grid-cols-3 gap-2 text-sm">
              <span className="font-semibold text-gray-800">{p.name}</span>
              <div className="text-gray-600">
                <span className="text-xs text-gray-400 block">最大サイズ</span>
                {p.maxSize}
              </div>
              <div className="text-gray-600">
                <span className="text-xs text-gray-400 block">最大時間</span>
                {p.maxDuration}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          ※ 制限は変更される場合があります。各プラットフォームの最新情報をご確認ください。
        </p>
      </div>

      {/* Formula */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
        <p>ファイルサイズ (B) = ビットレート (bps) × 時間 (秒) ÷ 8</p>
        <p>最大時間 (秒) = 目標サイズ (B) × 8 ÷ ビットレート (bps)</p>
        <p className="text-xs text-gray-400 pt-1">
          ※ 実際のサイズはコンテンツの複雑さ・音声・メタデータにより変動します。目安としてご活用ください。
        </p>
      </div>
    </div>
  );
}
