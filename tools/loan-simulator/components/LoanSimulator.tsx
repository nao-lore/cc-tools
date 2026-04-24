"use client";

import { useState, useMemo } from "react";

type RepaymentType = "equal-installment" | "equal-principal";

interface LoanInputs {
  principal: string;
  annualRate: string;
  years: string;
  bonusAmount: string;
  repaymentType: RepaymentType;
}

interface MonthlyResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  repaymentRatio: number | null;
}

interface YearlyRow {
  year: number;
  startBalance: number;
  principalPaid: number;
  interestPaid: number;
  endBalance: number;
}

function formatCurrency(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function calcEqualInstallment(
  principal: number,
  annualRate: number,
  months: number,
  bonusMonthlyExtra: number
): MonthlyResult & { yearlyRows: YearlyRow[] } {
  const r = annualRate / 100 / 12;
  let monthlyPayment: number;

  if (r === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment =
      (principal * r * Math.pow(1 + r, months)) /
      (Math.pow(1 + r, months) - 1);
  }

  // Build yearly amortization table
  let balance = principal;
  const yearlyRows: YearlyRow[] = [];
  const totalYears = months / 12;

  for (let y = 1; y <= totalYears; y++) {
    const startBalance = balance;
    let principalPaid = 0;
    let interestPaid = 0;

    for (let m = 1; m <= 12; m++) {
      const interest = balance * r;
      const principal_m = monthlyPayment - interest;
      interestPaid += interest;
      principalPaid += principal_m;
      balance -= principal_m;
      // Apply bonus repayment twice a year (month 6 and 12)
      if ((m === 6 || m === 12) && bonusMonthlyExtra > 0) {
        balance -= bonusMonthlyExtra;
        principalPaid += bonusMonthlyExtra;
      }
      if (balance < 0) balance = 0;
    }

    yearlyRows.push({
      year: y,
      startBalance,
      principalPaid,
      interestPaid,
      endBalance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  const totalBonus = bonusMonthlyExtra * 2 * totalYears;
  const totalPayment =
    monthlyPayment * months + totalBonus;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    repaymentRatio: null,
    yearlyRows,
  };
}

function calcEqualPrincipal(
  principal: number,
  annualRate: number,
  months: number,
  bonusMonthlyExtra: number
): MonthlyResult & { yearlyRows: YearlyRow[] } {
  const r = annualRate / 100 / 12;
  const monthlyPrincipal = principal / months;
  const firstMonthPayment = monthlyPrincipal + principal * r;

  // Build yearly amortization table
  let balance = principal;
  const yearlyRows: YearlyRow[] = [];
  const totalYears = months / 12;
  let totalPayment = 0;

  for (let y = 1; y <= totalYears; y++) {
    const startBalance = balance;
    let principalPaid = 0;
    let interestPaid = 0;

    for (let m = 1; m <= 12; m++) {
      const interest = balance * r;
      interestPaid += interest;
      principalPaid += monthlyPrincipal;
      totalPayment += monthlyPrincipal + interest;
      balance -= monthlyPrincipal;
      if ((m === 6 || m === 12) && bonusMonthlyExtra > 0) {
        balance -= bonusMonthlyExtra;
        principalPaid += bonusMonthlyExtra;
        totalPayment += bonusMonthlyExtra;
      }
      if (balance < 0) balance = 0;
    }

    yearlyRows.push({
      year: y,
      startBalance,
      principalPaid,
      interestPaid,
      endBalance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment: firstMonthPayment,
    totalPayment,
    totalInterest,
    repaymentRatio: null,
    yearlyRows,
  };
}

function ResultCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-accent border border-border"}`}
    >
      <p className="text-xs text-muted mb-1">{label}</p>
      <p
        className={`text-xl font-bold font-mono ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function LoanSimulator() {
  const [inputs, setInputs] = useState<LoanInputs>({
    principal: "",
    annualRate: "",
    years: "",
    bonusAmount: "",
    repaymentType: "equal-installment",
  });
  const [annualIncome, setAnnualIncome] = useState("");

  const set = (key: keyof LoanInputs, value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const numericInput = (value: string) => value.replace(/[^0-9.]/g, "");

  const parsed = useMemo(() => {
    const principal = parseFloat(inputs.principal.replace(/,/g, "")) * 10000;
    const annualRate = parseFloat(inputs.annualRate);
    const years = parseInt(inputs.years);
    const bonusAmount = parseFloat(inputs.bonusAmount || "0") * 10000;
    return { principal, annualRate, years, bonusAmount };
  }, [inputs]);

  const isValid = useMemo(() => {
    return (
      !isNaN(parsed.principal) &&
      parsed.principal > 0 &&
      !isNaN(parsed.annualRate) &&
      parsed.annualRate >= 0 &&
      !isNaN(parsed.years) &&
      parsed.years > 0 &&
      parsed.years <= 50
    );
  }, [parsed]);

  const result = useMemo(() => {
    if (!isValid) return null;
    const months = parsed.years * 12;
    const bonusMonthlyExtra = parsed.bonusAmount / 2;

    if (inputs.repaymentType === "equal-installment") {
      return calcEqualInstallment(
        parsed.principal,
        parsed.annualRate,
        months,
        bonusMonthlyExtra
      );
    } else {
      return calcEqualPrincipal(
        parsed.principal,
        parsed.annualRate,
        months,
        bonusMonthlyExtra
      );
    }
  }, [isValid, parsed, inputs.repaymentType]);

  const repaymentRatio = useMemo(() => {
    if (!result || !annualIncome) return null;
    const income = parseFloat(annualIncome.replace(/,/g, "")) * 10000;
    if (isNaN(income) || income <= 0) return null;
    const annualPayment = result.monthlyPayment * 12 + parsed.bonusAmount;
    return (annualPayment / income) * 100;
  }, [result, annualIncome, parsed.bonusAmount]);

  return (
    <div className="space-y-5">
      {/* Repayment Type Toggle */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-xs text-muted mb-3 font-medium">返済方式</p>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => set("repaymentType", "equal-installment")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              inputs.repaymentType === "equal-installment"
                ? "bg-primary text-white"
                : "bg-accent text-muted hover:text-foreground"
            }`}
          >
            元利均等返済
          </button>
          <button
            onClick={() => set("repaymentType", "equal-principal")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              inputs.repaymentType === "equal-principal"
                ? "bg-primary text-white"
                : "bg-accent text-muted hover:text-foreground"
            }`}
          >
            元金均等返済
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          {inputs.repaymentType === "equal-installment"
            ? "毎月の返済額が一定。住宅ローンで最も一般的な方式です。"
            : "毎月の元金返済額が一定。初期は返済額が多いが、総利息は少なくなります。"}
        </p>
      </div>

      {/* Inputs */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-base">借入条件の入力</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">
              借入金額（万円）<span className="text-danger ml-1">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="例: 3000"
              value={inputs.principal}
              onChange={(e) => set("principal", numericInput(e.target.value))}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
            <p className="text-xs text-muted mt-1 text-right">
              {inputs.principal
                ? `= ${parseFloat(inputs.principal).toLocaleString("ja-JP")} 万円`
                : ""}
            </p>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              金利（年利 %）<span className="text-danger ml-1">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="例: 1.5"
              value={inputs.annualRate}
              onChange={(e) => set("annualRate", numericInput(e.target.value))}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              返済期間（年）<span className="text-danger ml-1">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="例: 35"
              value={inputs.years}
              onChange={(e) =>
                set("years", e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              ボーナス返済額（万円/回）
              <span className="text-xs text-muted ml-1">任意</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="例: 20（年2回）"
              value={inputs.bonusAmount}
              onChange={(e) => set("bonusAmount", numericInput(e.target.value))}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
          </div>
        </div>

        {/* Annual Income for repayment ratio */}
        <div className="border-t border-border pt-4">
          <label className="block text-xs text-muted mb-1">
            年収（万円）
            <span className="text-xs text-muted ml-1">返済比率の計算に使用</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="例: 600"
            value={annualIncome}
            onChange={(e) =>
              setAnnualIncome(numericInput(e.target.value))
            }
            className="w-full sm:w-1/2 px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResultCard
              label={
                inputs.repaymentType === "equal-installment"
                  ? "毎月の返済額"
                  : "初月の返済額"
              }
              value={`¥${formatCurrency(result.monthlyPayment)}`}
              highlight
            />
            <ResultCard
              label="総返済額"
              value={`¥${formatCurrency(result.totalPayment)}`}
            />
            <ResultCard
              label="利息総額"
              value={`¥${formatCurrency(result.totalInterest)}`}
              sub={`借入額の ${((result.totalInterest / parsed.principal) * 100).toFixed(1)}%`}
            />
            <ResultCard
              label="返済比率"
              value={
                repaymentRatio !== null
                  ? `${repaymentRatio.toFixed(1)}%`
                  : "—"
              }
              sub={
                repaymentRatio !== null
                  ? repaymentRatio <= 25
                    ? "安全圏（〜25%）"
                    : repaymentRatio <= 35
                    ? "注意（〜35%）"
                    : "要注意（35%超）"
                  : "年収を入力してください"
              }
              highlight={repaymentRatio !== null && repaymentRatio > 35}
            />
          </div>

          {/* Yearly Table */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-base mb-4">返済シミュレーション表（年次）</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted pb-2 pr-3">年</th>
                    <th className="text-right text-xs text-muted pb-2 px-3">期首残高</th>
                    <th className="text-right text-xs text-muted pb-2 px-3">元金返済</th>
                    <th className="text-right text-xs text-muted pb-2 px-3">利息</th>
                    <th className="text-right text-xs text-muted pb-2 pl-3">期末残高</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.yearlyRows.map((row) => (
                    <tr key={row.year} className="hover:bg-accent/50 transition-colors">
                      <td className="py-2 pr-3 font-medium text-foreground">{row.year}年目</td>
                      <td className="py-2 px-3 text-right font-mono text-muted">
                        ¥{formatCurrency(row.startBalance)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-foreground">
                        ¥{formatCurrency(row.principalPaid)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-primary">
                        ¥{formatCurrency(row.interestPaid)}
                      </td>
                      <td className="py-2 pl-3 text-right font-mono text-muted">
                        ¥{formatCurrency(row.endBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!isValid && (inputs.principal || inputs.annualRate || inputs.years) && (
        <p className="text-sm text-muted text-center py-2">
          借入金額・金利・返済期間を正しく入力してください
        </p>
      )}

      {/* FAQ */}
      <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "元利均等返済と元金均等返済はどちらが得ですか？",
              a: "総返済額は元金均等返済の方が少なくなります。ただし元金均等は返済初期の月額が高く、審査上の返済比率も不利になる場合があります。資金に余裕がある方には元金均等、毎月の負担を一定にしたい方には元利均等が向いています。",
            },
            {
              q: "返済比率の目安はどのくらいですか？",
              a: "一般的に年収の 25% 以内が安全圏とされています。住宅ローン審査では多くの金融機関が 35% 以内を基準としています。このシミュレーターでは年収を入力すると返済比率を自動計算します。",
            },
            {
              q: "ボーナス返済を設定するメリットは？",
              a: "月々の返済負担を抑えながら、ボーナス時に多く返済できます。ただしボーナスが減額・不支給になるリスクもあります。安定した収入が見込める場合のみ設定することをお勧めします。",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <p className="text-foreground font-bold text-sm mb-1">{faq.q}</p>
              <p className="text-muted text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "元利均等返済と元金均等返済はどちらが得ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "総返済額は元金均等返済の方が少なくなります。ただし元金均等は返済初期の月額が高く、審査上の返済比率も不利になる場合があります。" },
              },
              {
                "@type": "Question",
                "name": "返済比率の目安はどのくらいですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "一般的に年収の 25% 以内が安全圏とされています。住宅ローン審査では多くの金融機関が 35% 以内を基準としています。" },
              },
              {
                "@type": "Question",
                "name": "ボーナス返済を設定するメリットは？",
                "acceptedAnswer": { "@type": "Answer", "text": "月々の返済負担を抑えながら、ボーナス時に多く返済できます。ただしボーナスが減額・不支給になるリスクもあります。安定した収入が見込める場合のみ設定することをお勧めします。" },
              },
            ],
          }),
        }}
      />

      {/* 関連ツール */}
      <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/risoku-keisan", label: "利息計算機", desc: "元本・金利・期間から利息を計算" },
            { href: "/tsumitate-sim", label: "積立シミュレーター", desc: "毎月の積立で将来の資産をシミュレーション" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-accent border border-border rounded-xl p-3 hover:border-primary transition-colors"
            >
              <p className="text-foreground font-bold text-sm">{link.label}</p>
              <p className="text-muted text-xs mt-0.5">{link.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
