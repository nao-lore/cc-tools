"use client";

import { useState, useMemo } from "react";

// --- Frame rates ---
const FRAMERATES = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 120] as const;
type Framerate = typeof FRAMERATES[number];

// --- Timecode helpers ---
function framesFromTimecode(tc: string, fps: number): number | null {
  // HH:MM:SS:FF or HH:MM:SS;FF (drop frame)
  const match = tc.match(/^(\d{1,2})[:\s](\d{2})[:\s](\d{2})[;:](\d{2})$/);
  if (!match) return null;
  const [, h, m, s, f] = match.map(Number);
  return ((h * 3600 + m * 60 + s) * Math.round(fps) + f);
}

function timecodeFromFrames(totalFrames: number, fps: number): string {
  const fpsi = Math.round(fps);
  const ff = totalFrames % fpsi;
  const totalSec = Math.floor(totalFrames / fpsi);
  const ss = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const mm = totalMin % 60;
  const hh = Math.floor(totalMin / 60);
  return [hh, mm, ss, ff].map((v, i) => (i < 3 ? String(v).padStart(2, "0") : String(v).padStart(2, "0"))).join(":");
}

function durationFromFrames(frames: number, fps: number): string {
  const totalMs = Math.round((frames / fps) * 1000);
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const ss = totalSec % 60;
  const mm = Math.floor(totalSec / 60) % 60;
  const hh = Math.floor(totalSec / 3600);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function secondsFromTimecode(tc: string, fps: number): number | null {
  const frames = framesFromTimecode(tc, fps);
  if (frames === null) return null;
  return frames / fps;
}

interface ConversionRow {
  fps: Framerate;
  frames: number;
  timecode: string;
  duration: string;
  speedChange: string;
}

export default function FramerateConverter() {
  const [inputMode, setInputMode] = useState<"timecode" | "frames" | "seconds">("timecode");
  const [inputValue, setInputValue] = useState("00:01:30:00");
  const [sourceFps, setSourceFps] = useState<Framerate>(24);
  const [targetFps, setTargetFps] = useState<Framerate>(30);

  // Parse input to total source frames
  const sourceFrames = useMemo((): number | null => {
    if (inputMode === "timecode") {
      return framesFromTimecode(inputValue, sourceFps);
    }
    if (inputMode === "frames") {
      const n = parseInt(inputValue);
      return isNaN(n) ? null : n;
    }
    if (inputMode === "seconds") {
      const s = parseFloat(inputValue);
      return isNaN(s) ? null : Math.round(s * sourceFps);
    }
    return null;
  }, [inputValue, sourceFps, inputMode]);

  const sourceDuration = sourceFrames !== null ? durationFromFrames(sourceFrames, sourceFps) : null;
  const sourceSeconds = sourceFrames !== null ? sourceFrames / sourceFps : null;

  // Converted target
  const targetFrames = useMemo(() => {
    if (sourceSeconds === null) return null;
    return Math.round(sourceSeconds * targetFps);
  }, [sourceSeconds, targetFps]);

  // All conversions table
  const allConversions = useMemo((): ConversionRow[] => {
    if (sourceSeconds === null) return [];
    return FRAMERATES.map((fps) => {
      const frames = Math.round(sourceSeconds * fps);
      const speedChange = fps === sourceFps
        ? "—"
        : `${((fps / sourceFps) * 100 - 100).toFixed(2)}%`;
      return {
        fps,
        frames,
        timecode: timecodeFromFrames(frames, fps),
        duration: durationFromFrames(frames, fps),
        speedChange,
      };
    });
  }, [sourceSeconds, sourceFps]);

  const isValid = sourceFrames !== null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">入力</h2>

        {/* Input mode */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {(["timecode", "frames", "seconds"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setInputMode(m); setInputValue(m === "timecode" ? "00:01:30:00" : m === "frames" ? "2160" : "90"); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                inputMode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {m === "timecode" ? "タイムコード" : m === "frames" ? "フレーム数" : "秒数"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {inputMode === "timecode" ? "タイムコード (HH:MM:SS:FF)" : inputMode === "frames" ? "フレーム数" : "秒数"}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputMode === "timecode" ? "00:01:30:00" : inputMode === "frames" ? "2160" : "90.5"}
              className={`w-full px-3 py-2.5 border rounded-xl text-base font-mono focus:outline-none focus:ring-2 ${
                isValid ? "border-gray-200 focus:ring-blue-300" : "border-red-300 focus:ring-red-300"
              }`}
            />
            {!isValid && inputValue && (
              <p className="text-xs text-red-500 mt-1">形式が正しくありません</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">元のフレームレート</label>
            <select
              value={sourceFps}
              onChange={(e) => setSourceFps(parseFloat(e.target.value) as Framerate)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {FRAMERATES.map((fps) => (
                <option key={fps} value={fps}>{fps} fps</option>
              ))}
            </select>
          </div>
        </div>

        {isValid && sourceDuration && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
            <span className="font-semibold">元の尺: </span>{sourceDuration}
            <span className="mx-3 text-blue-300">|</span>
            <span className="font-semibold">フレーム数: </span>{sourceFrames?.toLocaleString()}F
            <span className="mx-3 text-blue-300">|</span>
            <span className="font-semibold">秒数: </span>{sourceSeconds?.toFixed(4)}s
          </div>
        )}
      </div>

      {/* Quick conversion */}
      {isValid && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">変換先フレームレート</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">変換先</label>
              <select
                value={targetFps}
                onChange={(e) => setTargetFps(parseFloat(e.target.value) as Framerate)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {FRAMERATES.map((fps) => (
                  <option key={fps} value={fps}>{fps} fps</option>
                ))}
              </select>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-xs text-purple-600 font-semibold mb-1">変換結果</div>
              <div className="text-2xl font-bold text-purple-700 font-mono">
                {targetFrames?.toLocaleString()}F
              </div>
              <div className="text-sm text-purple-600 mt-0.5">
                {targetFrames !== null ? timecodeFromFrames(targetFrames, targetFps) : "—"}
                <span className="mx-2 opacity-50">|</span>
                {targetFrames !== null ? durationFromFrames(targetFrames, targetFps) : "—"}
              </div>
            </div>
          </div>
          {targetFps !== sourceFps && (
            <div className="mt-3 text-xs text-gray-500 bg-yellow-50 rounded-xl p-3 border border-yellow-200">
              <span className="font-semibold text-yellow-700">注意: </span>
              同じ尺を異なるfpsで再生する場合、フレーム数が変わります。
              速度変換（コンフォーム）なしにfpsを変えると再生時間が変わります（
              {sourceFps}→{targetFps}fps: 速度 {((targetFps / sourceFps) * 100).toFixed(2)}%）。
            </div>
          )}
        </div>
      )}

      {/* All conversions table */}
      {isValid && allConversions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">全フレームレート変換一覧</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">FPS</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">フレーム数</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">タイムコード</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">尺 (ms)</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500">速度変化</th>
                </tr>
              </thead>
              <tbody>
                {allConversions.map((row) => (
                  <tr
                    key={row.fps}
                    className={`border-b border-gray-50 ${
                      row.fps === sourceFps ? "bg-blue-50" : row.fps === targetFps ? "bg-purple-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-bold text-gray-800">
                      {row.fps}
                      {row.fps === sourceFps && <span className="ml-1 text-xs text-blue-600">(元)</span>}
                      {row.fps === targetFps && row.fps !== sourceFps && <span className="ml-1 text-xs text-purple-600">(変換先)</span>}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-700">{row.frames.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-700">{row.timecode}</td>
                    <td className="py-2 px-3 text-right font-mono text-gray-700 text-xs">{row.duration}</td>
                    <td className={`py-2 px-3 text-right text-xs font-medium ${
                      row.speedChange === "—" ? "text-gray-400" :
                      row.speedChange.startsWith("-") ? "text-red-600" : "text-green-600"
                    }`}>
                      {row.speedChange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reference */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">フレームレート早見表</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
          {[
            ["23.976fps", "映画・Blu-ray（NTSC地域）"],
            ["24fps", "映画の標準。シネマルック"],
            ["25fps", "PAL地域のTV・放送標準"],
            ["29.97fps", "NTSCのTV放送（日米）"],
            ["30fps", "YouTube・Webに最適"],
            ["48fps", "HFR映画（The Hobbit等）"],
            ["50fps", "PAL地域のHD放送"],
            ["59.94fps", "NTSCのHD放送"],
            ["60fps", "スポーツ・ゲーム実況"],
            ["120fps", "スローモーション・VR"],
          ].map(([fps, desc]) => (
            <div key={fps} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="font-mono font-bold text-gray-800 w-20 shrink-0">{fps}</span>
              <span className="text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このフレームレート変換計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">動画のフレームレート変換時の尺・フレーム数・タイムコードを計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このフレームレート変換計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "動画のフレームレート変換時の尺・フレーム数・タイムコードを計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
