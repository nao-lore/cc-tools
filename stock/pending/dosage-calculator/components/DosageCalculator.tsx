"use client";

import { useState, useMemo } from "react";

type FormType = "tablet" | "liquid";

export default function DosageCalculator() {
  const [drugName, setDrugName] = useState("");
  const [dosePerKg, setDosePerKg] = useState("");
  const [weight, setWeight] = useState("");
  const [timesPerDay, setTimesPerDay] = useState("3");
  const [formType, setFormType] = useState<FormType>("tablet");
  const [tabletMg, setTabletMg] = useState("");
  const [concentration, setConcentration] = useState("");

  const result = useMemo(() => {
    const dose = parseFloat(dosePerKg);
    const wt = parseFloat(weight);
    const times = parseInt(timesPerDay, 10);

    if (!dose || !wt || !times) return null;
    if (dose <= 0 || wt <= 0 || times <= 0) return null;

    const totalDailyMg = dose * wt;
    const perDoseMg = totalDailyMg / times;

    let perDoseUnit: number | null = null;
    let unitLabel = "";

    if (formType === "tablet") {
      const mg = parseFloat(tabletMg);
      if (mg > 0) {
        perDoseUnit = perDoseMg / mg;
        unitLabel = "錠";
      }
    } else {
      const conc = parseFloat(concentration);
      if (conc > 0) {
        perDoseUnit = perDoseMg / conc;
        unitLabel = "mL";
      }
    }

    return { totalDailyMg, perDoseMg, perDoseUnit, unitLabel };
  }, [dosePerKg, weight, timesPerDay, formType, tabletMg, concentration]);

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10";

  const fmt = (n: number, digits = 2) => {
    const fixed = n.toFixed(digits);
    // trim trailing zeros after decimal
    return fixed.replace(/\.?0+$/, "") || "0";
  };

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">投与量を入力</h2>

        {/* Drug name (optional) */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">薬剤名（任意）</label>
          <input
            type="text"
            placeholder="例：アモキシシリン"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>

        {/* Dose per kg / Weight */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-muted mb-1">投与量（mg/kg/日）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="10"
                value={dosePerKg}
                onChange={(e) => setDosePerKg(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">mg/kg</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">患者体重（kg）</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="60"
                value={weight}
                onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
            </div>
          </div>
        </div>

        {/* Times per day */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">1日回数</label>
          <div className="flex gap-2">
            {(["1", "2", "3", "4"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimesPerDay(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  timesPerDay === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {t}回
              </button>
            ))}
          </div>
        </div>

        {/* Form type toggle */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">剤形</label>
          <div className="flex gap-2">
            {([
              { value: "tablet", label: "錠剤" },
              { value: "liquid", label: "内服液" },
            ] as { value: FormType; label: string }[]).map((f) => (
              <button
                key={f.value}
                onClick={() => setFormType(f.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  formType === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional: tablet or liquid */}
        {formType === "tablet" ? (
          <div>
            <label className="block text-xs text-muted mb-1">1錠あたりの含有量（mg）</label>
            <div className="relative max-w-[200px]">
              <input
                type="text"
                inputMode="decimal"
                placeholder="100"
                value={tabletMg}
                onChange={(e) => setTabletMg(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">mg</span>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-muted mb-1">濃度（mg/mL）</label>
            <div className="relative max-w-[200px]">
              <input
                type="text"
                inputMode="decimal"
                placeholder="25"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">mg/mL</span>
            </div>
          </div>
        )}
      </div>

      {/* Result card */}
      {result && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">
            計算結果{drugName ? `：${drugName}` : ""}
          </h3>
          <div className="divide-y divide-border">
            {[
              {
                label: "1日総投与量",
                value: `${fmt(result.totalDailyMg)} mg`,
              },
              {
                label: `1回投与量（1日${timesPerDay}回）`,
                value: `${fmt(result.perDoseMg)} mg`,
              },
              ...(result.perDoseUnit !== null
                ? [
                    {
                      label:
                        formType === "tablet"
                          ? `1回あたりの錠数`
                          : `1回あたりの量`,
                      value: `${fmt(result.perDoseUnit)} ${result.unitLabel}`,
                      highlight: true,
                    },
                  ]
                : []),
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className={`flex justify-between items-center py-3 ${
                  highlight ? "bg-primary/5 -mx-5 px-5 rounded-lg" : ""
                }`}
              >
                <span className="text-sm text-muted">{label}</span>
                <span
                  className={`font-mono font-semibold ${
                    highlight ? "text-primary text-lg" : "text-base"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-muted space-y-1">
            <p>体重：{weight} kg　投与量：{dosePerKg} mg/kg/日　1日{timesPerDay}回</p>
            {formType === "tablet" && tabletMg && (
              <p>1錠 {tabletMg} mg</p>
            )}
            {formType === "liquid" && concentration && (
              <p>濃度 {concentration} mg/mL</p>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
        <p className="text-sm font-bold text-yellow-800 mb-1">注意事項</p>
        <p className="text-sm text-yellow-700 leading-relaxed">
          本ツールは参考用です。実際の投与は必ず医師・薬剤師にご確認ください。
          計算結果の正確性は保証されません。臨床での使用においては各施設の基準および添付文書を優先してください。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-center h-20 text-muted text-sm">
        広告
      </div>
    </div>
  );
}
