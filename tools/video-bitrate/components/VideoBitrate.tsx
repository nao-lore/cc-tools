"use client";

import { useState } from "react";

// --- 型定義 ---
type Resolution = "720p" | "1080p" | "1440p" | "4K";
type Fps = 24 | 30 | 60;
type Codec = "H.264" | "H.265" | "VP9" | "AV1";
type InputMode = "recommended" | "custom";

// --- ビットレートテーブル (kbps) ---
// 推奨ビットレート: 解像度 × fps × コーデック
const BITRATE_TABLE: Record<Resolution, Record<Fps, Record<Codec, number>>> = {
  "720p": {
    24: { "H.264": 5000, "H.265": 2500, "VP9": 2500, "AV1": 2000 },
    30: { "H.264": 6000, "H.265": 3000, "VP9": 3000, "AV1": 2400 },
    60: { "H.264": 9000, "H.265": 4500, "VP9": 4500, "AV1": 3600 },
  },
  "1080p": {
    24: { "H.264": 10000, "H.265": 5000, "VP9": 5000, "AV1": 4000 },
    30: { "H.264": 12000, "H.265": 6000, "VP9": 6000, "AV1": 4800 },
    60: { "H.264": 18000, "H.265": 9000, "VP9": 9000, "AV1": 7200 },
  },
  "1440p": {
    24: { "H.264": 20000, "H.265": 10000, "VP9": 10000, "AV1": 8000 },
    30: { "H.264": 24000, "H.265": 12000, "VP9": 12000, "AV1": 9600 },
    60: { "H.264": 36000, "H.265": 18000, "VP9": 18000, "AV1": 14400 },
  },
  "4K": {
    24: { "H.264": 40000, "H.265": 20000, "VP9": 20000, "AV1": 16000 },
    30: { "H.264": 48000, "H.265": 24000, "VP9": 24000, "AV1": 19200 },
    60: { "H.264": 72000, "H.265": 36000, "VP9": 36000, "AV1": 28800 },
  },
};

// --- プリセット (SNSプラットフォーム) ---
type PlatformPreset = {
  id: string;
  name: string;
  resolution: Resolution;
  fps: Fps;
  codec: Codec;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  note: string;
};

const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: "youtube-1080-30",
    name: "YouTube 1080p",
    resolution: "1080p",
    fps: 30,
    codec: "H.264",
    videoBitrateKbps: 8000,
    audioBitrateKbps: 192,
    note: "YouTube推奨。一般的な動画投稿に最適",
  },
  {
    id: "youtube-1080-60",
    name: "YouTube 1080p 60fps",
    resolution: "1080p",
    fps: 60,
    codec: "H.264",
    videoBitrateKbps: 12000,
    audioBitrateKbps: 192,
    note: "ゲーム実況・高速な映像向け",
  },
  {
    id: "youtube-4k",
    name: "YouTube 4K",
    resolution: "4K",
    fps: 30,
    codec: "H.264",
    videoBitrateKbps: 35000,
    audioBitrateKbps: 320,
    note: "4K高品質アップロード",
  },
  {
    id: "twitter-1080",
    name: "X (Twitter) 1080p",
    resolution: "1080p",
    fps: 30,
    codec: "H.264",
    videoBitrateKbps: 6000,
    audioBitrateKbps: 128,
    note: "Twitter/X 推奨設定（最大140秒）",
  },
  {
    id: "instagram-1080",
    name: "Instagram リール",
    resolution: "1080p",
    fps: 30,
    codec: "H.264",
    videoBitrateKbps: 3500,
    audioBitrateKbps: 128,
    note: "リール・投稿動画向け（縦9:16推奨）",
  },
  {
    id: "instagram-story",
    name: "Instagram ストーリー",
    resolution: "1080p",
    fps: 30,
    codec: "H.264",
    videoBitrateKbps: 2500,
    audioBitrateKbps: 128,
    note: "ストーリー向け（最大15秒）",
  },
];

const RESOLUTIONS: Resolution[] = ["720p", "1080p", "1440p", "4K"];
const FPS_OPTIONS: Fps[] = [24, 30, 60];
const CODECS: Codec[] = ["H.264", "H.265", "VP9", "AV1"];

const CODEC_INFO: Record<Codec, { label: string; note: string; badge: string }> = {
  "H.264": {
    label: "H.264 / AVC",
    note: "最も互換性が高い。YouTube・SNS投稿に最適",
    badge: "bg-cyan-100 text-cyan-800",
  },
  "H.265": {
    label: "H.265 / HEVC",
    note: "H.264比で約50%小さい。4K・長時間録画向け",
    badge: "bg-teal-100 text-teal-800",
  },
  VP9: {
    label: "VP9",
    note: "GoogleのオープンコーデックH.264比で約45%削減。YouTube内部使用",
    badge: "bg-emerald-100 text-emerald-800",
  },
  AV1: {
    label: "AV1",
    note: "最新の高効率コーデック。H.264比で約50〜60%削減。エンコードは重い",
    badge: "bg-sky-100 text-sky-800",
  },
};

// --- ユーティリティ ---
function calcFileSizeMB(videoBitrateKbps: number, audioBitrateKbps: number, seconds: number): number {
  const totalKbps = videoBitrateKbps + audioBitrateKbps;
  return (totalKbps * seconds) / 8 / 1024;
}

function formatFileSize(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}時間${m}分${s}秒`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

function parseDuration(hours: string, minutes: string, seconds: string): number {
  const h = parseFloat(hours) || 0;
  const m = parseFloat(minutes) || 0;
  const s = parseFloat(seconds) || 0;
  return h * 3600 + m * 60 + s;
}

// --- メインコンポーネント ---
export default function VideoBitrate() {
  const [inputMode, setInputMode] = useState<InputMode>("recommended");

  // 推奨モード
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [fps, setFps] = useState<Fps>(30);
  const [codec, setCodec] = useState<Codec>("H.264");

  // カスタムモード
  const [customVideoBitrate, setCustomVideoBitrate] = useState<string>("8000");

  // 共通
  const [audioBitrate, setAudioBitrate] = useState<string>("192");
  const [durationH, setDurationH] = useState<string>("0");
  const [durationM, setDurationM] = useState<string>("10");
  const [durationS, setDurationS] = useState<string>("0");

  // プリセット
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const videoBitrateKbps =
    inputMode === "recommended"
      ? BITRATE_TABLE[resolution][fps][codec]
      : parseFloat(customVideoBitrate) || 0;

  const audioBitrateKbps = parseFloat(audioBitrate) || 0;
  const totalSeconds = parseDuration(durationH, durationM, durationS);
  const fileSizeMB =
    videoBitrateKbps > 0 && totalSeconds > 0
      ? calcFileSizeMB(videoBitrateKbps, audioBitrateKbps, totalSeconds)
      : null;

  function applyPreset(preset: PlatformPreset) {
    setActivePreset(preset.id);
    setResolution(preset.resolution);
    setFps(preset.fps);
    setCodec(preset.codec);
    setCustomVideoBitrate(String(preset.videoBitrateKbps));
    setAudioBitrate(String(preset.audioBitrateKbps));
    setInputMode("recommended");
  }

  return (
    <div className="space-y-6">
      {/* プラットフォームプリセット */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6 space-y-4">
        <h2 className="text-lg font-bold text-cyan-900">プラットフォームプリセット</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PLATFORM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors text-left ${
                activePreset === preset.id
                  ? "bg-cyan-600 text-white border-cyan-600"
                  : "border-cyan-200 text-cyan-800 hover:bg-cyan-50"
              }`}
            >
              <span className="block">{preset.name}</span>
              <span className="block text-xs mt-0.5 opacity-75">{preset.note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ビットレート設定 */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-cyan-900">ビットレート設定</h2>
          {/* モード切替 */}
          <div className="flex rounded-lg overflow-hidden border border-cyan-200 text-sm">
            <button
              onClick={() => setInputMode("recommended")}
              className={`px-3 py-1.5 font-semibold transition-colors ${
                inputMode === "recommended"
                  ? "bg-cyan-600 text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              推奨値
            </button>
            <button
              onClick={() => setInputMode("custom")}
              className={`px-3 py-1.5 font-semibold transition-colors ${
                inputMode === "custom"
                  ? "bg-cyan-600 text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              直接入力
            </button>
          </div>
        </div>

        {inputMode === "recommended" ? (
          <div className="space-y-4">
            {/* 解像度 */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">解像度</label>
              <div className="flex gap-2 flex-wrap">
                {RESOLUTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setResolution(r); setActivePreset(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      resolution === r
                        ? "bg-cyan-600 text-white border-cyan-600"
                        : "border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* fps */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">フレームレート</label>
              <div className="flex gap-2 flex-wrap">
                {FPS_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFps(f); setActivePreset(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      fps === f
                        ? "bg-cyan-600 text-white border-cyan-600"
                        : "border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                    }`}
                  >
                    {f} fps
                  </button>
                ))}
              </div>
            </div>

            {/* コーデック */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">コーデック</label>
              <div className="flex gap-2 flex-wrap">
                {CODECS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCodec(c); setActivePreset(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      codec === c
                        ? "bg-teal-600 text-white border-teal-600"
                        : "border-teal-200 text-teal-700 hover:bg-teal-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {CODEC_INFO[codec].note}
              </p>
            </div>

            {/* 推奨ビットレート表示 */}
            <div className="bg-cyan-50 rounded-xl px-4 py-3 flex items-center justify-between border border-cyan-100">
              <span className="text-sm text-cyan-700 font-medium">推奨映像ビットレート</span>
              <span className="text-xl font-bold text-cyan-800">
                {videoBitrateKbps >= 1000
                  ? `${(videoBitrateKbps / 1000).toFixed(0)} Mbps`
                  : `${videoBitrateKbps} kbps`}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">映像ビットレート (kbps)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max="200000"
                  value={customVideoBitrate}
                  onChange={(e) => { setCustomVideoBitrate(e.target.value); setActivePreset(null); }}
                  className="w-40 border border-cyan-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="8000"
                />
                <span className="text-sm text-gray-500">kbps</span>
                {parseFloat(customVideoBitrate) >= 1000 && (
                  <span className="text-sm text-cyan-600 font-medium">
                    = {(parseFloat(customVideoBitrate) / 1000).toFixed(1)} Mbps
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 音声ビットレート（共通） */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">音声ビットレート</label>
          <div className="flex gap-2 flex-wrap">
            {[128, 192, 320].map((b) => (
              <button
                key={b}
                onClick={() => setAudioBitrate(String(b))}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  audioBitrate === String(b)
                    ? "bg-teal-600 text-white border-teal-600"
                    : "border-teal-200 text-teal-700 hover:bg-teal-50"
                }`}
              >
                {b} kbps
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="32"
                max="640"
                value={[128, 192, 320].includes(parseInt(audioBitrate)) ? "" : audioBitrate}
                onChange={(e) => setAudioBitrate(e.target.value)}
                placeholder="カスタム"
                className="w-24 border border-teal-200 rounded-lg px-2 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <span className="text-sm text-gray-500">kbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* 再生時間入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6 space-y-4">
        <h2 className="text-lg font-bold text-cyan-900">再生時間</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="23"
              value={durationH}
              onChange={(e) => setDurationH(e.target.value)}
              className="w-16 border border-cyan-200 rounded-lg px-2 py-2 text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <span className="text-sm text-gray-600">時間</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="59"
              value={durationM}
              onChange={(e) => setDurationM(e.target.value)}
              className="w-16 border border-cyan-200 rounded-lg px-2 py-2 text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <span className="text-sm text-gray-600">分</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="59"
              value={durationS}
              onChange={(e) => setDurationS(e.target.value)}
              className="w-16 border border-cyan-200 rounded-lg px-2 py-2 text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <span className="text-sm text-gray-600">秒</span>
          </div>
          {totalSeconds > 0 && (
            <span className="text-sm text-cyan-600 font-medium">
              = {formatDuration(totalSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* 結果 */}
      {fileSizeMB !== null && (
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl shadow-sm border border-cyan-100 p-6 space-y-4">
          <p className="text-xs font-semibold text-cyan-500 uppercase tracking-wide">計算結果</p>

          {/* メインサイズ */}
          <div className="text-center py-2">
            <p className="text-5xl font-bold text-cyan-700">{formatFileSize(fileSizeMB)}</p>
            <p className="text-sm text-gray-500 mt-1">推定ファイルサイズ</p>
          </div>

          {/* 内訳 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-cyan-700">
                {videoBitrateKbps >= 1000
                  ? `${(videoBitrateKbps / 1000).toFixed(0)} Mbps`
                  : `${videoBitrateKbps} kbps`}
              </p>
              <p className="text-xs text-gray-500 mt-1">映像</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-teal-700">{audioBitrateKbps} kbps</p>
              <p className="text-xs text-gray-500 mt-1">音声</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-emerald-700">
                {(videoBitrateKbps + audioBitrateKbps) >= 1000
                  ? `${((videoBitrateKbps + audioBitrateKbps) / 1000).toFixed(1)} Mbps`
                  : `${videoBitrateKbps + audioBitrateKbps} kbps`}
              </p>
              <p className="text-xs text-gray-500 mt-1">合計</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            {inputMode === "recommended"
              ? `${resolution} / ${fps}fps / ${codec}`
              : `カスタム ${videoBitrateKbps} kbps`}
            {" "}+ 音声 {audioBitrateKbps} kbps × {formatDuration(totalSeconds)}
          </p>
        </div>
      )}

      {/* コーデック比較表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6">
        <h2 className="text-lg font-bold text-cyan-900 mb-4">コーデック比較</h2>
        <div className="space-y-3">
          {CODECS.map((c) => (
            <div
              key={c}
              className="flex items-start gap-3 p-3 rounded-xl bg-cyan-50 border border-cyan-100"
            >
              <span
                className={`inline-block min-w-[72px] text-center px-2 py-1 rounded-lg text-sm font-bold ${CODEC_INFO[c].badge}`}
              >
                {c}
              </span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{CODEC_INFO[c].label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{CODEC_INFO[c].note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 推奨ビットレート早見表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-6">
        <h2 className="text-lg font-bold text-cyan-900 mb-4">推奨ビットレート早見表（H.264）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-100">
                <th className="text-left py-2 pr-4 font-semibold text-gray-600">解像度</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">24fps</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">30fps</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">60fps</th>
              </tr>
            </thead>
            <tbody>
              {RESOLUTIONS.map((r) => (
                <tr key={r} className="border-b border-gray-50 hover:bg-cyan-50 transition-colors">
                  <td className="py-2 pr-4 font-semibold text-cyan-800">{r}</td>
                  {FPS_OPTIONS.map((f) => {
                    const kbps = BITRATE_TABLE[r][f]["H.264"];
                    return (
                      <td key={f} className="py-2 px-3 text-right text-gray-700">
                        {kbps >= 1000 ? `${(kbps / 1000).toFixed(0)} Mbps` : `${kbps} kbps`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">H.265/VP9は約50%、AV1は約55〜60%削減が目安</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この動画ビットレート / ファイルサイズ計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">動画のビットレートと再生時間からファイルサイズを予測。解像度・fps・コーデック別の推奨値付き。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この動画ビットレート / ファイルサイズ計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "動画のビットレートと再生時間からファイルサイズを予測。解像度・fps・コーデック別の推奨値付き。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "動画ビットレート / ファイルサイズ計算",
  "description": "動画のビットレートと再生時間からファイルサイズを予測。解像度・fps・コーデック別の推奨値付き",
  "url": "https://tools.loresync.dev/video-bitrate",
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
