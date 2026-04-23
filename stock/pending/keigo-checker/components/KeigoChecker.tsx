"use client";

import { useState, useCallback, useMemo } from "react";

type Severity = "warning" | "info";

interface Rule {
  id: string;
  name: string;
  category: string;
  severity: Severity;
  pattern: RegExp;
  suggestion: string;
  correction: (match: string) => string;
}

interface Finding {
  ruleId: string;
  ruleName: string;
  category: string;
  severity: Severity;
  match: string;
  suggestion: string;
  correction: string;
  index: number;
}

const RULES: Rule[] = [
  // 二重敬語
  {
    id: "double-ossharu",
    name: "二重敬語：おっしゃられる",
    category: "二重敬語",
    severity: "warning",
    pattern: /おっしゃられ/g,
    suggestion: "「おっしゃる」が正しい敬語です。「られる」を重ねると二重敬語になります。",
    correction: () => "おっしゃ",
  },
  {
    id: "double-gorannin",
    name: "二重敬語：ご覧になられる",
    category: "二重敬語",
    severity: "warning",
    pattern: /ご覧になられ/g,
    suggestion: "「ご覧になる」が正しい敬語です。「られる」を重ねると二重敬語になります。",
    correction: () => "ご覧にな",
  },
  {
    id: "double-meshiagari",
    name: "二重敬語：お召し上がりになられる",
    category: "二重敬語",
    severity: "warning",
    pattern: /お召し上がりになられ/g,
    suggestion: "「召し上がる」が正しい敬語です。",
    correction: () => "召し上が",
  },
  {
    id: "double-irassharu",
    name: "二重敬語：いらっしゃられる",
    category: "二重敬語",
    severity: "warning",
    pattern: /いらっしゃられ/g,
    suggestion: "「いらっしゃる」が正しい敬語です。「られる」は不要です。",
    correction: () => "いらっしゃ",
  },
  {
    id: "double-ukeirare",
    name: "二重敬語：お受け取りになられる",
    category: "二重敬語",
    severity: "warning",
    pattern: /お受け取りになられ/g,
    suggestion: "「お受け取りになる」が正しい敬語です。",
    correction: () => "お受け取りにな",
  },
  {
    id: "double-nasare",
    name: "二重敬語：なさられる",
    category: "二重敬語",
    severity: "warning",
    pattern: /なさられ/g,
    suggestion: "「なさる」が正しい敬語です。「られ」を重ねると二重敬語になります。",
    correction: () => "なさ",
  },
  // 過剰敬語・誤用
  {
    id: "sasete-itadaku",
    name: "過剰敬語：させていただく多用",
    category: "過剰敬語",
    severity: "info",
    pattern: /させていただ[きくけこい]/g,
    suggestion: "「させていただく」は相手の許可が必要な場面に限定して使いましょう。「します」「いたします」で十分な場合があります。",
    correction: (m) => m.replace("させていただ", "いた"),
  },
  {
    id: "no-kata",
    name: "過剰敬語：〜の方",
    category: "過剰敬語",
    severity: "info",
    pattern: /のほう(?=を|に|で|は|が|も)/g,
    suggestion: "「〜の方（ほう）」は方向を示す言葉です。ビジネスメールでは「〜を」「〜に」と直接書きましょう。",
    correction: () => "",
  },
  {
    id: "yoroshikatta",
    name: "誤用：よろしかったでしょうか",
    category: "よくある誤用",
    severity: "warning",
    pattern: /よろしかったでしょうか/g,
    suggestion: "過去形は不自然です。「よろしいでしょうか」が正しい表現です。",
    correction: () => "よろしいでしょうか",
  },
  {
    id: "ryokai",
    name: "誤用：了解しました",
    category: "よくある誤用",
    severity: "warning",
    pattern: /了解しました|了解いたしました/g,
    suggestion: "目上の方への返答には「承知しました」または「かしこまりました」を使いましょう。",
    correction: () => "承知しました",
  },
  {
    id: "gokurosamа",
    name: "誤用：ご苦労様",
    category: "よくある誤用",
    severity: "warning",
    pattern: /ご苦労様|ご苦労さま/g,
    suggestion: "「ご苦労様」は目上から目下に使う言葉です。上司・取引先には「お疲れ様でございます」を使いましょう。",
    correction: () => "お疲れ様でございます",
  },
  {
    id: "sumimasen",
    name: "誤用：すみません（謝罪）",
    category: "よくある誤用",
    severity: "info",
    pattern: /すみません/g,
    suggestion: "ビジネスメールの謝罪には「申し訳ございません」「誠に恐れ入ります」を使いましょう。",
    correction: () => "申し訳ございません",
  },
  {
    id: "otaku",
    name: "誤用：お宅",
    category: "よくある誤用",
    severity: "info",
    pattern: /お宅(?!様)/g,
    suggestion: "取引先への呼称は「御社（おんしゃ）」（口頭では「貴社」）が適切です。",
    correction: () => "御社",
  },
  // です・ます と だ・である の混在
  {
    id: "dearu-mix",
    name: "混在：〜である（です・ます体に混在）",
    category: "文体混在",
    severity: "warning",
    pattern: /である。|であります。/g,
    suggestion: "です・ます体の文章に「〜である」が混在しています。「〜です」「〜ございます」に統一しましょう。",
    correction: (m) => m.replace("である。", "です。").replace("であります。", "でございます。"),
  },
  {
    id: "da-mix",
    name: "混在：〜だ（です・ます体に混在）",
    category: "文体混在",
    severity: "warning",
    pattern: /(?<=[。\n])([^。\n]+)だ。/g,
    suggestion: "です・ます体の文章に「〜だ」が混在しています。「〜です」に統一しましょう。",
    correction: (m) => m.replace(/だ。$/, "です。"),
  },
  // その他の誤用
  {
    id: "osewa",
    name: "形式的すぎる：お世話になっております",
    category: "過剰敬語",
    severity: "info",
    pattern: /お世話になっております/g,
    suggestion: "冒頭のお決まり文句として多用されがちです。初回連絡・社外向けには適切ですが、毎回使うと形式的に見えることもあります。",
    correction: () => "お世話になっております",
  },
  {
    id: "tashounimo",
    name: "誤用：何卒よろしくお願いいたします（重複）",
    category: "過剰敬語",
    severity: "info",
    pattern: /何卒よろしくお願いいたします[\s\S]*?よろしくお願いいたします/g,
    suggestion: "締めの挨拶が重複しています。一箇所にまとめましょう。",
    correction: () => "何卒よろしくお願いいたします",
  },
  {
    id: "itasu-itadaku",
    name: "二重謙譲：いたしていただく",
    category: "二重敬語",
    severity: "warning",
    pattern: /いたしていただ[きくけ]/g,
    suggestion: "「いたす」と「いただく」の二重謙譲です。「いたします」または「していただきます」に修正しましょう。",
    correction: () => "いたします",
  },
  {
    id: "oshirase",
    name: "誤用：ご報告させていただきます",
    category: "過剰敬語",
    severity: "info",
    pattern: /ご報告させていただきます/g,
    suggestion: "「ご報告いたします」で十分です。「させていただきます」は相手の許可が不要な場合に使うと冗長になります。",
    correction: () => "ご報告いたします",
  },
  {
    id: "haiken",
    name: "誤用：拝見させていただく",
    category: "二重敬語",
    severity: "warning",
    pattern: /拝見させていただ[きくけ]/g,
    suggestion: "「拝見する」自体が謙譲語です。「させていただく」を重ねると二重謙譲になります。「拝見しました」が正しい表現です。",
    correction: () => "拝見しました",
  },
];

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function analyzeText(text: string): Finding[] {
  const findings: Finding[] = [];

  for (const rule of RULES) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags.includes("g") ? rule.pattern.flags : rule.pattern.flags + "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      findings.push({
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        severity: rule.severity,
        match: m[0],
        suggestion: rule.suggestion,
        correction: rule.correction(m[0]),
        index: m.index,
      });
    }
  }

  // Sort by index
  findings.sort((a, b) => a.index - b.index);
  return findings;
}

function highlightText(text: string, findings: Finding[]): React.ReactNode[] {
  if (findings.length === 0) return [text];

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const f of findings) {
    if (f.index < cursor) continue;
    if (f.index > cursor) {
      nodes.push(text.slice(cursor, f.index));
    }
    const end = f.index + f.match.length;
    nodes.push(
      <mark
        key={`${f.ruleId}-${f.index}`}
        className={
          f.severity === "warning"
            ? "bg-red-100 text-red-800 rounded px-0.5"
            : "bg-yellow-100 text-yellow-800 rounded px-0.5"
        }
        title={f.ruleName}
      >
        {f.match}
      </mark>
    );
    cursor = end;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

const CATEGORY_ORDER = ["二重敬語", "過剰敬語", "よくある誤用", "文体混在"];

export default function KeigoChecker() {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  const findings = useMemo(() => (checked ? analyzeText(text) : []), [text, checked]);

  const handleCheck = useCallback(() => {
    setChecked(true);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setChecked(false);
  }, []);

  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info").length;

  const byCategory = useMemo(() => {
    const map: Record<string, Finding[]> = {};
    for (const f of findings) {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    }
    return map;
  }, [findings]);

  const highlightedNodes = useMemo(
    () => (checked && text ? highlightText(text, findings) : null),
    [checked, text, findings]
  );

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">チェックするメール文章を入力</h3>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="ビジネスメールの本文を貼り付けてください。&#10;例：先日はご苦労様でした。了解しました。拝見させていただきました。"
          rows={8}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-y leading-relaxed"
        />
        <button
          onClick={handleCheck}
          disabled={!text.trim()}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          敬語をチェックする
        </button>
      </div>

      {/* Highlighted preview */}
      {checked && text && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted">プレビュー</h3>
          <div className="text-sm leading-relaxed bg-background rounded-lg border border-border p-4 whitespace-pre-wrap">
            {highlightedNodes}
          </div>
          <div className="flex gap-3 text-xs text-muted pt-1">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-red-100" />
              要修正（warning）
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-yellow-100" />
              確認推奨（info）
            </span>
          </div>
        </div>
      )}

      {/* Summary */}
      {checked && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <h3 className="text-sm font-medium text-muted mb-3">チェック結果</h3>
          {findings.length === 0 ? (
            <p className="text-sm text-foreground">
              指摘事項は見つかりませんでした。敬語の使い方は適切です。
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                指摘数：{findings.length} 件
              </p>
              <div className="flex gap-4 text-sm text-muted">
                <span>要修正：{warningCount} 件</span>
                <span>確認推奨：{infoCount} 件</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Findings list grouped by category */}
      {checked && findings.length > 0 && (
        <div className="space-y-4">
          {CATEGORY_ORDER.filter((cat) => byCategory[cat]).map((cat) => (
            <div key={cat} className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-background">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                  {cat}
                </span>
                <span className="ml-2 text-xs text-muted">
                  {byCategory[cat].length} 件
                </span>
              </div>
              <ul className="divide-y divide-border">
                {byCategory[cat].map((f, i) => (
                  <li key={`${f.ruleId}-${f.index}-${i}`} className="p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span
                        className={`shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          f.severity === "warning"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {f.severity === "warning" ? "要修正" : "確認"}
                      </span>
                      <span className="text-sm font-medium text-foreground">{f.ruleName}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                        {f.match}
                      </span>
                      {f.correction && f.correction !== f.match && (
                        <>
                          <span className="text-muted self-center">→</span>
                          <span className="font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                            {f.correction}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{f.suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
