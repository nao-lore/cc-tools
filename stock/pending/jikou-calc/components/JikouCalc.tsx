"use client";

import { useState } from "react";

// 債権種別の定義
interface ClaimType {
  label: string;
  group: string;
  // 主観的起算点からの年数（権利行使できることを知った時から）
  subjectiveYears: number;
  // 客観的起算点からの年数（権利行使できる時から）
  objectiveYears: number;
  note?: string;
}

const CLAIM_TYPES: ClaimType[] = [
  {
    label: "一般債権（民法改正後）",
    group: "民事",
    subjectiveYears: 5,
    objectiveYears: 10,
    note: "2020年4月1日施行の民法改正により、主観的5年・客観的10年に統一されました。",
  },
  {
    label: "不法行為（人身損害以外）",
    group: "民事",
    subjectiveYears: 3,
    objectiveYears: 20,
    note: "損害および加害者を知った時から3年、不法行為の時から20年（除斥期間）。",
  },
  {
    label: "不法行為（人身損害・生命・身体）",
    group: "民事",
    subjectiveYears: 5,
    objectiveYears: 20,
    note: "生命・身体への侵害は主観的起算点から5年に延長（民法724条の2）。",
  },
  {
    label: "賃金請求権",
    group: "労働",
    subjectiveYears: 3,
    objectiveYears: 3,
    note: "労働基準法115条。当分の間3年（本来5年）。2020年4月改正。",
  },
  {
    label: "退職金請求権",
    group: "労働",
    subjectiveYears: 5,
    objectiveYears: 5,
    note: "労働基準法115条。退職日から5年。",
  },
  {
    label: "損害保険金請求権",
    group: "保険",
    subjectiveYears: 3,
    objectiveYears: 3,
    note: "保険法95条。損害発生または請求権行使可能となった時から3年。",
  },
  {
    label: "生命保険金請求権",
    group: "保険",
    subjectiveYears: 3,
    objectiveYears: 3,
    note: "保険法95条。保険事故発生を知った時から3年。",
  },
  {
    label: "売買代金請求権（改正前）",
    group: "民事（改正前）",
    subjectiveYears: 2,
    objectiveYears: 2,
    note: "2020年4月以前に発生した債権。旧民法173条。",
  },
  {
    label: "請負代金請求権（改正前）",
    group: "民事（改正前）",
    subjectiveYears: 3,
    objectiveYears: 3,
    note: "2020年4月以前に発生した債権。旧民法170条。",
  },
  {
    label: "医療費請求権（改正前）",
    group: "民事（改正前）",
    subjectiveYears: 3,
    objectiveYears: 3,
    note: "2020年4月以前に発生した医師・薬剤師の報酬請求権。旧民法170条。",
  },
];

// 日付に年数を加算
function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

// 残日数を計算
function calcRemainingDays(expiryDate: Date, today: Date): number {
  const diff = expiryDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// 日付フォーマット（YYYY年MM月DD日）
function formatDate(date: Date): string {
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日`;
}

// ISO日付文字列フォーマット（input[type=date]用）
function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// グループ別にまとめる
const GROUPS = Array.from(new Set(CLAIM_TYPES.map((c) => c.group)));

export default function JikouCalc() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedClaimIndex, setSelectedClaimIndex] = useState(0);
  const [startDateStr, setStartDateStr] = useState(toISODate(today));

  const selectedClaim = CLAIM_TYPES[selectedClaimIndex];

  const startDate = new Date(startDateStr);
  const isValidDate = !isNaN(startDate.getTime());

  const subjectiveExpiry = isValidDate
    ? addYears(startDate, selectedClaim.subjectiveYears)
    : null;
  const objectiveExpiry = isValidDate
    ? addYears(startDate, selectedClaim.objectiveYears)
    : null;

  const subjectiveRemaining =
    subjectiveExpiry ? calcRemainingDays(subjectiveExpiry, today) : null;
  const objectiveRemaining =
    objectiveExpiry ? calcRemainingDays(objectiveExpiry, today) : null;

  const isSamePeriod =
    selectedClaim.subjectiveYears === selectedClaim.objectiveYears;

  function getRemainingLabel(days: number | null): {
    text: string;
    color: string;
  } {
    if (days === null) return { text: "—", color: "text-muted" };
    if (days < 0) return { text: "時効完成済み", color: "text-red-600" };
    if (days === 0) return { text: "本日満了", color: "text-red-600" };
    if (days <= 30)
      return { text: `残り${days}日`, color: "text-red-500 font-bold" };
    if (days <= 180)
      return { text: `残り${days}日`, color: "text-orange-500 font-semibold" };
    return { text: `残り${days}日`, color: "text-green-700" };
  }

  const subjectiveLabel = getRemainingLabel(subjectiveRemaining);
  const objectiveLabel = getRemainingLabel(objectiveRemaining);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          時効期間計算ツール
        </h1>
        <p className="text-sm text-muted">
          債権種別と起算日を入力すると、時効満了日と残日数を算出します。2020年民法改正後のルールに対応。
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        {/* 債権種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            債権種別
          </label>
          <select
            value={selectedClaimIndex}
            onChange={(e) => setSelectedClaimIndex(Number(e.target.value))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {CLAIM_TYPES.map((claim, i) =>
                  claim.group === group ? (
                    <option key={i} value={i}>
                      {claim.label}（主観{claim.subjectiveYears}年
                      {claim.subjectiveYears !== claim.objectiveYears
                        ? `/客観${claim.objectiveYears}年`
                        : ""}
                      ）
                    </option>
                  ) : null
                )}
              </optgroup>
            ))}
          </select>
          {selectedClaim.note && (
            <p className="text-xs text-muted mt-1.5">{selectedClaim.note}</p>
          )}
        </div>

        {/* 起算日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            起算日（権利行使できることを知った日）
          </label>
          <input
            type="date"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Results */}
      {isValidDate && subjectiveExpiry && objectiveExpiry && (
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">計算結果</h2>

          {isSamePeriod ? (
            /* 同一期間の場合は1カードで表示 */
            <div className="rounded-xl border border-border p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  時効満了日
                </span>
                <span
                  className={`text-sm font-semibold ${subjectiveLabel.color}`}
                >
                  {subjectiveLabel.text}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatDate(subjectiveExpiry)}
              </div>
              <div className="text-xs text-muted mt-1">
                起算日 {formatDate(startDate)} から {selectedClaim.subjectiveYears}年
              </div>
            </div>
          ) : (
            /* 主観・客観が異なる場合は2カードで表示 */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 主観的起算点 */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    主観的起算点
                  </span>
                  <span
                    className={`text-xs font-semibold ${subjectiveLabel.color}`}
                  >
                    {subjectiveLabel.text}
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(subjectiveExpiry)}
                </div>
                <div className="text-xs text-muted mt-1">
                  知った日から {selectedClaim.subjectiveYears}年
                </div>
              </div>

              {/* 客観的起算点 */}
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    客観的起算点
                  </span>
                  <span
                    className={`text-xs font-semibold ${objectiveLabel.color}`}
                  >
                    {objectiveLabel.text}
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(objectiveExpiry)}
                </div>
                <div className="text-xs text-muted mt-1">
                  権利発生時から {selectedClaim.objectiveYears}年
                </div>
              </div>
            </div>
          )}

          {/* 早い方の警告 */}
          {!isSamePeriod && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
              <span className="font-semibold">注意：</span>
              いずれか早く到来した時点で時効が完成します。主観的起算点の{selectedClaim.subjectiveYears}年が先に到来する場合が一般的です。
            </div>
          )}
        </div>
      )}

      {/* 民法改正の説明 */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          2020年民法改正について
        </h2>
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <div className="font-medium text-gray-800 mb-1">改正前（〜2020年3月）</div>
            <p className="text-muted text-xs leading-relaxed">
              職業別の短期消滅時効（1〜3年）と一般原則（10年）が混在していました。
              売買代金は2年、医師の報酬は3年など、債権の種類ごとに異なる時効期間が定められていました。
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <div className="font-medium text-blue-800 mb-1">改正後（2020年4月〜）</div>
            <p className="text-blue-700 text-xs leading-relaxed">
              <span className="font-semibold">主観的起算点：</span>
              権利を行使できることを知った時から<span className="font-bold">5年</span>
              <br />
              <span className="font-semibold">客観的起算点：</span>
              権利を行使できる時から<span className="font-bold">10年</span>
              <br />
              いずれか早い方が適用されます。短期消滅時効は廃止され、原則として統一されました。
            </p>
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-muted text-sm">
        広告
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold">免責事項：</span>
          本ツールの計算結果は一般的な情報提供を目的としており、法的助言ではありません。
          時効の起算点・期間は個別の事情により異なる場合があります。
          具体的な判断は弁護士等の専門家にご相談ください。
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この時効期間 計算機ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">債権種別・民事/刑事別の時効期間、起算日から満了日を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この時効期間 計算機ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "債権種別・民事/刑事別の時効期間、起算日から満了日を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "時効期間 計算機",
  "description": "債権種別・民事/刑事別の時効期間、起算日から満了日を算出",
  "url": "https://tools.loresync.dev/jikou-calc",
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
