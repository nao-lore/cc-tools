"use client";

import { useState, useMemo } from "react";

interface BusinessType {
  category: string;
  name: string;
  rate: number;
}

const BUSINESS_TYPES: BusinessType[] = [
  // 第一種事業 5%
  { category: "第一種（5%）", name: "物品販売業", rate: 5 },
  { category: "第一種（5%）", name: "運送業", rate: 5 },
  { category: "第一種（5%）", name: "請負業", rate: 5 },
  { category: "第一種（5%）", name: "印刷業", rate: 5 },
  { category: "第一種（5%）", name: "製造業", rate: 5 },
  { category: "第一種（5%）", name: "電気供給業", rate: 5 },
  { category: "第一種（5%）", name: "土石採取業", rate: 5 },
  { category: "第一種（5%）", name: "電気通信事業", rate: 5 },
  { category: "第一種（5%）", name: "ガス供給業", rate: 5 },
  { category: "第一種（5%）", name: "不動産売買業", rate: 5 },
  { category: "第一種（5%）", name: "広告業", rate: 5 },
  { category: "第一種（5%）", name: "興信所業", rate: 5 },
  { category: "第一種（5%）", name: "仲立業", rate: 5 },
  { category: "第一種（5%）", name: "問屋業", rate: 5 },
  { category: "第一種（5%）", name: "旅館業", rate: 5 },
  { category: "第一種（5%）", name: "料理店業", rate: 5 },
  { category: "第一種（5%）", name: "飲食店業", rate: 5 },
  { category: "第一種（5%）", name: "周旋業", rate: 5 },
  { category: "第一種（5%）", name: "代理業", rate: 5 },
  { category: "第一種（5%）", name: "公衆浴場業（銭湯以外）", rate: 5 },
  { category: "第一種（5%）", name: "演劇興行業", rate: 5 },
  { category: "第一種（5%）", name: "遊技場業", rate: 5 },
  { category: "第一種（5%）", name: "遊覧所業", rate: 5 },
  { category: "第一種（5%）", name: "商品取引業", rate: 5 },
  { category: "第一種（5%）", name: "不動産貸付業", rate: 5 },
  { category: "第一種（5%）", name: "倉庫業", rate: 5 },
  { category: "第一種（5%）", name: "駐車場業", rate: 5 },
  { category: "第一種（5%）", name: "写真業", rate: 5 },
  { category: "第一種（5%）", name: "席貸業", rate: 5 },
  { category: "第一種（5%）", name: "両替業", rate: 5 },
  { category: "第一種（5%）", name: "機械等修理業", rate: 5 },
  { category: "第一種（5%）", name: "デザイン業", rate: 5 },
  { category: "第一種（5%）", name: "コンサルタント業", rate: 5 },
  { category: "第一種（5%）", name: "IT・システム開発業", rate: 5 },
  { category: "第一種（5%）", name: "翻訳・通訳業", rate: 5 },
  { category: "第一種（5%）", name: "ライター・著述業（事業）", rate: 5 },
  { category: "第一種（5%）", name: "情報提供業", rate: 5 },
  { category: "第一種（5%）", name: "派遣業", rate: 5 },
  { category: "第一種（5%）", name: "葬儀業", rate: 5 },
  { category: "第一種（5%）", name: "クリーニング業", rate: 5 },
  { category: "第一種（5%）", name: "旅行業", rate: 5 },
  // 第二種事業 4%
  { category: "第二種（4%）", name: "畜産業", rate: 4 },
  { category: "第二種（4%）", name: "水産業", rate: 4 },
  { category: "第二種（4%）", name: "薪炭製造業", rate: 4 },
  // 第三種事業 5%
  { category: "第三種（5%）", name: "医業", rate: 5 },
  { category: "第三種（5%）", name: "歯科医業", rate: 5 },
  { category: "第三種（5%）", name: "薬剤師業", rate: 5 },
  { category: "第三種（5%）", name: "獣医業", rate: 5 },
  { category: "第三種（5%）", name: "弁護士業", rate: 5 },
  { category: "第三種（5%）", name: "司法書士業", rate: 5 },
  { category: "第三種（5%）", name: "行政書士業", rate: 5 },
  { category: "第三種（5%）", name: "公認会計士業", rate: 5 },
  { category: "第三種（5%）", name: "税理士業", rate: 5 },
  { category: "第三種（5%）", name: "社会保険労務士業", rate: 5 },
  { category: "第三種（5%）", name: "コンサルタント業（経営）", rate: 5 },
  { category: "第三種（5%）", name: "設計監督者業", rate: 5 },
  { category: "第三種（5%）", name: "不動産鑑定業", rate: 5 },
  { category: "第三種（5%）", name: "デザイン業（専門的）", rate: 5 },
  { category: "第三種（5%）", name: "諸芸師匠業", rate: 5 },
  { category: "第三種（5%）", name: "理容業", rate: 5 },
  { category: "第三種（5%）", name: "美容業", rate: 5 },
  { category: "第三種（5%）", name: "クリーニング業（専門）", rate: 5 },
  { category: "第三種（5%）", name: "公衆浴場業（銭湯）", rate: 3 },
  { category: "第三種（5%）", name: "はり・きゅう業", rate: 3 },
  { category: "第三種（5%）", name: "柔道整復業", rate: 3 },
  { category: "第三種（5%）", name: "装蹄師業", rate: 3 },
  // 非課税
  { category: "非課税（0%）", name: "農業（一般）", rate: 0 },
  { category: "非課税（0%）", name: "林業", rate: 0 },
  { category: "非課税（0%）", name: "鉱業", rate: 0 },
  { category: "非課税（0%）", name: "フリーランス（執筆等・非事業認定）", rate: 0 },
];

function fmt(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}

export default function KojinJigyoZei() {
  const [income, setIncome] = useState("5000000");
  const [selectedBiz, setSelectedBiz] = useState("デザイン業");
  const [specialDeduction, setSpecialDeduction] = useState("650000");
  const [hasBlueDeduction, setHasBlueDeduction] = useState(true);
  const [blueDeduction, setBlueDeduction] = useState("650000");

  const biz = BUSINESS_TYPES.find((b) => b.name === selectedBiz);

  const result = useMemo(() => {
    const incomeNum = parseFloat(income.replace(/,/g, "")) || 0;
    const spDed = parseFloat(specialDeduction.replace(/,/g, "")) || 0;
    const blueDed = hasBlueDeduction ? parseFloat(blueDeduction.replace(/,/g, "")) || 0 : 0;
    const rate = biz ? biz.rate : 5;

    if (rate === 0) return null;

    // 個人事業税の計算
    // 課税所得 = 事業所得 - 青色申告特別控除 - 各種控除 - 事業主控除(290万)
    // ※青色申告特別控除は個人事業税では適用されない
    const taxableBase = incomeNum + blueDed; // 青色控除を戻す
    const jigyonushiKojo = 2900000; // 事業主控除
    const taxableIncome = Math.max(0, taxableBase - spDed - jigyonushiKojo);
    const tax = Math.floor(taxableIncome * (rate / 100));

    return {
      incomeNum,
      blueDed,
      taxableBase,
      jigyonushiKojo,
      spDed,
      taxableIncome,
      rate,
      tax,
    };
  }, [income, selectedBiz, specialDeduction, hasBlueDeduction, blueDeduction, biz]);

  const categories = Array.from(new Set(BUSINESS_TYPES.map((b) => b.category)));

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">基本情報を入力</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* 業種選択 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
            <select
              value={selectedBiz}
              onChange={(e) => setSelectedBiz(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={cat}>
                  {BUSINESS_TYPES.filter((b) => b.category === cat).map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}（{b.rate}%）
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 事業所得 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              事業所得（青色控除前）<span className="text-gray-400 text-xs ml-1">円</span>
            </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000000"
            />
            <p className="text-xs text-gray-400 mt-1">確定申告書の「事業所得」欄</p>
          </div>

          {/* 青色申告特別控除 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              青色申告特別控除額<span className="text-gray-400 text-xs ml-1">円</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="blue"
                checked={hasBlueDeduction}
                onChange={(e) => setHasBlueDeduction(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="blue" className="text-sm text-gray-600">青色申告を利用している</label>
            </div>
            {hasBlueDeduction && (
              <select
                value={blueDeduction}
                onChange={(e) => setBlueDeduction(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="650000">65万円（電子申告・複式簿記）</option>
                <option value="550000">55万円（複式簿記のみ）</option>
                <option value="100000">10万円（簡易簿記）</option>
              </select>
            )}
            <p className="text-xs text-gray-400 mt-1">個人事業税では青色控除は適用されず、所得に加算して計算します</p>
          </div>

          {/* その他控除 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              その他控除（専従者給与等）<span className="text-gray-400 text-xs ml-1">円</span>
            </label>
            <input
              type="number"
              value={specialDeduction}
              onChange={(e) => setSpecialDeduction(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Result */}
      {result === null ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-green-700 font-semibold text-lg">この業種は個人事業税が非課税です</p>
          <p className="text-green-600 text-sm mt-1">農業・林業・鉱業などは個人事業税の課税対象外です</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>

          {/* 計算過程 */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">事業所得（申告ベース）</span>
              <span className="font-medium">{fmt(result.incomeNum)} 円</span>
            </div>
            {result.blueDed > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">（＋）青色申告特別控除の加算</span>
                <span className="font-medium text-orange-600">+{fmt(result.blueDed)} 円</span>
              </div>
            )}
            {result.spDed > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">（－）その他控除</span>
                <span className="font-medium text-blue-600">−{fmt(result.spDed)} 円</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">（－）事業主控除</span>
              <span className="font-medium text-blue-600">−{fmt(result.jigyonushiKojo)} 円</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 font-semibold">
              <span className="text-gray-700">課税対象所得</span>
              <span>{fmt(result.taxableIncome)} 円</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">税率（{biz?.name}）</span>
              <span className="font-medium">{result.rate}%</span>
            </div>
          </div>

          {/* 税額 */}
          <div className={`rounded-xl p-5 text-center ${result.tax === 0 ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`}>
            <p className="text-sm text-gray-500 mb-1">個人事業税（年額）</p>
            <p className={`text-4xl font-bold ${result.tax === 0 ? "text-green-600" : "text-blue-700"}`}>
              {fmt(result.tax)} <span className="text-xl font-normal">円</span>
            </p>
            {result.tax === 0 && (
              <p className="text-green-600 text-sm mt-2">課税対象所得が290万円以下のため非課税です</p>
            )}
            {result.tax > 0 && (
              <p className="text-gray-500 text-sm mt-2">
                通常8月・11月の2回に分けて納付（各 {fmt(result.tax / 2)} 円）
              </p>
            )}
          </div>
        </div>
      )}

      {/* 注意書き */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">注意事項</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>個人事業税は所得税・住民税とは別に都道府県に納める税金です</li>
          <li>青色申告特別控除は個人事業税の計算では適用されません（加算して計算）</li>
          <li>業種によって非課税となる場合があります（農業・林業・一部フリーランス等）</li>
          <li>この計算は概算です。正確な税額は都道府県税事務所にお問い合わせください</li>
        </ul>
      </div>
    </div>
  );
}
