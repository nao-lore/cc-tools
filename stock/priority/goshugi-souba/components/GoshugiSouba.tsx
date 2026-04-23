"use client";
import { useState } from "react";

// ---- 型定義 ----
type Zokugara =
  | "友人"
  | "同僚"
  | "上司"
  | "部下"
  | "取引先"
  | "兄弟姉妹"
  | "いとこ"
  | "甥姪"
  | "祖父母"
  | "叔父叔母";

type Nendai = "20代" | "30代" | "40代" | "50代" | "60代以上";
type Kankeisei = "親しい" | "普通" | "あまり親しくない";
type Chiiki = "全国平均" | "北海道（会費制）" | "関東" | "関西" | "九州";

// ---- 相場データ（単位: 万円）----
// [zokugara][nendai] => [min, standard, max]
const SOUBA_TABLE: Record<Zokugara, Record<Nendai, [number, number, number]>> = {
  友人:      { "20代": [2, 3, 3], "30代": [3, 3, 5], "40代": [3, 5, 5], "50代": [3, 5, 5], "60代以上": [3, 5, 5] },
  同僚:      { "20代": [2, 3, 3], "30代": [3, 3, 5], "40代": [3, 5, 5], "50代": [3, 5, 5], "60代以上": [3, 5, 5] },
  上司:      { "20代": [3, 3, 5], "30代": [3, 5, 5], "40代": [5, 5, 7], "50代": [5, 7, 10], "60代以上": [5, 10, 10] },
  部下:      { "20代": [3, 3, 5], "30代": [3, 5, 5], "40代": [5, 5, 7], "50代": [5, 7, 10], "60代以上": [5, 10, 10] },
  取引先:    { "20代": [3, 3, 5], "30代": [3, 5, 5], "40代": [5, 5, 7], "50代": [5, 5, 7], "60代以上": [5, 7, 10] },
  兄弟姉妹:  { "20代": [3, 5, 5], "30代": [5, 5, 10], "40代": [5, 10, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
  いとこ:    { "20代": [2, 3, 5], "30代": [3, 5, 5], "40代": [3, 5, 5], "50代": [5, 5, 7], "60代以上": [5, 5, 10] },
  甥姪:      { "20代": [3, 5, 5], "30代": [5, 5, 10], "40代": [5, 10, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
  祖父母:    { "20代": [3, 5, 10], "30代": [5, 10, 10], "40代": [5, 10, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
  叔父叔母:  { "20代": [3, 5, 5], "30代": [5, 5, 10], "40代": [5, 5, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
};

// 関係性による補正（万円）
const KANKEISEI_OFFSET: Record<Kankeisei, number> = {
  親しい: 1,
  普通: 0,
  あまり親しくない: -1,
};

// 地域による補正
const CHIIKI_NOTE: Record<Chiiki, string | null> = {
  全国平均: null,
  "北海道（会費制）": "北海道は会費制が主流（会費 6,000〜10,000円）。別途祝儀は不要なことが多い。",
  関東: null,
  関西: "関西は3万円が基本。「割り切れない数」を重視する傾向が強い。",
  九州: "九州は5万円以上が相場とされる地域も。事前に確認を。",
};

const ZOKUGARA_LIST: Zokugara[] = [
  "友人", "同僚", "上司", "部下", "取引先", "兄弟姉妹", "いとこ", "甥姪", "祖父母", "叔父叔母",
];
const NENDAI_LIST: Nendai[] = ["20代", "30代", "40代", "50代", "60代以上"];
const KANKEISEI_LIST: Kankeisei[] = ["親しい", "普通", "あまり親しくない"];
const CHIIKI_LIST: Chiiki[] = ["全国平均", "北海道（会費制）", "関東", "関西", "九州"];

// ---- ユーティリティ ----
const fmt = (man: number) => `¥${(man * 10000).toLocaleString("ja-JP")}`;

function getRecommended(
  zokugara: Zokugara,
  nendai: Nendai,
  kankeisei: Kankeisei
): { min: number; standard: number; max: number } {
  const [min, standard, max] = SOUBA_TABLE[zokugara][nendai];
  const offset = KANKEISEI_OFFSET[kankeisei];
  return {
    min: Math.max(2, min + (offset < 0 ? offset : 0)),
    standard: Math.max(2, standard + offset),
    max: Math.max(2, max + (offset > 0 ? offset : 0)),
  };
}

// NG金額チェック
function getNgWarning(man: number): string | null {
  if (man === 4) return "4万円は「死」を連想させるためNG。3万円か5万円に。";
  if (man === 6) return "6万円は偶数で割り切れるためNG（縁が切れる）。5万円か7万円に。";
  if (man === 8) return "8万円は偶数ですが「末広がり」で許容される場合も。地域によって異なります。";
  if (man === 9) return "9万円は「苦」を連想させるためNG。10万円か8万円に。";
  if (man % 2 === 0 && man !== 2 && man !== 8 && man !== 10)
    return `${man}万円は偶数で縁起が良くないとされます（2万円・8万円・10万円は例外OK）。`;
  return null;
}

// ---- ご祝儀袋の種類 ----
const FUKURO_GUIDE = [
  { range: "〜1万円", type: "印刷水引のポチ袋・簡易封筒", note: "既製の簡易封筒でもOK" },
  { range: "1〜3万円", type: "水引が印刷された中袋付きご祝儀袋", note: "スーパー・コンビニで入手可" },
  { range: "3〜5万円", type: "金封・白金水引（結び切り）", note: "豪華な水引が印刷された中袋付き" },
  { range: "5〜10万円", type: "高級金封・本結び水引（あわじ結び）", note: "西陣織・和紙使いの上質なもの" },
  { range: "10万円〜", type: "鶴亀・寿の立体水引付き最高級袋", note: "百貨店での購入を推奨" },
];

// ---- コンポーネント ----
export default function GoshugiSouba() {
  const [zokugara, setZokugara] = useState<Zokugara>("友人");
  const [nendai, setNendai] = useState<Nendai>("20代");
  const [kankeisei, setKankeisei] = useState<Kankeisei>("普通");
  const [chiiki, setChiiki] = useState<Chiiki>("全国平均");
  const [activeTab, setActiveTab] = useState<"calc" | "table" | "manner">("calc");

  const result = getRecommended(zokugara, nendai, kankeisei);
  const chiikiNote = CHIIKI_NOTE[chiiki];
  const ngWarning = getNgWarning(result.standard);

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex gap-1">
        {(["calc", "table", "manner"] as const).map((tab) => {
          const labels = { calc: "相場を調べる", table: "相場一覧表", manner: "マナーガイド" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* === 相場を調べる === */}
      {activeTab === "calc" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 入力パネル */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-800">条件を選択</h2>

              {/* 続柄 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">続柄・関係</label>
                <div className="grid grid-cols-3 gap-2">
                  {ZOKUGARA_LIST.map((z) => (
                    <button
                      key={z}
                      onClick={() => setZokugara(z)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                        zokugara === z
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* 年代 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">あなたの年代</label>
                <div className="flex gap-2 flex-wrap">
                  {NENDAI_LIST.map((n) => (
                    <button
                      key={n}
                      onClick={() => setNendai(n)}
                      className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                        nendai === n
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* 関係性 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">関係性</label>
                <div className="flex gap-2 flex-wrap">
                  {KANKEISEI_LIST.map((k) => (
                    <button
                      key={k}
                      onClick={() => setKankeisei(k)}
                      className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                        kankeisei === k
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* 地域 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
                <select
                  value={chiiki}
                  onChange={(e) => setChiiki(e.target.value as Chiiki)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  {CHIIKI_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {chiikiNote && (
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
                    {chiikiNote}
                  </p>
                )}
              </div>
            </div>

            {/* 結果パネル */}
            <div className="space-y-4">
              {/* メイン金額表示 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-1">おすすめ金額</h2>
                <p className="text-xs text-gray-400 mb-4">
                  {zokugara} / {nendai} / {kankeisei}
                </p>

                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-center">
                  <p className="text-sm font-medium text-rose-400 mb-1">一般的な相場</p>
                  <p className="text-5xl font-extrabold tracking-tight text-rose-600">
                    {fmt(result.standard)}
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    一般的な範囲：
                    <span className="font-semibold text-gray-700">
                      {fmt(result.min)}〜{fmt(result.max)}
                    </span>
                  </p>
                </div>

                {ngWarning && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-red-600">注意</p>
                    <p className="text-xs text-red-700 mt-0.5">{ngWarning}</p>
                  </div>
                )}

                {chiiki === "北海道（会費制）" && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-blue-700">北海道は会費制</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      会費 6,000〜10,000円を支払う形式が一般的です。上記の金額は参考値です。
                    </p>
                  </div>
                )}
              </div>

              {/* ご祝儀袋の目安 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">ご祝儀袋の目安</h2>
                {(() => {
                  const guide = FUKURO_GUIDE.find((g, i) => {
                    if (i === FUKURO_GUIDE.length - 1) return true;
                    const maxVal = [1, 3, 5, 10][i];
                    return result.standard <= maxVal;
                  });
                  return guide ? (
                    <div className="bg-pink-50 rounded-xl px-4 py-3 border border-pink-100">
                      <p className="text-sm font-semibold text-pink-700">{guide.type}</p>
                      <p className="text-xs text-pink-500 mt-1">{guide.note}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

          {/* NGマナー */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">NGマナー・注意事項</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: "4万円はNG", body: "「死」を連想させるため厳禁。3万円か5万円に。" },
                { title: "偶数はNG（例外あり）", body: "「割り切れる＝縁が切れる」とされる。2万円・8万円・10万円は例外として許容。" },
                { title: "9万円はNG", body: "「苦」を連想させるため。10万円か8万円を。" },
                { title: "新札を用意する", body: "「前もって準備した＝お祝いを楽しみにしていた」の意。銀行ATMで交換可。" },
                { title: "欠席時は3分の1〜半額", body: "式を欠席する場合、通常相場の1/3〜1/2が目安。お祝いの品と合わせても。" },
                { title: "夫婦連名は通常の1.5〜2倍", body: "夫婦で出席する場合は1人分×1.5〜2倍が相場。2人で5〜7万円が一般的。" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <span className="mt-0.5 text-red-500 font-bold text-base leading-none shrink-0">✕</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* === 相場一覧表 === */}
      {activeTab === "table" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">全続柄×年代 相場一覧</h2>
          <p className="text-xs text-gray-400 mb-4">関係性「普通」の場合の標準金額（万円）</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-rose-100">
                  <th className="text-left py-3 pr-4 font-semibold text-gray-600 min-w-[90px]">続柄</th>
                  {NENDAI_LIST.map((n) => (
                    <th key={n} className="text-center py-3 px-3 font-semibold text-rose-600 min-w-[70px]">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ZOKUGARA_LIST.map((z) => (
                  <tr key={z} className="border-b border-gray-50 hover:bg-rose-50/30">
                    <td className="py-3 pr-4 font-medium text-gray-700">{z}</td>
                    {NENDAI_LIST.map((n) => {
                      const [, std] = SOUBA_TABLE[z][n];
                      return (
                        <td key={n} className="text-center py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${
                              std >= 10
                                ? "bg-rose-100 text-rose-700"
                                : std >= 5
                                ? "bg-pink-100 text-pink-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {std}万
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            ※ 上記は関係性「普通」での目安です。親しい場合は+1万円、あまり親しくない場合は−1万円が目安です。
          </p>
        </div>
      )}

      {/* === マナーガイド === */}
      {activeTab === "manner" && (
        <div className="space-y-5">
          {/* ご祝儀袋の選び方 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">ご祝儀袋の選び方</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-rose-100">
                    <th className="text-left py-2 pr-4 font-semibold text-gray-600">金額の目安</th>
                    <th className="text-left py-2 px-3 font-semibold text-rose-600">袋の種類</th>
                    <th className="text-left py-2 pl-3 font-semibold text-gray-500">ポイント</th>
                  </tr>
                </thead>
                <tbody>
                  {FUKURO_GUIDE.map((g) => (
                    <tr key={g.range} className="border-b border-gray-50 hover:bg-rose-50/20">
                      <td className="py-3 pr-4 font-semibold text-gray-700 whitespace-nowrap">{g.range}</td>
                      <td className="py-3 px-3 text-gray-700">{g.type}</td>
                      <td className="py-3 pl-3 text-xs text-gray-400">{g.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 bg-rose-50 rounded-xl p-4 border border-rose-100">
              <p className="text-sm font-semibold text-rose-700 mb-1">水引の結び方</p>
              <p className="text-xs text-rose-600">
                結婚祝いは必ず<strong>結び切り（あわじ結び）</strong>を使用。
                「一度結んだらほどけない＝再婚しない」の意。蝶結びは出産・入学など何度あってもよいお祝い用。
              </p>
            </div>
          </div>

          {/* 書き方ガイド */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">書き方ガイド</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">表書き（外袋）</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "壽（寿）", desc: "最も格式が高い。「寿」「壽」どちらもOK" },
                    { label: "御祝", desc: "シンプルで汎用的。「御結婚御祝」も可" },
                    { label: "御結婚御祝", desc: "「ご結婚おめでとう」の意。丁寧な表現" },
                    { label: "Happy Wedding", desc: "洋式・カジュアルな披露宴向け" },
                  ].map((item) => (
                    <div key={item.label} className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                      <p className="text-base font-bold text-pink-700">{item.label}</p>
                      <p className="text-xs text-pink-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">中袋の書き方</h3>
                <div className="space-y-2">
                  {[
                    { side: "表面", content: "金額を漢数字で記入。例：金 参萬円也" },
                    { side: "裏面", content: "住所・氏名をフルネームで記入（郵便番号から）" },
                  ].map((item) => (
                    <div key={item.side} className="flex gap-3 items-start bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span className="shrink-0 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded">{item.side}</span>
                      <p className="text-sm text-gray-700">{item.content}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-100">
                  <p className="text-xs text-yellow-700">
                    <strong>金額の漢数字：</strong>
                    1万＝壱万、2万＝弐万、3万＝参万、5万＝伍万、10万＝拾万
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">新札の準備方法</h3>
                <div className="space-y-2">
                  {[
                    "銀行・郵便局の窓口で「新札に交換してください」と依頼",
                    "ATMから引き出した紙幣も比較的新しいことが多い",
                    "式の2〜3日前までに準備するのが理想",
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="shrink-0 w-5 h-5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 北海道の会費制 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">北海道の会費制について</h2>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-2">
              <p className="text-sm text-blue-800">
                北海道では結婚式・披露宴に<strong>会費制</strong>を採用することが一般的です。
              </p>
              <ul className="text-xs text-blue-700 space-y-1.5 list-none">
                <li className="flex gap-2"><span className="font-bold shrink-0">会費：</span>6,000〜10,000円が相場（当日受付で支払い）</li>
                <li className="flex gap-2"><span className="font-bold shrink-0">ご祝儀：</span>会費を払えば祝儀袋は不要なことがほとんど</li>
                <li className="flex gap-2"><span className="font-bold shrink-0">お祝い：</span>仲の良い友人なら後日プレゼントを贈るケースも</li>
                <li className="flex gap-2"><span className="font-bold shrink-0">注意：</span>招待状に「会費制」と明記されているか事前に確認</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        ※ 相場はあくまで目安です。地域・家族の慣習・関係性により異なります。最終的には周囲の方に確認することをおすすめします。
      </p>
    </div>
  );
}
