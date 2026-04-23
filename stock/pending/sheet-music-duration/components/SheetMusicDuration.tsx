"use client";
import { useState } from "react";

interface Section {
  id: number;
  name: string;
  bpm: number;
  beats: number;
  noteValue: number;
  measures: number;
  repeats: number;
}

function calcSeconds(section: Section): number {
  const beatsPerMeasure = section.beats;
  const secondsPerBeat = 60 / section.bpm;
  const secondsPerMeasure = beatsPerMeasure * secondsPerBeat;
  return secondsPerMeasure * section.measures * section.repeats;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}秒`;
  return `${m}分${s.toString().padStart(2, "0")}秒`;
}

const NOTE_VALUES = [
  { label: "全音符基準 (4/4等)", value: 4 },
  { label: "付点2分音符基準 (6/8等)", value: 6 },
  { label: "2分音符基準 (2/2等)", value: 2 },
];

const PRESET_TEMPOS = [
  { label: "Grave (40)", value: 40 },
  { label: "Largo (52)", value: 52 },
  { label: "Adagio (66)", value: 66 },
  { label: "Andante (76)", value: 76 },
  { label: "Moderato (108)", value: 108 },
  { label: "Allegro (132)", value: 132 },
  { label: "Presto (176)", value: 176 },
];

export default function SheetMusicDuration() {
  const [sections, setSections] = useState<Section[]>([
    { id: 1, name: "A", bpm: 120, beats: 4, noteValue: 4, measures: 32, repeats: 1 },
  ]);
  const [fermataSeconds, setFermataSeconds] = useState(0);

  const addSection = () => {
    const newId = Math.max(...sections.map((s) => s.id)) + 1;
    setSections([
      ...sections,
      { id: newId, name: `セクション${newId}`, bpm: 120, beats: 4, noteValue: 4, measures: 16, repeats: 1 },
    ]);
  };

  const removeSection = (id: number) => {
    if (sections.length === 1) return;
    setSections(sections.filter((s) => s.id !== id));
  };

  const updateSection = (id: number, field: keyof Section, value: string | number) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const totalSeconds = sections.reduce((sum, s) => sum + calcSeconds(s), 0) + fermataSeconds;

  return (
    <div className="space-y-6">
      {/* Sections */}
      {sections.map((section, idx) => {
        const sectionSec = calcSeconds(section);
        return (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => updateSection(section.id, "name", e.target.value)}
                  className="text-lg font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {formatTime(sectionSec)}
                </span>
                <button
                  onClick={() => removeSection(section.id)}
                  disabled={sections.length === 1}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* BPM */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">BPM（テンポ）</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min={20}
                    max={320}
                    value={section.bpm}
                    onChange={(e) => updateSection(section.id, "bpm", Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {PRESET_TEMPOS.slice(0, 4).map((p) => (
                    <button
                      key={p.value}
                      onClick={() => updateSection(section.id, "bpm", p.value)}
                      className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-700 transition-colors"
                    >
                      {p.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Signature */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">拍子（分子 / 分母）</label>
                <div className="flex items-center gap-2">
                  <select
                    value={section.beats}
                    onChange={(e) => updateSection(section.id, "beats", Number(e.target.value))}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 12].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <span className="text-gray-400">/</span>
                  <select
                    value={section.noteValue}
                    onChange={(e) => updateSection(section.id, "noteValue", Number(e.target.value))}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {[2, 4, 8, 16].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Measures */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">小節数</label>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={section.measures}
                  onChange={(e) => updateSection(section.id, "measures", Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Repeats */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">繰り返し回数</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={section.repeats}
                    onChange={(e) => updateSection(section.id, "repeats", Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">回</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">反復記号は×2で入力</p>
              </div>

              {/* Per-measure info */}
              <div className="md:col-span-2 flex items-end">
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 w-full">
                  <span>1小節 = {(section.beats * 60 / section.bpm).toFixed(2)}秒</span>
                  <span className="mx-3 text-gray-300">|</span>
                  <span>{section.measures * section.repeats}小節 × {section.repeats}回</span>
                  <span className="mx-3 text-gray-300">|</span>
                  <span className="font-medium text-indigo-600">{formatTime(sectionSec)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add section button */}
      <button
        onClick={addSection}
        className="w-full border-2 border-dashed border-indigo-200 rounded-2xl py-4 text-indigo-400 hover:text-indigo-600 hover:border-indigo-400 transition-colors text-sm font-medium"
      >
        ＋ セクションを追加
      </button>

      {/* Fermata / extra time */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">追加時間（フェルマータ・静寂・MC等）</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={600}
            value={fermataSeconds}
            onChange={(e) => setFermataSeconds(Number(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <span className="text-sm text-gray-500">秒</span>
        </div>
      </div>

      {/* Result */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="text-center">
          <p className="text-indigo-200 text-sm mb-1">合計演奏時間</p>
          <p className="text-5xl font-bold mb-2">{formatTime(totalSeconds)}</p>
          <p className="text-indigo-200 text-sm">{Math.round(totalSeconds)}秒 / {sections.length}セクション</p>
        </div>
        <div className="mt-6 space-y-2">
          {sections.map((s) => {
            const sec = calcSeconds(s);
            const pct = totalSeconds > 0 ? (sec / totalSeconds) * 100 : 0;
            return (
              <div key={s.id}>
                <div className="flex justify-between text-xs text-indigo-200 mb-1">
                  <span>{s.name}</span>
                  <span>{formatTime(sec)} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="h-1.5 bg-indigo-400/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/70 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {fermataSeconds > 0 && (
            <div>
              <div className="flex justify-between text-xs text-indigo-200 mb-1">
                <span>追加時間</span>
                <span>{formatTime(fermataSeconds)}</span>
              </div>
              <div className="h-1.5 bg-indigo-400/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-300/70 rounded-full"
                  style={{ width: `${(fermataSeconds / totalSeconds) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reference */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">テンポ目安</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_TEMPOS.map((p) => (
            <div key={p.value} className="text-xs text-center bg-gray-50 rounded-lg py-2 px-1">
              <div className="font-medium text-gray-700">{p.label.split(" ")[0]}</div>
              <div className="text-gray-500">{p.value} BPM</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
