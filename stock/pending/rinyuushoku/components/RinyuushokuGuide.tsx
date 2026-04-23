"use client";
import { useState } from "react";

interface FoodItem {
  name: string;
  ok: boolean;
  note?: string;
}

interface Stage {
  name: string;
  months: string;
  texture: string;
  frequency: string;
  amount: string;
  color: string;
  bgColor: string;
  borderColor: string;
  foods: FoodItem[];
  ngFoods: string[];
}

const STAGES: Stage[] = [
  {
    name: "初期",
    months: "5〜6ヶ月",
    texture: "なめらかなペースト状（ヨーグルト程度）",
    frequency: "1日1回",
    amount: "少量から（小さじ1杯程度）",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    foods: [
      { name: "10倍がゆ", ok: true, note: "まず最初に" },
      { name: "にんじん（ペースト）", ok: true },
      { name: "かぼちゃ（ペースト）", ok: true },
      { name: "じゃがいも（ペースト）", ok: true },
      { name: "さつまいも（ペースト）", ok: true },
      { name: "豆腐（すりつぶし）", ok: true, note: "タンパク質" },
      { name: "白身魚（ペースト）", ok: true, note: "鯛・かれいなど" },
      { name: "ほうれん草（ペースト）", ok: true },
    ],
    ngFoods: ["蜂蜜（ボツリヌス菌）", "生卵", "刺身", "アレルゲン食材（少量から慎重に）", "塩・醤油・砂糖などの調味料"],
  },
  {
    name: "中期",
    months: "7〜8ヶ月",
    texture: "舌でつぶせる固さ（豆腐・絹ごし程度）",
    frequency: "1日2回",
    amount: "全体量50〜80g程度",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    foods: [
      { name: "7倍がゆ", ok: true },
      { name: "うどん（やわらかく）", ok: true },
      { name: "食パン（すりつぶし）", ok: true },
      { name: "鶏ひき肉", ok: true, note: "脂肪少なめ" },
      { name: "卵黄", ok: true, note: "アレルギー注意" },
      { name: "ヨーグルト（無糖）", ok: true },
      { name: "しらす", ok: true, note: "塩抜きを" },
      { name: "ブロッコリー（みじん切り）", ok: true },
      { name: "バナナ（すりつぶし）", ok: true },
    ],
    ngFoods: ["蜂蜜", "生魚介類", "刺激の強い食品", "丸い形状のもの（喉詰まり）"],
  },
  {
    name: "後期",
    months: "9〜11ヶ月",
    texture: "歯茎でつぶせる固さ（バナナ程度）",
    frequency: "1日3回",
    amount: "全体量90〜120g程度",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    foods: [
      { name: "軟飯", ok: true },
      { name: "パン（柔らかく）", ok: true },
      { name: "鶏むね肉（細かく）", ok: true },
      { name: "魚（骨なし）", ok: true },
      { name: "全卵", ok: true, note: "加熱をしっかり" },
      { name: "チーズ", ok: true, note: "塩分に注意" },
      { name: "大豆（やわらかく）", ok: true },
      { name: "ごぼう（細かく）", ok: true },
      { name: "きのこ（細かく）", ok: true },
    ],
    ngFoods: ["蜂蜜", "生卵・刺身", "硬い食材（ナッツ類）", "丸ごとのぶどう・ミニトマト"],
  },
  {
    name: "完了期",
    months: "12〜18ヶ月",
    texture: "歯茎で噛める固さ（肉団子程度）",
    frequency: "1日3回＋おやつ",
    amount: "大人の1/3〜1/2量",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    foods: [
      { name: "軟飯〜普通のご飯", ok: true },
      { name: "ほぼ全ての野菜", ok: true },
      { name: "肉類（薄切り・細かく）", ok: true },
      { name: "魚全般", ok: true, note: "骨なし" },
      { name: "乳製品", ok: true },
      { name: "大豆製品", ok: true },
      { name: "卵（しっかり加熱）", ok: true },
      { name: "小麦・パン・パスタ", ok: true },
    ],
    ngFoods: ["蜂蜜（1歳以降はOK）", "丸ごとのぶどう・ミニトマト", "生魚介", "硬いナッツ", "辛味・刺激物", "カフェイン"],
  },
];

const ALLERGENS = [
  { name: "卵", emoji: "🥚", risk: "高" },
  { name: "乳", emoji: "🥛", risk: "高" },
  { name: "小麦", emoji: "🌾", risk: "高" },
  { name: "そば", emoji: "🍜", risk: "高" },
  { name: "落花生", emoji: "🥜", risk: "高" },
  { name: "えび", emoji: "🦐", risk: "中" },
  { name: "かに", emoji: "🦀", risk: "中" },
  { name: "くるみ", emoji: "🌰", risk: "中" },
];

export default function RinyuushokuGuide() {
  const [months, setMonths] = useState<string>("6");
  const [showAllergens, setShowAllergens] = useState(false);

  const m = parseInt(months) || 0;

  const getStageIndex = (month: number) => {
    if (month < 5) return -1;
    if (month <= 6) return 0;
    if (month <= 8) return 1;
    if (month <= 11) return 2;
    return 3;
  };

  const stageIdx = getStageIndex(m);
  const stage = stageIdx >= 0 ? STAGES[stageIdx] : null;

  return (
    <div className="space-y-6">
      {/* Month Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          赤ちゃんの月齢
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="24"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="flex-1 accent-pink-500"
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
              min="1"
              max="36"
            />
            <span className="text-gray-600 text-sm">ヶ月</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-4 flex rounded-lg overflow-hidden border border-gray-200 text-xs">
          {[
            { label: "〜4ヶ月\n母乳/ミルク", color: "bg-gray-100" },
            { label: "5-6ヶ月\n初期", color: "bg-yellow-100" },
            { label: "7-8ヶ月\n中期", color: "bg-green-100" },
            { label: "9-11ヶ月\n後期", color: "bg-blue-100" },
            { label: "12〜\n完了期", color: "bg-purple-100" },
          ].map((t, idx) => (
            <div
              key={idx}
              className={`flex-1 py-2 px-1 text-center text-gray-600 ${t.color} ${
                (idx === 0 && m < 5) ||
                (idx === 1 && m >= 5 && m <= 6) ||
                (idx === 2 && m >= 7 && m <= 8) ||
                (idx === 3 && m >= 9 && m <= 11) ||
                (idx === 4 && m >= 12)
                  ? "ring-2 ring-inset ring-pink-400"
                  : ""
              }`}
            >
              {t.label.split("\n").map((line, i) => (
                <p key={i} className={i === 0 ? "font-medium" : "text-gray-400"}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stage Info */}
      {m < 5 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center text-gray-500">
          <p className="text-4xl mb-2">🍼</p>
          <p className="font-medium">まだ離乳食の開始時期ではありません</p>
          <p className="text-sm mt-1">生後5〜6ヶ月頃から開始を検討しましょう。かかりつけの小児科医にご相談ください。</p>
        </div>
      ) : stage ? (
        <div className={`rounded-xl border p-5 ${stage.bgColor} ${stage.borderColor}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">
              {stageIdx === 0 ? "🌱" : stageIdx === 1 ? "🌿" : stageIdx === 2 ? "🌳" : "🎉"}
            </span>
            <div>
              <h2 className={`text-lg font-bold ${stage.color}`}>
                離乳食 {stage.name}（{stage.months}）
              </h2>
              <p className="text-sm text-gray-600">{months}ヶ月の赤ちゃんに合わせた内容</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border border-white/80">
              <p className="text-xs text-gray-500 mb-1">食感・固さ</p>
              <p className="text-sm font-medium text-gray-800">{stage.texture}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-white/80">
              <p className="text-xs text-gray-500 mb-1">授乳・食事回数</p>
              <p className="text-sm font-medium text-gray-800">{stage.frequency}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-white/80">
              <p className="text-xs text-gray-500 mb-1">1回の目安量</p>
              <p className="text-sm font-medium text-gray-800">{stage.amount}</p>
            </div>
          </div>

          {/* OK Foods */}
          <div className="mb-4">
            <h3 className={`text-sm font-semibold ${stage.color} mb-2`}>食べられる食材の例</h3>
            <div className="flex flex-wrap gap-2">
              {stage.foods.map((f, idx) => (
                <span
                  key={idx}
                  className="bg-white text-gray-700 text-xs px-2.5 py-1 rounded-full border border-white/80 flex items-center gap-1"
                  title={f.note}
                >
                  <span className="text-green-500">✓</span>
                  {f.name}
                  {f.note && <span className="text-gray-400">({f.note})</span>}
                </span>
              ))}
            </div>
          </div>

          {/* NG Foods */}
          <div>
            <h3 className="text-sm font-semibold text-red-700 mb-2">注意・NG食材</h3>
            <div className="flex flex-wrap gap-2">
              {stage.ngFoods.map((f, idx) => (
                <span
                  key={idx}
                  className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1"
                >
                  <span>✗</span>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Stage Overview */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">全ステージ一覧</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STAGES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                const monthMap = [5, 7, 9, 12];
                setMonths(String(monthMap[idx]));
              }}
              className={`text-left p-4 rounded-xl border transition-all ${s.bgColor} ${s.borderColor} hover:shadow-sm`}
            >
              <p className={`font-semibold ${s.color}`}>{s.name}（{s.months}）</p>
              <p className="text-xs text-gray-600 mt-1">{s.texture}</p>
              <p className="text-xs text-gray-500 mt-1">{s.frequency} / {s.amount}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Allergen Info */}
      <div>
        <button
          onClick={() => setShowAllergens(!showAllergens)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-pink-600 transition-colors"
        >
          <span>{showAllergens ? "▼" : "▶"}</span>
          主要アレルゲン一覧
        </button>
        {showAllergens && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {ALLERGENS.map((a, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-center ${
                  a.risk === "高" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
                }`}
              >
                <p className="text-2xl">{a.emoji}</p>
                <p className="text-xs font-medium text-gray-700 mt-1">{a.name}</p>
                <p className={`text-xs mt-0.5 ${a.risk === "高" ? "text-red-600" : "text-orange-600"}`}>
                  リスク{a.risk}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-xs text-pink-800">
        本ツールは厚生労働省「授乳・離乳の支援ガイド」を参考にした一般的なガイドです。個人差があるため、お子様の状態に合わせてかかりつけ小児科医にご相談ください。
      </div>
    </div>
  );
}
