"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Mode = "browse" | "practice";

type Question = {
  a: number;
  b: number;
};

type Result = {
  question: Question;
  correct: boolean;
  userAnswer: number;
};

const TOTAL_QUESTIONS = 20;
const STORAGE_KEY = "multiplication-table-weak-spots";

function loadWeakSpots(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWeakSpots(spots: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
  } catch {
    // ignore
  }
}

function questionKey(q: Question) {
  return `${q.a}x${q.b}`;
}

function generateQuestion(enabledDan: number[]): Question {
  const a = enabledDan[Math.floor(Math.random() * enabledDan.length)];
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b };
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}分${sec}秒` : `${sec}秒`;
}

export default function MultiplicationTable() {
  const [mode, setMode] = useState<Mode>("browse");

  // --- Browse mode state ---
  const [highlighted, setHighlighted] = useState<{ row: number; col: number } | null>(null);

  // --- Practice mode state ---
  const [enabledDan, setEnabledDan] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (started && !showResults) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - (startTime ?? Date.now()));
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, showResults, startTime]);

  const startPractice = useCallback(() => {
    if (enabledDan.length === 0) return;
    const q = generateQuestion(enabledDan);
    setQuestion(q);
    setResults([]);
    setUserInput("");
    setFeedback(null);
    setShowResults(false);
    setStarted(true);
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [enabledDan]);

  const submitAnswer = useCallback(() => {
    if (!question || feedback) return;
    const answer = parseInt(userInput, 10);
    if (isNaN(answer)) return;

    const correct = answer === question.a * question.b;
    const result: Result = { question, correct, userAnswer: answer };
    const newResults = [...results, result];

    // Update weak spots
    const spots = loadWeakSpots();
    const key = questionKey(question);
    if (!correct) {
      spots[key] = (spots[key] ?? 0) + 1;
    } else {
      // Reduce weak spot count on correct
      if (spots[key] && spots[key] > 0) spots[key] = Math.max(0, spots[key] - 1);
      if (spots[key] === 0) delete spots[key];
    }
    saveWeakSpots(spots);

    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      if (newResults.length >= TOTAL_QUESTIONS) {
        setResults(newResults);
        setShowResults(true);
        setStarted(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        const next = generateQuestion(enabledDan);
        setQuestion(next);
        setResults(newResults);
        setUserInput("");
        setFeedback(null);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, 600);
  }, [question, userInput, results, enabledDan, feedback]);

  const toggleDan = (dan: number) => {
    setEnabledDan((prev) =>
      prev.includes(dan) ? prev.filter((d) => d !== dan) : [...prev, dan].sort((a, b) => a - b)
    );
  };

  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  const weakSpots = Object.entries(loadWeakSpots())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("browse"); setStarted(false); setShowResults(false); }}
          className={`px-5 py-2 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
            mode === "browse"
              ? "bg-accent text-white"
              : "bg-surface border border-border text-muted hover:bg-gray-100"
          }`}
        >
          九九表
        </button>
        <button
          onClick={() => { setMode("practice"); setStarted(false); setShowResults(false); }}
          className={`px-5 py-2 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
            mode === "practice"
              ? "bg-accent text-white"
              : "bg-surface border border-border text-muted hover:bg-gray-100"
          }`}
        >
          練習モード
        </button>
      </div>

      {/* ===== BROWSE MODE ===== */}
      {mode === "browse" && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <p className="text-sm text-muted mb-3">セルをクリックすると行・列をハイライトします</p>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-8 h-8 text-muted text-xs">×</th>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((col) => (
                    <th
                      key={col}
                      className={`w-10 h-8 font-bold text-xs transition-colors ${
                        highlighted?.col === col
                          ? "bg-blue-100 text-blue-700"
                          : "text-muted"
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 9 }, (_, ri) => ri + 1).map((row) => (
                  <tr key={row}>
                    <td
                      className={`font-bold text-xs transition-colors ${
                        highlighted?.row === row
                          ? "bg-blue-100 text-blue-700"
                          : "text-muted"
                      }`}
                    >
                      {row}
                    </td>
                    {Array.from({ length: 9 }, (_, ci) => ci + 1).map((col) => {
                      const isHighlightedRow = highlighted?.row === row;
                      const isHighlightedCol = highlighted?.col === col;
                      const isSelected = highlighted?.row === row && highlighted?.col === col;
                      return (
                        <td
                          key={col}
                          onClick={() =>
                            setHighlighted(
                              isSelected ? null : { row, col }
                            )
                          }
                          className={`w-10 h-10 rounded-lg font-semibold text-sm cursor-pointer select-none transition-colors ${
                            isSelected
                              ? "bg-accent text-white shadow-md"
                              : isHighlightedRow || isHighlightedCol
                              ? "bg-blue-50 text-blue-800"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {row * col}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {highlighted && (
            <div className="mt-4 text-center text-lg font-bold text-gray-800">
              {highlighted.row} × {highlighted.col} ={" "}
              <span className="text-accent text-2xl">{highlighted.row * highlighted.col}</span>
            </div>
          )}
        </div>
      )}

      {/* ===== PRACTICE MODE ===== */}
      {mode === "practice" && (
        <div className="space-y-4">
          {/* Settings */}
          {!started && !showResults && (
            <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
              <h2 className="font-semibold text-gray-800">練習する段を選ぶ</h2>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((dan) => (
                  <button
                    key={dan}
                    onClick={() => toggleDan(dan)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                      enabledDan.includes(dan)
                        ? "bg-accent text-white"
                        : "bg-surface border border-border text-muted hover:bg-gray-100"
                    }`}
                  >
                    {dan}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEnabledDan([1, 2, 3, 4, 5, 6, 7, 8, 9])}
                  className="text-xs text-muted underline cursor-pointer"
                >
                  全選択
                </button>
                <button
                  onClick={() => setEnabledDan([])}
                  className="text-xs text-muted underline cursor-pointer"
                >
                  全解除
                </button>
                {weakSpots.length > 0 && (
                  <button
                    onClick={() => {
                      const dans = [...new Set(weakSpots.map(([key]) => parseInt(key.split("x")[0])))];
                      setEnabledDan(dans.sort((a, b) => a - b));
                    }}
                    className="text-xs text-orange-600 underline cursor-pointer"
                  >
                    苦手な段だけ
                  </button>
                )}
              </div>

              {weakSpots.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-orange-700 mb-1">苦手な問題</p>
                  <div className="flex flex-wrap gap-2">
                    {weakSpots.map(([key, count]) => {
                      const [a, b] = key.split("x").map(Number);
                      return (
                        <span key={key} className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          {a}×{b}={a * b} ({count}回ミス)
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={startPractice}
                disabled={enabledDan.length === 0}
                className="bg-accent text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                スタート（{TOTAL_QUESTIONS}問）
              </button>
            </div>
          )}

          {/* Quiz */}
          {started && !showResults && question && (
            <div className="bg-surface rounded-2xl border border-border p-6 space-y-6">
              {/* Progress + Timer */}
              <div className="flex justify-between items-center text-sm text-muted">
                <span>{results.length + 1} / {TOTAL_QUESTIONS} 問</span>
                <span className="font-mono">{formatTime(elapsed)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-accent h-1.5 rounded-full transition-all"
                  style={{ width: `${(results.length / TOTAL_QUESTIONS) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-gray-800 tracking-wide">
                  {question.a} × {question.b} = ?
                </div>

                {feedback && (
                  <div
                    className={`text-lg font-bold ${
                      feedback === "correct" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {feedback === "correct"
                      ? "正解！"
                      : `不正解… 答えは ${question.a * question.b}`}
                  </div>
                )}

                {!feedback && (
                  <div className="flex justify-center gap-2">
                    <input
                      ref={inputRef}
                      type="number"
                      min="1"
                      max="81"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                      className="w-24 text-center text-2xl font-bold border-2 border-border rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                      placeholder="?"
                    />
                    <button
                      onClick={submitAnswer}
                      className="bg-accent text-white font-semibold px-5 py-2 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      回答
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
              <h2 className="text-xl font-bold text-gray-800 text-center">結果</h2>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-gray-800">{formatTime(elapsed)}</div>
                  <div className="text-xs text-muted mt-1">タイム</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-gray-800">{correctCount}/{TOTAL_QUESTIONS}</div>
                  <div className="text-xs text-muted mt-1">正答数</div>
                </div>
                <div
                  className={`rounded-xl p-3 ${
                    accuracy >= 90
                      ? "bg-green-50"
                      : accuracy >= 70
                      ? "bg-yellow-50"
                      : "bg-red-50"
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      accuracy >= 90
                        ? "text-green-700"
                        : accuracy >= 70
                        ? "text-yellow-700"
                        : "text-red-600"
                    }`}
                  >
                    {accuracy}%
                  </div>
                  <div className="text-xs text-muted mt-1">正答率</div>
                </div>
              </div>

              {/* Wrong answers */}
              {results.filter((r) => !r.correct).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700 mb-2">間違えた問題</p>
                  <div className="space-y-1">
                    {results
                      .filter((r) => !r.correct)
                      .map((r, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {r.question.a} × {r.question.b} = {r.question.a * r.question.b}
                          </span>
                          <span className="text-red-500">あなたの答え: {r.userAnswer}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Weak spots (cumulative) */}
              {weakSpots.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-orange-700 mb-2">苦手な問題（累計）</p>
                  <div className="flex flex-wrap gap-2">
                    {weakSpots.map(([key, count]) => {
                      const [a, b] = key.split("x").map(Number);
                      return (
                        <span key={key} className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          {a}×{b}={a * b} ({count}回)
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={startPractice}
                  className="flex-1 bg-accent text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  もう一度
                </button>
                <button
                  onClick={() => { setShowResults(false); setStarted(false); }}
                  className="flex-1 bg-surface border border-border text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  設定に戻る
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 text-center text-muted text-sm">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この九九 練習ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">九九を練習・暗記するためのインタラクティブツール。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この九九 練習ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "九九を練習・暗記するためのインタラクティブツール。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "九九 練習ツール",
  "description": "九九を練習・暗記するためのインタラクティブツール",
  "url": "https://tools.loresync.dev/multiplication-table",
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
