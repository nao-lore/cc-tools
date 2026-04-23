"use client";

import { useState } from "react";

type SafetyColor = {
  name: string;
  nameEn: string;
  hex: string;
  rgb: [number, number, number];
  munsell: string;
  usage: string;
  contrastColor: string;
  contrastHex: string;
};

const SAFETY_COLORS: SafetyColor[] = [
  {
    name: "赤",
    nameEn: "Red",
    hex: "#C00000",
    rgb: [192, 0, 0],
    munsell: "7.5R 4/14",
    usage: "防火・禁止・停止・危険",
    contrastColor: "白",
    contrastHex: "#FFFFFF",
  },
  {
    name: "黄赤",
    nameEn: "Yellow-Red",
    hex: "#FF6600",
    rgb: [255, 102, 0],
    munsell: "2.5YR 6/14",
    usage: "危険・警告（放射線・生物学的危険）",
    contrastColor: "黒",
    contrastHex: "#000000",
  },
  {
    name: "黄",
    nameEn: "Yellow",
    hex: "#FFD700",
    rgb: [255, 215, 0],
    munsell: "2.5Y 8/14",
    usage: "注意・注意促進",
    contrastColor: "黒",
    contrastHex: "#000000",
  },
  {
    name: "緑",
    nameEn: "Green",
    hex: "#007B43",
    rgb: [0, 123, 67],
    munsell: "10G 4/10",
    usage: "安全・避難・救護・進行",
    contrastColor: "白",
    contrastHex: "#FFFFFF",
  },
  {
    name: "青",
    nameEn: "Blue",
    hex: "#0050A0",
    rgb: [0, 80, 160],
    munsell: "2.5PB 3/10",
    usage: "指示・注意（機械的危険）",
    contrastColor: "白",
    contrastHex: "#FFFFFF",
  },
  {
    name: "赤紫",
    nameEn: "Red-Purple",
    hex: "#9B004B",
    rgb: [155, 0, 75],
    munsell: "5RP 3/10",
    usage: "放射線の危険",
    contrastColor: "白",
    contrastHex: "#FFFFFF",
  },
  {
    name: "白",
    nameEn: "White",
    hex: "#FFFFFF",
    rgb: [255, 255, 255],
    munsell: "N 9.5",
    usage: "通路・整理・対比色",
    contrastColor: "黒",
    contrastHex: "#000000",
  },
  {
    name: "黒",
    nameEn: "Black",
    hex: "#000000",
    rgb: [0, 0, 0],
    munsell: "N 1",
    usage: "対比色（黄との組合せ）",
    contrastColor: "黄",
    contrastHex: "#FFD700",
  },
];

type CopyTarget = { id: string; label: string };

export default function JisColorCodes() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  };

  return (
    <div className="space-y-6">
      {/* Reference note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <span className="font-semibold">JIS Z 9103:2018</span> — 安全色及び安全標識による安全情報の提供通則
      </div>

      {/* Color grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SAFETY_COLORS.map((color) => {
          const textColor = isLight(color.hex) ? "text-gray-900" : "text-white";
          const subTextColor = isLight(color.hex) ? "text-gray-700" : "text-gray-200";
          const hexId = `${color.name}-hex`;
          const rgbId = `${color.name}-rgb`;

          return (
            <div
              key={color.name}
              className="rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col"
            >
              {/* Swatch */}
              <div
                className="h-32 flex flex-col items-center justify-center gap-1 px-4"
                style={{ backgroundColor: color.hex }}
              >
                <span className={`text-2xl font-bold ${textColor}`}>{color.name}</span>
                <span className={`text-sm ${subTextColor}`}>{color.nameEn}</span>
              </div>

              {/* Info */}
              <div className="p-4 bg-white flex-1 space-y-3">
                {/* Usage */}
                <p className="text-xs text-gray-600 leading-relaxed">{color.usage}</p>

                {/* Munsell */}
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Munsell: </span>
                  {color.munsell}
                </div>

                {/* Contrast recommendation */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="font-medium text-gray-700">対比色:</span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: color.contrastHex,
                      color: isLight(color.contrastHex) ? "#111" : "#fff",
                      borderColor: color.contrastHex === "#FFFFFF" ? "#d1d5db" : color.contrastHex,
                    }}
                  >
                    {color.contrastColor}
                  </span>
                </div>

                {/* Copy buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(color.hex, hexId)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors font-mono"
                    title="クリックでコピー"
                  >
                    {copied === hexId ? "コピー済 ✓" : color.hex}
                  </button>
                  <button
                    onClick={() =>
                      handleCopy(
                        `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`,
                        rgbId
                      )
                    }
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors font-mono"
                    title="クリックでコピー"
                  >
                    {copied === rgbId
                      ? "コピー済 ✓"
                      : `${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">安全色の使い方</h2>
        <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
          <li>安全色は対比色と組み合わせて使用します（例: 赤＋白、黄＋黒）</li>
          <li>Munsell値は色の色相・明度・彩度を示す表色系の値です</li>
          <li>実際の塗料・製品では蛍光色・再帰反射材を使用する場合があります</li>
          <li>ディスプレイ上の色は印刷物・実物と異なる場合があります</li>
        </ul>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    </div>
  );
}
