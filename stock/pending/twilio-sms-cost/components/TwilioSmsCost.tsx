"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface Country {
  code: string;
  name: string;
  flag: string;
  outboundUSD: number;
  inboundUSD: number;
  notes?: string;
}

const COUNTRIES: Country[] = [
  { code: "JP", name: "日本", flag: "🇯🇵", outboundUSD: 0.0832, inboundUSD: 0.0075 },
  { code: "US", name: "アメリカ", flag: "🇺🇸", outboundUSD: 0.0079, inboundUSD: 0.0075 },
  { code: "GB", name: "イギリス", flag: "🇬🇧", outboundUSD: 0.04, inboundUSD: 0.0075 },
  { code: "AU", name: "オーストラリア", flag: "🇦🇺", outboundUSD: 0.0564, inboundUSD: 0.0075 },
  { code: "CA", name: "カナダ", flag: "🇨🇦", outboundUSD: 0.0079, inboundUSD: 0.0075 },
  { code: "DE", name: "ドイツ", flag: "🇩🇪", outboundUSD: 0.0786, inboundUSD: 0.0075 },
  { code: "FR", name: "フランス", flag: "🇫🇷", outboundUSD: 0.0687, inboundUSD: 0.0075 },
  { code: "KR", name: "韓国", flag: "🇰🇷", outboundUSD: 0.0413, inboundUSD: 0.0075 },
  { code: "CN", name: "中国", flag: "🇨🇳", outboundUSD: 0.0439, inboundUSD: 0.0075 },
  { code: "IN", name: "インド", flag: "🇮🇳", outboundUSD: 0.0177, inboundUSD: 0.0075 },
  { code: "SG", name: "シンガポール", flag: "🇸🇬", outboundUSD: 0.0389, inboundUSD: 0.0075 },
  { code: "TW", name: "台湾", flag: "🇹🇼", outboundUSD: 0.0469, inboundUSD: 0.0075 },
  { code: "PH", name: "フィリピン", flag: "🇵🇭", outboundUSD: 0.0333, inboundUSD: 0.0075 },
  { code: "TH", name: "タイ", flag: "🇹🇭", outboundUSD: 0.0261, inboundUSD: 0.0075 },
  { code: "ID", name: "インドネシア", flag: "🇮🇩", outboundUSD: 0.0452, inboundUSD: 0.0075 },
];

const PHONE_NUMBER_COST_USD = 1.15; // /month local number

function formatJPY(usd: number, rate: number): string {
  return Math.round(usd * rate).toLocaleString("ja-JP");
}

export default function TwilioSmsCost() {
  const [selectedCountry, setSelectedCountry] = useState<string>("JP");
  const [outboundCount, setOutboundCount] = useState(1000);
  const [inboundCount, setInboundCount] = useState(100);
  const [phoneNumbers, setPhoneNumbers] = useState(1);
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);

  const country = COUNTRIES.find((c) => c.code === selectedCountry) ?? COUNTRIES[0];

  const result = useMemo(() => {
    const outboundCostUSD = country.outboundUSD * outboundCount;
    const inboundCostUSD = country.inboundUSD * inboundCount;
    const phoneNumberCostUSD = PHONE_NUMBER_COST_USD * phoneNumbers;
    const totalUSD = outboundCostUSD + inboundCostUSD + phoneNumberCostUSD;
    const totalJPY = totalUSD * usdRate;
    return { outboundCostUSD, inboundCostUSD, phoneNumberCostUSD, totalUSD, totalJPY };
  }, [country, outboundCount, inboundCount, phoneNumbers, usdRate]);

  return (
    <div className="space-y-6">
      {/* Country selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">送信先と利用条件を設定</h2>

        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 block mb-2">SMS送信先の国</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                  selectedCountry === c.code
                    ? "bg-purple-50 border-purple-400 text-purple-800 font-medium"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  ${c.outboundUSD.toFixed(4)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              月間送信数（アウトバウンド）
            </label>
            <input
              type="number"
              value={outboundCount}
              min={0}
              step={100}
              onChange={(e) => setOutboundCount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              月間受信数（インバウンド）
            </label>
            <input
              type="number"
              value={inboundCount}
              min={0}
              step={100}
              onChange={(e) => setInboundCount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              電話番号の取得数
            </label>
            <input
              type="number"
              value={phoneNumbers}
              min={0}
              max={100}
              step={1}
              onChange={(e) => setPhoneNumbers(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">為替レート（1 USD =）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={usdRate}
              min={100}
              max={200}
              step={1}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <span className="text-sm text-gray-600">円</span>
          </div>
        </div>
      </div>

      {/* Result summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-purple-800 text-lg">月間推定コスト</span>
          <span className="text-3xl font-bold text-purple-900">
            ¥{Math.round(result.totalJPY).toLocaleString("ja-JP")}
          </span>
        </div>
        <p className="text-sm text-purple-600">= ${result.totalUSD.toFixed(2)} USD</p>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">費用内訳</h3>
        <div className="space-y-3">
          {[
            {
              label: `SMS送信（${outboundCount.toLocaleString()}通 × $${country.outboundUSD}/通）`,
              usd: result.outboundCostUSD,
            },
            {
              label: `SMS受信（${inboundCount.toLocaleString()}通 × $${country.inboundUSD}/通）`,
              usd: result.inboundCostUSD,
            },
            {
              label: `電話番号（${phoneNumbers}番号 × $${PHONE_NUMBER_COST_USD}/月）`,
              usd: result.phoneNumberCostUSD,
            },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-700">{item.label}</span>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  ¥{formatJPY(item.usd, usdRate)}
                </div>
                <div className="text-xs text-gray-400">${item.usd.toFixed(2)}</div>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-gray-800">合計</span>
            <div className="text-right">
              <div className="text-xl font-bold text-purple-700">
                ¥{Math.round(result.totalJPY).toLocaleString("ja-JP")}
              </div>
              <div className="text-xs text-gray-500">${result.totalUSD.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Country comparison table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">国別SMS単価一覧（1通あたり）</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">国</th>
                <th className="text-right px-4 py-2 text-gray-600">送信（USD）</th>
                <th className="text-right px-4 py-2 text-gray-600">送信（円）</th>
                <th className="text-right px-4 py-2 text-gray-600">受信（USD）</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRIES.map((c) => (
                <tr
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`border-t border-gray-100 cursor-pointer transition-colors ${
                    c.code === selectedCountry ? "bg-purple-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2">
                    <span className="mr-2">{c.flag}</span>
                    {c.name}
                    {c.code === selectedCountry && (
                      <span className="ml-2 text-xs text-purple-600 font-medium">選択中</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    ${c.outboundUSD.toFixed(4)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    ¥{Math.round(c.outboundUSD * usdRate * 100) / 100}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-gray-500">
                    ${c.inboundUSD.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 料金は2024年時点のTwilio公式料金ページを参考にした概算です。</p>
        <p>※ 日本はA2Pメッセージング登録が必要な場合があり、別途費用が発生することがあります。</p>
        <p>※ 長いメッセージ（160文字超）は複数通扱いになります。</p>
        <p>※ 実際の請求はTwilio公式サイトでご確認ください。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このTwilio SMS料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">国別SMS単価と月間送信数から料金を試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このTwilio SMS料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "国別SMS単価と月間送信数から料金を試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
