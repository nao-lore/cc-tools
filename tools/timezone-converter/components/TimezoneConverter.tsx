"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const POPULAR_ZONES = [
  "UTC",
  "US/Eastern",
  "US/Pacific",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return POPULAR_ZONES;
  }
}

function formatTime(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "--:--:--";
  }
}

function formatDate(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "---";
  }
}

function getUTCOffset(date: Date, tz: string): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "longOffset",
    });
    const parts = fmt.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value ?? "";
  } catch {
    return "";
  }
}

function isDST(date: Date, tz: string): boolean {
  try {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const janOffset = getUTCOffset(jan, tz);
    const julOffset = getUTCOffset(jul, tz);
    if (janOffset === julOffset) return false;
    const currentOffset = getUTCOffset(date, tz);
    const janNum = parseOffset(janOffset);
    const julNum = parseOffset(julOffset);
    const curNum = parseOffset(currentOffset);
    const standardOffset = Math.min(janNum, julNum);
    return curNum > standardOffset;
  } catch {
    return false;
  }
}

function parseOffset(offset: string): number {
  const match = offset.match(/([+-])(\d{1,2}):?(\d{2})?/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3] || "0", 10);
  return sign * (hours * 60 + minutes);
}

function getTimezoneAbbr(date: Date, tz: string): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    });
    const parts = fmt.formatToParts(date);
    const abbr = parts.find((p) => p.type === "timeZoneName");
    return abbr?.value ?? "";
  } catch {
    return "";
  }
}

interface ZoneRow {
  id: string;
  timezone: string;
}

let idCounter = 0;
function nextId(): string {
  return `tz-${++idCounter}`;
}

export default function TimezoneConverter() {
  const allZones = useMemo(() => getAllTimezones(), []);
  const [sourceZone, setSourceZone] = useState("UTC");
  const [sourceTime, setSourceTime] = useState("");
  const [sourceDate, setSourceDate] = useState("");
  const [rows, setRows] = useState<ZoneRow[]>([
    { id: nextId(), timezone: "US/Eastern" },
    { id: nextId(), timezone: "Asia/Tokyo" },
  ]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setSourceDate(`${yyyy}-${mm}-${dd}`);
    const hh = String(today.getHours()).padStart(2, "0");
    const min = String(today.getMinutes()).padStart(2, "0");
    setSourceTime(`${hh}:${min}`);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getConversionDate = useCallback((): Date => {
    if (!sourceTime || !sourceDate) return now;
    try {
      const [hours, minutes] = sourceTime.split(":").map(Number);
      const [year, month, day] = sourceDate.split("-").map(Number);
      const tempDate = new Date(
        Date.UTC(year, month - 1, day, hours, minutes)
      );
      const sourceFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: sourceZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const sourceParts = sourceFmt.formatToParts(tempDate);
      const getPart = (type: string) =>
        sourceParts.find((p) => p.type === type)?.value ?? "0";
      const sourceHour = parseInt(getPart("hour"), 10);
      const sourceMinute = parseInt(getPart("minute"), 10);
      const hourDiff = hours - sourceHour;
      const minDiff = minutes - sourceMinute;
      const adjusted = new Date(
        tempDate.getTime() + (hourDiff * 60 + minDiff) * 60000
      );
      return adjusted;
    } catch {
      return now;
    }
  }, [sourceTime, sourceDate, sourceZone, now]);

  const conversionDate = getConversionDate();

  const addRow = () => {
    const used = new Set([sourceZone, ...rows.map((r) => r.timezone)]);
    const next =
      POPULAR_ZONES.find((z) => !used.has(z)) ||
      allZones.find((z) => !used.has(z)) ||
      "UTC";
    setRows((prev) => [...prev, { id: nextId(), timezone: next }]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRowTimezone = (id: string, tz: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, timezone: tz } : r))
    );
  };

  const TimezoneSelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
    >
      <optgroup label="Popular">
        {POPULAR_ZONES.map((tz) => (
          <option key={tz} value={tz}>
            {tz.replace(/_/g, " ")}
          </option>
        ))}
      </optgroup>
      <optgroup label="All Timezones">
        {allZones
          .filter((tz) => !POPULAR_ZONES.includes(tz))
          .map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
      </optgroup>
    </select>
  );

  return (
    <div className="space-y-6">
      {/* Source */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Source Time
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Timezone
            </label>
            <TimezoneSelect value={sourceZone} onChange={setSourceZone} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time</label>
            <input
              type="time"
              value={sourceTime}
              onChange={(e) => setSourceTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={sourceDate}
              onChange={(e) => setSourceDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
          <span className="font-mono">
            {formatTime(now, sourceZone)} (now)
          </span>
          <span className="text-gray-400">|</span>
          <span>{getUTCOffset(now, sourceZone)}</span>
          <span>{getTimezoneAbbr(now, sourceZone)}</span>
          {isDST(now, sourceZone) && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              DST
            </span>
          )}
        </div>
      </div>

      {/* Target Zones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Target Zones
          </h2>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add timezone
          </button>
        </div>

        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="sm:w-64 shrink-0">
              <TimezoneSelect
                value={row.timezone}
                onChange={(tz) => updateRowTimezone(row.id, tz)}
              />
            </div>
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-2xl font-mono font-semibold text-gray-900">
                  {formatTime(conversionDate, row.timezone)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(conversionDate, row.timezone)}
                </div>
              </div>
              <div className="text-right text-sm text-gray-500 space-y-1">
                <div>{getUTCOffset(conversionDate, row.timezone)}</div>
                <div className="flex items-center justify-end gap-2">
                  <span>
                    {getTimezoneAbbr(conversionDate, row.timezone)}
                  </span>
                  {isDST(conversionDate, row.timezone) && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      DST
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeRow(row.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
                title="Remove"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            No target zones. Click &quot;Add timezone&quot; to compare.
          </div>
        )}
      </div>

      {/* Current Time Overview */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Current Time in Popular Zones
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_ZONES.map((tz) => (
            <div key={tz} className="text-center p-2">
              <div className="text-xs text-gray-500 mb-1">
                {tz.replace(/_/g, " ")}
              </div>
              <div className="text-lg font-mono font-semibold text-gray-900">
                {formatTime(now, tz)}
              </div>
              <div className="text-xs text-gray-400">
                {getTimezoneAbbr(now, tz)}
                {isDST(now, tz) && (
                  <span className="ml-1 text-amber-600">DST</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "UTCとJSTの時差は何時間ですか？", a: "JST（日本標準時）はUTCより9時間進んでいます。つまりUTC 0:00はJST 9:00になります。日本はサマータイムを採用していないため、年間を通じてUTC+9で固定です。" },
            { q: "夏時間（サマータイム）は自動で反映されますか？", a: "はい。アメリカ・ヨーロッパなどサマータイムを採用している地域のタイムゾーンは、指定した日時に応じて自動的にサマータイムが適用されます。" },
            { q: "世界の主要都市の時差を一覧で確認できますか？", a: "本ツールでは複数のタイムゾーンを追加して一覧表示できます。東京・ニューヨーク・ロンドン・パリ・上海など主要都市のタイムゾーンをプリセットから選択可能です。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "UTCとJSTの時差は何時間ですか？", "acceptedAnswer": { "@type": "Answer", "text": "JST（日本標準時）はUTCより9時間進んでいます。日本はサマータイムを採用していないため、年間を通じてUTC+9で固定です。" } },
              { "@type": "Question", "name": "夏時間（サマータイム）は自動で反映されますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。アメリカ・ヨーロッパなどサマータイムを採用している地域のタイムゾーンは、指定した日時に応じて自動的にサマータイムが適用されます。" } },
              { "@type": "Question", "name": "世界の主要都市の時差を一覧で確認できますか？", "acceptedAnswer": { "@type": "Answer", "text": "本ツールでは複数のタイムゾーンを追加して一覧表示できます。主要都市のタイムゾーンをプリセットから選択可能です。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/epoch-converter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">エポック時刻変換</a>
            <a href="/nissuu-keisan" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">日数計算ツール</a>
          </div>
        </div>
      </div>
    </div>
  );
}
