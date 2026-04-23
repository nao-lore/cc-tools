"use client";

import { useState, useMemo } from "react";

// Zone use type -> typical limits
const ZONE_TYPES = [
  { label: "第一種低層住居専用地域", kenpei: 50, yoseki: 100 },
  { label: "第二種低層住居専用地域", kenpei: 60, yoseki: 200 },
  { label: "第一種中高層住居専用地域", kenpei: 60, yoseki: 300 },
  { label: "第二種中高層住居専用地域", kenpei: 60, yoseki: 300 },
  { label: "第一種住居地域", kenpei: 60, yoseki: 400 },
  { label: "第二種住居地域", kenpei: 60, yoseki: 400 },
  { label: "準住居地域", kenpei: 60, yoseki: 400 },
  { label: "近隣商業地域", kenpei: 80, yoseki: 400 },
  { label: "商業地域", kenpei: 80, yoseki: 800 },
  { label: "準工業地域", kenpei: 60, yoseki: 400 },
  { label: "工業地域", kenpei: 60, yoseki: 400 },
  { label: "カスタム", kenpei: 60, yoseki: 200 },
];

export default function KenpeiYoseki() {
  const [siteArea, setSiteArea] = useState("");
  const [kenpeiRatio, setKenpeiRatio] = useState("60");
  const [yosekiRatio, setYosekiRatio] = useState("200");
  const [selectedZone, setSelectedZone] = useState(ZONE_TYPES[0]);
  const [buildingArea, setBuildingArea] = useState("");
  const [totalFloorArea, setTotalFloorArea] = useState("");

  const applyZone = (zone: typeof ZONE_TYPES[0]) => {
    setSelectedZone(zone);
    setKenpeiRatio(String(zone.kenpei));
    setYosekiRatio(String(zone.yoseki));
  };

  const result = useMemo(() => {
    const site = parseFloat(siteArea);
    const kenpei = parseFloat(kenpeiRatio);
    const yoseki = parseFloat(yosekiRatio);

    if (isNaN(site) || site <= 0) return null;

    const maxBuildingArea = site * (kenpei / 100);
    const maxTotalFloor = site * (yoseki / 100);

    // Check existing building if provided
    const existingBuilding = parseFloat(buildingArea);
    const existingTotal = parseFloat(totalFloorArea);

    const buildingCompliant = isNaN(existingBuilding) ? null : existingBuilding <= maxBuildingArea;
    const totalCompliant = isNaN(existingTotal) ? null : existingTotal <= maxTotalFloor;

    const buildingUsageRate = isNaN(existingBuilding) ? null : (existingBuilding / maxBuildingArea) * 100;
    const totalUsageRate = isNaN(existingTotal) ? null : (existingTotal / maxTotalFloor) * 100;

    // Max floors (approximate: assume 3m per floor)
    const avgFloorHeight = 3;
    const maxFloors = Math.floor(maxTotalFloor / maxBuildingArea);

    return {
      maxBuildingArea,
      maxTotalFloor,
      buildingCompliant,
      totalCompliant,
      buildingUsageRate,
      totalUsageRate,
      maxFloors,
    };
  }, [siteArea, kenpeiRatio, yosekiRatio, buildingArea, totalFloorArea]);

  return (
    <div className="space-y-5">
      {/* Zone selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">用途地域を選択</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {ZONE_TYPES.map((zone) => (
            <button
              key={zone.label}
              onClick={() => applyZone(zone)}
              className={`text-left px-3 py-2 border rounded-lg text-sm transition-colors ${
                selectedZone.label === zone.label
                  ? "bg-primary text-white border-primary"
                  : "bg-accent border-border hover:border-primary/50"
              }`}
            >
              <span className="block font-medium truncate">{zone.label}</span>
              <span className={`text-xs ${selectedZone.label === zone.label ? "text-white/70" : "text-muted"}`}>
                建蔽{zone.kenpei}% / 容積{zone.yoseki}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">数値を入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1 font-medium">
              敷地面積（m²）<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="例: 200"
              value={siteArea}
              onChange={(e) => setSiteArea(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1 font-medium">建蔽率制限（%）</label>
            <input
              type="number"
              inputMode="decimal"
              value={kenpeiRatio}
              onChange={(e) => setKenpeiRatio(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1 font-medium">容積率制限（%）</label>
            <input
              type="number"
              inputMode="decimal"
              value={yosekiRatio}
              onChange={(e) => setYosekiRatio(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
        </div>

        <div className="border-t border-border mt-4 pt-4">
          <p className="text-xs text-muted mb-3 font-medium">法適合チェック（任意）— 既存・計画の建物面積を入力</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">建築面積（1階の床面積 m²）</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="例: 100"
                value={buildingArea}
                onChange={(e) => setBuildingArea(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">延べ床面積（全フロア合計 m²）</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="例: 250"
                value={totalFloorArea}
                onChange={(e) => setTotalFloorArea(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-xs text-muted mb-1">最大建築面積（建蔽率）</p>
              <p className="text-2xl font-bold font-mono text-primary">{result.maxBuildingArea.toFixed(1)} m²</p>
              <p className="text-xs text-muted mt-1">建蔽率 {kenpeiRatio}%</p>
            </div>
            <div className="bg-accent border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">最大延べ床面積（容積率）</p>
              <p className="text-2xl font-bold font-mono text-foreground">{result.maxTotalFloor.toFixed(1)} m²</p>
              <p className="text-xs text-muted mt-1">容積率 {yosekiRatio}%</p>
            </div>
            <div className="bg-accent border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">概算最大階数</p>
              <p className="text-2xl font-bold font-mono text-foreground">{result.maxFloors}階</p>
              <p className="text-xs text-muted mt-1">目安（実際は高さ制限等に依存）</p>
            </div>
          </div>

          {/* Compliance check */}
          {(result.buildingCompliant !== null || result.totalCompliant !== null) && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-sm">法適合チェック結果</h3>
              {result.buildingCompliant !== null && (
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${result.buildingCompliant ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <span className="text-sm">建蔽率</span>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${result.buildingCompliant ? "text-green-700" : "text-red-700"}`}>
                      {result.buildingCompliant ? "適合 ✓" : "超過 ✗"}
                    </span>
                    {result.buildingUsageRate !== null && (
                      <p className="text-xs text-muted">使用率 {result.buildingUsageRate.toFixed(1)}%</p>
                    )}
                  </div>
                </div>
              )}
              {result.totalCompliant !== null && (
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${result.totalCompliant ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <span className="text-sm">容積率</span>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${result.totalCompliant ? "text-green-700" : "text-red-700"}`}>
                      {result.totalCompliant ? "適合 ✓" : "超過 ✗"}
                    </span>
                    {result.totalUsageRate !== null && (
                      <p className="text-xs text-muted">使用率 {result.totalUsageRate.toFixed(1)}%</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
