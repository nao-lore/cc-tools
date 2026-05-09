"use client";

import { useMemo, useState, type ReactNode } from "react";

type Shape =
  | "square"
  | "rectangle"
  | "triangle"
  | "circle"
  | "trapezoid"
  | "parallelogram"
  | "rhombus"
  | "ellipse";

type LengthUnit = "mm" | "cm" | "m" | "km";
type AreaUnit = "m2" | "cm2" | "mm2" | "km2" | "tsubo" | "jo" | "a" | "ha";
type CopiedTarget = "summary" | "csv" | null;

type Fields = {
  side: string;
  width: string;
  height: string;
  base: string;
  radius: string;
  topBase: string;
  bottomBase: string;
  diagonalA: string;
  diagonalB: string;
  radiusA: string;
  radiusB: string;
};

type ShapeDef = {
  value: Shape;
  label: string;
  formula: string;
  description: string;
  examples: Partial<Fields>;
};

const SHAPES: ShapeDef[] = [
  { value: "square", label: "正方形", formula: "一辺 × 一辺", description: "一辺の長さから面積と周囲長を計算します。", examples: { side: "6" } },
  { value: "rectangle", label: "長方形", formula: "横 × 縦", description: "部屋、土地、紙面などの面積確認に使えます。", examples: { width: "12", height: "8" } },
  { value: "triangle", label: "三角形", formula: "底辺 × 高さ ÷ 2", description: "底辺と高さが分かる三角形の面積を計算します。", examples: { base: "10", height: "6" } },
  { value: "circle", label: "円", formula: "半径² × π", description: "半径から円の面積と円周を計算します。", examples: { radius: "5" } },
  { value: "trapezoid", label: "台形", formula: "(上底 + 下底) × 高さ ÷ 2", description: "上底・下底・高さから台形の面積を計算します。", examples: { topBase: "6", bottomBase: "10", height: "4" } },
  { value: "parallelogram", label: "平行四辺形", formula: "底辺 × 高さ", description: "底辺と垂直方向の高さから面積を計算します。", examples: { base: "9", height: "5" } },
  { value: "rhombus", label: "ひし形", formula: "対角線1 × 対角線2 ÷ 2", description: "2本の対角線から面積と周囲長を計算します。", examples: { diagonalA: "8", diagonalB: "6" } },
  { value: "ellipse", label: "楕円", formula: "長半径 × 短半径 × π", description: "長半径と短半径から面積と近似周囲長を計算します。", examples: { radiusA: "8", radiusB: "4" } },
];

const LENGTH_UNITS: Record<LengthUnit, { label: string; toM: number }> = {
  mm: { label: "mm", toM: 0.001 },
  cm: { label: "cm", toM: 0.01 },
  m: { label: "m", toM: 1 },
  km: { label: "km", toM: 1000 },
};

const AREA_UNITS: Record<AreaUnit, { label: string; m2: number; description: string }> = {
  m2: { label: "m²", m2: 1, description: "平方メートル" },
  cm2: { label: "cm²", m2: 0.0001, description: "平方センチメートル" },
  mm2: { label: "mm²", m2: 0.000001, description: "平方ミリメートル" },
  km2: { label: "km²", m2: 1_000_000, description: "平方キロメートル" },
  tsubo: { label: "坪", m2: 3.305785124, description: "不動産・建築の目安" },
  jo: { label: "畳", m2: 1.62, description: "不動産表示の目安" },
  a: { label: "a", m2: 100, description: "アール" },
  ha: { label: "ha", m2: 10_000, description: "ヘクタール" },
};

const DEFAULT_FIELDS: Fields = {
  side: "",
  width: "",
  height: "",
  base: "",
  radius: "",
  topBase: "",
  bottomBase: "",
  diagonalA: "",
  diagonalB: "",
  radiusA: "",
  radiusB: "",
};

const FIELD_LABELS: Record<keyof Fields, string> = {
  side: "一辺",
  width: "横",
  height: "高さ/縦",
  base: "底辺",
  radius: "半径",
  topBase: "上底",
  bottomBase: "下底",
  diagonalA: "対角線1",
  diagonalB: "対角線2",
  radiusA: "長半径",
  radiusB: "短半径",
};

function shapeDef(shape: Shape) {
  return SHAPES.find((item) => item.value === shape) ?? SHAPES[1];
}

function parseValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function positive(...values: number[]) {
  return values.every((value) => Number.isFinite(value) && value > 0);
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0";
  if (Math.abs(value) >= 1_000_000 || Math.abs(value) < 0.001) {
    return value.toExponential(4);
  }
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 4 }).format(value);
}

function areaToUnit(areaM2: number, unit: AreaUnit) {
  return areaM2 / AREA_UNITS[unit].m2;
}

function calcShape(shape: Shape, fields: Fields, lengthUnit: LengthUnit) {
  const m = LENGTH_UNITS[lengthUnit].toM;
  const n = (key: keyof Fields) => parseValue(fields[key]) * m;

  switch (shape) {
    case "square": {
      const side = n("side");
      if (!positive(side)) return null;
      return { areaM2: side * side, perimeterM: side * 4 };
    }
    case "rectangle": {
      const width = n("width");
      const height = n("height");
      if (!positive(width, height)) return null;
      return { areaM2: width * height, perimeterM: 2 * (width + height) };
    }
    case "triangle": {
      const base = n("base");
      const height = n("height");
      if (!positive(base, height)) return null;
      return { areaM2: (base * height) / 2, perimeterM: null };
    }
    case "circle": {
      const radius = n("radius");
      if (!positive(radius)) return null;
      return { areaM2: Math.PI * radius * radius, perimeterM: 2 * Math.PI * radius };
    }
    case "trapezoid": {
      const topBase = n("topBase");
      const bottomBase = n("bottomBase");
      const height = n("height");
      if (!positive(topBase, bottomBase, height)) return null;
      return { areaM2: ((topBase + bottomBase) * height) / 2, perimeterM: null };
    }
    case "parallelogram": {
      const base = n("base");
      const height = n("height");
      if (!positive(base, height)) return null;
      return { areaM2: base * height, perimeterM: null };
    }
    case "rhombus": {
      const diagonalA = n("diagonalA");
      const diagonalB = n("diagonalB");
      if (!positive(diagonalA, diagonalB)) return null;
      const side = Math.sqrt((diagonalA / 2) ** 2 + (diagonalB / 2) ** 2);
      return { areaM2: (diagonalA * diagonalB) / 2, perimeterM: side * 4 };
    }
    case "ellipse": {
      const radiusA = n("radiusA");
      const radiusB = n("radiusB");
      if (!positive(radiusA, radiusB)) return null;
      const h = ((radiusA - radiusB) ** 2) / ((radiusA + radiusB) ** 2);
      const perimeterM = Math.PI * (radiusA + radiusB) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      return { areaM2: Math.PI * radiusA * radiusB, perimeterM };
    }
  }
}

function requiredFields(shape: Shape): (keyof Fields)[] {
  switch (shape) {
    case "square":
      return ["side"];
    case "rectangle":
      return ["width", "height"];
    case "triangle":
      return ["base", "height"];
    case "circle":
      return ["radius"];
    case "trapezoid":
      return ["topBase", "bottomBase", "height"];
    case "parallelogram":
      return ["base", "height"];
    case "rhombus":
      return ["diagonalA", "diagonalB"];
    case "ellipse":
      return ["radiusA", "radiusB"];
  }
}

function makeCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export default function AreaCalculator() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [fields, setFields] = useState<Fields>({ ...DEFAULT_FIELDS, width: "12", height: "8" });
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>("m");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("m2");
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);

  const selectedShape = shapeDef(shape);
  const result = useMemo(() => calcShape(shape, fields, lengthUnit), [fields, lengthUnit, shape]);
  const required = requiredFields(shape);
  const missing = required.filter((key) => parseValue(fields[key]) <= 0);
  const error = missing.length ? `${missing.map((key) => FIELD_LABELS[key]).join("、")}を入力してください。` : "";
  const conversions = result
    ? (Object.keys(AREA_UNITS) as AreaUnit[]).map((unit) => ({
        unit,
        label: AREA_UNITS[unit].label,
        description: AREA_UNITS[unit].description,
        value: areaToUnit(result.areaM2, unit),
      }))
    : [];
  const areaValue = result ? areaToUnit(result.areaM2, areaUnit) : null;
  const summary = result
    ? [
        "面積計算結果",
        `図形: ${selectedShape.label}`,
        `公式: ${selectedShape.formula}`,
        `面積: ${formatNumber(areaValue ?? 0)} ${AREA_UNITS[areaUnit].label}`,
        `平方メートル: ${formatNumber(result.areaM2)} m²`,
        result.perimeterM !== null ? `周囲長: ${formatNumber(result.perimeterM)} m` : "周囲長: 入力値だけでは算出しません",
      ].join("\n")
    : "";
  const csv = result
    ? makeCsv([
        ["項目", "値"],
        ["図形", selectedShape.label],
        ["公式", selectedShape.formula],
        ["入力単位", lengthUnit],
        ["面積", `${formatNumber(areaValue ?? 0)} ${AREA_UNITS[areaUnit].label}`],
        ["平方メートル", `${formatNumber(result.areaM2)} m²`],
        ["周囲長m", result.perimeterM !== null ? formatNumber(result.perimeterM) : ""],
        [],
        ["単位", "値"],
        ...conversions.map((item) => [item.label, formatNumber(item.value)]),
      ])
    : "";

  function updateField(key: keyof Fields, value: string) {
    setFields((previous) => ({
      ...previous,
      [key]: value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"),
    }));
    setCopiedTarget(null);
  }

  function changeShape(nextShape: Shape) {
    setShape(nextShape);
    setFields({ ...DEFAULT_FIELDS, ...shapeDef(nextShape).examples });
    setCopiedTarget(null);
  }

  function reset() {
    setShape("rectangle");
    setFields({ ...DEFAULT_FIELDS, width: "12", height: "8" });
    setLengthUnit("m");
    setAreaUnit("m2");
    setCopiedTarget(null);
  }

  async function copyText(target: Exclude<CopiedTarget, null>, text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  }

  function downloadCsv() {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "menseki-keisan.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">図形と寸法</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">長さ単位を指定して、面積を坪・畳・haなどへ変換します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SHAPES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => changeShape(item.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  shape === item.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{selectedShape.formula}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{selectedShape.description}</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SelectField label="長さの入力単位" value={lengthUnit} onChange={(value) => setLengthUnit(value as LengthUnit)}>
              {(Object.keys(LENGTH_UNITS) as LengthUnit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {LENGTH_UNITS[unit].label}
                </option>
              ))}
            </SelectField>
            <SelectField label="面積の表示単位" value={areaUnit} onChange={(value) => setAreaUnit(value as AreaUnit)}>
              {(Object.keys(AREA_UNITS) as AreaUnit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {AREA_UNITS[unit].label}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {required.map((key) => (
              <NumberInput
                key={key}
                id={`area-${key}`}
                label={FIELD_LABELS[key]}
                unit={LENGTH_UNITS[lengthUnit].label}
                value={fields[key]}
                onChange={(value) => updateField(key, value)}
              />
            ))}
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "計算はブラウザ上で完結し、入力値を外部に送信しません。"}
          </p>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-950">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SHAPES.slice(0, 4).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => changeShape(item.value)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {!result ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">寸法を入力してください</p>
                <p className="mt-1 text-sm text-slate-500">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">面積</p>
                    <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-emerald-950">
                      {formatNumber(areaValue ?? 0)}
                      <span className="ml-1 text-lg font-semibold">{AREA_UNITS[areaUnit].label}</span>
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-medium text-emerald-700">図形</p>
                    <p className="mt-1 text-xl font-bold text-emerald-950">{selectedShape.label}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-emerald-800">基準値は {formatNumber(result.areaM2)} m² です。</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="m²" value={formatNumber(result.areaM2)} note="平方メートル" />
                <Metric label="坪" value={formatNumber(areaToUnit(result.areaM2, "tsubo"))} note="1坪=3.305785124m²" />
                <Metric label="畳" value={formatNumber(areaToUnit(result.areaM2, "jo"))} note="1畳=1.62m²目安" />
              </div>

              {result.perimeterM !== null && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">周囲長</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{formatNumber(result.perimeterM)} m</p>
                  <p className="mt-1 text-xs text-slate-500">円・楕円は近似値です。</p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-950">単位変換一覧</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {conversions.map((item) => (
                    <button
                      key={item.unit}
                      type="button"
                      onClick={() => setAreaUnit(item.unit)}
                      className={`rounded-xl border px-3 py-2 text-left transition ${
                        areaUnit === item.unit ? "border-slate-950 bg-white shadow-sm" : "border-slate-200 bg-white/70 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-950">{item.label}</span>
                        <span className="font-mono text-sm text-slate-700">{formatNumber(item.value)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyText("summary", summary)}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {copiedTarget === "summary" ? "コピーしました" : "結果をコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => copyText("csv", csv)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedTarget === "csv" ? "CSVをコピーしました" : "CSVをコピー"}
                </button>
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  CSVダウンロード
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
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900"
      >
        {children}
      </select>
    </label>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
