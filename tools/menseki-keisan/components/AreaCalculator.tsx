"use client";

import { useState, useMemo } from "react";

type Shape =
  | "square"
  | "rectangle"
  | "triangle"
  | "circle"
  | "trapezoid"
  | "parallelogram"
  | "rhombus"
  | "ellipse";

type Unit = "m2" | "cm2" | "mm2" | "km2" | "tsubo" | "jo" | "a" | "ha";

const SHAPES: { value: Shape; label: string; desc: string }[] = [
  { value: "square", label: "正方形", desc: "一辺の長さ" },
  { value: "rectangle", label: "長方形", desc: "縦×横" },
  { value: "triangle", label: "三角形", desc: "底辺×高さ÷2" },
  { value: "circle", label: "円", desc: "半径²×π" },
  { value: "trapezoid", label: "台形", desc: "(上底+下底)×高さ÷2" },
  { value: "parallelogram", label: "平行四辺形", desc: "底辺×高さ" },
  { value: "rhombus", label: "ひし形", desc: "対角線×対角線÷2" },
  { value: "ellipse", label: "楕円", desc: "長半径×短半径×π" },
];

const UNITS: { value: Unit; label: string }[] = [
  { value: "m2", label: "m²" },
  { value: "cm2", label: "cm²" },
  { value: "mm2", label: "mm²" },
  { value: "km2", label: "km²" },
  { value: "tsubo", label: "坪" },
  { value: "jo", label: "畳" },
  { value: "a", label: "a (アール)" },
  { value: "ha", label: "ha (ヘクタール)" },
];

// All conversions relative to m²
const TO_M2: Record<Unit, number> = {
  m2: 1,
  cm2: 1e-4,
  mm2: 1e-6,
  km2: 1e6,
  tsubo: 3.30579,
  jo: 1.65290,
  a: 100,
  ha: 10000,
};

function convertArea(valueM2: number, to: Unit): number {
  return valueM2 / TO_M2[to];
}

function formatNum(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  // Use toPrecision-style: show up to 10 significant digits, strip trailing zeros
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(4);
  }
  // Up to 8 significant digits
  const str = parseFloat(n.toPrecision(8)).toString();
  return str;
}

interface Fields {
  side: string;
  width: string;
  height: string;
  base: string;
  radius: string;
  topBase: string;
  bottomBase: string;
  diag1: string;
  diag2: string;
  radiusA: string;
  radiusB: string;
}

const DEFAULT_FIELDS: Fields = {
  side: "",
  width: "",
  height: "",
  base: "",
  radius: "",
  topBase: "",
  bottomBase: "",
  diag1: "",
  diag2: "",
  radiusA: "",
  radiusB: "",
};

function numField(label: string, value: string, onChange: (v: string) => void, placeholder = "0") {
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.]/g, "");
          onChange(v);
        }}
        className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
      />
    </div>
  );
}

function calcResults(shape: Shape, f: Fields): { area: number | null; perimeter: number | null } {
  const p = (s: string) => parseFloat(s);
  const valid = (...vals: string[]) => vals.every((v) => v !== "" && parseFloat(v) > 0);

  switch (shape) {
    case "square": {
      if (!valid(f.side)) return { area: null, perimeter: null };
      const s = p(f.side);
      return { area: s * s, perimeter: 4 * s };
    }
    case "rectangle": {
      if (!valid(f.width, f.height)) return { area: null, perimeter: null };
      const w = p(f.width), h = p(f.height);
      return { area: w * h, perimeter: 2 * (w + h) };
    }
    case "triangle": {
      if (!valid(f.base, f.height)) return { area: null, perimeter: null };
      // Area only (perimeter needs all 3 sides — show area, perimeter unavailable)
      return { area: 0.5 * p(f.base) * p(f.height), perimeter: null };
    }
    case "circle": {
      if (!valid(f.radius)) return { area: null, perimeter: null };
      const r = p(f.radius);
      return { area: Math.PI * r * r, perimeter: 2 * Math.PI * r };
    }
    case "trapezoid": {
      if (!valid(f.topBase, f.bottomBase, f.height)) return { area: null, perimeter: null };
      return {
        area: 0.5 * (p(f.topBase) + p(f.bottomBase)) * p(f.height),
        perimeter: null,
      };
    }
    case "parallelogram": {
      if (!valid(f.base, f.height)) return { area: null, perimeter: null };
      return { area: p(f.base) * p(f.height), perimeter: null };
    }
    case "rhombus": {
      if (!valid(f.diag1, f.diag2)) return { area: null, perimeter: null };
      const d1 = p(f.diag1), d2 = p(f.diag2);
      const side = Math.sqrt((d1 / 2) ** 2 + (d2 / 2) ** 2);
      return { area: 0.5 * d1 * d2, perimeter: 4 * side };
    }
    case "ellipse": {
      if (!valid(f.radiusA, f.radiusB)) return { area: null, perimeter: null };
      const a = p(f.radiusA), b = p(f.radiusB);
      // Ramanujan approximation for perimeter
      const h = ((a - b) ** 2) / ((a + b) ** 2);
      const perim = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      return { area: Math.PI * a * b, perimeter: perim };
    }
    default:
      return { area: null, perimeter: null };
  }
}

export default function AreaCalculator() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [fields, setFields] = useState<Fields>(DEFAULT_FIELDS);
  const [inputUnit, setInputUnit] = useState<Unit>("m2");
  const [outputUnit, setOutputUnit] = useState<Unit>("m2");

  const setField = (key: keyof Fields) => (v: string) =>
    setFields((prev) => ({ ...prev, [key]: v }));

  // Compute in input unit, convert area to m² then to output unit
  const { area: rawArea, perimeter: rawPerim } = useMemo(
    () => calcResults(shape, fields),
    [shape, fields]
  );

  // rawArea is in inputUnit², convert to m²
  const areaM2 = useMemo(() => {
    if (rawArea === null) return null;
    return rawArea * TO_M2[inputUnit];
  }, [rawArea, inputUnit]);

  // perimeter is in inputUnit (linear), convert to output linear unit
  // We display perimeter in inputUnit (it's a length, not area)
  const perimeterDisplay = useMemo(() => {
    if (rawPerim === null) return null;
    return rawPerim;
  }, [rawPerim]);

  const areaConverted = useMemo(() => {
    if (areaM2 === null) return null;
    return convertArea(areaM2, outputUnit);
  }, [areaM2, outputUnit]);

  const allConversions = useMemo(() => {
    if (areaM2 === null) return null;
    return UNITS.map((u) => ({
      unit: u.value,
      label: u.label,
      converted: convertArea(areaM2, u.value),
    }));
  }, [areaM2]);

  const inputUnitLabel = UNITS.find((u) => u.value === inputUnit)?.label ?? "";

  const renderInputs = () => {
    switch (shape) {
      case "square":
        return numField(`一辺の長さ (${inputUnitLabel.replace("²", "")})`, fields.side, setField("side"));
      case "rectangle":
        return (
          <div className="grid grid-cols-2 gap-3">
            {numField(`横 (${inputUnitLabel.replace("²", "")})`, fields.width, setField("width"))}
            {numField(`縦 (${inputUnitLabel.replace("²", "")})`, fields.height, setField("height"))}
          </div>
        );
      case "triangle":
        return (
          <div className="grid grid-cols-2 gap-3">
            {numField(`底辺 (${inputUnitLabel.replace("²", "")})`, fields.base, setField("base"))}
            {numField(`高さ (${inputUnitLabel.replace("²", "")})`, fields.height, setField("height"))}
          </div>
        );
      case "circle":
        return numField(`半径 (${inputUnitLabel.replace("²", "")})`, fields.radius, setField("radius"));
      case "trapezoid":
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {numField(`上底 (${inputUnitLabel.replace("²", "")})`, fields.topBase, setField("topBase"))}
            {numField(`下底 (${inputUnitLabel.replace("²", "")})`, fields.bottomBase, setField("bottomBase"))}
            {numField(`高さ (${inputUnitLabel.replace("²", "")})`, fields.height, setField("height"))}
          </div>
        );
      case "parallelogram":
        return (
          <div className="grid grid-cols-2 gap-3">
            {numField(`底辺 (${inputUnitLabel.replace("²", "")})`, fields.base, setField("base"))}
            {numField(`高さ (${inputUnitLabel.replace("²", "")})`, fields.height, setField("height"))}
          </div>
        );
      case "rhombus":
        return (
          <div className="grid grid-cols-2 gap-3">
            {numField(`対角線1 (${inputUnitLabel.replace("²", "")})`, fields.diag1, setField("diag1"))}
            {numField(`対角線2 (${inputUnitLabel.replace("²", "")})`, fields.diag2, setField("diag2"))}
          </div>
        );
      case "ellipse":
        return (
          <div className="grid grid-cols-2 gap-3">
            {numField(`長半径 a (${inputUnitLabel.replace("²", "")})`, fields.radiusA, setField("radiusA"))}
            {numField(`短半径 b (${inputUnitLabel.replace("²", "")})`, fields.radiusB, setField("radiusB"))}
          </div>
        );
    }
  };

  const hasResult = areaM2 !== null && isFinite(areaM2);

  return (
    <div className="space-y-5">
      {/* Shape selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-muted mb-3">図形を選択</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
          {SHAPES.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setShape(s.value);
                setFields(DEFAULT_FIELDS);
              }}
              className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all ${
                shape === s.value
                  ? "bg-primary text-white border-primary"
                  : "bg-accent border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          公式: {SHAPES.find((s) => s.value === shape)?.desc}
        </p>
      </div>

      {/* Input unit + fields */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-muted shrink-0">入力単位</h2>
          <select
            value={inputUnit}
            onChange={(e) => {
              setInputUnit(e.target.value as Unit);
              setFields(DEFAULT_FIELDS);
            }}
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
          >
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        {renderInputs()}
      </div>

      {/* Result */}
      {hasResult && (
        <div className="bg-card border-2 border-primary/20 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            計算結果
          </h2>

          {/* Primary result with unit selector */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-accent rounded-lg px-4 py-3">
              <p className="text-xs text-muted mb-0.5">面積</p>
              <p className="text-2xl font-bold font-mono text-primary">
                {areaConverted !== null ? formatNum(areaConverted) : "—"}
              </p>
            </div>
            <select
              value={outputUnit}
              onChange={(e) => setOutputUnit(e.target.value as Unit)}
              className="px-3 py-2 border border-border rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Perimeter */}
          {perimeterDisplay !== null && (
            <div className="bg-accent rounded-lg px-4 py-3">
              <p className="text-xs text-muted mb-0.5">
                周囲長 ({inputUnitLabel.replace("²", "")})
              </p>
              <p className="text-xl font-bold font-mono text-foreground">
                {formatNum(perimeterDisplay)}
              </p>
            </div>
          )}

          {/* All unit conversions */}
          <div>
            <p className="text-xs text-muted mb-2">単位変換一覧</p>
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {allConversions?.map((u) => (
                <div
                  key={u.unit}
                  className={`flex justify-between items-center px-4 py-2.5 text-sm ${
                    u.unit === outputUnit ? "bg-primary/5" : "bg-card"
                  }`}
                >
                  <span className="text-muted">{u.label}</span>
                  <span className="font-mono font-medium">{formatNum(u.converted)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
