"use client";

import { useState } from "react";

// --- CEFR Word Database (representative sample) ---
// Format: word -> [cefr_level, frequency_rank_approx]
const WORD_DB: Record<string, [string, number]> = {
  // A1
  "a": ["A1", 1], "the": ["A1", 2], "and": ["A1", 3], "is": ["A1", 4], "in": ["A1", 5],
  "cat": ["A1", 100], "dog": ["A1", 101], "run": ["A1", 102], "big": ["A1", 103], "small": ["A1", 104],
  "house": ["A1", 105], "water": ["A1", 106], "food": ["A1", 107], "yes": ["A1", 108], "no": ["A1", 109],
  "one": ["A1", 110], "two": ["A1", 111], "three": ["A1", 112], "red": ["A1", 113], "blue": ["A1", 114],
  "go": ["A1", 115], "come": ["A1", 116], "see": ["A1", 117], "eat": ["A1", 118], "have": ["A1", 119],
  "am": ["A1", 120], "are": ["A1", 121], "be": ["A1", 122], "do": ["A1", 123], "get": ["A1", 124],
  "he": ["A1", 10], "she": ["A1", 11], "it": ["A1", 12], "we": ["A1", 13], "you": ["A1", 14],
  "i": ["A1", 1], "my": ["A1", 20], "your": ["A1", 21], "here": ["A1", 130], "there": ["A1", 131],
  "day": ["A1", 140], "time": ["A1", 50], "man": ["A1", 60], "good": ["A1", 65], "new": ["A1", 70],
  // A2
  "beautiful": ["A2", 500], "happy": ["A2", 520], "angry": ["A2", 530], "learn": ["A2", 540],
  "travel": ["A2", 550], "family": ["A2", 555], "friend": ["A2", 560], "school": ["A2", 565],
  "important": ["A2", 570], "problem": ["A2", 580], "question": ["A2", 590], "answer": ["A2", 600],
  "different": ["A2", 610], "another": ["A2", 620], "world": ["A2", 630], "country": ["A2", 640],
  "between": ["A2", 650], "follow": ["A2", 660], "change": ["A2", 670], "group": ["A2", 680],
  "place": ["A2", 690], "week": ["A2", 700], "company": ["A2", 710], "system": ["A2", 720],
  // B1
  "achieve": ["B1", 2000], "determine": ["B1", 2100], "opportunity": ["B1", 2200],
  "environment": ["B1", 2300], "efficient": ["B1", 2400], "consequence": ["B1", 2500],
  "negotiate": ["B1", 2600], "temporary": ["B1", 2700], "alternative": ["B1", 2800],
  "relevant": ["B1", 2900], "previous": ["B1", 3000], "require": ["B1", 3100],
  "specific": ["B1", 3200], "significant": ["B1", 3300], "similar": ["B1", 3400],
  "traditional": ["B1", 3500], "obvious": ["B1", 3600], "eventually": ["B1", 3700],
  "analysis": ["B1", 3800], "strategy": ["B1", 3900], "structure": ["B1", 4000],
  // B2
  "ambiguous": ["B2", 6000], "constitute": ["B2", 6200], "subsequent": ["B2", 6400],
  "nonetheless": ["B2", 6600], "intrinsic": ["B2", 6800], "pragmatic": ["B2", 7000],
  "convoluted": ["B2", 7200], "prevalent": ["B2", 7400], "coherent": ["B2", 7600],
  "synthesize": ["B2", 7800], "proliferate": ["B2", 8000], "paradigm": ["B2", 8200],
  "exacerbate": ["B2", 8400], "phenomenon": ["B2", 8600], "mechanism": ["B2", 5500],
  "perspective": ["B2", 5600], "demonstrate": ["B2", 5700], "fundamental": ["B2", 5800],
  // C1
  "epistemological": ["C1", 15000], "ubiquitous": ["C1", 14000], "idiosyncratic": ["C1", 13000],
  "obfuscate": ["C1", 12000], "juxtapose": ["C1", 11000], "ameliorate": ["C1", 10500],
  "ostensibly": ["C1", 10200], "perfunctory": ["C1", 10100], "equivocal": ["C1", 10000],
  "enervate": ["C1", 9800], "perspicacious": ["C1", 9600], "circumlocution": ["C1", 9400],
  "inveterate": ["C1", 9200], "recalcitrant": ["C1", 9000], "sanguine": ["C1", 8800],
  // C2
  "anfractuous": ["C2", 50000], "defenestration": ["C2", 48000], "sesquipedalian": ["C2", 46000],
  "loquacious": ["C2", 20000], "perspicuous": ["C2", 22000], "tendentious": ["C2", 24000],
  "pusillanimous": ["C2", 26000], "magniloquent": ["C2", 28000], "verisimilitude": ["C2", 30000],
  "phantasmagoric": ["C2", 32000], "mellifluous": ["C2", 19000], "pulchritudinous": ["C2", 45000],
};

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; desc: string; emoji: string }> = {
  A1: { color: "text-green-700", bg: "bg-green-50", border: "border-green-300", label: "A1 入門", desc: "超基礎語。英語学習開始直後でも知っている単語。", emoji: "🌱" },
  A2: { color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-300", label: "A2 初級", desc: "日常会話で使う基本語。中学レベルに相当。", emoji: "🌿" },
  B1: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", label: "B1 中級", desc: "一般的な話題で使える語。高校〜大学入試レベル。", emoji: "📘" },
  B2: { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300", label: "B2 中上級", desc: "幅広い話題に対応できる語。TOEIC 700点台レベル。", emoji: "📗" },
  C1: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300", label: "C1 上級", desc: "学術・専門的な文脈で使われる語。TOEFL・IELTS高得点レベル。", emoji: "🔥" },
  C2: { color: "text-red-700", bg: "bg-red-50", border: "border-red-300", label: "C2 最上級", desc: "ネイティブでも珍しい語。文学・専門書レベル。", emoji: "💎" },
  "?": { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-300", label: "不明", desc: "データベースに未収録の単語です。", emoji: "❓" },
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface Result {
  word: string;
  level: string;
  freq: number | null;
}

function judgeWord(word: string): Result {
  const lower = word.toLowerCase().trim();
  const entry = WORD_DB[lower];
  if (entry) {
    return { word, level: entry[0], freq: entry[1] };
  }
  // Heuristic: longer rare-looking words → C1/C2
  if (lower.length >= 15) return { word, level: "C2", freq: null };
  if (lower.length >= 12) return { word, level: "C1", freq: null };
  if (lower.length >= 10) return { word, level: "B2", freq: null };
  return { word, level: "?", freq: null };
}

export default function WordLevelJudge() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [history, setHistory] = useState<Result[]>([]);

  const judge = () => {
    const words = input
      .split(/[\s,、。，．]+/)
      .map((w) => w.replace(/[^a-zA-Z'-]/g, "").trim())
      .filter(Boolean);
    if (!words.length) return;
    const res = words.map(judgeWord);
    setResults(res);
    setHistory((prev) => {
      const combined = [...res, ...prev];
      const seen = new Set<string>();
      return combined.filter((r) => {
        const k = r.word.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }).slice(0, 50);
    });
    setInput("");
  };

  const samples = ["ubiquitous", "cat run house", "ameliorate phenomenon", "loquacious intrinsic"];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          英単語を入力（複数はスペース・カンマ区切り）
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="例: ubiquitous, ameliorate"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && judge()}
          />
          <button
            onClick={judge}
            disabled={!input.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            判定
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {samples.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Current Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => {
            const cfg = LEVEL_CONFIG[r.level];
            const levelIdx = LEVEL_ORDER.indexOf(r.level);
            return (
              <div key={i} className={`bg-white rounded-2xl shadow-sm border ${cfg.border} p-5`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{r.word}</span>
                    {r.freq && (
                      <span className="ml-3 text-xs text-gray-400">頻出度 #{r.freq.toLocaleString()}</span>
                    )}
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${cfg.color}`}>{cfg.desc}</p>
                {/* Level bar */}
                {levelIdx >= 0 && (
                  <div className="mt-3 flex gap-1">
                    {LEVEL_ORDER.map((lv, idx) => (
                      <div
                        key={lv}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          idx <= levelIdx ? cfg.bg.replace("50", "400") : "bg-gray-100"
                        }`}
                        style={{
                          backgroundColor: idx <= levelIdx ? undefined : undefined,
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="flex gap-1 mt-1">
                  {LEVEL_ORDER.map((lv) => (
                    <div key={lv} className="flex-1 text-center text-xs text-gray-400">{lv}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">判定履歴</h2>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              クリア
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((r, i) => {
              const cfg = LEVEL_CONFIG[r.level];
              return (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border ${cfg.bg} ${cfg.color} ${cfg.border} cursor-pointer hover:opacity-80`}
                  onClick={() => setInput(r.word)}
                >
                  {r.word}
                  <span className="ml-1 opacity-60">{r.level}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* CEFR Reference */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">CEFRレベル早見表</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LEVEL_ORDER.map((lv) => {
            const cfg = LEVEL_CONFIG[lv];
            return (
              <div key={lv} className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
                <div className={`text-sm font-bold ${cfg.color}`}>{cfg.emoji} {cfg.label}</div>
                <div className={`text-xs mt-1 ${cfg.color} opacity-80`}>{cfg.desc.slice(0, 40)}…</div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この英単語レベル判定ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">入力した英単語のCEFRレベル・頻出度を判定。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この英単語レベル判定ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "入力した英単語のCEFRレベル・頻出度を判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
