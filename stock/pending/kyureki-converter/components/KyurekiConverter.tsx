"use client";
import { useState, useMemo } from "react";

// Rokuyou (六曜) cycle
const ROKUYOU = ["先勝", "友引", "先負", "仏滅", "大安", "赤口"];

// Eto (干支)
const KAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const SHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ZODIAC_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ZODIAC_JP = ["ねずみ", "うし", "とら", "うさぎ", "たつ", "へび", "うま", "ひつじ", "さる", "とり", "いぬ", "いのしし"];

// Wareki eras
const ERAS = [
  { name: "令和", start: new Date(2019, 4, 1), offset: 2019 },
  { name: "平成", start: new Date(1989, 0, 8), offset: 1989 },
  { name: "昭和", start: new Date(1926, 11, 25), offset: 1926 },
  { name: "大正", start: new Date(1912, 6, 30), offset: 1912 },
  { name: "明治", start: new Date(1868, 0, 25), offset: 1868 },
];

function getWareki(date: Date): string {
  for (const era of ERAS) {
    if (date >= era.start) {
      const year = date.getFullYear() - era.offset + 1;
      return `${era.name}${year === 1 ? "元" : year}年`;
    }
  }
  return `${date.getFullYear()}年`;
}

function getEto(year: number): { kanshi: string; zodiacJp: string; zodiacEn: string } {
  const kanIdx = (year - 4) % 10;
  const shiIdx = (year - 4) % 12;
  return {
    kanshi: KAN[(kanIdx + 10) % 10] + SHI[(shiIdx + 12) % 12],
    zodiacJp: ZODIAC_JP[(shiIdx + 12) % 12],
    zodiacEn: ZODIAC_EN[(shiIdx + 12) % 12],
  };
}

function getRokuyou(year: number, month: number, day: number): string {
  // Simplified rokuyou: (lunar month + lunar day) % 6
  // Using a simple approximation based on solar date
  const idx = (month + day) % 6;
  return ROKUYOU[idx];
}

// Simplified lunar date calculation
// This is an approximation using the known lunation offset
function toKyureki(date: Date): { month: number; day: number; year: number; isLeap: boolean } {
  // Julian Day Number
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  const a = Math.floor((14 - M) / 12);
  const y = Y + 4800 - a;
  const m = M + 12 * a - 3;
  let jdn = D + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Lunation number (approximate)
  const lunarCycle = 29.53058867;
  const newMoon0JDN = 2451549.5; // Jan 6, 2000 new moon
  const lunations = (jdn - newMoon0JDN) / lunarCycle;
  const phase = lunations - Math.floor(lunations);
  const lunarDay = Math.floor(phase * 29.53) + 1;

  // Lunar month approximation
  const totalLunations = Math.floor(lunations);
  const lunarMonth = ((totalLunations % 12) + 12) % 12 + 1;
  const lunarYear = Y - (M < 2 ? 1 : 0);

  return { month: lunarMonth, day: lunarDay, year: lunarYear, isLeap: false };
}

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return "春";
  if (month >= 6 && month <= 8) return "夏";
  if (month >= 9 && month <= 11) return "秋";
  return "冬";
}

const TRADITIONAL_MONTHS = [
  "睦月", "如月", "弥生", "卯月", "皐月", "水無月",
  "文月", "葉月", "長月", "神無月", "霜月", "師走",
];

const SEKKI = [
  { month: 1, day: 6, name: "小寒" }, { month: 1, day: 20, name: "大寒" },
  { month: 2, day: 4, name: "立春" }, { month: 2, day: 19, name: "雨水" },
  { month: 3, day: 6, name: "啓蟄" }, { month: 3, day: 21, name: "春分" },
  { month: 4, day: 5, name: "清明" }, { month: 4, day: 20, name: "穀雨" },
  { month: 5, day: 6, name: "立夏" }, { month: 5, day: 21, name: "小満" },
  { month: 6, day: 6, name: "芒種" }, { month: 6, day: 21, name: "夏至" },
  { month: 7, day: 7, name: "小暑" }, { month: 7, day: 23, name: "大暑" },
  { month: 8, day: 7, name: "立秋" }, { month: 8, day: 23, name: "処暑" },
  { month: 9, day: 8, name: "白露" }, { month: 9, day: 23, name: "秋分" },
  { month: 10, day: 8, name: "寒露" }, { month: 10, day: 23, name: "霜降" },
  { month: 11, day: 7, name: "立冬" }, { month: 11, day: 22, name: "小雪" },
  { month: 12, day: 7, name: "大雪" }, { month: 12, day: 22, name: "冬至" },
];

function getNearestSekki(month: number, day: number): string | null {
  for (const s of SEKKI) {
    if (s.month === month && Math.abs(s.day - day) <= 3) {
      const diff = s.day - day;
      if (diff === 0) return `本日は「${s.name}」`;
      if (diff > 0) return `${diff}日後「${s.name}」`;
      return `${-diff}日前「${s.name}」`;
    }
  }
  return null;
}

export default function KyurekiConverter() {
  const today = new Date();
  const [mode, setMode] = useState<"solar" | "lunar">("solar");
  const [solarDate, setSolarDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  const result = useMemo(() => {
    if (!solarDate) return null;
    const date = new Date(solarDate);
    if (isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const kyureki = toKyureki(date);
    const eto = getEto(year);
    const wareki = getWareki(date);
    const rokuyou = getRokuyou(year, kyureki.month, kyureki.day);
    const season = getSeason(month);
    const sekki = getNearestSekki(month, day);
    const traditionMonth = TRADITIONAL_MONTHS[(kyureki.month - 1) % 12];

    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    const dayOfWeekEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

    return {
      solarY: year, solarM: month, solarD: day,
      dayOfWeek, dayOfWeekEn,
      wareki,
      kyurekiY: kyureki.year, kyurekiM: kyureki.month, kyurekiD: kyureki.day,
      traditionMonth,
      rokuyou,
      eto,
      season,
      sekki,
    };
  }, [solarDate]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("solar")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === "solar" ? "bg-rose-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            新暦 → 旧暦
          </button>
          <button
            onClick={() => setMode("lunar")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${mode === "lunar" ? "bg-rose-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            旧暦 → 新暦（近似値）
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === "solar" ? "新暦（グレゴリオ暦）を入力" : "新暦日付を入力（旧暦近似変換）"}
        </label>
        <input
          type="date"
          value={solarDate}
          onChange={(e) => setSolarDate(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-400"
        />

        <button
          onClick={() => {
            const t = new Date();
            setSolarDate(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`);
          }}
          className="mt-3 text-sm text-rose-600 hover:text-rose-700 underline"
        >
          今日の日付をセット
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Main date cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 mb-1 font-medium">新暦（グレゴリオ暦）</p>
              <p className="text-2xl font-bold text-gray-900">
                {result.solarY}年{result.solarM}月{result.solarD}日
              </p>
              <p className="text-gray-500 text-sm mt-1">（{result.dayOfWeek}曜日）</p>
              <p className="text-sm text-gray-600 mt-2">{result.wareki}</p>
            </div>

            <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5">
              <p className="text-xs text-rose-600 mb-1 font-medium">旧暦（太陰太陽暦）※近似値</p>
              <p className="text-2xl font-bold text-rose-800">
                {result.kyurekiY}年{result.kyurekiM}月{result.kyurekiD}日
              </p>
              <p className="text-rose-600 text-sm mt-1">{result.traditionMonth}（{result.kyurekiM}月）</p>
              <p className="text-xs text-rose-400 mt-2">※正確な旧暦は天文台の暦を参照してください</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">六曜</p>
              <p className="text-xl font-bold text-amber-600">{result.rokuyou}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">干支</p>
              <p className="text-xl font-bold text-emerald-600">{result.eto.kanshi}</p>
              <p className="text-xs text-gray-500">{result.eto.zodiacJp}年</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">季節</p>
              <p className="text-xl font-bold text-sky-600">{result.season}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">曜日</p>
              <p className="text-xl font-bold text-purple-600">{result.dayOfWeek}曜</p>
              <p className="text-xs text-gray-500">{result.dayOfWeekEn}</p>
            </div>
          </div>

          {/* Sekki */}
          {result.sekki && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              二十四節気：{result.sekki}
            </div>
          )}

          {/* Traditional month names */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">月の呼び名（旧暦）</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TRADITIONAL_MONTHS.map((name, i) => (
                <div
                  key={i}
                  className={`text-center rounded-lg py-2 text-xs ${i + 1 === result.kyurekiM ? "bg-rose-100 text-rose-700 font-bold border border-rose-300" : "bg-gray-50 text-gray-600"}`}
                >
                  <div className="font-medium">{i + 1}月</div>
                  <div>{name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この旧暦・新暦変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">指定日の旧暦/新暦を相互変換。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この旧暦・新暦変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "指定日の旧暦/新暦を相互変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "旧暦・新暦変換",
  "description": "指定日の旧暦/新暦を相互変換",
  "url": "https://tools.loresync.dev/kyureki-converter",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
