"use client";
import { useState } from "react";

const DISTANCES = [
  { label: "25m", value: 25 },
  { label: "50m", value: 50 },
  { label: "100m", value: 100 },
  { label: "200m", value: 200 },
  { label: "400m", value: 400 },
  { label: "800m", value: 800 },
  { label: "1500m", value: 1500 },
  { label: "3000m", value: 3000 },
  { label: "5000m", value: 5000 },
];

const POOL_LENGTHS = [
  { label: "25mプール（短水路）", value: 25 },
  { label: "50mプール（長水路）", value: 50 },
];

const STROKE_TARGETS: Record<string, Record<number, string>> = {
  "自由形": { 100: "1:00", 200: "2:10", 400: "4:30", 800: "9:30", 1500: "18:30" },
  "背泳ぎ": { 100: "1:10", 200: "2:30", 400: "5:10" },
  "平泳ぎ": { 100: "1:15", 200: "2:35", 400: "5:20" },
  "バタフライ": { 100: "1:05", 200: "2:20" },
};

function formatTime(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const cs = Math.floor((totalSeconds % 1) * 100);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function parseTime(str: string): number {
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

export default function SwimPace() {
  const [distanceIdx, setDistanceIdx] = useState(6); // 1500m default
  const [poolLength, setPoolLength] = useState(25);
  const [minutes, setMinutes] = useState<string>("25");
  const [seconds, setSeconds] = useState<string>("00");
  const [targetPaceMin, setTargetPaceMin] = useState<string>("1");
  const [targetPaceSec, setTargetPaceSec] = useState<string>("40");
  const [mode, setMode] = useState<"pace-from-time" | "time-from-pace">("pace-from-time");

  const distance = DISTANCES[distanceIdx].value;
  const totalSeconds = parseInt(minutes) * 60 + parseFloat(seconds);
  const paceSeconds = (totalSeconds / distance) * 100;
  const laps = distance / poolLength;

  const targetPaceSeconds = parseInt(targetPaceMin) * 60 + parseFloat(targetPaceSec);
  const projectedTime = (targetPaceSeconds / 100) * distance;

  const lapTimes: number[] = [];
  if (mode === "pace-from-time" && totalSeconds > 0) {
    for (let i = 1; i <= Math.ceil(laps); i++) {
      lapTimes.push((totalSeconds / laps) * i);
    }
  } else if (mode === "time-from-pace" && targetPaceSeconds > 0) {
    for (let i = 1; i <= Math.ceil(laps); i++) {
      lapTimes.push((projectedTime / laps) * i);
    }
  }

  const splits = [100, 200, 400, 500, 1000].filter((d) => d < distance);

  return (
    <div className="space-y-6">
      {/* Mode Switch */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setMode("pace-from-time")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "pace-from-time"
              ? "bg-cyan-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          タイム → ペース計算
        </button>
        <button
          onClick={() => setMode("time-from-pace")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "time-from-pace"
              ? "bg-cyan-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          ペース → タイム計算
        </button>
      </div>

      {/* Distance Selector */}
      <div>
        <p className="text-xs text-gray-500 mb-2">距離</p>
        <div className="flex flex-wrap gap-2">
          {DISTANCES.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setDistanceIdx(idx)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                distanceIdx === idx
                  ? "bg-cyan-500 text-white border-cyan-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-cyan-300"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pool Length */}
      <div className="flex gap-3">
        {POOL_LENGTHS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPoolLength(p.value)}
            className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
              poolLength === p.value
                ? "bg-cyan-50 border-cyan-400 text-cyan-700 font-medium"
                : "bg-white border-gray-200 text-gray-600 hover:border-cyan-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {mode === "pace-from-time" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {distance}m のタイム
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2.5 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                placeholder="分"
              />
              <span className="text-gray-500 font-medium">分</span>
              <input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2.5 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                max="59.99"
                step="0.01"
                placeholder="秒"
              />
              <span className="text-gray-500 font-medium">秒</span>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目標ペース（100mあたり）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={targetPaceMin}
                onChange={(e) => setTargetPaceMin(e.target.value)}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2.5 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                placeholder="分"
              />
              <span className="text-gray-500 font-medium">分</span>
              <input
                type="number"
                value={targetPaceSec}
                onChange={(e) => setTargetPaceSec(e.target.value)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2.5 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="0"
                max="59"
                placeholder="秒"
              />
              <span className="text-gray-500 font-medium">秒</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-cyan-50 rounded-xl border border-cyan-200 p-5">
        {mode === "pace-from-time" ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-cyan-700 mb-1">100mペース</p>
                <p className="text-3xl font-bold text-cyan-600">{totalSeconds > 0 ? formatTime(paceSeconds) : "—"}</p>
                <p className="text-xs text-cyan-500">/100m</p>
              </div>
              <div>
                <p className="text-sm text-cyan-700 mb-1">速度</p>
                <p className="text-3xl font-bold text-cyan-600">
                  {totalSeconds > 0 ? ((distance / totalSeconds) * 3.6).toFixed(2) : "—"}
                </p>
                <p className="text-xs text-cyan-500">km/h</p>
              </div>
            </div>
            {distance > 100 && totalSeconds > 0 && (
              <div className="mt-4 pt-4 border-t border-cyan-200">
                <p className="text-sm font-medium text-cyan-700 mb-2">スプリット（等速ペース想定）</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {splits.map((d) => (
                    <div key={d} className="bg-white rounded-lg p-2 text-center border border-cyan-100">
                      <p className="text-xs text-gray-500">{d}m</p>
                      <p className="text-sm font-semibold text-gray-800">{formatTime((totalSeconds / distance) * d)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-cyan-700 mb-1">{distance}m 予測タイム</p>
              <p className="text-4xl font-bold text-cyan-600">{targetPaceSeconds > 0 ? formatTime(projectedTime) : "—"}</p>
            </div>
            {distance > 100 && targetPaceSeconds > 0 && (
              <div className="pt-4 border-t border-cyan-200">
                <p className="text-sm font-medium text-cyan-700 mb-2">スプリット</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {splits.map((d) => (
                    <div key={d} className="bg-white rounded-lg p-2 text-center border border-cyan-100">
                      <p className="text-xs text-gray-500">{d}m</p>
                      <p className="text-sm font-semibold text-gray-800">{formatTime((projectedTime / distance) * d)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lap breakdown */}
      {lapTimes.length > 0 && lapTimes.length <= 60 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            ラップタイム（{poolLength}mプール / {Math.ceil(laps)}本）
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
            {lapTimes.map((t, idx) => (
              <div key={idx} className="bg-cyan-50 rounded-lg px-2 py-1.5 text-center border border-cyan-100">
                <p className="text-xs text-cyan-600">{idx + 1}本目</p>
                <p className="text-xs font-semibold text-gray-800">{formatTime(t)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reference paces */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">参考：世界記録ペース（自由形）</h3>
        <div className="space-y-1.5 text-sm">
          {[
            { label: "100m男子 WR（46.91秒）", pace: "46.91" },
            { label: "200m男子 WR（1:42.00）", pace: "51.00" },
            { label: "400m男子 WR（3:40.07）", pace: "55.02" },
            { label: "1500m男子 WR（14:31.02）", pace: "58.07" },
          ].map((r, idx) => (
            <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-600">{r.label}</span>
              <span className="font-semibold text-cyan-700">{r.pace}秒/100m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
