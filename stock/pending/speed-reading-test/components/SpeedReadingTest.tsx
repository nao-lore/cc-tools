"use client";
import { useState, useEffect, useRef } from "react";

const PASSAGES = [
  {
    id: 1,
    title: "科学のふしぎ",
    level: "小学生",
    text: `太陽は地球からとても遠い場所にあります。その距離は約1億5千万キロメートルで、光の速さで進んでも8分以上かかります。太陽の表面温度は約6000度で、中心部では1500万度にもなります。太陽はガスのかたまりで、おもに水素とヘリウムというガスでできています。太陽の中では核融合という反応が起き、莫大なエネルギーが生まれます。そのエネルギーが光や熱として地球に届き、私たちの生活を支えています。地球に届く太陽の光は、植物が光合成をするためにも欠かせません。もし太陽がなければ、地球はたちまち凍りつき、生命は存在できなくなります。`,
    charCount: 248,
    questions: [
      { q: "太陽から地球まで光が届く時間は？", options: ["約4分", "約8分", "約15分", "約30分"], answer: 1 },
      { q: "太陽の表面温度は約何度？", options: ["1000度", "3000度", "6000度", "10000度"], answer: 2 },
      { q: "太陽のエネルギーが生まれる反応は？", options: ["化学反応", "核分裂", "核融合", "光合成"], answer: 2 },
    ],
  },
  {
    id: 2,
    title: "江戸時代の暮らし",
    level: "中学生",
    text: `江戸時代の日本は、世界でも類を見ない独特の文化と社会制度を発展させた時代です。鎖国政策によって外国との交流を制限する一方で、国内では農業・商業・手工業が発達し、独自の経済圏が形成されました。江戸の人口は18世紀初頭には100万人を超え、当時世界最大級の都市のひとつとなりました。識字率も高く、寺子屋と呼ばれる庶民の教育機関が全国各地に普及し、読み書きや算術を学ぶ子どもたちが増えました。また、歌舞伎・浮世絵・俳句など、庶民文化が花開き、現代の日本文化の礎を築きました。徳川幕府による安定した統治が約260年続いたことで、平和な時代が長く続いたことも大きな特徴です。`,
    charCount: 296,
    questions: [
      { q: "江戸の人口が100万人を超えたのは何世紀初頭？", options: ["16世紀", "17世紀", "18世紀", "19世紀"], answer: 2 },
      { q: "庶民の教育機関を何と呼ぶ？", options: ["私塾", "藩校", "寺子屋", "書院"], answer: 2 },
      { q: "徳川幕府の統治は約何年続いた？", options: ["150年", "200年", "260年", "300年"], answer: 2 },
    ],
  },
  {
    id: 3,
    title: "AIと社会変革",
    level: "高校生・成人",
    text: `人工知能（AI）技術の急速な発展は、私たちの社会と経済の構造を根本から変えつつあります。機械学習、特にディープラーニングの登場により、コンピューターは画像認識・音声認識・自然言語処理において人間に匹敵する、場合によっては凌駕する能力を発揮するようになりました。医療分野では、AIがX線画像やMRIから疾患を高精度で検出し、早期診断に貢献しています。製造業では、AIを活用した予知保全が設備の故障を事前に防ぎ、生産効率を大幅に改善しています。一方で、AIによる雇用代替への懸念も高まっています。ルーティン作業だけでなく、知的労働の一部もAIが担えるようになったことで、人間は創造性・共感・倫理的判断といった、機械が苦手とする能力を磨くことがより重要となってきています。AIとどう共存するかは、現代社会の最重要課題のひとつです。`,
    charCount: 340,
    questions: [
      { q: "ディープラーニングが貢献した分野として誤りはどれ？", options: ["画像認識", "音声認識", "量子計算", "自然言語処理"], answer: 2 },
      { q: "医療分野でのAI活用例として正しいのは？", options: ["手術ロボットの開発", "疾患の早期診断", "薬の製造", "病院の経営"], answer: 1 },
      { q: "AIが苦手とする能力として挙げられているのは？", options: ["データ処理", "パターン認識", "倫理的判断", "数値計算"], answer: 2 },
    ],
  },
];

// Grade-level references (chars/min)
const GRADE_REFS = [
  { label: "小学1-2年", cpm: 200 },
  { label: "小学3-4年", cpm: 350 },
  { label: "小学5-6年", cpm: 500 },
  { label: "中学生", cpm: 650 },
  { label: "高校生", cpm: 800 },
  { label: "成人平均", cpm: 750 },
  { label: "速読者", cpm: 1500 },
];

type Phase = "select" | "reading" | "quiz" | "result";

export default function SpeedReadingTest() {
  const [passage, setPassage] = useState(PASSAGES[0]);
  const [phase, setPhase] = useState<Phase>("select");
  const [startTime, setStartTime] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "reading") {
      const s = Date.now();
      setStartTime(s);
      timerRef.current = setInterval(() => setElapsedMs(Date.now() - s), 200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const elapsedSec = elapsedMs / 1000;
  const cpm = elapsedSec > 0 ? Math.round((passage.charCount / elapsedSec) * 60) : 0;

  const correctCount = answers.filter((a, i) => a === passage.questions[i].answer).length;
  const comprehension = passage.questions.length > 0 ? Math.round((correctCount / passage.questions.length) * 100) : 0;
  const adjustedCpm = Math.round(cpm * (comprehension / 100));

  const handleStartReading = () => {
    setPhase("reading");
    setAnswers([]);
    setCurrentQ(0);
  };

  const handleDoneReading = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("quiz");
  };

  const handleAnswer = (optIdx: number) => {
    const newAnswers = [...answers, optIdx];
    setAnswers(newAnswers);
    if (currentQ + 1 < passage.questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase("result");
    }
  };

  const handleReset = () => {
    setPhase("select");
    setElapsedMs(0);
    setAnswers([]);
    setCurrentQ(0);
  };

  const findGradePosition = (cpm: number) => {
    const sorted = [...GRADE_REFS].sort((a, b) => a.cpm - b.cpm);
    for (let i = 0; i < sorted.length; i++) {
      if (cpm < sorted[i].cpm) {
        return i === 0 ? sorted[0].label + "未満" : `${sorted[i - 1].label}〜${sorted[i].label}`;
      }
    }
    return "速読者レベル以上";
  };

  return (
    <div className="space-y-6">
      {/* Select */}
      {phase === "select" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">テスト文章を選ぶ</h2>
          <div className="space-y-3">
            {PASSAGES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPassage(p)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${passage.id === p.id ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.charCount}文字・設問{p.questions.length}問</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.level === "小学生" ? "bg-green-100 text-green-700" :
                    p.level === "中学生" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>{p.level}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm text-violet-800">
            <p className="font-medium mb-1">テストの流れ</p>
            <ol className="list-decimal list-inside space-y-1 text-violet-700 text-xs">
              <li>「読み始める」をタップして文章が表示されたらすぐ読む</li>
              <li>読み終わったら「読み終わった」をタップ</li>
              <li>理解度チェックの設問に答える</li>
              <li>速度と理解度を合わせた実力スコアを確認</li>
            </ol>
          </div>

          <button
            onClick={handleStartReading}
            className="mt-5 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            読み始める
          </button>
        </div>
      )}

      {/* Reading */}
      {phase === "reading" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-violet-600 text-white rounded-2xl px-5 py-3">
            <span className="text-sm">読んでいます...</span>
            <span className="text-2xl font-mono font-bold">{elapsedSec.toFixed(1)}秒</span>
            <button
              onClick={handleDoneReading}
              className="bg-white text-violet-600 font-bold px-4 py-1.5 rounded-lg text-sm"
            >
              読み終わった
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-3">{passage.title}</h2>
            <p className="text-gray-800 leading-relaxed">{passage.text}</p>
          </div>
          <p className="text-xs text-center text-gray-400">読み終わったらすぐにボタンをタップしてください</p>
        </div>
      )}

      {/* Quiz */}
      {phase === "quiz" && currentQ < passage.questions.length && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500 font-medium">理解度チェック</p>
            <p className="text-xs text-gray-400">{currentQ + 1} / {passage.questions.length}</p>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-5">
            <div className="h-full bg-violet-400 rounded-full transition-all" style={{ width: `${((currentQ) / passage.questions.length) * 100}%` }} />
          </div>
          <p className="text-base font-semibold text-gray-800 mb-4">{passage.questions[currentQ].q}</p>
          <div className="space-y-2">
            {passage.questions[currentQ].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all text-sm"
              >
                <span className="text-violet-600 font-medium mr-2">{["A", "B", "C", "D"][i]}.</span>
                {opt}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">文章を見ずに答えてください</p>
        </div>
      )}

      {/* Result */}
      {phase === "result" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white">
            <p className="text-violet-200 text-sm text-center mb-3">測定結果</p>
            <div className="grid grid-cols-3 gap-3 text-center mb-5">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-violet-300">読書速度</p>
                <p className="text-2xl font-bold">{cpm.toLocaleString()}</p>
                <p className="text-xs text-violet-300">文字/分</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-violet-300">理解度</p>
                <p className="text-2xl font-bold">{comprehension}%</p>
                <p className="text-xs text-violet-300">{correctCount}/{passage.questions.length}正解</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-violet-300">実力スコア</p>
                <p className="text-2xl font-bold">{adjustedCpm.toLocaleString()}</p>
                <p className="text-xs text-violet-300">速度×理解度</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-violet-200 text-xs">あなたのレベル</p>
              <p className="text-lg font-bold mt-1">{findGradePosition(cpm)}</p>
            </div>
          </div>

          {/* Answer review */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">設問の正誤</h3>
            <div className="space-y-4">
              {passage.questions.map((q, i) => {
                const isCorrect = answers[i] === q.answer;
                return (
                  <div key={i} className={`rounded-xl p-4 border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <p className="text-sm font-medium text-gray-800 mb-2">Q{i + 1}. {q.q}</p>
                    <p className={`text-sm ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                      {isCorrect ? "正解" : "不正解"}：{q.options[q.answer]}
                    </p>
                    {!isCorrect && <p className="text-xs text-red-500 mt-1">あなたの答え：{q.options[answers[i]]}</p>}
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この速読速度測定ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">黙読速度を測定、学年別平均比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この速読速度測定ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "黙読速度を測定、学年別平均比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
          </div>

          {/* Grade reference */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">学年別 読書速度の目安</h3>
            <div className="space-y-2">
              {GRADE_REFS.map((g) => (
                <div key={g.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-24 shrink-0">{g.label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cpm >= g.cpm ? "bg-violet-400" : "bg-gray-300"}`}
                      style={{ width: `${Math.min((g.cpm / 2000) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{g.cpm} 文字/分</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <span className="text-xs text-violet-700 font-medium w-24 shrink-0">あなた</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-600 rounded-full"
                    style={{ width: `${Math.min((cpm / 2000) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-violet-700 font-bold w-20 text-right">{cpm} 文字/分</span>
              </div>
            </div>
          </div>

          <button onClick={handleReset} className="w-full border border-violet-400 text-violet-600 hover:bg-violet-50 font-medium py-3 rounded-xl transition-colors">
            別の文章でテストする
          </button>
        </div>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "速読速度測定",
  "description": "黙読速度を測定、学年別平均比較",
  "url": "https://tools.loresync.dev/speed-reading-test",
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
