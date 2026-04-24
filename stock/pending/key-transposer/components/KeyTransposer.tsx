"use client";

import { useState, useCallback } from "react";

// --- Constants ---

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
type Note = typeof NOTES[number];

// Enharmonic display aliases (prefer sharps internally)
const FLAT_TO_SHARP: Record<string, Note> = {
  Db: "C#", Eb: "D#", Fb: "E", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B",
};

// Chord quality regex — captures root + optional quality suffix
// Root: note letter + optional accidental
// Quality: everything after root (m, maj7, 7, dim, aug, sus2, sus4, add9, etc.)
const CHORD_RE = /^([A-G][b#]?)(.*)/;

// --- Helpers ---

function noteIndex(note: Note): number {
  return NOTES.indexOf(note);
}

function normalizeRoot(raw: string): Note | null {
  // Uppercase first letter
  const normalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  if (FLAT_TO_SHARP[normalized] !== undefined) return FLAT_TO_SHARP[normalized];
  if ((NOTES as readonly string[]).includes(normalized)) return normalized as Note;
  return null;
}

function transposeNote(note: Note, semitones: number): Note {
  const idx = (noteIndex(note) + semitones + 120) % 12;
  return NOTES[idx];
}

function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) return chord;
  const m = chord.match(CHORD_RE);
  if (!m) return chord;
  const [, rawRoot, quality] = m;
  const root = normalizeRoot(rawRoot);
  if (!root) return chord;
  const transposed = transposeNote(root, semitones);
  return transposed + quality;
}

/**
 * Tokenize a line into chord tokens and non-chord tokens (spaces, punctuation, pipes).
 * We treat pipe-separated and space-separated progressions.
 */
function tokenizeLine(line: string): Array<{ type: "chord" | "sep"; value: string }> {
  // Split on whitespace and pipe, keeping separators
  const parts = line.split(/([\s|,\/]+)/);
  return parts.map((part) => {
    if (/^[\s|,\/]+$/.test(part)) return { type: "sep", value: part };
    const m = part.match(CHORD_RE);
    if (m && normalizeRoot(m[1])) return { type: "chord", value: part };
    return { type: "sep", value: part };
  });
}

function transposeProgression(input: string, semitones: number): string {
  if (semitones === 0) return input;
  return input
    .split("\n")
    .map((line) => {
      const tokens = tokenizeLine(line);
      return tokens
        .map((t) => (t.type === "chord" ? transposeChord(t.value, semitones) : t.value))
        .join("");
    })
    .join("\n");
}

// Capo: if you play chord X with capo at fret N, the sounding key is X + N semitones
// So to get the capo chord from the original key:
//   capo_chord = original_key - capo_fret  (transpose down by capo fret)
function capoChord(originalKey: Note, capoFret: number): Note {
  return transposeNote(originalKey, -capoFret);
}

// --- Sub-components ---

function SemitoneSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">移調量（半音）</label>
        <span className="text-sm font-mono font-bold text-accent tabular-nums w-12 text-right">
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <input
        type="range"
        min={-12}
        max={12}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
      />
      <div className="flex justify-between text-xs text-muted">
        <span>−12</span>
        <span>0</span>
        <span>+12</span>
      </div>
    </div>
  );
}

function ChordDisplay({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }, [text]);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-0.5 rounded border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
        >
          {copied ? "✓" : "コピー"}
        </button>
      </div>
      <pre className="bg-background border border-border rounded-xl p-4 text-sm font-mono text-foreground whitespace-pre-wrap min-h-[80px] leading-relaxed">
        {text || <span className="text-muted italic">ここに結果が表示されます</span>}
      </pre>
    </div>
  );
}

// --- Main Component ---

export default function KeyTransposer() {
  const [input, setInput] = useState("C Am F G\nDm7 G7 Cmaj7\nAm Em F C");
  const [semitones, setSemitones] = useState(0);

  // Capo calculator state
  const [capoKey, setCapoKey] = useState<Note>("C");
  const [capoFret, setCapoFret] = useState(0);

  const output = transposeProgression(input, semitones);
  const capoResult = capoChord(capoKey, capoFret);
  const capoSoundingKey = transposeNote(capoKey, capoFret);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <label className="text-sm font-medium text-foreground">
          コード進行を入力
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder={"例：C Am F G\nDm7 G7 Cmaj7"}
          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-mono text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-y"
        />
        <p className="text-xs text-muted">
          スペース・改行区切りで複数コードを入力。m、7、maj7、dim、aug、sus4 など各種クオリティに対応。
        </p>
      </div>

      {/* Slider */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <SemitoneSlider value={semitones} onChange={setSemitones} />
        {semitones !== 0 && (
          <p className="text-xs text-muted mt-3">
            {Math.abs(semitones)} 半音{semitones > 0 ? "上" : "下"}に移調
            {Math.abs(semitones) === 12 ? "（1オクターブ）" : ""}
          </p>
        )}
      </div>

      {/* Before / After */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">変換結果</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <ChordDisplay label="変換前" text={input} />
          <div className="hidden sm:flex items-center text-muted">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
          <ChordDisplay label={`変換後（${semitones > 0 ? "+" : ""}${semitones}半音）`} text={output} />
        </div>
      </div>

      {/* Capo Calculator */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">カポ計算機</h2>
          <p className="text-xs text-muted mt-1">
            原曲キー ＋ カポ位置 → 実際に押さえるコードのキーを計算
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* Original key selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">原曲キー</label>
            <select
              value={capoKey}
              onChange={(e) => setCapoKey(e.target.value as Note)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
            >
              {NOTES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Capo fret selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">カポ位置（フレット）</label>
            <select
              value={capoFret}
              onChange={(e) => setCapoFret(parseInt(e.target.value))}
              className="px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-accent"
            >
              {Array.from({ length: 8 }, (_, i) => i).map((f) => (
                <option key={f} value={f}>{f === 0 ? "なし" : `${f}フレット`}</option>
              ))}
            </select>
          </div>

          {/* Result */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">押さえるキー</span>
            <div className="px-5 py-2 bg-accent/10 border border-accent/30 rounded-xl">
              <span className="text-lg font-bold text-accent font-mono">{capoResult}</span>
            </div>
          </div>
        </div>

        {capoFret > 0 && (
          <div className="text-xs text-muted bg-background border border-border rounded-xl px-4 py-3 leading-relaxed">
            <span className="text-foreground font-medium">{capoResult}</span> で弾くと、
            カポ {capoFret} フレットにより実音は{" "}
            <span className="text-foreground font-medium">{capoSoundingKey}</span> になります。
            <br />
            原曲が <span className="text-foreground font-medium">{capoKey}</span> キーの場合、
            カポ {capoFret} で <span className="text-foreground font-medium">{capoResult}</span> のコードフォームを使えます。
          </div>
        )}
      </div>

      {/* Reference table */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">移調対照表（現在の設定）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted pb-2 pr-4">元のキー</th>
                {NOTES.map((n) => (
                  <th key={n} className="text-xs font-medium text-muted pb-2 px-2 text-center">{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-xs text-muted pr-4 py-1">
                  {semitones > 0 ? `+${semitones}` : semitones} 半音後
                </td>
                {NOTES.map((n) => (
                  <td key={n} className="px-2 py-1 text-center">
                    <span className={`text-xs font-mono font-semibold ${semitones !== 0 ? "text-accent" : "text-muted"}`}>
                      {transposeNote(n, semitones)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この楽曲 移調ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">キーを指定音程で移動、コード進行を一括変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この楽曲 移調ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "キーを指定音程で移動、コード進行を一括変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
