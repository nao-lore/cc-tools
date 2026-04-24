"use client";
import { useState, useMemo } from "react";

interface WineProfile {
  grape: string;
  region: string;
  peakStart: number; // years after vintage
  peakEnd: number;
  maxAge: number;
  description: string;
  servingTemp: string;
  decanting: string;
}

const WINE_PROFILES: WineProfile[] = [
  { grape: "カベルネ・ソーヴィニョン", region: "ボルドー (格付シャトー)", peakStart: 10, peakEnd: 25, maxAge: 40, description: "タンニン豊富。長期熟成でセドロ・革・タバコの複雑さが増す。", servingTemp: "16-18°C", decanting: "2〜3時間" },
  { grape: "カベルネ・ソーヴィニョン", region: "ナパバレー (カルト)", peakStart: 8, peakEnd: 20, maxAge: 30, description: "ボルドーよりフルーティ。熟成でバニラ・ダークフルーツが発展。", servingTemp: "16-18°C", decanting: "1〜2時間" },
  { grape: "ピノ・ノワール", region: "ブルゴーニュ (プルミエ/グランクリュ)", peakStart: 8, peakEnd: 20, maxAge: 30, description: "繊細。熟成でトリュフ・腐葉土・なめし革のテルシアリー香。", servingTemp: "14-16°C", decanting: "30分〜1時間" },
  { grape: "ピノ・ノワール", region: "カリフォルニア/オレゴン", peakStart: 4, peakEnd: 10, maxAge: 15, description: "フルーティで飲みやすい。早めが吉。", servingTemp: "14-16°C", decanting: "なし〜30分" },
  { grape: "ネッビオーロ", region: "バローロ / バルバレスコ", peakStart: 12, peakEnd: 30, maxAge: 50, description: "高タンニン・高酸。長期熟成でバラ・タール・トリュフの絶頂。", servingTemp: "16-18°C", decanting: "3〜4時間" },
  { grape: "テンプラニーリョ", region: "リオハ グランレゼルバ", peakStart: 6, peakEnd: 15, maxAge: 25, description: "樽熟成由来のバニラ・ストロベリー。熟成でアースノート。", servingTemp: "15-17°C", decanting: "1時間" },
  { grape: "シラー/シラーズ", region: "ローヌ (エルミタージュ)", peakStart: 10, peakEnd: 25, maxAge: 40, description: "スパイシー。熟成でオリーブ・スモーク・ゲームの複雑さ。", servingTemp: "16-18°C", decanting: "2時間" },
  { grape: "リースリング (辛口)", region: "モーゼル / アルザス", peakStart: 5, peakEnd: 20, maxAge: 30, description: "高酸。熟成で蜂蜜・ガソリン香・ミネラルが発展する。", servingTemp: "10-12°C", decanting: "なし" },
  { grape: "シャルドネ", region: "ブルゴーニュ (白/プルミエクリュ)", peakStart: 5, peakEnd: 15, maxAge: 20, description: "ミネラル・酸味。熟成でバター・ナッツ・蜂蜜。", servingTemp: "12-14°C", decanting: "なし〜30分" },
  { grape: "ソーヴィニョン・ブラン", region: "ボルドー白 / ロワール", peakStart: 2, peakEnd: 7, maxAge: 12, description: "フレッシュ感が命。早飲みが基本。熟成でオイリーになる。", servingTemp: "10-12°C", decanting: "なし" },
  { grape: "ポートワイン", region: "ドウロ (ヴィンテージポート)", peakStart: 15, peakEnd: 40, maxAge: 80, description: "甘口。熟成で干しぶどう・チョコ・ナッツの絶品プロファイル。", servingTemp: "16-18°C", decanting: "1〜2時間" },
  { grape: "シャンパーニュ", region: "ヴィンテージ シャンパーニュ", peakStart: 8, peakEnd: 20, maxAge: 30, description: "複雑さを増す。熟成でブリオッシュ・ナッツ・トースト香。", servingTemp: "9-11°C", decanting: "なし" },
];

interface StorageAdjust {
  label: string;
  factor: number;
}
const STORAGE_CONDITIONS: StorageAdjust[] = [
  { label: "理想的 (12-14°C / 湿度70%)", factor: 1.0 },
  { label: "良好 (14-16°C 安定)", factor: 0.85 },
  { label: "普通 (16-18°C)", factor: 0.70 },
  { label: "不良 (18°C以上 / 温度変動あり)", factor: 0.50 },
];

export default function WineAgingCalculator() {
  const [selectedGrape, setSelectedGrape] = useState(WINE_PROFILES[0].grape);
  const [vintage, setVintage] = useState(2018);
  const [storageIdx, setStorageIdx] = useState(0);
  const [tierBonus, setTierBonus] = useState(0);
  const currentYear = new Date().getFullYear();

  const profile = useMemo(() =>
    WINE_PROFILES.find((p) => p.grape === selectedGrape) ?? WINE_PROFILES[0],
    [selectedGrape]
  );

  const uniqueGrapes = Array.from(new Set(WINE_PROFILES.map((p) => p.grape)));

  const adjust = STORAGE_CONDITIONS[storageIdx].factor;

  const analysis = useMemo(() => {
    const age = currentYear - vintage;
    const adjPeakStart = Math.round(profile.peakStart / adjust) + tierBonus;
    const adjPeakEnd = Math.round(profile.peakEnd / adjust) + tierBonus;
    const adjMaxAge = Math.round(profile.maxAge / adjust);

    const peakStartYear = vintage + adjPeakStart;
    const peakEndYear = vintage + adjPeakEnd;
    const maxYear = vintage + adjMaxAge;

    let status: "too-young" | "approaching" | "peak" | "declining" | "over";
    let statusLabel: string;
    let statusColor: string;

    if (age < adjPeakStart * 0.7) { status = "too-young"; statusLabel = "まだ若すぎる"; statusColor = "text-blue-600"; }
    else if (age < adjPeakStart) { status = "approaching"; statusLabel = "飲み頃に近づいている"; statusColor = "text-yellow-600"; }
    else if (age <= adjPeakEnd) { status = "peak"; statusLabel = "飲み頃！"; statusColor = "text-green-600"; }
    else if (age <= adjMaxAge) { status = "declining"; statusLabel = "ピークを過ぎ始め"; statusColor = "text-orange-600"; }
    else { status = "over"; statusLabel = "飲み頃を過ぎている可能性"; statusColor = "text-red-600"; }

    const progressPct = Math.min(100, Math.max(0, (age / adjMaxAge) * 100));

    return { age, adjPeakStart, adjPeakEnd, adjMaxAge, peakStartYear, peakEndYear, maxYear, status, statusLabel, statusColor, progressPct };
  }, [profile, vintage, adjust, tierBonus, currentYear]);

  const relatedProfiles = WINE_PROFILES.filter((p) => p.grape === selectedGrape);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">ワイン情報を入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">品種</label>
            <select value={selectedGrape} onChange={(e) => setSelectedGrape(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {uniqueGrapes.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ヴィンテージ (年)</label>
            <input type="number" min={1950} max={currentYear} value={vintage}
              onChange={(e) => setVintage(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">産地</label>
            <select value={profile.region} onChange={(e) => {
              const p = WINE_PROFILES.find((x) => x.region === e.target.value);
              if (p) setSelectedGrape(p.grape);
            }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {relatedProfiles.map((p) => <option key={p.region} value={p.region}>{p.region}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">保管状態</label>
            <select value={storageIdx} onChange={(e) => setStorageIdx(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {STORAGE_CONDITIONS.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-600">格付け・品質ボーナス (年)</label>
              <span className="text-sm font-bold text-gray-800">+{tierBonus}年</span>
            </div>
            <input type="range" min={0} max={10} step={1} value={tierBonus}
              onChange={(e) => setTierBonus(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
            <p className="text-xs text-gray-400 mt-1">グランクリュ・1級等の高格付けは飲み頃が延びる</p>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">{selectedGrape} {vintage}年 — {profile.region}</p>
          <p className={`text-4xl font-bold ${analysis.statusColor}`}>{analysis.statusLabel}</p>
          <p className="text-gray-500 mt-1 text-sm">現在のボトル熟成年数: <span className="font-semibold text-gray-800">{analysis.age}年</span></p>
        </div>

        {/* Progress bar */}
        <div className="relative mb-6">
          <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-blue-300 via-green-400 to-red-400 opacity-30 w-full absolute" />
            {/* Peak window */}
            <div className="absolute h-full bg-green-500 opacity-40"
              style={{
                left: `${(analysis.adjPeakStart / analysis.adjMaxAge) * 100}%`,
                width: `${((analysis.adjPeakEnd - analysis.adjPeakStart) / analysis.adjMaxAge) * 100}%`,
              }} />
            {/* Current age marker */}
            <div className="absolute top-0 h-full w-1 bg-gray-800"
              style={{ left: `${Math.min(98, analysis.progressPct)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{vintage}</span>
            <span className="text-green-600 font-medium">飲み頃: {analysis.peakStartYear}〜{analysis.peakEndYear}</span>
            <span>{analysis.maxYear}</span>
          </div>
        </div>

        {/* Key dates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "飲み頃 開始", value: `${analysis.peakStartYear}年`, sub: `あと${Math.max(0, analysis.adjPeakStart - analysis.age)}年` },
            { label: "飲み頃 終了", value: `${analysis.peakEndYear}年`, sub: `${analysis.adjPeakEnd}年後まで` },
            { label: "限界熟成", value: `${analysis.maxYear}年`, sub: `最長${analysis.adjMaxAge}年` },
            { label: "飲み頃ウィンドウ", value: `${analysis.adjPeakEnd - analysis.adjPeakStart}年間`, sub: "" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
              {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Wine tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-600 font-semibold mb-1">適正温度</p>
            <p className="text-sm text-red-800">{profile.servingTemp}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-600 font-semibold mb-1">デキャンタ時間</p>
            <p className="text-sm text-amber-800">{profile.decanting}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-semibold mb-1">熟成プロファイル</p>
            <p className="text-xs text-purple-800">{profile.description}</p>
          </div>
        </div>
      </div>

      {/* Other profiles */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">主要品種の飲み頃ガイド</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">品種</th>
                <th className="px-4 py-3 text-left text-gray-600">産地</th>
                <th className="px-4 py-3 text-center text-gray-600">飲み頃開始</th>
                <th className="px-4 py-3 text-center text-gray-600">飲み頃終了</th>
                <th className="px-4 py-3 text-center text-gray-600">最長熟成</th>
              </tr>
            </thead>
            <tbody>
              {WINE_PROFILES.map((p, i) => (
                <tr key={i}
                  onClick={() => { setSelectedGrape(p.grape); }}
                  className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${profile.region === p.region && profile.grape === p.grape ? "bg-purple-50" : ""}`}>
                  <td className="px-4 py-2 font-medium text-gray-800">{p.grape}</td>
                  <td className="px-4 py-2 text-gray-600 text-xs">{p.region}</td>
                  <td className="px-4 py-2 text-center text-gray-700">{p.peakStart}年後〜</td>
                  <td className="px-4 py-2 text-center text-gray-700">{p.peakEnd}年後</td>
                  <td className="px-4 py-2 text-center text-gray-700">{p.maxAge}年</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-800">
        <p className="font-semibold mb-1">注意事項</p>
        <p>飲み頃はヴィンテージの品質・生産者・保管状態により大きく変わります。本ツールは一般的な目安です。特に高品質ワインの開栓判断はソムリエに相談することをお勧めします。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このワイン飲み頃判定ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ワインの品種・産地・ヴィンテージ・保管条件から最適な飲み頃時期を予測。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このワイン飲み頃判定ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ワインの品種・産地・ヴィンテージ・保管条件から最適な飲み頃時期を予測。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ワイン飲み頃判定",
  "description": "ワインの品種・産地・ヴィンテージ・保管条件から最適な飲み頃時期を予測",
  "url": "https://tools.loresync.dev/wine-aging",
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
