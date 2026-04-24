"use client";

import { useState, useMemo } from "react";

interface RegistrationType {
  name: string;
  category: string;
  basis: "hyokaGaku" | "saiken" | "fixed";
  rate: number;
  fixedAmount?: number;
  notes?: string;
}

const REGISTRATION_TYPES: RegistrationType[] = [
  // 所有権
  { category: "所有権移転登記", name: "売買による所有権移転（土地）", basis: "hyokaGaku", rate: 0.015, notes: "2026年3月末まで軽減税率" },
  { category: "所有権移転登記", name: "売買による所有権移転（建物）", basis: "hyokaGaku", rate: 0.020 },
  { category: "所有権移転登記", name: "相続・法人合併による所有権移転", basis: "hyokaGaku", rate: 0.004 },
  { category: "所有権移転登記", name: "贈与・交換・競売等による所有権移転", basis: "hyokaGaku", rate: 0.020 },
  // 所有権保存
  { category: "所有権保存登記", name: "所有権保存登記（一般住宅）", basis: "hyokaGaku", rate: 0.004, notes: "新築・一般建物" },
  { category: "所有権保存登記", name: "所有権保存登記（認定長期優良住宅）", basis: "hyokaGaku", rate: 0.001, notes: "2026年3月末まで軽減" },
  { category: "所有権保存登記", name: "所有権保存登記（認定低炭素住宅）", basis: "hyokaGaku", rate: 0.001, notes: "2026年3月末まで軽減" },
  // 抵当権
  { category: "抵当権設定登記", name: "抵当権設定登記（一般）", basis: "saiken", rate: 0.004 },
  { category: "抵当権設定登記", name: "抵当権設定登記（住宅ローン軽減）", basis: "saiken", rate: 0.001, notes: "2026年3月末まで軽減" },
  // 地上権・賃借権
  { category: "地上権・賃借権", name: "地上権・永小作権の設定移転", basis: "hyokaGaku", rate: 0.010 },
  { category: "地上権・賃借権", name: "賃借権の設定移転", basis: "hyokaGaku", rate: 0.010 },
  // 会社・法人
  { category: "会社・法人登記", name: "株式会社の設立", basis: "fixed", rate: 0.007, notes: "資本金×0.7%（最低15万円）", fixedAmount: 150000 },
  { category: "会社・法人登記", name: "合同会社（LLC）の設立", basis: "fixed", rate: 0.007, notes: "資本金×0.7%（最低6万円）", fixedAmount: 60000 },
  { category: "会社・法人登記", name: "支店の設置", basis: "fixed", rate: 0, fixedAmount: 90000 },
  { category: "会社・法人登記", name: "増資（資本金の増加）", basis: "fixed", rate: 0.007, notes: "増加額×0.7%（最低3万円）", fixedAmount: 30000 },
];

function fmt(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}

export default function TourokumenkyoZei() {
  const [selectedType, setSelectedType] = useState(REGISTRATION_TYPES[0].name);
  const [hyokaGaku, setHyokaGaku] = useState("20000000");
  const [saikenGaku, setSaikenGaku] = useState("20000000");
  const [shihonGaku, setShihonGaku] = useState("1000000");

  const regType = REGISTRATION_TYPES.find((r) => r.name === selectedType) || REGISTRATION_TYPES[0];

  const result = useMemo(() => {
    let base = 0;
    if (regType.basis === "hyokaGaku") base = parseFloat(hyokaGaku) || 0;
    else if (regType.basis === "saiken") base = parseFloat(saikenGaku) || 0;
    else if (regType.basis === "fixed") base = parseFloat(shihonGaku) || 0;

    let tax = 0;
    if (regType.basis === "fixed") {
      tax = Math.max(regType.fixedAmount ?? 0, Math.floor(base * regType.rate));
    } else {
      tax = Math.floor(base * regType.rate);
    }
    // 最低税額1000円（会社登記以外）
    if (regType.basis !== "fixed") {
      tax = Math.max(1000, tax);
    }
    // 1000円未満切り捨て
    tax = Math.floor(tax / 1000) * 1000;

    return { base, tax, rate: regType.rate };
  }, [regType, hyokaGaku, saikenGaku, shihonGaku]);

  const categories = Array.from(new Set(REGISTRATION_TYPES.map((r) => r.category)));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">登記の種類を選択</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">登記種別</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {categories.map((cat) => (
              <optgroup key={cat} label={cat}>
                {REGISTRATION_TYPES.filter((r) => r.category === cat).map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {regType.notes && (
            <p className="text-xs text-blue-600 mt-1">ℹ {regType.notes}</p>
          )}
        </div>

        {regType.basis === "hyokaGaku" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">固定資産税評価額（課税価格）<span className="text-gray-400 text-xs ml-1">円</span></label>
            <input type="number" value={hyokaGaku} onChange={(e) => setHyokaGaku(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="20000000" />
            <p className="text-xs text-gray-400 mt-1">固定資産税評価証明書に記載の価格をご確認ください</p>
          </div>
        )}
        {regType.basis === "saiken" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">債権金額（ローン借入額）<span className="text-gray-400 text-xs ml-1">円</span></label>
            <input type="number" value={saikenGaku} onChange={(e) => setSaikenGaku(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="20000000" />
          </div>
        )}
        {regType.basis === "fixed" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {selectedType.includes("増資") ? "増加資本金額" : "資本金額"}<span className="text-gray-400 text-xs ml-1">円</span>
            </label>
            <input type="number" value={shihonGaku} onChange={(e) => setShihonGaku(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1000000" />
          </div>
        )}
      </div>

      {/* 結果 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">課税標準（{regType.basis === "saiken" ? "債権金額" : regType.basis === "fixed" ? "資本金等" : "固定資産税評価額"}）</span>
            <span className="font-medium">{fmt(result.base)} 円</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">税率</span>
            <span className="font-medium">{(result.rate * 1000).toFixed(1)}‰ ({(result.rate * 100).toFixed(1)}%)</span>
          </div>
          {regType.fixedAmount && regType.fixedAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">最低税額</span>
              <span className="font-medium">{fmt(regType.fixedAmount)} 円</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-sm text-blue-600 mb-1">登録免許税</p>
          <p className="text-4xl font-bold text-blue-700">
            {fmt(result.tax)} <span className="text-xl font-normal">円</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">※ 1,000円未満切り捨て、最低1,000円</p>
        </div>
      </div>

      {/* よくある登記 早見表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">よくある登記 税率早見表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-gray-600 font-medium">登記種別</th>
                <th className="text-right px-3 py-2 text-gray-600 font-medium">税率</th>
                <th className="text-left px-3 py-2 text-gray-600 font-medium">備考</th>
              </tr>
            </thead>
            <tbody>
              {REGISTRATION_TYPES.filter(r => r.category !== "会社・法人登記").map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 text-gray-700">{r.name}</td>
                  <td className="px-3 py-2 text-right font-medium">{(r.rate * 1000).toFixed(1)}‰</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{r.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">注意事項</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>軽減税率は一定要件（床面積・居住用途など）を満たす場合に適用されます</li>
          <li>固定資産税評価額は評価証明書で確認してください</li>
          <li>司法書士費用・登記申請手数料は別途必要です</li>
        </ul>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この登録免許税計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">不動産登記の種類・固定資産税評価額・価額から登録免許税を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この登録免許税計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "不動産登記の種類・固定資産税評価額・価額から登録免許税を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "登録免許税計算",
  "description": "不動産登記の種類・固定資産税評価額・価額から登録免許税を計算",
  "url": "https://tools.loresync.dev/tourokumenkyozei",
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
