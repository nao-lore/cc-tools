"use client";

import { useState, useCallback } from "react";

// EV = log2(f^2 / t) - log2(ISO / 100)
// Rearrange to solve for each parameter:
//   f = sqrt(2^(EV + log2(ISO/100)) * t)
//   t = f^2 / (2^(EV + log2(ISO/100)))
//   ISO = 100 * 2^(log2(f^2/t) - EV)

type LockedParam = "iso" | "fstop" | "shutter";

const ISO_VALUES = [100, 200, 400, 800, 1600, 3200, 6400];
const FSTOP_VALUES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
const SHUTTER_VALUES = [
  1 / 4000, 1 / 2000, 1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60,
  1 / 30, 1 / 15, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 15, 30,
];

function shutterLabel(t: number): string {
  if (t >= 1) return `${t}s`;
  const denom = Math.round(1 / t);
  return `1/${denom}`;
}

function calcEV(iso: number, fstop: number, shutter: number): number {
  return Math.log2((fstop * fstop) / shutter) - Math.log2(iso / 100);
}

function clamp<T>(arr: T[], idx: number): T {
  return arr[Math.max(0, Math.min(arr.length - 1, idx))];
}

function nearestIndex<T extends number>(arr: T[], val: number): number {
  let best = 0;
  let bestDist = Math.abs(arr[0] - val);
  for (let i = 1; i < arr.length; i++) {
    const d = Math.abs(arr[i] - val);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

// Solve for the free parameter given EV and the other two
function solveISO(ev: number, fstop: number, shutter: number): number {
  return 100 * Math.pow(2, Math.log2((fstop * fstop) / shutter) - ev);
}
function solveFStop(ev: number, iso: number, shutter: number): number {
  return Math.sqrt(Math.pow(2, ev + Math.log2(iso / 100)) * shutter);
}
function solveShutter(ev: number, iso: number, fstop: number): number {
  return (fstop * fstop) / Math.pow(2, ev + Math.log2(iso / 100));
}

interface Preset {
  label: string;
  iso: number;
  fstop: number;
  shutter: number;
}

const PRESETS: Preset[] = [
  { label: "風景", iso: 100, fstop: 8, shutter: 1 / 125 },
  { label: "ポートレート", iso: 400, fstop: 2, shutter: 1 / 250 },
  { label: "スポーツ", iso: 1600, fstop: 5.6, shutter: 1 / 1000 },
];

function evToBrightnessLabel(ev: number): { label: string; color: string } {
  if (ev < 4) return { label: "暗すぎ (アンダー露出)", color: "text-blue-600" };
  if (ev < 8) return { label: "やや暗い", color: "text-blue-400" };
  if (ev < 13) return { label: "適正露出", color: "text-green-600" };
  if (ev < 16) return { label: "やや明るい", color: "text-yellow-600" };
  return { label: "明るすぎ (オーバー露出)", color: "text-red-600" };
}

// Triangle SVG vertices (equilateral, centered)
const CX = 150;
const CY = 140;
const R = 110;
const VERTICES = [
  { x: CX, y: CY - R },                                   // top: ISO
  { x: CX - R * Math.sin(Math.PI / 3), y: CY + R / 2 },  // bottom-left: F値
  { x: CX + R * Math.sin(Math.PI / 3), y: CY + R / 2 },  // bottom-right: SS
];

interface TriangleDiagramProps {
  iso: number;
  isoIdx: number;
  fstopIdx: number;
  shutterIdx: number;
  locked: LockedParam;
}

function TriangleDiagram({ iso, isoIdx, fstopIdx, shutterIdx, locked }: TriangleDiagramProps) {
  const isoNorm = isoIdx / (ISO_VALUES.length - 1);
  const fNorm = fstopIdx / (FSTOP_VALUES.length - 1);
  const sNorm = shutterIdx / (SHUTTER_VALUES.length - 1);

  // Inner triangle proportional to values
  const scale = (n: number) => 0.25 + n * 0.65;
  const innerPts = VERTICES.map((v, i) => {
    const norms = [isoNorm, fNorm, sNorm];
    const s = scale(norms[i]);
    return { x: CX + (v.x - CX) * s, y: CY + (v.y - CY) * s };
  });

  const outerPath = VERTICES.map((v, i) => `${i === 0 ? "M" : "L"}${v.x},${v.y}`).join(" ") + " Z";
  const innerPath = innerPts.map((v, i) => `${i === 0 ? "M" : "L"}${v.x},${v.y}`).join(" ") + " Z";

  const labels = [
    { v: VERTICES[0], label: "ISO", value: String(iso), isLocked: locked === "iso", offset: { x: 0, y: -18 } },
    { v: VERTICES[1], label: "F値", value: `f/${FSTOP_VALUES[fstopIdx]}`, isLocked: locked === "fstop", offset: { x: -22, y: 20 } },
    { v: VERTICES[2], label: "SS", value: shutterLabel(SHUTTER_VALUES[shutterIdx]), isLocked: locked === "shutter", offset: { x: 22, y: 20 } },
  ];

  return (
    <svg viewBox="0 0 300 280" className="w-full max-w-xs mx-auto">
      {/* Outer triangle */}
      <path d={outerPath} fill="#f0f9ff" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Inner filled triangle */}
      <path d={innerPath} fill="#3b82f6" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Inner vertices dots */}
      {innerPts.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#3b82f6" />
      ))}
      {/* Labels */}
      {labels.map(({ v, label, value, isLocked, offset }) => (
        <g key={label}>
          <circle
            cx={v.x}
            cy={v.y}
            r="22"
            fill={isLocked ? "#1d4ed8" : "#e2e8f0"}
            stroke={isLocked ? "#1e40af" : "#94a3b8"}
            strokeWidth="1.5"
          />
          <text
            x={v.x}
            y={v.y - 4}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={isLocked ? "#fff" : "#334155"}
          >
            {label}
          </text>
          <text
            x={v.x}
            y={v.y + 8}
            textAnchor="middle"
            fontSize="8"
            fill={isLocked ? "#bfdbfe" : "#64748b"}
          >
            {isLocked ? "🔒" : ""}
          </text>
          <text
            x={v.x + offset.x}
            y={v.y + offset.y + (offset.y > 0 ? 12 : 0)}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="#1e293b"
          >
            {value}
          </text>
        </g>
      ))}
      {/* Center EV label */}
      <text x={CX} y={CY + 5} textAnchor="middle" fontSize="10" fill="#64748b">EV</text>
    </svg>
  );
}

export default function ExposureTriangle() {
  const [isoIdx, setIsoIdx] = useState(0);        // ISO 100
  const [fstopIdx, setFstopIdx] = useState(3);    // f/4
  const [shutterIdx, setShutterIdx] = useState(6); // 1/60
  const [locked, setLocked] = useState<LockedParam>("iso");

  const iso = ISO_VALUES[isoIdx];
  const fstop = FSTOP_VALUES[fstopIdx];
  const shutter = SHUTTER_VALUES[shutterIdx];
  const ev = calcEV(iso, fstop, shutter);
  const brightness = evToBrightnessLabel(ev);

  const handleIsoChange = useCallback((newIdx: number) => {
    setIsoIdx(newIdx);
    if (locked === "iso") return;
    const newIso = ISO_VALUES[newIdx];
    const currentEv = calcEV(iso, fstop, shutter);
    if (locked === "fstop") {
      // recalc shutter
      const newT = solveShutter(currentEv, newIso, fstop);
      setShutterIdx(nearestIndex(SHUTTER_VALUES, newT));
    } else {
      // locked === shutter, recalc fstop
      const newF = solveFStop(currentEv, newIso, shutter);
      setFstopIdx(nearestIndex(FSTOP_VALUES, newF));
    }
  }, [iso, fstop, shutter, locked]);

  const handleFstopChange = useCallback((newIdx: number) => {
    setFstopIdx(newIdx);
    if (locked === "fstop") return;
    const newF = FSTOP_VALUES[newIdx];
    const currentEv = calcEV(iso, fstop, shutter);
    if (locked === "iso") {
      // recalc shutter
      const newT = solveShutter(currentEv, iso, newF);
      setShutterIdx(nearestIndex(SHUTTER_VALUES, newT));
    } else {
      // locked === shutter, recalc iso
      const newISO = solveISO(currentEv, newF, shutter);
      setIsoIdx(nearestIndex(ISO_VALUES, newISO));
    }
  }, [iso, fstop, shutter, locked]);

  const handleShutterChange = useCallback((newIdx: number) => {
    setShutterIdx(newIdx);
    if (locked === "shutter") return;
    const newT = SHUTTER_VALUES[newIdx];
    const currentEv = calcEV(iso, fstop, shutter);
    if (locked === "iso") {
      // recalc fstop
      const newF = solveFStop(currentEv, iso, newT);
      setFstopIdx(nearestIndex(FSTOP_VALUES, newF));
    } else {
      // locked === fstop, recalc iso
      const newISO = solveISO(currentEv, fstop, newT);
      setIsoIdx(nearestIndex(ISO_VALUES, newISO));
    }
  }, [iso, fstop, shutter, locked]);

  const applyPreset = (preset: Preset) => {
    setIsoIdx(nearestIndex(ISO_VALUES, preset.iso));
    setFstopIdx(nearestIndex(FSTOP_VALUES, preset.fstop));
    setShutterIdx(nearestIndex(SHUTTER_VALUES, preset.shutter));
  };

  // Brightness bar: EV 0-20 range
  const evClamped = Math.max(0, Math.min(20, ev));
  const barPct = (evClamped / 20) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">露出三角形 計算ツール</h1>
        <p className="text-sm text-gray-500">ISO・F値・シャッタースピードの相互関係を視覚化</p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 justify-center flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-4 py-1.5 rounded-full border border-blue-300 text-blue-700 text-sm hover:bg-blue-50 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Triangle diagram */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <TriangleDiagram
          iso={iso}
          isoIdx={isoIdx}
          fstopIdx={fstopIdx}
          shutterIdx={shutterIdx}
          locked={locked}
        />
      </div>

      {/* EV + Brightness */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">露出値 (EV)</span>
          <span className="text-2xl font-bold text-gray-900">{ev.toFixed(1)}</span>
        </div>
        <div className="relative h-3 rounded-full bg-gradient-to-r from-blue-900 via-green-400 to-yellow-200 overflow-hidden">
          <div
            className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-gray-700 shadow"
            style={{ left: `calc(${barPct}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>暗 (EV 0)</span>
          <span>明 (EV 20)</span>
        </div>
        <p className={`text-center font-semibold text-sm ${brightness.color}`}>
          {brightness.label}
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        {/* ISO */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800">ISO</span>
              <span className="ml-2 text-xs text-gray-500">感度</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-700">{iso}</span>
              <button
                onClick={() => setLocked("iso")}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  locked === "iso"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-500 hover:border-blue-400"
                }`}
              >
                {locked === "iso" ? "🔒 固定中" : "固定する"}
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={ISO_VALUES.length - 1}
            value={isoIdx}
            onChange={(e) => handleIsoChange(Number(e.target.value))}
            disabled={locked === "iso"}
            className="w-full accent-blue-600 disabled:opacity-40"
          />
          <div className="flex justify-between text-xs text-gray-400">
            {ISO_VALUES.map((v) => <span key={v}>{v}</span>)}
          </div>
          <p className="text-xs text-gray-400">
            ISO高い → 明るく撮れるが粒子感（ノイズ）増加
          </p>
        </div>

        {/* F-stop */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800">F値（絞り）</span>
              <span className="ml-2 text-xs text-gray-500">Aperture</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-700">f/{fstop}</span>
              <button
                onClick={() => setLocked("fstop")}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  locked === "fstop"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-500 hover:border-blue-400"
                }`}
              >
                {locked === "fstop" ? "🔒 固定中" : "固定する"}
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={FSTOP_VALUES.length - 1}
            value={fstopIdx}
            onChange={(e) => handleFstopChange(Number(e.target.value))}
            disabled={locked === "fstop"}
            className="w-full accent-blue-600 disabled:opacity-40"
          />
          <div className="flex justify-between text-xs text-gray-400">
            {FSTOP_VALUES.map((v) => <span key={v}>f/{v}</span>)}
          </div>
          <p className="text-xs text-gray-400">
            F値小さい → 明るく・背景ぼけ大。F値大きい → 暗く・全体ピント
          </p>
        </div>

        {/* Shutter speed */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800">シャッタースピード</span>
              <span className="ml-2 text-xs text-gray-500">Shutter Speed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-700">{shutterLabel(shutter)}</span>
              <button
                onClick={() => setLocked("shutter")}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  locked === "shutter"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-500 hover:border-blue-400"
                }`}
              >
                {locked === "shutter" ? "🔒 固定中" : "固定する"}
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={SHUTTER_VALUES.length - 1}
            value={shutterIdx}
            onChange={(e) => handleShutterChange(Number(e.target.value))}
            disabled={locked === "shutter"}
            className="w-full accent-blue-600 disabled:opacity-40"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1/4000</span>
            <span>1/60</span>
            <span>1s</span>
            <span>30s</span>
          </div>
          <p className="text-xs text-gray-400">
            速い → 動きを止める・暗め。遅い → 光を多く取り込む・ブレやすい
          </p>
        </div>
      </div>

      {/* Summary table */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <h2 className="text-sm font-semibold text-blue-800 mb-3">現在の設定まとめ</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-xl p-3 border border-blue-100">
            <div className="text-xs text-gray-500 mb-1">ISO</div>
            <div className="text-lg font-bold text-gray-900">{iso}</div>
            {locked === "iso" && <div className="text-xs text-blue-600 mt-0.5">🔒 固定</div>}
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100">
            <div className="text-xs text-gray-500 mb-1">F値</div>
            <div className="text-lg font-bold text-gray-900">f/{fstop}</div>
            {locked === "fstop" && <div className="text-xs text-blue-600 mt-0.5">🔒 固定</div>}
          </div>
          <div className="bg-white rounded-xl p-3 border border-blue-100">
            <div className="text-xs text-gray-500 mb-1">SS</div>
            <div className="text-lg font-bold text-gray-900">{shutterLabel(shutter)}</div>
            {locked === "shutter" && <div className="text-xs text-blue-600 mt-0.5">🔒 固定</div>}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          1つを固定してスライダーを動かすと、EV値を維持しながら残り1つが自動計算されます
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この露出三角形（ISO/F値/SS）計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">3要素を動かした時の相互影響を視覚化、初心者教育向け。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この露出三角形（ISO/F値/SS）計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "3要素を動かした時の相互影響を視覚化、初心者教育向け。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
