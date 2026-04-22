// Cron expression parser, explainer, and next-run calculator
// No external dependencies - all logic built from scratch

export interface CronField {
  type: "wildcard" | "specific" | "range" | "interval" | "list";
  value: string;
}

export interface CronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const PRESETS: { label: string; expression: string; description: string }[] = [
  { label: "Every minute", expression: "* * * * *", description: "Runs every single minute" },
  { label: "Every 5 minutes", expression: "*/5 * * * *", description: "Runs every 5 minutes" },
  { label: "Every 15 minutes", expression: "*/15 * * * *", description: "Runs every 15 minutes" },
  { label: "Every 30 minutes", expression: "*/30 * * * *", description: "Runs every 30 minutes" },
  { label: "Every hour", expression: "0 * * * *", description: "Runs at minute 0 of every hour" },
  { label: "Every 6 hours", expression: "0 */6 * * *", description: "Runs every 6 hours" },
  { label: "Daily at midnight", expression: "0 0 * * *", description: "Runs once a day at 00:00" },
  { label: "Daily at noon", expression: "0 12 * * *", description: "Runs once a day at 12:00" },
  { label: "Weekly on Monday", expression: "0 9 * * 1", description: "Runs every Monday at 9:00 AM" },
  { label: "Weekdays at 9 AM", expression: "0 9 * * 1-5", description: "Runs Mon-Fri at 9:00 AM" },
  { label: "Monthly (1st)", expression: "0 0 1 * *", description: "Runs on the 1st of every month" },
  { label: "Yearly (Jan 1st)", expression: "0 0 1 1 *", description: "Runs once a year on January 1st" },
];

export function parseCronExpression(expression: string): CronExpression | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}

export function buildCronExpression(cron: CronExpression): string {
  return `${cron.minute} ${cron.hour} ${cron.dayOfMonth} ${cron.month} ${cron.dayOfWeek}`;
}

function isValidField(field: string, min: number, max: number): boolean {
  if (field === "*") return true;
  // interval: */N or N/M
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const stepNum = parseInt(step, 10);
    if (isNaN(stepNum) || stepNum < 1) return false;
    if (base === "*") return true;
    const baseNum = parseInt(base, 10);
    return !isNaN(baseNum) && baseNum >= min && baseNum <= max;
  }
  // list: 1,3,5
  if (field.includes(",")) {
    return field.split(",").every((v) => {
      if (v.includes("-")) {
        const [a, b] = v.split("-").map(Number);
        return !isNaN(a) && !isNaN(b) && a >= min && a <= max && b >= min && b <= max;
      }
      const n = parseInt(v, 10);
      return !isNaN(n) && n >= min && n <= max;
    });
  }
  // range: 1-5
  if (field.includes("-")) {
    const [a, b] = field.split("-").map(Number);
    return !isNaN(a) && !isNaN(b) && a >= min && a <= max && b >= min && b <= max;
  }
  // specific value
  const n = parseInt(field, 10);
  return !isNaN(n) && n >= min && n <= max;
}

export function isValidCron(expression: string): boolean {
  const cron = parseCronExpression(expression);
  if (!cron) return false;
  return (
    isValidField(cron.minute, 0, 59) &&
    isValidField(cron.hour, 0, 23) &&
    isValidField(cron.dayOfMonth, 1, 31) &&
    isValidField(cron.month, 1, 12) &&
    isValidField(cron.dayOfWeek, 0, 7)
  );
}

function expandField(field: string, min: number, max: number): number[] {
  if (field === "*") {
    const result: number[] = [];
    for (let i = min; i <= max; i++) result.push(i);
    return result;
  }
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const stepNum = parseInt(step, 10);
    const start = base === "*" ? min : parseInt(base, 10);
    const result: number[] = [];
    for (let i = start; i <= max; i += stepNum) result.push(i);
    return result;
  }
  if (field.includes(",")) {
    const result: number[] = [];
    field.split(",").forEach((part) => {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = a; i <= b; i++) result.push(i);
      } else {
        result.push(parseInt(part, 10));
      }
    });
    return [...new Set(result)].sort((a, b) => a - b);
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-").map(Number);
    const result: number[] = [];
    for (let i = a; i <= b; i++) result.push(i);
    return result;
  }
  return [parseInt(field, 10)];
}

function formatTime(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const minuteStr = m.toString().padStart(2, "0");
  return `${hour12}:${minuteStr} ${period}`;
}

function describeField(field: string, unit: string, names?: string[]): string {
  if (field === "*") return `every ${unit}`;
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    if (base === "*" || base === "0") return `every ${step} ${unit}${parseInt(step) > 1 ? "s" : ""}`;
    return `every ${step} ${unit}${parseInt(step) > 1 ? "s" : ""} starting at ${names ? names[parseInt(base)] : base}`;
  }
  if (field.includes(",")) {
    const vals = field.split(",").map((v) => (names ? names[parseInt(v)] : v));
    if (vals.length === 2) return `${vals[0]} and ${vals[1]}`;
    return vals.slice(0, -1).join(", ") + ", and " + vals[vals.length - 1];
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-");
    const from = names ? names[parseInt(a)] : a;
    const to = names ? names[parseInt(b)] : b;
    return `${from} through ${to}`;
  }
  return names ? names[parseInt(field)] : field;
}

export function explainCron(expression: string): string {
  const cron = parseCronExpression(expression);
  if (!cron) return "Invalid cron expression";
  if (!isValidCron(expression)) return "Invalid cron expression";

  const { minute, hour, dayOfMonth, month, dayOfWeek } = cron;

  // Common patterns with natural descriptions
  if (expression === "* * * * *") return "Every minute";
  if (minute.includes("/") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const step = minute.split("/")[1];
    return `Every ${step} minute${parseInt(step) > 1 ? "s" : ""}`;
  }

  const parts: string[] = [];

  // Time part
  if (minute !== "*" && hour !== "*" && !minute.includes("/") && !hour.includes("/")) {
    const hours = expandField(hour, 0, 23);
    const minutes = expandField(minute, 0, 59);
    if (hours.length === 1 && minutes.length === 1) {
      parts.push(`At ${formatTime(hours[0], minutes[0])}`);
    } else if (minutes.length === 1) {
      parts.push(`At minute ${minutes[0]} past ${describeField(hour, "hour")}`);
    } else {
      parts.push(`At ${describeField(minute, "minute")} past ${describeField(hour, "hour")}`);
    }
  } else if (minute !== "*" && !minute.includes("/")) {
    const mins = expandField(minute, 0, 59);
    if (mins.length === 1 && mins[0] === 0) {
      if (hour === "*") {
        parts.push("At the start of every hour");
      } else if (hour.includes("/")) {
        parts.push(`Every ${hour.split("/")[1]} hours`);
      }
    } else {
      parts.push(`At minute ${describeField(minute, "minute")}`);
    }
  } else if (minute.includes("/")) {
    const step = minute.split("/")[1];
    if (hour !== "*") {
      parts.push(`Every ${step} minutes during hour ${describeField(hour, "hour")}`);
    } else {
      parts.push(`Every ${step} minutes`);
    }
  } else if (hour !== "*") {
    if (hour.includes("/")) {
      parts.push(`Every ${hour.split("/")[1]} hours`);
    } else {
      parts.push(`During hour ${describeField(hour, "hour")}`);
    }
  }

  // Day of week
  if (dayOfWeek !== "*") {
    const normalizedDow = dayOfWeek === "7" ? "0" : dayOfWeek;
    if (normalizedDow === "1-5") {
      parts.push("on weekdays");
    } else if (normalizedDow === "0,6" || normalizedDow === "6,0") {
      parts.push("on weekends");
    } else {
      parts.push(`on ${describeField(normalizedDow, "day", DAY_NAMES)}`);
    }
  }

  // Day of month
  if (dayOfMonth !== "*") {
    parts.push(`on day ${describeField(dayOfMonth, "day")} of the month`);
  }

  // Month
  if (month !== "*") {
    parts.push(`in ${describeField(month, "month", MONTH_NAMES)}`);
  }

  return parts.length > 0 ? parts.join(" ") : "Every minute";
}

export function getNextRuns(expression: string, count: number = 5): Date[] {
  const cron = parseCronExpression(expression);
  if (!cron || !isValidCron(expression)) return [];

  const minutes = expandField(cron.minute, 0, 59);
  const hours = expandField(cron.hour, 0, 23);
  const daysOfMonth = expandField(cron.dayOfMonth, 1, 31);
  const months = expandField(cron.month, 1, 12);
  let daysOfWeek = expandField(cron.dayOfWeek, 0, 7);
  // Normalize day 7 (Sunday) to 0
  daysOfWeek = [...new Set(daysOfWeek.map((d) => (d === 7 ? 0 : d)))].sort((a, b) => a - b);

  const isDowRestricted = cron.dayOfWeek !== "*";
  const isDomRestricted = cron.dayOfMonth !== "*";

  const results: Date[] = [];
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
  current.setMinutes(current.getMinutes() + 1); // Start from next minute

  // Iterate up to 2 years to find matches
  const maxIterations = 525600 * 2; // 2 years of minutes
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    const monthMatch = months.includes(mon);
    const minuteMatch = minutes.includes(m);
    const hourMatch = hours.includes(h);

    let dayMatch: boolean;
    if (isDowRestricted && isDomRestricted) {
      // When both are specified, either can match (OR logic, per cron standard)
      dayMatch = daysOfMonth.includes(dom) || daysOfWeek.includes(dow);
    } else if (isDowRestricted) {
      dayMatch = daysOfWeek.includes(dow);
    } else if (isDomRestricted) {
      dayMatch = daysOfMonth.includes(dom);
    } else {
      dayMatch = true;
    }

    if (monthMatch && dayMatch && hourMatch && minuteMatch) {
      results.push(new Date(current));
    }

    // Smart increment: skip ahead when possible
    if (!monthMatch) {
      // Skip to next matching month
      current.setMonth(current.getMonth() + 1, 1);
      current.setHours(0, 0, 0, 0);
      iterations += 1440; // approximate
    } else if (!dayMatch) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      iterations += 1440;
    } else if (!hourMatch) {
      current.setHours(current.getHours() + 1, 0, 0, 0);
      iterations += 60;
    } else {
      current.setMinutes(current.getMinutes() + 1);
      iterations++;
    }
  }

  return results;
}

// Get hours in a 24h period when the cron fires (for timeline visualization)
export function getActiveHours(expression: string): boolean[] {
  const cron = parseCronExpression(expression);
  if (!cron || !isValidCron(expression)) return new Array(24).fill(false);

  const hours = expandField(cron.hour, 0, 23);
  const result = new Array(24).fill(false);
  hours.forEach((h) => {
    result[h] = true;
  });
  return result;
}

// Get active minutes per hour for more granular timeline
export function getFiresPerHour(expression: string): number[] {
  const cron = parseCronExpression(expression);
  if (!cron || !isValidCron(expression)) return new Array(24).fill(0);

  const minutes = expandField(cron.minute, 0, 59);
  const hours = expandField(cron.hour, 0, 23);
  const result = new Array(24).fill(0);
  hours.forEach((h) => {
    result[h] = minutes.length;
  });
  return result;
}
