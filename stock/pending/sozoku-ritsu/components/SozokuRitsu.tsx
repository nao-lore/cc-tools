"use client";

import { useState, useMemo } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

function frac(num: number, den: number): string {
  if (den === 1) return `${num}`;
  return `${num}/${den}`;
}

function pct(num: number, den: number): string {
  return ((num / den) * 100).toFixed(1) + "%";
}

function formatJPY(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

// ── types ─────────────────────────────────────────────────────────────────────

interface Heir {
  label: string;
  /** numerator */
  num: number;
  /** denominator */
  den: number;
  color: string;
  note?: string;
}

// ── calculation ───────────────────────────────────────────────────────────────

function calcHeirs(
  hasSpouse: boolean,
  childCount: number,
  hasParent: boolean,
  siblingCount: number
): Heir[] {
  const heirs: Heir[] = [];

  // Rule: 子が最優先、次に親、次に兄弟
  const hasChild = childCount > 0;
  const hasSibling = siblingCount > 0;

  if (hasSpouse && hasChild) {
    // 配偶者1/2, 子全体1/2 を均分
    heirs.push({ label: "配偶者", num: 1, den: 2, color: "#6366f1" });
    const childDen = 2 * childCount;
    for (let i = 1; i <= childCount; i++) {
      heirs.push({
        label: `子 ${childCount > 1 ? i : ""}`.trim(),
        num: 1,
        den: childDen,
        color: `hsl(${140 + i * 25}, 60%, 50%)`,
        note: childCount > 1 ? "子全体で1/2を均分" : undefined,
      });
    }
  } else if (hasSpouse && !hasChild && hasParent) {
    // 配偶者2/3, 親1/3
    heirs.push({ label: "配偶者", num: 2, den: 3, color: "#6366f1" });
    heirs.push({ label: "親（直系尊属）", num: 1, den: 3, color: "#f59e0b" });
  } else if (hasSpouse && !hasChild && !hasParent && hasSibling) {
    // 配偶者3/4, 兄弟全体1/4を均分
    heirs.push({ label: "配偶者", num: 3, den: 4, color: "#6366f1" });
    const sibDen = 4 * siblingCount;
    for (let i = 1; i <= siblingCount; i++) {
      heirs.push({
        label: `兄弟姉妹 ${siblingCount > 1 ? i : ""}`.trim(),
        num: 1,
        den: sibDen,
        color: `hsl(${10 + i * 20}, 70%, 55%)`,
        note: siblingCount > 1 ? "兄弟全体で1/4を均分" : undefined,
      });
    }
  } else if (hasSpouse && !hasChild && !hasParent && !hasSibling) {
    // 配偶者のみ → 全部
    heirs.push({ label: "配偶者", num: 1, den: 1, color: "#6366f1" });
  } else if (!hasSpouse && hasChild) {
    // 配偶者なし、子全員で均分
    for (let i = 1; i <= childCount; i++) {
      heirs.push({
        label: `子 ${childCount > 1 ? i : ""}`.trim(),
        num: 1,
        den: childCount,
        color: `hsl(${140 + i * 25}, 60%, 50%)`,
        note: childCount > 1 ? "子全員で均分" : undefined,
      });
    }
  } else if (!hasSpouse && !hasChild && hasParent) {
    heirs.push({ label: "親（直系尊属）", num: 1, den: 1, color: "#f59e0b" });
  } else if (!hasSpouse && !hasChild && !hasParent && hasSibling) {
    for (let i = 1; i <= siblingCount; i++) {
      heirs.push({
        label: `兄弟姉妹 ${siblingCount > 1 ? i : ""}`.trim(),
        num: 1,
        den: siblingCount,
        color: `hsl(${10 + i * 20}, 70%, 55%)`,
        note: siblingCount > 1 ? "兄弟全員で均分" : undefined,
      });
    }
  }

  return heirs;
}

// ── sub-components ────────────────────────────────────────────────────────────

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

function CountSelector({
  label,
  value,
  onChange,
  max = 5,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
              value === i
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

// conic-gradient pie chart — no external deps
function PieChart({ heirs }: { heirs: Heir[] }) {
  let cumPct = 0;
  const segments = heirs.map((h) => {
    const share = h.num / h.den;
    const start = cumPct * 360;
    const end = (cumPct + share) * 360;
    cumPct += share;
    return { color: h.color, start, end };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}deg ${s.end.toFixed(1)}deg`)
    .join(", ");

  return (
    <div
      className="mx-auto rounded-full border-4 border-white shadow-md"
      style={{
        width: 160,
        height: 160,
        background: `conic-gradient(${gradient})`,
      }}
    />
  );
}

function HeirRow({
  heir,
  estate,
}: {
  heir: Heir;
  estate: number | null;
}) {
  const share = heir.num / heir.den;
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: heir.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{heir.label}</p>
        {heir.note && (
          <p className="text-[10px] text-gray-400">{heir.note}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-800">
          {frac(heir.num, heir.den)}
          <span className="text-xs font-normal text-gray-500 ml-1">
            ({pct(heir.num, heir.den)})
          </span>
        </p>
        {estate !== null && (
          <p className="text-xs text-indigo-600 font-semibold">
            ¥{formatJPY(estate * share)}
          </p>
        )}
      </div>
      {/* share bar */}
      <div className="w-24 bg-gray-100 rounded-full h-2 shrink-0">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${share * 100}%`,
            backgroundColor: heir.color,
          }}
        />
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function SozokuRitsu() {
  const [hasSpouse, setHasSpouse] = useState(true);
  const [childCount, setChildCount] = useState(2);
  const [hasParent, setHasParent] = useState(false);
  const [siblingCount, setSiblingCount] = useState(0);
  const [estateStr, setEstateStr] = useState("");

  const estate = useMemo(() => {
    const v = parseFloat(estateStr.replace(/,/g, ""));
    return isFinite(v) && v > 0 ? v : null;
  }, [estateStr]);

  const heirs = useMemo(
    () => calcHeirs(hasSpouse, childCount, hasParent, siblingCount),
    [hasSpouse, childCount, hasParent, siblingCount]
  );

  const noHeir =
    !hasSpouse && childCount === 0 && !hasParent && siblingCount === 0;

  // determine which heir classes are active (for informational notes)
  const activeClass = useMemo(() => {
    if (childCount > 0) return "child";
    if (hasParent) return "parent";
    if (siblingCount > 0) return "sibling";
    return "none";
  }, [childCount, hasParent, siblingCount]);

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-base font-bold text-gray-800">家族構成を入力</h2>

        {/* 配偶者 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            配偶者
          </label>
          <div className="flex gap-2">
            <ToggleButton
              label="有"
              active={hasSpouse}
              onClick={() => setHasSpouse(true)}
            />
            <ToggleButton
              label="無"
              active={!hasSpouse}
              onClick={() => setHasSpouse(false)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 子の人数 */}
          <CountSelector
            label="子の人数"
            value={childCount}
            onChange={setChildCount}
          />

          {/* 親（直系尊属） */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              親（直系尊属）の存否
            </label>
            <div className="flex gap-2">
              <ToggleButton
                label="有"
                active={hasParent}
                onClick={() => setHasParent(true)}
              />
              <ToggleButton
                label="無"
                active={!hasParent}
                onClick={() => setHasParent(false)}
              />
            </div>
            {activeClass !== "parent" && hasParent && (
              <p className="text-[10px] text-amber-500 mt-1">
                子がいる場合、親は相続人になりません
              </p>
            )}
          </div>

          {/* 兄弟の人数 */}
          <CountSelector
            label="兄弟姉妹の人数"
            value={siblingCount}
            onChange={setSiblingCount}
          />
        </div>

        {/* 遺産総額（任意） */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            遺産総額（任意・円）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="100000"
              value={estateStr}
              onChange={(e) => setEstateStr(e.target.value)}
              placeholder="例: 50000000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">円</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            入力すると各相続人の取得額も表示されます
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-base font-bold text-gray-800">算出結果</h2>

        {noHeir ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
            相続人が存在しません。家族構成を入力してください。
          </div>
        ) : (
          <>
            {/* Pie chart */}
            <PieChart heirs={heirs} />

            {/* Legend / heir list */}
            <div className="divide-y divide-gray-100">
              {heirs.map((h, i) => (
                <HeirRow key={i} heir={h} estate={estate} />
              ))}
            </div>

            {estate !== null && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
                <p className="text-xs text-indigo-600 font-semibold">
                  遺産総額: ¥{formatJPY(estate)} に基づく試算
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 法定相続分ルール解説 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
        <h2 className="text-base font-bold text-gray-800">法定相続分のルール</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="font-semibold text-gray-700 mb-1">相続順位</p>
            <ol className="list-decimal list-inside space-y-0.5 text-xs text-gray-600">
              <li>第1順位：子（直系卑属）— 子がいる場合、親・兄弟は相続しない</li>
              <li>第2順位：親（直系尊属）— 子がいない場合に相続</li>
              <li>第3順位：兄弟姉妹 — 子も親もいない場合に相続</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { case: "配偶者 ＋ 子", spouse: "1/2", other: "1/2（子で均分）" },
              { case: "配偶者 ＋ 親", spouse: "2/3", other: "1/3" },
              { case: "配偶者 ＋ 兄弟", spouse: "3/4", other: "1/4（兄弟で均分）" },
              { case: "配偶者のみ", spouse: "全部", other: "—" },
            ].map((r) => (
              <div
                key={r.case}
                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs"
              >
                <p className="font-semibold text-gray-700 mb-0.5">{r.case}</p>
                <p className="text-gray-600">
                  配偶者 {r.spouse} / その他 {r.other}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">代襲相続について</p>
            <p>
              子が被相続人より先に亡くなっていた場合、その子（被相続人の孫）が「代襲相続」により子の相続分を引き継ぎます。兄弟姉妹についても同様に甥・姪が1代限り代襲相続できます（ただし孫への再代襲はなし）。
            </p>
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-[10px] text-gray-400 leading-relaxed">
        本ツールは民法の法定相続分に基づく一般的な算出を目的としており、法的アドバイスを提供するものではありません。実際の相続手続きにおいては、遺言書の有無・特別受益・寄与分など個別事情が影響します。相続に関するご判断は弁護士・司法書士等の専門家にご相談ください。
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この法定相続分 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">家族構成パターンから各相続人の法定相続分を自動算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この法定相続分 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "家族構成パターンから各相続人の法定相続分を自動算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
