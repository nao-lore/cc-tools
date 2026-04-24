"use client";

import { useState, useRef, useCallback } from "react";

// --- Types ---

type Mode = "bpm" | "ms";

interface NoteRow {
  label: string;
  labelEn: string;
  multiplier: number; // relative to quarter note
}

// --- Constants ---

const NOTE_ROWS: NoteRow[] = [
  { label: "全音符", labelEn: "Whole", multiplier: 4 },
  { label: "2分音符", labelEn: "Half", multiplier: 2 },
  { label: "4分音符", labelEn: "Quarter", multiplier: 1 },
  { label: "8分音符", labelEn: "8th", multiplier: 0.5 },
  { label: "16分音符", labelEn: "16th", multiplier: 0.25 },
  { label: "32分音符", labelEn: "32nd", multiplier: 0.125 },
];

// --- Helpers ---

function quarterMs(bpm: number): number {
  return 60000 / bpm;
}

function noteMs(bpm: number, multiplier: number): number {
  return quarterMs(bpm) * multiplier;
}

function bpmFromMs(ms: number, multiplier: number): number {
  // quarter_ms = ms / multiplier → bpm = 60000 / quarter_ms
  return (60000 * multiplier) / ms;
}

function fmt(ms: number): string {
  return ms.toFixed(1);
}

function fmtBpm(bpm: number): string {
  return bpm.toFixed(2);
}

// --- Sub-components ---

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-0.5 rounded border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
      title="コピー"
    >
      {copied ? "✓" : "コピー"}
    </button>
  );
}

// --- Main Component ---

export default function BpmDelay() {
  const [mode, setMode] = useState<Mode>("bpm");

  // BPM mode
  const [bpmInput, setBpmInput] = useState("120");

  // ms→BPM mode
  const [msInput, setMsInput] = useState("500");
  const [msNoteIdx, setMsNoteIdx] = useState(2); // default: quarter note

  // Tap tempo
  const tapTimesRef = useRef<number[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [tapBpm, setTapBpm] = useState<number | null>(null);

  const bpm = parseFloat(bpmInput);
  const validBpm = !isNaN(bpm) && bpm >= 20 && bpm <= 300;

  const msVal = parseFloat(msInput);
  const validMs = !isNaN(msVal) && msVal > 0;

  // --- Tap Tempo ---
  const handleTap = useCallback(() => {
    const now = performance.now();
    const times = tapTimesRef.current;

    // Reset if last tap was more than 3 seconds ago
    if (times.length > 0 && now - times[times.length - 1] > 3000) {
      tapTimesRef.current = [];
    }

    tapTimesRef.current.push(now);
    const updated = tapTimesRef.current;
    setTapCount(updated.length);

    if (updated.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < updated.length; i++) {
        intervals.push(updated[i] - updated[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const computed = 60000 / avg;
      setTapBpm(Math.min(300, Math.max(20, computed)));
    }
  }, []);

  const applyTapBpm = useCallback(() => {
    if (tapBpm !== null) {
      setBpmInput(fmtBpm(tapBpm));
      setMode("bpm");
      tapTimesRef.current = [];
      setTapCount(0);
      setTapBpm(null);
    }
  }, [tapBpm]);

  const resetTap = useCallback(() => {
    tapTimesRef.current = [];
    setTapCount(0);
    setTapBpm(null);
  }, []);

  // --- Render table for BPM mode ---
  const renderBpmTable = () => {
    if (!validBpm) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted font-medium">音符</th>
              <th className="text-right py-2 px-3 text-muted font-medium">通常 (ms)</th>
              <th className="text-right py-2 px-3 text-muted font-medium">付点 (ms)</th>
              <th className="text-right py-2 px-3 text-muted font-medium">3連符 (ms)</th>
            </tr>
          </thead>
          <tbody>
            {NOTE_ROWS.map((row, i) => {
              const normal = noteMs(bpm, row.multiplier);
              const dotted = normal * 1.5;
              const triplet = normal * (2 / 3);
              return (
                <tr
                  key={row.label}
                  className={`border-b border-border ${i % 2 === 0 ? "bg-surface" : ""}`}
                >
                  <td className="py-2 px-3 font-medium text-foreground">
                    <span>{row.label}</span>
                    <span className="text-muted text-xs ml-1.5">({row.labelEn})</span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="tabular-nums font-mono text-foreground">{fmt(normal)}</span>
                    <span className="ml-2">
                      <CopyButton value={fmt(normal)} />
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="tabular-nums font-mono text-foreground">{fmt(dotted)}</span>
                    <span className="ml-2">
                      <CopyButton value={fmt(dotted)} />
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="tabular-nums font-mono text-foreground">{fmt(triplet)}</span>
                    <span className="ml-2">
                      <CopyButton value={fmt(triplet)} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // --- Render ms→BPM results ---
  const renderMsResults = () => {
    if (!validMs) return null;
    const multiplier = NOTE_ROWS[msNoteIdx].multiplier;
    const computed = bpmFromMs(msVal, multiplier);
    const clampedBpm = Math.min(300, Math.max(20, computed));

    return (
      <div className="space-y-4">
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-muted">算出BPM</p>
            <p className="text-3xl font-bold tabular-nums text-foreground mt-0.5">
              {fmtBpm(clampedBpm)}
            </p>
            {(computed < 20 || computed > 300) && (
              <p className="text-xs text-orange-500 mt-1">
                範囲外 ({fmtBpm(computed)}) — 20〜300 BPMにクランプ済み
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <CopyButton value={fmtBpm(clampedBpm)} />
            <button
              onClick={() => {
                setBpmInput(fmtBpm(clampedBpm));
                setMode("bpm");
              }}
              className="text-xs px-3 py-1 rounded border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
            >
              BPMモードで表示
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted font-medium">音符</th>
                <th className="text-right py-2 px-3 text-muted font-medium">算出BPM</th>
              </tr>
            </thead>
            <tbody>
              {NOTE_ROWS.map((row, i) => {
                const b = bpmFromMs(msVal, row.multiplier);
                const outOfRange = b < 20 || b > 300;
                return (
                  <tr
                    key={row.label}
                    className={`border-b border-border ${i % 2 === 0 ? "bg-surface" : ""} ${i === msNoteIdx ? "ring-1 ring-inset ring-accent/40" : ""}`}
                  >
                    <td className="py-2 px-3 font-medium text-foreground">
                      {row.label}
                      <span className="text-muted text-xs ml-1.5">({row.labelEn})</span>
                    </td>
                    <td className={`py-2 px-3 text-right tabular-nums font-mono ${outOfRange ? "text-muted" : "text-foreground"}`}>
                      {outOfRange ? "—" : fmtBpm(b)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {(["bpm", "ms"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === m
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {m === "bpm" ? "BPM → ディレイタイム" : "ms → BPM"}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {mode === "bpm" ? (
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted font-medium">BPM</label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  step={1}
                  value={bpmInput}
                  onChange={(e) => setBpmInput(e.target.value)}
                  className="w-28 px-3 py-2 text-center text-lg font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <input
                type="range"
                min={20}
                max={300}
                step={1}
                value={validBpm ? Math.round(bpm) : 120}
                onChange={(e) => setBpmInput(e.target.value)}
                className="flex-1 min-w-[120px] accent-[var(--color-accent,#6366f1)]"
              />
              {validBpm && (
                <span className="text-xs text-muted tabular-nums">
                  4分音符 = {fmt(quarterMs(bpm))} ms
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted font-medium">ディレイタイム (ms)</label>
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  value={msInput}
                  onChange={(e) => setMsInput(e.target.value)}
                  className="w-36 px-3 py-2 text-lg font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted font-medium">音符の種類</label>
                <select
                  value={msNoteIdx}
                  onChange={(e) => setMsNoteIdx(Number(e.target.value))}
                  className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent"
                >
                  {NOTE_ROWS.map((row, i) => (
                    <option key={row.label} value={i}>
                      {row.label} ({row.labelEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        {mode === "bpm" ? (
          validBpm ? (
            renderBpmTable()
          ) : (
            <p className="text-sm text-muted text-center py-6">
              BPMを 20〜300 の範囲で入力してください
            </p>
          )
        ) : validMs ? (
          renderMsResults()
        ) : (
          <p className="text-sm text-muted text-center py-6">
            ディレイタイム (ms) を入力してください
          </p>
        )}
      </div>

      {/* Tap Tempo */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">タップテンポ</h3>
          {tapCount > 0 && (
            <button
              onClick={resetTap}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              リセット
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTap}
            className="px-8 py-4 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/80 active:scale-95 transition-all select-none"
          >
            タップ
          </button>

          <div className="flex flex-col gap-0.5">
            {tapCount < 2 ? (
              <p className="text-sm text-muted">
                {tapCount === 0 ? "4回以上タップしてBPMを検出" : "続けてタップしてください…"}
              </p>
            ) : (
              <>
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {tapBpm !== null ? fmtBpm(tapBpm) : "—"} BPM
                </p>
                <p className="text-xs text-muted">{tapCount} タップから算出</p>
              </>
            )}
          </div>

          {tapBpm !== null && tapCount >= 2 && (
            <button
              onClick={applyTapBpm}
              className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
            >
              このBPMで計算
            </button>
          )}
        </div>
      </div>

      {/* Formula reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">計算式</h3>
        <div className="space-y-1.5 text-xs text-muted font-mono">
          <p>4分音符 (ms) = 60,000 ÷ BPM</p>
          <p>全音符 = 4分音符 × 4</p>
          <p>2分音符 = 4分音符 × 2</p>
          <p>8分音符 = 4分音符 × 0.5</p>
          <p>16分音符 = 4分音符 × 0.25</p>
          <p>32分音符 = 4分音符 × 0.125</p>
          <p className="mt-2">付点 = 通常 × 1.5</p>
          <p>3連符 = 通常 × 2/3</p>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このBPM ↔ ディレイタイム(ms)ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">BPMから1/4音符、1/8音符、1/16音符のディレイタイムを算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このBPM ↔ ディレイタイム(ms)ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "BPMから1/4音符、1/8音符、1/16音符のディレイタイムを算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "BPM ↔ ディレイタイム(ms)",
  "description": "BPMから1/4音符、1/8音符、1/16音符のディレイタイムを算出",
  "url": "https://tools.loresync.dev/bpm-delay",
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
