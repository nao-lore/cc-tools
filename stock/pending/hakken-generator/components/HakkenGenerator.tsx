"use client";

import { useState } from "react";

type Formality = "丁寧" | "普通";

interface Phrase {
  text: string;
  category: string;
  formality: Formality;
}

const PHRASES: Phrase[] = [
  // 依頼
  { text: "お手数ですが、ご確認いただけますでしょうか。", category: "依頼", formality: "丁寧" },
  { text: "ご多忙のところ恐れ入りますが、ご対応をお願いいたします。", category: "依頼", formality: "丁寧" },
  { text: "ご検討のほど、よろしくお願い申し上げます。", category: "依頼", formality: "丁寧" },
  { text: "ご確認の上、ご返信いただけますと幸いです。", category: "依頼", formality: "丁寧" },
  { text: "お忙しいところ大変恐縮ですが、よろしくお願いいたします。", category: "依頼", formality: "丁寧" },
  { text: "ご協力のほど、よろしくお願いいたします。", category: "依頼", formality: "丁寧" },
  { text: "ご査収のほどよろしくお願いいたします。", category: "依頼", formality: "丁寧" },
  { text: "ご承認いただけますようお願い申し上げます。", category: "依頼", formality: "丁寧" },
  { text: "ご都合のよい日時をお知らせください。", category: "依頼", formality: "普通" },
  { text: "確認してもらえますか。", category: "依頼", formality: "普通" },
  { text: "対応をお願いします。", category: "依頼", formality: "普通" },
  { text: "ご一読いただけますと幸いです。", category: "依頼", formality: "丁寧" },
  { text: "ご意見をお聞かせいただければ幸いです。", category: "依頼", formality: "丁寧" },
  { text: "お力添えいただけますようお願い申し上げます。", category: "依頼", formality: "丁寧" },
  { text: "よろしくお願いします。", category: "依頼", formality: "普通" },
  { text: "ご回答いただけますよう、よろしくお願いいたします。", category: "依頼", formality: "丁寧" },

  // お礼
  { text: "この度はご丁寧にありがとうございます。", category: "お礼", formality: "丁寧" },
  { text: "ご対応いただき、誠にありがとうございました。", category: "お礼", formality: "丁寧" },
  { text: "お心遣いいただき、大変ありがとうございます。", category: "お礼", formality: "丁寧" },
  { text: "ご確認いただきありがとうございます。", category: "お礼", formality: "丁寧" },
  { text: "早急にご対応いただきありがとうございました。", category: "お礼", formality: "丁寧" },
  { text: "平素より大変お世話になっております。", category: "お礼", formality: "丁寧" },
  { text: "いつもお世話になっております。", category: "お礼", formality: "普通" },
  { text: "先日はありがとうございました。", category: "お礼", formality: "普通" },
  { text: "ご支援いただき、誠にありがとうございます。", category: "お礼", formality: "丁寧" },
  { text: "貴重なお時間をいただきありがとうございました。", category: "お礼", formality: "丁寧" },
  { text: "ご厚情に深く感謝申し上げます。", category: "お礼", formality: "丁寧" },

  // お詫び
  { text: "ご不便をおかけし、大変申し訳ございません。", category: "お詫び", formality: "丁寧" },
  { text: "ご迷惑をおかけしたことを深くお詫び申し上げます。", category: "お詫び", formality: "丁寧" },
  { text: "返信が遅くなりまして、大変失礼いたしました。", category: "お詫び", formality: "丁寧" },
  { text: "確認不足により、ご迷惑をおかけして申し訳ありません。", category: "お詫び", formality: "普通" },
  { text: "誠に失礼いたしました。", category: "お詫び", formality: "丁寧" },
  { text: "ご心配をおかけしてしまい、申し訳ございません。", category: "お詫び", formality: "丁寧" },
  { text: "何卒ご容赦くださいますよう、お願い申し上げます。", category: "お詫び", formality: "丁寧" },
  { text: "今後このようなことがないよう努めてまいります。", category: "お詫び", formality: "丁寧" },
  { text: "ご迷惑をおかけして申し訳ありませんでした。", category: "お詫び", formality: "普通" },
  { text: "弊社の不手際により、多大なるご迷惑をおかけしました。", category: "お詫び", formality: "丁寧" },
  { text: "再発防止に努めてまいります。", category: "お詫び", formality: "丁寧" },

  // 断り
  { text: "誠に恐れ入りますが、今回はお見送りさせていただきます。", category: "断り", formality: "丁寧" },
  { text: "誠に残念ではございますが、今回はお断りせざるを得ない状況です。", category: "断り", formality: "丁寧" },
  { text: "ご期待に沿えず、大変申し訳ございません。", category: "断り", formality: "丁寧" },
  { text: "ご要望に応えることが難しい状況です。", category: "断り", formality: "普通" },
  { text: "誠に勝手ながら、お断り申し上げます。", category: "断り", formality: "丁寧" },
  { text: "今回はご縁がなかったということで、ご了承ください。", category: "断り", formality: "普通" },
  { text: "諸般の事情により、お受けすることが困難な状況でございます。", category: "断り", formality: "丁寧" },
  { text: "せっかくのご提案ですが、今回は辞退させていただきます。", category: "断り", formality: "丁寧" },
  { text: "ご要望にお応えできず、申し訳ございません。", category: "断り", formality: "丁寧" },
  { text: "今回はお断りさせてください。", category: "断り", formality: "普通" },
  { text: "ご理解のほど、何卒よろしくお願いいたします。", category: "断り", formality: "丁寧" },

  // 催促
  { text: "ご確認の進捗を教えていただけますでしょうか。", category: "催促", formality: "丁寧" },
  { text: "ご多忙のところ恐れ入りますが、お返事をお待ちしております。", category: "催促", formality: "丁寧" },
  { text: "先日ご連絡した件について、その後いかがでしょうか。", category: "催促", formality: "普通" },
  { text: "お手数ですが、今週中にご回答いただけますと助かります。", category: "催促", formality: "丁寧" },
  { text: "期日が迫っておりますので、ご確認をお願いいたします。", category: "催促", formality: "丁寧" },
  { text: "折り返しのご連絡をお待ちしております。", category: "催促", formality: "普通" },
  { text: "お忙しいところ恐縮ですが、ご一報いただけますと幸いです。", category: "催促", formality: "丁寧" },
  { text: "至急ご確認いただけますようお願いいたします。", category: "催促", formality: "丁寧" },
  { text: "ご返信が確認できておりません。ご確認いただけますでしょうか。", category: "催促", formality: "丁寧" },
  { text: "いつまでに返事をもらえますか。", category: "催促", formality: "普通" },
  { text: "重ねてのご連絡となり恐縮ですが、ご対応をお願いいたします。", category: "催促", formality: "丁寧" },

  // 報告
  { text: "ご報告申し上げます。", category: "報告", formality: "丁寧" },
  { text: "取り急ぎご連絡いたします。", category: "報告", formality: "丁寧" },
  { text: "下記の通りご報告いたします。", category: "報告", formality: "丁寧" },
  { text: "先日の件について、進捗をご報告いたします。", category: "報告", formality: "丁寧" },
  { text: "ご報告が遅くなり、失礼いたしました。", category: "報告", formality: "丁寧" },
  { text: "結果についてご連絡いたします。", category: "報告", formality: "普通" },
  { text: "以上、ご報告申し上げます。今後ともよろしくお願いいたします。", category: "報告", formality: "丁寧" },
  { text: "詳細は追ってご連絡いたします。", category: "報告", formality: "丁寧" },
  { text: "取り急ぎ、ご報告まで。", category: "報告", formality: "普通" },
  { text: "現在の状況をご報告させていただきます。", category: "報告", formality: "丁寧" },
  { text: "お知らせしたい点がございます。", category: "報告", formality: "普通" },

  // 挨拶
  { text: "初めてご連絡いたします。〇〇と申します。", category: "挨拶", formality: "丁寧" },
  { text: "突然のご連絡、失礼いたします。", category: "挨拶", formality: "丁寧" },
  { text: "お世話になっております。", category: "挨拶", formality: "普通" },
  { text: "いつも大変お世話になっております。", category: "挨拶", formality: "丁寧" },
  { text: "ご無沙汰しております。", category: "挨拶", formality: "普通" },
  { text: "長らくご無沙汰してしまい、失礼いたしました。", category: "挨拶", formality: "丁寧" },
  { text: "どうぞよろしくお願いいたします。", category: "挨拶", formality: "丁寧" },
  { text: "引き続きよろしくお願いいたします。", category: "挨拶", formality: "丁寧" },
  { text: "今後ともよろしくお願い申し上げます。", category: "挨拶", formality: "丁寧" },
  { text: "よろしくお願いします。", category: "挨拶", formality: "普通" },
  { text: "お体に気をつけてお過ごしください。", category: "挨拶", formality: "普通" },

  // 確認
  { text: "ご確認いただけますでしょうか。", category: "確認", formality: "丁寧" },
  { text: "内容をご確認の上、ご返信いただけますと幸いです。", category: "確認", formality: "丁寧" },
  { text: "認識に相違がなければ、このまま進めてよろしいでしょうか。", category: "確認", formality: "丁寧" },
  { text: "ご不明な点がございましたら、お気軽にお申し付けください。", category: "確認", formality: "丁寧" },
  { text: "以上の内容でよろしいでしょうか。", category: "確認", formality: "丁寧" },
  { text: "念のためご確認をお願いいたします。", category: "確認", formality: "丁寧" },
  { text: "確認してもらえますか。", category: "確認", formality: "普通" },
  { text: "問題なければご連絡ください。", category: "確認", formality: "普通" },
  { text: "ご質問があればいつでもお知らせください。", category: "確認", formality: "普通" },
  { text: "ご承知おきいただけますと幸いです。", category: "確認", formality: "丁寧" },
  { text: "ご不明点はございませんか。", category: "確認", formality: "普通" },
];

const CATEGORIES = ["すべて", "依頼", "お礼", "お詫び", "断り", "催促", "報告", "挨拶", "確認"] as const;
const FORMALITIES: ("すべて" | Formality)[] = ["すべて", "丁寧", "普通"];

function PhraseCard({ phrase }: { phrase: Phrase }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full text-left p-3 bg-white border border-border rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-800 leading-relaxed flex-1">{phrase.text}</p>
        <span className="text-xs text-white bg-accent px-2 py-0.5 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? "コピー済" : "コピー"}
        </span>
      </div>
      <div className="mt-2 flex gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
          {phrase.category}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            phrase.formality === "丁寧"
              ? "bg-purple-50 text-purple-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {phrase.formality}
        </span>
      </div>
    </button>
  );
}

export default function HakkenGenerator() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("すべて");
  const [formality, setFormality] = useState<"すべて" | Formality>("すべて");

  const filtered = PHRASES.filter((p) => {
    const matchCategory = category === "すべて" || p.category === category;
    const matchFormality = formality === "すべて" || p.formality === formality;
    const matchSearch = search === "" || p.text.includes(search);
    return matchCategory && matchFormality && matchSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">ビジネスフレーズ集</h1>
        <p className="text-muted text-sm">
          場面別ビジネスフレーズを一覧表示。クリックするとクリップボードにコピーされます。
        </p>
      </div>

      {/* Search */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="キーワードで検索..."
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Category filter */}
        <div>
          <p className="text-muted text-xs mb-2">場面</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  category === c
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-gray-50 text-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Formality filter */}
        <div>
          <p className="text-muted text-xs mb-2">丁寧さ</p>
          <div className="flex gap-2">
            {FORMALITIES.map((f) => (
              <button
                key={f}
                onClick={() => setFormality(f)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  formality === f
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-gray-50 text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted px-1">
        {filtered.length} 件のフレーズ
      </div>

      {/* Phrase list */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((phrase, i) => (
            <PhraseCard key={i} phrase={phrase} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted text-sm">
          該当するフレーズが見つかりませんでした。
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このビジネス文書フレーズ集ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ビジネスメール・文書でよく使うフレーズを場面別に検索。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このビジネス文書フレーズ集ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ビジネスメール・文書でよく使うフレーズを場面別に検索。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
