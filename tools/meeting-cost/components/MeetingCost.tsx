"use client";

import { useState, useMemo, useCallback } from "react";

// --- 定数 ---
const WORK_HOURS_PER_YEAR = 2080; // 年間労働時間（52週×40h）
const LUNCH_PRICE = 1000; // ランチ換算基準額（円）

// --- 役職プリセット ---
const ROLE_PRESETS = [
  { role: "経営者", defaultSalary: 12000000, color: "#ef4444" },
  { role: "部長", defaultSalary: 9000000, color: "#f97316" },
  { role: "課長", defaultSalary: 7000000, color: "#eab308" },
  { role: "一般社員", defaultSalary: 5000000, color: "#22c55e" },
  { role: "外部", defaultSalary: 8000000, color: "#8b5cf6" },
] as const;

// --- 開催頻度 ---
const FREQUENCY_OPTIONS = [
  { label: "週1回", value: "weekly", timesPerYear: 52, timesPerMonth: 4.33 },
  { label: "週2回", value: "twice_weekly", timesPerYear: 104, timesPerMonth: 8.67 },
  { label: "月1回", value: "monthly", timesPerYear: 12, timesPerMonth: 1 },
  { label: "月2回", value: "bimonthly", timesPerYear: 24, timesPerMonth: 2 },
  { label: "毎日", value: "daily", timesPerYear: 250, timesPerMonth: 20.8 },
  { label: "隔週", value: "biweekly", timesPerYear: 26, timesPerMonth: 2.17 },
] as const;

type FrequencyValue = typeof FREQUENCY_OPTIONS[number]["value"];

// --- 型定義 ---
interface Participant {
  id: string;
  role: string;
  annualSalary: number;
  count: number;
  color: string;
}

// --- ユーティリティ ---
function fmtJPY(n: number): string {
  if (n >= 10000) {
    const man = n / 10000;
    if (man >= 1 && Number.isInteger(Math.round(man * 10) / 10)) {
      return `¥${Math.round(man).toLocaleString("ja-JP")}万`;
    }
    return `¥${Math.round(man * 10) / 10}万`;
  }
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function fmtJPYFull(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function calcHourlyRate(annualSalary: number): number {
  return annualSalary / WORK_HOURS_PER_YEAR;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// --- サブコンポーネント ---
interface ParticipantRowProps {
  participant: Participant;
  onUpdate: (id: string, field: keyof Participant, value: string | number) => void;
  onRemove: (id: string) => void;
  costPerMinute: number;
}

function ParticipantRow({ participant, onUpdate, onRemove, costPerMinute }: ParticipantRowProps) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: participant.color }}
      />
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={participant.role}
          onChange={(e) => onUpdate(participant.id, "role", e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-white focus:outline-none placeholder:text-slate-500"
          placeholder="役職名"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-slate-500 text-xs">年収</span>
        <input
          type="text"
          inputMode="numeric"
          value={participant.annualSalary === 0 ? "" : (participant.annualSalary / 10000).toString()}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d]/g, "");
            onUpdate(participant.id, "annualSalary", v ? parseInt(v) * 10000 : 0);
          }}
          className="w-16 bg-slate-700 text-right text-sm font-semibold text-white px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="500"
        />
        <span className="text-slate-500 text-xs">万</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdate(participant.id, "count", Math.max(1, participant.count - 1))}
          className="w-6 h-6 rounded-full bg-slate-700 text-white text-sm font-bold flex items-center justify-center hover:bg-slate-600 transition-colors"
        >
          -
        </button>
        <span className="w-5 text-center text-sm font-bold text-white">{participant.count}</span>
        <button
          onClick={() => onUpdate(participant.id, "count", participant.count + 1)}
          className="w-6 h-6 rounded-full bg-slate-700 text-white text-sm font-bold flex items-center justify-center hover:bg-slate-600 transition-colors"
        >
          +
        </button>
        <span className="text-slate-500 text-xs">名</span>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs text-red-400 font-semibold">
          {fmtJPY(costPerMinute * participant.count)}/分
        </div>
      </div>
      <button
        onClick={() => onRemove(participant.id)}
        className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
      >
        ×
      </button>
    </div>
  );
}

// --- メインコンポーネント ---
export default function MeetingCost() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: uid(), role: "部長", annualSalary: 9000000, count: 1, color: "#f97316" },
    { id: uid(), role: "課長", annualSalary: 7000000, count: 2, color: "#eab308" },
    { id: uid(), role: "一般社員", annualSalary: 5000000, count: 5, color: "#22c55e" },
  ]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [frequency, setFrequency] = useState<FrequencyValue>("weekly");
  const [showTips, setShowTips] = useState(false);

  // 参加者操作
  const addParticipant = useCallback((preset: typeof ROLE_PRESETS[number]) => {
    setParticipants((prev) => [
      ...prev,
      { id: uid(), role: preset.role, annualSalary: preset.defaultSalary, count: 1, color: preset.color },
    ]);
  }, []);

  const updateParticipant = useCallback((id: string, field: keyof Participant, value: string | number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // コスト計算
  const calc = useMemo(() => {
    const totalPeople = participants.reduce((s, p) => s + p.count, 0);

    // 参加者別: 時給 × 人数 × 時間（分換算）
    const participantCosts = participants.map((p) => {
      const hourlyRate = calcHourlyRate(p.annualSalary);
      const costPerMinute = hourlyRate / 60;
      const totalCost = costPerMinute * p.count * durationMinutes;
      return { ...p, hourlyRate, costPerMinute, totalCost };
    });

    const onceCost = participantCosts.reduce((s, p) => s + p.totalCost, 0);

    const freqOption = FREQUENCY_OPTIONS.find((f) => f.value === frequency)!;
    const monthlyCost = onceCost * freqOption.timesPerMonth;
    const annualCost = onceCost * freqOption.timesPerYear;

    // 30分削減した場合の節約額
    const saving30min = participants.reduce((s, p) => {
      const costPerMinute = calcHourlyRate(p.annualSalary) / 60;
      return s + costPerMinute * p.count * 30;
    }, 0);

    // ランチ何回分
    const lunchCount = Math.round(onceCost / LUNCH_PRICE);

    // 参加者ソート（コスト降順）
    const sortedByContrib = [...participantCosts].sort((a, b) => b.totalCost - a.totalCost);

    return {
      totalPeople,
      onceCost,
      monthlyCost,
      annualCost,
      saving30min,
      lunchCount,
      participantCosts,
      sortedByContrib,
      freqOption,
    };
  }, [participants, durationMinutes, frequency]);

  // Xシェアテキスト
  const shareText = useMemo(() => {
    const freq = FREQUENCY_OPTIONS.find((f) => f.value === frequency)!;
    return encodeURIComponent(
      `うちの会議、1回で${fmtJPYFull(Math.round(calc.onceCost))}かかってた...\n` +
      `${calc.totalPeople}人 × ${durationMinutes}分 × ${freq.label}\n` +
      `年間コスト: ${fmtJPYFull(Math.round(calc.annualCost))}\n\n` +
      `会議コスト計算機で計算 #会議コスト #無駄な会議`
    );
  }, [calc, durationMinutes, frequency]);

  const maxBarCost = calc.sortedByContrib[0]?.totalCost ?? 1;

  return (
    <div className="space-y-5">

      {/* 参加者設定 */}
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-base font-semibold text-white mb-4">参加者設定</h2>

        <div className="space-y-2 mb-4">
          {participants.map((p) => {
            const hourlyRate = calcHourlyRate(p.annualSalary);
            const costPerMinute = hourlyRate / 60;
            return (
              <ParticipantRow
                key={p.id}
                participant={p}
                onUpdate={updateParticipant}
                onRemove={removeParticipant}
                costPerMinute={costPerMinute}
              />
            );
          })}
        </div>

        {/* プリセット追加ボタン */}
        <div className="flex flex-wrap gap-2">
          {ROLE_PRESETS.map((preset) => (
            <button
              key={preset.role}
              onClick={() => addParticipant(preset)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
              + {preset.role}
            </button>
          ))}
        </div>
      </div>

      {/* 会議設定 */}
      <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-base font-semibold text-white mb-4">会議設定</h2>

        {/* 時間スライダー */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-300">会議時間</label>
            <span className="text-2xl font-bold text-white">{durationMinutes}<span className="text-sm font-normal text-slate-400 ml-1">分</span></span>
          </div>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((durationMinutes - 5) / 175) * 100}%, #334155 ${((durationMinutes - 5) / 175) * 100}%, #334155 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>5分</span>
            <span>30分</span>
            <span>60分</span>
            <span>90分</span>
            <span>120分</span>
            <span>180分</span>
          </div>
        </div>

        {/* 開催頻度 */}
        <div>
          <label className="text-sm text-slate-300 block mb-2">開催頻度</label>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFrequency(opt.value)}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  frequency === opt.value
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/50"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコスト表示 */}
      {calc.onceCost > 0 && (
        <>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-red-900/50 p-6 text-center shadow-2xl shadow-red-900/20">
            <div className="text-slate-400 text-sm mb-1">この会議1回のコスト</div>
            <div className="text-6xl font-black text-red-500 mb-1 tracking-tight">
              {fmtJPYFull(Math.round(calc.onceCost))}
            </div>
            <div className="text-slate-500 text-sm mb-4">
              {calc.totalPeople}人 × {durationMinutes}分
            </div>

            {/* 換算 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700">
              <span className="text-slate-400 text-xs">ランチ</span>
              <span className="text-white font-bold text-sm">{calc.lunchCount.toLocaleString("ja-JP")}回分</span>
              <span className="text-slate-500 text-xs">（¥{LUNCH_PRICE.toLocaleString("ja-JP")}/回換算）</span>
            </div>

            {/* 月間・年間 */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="text-slate-500 text-xs mb-1">月間コスト</div>
                <div className="text-red-400 font-bold text-xl">{fmtJPY(Math.round(calc.monthlyCost))}</div>
                <div className="text-slate-600 text-xs mt-0.5">{calc.freqOption.label}換算</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="text-slate-500 text-xs mb-1">年間コスト</div>
                <div className="text-red-400 font-bold text-xl">{fmtJPY(Math.round(calc.annualCost))}</div>
                <div className="text-slate-600 text-xs mt-0.5">{calc.freqOption.label}換算</div>
              </div>
            </div>
          </div>

          {/* 参加者別コスト内訳 */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
            <h2 className="text-base font-semibold text-white mb-4">参加者別コスト内訳</h2>
            <div className="space-y-3">
              {calc.sortedByContrib.map((p) => {
                const barWidth = (p.totalCost / maxBarCost) * 100;
                const percentage = (p.totalCost / calc.onceCost) * 100;
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-sm text-slate-300">{p.role}</span>
                        <span className="text-xs text-slate-600">×{p.count}名</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">{fmtJPYFull(Math.round(p.totalCost))}</span>
                        <span className="text-xs text-slate-500 ml-1.5">{Math.round(percentage)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      時給 {fmtJPYFull(Math.round(p.hourlyRate))} × {p.count}名 × {durationMinutes}分
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この会議コスト計算機ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">会議1回あたりのコストを参加者の年収・人数・時間から計算。無駄な会議の可視化に。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この会議コスト計算機ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "会議1回あたりのコストを参加者の年収・人数・時間から計算。無駄な会議の可視化に。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
          </div>

          {/* 30分短縮節約額 */}
          <div className="bg-slate-900 rounded-2xl border border-emerald-900/50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-white mb-1">もし30分短くできたら</h2>
                <p className="text-slate-500 text-xs">アジェンダ事前共有・時間制限設定で実現可能</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400">{fmtJPYFull(Math.round(calc.saving30min))}</div>
                <div className="text-xs text-slate-500">1回あたりの節約</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                <div className="text-xs text-slate-500 mb-1">月間節約額</div>
                <div className="text-emerald-400 font-bold">{fmtJPY(Math.round(calc.saving30min * calc.freqOption.timesPerMonth))}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                <div className="text-xs text-slate-500 mb-1">年間節約額</div>
                <div className="text-emerald-400 font-bold">{fmtJPY(Math.round(calc.saving30min * calc.freqOption.timesPerYear))}</div>
              </div>
            </div>
          </div>

          {/* 会議コスト削減Tips */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-base font-semibold text-white">会議コスト削減のTips</h2>
              <span className="text-slate-500 text-lg">{showTips ? "▲" : "▼"}</span>
            </button>

            {showTips && (
              <div className="mt-4 space-y-3">
                {[
                  {
                    title: "アジェンダを事前共有する",
                    desc: "会議24時間前までにアジェンダを共有。議論のズレを防ぎ、脱線を最小化。平均15〜20%の時間削減が期待できる。",
                    tag: "即効性あり",
                    tagColor: "bg-emerald-900 text-emerald-400",
                  },
                  {
                    title: "タイムボックスを設定する",
                    desc: "各アジェンダ項目に制限時間を設ける。パーキンソンの法則（仕事は与えられた時間を使い切る）を防ぐ。",
                    tag: "構造改革",
                    tagColor: "bg-blue-900 text-blue-400",
                  },
                  {
                    title: "本当に必要な人だけ呼ぶ",
                    desc: "参加者1名減らすだけでコストが大きく下がる。情報共有目的ならSlackや議事録で十分な場合が多い。",
                    tag: "コスト直結",
                    tagColor: "bg-red-900 text-red-400",
                  },
                  {
                    title: "非同期ファーストを試す",
                    desc: "報告・連絡・相談の会議はSlack/Notionでの非同期対応に切り替え。意思決定会議のみリアルタイムに絞る。",
                    tag: "抜本的改善",
                    tagColor: "bg-purple-900 text-purple-400",
                  },
                  {
                    title: "スタンドアップ形式を導入する",
                    desc: "立ったまま行う15分以内のデイリー形式。ダラダラを防ぐ物理的な仕組み。スクラムで実証済み。",
                    tag: "カルチャー変革",
                    tagColor: "bg-yellow-900 text-yellow-400",
                  },
                ].map((tip) => (
                  <div key={tip.title} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-white">{tip.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tip.tagColor}`}>{tip.tag}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Xシェア */}
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
            <h2 className="text-base font-semibold text-white mb-3">Xでシェアする</h2>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-3 text-sm text-slate-300 leading-relaxed">
              うちの会議、1回で{fmtJPYFull(Math.round(calc.onceCost))}かかってた...<br />
              {calc.totalPeople}人 × {durationMinutes}分 × {FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label}<br />
              年間コスト: {fmtJPYFull(Math.round(calc.annualCost))}
            </div>
            <a
              href={`https://x.com/intent/tweet?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-black text-white font-semibold text-sm hover:bg-slate-800 transition-colors border border-slate-600"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Xでシェア
            </a>
          </div>
        </>
      )}

      {/* 計算なし状態 */}
      {calc.onceCost === 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-8 text-center">
          <p className="text-slate-500 text-sm">参加者を追加すると会議コストが表示されます</p>
        </div>
      )}

      {/* 注記 */}
      <div className="text-xs text-slate-600 px-1 pb-4">
        ※ 年間労働時間2,080時間（52週×40時間）で時給換算。実際のコストは社会保険料・福利厚生等を含めると1.3〜1.5倍程度になります。
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "会議コスト計算機",
  "description": "会議1回あたりのコストを参加者の年収・人数・時間から計算。無駄な会議の可視化に",
  "url": "https://tools.loresync.dev/meeting-cost",
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
