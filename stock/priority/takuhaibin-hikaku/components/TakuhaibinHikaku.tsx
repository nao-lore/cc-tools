"use client";

import { useState, useMemo } from "react";

// --- 地域区分 ---
type RegionGroup = "hokkaido" | "tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu" | "okinawa";

const PREFECTURE_REGION: Record<string, RegionGroup> = {
  北海道: "hokkaido",
  青森県: "tohoku", 岩手県: "tohoku", 宮城県: "tohoku", 秋田県: "tohoku",
  山形県: "tohoku", 福島県: "tohoku",
  茨城県: "kanto", 栃木県: "kanto", 群馬県: "kanto", 埼玉県: "kanto",
  千葉県: "kanto", 東京都: "kanto", 神奈川県: "kanto", 山梨県: "kanto",
  新潟県: "chubu", 富山県: "chubu", 石川県: "chubu", 福井県: "chubu",
  長野県: "chubu", 岐阜県: "chubu", 静岡県: "chubu", 愛知県: "chubu",
  三重県: "kinki", 滋賀県: "kinki", 京都府: "kinki", 大阪府: "kinki",
  兵庫県: "kinki", 奈良県: "kinki", 和歌山県: "kinki",
  鳥取県: "chugoku", 島根県: "chugoku", 岡山県: "chugoku", 広島県: "chugoku", 山口県: "chugoku",
  徳島県: "shikoku", 香川県: "shikoku", 愛媛県: "shikoku", 高知県: "shikoku",
  福岡県: "kyushu", 佐賀県: "kyushu", 長崎県: "kyushu", 熊本県: "kyushu",
  大分県: "kyushu", 宮崎県: "kyushu", 鹿児島県: "kyushu",
  沖縄県: "okinawa",
};

const PREFECTURES = Object.keys(PREFECTURE_REGION);

// 地域間の距離区分: same / adjacent / far
type DistanceType = "same" | "adjacent" | "far";

const ADJACENT_PAIRS: [RegionGroup, RegionGroup][] = [
  ["hokkaido", "tohoku"],
  ["tohoku", "kanto"],
  ["kanto", "chubu"],
  ["chubu", "kinki"],
  ["kinki", "chugoku"],
  ["kinki", "shikoku"],
  ["chugoku", "shikoku"],
  ["chugoku", "kyushu"],
  ["shikoku", "kyushu"],
  ["kyushu", "okinawa"],
];

function getDistance(from: RegionGroup, to: RegionGroup): DistanceType {
  if (from === to) return "same";
  const isAdj = ADJACENT_PAIRS.some(
    ([a, b]) => (a === from && b === to) || (b === from && a === to)
  );
  return isAdj ? "adjacent" : "far";
}

// --- 料金データ ---
// 地域間距離による加算 (円)
const DISTANCE_SURCHARGE: Record<string, Record<DistanceType, number>> = {
  yamato: { same: 0, adjacent: 220, far: 440 },
  sagawa: { same: 0, adjacent: 220, far: 440 },
  yupack: { same: 0, adjacent: 110, far: 220 },
};

type SizeEntry = {
  size: number; // 3辺合計上限(cm)
  maxWeight: number; // kg
  basePrice: number; // 関東→関東（同一地域）参考価格
};

const YAMATO_SIZES: SizeEntry[] = [
  { size: 60,  maxWeight: 2,  basePrice: 930 },
  { size: 80,  maxWeight: 5,  basePrice: 1150 },
  { size: 100, maxWeight: 10, basePrice: 1390 },
  { size: 120, maxWeight: 15, basePrice: 1610 },
  { size: 140, maxWeight: 20, basePrice: 1850 },
  { size: 160, maxWeight: 25, basePrice: 2070 },
  { size: 180, maxWeight: 30, basePrice: 2510 },
  { size: 200, maxWeight: 30, basePrice: 2950 },
];

const SAGAWA_SIZES: SizeEntry[] = [
  { size: 60,  maxWeight: 2,  basePrice: 880 },
  { size: 80,  maxWeight: 5,  basePrice: 1100 },
  { size: 100, maxWeight: 10, basePrice: 1320 },
  { size: 120, maxWeight: 10, basePrice: 1540 },
  { size: 140, maxWeight: 20, basePrice: 1760 },
  { size: 160, maxWeight: 30, basePrice: 1980 },
];

const YUPACK_SIZES: SizeEntry[] = [
  { size: 60,  maxWeight: 25, basePrice: 870 },
  { size: 80,  maxWeight: 25, basePrice: 1100 },
  { size: 100, maxWeight: 25, basePrice: 1330 },
  { size: 120, maxWeight: 25, basePrice: 1590 },
  { size: 140, maxWeight: 25, basePrice: 1830 },
  { size: 160, maxWeight: 25, basePrice: 2060 },
  { size: 170, maxWeight: 25, basePrice: 2410 },
];

type Carrier = {
  id: string;
  name: string;
  service: string;
  maxSize: number;
  maxWeight: number;
  sizes: SizeEntry[];
  brandColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  logo: string;
};

const CARRIERS: Carrier[] = [
  {
    id: "yamato",
    name: "ヤマト運輸",
    service: "宅急便",
    maxSize: 200,
    maxWeight: 30,
    sizes: YAMATO_SIZES,
    brandColor: "#1a1a1a",
    bgColor: "bg-gray-900",
    borderColor: "border-gray-800",
    textColor: "text-gray-900",
    badgeBg: "bg-yellow-400",
    logo: "🐱",
  },
  {
    id: "sagawa",
    name: "佐川急便",
    service: "飛脚宅配便",
    maxSize: 160,
    maxWeight: 30,
    sizes: SAGAWA_SIZES,
    brandColor: "#1a56db",
    bgColor: "bg-blue-700",
    borderColor: "border-blue-700",
    textColor: "text-blue-700",
    badgeBg: "bg-blue-600",
    logo: "🚚",
  },
  {
    id: "yupack",
    name: "日本郵便",
    service: "ゆうパック",
    maxSize: 170,
    maxWeight: 25,
    sizes: YUPACK_SIZES,
    brandColor: "#dc2626",
    bgColor: "bg-red-600",
    borderColor: "border-red-600",
    textColor: "text-red-600",
    badgeBg: "bg-red-500",
    logo: "📮",
  },
];

// 料金計算
function calcPrice(
  carrier: Carrier,
  totalSize: number,
  weight: number,
  distance: DistanceType
): { price: number | null; reason: string | null; sizeLabel: string } {
  if (totalSize > carrier.maxSize) {
    return { price: null, reason: `${carrier.maxSize}cm超過`, sizeLabel: "" };
  }
  if (weight > carrier.maxWeight) {
    return { price: null, reason: `重量${carrier.maxWeight}kg超過`, sizeLabel: "" };
  }

  const entry = carrier.sizes.find((s) => totalSize <= s.size);
  if (!entry) {
    return { price: null, reason: "サイズ超過", sizeLabel: "" };
  }
  if (weight > entry.maxWeight) {
    // 重量超過 → 次のサイズ区分で再探索
    const next = carrier.sizes.find((s) => s.size > entry.size && weight <= s.maxWeight);
    if (!next) {
      return { price: null, reason: `重量${weight}kg超過`, sizeLabel: "" };
    }
    const surcharge = DISTANCE_SURCHARGE[carrier.id][distance];
    return { price: next.basePrice + surcharge, reason: null, sizeLabel: `${next.size}サイズ` };
  }

  const surcharge = DISTANCE_SURCHARGE[carrier.id][distance];
  return { price: entry.basePrice + surcharge, reason: null, sizeLabel: `${entry.size}サイズ` };
}

// --- コンポーネント ---
export default function TakuhaibinHikaku() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [weight, setWeight] = useState("");
  const [fromPref, setFromPref] = useState("東京都");
  const [toPref, setToPref] = useState("大阪府");

  const totalSize = useMemo(() => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const d = parseFloat(depth) || 0;
    return w + h + d;
  }, [width, height, depth]);

  const weightNum = parseFloat(weight) || 0;

  const distance = useMemo((): DistanceType => {
    const from = PREFECTURE_REGION[fromPref];
    const to = PREFECTURE_REGION[toPref];
    if (!from || !to) return "same";
    return getDistance(from, to);
  }, [fromPref, toPref]);

  const distanceLabel: Record<DistanceType, string> = {
    same: "同一地域",
    adjacent: "隣接地域",
    far: "遠方",
  };

  const results = useMemo(() => {
    if (totalSize <= 0 || weightNum <= 0) return null;
    return CARRIERS.map((c) => ({
      carrier: c,
      ...calcPrice(c, totalSize, weightNum, distance),
    }));
  }, [totalSize, weightNum, distance]);

  const cheapestPrice = useMemo(() => {
    if (!results) return null;
    const valid = results.filter((r) => r.price !== null).map((r) => r.price as number);
    return valid.length > 0 ? Math.min(...valid) : null;
  }, [results]);

  const isSmallParcel = totalSize > 0 && totalSize <= 60;
  const hasInput = totalSize > 0 && weightNum > 0;

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">荷物情報を入力</h2>

        {/* サイズ入力 — 図解風 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            サイズ（縦・横・高さ）
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {/* 箱のイラスト的なUI */}
            <div className="relative flex-shrink-0 w-24 h-20 select-none">
              {/* 箱の正面 */}
              <div className="absolute inset-0 border-2 border-gray-400 rounded bg-amber-50 flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
              {/* ラベル */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap bg-white px-1">高さ</div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap bg-white px-1">横</div>
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 text-[10px] text-gray-500 whitespace-nowrap bg-white px-1">縦</div>
            </div>

            <div className="flex items-center gap-2 flex-wrap ml-4">
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-gray-500">縦 (cm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="30"
                  className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <span className="text-gray-400 mt-4">×</span>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-gray-500">横 (cm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="20"
                  className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <span className="text-gray-400 mt-4">×</span>
              <div className="flex flex-col items-center gap-1">
                <label className="text-xs text-gray-500">高さ (cm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  placeholder="10"
                  className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {totalSize > 0 && (
              <div className="flex-shrink-0 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 ml-2">
                <div className="text-xs text-blue-500">3辺合計</div>
                <div className="text-xl font-bold text-blue-700">{totalSize.toFixed(1)} cm</div>
              </div>
            )}
          </div>
        </div>

        {/* 重量 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">重量</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="2.5"
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-gray-600 text-sm">kg</span>
          </div>
        </div>

        {/* 発着地 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">発送元（都道府県）</label>
            <select
              value={fromPref}
              onChange={(e) => setFromPref(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">届け先（都道府県）</label>
            <select
              value={toPref}
              onChange={(e) => setToPref(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {hasInput && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
            {fromPref} → {toPref}
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {distanceLabel[distance]}
            </span>
          </div>
        )}
      </div>

      {/* 小型配送の提案 */}
      {isSmallParcel && hasInput && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <span className="text-amber-500 text-xl flex-shrink-0">💡</span>
          <div>
            <div className="font-medium text-amber-800 text-sm mb-1">小型荷物はもっと安い手段があります</div>
            <div className="text-amber-700 text-xs leading-relaxed">
              60サイズ以下の場合、<strong>ネコポス（最大¥385）</strong>・<strong>クリックポスト（¥185）</strong>・<strong>ゆうパケット（¥250〜）</strong>の方が大幅に安くなる場合があります。
            </div>
          </div>
        </div>
      )}

      {/* 比較結果 */}
      {hasInput && results && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">送料比較結果</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {results
              .slice()
              .sort((a, b) => {
                if (a.price === null && b.price === null) return 0;
                if (a.price === null) return 1;
                if (b.price === null) return -1;
                return a.price - b.price;
              })
              .map((r, idx) => {
                const isCheapest = r.price !== null && r.price === cheapestPrice;
                const isUnavailable = r.price === null;

                return (
                  <div
                    key={r.carrier.id}
                    className={[
                      "relative rounded-2xl border-2 p-5 transition-all",
                      isCheapest
                        ? "border-green-400 shadow-lg shadow-green-100 bg-green-50"
                        : isUnavailable
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-gray-200 bg-white",
                    ].join(" ")}
                  >
                    {/* 最安バッジ */}
                    {isCheapest && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        最安
                      </div>
                    )}

                    {/* ランク */}
                    {!isUnavailable && (
                      <div className="absolute top-3 right-3 text-xs text-gray-400 font-medium">
                        #{idx + 1}
                      </div>
                    )}

                    {/* 会社名 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{r.carrier.logo}</span>
                      <div>
                        <div className={`font-bold text-sm ${isUnavailable ? "text-gray-400" : "text-gray-800"}`}>
                          {r.carrier.name}
                        </div>
                        <div className={`text-xs ${isUnavailable ? "text-gray-400" : "text-gray-500"}`}>
                          {r.carrier.service}
                        </div>
                      </div>
                    </div>

                    {/* 料金 */}
                    {isUnavailable ? (
                      <div className="text-center py-3">
                        <div className="text-red-400 font-semibold text-sm mb-1">取扱不可</div>
                        <div className="text-xs text-gray-400">{r.reason}</div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <div className={`text-3xl font-extrabold ${isCheapest ? "text-green-700" : "text-gray-800"}`}>
                          ¥{r.price!.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{r.sizeLabel}</div>
                      </div>
                    )}

                    {/* 割引情報 */}
                    {!isUnavailable && (
                      <div className={`mt-3 pt-3 border-t text-xs space-y-0.5 ${isCheapest ? "border-green-200 text-green-700" : "border-gray-100 text-gray-400"}`}>
                        {r.carrier.id === "yamato" && (
                          <>
                            <div>• 持込割引 −¥110</div>
                            <div>• クロネコメンバー割あり</div>
                          </>
                        )}
                        {r.carrier.id === "sagawa" && (
                          <>
                            <div>• 持込割引あり</div>
                            <div>• 法人契約で大幅割引</div>
                          </>
                        )}
                        {r.carrier.id === "yupack" && (
                          <>
                            <div>• 持込割引 −¥120</div>
                            <div>• 複数口割引あり</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* 注意書き */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <div className="font-medium text-gray-600 mb-2">注意事項</div>
            <div>・表示料金は概算です。実際の料金は各社公式サイトまたは窓口でご確認ください。</div>
            <div>・地域区分（{distanceLabel[distance]}）は発着都道府県から自動判定しています。</div>
            <div>・割引（持込・会員・複数口等）は適用前の基本料金です。</div>
            <div>・離島・一部地域は追加料金が発生する場合があります。</div>
            <div>・料金データは2026年概算に基づきます。</div>
          </div>
        </div>
      )}

      {/* 未入力時のガイド */}
      {!hasInput && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <div className="text-sm">荷物のサイズ・重量を入力すると<br />3社の送料を比較します</div>
        </div>
      )}
    </div>
  );
}
