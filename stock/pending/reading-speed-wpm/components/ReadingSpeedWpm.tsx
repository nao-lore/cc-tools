"use client";
import { useState, useEffect, useRef } from "react";

const SAMPLE_TEXTS = [
  {
    id: 1,
    title: "桃太郎（冒頭）",
    level: "やさしい",
    text: `むかし、むかし、あるところに、おじいさんとおばあさんがおりました。おじいさんは山へしば刈りに、おばあさんは川へ洗濯に行きました。おばあさんが川で洗濯をしていると、川上から大きな桃がドンブラコ、ドンブラコと流れてきました。「まあ、大きな桃だこと。おじいさんへのお土産にしよう」と、おばあさんは桃を拾い上げて家へ持ち帰りました。夕方、おじいさんが帰ってきて、ふたりで桃を切ろうとすると、中から元気のいい男の赤ちゃんが飛び出してきました。子どものいなかったふたりはたいそう喜び、その子を桃太郎と名付けて大切に育てました。桃太郎はすくすくと育ち、村一番の力持ちになりました。`,
    charCount: 256,
  },
  {
    id: 2,
    title: "吾輩は猫である（冒頭）",
    level: "ふつう",
    text: `吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕まえて煮て食うという話である。しかしその当時は何という考も無かったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始めであろう。`,
    charCount: 300,
  },
  {
    id: 3,
    title: "現代ビジネス文章",
    level: "ふつう",
    text: `デジタルトランスフォーメーション（DX）が急速に進む現代において、企業は従来のビジネスモデルを根本から見直す必要に迫られています。特に、人工知能や機械学習技術の進歩により、これまで人間のみが担っていた複雑な判断業務の自動化が現実のものとなりつつあります。このような変化に対応するためには、組織全体のデジタルリテラシーを高めるとともに、データドリブンな意思決定文化を醸成することが不可欠です。また、顧客体験（CX）の向上を軸に据えたイノベーションへの継続的な投資も重要な戦略的課題として浮上しています。成功する企業は、技術の導入だけでなく、人材育成と組織変革を同時並行で進めているという点が共通しています。`,
    charCount: 310,
  },
];

// Japanese average: ~400-600 chars/min
// Grades reference
const SPEED_REFS = [
  { label: "小学生", min: 200, max: 400 },
  { label: "中学生", min: 400, max: 600 },
  { label: "高校生", min: 500, max: 800 },
  { label: "成人平均", min: 600, max: 900 },
  { label: "速読者", min: 1200, max: 3000 },
];

function getRating(cpm: number): { label: string; color: string; comment: string } {
  if (cpm < 300) return { label: "ゆっくり", color: "text-blue-600", comment: "焦らず着実に読む丁寧型です。" };
  if (cpm < 500) return { label: "標準以下", color: "text-green-600", comment: "平均的な小学生上位クラスの速度です。" };
  if (cpm < 700) return { label: "標準", color: "text-emerald-600", comment: "成人平均に近い速度です。" };
  if (cpm < 1000) return { label: "やや速い", color: "text-yellow-600", comment: "平均より速い読書家レベルです。" };
  if (cpm < 1500) return { label: "速い", color: "text-orange-600", comment: "速読の入り口に達しています。" };
  return { label: "超速", color: "text-red-600", comment: "速読トレーニング効果が出ています！" };
}

type Phase = "select" | "ready" | "reading" | "done";

export default function ReadingSpeedWpm() {
  const [selectedText, setSelectedText] = useState(SAMPLE_TEXTS[0]);
  const [customText, setCustomText] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [phase, setPhase] = useState<Phase>("select");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [history, setHistory] = useState<{ cpm: number; title: string; date: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeText = useCustom ? customText : selectedText.text;
  const activeCharCount = activeText.replace(/\s/g, "").length;

  useEffect(() => {
    if (phase === "reading") {
      const start = Date.now();
      setStartTime(start);
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - start);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const elapsedSec = elapsedMs / 1000;
  const cpm = elapsedSec > 0 ? Math.round((activeCharCount / elapsedSec) * 60) : 0;
  const rating = getRating(cpm);

  const handleStart = () => {
    setElapsedMs(0);
    setPhase("reading");
  };

  const handleDone = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("done");
    const finalCpm = elapsedSec > 0 ? Math.round((activeCharCount / elapsedSec) * 60) : 0;
    setHistory((h) => [
      {
        cpm: finalCpm,
        title: useCustom ? "カスタムテキスト" : selectedText.title,
        date: new Date().toLocaleTimeString("ja-JP"),
      },
      ...h.slice(0, 4),
    ]);
  };

  const handleReset = () => {
    setPhase("select");
    setElapsedMs(0);
    setStartTime(null);
  };

  return (
    <div className="space-y-6">
      {/* Text selection */}
      {(phase === "select" || phase === "ready") && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">テキストを選ぶ</h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setUseCustom(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!useCustom ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              サンプル文章
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${useCustom ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              自分のテキスト
            </button>
          </div>

          {!useCustom ? (
            <div className="space-y-2">
              {SAMPLE_TEXTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedText(t)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedText.id === t.id ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{t.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.charCount}文字</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.level === "やさしい" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {t.level}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="ここにテキストを貼り付けてください..."
                rows={5}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{activeCharCount}文字（空白除く）</p>
            </div>
          )}

          <button
            onClick={() => setPhase("ready")}
            disabled={useCustom && activeCharCount < 10}
            className="mt-5 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            準備する
          </button>
        </div>
      )}

      {/* Ready phase */}
      {phase === "ready" && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
          <p className="text-teal-800 font-medium mb-2">準備ができたら「計測開始」をタップ</p>
          <p className="text-sm text-teal-600 mb-4">テキストが表示されたらすぐに読み始めてください</p>
          <button
            onClick={handleStart}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl text-lg transition-colors"
          >
            計測開始
          </button>
        </div>
      )}

      {/* Reading phase */}
      {phase === "reading" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-teal-600 text-white rounded-2xl px-5 py-3">
            <span className="text-sm font-medium">計測中...</span>
            <span className="text-2xl font-mono font-bold">{elapsedSec.toFixed(1)}秒</span>
            <button
              onClick={handleDone}
              className="bg-white text-teal-600 font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-teal-50 transition-colors"
            >
              読み終わった
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-gray-800 leading-relaxed text-base">{activeText}</p>
          </div>
        </div>
      )}

      {/* Result phase */}
      {phase === "done" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white text-center">
            <p className="text-teal-200 text-sm mb-1">あなたの読書速度</p>
            <p className="text-6xl font-bold">{cpm.toLocaleString()}</p>
            <p className="text-teal-200 mt-1">文字/分</p>
            <p className={`text-2xl font-semibold mt-3 ${rating.color.replace("text-", "text-white/").replace("-600", "")}`}>
              <span className="text-white">{rating.label}</span>
            </p>
            <p className="text-teal-100 text-sm mt-1">{rating.comment}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/20 rounded-xl p-3">
                <div className="text-teal-200">読了時間</div>
                <div className="font-bold">{elapsedSec.toFixed(1)}秒</div>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <div className="text-teal-200">文字数</div>
                <div className="font-bold">{activeCharCount}文字</div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">他グループとの比較</h3>
            <div className="space-y-3">
              {SPEED_REFS.map((ref) => {
                const avg = (ref.min + ref.max) / 2;
                const pct = Math.min((cpm / (ref.max * 1.2)) * 100, 100);
                const userPct = Math.min((cpm / (ref.max * 1.2)) * 100, 100);
                return (
                  <div key={ref.label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{ref.label}</span>
                      <span>{ref.min}〜{ref.max} 文字/分</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gray-300 rounded-full"
                        style={{ width: `${Math.min((ref.max / (SPEED_REFS[SPEED_REFS.length - 1].max * 1.2)) * 100, 100)}%` }}
                      />
                      <div
                        className="absolute top-0 h-full bg-teal-500 rounded-full opacity-70"
                        style={{ width: `${Math.min((cpm / (SPEED_REFS[SPEED_REFS.length - 1].max * 1.2)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="w-3 h-3 bg-gray-300 rounded-sm"></span>各グループ範囲
              <span className="w-3 h-3 bg-teal-500 rounded-sm ml-2"></span>あなた
            </div>
          </div>

          {/* Book reading time estimate */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">本の読了時間目安（あなたの速度で）</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "絵本（2,000字）", chars: 2000 },
                { title: "短編小説（40,000字）", chars: 40000 },
                { title: "文庫本（100,000字）", chars: 100000 },
                { title: "新書（120,000字）", chars: 120000 },
              ].map((book) => {
                const mins = cpm > 0 ? book.chars / cpm : 0;
                const h = Math.floor(mins / 60);
                const m = Math.round(mins % 60);
                return (
                  <div key={book.title} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{book.title}</p>
                    <p className="font-bold text-gray-800 text-sm mt-1">
                      {h > 0 ? `${h}時間${m}分` : `${m}分`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full border border-teal-400 text-teal-600 hover:bg-teal-50 font-medium py-3 rounded-xl transition-colors"
          >
            もう一度測定する
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">このセッションの記録</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-600">{h.title}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-teal-600">{h.cpm.toLocaleString()} 文字/分</span>
                  <span className="text-xs text-gray-400">{h.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
