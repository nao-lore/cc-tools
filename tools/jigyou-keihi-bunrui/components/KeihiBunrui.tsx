"use client";

import { useState } from "react";

interface Category {
  label: string;
  account: string;
  description: string;
  examples: string[];
  color: string;
}

const categories: Category[] = [
  {
    label: "旅費交通費",
    account: "旅費交通費",
    description: "業務上の移動・宿泊にかかる費用",
    examples: ["電車・バス代", "タクシー代", "新幹線・航空券", "ホテル代", "高速道路料金"],
    color: "bg-blue-50 border-blue-200 text-blue-800",
  },
  {
    label: "通信費",
    account: "通信費",
    description: "業務に使う通信・インターネット費用",
    examples: ["スマホ料金（業務分）", "インターネット料金", "切手・郵便料金", "宅配便"],
    color: "bg-green-50 border-green-200 text-green-800",
  },
  {
    label: "接待交際費",
    account: "接待交際費",
    description: "取引先・顧客との飲食・贈答",
    examples: ["取引先との会食", "手土産・贈答品", "慶弔費", "ゴルフ接待"],
    color: "bg-orange-50 border-orange-200 text-orange-800",
  },
  {
    label: "会議費",
    account: "会議費",
    description: "社内外の会議・打ち合わせ費用",
    examples: ["会議室レンタル", "打ち合わせ時の飲食（5,000円/人以下）", "コワーキング利用料"],
    color: "bg-purple-50 border-purple-200 text-purple-800",
  },
  {
    label: "消耗品費",
    account: "消耗品費",
    description: "1年以内に使い切る備品・用品",
    examples: ["文房具", "コピー用紙", "プリンタインク", "10万円未満のPC・周辺機器"],
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
  },
  {
    label: "広告宣伝費",
    account: "広告宣伝費",
    description: "宣伝・マーケティング活動の費用",
    examples: ["Web広告（Google・SNS）", "チラシ・名刺印刷", "サイト制作費", "SEO費用"],
    color: "bg-pink-50 border-pink-200 text-pink-800",
  },
  {
    label: "外注費",
    account: "外注費",
    description: "業務を外部に委託した費用",
    examples: ["フリーランスへの発注", "デザイン委託", "システム開発委託", "翻訳・ライティング"],
    color: "bg-teal-50 border-teal-200 text-teal-800",
  },
  {
    label: "地代家賃",
    account: "地代家賃",
    description: "事務所・店舗の賃料",
    examples: ["事務所家賃", "倉庫レンタル", "自宅兼事務所の家賃（按分分）"],
    color: "bg-red-50 border-red-200 text-red-800",
  },
  {
    label: "新聞図書費",
    account: "新聞図書費",
    description: "業務に関する書籍・情報収集費用",
    examples: ["技術書・専門書", "業界誌・新聞", "オンライン学習サービス", "セミナー参加費"],
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
  },
  {
    label: "水道光熱費",
    account: "水道光熱費",
    description: "事業で使う水道・電気・ガス",
    examples: ["電気代（事業分）", "ガス代（事業分）", "水道代（事業分）"],
    color: "bg-cyan-50 border-cyan-200 text-cyan-800",
  },
];

const keywords: Record<string, string> = {
  電車: "旅費交通費",
  バス: "旅費交通費",
  タクシー: "旅費交通費",
  新幹線: "旅費交通費",
  飛行機: "旅費交通費",
  航空: "旅費交通費",
  ホテル: "旅費交通費",
  宿泊: "旅費交通費",
  高速: "旅費交通費",
  駐車: "旅費交通費",
  スマホ: "通信費",
  携帯: "通信費",
  インターネット: "通信費",
  ネット: "通信費",
  郵便: "通信費",
  切手: "通信費",
  宅配: "通信費",
  配送: "通信費",
  会食: "接待交際費",
  飲食: "接待交際費",
  ランチ: "接待交際費",
  ディナー: "接待交際費",
  手土産: "接待交際費",
  贈答: "接待交際費",
  お中元: "接待交際費",
  お歳暮: "接待交際費",
  会議: "会議費",
  打ち合わせ: "会議費",
  ミーティング: "会議費",
  コワーキング: "会議費",
  文房具: "消耗品費",
  コピー: "消耗品費",
  印刷: "消耗品費",
  プリンタ: "消耗品費",
  パソコン: "消耗品費",
  PC: "消耗品費",
  マウス: "消耗品費",
  キーボード: "消耗品費",
  広告: "広告宣伝費",
  宣伝: "広告宣伝費",
  SEO: "広告宣伝費",
  チラシ: "広告宣伝費",
  名刺: "広告宣伝費",
  ホームページ: "広告宣伝費",
  外注: "外注費",
  委託: "外注費",
  フリーランス: "外注費",
  デザイン: "外注費",
  開発: "外注費",
  翻訳: "外注費",
  家賃: "地代家賃",
  賃料: "地代家賃",
  事務所: "地代家賃",
  倉庫: "地代家賃",
  書籍: "新聞図書費",
  本: "新聞図書費",
  セミナー: "新聞図書費",
  研修: "新聞図書費",
  学習: "新聞図書費",
  電気: "水道光熱費",
  ガス: "水道光熱費",
  水道: "水道光熱費",
};

export default function KeihiBunrui() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Category | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearched(true);
    const matched = Object.entries(keywords).find(([kw]) =>
      query.includes(kw)
    );
    if (matched) {
      const cat = categories.find((c) => c.account === matched[1]);
      setResult(cat || null);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">経費の内容を入力して勘定科目を判別</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="例: タクシー代、会食費、書籍代..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearched(false); setResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent text-foreground"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            判別
          </button>
        </div>
        <p className="text-xs text-muted mt-2">キーワードで勘定科目を候補表示します。最終判断は税理士等にご確認ください。</p>
      </div>

      {/* Result */}
      {searched && (
        <div className={`border rounded-xl p-5 ${result ? result.color : "bg-card border-border"}`}>
          {result ? (
            <>
              <p className="text-xs font-medium opacity-70 mb-1">勘定科目</p>
              <p className="text-2xl font-bold mb-2">{result.account}</p>
              <p className="text-sm mb-3">{result.description}</p>
              <div className="flex flex-wrap gap-2">
                {result.examples.map((ex) => (
                  <span key={ex} className="text-xs px-2 py-1 bg-white/60 rounded-full border border-current/20">{ex}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted text-sm">該当する勘定科目が見つかりませんでした。下の一覧から近い科目を選んでください。</p>
          )}
        </div>
      )}

      {/* All categories */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">主要勘定科目一覧</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.account}
              onClick={() => { setResult(cat); setSearched(true); setQuery(cat.label); }}
              className={`text-left border rounded-lg p-3 transition-all hover:shadow-sm ${cat.color}`}
            >
              <p className="font-bold text-sm">{cat.account}</p>
              <p className="text-xs opacity-80 mt-0.5">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
