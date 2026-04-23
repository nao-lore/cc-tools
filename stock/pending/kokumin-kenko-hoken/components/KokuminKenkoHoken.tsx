"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CityRate {
  label: string;
  // 医療分
  iryo_shotokuritsu: number; // 所得割率 (%)
  iryo_kintowari: number;    // 均等割 (円/人)
  iryo_heimwari: number;     // 平等割 (円/世帯)
  iryo_gendo: number;        // 賦課限度額 (円)
  // 後期高齢者支援金分
  shien_shotokuritsu: number;
  shien_kintowari: number;
  shien_heimwari: number;
  shien_gendo: number;
  // 介護分 (40-64歳のみ)
  kaigo_shotokuritsu: number;
  kaigo_kintowari: number;
  kaigo_heimwari: number;
  kaigo_gendo: number;
}

// ─── Rate data (2024年度 概算値) ──────────────────────────────────────────────
// 所得割は「基礎控除後所得」= 年間所得 - 430,000円 に対して適用
// 均等割: 世帯員全員、平等割: 1世帯あたり固定

const CITY_RATES: Record<string, CityRate> = {
  shinjuku: {
    label: "東京都新宿区",
    iryo_shotokuritsu: 7.59,
    iryo_kintowari: 45_900,
    iryo_heimwari: 0,
    iryo_gendo: 650_000,
    shien_shotokuritsu: 2.74,
    shien_kintowari: 14_400,
    shien_heimwari: 0,
    shien_gendo: 240_000,
    kaigo_shotokuritsu: 1.65,
    kaigo_kintowari: 16_200,
    kaigo_heimwari: 0,
    kaigo_gendo: 170_000,
  },
  osaka: {
    label: "大阪市",
    iryo_shotokuritsu: 9.00,
    iryo_kintowari: 22_800,
    iryo_heimwari: 28_200,
    iryo_gendo: 650_000,
    shien_shotokuritsu: 3.17,
    shien_kintowari: 8_800,
    shien_heimwari: 9_900,
    shien_gendo: 240_000,
    kaigo_shotokuritsu: 2.06,
    kaigo_kintowari: 12_200,
    kaigo_heimwari: 5_700,
    kaigo_gendo: 170_000,
  },
  yokohama: {
    label: "横浜市",
    iryo_shotokuritsu: 9.45,
    iryo_kintowari: 47_300,
    iryo_heimwari: 35_700,
    iryo_gendo: 650_000,
    shien_shotokuritsu: 2.77,
    shien_kintowari: 14_600,
    shien_heimwari: 11_100,
    shien_gendo: 240_000,
    kaigo_shotokuritsu: 2.12,
    kaigo_kintowari: 17_700,
    kaigo_heimwari: 6_300,
    kaigo_gendo: 170_000,
  },
  nagoya: {
    label: "名古屋市",
    iryo_shotokuritsu: 7.47,
    iryo_kintowari: 29_100,
    iryo_heimwari: 23_000,
    iryo_gendo: 650_000,
    shien_shotokuritsu: 2.44,
    shien_kintowari: 9_500,
    shien_heimwari: 7_500,
    shien_gendo: 240_000,
    kaigo_shotokuritsu: 1.90,
    kaigo_kintowari: 12_300,
    kaigo_heimwari: 4_200,
    kaigo_gendo: 170_000,
  },
  fukuoka: {
    label: "福岡市",
    iryo_shotokuritsu: 9.08,
    iryo_kintowari: 34_200,
    iryo_heimwari: 26_500,
    iryo_gendo: 650_000,
    shien_shotokuritsu: 2.86,
    shien_kintowari: 10_200,
    shien_heimwari: 8_700,
    shien_gendo: 240_000,
    kaigo_shotokuritsu: 1.93,
    kaigo_kintowari: 14_600,
    kaigo_heimwari: 4_900,
    kaigo_gendo: 170_000,
  },
  sapporo: {
    label: "札幌市",
    iryo_shotokuritsu: 8.47,
    iryo_kintowari: 33_000,
    iryo_heimwari: 22_500,
    iryo_gendo: 650_000,
    shien_shotokuritsu: 2.56,
    shien_kintowari: 10_800,
    shien_heimwari: 7_200,
    shien_gendo: 240_000,
    kaigo_shotokuritsu: 1.77,
    kaigo_kintowari: 13_200,
    kaigo_heimwari: 4_200,
    kaigo_gendo: 170_000,
  },
  national: {
    label: "全国平均",
    iryo_shotokuritsu: 8.50,
    iryo_kintowari: 30_000,
    iryo_heimwari: 20_000,
    iryo_gendo: 650_000,
    shien_shotokuritsu: 2.80,
    shien_kintowari: 10_500,
    shien_heimwari: 7_000,
    shien_gendo: 240_000,
    kaigo_shotokuritsu: 1.90,
    kaigo_kintowari: 14_000,
    kaigo_heimwari: 4_500,
    kaigo_gendo: 170_000,
  },
};

// ─── Calculation logic ────────────────────────────────────────────────────────

interface CalcResult {
  iryo: number;
  shien: number;
  kaigo: number;
  total: number;
  monthly: number;
}

function calcPremium(
  income: number,
  members: number,
  kaigoMembers: number,
  cityKey: string
): CalcResult {
  const r = CITY_RATES[cityKey];
  // 基礎控除後所得 (430,000円) ※0未満は0
  const baseIncome = Math.max(0, income - 430_000);

  // 医療分
  const iryoRaw =
    (baseIncome * r.iryo_shotokuritsu) / 100 +
    r.iryo_kintowari * members +
    r.iryo_heimwari;
  const iryo = Math.min(iryoRaw, r.iryo_gendo);

  // 後期高齢者支援金分
  const shienRaw =
    (baseIncome * r.shien_shotokuritsu) / 100 +
    r.shien_kintowari * members +
    r.shien_heimwari;
  const shien = Math.min(shienRaw, r.shien_gendo);

  // 介護分 (40-64歳の人数がいる場合のみ)
  let kaigo = 0;
  if (kaigoMembers > 0) {
    const kaigoRaw =
      (baseIncome * r.kaigo_shotokuritsu) / 100 +
      r.kaigo_kintowari * kaigoMembers +
      r.kaigo_heimwari;
    kaigo = Math.min(kaigoRaw, r.kaigo_gendo);
  }

  const total = iryo + shien + kaigo;
  const monthly = total / 12;

  return { iryo, shien, kaigo, total, monthly };
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KokuminKenkoHoken() {
  const [income, setIncome] = useState("");
  const [members, setMembers] = useState("1");
  const [kaigoMembers, setKaigoMembers] = useState("0");
  const [cityKey, setCityKey] = useState("national");
  const [result, setResult] = useState<CalcResult | null>(null);

  const handleCalc = () => {
    const inc = parseFloat(income) * 10_000; // 万円 → 円
    const mem = parseInt(members, 10);
    const kai = parseInt(kaigoMembers, 10);
    if (isNaN(inc) || isNaN(mem) || isNaN(kai)) return;
    setResult(calcPremium(inc, mem, kai, cityKey));
  };

  const isValid =
    income.trim() !== "" &&
    !isNaN(parseFloat(income)) &&
    parseFloat(income) >= 0 &&
    parseInt(members, 10) >= 1 &&
    parseInt(kaigoMembers, 10) >= 0 &&
    parseInt(kaigoMembers, 10) <= parseInt(members, 10);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">国民健康保険料 計算ツール</h1>
          <p className="text-gray-400 mt-1 text-sm">
            年間所得・世帯人数・自治体を入力して保険料を概算します。フリーランス・個人事業主向け。
          </p>
        </div>

        {/* Inputs */}
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
          {/* 自治体 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">自治体</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              value={cityKey}
              onChange={(e) => setCityKey(e.target.value)}
            >
              {Object.entries(CITY_RATES).map(([key, r]) => (
                <option key={key} value={key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* 年間所得 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              年間所得
              <span className="ml-2 text-xs text-gray-500">（経費控除後・確定申告の所得金額）</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="300"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">万円</span>
            </div>
          </div>

          {/* 世帯人数 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              世帯人数
              <span className="ml-2 text-xs text-gray-500">（被保険者数）</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
            />
          </div>

          {/* 40-64歳の人数 */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              40〜64歳の人数
              <span className="ml-2 text-xs text-gray-500">（介護保険第2号被保険者）</span>
            </label>
            <input
              type="number"
              min="0"
              max="10"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              value={kaigoMembers}
              onChange={(e) => setKaigoMembers(e.target.value)}
            />
            <p className="text-xs text-gray-600">世帯員のうち40〜64歳の人数（0でも可）</p>
          </div>

          <button
            onClick={handleCalc}
            disabled={!isValid}
            className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            計算する
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300">
              試算結果 — {CITY_RATES[cityKey].label}
            </h2>

            <div className="space-y-2">
              {/* 医療分 */}
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">医療分</span>
                <span className="text-sm font-mono text-gray-100">
                  ¥{fmt(result.iryo)} <span className="text-xs text-gray-500">/ 年</span>
                </span>
              </div>

              {/* 後期高齢者支援金分 */}
              <div className="flex items-center justify-between py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">後期高齢者支援金分</span>
                <span className="text-sm font-mono text-gray-100">
                  ¥{fmt(result.shien)} <span className="text-xs text-gray-500">/ 年</span>
                </span>
              </div>

              {/* 介護分（該当者のみ） */}
              {result.kaigo > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-sm text-gray-400">介護分</span>
                  <span className="text-sm font-mono text-gray-100">
                    ¥{fmt(result.kaigo)} <span className="text-xs text-gray-500">/ 年</span>
                  </span>
                </div>
              )}

              {/* 合計 */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-semibold text-white">合計（年額）</span>
                <span className="text-xl font-bold font-mono text-blue-400">
                  ¥{fmt(result.total)}
                </span>
              </div>

              <div className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-400">月額概算</span>
                <span className="text-lg font-bold font-mono text-white">
                  ¥{fmt(result.monthly)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-400">ご注意</p>
          <p>本ツールは2024年度の料率をもとにした概算です。実際の保険料は各自治体の最新の告示・通知をご確認ください。</p>
          <p>所得割は「基礎控除（43万円）控除後の所得」に対して適用されます。青色申告特別控除・社会保険料控除等は別途考慮してください。</p>
          <p>賦課限度額が適用される場合があります。正確な金額は加入している市区町村窓口にお問い合わせください。</p>
        </div>

        {/* Ad placeholder */}
        <div className="mt-4 border border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center">
          <span className="text-xs text-gray-600">Advertisement</span>
        </div>
      </div>
    </div>
  );
}
