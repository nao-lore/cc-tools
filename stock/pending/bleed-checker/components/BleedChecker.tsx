"use client";
import { useState, useMemo } from "react";

type PresetKey = keyof typeof PRESETS;

const PRESETS = {
  "A4": { w: 210, h: 297 },
  "A5": { w: 148, h: 210 },
  "B5": { w: 182, h: 257 },
  "名刺": { w: 91, h: 55 },
  "ハガキ": { w: 100, h: 148 },
  "チラシA4": { w: 210, h: 297 },
  "B2ポスター": { w: 515, h: 728 },
  "カスタム": { w: 0, h: 0 },
};

const BLEED_OPTIONS = [3, 5, 10];

export default function BleedChecker() {
  const [preset, setPreset] = useState<PresetKey>("A4");
  const [customW, setCustomW] = useState(210);
  const [customH, setCustomH] = useState(297);
  const [bleed, setBleed] = useState(3);
  const [safetyMargin, setSafetyMargin] = useState(3);

  const finishW = preset === "カスタム" ? customW : PRESETS[preset].w;
  const finishH = preset === "カスタム" ? customH : PRESETS[preset].h;

  const result = useMemo(() => {
    const totalW = finishW + bleed * 2;
    const totalH = finishH + bleed * 2;
    const safeW = finishW - safetyMargin * 2;
    const safeH = finishH - safetyMargin * 2;
    return { totalW, totalH, safeW, safeH };
  }, [finishW, finishH, bleed, safetyMargin]);

  // Visual preview scaling
  const maxPreviewSize = 280;
  const scale = Math.min(maxPreviewSize / result.totalW, maxPreviewSize / result.totalH);
  const previewTotalW = result.totalW * scale;
  const previewTotalH = result.totalH * scale;
  const previewBleedPx = bleed * scale;
  const previewSafeMarginPx = safetyMargin * scale;
  const previewFinishW = finishW * scale;
  const previewFinishH = finishH * scale;

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">サイズ設定</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プリセット</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={preset}
              onChange={(e) => setPreset(e.target.value as PresetKey)}
            >
              {Object.keys(PRESETS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Bleed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">塗り足し幅</label>
            <div className="flex gap-2">
              {BLEED_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBleed(b)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    bleed === b
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {b}mm
                </button>
              ))}
            </div>
          </div>

          {/* Custom size */}
          {preset === "カスタム" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">幅（mm）</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={customW}
                  min={1}
                  onChange={(e) => setCustomW(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">高さ（mm）</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={customH}
                  min={1}
                  onChange={(e) => setCustomH(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {/* Safety margin */}
          <div className={preset === "カスタム" ? "sm:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              安全領域（仕上がりから内側）: {safetyMargin}mm
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={safetyMargin}
              onChange={(e) => setSafetyMargin(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1mm</span><span>10mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Numbers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">計算結果</h2>

          <div className="space-y-3">
            <ResultRow
              color="bg-red-100 border-red-300 text-red-800"
              label="入稿サイズ（塗り足し込み）"
              value={`${result.totalW} × ${result.totalH} mm`}
              note="この外側まで背景・色を延ばす"
            />
            <ResultRow
              color="bg-blue-100 border-blue-300 text-blue-800"
              label="仕上がりサイズ（カット位置）"
              value={`${finishW} × ${finishH} mm`}
              note="ここで断裁される"
            />
            <ResultRow
              color="bg-green-100 border-green-300 text-green-800"
              label="安全領域（内側）"
              value={`${result.safeW} × ${result.safeH} mm`}
              note="テキスト・ロゴはこの内側に配置"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
            <Detail label="塗り足し幅" value={`各辺 ${bleed}mm`} />
            <Detail label="安全マージン" value={`各辺 ${safetyMargin}mm`} />
            <Detail label="入稿面積" value={`${(result.totalW * result.totalH / 100).toFixed(1)} cm²`} />
          </div>
        </div>

        {/* Visual preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 self-start">プレビュー</h2>
          <div
            className="relative bg-red-200 rounded"
            style={{ width: previewTotalW, height: previewTotalH }}
            title="塗り足しエリア（赤）"
          >
            {/* Finish area */}
            <div
              className="absolute bg-blue-100 border-2 border-blue-400"
              style={{
                left: previewBleedPx,
                top: previewBleedPx,
                width: previewFinishW,
                height: previewFinishH,
              }}
            >
              {/* Safe area */}
              <div
                className="absolute bg-green-100 border-2 border-dashed border-green-500 flex items-center justify-center"
                style={{
                  left: previewSafeMarginPx,
                  top: previewSafeMarginPx,
                  width: previewFinishW - previewSafeMarginPx * 2,
                  height: previewFinishH - previewSafeMarginPx * 2,
                }}
              >
                <span className="text-[10px] text-green-700 font-medium text-center leading-tight px-1">
                  安全領域
                </span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs justify-center">
            <LegendItem color="bg-red-200" label="塗り足しエリア" />
            <LegendItem color="bg-blue-100 border-2 border-blue-400" label="仕上がり" />
            <LegendItem color="bg-green-100 border-2 border-dashed border-green-500" label="安全領域" />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">入稿時のポイント</h3>
        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
          <li>塗り足しエリア（赤）まで背景色・写真を延ばすことで断裁ずれを防止できます</li>
          <li>テキストや重要な要素は安全領域（緑の点線）内に収めてください</li>
          <li>一般的な印刷物は塗り足し3mm、高品質・大判は5mm以上推奨</li>
          <li>入稿ファイルはトンボ付きで書き出すと印刷所で確認しやすくなります</li>
        </ul>
      </div>
    </div>
  );
}

function ResultRow({
  color, label, value, note,
}: {
  color: string; label: string; value: string; note: string;
}) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${color}`}>
      <div className="text-xs font-medium opacity-75 mb-0.5">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs opacity-60 mt-0.5">{note}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-4 h-4 rounded ${color}`} />
      <span className="text-gray-600">{label}</span>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この塗り足しチェッカーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">入稿サイズから塗り足し・仕上がり・安全領域を視覚化。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この塗り足しチェッカーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "入稿サイズから塗り足し・仕上がり・安全領域を視覚化。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "塗り足しチェッカー",
  "description": "入稿サイズから塗り足し・仕上がり・安全領域を視覚化",
  "url": "https://tools.loresync.dev/bleed-checker",
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
