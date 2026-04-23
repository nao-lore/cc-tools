"use client";

import { useState, useMemo } from "react";

const ETH_TO_JPY_DEFAULT = 450000;

interface TxType {
  name: string;
  gasUnits: number;
  description: string;
  icon: string;
}

const TX_TYPES: TxType[] = [
  { name: "ETH送金", gasUnits: 21000, description: "シンプルなETH転送", icon: "💸" },
  { name: "ERC-20送金", gasUnits: 65000, description: "USDTなどトークン送金", icon: "🪙" },
  { name: "Uniswap スワップ", gasUnits: 150000, description: "DEXでのトークン交換", icon: "🔄" },
  { name: "NFTミント（シンプル）", gasUnits: 90000, description: "ERC-721 NFTのミント", icon: "🖼️" },
  { name: "NFTミント（複雑）", gasUnits: 200000, description: "大型NFTコレクション等", icon: "🎨" },
  { name: "コントラクトデプロイ", gasUnits: 500000, description: "スマートコントラクト作成", icon: "📄" },
  { name: "Approve", gasUnits: 46000, description: "トークン使用許可", icon: "✅" },
  { name: "LP追加", gasUnits: 200000, description: "流動性プール追加", icon: "🏊" },
];

const GAS_SPEED_PRESETS = [
  { label: "低速（~10分）", gweiMultiplier: 0.8, color: "text-gray-600" },
  { label: "標準（~3分）", gweiMultiplier: 1.0, color: "text-blue-600" },
  { label: "高速（~30秒）", gweiMultiplier: 1.3, color: "text-orange-600" },
  { label: "最速（~10秒）", gweiMultiplier: 2.0, color: "text-red-600" },
];

const GWEI_PRESETS = [
  { label: "低混雑期（〜10 Gwei）", value: 10 },
  { label: "通常（20〜30 Gwei）", value: 25 },
  { label: "混雑時（50〜100 Gwei）", value: 75 },
  { label: "超混雑（100+ Gwei）", value: 150 },
];

function formatJPY(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(2)}万円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

export default function GasFeeCalculator() {
  const [baseFeeGwei, setBaseFeeGwei] = useState(25);
  const [priorityFeeGwei, setPriorityFeeGwei] = useState(2);
  const [ethPriceJPY, setEthPriceJPY] = useState(ETH_TO_JPY_DEFAULT);
  const [txTypeIdx, setTxTypeIdx] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [customGasUnits, setCustomGasUnits] = useState<number | null>(null);

  const txType = TX_TYPES[txTypeIdx];
  const speed = GAS_SPEED_PRESETS[speedIdx];
  const gasUnits = customGasUnits ?? txType.gasUnits;

  const result = useMemo(() => {
    const totalGasPriceGwei = (baseFeeGwei + priorityFeeGwei) * speed.gweiMultiplier;
    const gasCostETH = (gasUnits * totalGasPriceGwei * 1e-9);
    const gasCostJPY = gasCostETH * ethPriceJPY;
    const gasCostUSD = gasCostJPY / 150;

    const allTxResults = TX_TYPES.map((t) => {
      const costETH = t.gasUnits * totalGasPriceGwei * 1e-9;
      const costJPY = costETH * ethPriceJPY;
      return { ...t, costETH, costJPY };
    });

    return { totalGasPriceGwei, gasCostETH, gasCostJPY, gasCostUSD, allTxResults };
  }, [baseFeeGwei, priorityFeeGwei, ethPriceJPY, gasUnits, speed]);

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ガス代の設定</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Base Fee</label>
              <span className="text-sm font-bold text-orange-500">{baseFeeGwei} Gwei</span>
            </div>
            <input
              type="range"
              min={1}
              max={300}
              step={1}
              value={baseFeeGwei}
              onChange={(e) => setBaseFeeGwei(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {GWEI_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setBaseFeeGwei(p.value)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Priority Fee（チップ）</label>
              <span className="text-sm font-bold text-orange-500">{priorityFeeGwei} Gwei</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={0.5}
              value={priorityFeeGwei}
              onChange={(e) => setPriorityFeeGwei(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 block mb-2">処理速度</label>
          <div className="flex gap-2 flex-wrap">
            {GAS_SPEED_PRESETS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSpeedIdx(i)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  speedIdx === i
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">ETH価格（円）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={ethPriceJPY}
              min={10000}
              max={10000000}
              step={10000}
              onChange={(e) => setEthPriceJPY(Number(e.target.value))}
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <span className="text-sm text-gray-600">円/ETH</span>
            <span className="text-xs text-gray-400">（参考: 2024年時点 約¥450,000）</span>
          </div>
        </div>
      </div>

      {/* Transaction type */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">取引タイプ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {TX_TYPES.map((t, i) => (
            <button
              key={t.name}
              onClick={() => { setTxTypeIdx(i); setCustomGasUnits(null); }}
              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                txTypeIdx === i && customGasUnits === null
                  ? "border-orange-400 bg-orange-50 text-orange-800"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="text-lg mb-0.5">{t.icon}</div>
              <div className="font-medium text-xs">{t.name}</div>
              <div className="text-xs text-gray-400">{t.gasUnits.toLocaleString()} gas</div>
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            カスタムGas Units（任意）
          </label>
          <input
            type="number"
            placeholder={`${txType.gasUnits.toLocaleString()} (${txType.name})`}
            value={customGasUnits ?? ""}
            min={21000}
            step={1000}
            onChange={(e) =>
              setCustomGasUnits(e.target.value ? Number(e.target.value) : null)
            }
            className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Result */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-orange-800 text-lg">
              {txType.icon} {txType.name}
            </p>
            <p className="text-sm text-orange-600">
              {gasUnits.toLocaleString()} gas × {result.totalGasPriceGwei.toFixed(1)} Gwei
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-900">
              {formatJPY(result.gasCostJPY)}
            </p>
            <p className="text-sm text-orange-600">
              {result.gasCostETH.toFixed(6)} ETH / ${result.gasCostUSD.toFixed(4)}
            </p>
          </div>
        </div>
        <div className="text-xs text-orange-700 mt-2">
          Gas Price: Base ({baseFeeGwei} Gwei) + Priority ({priorityFeeGwei} Gwei) × 速度係数 {speed.gweiMultiplier} = {result.totalGasPriceGwei.toFixed(1)} Gwei
        </div>
      </div>

      {/* All tx types comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">取引タイプ別ガス代一覧</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            現在の設定（{result.totalGasPriceGwei.toFixed(1)} Gwei）で計算
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">取引タイプ</th>
                <th className="text-right px-4 py-2 text-gray-600">Gas Units</th>
                <th className="text-right px-4 py-2 text-gray-600">ETH</th>
                <th className="text-right px-4 py-2 text-gray-600">日本円</th>
              </tr>
            </thead>
            <tbody>
              {result.allTxResults.map((t, i) => (
                <tr
                  key={t.name}
                  onClick={() => { setTxTypeIdx(i); setCustomGasUnits(null); }}
                  className={`border-t border-gray-100 cursor-pointer transition-colors ${
                    txTypeIdx === i && customGasUnits === null
                      ? "bg-orange-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2">
                    <span className="mr-1">{t.icon}</span>
                    <span className="font-medium text-gray-900">{t.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{t.description}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-600">
                    {t.gasUnits.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-600">
                    {t.costETH.toFixed(5)}
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    {formatJPY(t.costJPY)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ ガス代はネットワーク混雑状況によって大きく変動します。この計算はあくまで概算です。</p>
        <p>※ EIP-1559以降、Base Feeはバーン（焼却）され、Priority Feeのみマイナーに支払われます。</p>
        <p>※ ETH価格は変動します。リアルタイム価格はCoinGecko等でご確認ください。</p>
        <p>※ Layer2（Polygon・Arbitrum・Base等）のガス代は大幅に安くなります。</p>
      </div>
    </div>
  );
}
