"use client";

import { useState, useMemo } from "react";

// 1坪 = 3.30579㎡
const TSUBO_TO_SQM = 3.30579;

type TatamiType = "edo" | "kyo" | "danchi" | "chukyo";

const TATAMI_TYPES: { key: TatamiType; label: string; sqm: number }[] = [
  { key: "edo", label: "江戸間", sqm: 1.548 },
  { key: "kyo", label: "京間", sqm: 1.824 },
  { key: "danchi", label: "団地間", sqm: 1.445 },
  { key: "chukyo", label: "中京間", sqm: 1.656 },
];

type InputUnit = "sqm" | "tsubo" | "tatami";
type Mode = "unit" | "dimension";

const ROOM_REFS = [
  { tatami: 4.5, label: "4.5畳" },
  { tatami: 6, label: "6畳" },
  { tatami: 8, label: "8畳" },
  { tatami: 10, label: "10畳" },
];

function fmt(n: number, d = 2): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toFixed(d);
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-surface";

const labelClass = "text-sm text-muted mb-1 block";

export default function MensekiTani() {
  const [mode, setMode] = useState<Mode>("unit");

  // Unit conversion mode
  const [inputValue, setInputValue] = useState("");
  const [inputUnit, setInputUnit] = useState<InputUnit>("sqm");
  const [tatamiType, setTatamiType] = useState<TatamiType>("edo");

  // Dimension mode
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [dimTatamiType, setDimTatamiType] = useState<TatamiType>("edo");

  const tatamiSqm = TATAMI_TYPES.find((t) => t.key === tatamiType)!.sqm;
  const dimTatamiSqm = TATAMI_TYPES.find((t) => t.key === dimTatamiType)!.sqm;

  // Conversion results from unit input
  const unitResult = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 0) return null;
    let sqm: number;
    if (inputUnit === "sqm") {
      sqm = val;
    } else if (inputUnit === "tsubo") {
      sqm = val * TSUBO_TO_SQM;
    } else {
      sqm = val * tatamiSqm;
    }
    const tsubo = sqm / TSUBO_TO_SQM;
    const results: { type: TatamiType; label: string; value: number }[] = TATAMI_TYPES.map(
      (t) => ({ type: t.key, label: t.label, value: sqm / t.sqm })
    );
    return { sqm, tsubo, tatamiResults: results };
  }, [inputValue, inputUnit, tatamiSqm]);

  // Dimension results
  const dimResult = useMemo(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
    const sqm = w * h;
    const tsubo = sqm / TSUBO_TO_SQM;
    const tatami = sqm / dimTatamiSqm;
    return { sqm, tsubo, tatami };
  }, [width, height, dimTatamiSqm]);

  const modeButtonClass = (m: Mode) =>
    `flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
      mode === m
        ? "bg-accent text-white"
        : "bg-surface border border-border text-muted hover:border-primary"
    }`;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Mode switch */}
      <div className="flex gap-2">
        <button className={modeButtonClass("unit")} onClick={() => setMode("unit")}>
          単位変換
        </button>
        <button className={modeButtonClass("dimension")} onClick={() => setMode("dimension")}>
          寸法入力（縦×横）
        </button>
      </div>

      {/* Unit conversion mode */}
      {mode === "unit" && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
          <h2 className="font-semibold text-base">単位変換</h2>

          {/* Input value */}
          <div>
            <label className={labelClass}>数値を入力</label>
            <input
              type="number"
              min="0"
              step="any"
              className={inputClass}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Input unit selector */}
          <div>
            <label className={labelClass}>単位を選択</label>
            <div className="flex gap-2">
              {(["sqm", "tsubo", "tatami"] as InputUnit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setInputUnit(u)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    inputUnit === u
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-border text-muted hover:border-primary"
                  }`}
                >
                  {u === "sqm" ? "㎡" : u === "tsubo" ? "坪" : "畳"}
                </button>
              ))}
            </div>
          </div>

          {/* Tatami type (shown when tatami is selected) */}
          {inputUnit === "tatami" && (
            <div>
              <label className={labelClass}>畳の種類</label>
              <div className="grid grid-cols-2 gap-2">
                {TATAMI_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTatamiType(t.key)}
                    className={`py-2 px-3 rounded-lg text-sm border transition-all ${
                      tatamiType === t.key
                        ? "bg-accent text-white border-accent"
                        : "bg-surface border-border text-muted hover:border-primary"
                    }`}
                  >
                    {t.label}
                    <span className="block text-xs opacity-75">{t.sqm}㎡/枚</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {unitResult && (
            <div className="space-y-3 pt-2 border-t border-border">
              <ResultRow
                label="平方メートル"
                value={fmt(unitResult.sqm)}
                unit="㎡"
                highlight={inputUnit === "sqm"}
              />
              <ResultRow
                label="坪"
                value={fmt(unitResult.tsubo)}
                unit="坪"
                highlight={inputUnit === "tsubo"}
              />
              <div>
                <span className={labelClass}>畳（種類別）</span>
                <div className="grid grid-cols-2 gap-2">
                  {unitResult.tatamiResults.map((r) => (
                    <div
                      key={r.type}
                      className={`rounded-xl border p-3 ${
                        inputUnit === "tatami" && tatamiType === r.type
                          ? "border-accent bg-accent/5"
                          : "border-border"
                      }`}
                    >
                      <div className="text-xs text-muted">{r.label}</div>
                      <div className="text-lg font-mono font-semibold">
                        {fmt(r.value, 1)}{" "}
                        <span className="text-sm font-normal text-muted">畳</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dimension mode */}
      {mode === "dimension" && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
          <h2 className="font-semibold text-base">寸法から計算（縦 × 横）</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>縦（m）</label>
              <input
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="3.00"
              />
            </div>
            <div>
              <label className={labelClass}>横（m）</label>
              <input
                type="number"
                min="0"
                step="any"
                className={inputClass}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="4.00"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>畳の種類</label>
            <div className="grid grid-cols-2 gap-2">
              {TATAMI_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDimTatamiType(t.key)}
                  className={`py-2 px-3 rounded-lg text-sm border transition-all ${
                    dimTatamiType === t.key
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-border text-muted hover:border-primary"
                  }`}
                >
                  {t.label}
                  <span className="block text-xs opacity-75">{t.sqm}㎡/枚</span>
                </button>
              ))}
            </div>
          </div>

          {dimResult && (
            <div className="space-y-3 pt-2 border-t border-border">
              <ResultRow label="面積" value={fmt(dimResult.sqm)} unit="㎡" />
              <ResultRow label="坪数" value={fmt(dimResult.tsubo)} unit="坪" />
              <ResultRow
                label={`畳数（${TATAMI_TYPES.find((t) => t.key === dimTatamiType)!.label}）`}
                value={fmt(dimResult.tatami, 1)}
                unit="畳"
              />
            </div>
          )}
        </div>
      )}

      {/* Visual size reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-base mb-3">広さの目安</h2>
        <div className="grid grid-cols-4 gap-2">
          {ROOM_REFS.map((r) => {
            const sqm = r.tatami * TATAMI_TYPES.find((t) => t.key === "edo")!.sqm;
            const tsubo = sqm / TSUBO_TO_SQM;
            return (
              <div key={r.tatami} className="rounded-xl border border-border p-3 text-center">
                <div className="text-base font-semibold">{r.label}</div>
                <div className="text-xs text-muted mt-1">{fmt(sqm, 1)}㎡</div>
                <div className="text-xs text-muted">{fmt(tsubo, 2)}坪</div>
                <RoomIcon tatami={r.tatami} />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-2">※ 広さの目安は江戸間換算</p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 text-center text-muted text-sm h-24 flex items-center justify-center">
        広告
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        highlight ? "border-accent bg-accent/5" : "border-border"
      }`}
    >
      <span className="text-sm text-muted">{label}</span>
      <span className="text-xl font-mono font-semibold">
        {value}{" "}
        <span className="text-sm font-normal text-muted">{unit}</span>
      </span>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この面積・坪数変換ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">㎡・坪・畳の面積単位を相互変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この面積・坪数変換ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "㎡・坪・畳の面積単位を相互変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}

function RoomIcon({ tatami }: { tatami: number }) {
  // Simple proportional rectangle icon
  const aspect = tatami <= 6 ? 1.5 : tatami <= 8 ? 1.6 : 1.8;
  const w = 36;
  const h = Math.round(w / aspect);
  return (
    <svg
      className="mx-auto mt-2 text-muted"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
    >
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1={w / 2} y1="0" x2={w / 2} y2={h} stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
    </svg>
  );
}
