"use client";

import { useState, useMemo } from "react";

const JPY_RATE = 150; // USD per JPY reference

interface Chain {
  name: string;
  symbol: string;
  icon: string;
  type: "EVM" | "Solana" | "Other";
  nativePriceJPY: number;
  mintGasUnits: number;
  gasPriceGwei: number;
  flatFeeNative: number;
  platformNote: string;
  pros: string[];
  cons: string[];
  color: string;
}

const CHAINS: Chain[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: "⟠",
    type: "EVM",
    nativePriceJPY: 450000,
    mintGasUnits: 90000,
    gasPriceGwei: 25,
    flatFeeNative: 0,
    platformNote: "OpenSea・Rarible等の主要市場",
    pros: ["最大の流動性", "高い信頼性", "多数のマーケット"],
    cons: ["ガス代が高い", "環境負荷"],
    color: "slate",
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    icon: "⬡",
    type: "EVM",
    nativePriceJPY: 90,
    mintGasUnits: 90000,
    gasPriceGwei: 100,
    flatFeeNative: 0,
    platformNote: "OpenSea・Rarible（ポリゴン対応）",
    pros: ["ガス代ほぼ無料", "OpenSea対応", "高速処理"],
    cons: ["流動性がEthより低い", "ブリッジ必要"],
    color: "purple",
  },
  {
    name: "Solana",
    symbol: "SOL",
    icon: "◎",
    type: "Solana",
    nativePriceJPY: 20000,
    mintGasUnits: 0,
    gasPriceGwei: 0,
    flatFeeNative: 0.012,
    platformNote: "Magic Eden・Tensor・Metaplex",
    pros: ["低コスト", "高速", "NFT特化インフラ"],
    cons: ["エコシステム異なる", "ウォレット別"],
    color: "green",
  },
  {
    name: "Base",
    symbol: "ETH",
    icon: "🔵",
    type: "EVM",
    nativePriceJPY: 450000,
    mintGasUnits: 90000,
    gasPriceGwei: 0.1,
    flatFeeNative: 0,
    platformNote: "Coinbase NFT・Zora",
    pros: ["激安ガス代", "Coinbase後ろ盾", "EVM互換"],
    cons: ["エコシステム発展途上", "流動性低め"],
    color: "blue",
  },
  {
    name: "Arbitrum",
    symbol: "ETH",
    icon: "🔺",
    type: "EVM",
    nativePriceJPY: 450000,
    mintGasUnits: 90000,
    gasPriceGwei: 0.3,
    flatFeeNative: 0,
    platformNote: "Treasure・Stratos等",
    pros: ["低ガス代", "EVM互換", "DeFi連携強"],
    cons: ["NFT市場規模小さめ"],
    color: "cyan",
  },
  {
    name: "Tezos",
    symbol: "XTZ",
    icon: "Ꜩ",
    type: "Other",
    nativePriceJPY: 130,
    mintGasUnits: 0,
    gasPriceGwei: 0,
    flatFeeNative: 0.015,
    platformNote: "objkt・fx(hash）",
    pros: ["ガス代安い", "アート系NFT強い", "エコ志向"],
    cons: ["流動性低い", "エコシステム特化"],
    color: "teal",
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    icon: "🔺",
    type: "EVM",
    nativePriceJPY: 4500,
    mintGasUnits: 90000,
    gasPriceGwei: 25,
    flatFeeNative: 0,
    platformNote: "Joepegs・Salvor等",
    pros: ["高速ファイナリティ", "EVM互換"],
    cons: ["NFT市場小規模", "流動性低い"],
    color: "red",
  },
];

function getColorClasses(color: string, selected: boolean) {
  const base: Record<string, { border: string; bg: string; badge: string }> = {
    slate: { border: "border-slate-400", bg: "bg-slate-50", badge: "bg-slate-100 text-slate-700" },
    purple: { border: "border-purple-400", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700" },
    green: { border: "border-green-400", bg: "bg-green-50", badge: "bg-green-100 text-green-700" },
    blue: { border: "border-blue-400", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
    cyan: { border: "border-cyan-400", bg: "bg-cyan-50", badge: "bg-cyan-100 text-cyan-700" },
    teal: { border: "border-teal-400", bg: "bg-teal-50", badge: "bg-teal-100 text-teal-700" },
    red: { border: "border-red-400", bg: "bg-red-50", badge: "bg-red-100 text-red-700" },
  };
  const c = base[color] ?? base.slate;
  return selected
    ? `border-2 ${c.border} ${c.bg}`
    : "border border-gray-200 bg-white";
}

export default function NftMintCost() {
  const [mintCount, setMintCount] = useState(1);
  const [selectedChains, setSelectedChains] = useState<string[]>(CHAINS.map((c) => c.name));

  const results = useMemo(() => {
    return CHAINS.filter((c) => selectedChains.includes(c.name)).map((chain) => {
      let costPerMintJPY = 0;
      if (chain.type === "EVM") {
        const gasCostETH = (chain.mintGasUnits * chain.gasPriceGwei * 1e-9);
        costPerMintJPY = gasCostETH * chain.nativePriceJPY;
      } else {
        costPerMintJPY = chain.flatFeeNative * chain.nativePriceJPY;
      }
      const totalJPY = costPerMintJPY * mintCount;
      const totalUSD = totalJPY / JPY_RATE;
      return { ...chain, costPerMintJPY, totalJPY, totalUSD };
    }).sort((a, b) => a.costPerMintJPY - b.costPerMintJPY);
  }, [mintCount, selectedChains]);

  const cheapest = results[0];

  const toggleChain = (name: string) => {
    setSelectedChains((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ミント条件を設定</h2>

        <div className="mb-5">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">ミント枚数</label>
            <span className="text-sm font-bold text-indigo-600">{mintCount} 枚</span>
          </div>
          <input
            type="range"
            min={1}
            max={1000}
            step={1}
            value={mintCount}
            onChange={(e) => setMintCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1枚</span><span>1,000枚</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">比較するチェーン</label>
          <div className="flex gap-2 flex-wrap">
            {CHAINS.map((c) => (
              <button
                key={c.name}
                onClick={() => toggleChain(c.name)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedChains.includes(c.name)
                    ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                    : "border-gray-200 text-gray-400 bg-gray-50"
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Best pick */}
      {cheapest && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-indigo-600 text-xl">★</span>
            <span className="font-semibold text-indigo-800">最安チェーン（{mintCount}枚）</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">
            {cheapest.icon} {cheapest.name} — 合計¥{Math.round(cheapest.totalJPY).toLocaleString("ja-JP")}
          </p>
          <p className="text-sm text-indigo-700 mt-1">
            1枚あたり約¥{cheapest.costPerMintJPY < 1 ? cheapest.costPerMintJPY.toFixed(4) : Math.round(cheapest.costPerMintJPY).toLocaleString()}
          </p>
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">チェーン別ミントコスト比較（{mintCount}枚）</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">チェーン</th>
                <th className="text-right px-4 py-2 text-gray-600">1枚あたり</th>
                <th className="text-right px-4 py-2 text-gray-600">{mintCount}枚合計</th>
                <th className="text-right px-4 py-2 text-gray-600">USD換算</th>
                <th className="text-left px-4 py-2 text-gray-600">マーケット</th>
              </tr>
            </thead>
            <tbody>
              {results.map((chain, i) => (
                <tr
                  key={chain.name}
                  className={`border-t border-gray-100 transition-colors ${
                    i === 0 ? "bg-indigo-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{chain.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{chain.name}</div>
                        <div className="text-xs text-gray-500">{chain.symbol}</div>
                      </div>
                      {i === 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full">最安</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="font-medium text-gray-900">
                      {chain.costPerMintJPY < 1
                        ? `¥${chain.costPerMintJPY.toFixed(4)}`
                        : `¥${Math.round(chain.costPerMintJPY).toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="font-bold text-gray-900">
                      {chain.totalJPY < 1
                        ? `¥${chain.totalJPY.toFixed(4)}`
                        : `¥${Math.round(chain.totalJPY).toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    ${chain.totalUSD < 0.01 ? chain.totalUSD.toFixed(4) : chain.totalUSD.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{chain.platformNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chain detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((chain) => (
          <div
            key={chain.name}
            className={`rounded-2xl p-4 transition-all ${getColorClasses(chain.color, false)}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{chain.icon}</span>
              <span className="font-bold text-gray-900">{chain.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-gray-500">ガス代モデル: </span>
                <span className="font-medium">{chain.type === "Solana" ? "固定費" : chain.type === "Other" ? "固定費" : "EVM Gas"}</span>
              </div>
              <div>
                <span className="text-gray-500">1枚コスト: </span>
                <span className="font-medium text-gray-900">
                  {chain.costPerMintJPY < 1
                    ? `¥${chain.costPerMintJPY.toFixed(4)}`
                    : `¥${Math.round(chain.costPerMintJPY).toLocaleString()}`}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div>
                <span className="text-xs font-medium text-green-700">✓ メリット: </span>
                <span className="text-xs text-gray-600">{chain.pros.join(" / ")}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-red-600">✗ デメリット: </span>
                <span className="text-xs text-gray-600">{chain.cons.join(" / ")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ ガス代・トークン価格は市場変動により大きく変わります。この計算はあくまで参考値です。</p>
        <p>※ プラットフォーム手数料（OpenSeaの2.5%等）は含まれていません。</p>
        <p>※ Polygonは「Lazy Minting」でガス代をゼロにできる場合があります。</p>
        <p>※ ETHの価格は¥450,000、SOLは¥20,000、MATICは¥90、XTZは¥130を使用しています。</p>
      </div>
    </div>
  );
}
