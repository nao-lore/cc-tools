"use client";

import { useState, useMemo } from "react";

const CHAR_LIMIT = 3000;
const MOBILE_FOLD = 210;
const DESKTOP_FOLD = 270;
const HASHTAG_MIN = 3;
const HASHTAG_MAX = 5;
const OPTIMAL_MIN = 1300;
const OPTIMAL_MAX = 2000;

function computeStats(text: string) {
  const charCount = [...text].length;
  const words = text.trim() === "" ? [] : text.trim().split(/\s+/);
  const wordCount = words.filter((w) => w.length > 0).length;
  const lineCount = text === "" ? 0 : text.split("\n").length;

  const hashtagMatches = text.match(/#[\w\u3040-\u9fff\uFF00-\uFFEF]+/g) ?? [];
  const hashtagCount = hashtagMatches.length;

  // English char ratio (ASCII letters only)
  const engChars = (text.match(/[a-zA-Z]/g) ?? []).length;
  const totalNonSpace = (text.match(/\S/g) ?? []).length;
  const engRatio = totalNonSpace > 0 ? engChars / totalNonSpace : 0;

  return { charCount, wordCount, lineCount, hashtagCount, engRatio };
}

function qualityScore(
  charCount: number,
  hashtagCount: number
): { score: number; label: string; color: string } {
  let score = 0;

  // Length score (0-40)
  if (charCount >= OPTIMAL_MIN && charCount <= OPTIMAL_MAX) {
    score += 40;
  } else if (charCount >= 600 && charCount < OPTIMAL_MIN) {
    score += 20 + Math.round(((charCount - 600) / (OPTIMAL_MIN - 600)) * 20);
  } else if (charCount > OPTIMAL_MAX && charCount <= 2500) {
    score += 30;
  } else if (charCount > 0 && charCount < 600) {
    score += Math.round((charCount / 600) * 20);
  }

  // Hashtag score (0-30)
  if (hashtagCount >= HASHTAG_MIN && hashtagCount <= HASHTAG_MAX) {
    score += 30;
  } else if (hashtagCount > 0 && hashtagCount < HASHTAG_MIN) {
    score += Math.round((hashtagCount / HASHTAG_MIN) * 20);
  } else if (hashtagCount > HASHTAG_MAX && hashtagCount <= 10) {
    score += 15;
  }

  // Not empty bonus (0-30): reward having content
  if (charCount > 50) score += 30;
  else if (charCount > 0) score += Math.round((charCount / 50) * 30);

  score = Math.min(100, score);

  if (score >= 80) return { score, label: "優秀", color: "text-emerald-600" };
  if (score >= 60) return { score, label: "良好", color: "text-blue-600" };
  if (score >= 40) return { score, label: "普通", color: "text-yellow-600" };
  return { score, label: "要改善", color: "text-red-500" };
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  warn?: boolean;
}

function StatCard({ label, value, sub, warn }: StatCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 text-center">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p
        className={`text-3xl font-bold tabular-nums ${warn ? "text-red-500" : "text-gray-900"}`}
      >
        {value}
      </p>
      {sub && <p className="text-muted text-xs mt-1">{sub}</p>}
    </div>
  );
}

interface RecommendRowProps {
  label: string;
  ok: boolean;
  detail: string;
}

function RecommendRow({ label, ok, detail }: RecommendRowProps) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <span
        className={`mt-0.5 text-base leading-none ${ok ? "text-emerald-500" : "text-yellow-500"}`}
      >
        {ok ? "✓" : "△"}
      </span>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-muted">{detail}</p>
      </div>
    </div>
  );
}

export default function LinkedinPostCounter() {
  const [text, setText] = useState("");
  const [foldDevice, setFoldDevice] = useState<"mobile" | "desktop">("mobile");

  const { charCount, wordCount, lineCount, hashtagCount, engRatio } =
    useMemo(() => computeStats(text), [text]);

  const foldAt = foldDevice === "mobile" ? MOBILE_FOLD : DESKTOP_FOLD;
  const isTruncated = [...text].length > foldAt;
  const previewChars = [...text].slice(0, foldAt).join("");
  const restChars = [...text].slice(foldAt).join("");

  const quality = useMemo(
    () => qualityScore(charCount, hashtagCount),
    [charCount, hashtagCount]
  );

  const overLimit = charCount > CHAR_LIMIT;
  const remaining = CHAR_LIMIT - charCount;

  const hashtagOk =
    hashtagCount >= HASHTAG_MIN && hashtagCount <= HASHTAG_MAX;
  const lengthOk = charCount >= OPTIMAL_MIN && charCount <= OPTIMAL_MAX;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          LinkedIn投稿 文字数チェッカー
        </h1>
        <p className="text-muted text-sm">
          投稿文を入力すると「もっと見る」境界・ハッシュタグ数・最適投稿長をリアルタイムで判定します。
        </p>
      </div>

      {/* Textarea */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-muted text-xs">投稿文を入力</label>
          {text.length > 0 && (
            <button
              onClick={() => setText("")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              クリア
            </button>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="LinkedIn投稿文をここに貼り付けてください…"
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted">最大 3,000文字</span>
          <span
            className={`text-xs font-semibold tabular-nums ${overLimit ? "text-red-500" : remaining <= 200 ? "text-yellow-600" : "text-muted"}`}
          >
            {overLimit
              ? `${Math.abs(remaining).toLocaleString()}文字オーバー`
              : `残り ${remaining.toLocaleString()}文字`}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="文字数"
          value={charCount.toLocaleString()}
          sub={`/ ${CHAR_LIMIT.toLocaleString()}`}
          warn={overLimit}
        />
        <StatCard label="単語数" value={wordCount.toLocaleString()} />
        <StatCard label="行数" value={lineCount.toLocaleString()} />
        <StatCard
          label="ハッシュタグ数"
          value={hashtagCount}
          sub="推奨 3〜5個"
          warn={hashtagCount > 10}
        />
      </div>

      {/* Quality score */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-sm">品質スコア</h2>
          <span className={`text-lg font-bold tabular-nums ${quality.color}`}>
            {quality.score}点 / 100点
            <span className="ml-2 text-sm">{quality.label}</span>
          </span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              quality.score >= 80
                ? "bg-emerald-400"
                : quality.score >= 60
                  ? "bg-blue-400"
                  : quality.score >= 40
                    ? "bg-yellow-400"
                    : "bg-red-400"
            }`}
            style={{ width: `${quality.score}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-2">
          投稿長・ハッシュタグ数をもとに算出した目安スコアです。
        </p>
      </div>

      {/* Recommendations */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-gray-900 text-sm mb-2">
          推奨チェック
        </h2>
        <div className="divide-y divide-border">
          <RecommendRow
            label="投稿長"
            ok={lengthOk}
            detail={
              lengthOk
                ? `${charCount}文字 — 最適範囲（1,300〜2,000文字）内です`
                : charCount < OPTIMAL_MIN
                  ? `${charCount}文字 — 最適範囲より短め。1,300文字以上を推奨`
                  : `${charCount}文字 — 最適範囲より長め。2,000文字以下を推奨`
            }
          />
          <RecommendRow
            label="ハッシュタグ数"
            ok={hashtagOk}
            detail={
              hashtagOk
                ? `${hashtagCount}個 — 推奨範囲（3〜5個）内です`
                : hashtagCount < HASHTAG_MIN
                  ? `${hashtagCount}個 — 3個以上のハッシュタグを推奨`
                  : hashtagCount <= 10
                    ? `${hashtagCount}個 — 5個以下に絞るとリーチが上がりやすい`
                    : `${hashtagCount}個 — 多すぎます。5個以下に絞ることを推奨`
            }
          />
          <RecommendRow
            label="英語混在率"
            ok={engRatio <= 0.5}
            detail={`英字 ${(engRatio * 100).toFixed(1)}% — ${engRatio <= 0.5 ? "日本語主体の投稿です" : "英語比率が高め。ターゲット読者を確認してください"}`}
          />
          <RecommendRow
            label="文字数上限"
            ok={!overLimit}
            detail={
              overLimit
                ? `${Math.abs(remaining).toLocaleString()}文字オーバーしています。3,000文字以内に収めてください`
                : `上限（3,000文字）内です`
            }
          />
        </div>
      </div>

      {/* "もっと見る" preview */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-sm">
            「もっと見る」プレビュー
          </h2>
          <div className="flex items-center gap-1 text-xs border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setFoldDevice("mobile")}
              className={`px-3 py-1 transition-colors ${foldDevice === "mobile" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              モバイル（〜{MOBILE_FOLD}字）
            </button>
            <button
              onClick={() => setFoldDevice("desktop")}
              className={`px-3 py-1 transition-colors ${foldDevice === "desktop" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              PC（〜{DESKTOP_FOLD}字）
            </button>
          </div>
        </div>

        {text.trim() === "" ? (
          <p className="text-muted text-sm text-center py-6">
            投稿文を入力するとプレビューが表示されます
          </p>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed border border-border">
            <span>{previewChars}</span>
            {isTruncated && (
              <>
                <span className="text-gray-400">…</span>
                <span className="inline-block ml-1 text-blue-600 font-medium cursor-pointer">
                  もっと見る
                </span>
                <div className="mt-3 pt-3 border-t border-gray-200 text-gray-500">
                  <span className="text-xs text-muted">
                    ▼ 折りたたまれる部分（{[...restChars].length}文字）
                  </span>
                  <div className="mt-1 opacity-50">{restChars}</div>
                </div>
              </>
            )}
            {!isTruncated && (
              <span className="ml-1 text-emerald-600 text-xs">
                （折りたたみなし — {foldAt}文字以内）
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-muted mt-2">
          ※ 境界文字数はLinkedInの表示仕様（2024年時点の目安）です。実際の折りたたみ位置はUIにより異なる場合があります。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このLinkedIn 投稿文字数チェックツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">「もっと見る」境界、ハッシュタグ推奨数、英語混在率。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このLinkedIn 投稿文字数チェックツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "「もっと見る」境界、ハッシュタグ推奨数、英語混在率。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
