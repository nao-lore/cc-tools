"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---
type DalleModel = "dalle3" | "dalle2";
type Quality = "standard" | "hd";
type Resolution3 = "1024x1024" | "1024x1792" | "1792x1024";
type Resolution2 = "1024x1024" | "512x512" | "256x256";

type PriceEntry = {
  usd: number;
  label: string;
};

const DALLE3_PRICES: Record<Quality, Record<Resolution3, PriceEntry>> = {
  standard: {
    "1024x1024": { usd: 0.04, label: "1024×1024" },
    "1024x1792": { usd: 0.08, label: "1024×1792" },
    "1792x1024": { usd: 0.08, label: "1792×1024" },
  },
  hd: {
    "1024x1024": { usd: 0.08, label: "1024×1024" },
    "1024x1792": { usd: 0.12, label: "1024×1792" },
    "1792x1024": { usd: 0.12, label: "1792×1024" },
  },
};

const DALLE2_PRICES: Record<Resolution2, PriceEntry> = {
  "1024x1024": { usd: 0.02, label: "1024×1024" },
  "512x512": { usd: 0.018, label: "512×512" },
  "256x256": { usd: 0.016, label: "256×256" },
};

// 比較データ（1枚あたりの参考価格）
const COMPARISON = [
  {
    service: "DALL-E 3 Standard 1024×1024",
    pricePerImage: 0.04,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    service: "Midjourney Basic ($10/月 200枚)",
    pricePerImage: 0.05,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    service: "Stable Diffusion API (Stability AI)",
    pricePerImage: 0.002,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    service: "DALL-E 3 HD 1024×1024",
    pricePerImage: 0.08,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    service: "Midjourney Standard ($30/月 無制限)",
    pricePerImage: null,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
];

function fmtUSD(n: number): string {
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function DallePricing() {
  const [model, setModel] = useState<DalleModel>("dalle3");
  const [quality, setQuality] = useState<Quality>("standard");
  const [resolution3, setResolution3] = useState<Resolution3>("1024x1024");
  const [resolution2, setResolution2] = useState<Resolution2>("1024x1024");
  const [imageCount, setImageCount] = useState<number>(100);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  // 現在の単価
  const unitPrice = useMemo(() => {
    if (model === "dalle3") {
      return DALLE3_PRICES[quality][resolution3].usd;
    }
    return DALLE2_PRICES[resolution2].usd;
  }, [model, quality, resolution3, resolution2]);

  // コスト計算
  const cost = useMemo(() => {
    const total = unitPrice * imageCount;
    const perDay = total;
    const perMonth = unitPrice * imageCount * 30;
    return { perImage: unitPrice, total, perMonth };
  }, [unitPrice, imageCount]);

  const resolutions3 = Object.keys(DALLE3_PRICES.standard) as Resolution3[];
  const resolutions2 = Object.keys(DALLE2_PRICES) as Resolution2[];

  return (
    <div className="space-y-6">
      {/* ===== モデル選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">モデルを選択</h2>
        <div className="flex gap-2 flex-wrap">
          {(["dalle3", "dalle2"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                model === m
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm ring-2 ring-emerald-400"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {m === "dalle3" ? "DALL-E 3" : "DALL-E 2"}
            </button>
          ))}
        </div>

        {/* DALL-E 3 オプション */}
        {model === "dalle3" && (
          <div className="mt-5 space-y-4">
            {/* 品質 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">品質</div>
              <div className="flex gap-2 flex-wrap">
                {(["standard", "hd"] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      quality === q
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {q === "standard" ? "Standard" : "HD（高品質）"}
                  </button>
                ))}
              </div>
            </div>

            {/* 解像度 */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">解像度</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {resolutions3.map((r) => {
                  const price = DALLE3_PRICES[quality][r];
                  return (
                    <button
                      key={r}
                      onClick={() => setResolution3(r)}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                        resolution3 === r
                          ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-800">{price.label}</span>
                      <span className="text-xs text-emerald-600 font-bold mt-1">
                        {fmtUSD(price.usd)}/枚
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* DALL-E 2 オプション */}
        {model === "dalle2" && (
          <div className="mt-5">
            <div className="text-sm font-medium text-gray-700 mb-2">解像度</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {resolutions2.map((r) => {
                const price = DALLE2_PRICES[r];
                return (
                  <button
                    key={r}
                    onClick={() => setResolution2(r)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                      resolution2 === r
                        ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-800">{price.label}</span>
                    <span className="text-xs text-emerald-600 font-bold mt-1">
                      {fmtUSD(price.usd)}/枚
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== 枚数・為替設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">枚数・設定</h2>
        <div className="space-y-5">
          {/* 枚数スライダー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生成枚数
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10000}
                step={1}
                value={imageCount}
                onChange={(e) => setImageCount(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  value={imageCount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v) && v > 0) setImageCount(v);
                  }}
                  className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">枚</span>
              </div>
            </div>
          </div>

          {/* 為替レート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              為替レート
            </label>
            <div className="flex items-center gap-2 w-fit">
              <span className="text-sm text-gray-500">1 USD =</span>
              <input
                type="number"
                min={50}
                max={300}
                step={1}
                value={exchangeRate}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v) && v > 0) setExchangeRate(v);
                }}
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">計算結果</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
            {model === "dalle3" ? "DALL-E 3" : "DALL-E 2"} / {unitPrice === DALLE3_PRICES.standard["1024x1024"].usd || model === "dalle2" ? "" : quality === "hd" ? "HD / " : "Standard / "}
            {model === "dalle3"
              ? DALLE3_PRICES[quality][resolution3].label
              : DALLE2_PRICES[resolution2].label}
          </span>
        </div>

        {/* 1枚あたり */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">1枚あたりの料金</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">{fmtUSD(cost.perImage)}</span>
            <span className="text-xl text-gray-600">{fmtJPY(cost.perImage * exchangeRate)}</span>
          </div>
        </div>

        {/* 単発・月間 */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: `${imageCount.toLocaleString()}枚の合計`, usd: cost.total },
            { label: `月間（毎日${imageCount.toLocaleString()}枚）`, usd: cost.perMonth },
          ].map(({ label, usd }) => (
            <div key={label} className="bg-white bg-opacity-70 rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="text-xl font-bold text-gray-900">{fmtUSD(usd)}</div>
              <div className="text-xs text-gray-600 mt-0.5">{fmtJPY(usd * exchangeRate)}</div>
            </div>
          ))}
        </div>

        {/* 内訳 */}
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-xl text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-700 mb-1.5">コスト内訳</div>
          <div className="flex justify-between">
            <span>単価 {fmtUSD(cost.perImage)} × {imageCount.toLocaleString()}枚</span>
            <span className="font-medium">{fmtUSD(cost.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>月間（×30日）</span>
            <span className="font-medium">{fmtUSD(cost.perMonth)}</span>
          </div>
          <div className="flex justify-between">
            <span>円換算（1USD = {exchangeRate}円）</span>
            <span className="font-medium">{fmtJPY(cost.total * exchangeRate)}</span>
          </div>
        </div>
      </div>

      {/* ===== 全解像度・品質一覧 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">全料金一覧</h2>
        <p className="text-xs text-gray-500 mb-4">
          {imageCount.toLocaleString()}枚あたりのコストで比較
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">品質</th>
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">解像度</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">単価</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">{imageCount.toLocaleString()}枚</th>
              </tr>
            </thead>
            <tbody>
              {/* DALL-E 3 rows */}
              {(["standard", "hd"] as const).flatMap((q) =>
                resolutions3.map((r) => {
                  const price = DALLE3_PRICES[q][r];
                  const isSelected =
                    model === "dalle3" && quality === q && resolution3 === r;
                  return (
                    <tr
                      key={`dalle3-${q}-${r}`}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${
                        isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setModel("dalle3");
                        setQuality(q);
                        setResolution3(r);
                      }}
                    >
                      <td className="py-2 pr-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          DALL-E 3
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-gray-600 text-xs">{q === "standard" ? "Standard" : "HD"}</td>
                      <td className="py-2 pr-3 text-gray-700 font-medium">{price.label}</td>
                      <td className="py-2 pr-3 text-right text-gray-600">{fmtUSD(price.usd)}</td>
                      <td className="py-2 text-right font-semibold text-gray-900">
                        {fmtUSD(price.usd * imageCount)}
                        {isSelected && (
                          <span className="ml-1.5 text-xs text-gray-400">← 選択中</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              {/* DALL-E 2 rows */}
              {resolutions2.map((r) => {
                const price = DALLE2_PRICES[r];
                const isSelected = model === "dalle2" && resolution2 === r;
                return (
                  <tr
                    key={`dalle2-${r}`}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setModel("dalle2");
                      setResolution2(r);
                    }}
                  >
                    <td className="py-2 pr-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        DALL-E 2
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-400 text-xs">—</td>
                    <td className="py-2 pr-3 text-gray-700 font-medium">{price.label}</td>
                    <td className="py-2 pr-3 text-right text-gray-600">{fmtUSD(price.usd)}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      {fmtUSD(price.usd * imageCount)}
                      {isSelected && (
                        <span className="ml-1.5 text-xs text-gray-400">← 選択中</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">行をクリックするとそのプランに切り替わります</p>
      </div>

      {/* ===== 競合比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">他サービスとの比較</h2>
        <p className="text-xs text-gray-500 mb-4">1枚あたりの参考単価（目安）</p>

        <div className="space-y-2">
          {COMPARISON.map((item) => (
            <div
              key={item.service}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${item.color}`}
            >
              <span className="font-medium">{item.service}</span>
              <span className="font-bold shrink-0 ml-4">
                {item.pricePerImage === null ? "定額制" : fmtUSD(item.pricePerImage) + "/枚"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          ※ Midjourney は月額サブスク。Stable Diffusion API は Stability AI の価格例。実際の価格はプランにより異なります。
        </p>
      </div>

      {/* ===== フッター注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金は OpenAI の公式サイトをご確認ください。
      </p>
    </div>
  );
}
