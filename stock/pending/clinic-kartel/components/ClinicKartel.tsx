"use client";

import { useState } from "react";

interface EHRProduct {
  name: string;
  vendor: string;
  type: "cloud" | "onpremise" | "hybrid";
  initialCost: string;
  monthlyCost: string;
  targetSize: string;
  features: {
    reception: boolean;
    accounting: boolean;
    pharmacy: boolean;
    mri: boolean;
    orca: boolean;
    online: boolean;
    ai: boolean;
    mobile: boolean;
    multiClinic: boolean;
  };
  notes: string;
  url: string;
}

const PRODUCTS: EHRProduct[] = [
  {
    name: "CLINICS カルテ",
    vendor: "メドピア株式会社",
    type: "cloud",
    initialCost: "0円",
    monthlyCost: "55,000円〜",
    targetSize: "中小クリニック",
    features: { reception: true, accounting: true, pharmacy: false, mri: false, orca: true, online: true, ai: false, mobile: true, multiClinic: false },
    notes: "オンライン診療との親和性が高い。自動受付・問診機能あり",
    url: "https://clinics.cloud/karute/",
  },
  {
    name: "Medicom-HRf",
    vendor: "PHC株式会社",
    type: "onpremise",
    initialCost: "200万円〜",
    monthlyCost: "30,000円〜",
    targetSize: "中規模〜大規模",
    features: { reception: true, accounting: true, pharmacy: true, mri: true, orca: false, online: false, ai: false, mobile: false, multiClinic: true },
    notes: "国内シェアNo.1クラス。薬局・放射線科連携が強い",
    url: "https://www.phchd.com/jp/medicom",
  },
  {
    name: "ORCA（日医標準レセプトソフト）",
    vendor: "日本医師会",
    type: "onpremise",
    initialCost: "30万円〜",
    monthlyCost: "15,000円〜",
    targetSize: "全規模",
    features: { reception: false, accounting: true, pharmacy: false, mri: false, orca: false, online: false, ai: false, mobile: false, multiClinic: false },
    notes: "レセプト専用。他の電子カルテと連携して使うことが多い",
    url: "https://www.orca.med.or.jp/",
  },
  {
    name: "Qualis（クオリス）",
    vendor: "株式会社ソフトウェア・サービス",
    type: "onpremise",
    initialCost: "100万円〜",
    monthlyCost: "25,000円〜",
    targetSize: "中小クリニック",
    features: { reception: true, accounting: true, pharmacy: false, mri: false, orca: true, online: false, ai: false, mobile: false, multiClinic: false },
    notes: "内科・小児科向けに強み。ORCA連動型",
    url: "https://www.ssq.jp/",
  },
  {
    name: "電子カルテ WisClinic",
    vendor: "株式会社インフォコム",
    type: "cloud",
    initialCost: "0円",
    monthlyCost: "38,500円〜",
    targetSize: "中小クリニック",
    features: { reception: true, accounting: true, pharmacy: false, mri: false, orca: true, online: true, ai: false, mobile: true, multiClinic: false },
    notes: "クラウド型でコスト低め。遠隔医療対応",
    url: "https://www.wisclinic.jp/",
  },
  {
    name: "MedicalForce",
    vendor: "株式会社MedicalForce",
    type: "cloud",
    initialCost: "0円",
    monthlyCost: "49,800円〜",
    targetSize: "自由診療クリニック",
    features: { reception: true, accounting: true, pharmacy: false, mri: false, orca: false, online: true, ai: true, mobile: true, multiClinic: true },
    notes: "美容・自由診療特化。予約・決済・マーケティング一体型",
    url: "https://medicalforce.co.jp/",
  },
  {
    name: "エムスリーデジカル",
    vendor: "エムスリーデジカル株式会社",
    type: "cloud",
    initialCost: "0円",
    monthlyCost: "44,000円〜",
    targetSize: "中小クリニック",
    features: { reception: true, accounting: true, pharmacy: false, mri: false, orca: true, online: true, ai: true, mobile: true, multiClinic: false },
    notes: "AI問診・AI画像診断との連携。m3グループのリソース活用",
    url: "https://digital.m3.com/",
  },
  {
    name: "HELIOS（ヘリオス）",
    vendor: "株式会社Planseed",
    type: "cloud",
    initialCost: "0円",
    monthlyCost: "33,000円〜",
    targetSize: "小規模クリニック",
    features: { reception: true, accounting: true, pharmacy: false, mri: false, orca: true, online: false, ai: false, mobile: false, multiClinic: false },
    notes: "シンプルで導入しやすい。ORCA連携標準",
    url: "https://helios-karte.jp/",
  },
];

const FEATURE_LABELS: Record<keyof EHRProduct["features"], string> = {
  reception: "受付管理",
  accounting: "レセコン",
  pharmacy: "薬剤管理",
  mri: "画像管理",
  orca: "ORCA連携",
  online: "オンライン診療",
  ai: "AI機能",
  mobile: "モバイル対応",
  multiClinic: "多院管理",
};

const TYPE_LABELS: Record<EHRProduct["type"], string> = {
  cloud: "クラウド",
  onpremise: "オンプレミス",
  hybrid: "ハイブリッド",
};

const TYPE_COLORS: Record<EHRProduct["type"], string> = {
  cloud: "bg-blue-100 text-blue-700",
  onpremise: "bg-gray-100 text-gray-700",
  hybrid: "bg-purple-100 text-purple-700",
};

export default function ClinicKartel() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterFeature, setFilterFeature] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("card");

  const filtered = PRODUCTS.filter((p) => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterFeature !== "all" && !p.features[filterFeature as keyof EHRProduct["features"]]) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <span className="text-xs text-gray-500 mr-2">種別:</span>
            {[{ v: "all", l: "すべて" }, { v: "cloud", l: "クラウド" }, { v: "onpremise", l: "オンプレ" }].map((f) => (
              <button key={f.v} onClick={() => setFilterType(f.v)}
                className={`mr-1 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${filterType === f.v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"}`}>
                {f.l}
              </button>
            ))}
          </div>
          <div>
            <span className="text-xs text-gray-500 mr-2">機能:</span>
            <select value={filterFeature} onChange={(e) => setFilterFeature(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none">
              <option value="all">すべて</option>
              {Object.entries(FEATURE_LABELS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex gap-1">
            {[{ v: "card", l: "カード" }, { v: "table", l: "表" }].map((m) => (
              <button key={m.v} onClick={() => setViewMode(m.v as "table" | "card")}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${viewMode === m.v ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300"}`}>
                {m.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* カード表示 */}
      {viewMode === "card" && (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.vendor}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[p.type]}`}>{TYPE_LABELS[p.type]}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">初期費用</p>
                  <p className="font-semibold text-gray-800">{p.initialCost}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">月額費用</p>
                  <p className="font-semibold text-gray-800">{p.monthlyCost}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {(Object.keys(p.features) as Array<keyof EHRProduct["features"]>).filter((k) => p.features[k]).map((k) => (
                  <span key={k} className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{FEATURE_LABELS[k]}</span>
                ))}
              </div>
              <p className="text-xs text-gray-500">{p.notes}</p>
            </div>
          ))}
        </div>
      )}

      {/* 表表示 */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">製品名</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">種別</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">初期費用</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">月額</th>
                {Object.entries(FEATURE_LABELS).map(([k, l]) => (
                  <th key={k} className="text-center px-2 py-3 font-medium text-gray-600 text-xs">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.vendor}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[p.type]}`}>{TYPE_LABELS[p.type]}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{p.initialCost}</td>
                  <td className="px-4 py-3 text-right">{p.monthlyCost}</td>
                  {(Object.keys(p.features) as Array<keyof EHRProduct["features"]>).map((k) => (
                    <td key={k} className="px-2 py-3 text-center">
                      {p.features[k] ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">−</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">免責事項</p>
        <p className="text-xs">料金は2024年時点の公開情報に基づく目安です。実際の費用は規模・オプション・契約条件により異なります。導入前に各ベンダーへ正式な見積を依頼してください。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このクリニック電子カルテ比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">主要電子カルテシステムの初期費用・月額・機能を横断比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このクリニック電子カルテ比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "主要電子カルテシステムの初期費用・月額・機能を横断比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "クリニック電子カルテ比較",
  "description": "主要電子カルテシステムの初期費用・月額・機能を横断比較",
  "url": "https://tools.loresync.dev/clinic-kartel",
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
