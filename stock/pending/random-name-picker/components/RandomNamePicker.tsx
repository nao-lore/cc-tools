"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_NAMES = ["田中さん", "鈴木さん", "佐藤さん", "山田さん", "伊藤さん", "渡辺さん", "中村さん", "小林さん", "加藤さん", "吉田さん"];

export default function RandomNamePicker() {
  const [inputText, setInputText] = useState(DEFAULT_NAMES.join("\n"));
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayName, setDisplayName] = useState<string>("?");
  const [history, setHistory] = useState<string[]>([]);
  const [pickCount, setPickCount] = useState(1);
  const [multiWinners, setMultiWinners] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const parsed = inputText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setNames(parsed);
    setWinner(null);
    setMultiWinners([]);
  }, [inputText]);

  const activeNames = names.filter((n) => !excluded.has(n));

  const spin = useCallback(() => {
    if (isSpinning || activeNames.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    setMultiWinners([]);

    let speed = 50;
    let elapsed = 0;
    const duration = 2500;

    const tick = () => {
      elapsed += speed;
      const rnd = activeNames[Math.floor(Math.random() * activeNames.length)];
      setDisplayName(rnd);

      // Gradually slow down
      if (elapsed > duration * 0.6) speed = 120;
      if (elapsed > duration * 0.8) speed = 220;
      if (elapsed > duration * 0.9) speed = 350;

      if (elapsed >= duration) {
        // Pick final winner(s)
        if (pickCount <= 1) {
          const chosen = activeNames[Math.floor(Math.random() * activeNames.length)];
          setWinner(chosen);
          setDisplayName(chosen);
          setHistory((h) => [chosen, ...h].slice(0, 20));
        } else {
          const shuffled = [...activeNames].sort(() => Math.random() - 0.5);
          const chosen = shuffled.slice(0, Math.min(pickCount, activeNames.length));
          setMultiWinners(chosen);
          setWinner(chosen[0]);
          setDisplayName(chosen.join(", "));
          setHistory((h) => [...chosen, ...h].slice(0, 20));
        }
        setIsSpinning(false);
        return;
      }

      timeoutRef.current = setTimeout(tick, speed);
    };

    timeoutRef.current = setTimeout(tick, speed);
  }, [isSpinning, activeNames, pickCount]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const toggleExclude = (name: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const reset = () => {
    setWinner(null);
    setMultiWinners([]);
    setDisplayName("?");
    setHistory([]);
    setExcluded(new Set());
  };

  const removeFromPool = () => {
    if (winner) {
      setExcluded((prev) => {
        const next = new Set(prev);
        next.add(winner);
        return next;
      });
      setWinner(null);
      setDisplayName("?");
    }
  };

  return (
    <div className="space-y-6">
      {/* Roulette display */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-center shadow-lg">
        <div
          className={`text-5xl font-bold text-white mb-6 min-h-16 flex items-center justify-center transition-all duration-75 ${
            isSpinning ? "opacity-80 scale-105" : winner ? "opacity-100 scale-110" : "opacity-40"
          }`}
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
        >
          {displayName}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={spin}
            disabled={isSpinning || activeNames.length === 0}
            className={`px-8 py-3 rounded-full text-white font-bold text-lg shadow-md transition-all ${
              isSpinning
                ? "bg-white/20 cursor-not-allowed"
                : "bg-white/20 hover:bg-white/30 active:scale-95 hover:shadow-lg"
            }`}
          >
            {isSpinning ? "抽選中..." : "スタート！"}
          </button>
          {winner && !isSpinning && (
            <button
              onClick={removeFromPool}
              className="px-5 py-3 rounded-full bg-red-500/80 hover:bg-red-500 text-white font-medium transition-all"
            >
              除外して次へ
            </button>
          )}
        </div>

        <div className="mt-4 text-white/70 text-sm">
          残り {activeNames.length} 名 / 全 {names.length} 名
        </div>
      </div>

      {/* Multi winner result */}
      {multiWinners.length > 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">当選者 ({multiWinners.length}名)</h2>
          <div className="flex flex-wrap gap-2">
            {multiWinners.map((name, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 font-semibold px-4 py-2 rounded-full"
              >
                <span className="text-indigo-400 text-xs">{idx + 1}</span>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">名前リスト</h2>
            <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">
              リセット
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            placeholder="1行に1名ずつ入力"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm text-gray-600">同時に選ぶ人数:</label>
            <input
              type="number"
              value={pickCount}
              onChange={(e) => setPickCount(Math.max(1, Number(e.target.value)))}
              min={1}
              max={names.length}
              className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-400">名</span>
          </div>
        </div>

        {/* Name pool visualization */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            抽選プール（クリックで除外）
          </h2>
          <div className="flex flex-wrap gap-2 min-h-24">
            {names.map((name) => (
              <button
                key={name}
                onClick={() => toggleExclude(name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  excluded.has(name)
                    ? "bg-gray-100 text-gray-400 line-through"
                    : winner === name
                    ? "bg-yellow-400 text-yellow-900 shadow-md scale-105"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                {name}
              </button>
            ))}
            {names.length === 0 && (
              <p className="text-sm text-gray-400">名前リストが空です</p>
            )}
          </div>
          {excluded.size > 0 && (
            <div className="mt-3 text-xs text-gray-400">
              {excluded.size}名を除外中。クリックで復活。
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">抽選履歴</h2>
          <div className="flex flex-wrap gap-2">
            {history.map((name, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
              >
                <span className="text-gray-400 text-xs">#{history.length - idx}</span>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
