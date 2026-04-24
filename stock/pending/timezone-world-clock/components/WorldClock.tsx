"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// --- Types ---
interface ClockEntry {
  id: string;
  timezone: string;
  label: string;
}

interface TimeInfo {
  time: string;
  date: string;
  ampm: string;
  utcOffset: string;
  isDST: boolean;
  hour24: number;
}

// --- Helpers ---
function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for browsers that don't support supportedValuesOf
    return [
      "America/New_York", "America/Los_Angeles", "America/Chicago", "America/Denver",
      "America/Toronto", "America/Vancouver", "America/Sao_Paulo", "America/Mexico_City",
      "America/Buenos_Aires", "America/Bogota", "America/Lima",
      "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
      "Europe/Rome", "Europe/Madrid", "Europe/Amsterdam", "Europe/Stockholm",
      "Europe/Warsaw", "Europe/Kyiv", "Europe/Istanbul",
      "Asia/Tokyo", "Asia/Shanghai", "Asia/Seoul", "Asia/Singapore",
      "Asia/Hong_Kong", "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok",
      "Asia/Jakarta", "Asia/Karachi", "Asia/Dhaka", "Asia/Taipei",
      "Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth",
      "Pacific/Auckland", "Pacific/Honolulu", "Pacific/Fiji",
      "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos", "Africa/Nairobi",
      "UTC",
    ];
  }
}

function cityNameFromTz(tz: string): string {
  const parts = tz.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

function getUtcOffset(tz: string, date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    if (offsetPart) return offsetPart.value; // e.g. "GMT+9"
    return "UTC";
  } catch {
    return "UTC";
  }
}

function detectDST(tz: string): boolean {
  // Compare Jan vs Jul offset — if they differ, check if current offset matches summer
  try {
    const jan = new Date(Date.UTC(new Date().getFullYear(), 0, 15));
    const jul = new Date(Date.UTC(new Date().getFullYear(), 6, 15));
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "shortOffset" })
        .formatToParts(d)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
    const janOff = fmt(jan);
    const julOff = fmt(jul);
    if (janOff === julOff) return false; // No DST in this zone
    const nowOff = fmt(new Date());
    // DST is when the offset is larger (more east) — summer offset
    const parse = (s: string) => {
      const m = s.match(/GMT([+-])(\d+)(?::(\d+))?/);
      if (!m) return 0;
      const sign = m[1] === "+" ? 1 : -1;
      return sign * (parseInt(m[2]) * 60 + parseInt(m[3] ?? "0"));
    };
    const janMin = parse(janOff);
    const julMin = parse(julOff);
    const nowMin = parse(nowOff);
    const summerOffset = Math.max(janMin, julMin);
    return nowMin === summerOffset && janMin !== julMin;
  } catch {
    return false;
  }
}

function getTimeInfo(tz: string): TimeInfo {
  const now = new Date();
  try {
    const timeParts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const dateParts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(now);

    const get = (type: string) => timeParts.find((p) => p.type === type)?.value ?? "00";
    const h24 = parseInt(get("hour"));
    const timeStr = `${get("hour")}:${get("minute")}:${get("second")}`;
    const ampm = h24 >= 12 ? "PM" : "AM";
    const utcOffset = getUtcOffset(tz, now);
    const isDST = detectDST(tz);

    return { time: timeStr, date: dateParts, ampm, utcOffset, isDST, hour24: h24 };
  } catch {
    return { time: "--:--:--", date: "Unknown", ampm: "AM", utcOffset: "UTC", isDST: false, hour24: 0 };
  }
}

const DEFAULT_CLOCKS: ClockEntry[] = [
  { id: "utc", timezone: "UTC", label: "UTC" },
  { id: "new-york", timezone: "America/New_York", label: "New York" },
  { id: "london", timezone: "Europe/London", label: "London" },
  { id: "tokyo", timezone: "Asia/Tokyo", label: "Tokyo" },
];

const STORAGE_KEY = "world-clock-entries";

function loadClocks(): ClockEntry[] {
  if (typeof window === "undefined") return DEFAULT_CLOCKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_CLOCKS;
}

function saveClocks(clocks: ClockEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clocks));
  } catch {
    // ignore
  }
}

// --- Sub-components ---
interface ClockCardProps {
  entry: ClockEntry;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: () => void;
  isDragOver: boolean;
}

function ClockCard({ entry, index, total, onRemove, onMove, onDragStart, onDragOver, onDrop, isDragOver }: ClockCardProps) {
  const [info, setInfo] = useState<TimeInfo>(() => getTimeInfo(entry.timezone));

  useEffect(() => {
    setInfo(getTimeInfo(entry.timezone));
    const id = setInterval(() => setInfo(getTimeInfo(entry.timezone)), 1000);
    return () => clearInterval(id);
  }, [entry.timezone]);

  const bgClass = info.hour24 >= 6 && info.hour24 < 20
    ? "bg-white"
    : "bg-gray-900";
  const textMain = info.hour24 >= 6 && info.hour24 < 20 ? "text-gray-900" : "text-white";
  const textSub = info.hour24 >= 6 && info.hour24 < 20 ? "text-gray-500" : "text-gray-400";
  const borderClass = isDragOver ? "border-blue-400 ring-2 ring-blue-300" : "border-gray-200";

  return (
    <div
      className={`relative rounded-2xl border ${borderClass} ${bgClass} shadow-sm p-5 transition-all duration-150 cursor-grab active:cursor-grabbing`}
      draggable
      onDragStart={() => onDragStart(entry.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(entry.id); }}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className={`font-semibold text-base truncate ${textMain}`}>{entry.label}</div>
          <div className={`text-xs truncate ${textSub}`}>{entry.timezone}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {/* Reorder buttons */}
          <button
            onClick={() => onMove(entry.id, -1)}
            disabled={index === 0}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            ▲
          </button>
          <button
            onClick={() => onMove(entry.id, 1)}
            disabled={index === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            ▼
          </button>
          {/* Remove */}
          <button
            onClick={() => onRemove(entry.id)}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Time */}
      <div className={`font-mono text-4xl font-bold tracking-tight leading-none ${textMain}`}>
        {info.time}
      </div>

      {/* AM/PM + Date */}
      <div className={`mt-1 text-sm ${textSub}`}>
        <span className="font-semibold mr-2">{info.ampm}</span>
        <span>{info.date}</span>
      </div>

      {/* Badges */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {info.utcOffset}
        </span>
        {info.isDST && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            DST
          </span>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
export default function WorldClock() {
  const [clocks, setClocks] = useState<ClockEntry[]>(DEFAULT_CLOCKS);
  const [hydrated, setHydrated] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const allTimezones = useRef<string[]>(getAllTimezones());
  const searchRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragId = useRef<string | null>(null);
  const dragOverId = useRef<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  // Load from localStorage after mount
  useEffect(() => {
    setClocks(loadClocks());
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (hydrated) saveClocks(clocks);
  }, [clocks, hydrated]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim().length === 0
    ? []
    : allTimezones.current
        .filter((tz) => {
          const q = query.toLowerCase();
          return tz.toLowerCase().includes(q) || cityNameFromTz(tz).toLowerCase().includes(q);
        })
        .slice(0, 50);

  const addTimezone = useCallback((tz: string) => {
    setClocks((prev) => {
      if (prev.some((c) => c.timezone === tz)) return prev;
      const entry: ClockEntry = {
        id: `${tz}-${Date.now()}`,
        timezone: tz,
        label: cityNameFromTz(tz),
      };
      return [...prev, entry];
    });
    setQuery("");
    setShowDropdown(false);
  }, []);

  const removeClok = useCallback((id: string) => {
    setClocks((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const moveClok = useCallback((id: string, dir: -1 | 1) => {
    setClocks((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }, []);

  const handleDragStart = useCallback((id: string) => {
    dragId.current = id;
  }, []);

  const handleDragOver = useCallback((id: string) => {
    dragOverId.current = id;
    setDragOverTarget(id);
  }, []);

  const handleDrop = useCallback(() => {
    const from = dragId.current;
    const to = dragOverId.current;
    if (!from || !to || from === to) {
      setDragOverTarget(null);
      return;
    }
    setClocks((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((c) => c.id === from);
      const toIdx = arr.findIndex((c) => c.id === to);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    dragId.current = null;
    dragOverId.current = null;
    setDragOverTarget(null);
  }, []);

  return (
    <div>
      {/* Search / Add */}
      <div className="mb-6" ref={searchRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Add a city or time zone</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => { if (query.trim()) setShowDropdown(true); }}
            placeholder="Search city or timezone… e.g. Tokyo, America/Chicago"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query.trim() && (
            <button
              onClick={() => { setQuery(""); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
          {showDropdown && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {filtered.map((tz) => {
                const alreadyAdded = clocks.some((c) => c.timezone === tz);
                return (
                  <button
                    key={tz}
                    onClick={() => !alreadyAdded && addTimezone(tz)}
                    disabled={alreadyAdded}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${alreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span>
                      <span className="font-medium">{cityNameFromTz(tz)}</span>
                      <span className="text-gray-400 ml-2 text-xs">{tz}</span>
                    </span>
                    {alreadyAdded && <span className="text-xs text-gray-400">Added</span>}
                  </button>
                );
              })}
            </div>
          )}
          {showDropdown && query.trim().length > 0 && filtered.length === 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
              No results for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Clock grid */}
      {clocks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🕐</div>
          <div className="text-sm">No clocks added yet. Search for a city above.</div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          onDragEnd={() => { dragId.current = null; dragOverId.current = null; setDragOverTarget(null); }}
        >
          {clocks.map((entry, idx) => (
            <ClockCard
              key={entry.id}
              entry={entry}
              index={idx}
              total={clocks.length}
              onRemove={removeClok}
              onMove={moveClok}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragOver={dragOverTarget === entry.id}
            />
          ))}
        </div>
      )}

      {/* Hint */}
      {clocks.length > 1 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Drag cards to reorder · Click ✕ to remove · Your clocks are saved automatically
        </p>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this World Clock tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Display current time in multiple time zones simultaneously. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this World Clock tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Display current time in multiple time zones simultaneously. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "World Clock",
  "description": "Display current time in multiple time zones simultaneously",
  "url": "https://tools.loresync.dev/timezone-world-clock",
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
