"use client";
import { useState } from "react";

const JUNISHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const JUNISHI_READING = ["ね", "うし", "とら", "う", "たつ", "み", "うま", "ひつじ", "さる", "とり", "いぬ", "い"];
const JUNISHI_ANIMAL = ["ネズミ", "ウシ", "トラ", "ウサギ", "ドラゴン", "ヘビ", "ウマ", "ヒツジ", "サル", "トリ", "イヌ", "イノシシ"];
const JUNISHI_EMOJI = ["🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑", "🐵", "🐔", "🐶", "🐗"];
const JUNISHI_TRAIT = [
  "機転が利き、要領よく行動する。金運に恵まれる。",
  "誠実で忍耐強い。粘り強く物事を成し遂げる。",
  "勇猛果敢でリーダーシップがある。情熱的。",
  "温和で穏やか。芸術的センスがある。",
  "カリスマ性があり、成功を引き寄せる。",
  "知恵があり、直感力に優れる。",
  "行動力があり、自由を愛する。",
  "優しく温かい。人との絆を大切にする。",
  "好奇心旺盛で社交的。機敏に動く。",
  "几帳面で勤勉。美的センスがある。",
  "忠実で正義感が強い。信頼される存在。",
  "勇敢で独立心が強い。裏表がない。",
];

const JIKKAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const JIKKAN_READING = ["こう", "おつ", "へい", "てい", "ぼ", "き", "こう", "しん", "じん", "き"];
const GOGYO = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
const INYO = ["陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰", "陽", "陰"];

function getEto(year: number) {
  const junishiIndex = (year - 4) % 12;
  const jikkanIndex = (year - 4) % 10;
  return {
    junishi: JUNISHI[junishiIndex],
    junishiReading: JUNISHI_READING[junishiIndex],
    junishiAnimal: JUNISHI_ANIMAL[junishiIndex],
    junishiEmoji: JUNISHI_EMOJI[junishiIndex],
    junishiTrait: JUNISHI_TRAIT[junishiIndex],
    jikkan: JIKKAN[jikkanIndex],
    jikkanReading: JIKKAN_READING[jikkanIndex],
    gogyo: GOGYO[jikkanIndex],
    inyo: INYO[jikkanIndex],
    kanshi: JIKKAN[jikkanIndex] + JUNISHI[junishiIndex],
    cycleYear: ((year - 4) % 60) + 1,
  };
}

export default function EtoHantei() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const parsed = parseInt(year, 10);
  const valid = !isNaN(parsed) && parsed >= 1 && parsed <= 9999;
  const eto = valid ? getEto(parsed) : null;

  // 今後5年のeto
  const upcomingYears = Array.from({ length: 5 }, (_, i) => currentYear + i).map((y) => ({
    year: y,
    ...getEto(y),
  }));

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">生まれ年（西暦）を入力</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1}
            max={9999}
            className="border border-gray-300 rounded-lg px-4 py-2 w-36 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <span className="text-gray-600">年</span>
        </div>
      </div>

      {/* 結果 */}
      {eto && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="text-7xl">{eto.junishiEmoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <span className="text-4xl font-bold text-gray-900">{eto.junishi}</span>
                <span className="text-xl text-gray-500">（{eto.junishiReading}・{eto.junishiAnimal}）</span>
              </div>
              <div className="flex items-baseline gap-3 flex-wrap mb-4">
                <span className="text-2xl font-semibold text-gray-800">{eto.kanshi}</span>
                <span className="text-gray-500">（{eto.jikkanReading}＋{eto.junishiReading}）</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">十干</div>
                  <div className="text-xl font-bold text-gray-800">{eto.jikkan}</div>
                  <div className="text-xs text-gray-500">{eto.jikkanReading}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">五行</div>
                  <div className="text-xl font-bold text-gray-800">{eto.gogyo}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">陰陽</div>
                  <div className="text-xl font-bold text-gray-800">{eto.inyo}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">六十干支</div>
                  <div className="text-xl font-bold text-gray-800">{eto.cycleYear}番目</div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-amber-800">{eto.junishi}年生まれの特徴：</span>{eto.junishiTrait}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 十二支一覧 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">十二支 一覧</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {JUNISHI.map((j, i) => {
            const isSelected = eto?.junishi === j;
            return (
              <div
                key={j}
                className={`rounded-xl p-3 text-center border-2 transition-colors ${
                  isSelected
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="text-2xl mb-1">{JUNISHI_EMOJI[i]}</div>
                <div className="font-bold text-gray-900">{j}</div>
                <div className="text-xs text-gray-500">{JUNISHI_READING[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 今後5年 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">今後5年の干支</h2>
        <div className="space-y-2">
          {upcomingYears.map((y) => (
            <div key={y.year} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500 w-12 text-sm">{y.year}年</span>
              <span className="text-xl">{y.junishiEmoji}</span>
              <span className="font-semibold text-gray-800">{y.kanshi}</span>
              <span className="text-sm text-gray-500">（{y.junishi}・{y.junishiAnimal}）</span>
              {y.year === currentYear && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">今年</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        ※ 干支は旧暦の立春（2月3〜4日頃）で切り替わる場合があります。1月生まれの方は前年干支の場合も。
      </div>
    </div>
  );
}
