"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Split {
  name: string;
  bestMs: number | null;
  currentMs: number | null;
}

const DEFAULT_SPLITS = [
  "Opening",
  "World 1",
  "World 2",
  "World 3",
  "Final Boss",
];

function msToDisplay(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function diffDisplay(diff: number): string {
  const sign = diff < 0 ? "-" : "+";
  return `${sign}${msToDisplay(Math.abs(diff))}`;
}

export default function SpeedrunTimer() {
  const [splits, setSplits] = useState<Split[]>(DEFAULT_SPLITS.map((name) => ({ name, bestMs: null, currentMs: null })));
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentSplitIdx, setCurrentSplitIdx] = useState(0);
  const [splitStartMs, setSplitStartMs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [newSplitName, setNewSplitName] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const tick = useCallback(() => {
    setElapsed(Date.now() - startTimeRef.current);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  const handleStart = () => {
    if (finished) return;
    startTimeRef.current = Date.now() - elapsed;
    setRunning(true);
    setSplitStartMs(Date.now() - elapsed);
  };

  const handleSplit = () => {
    if (!running || finished) return;
    const now = Date.now();
    const splitMs = now - startTimeRef.current - splitStartMs + startTimeRef.current;
    // segment time = elapsed since last split
    const segMs = elapsed - (currentSplitIdx === 0 ? 0 : splits.slice(0, currentSplitIdx).reduce((s, sp) => s + (sp.currentMs ?? 0), 0));

    setSplits((prev) => {
      const next = [...prev];
      next[currentSplitIdx] = {
        ...next[currentSplitIdx],
        currentMs: segMs,
        bestMs: next[currentSplitIdx].bestMs === null ? segMs : Math.min(next[currentSplitIdx].bestMs!, segMs),
      };
      return next;
    });

    if (currentSplitIdx + 1 >= splits.length) {
      setRunning(false);
      setFinished(true);
    } else {
      setCurrentSplitIdx((i) => i + 1);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setCurrentSplitIdx(0);
    setFinished(false);
    setSplits((prev) => prev.map((s) => ({ ...s, currentMs: null })));
  };

  const handleResetBests = () => {
    setSplits((prev) => prev.map((s) => ({ ...s, bestMs: null, currentMs: null })));
    handleReset();
  };

  const handleSkip = () => {
    if (!running || finished) return;
    setSplits((prev) => {
      const next = [...prev];
      next[currentSplitIdx] = { ...next[currentSplitIdx], currentMs: null };
      return next;
    });
    if (currentSplitIdx + 1 >= splits.length) {
      setRunning(false);
      setFinished(true);
    } else {
      setCurrentSplitIdx((i) => i + 1);
    }
  };

  const addSplit = () => {
    setSplits((prev) => [...prev, { name: `Split ${prev.length + 1}`, bestMs: null, currentMs: null }]);
  };

  const removeSplit = (idx: number) => {
    if (splits.length <= 1) return;
    setSplits((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalCurrent = splits.reduce((s, sp) => s + (sp.currentMs ?? 0), 0);
  const totalBest = splits.every((s) => s.bestMs !== null) ? splits.reduce((s, sp) => s + (sp.bestMs ?? 0), 0) : null;

  const getSegmentElapsed = (idx: number) => {
    const prevTotal = splits.slice(0, idx).reduce((s, sp) => s + (sp.currentMs ?? 0), 0);
    return idx < currentSplitIdx ? (splits[idx].currentMs ?? 0) : idx === currentSplitIdx ? elapsed - prevTotal : null;
  };

  return (
    <div className="space-y-4">
      {/* Timer display */}
      <div className="bg-gray-900 rounded-2xl p-8 text-center shadow-lg">
        <div className="text-6xl font-mono font-bold text-white tracking-widest mb-2">
          {msToDisplay(elapsed)}
        </div>
        {totalBest !== null && finished && (
          <div className={`text-lg font-mono font-semibold ${totalCurrent < totalBest ? "text-green-400" : "text-red-400"}`}>
            {diffDisplay(totalCurrent - totalBest)} vs PB
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        {!running && !finished && (
          <button onClick={handleStart} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
            {elapsed === 0 ? "スタート" : "再開"}
          </button>
        )}
        {running && !finished && (
          <>
            <button onClick={handleSplit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
              スプリット
            </button>
            <button onClick={handleSkip} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm">
              スキップ
            </button>
          </>
        )}
        <button onClick={handleReset} disabled={elapsed === 0 && !finished} className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white font-bold py-3 px-6 rounded-xl transition-colors">
          リセット
        </button>
        <button onClick={handleResetBests} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-4 rounded-xl transition-colors text-sm">
          PBリセット
        </button>
      </div>

      {/* Splits table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600 font-semibold">区間名</th>
              <th className="px-4 py-3 text-right text-gray-600 font-semibold">区間タイム</th>
              <th className="px-4 py-3 text-right text-gray-600 font-semibold">ベスト</th>
              <th className="px-4 py-3 text-right text-gray-600 font-semibold">差分</th>
              {!running && !finished && <th className="px-2 py-3" />}
            </tr>
          </thead>
          <tbody>
            {splits.map((split, idx) => {
              const segElapsed = getSegmentElapsed(idx);
              const diff = split.currentMs !== null && split.bestMs !== null ? split.currentMs - split.bestMs : null;
              const isActive = idx === currentSplitIdx && running;
              return (
                <tr key={idx} className={`border-b border-gray-100 ${isActive ? "bg-blue-50" : ""}`}>
                  <td className="px-4 py-3">
                    {editingName === idx ? (
                      <input
                        autoFocus
                        className="border border-blue-400 rounded px-2 py-0.5 text-sm w-full"
                        value={newSplitName}
                        onChange={(e) => setNewSplitName(e.target.value)}
                        onBlur={() => {
                          setSplits((prev) => prev.map((s, i) => i === idx ? { ...s, name: newSplitName || s.name } : s));
                          setEditingName(null);
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") { setSplits((prev) => prev.map((s, i) => i === idx ? { ...s, name: newSplitName || s.name } : s)); setEditingName(null); } }}
                      />
                    ) : (
                      <span
                        className={`cursor-pointer hover:text-blue-600 ${isActive ? "font-bold text-blue-700" : "text-gray-800"}`}
                        onClick={() => { if (!running && !finished) { setEditingName(idx); setNewSplitName(split.name); } }}
                      >
                        {isActive && <span className="mr-1">▶</span>}{split.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-800">
                    {isActive && segElapsed !== null ? msToDisplay(segElapsed) : split.currentMs !== null ? msToDisplay(split.currentMs) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-500">
                    {split.bestMs !== null ? msToDisplay(split.bestMs) : "—"}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${diff === null ? "text-gray-400" : diff < 0 ? "text-green-600" : "text-red-600"}`}>
                    {diff !== null ? diffDisplay(diff) : "—"}
                  </td>
                  {!running && !finished && (
                    <td className="px-2 py-3">
                      <button onClick={() => removeSplit(idx)} className="text-gray-400 hover:text-red-500 text-xs px-1">✕</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td className="px-4 py-3 font-bold text-gray-700">合計</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                {finished ? msToDisplay(totalCurrent) : msToDisplay(elapsed)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-gray-500">
                {totalBest !== null ? msToDisplay(totalBest) : "—"}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold">
                {finished && totalBest !== null ? (
                  <span className={totalCurrent < totalBest ? "text-green-600" : "text-red-600"}>
                    {diffDisplay(totalCurrent - totalBest)}
                  </span>
                ) : "—"}
              </td>
              {!running && !finished && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {!running && !finished && (
        <button onClick={addSplit} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm">
          + 区間を追加
        </button>
      )}

      <div className="text-xs text-gray-400 text-center">区間名をクリックして編集 (停止中のみ)</div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このスピードランタイマーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">スピードランの区間タイムを記録し、ベストとの差分をリアルタイム表示。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このスピードランタイマーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "スピードランの区間タイムを記録し、ベストとの差分をリアルタイム表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "スピードランタイマー",
  "description": "スピードランの区間タイムを記録し、ベストとの差分をリアルタイム表示",
  "url": "https://tools.loresync.dev/speedrun-timer",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
