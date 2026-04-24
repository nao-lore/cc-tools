"use client";

import { useState, useRef, useCallback } from "react";

interface Lap {
  lapNumber: number;
  lapTime: number;
  totalTime: number;
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export default function StopwatchLap() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const lastLapTotalRef = useRef<number>(0);

  const start = useCallback(() => {
    if (running) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 10);
    setRunning(true);
  }, [running]);

  const stop = useCallback(() => {
    if (!running) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current += Date.now() - startTimeRef.current;
    setRunning(false);
  }, [running]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedRef.current = 0;
    lastLapTotalRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    const total = accumulatedRef.current + (running ? Date.now() - startTimeRef.current : 0);
    const lapTime = total - lastLapTotalRef.current;
    lastLapTotalRef.current = total;
    setLaps((prev) => [
      ...prev,
      { lapNumber: prev.length + 1, lapTime, totalTime: total },
    ]);
  }, [running]);

  const fastestIdx = laps.length >= 2
    ? laps.reduce((best, l, i) => (l.lapTime < laps[best].lapTime ? i : best), 0)
    : -1;
  const slowestIdx = laps.length >= 2
    ? laps.reduce((worst, l, i) => (l.lapTime > laps[worst].lapTime ? i : worst), 0)
    : -1;

  return (
    <div className="space-y-8">
      {/* Display */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col items-center gap-6">
        <p className="text-muted text-sm font-medium">Elapsed Time</p>
        <span className="text-6xl font-mono font-semibold tabular-nums tracking-tight text-foreground">
          {formatTime(elapsed)}
        </span>

        {/* Controls */}
        <div className="flex gap-3 flex-wrap justify-center">
          {!running ? (
            <button
              onClick={start}
              className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/80 transition-colors"
            >
              Start
            </button>
          ) : (
            <button
              onClick={stop}
              className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/80 transition-colors"
            >
              Stop
            </button>
          )}
          <button
            onClick={lap}
            disabled={!running}
            className="px-6 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Lap
          </button>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-surface transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Lap table */}
      {laps.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <h3 className="text-sm font-medium text-muted mb-3">
            Lap Times{" "}
            {laps.length >= 2 && (
              <span className="ml-2 text-xs font-normal">
                <span className="text-green-500">green = fastest</span>
                {" · "}
                <span className="text-red-400">red = slowest</span>
              </span>
            )}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase tracking-wide border-b border-border">
                  <th className="text-left pb-2 pr-4 font-medium">Lap</th>
                  <th className="text-right pb-2 pr-4 font-medium">Lap Time</th>
                  <th className="text-right pb-2 font-medium">Total Time</th>
                </tr>
              </thead>
              <tbody>
                {[...laps].reverse().map((l, reversedIdx) => {
                  const originalIdx = laps.length - 1 - reversedIdx;
                  const isFastest = originalIdx === fastestIdx;
                  const isSlowest = originalIdx === slowestIdx;
                  return (
                    <tr
                      key={l.lapNumber}
                      className={`border-b border-border/50 last:border-0 font-mono tabular-nums ${
                        isFastest
                          ? "text-green-500"
                          : isSlowest
                          ? "text-red-400"
                          : "text-foreground"
                      }`}
                    >
                      <td className="py-2 pr-4 text-left font-sans font-medium">
                        {String(l.lapNumber).padStart(2, "0")}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {formatTime(l.lapTime)}
                      </td>
                      <td className="py-2 text-right">{formatTime(l.totalTime)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Stopwatch with Lap Timer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Precise stopwatch with lap recording and statistics. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Stopwatch with Lap Timer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Precise stopwatch with lap recording and statistics. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Stopwatch with Lap Timer",
  "description": "Precise stopwatch with lap recording and statistics",
  "url": "https://tools.loresync.dev/stopwatch-lap",
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
