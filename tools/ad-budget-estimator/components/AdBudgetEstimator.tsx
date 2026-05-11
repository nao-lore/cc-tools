"use client";

import { useMemo, useState } from "react";

type Mode = "reverse" | "budget" | "roas";

const EXAMPLES = [
  { label: "B2Bリード", cv: "40", cpa: "12000", cvr: "2", ctr: "1.2", budget: "480000", cpc: "240", aov: "200000", closeRate: "15" },
  { label: "EC販売", cv: "300", cpa: "1800", cvr: "3.5", ctr: "1.8", budget: "540000", cpc: "63", aov: "8000", closeRate: "100" },
  { label: "資料請求", cv: "120", cpa: "5000", cvr: "2.5", ctr: "1", budget: "600000", cpc: "125", aov: "50000", closeRate: "10" },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanNumericInput(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function formatYen(value: number) {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return Math.round(value).toLocaleString("ja-JP");
}

function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function AdBudgetEstimator() {
  const [mode, setMode] = useState<Mode>("reverse");
  const [targetCv, setTargetCv] = useState("100");
  const [targetCpa, setTargetCpa] = useState("5000");
  const [cvr, setCvr] = useState("2");
  const [ctr, setCtr] = useState("1");
  const [budget, setBudget] = useState("500000");
  const [cpc, setCpc] = useState("250");
  const [avgOrderValue, setAvgOrderValue] = useState("20000");
  const [closeRate, setCloseRate] = useState("100");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const cv = parseNumber(targetCv);
    const cpa = parseNumber(targetCpa);
    const cvrRate = parseNumber(cvr) / 100;
    const ctrRate = parseNumber(ctr) / 100;
    const budgetValue = parseNumber(budget);
    const cpcValue = parseNumber(cpc);
    const aov = parseNumber(avgOrderValue);
    const close = parseNumber(closeRate) / 100;

    if (mode === "reverse") {
      if ([cv, cpa, cvrRate, ctrRate].some((value) => value <= 0)) return null;
      const clicks = cv / cvrRate;
      const impressions = clicks / ctrRate;
      const allowedCpc = cpa * cvrRate;
      const requiredBudget = cv * cpa;
      return { cv, clicks, impressions, cpa, cpc: allowedCpc, budget: requiredBudget, revenue: cv * aov * close };
    }

    if (mode === "budget") {
      if ([budgetValue, cpcValue, cvrRate, ctrRate].some((value) => value <= 0)) return null;
      const clicks = budgetValue / cpcValue;
      const cvFromBudget = clicks * cvrRate;
      const impressions = clicks / ctrRate;
      const cpaFromBudget = budgetValue / cvFromBudget;
      return { cv: cvFromBudget, clicks, impressions, cpa: cpaFromBudget, cpc: cpcValue, budget: budgetValue, revenue: cvFromBudget * aov * close };
    }

    if ([budgetValue, cpcValue, cvrRate, ctrRate, aov, close].some((value) => value <= 0)) return null;
    const clicks = budgetValue / cpcValue;
    const cvFromBudget = clicks * cvrRate;
    const impressions = clicks / ctrRate;
    const revenue = cvFromBudget * aov * close;
    const roas = budgetValue > 0 ? (revenue / budgetValue) * 100 : 0;
    const cpaFromBudget = budgetValue / cvFromBudget;
    return { cv: cvFromBudget, clicks, impressions, cpa: cpaFromBudget, cpc: cpcValue, budget: budgetValue, revenue, roas };
  }, [avgOrderValue, budget, closeRate, cpc, ctr, cvr, mode, targetCpa, targetCv]);

  const error = useMemo(() => {
    if (!result) return "0より大きい数値を入力してください。";
    if (parseNumber(cvr) > 100) return "CVRは100%以下で入力してください。";
    if (parseNumber(ctr) > 100) return "CTRは100%以下で入力してください。";
    if (parseNumber(closeRate) > 100) return "成約率は100%以下で入力してください。";
    return "";
  }, [closeRate, ctr, cvr, result]);

  function update(setter: (value: string) => void, value: string) {
    setter(cleanNumericInput(value));
    setCopied(false);
  }

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setTargetCv(example.cv);
    setTargetCpa(example.cpa);
    setCvr(example.cvr);
    setCtr(example.ctr);
    setBudget(example.budget);
    setCpc(example.cpc);
    setAvgOrderValue(example.aov);
    setCloseRate(example.closeRate);
    setCopied(false);
  }

  function reset() {
    setMode("reverse");
    setTargetCv("100");
    setTargetCpa("5000");
    setCvr("2");
    setCtr("1");
    setBudget("500000");
    setCpc("250");
    setAvgOrderValue("20000");
    setCloseRate("100");
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    const lines = [
      `広告予算: ${formatYen(result.budget)}`,
      `CV: ${formatCount(result.cv)}件`,
      `CPA: ${formatYen(result.cpa)}`,
      `クリック: ${formatCount(result.clicks)}回`,
      `インプレッション: ${formatCount(result.impressions)}imp`,
      `CPC: ${formatYen(result.cpc)}`,
      "※概算。媒体最適化、学習期間、計測ずれ、税抜/税込、手数料は別途確認。",
    ];
    if (mode === "roas") {
      lines.splice(6, 0, `売上目安: ${formatYen(result.revenue)}`);
    }
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">広告条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                CV、CPA、CVR、CTR、CPCから広告予算とファネル規模を概算します。
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {[
              { key: "reverse", label: "予算逆算" },
              { key: "budget", label: "予算からCV" },
              { key: "roas", label: "ROAS" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key as Mode)}
                className={`rounded-lg px-2 py-2 text-sm font-semibold ${
                  mode === item.key ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {mode === "reverse" && (
              <>
                <NumberInput id="target-cv" label="目標CV数" value={targetCv} unit="件" onChange={(value) => update(setTargetCv, value)} />
                <NumberInput id="target-cpa" label="目標CPA" value={targetCpa} unit="円" onChange={(value) => update(setTargetCpa, value)} />
              </>
            )}

            {(mode === "budget" || mode === "roas") && (
              <>
                <NumberInput id="ad-budget" label="広告予算" value={budget} unit="円" onChange={(value) => update(setBudget, value)} />
                <NumberInput id="ad-cpc" label="CPC" value={cpc} unit="円" onChange={(value) => update(setCpc, value)} />
              </>
            )}

            <NumberInput id="ad-cvr" label="CVR" value={cvr} unit="%" onChange={(value) => update(setCvr, value)} />
            <NumberInput id="ad-ctr" label="CTR" value={ctr} unit="%" onChange={(value) => update(setCtr, value)} />

            {mode === "roas" && (
              <>
                <NumberInput id="avg-order-value" label="平均売上単価" value={avgOrderValue} unit="円" onChange={(value) => update(setAvgOrderValue, value)} />
                <NumberInput id="close-rate" label="成約率" value={closeRate} unit="%" onChange={(value) => update(setCloseRate, value)} />
              </>
            )}
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "計算はブラウザ上で完結し、入力値は外部に送信されません。"}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            媒体の学習期間、入札戦略、重複計測、税抜/税込、制作費、LP改善費、代理店手数料は含みません。実績値でこまめに更新してください。
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {!result ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">入力値を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">0より大きい数値を入れると結果が表示されます。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-800">広告予算</p>
                <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-emerald-950">
                  {formatYen(result.budget)}
                </p>
                <p className="mt-2 text-sm text-emerald-800">
                  CPAとCV目標、または予算入力から算出した概算です。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryCard label="CV数" value={`${formatCount(result.cv)}件`} note="想定コンバージョン数" />
                <SummaryCard label="CPA" value={formatYen(result.cpa)} note="広告費 ÷ CV" />
                <SummaryCard label="クリック" value={`${formatCount(result.clicks)}回`} note="CV ÷ CVR" />
                <SummaryCard label="インプレッション" value={`${formatCount(result.impressions)}imp`} note="クリック ÷ CTR" />
                <SummaryCard label="CPC" value={formatYen(result.cpc)} note="クリック単価" />
                {mode === "roas" && (
                  <SummaryCard label="売上目安" value={formatYen(result.revenue)} note="平均売上単価と成約率から概算" />
                )}
                {typeof result.roas === "number" && (
                  <SummaryCard label="ROAS" value={formatPct(result.roas)} note="売上 ÷ 広告費" />
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-950">ファネル</h2>
                <div className="mt-4 space-y-3">
                  <FunnelRow label="インプレッション" value={`${formatCount(result.impressions)}imp`} width={100} tone="bg-violet-500" />
                  <FunnelRow label="クリック" value={`${formatCount(result.clicks)}回`} width={Math.min(100, Math.max(8, (result.clicks / result.impressions) * 1000))} tone="bg-sky-500" />
                  <FunnelRow label="CV" value={`${formatCount(result.cv)}件`} width={Math.min(100, Math.max(8, (result.cv / result.clicks) * 100))} tone="bg-emerald-500" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {copied ? "コピーしました" : "結果をコピー"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  入力をクリア
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function NumberInput({
  id,
  label,
  value,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  unit: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex min-w-14 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function FunnelRow({ label, value, width, tone }: { label: string; value: string; width: number; tone: string }) {
  return (
    <div className="grid grid-cols-[92px_1fr_110px] items-center gap-3">
      <div className="text-right text-xs text-slate-500">{label}</div>
      <div className="h-4 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
      <div className="text-xs font-semibold text-slate-700">{value}</div>
    </div>
  );
}
