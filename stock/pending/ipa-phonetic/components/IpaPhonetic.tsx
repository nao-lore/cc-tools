"use client";

import { useState } from "react";

// IPA dictionary for common English words (American English)
const IPA_DICT: Record<string, { us: string; uk: string; pos: string }> = {
  "about": { us: "əˈbaʊt", uk: "əˈbaʊt", pos: "prep/adv" },
  "above": { us: "əˈbʌv", uk: "əˈbʌv", pos: "prep" },
  "action": { us: "ˈækʃən", uk: "ˈækʃən", pos: "noun" },
  "after": { us: "ˈæftər", uk: "ˈɑːftə", pos: "prep" },
  "again": { us: "əˈɡɛn", uk: "əˈɡɛn", pos: "adv" },
  "age": { us: "eɪdʒ", uk: "eɪdʒ", pos: "noun" },
  "air": { us: "ɛr", uk: "eə", pos: "noun" },
  "all": { us: "ɔːl", uk: "ɔːl", pos: "det" },
  "also": { us: "ˈɔːlsoʊ", uk: "ˈɔːlsəʊ", pos: "adv" },
  "and": { us: "ænd", uk: "ænd", pos: "conj" },
  "animal": { us: "ˈænɪməl", uk: "ˈænɪməl", pos: "noun" },
  "answer": { us: "ˈænsər", uk: "ˈɑːnsə", pos: "noun/verb" },
  "apple": { us: "ˈæpəl", uk: "ˈæpəl", pos: "noun" },
  "are": { us: "ɑːr", uk: "ɑː", pos: "verb" },
  "area": { us: "ˈɛriə", uk: "ˈeəriə", pos: "noun" },
  "back": { us: "bæk", uk: "bæk", pos: "noun/adv" },
  "ball": { us: "bɔːl", uk: "bɔːl", pos: "noun" },
  "bank": { us: "bæŋk", uk: "bæŋk", pos: "noun" },
  "beautiful": { us: "ˈbjuːtɪfəl", uk: "ˈbjuːtɪfʊl", pos: "adj" },
  "because": { us: "bɪˈkɔːz", uk: "bɪˈkɒz", pos: "conj" },
  "bird": { us: "bɜːrd", uk: "bɜːd", pos: "noun" },
  "book": { us: "bʊk", uk: "bʊk", pos: "noun" },
  "bring": { us: "brɪŋ", uk: "brɪŋ", pos: "verb" },
  "butter": { us: "ˈbʌtər", uk: "ˈbʌtə", pos: "noun" },
  "car": { us: "kɑːr", uk: "kɑː", pos: "noun" },
  "care": { us: "kɛr", uk: "keə", pos: "noun/verb" },
  "cat": { us: "kæt", uk: "kæt", pos: "noun" },
  "change": { us: "tʃeɪndʒ", uk: "tʃeɪndʒ", pos: "noun/verb" },
  "child": { us: "tʃaɪld", uk: "tʃaɪld", pos: "noun" },
  "color": { us: "ˈkʌlər", uk: "ˈkʌlə", pos: "noun" },
  "come": { us: "kʌm", uk: "kʌm", pos: "verb" },
  "computer": { us: "kəmˈpjuːtər", uk: "kəmˈpjuːtə", pos: "noun" },
  "could": { us: "kʊd", uk: "kʊd", pos: "modal" },
  "country": { us: "ˈkʌntri", uk: "ˈkʌntri", pos: "noun" },
  "day": { us: "deɪ", uk: "deɪ", pos: "noun" },
  "door": { us: "dɔːr", uk: "dɔː", pos: "noun" },
  "dream": { us: "driːm", uk: "driːm", pos: "noun/verb" },
  "earth": { us: "ɜːrθ", uk: "ɜːθ", pos: "noun" },
  "eat": { us: "iːt", uk: "iːt", pos: "verb" },
  "every": { us: "ˈɛvri", uk: "ˈɛvri", pos: "det" },
  "example": { us: "ɪɡˈzæmpəl", uk: "ɪɡˈzɑːmpəl", pos: "noun" },
  "eye": { us: "aɪ", uk: "aɪ", pos: "noun" },
  "face": { us: "feɪs", uk: "feɪs", pos: "noun" },
  "family": { us: "ˈfæmɪli", uk: "ˈfæmɪli", pos: "noun" },
  "feel": { us: "fiːl", uk: "fiːl", pos: "verb" },
  "fire": { us: "faɪər", uk: "faɪə", pos: "noun" },
  "first": { us: "fɜːrst", uk: "fɜːst", pos: "adj/adv" },
  "food": { us: "fuːd", uk: "fuːd", pos: "noun" },
  "from": { us: "frʌm", uk: "frɒm", pos: "prep" },
  "give": { us: "ɡɪv", uk: "ɡɪv", pos: "verb" },
  "go": { us: "ɡoʊ", uk: "ɡəʊ", pos: "verb" },
  "good": { us: "ɡʊd", uk: "ɡʊd", pos: "adj" },
  "great": { us: "ɡreɪt", uk: "ɡreɪt", pos: "adj" },
  "hand": { us: "hænd", uk: "hænd", pos: "noun" },
  "have": { us: "hæv", uk: "hæv", pos: "verb" },
  "head": { us: "hɛd", uk: "hɛd", pos: "noun" },
  "heart": { us: "hɑːrt", uk: "hɑːt", pos: "noun" },
  "here": { us: "hɪr", uk: "hɪə", pos: "adv" },
  "high": { us: "haɪ", uk: "haɪ", pos: "adj" },
  "home": { us: "hoʊm", uk: "həʊm", pos: "noun" },
  "house": { us: "haʊs", uk: "haʊs", pos: "noun" },
  "how": { us: "haʊ", uk: "haʊ", pos: "adv" },
  "human": { us: "ˈhjuːmən", uk: "ˈhjuːmən", pos: "noun/adj" },
  "important": { us: "ɪmˈpɔːrtənt", uk: "ɪmˈpɔːtənt", pos: "adj" },
  "into": { us: "ˈɪntuː", uk: "ˈɪntʊ", pos: "prep" },
  "just": { us: "dʒʌst", uk: "dʒʌst", pos: "adv" },
  "know": { us: "noʊ", uk: "nəʊ", pos: "verb" },
  "large": { us: "lɑːrdʒ", uk: "lɑːdʒ", pos: "adj" },
  "last": { us: "læst", uk: "lɑːst", pos: "adj" },
  "laugh": { us: "læf", uk: "lɑːf", pos: "verb" },
  "learn": { us: "lɜːrn", uk: "lɜːn", pos: "verb" },
  "leave": { us: "liːv", uk: "liːv", pos: "verb" },
  "life": { us: "laɪf", uk: "laɪf", pos: "noun" },
  "light": { us: "laɪt", uk: "laɪt", pos: "noun/adj" },
  "like": { us: "laɪk", uk: "laɪk", pos: "verb/prep" },
  "line": { us: "laɪn", uk: "laɪn", pos: "noun" },
  "little": { us: "ˈlɪtəl", uk: "ˈlɪtəl", pos: "adj" },
  "live": { us: "lɪv", uk: "lɪv", pos: "verb" },
  "long": { us: "lɔːŋ", uk: "lɒŋ", pos: "adj" },
  "look": { us: "lʊk", uk: "lʊk", pos: "verb" },
  "love": { us: "lʌv", uk: "lʌv", pos: "noun/verb" },
  "make": { us: "meɪk", uk: "meɪk", pos: "verb" },
  "man": { us: "mæn", uk: "mæn", pos: "noun" },
  "many": { us: "ˈmɛni", uk: "ˈmɛni", pos: "det" },
  "may": { us: "meɪ", uk: "meɪ", pos: "modal" },
  "mean": { us: "miːn", uk: "miːn", pos: "verb" },
  "meet": { us: "miːt", uk: "miːt", pos: "verb" },
  "money": { us: "ˈmʌni", uk: "ˈmʌni", pos: "noun" },
  "moon": { us: "muːn", uk: "muːn", pos: "noun" },
  "more": { us: "mɔːr", uk: "mɔː", pos: "det/adv" },
  "mother": { us: "ˈmʌðər", uk: "ˈmʌðə", pos: "noun" },
  "music": { us: "ˈmjuːzɪk", uk: "ˈmjuːzɪk", pos: "noun" },
  "name": { us: "neɪm", uk: "neɪm", pos: "noun" },
  "nature": { us: "ˈneɪtʃər", uk: "ˈneɪtʃə", pos: "noun" },
  "new": { us: "njuː", uk: "njuː", pos: "adj" },
  "night": { us: "naɪt", uk: "naɪt", pos: "noun" },
  "not": { us: "nɒt", uk: "nɒt", pos: "adv" },
  "nothing": { us: "ˈnʌθɪŋ", uk: "ˈnʌθɪŋ", pos: "pron" },
  "now": { us: "naʊ", uk: "naʊ", pos: "adv" },
  "ocean": { us: "ˈoʊʃən", uk: "ˈəʊʃən", pos: "noun" },
  "off": { us: "ɔːf", uk: "ɒf", pos: "adv/prep" },
  "old": { us: "oʊld", uk: "əʊld", pos: "adj" },
  "open": { us: "ˈoʊpən", uk: "ˈəʊpən", pos: "adj/verb" },
  "other": { us: "ˈʌðər", uk: "ˈʌðə", pos: "det" },
  "our": { us: "aʊər", uk: "aʊə", pos: "det" },
  "out": { us: "aʊt", uk: "aʊt", pos: "adv" },
  "over": { us: "ˈoʊvər", uk: "ˈəʊvə", pos: "prep" },
  "own": { us: "oʊn", uk: "əʊn", pos: "adj/verb" },
  "people": { us: "ˈpiːpəl", uk: "ˈpiːpəl", pos: "noun" },
  "phone": { us: "foʊn", uk: "fəʊn", pos: "noun" },
  "place": { us: "pleɪs", uk: "pleɪs", pos: "noun" },
  "point": { us: "pɔɪnt", uk: "pɔɪnt", pos: "noun" },
  "power": { us: "ˈpaʊər", uk: "ˈpaʊə", pos: "noun" },
  "problem": { us: "ˈprɒbləm", uk: "ˈprɒbləm", pos: "noun" },
  "put": { us: "pʊt", uk: "pʊt", pos: "verb" },
  "question": { us: "ˈkwɛstʃən", uk: "ˈkwɛstʃən", pos: "noun" },
  "read": { us: "riːd", uk: "riːd", pos: "verb" },
  "real": { us: "riːl", uk: "rɪəl", pos: "adj" },
  "really": { us: "ˈriːli", uk: "ˈrɪəli", pos: "adv" },
  "right": { us: "raɪt", uk: "raɪt", pos: "adj/adv" },
  "run": { us: "rʌn", uk: "rʌn", pos: "verb" },
  "same": { us: "seɪm", uk: "seɪm", pos: "adj" },
  "say": { us: "seɪ", uk: "seɪ", pos: "verb" },
  "school": { us: "skuːl", uk: "skuːl", pos: "noun" },
  "see": { us: "siː", uk: "siː", pos: "verb" },
  "seem": { us: "siːm", uk: "siːm", pos: "verb" },
  "should": { us: "ʃʊd", uk: "ʃʊd", pos: "modal" },
  "show": { us: "ʃoʊ", uk: "ʃəʊ", pos: "verb" },
  "simple": { us: "ˈsɪmpəl", uk: "ˈsɪmpəl", pos: "adj" },
  "small": { us: "smɔːl", uk: "smɔːl", pos: "adj" },
  "some": { us: "sʌm", uk: "sʌm", pos: "det" },
  "something": { us: "ˈsʌmθɪŋ", uk: "ˈsʌmθɪŋ", pos: "pron" },
  "sometimes": { us: "ˈsʌmtaɪmz", uk: "ˈsʌmtaɪmz", pos: "adv" },
  "sound": { us: "saʊnd", uk: "saʊnd", pos: "noun" },
  "speak": { us: "spiːk", uk: "spiːk", pos: "verb" },
  "star": { us: "stɑːr", uk: "stɑː", pos: "noun" },
  "start": { us: "stɑːrt", uk: "stɑːt", pos: "verb" },
  "still": { us: "stɪl", uk: "stɪl", pos: "adv" },
  "stop": { us: "stɒp", uk: "stɒp", pos: "verb" },
  "story": { us: "ˈstɔːri", uk: "ˈstɔːri", pos: "noun" },
  "sun": { us: "sʌn", uk: "sʌn", pos: "noun" },
  "take": { us: "teɪk", uk: "teɪk", pos: "verb" },
  "talk": { us: "tɔːk", uk: "tɔːk", pos: "verb" },
  "tell": { us: "tɛl", uk: "tɛl", pos: "verb" },
  "than": { us: "ðæn", uk: "ðæn", pos: "conj" },
  "that": { us: "ðæt", uk: "ðæt", pos: "det/pron" },
  "the": { us: "ðə", uk: "ðə", pos: "det" },
  "their": { us: "ðɛr", uk: "ðeə", pos: "det" },
  "there": { us: "ðɛr", uk: "ðeə", pos: "adv" },
  "they": { us: "ðeɪ", uk: "ðeɪ", pos: "pron" },
  "think": { us: "θɪŋk", uk: "θɪŋk", pos: "verb" },
  "this": { us: "ðɪs", uk: "ðɪs", pos: "det/pron" },
  "thought": { us: "θɔːt", uk: "θɔːt", pos: "noun/verb" },
  "through": { us: "θruː", uk: "θruː", pos: "prep" },
  "time": { us: "taɪm", uk: "taɪm", pos: "noun" },
  "today": { us: "təˈdeɪ", uk: "təˈdeɪ", pos: "adv" },
  "together": { us: "təˈɡɛðər", uk: "təˈɡɛðə", pos: "adv" },
  "too": { us: "tuː", uk: "tuː", pos: "adv" },
  "top": { us: "tɒp", uk: "tɒp", pos: "noun" },
  "travel": { us: "ˈtrævəl", uk: "ˈtrævəl", pos: "verb" },
  "true": { us: "truː", uk: "truː", pos: "adj" },
  "try": { us: "traɪ", uk: "traɪ", pos: "verb" },
  "turn": { us: "tɜːrn", uk: "tɜːn", pos: "verb" },
  "under": { us: "ˈʌndər", uk: "ˈʌndə", pos: "prep" },
  "until": { us: "ənˈtɪl", uk: "ənˈtɪl", pos: "prep" },
  "use": { us: "juːz", uk: "juːz", pos: "verb" },
  "very": { us: "ˈvɛri", uk: "ˈvɛri", pos: "adv" },
  "voice": { us: "vɔɪs", uk: "vɔɪs", pos: "noun" },
  "want": { us: "wɒnt", uk: "wɒnt", pos: "verb" },
  "water": { us: "ˈwɔːtər", uk: "ˈwɔːtə", pos: "noun" },
  "way": { us: "weɪ", uk: "weɪ", pos: "noun" },
  "we": { us: "wiː", uk: "wiː", pos: "pron" },
  "well": { us: "wɛl", uk: "wɛl", pos: "adv" },
  "what": { us: "wʌt", uk: "wɒt", pos: "pron" },
  "when": { us: "wɛn", uk: "wɛn", pos: "adv" },
  "where": { us: "wɛr", uk: "weə", pos: "adv" },
  "which": { us: "wɪtʃ", uk: "wɪtʃ", pos: "pron" },
  "while": { us: "waɪl", uk: "waɪl", pos: "conj" },
  "who": { us: "huː", uk: "huː", pos: "pron" },
  "why": { us: "waɪ", uk: "waɪ", pos: "adv" },
  "will": { us: "wɪl", uk: "wɪl", pos: "modal" },
  "wind": { us: "wɪnd", uk: "wɪnd", pos: "noun" },
  "with": { us: "wɪð", uk: "wɪð", pos: "prep" },
  "woman": { us: "ˈwʊmən", uk: "ˈwʊmən", pos: "noun" },
  "word": { us: "wɜːrd", uk: "wɜːd", pos: "noun" },
  "work": { us: "wɜːrk", uk: "wɜːk", pos: "noun/verb" },
  "world": { us: "wɜːrld", uk: "wɜːld", pos: "noun" },
  "would": { us: "wʊd", uk: "wʊd", pos: "modal" },
  "write": { us: "raɪt", uk: "raɪt", pos: "verb" },
  "year": { us: "jɪr", uk: "jɪə", pos: "noun" },
  "you": { us: "juː", uk: "juː", pos: "pron" },
  "young": { us: "jʌŋ", uk: "jʌŋ", pos: "adj" },
  "your": { us: "jɔːr", uk: "jɔː", pos: "det" },
};

interface WordResult {
  word: string;
  entry: { us: string; uk: string; pos: string } | null;
}

function parseWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[-']+|[-']+$/g, ""))
    .filter(Boolean);
}

const SAMPLE_SENTENCES = [
  "The beautiful woman thought about the world",
  "Life is short and time is precious",
  "I love music and travel to new places",
];

export default function IpaPhonetic() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<WordResult[]>([]);
  const [dialect, setDialect] = useState<"us" | "uk">("us");
  const [copied, setCopied] = useState(false);

  const convert = () => {
    const words = parseWords(input);
    const res: WordResult[] = words.map((w) => ({
      word: w,
      entry: IPA_DICT[w] ?? null,
    }));
    setResults(res);
  };

  const ipaOutput = results
    .map((r) => (r.entry ? `/${r.entry[dialect]}/` : `[${r.word}]`))
    .join(" ");

  const handleCopy = () => {
    navigator.clipboard.writeText(ipaOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const knownCount = results.filter((r) => r.entry).length;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Enter English text</label>
          <div className="flex gap-2">
            <button
              onClick={() => setDialect("us")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                dialect === "us" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              US
            </button>
            <button
              onClick={() => setDialect("uk")}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                dialect === "uk" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              UK
            </button>
          </div>
        </div>
        <textarea
          className="w-full h-28 p-3 border border-gray-200 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Type English words or a sentence..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {SAMPLE_SENTENCES.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
            >
              {s.slice(0, 30)}…
            </button>
          ))}
        </div>
        <button
          onClick={convert}
          disabled={!input.trim()}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Convert to IPA
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Combined output */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                IPA Output ({dialect === "us" ? "American" : "British"} English)
              </h2>
              <span className="text-xs text-gray-400">{knownCount}/{results.length} words found</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl font-mono text-lg text-gray-800 min-h-12 leading-relaxed">
              {ipaOutput}
            </div>
            <button
              onClick={handleCopy}
              className="mt-2 text-xs px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Word-by-word */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Word-by-word breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border ${
                    r.entry ? "border-blue-100 bg-blue-50" : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{r.word}</span>
                    {r.entry && (
                      <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {r.entry.pos}
                      </span>
                    )}
                  </div>
                  {r.entry ? (
                    <div className="mt-1 space-y-0.5">
                      <div className="font-mono text-blue-700 text-sm">
                        🇺🇸 /{r.entry.us}/
                      </div>
                      <div className="font-mono text-red-700 text-sm">
                        🇬🇧 /{r.entry.uk}/
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-1">Not in dictionary</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* IPA chart reference */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Common IPA Symbols</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {[
                { sym: "ə", name: "schwa", ex: "ab**o**ut" },
                { sym: "ɪ", name: "short i", ex: "b**i**t" },
                { sym: "iː", name: "long ee", ex: "s**ee**" },
                { sym: "ʊ", name: "short oo", ex: "b**oo**k" },
                { sym: "uː", name: "long oo", ex: "f**oo**d" },
                { sym: "æ", name: "flat a", ex: "c**a**t" },
                { sym: "ɑː", name: "long a", ex: "c**a**r" },
                { sym: "ɔː", name: "aw", ex: "t**al**k" },
                { sym: "ɜː", name: "er", ex: "b**ir**d" },
                { sym: "eɪ", name: "ay diphthong", ex: "f**a**ce" },
                { sym: "aɪ", name: "eye diphthong", ex: "l**i**fe" },
                { sym: "aʊ", name: "ow diphthong", ex: "h**ou**se" },
                { sym: "ðə/ðiː", name: "the", ex: "**th**e" },
                { sym: "θ", name: "th (voiceless)", ex: "**th**ink" },
                { sym: "ŋ", name: "ng", ex: "si**ng**" },
              ].map(({ sym, name, ex }) => (
                <div key={sym} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="font-mono text-lg text-blue-700 w-12 text-center">{sym}</span>
                  <div>
                    <div className="text-xs font-medium text-gray-700">{name}</div>
                    <div className="text-xs text-gray-400">{ex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this IPA Phonetic Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert English text to IPA phonetic notation. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this IPA Phonetic Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert English text to IPA phonetic notation. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
