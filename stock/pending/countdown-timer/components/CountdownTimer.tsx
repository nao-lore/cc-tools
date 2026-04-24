"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Mode = "duration" | "target";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const STORAGE_KEY = "countdown-timer-target";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function calcTimeLeft(endMs: number): TimeLeft {
  const total = Math.max(0, endMs - Date.now());
  const s = Math.floor(total / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total,
  };
}

function DigitBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-surface border border-border rounded-2xl px-4 py-3 min-w-[72px] text-center">
        <span className="text-5xl font-bold tabular-nums text-foreground leading-none">
          {pad(value)}
        </span>
      </div>
      <span className="text-xs font-medium text-muted uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [mode, setMode] = useState<Mode>("duration");

  // Duration mode inputs
  const [durationH, setDurationH] = useState("0");
  const [durationM, setDurationM] = useState("5");
  const [durationS, setDurationS] = useState("0");

  // Target mode input
  const [targetInput, setTargetInput] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) return stored;
    // Default: 1 hour from now
    const d = new Date(Date.now() + 3600_000);
    return d.toISOString().slice(0, 16);
  });

  const [running, setRunning] = useState(false);
  const [endMs, setEndMs] = useState<number | null>(null);
  const [initialDuration, setInitialDuration] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 5, seconds: 0, total: 300_000 });
  const [finished, setFinished] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedRef = useRef(false);

  // Sync notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Persist target input
  useEffect(() => {
    if (mode === "target") {
      localStorage.setItem(STORAGE_KEY, targetInput);
    }
  }, [targetInput, mode]);

  const requestNotifPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  }, []);

  const fireNotification = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    new Notification("Countdown finished!", {
      body: "Your countdown timer has reached zero.",
      icon: "/favicon.ico",
    });
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback((end: number, init: number) => {
    const tl = calcTimeLeft(end);
    setTimeLeft(tl);
    if (tl.total <= 0) {
      setRunning(false);
      setFinished(true);
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        fireNotification();
      }
    }
  }, [fireNotification]);

  // Start interval when running
  useEffect(() => {
    if (running && endMs !== null) {
      tick(endMs, initialDuration);
      intervalRef.current = setInterval(() => tick(endMs, initialDuration), 500);
      return () => stop();
    }
  }, [running, endMs, initialDuration, tick, stop]);

  const getDurationMs = useCallback(() => {
    const h = Math.max(0, parseInt(durationH) || 0);
    const m = Math.max(0, parseInt(durationM) || 0);
    const s = Math.max(0, parseInt(durationS) || 0);
    return (h * 3600 + m * 60 + s) * 1000;
  }, [durationH, durationM, durationS]);

  const handleStart = useCallback(() => {
    notifiedRef.current = false;
    setFinished(false);

    let durationMs: number;
    if (mode === "duration") {
      durationMs = getDurationMs();
      if (durationMs <= 0) return;
    } else {
      const target = new Date(targetInput).getTime();
      if (isNaN(target)) return;
      durationMs = target - Date.now();
      if (durationMs <= 0) return;
    }

    const end = Date.now() + durationMs;
    setEndMs(end);
    setInitialDuration(durationMs);
    setTimeLeft(calcTimeLeft(end));
    setRunning(true);
  }, [mode, getDurationMs, targetInput]);

  const handlePause = useCallback(() => {
    setRunning(false);
  }, []);

  const handleResume = useCallback(() => {
    if (endMs === null || timeLeft.total <= 0) return;
    // Recalculate end from remaining time
    const newEnd = Date.now() + timeLeft.total;
    setEndMs(newEnd);
    setRunning(true);
  }, [endMs, timeLeft.total]);

  const handleReset = useCallback(() => {
    stop();
    setRunning(false);
    setFinished(false);
    setEndMs(null);
    notifiedRef.current = false;

    if (mode === "duration") {
      const h = Math.max(0, parseInt(durationH) || 0);
      const m = Math.max(0, parseInt(durationM) || 0);
      const s = Math.max(0, parseInt(durationS) || 0);
      setTimeLeft({ days: 0, hours: h, minutes: m, seconds: s, total: (h * 3600 + m * 60 + s) * 1000 });
    } else {
      const target = new Date(targetInput).getTime();
      if (!isNaN(target)) {
        setTimeLeft(calcTimeLeft(target));
      }
    }
  }, [stop, mode, durationH, durationM, durationS, targetInput]);

  const progressPct = initialDuration > 0 ? Math.max(0, timeLeft.total / initialDuration) * 100 : 100;
  const isStarted = endMs !== null;
  const isPaused = isStarted && !running && !finished;

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {(["duration", "target"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); handleReset(); }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === m
                  ? "text-foreground border-b-2 border-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {m === "duration" ? "Duration" : "Target Date / Time"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {mode === "duration" ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-muted">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={durationH}
                  onChange={(e) => setDurationH(e.target.value)}
                  disabled={running}
                  className="w-20 px-3 py-2 text-center text-lg font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>
              <span className="text-2xl font-bold text-muted mt-4">:</span>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-muted">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationM}
                  onChange={(e) => setDurationM(e.target.value)}
                  disabled={running}
                  className="w-20 px-3 py-2 text-center text-lg font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>
              <span className="text-2xl font-bold text-muted mt-4">:</span>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-muted">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationS}
                  onChange={(e) => setDurationS(e.target.value)}
                  disabled={running}
                  className="w-20 px-3 py-2 text-center text-lg font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Target date and time</label>
              <input
                type="datetime-local"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                disabled={running}
                className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent disabled:opacity-50 w-full max-w-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Display */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {timeLeft.days > 0 && (
            <DigitBlock value={timeLeft.days} label="Days" />
          )}
          <DigitBlock value={timeLeft.hours} label="Hours" />
          <DigitBlock value={timeLeft.minutes} label="Minutes" />
          <DigitBlock value={timeLeft.seconds} label="Seconds" />
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-background rounded-full border border-border overflow-hidden mb-6">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Finished banner */}
        {finished && (
          <div className="text-center mb-4 py-3 rounded-xl bg-accent/10 border border-accent/30">
            <span className="text-accent font-semibold text-sm">Time is up!</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          {!isStarted && !finished && (
            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
            >
              Start
            </button>
          )}
          {running && (
            <button
              onClick={handlePause}
              className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
            >
              Pause
            </button>
          )}
          {isPaused && (
            <button
              onClick={handleResume}
              className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
            >
              Resume
            </button>
          )}
          {isStarted && (
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Notification permission */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Browser Notifications</p>
          <p className="text-xs text-muted mt-0.5">
            {notifPermission === "granted"
              ? "Notifications enabled — you will be alerted when the timer finishes."
              : notifPermission === "denied"
              ? "Notifications blocked. Enable them in your browser settings."
              : "Allow notifications to be alerted when the timer finishes."}
          </p>
        </div>
        {notifPermission === "default" && (
          <button
            onClick={requestNotifPermission}
            className="shrink-0 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
          >
            Enable
          </button>
        )}
        {notifPermission === "granted" && (
          <span className="shrink-0 text-xs font-medium text-accent">Enabled</span>
        )}
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Countdown Timer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Set a countdown to any date or duration with browser notifications. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Countdown Timer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Set a countdown to any date or duration with browser notifications. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Countdown Timer",
  "description": "Set a countdown to any date or duration with browser notifications",
  "url": "https://tools.loresync.dev/countdown-timer",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
