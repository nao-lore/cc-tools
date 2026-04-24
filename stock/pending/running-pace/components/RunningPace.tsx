"use client";

import { useState, useMemo } from "react";

type Mode = "pace" | "time";

const DISTANCE_PRESETS = [
  { label: "5km", value: 5 },
  { label: "10km", value: 10 },
  { label: "ハーフ", value: 21.0975 },
  { label: "フル", value: 42.195 },
];

const PACE_ZONES = [
  { label: "ジョグ", range: "7:00以上", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "LSD", range: "6:00〜7:00", color: "text-green-500", bg: "bg-green-50", border: "border-green-200" },
  { label: "テンポ走", range: "5:00〜6:00", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
  { label: "インターバル", range: "4:00〜5:00", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "レースペース", range: "4:00未満", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
];

function parseHMS(h: string, m: string, s: string): number | null {
  const hh = parseInt(h || "0", 10);
  const mm = parseInt(m || "0", 10);
  const ss = parseInt(s || "0", 10);
  if (isNaN(hh) || isNaN(mm) || isNaN(ss)) return null;
  if (mm >= 60 || ss >= 60) return null;
  const total = hh * 3600 + mm * 60 + ss;
  return total > 0 ? total : null;
}

function parsePaceMS(m: string, s: string): number | null {
  const mm = parseInt(m || "0", 10);
  const ss = parseInt(s || "0", 10);
  if (isNaN(mm) || isNaN(ss)) return null;
  if (ss >= 60) return null;
  const total = mm * 60 + ss;
  return total > 0 ? total : null;
}

function formatPace(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}分${String(s).padStart(2, "0")}秒/km`;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}時間${String(m).padStart(2, "0")}分${String(s).padStart(2, "0")}秒`;
  }
  return `${m}分${String(s).padStart(2, "0")}秒`;
}

function getPaceZone(paceSeconds: number): (typeof PACE_ZONES)[number] {
  if (paceSeconds >= 7 * 60) return PACE_ZONES[0];
  if (paceSeconds >= 6 * 60) return PACE_ZONES[1];
  if (paceSeconds >= 5 * 60) return PACE_ZONES[2];
  if (paceSeconds >= 4 * 60) return PACE_ZONES[3];
  return PACE_ZONES[4];
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

export default function RunningPace() {
  const [mode, setMode] = useState<Mode>("pace");
  const [distanceInput, setDistanceInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  // Mode 1: distance + time → pace
  const [timeH, setTimeH] = useState("");
  const [timeM, setTimeM] = useState("");
  const [timeS, setTimeS] = useState("");

  // Mode 2: distance + pace → time
  const [paceM, setPaceM] = useState("");
  const [paceS, setPaceS] = useState("");

  const [splitInterval, setSplitInterval] = useState<1 | 5>(1);

  const distance = useMemo(() => {
    if (selectedPreset !== null) return selectedPreset;
    const v = parseFloat(distanceInput);
    return isNaN(v) || v <= 0 ? null : v;
  }, [distanceInput, selectedPreset]);

  const result = useMemo(() => {
    if (!distance) return null;

    if (mode === "pace") {
      const totalSec = parseHMS(timeH, timeM, timeS);
      if (!totalSec) return null;
      const paceSec = totalSec / distance;
      return { paceSeconds: paceSec, totalSeconds: totalSec };
    } else {
      const paceSec = parsePaceMS(paceM, paceS);
      if (!paceSec) return null;
      const totalSec = paceSec * distance;
      return { paceSeconds: paceSec, totalSeconds: totalSec };
    }
  }, [mode, distance, timeH, timeM, timeS, paceM, paceS]);

  const splits = useMemo(() => {
    if (!result || !distance) return [];
    const rows: { km: number; splitTime: string; elapsed: string }[] = [];
    const interval = splitInterval;
    const count = Math.floor(distance / interval);
    for (let i = 1; i <= count; i++) {
      const kmMark = i * interval;
      const elapsed = result.paceSeconds * kmMark;
      const splitSec = result.paceSeconds * interval;
      rows.push({
        km: kmMark,
        splitTime: formatTime(splitSec),
        elapsed: formatTime(elapsed),
      });
    }
    // Remaining partial km
    const remainder = distance - count * interval;
    if (remainder > 0.01) {
      const elapsed = result.paceSeconds * distance;
      const splitSec = result.paceSeconds * remainder;
      rows.push({
        km: distance,
        splitTime: formatTime(splitSec),
        elapsed: formatTime(elapsed),
      });
    }
    return rows;
  }, [result, distance, splitInterval]);

  const zone = result ? getPaceZone(result.paceSeconds) : null;

  const handlePreset = (val: number) => {
    if (selectedPreset === val) {
      setSelectedPreset(null);
    } else {
      setSelectedPreset(val);
      setDistanceInput("");
    }
  };

  const handleDistanceInput = (v: string) => {
    setDistanceInput(v.replace(/[^0-9.]/g, ""));
    setSelectedPreset(null);
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">計算モード</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("pace")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              mode === "pace"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted hover:border-primary/50"
            }`}
          >
            距離＋タイム → ペース
          </button>
          <button
            onClick={() => setMode("time")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              mode === "time"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted hover:border-primary/50"
            }`}
          >
            距離＋ペース → タイム
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        {/* Distance */}
        <div>
          <label className="block text-xs text-muted mb-2">距離</label>
          <div className="flex gap-2 mb-2">
            {DISTANCE_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                  selectedPreset === p.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              placeholder="カスタム距離"
              value={distanceInput}
              onChange={(e) => handleDistanceInput(e.target.value)}
              className={`${inputClass} pr-10 text-right`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">km</span>
          </div>
        </div>

        {/* Time input (mode 1) */}
        {mode === "pace" && (
          <div>
            <label className="block text-xs text-muted mb-2">目標タイム</label>
            <div className="flex items-center gap-1">
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  maxLength={2}
                  value={timeH}
                  onChange={(e) => setTimeH(e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass}
                />
                <p className="text-center text-xs text-muted mt-1">時間</p>
              </div>
              <span className="text-xl text-muted pb-4">:</span>
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00"
                  maxLength={2}
                  value={timeM}
                  onChange={(e) => setTimeM(e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass}
                />
                <p className="text-center text-xs text-muted mt-1">分</p>
              </div>
              <span className="text-xl text-muted pb-4">:</span>
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00"
                  maxLength={2}
                  value={timeS}
                  onChange={(e) => setTimeS(e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass}
                />
                <p className="text-center text-xs text-muted mt-1">秒</p>
              </div>
            </div>
          </div>
        )}

        {/* Pace input (mode 2) */}
        {mode === "time" && (
          <div>
            <label className="block text-xs text-muted mb-2">目標ペース（/km）</label>
            <div className="flex items-center gap-1">
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="5"
                  maxLength={2}
                  value={paceM}
                  onChange={(e) => setPaceM(e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass}
                />
                <p className="text-center text-xs text-muted mt-1">分</p>
              </div>
              <span className="text-xl text-muted pb-4">:</span>
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00"
                  maxLength={2}
                  value={paceS}
                  onChange={(e) => setPaceS(e.target.value.replace(/[^0-9]/g, ""))}
                  className={inputClass}
                />
                <p className="text-center text-xs text-muted mt-1">秒</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {result && zone && (
        <div className={`bg-card border-2 ${zone.border} rounded-xl p-5 shadow-sm`}>
          <div className={`flex items-center justify-between mb-4 p-4 ${zone.bg} rounded-lg`}>
            <div>
              <p className="text-xs text-muted mb-1">
                {mode === "pace" ? "算出ペース" : "予想タイム"}
              </p>
              <p className={`text-2xl font-bold ${zone.color}`}>
                {mode === "pace"
                  ? formatPace(result.paceSeconds)
                  : formatTime(result.totalSeconds)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted mb-1">
                {mode === "pace" ? "予想タイム" : "ペース"}
              </p>
              <p className="text-base font-medium">
                {mode === "pace"
                  ? formatTime(result.totalSeconds)
                  : formatPace(result.paceSeconds)}
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${zone.bg} ${zone.color} border ${zone.border}`}>
            <span>{zone.label}</span>
            <span className="font-normal opacity-70">{zone.range}</span>
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-muted/30 border border-dashed border-border rounded-xl h-16 flex items-center justify-center">
        <span className="text-xs text-muted">Advertisement</span>
      </div>

      {/* Split table */}
      {result && splits.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">スプリット表</h3>
            <div className="flex gap-1">
              {([1, 5] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSplitInterval(v)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    splitInterval === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted hover:border-primary/50"
                  }`}
                >
                  {v}km毎
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted font-medium">地点</th>
                  <th className="text-right py-2 text-xs text-muted font-medium">区間タイム</th>
                  <th className="text-right py-2 text-xs text-muted font-medium">累計タイム</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {splits.map((row) => {
                  const isFinish = Math.abs(row.km - (distance ?? 0)) < 0.01;
                  return (
                    <tr
                      key={row.km}
                      className={isFinish ? "bg-primary/5 font-bold" : ""}
                    >
                      <td className="py-2 text-muted">
                        {isFinish && row.km !== Math.round(row.km)
                          ? `${row.km.toFixed(4)}km（ゴール）`
                          : `${row.km}km${isFinish ? "（ゴール）" : ""}`}
                      </td>
                      <td className="py-2 text-right font-mono">{row.splitTime}</td>
                      <td className="py-2 text-right font-mono">{row.elapsed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pace zone reference */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">ペースゾーン参考</h3>
        <div className="space-y-1.5">
          {PACE_ZONES.map((z) => {
            const isActive = zone?.label === z.label;
            return (
              <div
                key={z.label}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-all border ${
                  isActive ? `${z.bg} ${z.border} font-bold` : "border-transparent"
                }`}
              >
                <span className={z.color}>{z.label}</span>
                <span className="text-muted text-xs font-mono">{z.range}</span>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このランニングペース計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">目標タイム・距離からキロ何分ペース、スプリット表示。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このランニングペース計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "目標タイム・距離からキロ何分ペース、スプリット表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-3">
          ※ 目安のゾーン区分です。個人の体力・心拍数によって異なります。
        </p>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ランニングペース計算",
  "description": "目標タイム・距離からキロ何分ペース、スプリット表示",
  "url": "https://tools.loresync.dev/running-pace",
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
