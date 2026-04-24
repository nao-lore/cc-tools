"use client";

import { useState, useMemo } from "react";

type Stage = "子猫" | "ジュニア" | "成猫" | "壮年期" | "シニア" | "ハイシニア";

interface StageInfo {
  stage: Stage;
  color: string;
  bg: string;
  border: string;
  tips: string[];
}

function convertToHuman(catAge: number): number {
  if (catAge <= 0) return 0;
  if (catAge <= 1) return catAge * 15;
  if (catAge <= 2) return 15 + (catAge - 1) * 9;
  return 24 + (catAge - 2) * 4;
}

function getStageInfo(humanAge: number): StageInfo {
  if (humanAge < 15) {
    return {
      stage: "子猫",
      color: "text-pink-600",
      bg: "bg-pink-50",
      border: "border-pink-200",
      tips: [
        "ワクチン接種を開始する時期です（生後2ヶ月〜）",
        "社会化期間。人や他のペットに慣れさせましょう",
        "母乳または高タンパク・高カロリーの子猫用フードを",
        "寄生虫予防（ノミ・ダニ・回虫）を忘れずに",
      ],
    };
  }
  if (humanAge < 24) {
    return {
      stage: "ジュニア",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      tips: [
        "性成熟する時期。不妊・去勢手術の検討を",
        "運動量が多い時期。十分な遊び時間を確保して",
        "成猫用フードへの切り替えタイミングです（1歳〜）",
        "歯磨き習慣をこの時期から始めると定着しやすい",
      ],
    };
  }
  if (humanAge < 40) {
    return {
      stage: "成猫",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      tips: [
        "体重管理が重要。肥満は糖尿病・関節炎のリスクに",
        "年1回の健康診断を習慣にしましょう",
        "歯周病予防のため定期的な歯磨きを",
        "ストレス環境の排除。縄張り感覚を尊重して",
      ],
    };
  }
  if (humanAge < 56) {
    return {
      stage: "壮年期",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      tips: [
        "腎臓病・甲状腺疾患のリスクが上昇。定期検査を",
        "水分摂取量が少なくなりがち。ウェットフードを取り入れて",
        "関節への負担を減らす段差の工夫を",
        "年2回の健康診断にステップアップ推奨",
      ],
    };
  }
  if (humanAge < 72) {
    return {
      stage: "シニア",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      tips: [
        "シニア用フードへの切り替えを検討（7歳〜）",
        "腎臓・心臓・甲状腺の定期スクリーニングを",
        "トイレは低い縁のものに変えて足腰の負担を軽減",
        "急な体重変化・食欲不振は早めに受診を",
      ],
    };
  }
  return {
    stage: "ハイシニア",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    tips: [
      "痛みのサインを見逃さないで（毛づくろい減少・動きの鈍化）",
      "温かく静かな休憩場所を用意してあげましょう",
      "食欲・排泄状況を毎日チェック",
      "緩和ケアについてかかりつけ医と相談を",
    ],
  };
}

const AGE_OPTIONS: number[] = [];
for (let i = 0; i <= 25; i += 0.5) {
  AGE_OPTIONS.push(i);
}

function formatAge(age: number): string {
  if (age === Math.floor(age)) return `${age}歳`;
  return `${Math.floor(age)}歳半`;
}

export default function CatHumanAge() {
  const [catAge, setCatAge] = useState<number>(3);

  const humanAge = useMemo(() => convertToHuman(catAge), [catAge]);
  const stageInfo = useMemo(() => getStageInfo(humanAge), [humanAge]);

  const tableRows = useMemo(() => {
    const rows: { cat: number; human: number; stage: StageInfo }[] = [];
    for (let age = 1; age <= 20; age++) {
      const h = convertToHuman(age);
      rows.push({ cat: age, human: h, stage: getStageInfo(h) });
    }
    return rows;
  }, []);

  return (
    <div className="space-y-5">
      {/* Input card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            猫の年齢を選んでください
          </label>
          <div className="flex items-center gap-3">
            <select
              value={catAge}
              onChange={(e) => setCatAge(parseFloat(e.target.value))}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              {AGE_OPTIONS.map((age) => (
                <option key={age} value={age}>
                  {formatAge(age)}
                </option>
              ))}
            </select>
            <span className="text-2xl">🐱</span>
          </div>
        </div>

        {/* Result */}
        <div className={`rounded-xl border px-5 py-4 ${stageInfo.bg} ${stageInfo.border}`}>
          <p className="text-xs text-gray-500 mb-1">人間換算年齢</p>
          <div className="flex items-end gap-3">
            <p className={`text-4xl font-bold ${stageInfo.color}`}>
              {Math.round(humanAge)}歳
            </p>
            <span
              className={`mb-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${stageInfo.color} ${stageInfo.bg} border ${stageInfo.border}`}
            >
              {stageInfo.stage}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            猫の{formatAge(catAge)} ≈ 人間の{Math.round(humanAge)}歳
          </p>
        </div>

        {/* Health tips */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {stageInfo.stage}のケアポイント
          </p>
          <ul className="space-y-1.5">
            {stageInfo.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className={`mt-0.5 shrink-0 font-bold ${stageInfo.color}`}>✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Age table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">年齢換算表（1〜20歳）</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 pr-4 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                  猫の年齢
                </th>
                <th className="py-2 pr-4 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
                  人間換算
                </th>
                <th className="py-2 text-left text-xs font-medium text-gray-500">
                  ライフステージ
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr
                  key={row.cat}
                  className={`border-b border-gray-100 transition-colors ${
                    catAge === row.cat ? `${row.stage.bg}` : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-2 pr-4 font-medium text-gray-800">{row.cat}歳</td>
                  <td className="py-2 pr-4 font-bold text-gray-900">{row.human}歳</td>
                  <td className="py-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${row.stage.color} ${row.stage.bg} border ${row.stage.border}`}
                    >
                      {row.stage.stage}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formula note */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600">換算式（獣医学ベース）</p>
          <p>1歳 = 人間の15歳 / 2歳 = 24歳 / 3歳以降 +4歳/年</p>
          <p className="text-gray-400">
            ※ 個体差・品種・生活環境により異なります。あくまで目安としてご利用ください。
          </p>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この猫の年齢 人間換算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">最新研究ベースの換算式で算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この猫の年齢 人間換算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "最新研究ベースの換算式で算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
