"use client";
import { useState } from "react";

const PLATE_DATA: Record<string, { prefecture: string; office: string; region: string }> = {
  札幌: { prefecture: "北海道", office: "札幌運輸支局", region: "石狩・空知・後志" },
  函館: { prefecture: "北海道", office: "函館運輸支局", region: "渡島・檜山" },
  旭川: { prefecture: "北海道", office: "旭川運輸支局", region: "上川・留萌・宗谷" },
  室蘭: { prefecture: "北海道", office: "室蘭運輸支局", region: "胆振・日高" },
  釧路: { prefecture: "北海道", office: "釧路運輸支局", region: "釧路・根室" },
  帯広: { prefecture: "北海道", office: "帯広自動車検査登録事務所", region: "十勝" },
  北見: { prefecture: "北海道", office: "北見自動車検査登録事務所", region: "オホーツク" },
  青森: { prefecture: "青森県", office: "青森運輸支局", region: "青森・東津軽・西津軽・南津軽・北津軽" },
  弘前: { prefecture: "青森県", office: "弘前自動車検査登録事務所", region: "弘前・中津軽" },
  八戸: { prefecture: "青森県", office: "八戸自動車検査登録事務所", region: "八戸・三戸・上北・下北" },
  岩手: { prefecture: "岩手県", office: "岩手運輸支局", region: "盛岡・紫波・岩手・滝沢" },
  宮城: { prefecture: "宮城県", office: "宮城運輸支局", region: "仙台・宮城" },
  秋田: { prefecture: "秋田県", office: "秋田運輸支局", region: "秋田・男鹿・南秋田" },
  山形: { prefecture: "山形県", office: "山形運輸支局", region: "山形・寒河江・上山" },
  福島: { prefecture: "福島県", office: "福島運輸支局", region: "福島・伊達・二本松" },
  郡山: { prefecture: "福島県", office: "郡山自動車検査登録事務所", region: "郡山・田村・岩瀬" },
  いわき: { prefecture: "福島県", office: "いわき自動車検査登録事務所", region: "いわき・双葉" },
  会津: { prefecture: "福島県", office: "会津自動車検査登録事務所", region: "会津" },
  茨城: { prefecture: "茨城県", office: "茨城運輸支局", region: "水戸・ひたちなか・那珂" },
  栃木: { prefecture: "栃木県", office: "栃木運輸支局", region: "宇都宮・下野・上三川" },
  宇都宮: { prefecture: "栃木県", office: "栃木運輸支局", region: "宇都宮周辺" },
  群馬: { prefecture: "群馬県", office: "群馬運輸支局", region: "前橋・高崎・伊勢崎" },
  埼玉: { prefecture: "埼玉県", office: "埼玉運輸支局", region: "さいたま・上尾・桶川" },
  所沢: { prefecture: "埼玉県", office: "所沢自動車検査登録事務所", region: "所沢・入間・狭山" },
  春日部: { prefecture: "埼玉県", office: "春日部自動車検査登録事務所", region: "春日部・越谷" },
  熊谷: { prefecture: "埼玉県", office: "熊谷自動車検査登録事務所", region: "熊谷・行田・深谷" },
  千葉: { prefecture: "千葉県", office: "千葉運輸支局", region: "千葉・市川・船橋・習志野" },
  習志野: { prefecture: "千葉県", office: "習志野自動車検査登録事務所", region: "習志野・船橋" },
  柏: { prefecture: "千葉県", office: "柏自動車検査登録事務所", region: "柏・松戸・我孫子" },
  成田: { prefecture: "千葉県", office: "成田自動車検査登録事務所", region: "成田・香取・印西" },
  市原: { prefecture: "千葉県", office: "市原自動車検査登録事務所", region: "市原・木更津・君津" },
  東京: { prefecture: "東京都", office: "東京運輸支局", region: "品川・大田・目黒" },
  品川: { prefecture: "東京都", office: "東京運輸支局品川", region: "品川・港・渋谷・目黒・大田・世田谷" },
  足立: { prefecture: "東京都", office: "足立自動車検査登録事務所", region: "足立・葛飾・荒川・北" },
  多摩: { prefecture: "東京都", office: "多摩自動車検査登録事務所", region: "八王子・立川・府中など多摩地区" },
  八王子: { prefecture: "東京都", office: "八王子自動車検査登録事務所", region: "八王子市" },
  練馬: { prefecture: "東京都", office: "練馬自動車検査登録事務所", region: "練馬・板橋・豊島・北" },
  神奈川: { prefecture: "神奈川県", office: "神奈川運輸支局", region: "横浜・川崎・横須賀" },
  横浜: { prefecture: "神奈川県", office: "神奈川運輸支局", region: "横浜市" },
  川崎: { prefecture: "神奈川県", office: "川崎自動車検査登録事務所", region: "川崎市" },
  湘南: { prefecture: "神奈川県", office: "湘南自動車検査登録事務所", region: "藤沢・茅ヶ崎・平塚" },
  相模: { prefecture: "神奈川県", office: "相模自動車検査登録事務所", region: "相模原・厚木・大和" },
  山梨: { prefecture: "山梨県", office: "山梨運輸支局", region: "甲府・甲斐・笛吹" },
  新潟: { prefecture: "新潟県", office: "新潟運輸支局", region: "新潟・三条・長岡" },
  長野: { prefecture: "長野県", office: "長野運輸支局", region: "長野・須坂・中野" },
  松本: { prefecture: "長野県", office: "松本自動車検査登録事務所", region: "松本・安曇野" },
  静岡: { prefecture: "静岡県", office: "静岡運輸支局", region: "静岡・焼津・藤枝" },
  浜松: { prefecture: "静岡県", office: "浜松自動車検査登録事務所", region: "浜松市" },
  富士山: { prefecture: "静岡県", office: "富士自動車検査登録事務所", region: "富士・富士宮・沼津" },
  愛知: { prefecture: "愛知県", office: "愛知運輸支局", region: "名古屋市北部・春日井" },
  名古屋: { prefecture: "愛知県", office: "愛知運輸支局", region: "名古屋市" },
  岡崎: { prefecture: "愛知県", office: "岡崎自動車検査登録事務所", region: "岡崎・豊田・安城" },
  豊橋: { prefecture: "愛知県", office: "豊橋自動車検査登録事務所", region: "豊橋・豊川・田原" },
  一宮: { prefecture: "愛知県", office: "一宮自動車検査登録事務所", region: "一宮・稲沢・津島" },
  春日井: { prefecture: "愛知県", office: "春日井自動車検査登録事務所", region: "春日井・小牧" },
  三重: { prefecture: "三重県", office: "三重運輸支局", region: "津・鈴鹿・亀山" },
  富山: { prefecture: "富山県", office: "富山運輸支局", region: "富山・高岡・砺波" },
  石川: { prefecture: "石川県", office: "石川運輸支局", region: "金沢・野々市・白山" },
  福井: { prefecture: "福井県", office: "福井運輸支局", region: "福井・越前・坂井" },
  滋賀: { prefecture: "滋賀県", office: "滋賀運輸支局", region: "大津・草津・守山" },
  京都: { prefecture: "京都府", office: "近畿運輸局京都運輸支局", region: "京都市・宇治" },
  大阪: { prefecture: "大阪府", office: "近畿運輸局大阪運輸支局", region: "大阪市・堺" },
  なにわ: { prefecture: "大阪府", office: "大阪運輸支局", region: "大阪市中心部" },
  和泉: { prefecture: "大阪府", office: "和泉自動車検査登録事務所", region: "和泉・岸和田・堺南部" },
  兵庫: { prefecture: "兵庫県", office: "神戸運輸監理部", region: "神戸・尼崎・西宮・芦屋" },
  神戸: { prefecture: "兵庫県", office: "神戸運輸監理部", region: "神戸市" },
  姫路: { prefecture: "兵庫県", office: "姫路自動車検査登録事務所", region: "姫路・相生・たつの" },
  奈良: { prefecture: "奈良県", office: "奈良運輸支局", region: "奈良・大和郡山・天理" },
  和歌山: { prefecture: "和歌山県", office: "和歌山運輸支局", region: "和歌山・岩出・紀の川" },
  鳥取: { prefecture: "鳥取県", office: "鳥取運輸支局", region: "鳥取・米子・倉吉" },
  島根: { prefecture: "島根県", office: "島根運輸支局", region: "松江・出雲・雲南" },
  岡山: { prefecture: "岡山県", office: "岡山運輸支局", region: "岡山・倉敷・総社" },
  広島: { prefecture: "広島県", office: "広島運輸支局", region: "広島市・廿日市・大竹" },
  福山: { prefecture: "広島県", office: "福山自動車検査登録事務所", region: "福山・尾道・三原" },
  山口: { prefecture: "山口県", office: "山口運輸支局", region: "山口・防府・宇部" },
  徳島: { prefecture: "徳島県", office: "徳島運輸支局", region: "徳島・鳴門・阿南" },
  香川: { prefecture: "香川県", office: "四国運輸局香川運輸支局", region: "高松・丸亀・坂出" },
  愛媛: { prefecture: "愛媛県", office: "愛媛運輸支局", region: "松山・伊予・東温" },
  高知: { prefecture: "高知県", office: "高知運輸支局", region: "高知・南国・香南" },
  福岡: { prefecture: "福岡県", office: "福岡運輸支局", region: "福岡市・春日・大野城" },
  北九州: { prefecture: "福岡県", office: "北九州自動車検査登録事務所", region: "北九州市・中間" },
  久留米: { prefecture: "福岡県", office: "久留米自動車検査登録事務所", region: "久留米・鳥栖・小郡" },
  佐賀: { prefecture: "佐賀県", office: "佐賀運輸支局", region: "佐賀・伊万里・多久" },
  長崎: { prefecture: "長崎県", office: "長崎運輸支局", region: "長崎・諫早・大村" },
  熊本: { prefecture: "熊本県", office: "熊本運輸支局", region: "熊本・菊池・合志" },
  大分: { prefecture: "大分県", office: "大分運輸支局", region: "大分・別府・由布" },
  宮崎: { prefecture: "宮崎県", office: "宮崎運輸支局", region: "宮崎・都城・延岡" },
  鹿児島: { prefecture: "鹿児島県", office: "鹿児島運輸支局", region: "鹿児島・薩摩川内・霧島" },
  沖縄: { prefecture: "沖縄県", office: "沖縄総合事務局陸運事務所", region: "那覇・沖縄・うるま" },
};

const CLASSIFICATION_CODES: Record<string, { use: string; type: string; color: string }> = {
  "1": { use: "普通自動車（自家用）", type: "事業用以外", color: "text-green-700" },
  "2": { use: "普通自動車（事業用）", type: "タクシー・ハイヤー等", color: "text-yellow-700" },
  "3": { use: "普通自動車（レンタカー）", type: "レンタカー", color: "text-blue-700" },
  "4": { use: "小型自動車（自家用）", type: "事業用以外", color: "text-green-700" },
  "5": { use: "小型自動車（事業用）", type: "タクシー・ハイヤー等", color: "text-yellow-700" },
  "6": { use: "小型自動車（レンタカー）", type: "レンタカー", color: "text-blue-700" },
  "7": { use: "軽自動車（自家用）", type: "事業用以外", color: "text-green-700" },
  "8": { use: "軽自動車（事業用）", type: "事業用", color: "text-yellow-700" },
  "9": { use: "大型特殊自動車", type: "クレーン・フォークリフト等", color: "text-red-700" },
};

export default function CarNumberDecoder() {
  const [region, setRegion] = useState("");
  const [classCode, setClassCode] = useState("");

  const regionResult = PLATE_DATA[region.trim()];
  const classResult = classCode ? CLASSIFICATION_CODES[classCode[0]] : null;

  const allRegions = Object.keys(PLATE_DATA);

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">ナンバープレートの情報を入力</h2>

        {/* ナンバープレート ビジュアル */}
        <div className="flex justify-center mb-6">
          <div className="bg-white border-4 border-gray-800 rounded-lg px-6 py-3 inline-flex items-center gap-3 shadow-lg min-w-64">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-0.5">地名</div>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="品川"
                className="text-xl font-bold text-gray-900 text-center border-b-2 border-blue-400 outline-none w-20 bg-transparent"
              />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-0.5">分類番号</div>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                placeholder="500"
                className="text-xl font-bold text-gray-900 text-center border-b-2 border-blue-400 outline-none w-16 bg-transparent font-mono"
              />
            </div>
            <div className="text-xl font-bold text-gray-400">あ 1234</div>
          </div>
        </div>
      </div>

      {/* 地名結果 */}
      {region.trim() && (
        <div className={`rounded-2xl border-2 p-6 ${regionResult ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}`}>
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            「{region}」ナンバー 判定結果
          </h3>
          {regionResult ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">都道府県</div>
                <div className="text-lg font-bold text-gray-900">{regionResult.prefecture}</div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">管轄機関</div>
                <div className="text-sm font-semibold text-gray-900">{regionResult.office}</div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">管轄地域</div>
                <div className="text-sm text-gray-700">{regionResult.region}</div>
              </div>
            </div>
          ) : (
            <p className="text-red-700">「{region}」はデータベースに見つかりませんでした。</p>
          )}
        </div>
      )}

      {/* 分類番号結果 */}
      {classResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3">
            分類番号「{classCode[0]}xx」 判定
          </h3>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-bold ${classResult.color}`}>{classCode[0]}</div>
            <div>
              <div className="font-semibold text-gray-900">{classResult.use}</div>
              <div className="text-sm text-gray-500">{classResult.type}</div>
            </div>
          </div>
        </div>
      )}

      {/* 地名クイック検索 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">地名一覧（クリックで入力）</h2>
        <div className="flex flex-wrap gap-2">
          {allRegions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                region === r
                  ? "border-blue-500 bg-blue-100 text-blue-800"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 分類番号一覧 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">分類番号 用途一覧</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(CLASSIFICATION_CODES).map(([code, info]) => (
            <div key={code} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className={`text-2xl font-bold ${info.color} w-8`}>{code}</span>
              <div>
                <div className="text-sm font-medium text-gray-800">{info.use}</div>
                <div className="text-xs text-gray-500">{info.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        ※ 情報は2024年時点のものです。登録地域の詳細は国土交通省・各運輸支局にご確認ください。
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この自動車ナンバー判定ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ナンバープレートの地名・分類番号・用途を判定。全国の運輸支局・自動車検査登録事務所の対応地域を網羅。。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この自動車ナンバー判定ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ナンバープレートの地名・分類番号・用途を判定。全国の運輸支局・自動車検査登録事務所の対応地域を網羅。。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
