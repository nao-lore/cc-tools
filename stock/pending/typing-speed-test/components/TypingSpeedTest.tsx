"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Difficulty = "easy" | "medium" | "hard";

const SAMPLE_TEXTS: Record<Difficulty, string[]> = {
  easy: [
    "the cat sat on the mat and looked at the sun",
    "a big dog ran fast down the long road to the park",
    "she has a red hat and a blue bag on her arm",
    "he went to the shop to buy milk and some bread",
    "the boy and his dog played all day in the yard",
    "we can see the stars at night when the sky is clear",
    "my mom made hot soup and warm bread for us today",
    "the baby slept all day and cried at night in her crib",
    "they live in a small house near the old oak tree",
    "it was a bright cold day and the wind blew hard",
  ],
  medium: [
    "Productivity is not about doing more things, but about doing the right things at the right time with focused attention.",
    "The best way to predict the future is to create it yourself through consistent effort and deliberate practice every day.",
    "Reading books regularly expands your vocabulary, improves concentration, and exposes you to ideas you would never encounter otherwise.",
    "Sleep is not a luxury but a biological necessity that affects memory consolidation, mood regulation, and physical recovery.",
    "Learning to type faster is a skill that compounds over time, saving hours each week across an entire career.",
    "Effective communication requires not just speaking clearly but also listening carefully and responding thoughtfully to what others say.",
    "The internet has transformed how people access information, but it has also created new challenges around attention and focus.",
    "Morning routines help set the tone for the rest of the day by building momentum through small, intentional actions.",
    "Good software design prioritizes simplicity, readability, and maintainability over cleverness or the use of obscure language features.",
    "Regular exercise has been shown to improve cognitive function, reduce stress, and increase overall life expectancy significantly.",
  ],
  hard: [
    "const debounce = (fn: (...args: unknown[]) => void, delay: number) => { let timer: ReturnType<typeof setTimeout>; return (...args: unknown[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };",
    "SELECT u.name, COUNT(o.id) AS order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2024-01-01' GROUP BY u.id HAVING order_count > 5 ORDER BY order_count DESC;",
    "The asymptotic complexity O(n log n) of merge sort arises because the array is recursively split into halves (log n levels) and each level requires O(n) work to merge the sorted subsequences.",
    "HTTP/2 introduced multiplexing, header compression via HPACK, server push, and stream prioritization to address the head-of-line blocking limitations inherent in HTTP/1.1 pipelining.",
    "async function fetchWithRetry(url: string, retries = 3): Promise<Response> { for (let i = 0; i < retries; i++) { try { return await fetch(url); } catch (e) { if (i === retries - 1) throw e; } } throw new Error('unreachable'); }",
    "Dijkstra's algorithm maintains a priority queue of vertices ordered by tentative distance, greedily relaxing edges to find shortest paths in O((V + E) log V) time with a binary heap.",
    "git rebase --interactive HEAD~5 allows you to squash, reword, edit, or drop commits before pushing; always prefer rebasing feature branches, never shared branches like main or develop.",
    "The CAP theorem states that a distributed system can provide at most two of: Consistency, Availability, and Partition tolerance simultaneously under network partition conditions.",
    "React's reconciliation algorithm compares virtual DOM trees using a heuristic O(n) diffing strategy, assuming elements of different types produce different trees and stable keys improve list performance.",
    "CSS specificity is calculated as (inline, id, class/attr/pseudo-class, element/pseudo-element) — a specificity of (0,1,2,1) beats (0,1,1,3) regardless of declaration order in the stylesheet.",
  ],
};

type TestState = "idle" | "running" | "finished";

type Results = {
  wpm: number;
  accuracy: number;
  timeSeconds: number;
  errors: number;
};

export default function TypingSpeedTest() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [textIndex, setTextIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<TestState>("idle");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<Results | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetText = SAMPLE_TEXTS[difficulty][textIndex];

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((start: number) => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 500);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (state === "idle" && value.length > 0) {
      const now = Date.now();
      setStartTime(now);
      setState("running");
      startTimer(now);
    }

    if (state === "finished") return;

    setTyped(value);

    if (value === targetText) {
      stopTimer();
      setState("finished");
      const timeSeconds = startTime ? (Date.now() - startTime) / 1000 : 1;
      const words = targetText.trim().split(/\s+/).length;
      const wpm = Math.round((words / timeSeconds) * 60);

      let errors = 0;
      for (let i = 0; i < Math.max(value.length, targetText.length); i++) {
        if (value[i] !== targetText[i]) errors++;
      }
      const accuracy = Math.round(
        ((targetText.length - errors) / targetText.length) * 100
      );

      setResults({
        wpm,
        accuracy: Math.max(0, accuracy),
        timeSeconds: Math.round(timeSeconds),
        errors,
      });
    }
  };

  const restart = useCallback((newDifficulty?: Difficulty) => {
    stopTimer();
    const d = newDifficulty ?? difficulty;
    const texts = SAMPLE_TEXTS[d];
    setTextIndex(Math.floor(Math.random() * texts.length));
    setTyped("");
    setState("idle");
    setStartTime(null);
    setElapsed(0);
    setResults(null);
    if (newDifficulty) setDifficulty(newDifficulty);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty, stopTimer]);

  // Per-character rendering
  const renderText = () => {
    const chars = targetText.split("");
    return chars.map((char, i) => {
      let className = "text-muted"; // not yet typed
      if (i < typed.length) {
        className = typed[i] === char ? "text-green-600 font-medium" : "text-red-500 font-medium";
      }
      const isCurrent = i === typed.length;
      return (
        <span
          key={i}
          className={`${className} ${isCurrent ? "border-b-2 border-primary" : ""}`}
        >
          {char}
        </span>
      );
    });
  };

  const currentWpm = (() => {
    if (!startTime || typed.length === 0) return 0;
    const seconds = (Date.now() - startTime) / 1000;
    const words = typed.trim().split(/\s+/).filter(Boolean).length;
    return Math.round((words / seconds) * 60);
  })();

  const progress = Math.round((typed.length / targetText.length) * 100);

  return (
    <div className="space-y-4">
      {/* Difficulty selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <label className="block text-xs text-muted mb-2">Difficulty</label>
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => restart(d)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                difficulty === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted hover:border-primary/50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          {difficulty === "easy" && "Common words — perfect for warming up"}
          {difficulty === "medium" && "Full sentences — everyday typing practice"}
          {difficulty === "hard" && "Code & technical text — maximum challenge"}
        </p>
      </div>

      {/* Text display */}
      <div
        className="bg-card border border-border rounded-xl p-5 shadow-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-lg leading-relaxed tracking-wide font-mono select-none">
          {renderText()}
        </div>

        {state === "idle" && (
          <p className="text-xs text-muted mt-3 text-center">
            Start typing to begin the test
          </p>
        )}

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInputChange}
          disabled={state === "finished"}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          aria-label="Typing input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {/* Live stats (during test) */}
      {state === "running" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{currentWpm}</p>
              <p className="text-xs text-muted mt-0.5">WPM</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{elapsed}s</p>
              <p className="text-xs text-muted mt-0.5">Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{progress}%</p>
              <p className="text-xs text-muted mt-0.5">Progress</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results card */}
      {state === "finished" && results && (
        <div className="bg-card border-2 border-green-400 rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-base mb-4 text-green-700">Test Complete!</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{results.wpm}</p>
              <p className="text-xs text-muted mt-1">WPM</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{results.accuracy}%</p>
              <p className="text-xs text-muted mt-1">Accuracy</p>
            </div>
            <div className="text-center p-3 bg-accent rounded-lg">
              <p className="text-3xl font-bold text-foreground">{results.timeSeconds}s</p>
              <p className="text-xs text-muted mt-1">Time</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-500">{results.errors}</p>
              <p className="text-xs text-muted mt-1">Errors</p>
            </div>
          </div>

          {/* Performance label */}
          <div className="mb-4 text-sm text-center">
            {results.wpm >= 80 && results.accuracy >= 95 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                Excellent — Professional level
              </span>
            )}
            {results.wpm >= 60 && results.wpm < 80 && results.accuracy >= 90 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                Good — Above average
              </span>
            )}
            {results.wpm >= 40 && results.wpm < 60 && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold">
                Average — Keep practicing
              </span>
            )}
            {results.wpm < 40 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                Beginner — Practice makes perfect
              </span>
            )}
          </div>

          <button
            onClick={() => restart()}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try Again (new text)
          </button>
        </div>
      )}

      {/* Restart button (idle / running) */}
      {state !== "finished" && (
        <button
          onClick={() => restart()}
          className="w-full py-2 bg-card border border-border rounded-lg text-sm text-muted hover:border-primary/50 transition-all"
        >
          {state === "idle" ? "Shuffle text" : "Restart"}
        </button>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Typing Speed Test tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Measure typing speed (WPM) and accuracy with sample texts. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Typing Speed Test tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Measure typing speed (WPM) and accuracy with sample texts. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
