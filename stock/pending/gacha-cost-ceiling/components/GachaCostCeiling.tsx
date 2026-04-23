"use client";

import { useState, useCallback } from "react";

type Pack = {
  stones: string;
  price: string;
};

type CombinationItem = {
  stones: number;
  price: number;
  count: number;
};

const DEFAULT_PACKS: Pack[] = [
  { stones: "50", price: "160" },
  { stones: "170", price: "490" },
  { stones: "480", price: "1220" },
  { stones: "980", price: "2440" },
  { stones: "1980", price: "4900" },
  { stones: "3280", price: "7800" },
  { stones: "6480", price: "14800" },
];

function findCheapestCombination(
  target: number,
  packs: { stones: number; price: number }[]
): { combination: CombinationItem[]; total: number } | null {
  if (packs.length === 0 || target <= 0) return null;

  const sorted = [...packs].sort((a, b) => b.price / b.stones - a.price / a.stones);
  const validPacks = sorted.filter((p) => p.stones > 0 && p.price > 0);
  if (validPacks.length === 0) return null;

  // Greedy: use largest pack as much as possible, then fill remainder
  let remaining = target;
  const result: CombinationItem[] = [];
  let total = 0;

  // Sort by value (stones per yen descending = cheapest per stone)
  const byValue = [...validPacks].sort(
    (a, b) => b.stones / b.price - a.stones / a.price
  );

  for (let i = 0; i < byValue.length; i++) {
    const pack = byValue[i];
    if (remaining <= 0) break;
    const count = Math.floor(remaining / pack.stones);
    if (count > 0) {
      result.push({ stones: pack.stones, price: pack.price, count });
      total += pack.price * count;
      remaining -= pack.stones * count;
    }
  }

  // If still remaining, buy one more of the smallest pack that covers it
  if (remaining > 0) {
    const smallest = [...validPacks].sort((a, b) => a.stones - b.stones);
    const cover = smallest.find((p) => p.stones >= remaining);
    const pick = cover ?? smallest[smallest.length - 1];
    if (pick) {
      const existing = result.find(
        (r) => r.stones === pick.stones && r.price === pick.price
      );
      if (existing) {
        existing.count += 1;
        total += pick.price;
      } else {
        result.push({ stones: pick.stones, price: pick.price, count: 1 });
        total += pick.price;
      }
    }
  }

  return { combination: result, total };
}

export default function GachaCostCeiling() {
  const [ceiling, setCeiling] = useState<string>("200");
  const [stonesPerPull, setStonesPerPull] = useState<string>("3");
  const [packs, setPacks] = useState<Pack[]>(DEFAULT_PACKS);
  const [heldStones, setHeldStones] = useState<string>("");
  const [useHeld, setUseHeld] = useState<boolean>(false);
  const [discount, setDiscount] = useState<string>("");
  const [result, setResult] = useState<{
    needed: number;
    afterHeld: number;
    combination: CombinationItem[];
    total: number;
    discountedTotal: number;
  } | null>(null);

  const addPackRow = useCallback(() => {
    setPacks((prev) => [...prev, { stones: "", price: "" }]);
  }, []);

  const removePackRow = useCallback((index: number) => {
    setPacks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updatePack = useCallback(
    (index: number, field: "stones" | "price", value: string) => {
      setPacks((prev) =>
        prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
      );
    },
    []
  );

  const calculate = useCallback(() => {
    const ceilingNum = parseInt(ceiling, 10);
    const stonesPerPullNum = parseInt(stonesPerPull, 10);

    if (
      isNaN(ceilingNum) ||
      ceilingNum <= 0 ||
      isNaN(stonesPerPullNum) ||
      stonesPerPullNum <= 0
    ) {
      return;
    }

    const needed = ceilingNum * stonesPerPullNum;
    const held = useHeld ? parseInt(heldStones, 10) || 0 : 0;
    const afterHeld = Math.max(0, needed - held);

    const validPacks = packs
      .map((p) => ({ stones: parseInt(p.stones, 10), price: parseInt(p.price, 10) }))
      .filter((p) => !isNaN(p.stones) && !isNaN(p.price) && p.stones > 0 && p.price > 0);

    const combResult = findCheapestCombination(afterHeld, validPacks);
    if (!combResult) return;

    const discountRate = parseFloat(discount) || 0;
    const discountedTotal =
      discountRate > 0
        ? Math.floor(combResult.total * (1 - discountRate / 100))
        : combResult.total;

    setResult({
      needed,
      afterHeld,
      combination: combResult.combination,
      total: combResult.total,
      discountedTotal,
    });
  }, [ceiling, stonesPerPull, packs, heldStones, useHeld, discount]);

  const discountRate = parseFloat(discount) || 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-2xl font-bold text-purple-400">ガチャ天井コスト計算機</h1>
          <p className="text-gray-400 text-sm mt-1">
            天井まで何円必要か・最安パック組み合わせを計算
          </p>
        </div>

        {/* Basic Settings */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-4 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            基本設定
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">天井回数</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={ceiling}
                  onChange={(e) => setCeiling(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="200"
                />
                <span className="text-gray-400 text-sm whitespace-nowrap">回</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">1回あたり石数</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={stonesPerPull}
                  onChange={(e) => setStonesPerPull(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="3"
                />
                <span className="text-gray-400 text-sm whitespace-nowrap">石</span>
              </div>
            </div>
          </div>

          {/* Held Stones */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="useHeld"
                checked={useHeld}
                onChange={(e) => setUseHeld(e.target.checked)}
                className="w-4 h-4 accent-purple-500"
              />
              <label htmlFor="useHeld" className="text-sm text-gray-300 cursor-pointer">
                手持ち石を引く
              </label>
            </div>
            {useHeld && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={heldStones}
                  onChange={(e) => setHeldStones(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="手持ち石数"
                />
                <span className="text-gray-400 text-sm whitespace-nowrap">石</span>
              </div>
            )}
          </div>

          {/* Campaign Discount */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              キャンペーン割引（任意）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="99"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="0"
              />
              <span className="text-gray-400 text-sm">% オフ</span>
            </div>
          </div>
        </div>

        {/* Pack Settings */}
        <div className="bg-gray-900 rounded-xl p-5 space-y-3 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            石パック設定
          </h2>
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-gray-500 px-1">
            <span>石数</span>
            <span>値段（円）</span>
            <span />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {packs.map((pack, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={pack.stones}
                    onChange={(e) => updatePack(i, "stones", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="石数"
                  />
                  <span className="text-gray-500 text-xs">石</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={pack.price}
                    onChange={(e) => updatePack(i, "price", e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="円"
                  />
                  <span className="text-gray-500 text-xs">円</span>
                </div>
                <button
                  onClick={() => removePackRow(i)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none px-1"
                  aria-label="削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addPackRow}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 mt-1"
          >
            <span className="text-lg leading-none">+</span> パックを追加
          </button>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculate}
          className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors text-lg shadow-lg shadow-purple-900/40"
        >
          計算する
        </button>

        {/* Results */}
        {result && (
          <div className="bg-gray-900 rounded-xl p-5 space-y-4 border border-purple-800/50">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              計算結果
            </h2>

            {/* Stone Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">天井必要石数</div>
                <div className="text-xl font-bold text-white">
                  {result.needed.toLocaleString()}
                  <span className="text-sm font-normal text-gray-400 ml-1">石</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">
                  {useHeld ? "手持ち差し引き後" : "購入必要石数"}
                </div>
                <div className="text-xl font-bold text-purple-300">
                  {result.afterHeld.toLocaleString()}
                  <span className="text-sm font-normal text-gray-400 ml-1">石</span>
                </div>
              </div>
            </div>

            {/* Pack Combination */}
            {result.combination.length > 0 ? (
              <div>
                <div className="text-xs text-gray-400 mb-2">最安パック組み合わせ</div>
                <div className="space-y-2">
                  {result.combination.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2"
                    >
                      <span className="text-sm text-gray-200">
                        {item.stones.toLocaleString()}石パック
                      </span>
                      <span className="text-sm text-gray-400">×{item.count}</span>
                      <span className="text-sm font-medium text-white">
                        {(item.price * item.count).toLocaleString()}円
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-2">
                手持ち石で天井到達できます！
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-700 pt-4 space-y-2">
              {discountRate > 0 ? (
                <>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>定価合計</span>
                    <span className="line-through">{result.total.toLocaleString()}円</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200 font-medium">
                      キャンペーン後合計
                      <span className="ml-2 text-xs text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full">
                        {discountRate}% オフ
                      </span>
                    </span>
                    <span className="text-2xl font-bold text-green-400">
                      {result.discountedTotal.toLocaleString()}
                      <span className="text-base font-normal text-gray-400 ml-1">円</span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-200 font-medium">合計金額</span>
                  <span className="text-2xl font-bold text-yellow-400">
                    {result.total.toLocaleString()}
                    <span className="text-base font-normal text-gray-400 ml-1">円</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ad Placeholder */}
        <div className="w-full h-24 bg-gray-900 border border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-600 text-sm">
          広告スペース
        </div>
      </div>
    </div>
  );
}
