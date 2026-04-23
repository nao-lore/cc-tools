"use client";
import { useState } from "react";

type Genre = "education" | "tips" | "story" | "product" | "lifestyle" | "howto";

const GENRE_TEMPLATES: Record<Genre, { label: string; emoji: string; slides: string[]; hook: string; cta: string }> = {
  education: {
    label: "教育・解説",
    emoji: "📚",
    slides: ["フック（衝撃的な事実・問い）", "問題提起・共感", "本論①（理由・原因）", "本論②（具体例）", "本論③（深掘り）", "まとめ・結論", "行動提案・CTA"],
    hook: "「知らないと損する◯◯」「99%の人が間違えている◯◯」",
    cta: "「保存してね」「シェアしてくれると嬉しい」",
  },
  tips: {
    label: "Tips・ハック",
    emoji: "💡",
    slides: ["フック（○個のTips）", "Tip①", "Tip②", "Tip③", "Tip④", "Tip⑤", "まとめ・保存推奨"],
    hook: "「今すぐ使える◯つのコツ」「プロが教える◯つの裏技」",
    cta: "「後で見返せるよう保存を！」",
  },
  story: {
    label: "ストーリー・体験談",
    emoji: "📖",
    slides: ["衝撃の結末から始める", "状況設定・背景", "問題・葛藤①", "問題・葛藤②", "転機・気づき", "変化・結果", "読者へのメッセージ・CTA"],
    hook: "「◯◯で人生変わった話」「正直に言うと…」",
    cta: "「同じ経験した人はコメントで！」",
  },
  product: {
    label: "商品・サービス紹介",
    emoji: "🛍️",
    slides: ["ビジュアルインパクト", "こんな悩みありませんか？", "解決策の提示", "商品・サービスの特徴①", "特徴②・証拠", "お客様の声・実績", "購入・申込のCTA"],
    hook: "「◯◯に悩んでいませんか？」",
    cta: "「プロフィールのリンクから詳細はこちら」",
  },
  lifestyle: {
    label: "ライフスタイル・日常",
    emoji: "✨",
    slides: ["目を引くビジュアル", "テーマ・世界観の提示", "シーン①", "シーン②", "シーン③", "こだわり・こだわりポイント", "フォロー・保存のCTA"],
    hook: "「私の◯◯なルーティン」「こんな◯◯が好き」",
    cta: "「フォローしてね🙏」",
  },
  howto: {
    label: "ハウツー・手順",
    emoji: "📋",
    slides: ["完成形を見せる", "必要なもの・準備", "ステップ①", "ステップ②", "ステップ③", "ステップ④・完成", "注意点・応用・CTA"],
    hook: "「誰でも◯分でできる◯◯の作り方」",
    cta: "「保存して参考にしてね」",
  },
};

interface Slide {
  id: number;
  role: string;
  content: string;
  notes: string;
}

export default function InstagramCarouselPlanner() {
  const [genre, setGenre] = useState<Genre>("education");
  const [slideCount, setSlideCount] = useState(7);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [generated, setGenerated] = useState(false);
  const [topic, setTopic] = useState("");

  const template = GENRE_TEMPLATES[genre];

  const generateSlides = () => {
    const count = Math.min(slideCount, 10);
    const roles = template.slides.slice(0, count);
    // pad if slideCount > template
    while (roles.length < count) {
      roles.push(`スライド${roles.length + 1}`);
    }
    setSlides(
      roles.map((role, i) => ({
        id: i + 1,
        role,
        content: "",
        notes: "",
      }))
    );
    setGenerated(true);
  };

  const updateSlide = (id: number, field: keyof Pick<Slide, "content" | "notes">, value: string) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const moveSlide = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= slides.length) return;
    setSlides((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr.map((s, i) => ({ ...s, id: i + 1 }));
    });
  };

  const copyScript = () => {
    const text = slides
      .map((s) => `【${s.id}枚目：${s.role}】\n${s.content || "（未入力）"}\nメモ：${s.notes || "なし"}`)
      .join("\n\n");
    const full = `トピック：${topic || "（未設定）"}\nジャンル：${template.label}\n\nフック案：${template.hook}\nCTA：${template.cta}\n\n${"=".repeat(40)}\n\n${text}`;
    navigator.clipboard.writeText(full).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* 設定 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">投稿設定</h2>

        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-2">投稿トピック（任意）</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例：朝のルーティン5選、睡眠改善のコツ..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-3">ジャンル</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.entries(GENRE_TEMPLATES) as [Genre, typeof GENRE_TEMPLATES[Genre]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setGenre(key); setGenerated(false); }}
                className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-colors text-left ${
                  genre === key
                    ? "border-pink-500 bg-pink-50 text-pink-800"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-1">{val.emoji}</span>{val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm text-gray-600 mb-2">
            スライド枚数：<strong>{slideCount}枚</strong>
            <span className="text-xs text-gray-400 ml-2">（推奨 5〜10枚）</span>
          </label>
          <input
            type="range"
            min={3}
            max={10}
            value={slideCount}
            onChange={(e) => { setSlideCount(Number(e.target.value)); setGenerated(false); }}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3枚</span><span>10枚</span>
          </div>
        </div>

        <button
          onClick={generateSlides}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          構成を生成
        </button>
      </div>

      {/* フック・CTA提案 */}
      {generated && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            {template.emoji} {template.label} テンプレートのポイント
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-pink-600 font-medium mb-1">フック文の例</div>
              <div className="text-sm text-gray-700 bg-white rounded-lg px-4 py-2">{template.hook}</div>
            </div>
            <div>
              <div className="text-xs text-purple-600 font-medium mb-1">CTA（行動喚起）</div>
              <div className="text-sm text-gray-700 bg-white rounded-lg px-4 py-2">{template.cta}</div>
            </div>
          </div>
        </div>
      )}

      {/* スライド構成 */}
      {generated && slides.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">スライド構成（{slides.length}枚）</h2>
            <button
              onClick={copyScript}
              className="text-sm text-pink-600 hover:text-pink-800 border border-pink-300 px-3 py-1.5 rounded-lg"
            >
              台本をコピー
            </button>
          </div>

          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div key={slide.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-pink-200 transition-colors">
                <div className="flex items-start gap-3">
                  {/* 番号 */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    {slide.id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-700">{slide.role}</span>
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => moveSlide(index, -1)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs px-1"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSlide(index, 1)}
                          disabled={index === slides.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs px-1"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={slide.content}
                      onChange={(e) => updateSlide(slide.id, "content", e.target.value)}
                      placeholder="テキスト・メッセージを入力..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none mb-2"
                    />
                    <input
                      type="text"
                      value={slide.notes}
                      onChange={(e) => updateSlide(slide.id, "notes", e.target.value)}
                      placeholder="デザインメモ（色・フォント・画像の指示など）"
                      className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-200 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ヒント */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">カルーセル投稿の鉄則</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2"><span className="text-pink-500 flex-shrink-0">•</span>1枚目が命。スクロールを止めるビジュアル＋フック文</li>
          <li className="flex gap-2"><span className="text-pink-500 flex-shrink-0">•</span>2枚目は保存・スワイプへの橋渡し。価値を明示する</li>
          <li className="flex gap-2"><span className="text-pink-500 flex-shrink-0">•</span>最後のスライドには必ず行動喚起（保存・フォロー・コメント）</li>
          <li className="flex gap-2"><span className="text-pink-500 flex-shrink-0">•</span>テキストは少なく、1スライド1メッセージを徹底</li>
          <li className="flex gap-2"><span className="text-pink-500 flex-shrink-0">•</span>全スライドで一貫したカラーパレット・フォントを使う</li>
        </ul>
      </div>
    </div>
  );
}
