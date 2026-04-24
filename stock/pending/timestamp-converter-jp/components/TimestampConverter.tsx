"use client";

import { useState, useEffect, useCallback } from "react";

// 和暦マッピング
const WAREKI_ERAS = [
  { name: "令和", start: new Date("2019-05-01") },
  { name: "平成", start: new Date("1989-01-08") },
  { name: "昭和", start: new Date("1926-12-25") },
  { name: "大正", start: new Date("1912-07-30") },
  { name: "明治", start: new Date("1868-01-25") },
] as const;

function toWareki(date: Date): string {
  const jstDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  for (const era of WAREKI_ERAS) {
    if (jstDate >= era.start) {
      const year = jstDate.getFullYear() - era.start.getFullYear() + 1;
      const yearStr = year === 1 ? "元" : String(year);
      const month = String(jstDate.getMonth() + 1).padStart(2, "0");
      const day = String(jstDate.getDate()).padStart(2, "0");
      const hours = String(jstDate.getHours()).padStart(2, "0");
      const minutes = String(jstDate.getMinutes()).padStart(2, "0");
      const seconds = String(jstDate.getSeconds()).padStart(2, "0");
      return `${era.name}${yearStr}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    }
  }
  return "和暦対象外";
}

function formatJST(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date).replace(/\//g, "-");
}

function formatUTC(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date).replace(/\//g, "-") + " UTC";
}

function formatISO8601(date: Date): string {
  return date.toISOString().replace("T", "T").slice(0, 19) + "+00:00";
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let result: string;
  if (seconds < 60) result = `${seconds}秒`;
  else if (minutes < 60) result = `${minutes}分`;
  else if (hours < 24) result = `${hours}時間`;
  else if (days < 30) result = `${days}日`;
  else if (months < 12) result = `${months}ヶ月`;
  else result = `${years}年`;

  return isFuture ? `${result}後` : `${result}前`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors shrink-0"
      title="コピー"
    >
      {copied ? "コピー済" : "コピー"}
    </button>
  );
}

function FormatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <span className="text-xs text-gray-500 block">{label}</span>
        <span className="font-mono text-sm break-all">{value}</span>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export default function TimestampConverter() {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(
    Math.floor(Date.now() / 1000)
  );
  const [timestampInput, setTimestampInput] = useState<string>("");
  const [convertedDate, setConvertedDate] = useState<Date | null>(null);
  const [dateInput, setDateInput] = useState<string>("");
  const [timeInput, setTimeInput] = useState<string>("00:00:00");
  const [convertedTimestamp, setConvertedTimestamp] = useState<number | null>(null);
  const [useMilliseconds, setUseMilliseconds] = useState(false);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timestamp → Date
  const convertTimestampToDate = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setConvertedDate(null);
        return;
      }
      const num = Number(input);
      if (isNaN(num)) {
        setConvertedDate(null);
        return;
      }
      const isMs = useMilliseconds || input.replace("-", "").length > 10;
      const ms = isMs ? num : num * 1000;
      const date = new Date(ms);
      if (isNaN(date.getTime())) {
        setConvertedDate(null);
        return;
      }
      setConvertedDate(date);
    },
    [useMilliseconds]
  );

  useEffect(() => {
    convertTimestampToDate(timestampInput);
  }, [timestampInput, convertTimestampToDate]);

  // Date → Timestamp (JST入力として扱う)
  const convertDateToTimestamp = useCallback(
    (dateStr: string, timeStr: string) => {
      if (!dateStr) {
        setConvertedTimestamp(null);
        return;
      }
      // datetime-local はローカルタイムとして解釈されるが、JSTとして解釈する
      const dateTimeStr = `${dateStr}T${timeStr || "00:00:00"}+09:00`;
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        setConvertedTimestamp(null);
        return;
      }
      const ts = useMilliseconds
        ? date.getTime()
        : Math.floor(date.getTime() / 1000);
      setConvertedTimestamp(ts);
    },
    [useMilliseconds]
  );

  useEffect(() => {
    convertDateToTimestamp(dateInput, timeInput);
  }, [dateInput, timeInput, convertDateToTimestamp]);

  const setNow = () => {
    const ts = useMilliseconds ? Date.now() : Math.floor(Date.now() / 1000);
    setTimestampInput(String(ts));
  };

  const displayTimestamp = useMilliseconds
    ? currentTimestamp * 1000
    : currentTimestamp;

  const currentDate = new Date(currentTimestamp * 1000);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Live Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 mb-8 text-white text-center shadow-lg">
        <p className="text-sm uppercase tracking-wider mb-1 opacity-80">
          現在のUnixタイムスタンプ
        </p>
        <p className="font-mono text-4xl md:text-5xl font-bold tabular-nums">
          {displayTimestamp}
        </p>
        <p className="text-sm mt-2 opacity-70">
          {formatJST(currentDate)} JST
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            className={`relative w-10 h-5 rounded-full transition-colors ${useMilliseconds ? "bg-indigo-600" : "bg-gray-300"}`}
            onClick={() => setUseMilliseconds(!useMilliseconds)}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useMilliseconds ? "translate-x-5" : ""}`}
            />
          </div>
          <span className="text-sm text-gray-700">ミリ秒モード</span>
        </label>

        <button
          onClick={setNow}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          現在時刻を取得
        </button>
      </div>

      {/* Two-Panel Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Timestamp → Date */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4 text-gray-900">
            タイムスタンプ → 日時
          </h2>
          <input
            type="text"
            value={timestampInput}
            onChange={(e) => setTimestampInput(e.target.value)}
            placeholder={useMilliseconds ? "例: 1700000000000" : "例: 1700000000"}
            className="w-full font-mono text-lg px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          {convertedDate && (
            <div className="mt-4 space-y-0">
              <FormatRow
                label="日本時間 (JST / UTC+9)"
                value={formatJST(convertedDate)}
              />
              <FormatRow
                label="UTC"
                value={formatUTC(convertedDate)}
              />
              <FormatRow
                label="ISO 8601"
                value={formatISO8601(convertedDate)}
              />
              <FormatRow
                label="和暦"
                value={toWareki(convertedDate)}
              />
              <FormatRow
                label="相対時間"
                value={getRelativeTime(convertedDate)}
              />
              <FormatRow
                label={useMilliseconds ? "ミリ秒" : "秒"}
                value={
                  useMilliseconds
                    ? String(convertedDate.getTime())
                    : String(Math.floor(convertedDate.getTime() / 1000))
                }
              />
            </div>
          )}
          {timestampInput && !convertedDate && (
            <p className="mt-4 text-red-500 text-sm">
              無効なタイムスタンプです。数値を入力してください。
            </p>
          )}
        </div>

        {/* Date → Timestamp */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4 text-gray-900">
            日時 → タイムスタンプ
            <span className="ml-2 text-xs font-normal text-gray-400">JST入力</span>
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">日付</label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full font-mono text-base px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">時刻</label>
              <input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                step="1"
                className="w-full font-mono text-base px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
          {convertedTimestamp !== null && (
            <div className="mt-4 bg-indigo-50 rounded-lg p-4">
              <span className="text-xs text-indigo-600 block mb-1">
                Unixタイムスタンプ ({useMilliseconds ? "ミリ秒" : "秒"})
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-gray-900">
                  {convertedTimestamp}
                </span>
                <CopyButton text={String(convertedTimestamp)} />
              </div>
            </div>
          )}
          {dateInput && convertedTimestamp === null && (
            <p className="mt-4 text-red-500 text-sm">
              無効な日時です。
            </p>
          )}
        </div>
      </div>

      {/* AdSense Placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-10">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この日時変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Unixタイムスタンプと日本時間の相互変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この日時変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Unixタイムスタンプと日本時間の相互変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "日時変換",
  "description": "Unixタイムスタンプと日本時間の相互変換",
  "url": "https://tools.loresync.dev/timestamp-converter-jp",
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
