"use client";

import { useState } from "react";

type Region = "寒冷地" | "温暖地" | "暖地";

type MonthSet = number[]; // 1-12

interface CropSchedule {
  seed: MonthSet;
  transplant: MonthSet;
  harvest: MonthSet;
}

interface Crop {
  name: string;
  emoji: string;
  schedule: Record<Region, CropSchedule>;
}

const REGIONS: Region[] = ["寒冷地", "温暖地", "暖地"];

const REGION_DESC: Record<Region, string> = {
  寒冷地: "北海道・東北・高冷地（年平均気温 10℃以下）",
  温暖地: "関東・中部・近畿（年平均気温 10〜17℃）",
  暖地: "九州・四国・沖縄（年平均気温 17℃以上）",
};

const CROPS: Crop[] = [
  {
    name: "トマト",
    emoji: "🍅",
    schedule: {
      寒冷地: { seed: [3, 4], transplant: [5, 6], harvest: [7, 8, 9] },
      温暖地: { seed: [2, 3, 4], transplant: [4, 5], harvest: [6, 7, 8, 9] },
      暖地: { seed: [2, 3], transplant: [3, 4], harvest: [5, 6, 7, 8] },
    },
  },
  {
    name: "きゅうり",
    emoji: "🥒",
    schedule: {
      寒冷地: { seed: [4, 5], transplant: [5, 6], harvest: [7, 8, 9] },
      温暖地: { seed: [3, 4], transplant: [4, 5], harvest: [6, 7, 8, 9] },
      暖地: { seed: [2, 3, 8], transplant: [3, 4, 9], harvest: [5, 6, 10, 11] },
    },
  },
  {
    name: "なす",
    emoji: "🍆",
    schedule: {
      寒冷地: { seed: [3, 4], transplant: [6], harvest: [7, 8, 9] },
      温暖地: { seed: [2, 3], transplant: [4, 5], harvest: [6, 7, 8, 9, 10] },
      暖地: { seed: [1, 2], transplant: [3, 4], harvest: [5, 6, 7, 8, 9, 10] },
    },
  },
  {
    name: "ピーマン",
    emoji: "🫑",
    schedule: {
      寒冷地: { seed: [3, 4], transplant: [6], harvest: [7, 8, 9] },
      温暖地: { seed: [2, 3], transplant: [4, 5], harvest: [6, 7, 8, 9] },
      暖地: { seed: [1, 2], transplant: [3, 4], harvest: [5, 6, 7, 8, 9] },
    },
  },
  {
    name: "大根",
    emoji: "🌿",
    schedule: {
      寒冷地: { seed: [5, 6, 7], transplant: [], harvest: [7, 8, 9, 10] },
      温暖地: { seed: [3, 4, 8, 9], transplant: [], harvest: [5, 6, 10, 11] },
      暖地: { seed: [8, 9, 10], transplant: [], harvest: [10, 11, 12, 1] },
    },
  },
  {
    name: "人参",
    emoji: "🥕",
    schedule: {
      寒冷地: { seed: [5, 6], transplant: [], harvest: [9, 10] },
      温暖地: { seed: [3, 7, 8], transplant: [], harvest: [6, 10, 11] },
      暖地: { seed: [8, 9], transplant: [], harvest: [11, 12, 1] },
    },
  },
  {
    name: "じゃがいも",
    emoji: "🥔",
    schedule: {
      寒冷地: { seed: [4, 5], transplant: [], harvest: [8, 9] },
      温暖地: { seed: [2, 3, 8, 9], transplant: [], harvest: [6, 7, 11, 12] },
      暖地: { seed: [1, 2, 8], transplant: [], harvest: [5, 6, 11] },
    },
  },
  {
    name: "ほうれん草",
    emoji: "🥬",
    schedule: {
      寒冷地: { seed: [4, 5, 8, 9], transplant: [], harvest: [6, 7, 10, 11] },
      温暖地: { seed: [3, 9, 10], transplant: [], harvest: [5, 11, 12] },
      暖地: { seed: [9, 10, 11], transplant: [], harvest: [11, 12, 1, 2] },
    },
  },
  {
    name: "レタス",
    emoji: "🥗",
    schedule: {
      寒冷地: { seed: [4, 5], transplant: [5, 6], harvest: [7, 8, 9] },
      温暖地: { seed: [3, 8, 9], transplant: [4, 9, 10], harvest: [5, 6, 11, 12] },
      暖地: { seed: [9, 10], transplant: [10, 11], harvest: [12, 1, 2, 3] },
    },
  },
  {
    name: "ネギ",
    emoji: "🧅",
    schedule: {
      寒冷地: { seed: [3, 4], transplant: [6, 7], harvest: [9, 10, 11] },
      温暖地: { seed: [2, 3], transplant: [5, 6], harvest: [10, 11, 12] },
      暖地: { seed: [1, 2], transplant: [4, 5], harvest: [9, 10, 11, 12] },
    },
  },
  {
    name: "いちご",
    emoji: "🍓",
    schedule: {
      寒冷地: { seed: [], transplant: [8, 9], harvest: [6, 7] },
      温暖地: { seed: [], transplant: [9, 10], harvest: [4, 5, 6] },
      暖地: { seed: [], transplant: [9, 10], harvest: [3, 4, 5] },
    },
  },
  {
    name: "かぼちゃ",
    emoji: "🎃",
    schedule: {
      寒冷地: { seed: [4, 5], transplant: [5, 6], harvest: [8, 9] },
      温暖地: { seed: [3, 4], transplant: [4, 5], harvest: [7, 8] },
      暖地: { seed: [2, 3], transplant: [3, 4], harvest: [6, 7] },
    },
  },
  {
    name: "枝豆",
    emoji: "🫘",
    schedule: {
      寒冷地: { seed: [5, 6], transplant: [], harvest: [8, 9] },
      温暖地: { seed: [4, 5, 6], transplant: [], harvest: [7, 8, 9] },
      暖地: { seed: [3, 4, 5], transplant: [], harvest: [6, 7, 8] },
    },
  },
  {
    name: "スイカ",
    emoji: "🍉",
    schedule: {
      寒冷地: { seed: [4], transplant: [6], harvest: [8, 9] },
      温暖地: { seed: [3, 4], transplant: [4, 5], harvest: [7, 8] },
      暖地: { seed: [2, 3], transplant: [3, 4], harvest: [6, 7] },
    },
  },
  {
    name: "小松菜",
    emoji: "🌱",
    schedule: {
      寒冷地: { seed: [4, 5, 8], transplant: [], harvest: [6, 7, 10] },
      温暖地: { seed: [3, 4, 9, 10], transplant: [], harvest: [5, 6, 11, 12] },
      暖地: { seed: [9, 10, 11], transplant: [], harvest: [11, 12, 1, 2] },
    },
  },
  {
    name: "白菜",
    emoji: "🥦",
    schedule: {
      寒冷地: { seed: [7, 8], transplant: [8, 9], harvest: [10, 11] },
      温暖地: { seed: [8, 9], transplant: [9, 10], harvest: [11, 12] },
      暖地: { seed: [8, 9], transplant: [9, 10], harvest: [11, 12, 1] },
    },
  },
  {
    name: "ブロッコリー",
    emoji: "🥦",
    schedule: {
      寒冷地: { seed: [5, 6], transplant: [6, 7], harvest: [9, 10] },
      温暖地: { seed: [7, 8], transplant: [8, 9], harvest: [10, 11, 12] },
      暖地: { seed: [8, 9], transplant: [9, 10], harvest: [11, 12, 1] },
    },
  },
  {
    name: "チューリップ",
    emoji: "🌷",
    schedule: {
      寒冷地: { seed: [], transplant: [9, 10], harvest: [4, 5] },
      温暖地: { seed: [], transplant: [10, 11], harvest: [3, 4, 5] },
      暖地: { seed: [], transplant: [10, 11], harvest: [3, 4] },
    },
  },
  {
    name: "ひまわり",
    emoji: "🌻",
    schedule: {
      寒冷地: { seed: [5, 6], transplant: [], harvest: [8, 9] },
      温暖地: { seed: [4, 5, 6], transplant: [], harvest: [7, 8, 9] },
      暖地: { seed: [3, 4, 5], transplant: [], harvest: [6, 7, 8] },
    },
  },
  {
    name: "パンジー",
    emoji: "🌸",
    schedule: {
      寒冷地: { seed: [7, 8], transplant: [9, 10], harvest: [4, 5, 6] },
      温暖地: { seed: [8, 9], transplant: [10, 11], harvest: [3, 4, 5] },
      暖地: { seed: [9], transplant: [10, 11], harvest: [12, 1, 2, 3] },
    },
  },
];

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

type CellType = "seed" | "transplant" | "harvest" | null;

function getCellType(crop: Crop, region: Region, month: number): CellType {
  const s = crop.schedule[region];
  if (s.harvest.includes(month)) return "harvest";
  if (s.transplant.includes(month)) return "transplant";
  if (s.seed.includes(month)) return "seed";
  return null;
}

const CELL_STYLES: Record<NonNullable<CellType>, string> = {
  seed: "bg-green-400",
  transplant: "bg-blue-400",
  harvest: "bg-red-400",
};

const LEGEND_ITEMS: { type: CellType; label: string; style: string }[] = [
  { type: "seed", label: "種まき", style: "bg-green-400" },
  { type: "transplant", label: "定植", style: "bg-blue-400" },
  { type: "harvest", label: "収穫", style: "bg-red-400" },
];

export default function PlantingCalendar() {
  const [region, setRegion] = useState<Region>("温暖地");
  const [filter, setFilter] = useState("");

  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  const filtered = CROPS.filter((c) =>
    filter.trim() === "" || c.name.includes(filter.trim())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">野菜・花 植え付けカレンダー</h1>
        <p className="text-muted text-sm">
          地域・品種別の種まき・定植・収穫時期を月別に表示します。家庭菜園・ガーデニングの計画にご活用ください。
        </p>
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        {/* Region selector */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">地域を選択</p>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  region === r
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-border hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-1.5">{REGION_DESC[region]}</p>
        </div>

        {/* Crop filter */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">品種で絞り込み</p>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="例：トマト、きゅうり..."
            className="w-full max-w-xs px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {LEGEND_ITEMS.map(({ type, label, style }) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded ${style}`} />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-32 whitespace-nowrap">
                  品種
                </th>
                {MONTHS.map((m, i) => (
                  <th
                    key={m}
                    className={`px-1 py-3 text-center text-xs font-semibold w-10 ${
                      m === currentMonth
                        ? "text-green-700 bg-green-50"
                        : "text-gray-500"
                    }`}
                  >
                    {MONTH_LABELS[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-muted text-sm">
                    該当する品種が見つかりません。
                  </td>
                </tr>
              ) : (
                filtered.map((crop, idx) => (
                  <tr
                    key={crop.name}
                    className={`border-b border-border last:border-0 ${idx % 2 === 0 ? "" : "bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{crop.emoji}</span>
                        <span className="text-xs font-medium text-gray-800">{crop.name}</span>
                      </div>
                    </td>
                    {MONTHS.map((m) => {
                      const cellType = getCellType(crop, region, m);
                      return (
                        <td
                          key={m}
                          className={`px-1 py-2.5 text-center ${m === currentMonth ? "bg-green-50/60" : ""}`}
                        >
                          {cellType ? (
                            <div
                              className={`mx-auto h-5 w-full max-w-[32px] rounded-sm ${CELL_STYLES[cellType]}`}
                              title={
                                cellType === "seed"
                                  ? "種まき"
                                  : cellType === "transplant"
                                  ? "定植"
                                  : "収穫"
                              }
                            />
                          ) : (
                            <div className="mx-auto h-5 w-full max-w-[32px]" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">ご利用のヒント</h3>
        <ul className="space-y-1.5 text-xs text-gray-600">
          <li>・ <span className="font-medium text-gray-800">種まき（緑）</span>：直播きまたはポットへの播種適期です。</li>
          <li>・ <span className="font-medium text-gray-800">定植（青）</span>：苗を畑・プランターへ移植する適期です。空欄は直播きのみの品種。</li>
          <li>・ <span className="font-medium text-gray-800">収穫（赤）</span>：収穫の目安時期です。品種・栽培環境により前後します。</li>
          <li>・ 月別の色は目安です。実際の気象条件に合わせて調整してください。</li>
          <li>・ ハイライト列（薄緑）が今月です。</li>
        </ul>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この野菜・花 植え付けカレンダーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">地域・品種別の種まき・定植・収穫時期カレンダー。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この野菜・花 植え付けカレンダーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "地域・品種別の種まき・定植・収穫時期カレンダー。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
