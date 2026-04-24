"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ── Data ────────────────────────────────────────────────────────────────────

type Row = "あ" | "か" | "さ" | "た" | "な" | "は" | "ま" | "や" | "ら" | "わ";

interface KanaEntry {
  hiragana: string;
  katakana: string;
  romaji: string;
  row: Row;
}

const KANA_DATA: KanaEntry[] = [
  // あ行
  { hiragana: "あ", katakana: "ア", romaji: "a",   row: "あ" },
  { hiragana: "い", katakana: "イ", romaji: "i",   row: "あ" },
  { hiragana: "う", katakana: "ウ", romaji: "u",   row: "あ" },
  { hiragana: "え", katakana: "エ", romaji: "e",   row: "あ" },
  { hiragana: "お", katakana: "オ", romaji: "o",   row: "あ" },
  // か行
  { hiragana: "か", katakana: "カ", romaji: "ka",  row: "か" },
  { hiragana: "き", katakana: "キ", romaji: "ki",  row: "か" },
  { hiragana: "く", katakana: "ク", romaji: "ku",  row: "か" },
  { hiragana: "け", katakana: "ケ", romaji: "ke",  row: "か" },
  { hiragana: "こ", katakana: "コ", romaji: "ko",  row: "か" },
  // さ行
  { hiragana: "さ", katakana: "サ", romaji: "sa",  row: "さ" },
  { hiragana: "し", katakana: "シ", romaji: "shi", row: "さ" },
  { hiragana: "す", katakana: "ス", romaji: "su",  row: "さ" },
  { hiragana: "せ", katakana: "セ", romaji: "se",  row: "さ" },
  { hiragana: "そ", katakana: "ソ", romaji: "so",  row: "さ" },
  // た行
  { hiragana: "た", katakana: "タ", romaji: "ta",  row: "た" },
  { hiragana: "ち", katakana: "チ", romaji: "chi", row: "た" },
  { hiragana: "つ", katakana: "ツ", romaji: "tsu", row: "た" },
  { hiragana: "て", katakana: "テ", romaji: "te",  row: "た" },
  { hiragana: "と", katakana: "ト", romaji: "to",  row: "た" },
  // な行
  { hiragana: "な", katakana: "ナ", romaji: "na",  row: "な" },
  { hiragana: "に", katakana: "ニ", romaji: "ni",  row: "な" },
  { hiragana: "ぬ", katakana: "ヌ", romaji: "nu",  row: "な" },
  { hiragana: "ね", katakana: "ネ", romaji: "ne",  row: "な" },
  { hiragana: "の", katakana: "ノ", romaji: "no",  row: "な" },
  // は行
  { hiragana: "は", katakana: "ハ", romaji: "ha",  row: "は" },
  { hiragana: "ひ", katakana: "ヒ", romaji: "hi",  row: "は" },
  { hiragana: "ふ", katakana: "フ", romaji: "fu",  row: "は" },
  { hiragana: "へ", katakana: "ヘ", romaji: "he",  row: "は" },
  { hiragana: "ほ", katakana: "ホ", romaji: "ho",  row: "は" },
  // ま行
  { hiragana: "ま", katakana: "マ", romaji: "ma",  row: "ま" },
  { hiragana: "み", katakana: "ミ", romaji: "mi",  row: "ま" },
  { hiragana: "む", katakana: "ム", romaji: "mu",  row: "ま" },
  { hiragana: "め", katakana: "メ", romaji: "me",  row: "ま" },
  { hiragana: "も", katakana: "モ", romaji: "mo",  row: "ま" },
  // や行
  { hiragana: "や", katakana: "ヤ", romaji: "ya",  row: "や" },
  { hiragana: "ゆ", katakana: "ユ", romaji: "yu",  row: "や" },
  { hiragana: "よ", katakana: "ヨ", romaji: "yo",  row: "や" },
  // ら行
  { hiragana: "ら", katakana: "ラ", romaji: "ra",  row: "ら" },
  { hiragana: "り", katakana: "リ", romaji: "ri",  row: "ら" },
  { hiragana: "る", katakana: "ル", romaji: "ru",  row: "ら" },
  { hiragana: "れ", katakana: "レ", romaji: "re",  row: "ら" },
  { hiragana: "ろ", katakana: "ロ", romaji: "ro",  row: "ら" },
  // わ行
  { hiragana: "わ", katakana: "ワ", romaji: "wa",  row: "わ" },
  { hiragana: "を", katakana: "ヲ", romaji: "wo",  row: "わ" },
  { hiragana: "ん", katakana: "ン", romaji: "n",   row: "わ" },
];

const ALL_ROWS: Row[] = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];
const ROW_LABELS: Record<Row, string> = {
  あ: "あ行", か: "か行", さ: "さ行", た: "た行", な: "な行",
  は: "は行", ま: "ま行", や: "や行", ら: "ら行", わ: "わ行",
};

type Mode = "hiragana" | "katakana" | "both";
type FeedbackState = "idle" | "correct" | "incorrect";

const STORAGE_KEY = "kana-quiz-wrong";
const ACCEPTED: Record<string, string[]> = {
  shi: ["si"], chi: ["ti"], tsu: ["tu"], fu: ["hu"], wo: ["o"],
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function isCorrect(input: string, romaji: string): boolean {
  const n = normalize(input);
  if (n === romaji) return true;
  const alts = ACCEPTED[romaji];
  return alts ? alts.includes(n) : false;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadWrongSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveWrongSet(s: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]));
  } catch {
    // ignore
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function KanaQuiz() {
  const [mode, setMode] = useState<Mode>("hiragana");
  const [selectedRows, setSelectedRows] = useState<Set<Row>>(new Set(ALL_ROWS));
  const [weakOnly, setWeakOnly] = useState(false);
  const [wrongSet, setWrongSet] = useState<Set<string>>(new Set());

  // Session state
  const [deck, setDeck] = useState<KanaEntry[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load wrong set from localStorage on mount
  useEffect(() => {
    setWrongSet(loadWrongSet());
  }, []);

  const buildDeck = useCallback(
    (ws: Set<string>) => {
      let pool = KANA_DATA.filter((e) => selectedRows.has(e.row));
      if (weakOnly) {
        pool = pool.filter((e) => ws.has(e.hiragana));
        if (pool.length === 0) return null; // signal: no weak cards
      }
      return shuffle(pool);
    },
    [selectedRows, weakOnly]
  );

  const startSession = useCallback(() => {
    const ws = loadWrongSet();
    setWrongSet(ws);
    const d = buildDeck(ws);
    if (!d || d.length === 0) return;
    setDeck(d);
    setDeckIndex(0);
    setAnswer("");
    setFeedback("idle");
    setCorrect(0);
    setAsked(0);
    setSessionDone(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [buildDeck]);

  // Auto-start when settings change while not in a session
  const isInSession = deck.length > 0 && !sessionDone;

  const currentCard = deck[deckIndex] ?? null;

  const displayKana = (entry: KanaEntry) => {
    if (mode === "hiragana") return entry.hiragana;
    if (mode === "katakana") return entry.katakana;
    // both: randomly pick, but consistently per card (use index parity)
    return deckIndex % 2 === 0 ? entry.hiragana : entry.katakana;
  };

  const handleSubmit = useCallback(() => {
    if (!currentCard || feedback !== "idle") return;
    const ok = isCorrect(answer, currentCard.romaji);
    setFeedback(ok ? "correct" : "incorrect");
    setAsked((a) => a + 1);
    if (ok) {
      setCorrect((c) => c + 1);
      // Remove from wrong set
      setWrongSet((prev) => {
        const next = new Set(prev);
        next.delete(currentCard.hiragana);
        saveWrongSet(next);
        return next;
      });
    } else {
      // Add to wrong set
      setWrongSet((prev) => {
        const next = new Set(prev);
        next.add(currentCard.hiragana);
        saveWrongSet(next);
        return next;
      });
    }
  }, [currentCard, feedback, answer]);

  const handleNext = useCallback(() => {
    const nextIndex = deckIndex + 1;
    if (nextIndex >= deck.length) {
      setSessionDone(true);
    } else {
      setDeckIndex(nextIndex);
      setAnswer("");
      setFeedback("idle");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [deckIndex, deck.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (feedback === "idle") {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const toggleRow = (row: Row) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(row)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(row);
      } else {
        next.add(row);
      }
      return next;
    });
  };

  const clearWrongSet = () => {
    const empty = new Set<string>();
    setWrongSet(empty);
    saveWrongSet(empty);
  };

  const accuracy = asked > 0 ? Math.round((correct / asked) * 100) : 0;
  const progress = deck.length > 0 ? Math.round((deckIndex / deck.length) * 100) : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Settings panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
        {/* Mode selector */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">出題モード</p>
          <div className="grid grid-cols-3 gap-2">
            {(["hiragana", "katakana", "both"] as Mode[]).map((m) => {
              const label = m === "hiragana" ? "ひらがな" : m === "katakana" ? "カタカナ" : "両方";
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    mode === m
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">行を選択</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROWS.map((row) => (
              <button
                key={row}
                onClick={() => toggleRow(row)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedRows.has(row)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {ROW_LABELS[row]}
              </button>
            ))}
          </div>
        </div>

        {/* Weak-only toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">苦手集中モード</p>
            <p className="text-xs text-gray-500 mt-0.5">
              間違えた文字のみ出題（{wrongSet.size}文字記録中）
            </p>
          </div>
          <div className="flex items-center gap-3">
            {wrongSet.size > 0 && (
              <button
                onClick={clearWrongSet}
                className="text-xs text-gray-400 hover:text-red-500 underline underline-offset-2"
              >
                リセット
              </button>
            )}
            <button
              onClick={() => setWeakOnly((v) => !v)}
              disabled={wrongSet.size === 0}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                weakOnly && wrongSet.size > 0
                  ? "bg-blue-500"
                  : "bg-gray-200"
              } disabled:opacity-40`}
              aria-label="苦手集中モードの切り替え"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  weakOnly && wrongSet.size > 0 ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startSession}
          className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-base shadow-md hover:shadow-lg"
        >
          {isInSession || sessionDone ? "もう一度スタート" : "クイズをスタート"}
        </button>
      </div>

      {/* Score tracker (shown when session started) */}
      {(isInSession || sessionDone) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{correct}</p>
              <p className="text-xs text-gray-500 mt-0.5">正答数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{asked}</p>
              <p className="text-xs text-gray-500 mt-0.5">出題数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
              <p className="text-xs text-gray-500 mt-0.5">正答率</p>
            </div>
          </div>
          {isInSession && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{deckIndex + 1} / {deck.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Session done screen */}
      {sessionDone && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-3">
          <p className="text-3xl">
            {accuracy >= 90 ? "🎉" : accuracy >= 60 ? "👍" : "💪"}
          </p>
          <p className="text-xl font-bold text-gray-800">セッション完了！</p>
          <p className="text-gray-600 text-sm">
            {deck.length}問中 {correct}問正解（正答率 {accuracy}%）
          </p>
          {wrongSet.size > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              苦手リストに {wrongSet.size} 文字が記録されています。苦手集中モードで練習しましょう。
            </p>
          )}
        </div>
      )}

      {/* Flashcard */}
      {isInSession && currentCard && (
        <div className="space-y-4">
          {/* Card */}
          <div
            className={`bg-white rounded-2xl border-2 p-8 text-center transition-colors ${
              feedback === "correct"
                ? "border-green-400 bg-green-50"
                : feedback === "incorrect"
                ? "border-red-400 bg-red-50"
                : "border-gray-200"
            }`}
          >
            <p className="text-8xl font-bold leading-none mb-2 select-none">
              {displayKana(currentCard)}
            </p>
            {mode === "both" && (
              <p className="text-xs text-gray-400 mt-2">
                {deckIndex % 2 === 0 ? "ひらがな" : "カタカナ"}
              </p>
            )}
          </div>

          {/* Answer input */}
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={feedback !== "idle"}
              placeholder="ローマ字で入力（例: ka）"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className={`w-full px-4 py-3 text-center text-lg border-2 rounded-xl focus:outline-none transition-colors ${
                feedback === "correct"
                  ? "border-green-400 bg-green-50 text-green-800"
                  : feedback === "incorrect"
                  ? "border-red-400 bg-red-50 text-red-800"
                  : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
            />

            {/* Feedback message */}
            {feedback === "correct" && (
              <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                正解！ <span className="font-mono">{currentCard.romaji}</span>
              </div>
            )}
            {feedback === "incorrect" && (
              <div className="flex items-center justify-center gap-2 text-red-700 font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                不正解。正解は <span className="font-mono">{currentCard.romaji}</span>
              </div>
            )}

            {/* Action button */}
            {feedback === "idle" ? (
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 px-6 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 active:bg-gray-900 transition-colors shadow-md hover:shadow-lg"
              >
                {deckIndex + 1 < deck.length ? "次へ →" : "結果を見る"}
              </button>
            )}
            <p className="text-xs text-gray-400 text-center">Enter キーでも操作できます</p>
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      {!isInSession && (
        <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400 bg-gray-50">
          広告スペース
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このひらがな・カタカナ クイズツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">五十音のひらがな・カタカナを練習するフラッシュカード。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このひらがな・カタカナ クイズツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "五十音のひらがな・カタカナを練習するフラッシュカード。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ひらがな・カタカナ クイズ",
  "description": "五十音のひらがな・カタカナを練習するフラッシュカード",
  "url": "https://tools.loresync.dev/kana-quiz",
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
