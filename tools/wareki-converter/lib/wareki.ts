export interface EraDefinition {
  name: string;
  nameShort: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // null means ongoing
  startYear: number;
  color: string; // tailwind color class
  bgColor: string;
  borderColor: string;
}

export const ERAS: EraDefinition[] = [
  {
    name: "令和",
    nameShort: "R",
    startDate: "2019-05-01",
    endDate: null,
    startYear: 2019,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    name: "平成",
    nameShort: "H",
    startDate: "1989-01-08",
    endDate: "2019-04-30",
    startYear: 1989,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    name: "昭和",
    nameShort: "S",
    startDate: "1926-12-25",
    endDate: "1989-01-07",
    startYear: 1926,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    name: "大正",
    nameShort: "T",
    startDate: "1912-07-30",
    endDate: "1926-12-24",
    startYear: 1912,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    name: "明治",
    nameShort: "M",
    startDate: "1868-01-25",
    endDate: "1912-07-29",
    startYear: 1868,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
];

const ZODIAC_ANIMALS = [
  "子（ね）🐭",
  "丑（うし）🐮",
  "寅（とら）🐯",
  "卯（う）🐰",
  "辰（たつ）🐲",
  "巳（み）🐍",
  "午（うま）🐴",
  "未（ひつじ）🐑",
  "申（さる）🐵",
  "酉（とり）🐔",
  "戌（いぬ）🐶",
  "亥（い）🐗",
];

export function getZodiac(westernYear: number): string {
  // 子年の基準: 2020年
  const index = ((westernYear - 4) % 12 + 12) % 12;
  return ZODIAC_ANIMALS[index];
}

export function warekiToWestern(eraName: string, eraYear: number): number | null {
  const era = ERAS.find((e) => e.name === eraName);
  if (!era) return null;
  const western = era.startYear + eraYear - 1;

  // Validate the year is within era range
  const endYear = era.endDate
    ? new Date(era.endDate).getFullYear()
    : new Date().getFullYear();
  if (western < era.startYear || western > endYear) return null;

  return western;
}

export function westernToWareki(
  westernYear: number
): { eraName: string; eraYear: number; era: EraDefinition }[] {
  const results: { eraName: string; eraYear: number; era: EraDefinition }[] = [];

  for (const era of ERAS) {
    const endYear = era.endDate
      ? new Date(era.endDate).getFullYear()
      : new Date().getFullYear();

    if (westernYear >= era.startYear && westernYear <= endYear) {
      const eraYear = westernYear - era.startYear + 1;
      results.push({ eraName: era.name, eraYear, era });
    }
  }

  return results;
}

export function getTodayWareki(): {
  western: string;
  wareki: string;
  year: number;
  month: number;
  day: number;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const results = westernToWareki(year);
  const primary = results[0]; // Most recent era first

  const western = `${year}年${month}月${day}日`;
  const wareki = primary
    ? `${primary.eraName}${primary.eraYear}年${month}月${day}日`
    : western;

  return { western, wareki, year, month, day };
}

export function getEraForYear(westernYear: number): EraDefinition | null {
  for (const era of ERAS) {
    const endYear = era.endDate
      ? new Date(era.endDate).getFullYear()
      : new Date().getFullYear() + 10;
    if (westernYear >= era.startYear && westernYear <= endYear) {
      return era;
    }
  }
  return null;
}

export function formatForResume(eraName: string, eraYear: number): string {
  return `${eraName}${eraYear === 1 ? "元" : eraYear}年`;
}
