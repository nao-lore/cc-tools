// 日本の祝日データ (2024-2027)
// 振替休日 (substitute holidays) included when holiday falls on Sunday

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

export const JAPANESE_HOLIDAYS: Holiday[] = [
  // 2024
  { date: "2024-01-01", name: "元日" },
  { date: "2024-01-08", name: "成人の日" },
  { date: "2024-02-11", name: "建国記念の日" },
  { date: "2024-02-12", name: "振替休日（建国記念の日）" },
  { date: "2024-02-23", name: "天皇誕生日" },
  { date: "2024-03-20", name: "春分の日" },
  { date: "2024-04-29", name: "昭和の日" },
  { date: "2024-05-03", name: "憲法記念日" },
  { date: "2024-05-04", name: "みどりの日" },
  { date: "2024-05-05", name: "こどもの日" },
  { date: "2024-05-06", name: "振替休日（こどもの日）" },
  { date: "2024-07-15", name: "海の日" },
  { date: "2024-08-11", name: "山の日" },
  { date: "2024-08-12", name: "振替休日（山の日）" },
  { date: "2024-09-16", name: "敬老の日" },
  { date: "2024-09-22", name: "秋分の日" },
  { date: "2024-09-23", name: "振替休日（秋分の日）" },
  { date: "2024-10-14", name: "スポーツの日" },
  { date: "2024-11-03", name: "文化の日" },
  { date: "2024-11-04", name: "振替休日（文化の日）" },
  { date: "2024-11-23", name: "勤労感謝の日" },

  // 2025
  { date: "2025-01-01", name: "元日" },
  { date: "2025-01-13", name: "成人の日" },
  { date: "2025-02-11", name: "建国記念の日" },
  { date: "2025-02-23", name: "天皇誕生日" },
  { date: "2025-02-24", name: "振替休日（天皇誕生日）" },
  { date: "2025-03-20", name: "春分の日" },
  { date: "2025-04-29", name: "昭和の日" },
  { date: "2025-05-03", name: "憲法記念日" },
  { date: "2025-05-04", name: "みどりの日" },
  { date: "2025-05-05", name: "こどもの日" },
  { date: "2025-05-06", name: "振替休日（こどもの日）" },
  { date: "2025-07-21", name: "海の日" },
  { date: "2025-08-11", name: "山の日" },
  { date: "2025-09-15", name: "敬老の日" },
  { date: "2025-09-23", name: "秋分の日" },
  { date: "2025-10-13", name: "スポーツの日" },
  { date: "2025-11-03", name: "文化の日" },
  { date: "2025-11-23", name: "勤労感謝の日" },
  { date: "2025-11-24", name: "振替休日（勤労感謝の日）" },

  // 2026
  { date: "2026-01-01", name: "元日" },
  { date: "2026-01-12", name: "成人の日" },
  { date: "2026-02-11", name: "建国記念の日" },
  { date: "2026-02-23", name: "天皇誕生日" },
  { date: "2026-03-20", name: "春分の日" },
  { date: "2026-04-29", name: "昭和の日" },
  { date: "2026-05-03", name: "憲法記念日" },
  { date: "2026-05-04", name: "みどりの日" },
  { date: "2026-05-05", name: "こどもの日" },
  { date: "2026-05-06", name: "振替休日（こどもの日）" },
  { date: "2026-07-20", name: "海の日" },
  { date: "2026-08-11", name: "山の日" },
  { date: "2026-09-21", name: "敬老の日" },
  { date: "2026-09-23", name: "秋分の日" },
  { date: "2026-10-12", name: "スポーツの日" },
  { date: "2026-11-03", name: "文化の日" },
  { date: "2026-11-23", name: "勤労感謝の日" },

  // 2027
  { date: "2027-01-01", name: "元日" },
  { date: "2027-01-11", name: "成人の日" },
  { date: "2027-02-11", name: "建国記念の日" },
  { date: "2027-02-23", name: "天皇誕生日" },
  { date: "2027-03-21", name: "春分の日" },
  { date: "2027-03-22", name: "振替休日（春分の日）" },
  { date: "2027-04-29", name: "昭和の日" },
  { date: "2027-05-03", name: "憲法記念日" },
  { date: "2027-05-04", name: "みどりの日" },
  { date: "2027-05-05", name: "こどもの日" },
  { date: "2027-07-19", name: "海の日" },
  { date: "2027-08-11", name: "山の日" },
  { date: "2027-09-20", name: "敬老の日" },
  { date: "2027-09-23", name: "秋分の日" },
  { date: "2027-10-11", name: "スポーツの日" },
  { date: "2027-11-03", name: "文化の日" },
  { date: "2027-11-23", name: "勤労感謝の日" },
];

// Set for O(1) lookup
const holidayDateSet = new Set(JAPANESE_HOLIDAYS.map((h) => h.date));
const holidayMap = new Map(JAPANESE_HOLIDAYS.map((h) => [h.date, h.name]));

export function isJapaneseHoliday(date: Date): boolean {
  return holidayDateSet.has(formatDate(date));
}

export function getHolidayName(date: Date): string | undefined {
  return holidayMap.get(formatDate(date));
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isBusinessDay(
  date: Date,
  customHolidays: Set<string> = new Set()
): boolean {
  if (isWeekend(date)) return false;
  if (isJapaneseHoliday(date)) return false;
  if (customHolidays.has(formatDate(date))) return false;
  return true;
}

export function countBusinessDays(
  startDate: Date,
  endDate: Date,
  customHolidays: Set<string> = new Set()
): { count: number; holidays: Holiday[] } {
  const holidays: Holiday[] = [];
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = formatDate(current);
    const holidayName = holidayMap.get(dateStr);

    if (isWeekend(current)) {
      // skip
    } else if (holidayName) {
      holidays.push({ date: dateStr, name: holidayName });
    } else if (customHolidays.has(dateStr)) {
      holidays.push({ date: dateStr, name: "カスタム休日" });
    } else {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return { count, holidays };
}

export function addBusinessDays(
  startDate: Date,
  numDays: number,
  customHolidays: Set<string> = new Set()
): Date {
  const current = new Date(startDate);
  let remaining = numDays;

  while (remaining > 0) {
    current.setDate(current.getDate() + 1);
    if (isBusinessDay(current, customHolidays)) {
      remaining--;
    }
  }

  return current;
}

export function getHolidaysInRange(
  startDate: Date,
  endDate: Date
): Holiday[] {
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  return JAPANESE_HOLIDAYS.filter((h) => h.date >= startStr && h.date <= endStr);
}
