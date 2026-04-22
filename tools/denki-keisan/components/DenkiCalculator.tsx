"use client";

import { useState, useCallback, useMemo } from "react";

interface Appliance {
  id: string;
  name: string;
  watt: string;
  hours: string;
}

interface ApplianceResult {
  dailyKwh: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
}

const PRESETS = [
  { name: "エアコン", watt: "1000" },
  { name: "冷蔵庫", watt: "150" },
  { name: "テレビ", watt: "100" },
  { name: "洗濯機", watt: "500" },
  { name: "ドライヤー", watt: "1200" },
  { name: "電子レンジ", watt: "1000" },
];

function newAppliance(name = "", watt = ""): Appliance {
  return {
    id: crypto.randomUUID(),
    name,
    watt,
    hours: "",
  };
}

function calcAppliance(appliance: Appliance, unitPrice: number): ApplianceResult {
  const watt = parseFloat(appliance.watt) || 0;
  const hours = parseFloat(appliance.hours) || 0;
  const dailyKwh = (watt * hours) / 1000;
  const dailyCost = dailyKwh * unitPrice;
  return {
    dailyKwh,
    dailyCost,
    monthlyCost: dailyCost * 30,
    yearlyCost: dailyCost * 365,
  };
}

function formatYen(value: number): string {
  if (value < 1) return value.toFixed(1);
  return Math.round(value).toLocaleString("ja-JP");
}

function formatKwh(value: number): string {
  return value.toFixed(2);
}

function ResultBadge({ label, value, unit, highlight }: { label: string; value: string; unit: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg p-3 ${highlight ? "bg-primary/10" : "bg-accent"}`}>
      <span className="text-xs text-muted mb-1">{label}</span>
      <span className={`text-lg font-bold font-mono ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
        <span className="text-xs font-normal ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function ApplianceCard({
  appliance,
  index,
  canRemove,
  unitPrice,
  onChange,
  onRemove,
}: {
  appliance: Appliance;
  index: number;
  canRemove: boolean;
  unitPrice: number;
  onChange: (id: string, updates: Partial<Appliance>) => void;
  onRemove: (id: string) => void;
}) {
  const result = useMemo(() => calcAppliance(appliance, unitPrice), [appliance, unitPrice]);
  const hasValues = (parseFloat(appliance.watt) || 0) > 0 && (parseFloat(appliance.hours) || 0) > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder="家電名（例: エアコン）"
            value={appliance.name}
            onChange={(e) => onChange(appliance.id, { name: e.target.value })}
            className="flex-1 min-w-0 text-sm border-b border-border bg-transparent py-1 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(appliance.id)}
            className="ml-3 text-muted hover:text-danger transition-colors text-lg leading-none"
            aria-label="削除"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1">消費電力（W）</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={appliance.watt}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, "");
              onChange(appliance.id, { watt: v });
            }}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1">使用時間（時間/日）</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={appliance.hours}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, "");
              onChange(appliance.id, { hours: v });
            }}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>
      </div>

      {hasValues && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <ResultBadge label="消費電力量" value={formatKwh(result.dailyKwh)} unit="kWh/日" />
          <ResultBadge label="1日の電気代" value={formatYen(result.dailyCost)} unit="円" highlight />
          <ResultBadge label="1ヶ月の電気代" value={formatYen(result.monthlyCost)} unit="円" />
          <ResultBadge label="1年の電気代" value={formatYen(result.yearlyCost)} unit="円" />
        </div>
      )}
    </div>
  );
}

export default function DenkiCalculator() {
  const [appliances, setAppliances] = useState<Appliance[]>([newAppliance()]);
  const [unitPrice, setUnitPrice] = useState("31");

  const handleChange = useCallback((id: string, updates: Partial<Appliance>) => {
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    setAppliances((prev) => [...prev, newAppliance()]);
  }, []);

  const handlePreset = useCallback((preset: { name: string; watt: string }) => {
    setAppliances((prev) => [...prev, newAppliance(preset.name, preset.watt)]);
  }, []);

  const price = parseFloat(unitPrice) || 31;

  const totals = useMemo(() => {
    return appliances.reduce(
      (acc, a) => {
        const r = calcAppliance(a, price);
        return {
          dailyKwh: acc.dailyKwh + r.dailyKwh,
          dailyCost: acc.dailyCost + r.dailyCost,
          monthlyCost: acc.monthlyCost + r.monthlyCost,
          yearlyCost: acc.yearlyCost + r.yearlyCost,
        };
      },
      { dailyKwh: 0, dailyCost: 0, monthlyCost: 0, yearlyCost: 0 }
    );
  }, [appliances, price]);

  const hasAnyValues = appliances.some(
    (a) => (parseFloat(a.watt) || 0) > 0 && (parseFloat(a.hours) || 0) > 0
  );

  return (
    <div className="space-y-4">
      {/* Unit price setting */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-medium text-foreground mb-2">
          電気料金単価（円/kWh）
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            value={unitPrice}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, "");
              setUnitPrice(v);
            }}
            className="w-32 px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
          <span className="text-sm text-muted">円/kWh</span>
          <span className="text-xs text-muted ml-auto">全国平均: 約31円/kWh（2024年）</span>
        </div>
      </div>

      {/* Presets */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-sm font-medium text-foreground mb-3">プリセットから追加</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePreset(preset)}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:border-primary hover:text-primary transition-colors bg-accent text-foreground"
            >
              {preset.name}
              <span className="ml-1 text-xs text-muted">({preset.watt}W)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Appliance cards */}
      {appliances.map((appliance, i) => (
        <ApplianceCard
          key={appliance.id}
          appliance={appliance}
          index={i}
          canRemove={appliances.length > 1}
          unitPrice={price}
          onChange={handleChange}
          onRemove={handleRemove}
        />
      ))}

      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm font-medium"
      >
        ＋ 家電を追加
      </button>

      {/* Total summary */}
      {hasAnyValues && appliances.length > 1 && (
        <div className="bg-card border-2 border-primary/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            合計
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ResultBadge label="消費電力量合計" value={formatKwh(totals.dailyKwh)} unit="kWh/日" />
            <ResultBadge label="1日の合計電気代" value={formatYen(totals.dailyCost)} unit="円" highlight />
            <ResultBadge label="1ヶ月の合計電気代" value={formatYen(totals.monthlyCost)} unit="円" />
            <ResultBadge label="1年の合計電気代" value={formatYen(totals.yearlyCost)} unit="円" />
          </div>
        </div>
      )}
    </div>
  );
}
