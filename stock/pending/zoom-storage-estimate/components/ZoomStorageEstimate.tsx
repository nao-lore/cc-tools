"use client";
import { useState } from "react";

type Resolution = "360p" | "720p" | "1080p" | "4K";
type Codec = "h264" | "h265" | "vp9";
type Platform = "zoom" | "meet" | "teams" | "webex";

// Mbps base rates by resolution (approximate)
const BASE_BITRATE: Record<Resolution, number> = {
  "360p": 0.4,
  "720p": 1.2,
  "1080p": 2.5,
  "4K": 8.0,
};

const CODEC_EFFICIENCY: Record<Codec, number> = {
  h264: 1.0,
  h265: 0.6,
  vp9: 0.65,
};

// Platform-specific modifiers
const PLATFORM_MODIFIER: Record<Platform, { modifier: number; note: string; defaultResolution: Resolution }> = {
  zoom: { modifier: 0.85, note: "Zoom は独自圧縮を使用。実際はやや小さくなる傾向", defaultResolution: "720p" },
  meet: { modifier: 0.9, note: "Google Meet はVP9使用でファイルサイズ小さめ", defaultResolution: "720p" },
  teams: { modifier: 1.0, note: "Teams はH.264標準。クラウド録画はOneDrive保存", defaultResolution: "1080p" },
  webex: { modifier: 0.8, note: "Webex は独自コーデックで比較的コンパクト", defaultResolution: "720p" },
};

function estimateSize(params: {
  resolution: Resolution;
  durationMin: number;
  participants: number;
  codec: Codec;
  platform: Platform;
  includeAudio: boolean;
}) {
  const { resolution, durationMin, participants, codec, platform, includeAudio } = params;
  const baseMbps = BASE_BITRATE[resolution];
  const codecFactor = CODEC_EFFICIENCY[codec];
  const platformFactor = PLATFORM_MODIFIER[platform].modifier;

  // Video: main stream + participant streams (lower bitrate for gallery view)
  const mainStreamMbps = baseMbps * codecFactor * platformFactor;
  const participantStreamMbps = participants > 1
    ? Math.min(participants - 1, 8) * (BASE_BITRATE["360p"] * 0.5 * codecFactor * platformFactor)
    : 0;

  const audioMbps = includeAudio ? 0.064 * Math.min(participants, 4) : 0; // ~64kbps per active speaker

  const totalMbps = mainStreamMbps + participantStreamMbps + audioMbps;
  const totalMB = (totalMbps * durationMin * 60) / 8;

  return {
    totalMB,
    totalGB: totalMB / 1024,
    totalMbps,
    mainStreamMB: (mainStreamMbps * durationMin * 60) / 8,
    participantMB: (participantStreamMbps * durationMin * 60) / 8,
    audioMB: (audioMbps * durationMin * 60) / 8,
  };
}

function fmtSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(mb * 1024).toFixed(0)} KB`;
}

const PLATFORMS: { key: Platform; label: string; emoji: string }[] = [
  { key: "zoom", label: "Zoom", emoji: "🎥" },
  { key: "meet", label: "Google Meet", emoji: "📹" },
  { key: "teams", label: "Teams", emoji: "💼" },
  { key: "webex", label: "Webex", emoji: "🌐" },
];

const RESOLUTIONS: Resolution[] = ["360p", "720p", "1080p", "4K"];
const CODECS: { key: Codec; label: string }[] = [
  { key: "h264", label: "H.264（標準）" },
  { key: "h265", label: "H.265（高効率）" },
  { key: "vp9", label: "VP9（Google Meet等）" },
];

const STORAGE_PLANS = [
  { name: "Google Drive 無料", gb: 15 },
  { name: "Zoom 無料", gb: 1 },
  { name: "OneDrive 100GB", gb: 100 },
  { name: "Google One 100GB", gb: 100 },
  { name: "Google One 2TB", gb: 2048 },
];

export default function ZoomStorageEstimate() {
  const [platform, setPlatform] = useState<Platform>("zoom");
  const [resolution, setResolution] = useState<Resolution>("720p");
  const [durationHour, setDurationHour] = useState("1");
  const [durationMin, setDurationMin] = useState("0");
  const [participants, setParticipants] = useState("10");
  const [codec, setCodec] = useState<Codec>("h264");
  const [includeAudio, setIncludeAudio] = useState(true);
  const [meetingsPerMonth, setMeetingsPerMonth] = useState("20");

  const totalMinutes = (parseInt(durationHour, 10) || 0) * 60 + (parseInt(durationMin, 10) || 0);
  const participantCount = Math.max(1, parseInt(participants, 10) || 1);

  const result = totalMinutes > 0
    ? estimateSize({ resolution, durationMin: totalMinutes, participants: participantCount, codec, platform, includeAudio })
    : null;

  const monthlyMB = result && parseInt(meetingsPerMonth, 10) > 0
    ? result.totalMB * parseInt(meetingsPerMonth, 10)
    : null;

  const platformInfo = PLATFORM_MODIFIER[platform];

  return (
    <div className="space-y-6">
      {/* プラットフォーム選択 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">会議ツール</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setPlatform(p.key);
                setResolution(PLATFORM_MODIFIER[p.key].defaultResolution);
                setCodec(p.key === "meet" ? "vp9" : "h264");
              }}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                platform === p.key
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="text-xl mb-1">{p.emoji}</div>
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">{platformInfo.note}</p>
      </div>

      {/* パラメータ入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">録画パラメータ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 解像度 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">解像度</label>
            <div className="flex gap-2 flex-wrap">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                    resolution === r
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* コーデック */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">コーデック</label>
            <select
              value={codec}
              onChange={(e) => setCodec(e.target.value as Codec)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CODECS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* 録画時間 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">録画時間</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={durationHour}
                onChange={(e) => setDurationHour(e.target.value)}
                min={0}
                max={24}
                className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">時間</span>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                min={0}
                max={59}
                className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">分</span>
            </div>
          </div>

          {/* 参加者数 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">参加者数（人）</label>
            <input
              type="number"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              min={1}
              max={500}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 音声 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="audio"
              checked={includeAudio}
              onChange={(e) => setIncludeAudio(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="audio" className="text-sm text-gray-700">音声を含む</label>
          </div>

          {/* 月あたり会議数 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">月あたり録画回数</label>
            <input
              type="number"
              value={meetingsPerMonth}
              onChange={(e) => setMeetingsPerMonth(e.target.value)}
              min={1}
              max={500}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 結果 */}
      {result && (
        <>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <h2 className="text-base font-semibold opacity-80 mb-2">1録画あたりの容量</h2>
            <div className="text-5xl font-bold mb-1">{fmtSize(result.totalMB)}</div>
            <div className="text-sm opacity-70">{result.totalMbps.toFixed(2)} Mbps 平均ビットレート</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">容量内訳</h2>
            <div className="space-y-3">
              {[
                { label: "メイン映像", mb: result.mainStreamMB, color: "bg-blue-500" },
                { label: "参加者映像（ギャラリー）", mb: result.participantMB, color: "bg-indigo-400" },
                { label: "音声", mb: result.audioMB, color: "bg-teal-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-800">{fmtSize(item.mb)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${Math.min(100, (item.mb / result.totalMB) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {monthlyMB && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                月間容量予測（{meetingsPerMonth}回/月）
              </h2>
              <div className="text-3xl font-bold text-gray-900 mb-4">{fmtSize(monthlyMB)}</div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">主要ストレージプランとの比較</p>
                {STORAGE_PLANS.map((plan) => {
                  const pct = Math.min(100, (monthlyMB / 1024 / plan.gb) * 100);
                  const usedGB = monthlyMB / 1024;
                  const exceeded = usedGB > plan.gb;
                  return (
                    <div key={plan.name}>
                      <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                        <span>{plan.name}（{plan.gb >= 1024 ? `${plan.gb / 1024}TB` : `${plan.gb}GB`}）</span>
                        <span className={exceeded ? "text-red-600 font-semibold" : "text-gray-600"}>
                          {exceeded ? `超過 +${fmtSize((usedGB - plan.gb) * 1024)}` : `${pct.toFixed(1)}%使用`}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${exceeded ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この会議録画容量予測ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">解像度・録画時間・参加者数・コーデックから録画ファイルのサイズを予測。Zoom・Meet・Teams別の目安も表示。。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この会議録画容量予測ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "解像度・録画時間・参加者数・コーデックから録画ファイルのサイズを予測。Zoom・Meet・Teams別の目安も表示。。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="text-xs text-gray-400 text-center">
        ※ 推定値です。実際のファイルサイズは画面の動き・ネットワーク品質・プラットフォームの設定により変動します。
      </div>
    </div>
  );
}
