"use client";
import { useState } from "react";

const PAPER_PRESETS = [
  { name: "上質紙 90kg (0.100mm)", thickness: 0.100 },
  { name: "上質紙 110kg (0.120mm)", thickness: 0.120 },
  { name: "コート紙 90kg (0.085mm)", thickness: 0.085 },
  { name: "コート紙 110kg (0.105mm)", thickness: 0.105 },
  { name: "マット紙 90kg (0.110mm)", thickness: 0.110 },
  { name: "マット紙 110kg (0.130mm)", thickness: 0.130 },
  { name: "コミック紙 (0.072mm)", thickness: 0.072 },
  { name: "カスタム", thickness: null },
];

const COVER_PRESETS = [
  { name: "表紙なし（ペーパーバック）", thickness: 0 },
  { name: "コート紙 180kg (0.215mm×2)", thickness: 0.215 * 2 },
  { name: "コート紙 220kg (0.265mm×2)", thickness: 0.265 * 2 },
  { name: "アートポスト 180kg (0.225mm×2)", thickness: 0.225 * 2 },
  { name: "カスタム", thickness: null },
];

export default function BookThickness() {
  const [pages, setPages] = useState<string>("100");
  const [selectedPaper, setSelectedPaper] = useState(0);
  const [customPaperThickness, setCustomPaperThickness] = useState<string>("0.100");
  const [selectedCover, setSelectedCover] = useState(0);
  const [customCoverThickness, setCustomCoverThickness] = useState<string>("0.430");
  const [includeEndpaper, setIncludeEndpaper] = useState(false);
  const [endpaperPages, setEndpaperPages] = useState<string>("4");

  const pageCount = parseInt(pages) || 0;
  const paperThickness =
    PAPER_PRESETS[selectedPaper].thickness !== null
      ? PAPER_PRESETS[selectedPaper].thickness!
      : parseFloat(customPaperThickness) || 0;
  const coverThickness =
    COVER_PRESETS[selectedCover].thickness !== null
      ? COVER_PRESETS[selectedCover].thickness!
      : parseFloat(customCoverThickness) || 0;
  const endpaperThickness = includeEndpaper ? (parseInt(endpaperPages) || 0) * paperThickness : 0;

  const bodyThickness = (pageCount / 2) * paperThickness;
  const totalThickness = bodyThickness + coverThickness + endpaperThickness;

  const isValid = pageCount > 0 && paperThickness > 0;

  const resultColor =
    totalThickness < 3 ? "text-blue-600" :
    totalThickness < 10 ? "text-green-600" :
    totalThickness < 25 ? "text-yellow-600" : "text-red-600";

  const spineNote =
    totalThickness < 3 ? "タイトルの印刷は困難な場合があります" :
    totalThickness < 5 ? "タイトル印刷は要確認（印刷所に相談推奨）" :
    totalThickness < 10 ? "タイトル印刷可能なサイズです" :
    "タイトル・著者名の両方を印刷できます";

  return (
    <div className="space-y-6">
      {/* 本文設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">本文設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              総ページ数（必ず偶数）
            </label>
            <input
              type="number"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              min={2}
              step={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 100"
            />
            {pageCount % 2 !== 0 && pageCount > 0 && (
              <p className="text-amber-600 text-xs mt-1">ページ数は偶数にしてください</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用紙の種類</label>
            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAPER_PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
            {PAPER_PRESETS[selectedPaper].thickness === null && (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">紙厚（mm/枚）</label>
                <input
                  type="number"
                  value={customPaperThickness}
                  onChange={(e) => setCustomPaperThickness(e.target.value)}
                  step={0.001}
                  min={0.01}
                  max={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 表紙設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">表紙設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表紙の種類</label>
            <select
              value={selectedCover}
              onChange={(e) => setSelectedCover(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COVER_PRESETS.map((c, i) => (
                <option key={i} value={i}>{c.name}</option>
              ))}
            </select>
            {COVER_PRESETS[selectedCover].thickness === null && (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">表紙合計厚み（mm）※表裏合計</label>
                <input
                  type="number"
                  value={customCoverThickness}
                  onChange={(e) => setCustomCoverThickness(e.target.value)}
                  step={0.01}
                  min={0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeEndpaper}
                onChange={(e) => setIncludeEndpaper(e.target.checked)}
                className="rounded"
              />
              見返し紙を含める
            </label>
            {includeEndpaper && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">見返しページ数</label>
                <input
                  type="number"
                  value={endpaperPages}
                  onChange={(e) => setEndpaperPages(e.target.value)}
                  min={2}
                  step={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 計算結果 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>
        {isValid ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600">本文の厚み</span>
              <span className="font-mono font-semibold text-gray-800">{bodyThickness.toFixed(2)} mm</span>
            </div>
            {coverThickness > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600">表紙の厚み（表裏合計）</span>
                <span className="font-mono font-semibold text-gray-800">{coverThickness.toFixed(2)} mm</span>
              </div>
            )}
            {endpaperThickness > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <span className="text-gray-600">見返し紙の厚み</span>
                <span className="font-mono font-semibold text-gray-800">{endpaperThickness.toFixed(2)} mm</span>
              </div>
            )}
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-5 border border-blue-200">
              <span className="text-blue-800 font-semibold text-lg">背幅（合計）</span>
              <span className={`font-mono font-bold text-2xl ${resultColor}`}>
                {totalThickness.toFixed(2)} mm
              </span>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-amber-800 text-sm font-medium">{spineNote}</p>
              <p className="text-amber-700 text-xs mt-1">
                印刷所によって計算式が異なる場合があります。最終確認は各印刷所の背幅計算ツールをご利用ください。
              </p>
            </div>

            {/* 参考値テーブル */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">ページ数別の背幅（参考）</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left">ページ数</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">本文厚み</th>
                      <th className="border border-gray-200 px-3 py-2 text-right">合計背幅</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[50, 100, 150, 200, 300, 400].map((p) => {
                      const bt = (p / 2) * paperThickness;
                      const tt = bt + coverThickness + endpaperThickness;
                      const isSelected = p === pageCount;
                      return (
                        <tr key={p} className={isSelected ? "bg-blue-50 font-semibold" : "hover:bg-gray-50"}>
                          <td className="border border-gray-200 px-3 py-1.5">{p}p</td>
                          <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{bt.toFixed(2)} mm</td>
                          <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{tt.toFixed(2)} mm</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            ページ数と用紙を設定してください
          </div>
        )}
      </div>
    </div>
  );
}
