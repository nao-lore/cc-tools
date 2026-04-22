"use client";

import { useMemo } from "react";
import { westernToWareki, getZodiac, getEraForYear } from "../lib/wareki";

export default function AgeTable() {
  const currentYear = new Date().getFullYear();

  const rows = useMemo(() => {
    const data: {
      westernYear: number;
      warekiLabel: string;
      age: number;
      zodiac: string;
      bgColor: string;
      color: string;
    }[] = [];

    for (let year = currentYear; year >= 1920; year--) {
      const results = westernToWareki(year);
      const primary = results[0];
      const eraYear = primary
        ? primary.eraYear === 1
          ? "元"
          : String(primary.eraYear)
        : "";
      const warekiLabel = primary ? `${primary.eraName}${eraYear}年` : "";
      const era = getEraForYear(year);

      data.push({
        westernYear: year,
        warekiLabel,
        age: currentYear - year,
        zodiac: getZodiac(year),
        bgColor: era?.bgColor || "",
        color: era?.color || "",
      });
    }

    return data;
  }, [currentYear]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          年齢早見表（{currentYear}年版）
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          生まれ年から現在の年齢を確認できます
        </p>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 text-left font-semibold">西暦</th>
              <th className="px-4 py-2 text-left font-semibold">和暦</th>
              <th className="px-4 py-2 text-center font-semibold">年齢</th>
              <th className="px-4 py-2 text-left font-semibold">干支</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.westernYear}
                className={`border-t border-gray-100 ${
                  row.westernYear === currentYear
                    ? "bg-yellow-50 font-bold"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-2 text-gray-800">{row.westernYear}年</td>
                <td className={`px-4 py-2 font-medium ${row.color}`}>
                  {row.warekiLabel}
                </td>
                <td className="px-4 py-2 text-center text-gray-800">
                  {row.age === 0 ? (
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">
                      今年
                    </span>
                  ) : (
                    `${row.age}歳`
                  )}
                </td>
                <td className="px-4 py-2 text-gray-600">{row.zodiac}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
