"use client";

import { useState, useMemo } from "react";

// --- Music theory constants ---
const A4_FREQ = 440.0; // Hz
const SEMITONES_PER_OCTAVE = 12;
const NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_NAMES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// A4 is MIDI note 69
function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - 69) / SEMITONES_PER_OCTAVE);
}

function freqToMidi(freq: number): number {
  return 69 + SEMITONES_PER_OCTAVE * Math.log2(freq / A4_FREQ);
}

function midiToNoteName(midi: number, useFlat = false): string {
  const names = useFlat ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${names[pc]}${octave}`;
}

function noteNameToMidi(name: string): number | null {
  const match = name.match(/^([A-Ga-g])(#|b|♯|♭)?\s*(-?\d+)$/);
  if (!match) return null;
  const [, note, acc, octStr] = match;
  const oct = parseInt(octStr);
  const noteUpper = note.toUpperCase();
  let pc = NOTE_NAMES_SHARP.indexOf(noteUpper);
  if (pc === -1) pc = NOTE_NAMES_FLAT.indexOf(noteUpper);
  if (pc === -1) return null;
  if (acc === "#" || acc === "♯") pc += 1;
  if (acc === "b" || acc === "♭") pc -= 1;
  pc = ((pc % 12) + 12) % 12;
  return (oct + 1) * 12 + pc;
}

function centsDiff(freq1: number, freq2: number): number {
  return 1200 * Math.log2(freq2 / freq1);
}

const INTERVAL_NAMES: [number, string, string][] = [
  [0, "完全1度 (P1)", "Unison"],
  [1, "短2度 (m2)", "Minor 2nd"],
  [2, "長2度 (M2)", "Major 2nd"],
  [3, "短3度 (m3)", "Minor 3rd"],
  [4, "長3度 (M3)", "Major 3rd"],
  [5, "完全4度 (P4)", "Perfect 4th"],
  [6, "増4度 / 減5度 (TT)", "Tritone"],
  [7, "完全5度 (P5)", "Perfect 5th"],
  [8, "短6度 (m6)", "Minor 6th"],
  [9, "長6度 (M6)", "Major 6th"],
  [10, "短7度 (m7)", "Minor 7th"],
  [11, "長7度 (M7)", "Major 7th"],
  [12, "完全8度 (P8)", "Octave"],
];

function getIntervalName(semitones: number): string {
  const s = ((semitones % 12) + 12) % 12;
  const entry = INTERVAL_NAMES.find(([n]) => n === s);
  return entry ? entry[1] : `${Math.abs(semitones)}半音`;
}

const COMMON_NOTES = [
  "C2", "G2", "A2",
  "C3", "E3", "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
  "C5", "D5", "E5", "F5", "G5", "A5",
  "C6",
];

type Mode = "noteToFreq" | "freqToNote" | "interval";

export default function MusicInterval() {
  const [mode, setMode] = useState<Mode>("noteToFreq");
  const [useFlat, setUseFlat] = useState(false);
  const [a4Ref, setA4Ref] = useState(440);

  // Mode: noteToFreq
  const [noteName, setNoteName] = useState("A4");
  // Mode: freqToNote
  const [freqInput, setFreqInput] = useState("440");
  // Mode: interval
  const [note1, setNote1] = useState("C4");
  const [note2, setNote2] = useState("G4");

  // Derived: noteToFreq
  const noteResult = useMemo(() => {
    const midi = noteNameToMidi(noteName);
    if (midi === null) return null;
    // Adjust for A4 reference
    const refOffset = a4Ref / 440.0;
    const freq = midiToFreq(midi) * refOffset;
    const cents = centsDiff(440, A4_FREQ * refOffset) + 0;
    return { midi, freq, noteName: midiToNoteName(midi, useFlat) };
  }, [noteName, useFlat, a4Ref]);

  // Derived: freqToNote
  const freqResult = useMemo(() => {
    const f = parseFloat(freqInput);
    if (isNaN(f) || f <= 0) return null;
    const adjustedFreq = f * (440 / a4Ref);
    const midi = freqToMidi(adjustedFreq);
    const nearestMidi = Math.round(midi);
    const nearestFreq = midiToFreq(nearestMidi) * (a4Ref / 440);
    const cents = centsDiff(nearestFreq, f);
    return {
      midi: nearestMidi,
      noteName: midiToNoteName(nearestMidi, useFlat),
      nearestFreq,
      cents,
    };
  }, [freqInput, useFlat, a4Ref]);

  // Derived: interval
  const intervalResult = useMemo(() => {
    const m1 = noteNameToMidi(note1);
    const m2 = noteNameToMidi(note2);
    if (m1 === null || m2 === null) return null;
    const ref = a4Ref / 440;
    const f1 = midiToFreq(m1) * ref;
    const f2 = midiToFreq(m2) * ref;
    const semitones = m2 - m1;
    const cents = centsDiff(f1, f2);
    const freqRatio = f2 / f1;
    return {
      f1, f2, semitones, cents, freqRatio,
      intervalName: getIntervalName(semitones),
      direction: semitones > 0 ? "上行" : semitones < 0 ? "下行" : "同音",
    };
  }, [note1, note2, a4Ref]);

  function formatFreq(f: number): string {
    return f.toFixed(3) + " Hz";
  }

  return (
    <div className="space-y-6">
      {/* Mode & Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {(["noteToFreq", "freqToNote", "interval"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "noteToFreq" ? "音名 → 周波数" : m === "freqToNote" ? "周波数 → 音名" : "音程計算"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">A4 基準:</span>
            <input
              type="number"
              value={a4Ref}
              onChange={(e) => setA4Ref(parseFloat(e.target.value) || 440)}
              className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-center text-sm focus:outline-none"
            />
            <span className="text-xs text-gray-400">Hz</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setA4Ref(440)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              440
            </button>
            <button
              onClick={() => setA4Ref(432)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              432
            </button>
            <button
              onClick={() => setA4Ref(415)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              415
            </button>
          </div>
          <button
            onClick={() => setUseFlat((f) => !f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              useFlat ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
            }`}
          >
            {useFlat ? "♭表記" : "♯表記"}
          </button>
        </div>
      </div>

      {/* Mode: Note → Freq */}
      {mode === "noteToFreq" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">音名を入力</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              placeholder="例: A4, C#5, Bb3"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Quick note picker */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {COMMON_NOTES.map((n) => (
              <button
                key={n}
                onClick={() => setNoteName(n)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  noteName === n
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {noteResult ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <div className="text-xs text-blue-500 font-semibold mb-1">周波数</div>
                <div className="text-2xl font-bold text-blue-700 font-mono">
                  {formatFreq(noteResult.freq)}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                <div className="text-xs text-purple-500 font-semibold mb-1">MIDIノート番号</div>
                <div className="text-2xl font-bold text-purple-700 font-mono">{noteResult.midi}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                <div className="text-xs text-green-500 font-semibold mb-1">音名 ({useFlat ? "♭" : "♯"}表記)</div>
                <div className="text-2xl font-bold text-green-700 font-mono">{noteResult.noteName}</div>
              </div>
            </div>
          ) : noteName ? (
            <div className="text-sm text-red-500 p-3 bg-red-50 rounded-xl">
              認識できません。例: C4, A4, F#5, Bb3
            </div>
          ) : null}
        </div>
      )}

      {/* Mode: Freq → Note */}
      {mode === "freqToNote" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">周波数を入力 (Hz)</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="number"
              value={freqInput}
              onChange={(e) => setFreqInput(e.target.value)}
              placeholder="例: 440, 261.63"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base font-mono focus:outline-none focus:ring-2 focus:ring-purple-300"
              step="0.01"
              min="1"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {["55", "110", "220", "261.63", "329.63", "392", "440", "523.25", "880"].map((f) => (
              <button
                key={f}
                onClick={() => setFreqInput(f)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono border bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 transition-colors"
              >
                {f}Hz
              </button>
            ))}
          </div>

          {freqResult ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                  <div className="text-xs text-purple-500 font-semibold mb-1">最近接音名</div>
                  <div className="text-2xl font-bold text-purple-700 font-mono">{freqResult.noteName}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <div className="text-xs text-blue-500 font-semibold mb-1">MIDI番号</div>
                  <div className="text-2xl font-bold text-blue-700 font-mono">{freqResult.midi}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                  <div className="text-xs text-green-500 font-semibold mb-1">理論周波数</div>
                  <div className="text-xl font-bold text-green-700 font-mono">{formatFreq(freqResult.nearestFreq)}</div>
                </div>
                <div className={`p-4 rounded-xl border text-center ${Math.abs(freqResult.cents) < 5 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                  <div className={`text-xs font-semibold mb-1 ${Math.abs(freqResult.cents) < 5 ? "text-green-500" : "text-orange-500"}`}>ずれ (cents)</div>
                  <div className={`text-2xl font-bold font-mono ${Math.abs(freqResult.cents) < 5 ? "text-green-700" : "text-orange-700"}`}>
                    {freqResult.cents > 0 ? "+" : ""}{freqResult.cents.toFixed(1)}¢
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                1セント = 半音の1/100。±5セント以内なら実用上ほぼ正確にチューニングされています。
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-400">周波数を入力してください</div>
          )}
        </div>
      )}

      {/* Mode: Interval */}
      {mode === "interval" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">2つの音の音程を計算</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">音1</label>
              <input
                type="text"
                value={note1}
                onChange={(e) => setNote1(e.target.value)}
                placeholder="例: C4"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-mono text-base focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">音2</label>
              <input
                type="text"
                value={note2}
                onChange={(e) => setNote2(e.target.value)}
                placeholder="例: G4"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-mono text-base focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[["C4", "E4"], ["C4", "G4"], ["A4", "C5"], ["C4", "F4"], ["C4", "B4"], ["G4", "D5"]].map(([n1, n2]) => (
              <button
                key={`${n1}-${n2}`}
                onClick={() => { setNote1(n1); setNote2(n2); }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono border bg-gray-50 text-gray-700 border-gray-200 hover:border-green-300 transition-colors"
              >
                {n1}–{n2}
              </button>
            ))}
          </div>

          {intervalResult ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                  <div className="text-xs text-green-500 font-semibold mb-1">音程</div>
                  <div className="text-base font-bold text-green-700">{intervalResult.intervalName}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <div className="text-xs text-blue-500 font-semibold mb-1">半音数</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {intervalResult.semitones > 0 ? "+" : ""}{intervalResult.semitones}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                  <div className="text-xs text-purple-500 font-semibold mb-1">セント値</div>
                  <div className="text-xl font-bold text-purple-700 font-mono">
                    {intervalResult.cents > 0 ? "+" : ""}{intervalResult.cents.toFixed(0)}¢
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                  <div className="text-xs text-orange-500 font-semibold mb-1">周波数比</div>
                  <div className="text-xl font-bold text-orange-700 font-mono">
                    {intervalResult.freqRatio.toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500">音1: </span>
                  <span className="font-mono font-bold text-gray-800">{formatFreq(intervalResult.f1)}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-500">音2: </span>
                  <span className="font-mono font-bold text-gray-800">{formatFreq(intervalResult.f2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-500 p-3 bg-red-50 rounded-xl">音名が正しく認識できません</div>
          )}
        </div>
      )}

      {/* Interval reference table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">音程早見表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-gray-500">半音</th>
                <th className="text-left py-2 px-2 text-gray-500">音程名 (日)</th>
                <th className="text-left py-2 px-2 text-gray-500">音程名 (英)</th>
                <th className="text-right py-2 px-2 text-gray-500">例 (C4から)</th>
                <th className="text-right py-2 px-2 text-gray-500">周波数比</th>
              </tr>
            </thead>
            <tbody>
              {INTERVAL_NAMES.map(([semi, jp, en]) => {
                const ratio = Math.pow(2, semi / 12);
                const exampleMidi = 60 + semi;
                const exampleNote = midiToNoteName(exampleMidi, useFlat);
                return (
                  <tr key={semi} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-1.5 px-2 font-mono font-bold text-gray-700">{semi}</td>
                    <td className="py-1.5 px-2 text-gray-600">{jp}</td>
                    <td className="py-1.5 px-2 text-gray-400">{en}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-gray-700">{exampleNote}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-gray-500">{ratio.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この音程 ↔ 周波数 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">音名から周波数、セント値、音程を相互計算するツール。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この音程 ↔ 周波数 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "音名から周波数、セント値、音程を相互計算するツール。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
