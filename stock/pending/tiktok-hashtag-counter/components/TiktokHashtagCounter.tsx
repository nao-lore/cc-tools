"use client";
import { useState, useMemo } from "react";

const MAX_CAPTION = 2200; // TikTok's actual caption limit
const HASHTAG_WARNING = 150; // soft limit many creators use
const MAX_HASHTAGS = 30;

interface ParsedHashtag {
  tag: string;
  charCount: number;
}

function parseHashtags(text: string): ParsedHashtag[] {
  const matches = text.match(/#[\w\u3000-\u9fff\uff00-\uffef\u4e00-\u9faf]+/g) || [];
  return matches.map((tag) => ({ tag, charCount: tag.length }));
}

const POPULAR_TAGS = [
  "#fyp", "#foryou", "#foryoupage", "#viral", "#trending",
  "#おすすめ", "#fypシ", "#tiktok", "#動画", "#vlog",
  "#日常", "#ライフスタイル", "#おしゃれ", "#かわいい", "#好き",
];

const CATEGORY_TAGS: Record<string, string[]> = {
  "ライフスタイル": ["#ライフスタイル", "#日常", "#暮らし", "#vlog", "#ルーティン"],
  "グルメ": ["#グルメ", "#料理", "#食べ物", "#おいしい", "#ランチ", "#ディナー"],
  "ファッション": ["#ファッション", "#コーデ", "#おしゃれ", "#ootd", "#outfit"],
  "美容": ["#美容", "#メイク", "#スキンケア", "#コスメ", "#美肌"],
  "旅行": ["#旅行", "#trip", "#travel", "#観光", "#絶景"],
};

export default function TiktokHashtagCounter() {
  const [caption, setCaption] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const analysis = useMemo(() => {
    const hashtags = parseHashtags(caption);
    const captionOnly = caption.replace(/#[\w\u3000-\u9fff\uff00-\uffef\u4e00-\u9faf]+/g, "").trim();
    const captionChars = captionOnly.length;
    const hashtagChars = hashtags.reduce((sum, h) => sum + h.charCount + 1, 0); // +1 for space
    const totalChars = caption.length;
    const hashtagOnlyTotal = hashtags.reduce((sum, h) => sum + h.charCount, 0);

    return {
      hashtags,
      captionChars,
      hashtagChars,
      totalChars,
      hashtagOnlyTotal,
      hashtagCount: hashtags.length,
      isOverHardLimit: totalChars > MAX_CAPTION,
      isOverSoftLimit: hashtagOnlyTotal > HASHTAG_WARNING,
      isOverHashtagCount: hashtags.length > MAX_HASHTAGS,
      softRemaining: HASHTAG_WARNING - hashtagOnlyTotal,
    };
  }, [caption]);

  const insertTag = (tag: string) => {
    const trimmed = caption.trim();
    setCaption(trimmed ? `${trimmed} ${tag}` : tag);
  };

  const clearHashtags = () => {
    setCaption(caption.replace(/#[\w\u3000-\u9fff\uff00-\uffef\u4e00-\u9faf]+/g, "").trim());
  };

  const getCharBarColor = () => {
    const pct = analysis.totalChars / MAX_CAPTION;
    if (pct > 0.9) return "bg-red-500";
    if (pct > 0.7) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const getHashtagBarColor = () => {
    if (analysis.isOverSoftLimit) return "bg-red-500";
    const pct = analysis.hashtagOnlyTotal / HASHTAG_WARNING;
    if (pct > 0.8) return "bg-yellow-500";
    return "bg-pink-500";
  };

  return (
    <div className="space-y-5">
      {/* Main input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">キャプション入力</label>
          <button onClick={() => setCaption("")} className="text-xs text-gray-400 hover:text-red-500 transition-colors">クリア</button>
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="キャプションとハッシュタグをここに入力...&#10;&#10;#fyp #おすすめ #tiktok"
          rows={7}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none font-mono"
        />

        {/* Character meters */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>総文字数</span>
              <span className={analysis.isOverHardLimit ? "text-red-600 font-bold" : "text-gray-600"}>
                {analysis.totalChars.toLocaleString()} / {MAX_CAPTION.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getCharBarColor()}`}
                style={{ width: `${Math.min((analysis.totalChars / MAX_CAPTION) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>ハッシュタグ文字数（150字推奨上限）</span>
              <span className={analysis.isOverSoftLimit ? "text-red-600 font-bold" : "text-gray-600"}>
                {analysis.hashtagOnlyTotal} / {HASHTAG_WARNING}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getHashtagBarColor()}`}
                style={{ width: `${Math.min((analysis.hashtagOnlyTotal / HASHTAG_WARNING) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`rounded-xl p-4 text-center border ${analysis.isOverHardLimit ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 mb-1">総文字数</p>
          <p className={`text-2xl font-bold ${analysis.isOverHardLimit ? "text-red-600" : "text-gray-900"}`}>{analysis.totalChars}</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${analysis.isOverSoftLimit ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 mb-1">ハッシュタグ文字</p>
          <p className={`text-2xl font-bold ${analysis.isOverSoftLimit ? "text-red-600" : "text-pink-600"}`}>{analysis.hashtagOnlyTotal}</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${analysis.isOverHashtagCount ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
          <p className="text-xs text-gray-500 mb-1">ハッシュタグ数</p>
          <p className={`text-2xl font-bold ${analysis.isOverHashtagCount ? "text-red-600" : "text-gray-900"}`}>{analysis.hashtagCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">本文文字数</p>
          <p className="text-2xl font-bold text-gray-700">{analysis.captionChars}</p>
        </div>
      </div>

      {/* Warnings */}
      {(analysis.isOverHardLimit || analysis.isOverSoftLimit || analysis.isOverHashtagCount) && (
        <div className="space-y-2">
          {analysis.isOverHardLimit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              総文字数が上限（{MAX_CAPTION}字）を超えています。投稿時に自動でカットされます。
            </div>
          )}
          {analysis.isOverSoftLimit && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700">
              ハッシュタグが150字を超えています。リーチが下がる可能性があります。{Math.abs(analysis.softRemaining)}字削減を推奨。
            </div>
          )}
          {analysis.isOverHashtagCount && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
              ハッシュタグが{MAX_HASHTAGS}個を超えています。スパムと判定されることがあります。
            </div>
          )}
        </div>
      )}

      {analysis.totalChars > 0 && !analysis.isOverHardLimit && !analysis.isOverSoftLimit && !analysis.isOverHashtagCount && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 text-center">
          問題なし！このまま投稿できます。
        </div>
      )}

      {/* Hashtag list */}
      {analysis.hashtags.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">使用中のハッシュタグ（{analysis.hashtagCount}個）</h3>
            <button onClick={clearHashtags} className="text-xs text-red-500 hover:text-red-700">すべて削除</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.hashtags.map((h, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 rounded-full px-3 py-1 text-xs font-medium">
                {h.tag}
                <span className="text-pink-400">({h.charCount})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular tags */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">人気ハッシュタグを追加</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => insertTag(tag)}
              className="text-xs bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-700 border border-transparent hover:border-pink-300 rounded-full px-3 py-1.5 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-600 mb-2">カテゴリ別</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.keys(CATEGORY_TAGS).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeCategory === cat ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-600 border-gray-300 hover:border-pink-400"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          {activeCategory && (
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TAGS[activeCategory].map((tag) => (
                <button
                  key={tag}
                  onClick={() => insertTag(tag)}
                  className="text-xs bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-full px-3 py-1.5 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">TikTokハッシュタグのコツ</h3>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex gap-2"><span className="text-pink-500 font-bold">1.</span>ハッシュタグは3〜5個が最も効果的という報告が多い</li>
          <li className="flex gap-2"><span className="text-pink-500 font-bold">2.</span>大きいタグ×小さいタグを組み合わせるのが基本戦略</li>
          <li className="flex gap-2"><span className="text-pink-500 font-bold">3.</span>#fypや#おすすめは必須だが競争率が高い</li>
          <li className="flex gap-2"><span className="text-pink-500 font-bold">4.</span>ニッチなタグで競合の少ない場所を狙うのも有効</li>
          <li className="flex gap-2"><span className="text-pink-500 font-bold">5.</span>150字ルールは公式制限ではなく、クリエイターの経験則</li>
        </ul>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このTikTokハッシュタグ文字数管理ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">キャプション+ハッシュタグの150字制限チェック。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このTikTokハッシュタグ文字数管理ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "キャプション+ハッシュタグの150字制限チェック。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
