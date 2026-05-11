"use client";

import { useMemo, useState } from "react";

type ZonePreset = {
  label: string;
  bcr: number;
  far: number;
  coefficient: "0.4" | "0.6";
  note: string;
};

type Result = {
  siteArea: number;
  effectiveBcr: number;
  designatedFar: number;
  roadLimitedFar: number;
  effectiveFar: number;
  maxBuildingArea: number;
  maxTotalFloorArea: number;
  unusedBuildingArea: number | null;
  unusedFloorArea: number | null;
  buildingStatus: "ok" | "over" | null;
  floorStatus: "ok" | "over" | null;
};

const ZONE_PRESETS: ZonePreset[] = [
  { label: "第一種低層住居専用地域", bcr: 50, far: 100, coefficient: "0.4", note: "低層住宅地でよく使う初期値" },
  { label: "第二種低層住居専用地域", bcr: 60, far: 150, coefficient: "0.4", note: "低層住宅地の目安" },
  { label: "第一種中高層住居専用地域", bcr: 60, far: 200, coefficient: "0.4", note: "中高層住宅地の目安" },
  { label: "第二種中高層住居専用地域", bcr: 60, far: 300, coefficient: "0.4", note: "中高層住宅地の目安" },
  { label: "第一種住居地域", bcr: 60, far: 200, coefficient: "0.4", note: "住宅系地域の目安" },
  { label: "第二種住居地域", bcr: 60, far: 300, coefficient: "0.4", note: "住宅系地域の目安" },
  { label: "近隣商業地域", bcr: 80, far: 400, coefficient: "0.6", note: "商業系地域の目安" },
  { label: "商業地域", bcr: 80, far: 600, coefficient: "0.6", note: "商業系地域の目安" },
  { label: "準工業地域", bcr: 60, far: 200, coefficient: "0.6", note: "工業系地域の目安" },
  { label: "自治体指定を入力", bcr: 60, far: 200, coefficient: "0.4", note: "都市計画図・重要事項説明書の数値を入力" },
];

const EXAMPLES = [
  { label: "住宅地 120m²", site: "120", bcr: "50", far: "100", road: "4", coefficient: "0.4" as const },
  { label: "住宅地 150m²", site: "150", bcr: "60", far: "200", road: "4", coefficient: "0.4" as const },
  { label: "商業地 80m²", site: "80", bcr: "80", far: "400", road: "6", coefficient: "0.6" as const },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatArea(value: number) {
  return `${value.toFixed(1)} m²`;
}

function formatRatio(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function cleanNumericInput(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function getError(siteArea: number, bcr: number, far: number, roadWidth: number) {
  if (!siteArea && !bcr && !far) return "";
  if (!siteArea) return "敷地面積を入力してください。";
  if (siteArea <= 0 || siteArea > 100000) return "敷地面積は 0 より大きい値で入力してください。";
  if (!bcr || bcr <= 0 || bcr > 100) return "建蔽率は 1〜100% の範囲で入力してください。";
  if (!far || far <= 0 || far > 1500) return "容積率は 1〜1500% の範囲で入力してください。";
  if (!roadWidth || roadWidth < 1 || roadWidth > 60) return "前面道路幅員は 1〜60m の範囲で入力してください。";
  return "";
}

function buildCopyText(result: Result) {
  return [
    `敷地面積: ${formatArea(result.siteArea)}`,
    `建蔽率上限: ${formatRatio(result.effectiveBcr)}`,
    `最大建築面積: ${formatArea(result.maxBuildingArea)}`,
    `指定容積率: ${formatRatio(result.designatedFar)}`,
    `前面道路による容積率上限: ${formatRatio(result.roadLimitedFar)}`,
    `有効容積率: ${formatRatio(result.effectiveFar)}`,
    `最大延べ床面積: ${formatArea(result.maxTotalFloorArea)}`,
  ].join("\n");
}

export default function KenpeiYoseki() {
  const [siteArea, setSiteArea] = useState("120");
  const [bcr, setBcr] = useState("50");
  const [far, setFar] = useState("100");
  const [roadWidth, setRoadWidth] = useState("4");
  const [coefficient, setCoefficient] = useState<"0.4" | "0.6">("0.4");
  const [cornerBonus, setCornerBonus] = useState(false);
  const [plannedBuildingArea, setPlannedBuildingArea] = useState("");
  const [plannedFloorArea, setPlannedFloorArea] = useState("");
  const [copied, setCopied] = useState(false);

  const siteAreaValue = parseNumber(siteArea);
  const bcrValue = parseNumber(bcr);
  const farValue = parseNumber(far);
  const roadWidthValue = parseNumber(roadWidth);
  const plannedBuildingAreaValue = parseNumber(plannedBuildingArea);
  const plannedFloorAreaValue = parseNumber(plannedFloorArea);
  const error = getError(siteAreaValue, bcrValue, farValue, roadWidthValue);

  const result = useMemo<Result | null>(() => {
    if (error) return null;

    const effectiveBcr = Math.min(100, bcrValue + (cornerBonus ? 10 : 0));
    const roadLimitedFar = roadWidthValue * Number(coefficient) * 100;
    const effectiveFar = Math.min(farValue, roadLimitedFar);
    const maxBuildingArea = siteAreaValue * (effectiveBcr / 100);
    const maxTotalFloorArea = siteAreaValue * (effectiveFar / 100);

    const buildingStatus = plannedBuildingArea
      ? plannedBuildingAreaValue <= maxBuildingArea ? "ok" : "over"
      : null;
    const floorStatus = plannedFloorArea
      ? plannedFloorAreaValue <= maxTotalFloorArea ? "ok" : "over"
      : null;

    return {
      siteArea: siteAreaValue,
      effectiveBcr,
      designatedFar: farValue,
      roadLimitedFar,
      effectiveFar,
      maxBuildingArea,
      maxTotalFloorArea,
      unusedBuildingArea: plannedBuildingArea ? maxBuildingArea - plannedBuildingAreaValue : null,
      unusedFloorArea: plannedFloorArea ? maxTotalFloorArea - plannedFloorAreaValue : null,
      buildingStatus,
      floorStatus,
    };
  }, [
    bcrValue,
    coefficient,
    cornerBonus,
    error,
    farValue,
    plannedBuildingArea,
    plannedBuildingAreaValue,
    plannedFloorArea,
    plannedFloorAreaValue,
    roadWidthValue,
    siteAreaValue,
  ]);

  function applyPreset(preset: ZonePreset) {
    setBcr(String(preset.bcr));
    setFar(String(preset.far));
    setCoefficient(preset.coefficient);
    setCopied(false);
  }

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setSiteArea(example.site);
    setBcr(example.bcr);
    setFar(example.far);
    setRoadWidth(example.road);
    setCoefficient(example.coefficient);
    setCornerBonus(false);
    setPlannedBuildingArea("");
    setPlannedFloorArea("");
    setCopied(false);
  }

  function reset() {
    setSiteArea("");
    setBcr("60");
    setFar("200");
    setRoadWidth("4");
    setCoefficient("0.4");
    setCornerBonus(false);
    setPlannedBuildingArea("");
    setPlannedFloorArea("");
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(buildCopyText(result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function update(setter: (value: string) => void, value: string) {
    setter(cleanNumericInput(value));
    setCopied(false);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">敷地条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                都市計画図や重要事項説明書に記載された数値を優先して入力してください。
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

          <div className="mt-5">
            <label htmlFor="site-area" className="text-sm font-medium text-slate-700">
              敷地面積
            </label>
            <NumberInput
              id="site-area"
              value={siteArea}
              unit="m²"
              placeholder="120"
              describedBy="kenpei-error"
              onChange={(value) => update(setSiteArea, value)}
            />
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">用途地域プリセット</p>
            <div className="mt-2 grid max-h-52 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
              {ZONE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-slate-400"
                >
                  <span className="block text-sm font-semibold text-slate-950">{preset.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    建蔽率 {preset.bcr}% / 容積率 {preset.far}% / {preset.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bcr" className="text-sm font-medium text-slate-700">
                建蔽率
              </label>
              <NumberInput
                id="bcr"
                value={bcr}
                unit="%"
                placeholder="60"
                describedBy="kenpei-error"
                onChange={(value) => update(setBcr, value)}
              />
            </div>
            <div>
              <label htmlFor="far" className="text-sm font-medium text-slate-700">
                指定容積率
              </label>
              <NumberInput
                id="far"
                value={far}
                unit="%"
                placeholder="200"
                describedBy="kenpei-error"
                onChange={(value) => update(setFar, value)}
              />
            </div>
            <div>
              <label htmlFor="road-width" className="text-sm font-medium text-slate-700">
                前面道路幅員
              </label>
              <NumberInput
                id="road-width"
                value={roadWidth}
                unit="m"
                placeholder="4"
                describedBy="kenpei-error"
                onChange={(value) => update(setRoadWidth, value)}
              />
            </div>
            <div>
              <label htmlFor="road-coefficient" className="text-sm font-medium text-slate-700">
                道路幅員係数
              </label>
              <select
                id="road-coefficient"
                value={coefficient}
                onChange={(event) => setCoefficient(event.target.value as "0.4" | "0.6")}
                className="mt-2 h-[50px] w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
              >
                <option value="0.4">0.4（住居系の目安）</option>
                <option value="0.6">0.6（商業・工業系の目安）</option>
              </select>
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={cornerBonus}
              onChange={(event) => setCornerBonus(event.target.checked)}
              className="mt-1"
            />
            <span>
              角地などの建蔽率緩和を +10% として試算する
              <span className="mt-1 block text-xs text-slate-500">
                実際の緩和可否は自治体指定や敷地条件で変わります。
              </span>
            </span>
          </label>

          <p id="kenpei-error" className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
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

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-sm font-semibold text-slate-950">計画面積チェック</p>
            <p className="mt-1 text-xs text-slate-500">任意入力です。計画中の面積が上限内かを概算します。</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="planned-building-area" className="text-sm font-medium text-slate-700">
                  建築面積
                </label>
                <NumberInput
                  id="planned-building-area"
                  value={plannedBuildingArea}
                  unit="m²"
                  placeholder="60"
                  onChange={(value) => update(setPlannedBuildingArea, value)}
                />
              </div>
              <div>
                <label htmlFor="planned-floor-area" className="text-sm font-medium text-slate-700">
                  延べ床面積
                </label>
                <NumberInput
                  id="planned-floor-area"
                  value={plannedFloorArea}
                  unit="m²"
                  placeholder="120"
                  onChange={(value) => update(setPlannedFloorArea, value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {!result ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">敷地条件を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">有効な数値を入力すると上限面積が表示されます。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-800">最大建築面積</p>
                <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-emerald-950">
                  {formatArea(result.maxBuildingArea)}
                </p>
                <p className="mt-2 text-sm text-emerald-800">
                  有効建蔽率 {formatRatio(result.effectiveBcr)} を敷地面積に掛けた上限目安です。
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                <p className="text-sm font-semibold text-cyan-800">最大延べ床面積</p>
                <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-cyan-950">
                  {formatArea(result.maxTotalFloorArea)}
                </p>
                <p className="mt-2 text-sm text-cyan-800">
                  指定容積率と前面道路幅員による制限の小さい方を使っています。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="指定容積率" value={formatRatio(result.designatedFar)} note="都市計画で指定された数値" />
                <Metric label="道路幅員制限" value={formatRatio(result.roadLimitedFar)} note={`${roadWidth || "0"}m × ${coefficient} × 100`} />
                <Metric label="有効容積率" value={formatRatio(result.effectiveFar)} note={result.effectiveFar < result.designatedFar ? "道路幅員側が上限" : "指定容積率が上限"} />
                <Metric label="建築可能ボリューム" value={`${(result.maxTotalFloorArea / result.maxBuildingArea).toFixed(1)}層分`} note="最大建築面積で割った概算" />
              </div>

              {(result.buildingStatus || result.floorStatus) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">計画面積チェック</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {result.buildingStatus && (
                      <StatusCard
                        label="建築面積"
                        status={result.buildingStatus}
                        diff={result.unusedBuildingArea}
                      />
                    )}
                    {result.floorStatus && (
                      <StatusCard
                        label="延べ床面積"
                        status={result.floorStatus}
                        diff={result.unusedFloorArea}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                このツールは概算です。斜線制限、高さ制限、防火地域、敷地形状、道路後退、自治体の条例、容積率不算入部分などは別途確認してください。
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
  value,
  unit,
  placeholder,
  describedBy,
  onChange,
}: {
  id: string;
  value: string;
  unit: string;
  placeholder: string;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
      />
      <span className="flex min-w-14 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
        {unit}
      </span>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function StatusCard({
  label,
  status,
  diff,
}: {
  label: string;
  status: "ok" | "over";
  diff: number | null;
}) {
  const ok = status === "ok";
  return (
    <div className={`rounded-xl border p-3 ${ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <p className={`mt-1 text-lg font-bold ${ok ? "text-emerald-700" : "text-red-700"}`}>
        {ok ? "上限内" : "上限超過"}
      </p>
      {diff !== null && (
        <p className="mt-1 text-xs text-slate-600">
          {ok ? "余裕" : "超過"} {formatArea(Math.abs(diff))}
        </p>
      )}
    </div>
  );
}
