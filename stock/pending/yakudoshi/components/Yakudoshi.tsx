"use client";

import { useState } from "react";

// 厄年の数え年（男女別）
const YAKUDOSHI_MEN = [25, 42, 61] as const;
const YAKUDOSHI_WOMEN = [19, 33, 37, 61] as const;
const DAIYAKU_MEN = 42;
const DAIYAKU_WOMEN = 33;

type Gender = "男" | "女";

interface YakuEntry {
  kazoedoshi: number; // 数え年
  year: number;       // 西暦
  type: "前厄" | "本厄" | "後厄";
  isDaiyaku: boolean;
}

function getKazoedoshi(birthDate: Date, targetYear: number): number {
  // 数え年 = 生まれた年を1歳として、元旦に1歳加算
  return targetYear - birthDate.getFullYear() + 1;
}

function getBirthYear(birthDate: Date): number {
  return birthDate.getFullYear();
}

function computeYakuList(birthDate: Date, gender: Gender): YakuEntry[] {
  const honYakuAges = gender === "男" ? [...YAKUDOSHI_MEN] : [...YAKUDOSHI_WOMEN];
  const daiyaku = gender === "男" ? DAIYAKU_MEN : DAIYAKU_WOMEN;
  const birthYear = getBirthYear(birthDate);

  const entries: YakuEntry[] = [];

  for (const age of honYakuAges) {
    // 本厄の年: 数え年がageになる年 = birthYear + age - 1
    const honYear = birthYear + age - 1;
    const isDaiyaku = age === daiyaku;

    entries.push({
      kazoedoshi: age - 1,
      year: honYear - 1,
      type: "前厄",
      isDaiyaku: false,
    });
    entries.push({
      kazoedoshi: age,
      year: honYear,
      type: "本厄",
      isDaiyaku,
    });
    entries.push({
      kazoedoshi: age + 1,
      year: honYear + 1,
      type: "後厄",
      isDaiyaku: false,
    });
  }

  // 年でソート
  entries.sort((a, b) => a.year - b.year);
  return entries;
}

function getCurrentStatus(
  entries: YakuEntry[],
  currentYear: number
): YakuEntry | null {
  return entries.find((e) => e.year === currentYear) ?? null;
}

function getNextYaku(
  entries: YakuEntry[],
  currentYear: number
): YakuEntry | null {
  return entries.find((e) => e.year > currentYear) ?? null;
}

const TYPE_COLORS: Record<YakuEntry["type"], string> = {
  前厄: "bg-yellow-100 text-yellow-800 border-yellow-300",
  本厄: "bg-red-100 text-red-800 border-red-300",
  後厄: "bg-orange-100 text-orange-800 border-orange-300",
};

const TYPE_BADGE: Record<YakuEntry["type"], string> = {
  前厄: "bg-yellow-500",
  本厄: "bg-red-500",
  後厄: "bg-orange-500",
};

export default function Yakudoshi() {
  const today = new Date();
  const [birthDateStr, setBirthDateStr] = useState("1990-01-01");
  const [gender, setGender] = useState<Gender>("男");

  const birthDate = new Date(birthDateStr);
  const isValidDate = !isNaN(birthDate.getTime());

  const currentYear = today.getFullYear();
  const currentKazoedoshi = isValidDate
    ? getKazoedoshi(birthDate, currentYear)
    : null;

  const entries = isValidDate ? computeYakuList(birthDate, gender) : [];
  const currentStatus = isValidDate
    ? getCurrentStatus(entries, currentYear)
    : null;
  const nextYaku = isValidDate ? getNextYaku(entries, currentYear) : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h1 className="text-lg font-bold text-gray-900 mb-1">厄年判定ツール</h1>
        <p className="text-sm text-muted">
          生年月日と性別を入力すると、厄年（前厄・本厄・後厄）を数え年で判定します。
        </p>
      </div>

      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生年月日
            </label>
            <input
              type="date"
              value={birthDateStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
              max={today.toISOString().split("T")[0]}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <div className="flex gap-2">
              {(["男", "女"] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    gender === g
                      ? "bg-accent text-white border-accent"
                      : "bg-white text-gray-700 border-border hover:bg-gray-50"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {isValidDate && currentKazoedoshi !== null && (
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">現在の状態</h2>
            <span className="text-sm text-muted">
              {currentYear}年 / 数え年{currentKazoedoshi}歳
            </span>
          </div>

          {currentStatus ? (
            <div
              className={`rounded-xl border p-4 ${TYPE_COLORS[currentStatus.type]}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {currentStatus.type === "本厄" ? "⚠️" : "🔔"}
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {currentStatus.type}
                    {currentStatus.isDaiyaku && (
                      <span className="ml-2 text-sm font-semibold bg-red-600 text-white px-2 py-0.5 rounded-full">
                        大厄
                      </span>
                    )}
                  </div>
                  <div className="text-sm mt-0.5">
                    今年（{currentYear}年）は厄年にあたります
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-green-300 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <div className="font-bold text-lg text-green-800">
                    厄年ではありません
                  </div>
                  {nextYaku && (
                    <div className="text-sm text-green-700 mt-0.5">
                      次の厄年まであと{nextYaku.year - currentYear}年（
                      {nextYaku.year}年・{nextYaku.type}）
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {isValidDate && entries.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            厄年タイムライン
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-3">
              {entries.map((entry, i) => {
                const isPast = entry.year < currentYear;
                const isCurrent = entry.year === currentYear;
                return (
                  <div key={i} className="flex items-center gap-3">
                    {/* Year label */}
                    <div
                      className={`w-20 text-right text-sm font-mono shrink-0 ${
                        isPast
                          ? "text-muted"
                          : isCurrent
                          ? "text-accent font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      {entry.year}年
                    </div>

                    {/* Dot */}
                    <div className="relative flex items-center justify-center w-4 shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full border-2 border-white ${
                          isPast
                            ? "bg-gray-300"
                            : TYPE_BADGE[entry.type]
                        } ${isCurrent ? "ring-2 ring-offset-1 ring-accent" : ""}`}
                      />
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm border ${
                        isCurrent
                          ? TYPE_COLORS[entry.type]
                          : isPast
                          ? "bg-gray-50 border-gray-200 text-muted"
                          : "bg-white border-border text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{entry.type}</span>
                      <span className="text-xs">数え年{entry.kazoedoshi}歳</span>
                      {entry.isDaiyaku && (
                        <span className="ml-auto text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                          大厄
                        </span>
                      )}
                      {isCurrent && !entry.isDaiyaku && (
                        <span className="ml-auto text-xs font-semibold text-accent">
                          今年
                        </span>
                      )}
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この厄年 判定ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">生年月日から本厄・前厄・後厄を男女別に判定。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この厄年 判定ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "生年月日から本厄・前厄・後厄を男女別に判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">厄年について</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-700 mb-1">男性の厄年（数え年）</div>
            <div className="space-y-1 text-muted">
              <div>25歳・前厄/本厄/後厄</div>
              <div className="flex items-center gap-1">
                42歳・前厄/本厄/後厄
                <span className="text-xs bg-red-100 text-red-700 px-1 rounded">大厄</span>
              </div>
              <div>61歳・前厄/本厄/後厄</div>
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-1">女性の厄年（数え年）</div>
            <div className="space-y-1 text-muted">
              <div>19歳・前厄/本厄/後厄</div>
              <div className="flex items-center gap-1">
                33歳・前厄/本厄/後厄
                <span className="text-xs bg-red-100 text-red-700 px-1 rounded">大厄</span>
              </div>
              <div>37歳・前厄/本厄/後厄</div>
              <div>61歳・前厄/本厄/後厄</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          数え年は生まれた年を1歳とし、元旦に1歳加算する数え方です。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-muted text-sm">
        広告
      </div>
    </div>
  );
}
