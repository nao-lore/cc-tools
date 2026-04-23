"use client";

import { useState, useMemo } from "react";

// --- 配送サービスデータ ---
type Service = {
  id: string;
  name: string;
  provider: string;
  logo: string;
  // サイズ制限
  maxLength: number | null;      // 長辺 cm
  maxWidth: number | null;       // 短辺 cm
  minLength?: number;            // 長辺最小 cm（ネコポスのみ）
  minWidth?: number;
  maxThickness: number;          // 厚さ cm
  maxWeight: number;             // kg
  maxGirth?: number;             // 3辺合計 cm（ゆうパケット）
  // 特殊フラグ
  needSpecialBox?: boolean;      // 専用箱/シール必須
  // 料金
  price: number | string;        // 円 or 表示文字列
  priceNote?: string;
  // 追跡
  tracking: boolean;
  // フリマ対応
  mercari: boolean;
  rakuma: boolean;
  // 詳細テキスト
  detail: string;
};

const SERVICES: Service[] = [
  {
    id: "nekopos",
    name: "ネコポス",
    provider: "ヤマト運輸",
    logo: "🐱",
    minLength: 23,
    maxLength: 31.2,
    minWidth: 11.5,
    maxWidth: 22.8,
    maxThickness: 3,
    maxWeight: 1,
    price: 210,
    priceNote: "メルカリ便・ラクマパック価格。個人契約は¥385",
    tracking: true,
    mercari: true,
    rakuma: true,
    detail:
      "縦23〜31.2cm × 横11.5〜22.8cm、厚さ3cm以内、1kg以内。最小サイズの条件あり。メルカリ便・ラクマパック利用時は¥210。個人での直接契約は¥385。",
  },
  {
    id: "clickpost",
    name: "クリックポスト",
    provider: "日本郵便",
    logo: "📮",
    maxLength: 34,
    maxWidth: 25,
    maxThickness: 3,
    maxWeight: 1,
    price: 185,
    tracking: true,
    mercari: false,
    rakuma: false,
    detail:
      "縦34cm × 横25cm以内、厚さ3cm以内、1kg以内。Yahoo! JAPAN IDまたはAmazonアカウントが必要。自宅でラベル印刷。ポスト投函可。",
  },
  {
    id: "yupacket",
    name: "ゆうパケット",
    provider: "日本郵便",
    logo: "📬",
    maxLength: 34,
    maxGirth: 60,
    maxThickness: 3,
    maxWeight: 1,
    maxWidth: null,
    price: "¥250〜360",
    priceNote: "厚さ1cm:¥250 / 2cm:¥310 / 3cm:¥360",
    tracking: true,
    mercari: true,
    rakuma: true,
    detail:
      "長辺34cm以内、3辺合計60cm以内、厚さ3cm以内（厚さ区分で料金変動）、1kg以内。厚さ1cm:¥250 / 2cm:¥310 / 3cm:¥360。メルカリ便・ラクマパック対応。",
  },
  {
    id: "yupacket-post",
    name: "ゆうパケットポスト",
    provider: "日本郵便",
    logo: "📭",
    maxLength: 32.7,
    maxWidth: 22.8,
    maxThickness: 99,   // 厚さ制限なし（箱に入る範囲）
    maxWeight: 2,
    needSpecialBox: true,
    price: 215,
    priceNote: "専用箱¥65別途（シール版あり）",
    tracking: true,
    mercari: true,
    rakuma: true,
    detail:
      "専用箱（32.7×22.8cm、¥65）または専用シールを使用。厚さ制限なし（箱に収まる範囲）、2kg以内。料金¥215＋専用箱代。メルカリ便・ラクマパック対応。",
  },
  {
    id: "smart-letter",
    name: "スマートレター",
    provider: "日本郵便",
    logo: "✉️",
    maxLength: 25,
    maxWidth: 17,
    maxThickness: 2,
    maxWeight: 1,
    price: 180,
    tracking: false,
    mercari: false,
    rakuma: false,
    detail:
      "専用封筒（25×17cm）使用。厚さ2cm以内、1kg以内。封筒代込み¥180。追跡なし。コンビニ・郵便局で購入。",
  },
  {
    id: "letterpack-light",
    name: "レターパックライト",
    provider: "日本郵便",
    logo: "📄",
    maxLength: 34,
    maxWidth: 24.8,
    maxThickness: 3,
    maxWeight: 4,
    price: 370,
    tracking: true,
    mercari: false,
    rakuma: false,
    detail:
      "A4サイズ（34×24.8cm）専用封筒、厚さ3cm以内、4kg以内。¥370。ポスト投函可（受け取りもポスト）。追跡あり。",
  },
  {
    id: "letterpack-plus",
    name: "レターパックプラス",
    provider: "日本郵便",
    logo: "📋",
    maxLength: 34,
    maxWidth: 24.8,
    maxThickness: 999, // 厚さ制限なし
    maxWeight: 4,
    price: 520,
    tracking: true,
    mercari: false,
    rakuma: false,
    detail:
      "A4サイズ（34×24.8cm）専用封筒、厚さ制限なし（封筒が閉まる範囲）、4kg以内。¥520。対面手渡し（受け取りはポスト不可）。追跡あり。",
  },
];

// --- プリセット ---
type Preset = {
  label: string;
  icon: string;
  length: string;
  width: string;
  thickness: string;
  weight: string;
};

const PRESETS: Preset[] = [
  { label: "文庫本",     icon: "📚", length: "15",  width: "10.5", thickness: "2",   weight: "200"  },
  { label: "CD/DVD",    icon: "💿", length: "14.2", width: "12.5", thickness: "1",   weight: "120"  },
  { label: "Tシャツ",   icon: "👕", length: "28",   width: "22",   thickness: "2",   weight: "250"  },
  { label: "アクセサリ", icon: "💍", length: "12",   width: "8",    thickness: "3",   weight: "100"  },
  { label: "コミック",   icon: "📖", length: "18",   width: "12.8", thickness: "1.5", weight: "180"  },
  { label: "スマホ",    icon: "📱", length: "16",   width: "8",    thickness: "1.5", weight: "200"  },
];

// --- 判定ロジック ---
type CheckResult = {
  ok: boolean;
  reason?: string;
  price?: number | string;
  yupacketTier?: 1 | 2 | 3; // ゆうパケット厚さ区分
};

function checkService(
  service: Service,
  length: number,
  width: number,
  thickness: number,
  weightG: number
): CheckResult {
  const weightKg = weightG / 1000;

  // 専用箱が必要なサービスは寸法チェックを専用箱サイズで行う
  if (service.id === "yupacket-post") {
    if (length > 32.7 || width > 22.8) {
      return { ok: false, reason: `専用箱(32.7×22.8cm)に収まらない` };
    }
    if (weightKg > service.maxWeight) {
      return { ok: false, reason: `重量${service.maxWeight}kg超過` };
    }
    return { ok: true, price: service.price };
  }

  // スマートレター/レターパック: 専用封筒サイズ
  if (service.id === "smart-letter" || service.id === "letterpack-light" || service.id === "letterpack-plus") {
    if (service.maxLength && length > service.maxLength) {
      return { ok: false, reason: `長辺${service.maxLength}cm超過` };
    }
    if (service.maxWidth && width > service.maxWidth) {
      return { ok: false, reason: `短辺${service.maxWidth}cm超過` };
    }
    if (service.id !== "letterpack-plus" && thickness > service.maxThickness) {
      return { ok: false, reason: `厚さ${service.maxThickness}cm超過` };
    }
    if (weightKg > service.maxWeight) {
      return { ok: false, reason: `重量${service.maxWeight}kg超過` };
    }
    return { ok: true, price: service.price };
  }

  // ネコポス: 最小サイズチェックあり
  if (service.id === "nekopos") {
    if (service.minLength && length < service.minLength) {
      return { ok: false, reason: `長辺${service.minLength}cm未満` };
    }
    if (service.minWidth && width < service.minWidth) {
      return { ok: false, reason: `短辺${service.minWidth}cm未満` };
    }
    if (service.maxLength && length > service.maxLength) {
      return { ok: false, reason: `長辺${service.maxLength}cm超過` };
    }
    if (service.maxWidth && width > service.maxWidth) {
      return { ok: false, reason: `短辺${service.maxWidth}cm超過` };
    }
    if (thickness > service.maxThickness) {
      return { ok: false, reason: `厚さ${service.maxThickness}cm超過` };
    }
    if (weightKg > service.maxWeight) {
      return { ok: false, reason: `重量${service.maxWeight}kg超過` };
    }
    return { ok: true, price: service.price };
  }

  // クリックポスト
  if (service.id === "clickpost") {
    if (length > service.maxLength!) {
      return { ok: false, reason: `長辺${service.maxLength}cm超過` };
    }
    if (width > service.maxWidth!) {
      return { ok: false, reason: `短辺${service.maxWidth}cm超過` };
    }
    if (thickness > service.maxThickness) {
      return { ok: false, reason: `厚さ${service.maxThickness}cm超過` };
    }
    if (weightKg > service.maxWeight) {
      return { ok: false, reason: `重量${service.maxWeight}kg超過` };
    }
    return { ok: true, price: service.price };
  }

  // ゆうパケット: 3辺合計チェック
  if (service.id === "yupacket") {
    const girth = length + width + thickness;
    if (length > 34) {
      return { ok: false, reason: `長辺34cm超過` };
    }
    if (service.maxGirth && girth > service.maxGirth) {
      return { ok: false, reason: `3辺合計${service.maxGirth}cm超過` };
    }
    if (thickness > service.maxThickness) {
      return { ok: false, reason: `厚さ${service.maxThickness}cm超過` };
    }
    if (weightKg > service.maxWeight) {
      return { ok: false, reason: `重量${service.maxWeight}kg超過` };
    }
    const tier: 1 | 2 | 3 = thickness <= 1 ? 1 : thickness <= 2 ? 2 : 3;
    const tierPrice = tier === 1 ? 250 : tier === 2 ? 310 : 360;
    return { ok: true, price: tierPrice, yupacketTier: tier };
  }

  return { ok: false, reason: "判定不能" };
}

// --- メインコンポーネント ---
export default function ClickPostSize() {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [thickness, setThickness] = useState("");
  const [weightG, setWeightG] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const inputLength = parseFloat(length) || 0;
  const inputWidth = parseFloat(width) || 0;
  const inputThickness = parseFloat(thickness) || 0;
  const inputWeightG = parseFloat(weightG) || 0;

  const hasInput = inputLength > 0 && inputWidth > 0 && inputThickness > 0 && inputWeightG > 0;

  // 長辺・短辺を自動ソート（入力順に関わらず長い方が長辺）
  const [longSide, shortSide] = useMemo(() => {
    if (inputLength >= inputWidth) return [inputLength, inputWidth];
    return [inputWidth, inputLength];
  }, [inputLength, inputWidth]);

  const results = useMemo(() => {
    if (!hasInput) return null;
    return SERVICES.map((s) => ({
      service: s,
      check: checkService(s, longSide, shortSide, inputThickness, inputWeightG),
    }));
  }, [longSide, shortSide, inputThickness, inputWeightG, hasInput]);

  const cheapestNumericPrice = useMemo(() => {
    if (!results) return null;
    const prices = results
      .filter((r) => r.check.ok && typeof r.check.price === "number")
      .map((r) => r.check.price as number);
    return prices.length > 0 ? Math.min(...prices) : null;
  }, [results]);

  const sortedResults = useMemo(() => {
    if (!results) return null;
    return [...results].sort((a, b) => {
      if (!a.check.ok && !b.check.ok) return 0;
      if (!a.check.ok) return 1;
      if (!b.check.ok) return -1;
      const pa = typeof a.check.price === "number" ? a.check.price : 9999;
      const pb = typeof b.check.price === "number" ? b.check.price : 9999;
      return pa - pb;
    });
  }, [results]);

  function applyPreset(p: Preset) {
    setLength(p.length);
    setWidth(p.width);
    setThickness(p.thickness);
    setWeightG(p.weight);
    setExpandedId(null);
  }

  return (
    <div className="space-y-6">
      {/* プリセット */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
        <div className="text-sm font-medium text-gray-600 mb-3">よくある商品から選ぶ</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-full text-sm text-sky-800 transition-colors"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 入力エリア */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">荷物のサイズ・重量を入力</h2>

        {/* サイズ入力 */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">サイズ（縦・横・厚さ）</label>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <label className="text-xs text-gray-500">縦 (cm)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="26"
                className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <span className="text-gray-400 mt-5">×</span>
            <div className="flex flex-col items-center gap-1">
              <label className="text-xs text-gray-500">横 (cm)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="20"
                className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <span className="text-gray-400 mt-5">×</span>
            <div className="flex flex-col items-center gap-1">
              <label className="text-xs text-gray-500">厚さ (cm)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                placeholder="2"
                className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
          {inputLength > 0 && inputWidth > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              ※ 長辺 {longSide}cm × 短辺 {shortSide}cm として判定します
            </p>
          )}
        </div>

        {/* 重量 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">重量</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              step="1"
              value={weightG}
              onChange={(e) => setWeightG(e.target.value)}
              placeholder="200"
              className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <span className="text-gray-600 text-sm">g</span>
            {inputWeightG > 0 && (
              <span className="text-xs text-gray-400">（{(inputWeightG / 1000).toFixed(3)} kg）</span>
            )}
          </div>
        </div>
      </div>

      {/* 結果 */}
      {!hasInput && (
        <div className="bg-white rounded-2xl border border-dashed border-blue-200 p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">📦</div>
          <div className="text-sm">
            サイズと重量を入力すると<br />
            使えるサービスを判定します
          </div>
        </div>
      )}

      {hasInput && sortedResults && (
        <div>
          {/* 適合サービス一覧 */}
          <h2 className="text-lg font-semibold text-gray-800 mb-3">判定結果</h2>
          <div className="space-y-3">
            {sortedResults.map((r, idx) => {
              const { service, check } = r;
              const isOk = check.ok;
              const isCheapest =
                isOk &&
                typeof check.price === "number" &&
                check.price === cheapestNumericPrice;
              const isExpanded = expandedId === service.id;
              return (
                <div
                  key={service.id}
                  className={[
                    "rounded-2xl border-2 transition-all",
                    isOk
                      ? isCheapest
                        ? "border-sky-400 bg-sky-50 shadow-md shadow-sky-100"
                        : "border-green-200 bg-white"
                      : "border-gray-200 bg-gray-50 opacity-60",
                  ].join(" ")}
                >
                  {/* メインrow */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-center gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : service.id)}
                  >
                    {/* ロゴ */}
                    <span className="text-2xl flex-shrink-0">{service.logo}</span>

                    {/* 名前・プロバイダ */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-base ${isOk ? "text-gray-900" : "text-gray-400"}`}>
                          {service.name}
                        </span>
                        {isCheapest && isOk && (
                          <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            最安
                          </span>
                        )}
                        {isOk && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${service.tracking ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            追跡{service.tracking ? "あり" : "なし"}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mt-0.5 ${isOk ? "text-gray-500" : "text-gray-400"}`}>
                        {service.provider}
                        {isOk && service.needSpecialBox && (
                          <span className="ml-2 text-amber-600">専用箱/シール必須</span>
                        )}
                      </div>
                    </div>

                    {/* 料金 or NG理由 */}
                    <div className="flex-shrink-0 text-right">
                      {isOk ? (
                        <div>
                          <div className={`text-xl font-extrabold ${isCheapest ? "text-sky-700" : "text-gray-800"}`}>
                            {typeof check.price === "number"
                              ? `¥${check.price.toLocaleString()}`
                              : check.price}
                          </div>
                          {check.yupacketTier && (
                            <div className="text-xs text-gray-500">
                              厚さ{check.yupacketTier}cmまで区分
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-semibold text-red-400">不可</div>
                          <div className="text-xs text-gray-400 max-w-[100px]">{check.reason}</div>
                        </div>
                      )}
                    </div>

                    {/* 展開アイコン */}
                    <span className={`text-gray-400 text-xs flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {/* フリマ対応バッジ */}
                  {isOk && (service.mercari || service.rakuma) && (
                    <div className="px-5 pb-3 flex gap-2">
                      {service.mercari && (
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full">
                          メルカリ便対応
                        </span>
                      )}
                      {service.rakuma && (
                        <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full">
                          ラクマパック対応
                        </span>
                      )}
                    </div>
                  )}

                  {/* 展開詳細 */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1">
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-sm text-gray-600 leading-relaxed">{service.detail}</p>
                        {service.priceNote && (
                          <p className="text-xs text-gray-400 mt-2">※ {service.priceNote}</p>
                        )}
                        {/* サービス条件サマリー */}
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {service.maxLength !== null && (
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <div className="text-xs text-gray-400">長辺</div>
                              <div className="text-sm font-semibold text-gray-700">
                                {service.minLength ? `${service.minLength}〜` : ""}
                                {service.maxLength}cm
                              </div>
                            </div>
                          )}
                          {service.maxGirth && (
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                              <div className="text-xs text-gray-400">3辺合計</div>
                              <div className="text-sm font-semibold text-gray-700">{service.maxGirth}cm以内</div>
                            </div>
                          )}
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-400">厚さ</div>
                            <div className="text-sm font-semibold text-gray-700">
                              {service.maxThickness >= 99 ? "制限なし" : `${service.maxThickness}cm以内`}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-400">重量</div>
                            <div className="text-sm font-semibold text-gray-700">{service.maxWeight}kg以内</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-400">追跡</div>
                            <div className="text-sm font-semibold text-gray-700">
                              {service.tracking ? "あり" : "なし"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 注意書き */}
          <div className="mt-5 bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-1">
            <div className="font-medium text-blue-800 mb-1.5">注意事項</div>
            <div>・料金は税込概算です。実際の料金は各社公式サイトまたは窓口でご確認ください。</div>
            <div>・ネコポス¥210はメルカリ便・ラクマパック利用時の価格です（個人契約は¥385）。</div>
            <div>・クリックポストはYahoo! JAPAN IDまたはAmazonアカウントが必要です。</div>
            <div>・ゆうパケットポストは専用箱（¥65）または専用シールが別途必要です。</div>
            <div>・縦・横の長い方を自動的に長辺として判定しています。</div>
          </div>
        </div>
      )}
    </div>
  );
}
