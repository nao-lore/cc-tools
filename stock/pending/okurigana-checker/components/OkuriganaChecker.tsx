"use client";

import { useState, useCallback, useMemo } from "react";

interface OkuriganaRule {
  wrong: string;
  correct: string;
  rule: string;
}

interface Detection {
  index: number;
  wrong: string;
  correct: string;
  rule: string;
}

const RULES: OkuriganaRule[] = [
  // 動詞
  { wrong: "行なう", correct: "行う", rule: "動詞：「行う」は「う」のみ送る" },
  { wrong: "断わる", correct: "断る", rule: "動詞：「断る」は「る」のみ送る" },
  { wrong: "当る", correct: "当たる", rule: "動詞：「当たる」は「たる」を送る" },
  { wrong: "終る", correct: "終わる", rule: "動詞：「終わる」は「わる」を送る" },
  { wrong: "変る", correct: "変わる", rule: "動詞：「変わる」は「わる」を送る" },
  { wrong: "始る", correct: "始まる", rule: "動詞：「始まる」は「まる」を送る" },
  { wrong: "集る", correct: "集まる", rule: "動詞：「集まる」は「まる」を送る" },
  { wrong: "起る", correct: "起こる", rule: "動詞：「起こる」は「こる」を送る" },
  { wrong: "定る", correct: "定まる", rule: "動詞：「定まる」は「まる」を送る" },
  { wrong: "向う", correct: "向かう", rule: "動詞：「向かう」は「かう」を送る" },
  { wrong: "表わす", correct: "表す", rule: "動詞：「表す」は「す」のみ送る" },
  { wrong: "著わす", correct: "著す", rule: "動詞：「著す」は「す」のみ送る" },
  { wrong: "関わる", correct: "関わる", rule: "動詞：「関わる」は正しい送り仮名" },
  { wrong: "捕える", correct: "捕らえる", rule: "動詞：「捕らえる」は「らえる」を送る" },
  // 形容詞
  { wrong: "暖い", correct: "暖かい", rule: "形容詞：「暖かい」は「かい」を送る" },
  { wrong: "危い", correct: "危ない", rule: "形容詞：「危ない」は「ない」を送る" },
  { wrong: "少い", correct: "少ない", rule: "形容詞：「少ない」は「ない」を送る" },
  { wrong: "細い", correct: "細い", rule: "形容詞：「細い」は正しい送り仮名" },
  { wrong: "柔い", correct: "柔らかい", rule: "形容詞：「柔らかい」は「らかい」を送る" },
  { wrong: "軟い", correct: "軟らかい", rule: "形容詞：「軟らかい」は「らかい」を送る" },
  // 複合語・名詞
  { wrong: "受付", correct: "受け付け", rule: "複合語：「受け付け」は「け」「け」を送る" },
  { wrong: "届出", correct: "届け出", rule: "複合語：「届け出」は「け」を送る" },
  { wrong: "申込", correct: "申し込み", rule: "複合語：「申し込み」は「し」「み」を送る" },
  { wrong: "取扱", correct: "取り扱い", rule: "複合語：「取り扱い」は「り」「い」を送る" },
  { wrong: "売上", correct: "売り上げ", rule: "複合語：「売り上げ」は「り」「げ」を送る" },
  { wrong: "貸出", correct: "貸し出し", rule: "複合語：「貸し出し」は「し」「し」を送る" },
  { wrong: "切替", correct: "切り替え", rule: "複合語：「切り替え」は「り」「え」を送る" },
  { wrong: "乗換", correct: "乗り換え", rule: "複合語：「乗り換え」は「り」「え」を送る" },
  { wrong: "引渡", correct: "引き渡し", rule: "複合語：「引き渡し」は「き」「し」を送る" },
  { wrong: "書込", correct: "書き込み", rule: "複合語：「書き込み」は「き」「み」を送る" },
];

function detectErrors(text: string): Detection[] {
  const detections: Detection[] = [];
  for (const rule of RULES) {
    // skip "correct" entries (rules where wrong === correct)
    if (rule.wrong === rule.correct) continue;
    let searchStart = 0;
    while (searchStart < text.length) {
      const idx = text.indexOf(rule.wrong, searchStart);
      if (idx === -1) break;
      detections.push({
        index: idx,
        wrong: rule.wrong,
        correct: rule.correct,
        rule: rule.rule,
      });
      searchStart = idx + rule.wrong.length;
    }
  }
  // sort by position
  detections.sort((a, b) => a.index - b.index);
  return detections;
}

function buildHighlightedSegments(
  text: string,
  detections: Detection[]
): { text: string; isError: boolean; detection?: Detection }[] {
  if (detections.length === 0) return [{ text, isError: false }];

  const segments: { text: string; isError: boolean; detection?: Detection }[] =
    [];
  let cursor = 0;

  for (const det of detections) {
    if (det.index < cursor) continue; // overlapping — skip
    if (det.index > cursor) {
      segments.push({ text: text.slice(cursor, det.index), isError: false });
    }
    segments.push({
      text: text.slice(det.index, det.index + det.wrong.length),
      isError: true,
      detection: det,
    });
    cursor = det.index + det.wrong.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isError: false });
  }

  return segments;
}

const SAMPLE_TEXT =
  "この案件を受付する際は、申込書を届出窓口に提出し、担当者が取扱います。変る可能性があるため、少い場合でも断わらずに行なってください。暖い季節には危い作業を終る前に確認が始る。";

export default function OkuriganaChecker() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [activeDetection, setActiveDetection] = useState<Detection | null>(
    null
  );

  const detections = useMemo(() => detectErrors(text), [text]);

  const segments = useMemo(
    () => buildHighlightedSegments(text, detections),
    [text, detections]
  );

  const handleClear = useCallback(() => {
    setText("");
    setActiveDetection(null);
  }, []);

  const handleSample = useCallback(() => {
    setText(SAMPLE_TEXT);
    setActiveDetection(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">テキストを入力</h3>
          <div className="flex gap-2">
            <button
              onClick={handleSample}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted hover:text-foreground transition-colors"
            >
              サンプル
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-muted hover:text-foreground transition-colors"
            >
              クリア
            </button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActiveDetection(null);
          }}
          rows={5}
          placeholder="チェックしたいテキストを入力してください..."
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{text.length} 文字</span>
          {detections.length > 0 ? (
            <span className="text-red-500 font-medium">
              {detections.length} 件の誤りを検出
            </span>
          ) : text.length > 0 ? (
            <span className="text-green-600 font-medium">問題なし</span>
          ) : null}
        </div>
      </div>

      {/* Highlighted preview */}
      {text.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted">プレビュー</h3>
          <div className="text-sm leading-loose text-foreground bg-background border border-border rounded-lg p-3 whitespace-pre-wrap break-words">
            {segments.map((seg, i) =>
              seg.isError ? (
                <button
                  key={i}
                  onClick={() =>
                    setActiveDetection(
                      activeDetection?.index === seg.detection?.index
                        ? null
                        : seg.detection ?? null
                    )
                  }
                  className={`inline rounded px-0.5 underline decoration-red-400 decoration-wavy underline-offset-4 transition-colors ${
                    activeDetection?.index === seg.detection?.index
                      ? "bg-red-100 text-red-700"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                  title={`誤り: ${seg.detection?.wrong} → ${seg.detection?.correct}`}
                >
                  {seg.text}
                </button>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </div>

          {/* Active detection tooltip */}
          {activeDetection && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-red-600">
                  {activeDetection.wrong}
                </span>
                <span className="text-muted">→</span>
                <span className="font-medium text-green-700">
                  {activeDetection.correct}
                </span>
              </div>
              <p className="text-xs text-muted">{activeDetection.rule}</p>
            </div>
          )}
        </div>
      )}

      {/* Detection list */}
      {detections.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium text-muted">
            検出結果 ({detections.length} 件)
          </h3>
          <ul className="space-y-2">
            {detections.map((det, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                  activeDetection?.index === det.index
                    ? "border-red-300 bg-red-50"
                    : "border-border bg-background hover:border-red-200 hover:bg-red-50/50"
                }`}
                onClick={() =>
                  setActiveDetection(
                    activeDetection?.index === det.index ? null : det
                  )
                }
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="font-medium text-red-600">{det.wrong}</span>
                    <span className="text-muted text-xs">→</span>
                    <span className="font-medium text-green-700">
                      {det.correct}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{det.rule}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {text.length > 0 && detections.length === 0 && (
        <div className="bg-surface rounded-2xl border border-border p-8 text-center space-y-2">
          <div className="text-2xl">✓</div>
          <p className="text-sm font-medium text-foreground">
            送り仮名の誤りは見つかりませんでした
          </p>
          <p className="text-xs text-muted">
            文化庁「送り仮名の付け方」に基づくチェックで問題なし
          </p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この送り仮名チェッカーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">送り仮名の付け方をルールに基づきチェック。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この送り仮名チェッカーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "送り仮名の付け方をルールに基づきチェック。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "送り仮名チェッカー",
  "description": "送り仮名の付け方をルールに基づきチェック",
  "url": "https://tools.loresync.dev/okurigana-checker",
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
