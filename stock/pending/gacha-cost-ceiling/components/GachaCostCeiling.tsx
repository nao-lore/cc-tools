"use client";

import { useState, useCallback } from "react";

type Lang = "ja" | "en";

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

const T = {
  ja: {
    basicSettings: "基本設定",
    ceiling: "天井回数",
    stonesPerPull: "1回あたり石数",
    ceilingUnit: "回",
    stonesUnit: "石",
    useHeld: "手持ち石を引く",
    heldPlaceholder: "手持ち石数",
    discount: "キャンペーン割引（任意）",
    discountUnit: "% オフ",
    packSettings: "石パック設定",
    stonesCol: "石数",
    priceCol: "値段（円）",
    addPack: "パックを追加",
    calculate: "計算する",
    results: "計算結果",
    neededStones: "天井必要石数",
    afterHeld: "手持ち差し引き後",
    purchaseNeeded: "購入必要石数",
    cheapestCombo: "最安パック組み合わせ",
    canReach: "手持ち石で天井到達できます！",
    packSuffix: "石パック",
    regularTotal: "定価合計",
    campaignTotal: "キャンペーン後合計",
    grandTotal: "合計金額",
    yen: "円",
  },
  en: {
    basicSettings: "Basic Settings",
    ceiling: "Ceiling pulls",
    stonesPerPull: "Stones per pull",
    ceilingUnit: "pulls",
    stonesUnit: "stones",
    useHeld: "Subtract held stones",
    heldPlaceholder: "Held stones",
    discount: "Campaign discount (optional)",
    discountUnit: "% off",
    packSettings: "Stone Pack Settings",
    stonesCol: "Stones",
    priceCol: "Price (¥)",
    addPack: "Add pack",
    calculate: "Calculate",
    results: "Results",
    neededStones: "Total stones needed",
    afterHeld: "After subtracting held",
    purchaseNeeded: "Stones to purchase",
    cheapestCombo: "Cheapest pack combination",
    canReach: "You can reach the ceiling with held stones!",
    packSuffix: "-stone pack",
    regularTotal: "Regular total",
    campaignTotal: "Campaign total",
    grandTotal: "Grand total",
    yen: "¥",
  },
} as const;

function findCheapestCombination(
  target: number,
  packs: { stones: number; price: number }[]
): { combination: CombinationItem[]; total: number } | null {
  if (packs.length === 0 || target <= 0) return null;

  const sorted = [...packs].sort((a, b) => b.price / b.stones - a.price / a.stones);
  const validPacks = sorted.filter((p) => p.stones > 0 && p.price > 0);
  if (validPacks.length === 0) return null;

  let remaining = target;
  const result: CombinationItem[] = [];
  let total = 0;

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
  const [lang, setLang] = useState<Lang>("ja");
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

  const t = T[lang];

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
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .float-in {
          animation: float-in 0.25s ease-out;
        }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .number-input::-webkit-inner-spin-button,
        .number-input::-webkit-outer-spin-button { opacity: 0.3; }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Basic Settings */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest">
          {t.basicSettings}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.ceiling}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={ceiling}
                onChange={(e) => setCeiling(e.target.value)}
                className="number-input w-full rounded-xl px-3 py-2.5 font-mono neon-focus transition-all"
                placeholder="200"
              />
              <span className="text-violet-200 text-sm whitespace-nowrap">{t.ceilingUnit}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.stonesPerPull}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={stonesPerPull}
                onChange={(e) => setStonesPerPull(e.target.value)}
                className="number-input w-full rounded-xl px-3 py-2.5 font-mono neon-focus transition-all"
                placeholder="3"
              />
              <span className="text-violet-200 text-sm whitespace-nowrap">{t.stonesUnit}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="useHeld"
              checked={useHeld}
              onChange={(e) => setUseHeld(e.target.checked)}
              className="w-4 h-4 accent-violet-500"
            />
            <span className="text-sm text-violet-100">{t.useHeld}</span>
          </label>
          {useHeld && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={heldStones}
                onChange={(e) => setHeldStones(e.target.value)}
                className="number-input w-full rounded-xl px-3 py-2.5 font-mono neon-focus transition-all"
                placeholder={t.heldPlaceholder}
              />
              <span className="text-violet-200 text-sm whitespace-nowrap">{t.stonesUnit}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">
            {t.discount}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="99"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="number-input w-32 rounded-xl px-3 py-2.5 font-mono neon-focus transition-all"
              placeholder="0"
            />
            <span className="text-violet-200 text-sm">{t.discountUnit}</span>
          </div>
        </div>
      </div>

      {/* Pack Settings */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest">
          {t.packSettings}
        </h2>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-violet-200 px-1">
          <span>{t.stonesCol}</span>
          <span>{t.priceCol}</span>
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
                  className="number-input w-full rounded-lg px-3 py-2 text-sm font-mono neon-focus transition-all"
                  placeholder={t.stonesUnit}
                />
                <span className="text-violet-200 text-xs">{t.stonesUnit}</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={pack.price}
                  onChange={(e) => updatePack(i, "price", e.target.value)}
                  className="number-input w-full rounded-lg px-3 py-2 text-sm font-mono neon-focus transition-all"
                  placeholder="¥"
                />
                <span className="text-violet-200 text-xs">¥</span>
              </div>
              <button
                onClick={() => removePackRow(i)}
                className="text-violet-200/40 hover:text-red-400 transition-colors text-lg leading-none px-1"
                aria-label="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addPackRow}
          className="text-sm text-violet-300 hover:text-violet-100 transition-colors flex items-center gap-1"
        >
          <span className="text-lg leading-none">+</span> {t.addPack}
        </button>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculate}
        className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all text-lg"
        style={{ boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}
      >
        {t.calculate}
      </button>

      {/* Results */}
      {result && (
        <div className="gradient-border-box glass-card-bright rounded-2xl p-6 space-y-5 result-card-glow float-in">
          <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest">
            {t.results}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-3.5 text-center">
              <div className="text-xs text-violet-200 mb-1.5">{t.neededStones}</div>
              <div className="text-xl font-bold text-white font-mono">
                {result.needed.toLocaleString()}
                <span className="text-sm font-normal text-violet-200 ml-1">{t.stonesUnit}</span>
              </div>
            </div>
            <div className="glass-card rounded-xl p-3.5 text-center">
              <div className="text-xs text-violet-200 mb-1.5">
                {useHeld ? t.afterHeld : t.purchaseNeeded}
              </div>
              <div className="text-xl font-bold text-cyan-300 font-mono">
                {result.afterHeld.toLocaleString()}
                <span className="text-sm font-normal text-violet-200 ml-1">{t.stonesUnit}</span>
              </div>
            </div>
          </div>

          {result.combination.length > 0 ? (
            <div>
              <div className="text-xs text-violet-200 mb-2">{t.cheapestCombo}</div>
              <div className="space-y-2">
                {result.combination.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between glass-card rounded-xl px-4 py-2.5"
                  >
                    <span className="text-sm text-white/90">
                      {item.stones.toLocaleString()}{t.packSuffix}
                    </span>
                    <span className="text-sm text-violet-200">×{item.count}</span>
                    <span className="text-sm font-medium text-white font-mono">
                      {lang === "ja" ? "" : "¥"}{(item.price * item.count).toLocaleString()}{lang === "ja" ? "円" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-cyan-300 text-sm py-2">
              {t.canReach}
            </div>
          )}

          <div className="border-t border-white/10 pt-4 space-y-2">
            {discountRate > 0 ? (
              <>
                <div className="flex justify-between items-center text-sm text-violet-200">
                  <span>{t.regularTotal}</span>
                  <span className="line-through font-mono">{lang === "ja" ? "" : "¥"}{result.total.toLocaleString()}{lang === "ja" ? "円" : ""}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">
                    {t.campaignTotal}
                    <span className="ml-2 text-xs text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full">
                      {discountRate}% {lang === "ja" ? "オフ" : "off"}
                    </span>
                  </span>
                  <span className="text-2xl font-bold text-cyan-300 font-mono">
                    {lang === "ja" ? "" : "¥"}{result.discountedTotal.toLocaleString()}{lang === "ja" ? "円" : ""}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{t.grandTotal}</span>
                <span className="text-2xl font-bold text-white glow-text font-mono">
                  {lang === "ja" ? "" : "¥"}{result.total.toLocaleString()}{lang === "ja" ? "円" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このガチャ天井 コスト計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "天井まで何円必要か、石割換算、キャンペーン考慮。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ガチャ天井 コスト計算",
  "description": "天井まで何円必要か、石割換算、キャンペーン考慮",
  "url": "https://tools.loresync.dev/gacha-cost-ceiling",
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
