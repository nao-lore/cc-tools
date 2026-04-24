"use client";

import { useState } from "react";

interface Plan {
  name: string;
  price: number; // monthly yen
  priceNote?: string;
  target: string;
  features: string[];
}

interface Product {
  id: string;
  name: string;
  vendor: string;
  color: string;
  logoText: string;
  personalPlans: Plan[];
  corporatePlans: Plan[];
  pros: string[];
  cons: string[];
  bestFor: string;
}

const PRODUCTS: Product[] = [
  {
    id: "freee",
    name: "freee会計",
    vendor: "freee株式会社",
    color: "bg-green-500",
    logoText: "freee",
    personalPlans: [
      { name: "スターター", price: 1980, target: "副業・シンプルな個人事業主", features: ["確定申告書作成", "銀行明細自動取込（1口座）", "基本レポート"] },
      { name: "スタンダード", price: 3316, target: "一般的な個人事業主", features: ["確定申告書作成", "銀行明細自動取込（無制限）", "請求書作成", "経費管理", "消費税申告"] },
      { name: "プレミアム", price: 5316, target: "高機能が必要な個人事業主", features: ["スタンダード全機能", "チャットサポート", "電話サポート", "税務調査サポート"] },
    ],
    corporatePlans: [
      { name: "ミニマム", price: 2618, target: "小規模法人・スタートアップ", features: ["確定申告書作成", "銀行明細自動取込", "基本レポート", "2ユーザー"] },
      { name: "スタンダード", price: 5238, target: "成長期の法人", features: ["法人税申告書なし", "銀行明細自動取込（無制限）", "請求書作成", "消費税申告", "5ユーザー"] },
      { name: "アドバンス", price: 39600, priceNote: "カスタム", target: "中堅企業", features: ["全機能", "予実管理", "多通貨", "API連携", "専任サポート"] },
    ],
    pros: ["UI/UXが抜群にわかりやすい", "オンライン申告（e-Tax）完全対応", "受発注・給与まで一気通貫"],
    cons: ["プランが複雑", "上位機能は高コスト", "法人税申告は別途MFか税理士が必要"],
    bestFor: "初めて会計ソフトを使う個人事業主・スタートアップ",
  },
  {
    id: "mf",
    name: "マネーフォワード クラウド会計",
    vendor: "株式会社マネーフォワード",
    color: "bg-blue-500",
    logoText: "MF",
    personalPlans: [
      { name: "パーソナルミニ", price: 990, target: "副業・シンプルな事業主", features: ["確定申告書作成", "銀行明細自動取込（4口座）", "基本レポート"] },
      { name: "パーソナル", price: 1650, target: "一般的な個人事業主", features: ["確定申告書作成", "銀行明細自動取込（無制限）", "請求書管理"] },
      { name: "パーソナルプラス", price: 3650, target: "高機能が必要な事業主", features: ["全機能", "税理士検索", "チャットサポート"] },
    ],
    corporatePlans: [
      { name: "スモールビジネス", price: 2530, target: "小規模法人", features: ["法人決算書作成", "銀行明細自動取込（無制限）", "3ユーザー"] },
      { name: "ビジネス", price: 4378, target: "中小法人", features: ["全機能", "法人税申告書（別アドオン）", "20ユーザー", "仕訳承認ワークフロー"] },
    ],
    pros: ["個人向けプランが安い", "銀行・カード連携数が業界最多クラス", "給与・経費精算・請求書が別サービスと連携"],
    cons: ["UI学習コストが中程度", "法人税申告はアドオン必要", "サービスが分散している"],
    bestFor: "コスト重視の個人事業主・銀行連携を重視する企業",
  },
  {
    id: "yayoi",
    name: "弥生会計 オンライン",
    vendor: "弥生株式会社",
    color: "bg-orange-500",
    logoText: "弥生",
    personalPlans: [
      { name: "セルフプラン", price: 9680, priceNote: "年払いのみ", target: "自分で処理できる個人事業主", features: ["確定申告書作成", "銀行明細自動取込", "基本レポート", "初年度無料"] },
      { name: "ベーシックプラン", price: 13200, priceNote: "年払いのみ", target: "サポートが必要な個人事業主", features: ["全機能", "電話サポート", "チャットサポート", "初年度無料"] },
    ],
    corporatePlans: [
      { name: "セルフプラン", price: 26400, priceNote: "年払いのみ", target: "小規模法人", features: ["法人決算書作成", "銀行明細自動取込", "基本レポート"] },
      { name: "ベーシックプラン", price: 37400, priceNote: "年払いのみ", target: "中小法人", features: ["全機能", "電話サポート", "チャットサポート"] },
    ],
    pros: ["老舗で安心感・税理士との親和性高い", "初年度無料キャンペーンが多い", "インストール版からの移行がスムーズ"],
    cons: ["UIがやや古い印象", "年払いのみで月払い不可", "モバイルアプリが弱い"],
    bestFor: "税理士と連携する中小企業・インストール版からの移行ユーザー",
  },
];

function fmt(n: number) {
  return n.toLocaleString("ja-JP");
}

export default function CloudAccountingCmp() {
  const [userType, setUserType] = useState<"personal" | "corporate">("personal");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(["freee", "mf"]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3));
  };

  const displayed = compareMode ? PRODUCTS.filter((p) => selectedIds.includes(p.id)) : PRODUCTS;

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {[{ v: "personal", l: "個人事業主" }, { v: "corporate", l: "法人" }].map((t) => (
              <button key={t.v} onClick={() => setUserType(t.v as "personal" | "corporate")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${userType === t.v ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                {t.l}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} className="rounded" />
            比較モード（最大3製品）
          </label>
        </div>
      </div>

      {/* 製品カード */}
      <div className="grid gap-6 md:grid-cols-3">
        {displayed.map((p) => {
          const plans = userType === "personal" ? p.personalPlans : p.corporatePlans;
          const cheapest = Math.min(...plans.map((pl) => pl.price));
          const isSelected = selectedIds.includes(p.id);

          return (
            <div key={p.id} className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${compareMode && isSelected ? "border-blue-400" : "border-gray-200"}`}>
              {compareMode && (
                <div className="p-3 border-b border-gray-100">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} className="rounded" />
                    比較対象に追加
                  </label>
                </div>
              )}
              <div className={`${p.color} p-4 rounded-t-xl`}>
                <p className="text-white font-bold text-xl">{p.name}</p>
                <p className="text-white/80 text-xs">{p.vendor}</p>
              </div>
              <div className="p-4">
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-500">{userType === "personal" ? "個人" : "法人"}向け最安プラン</p>
                  <p className="text-2xl font-bold text-gray-800">{fmt(cheapest)}<span className="text-sm font-normal text-gray-500">円/月〜</span></p>
                </div>

                {/* プラン一覧 */}
                <div className="space-y-2 mb-4">
                  {plans.map((pl) => (
                    <div key={pl.name} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-semibold text-gray-800">{pl.name}</p>
                        <p className="text-sm font-bold text-gray-800">{fmt(pl.price)}<span className="text-xs font-normal text-gray-500">円{pl.priceNote ? `（${pl.priceNote}）` : "/月"}</span></p>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{pl.target}</p>
                      <ul className="space-y-0.5">
                        {pl.features.map((f) => (
                          <li key={f} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-green-500 shrink-0">✓</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* pros/cons */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">メリット</p>
                  <ul className="space-y-0.5">
                    {p.pros.map((pro) => <li key={pro} className="text-xs text-gray-600">+ {pro}</li>)}
                  </ul>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">デメリット</p>
                  <ul className="space-y-0.5">
                    {p.cons.map((con) => <li key={con} className="text-xs text-gray-600">− {con}</li>)}
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-2 text-xs text-blue-700">
                  <span className="font-semibold">おすすめ: </span>{p.bestFor}
                </div>
              </div>
            
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このクラウド会計ソフト比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">freee会計・マネーフォワードクラウド・弥生会計の料金と機能を比較。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このクラウド会計ソフト比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "freee会計・マネーフォワードクラウド・弥生会計の料金と機能を比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
          );
        })}
      </div>

      {/* 比較表 */}
      {compareMode && selectedIds.length >= 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">機能比較表</h2>
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-gray-600 font-medium">項目</th>
                {PRODUCTS.filter((p) => selectedIds.includes(p.id)).map((p) => (
                  <th key={p.id} className="text-center px-3 py-2 text-gray-600 font-medium">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "月払い対応", values: { freee: "○", mf: "○", yayoi: "×（年払いのみ）" } },
                { label: "初年度無料", values: { freee: "×", mf: "×", yayoi: "○" } },
                { label: "e-Tax連携", values: { freee: "○", mf: "○", yayoi: "○" } },
                { label: "スマホアプリ", values: { freee: "○", mf: "○", yayoi: "△" } },
                { label: "法人税申告書", values: { freee: "×（税理士連携）", mf: "アドオン", yayoi: "○" } },
                { label: "API公開", values: { freee: "○", mf: "○", yayoi: "△" } },
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-medium text-gray-700">{row.label}</td>
                  {PRODUCTS.filter((p) => selectedIds.includes(p.id)).map((p) => (
                    <td key={p.id} className="px-3 py-2 text-center text-gray-700">{row.values[p.id as keyof typeof row.values] ?? "−"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800">
        料金は2024年時点の公開情報に基づく税込目安です。キャンペーン価格・年払い割引・オプション費用は含みません。最新の価格は各公式サイトでご確認ください。
      </div>
    </div>
  );
}
