"use client";

import { useState, useMemo } from "react";

type Mode = "forward" | "budget" | "cpa";

function formatJPY(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function formatNum(n: number, digits = 1): string {
  return n.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatBig(n: number): string {
  if (n >= 10000) return `${formatNum(n / 10000, 1)}万`;
  return Math.round(n).toLocaleString("ja-JP");
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  step?: string;
}

function InputField({ label, value, onChange, placeholder, suffix, step = "1" }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {suffix && (
          <span className="text-xs text-gray-500 whitespace-nowrap">{suffix}</span>
        )}
      </div>
    </div>
  );
}

interface FunnelBarProps {
  label: string;
  value: number;
  format: (n: number) => string;
  unit: string;
  color: string;
  pct: number;
}

function FunnelBar({ label, value, format, unit, color, pct }: FunnelBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-right text-xs text-gray-500 shrink-0">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
        <div
          className={`h-full rounded-full flex items-center pl-3 text-xs font-semibold text-white transition-all duration-300 ${color}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <div className="w-32 text-xs font-bold text-gray-700 shrink-0">
        {isFinite(value) && value >= 0 ? `${format(value)}${unit}` : "—"}
      </div>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "blue" | "orange" | "default";
}

function ResultCard({ label, value, sub, highlight = "default" }: ResultCardProps) {
  const colors: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    orange: "bg-orange-50 border-orange-200",
    default: "bg-gray-50 border-gray-200",
  };
  const textColors: Record<string, string> = {
    green: "text-green-700",
    blue: "text-blue-700",
    orange: "text-orange-700",
    default: "text-gray-800",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[highlight]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColors[highlight]}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdBudgetEstimator() {
  const [mode, setMode] = useState<Mode>("forward");

  // Forward mode inputs
  const [targetCv, setTargetCv] = useState("100");
  const [targetCpa, setTargetCpa] = useState("5000");
  const [cvr, setCvr] = useState("2");
  const [ctr, setCtr] = useState("1");

  // Reverse: budget → CV
  const [budget, setBudget] = useState("500000");
  const [cpc, setCpc] = useState("250");
  const [rCvr, setRCvr] = useState("2");

  // Reverse: CPA → budget
  const [cCv, setCCv] = useState("100");
  const [cCpa, setCCpa] = useState("5000");
  const [cCvr, setCCvr] = useState("2");
  const [cCtr, setCCtr] = useState("1");

  const forwardResult = useMemo(() => {
    const cv = parseFloat(targetCv);
    const cpa = parseFloat(targetCpa);
    const cvrPct = parseFloat(cvr) / 100;
    const ctrPct = parseFloat(ctr) / 100;

    if ([cv, cpa, cvrPct, ctrPct].some((v) => isNaN(v) || v <= 0)) return null;

    const clicks = cv / cvrPct;
    const imp = clicks / ctrPct;
    const calcCpc = cpa * cvrPct;
    const totalBudget = clicks * calcCpc;

    return { cv, clicks, imp, calcCpc, totalBudget };
  }, [targetCv, targetCpa, cvr, ctr]);

  const budgetResult = useMemo(() => {
    const b = parseFloat(budget);
    const c = parseFloat(cpc);
    const cvrPct = parseFloat(rCvr) / 100;

    if ([b, c, cvrPct].some((v) => isNaN(v) || v <= 0)) return null;

    const clicks = b / c;
    const cv = clicks * cvrPct;
    const cpa = b / cv;

    return { clicks, cv, cpa };
  }, [budget, cpc, rCvr]);

  const cpaResult = useMemo(() => {
    const cv = parseFloat(cCv);
    const cpa = parseFloat(cCpa);
    const cvrPct = parseFloat(cCvr) / 100;
    const ctrPct = parseFloat(cCtr) / 100;

    if ([cv, cpa, cvrPct, ctrPct].some((v) => isNaN(v) || v <= 0)) return null;

    const clicks = cv / cvrPct;
    const imp = clicks / ctrPct;
    const calcCpc = cpa * cvrPct;
    const totalBudget = clicks * calcCpc;

    return { clicks, imp, calcCpc, totalBudget };
  }, [cCv, cCpa, cCvr, cCtr]);

  const TABS: { key: Mode; label: string }[] = [
    { key: "forward", label: "予算を逆算" },
    { key: "budget", label: "予算→CV数" },
    { key: "cpa", label: "CPA→予算" },
  ];

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setMode(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Forward mode: CV数・CPA・CVR・CTR → 予算 */}
        {mode === "forward" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField
                label="目標CV数"
                value={targetCv}
                onChange={setTargetCv}
                placeholder="100"
                suffix="件"
              />
              <InputField
                label="目標CPA"
                value={targetCpa}
                onChange={setTargetCpa}
                placeholder="5000"
                suffix="円"
              />
              <InputField
                label="CVR"
                value={cvr}
                onChange={setCvr}
                placeholder="2"
                suffix="%"
                step="0.1"
              />
              <InputField
                label="CTR"
                value={ctr}
                onChange={setCtr}
                placeholder="1"
                suffix="%"
                step="0.1"
              />
            </div>

            {forwardResult ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ResultCard
                    label="必要クリック数"
                    value={`${formatBig(forwardResult.clicks)}回`}
                    sub={`CV${formatNum(forwardResult.cv, 0)}件 ÷ CVR${cvr}%`}
                    highlight="blue"
                  />
                  <ResultCard
                    label="必要インプレッション"
                    value={`${formatBig(forwardResult.imp)}imp`}
                    sub={`クリック数 ÷ CTR${ctr}%`}
                    highlight="blue"
                  />
                  <ResultCard
                    label="目安CPC"
                    value={`¥${formatJPY(forwardResult.calcCpc)}`}
                    sub={`CPA × CVR`}
                    highlight="orange"
                  />
                  <ResultCard
                    label="必要予算"
                    value={`¥${formatJPY(forwardResult.totalBudget)}`}
                    sub={`クリック数 × CPC`}
                    highlight="green"
                  />
                </div>

                {/* Funnel */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    広告ファネル
                  </p>
                  <FunnelBar
                    label="インプレッション"
                    value={forwardResult.imp}
                    format={formatBig}
                    unit="imp"
                    color="bg-purple-400"
                    pct={100}
                  />
                  <FunnelBar
                    label="クリック"
                    value={forwardResult.clicks}
                    format={formatBig}
                    unit="回"
                    color="bg-blue-500"
                    pct={(forwardResult.clicks / forwardResult.imp) * 100 * 10}
                  />
                  <FunnelBar
                    label="CV"
                    value={forwardResult.cv}
                    format={(n) => String(Math.round(n))}
                    unit="件"
                    color="bg-green-500"
                    pct={(forwardResult.cv / forwardResult.imp) * 100 * 100}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
                有効な値を入力してください
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
              <p>必要クリック数 = 目標CV数 ÷ CVR</p>
              <p>必要インプレッション = クリック数 ÷ CTR</p>
              <p>目安CPC = 目標CPA × CVR</p>
              <p>必要予算 = クリック数 × CPC</p>
            </div>
          </>
        )}

        {/* Budget → CV mode */}
        {mode === "budget" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InputField
                label="広告予算"
                value={budget}
                onChange={setBudget}
                placeholder="500000"
                suffix="円"
              />
              <InputField
                label="CPC（クリック単価）"
                value={cpc}
                onChange={setCpc}
                placeholder="250"
                suffix="円"
              />
              <InputField
                label="CVR"
                value={rCvr}
                onChange={setRCvr}
                placeholder="2"
                suffix="%"
                step="0.1"
              />
            </div>

            {budgetResult ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <ResultCard
                    label="獲得クリック数"
                    value={`${formatBig(budgetResult.clicks)}回`}
                    sub={`予算 ÷ CPC`}
                    highlight="blue"
                  />
                  <ResultCard
                    label="獲得CV数"
                    value={`${Math.round(budgetResult.cv)}件`}
                    sub={`クリック × CVR`}
                    highlight="green"
                  />
                  <ResultCard
                    label="実績CPA"
                    value={`¥${formatJPY(budgetResult.cpa)}`}
                    sub={`予算 ÷ CV数`}
                    highlight="orange"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    広告ファネル
                  </p>
                  <FunnelBar
                    label="クリック"
                    value={budgetResult.clicks}
                    format={formatBig}
                    unit="回"
                    color="bg-blue-500"
                    pct={100}
                  />
                  <FunnelBar
                    label="CV"
                    value={budgetResult.cv}
                    format={(n) => String(Math.round(n))}
                    unit="件"
                    color="bg-green-500"
                    pct={parseFloat(rCvr)}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
                有効な値を入力してください
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
              <p>獲得クリック数 = 予算 ÷ CPC</p>
              <p>獲得CV数 = クリック数 × CVR</p>
              <p>実績CPA = 予算 ÷ CV数</p>
            </div>
          </>
        )}

        {/* CPA → budget mode */}
        {mode === "cpa" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField
                label="目標CV数"
                value={cCv}
                onChange={setCCv}
                placeholder="100"
                suffix="件"
              />
              <InputField
                label="目標CPA"
                value={cCpa}
                onChange={setCCpa}
                placeholder="5000"
                suffix="円"
              />
              <InputField
                label="CVR"
                value={cCvr}
                onChange={setCCvr}
                placeholder="2"
                suffix="%"
                step="0.1"
              />
              <InputField
                label="CTR"
                value={cCtr}
                onChange={setCCtr}
                placeholder="1"
                suffix="%"
                step="0.1"
              />
            </div>

            {cpaResult ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ResultCard
                    label="必要クリック数"
                    value={`${formatBig(cpaResult.clicks)}回`}
                    highlight="blue"
                  />
                  <ResultCard
                    label="必要インプレッション"
                    value={`${formatBig(cpaResult.imp)}imp`}
                    highlight="blue"
                  />
                  <ResultCard
                    label="許容CPC上限"
                    value={`¥${formatJPY(cpaResult.calcCpc)}`}
                    sub="この単価以内に抑える"
                    highlight="orange"
                  />
                  <ResultCard
                    label="必要予算"
                    value={`¥${formatJPY(cpaResult.totalBudget)}`}
                    highlight="green"
                  />
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    広告ファネル
                  </p>
                  <FunnelBar
                    label="インプレッション"
                    value={cpaResult.imp}
                    format={formatBig}
                    unit="imp"
                    color="bg-purple-400"
                    pct={100}
                  />
                  <FunnelBar
                    label="クリック"
                    value={cpaResult.clicks}
                    format={formatBig}
                    unit="回"
                    color="bg-blue-500"
                    pct={(cpaResult.clicks / cpaResult.imp) * 100 * 10}
                  />
                  <FunnelBar
                    label="CV"
                    value={parseFloat(cCv)}
                    format={(n) => String(Math.round(n))}
                    unit="件"
                    color="bg-green-500"
                    pct={(parseFloat(cCv) / cpaResult.imp) * 100 * 100}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
                有効な値を入力してください
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
              <p>必要クリック数 = 目標CV数 ÷ CVR</p>
              <p>必要インプレッション = クリック数 ÷ CTR</p>
              <p>許容CPC上限 = 目標CPA × CVR</p>
              <p>必要予算 = クリック数 × CPC上限</p>
            </div>
          </>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この広告予算逆算ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">目標CV数・CPA・CTRから必要インプレッション・予算を逆算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この広告予算逆算ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "目標CV数・CPA・CTRから必要インプレッション・予算を逆算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
