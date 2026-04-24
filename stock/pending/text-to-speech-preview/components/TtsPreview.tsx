"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type SpeakingState = "idle" | "speaking" | "paused";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "She sells seashells by the seashore.",
  "How much wood would a woodchuck chuck?",
  "To be or not to be, that is the question.",
];

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs text-muted">{label}</label>
        <span className="text-xs font-mono font-medium text-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-accent accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function TtsPreview() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState(0);
  const [text, setText] = useState(SAMPLE_TEXTS[0]);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [speakingState, setSpeakingState] = useState<SpeakingState>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support & load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        // Prefer an English voice by default
        const enIdx = v.findIndex((voice) => voice.lang.startsWith("en"));
        setSelectedVoiceIdx(enIdx >= 0 ? enIdx : 0);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (speakingState === "paused") {
      window.speechSynthesis.resume();
      setSpeakingState("speaking");
      return;
    }

    window.speechSynthesis.cancel();

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[selectedVoiceIdx] ?? null;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setSpeakingState("speaking");
    utterance.onend = () => setSpeakingState("idle");
    utterance.onerror = () => setSpeakingState("idle");
    utterance.onpause = () => setSpeakingState("paused");
    utterance.onresume = () => setSpeakingState("speaking");

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speakingState, text, voices, selectedVoiceIdx, rate, pitch, volume]);

  const handlePause = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setSpeakingState("paused");
  }, []);

  const handleStop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeakingState("idle");
  }, []);

  const charCount = text.length;

  // Not yet determined (SSR)
  if (supported === null) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-center text-muted text-sm">
        Checking browser support…
      </div>
    );
  }

  // Not supported
  if (supported === false) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-yellow-800">
          Your browser does not support the Speech Synthesis API.
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          Try Chrome, Edge, Firefox, or Safari on a modern OS.
        </p>
      </div>
    );
  }

  const isIdle = speakingState === "idle";
  const isSpeaking = speakingState === "speaking";
  const isPaused = speakingState === "paused";

  return (
    <div className="space-y-4">
      {/* Text input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-base">Text</h2>
          <span className="text-xs text-muted font-mono">{charCount} chars</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Type or paste text here…"
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent resize-y"
        />
        {/* Sample text buttons */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SAMPLE_TEXTS.map((s, i) => (
            <button
              key={i}
              onClick={() => setText(s)}
              className="text-xs px-2 py-1 border border-border rounded-md bg-card hover:border-primary/50 text-muted hover:text-foreground transition-all"
            >
              Sample {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Voice & settings card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
        <h2 className="font-bold text-base">Settings</h2>

        {/* Voice selector */}
        <div>
          <label className="block text-xs text-muted mb-1">Voice</label>
          {voices.length === 0 ? (
            <p className="text-xs text-muted italic">Loading voices…</p>
          ) : (
            <select
              value={selectedVoiceIdx}
              onChange={(e) => setSelectedVoiceIdx(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {voices.map((v, i) => (
                <option key={i} value={i}>
                  {v.name} ({v.lang}){v.default ? " — default" : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sliders */}
        <Slider
          label="Rate (speed)"
          value={rate}
          min={0.5}
          max={2}
          step={0.1}
          display={`${rate.toFixed(1)}×`}
          onChange={setRate}
        />
        <Slider
          label="Pitch"
          value={pitch}
          min={0.5}
          max={2}
          step={0.1}
          display={pitch.toFixed(1)}
          onChange={setPitch}
        />
        <Slider
          label="Volume"
          value={volume}
          min={0}
          max={1}
          step={0.05}
          display={`${Math.round(volume * 100)}%`}
          onChange={setVolume}
        />
      </div>

      {/* Controls card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        {/* Speaking status indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full transition-all ${
              isSpeaking
                ? "bg-green-500 animate-pulse"
                : isPaused
                ? "bg-yellow-400"
                : "bg-gray-300"
            }`}
          />
          <span className="text-xs text-muted">
            {isSpeaking ? "Speaking…" : isPaused ? "Paused" : "Ready"}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Play / Resume */}
          <button
            onClick={handlePlay}
            disabled={!text.trim() || isSpeaking}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            {isPaused ? "Resume" : "Play"}
          </button>

          {/* Pause */}
          <button
            onClick={handlePause}
            disabled={!isSpeaking}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border text-sm font-medium hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Pause
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            disabled={isIdle}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-border text-sm font-medium hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop
          </button>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this TTS Pronunciation Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Use the browser's Speech Synthesis API to hear text spoken aloud. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this TTS Pronunciation Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Use the browser's Speech Synthesis API to hear text spoken aloud. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
