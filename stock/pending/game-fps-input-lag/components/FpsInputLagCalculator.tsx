"use client";
import { useState, useMemo } from "react";

interface Preset {
  name: string;
  refreshRate: number;
  responseTime: number;
  gpuDelay: number;
  usbDelay: number;
}

const PRESETS: Preset[] = [
  { name: "240Hz ゲーミング", refreshRate: 240, responseTime: 1, gpuDelay: 4, usbDelay: 1 },
  { name: "144Hz ゲーミング", refreshRate: 144, responseTime: 2, gpuDelay: 6, usbDelay: 1 },
  { name: "165Hz ゲーミング", refreshRate: 165, responseTime: 1, gpuDelay: 5, usbDelay: 1 },
  { name: "60Hz 一般", refreshRate: 60, responseTime: 5, gpuDelay: 10, usbDelay: 8 },
];

interface Result {
  frameTime: number;
  totalLag: number;
  breakdown: { label: string; value: number; color: string }[];
}

export default function FpsInputLagCalculator() {
  const [refreshRate, setRefreshRate] = useState(144);
  const [responseTime, setResponseTime] = useState(2);
  const [gpuDelay, setGpuDelay] = useState(6);
  const [usbDelay, setUsbDelay] = useState(1);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareRefreshRate, setCompareRefreshRate] = useState(240);
  const [compareResponseTime, setCompareResponseTime] = useState(1);
  const [compareGpuDelay, setCompareGpuDelay] = useState(4);
  const [compareUsbDelay, setCompareUsbDelay] = useState(1);

  const calc = (rr: number, rt: number, gpu: number, usb: number): Result => {
    const frameTime = 1000 / rr;
    const scanline = frameTime / 2;
    const totalLag = frameTime + rt + gpu + usb + scanline;
    return {
      frameTime,
      totalLag,
      breakdown: [
        { label: "フレーム時間", value: frameTime, color: "bg-blue-500" },
        { label: "スキャンライン遅延", value: scanline, color: "bg-indigo-400" },
        { label: "パネル応答時間", value: rt, color: "bg-purple-500" },
        { label: "GPU遅延", value: gpu, color: "bg-orange-500" },
        { label: "USB入力遅延", value: usb, color: "bg-red-400" },
      ],
    };
  };

  const result = useMemo(() => calc(refreshRate, responseTime, gpuDelay, usbDelay), [refreshRate, responseTime, gpuDelay, usbDelay]);
  const compareResult = useMemo(() => calc(compareRefreshRate, compareResponseTime, compareGpuDelay, compareUsbDelay), [compareRefreshRate, compareResponseTime, compareGpuDelay, compareUsbDelay]);

  const applyPreset = (p: Preset) => {
    setRefreshRate(p.refreshRate);
    setResponseTime(p.responseTime);
    setGpuDelay(p.gpuDelay);
    setUsbDelay(p.usbDelay);
  };

  const getLagColor = (ms: number) => {
    if (ms < 15) return "text-green-600";
    if (ms < 25) return "text-yellow-600";
    return "text-red-600";
  };

  const getLagLabel = (ms: number) => {
    if (ms < 15) return "非常に良好";
    if (ms < 20) return "良好";
    if (ms < 25) return "普通";
    if (ms < 35) return "やや遅い";
    return "遅い";
  };

  const SliderInput = ({
    label, value, min, max, step, unit, onChange, description,
  }: {
    label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; description?: string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-gray-900">{value}{unit}</span>
      </div>
      {description && <p className="text-xs text-gray-500 mb-1">{description}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );

  const ResultCard = ({ r, label }: { r: Result; label: string }) => {
    const maxVal = r.breakdown.reduce((s, b) => s + b.value, 0);
    return (
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-700 mb-3">{label}</h3>
        <div className={`text-4xl font-bold mb-1 ${getLagColor(r.totalLag)}`}>
          {r.totalLag.toFixed(1)}<span className="text-xl ml-1">ms</span>
        </div>
        <div className={`text-sm font-medium mb-4 ${getLagColor(r.totalLag)}`}>{getLagLabel(r.totalLag)}</div>
        <div className="w-full flex rounded-full overflow-hidden h-4 mb-4">
          {r.breakdown.map((b) => (
            <div key={b.label} style={{ width: `${(b.value / maxVal) * 100}%` }} className={`${b.color} h-full`} title={`${b.label}: ${b.value.toFixed(1)}ms`} />
          ))}
        </div>
        <div className="space-y-2">
          {r.breakdown.map((b) => (
            <div key={b.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-sm ${b.color}`} />
                <span className="text-gray-600">{b.label}</span>
              </div>
              <span className="font-medium text-gray-800">{b.value.toFixed(1)}ms</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          フレームレート換算: <span className="font-semibold text-gray-700">{(1000 / r.totalLag).toFixed(0)} FPS 相当の応答性</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">プリセット</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-700"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main inputs */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">メイン設定</h2>
          <SliderInput label="リフレッシュレート" value={refreshRate} min={60} max={360} step={1} unit="Hz" onChange={setRefreshRate} description="モニターのリフレッシュレート" />
          <SliderInput label="パネル応答時間 (GtG)" value={responseTime} min={0.5} max={20} step={0.5} unit="ms" onChange={setResponseTime} description="モニタースペックの応答速度" />
          <SliderInput label="GPU描画遅延" value={gpuDelay} min={1} max={30} step={0.5} unit="ms" onChange={setGpuDelay} description="GPUのレンダリングパイプライン遅延" />
          <SliderInput label="USB入力遅延" value={usbDelay} min={0.5} max={16} step={0.5} unit="ms" onChange={setUsbDelay} description="マウス・キーボードのポーリングレート由来の遅延" />
        </div>

        {/* Result */}
        <ResultCard r={result} label="計算結果" />
      </div>

      {/* Compare toggle */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">比較モード</h2>
          <button
            onClick={() => setCompareEnabled(!compareEnabled)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${compareEnabled ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {compareEnabled ? "ON" : "OFF"}
          </button>
        </div>
        {compareEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <SliderInput label="リフレッシュレート (比較)" value={compareRefreshRate} min={60} max={360} step={1} unit="Hz" onChange={setCompareRefreshRate} />
              <SliderInput label="パネル応答時間 (比較)" value={compareResponseTime} min={0.5} max={20} step={0.5} unit="ms" onChange={setCompareResponseTime} />
              <SliderInput label="GPU描画遅延 (比較)" value={compareGpuDelay} min={1} max={30} step={0.5} unit="ms" onChange={setCompareGpuDelay} />
              <SliderInput label="USB入力遅延 (比較)" value={compareUsbDelay} min={0.5} max={16} step={0.5} unit="ms" onChange={setCompareUsbDelay} />
            </div>
            <ResultCard r={compareResult} label="比較結果" />
          </div>
        )}
        {compareEnabled && (
          <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-sm font-medium text-gray-700">差分</p>
            <p className={`text-2xl font-bold mt-1 ${result.totalLag < compareResult.totalLag ? "text-green-600" : "text-red-600"}`}>
              {result.totalLag < compareResult.totalLag ? "-" : "+"}{Math.abs(result.totalLag - compareResult.totalLag).toFixed(1)}ms
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {result.totalLag < compareResult.totalLag ? "メイン設定の方が速い" : "比較設定の方が速い"}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">計算方法について</p>
        <p>総遅延 = フレーム時間 + スキャンライン遅延(フレーム時間/2) + パネル応答時間 + GPU遅延 + USB入力遅延。実際の値はシステム構成・ドライバ・ゲームエンジンにより異なります。</p>
      </div>
    </div>
  );
}
