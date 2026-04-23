"use client";

import { useState, useMemo } from "react";

type ZonePreset = {
  label: string;
  group: string;
  kenpei: number;
  yoseki: number;
};

const ZONE_PRESETS: ZonePreset[] = [
  { label: "第一種低層住居専用 (30/50)", group: "住宅系", kenpei: 30, yoseki: 50 },
  { label: "第一種低層住居専用 (40/60)", group: "住宅系", kenpei: 40, yoseki: 60 },
  { label: "第一種低層住居専用 (50/80)", group: "住宅系", kenpei: 50, yoseki: 80 },
  { label: "第一種中高層住居専用 (60/200)", group: "住宅系", kenpei: 60, yoseki: 200 },
  { label: "第一種住居地域 (60/200)", group: "住宅系", kenpei: 60, yoseki: 200 },
  { label: "第二種住居地域 (60/300)", group: "住宅系", kenpei: 60, yoseki: 300 },
  { label: "準住居地域 (60/300)", group: "住宅系", kenpei: 60, yoseki: 300 },
  { label: "近隣商業地域 (80/300)", group: "商業系", kenpei: 80, yoseki: 300 },
  { label: "商業地域 (80/400)", group: "商業系", kenpei: 80, yoseki: 400 },
  { label: "商業地域 (80/600)", group: "商業系", kenpei: 80, yoseki: 600 },
  { label: "商業地域 (80/800)", group: "商業系", kenpei: 80, yoseki: 800 },
  { label: "準工業地域 (60/300)", group: "工業系", kenpei: 60, yoseki: 300 },
  { label: "工業地域 (60/400)", group: "工業系", kenpei: 60, yoseki: 400 },
];

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-12";

const GROUPS = ["住宅系", "商業系", "工業系"];

export default function KenpeiYoseki() {
  const [shikichiArea, setShikichiArea] = useState("");
  const [kenpeiRate, setKenpeiRate] = useState("");
  const [yosekiRate, setYosekiRate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("住宅系");

  const result = useMemo(() => {
    const area = parseFloat(shikichiArea);
    const kenpei = parseFloat(kenpeiRate);
    const yoseki = parseFloat(yosekiRate);
    if (!area || !kenpei || !yoseki || area <= 0 || kenpei <= 0 || yoseki <= 0) return null;
    if (kenpei > 100 || yoseki > 1500) return null;
    return {
      kenchikuArea: Math.floor(area * (kenpei / 100) * 100) / 100,
      nobeyukaArea: Math.floor(area * (yoseki / 100) * 100) / 100,
      kenpeiRate: kenpei,
      yosekiRate: yoseki,
      shikichiArea: area,
    };
  }, [shikichiArea, kenpeiRate, yosekiRate]);

  // Visual: building footprint ratio relative to site
  const visualRatio = useMemo(() => {
    const kenpei = parseFloat(kenpeiRate);
    if (!kenpei || kenpei <= 0 || kenpei > 100) return null;
    return Math.min(kenpei / 100, 1);
  }, [kenpeiRate]);

  function applyPreset(preset: ZonePreset) {
    setKenpeiRate(String(preset.kenpei));
    setYosekiRate(String(preset.yoseki));
    setSelectedPreset(preset.label);
  }

  const filteredPresets = ZONE_PRESETS.filter((p) => p.group === activeGroup);

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-sm mb-4">基本情報を入力</h2>

        {/* 敷地面積 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">敷地面積</label>
          <div className="relative max-w-[240px]">
            <input
              type="text"
              inputMode="decimal"
              placeholder="100"
              value={shikichiArea}
              onChange={(e) => setShikichiArea(e.target.value.replace(/[^0-9.]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">㎡</span>
          </div>
        </div>

        {/* 建蔽率・容積率 */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1">建蔽率</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="60"
                value={kenpeiRate}
                onChange={(e) => {
                  setKenpeiRate(e.target.value.replace(/[^0-9.]/g, ""));
                  setSelectedPreset(null);
                }}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1">容積率</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="200"
                value={yosekiRate}
                onChange={(e) => {
                  setYosekiRate(e.target.value.replace(/[^0-9.]/g, ""));
                  setSelectedPreset(null);
                }}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
            </div>
          </div>
        </div>

        {/* 用途地域プリセット */}
        <div>
          <p className="text-xs text-muted mb-2">用途地域プリセット</p>
          <div className="flex gap-1 mb-3">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all font-medium ${
                  activeGroup === g
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                  selectedPreset === preset.label
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-accent hover:border-primary/50"
                }`}
              >
                {preset.kenpei}/{preset.yoseki}
              </button>
            ))}
          </div>
          {selectedPreset && (
            <p className="text-xs text-muted mt-1.5">{selectedPreset}</p>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-card border-2 border-primary/30 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-sm mb-4">計算結果</h2>
          <div className="divide-y divide-border">
            <div className="flex justify-between items-center py-3">
              <div>
                <span className="text-sm font-medium">建築面積上限</span>
                <p className="text-xs text-muted mt-0.5">建蔽率 {result.kenpeiRate}%</p>
              </div>
              <span className="text-2xl font-bold font-mono text-primary">
                {result.kenchikuArea.toLocaleString()}<span className="text-base ml-1 font-normal">㎡</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <span className="text-sm font-medium">延床面積上限</span>
                <p className="text-xs text-muted mt-0.5">容積率 {result.yosekiRate}%</p>
              </div>
              <span className="text-2xl font-bold font-mono text-primary">
                {result.nobeyukaArea.toLocaleString()}<span className="text-base ml-1 font-normal">㎡</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-muted">敷地面積</span>
              <span className="text-sm font-mono">{result.shikichiArea.toLocaleString()} ㎡</span>
            </div>
            {result.nobeyukaArea > 0 && result.kenchikuArea > 0 && (
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-muted">最大階数の目安</span>
                <span className="text-sm font-mono">
                  約 {Math.floor(result.nobeyukaArea / result.kenchikuArea)} 階
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual */}
      {visualRatio !== null && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">敷地に対する建築可能範囲</h3>
          <div className="flex justify-center">
            <div className="relative w-48 h-48 bg-green-100 border-2 border-green-400 rounded-lg flex items-end justify-center overflow-hidden">
              {/* Site label */}
              <span className="absolute top-2 left-2 text-xs text-green-700 font-medium">敷地</span>
              {/* Building footprint */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary/20 border-t-2 border-primary/50 flex items-center justify-center transition-all duration-300"
                style={{ height: `${visualRatio * 100}%` }}
              >
                <div
                  className="bg-primary/30 border border-primary/60 rounded flex items-center justify-center"
                  style={{
                    width: `${visualRatio * 100}%`,
                    height: `${visualRatio * 100}%`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                >
                  <span className="text-xs font-bold text-primary/80 select-none">
                    {parseFloat(kenpeiRate)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-muted mt-3">
            建蔽率 {kenpeiRate}% — 敷地の{kenpeiRate}%まで建築可能
          </p>
        </div>
      )}

      {/* 用途地域別上限一覧 */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">用途地域別・建蔽率・容積率の上限</h3>
        <div className="space-y-3">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">{group}</p>
              <div className="space-y-1">
                {ZONE_PRESETS.filter((p) => p.group === group).map((preset) => (
                  <div
                    key={preset.label}
                    className="flex justify-between items-center px-3 py-2 rounded-lg text-sm hover:bg-accent transition-all cursor-pointer"
                    onClick={() => applyPreset(preset)}
                  >
                    <span className="text-xs text-muted truncate pr-2">{preset.label}</span>
                    <span className="font-mono text-xs font-medium shrink-0 text-primary">
                      {preset.kenpei}% / {preset.yoseki}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">注意：</span>
          本ツールの計算結果は目安です。実際の建築可能面積は、前面道路幅員による容積率制限、日影規制、高さ制限、防火規制などにより異なります。
          正確な情報は各市区町村の建築指導課またはお近くの一級建築士にご確認ください。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-[90px] bg-muted/30 border border-dashed border-border rounded-xl text-xs text-muted">
        Advertisement
      </div>
    </div>
  );
}
