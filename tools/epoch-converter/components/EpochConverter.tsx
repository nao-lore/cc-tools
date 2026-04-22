"use client";

import { useState, useEffect, useCallback } from "react";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

function formatTimezone(tz: string): string {
  return tz.replace(/_/g, " ").replace(/\//g, " / ");
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let result: string;
  if (seconds < 60) result = `${seconds} second${seconds !== 1 ? "s" : ""}`;
  else if (minutes < 60)
    result = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  else if (hours < 24) result = `${hours} hour${hours !== 1 ? "s" : ""}`;
  else if (days < 30) result = `${days} day${days !== 1 ? "s" : ""}`;
  else if (months < 12) result = `${months} month${months !== 1 ? "s" : ""}`;
  else result = `${years} year${years !== 1 ? "s" : ""}`;

  return isFuture ? `in ${result}` : `${result} ago`;
}

function formatInTimezone(date: Date, timezone: string, style: string): string {
  try {
    if (style === "iso") {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .formatToParts(date)
        .reduce(
          (acc, p) => {
            acc[p.type] = p.value;
            return acc;
          },
          {} as Record<string, string>
        );
      return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
    }
    if (style === "rfc2822") {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZoneName: "shortOffset",
      }).format(date);
    }
    if (style === "local") {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        dateStyle: "full",
        timeStyle: "long",
      }).format(date);
    }
    return date.toISOString();
  } catch {
    return "Invalid date";
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors shrink-0"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function FormatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <span className="text-xs text-gray-500 block">{label}</span>
        <span className="font-mono text-sm break-all">{value}</span>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export default function EpochConverter() {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(
    Math.floor(Date.now() / 1000)
  );
  const [timestampInput, setTimestampInput] = useState<string>("");
  const [convertedDate, setConvertedDate] = useState<Date | null>(null);
  const [dateInput, setDateInput] = useState<string>("");
  const [timeInput, setTimeInput] = useState<string>("00:00:00");
  const [convertedTimestamp, setConvertedTimestamp] = useState<number | null>(
    null
  );
  const [useMilliseconds, setUseMilliseconds] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [localTimezone, setLocalTimezone] = useState("UTC");

  // Live clock
  useEffect(() => {
    setLocalTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timestamp to Date conversion
  const convertTimestampToDate = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setConvertedDate(null);
        return;
      }
      const num = Number(input);
      if (isNaN(num)) {
        setConvertedDate(null);
        return;
      }
      // Auto-detect ms vs s: if > 10 digits, treat as ms
      const isMs = useMilliseconds || input.length > 10;
      const ms = isMs ? num : num * 1000;
      const date = new Date(ms);
      if (isNaN(date.getTime())) {
        setConvertedDate(null);
        return;
      }
      setConvertedDate(date);
    },
    [useMilliseconds]
  );

  useEffect(() => {
    convertTimestampToDate(timestampInput);
  }, [timestampInput, convertTimestampToDate]);

  // Date to Timestamp conversion
  const convertDateToTimestamp = useCallback(
    (dateStr: string, timeStr: string) => {
      if (!dateStr) {
        setConvertedTimestamp(null);
        return;
      }
      const dateTimeStr = `${dateStr}T${timeStr || "00:00:00"}`;
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        setConvertedTimestamp(null);
        return;
      }
      const ts = useMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);
      setConvertedTimestamp(ts);
    },
    [useMilliseconds]
  );

  useEffect(() => {
    convertDateToTimestamp(dateInput, timeInput);
  }, [dateInput, timeInput, convertDateToTimestamp]);

  // Quick actions
  const setQuickTimestamp = (offset: number) => {
    const ts = Math.floor(Date.now() / 1000) + offset;
    setTimestampInput(useMilliseconds ? String(ts * 1000) : String(ts));
  };

  const setNow = () => {
    const ts = useMilliseconds ? Date.now() : Math.floor(Date.now() / 1000);
    setTimestampInput(String(ts));
  };

  const setStartOfToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const ts = useMilliseconds
      ? now.getTime()
      : Math.floor(now.getTime() / 1000);
    setTimestampInput(String(ts));
  };

  const setStartOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const ts = useMilliseconds
      ? start.getTime()
      : Math.floor(start.getTime() / 1000);
    setTimestampInput(String(ts));
  };

  const displayTimestamp = useMilliseconds
    ? currentTimestamp * 1000
    : currentTimestamp;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Live Current Timestamp */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-8 text-white text-center shadow-lg">
        <p className="text-sm uppercase tracking-wider mb-1 opacity-80">
          Current Unix Timestamp
        </p>
        <p className="font-mono text-4xl md:text-5xl font-bold tabular-nums">
          {displayTimestamp}
        </p>
        <p className="text-sm mt-2 opacity-70">
          {new Date(currentTimestamp * 1000).toUTCString()}
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Milliseconds Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            className={`relative w-10 h-5 rounded-full transition-colors ${useMilliseconds ? "bg-blue-600" : "bg-gray-300"}`}
            onClick={() => setUseMilliseconds(!useMilliseconds)}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useMilliseconds ? "translate-x-5" : ""}`}
            />
          </div>
          <span className="text-sm text-gray-700">Milliseconds</span>
        </label>

        {/* Timezone Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Timezone:</label>
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {formatTimezone(tz)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { label: "Now", action: setNow },
          { label: "+1 Hour", action: () => setQuickTimestamp(3600) },
          { label: "+1 Day", action: () => setQuickTimestamp(86400) },
          { label: "+1 Week", action: () => setQuickTimestamp(604800) },
          { label: "Start of Today", action: setStartOfToday },
          { label: "Start of Year", action: setStartOfYear },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Two-Panel Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Timestamp to Date */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Timestamp &rarr; Date
          </h2>
          <input
            type="text"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder={
              useMilliseconds ? "e.g. 1700000000000" : "e.g. 1700000000"
            }
            className="w-full font-mono text-lg px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {convertedDate && (
            <div className="mt-4 space-y-0">
              <FormatRow
                label={`UTC (ISO 8601)`}
                value={formatInTimezone(convertedDate, "UTC", "iso")}
              />
              <FormatRow
                label="UTC (RFC 2822)"
                value={formatInTimezone(convertedDate, "UTC", "rfc2822")}
              />
              <FormatRow
                label={`Local (${localTimezone})`}
                value={formatInTimezone(convertedDate, localTimezone, "local")}
              />
              {selectedTimezone !== "UTC" &&
                selectedTimezone !== localTimezone && (
                  <FormatRow
                    label={formatTimezone(selectedTimezone)}
                    value={formatInTimezone(
                      convertedDate,
                      selectedTimezone,
                      "local"
                    )}
                  />
                )}
              <FormatRow
                label="Relative"
                value={getRelativeTime(convertedDate)}
              />
              <FormatRow
                label={useMilliseconds ? "Milliseconds" : "Seconds"}
                value={
                  useMilliseconds
                    ? String(convertedDate.getTime())
                    : String(Math.floor(convertedDate.getTime() / 1000))
                }
              />
            </div>
          )}
          {timestampInput && !convertedDate && (
            <p className="mt-4 text-red-500 text-sm">
              Invalid timestamp. Enter a valid Unix timestamp.
            </p>
          )}
        </div>

        {/* Date to Timestamp */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Date &rarr; Timestamp
          </h2>
          <div className="space-y-3">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full font-mono text-lg px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              step="1"
              className="w-full font-mono text-lg px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          {convertedTimestamp !== null && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-500 block mb-1">
                Unix Timestamp ({useMilliseconds ? "ms" : "seconds"})
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-gray-900">
                  {convertedTimestamp}
                </span>
                <CopyButton text={String(convertedTimestamp)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AdSense Placeholder */}
      <div className="w-full h-24 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-12">
        Ad Space
      </div>
    </div>
  );
}
