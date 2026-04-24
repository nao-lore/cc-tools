"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Phase = "work" | "shortBreak" | "longBreak";

interface Settings {
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsBeforeLong: number;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  workMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  sessionsBeforeLong: 4,
  soundEnabled: true,
};

const PHASE_LABELS: Record<Phase, string> = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const PHASE_COLORS: Record<Phase, { ring: string; bg: string; text: string; button: string }> = {
  work: {
    ring: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-700",
    button: "bg-red-500 hover:bg-red-600",
  },
  shortBreak: {
    ring: "#22c55e",
    bg: "bg-green-50",
    text: "text-green-700",
    button: "bg-green-500 hover:bg-green-600",
  },
  longBreak: {
    ring: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-700",
    button: "bg-blue-500 hover:bg-blue-600",
  },
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("pomodoro-settings");
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: Settings) {
  try {
    localStorage.setItem("pomodoro-settings", JSON.stringify(s));
  } catch {}
}

function loadTodaySessions(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("pomodoro-today");
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    const today = new Date().toDateString();
    return date === today ? count : 0;
  } catch {
    return 0;
  }
}

function saveTodaySessions(count: number) {
  try {
    const today = new Date().toDateString();
    localStorage.setItem("pomodoro-today", JSON.stringify({ date: today, count }));
  } catch {}
}

function beep(ctx: AudioContext | null, type: Phase) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === "work" ? 880 : 528;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

// SVG circular progress arc
function CircularProgress({
  pct,
  phase,
  children,
}: {
  pct: number;
  phase: Phase;
  children: React.ReactNode;
}) {
  const r = 88;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * (1 - pct);
  const color = PHASE_COLORS[phase].ring;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function SettingSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-800 font-bold">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gray-700"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<Phase>("work");
  const [sessionCount, setSessionCount] = useState(0); // completed work sessions this run
  const [todaySessions, setTodaySessions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workMin * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setTimeLeft(s.workMin * 60);
    setTodaySessions(loadTodaySessions());
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Update document title
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = running
        ? `${formatTime(timeLeft)} — ${PHASE_LABELS[phase]} | Pomodoro Timer`
        : "Pomodoro Timer - Focus & Break Timer";
    }
  }, [timeLeft, running, phase]);

  const totalSeconds = (ph: Phase, s: Settings): number => {
    if (ph === "work") return s.workMin * 60;
    if (ph === "shortBreak") return s.shortBreakMin * 60;
    return s.longBreakMin * 60;
  };

  const pct = 1 - timeLeft / totalSeconds(phase, settings);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  }, []);

  const advancePhase = useCallback(
    (currentPhase: Phase, currentSessionCount: number, s: Settings) => {
      if (currentPhase === "work") {
        const newCount = currentSessionCount + 1;
        setSessionCount(newCount);
        const newToday = loadTodaySessions() + 1;
        setTodaySessions(newToday);
        saveTodaySessions(newToday);

        if (audioCtxRef.current && s.soundEnabled) beep(audioCtxRef.current, "work");
        const nextPhase =
          newCount % s.sessionsBeforeLong === 0 ? "longBreak" : "shortBreak";
        notify(
          "Focus session complete!",
          nextPhase === "longBreak"
            ? "Time for a long break. Well done!"
            : "Time for a short break."
        );
        setPhase(nextPhase);
        setTimeLeft(totalSeconds(nextPhase, s));
        return { nextPhase, nextCount: newCount };
      } else {
        if (audioCtxRef.current && s.soundEnabled) beep(audioCtxRef.current, "shortBreak");
        notify("Break over!", "Back to focus mode.");
        setPhase("work");
        setTimeLeft(s.workMin * 60);
        return { nextPhase: "work" as Phase, nextCount: currentSessionCount };
      }
    },
    [notify]
  );

  // Timer tick
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    // Ensure AudioContext is created (requires user gesture)
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {}
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Phase complete — advance
          setPhase((ph) => {
            setSessionCount((sc) => {
              advancePhase(ph, sc, settings);
              return sc; // advancePhase updates via setState internally
            });
            return ph;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, advancePhase, settings]);

  // When timeLeft hits 0 via tick, actually advance
  const prevTimeLeftRef = useRef(timeLeft);
  useEffect(() => {
    if (prevTimeLeftRef.current > 0 && timeLeft === 0 && running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      // Use a short timeout so state has settled
      setTimeout(() => {
        setPhase((ph) => {
          setSessionCount((sc) => {
            const { nextPhase, nextCount: _ } = advancePhase(ph, sc, settings);
            setPhase(nextPhase);
            return sc;
          });
          return ph;
        });
      }, 50);
    }
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, running, advancePhase, settings]);

  const handleStartPause = () => {
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setTimeLeft(totalSeconds(phase, settings));
  };

  const handleSkip = () => {
    setRunning(false);
    setSessionCount((sc) => {
      const { nextPhase } = advancePhase(phase, sc, settings);
      setPhase(nextPhase);
      setTimeLeft(totalSeconds(nextPhase, settings));
      return sc;
    });
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      // Reset timer if changing duration of current phase
      if (!running) {
        if (
          (key === "workMin" && phase === "work") ||
          (key === "shortBreakMin" && phase === "shortBreak") ||
          (key === "longBreakMin" && phase === "longBreak")
        ) {
          setTimeLeft(totalSeconds(phase, next));
        }
      }
      return next;
    });
  };

  const colors = PHASE_COLORS[phase];

  // Session dots (slots up to sessionsBeforeLong)
  const dots = Array.from({ length: settings.sessionsBeforeLong }, (_, i) => {
    const completed = sessionCount % settings.sessionsBeforeLong;
    return i < completed;
  });

  return (
    <div className="space-y-6">
      {/* Phase Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(["work", "shortBreak", "longBreak"] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => {
              if (running) return;
              setPhase(p);
              setTimeLeft(totalSeconds(p, settings));
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              phase === p
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            } ${running ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Main Timer Card */}
      <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-8 flex flex-col items-center gap-6`}>
        {/* Circular Timer */}
        <CircularProgress pct={pct} phase={phase}>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-mono font-bold text-gray-800 tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className={`text-sm font-semibold mt-1 ${colors.text}`}>
              {PHASE_LABELS[phase]}
            </span>
          </div>
        </CircularProgress>

        {/* Session dots */}
        <div className="flex gap-2 items-center">
          {dots.map((done, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                done ? "bg-red-500" : "bg-gray-200"
              }`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">
            {sessionCount % settings.sessionsBeforeLong}/{settings.sessionsBeforeLong} until long break
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleStartPause}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white transition-colors shadow-sm ${colors.button}`}
          >
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            title="Skip to next phase"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Today</p>
          <p className="text-2xl font-bold text-gray-800">{todaySessions}</p>
          <p className="text-xs text-gray-400">sessions completed</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Focus Time</p>
          <p className="text-2xl font-bold text-gray-800">
            {Math.round((todaySessions * settings.workMin))}
          </p>
          <p className="text-xs text-gray-400">minutes today</p>
        </div>
      </div>

      {/* Notification Banner */}
      {notifPermission === "default" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-amber-800">Enable browser notifications</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Get notified when each session ends — even with the tab in background
            </p>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
          >
            Allow
          </button>
        </div>
      )}

      {/* Settings Panel */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>Settings</span>
          <span className="text-gray-400 text-xs">{showSettings ? "Hide" : "Show"}</span>
        </button>

        {showSettings && (
          <div className="px-6 pb-6 space-y-5 border-t border-gray-100">
            <div className="pt-4">
              <SettingSlider
                label="Work Duration"
                value={settings.workMin}
                min={15}
                max={60}
                unit="min"
                onChange={(v) => updateSetting("workMin", v)}
              />
            </div>
            <SettingSlider
              label="Short Break"
              value={settings.shortBreakMin}
              min={3}
              max={10}
              unit="min"
              onChange={(v) => updateSetting("shortBreakMin", v)}
            />
            <SettingSlider
              label="Long Break"
              value={settings.longBreakMin}
              min={10}
              max={30}
              unit="min"
              onChange={(v) => updateSetting("longBreakMin", v)}
            />
            <SettingSlider
              label="Sessions Before Long Break"
              value={settings.sessionsBeforeLong}
              min={2}
              max={6}
              unit=""
              onChange={(v) => updateSetting("sessionsBeforeLong", v)}
            />

            {/* Sound Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Sound</p>
                <p className="text-xs text-gray-400">Play a tone when session ends</p>
              </div>
              <button
                onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? "bg-gray-700" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.soundEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Pomodoro Timer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Customizable Pomodoro technique timer with session tracking. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Pomodoro Timer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Customizable Pomodoro technique timer with session tracking. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
