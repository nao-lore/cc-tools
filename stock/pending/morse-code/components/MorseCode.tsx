"use client";

import { useState, useCallback, useMemo, useRef } from "react";

const MORSE_MAP: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  "_": "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "/";
      return MORSE_MAP[ch] ?? "?";
    })
    .join(" ");
}

function morseToText(morse: string): string {
  return morse
    .split(" / ")
    .map((word) =>
      word
        .split(" ")
        .map((sym) => {
          if (sym === "") return "";
          return REVERSE_MAP[sym] ?? "?";
        })
        .join("")
    )
    .join(" ");
}

type Mode = "text-to-morse" | "morse-to-text";

export default function MorseCode() {
  const [mode, setMode] = useState<Mode>("text-to-morse");
  const [input, setInput] = useState("");
  const [wpm, setWpm] = useState(15);
  const [frequency, setFrequency] = useState(600);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const stopRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const morseOutput = useMemo(() => {
    if (!input.trim()) return "";
    if (mode === "text-to-morse") return textToMorse(input);
    return morseToText(input);
  }, [input, mode]);

  // The morse string we'll play — always the morse side
  const morseForPlayback = useMemo(() => {
    if (mode === "text-to-morse") return morseOutput;
    return input.trim();
  }, [mode, input, morseOutput]);

  const copyText = useCallback(async (text: string, key: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleStop = useCallback(() => {
    stopRef.current = true;
    setPlaying(false);
  }, []);

  const handlePlay = useCallback(async () => {
    if (playing) {
      handleStop();
      return;
    }
    const morse = morseForPlayback;
    if (!morse) return;

    stopRef.current = false;
    setPlaying(true);

    // dot duration in seconds: 1200ms / wpm
    const dotDuration = 1.2 / wpm;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    let t = ctx.currentTime + 0.05; // small initial delay

    const scheduleTone = (duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.005);
      gain.gain.setValueAtTime(0.5, t + duration - 0.005);
      gain.gain.linearRampToValueAtTime(0, t + duration);
      osc.start(t);
      osc.stop(t + duration);
      t += duration;
    };

    const scheduleGap = (duration: number) => {
      t += duration;
    };

    const symbols = morse.split(" ");
    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i];
      if (sym === "/") {
        // word gap: 7 units total, already have 3-unit inter-char gap from previous char end,
        // so add 4 more units
        scheduleGap(4 * dotDuration);
        continue;
      }
      for (let j = 0; j < sym.length; j++) {
        const ch = sym[j];
        if (ch === ".") {
          scheduleTone(dotDuration);
        } else if (ch === "-") {
          scheduleTone(3 * dotDuration);
        }
        // intra-char gap: 1 unit (except after last element)
        if (j < sym.length - 1) {
          scheduleGap(dotDuration);
        }
      }
      // inter-char gap: 3 units (except after last symbol or before word gap)
      if (i < symbols.length - 1 && symbols[i + 1] !== "/") {
        scheduleGap(3 * dotDuration);
      } else if (i < symbols.length - 1 && symbols[i + 1] === "/") {
        scheduleGap(3 * dotDuration);
      }
    }

    // Wait for playback to finish, checking stop flag periodically
    const totalDuration = (t - ctx.currentTime) * 1000;
    const checkInterval = 100;
    let elapsed = 0;
    const tick = () => {
      if (stopRef.current) {
        ctx.close();
        return;
      }
      elapsed += checkInterval;
      if (elapsed >= totalDuration) {
        ctx.close();
        setPlaying(false);
      } else {
        setTimeout(tick, checkInterval);
      }
    };
    setTimeout(tick, checkInterval);
  }, [playing, morseForPlayback, wpm, frequency, handleStop]);

  const inputLabel = mode === "text-to-morse" ? "Text Input" : "Morse Input";
  const outputLabel = mode === "text-to-morse" ? "Morse Output" : "Text Output";
  const inputPlaceholder =
    mode === "text-to-morse"
      ? "Type text here..."
      : "Enter Morse code (use spaces between symbols, / between words)";

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">Translation Mode</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("text-to-morse");
              setInput("");
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "text-to-morse"
                ? "bg-accent text-white"
                : "bg-background border border-border text-foreground hover:border-accent"
            }`}
          >
            Text → Morse
          </button>
          <button
            onClick={() => {
              setMode("morse-to-text");
              setInput("");
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mode === "morse-to-text"
                ? "bg-accent text-white"
                : "bg-background border border-border text-foreground hover:border-accent"
            }`}
          >
            Morse → Text
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">{inputLabel}</h3>
          <button
            onClick={() => copyText(input, "input")}
            disabled={!input}
            className="px-3 py-1 text-xs font-medium rounded-md bg-background border border-border text-foreground hover:border-accent transition-colors disabled:opacity-40"
          >
            {copied === "input" ? "Copied!" : "Copy"}
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          rows={4}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-none font-mono"
        />
      </div>

      {/* Output */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">{outputLabel}</h3>
          <button
            onClick={() => copyText(morseOutput, "output")}
            disabled={!morseOutput}
            className="px-3 py-1 text-xs font-medium rounded-md bg-background border border-border text-foreground hover:border-accent transition-colors disabled:opacity-40"
          >
            {copied === "output" ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="min-h-[6rem] px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground font-mono break-all whitespace-pre-wrap">
          {morseOutput || (
            <span className="text-muted">
              {mode === "text-to-morse"
                ? "Morse code will appear here"
                : "Translated text will appear here"}
            </span>
          )}
        </div>
      </div>

      {/* Audio controls */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-medium text-muted">Audio Playback</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* WPM */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted">Speed</label>
              <span className="text-sm font-mono text-foreground">{wpm} WPM</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>5</span>
              <span>30</span>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted">Frequency</label>
              <span className="text-sm font-mono text-foreground">{frequency} Hz</span>
            </div>
            <input
              type="range"
              min={400}
              max={1000}
              step={10}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted">
              <span>400</span>
              <span>1000</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlay}
          disabled={!morseForPlayback}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-accent text-white hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {playing ? "Stop" : "Play Morse Code"}
        </button>
      </div>

      {/* Reference table */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Morse Code Reference</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Object.entries(MORSE_MAP).map(([char, code]) => (
            <div
              key={char}
              className="bg-background border border-border rounded-lg px-2 py-1.5 text-center"
            >
              <div className="text-sm font-bold text-foreground">{char}</div>
              <div className="text-xs font-mono text-muted">{code}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Morse Code Translator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Translate text to and from Morse code with audio playback. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Morse Code Translator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Translate text to and from Morse code with audio playback. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
