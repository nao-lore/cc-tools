"use client";

import { useState, useMemo } from "react";

type SensorKey = "full" | "apsc" | "mft";

const SENSORS: { key: SensorKey; label: string; coc: number }[] = [
  { key: "full", label: "フルサイズ", coc: 0.029 },
  { key: "apsc", label: "APS-C", coc: 0.019 },
  { key: "mft", label: "マイクロフォーサーズ (MFT)", coc: 0.015 },
];

const FSTOPS = [1.4, 1.8, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16, 22];

function calcDOF(
  focalMm: number,
  fStop: number,
  distanceM: number,
  coc: number
): {
  hyperfocalM: number;
  nearM: number;
  farM: number | null;
  frontDOF: number;
  rearDOF: number | null;
  totalDOF: number | null;
} | null {
  if (focalMm <= 0 || fStop <= 0 || distanceM <= 0 || coc <= 0) return null;

  const f = focalMm / 1000; // convert to meters
  const d = distanceM;
  const N = fStop;
  const c = coc / 1000; // mm to m

  // Hyperfocal distance H = f^2 / (N * c)
  const H = (f * f) / (N * c);

  // Near limit: Dn = (H * d) / (H + d - f)
  const nearDenom = H + d - f;
  if (nearDenom <= 0) return null;
  const nearM = (H * d) / nearDenom;

  // Far limit: Df = (H * d) / (H - d + f)
  const farDenom = H - d + f;
  let farM: number | null;
  if (farDenom <= 0 || d >= H) {
    farM = null; // infinity
  } else {
    farM = (H * d) / farDenom;
  }

  const frontDOF = d - nearM;
  const rearDOF = farM !== null ? farM - d : null;
  const totalDOF = farM !== null ? farM - nearM : null;

  return { hyperfocalM: H, nearM, farM, frontDOF, rearDOF, totalDOF };
}

function fmtDist(m: number | null): string {
  if (m === null) return "∞";
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  if (m >= 1) return `${m.toFixed(2)} m`;
  return `${(m * 100).toFixed(1)} cm`;
}

export default function DepthOfField() {
  const [focalStr, setFocalStr] = useState("50");
  const [fStopMode, setFStopMode] = useState<"select" | "number">("select");
  const [fStopSelect, setFStopSelect] = useState(5.6);
  const [fStopCustomStr, setFStopCustomStr] = useState("5.6");
  const [distStr, setDistStr] = useState("5");
  const [sensor, setSensor] = useState<SensorKey>("full");

  const focalMm = parseFloat(focalStr);
  const fStop =
    fStopMode === "select" ? fStopSelect : parseFloat(fStopCustomStr);
  const distanceM = parseFloat(distStr);
  const sensorData = SENSORS.find((s) => s.key === sensor)!;

  const result = useMemo(
    () => calcDOF(focalMm, fStop, distanceM, sensorData.coc),
    [focalMm, fStop, distanceM, sensorData.coc]
  );

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

  // Visual bar: show near/subject/far as fraction of a display window
  const visualBar = useMemo(() => {
    if (!result) return null;

    const near = result.nearM;
    const far = result.farM ?? distanceM * 4;
    const windowStart = Math.max(0, near * 0.5);
    const windowEnd = far * 1.3;
    const span = windowEnd - windowStart;

    const nearPct = ((near - windowStart) / span) * 100;
    const subjectPct = ((distanceM - windowStart) / span) * 100;
    const farPct = ((far - windowStart) / span) * 100;
    const inFocusPct = farPct - nearPct;

    return { nearPct, subjectPct, farPct, inFocusPct, isInfinity: result.farM === null };
  }, [result, distanceM]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">撮影条件を入力</h2>

        <div className="grid grid-cols-1 gap-4">
          {/* Focal length */}
          <div>
            <label className="block text-xs text-muted mb-1">
              焦点距離 (mm)
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={2000}
                value={focalStr}
                onChange={(e) => setFocalStr(e.target.value)}
                className={inputClass + " pr-12"}
                placeholder="50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                mm
              </span>
            </div>
          </div>

          {/* F-stop */}
          <div>
            <label className="block text-xs text-muted mb-1">F値</label>
            <div className="flex gap-2 mb-2">
              {(["select", "number"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFStopMode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    fStopMode === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted hover:border-primary/50"
                  }`}
                >
                  {m === "select" ? "リストから選ぶ" : "直接入力"}
                </button>
              ))}
            </div>
            {fStopMode === "select" ? (
              <div className="grid grid-cols-5 gap-1.5">
                {FSTOPS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFStopSelect(f)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                      fStopSelect === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted hover:border-primary/50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted font-mono">
                  f/
                </span>
                <input
                  type="number"
                  min={1}
                  max={64}
                  step={0.1}
                  value={fStopCustomStr}
                  onChange={(e) => setFStopCustomStr(e.target.value)}
                  className={inputClass + " pl-8"}
                  placeholder="5.6"
                />
              </div>
            )}
          </div>

          {/* Distance */}
          <div>
            <label className="block text-xs text-muted mb-1">
              被写体距離 (m)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0.1}
                max={10000}
                step={0.1}
                value={distStr}
                onChange={(e) => setDistStr(e.target.value)}
                className={inputClass + " pr-8"}
                placeholder="5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                m
              </span>
            </div>
          </div>

          {/* Sensor */}
          <div>
            <label className="block text-xs text-muted mb-1">
              センサーサイズ
            </label>
            <div className="flex gap-2">
              {SENSORS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSensor(s.key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all leading-tight px-1 ${
                    sensor === s.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted hover:border-primary/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-1">
              錯乱円 (CoC): {sensorData.coc} mm
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && visualBar ? (
        <>
          {/* Visual bar */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base mb-4">被写界深度の範囲</h2>

            <div className="relative h-10 bg-muted/20 rounded-lg overflow-hidden border border-border mb-2">
              {/* In-focus zone */}
              <div
                className="absolute top-0 bottom-0 bg-green-400/40 border-x-2 border-green-500"
                style={{
                  left: `${Math.max(0, visualBar.nearPct)}%`,
                  width: `${Math.min(visualBar.isInfinity ? 100 - visualBar.nearPct : visualBar.inFocusPct, 100 - Math.max(0, visualBar.nearPct))}%`,
                }}
              />
              {/* Subject marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary"
                style={{ left: `${visualBar.subjectPct}%` }}
              />
              {/* Near label */}
              <span
                className="absolute top-1 text-[10px] font-mono text-green-700 translate-x-1"
                style={{ left: `${Math.max(0, visualBar.nearPct)}%` }}
              >
                近{fmtDist(result.nearM)}
              </span>
              {/* Far label */}
              {!visualBar.isInfinity && (
                <span
                  className="absolute top-1 text-[10px] font-mono text-green-700 -translate-x-full pr-1"
                  style={{ left: `${Math.min(visualBar.farPct, 98)}%` }}
                >
                  遠{fmtDist(result.farM)}
                </span>
              )}
              {visualBar.isInfinity && (
                <span className="absolute right-2 top-1 text-[10px] font-mono text-green-700">
                  ∞
                </span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-muted mt-1">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-400/40 border border-green-500" />
                合焦ゾーン
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-0.5 h-3 bg-primary" />
                被写体位置
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base mb-3">計算結果</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="前方深度"
                value={fmtDist(result.frontDOF)}
                sub="ピントより手前"
                color="blue"
              />
              <StatCard
                label="後方深度"
                value={fmtDist(result.rearDOF)}
                sub="ピントより奥"
                color="purple"
              />
              <StatCard
                label="合計被写界深度"
                value={fmtDist(result.totalDOF)}
                sub="合焦範囲の合計"
                color="green"
              />
              <StatCard
                label="超焦点距離"
                value={fmtDist(result.hyperfocalM)}
                sub="∞が合焦する最短距離"
                color="orange"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center text-xs text-muted">
              <div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {fmtDist(result.nearM)}
                </div>
                <div>ニアリミット</div>
              </div>
              <div>
                <div className="font-mono text-sm font-bold text-primary">
                  {fmtDist(distanceM)}
                </div>
                <div>被写体</div>
              </div>
              <div>
                <div className="font-mono text-sm font-bold text-foreground">
                  {fmtDist(result.farM)}
                </div>
                <div>ファーリミット</div>
              </div>
            </div>
          </div>

          {/* Formula note */}
          <div className="bg-muted/30 border border-border rounded-xl p-4 text-xs text-muted space-y-1">
            <p className="font-medium text-foreground text-xs mb-1">計算式について</p>
            <p>超焦点距離: H = f² / (N × c)</p>
            <p>ニアリミット: Dn = H·d / (H + d − f)</p>
            <p>ファーリミット: Df = H·d / (H − d + f)</p>
            <p className="mt-1">f=焦点距離, N=F値, c=錯乱円径, d=被写体距離</p>
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted shadow-sm">
          <p className="text-sm">有効な値を入力すると被写界深度が表示されます</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-muted/20 border border-dashed border-border rounded-xl h-24 flex items-center justify-center text-xs text-muted">
        広告スペース
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <div className="text-xs opacity-70 mb-1">{label}</div>
      <div className="font-mono font-bold text-lg leading-tight">{value}</div>
      <div className="text-xs opacity-60 mt-0.5">{sub}</div>
    </div>
  );
}
