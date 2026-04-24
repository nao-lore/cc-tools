"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SensorPreset {
  label: string;
  width: number;
  height: number;
  cropFactor: number;
}

// ─── Sensor presets ───────────────────────────────────────────────────────────

const SENSORS: SensorPreset[] = [
  { label: "フルサイズ (36×24mm)",          width: 36,   height: 24,   cropFactor: 1.0  },
  { label: "APS-C Canon (22.3×14.9mm)",     width: 22.3, height: 14.9, cropFactor: 36 / 22.3 },
  { label: "APS-C (23.5×15.6mm)",           width: 23.5, height: 15.6, cropFactor: 36 / 23.5 },
  { label: "マイクロフォーサーズ (17.3×13mm)", width: 17.3, height: 13,   cropFactor: 36 / 17.3 },
];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function toAngleDeg(sensorDim: number, focalMm: number): number {
  return (2 * Math.atan(sensorDim / (2 * focalMm)) * 180) / Math.PI;
}

function diagonal(w: number, h: number): number {
  return Math.sqrt(w * w + h * h);
}

// ─── FOV SVG diagram ─────────────────────────────────────────────────────────

function FovDiagram({ angleDeg }: { angleDeg: number }) {
  const halfAngle = (angleDeg / 2) * (Math.PI / 180);
  const cx = 100;
  const cy = 20;
  const len = 70;

  const lx = cx - len * Math.sin(halfAngle);
  const ly = cy + len * Math.cos(halfAngle);
  const rx = cx + len * Math.sin(halfAngle);
  const ry = ly;

  // Arc: small arc at camera tip showing the angle
  const arcR = 18;
  const ax1 = cx - arcR * Math.sin(halfAngle);
  const ay1 = cy + arcR * Math.cos(halfAngle);
  const ax2 = cx + arcR * Math.sin(halfAngle);
  const ay2 = ay1;
  const largeArc = angleDeg > 180 ? 1 : 0;

  return (
    <svg
      viewBox="0 0 200 100"
      className="w-full max-w-[320px] mx-auto"
      aria-label={`画角 ${angleDeg.toFixed(1)}° の FOV 図`}
    >
      {/* FOV wedge fill */}
      <polygon
        points={`${cx},${cy} ${lx},${ly} ${rx},${ry}`}
        className="fill-blue-100 dark:fill-blue-950"
      />
      {/* FOV wedge outline */}
      <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="currentColor" strokeWidth="1.5" className="text-blue-500" />
      <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="currentColor" strokeWidth="1.5" className="text-blue-500" />
      {/* Subject line */}
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" className="text-blue-400" />
      {/* Arc */}
      <path
        d={`M ${ax1} ${ay1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${ax2} ${ay2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-blue-500"
      />
      {/* Camera dot */}
      <circle cx={cx} cy={cy} r="3" className="fill-blue-600" />
      {/* Angle label */}
      <text
        x={cx}
        y={cy + arcR + 12}
        textAnchor="middle"
        fontSize="10"
        className="fill-blue-700 dark:fill-blue-300 font-medium"
      >
        {angleDeg.toFixed(1)}°
      </text>
    </svg>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--muted-fg)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FocalLengthAngle() {
  const [focal, setFocal] = useState<string>("50");
  const [sensorIdx, setSensorIdx] = useState<number>(0);

  const focalNum = parseFloat(focal);
  const valid = !isNaN(focalNum) && focalNum > 0;
  const sensor = SENSORS[sensorIdx];

  const results = useMemo(() => {
    if (!valid) return null;
    const hAngle = toAngleDeg(sensor.width, focalNum);
    const vAngle = toAngleDeg(sensor.height, focalNum);
    const dAngle = toAngleDeg(diagonal(sensor.width, sensor.height), focalNum);
    const equiv35 = focalNum * sensor.cropFactor;
    return { hAngle, vAngle, dAngle, equiv35 };
  }, [focalNum, sensor, valid]);

  return (
    <div className="space-y-6">

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            焦点距離 (mm)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={focal}
            onChange={(e) => setFocal(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            センサーサイズ
          </label>
          <select
            value={sensorIdx}
            onChange={(e) => setSensorIdx(Number(e.target.value))}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SENSORS.map((s, i) => (
              <option key={i} value={i}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick focal presets */}
      <div className="space-y-1.5">
        <span className="text-xs text-[var(--muted-fg)]">よく使う焦点距離</span>
        <div className="flex flex-wrap gap-2">
          {[14, 20, 24, 28, 35, 50, 85, 100, 135, 200, 300, 400].map((f) => (
            <button
              key={f}
              onClick={() => setFocal(String(f))}
              className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                focal === String(f)
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
              }`}
            >
              {f}mm
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* FOV diagram */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
            <p className="text-xs text-center text-[var(--muted-fg)] mb-3">水平画角 FOV イメージ</p>
            <FovDiagram angleDeg={results.hAngle} />
          </div>

          {/* Angle table */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-1">
            <ResultRow label="水平画角 (horizontal)" value={`${results.hAngle.toFixed(2)}°`} />
            <ResultRow label="垂直画角 (vertical)"   value={`${results.vAngle.toFixed(2)}°`} />
            <ResultRow label="対角画角 (diagonal)"   value={`${results.dAngle.toFixed(2)}°`} />
          </div>

          {/* 35mm equiv */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">35mm 換算焦点距離</p>
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-0.5">
                クロップファクター × {sensor.cropFactor.toFixed(2)}
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">
              {results.equiv35.toFixed(1)}<span className="text-base font-normal ml-0.5">mm</span>
            </span>
          </div>

          {/* Sensor info */}
          <p className="text-xs text-[var(--muted-fg)] text-center">
            センサー: {sensor.width}×{sensor.height}mm &nbsp;|&nbsp;
            対角線: {diagonal(sensor.width, sensor.height).toFixed(1)}mm
          </p>
        </div>
      )}

      {!valid && focal !== "" && (
        <p className="text-sm text-red-500">正の数値を入力してください</p>
      )}

      {/* Ad placeholder */}
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] h-24 flex items-center justify-center">
        <span className="text-xs text-[var(--muted-fg)]">Advertisement</span>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この焦点距離 ↔ 画角 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">センサーサイズ別の画角を計算、35mm換算も同時表示。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この焦点距離 ↔ 画角 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "センサーサイズ別の画角を計算、35mm換算も同時表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
