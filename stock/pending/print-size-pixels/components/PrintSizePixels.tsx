"use client";
import { useState, useMemo } from "react";

type Mode = "size-to-px" | "px-to-size";
type Unit = "mm" | "inch" | "cm";

const STANDARD_SIZES = [
  { name: "L判",    w_mm: 89,  h_mm: 127 },
  { name: "2L判",   w_mm: 127, h_mm: 178 },
  { name: "KG判",   w_mm: 102, h_mm: 152 },
  { name: "A4",     w_mm: 210, h_mm: 297 },
  { name: "A3",     w_mm: 297, h_mm: 420 },
  { name: "A5",     w_mm: 148, h_mm: 210 },
  { name: "2ワイド", w_mm: 127, h_mm: 178 },
  { name: "六切",   w_mm: 203, h_mm: 254 },
  { name: "四切",   w_mm: 254, h_mm: 305 },
  { name: "カスタム", w_mm: 0,  h_mm: 0  },
];

const DPI_PRESETS = [72, 96, 150, 300, 350, 600];

function mmToInch(mm: number) { return mm / 25.4; }
function inchToMm(inch: number) { return inch * 25.4; }
function cmToMm(cm: number) { return cm * 10; }

export default function PrintSizePixels() {
  const [mode, setMode] = useState<Mode>("size-to-px");
  const [dpi, setDpi] = useState(300);
  const [customDpi, setCustomDpi] = useState(false);

  // size-to-px inputs
  const [sizePresetIdx, setSizePresetIdx] = useState(0);
  const [unit, setUnit] = useState<Unit>("mm");
  const [manualW, setManualW] = useState(89);
  const [manualH, setManualH] = useState(127);

  // px-to-size inputs
  const [pxW, setPxW] = useState(2592);
  const [pxH, setPxH] = useState(3888);

  const preset = STANDARD_SIZES[sizePresetIdx];
  const isCustom = preset.name === "カスタム";

  // Convert manual input to mm
  const inputW_mm = useMemo(() => {
    if (!isCustom) return preset.w_mm;
    if (unit === "mm") return manualW;
    if (unit === "cm") return cmToMm(manualW);
    return inchToMm(manualW);
  }, [isCustom, preset, unit, manualW]);

  const inputH_mm = useMemo(() => {
    if (!isCustom) return preset.h_mm;
    if (unit === "mm") return manualH;
    if (unit === "cm") return cmToMm(manualH);
    return inchToMm(manualH);
  }, [isCustom, preset, unit, manualH]);

  const sizeToPx = useMemo(() => {
    const pxW = Math.round(mmToInch(inputW_mm) * dpi);
    const pxH = Math.round(mmToInch(inputH_mm) * dpi);
    const mpx = (pxW * pxH) / 1e6;
    return { pxW, pxH, mpx };
  }, [inputW_mm, inputH_mm, dpi]);

  const pxToSize = useMemo(() => {
    const w_inch = pxW / dpi;
    const h_inch = pxH / dpi;
    const w_mm = inchToMm(w_inch);
    const h_mm = inchToMm(h_inch);
    const w_cm = w_mm / 10;
    const h_cm = h_mm / 10;
    const mpx = (pxW * pxH) / 1e6;
    return { w_inch, h_inch, w_mm, h_mm, w_cm, h_cm, mpx };
  }, [pxW, pxH, dpi]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 flex gap-2">
        <ModeBtn active={mode === "size-to-px"} onClick={() => setMode("size-to-px")} label="サイズ → ピクセル" />
        <ModeBtn active={mode === "px-to-size"} onClick={() => setMode("px-to-size")} label="ピクセル → サイズ" />
      </div>

      {/* DPI selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">解像度（DPI）</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {DPI_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => { setDpi(d); setCustomDpi(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                dpi === d && !customDpi
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setCustomDpi(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              customDpi ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            カスタム
          </button>
        </div>
        {customDpi && (
          <input
            type="number" min={1} max={2400}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            placeholder="DPI"
          />
        )}
        <div className="mt-2 text-xs text-gray-500">
          {dpi === 72 && "画面表示用"}
          {dpi === 96 && "Web・画面表示"}
          {dpi === 150 && "低品質印刷・参考出力"}
          {dpi === 300 && "標準印刷品質（推奨）"}
          {dpi === 350 && "高品質印刷"}
          {dpi === 600 && "最高品質・精細印刷"}
          {![72,96,150,300,350,600].includes(dpi) && `カスタム: ${dpi}dpi`}
        </div>
      </div>

      {/* Input area */}
      {mode === "size-to-px" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">印刷サイズを入力</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">プリセットサイズ</label>
              <div className="flex flex-wrap gap-2">
                {STANDARD_SIZES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSizePresetIdx(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      sizePresetIdx === i
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {isCustom && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
                  <div className="flex gap-2">
                    {(["mm", "cm", "inch"] as Unit[]).map((u) => (
                      <button key={u} onClick={() => setUnit(u)}
                        className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${unit === u ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">幅</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={manualW} min={0.1} step={0.1} onChange={(e) => setManualW(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">高さ</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={manualH} min={0.1} step={0.1} onChange={(e) => setManualH(Number(e.target.value))} />
                </div>
              </>
            )}
          </div>

          {/* Result */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <BigCard label="必要ピクセル（幅）" value={sizeToPx.pxW.toLocaleString()} unit="px" />
            <BigCard label="必要ピクセル（高さ）" value={sizeToPx.pxH.toLocaleString()} unit="px" />
            <BigCard label="総画素数" value={sizeToPx.mpx.toFixed(1)} unit="MP" />
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            {inputW_mm.toFixed(1)}mm × {inputH_mm.toFixed(1)}mm @ {dpi}dpi
            = {sizeToPx.pxW.toLocaleString()} × {sizeToPx.pxH.toLocaleString()} px
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ピクセル数を入力</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">幅（px）</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={pxW} min={1} onChange={(e) => setPxW(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">高さ（px）</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={pxH} min={1} onChange={(e) => setPxH(Number(e.target.value))} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <BigCard label="印刷幅（mm）" value={pxToSize.w_mm.toFixed(1)} unit="mm" />
            <BigCard label="印刷高さ（mm）" value={pxToSize.h_mm.toFixed(1)} unit="mm" />
            <BigCard label="総画素数" value={pxToSize.mpx.toFixed(1)} unit="MP" />
            <BigCard label="印刷幅（inch）" value={pxToSize.w_inch.toFixed(2)} unit="inch" />
            <BigCard label="印刷高さ（inch）" value={pxToSize.h_inch.toFixed(2)} unit="inch" />
            <BigCard label="解像度" value={dpi.toString()} unit="dpi" />
          </div>

          {/* Closest standard size */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-800">
            <strong>最近い標準サイズ: </strong>
            {(() => {
              const closest = STANDARD_SIZES.filter(s => s.w_mm > 0).reduce((best, s) => {
                const diff = Math.abs(s.w_mm - pxToSize.w_mm) + Math.abs(s.h_mm - pxToSize.h_mm);
                const bestDiff = Math.abs(best.w_mm - pxToSize.w_mm) + Math.abs(best.h_mm - pxToSize.h_mm);
                return diff < bestDiff ? s : best;
              });
              return `${closest.name}（${closest.w_mm}×${closest.h_mm}mm）`;
            })()}
          </div>
        </div>
      )}

      {/* Reference table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">標準サイズ対応表（{dpi}dpi）</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600 font-medium">
              <th className="text-left py-2 pr-3">サイズ</th>
              <th className="text-right py-2 pr-3">mm</th>
              <th className="text-right py-2">ピクセル</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {STANDARD_SIZES.filter(s => s.w_mm > 0).map((s) => {
              const pw = Math.round(mmToInch(s.w_mm) * dpi);
              const ph = Math.round(mmToInch(s.h_mm) * dpi);
              return (
                <tr key={s.name} className="hover:bg-gray-50">
                  <td className="py-2 pr-3 font-medium text-gray-800">{s.name}</td>
                  <td className="py-2 pr-3 text-right text-gray-600">{s.w_mm}×{s.h_mm}</td>
                  <td className="py-2 text-right text-gray-700">{pw.toLocaleString()}×{ph.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
        active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function BigCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400">{unit}</div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この写真印刷サイズ ↔ ピクセル変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">印刷サイズとピクセル数の相互変換（DPI対応）。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この写真印刷サイズ ↔ ピクセル変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "印刷サイズとピクセル数の相互変換（DPI対応）。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "写真印刷サイズ ↔ ピクセル変換",
  "description": "印刷サイズとピクセル数の相互変換（DPI対応）",
  "url": "https://tools.loresync.dev/print-size-pixels",
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
