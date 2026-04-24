"use client";

import { useState, useCallback } from "react";

const TIMEZONES = [
  { value: "Pacific/Honolulu", label: "Hawaii (UTC-10)" },
  { value: "America/Anchorage", label: "Alaska (UTC-9)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)" },
  { value: "America/Denver", label: "Denver (UTC-7/-6)" },
  { value: "America/Chicago", label: "Chicago (UTC-6/-5)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
  { value: "Atlantic/Azores", label: "Azores (UTC-1)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Paris / Berlin (UTC+1/+2)" },
  { value: "Europe/Helsinki", label: "Helsinki (UTC+2/+3)" },
  { value: "Europe/Moscow", label: "Moscow (UTC+3)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
  { value: "Asia/Karachi", label: "Karachi (UTC+5)" },
  { value: "Asia/Kolkata", label: "India (UTC+5:30)" },
  { value: "Asia/Dhaka", label: "Dhaka (UTC+6)" },
  { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
  { value: "Asia/Shanghai", label: "Shanghai (UTC+8)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
  { value: "Pacific/Auckland", label: "Auckland (UTC+12/+13)" },
];

const COLORS = [
  "bg-blue-400",
  "bg-purple-400",
  "bg-orange-400",
  "bg-pink-400",
  "bg-teal-400",
  "bg-red-400",
];

interface Member {
  id: string;
  name: string;
  timezone: string;
  startHour: number;
  endHour: number;
}

// Get UTC offset in minutes for a given timezone at current date
function getUTCOffsetMinutes(timezone: string): number {
  const now = new Date();
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
}

// Convert local hour to UTC minutes from midnight
function localHourToUTCMinutes(localHour: number, offsetMinutes: number): number {
  return localHour * 60 - offsetMinutes;
}

// Normalize minutes to [0, 1440)
function normMins(m: number): number {
  return ((m % 1440) + 1440) % 1440;
}

// Returns array of [startMin, endMin] UTC intervals (may wrap midnight → two intervals)
function getUTCIntervals(
  startHour: number,
  endHour: number,
  offsetMinutes: number
): Array<[number, number]> {
  const startUTC = normMins(localHourToUTCMinutes(startHour, offsetMinutes));
  let endUTC = normMins(localHourToUTCMinutes(endHour, offsetMinutes));

  if (endUTC === 0) endUTC = 1440;

  if (startUTC < endUTC) {
    return [[startUTC, endUTC]];
  } else {
    // wraps midnight
    return [
      [startUTC, 1440],
      [0, endUTC],
    ];
  }
}

// Check if a UTC minute is within working hours for a member
function isWorking(member: Member, utcMinute: number): boolean {
  const offset = getUTCOffsetMinutes(member.timezone);
  const intervals = getUTCIntervals(member.startHour, member.endHour, offset);
  return intervals.some(([s, e]) => utcMinute >= s && utcMinute < e);
}

// Convert UTC minutes to local hour string
function utcMinsToLocalTime(utcMins: number, offsetMinutes: number): string {
  const localMins = normMins(utcMins + offsetMinutes);
  const h = Math.floor(localMins / 60);
  const m = localMins % 60;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

// Find overlap blocks (contiguous UTC minute ranges where ALL members are working)
function findOverlapBlocks(members: Member[]): Array<{ start: number; end: number }> {
  if (members.length === 0) return [];
  const blocks: Array<{ start: number; end: number }> = [];
  let blockStart: number | null = null;

  for (let m = 0; m < 1440; m++) {
    const allWorking = members.every((member) => isWorking(member, m));
    if (allWorking && blockStart === null) {
      blockStart = m;
    } else if (!allWorking && blockStart !== null) {
      blocks.push({ start: blockStart, end: m });
      blockStart = null;
    }
  }
  if (blockStart !== null) blocks.push({ start: blockStart, end: 1440 });
  return blocks;
}

// Suggest meeting times: start of each overlap block, plus every 30 min within blocks
function suggestMeetingTimes(blocks: Array<{ start: number; end: number }>): number[] {
  const times: number[] = [];
  for (const block of blocks) {
    let t = block.start;
    while (t < block.end) {
      times.push(t);
      t += 30;
    }
  }
  return times.slice(0, 8); // max 8 suggestions
}

function HourLabel({ hour }: { hour: number }) {
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? "a" : "p";
  return (
    <span className="text-gray-400 text-[10px]">
      {h12}{period}
    </span>
  );
}

export default function MeetingPlanner() {
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "Alice", timezone: "America/New_York", startHour: 9, endHour: 17 },
    { id: "2", name: "Bob", timezone: "Europe/London", startHour: 9, endHour: 17 },
  ]);

  const addMember = useCallback(() => {
    const id = Date.now().toString();
    setMembers((prev) => [
      ...prev,
      { id, name: `Member ${prev.length + 1}`, timezone: "Asia/Tokyo", startHour: 9, endHour: 17 },
    ]);
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMember = useCallback((id: string, field: keyof Member, value: string | number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }, []);

  const overlapBlocks = findOverlapBlocks(members);
  const suggestions = suggestMeetingTimes(overlapBlocks);

  // Build overlap minute set for timeline rendering
  const overlapSet = new Set<number>();
  for (const block of overlapBlocks) {
    for (let m = block.start; m < block.end; m++) overlapSet.add(m);
  }

  return (
    <div className="space-y-6">
      {/* Members */}
      <div className="space-y-3">
        {members.map((member, idx) => {
          const color = COLORS[idx % COLORS.length];
          return (
            <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-3 items-center">
                <div className={`w-3 h-3 rounded-full shrink-0 ${color}`} />
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(member.id, "name", e.target.value)}
                  placeholder="Name"
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={member.timezone}
                  onChange={(e) => updateMember(member.id, "timezone", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-xs text-gray-400">From</span>
                  <select
                    value={member.startHour}
                    onChange={(e) => updateMember(member.id, "startHour", parseInt(e.target.value))}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const h12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
                      const p = i < 12 ? "AM" : "PM";
                      return (
                        <option key={i} value={i}>{h12}:00 {p}</option>
                      );
                    })}
                  </select>
                  <span className="text-xs text-gray-400">To</span>
                  <select
                    value={member.endHour}
                    onChange={(e) => updateMember(member.id, "endHour", parseInt(e.target.value))}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const h = i + 1;
                      const h12 = h === 24 ? 12 : h > 12 ? h - 12 : h;
                      const p = h < 12 || h === 24 ? "AM" : "PM";
                      return (
                        <option key={h} value={h}>{h12}:00 {p}</option>
                      );
                    })}
                  </select>
                </div>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none ml-auto"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button
          onClick={addMember}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          + Add Team Member
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">24-Hour Timeline (UTC)</h2>

        {/* Hour labels */}
        <div className="flex mb-2 ml-24">
          {Array.from({ length: 25 }, (_, i) => (
            <div key={i} className="flex-1 text-center" style={{ minWidth: 0 }}>
              {i % 3 === 0 && <HourLabel hour={i === 24 ? 0 : i} />}
            </div>
          ))}
        </div>

        {/* Member rows */}
        <div className="space-y-2">
          {members.map((member, idx) => {
            const color = COLORS[idx % COLORS.length];
            const offset = getUTCOffsetMinutes(member.timezone);
            const intervals = getUTCIntervals(member.startHour, member.endHour, offset);

            return (
              <div key={member.id} className="flex items-center gap-2">
                <div className="w-24 shrink-0 text-right pr-2">
                  <span className="text-xs font-medium text-gray-600 truncate block">{member.name || "—"}</span>
                </div>
                <div className="flex-1 relative h-7 bg-gray-100 rounded-md overflow-hidden">
                  {intervals.map(([s, e], ii) => {
                    const left = (s / 1440) * 100;
                    const width = ((e - s) / 1440) * 100;
                    return (
                      <div
                        key={ii}
                        className={`absolute top-0 h-full opacity-70 ${color}`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    );
                  })}
                  {/* Overlap highlight */}
                  {overlapBlocks.map((block, bi) => {
                    const memberWorking = isWorking(member, block.start);
                    if (!memberWorking) return null;
                    const left = (block.start / 1440) * 100;
                    const width = ((block.end - block.start) / 1440) * 100;
                    return (
                      <div
                        key={`ov-${bi}`}
                        className="absolute top-0 h-full bg-green-400 opacity-80"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Overlap row */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 shrink-0 text-right pr-2">
              <span className="text-xs font-bold text-green-700">Overlap</span>
            </div>
            <div className="flex-1 relative h-7 bg-gray-100 rounded-md overflow-hidden">
              {overlapBlocks.map((block, i) => {
                const left = (block.start / 1440) * 100;
                const width = ((block.end - block.start) / 1440) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 h-full bg-green-500"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-100">
          {members.map((member, idx) => (
            <div key={member.id} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`w-3 h-3 rounded-sm opacity-70 ${COLORS[idx % COLORS.length]}`} />
              <span>{member.name || `Member ${idx + 1}`}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>Overlap</span>
          </div>
        </div>
      </div>

      {/* Suggested Meeting Times */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Suggested Meeting Times</h2>
        {overlapBlocks.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <div className="text-3xl mb-2">😔</div>
            <p className="text-sm">No overlap found during working hours.</p>
            <p className="text-xs mt-1">Try expanding working hours or reducing the number of participants.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {suggestions.map((utcMins, i) => (
              <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-xs text-green-700 font-semibold mb-2">
                  {utcMinsToLocalTime(utcMins, 0)} UTC
                </div>
                <div className="space-y-1">
                  {members.map((member, idx) => {
                    const offset = getUTCOffsetMinutes(member.timezone);
                    return (
                      <div key={member.id} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${COLORS[idx % COLORS.length]}`} />
                        <span className="text-xs text-gray-600 truncate">
                          {member.name}: {utcMinsToLocalTime(utcMins, offset)}
                        </span>
                      
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Meeting Time Planner tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Find overlapping working hours across multiple time zones. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Meeting Time Planner tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Find overlapping working hours across multiple time zones. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {overlapBlocks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            {overlapBlocks.length} overlap window{overlapBlocks.length > 1 ? "s" : ""} found.
            Total overlap: {Math.round(overlapBlocks.reduce((acc, b) => acc + b.end - b.start, 0) / 60 * 10) / 10} hours/day.
          </div>
        )}
      </div>
    </div>
  );
}
