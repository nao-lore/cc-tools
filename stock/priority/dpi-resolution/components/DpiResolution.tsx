"use client";

import { useState } from "react";

// --- 型定義 ---
type Mode = "pixel-to-size" | "size-to-pixel";

type PaperPreset = {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
};

type DpiPreset = {
  dpi: number;
  label: string;
  usage: string;
  badge: string;
};

// --- プリセットデータ ---
const PAPER_PRESETS: PaperPreset[] = [
  { id: "a4", name: "A4", widthMm: 210, heightMm: 297 },
  { id: "a3", name: "A3", widthMm: 297, heightMm: 420 },
  { id: "b5", name: "B5", widthMm: 182, heightMm: 257 },
  { id: "l", name: "L判（写真）", widthMm: 89, heightMm: 127 },
  { id: "2l", name: "2L判（写真）", widthMm: 127, heightMm: 178 },
  { id: "meishi", name: "名刺", widthMm: 55, heightMm: 91 },
];

const DPI_PRESETS: DpiPreset[] = [
  { dpi: 300, label: "300 DPI", usage: "印刷（推奨）", badge: "bg-purple-100 text-purple-700", },
  { dpi: 150, label: "150 DPI", usage: "大判印刷", badge: "bg-indigo-100 text-indigo-700", },
  { dpi: 72, label: "72 DPI", usage: "Web・画面表示", badge: "bg-violet-100 text-violet-700", },
];

const DPI_TABLE: { dpi: number; label: string; usage: string; note: string }[] = [
  { dpi: 300, label: "300 DPI", usage: "一般的な印刷物", note: "名刺・チラシ・ポスターの標準。テキストがくっきり印刷される" },
  { dpi: 150, label: "150 DPI", usage: "大判ポスター・バナー", note: "離れて見る大型印刷物向け。データサイズを抑えられる" },
  { dpi: 96, label: "96 DPI", usage: "Windowsスクリーン", note: "Windows標準解像度。画面表示専用" },
  { dpi: 72, label: "72 DPI", usage: "Web・SNS画像", note: "Mac伝統の画面解像度。Web公開画像に使われることが多い" },
];

// --- 計算ロジック ---
function mmToInch(mm: number): number {
  return mm / 25.4;
}

function pixelsFromSize(sizeMm: number, dpi: number): number {
  return Math.round(mmToInch(sizeMm) * dpi);
}

function sizeFromPixels(pixels: number, dpi: number): number {
  // mm に変換
  return (pixels / dpi) * 25.4;
}

function formatMm(mm: number): string {
  return mm.toFixed(1);
}

// --- メインコンポーネント ---
export default function DpiResolution() {
  const [mode, setMode] = useState<Mode>("pixel-to-size");

  // ピクセル→サイズ モード
  const [pxWidth, setPxWidth] = useState<string>("3508");
  const [pxHeight, setPxHeight] = useState<string>("4961");
  const [dpiForSize, setDpiForSize] = useState<number>(300);

  // サイズ→ピクセル モード
  const [widthMm, setWidthMm] = useState<string>("210");
  const [heightMm, setHeightMm] = useState<string>("297");
  const [dpiForPixel, setDpiForPixel] = useState<number>(300);
  const [selectedPreset, setSelectedPreset] = useState<string>("a4");

  // --- 計算結果 ---
  const pixelToSizeResult = (() => {
    const w = parseFloat(pxWidth);
    const h = parseFloat(pxHeight);
    if (!w || !h || w <= 0 || h <= 0) return null;
    const wMm = sizeFromPixels(w, dpiForSize);
    const hMm = sizeFromPixels(h, dpiForSize);
    const wCm = wMm / 10;
    const hCm = hMm / 10;
    const wInch = w / dpiForSize;
    const hInch = h / dpiForSize;
    return { wMm, hMm, wCm, hCm, wInch, hInch };
  })();

  const sizeToPixelResult = (() => {
    const w = parseFloat(widthMm);
    const h = parseFloat(heightMm);
    if (!w || !h || w <= 0 || h <= 0) return null;
    const wPx = pixelsFromSize(w, dpiForPixel);
    const hPx = pixelsFromSize(h, dpiForPixel);
    const mp = (wPx * hPx) / 1_000_000;
    return { wPx, hPx, mp };
  })();

  function applyPreset(preset: PaperPreset) {
    setSelectedPreset(preset.id);
    setWidthMm(String(preset.widthMm));
    setHeightMm(String(preset.heightMm));
  }

  return (
    <div className="space-y-6">
      {/* モード切替 */}
      <div className="flex rounded-xl overflow-hidden border border-purple-200 bg-white shadow-sm">
        <button
          onClick={() => setMode("pixel-to-size")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            mode === "pixel-to-size"
              ? "bg-purple-600 text-white"
              : "text-purple-700 hover:bg-purple-50"
          }`}
        >
          ピクセル → 印刷サイズ
        </button>
        <button
          onClick={() => setMode("size-to-pixel")}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            mode === "size-to-pixel"
              ? "bg-purple-600 text-white"
              : "text-purple-700 hover:bg-purple-50"
          }`}
        >
          印刷サイズ → 必要ピクセル
        </button>
      </div>

      {/* ピクセル→サイズ */}
      {mode === "pixel-to-size" && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-purple-900">画像サイズから印刷サイズを計算</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">幅（ピクセル）</label>
              <input
                type="number"
                min="1"
                value={pxWidth}
                onChange={(e) => setPxWidth(e.target.value)}
                className="w-full border border-purple-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="3508"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">高さ（ピクセル）</label>
              <input
                type="number"
                min="1"
                value={pxHeight}
                onChange={(e) => setPxHeight(e.target.value)}
                className="w-full border border-purple-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="4961"
              />
            </div>
          </div>

          {/* DPI選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">DPI（解像度）</label>
            <div className="flex gap-2 flex-wrap">
              {DPI_PRESETS.map((p) => (
                <button
                  key={p.dpi}
                  onClick={() => setDpiForSize(p.dpi)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    dpiForSize === p.dpi
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-purple-200 text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {p.label}
                  <span className="ml-1 text-xs opacity-75">（{p.usage}）</span>
                </button>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="2400"
                  value={DPI_PRESETS.some((p) => p.dpi === dpiForSize) ? "" : dpiForSize}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (v > 0) setDpiForSize(v);
                  }}
                  placeholder="カスタム"
                  className="w-24 border border-purple-200 rounded-lg px-2 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <span className="text-sm text-gray-500">DPI</span>
              </div>
            </div>
          </div>

          {/* 結果 */}
          {pixelToSizeResult && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-3">印刷サイズ</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-2xl font-bold text-purple-700">
                    {formatMm(pixelToSizeResult.wMm)} × {formatMm(pixelToSizeResult.hMm)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">mm</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-2xl font-bold text-indigo-700">
                    {pixelToSizeResult.wCm.toFixed(1)} × {pixelToSizeResult.hCm.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">cm</p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-2xl font-bold text-violet-700">
                    {pixelToSizeResult.wInch.toFixed(2)} × {pixelToSizeResult.hInch.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">inch</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {pxWidth} × {pxHeight} px @ {dpiForSize} DPI
              </p>
            </div>
          )}
        </div>
      )}

      {/* サイズ→ピクセル */}
      {mode === "size-to-pixel" && (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-purple-900">印刷サイズから必要ピクセル数を計算</h2>

          {/* 用紙プリセット */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">用紙サイズ プリセット</label>
            <div className="flex flex-wrap gap-2">
              {PAPER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedPreset === preset.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">幅（mm）</label>
              <input
                type="number"
                min="1"
                value={widthMm}
                onChange={(e) => { setWidthMm(e.target.value); setSelectedPreset(""); }}
                className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">高さ（mm）</label>
              <input
                type="number"
                min="1"
                value={heightMm}
                onChange={(e) => { setHeightMm(e.target.value); setSelectedPreset(""); }}
                className="w-full border border-indigo-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="297"
              />
            </div>
          </div>

          {/* DPI選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">DPI（解像度）</label>
            <div className="flex gap-2 flex-wrap">
              {DPI_PRESETS.map((p) => (
                <button
                  key={p.dpi}
                  onClick={() => setDpiForPixel(p.dpi)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    dpiForPixel === p.dpi
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  }`}
                >
                  {p.label}
                  <span className="ml-1 text-xs opacity-75">（{p.usage}）</span>
                </button>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="2400"
                  value={DPI_PRESETS.some((p) => p.dpi === dpiForPixel) ? "" : dpiForPixel}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (v > 0) setDpiForPixel(v);
                  }}
                  placeholder="カスタム"
                  className="w-24 border border-indigo-200 rounded-lg px-2 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <span className="text-sm text-gray-500">DPI</span>
              </div>
            </div>
          </div>

          {/* 結果 */}
          {sizeToPixelResult && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-3">必要ピクセル数</p>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-indigo-700">
                  {sizeToPixelResult.wPx.toLocaleString()} × {sizeToPixelResult.hPx.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">px</p>
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
                  <p className="font-bold text-purple-700">{sizeToPixelResult.mp.toFixed(1)} MP</p>
                  <p className="text-xs text-gray-500">メガピクセル</p>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm text-center">
                  <p className="font-bold text-violet-700">{(sizeToPixelResult.wPx * sizeToPixelResult.hPx).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">総ピクセル数</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {widthMm} × {heightMm} mm @ {dpiForPixel} DPI
              </p>
            </div>
          )}
        </div>
      )}

      {/* 推奨DPI表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
        <h2 className="text-lg font-bold text-purple-900 mb-4">推奨 DPI 早見表</h2>
        <div className="space-y-3">
          {DPI_TABLE.map((row) => (
            <div key={row.dpi} className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="inline-block min-w-[72px] text-center px-2 py-1 rounded-lg bg-purple-200 text-purple-800 text-sm font-bold">
                {row.label}
              </span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{row.usage}</p>
                <p className="text-xs text-gray-500 mt-0.5">{row.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このDPI / 解像度 / 印刷サイズ計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">印刷サイズとDPIからピクセル数を計算、またはピクセル数から印刷可能サイズを逆算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このDPI / 解像度 / 印刷サイズ計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "印刷サイズとDPIからピクセル数を計算、またはピクセル数から印刷可能サイズを逆算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
