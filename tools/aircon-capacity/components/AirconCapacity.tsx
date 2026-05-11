"use client";

import { useMemo, useState } from "react";

type Direction = "south" | "east" | "west" | "north";
type Floor = "first" | "middle" | "top";
type Insulation = "high" | "standard" | "low";
type Ceiling = "standard" | "high";
type WindowSize = "small" | "normal" | "large";
type Climate = "mild" | "hot" | "cold";

type CapacityClass = {
  kw: number;
  maxTatami: number;
  label: string;
};

const CAPACITY_CLASSES: CapacityClass[] = [
  { kw: 2.2, maxTatami: 6, label: "主に6畳" },
  { kw: 2.5, maxTatami: 8, label: "主に8畳" },
  { kw: 2.8, maxTatami: 10, label: "主に10畳" },
  { kw: 3.6, maxTatami: 12, label: "主に12畳" },
  { kw: 4.0, maxTatami: 14, label: "主に14畳" },
  { kw: 5.6, maxTatami: 18, label: "主に18畳" },
  { kw: 6.3, maxTatami: 20, label: "主に20畳" },
  { kw: 7.1, maxTatami: 23, label: "主に23畳" },
  { kw: 8.0, maxTatami: 26, label: "主に26畳" },
  { kw: 9.0, maxTatami: 29, label: "主に29畳" },
];

const DIRECTIONS: Array<{ key: Direction; label: string; multiplier: number; note: string }> = [
  { key: "south", label: "南", multiplier: 1.08, note: "日射が入りやすい" },
  { key: "east", label: "東", multiplier: 1.04, note: "朝の日射を考慮" },
  { key: "west", label: "西", multiplier: 1.12, note: "午後の日射が強い" },
  { key: "north", label: "北", multiplier: 1.0, note: "日射負荷は小さめ" },
];

const FLOORS: Array<{ key: Floor; label: string; multiplier: number; note: string }> = [
  { key: "first", label: "1階", multiplier: 1.0, note: "標準" },
  { key: "middle", label: "2階以上", multiplier: 1.03, note: "やや熱がこもる" },
  { key: "top", label: "最上階", multiplier: 1.12, note: "屋根からの熱を考慮" },
];

const INSULATIONS: Array<{ key: Insulation; label: string; multiplier: number; note: string }> = [
  { key: "high", label: "高断熱", multiplier: 0.9, note: "新しめ・複層ガラスなど" },
  { key: "standard", label: "普通", multiplier: 1.0, note: "一般的な住宅" },
  { key: "low", label: "低断熱", multiplier: 1.18, note: "古い建物・隙間風あり" },
];

const CEILINGS: Array<{ key: Ceiling; label: string; multiplier: number; note: string }> = [
  { key: "standard", label: "標準2.4m", multiplier: 1.0, note: "一般的な天井高" },
  { key: "high", label: "高め2.7m+", multiplier: 1.08, note: "空間体積を考慮" },
];

const WINDOWS: Array<{ key: WindowSize; label: string; multiplier: number; note: string }> = [
  { key: "small", label: "小さめ", multiplier: 0.96, note: "窓が少ない" },
  { key: "normal", label: "普通", multiplier: 1.0, note: "標準" },
  { key: "large", label: "大きい", multiplier: 1.1, note: "掃き出し窓・大開口" },
];

const CLIMATES: Array<{ key: Climate; label: string; multiplier: number; note: string }> = [
  { key: "mild", label: "温暖・標準", multiplier: 1.0, note: "標準的な地域" },
  { key: "hot", label: "猛暑・西日重視", multiplier: 1.08, note: "冷房余裕を重視" },
  { key: "cold", label: "寒冷地・暖房重視", multiplier: 1.15, note: "暖房能力も考慮" },
];

const EXAMPLES = [
  {
    label: "10畳リビング",
    roomTatami: "10",
    direction: "south" as Direction,
    floor: "middle" as Floor,
    insulation: "standard" as Insulation,
    ceiling: "standard" as Ceiling,
    windowSize: "normal" as WindowSize,
    climate: "mild" as Climate,
  },
  {
    label: "西向き最上階14畳",
    roomTatami: "14",
    direction: "west" as Direction,
    floor: "top" as Floor,
    insulation: "standard" as Insulation,
    ceiling: "standard" as Ceiling,
    windowSize: "large" as WindowSize,
    climate: "hot" as Climate,
  },
  {
    label: "高断熱8畳寝室",
    roomTatami: "8",
    direction: "north" as Direction,
    floor: "first" as Floor,
    insulation: "high" as Insulation,
    ceiling: "standard" as Ceiling,
    windowSize: "small" as WindowSize,
    climate: "mild" as Climate,
  },
];

function numberFrom(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function format(value: number, digits = 1) {
  return value.toFixed(digits);
}

function findClass(effectiveTatami: number): CapacityClass {
  return CAPACITY_CLASSES.find((item) => effectiveTatami <= item.maxTatami) ?? CAPACITY_CLASSES[CAPACITY_CLASSES.length - 1];
}

function getNextClass(current: CapacityClass) {
  const index = CAPACITY_CLASSES.findIndex((item) => item.kw === current.kw);
  return CAPACITY_CLASSES[index + 1];
}

function getOption<T extends string>(items: Array<{ key: T; multiplier: number; label: string; note: string }>, key: T) {
  return items.find((item) => item.key === key) ?? items[0];
}

function inputError(roomTatami: number, unitPrice: number, hoursPerDay: number, cop: number) {
  if (!roomTatami) return "部屋の畳数を入力してください。";
  if (roomTatami < 3 || roomTatami > 40) return "畳数は 3〜40畳 の範囲で入力してください。";
  if (unitPrice < 0 || unitPrice > 100) return "電気単価は 0〜100円/kWh の範囲で入力してください。";
  if (hoursPerDay < 0 || hoursPerDay > 24) return "使用時間は 0〜24時間/日 の範囲で入力してください。";
  if (cop < 1.5 || cop > 7) return "効率目安は 1.5〜7.0 の範囲で入力してください。";
  return "";
}

function sanitizeDecimal(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

type Result = {
  baseTatami: number;
  effectiveTatami: number;
  multiplier: number;
  selected: CapacityClass;
  nextClass?: CapacityClass;
  electricityKw: number;
  monthlyCost: number;
  status: string;
  statusTone: string;
};

function buildCopyText(result: Result, roomTatami: number) {
  return [
    `エアコン適正容量の目安`,
    `部屋: ${format(roomTatami)}畳`,
    `補正後の目安: ${format(result.effectiveTatami)}畳相当`,
    `推奨クラス: ${result.selected.label} / 冷房能力 ${result.selected.kw.toFixed(1)}kW`,
    `月の電気代目安: 約${result.monthlyCost.toLocaleString()}円`,
    result.nextClass ? `余裕を見るなら: ${result.nextClass.label} / ${result.nextClass.kw.toFixed(1)}kW` : "大型クラスの個別確認を推奨",
  ].join("\n");
}

export default function AirconCapacity() {
  const [roomTatami, setRoomTatami] = useState("10");
  const [direction, setDirection] = useState<Direction>("south");
  const [floor, setFloor] = useState<Floor>("middle");
  const [insulation, setInsulation] = useState<Insulation>("standard");
  const [ceiling, setCeiling] = useState<Ceiling>("standard");
  const [windowSize, setWindowSize] = useState<WindowSize>("normal");
  const [climate, setClimate] = useState<Climate>("mild");
  const [unitPrice, setUnitPrice] = useState("31");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [efficiency, setEfficiency] = useState("3.0");
  const [copied, setCopied] = useState(false);

  const roomTatamiValue = numberFrom(roomTatami);
  const unitPriceValue = numberFrom(unitPrice);
  const hoursPerDayValue = numberFrom(hoursPerDay);
  const efficiencyValue = numberFrom(efficiency);
  const error = inputError(roomTatamiValue, unitPriceValue, hoursPerDayValue, efficiencyValue);

  const result = useMemo<Result | null>(() => {
    if (error) return null;

    const factors = [
      getOption(DIRECTIONS, direction).multiplier,
      getOption(FLOORS, floor).multiplier,
      getOption(INSULATIONS, insulation).multiplier,
      getOption(CEILINGS, ceiling).multiplier,
      getOption(WINDOWS, windowSize).multiplier,
      getOption(CLIMATES, climate).multiplier,
    ];
    const multiplier = factors.reduce((total, factor) => total * factor, 1);
    const effectiveTatami = roomTatamiValue * multiplier;
    const selected = findClass(effectiveTatami);
    const nextClass = getNextClass(selected);
    const electricityKw = selected.kw / efficiencyValue;
    const monthlyCost = Math.round(electricityKw * hoursPerDayValue * 30 * unitPriceValue);
    const margin = selected.maxTatami - effectiveTatami;
    const isBorderline = margin <= 0.7 || multiplier >= 1.28;

    return {
      baseTatami: roomTatamiValue,
      effectiveTatami,
      multiplier,
      selected,
      nextClass,
      electricityKw,
      monthlyCost,
      status: isBorderline ? "境界に近い条件" : "標準的な余裕あり",
      statusTone: isBorderline ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }, [
    ceiling,
    climate,
    direction,
    efficiencyValue,
    error,
    floor,
    hoursPerDayValue,
    insulation,
    roomTatamiValue,
    unitPriceValue,
    windowSize,
  ]);

  function reset() {
    setRoomTatami("10");
    setDirection("south");
    setFloor("middle");
    setInsulation("standard");
    setCeiling("standard");
    setWindowSize("normal");
    setClimate("mild");
    setUnitPrice("31");
    setHoursPerDay("8");
    setEfficiency("3.0");
    setCopied(false);
  }

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setRoomTatami(example.roomTatami);
    setDirection(example.direction);
    setFloor(example.floor);
    setInsulation(example.insulation);
    setCeiling(example.ceiling);
    setWindowSize(example.windowSize);
    setClimate(example.climate);
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(buildCopyText(result, roomTatamiValue));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">部屋条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">畳数だけでなく、西日・最上階・断熱・窓の大きさを補正して容量を見ます。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-fit whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <NumberField label="部屋の広さ" value={roomTatami} onChange={setRoomTatami} suffix="畳" />
            <NumberField label="電気単価" value={unitPrice} onChange={setUnitPrice} suffix="円/kWh" />
            <NumberField label="使用時間" value={hoursPerDay} onChange={setHoursPerDay} suffix="時間/日" />
            <NumberField label="効率目安" value={efficiency} onChange={setEfficiency} suffix="COP" />
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "電気代は「冷暖房能力 ÷ COP × 使用時間 × 電気単価」の概算です。"}
          </p>

          <div className="mt-6 grid gap-5">
            <OptionGroup label="窓の向き" items={DIRECTIONS} value={direction} onChange={setDirection} />
            <OptionGroup label="階数" items={FLOORS} value={floor} onChange={setFloor} />
            <OptionGroup label="断熱性能" items={INSULATIONS} value={insulation} onChange={setInsulation} />
            <OptionGroup label="天井高" items={CEILINGS} value={ceiling} onChange={setCeiling} />
            <OptionGroup label="窓の大きさ" items={WINDOWS} value={windowSize} onChange={setWindowSize} />
            <OptionGroup label="地域・重視条件" items={CLIMATES} value={climate} onChange={setClimate} />
          </div>

          <div className="mt-6">
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
        </div>

        <div className="p-5 sm:p-6">
          {!result ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">入力を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">畳数・電気単価・使用時間・効率を有効な範囲で入力すると結果が出ます。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className={`rounded-2xl border p-5 ${result.statusTone}`}>
                <p className="text-sm font-medium opacity-80">推奨エアコンクラス</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                  {result.selected.label}
                  <span className="ml-2 font-mono text-3xl">{result.selected.kw.toFixed(1)}kW</span>
                </p>
                <p className="mt-2 text-sm font-medium">{result.status}</p>
              </div>

              <CapacityGauge effectiveTatami={result.effectiveTatami} selected={result.selected} />

              <div className="grid gap-3">
                <ResultCard label="補正後の広さ" value={`${format(result.effectiveTatami)}畳相当`} note={`補正係数 ${result.multiplier.toFixed(2)}倍`} />
                <ResultCard label="電気代目安" value={`約 ${result.monthlyCost.toLocaleString()}円/月`} note={`${hoursPerDayValue}時間/日・30日利用の概算`} />
                <ResultCard label="消費電力の概算" value={`${result.electricityKw.toFixed(2)}kW`} note="冷暖房能力 ÷ COP で単純化" />
                <ResultCard
                  label="余裕を見るなら"
                  value={result.nextClass ? `${result.nextClass.label} / ${result.nextClass.kw.toFixed(1)}kW` : "販売店で個別確認"}
                  note="西日・最上階・寒冷地は一段上も候補"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-950">補正の内訳</h3>
                <div className="mt-3 space-y-2">
                  <FactorRow label="窓の向き" item={getOption(DIRECTIONS, direction)} />
                  <FactorRow label="階数" item={getOption(FLOORS, floor)} />
                  <FactorRow label="断熱" item={getOption(INSULATIONS, insulation)} />
                  <FactorRow label="天井高" item={getOption(CEILINGS, ceiling)} />
                  <FactorRow label="窓" item={getOption(WINDOWS, windowSize)} />
                  <FactorRow label="地域" item={getOption(CLIMATES, climate)} />
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
                  条件を初期化
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(sanitizeDecimal(event.target.value))}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}

function OptionGroup<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: Array<{ key: T; label: string; note: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`rounded-xl border p-3 text-left transition ${
              value === item.key ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className={`mt-1 block text-xs ${value === item.key ? "text-slate-300" : "text-slate-500"}`}>{item.note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function FactorRow({
  label,
  item,
}: {
  label: string;
  item: { label: string; note: string; multiplier: number };
}) {
  const delta = Math.round((item.multiplier - 1) * 100);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-slate-800">{label}: {item.label}</span>
        <span className="ml-2 text-xs text-slate-500">{item.note}</span>
      </div>
      <span className={delta >= 0 ? "font-mono text-amber-700" : "font-mono text-emerald-700"}>
        {delta >= 0 ? "+" : ""}
        {delta}%
      </span>
    </div>
  );
}

function CapacityGauge({ effectiveTatami, selected }: { effectiveTatami: number; selected: CapacityClass }) {
  const pct = Math.min(100, Math.max(0, (effectiveTatami / selected.maxTatami) * 100));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">選択クラス内の負荷</span>
        <span className="font-mono text-slate-500">{format(effectiveTatami)} / {selected.maxTatami}畳</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${pct >= 90 ? "bg-amber-500" : "bg-sky-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">90%を超える場合は、在室人数・家電発熱・キッチン隣接なども見て一段上を検討してください。</p>
    </div>
  );
}
