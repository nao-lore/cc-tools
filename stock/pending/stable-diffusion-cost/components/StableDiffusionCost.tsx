"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface Provider {
  id: string;
  name: string;
  logo: string;
  model: string;
  pricePerImage: number; // USD
  pricingNote: string;
  minBilling: string;
  features: string[];
  url: string;
}

const PROVIDERS: Provider[] = [
  {
    id: "replicate",
    name: "Replicate",
    logo: "🔁",
    model: "SDXL / SD3",
    pricePerImage: 0.0023,
    pricingNote: "SDXL: $0.0023/画像（512ステップ基準）",
    minBilling: "使った分だけ",
    features: ["SDXL・SD3対応", "各種LoRA対応", "APIシンプル", "Pay-as-you-go"],
    url: "https://replicate.com",
  },
  {
    id: "stability",
    name: "Stability AI",
    logo: "🧠",
    model: "SD3 / SDXL",
    pricePerImage: 0.003,
    pricingNote: "SD3 Medium: $0.035/画像、SDXL: $0.002〜",
    minBilling: "クレジット制",
    features: ["公式モデル", "SD3最新版", "高品質出力", "APIアクセス"],
    url: "https://stability.ai",
  },
  {
    id: "fal",
    name: "fal.ai",
    logo: "⚡",
    model: "FLUX / SDXL",
    pricePerImage: 0.0025,
    pricingNote: "FLUX.1 Schnell: $0.003/画像、SDXL: ~$0.002",
    minBilling: "使った分だけ",
    features: ["FLUX.1対応", "高速生成", "日本語プロンプト可", "Serverless"],
    url: "https://fal.ai",
  },
  {
    id: "together",
    name: "Together AI",
    logo: "🤝",
    model: "FLUX / SDXL",
    pricePerImage: 0.002,
    pricingNote: "FLUX.1 Schnell: $0.002/画像",
    minBilling: "使った分だけ",
    features: ["FLUX最安クラス", "LLMも同時利用可", "シンプルAPI", "Pay-as-you-go"],
    url: "https://together.ai",
  },
];

const QUALITY_MULTIPLIERS = [
  { label: "高速（20ステップ）", value: 0.5 },
  { label: "標準（50ステップ）", value: 1.0 },
  { label: "高品質（100ステップ）", value: 1.8 },
];

function formatJPY(usd: number, rate: number): string {
  return Math.round(usd * rate).toLocaleString("ja-JP");
}

export default function StableDiffusionCost() {
  const [monthlyImages, setMonthlyImages] = useState(500);
  const [qualityIdx, setQualityIdx] = useState(1);
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    PROVIDERS.map((p) => p.id)
  );

  const quality = QUALITY_MULTIPLIERS[qualityIdx];

  const results = useMemo(() => {
    return PROVIDERS.filter((p) => selectedProviders.includes(p.id)).map((p) => {
      const effectivePrice = p.pricePerImage * quality.value;
      const totalUSD = effectivePrice * monthlyImages;
      const totalJPY = totalUSD * usdRate;
      return { ...p, effectivePrice, totalUSD, totalJPY };
    }).sort((a, b) => a.totalUSD - b.totalUSD);
  }, [monthlyImages, qualityIdx, usdRate, selectedProviders, quality]);

  const cheapest = results[0];

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">利用条件を設定</h2>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">月間生成枚数</label>
            <span className="text-sm font-bold text-blue-600">
              {monthlyImages.toLocaleString("ja-JP")} 枚/月
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={monthlyImages}
            onChange={(e) => setMonthlyImages(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>100</span><span>10,000</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">生成クオリティ</label>
          <div className="flex gap-2 flex-wrap">
            {QUALITY_MULTIPLIERS.map((q, i) => (
              <button
                key={i}
                onClick={() => setQualityIdx(i)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  qualityIdx === i
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">為替レート（1 USD =）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={usdRate}
              min={100}
              max={200}
              step={1}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-sm text-gray-600">円</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">比較するプロバイダー</label>
          <div className="flex gap-2 flex-wrap">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleProvider(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedProviders.includes(p.id)
                    ? "bg-blue-50 border-blue-400 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
              >
                {p.logo} {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Best pick */}
      {cheapest && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-600 text-xl">★</span>
            <span className="font-semibold text-blue-800">最安プロバイダー</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {cheapest.logo} {cheapest.name} — 月{Math.round(cheapest.totalJPY).toLocaleString("ja-JP")}円
          </p>
          <p className="text-sm text-blue-700 mt-1">
            月{monthlyImages.toLocaleString()}枚 × 1枚約{Math.round(cheapest.effectivePrice * usdRate * 10) / 10}円（{quality.label}）
          </p>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">プロバイダー別コスト比較</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">プロバイダー</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">1枚あたり</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">月間コスト</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">年間コスト</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">特徴</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-t border-gray-100 ${i === 0 ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.logo}</span>
                      <div>
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.model}</div>
                      </div>
                      {i === 0 && (
                        <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">最安</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-gray-900">
                      ¥{Math.round(p.effectivePrice * usdRate * 100) / 100}
                    </div>
                    <div className="text-xs text-gray-500">${p.effectivePrice.toFixed(4)}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-gray-900">
                      ¥{Math.round(p.totalJPY).toLocaleString("ja-JP")}
                    </div>
                    <div className="text-xs text-gray-500">${p.totalUSD.toFixed(2)}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-gray-700">
                      ¥{Math.round(p.totalJPY * 12).toLocaleString("ja-JP")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.features.map((f) => (
                        <span key={f} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDERS.filter((p) => selectedProviders.includes(p.id)).map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
            <div className="font-semibold text-gray-800 mb-1">
              {p.logo} {p.name}
            </div>
            <p className="text-gray-600 text-xs mb-1">{p.pricingNote}</p>
            <p className="text-gray-500 text-xs">請求: {p.minBilling}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 料金は2024年時点の公式ドキュメントをもとにした概算です。モデルやオプションにより変動します。</p>
        <p>※ ステップ数・解像度・LoRAの有無によりコストが変わります。実際の請求は各プロバイダーでご確認ください。</p>
      </div>
    </div>
  );
}
