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

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "和暦の元号はいつ変わりましたか？", a: "直近では2019年5月1日に「平成」から「令和」に改元されました。その前は1989年1月8日に「昭和」から「平成」に変わりました。" },
            { q: "令和1年と令和元年はどちらが正しいですか？", a: "どちらも正しい表記です。公式文書では「令和元年」が使われることが多く、行政書類・証明書類では「元年」の表記が一般的です。" },
            { q: "明治・大正時代の和暦も対応していますか？", a: "本ツールは1920年（大正9年）以降に対応しています。それ以前の明治・大正の早期については年号対照表などをご参照ください。" },
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
              { "@type": "Question", "name": "和暦の元号はいつ変わりましたか？", "acceptedAnswer": { "@type": "Answer", "text": "直近では2019年5月1日に「平成」から「令和」に改元されました。" } },
              { "@type": "Question", "name": "令和1年と令和元年はどちらが正しいですか？", "acceptedAnswer": { "@type": "Answer", "text": "どちらも正しい表記です。公式文書では「令和元年」が使われることが多いです。" } },
              { "@type": "Question", "name": "明治・大正時代の和暦も対応していますか？", "acceptedAnswer": { "@type": "Answer", "text": "本ツールは1920年（大正9年）以降に対応しています。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/nenrei-keisan" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">年齢計算ツール</a>
            <a href="/nissuu-keisan" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">日数計算ツール</a>
          </div>
        </div>
      </div>
    </div>
  );
}
