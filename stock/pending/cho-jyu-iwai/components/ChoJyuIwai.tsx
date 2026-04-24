"use client";
import { useState } from "react";

const CELEBRATIONS = [
  {
    age: 60,
    name: "還暦",
    reading: "かんれき",
    color: "#e53e3e",
    colorName: "赤",
    origin: "60年で十干十二支が一巡し、生まれ年の干支に還ることから",
    gift: "赤いちゃんちゃんこ・赤いベスト",
  },
  {
    age: 70,
    name: "古希",
    reading: "こき",
    color: "#805ad5",
    colorName: "紫",
    origin: "唐の詩人・杜甫の詩「人生七十古来稀」に由来",
    gift: "紫色の品物・旅行券",
  },
  {
    age: 77,
    name: "喜寿",
    reading: "きじゅ",
    color: "#805ad5",
    colorName: "紫",
    origin: "「喜」の草書体が七十七に見えることから",
    gift: "紫色の品物・花束",
  },
  {
    age: 80,
    name: "傘寿",
    reading: "さんじゅ",
    color: "#d69e2e",
    colorName: "金・黄",
    origin: "「傘」の略字が八十に見えることから",
    gift: "金色・黄色の品物",
  },
  {
    age: 88,
    name: "米寿",
    reading: "べいじゅ",
    color: "#d69e2e",
    colorName: "金・黄",
    origin: "「米」の字を分解すると八十八になることから",
    gift: "金色・黄色の品物・お米",
  },
  {
    age: 90,
    name: "卒寿",
    reading: "そつじゅ",
    color: "#805ad5",
    colorName: "紫",
    origin: "「卒」の略字「卆」が九十に見えることから",
    gift: "紫色の品物・旅行券",
  },
  {
    age: 99,
    name: "白寿",
    reading: "はくじゅ",
    color: "#ffffff",
    colorName: "白",
    origin: "百から一を引くと「白」になることから",
    gift: "白色の品物・真珠",
  },
  {
    age: 100,
    name: "百寿",
    reading: "ひゃくじゅ",
    color: "#f6ad55",
    colorName: "桃・金",
    origin: "百歳を迎えることから。「紀寿」とも",
    gift: "好きなものを贈る・家族での食事会",
  },
  {
    age: 108,
    name: "茶寿",
    reading: "ちゃじゅ",
    color: "#68d391",
    colorName: "緑",
    origin: "「茶」の字を分解すると百八になることから",
    gift: "高級茶・緑色の品物",
  },
  {
    age: 111,
    name: "皇寿",
    reading: "こうじゅ",
    color: "#f6ad55",
    colorName: "金",
    origin: "「皇」の字を分解すると百十一になることから",
    gift: "最高級の品・家族の集い",
  },
  {
    age: 120,
    name: "大還暦",
    reading: "だいかんれき",
    color: "#e53e3e",
    colorName: "赤",
    origin: "二度目の還暦（60×2）。干支が二巡することから",
    gift: "赤色の品物・家族での祝宴",
  },
];

export default function ChoJyuIwai() {
  const [birthYear, setBirthYear] = useState("");
  const [showDetail, setShowDetail] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();
  const birth = parseInt(birthYear, 10);
  const currentAge = birthYear && !isNaN(birth) ? currentYear - birth : null;

  const getStatus = (age: number) => {
    if (currentAge === null) return "none";
    if (currentAge === age) return "current";
    if (currentAge > age) return "past";
    if (age - currentAge <= 5) return "upcoming";
    return "future";
  };

  const getStatusLabel = (age: number) => {
    const s = getStatus(age);
    const diff = age - (currentAge ?? 0);
    if (s === "current") return { text: "今年！", color: "bg-red-100 text-red-700 border border-red-300" };
    if (s === "past") return { text: `${(currentAge ?? 0) - age}年前`, color: "bg-gray-100 text-gray-500" };
    if (s === "upcoming") return { text: `あと${diff}年`, color: "bg-amber-100 text-amber-700 border border-amber-300" };
    if (s === "future") return { text: `${currentYear + diff}年`, color: "bg-blue-50 text-blue-600" };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 生年入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">生年を入力して該当祝いを確認</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-gray-600 whitespace-nowrap">生まれ年（西暦）</label>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="例：1945"
            min={1900}
            max={currentYear}
            className="border border-gray-300 rounded-lg px-4 py-2 w-36 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {currentAge !== null && (
            <span className="text-sm text-gray-600">
              現在 <strong className="text-gray-900">{currentAge}歳</strong>（満年齢）
            </span>
          )}
          {birthYear && (isNaN(birth) || birth < 1900 || birth > currentYear) && (
            <span className="text-sm text-red-500">有効な年を入力してください</span>
          )}
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">長寿祝い 一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">年齢</th>
                <th className="px-4 py-3">名称</th>
                <th className="px-4 py-3">テーマカラー</th>
                <th className="px-4 py-3 hidden sm:table-cell">お祝いの品</th>
                <th className="px-4 py-3">状況</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CELEBRATIONS.map((c) => {
                const status = getStatus(c.age);
                const label = getStatusLabel(c.age);
                const isCurrent = status === "current";
                return (
                  <tr
                    key={c.age}
                    className={`transition-colors ${isCurrent ? "bg-red-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-4">
                      <span className={`text-2xl font-bold ${isCurrent ? "text-red-600" : "text-gray-800"}`}>
                        {c.age}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">歳</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.reading}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-sm text-gray-700">{c.colorName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{c.gift}</span>
                    </td>
                    <td className="px-4 py-4">
                      {label && (
                        <span className={`text-xs px-2 py-1 rounded-full ${label.color}`}>
                          {label.text}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setShowDetail(showDetail === c.age ? null : c.age)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        {showDetail === c.age ? "閉じる" : "由来"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 由来詳細 */}
      {showDetail !== null && (() => {
        const c = CELEBRATIONS.find((x) => x.age === showDetail);
        if (!c) return null;
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: c.color }}
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{c.name}（{c.age}歳）</h3>
                <p className="text-sm text-gray-500">{c.reading}</p>
              </div>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">由来</dt>
                <dd className="text-gray-700">{c.origin}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">テーマカラー</dt>
                <dd className="text-gray-700">{c.colorName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">おすすめの贈り物</dt>
                <dd className="text-gray-700">{c.gift}</dd>
              </div>
            </dl>
          
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この長寿祝い一覧ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">還暦・古希・喜寿・傘寿・米寿・卒寿・白寿・百寿まで、年齢・名称・テーマカラーを一覧表示。生年から該当する長寿祝いを自動判定。。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この長寿祝い一覧ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "還暦・古希・喜寿・傘寿・米寿・卒寿・白寿・百寿まで、年齢・名称・テーマカラーを一覧表示。生年から該当する長寿祝いを自動判定。。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
        );
      })()}

      {/* 注意書き */}
      <div className="text-xs text-gray-400 text-center">
        ※ 年齢は数え年ではなく満年齢で表示しています。地域・宗派により慣習が異なる場合があります。
      </div>
    </div>
  );
}
