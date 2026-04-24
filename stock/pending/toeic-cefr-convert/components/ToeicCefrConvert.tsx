"use client";

import { useState } from "react";

type TestType = "TOEIC" | "英検" | "CEFR" | "IELTS";

type CefrLevel = "C2" | "C1" | "B2" | "B1" | "A2" | "A1";

type MappingRow = {
  cefr: CefrLevel;
  toeic: string;
  eiken: string;
  ielts: string;
  label: string;
  jobHint?: string;
};

const MAPPING: MappingRow[] = [
  {
    cefr: "C2",
    toeic: "945〜990",
    eiken: "1級",
    ielts: "8.5〜9.0",
    label: "熟達した使い手（最上級）",
  },
  {
    cefr: "C1",
    toeic: "785〜940",
    eiken: "準1級",
    ielts: "7.0〜8.0",
    label: "熟達した使い手",
    jobHint: "就活最上位基準（外資・グローバル企業）",
  },
  {
    cefr: "B2",
    toeic: "550〜780",
    eiken: "2級",
    ielts: "5.5〜6.5",
    label: "自立した使い手",
    jobHint: "就活上位基準（多くの企業で評価）",
  },
  {
    cefr: "B1",
    toeic: "225〜545",
    eiken: "準2級",
    ielts: "4.0〜5.0",
    label: "自立した使い手（基礎）",
    jobHint: "就活基本ライン（TOEIC 600点付近）",
  },
  {
    cefr: "A2",
    toeic: "〜220",
    eiken: "3級",
    ielts: "〜3.5",
    label: "基礎段階",
  },
  {
    cefr: "A1",
    toeic: "—",
    eiken: "4〜5級",
    ielts: "—",
    label: "超基礎段階",
  },
];

// TOEIC score thresholds → CEFR
function toeicToCefr(score: number): CefrLevel {
  if (score >= 945) return "C2";
  if (score >= 785) return "C1";
  if (score >= 550) return "B2";
  if (score >= 225) return "B1";
  return "A2";
}

// IELTS score thresholds → CEFR
function ieltsToCefr(score: number): CefrLevel {
  if (score >= 8.5) return "C2";
  if (score >= 7.0) return "C1";
  if (score >= 5.5) return "B2";
  if (score >= 4.0) return "B1";
  return "A2";
}

const EIKEN_LEVELS = ["1級", "準1級", "2級", "準2級", "3級", "4級", "5級"] as const;
type EikenLevel = (typeof EIKEN_LEVELS)[number];

function eikenToCefr(level: EikenLevel): CefrLevel {
  switch (level) {
    case "1級": return "C2";
    case "準1級": return "C1";
    case "2級": return "B2";
    case "準2級": return "B1";
    case "3級": return "A2";
    case "4級":
    case "5級": return "A1";
  }
}

const CEFR_LEVELS: CefrLevel[] = ["C2", "C1", "B2", "B1", "A2", "A1"];

const CEFR_COLORS: Record<CefrLevel, string> = {
  C2: "bg-purple-100 text-purple-800 border-purple-300",
  C1: "bg-blue-100 text-blue-800 border-blue-300",
  B2: "bg-cyan-100 text-cyan-800 border-cyan-300",
  B1: "bg-green-100 text-green-800 border-green-300",
  A2: "bg-yellow-100 text-yellow-800 border-yellow-300",
  A1: "bg-gray-100 text-gray-600 border-gray-300",
};

const JOB_HINTS: Record<number, string> = {
  600: "基本ライン（多くの企業で「英語力あり」と認定）",
  730: "上位基準（総合商社・メーカーの海外部門など）",
  860: "最上位基準（外資系・グローバルトップ企業）",
};

function ResultCard({ row }: { row: MappingRow }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <span
          className={`text-2xl font-bold px-4 py-1.5 rounded-lg border ${CEFR_COLORS[row.cefr]}`}
        >
          {row.cefr}
        </span>
        <span className="text-sm text-muted">{row.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-accent rounded-lg p-3 text-center">
          <div className="text-xs text-muted mb-1">TOEIC</div>
          <div className="font-bold text-sm">{row.toeic}</div>
        </div>
        <div className="bg-accent rounded-lg p-3 text-center">
          <div className="text-xs text-muted mb-1">英検</div>
          <div className="font-bold text-sm">{row.eiken}</div>
        </div>
        <div className="bg-accent rounded-lg p-3 text-center">
          <div className="text-xs text-muted mb-1">IELTS</div>
          <div className="font-bold text-sm">{row.ielts}</div>
        </div>
      </div>

      {row.jobHint && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
          <span className="mt-0.5">💼</span>
          <span>{row.jobHint}</span>
        </div>
      )}
    </div>
  );
}

export default function ToeicCefrConvert() {
  const [testType, setTestType] = useState<TestType>("TOEIC");
  const [toeicScore, setToeicScore] = useState<string>("730");
  const [ieltsScore, setIeltsScore] = useState<string>("6.5");
  const [eikenLevel, setEikenLevel] = useState<EikenLevel>("2級");
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>("B2");

  const testTypes: TestType[] = ["TOEIC", "英検", "CEFR", "IELTS"];

  function getResultRow(): MappingRow | null {
    let cefr: CefrLevel;
    switch (testType) {
      case "TOEIC": {
        const n = parseInt(toeicScore, 10);
        if (isNaN(n) || n < 0 || n > 990) return null;
        cefr = toeicToCefr(n);
        break;
      }
      case "英検":
        cefr = eikenToCefr(eikenLevel);
        break;
      case "CEFR":
        cefr = cefrLevel;
        break;
      case "IELTS": {
        const n = parseFloat(ieltsScore);
        if (isNaN(n) || n < 0 || n > 9) return null;
        cefr = ieltsToCefr(n);
        break;
      }
    }
    return MAPPING.find((r) => r.cefr === cefr) ?? null;
  }

  const result = getResultRow();

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">スコア・レベルを入力</h2>

        {/* Test type selector */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1.5">試験の種類</label>
          <div className="flex flex-wrap gap-2">
            {testTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTestType(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  testType === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Score input */}
        {testType === "TOEIC" && (
          <div>
            <label className="block text-xs text-muted mb-1.5">
              TOEICスコア（10〜990）
            </label>
            <input
              type="number"
              min={10}
              max={990}
              step={5}
              value={toeicScore}
              onChange={(e) => setToeicScore(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
              placeholder="例: 730"
            />
          </div>
        )}

        {testType === "IELTS" && (
          <div>
            <label className="block text-xs text-muted mb-1.5">
              IELTSスコア（0〜9）
            </label>
            <input
              type="number"
              min={0}
              max={9}
              step={0.5}
              value={ieltsScore}
              onChange={(e) => setIeltsScore(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
              placeholder="例: 6.5"
            />
          </div>
        )}

        {testType === "英検" && (
          <div>
            <label className="block text-xs text-muted mb-1.5">英検の級</label>
            <div className="flex flex-wrap gap-2">
              {EIKEN_LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setEikenLevel(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    eikenLevel === l
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {testType === "CEFR" && (
          <div>
            <label className="block text-xs text-muted mb-1.5">CEFRレベル</label>
            <div className="flex flex-wrap gap-2">
              {CEFR_LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setCefrLevel(l)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                    cefrLevel === l
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {result ? (
        <ResultCard row={result} />
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm text-center text-sm text-muted">
          有効なスコアを入力してください
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-[90px] bg-accent border border-dashed border-border rounded-xl flex items-center justify-center text-xs text-muted">
        広告
      </div>

      {/* Job target table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">就活 TOEIC 目安</h2>
        <div className="space-y-2">
          {Object.entries(JOB_HINTS).map(([score, hint]) => (
            <div key={score} className="flex items-start gap-3">
              <span className="font-bold text-primary w-16 shrink-0 text-sm">
                {score}点
              </span>
              <span className="text-sm text-foreground">{hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reference table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">対応早見表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-semibold text-muted text-xs">CEFR</th>
                <th className="py-2 pr-3 font-semibold text-muted text-xs">TOEIC</th>
                <th className="py-2 pr-3 font-semibold text-muted text-xs">英検</th>
                <th className="py-2 font-semibold text-muted text-xs">IELTS</th>
              </tr>
            </thead>
            <tbody>
              {MAPPING.map((row) => (
                <tr
                  key={row.cefr}
                  className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                >
                  <td className="py-2 pr-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${CEFR_COLORS[row.cefr]}`}
                    >
                      {row.cefr}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-xs">{row.toeic}</td>
                  <td className="py-2 pr-3 text-xs">{row.eiken}</td>
                  <td className="py-2 text-xs">{row.ielts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          ※ 目安値です。試験機関・文部科学省の公式対応表を参考に作成。
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このTOEIC / 英検 / CEFR 相互変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">各種英語試験スコアを相互変換、就活・留学の目安表示。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このTOEIC / 英検 / CEFR 相互変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "各種英語試験スコアを相互変換、就活・留学の目安表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
