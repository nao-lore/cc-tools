"use client";

import { useState, useCallback } from "react";

type Style = "dearu" | "desumasu";

const SENTENCES_DEARU: string[] = [
  // Technology
  "人工知能は現代社会において欠かせない技術となっている。",
  "クラウドコンピューティングの普及により、企業のIT環境は大きく変化した。",
  "スマートフォンは私たちの日常生活を根本から変えたデバイスである。",
  "オープンソースソフトウェアの発展は、技術革新を加速させた。",
  "セキュリティ対策はあらゆるシステム設計において最優先事項である。",
  "データサイエンスは意思決定の質を飛躍的に向上させる分野だ。",
  "5G通信網の整備により、IoTデバイスの普及はさらに進むだろう。",
  "プログラミング教育は次世代を担う子どもたちに必要不可欠なスキルである。",
  "ブロックチェーン技術は透明性と信頼性を同時に実現する仕組みだ。",
  "自動化によって繰り返し作業から人間を解放することが可能となった。",
  // Nature
  "日本の四季はそれぞれに独自の美しさを持っている。",
  "桜の花が散る様子は、日本人の美意識を象徴する光景である。",
  "山間部に広がる棚田は、人と自然が共存する知恵の産物だ。",
  "海岸線に打ち寄せる波の音は、心を落ち着かせる効果がある。",
  "森林浴には免疫機能を高める科学的な根拠が存在する。",
  "気候変動は生態系に深刻な影響をもたらしつつある。",
  "渡り鳥の飛行経路は地球の磁場を利用した精密なナビゲーションである。",
  "清流に生息する生き物たちは水質環境の指標となる存在だ。",
  "紅葉の季節には山全体が赤や黄色に染まる壮観な景色が広がる。",
  "雪国の冬は厳しいが、雪解け後の春の訪れは格別の喜びをもたらす。",
  // Daily life
  "朝の習慣を整えることで一日の生産性が大きく向上する。",
  "読書は知識を広げるだけでなく、想像力を豊かにする営みである。",
  "料理は材料と技術の組み合わせで無限の可能性を持つ創造活動だ。",
  "適度な運動は心身の健康維持に欠かせない要素である。",
  "家族との時間は人生においてかけがえのない価値を持つ。",
  "睡眠の質を高めることで、翌日のパフォーマンスが向上する。",
  "日記をつける習慣は自己理解を深める有効な手段である。",
  "近所の商店街には地域のつながりを感じさせる温かみがある。",
  "手紙を書くという行為は相手への敬意を表す丁寧なコミュニケーションだ。",
  "散歩をしながら街の変化を観察することは生きた学びの機会となる。",
  // Business
  "顧客満足度の向上が長期的な事業成長の基盤となる。",
  "チームワークは個人の能力を超えた成果をもたらす力を持っている。",
  "市場調査なくして効果的なマーケティング戦略は立案できない。",
  "リーダーシップとは指示を出すことではなく、方向性を示すことである。",
  "イノベーションは既存の概念を疑うことから生まれる。",
  "持続可能な経営は社会的責任と収益性を両立させる取り組みだ。",
  "コスト管理は企業の競争力を維持するために不可欠な活動である。",
  "グローバル化により、異文化理解はビジネス上の必須スキルとなった。",
  "定期的なフィードバックは組織の成長を促進する重要な仕組みだ。",
  "ブランド価値は一朝一夕には構築できない長期的な資産である。",
  // Culture & society
  "伝統工芸は地域の文化と技術を次世代に伝える重要な遺産だ。",
  "映画は時代の空気感を記録する優れた文化的表現手段である。",
  "音楽は言語の壁を超えて人々をつなげる普遍的な芸術形式だ。",
  "ボランティア活動は社会の課題解決に市民が参加する手段である。",
  "多様性を受け入れる社会は創造性と革新性において優位性を持つ。",
  "歴史を学ぶことは現在の問題を理解するための重要な視点を与える。",
  "スポーツは競技を超えて人格形成に寄与する教育的側面を持っている。",
  "地域コミュニティの活性化には住民一人ひとりの参加意識が不可欠だ。",
  "芸術作品は鑑賞者に多様な解釈の余地を与える豊かな表現である。",
  "教育の機会均等は民主主義社会の根幹をなす重要な原則である。",
  "食文化は地域の歴史や気候風土が凝縮された生きた文化遺産だ。",
  "祭りは地域の人々が一体感を感じる特別な機会として機能している。",
];

const SENTENCES_DESUMASU: string[] = [
  // Technology
  "人工知能は現代社会において欠かせない技術になっています。",
  "クラウドコンピューティングの普及により、企業のIT環境は大きく変わりました。",
  "スマートフォンは私たちの日常生活を大きく変えたデバイスです。",
  "オープンソースソフトウェアの発展により、技術革新がどんどん加速しています。",
  "セキュリティ対策はあらゆるシステム設計において最も大切な課題です。",
  "データサイエンスは意思決定の質を大幅に向上させる分野です。",
  "5G通信網の整備が進むにつれ、IoTデバイスの普及もさらに広がるでしょう。",
  "プログラミング教育は次世代の子どもたちに必要不可欠なスキルになっています。",
  "ブロックチェーン技術は透明性と信頼性を同時に実現する仕組みです。",
  "自動化によって、繰り返しの作業から人間を解放することができるようになりました。",
  // Nature
  "日本の四季はそれぞれに独自の美しさを持っています。",
  "桜の花が散る様子は、日本人の美意識を象徴する風景です。",
  "山間部に広がる棚田は、人と自然が共存する知恵から生まれたものです。",
  "海岸線に打ち寄せる波の音は、心を落ち着かせてくれる効果があります。",
  "森林浴には免疫機能を高めるという科学的な根拠があります。",
  "気候変動は生態系に深刻な影響をもたらしています。",
  "渡り鳥の飛行経路は、地球の磁場を利用した精密なナビゲーションです。",
  "清流に生息する生き物たちは水質環境の指標となる存在です。",
  "紅葉の季節には山全体が赤や黄色に染まる壮観な景色が広がります。",
  "雪国の冬は厳しいですが、雪解け後の春の訪れは格別の喜びをもたらします。",
  // Daily life
  "朝の習慣を整えることで、一日の生産性が大きく向上します。",
  "読書は知識を広げるだけでなく、想像力を豊かにしてくれます。",
  "料理は材料と技術の組み合わせで無限の可能性を持つ創造的な活動です。",
  "適度な運動は心身の健康維持に欠かせない要素のひとつです。",
  "家族との時間は人生においてかけがえのない大切なものです。",
  "睡眠の質を高めることで、翌日のパフォーマンスが向上します。",
  "日記をつける習慣は、自己理解を深めるのに役立ちます。",
  "近所の商店街には地域のつながりを感じさせる温かみがあります。",
  "手紙を書くことは相手への敬意を表す丁寧なコミュニケーションです。",
  "散歩をしながら街の変化を観察することは生きた学びの機会になります。",
  // Business
  "顧客満足度の向上が長期的な事業成長の基盤となります。",
  "チームワークは個人の能力を超えた成果をもたらす大きな力を持っています。",
  "市場調査なしに効果的なマーケティング戦略を立てることは難しいです。",
  "リーダーシップとは指示を出すことではなく、方向性を示すことだと思います。",
  "イノベーションは既存の概念を疑うことから生まれることが多いです。",
  "持続可能な経営は社会的責任と収益性を両立させる取り組みです。",
  "コスト管理は企業の競争力を維持するために欠かせない活動です。",
  "グローバル化により、異文化への理解がビジネス上の必須スキルになりました。",
  "定期的なフィードバックは組織の成長を促す重要な仕組みです。",
  "ブランド価値は長い時間をかけて積み上げていく大切な資産です。",
  // Culture & society
  "伝統工芸は地域の文化と技術を次世代に伝える重要な遺産です。",
  "映画は時代の空気感を記録する優れた文化的な表現手段です。",
  "音楽は言語の壁を超えて人々をつなげる普遍的な芸術です。",
  "ボランティア活動は社会の課題解決に市民が参加するための手段のひとつです。",
  "多様性を受け入れる社会は創造性と革新性において強さを発揮します。",
  "歴史を学ぶことで現在の問題を理解するための大切な視点が得られます。",
  "スポーツは競技を超えて人格形成にも寄与する教育的な側面を持っています。",
  "地域コミュニティの活性化には住民一人ひとりの参加意識が大切です。",
  "芸術作品は鑑賞者にさまざまな解釈の余地を与えてくれます。",
  "教育の機会均等は民主主義社会の根幹をなす重要な原則です。",
  "食文化は地域の歴史や気候風土が凝縮された生きた文化遺産です。",
  "祭りは地域の人々が一体感を感じられる特別な機会として大切にされています。",
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateText(charCount: number, paraCount: number, style: Style): string {
  const sentences = style === "dearu" ? SENTENCES_DEARU : SENTENCES_DESUMASU;
  const shuffled = shuffleArray(sentences);

  const paragraphs: string[] = [];
  let totalChars = 0;
  const targetPerPara = Math.ceil(charCount / paraCount);

  for (let p = 0; p < paraCount; p++) {
    let para = "";
    let idx = 0;
    while (para.length < targetPerPara && totalChars + para.length < charCount) {
      const sentence = shuffled[(p * 7 + idx) % shuffled.length];
      para += sentence;
      idx++;
      if (idx > shuffled.length) break;
    }
    // Trim to target if we've exceeded overall char count
    const remaining = charCount - totalChars;
    if (para.length > remaining) {
      para = para.slice(0, remaining);
    }
    if (para.length > 0) {
      paragraphs.push(para);
      totalChars += para.length;
    }
    if (totalChars >= charCount) break;
  }

  return paragraphs.join("\n\n");
}

export default function LoremIpsumJp() {
  const [charCount, setCharCount] = useState(500);
  const [paraCount, setParaCount] = useState(3);
  const [style, setStyle] = useState<Style>("desumasu");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const text = generateText(charCount, paraCount, style);
    setOutput(text);
    setCopied(false);
  }, [charCount, paraCount, style]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const actualCharCount = output.replace(/\n/g, "").length;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* 文字数 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">文字数</label>
            <span className="text-sm font-semibold text-indigo-600">{charCount.toLocaleString()} 字</span>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={charCount}
            onChange={(e) => setCharCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>100字</span>
            <span>5,000字</span>
          </div>
        </div>

        {/* 段落数 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">段落数</label>
            <span className="text-sm font-semibold text-indigo-600">{paraCount} 段落</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={paraCount}
            onChange={(e) => setParaCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1段落</span>
            <span>20段落</span>
          </div>
        </div>

        {/* 文体 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">文体</label>
          <div className="flex gap-2">
            <button
              onClick={() => setStyle("dearu")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                style === "dearu"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
              }`}
            >
              である調
            </button>
            <button
              onClick={() => setStyle("desumasu")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                style === "desumasu"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
              }`}
            >
              ですます調
            </button>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          生成する
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {actualCharCount.toLocaleString()} 文字 / {output.split("\n\n").filter(Boolean).length} 段落
            </span>
            <button
              onClick={handleCopy}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {copied ? "コピー完了!" : "コピー"}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full h-64 sm:h-80 resize-y text-sm text-gray-800 leading-relaxed border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
          />
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このダミーテキスト生成ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">日本語ダミーテキストをワンクリックで生成。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このダミーテキスト生成ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "日本語ダミーテキストをワンクリックで生成。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
