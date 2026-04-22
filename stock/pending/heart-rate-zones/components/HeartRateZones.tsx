"use client";

import { useState, useMemo } from "react";

interface Zone {
  name: string;
  label: string;
  minPct: number;
  maxPct: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  benefit: string;
}

const ZONES: Zone[] = [
  {
    name: "Zone 1",
    label: "Recovery",
    minPct: 50,
    maxPct: 60,
    color: "bg-blue-400",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    description: "Very light effort — comfortable breathing, easy conversation",
    benefit: "Active recovery, improves blood flow, reduces soreness",
  },
  {
    name: "Zone 2",
    label: "Endurance",
    minPct: 60,
    maxPct: 70,
    color: "bg-green-400",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    description: "Light-moderate effort — can hold a conversation",
    benefit: "Builds aerobic base, burns fat, improves endurance",
  },
  {
    name: "Zone 3",
    label: "Aerobic",
    minPct: 70,
    maxPct: 80,
    color: "bg-yellow-400",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    description: "Moderate effort — slightly labored breathing, short sentences",
    benefit: "Improves cardiovascular efficiency and overall fitness",
  },
  {
    name: "Zone 4",
    label: "Threshold",
    minPct: 80,
    maxPct: 90,
    color: "bg-orange-400",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    description: "Hard effort — heavy breathing, difficult to speak",
    benefit: "Raises lactate threshold, improves speed and performance",
  },
  {
    name: "Zone 5",
    label: "Anaerobic",
    minPct: 90,
    maxPct: 100,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    description: "Maximum effort — cannot sustain for long, very hard breathing",
    benefit: "Builds speed, power, and peak athletic performance",
  },
];

function calcZoneBpm(
  minPct: number,
  maxPct: number,
  maxHr: number,
  restingHr: number,
  useKarvonen: boolean
): { min: number; max: number } {
  if (useKarvonen) {
    const hrr = maxHr - restingHr;
    return {
      min: Math.round(minPct / 100 * hrr + restingHr),
      max: Math.round(maxPct / 100 * hrr + restingHr),
    };
  }
  return {
    min: Math.round((minPct / 100) * maxHr),
    max: Math.round((maxPct / 100) * maxHr),
  };
}

export default function HeartRateZones() {
  const [age, setAge] = useState("30");
  const [restingHr, setRestingHr] = useState("");
  const [useKarvonen, setUseKarvonen] = useState(false);

  const results = useMemo(() => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return null;

    const maxHr = 220 - ageNum;
    const restingNum = parseInt(restingHr) || 60;
    const validResting = !isNaN(parseInt(restingHr)) && parseInt(restingHr) > 0;

    const zones = ZONES.map((z) => ({
      ...z,
      bpm: calcZoneBpm(z.minPct, z.maxPct, maxHr, restingNum, useKarvonen && validResting),
    }));

    return { maxHr, restingNum, validResting, zones };
  }, [age, restingHr, useKarvonen]);

  const hasResting = restingHr !== "" && !isNaN(parseInt(restingHr)) && parseInt(restingHr) > 0;

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Your Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 30"
              min="1"
              max="120"
              className={inputCls}
            />
            {results && (
              <p className="text-xs text-gray-400 mt-1">
                Max HR: <span className="font-semibold text-gray-600">{results.maxHr} bpm</span> (220 − {age})
              </p>
            )}
          </div>
          <div>
            <label className={labelCls}>
              Resting Heart Rate (bpm){" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              value={restingHr}
              onChange={(e) => setRestingHr(e.target.value)}
              placeholder="e.g. 60"
              min="20"
              max="120"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Required for Karvonen method</p>
          </div>
        </div>

        {/* Method toggle */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Calculation Method</p>
          <div className="flex gap-3">
            <button
              onClick={() => setUseKarvonen(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                !useKarvonen
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-red-300"
              }`}
            >
              Simple (% of Max HR)
            </button>
            <button
              onClick={() => {
                if (!hasResting) return;
                setUseKarvonen(true);
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                useKarvonen && hasResting
                  ? "bg-red-600 text-white border-red-600"
                  : hasResting
                  ? "bg-white text-gray-600 border-gray-300 hover:border-red-300"
                  : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              Karvonen (Heart Rate Reserve)
            </button>
          </div>
          {!hasResting && (
            <p className="text-xs text-gray-400 mt-2">
              Enter resting heart rate to enable the Karvonen method
            </p>
          )}
        </div>
      </div>

      {/* Zones */}
      {results ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Training Zones
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {useKarvonen && results.validResting ? "Karvonen" : "Simple"} method
            </span>
          </div>

          <div className="space-y-3">
            {results.zones.map((zone) => {
              const widthPct = zone.maxPct - zone.minPct; // each zone is 10% wide
              // bar offset from left: zone 1 starts at 50%, so we normalize
              // full range is 50-100%, so offset = (minPct - 50) / 50 * 100
              const barOffset = ((zone.minPct - 50) / 50) * 100;
              const barWidth = (widthPct / 50) * 100;

              return (
                <div
                  key={zone.name}
                  className={`rounded-xl border ${zone.borderColor} ${zone.bgColor} px-4 py-4`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${zone.textColor}`}>
                          {zone.name}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${zone.color} text-white`}>
                          {zone.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{zone.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className={`text-lg font-bold ${zone.textColor}`}>
                        {zone.bpm.min}–{zone.bpm.max}
                      </p>
                      <p className="text-xs text-gray-400">bpm</p>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`absolute top-0 h-full ${zone.color} rounded-full`}
                      style={{
                        left: `${barOffset}%`,
                        width: `${barWidth}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{zone.benefit}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {zone.minPct}–{zone.maxPct}% MHR
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary bar */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Full Spectrum View
            </p>
            <div className="flex rounded-lg overflow-hidden h-6">
              {results.zones.map((zone) => (
                <div
                  key={zone.name}
                  className={`${zone.color} flex items-center justify-center flex-1`}
                  title={`${zone.label}: ${zone.bpm.min}–${zone.bpm.max} bpm`}
                >
                  <span className="text-white text-xs font-bold hidden sm:block">
                    {zone.name.split(" ")[1]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
              <span>{results.zones[0].bpm.min} bpm</span>
              <span>{results.zones[2].bpm.min} bpm</span>
              <span>{results.zones[4].bpm.max} bpm</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center text-sm text-gray-400">
          Enter your age above to calculate your heart rate training zones
        </div>
      )}
    </div>
  );
}
