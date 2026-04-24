"use client";

import { useState, useMemo } from "react";

type WpmPreset = {
  label: string;
  wpm: number;
};

const WPM_PRESETS: WpmPreset[] = [
  { label: "Slow", wpm: 150 },
  { label: "Average", wpm: 200 },
  { label: "Fast", wpm: 300 },
  { label: "Speed Reader", wpm: 450 },
];

const SPEAKING_WPM = 130;

function formatTime(minutes: number): string {
  if (minutes < 1) {
    const secs = Math.round(minutes * 60);
    return `${secs}s`;
  }
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const matches = text.match(/[^.!?]*[.!?]+/g);
  return matches ? matches.length : 1;
}

function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export default function ReadingTime() {
  const [text, setText] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1); // index into WPM_PRESETS (Average)
  const [customWpm, setCustomWpm] = useState(200);

  const wpm = selectedPreset !== null ? WPM_PRESETS[selectedPreset].wpm : customWpm;

  const stats = useMemo(() => {
    const words = countWords(text);
    const chars = text.length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const readingMinutes = words / wpm;
    const speakingMinutes = words / SPEAKING_WPM;
    return { words, chars, sentences, paragraphs, readingMinutes, speakingMinutes };
  }, [text, wpm]);

  const hasText = stats.words > 0;

  return (
    <div className="space-y-4">
      {/* Textarea input */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <label className="block text-xs text-muted mb-2 font-medium">
          Paste or type your text
        </label>
        <textarea
          className="w-full h-48 px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent resize-y font-mono leading-relaxed"
          placeholder="Paste your article, essay, blog post, or any text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {text.length > 0 && (
          <button
            onClick={() => setText("")}
            className="mt-2 text-xs text-muted hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* WPM selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-sm mb-3">Reading Speed</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {WPM_PRESETS.map((preset, i) => (
            <button
              key={preset.label}
              onClick={() => setSelectedPreset(i)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                selectedPreset === i
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted hover:border-primary/50"
              }`}
            >
              <div>{preset.label}</div>
              <div className="text-xs opacity-70">{preset.wpm} WPM</div>
            </button>
          ))}
        </div>

        {/* Custom slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-muted">Custom WPM</label>
            <span
              className={`text-xs font-mono font-bold ${
                selectedPreset === null ? "text-primary" : "text-muted"
              }`}
            >
              {customWpm} WPM
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={1000}
            step={10}
            value={customWpm}
            onChange={(e) => {
              setCustomWpm(Number(e.target.value));
              setSelectedPreset(null);
            }}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted mt-0.5">
            <span>50</span>
            <span>1000</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-sm mb-4">Results</h2>

        {/* Reading time — hero */}
        <div
          className={`rounded-lg p-4 mb-4 text-center transition-all ${
            hasText ? "bg-primary/10 border border-primary/20" : "bg-accent border border-border"
          }`}
        >
          <p className="text-xs text-muted mb-1">Reading Time</p>
          <p className={`text-4xl font-bold ${hasText ? "text-primary" : "text-muted"}`}>
            {hasText ? formatTime(stats.readingMinutes) : "—"}
          </p>
          <p className="text-xs text-muted mt-1">at {wpm} WPM</p>
        </div>

        {/* Speaking time */}
        <div className="rounded-lg p-3 bg-accent border border-border mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Speaking Time</p>
            <p className="text-sm text-muted mt-0.5">at {SPEAKING_WPM} WPM (average speaker)</p>
          </div>
          <p className={`text-xl font-bold ${hasText ? "text-foreground" : "text-muted"}`}>
            {hasText ? formatTime(stats.speakingMinutes) : "—"}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Words", value: hasText ? stats.words.toLocaleString() : "—" },
            { label: "Characters", value: hasText ? stats.chars.toLocaleString() : "—" },
            { label: "Sentences", value: hasText ? stats.sentences.toLocaleString() : "—" },
            { label: "Paragraphs", value: hasText ? stats.paragraphs.toLocaleString() : "—" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-accent border border-border"
            >
              <p className="text-xs text-muted mb-0.5">{label}</p>
              <p className="text-lg font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Reading Time Estimator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Estimate reading time for any text content. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Reading Time Estimator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Estimate reading time for any text content. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
