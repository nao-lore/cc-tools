"use client";

import { useState, useCallback, useMemo } from "react";

// 旧字体 → 新字体 mapping (~100 common pairs)
const OLD_TO_NEW: Record<string, string> = {
  // 行政・社会
  國: "国", 學: "学", 會: "会", 體: "体", 點: "点",
  藝: "芸", 醫: "医", 圖: "図", 鐵: "鉄", 關: "関",
  戰: "戦", 廣: "広", 覺: "覚", 變: "変", 證: "証",
  // 人・生活
  獨: "独", 應: "応", 擔: "担", 讀: "読", 續: "続",
  發: "発", 傳: "伝", 號: "号", 當: "当", 黨: "党",
  舊: "旧", 來: "来", 兒: "児", 壤: "壌", 雜: "雑",
  // 自然・地理
  澤: "沢", 濱: "浜", 灣: "湾", 島: "島", 瀧: "滝",
  // 経済・商業
  價: "価", 經: "経", 營: "営", 齋: "斎", 劑: "剤",
  藏: "蔵", 歸: "帰", 禮: "礼", 齡: "齢", 龍: "竜",
  // 言語・文字
  語: "語", 譯: "訳", 聲: "声", 聽: "聴", 顯: "顕",
  處: "処", 數: "数", 實: "実", 質: "質", 靜: "静",
  // 政治・法律
  權: "権", 憲: "憲", 議: "議", 選: "選", 擇: "択",
  總: "総", 稅: "税", 廢: "廃", 廳: "庁", 縣: "県",
  // 技術・科学
  驗: "験", 險: "険", 劍: "剣", 劃: "画", 獻: "献",
  歡: "歓", 歸: "帰", 擴: "拡", 舉: "挙", 嚴: "厳",
  // 人名・姓
  澁: "渋", 濟: "済", 彌: "弥", 壽: "寿", 榮: "栄",
  惠: "恵", 鷹: "鷹", 顏: "顔", 齊: "斉", 齒: "歯",
  // 動詞・形容詞的
  屬: "属", 獲: "獲", 觸: "触", 壞: "壊", 殘: "残",
  濃: "濃", 澄: "澄", 潰: "潰", 勵: "励", 勞: "労",
  // 接続・助詞的
  爲: "為", 於: "於", 與: "与", 從: "従", 後: "後",
  // その他よく使う
  步: "歩", 拂: "払", 拾: "拾", 效: "効", 溫: "温",
  萬: "万", 壹: "壱", 貳: "弐", 參: "参", 拜: "拝",
  �澤: "沢", 惱: "悩", 腦: "脳", 臟: "臓", 膽: "胆",
  // 追加
  兩: "両", 冊: "冊", 侮: "侮", 僧: "僧", 免: "免",
  勉: "勉", 勤: "勤", 勺: "勺", 包: "包", 卑: "卑",
  喝: "喝", 嘆: "嘆", 器: "器", 塀: "塀", 墨: "墨",
  層: "層", 屮: "屮", 峰: "峰", 廉: "廉", 弔: "弔",
};

// 新字体 → 旧字体 (reverse)
const NEW_TO_OLD: Record<string, string> = {};
for (const [old, neo] of Object.entries(OLD_TO_NEW)) {
  // avoid overwriting with duplicate new chars that map to the same old char
  if (!NEW_TO_OLD[neo]) {
    NEW_TO_OLD[neo] = old;
  }
}

type Direction = "old-to-new" | "new-to-old";

interface ConvertedChar {
  original: string;
  converted: string;
  changed: boolean;
}

function convertText(text: string, direction: Direction): ConvertedChar[] {
  const map = direction === "old-to-new" ? OLD_TO_NEW : NEW_TO_OLD;
  return Array.from(text).map((ch) => {
    const converted = map[ch];
    if (converted) {
      return { original: ch, converted, changed: true };
    }
    return { original: ch, converted: ch, changed: false };
  });
}

export default function HanziJpDiff() {
  const [direction, setDirection] = useState<Direction>("old-to-new");
  const [input, setInput] = useState("學校で國語を學ぶ。醫者と關係する體驗。");
  const [copied, setCopied] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const results = useMemo<ConvertedChar[]>(() => {
    if (!input) return [];
    return convertText(input, direction);
  }, [input, direction]);

  const outputText = useMemo(
    () => results.map((r) => r.converted).join(""),
    [results]
  );

  const changedCount = useMemo(
    () => results.filter((r) => r.changed).length,
    [results]
  );

  const unchangedCount = useMemo(
    () => results.filter((r) => !r.changed && r.original.trim() !== "").length,
    [results]
  );

  const copyOutput = useCallback(async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText]);

  const handleDirectionSwitch = useCallback((next: Direction) => {
    setDirection(next);
    setInput("");
  }, []);

  const tableEntries = Object.entries(OLD_TO_NEW);

  return (
    <div className="space-y-6">
      {/* Direction toggle */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">変換方向</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleDirectionSwitch("old-to-new")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              direction === "old-to-new"
                ? "bg-accent text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            旧字体 → 新字体
          </button>
          <button
            onClick={() => handleDirectionSwitch("new-to-old")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              direction === "new-to-old"
                ? "bg-accent text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            新字体 → 旧字体
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">
          {direction === "old-to-new" ? "旧字体テキスト入力" : "新字体テキスト入力"}
        </h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            direction === "old-to-new"
              ? "旧字体（旧漢字）テキストを入力…"
              : "新字体テキストを入力…"
          }
          rows={5}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
          aria-label="変換対象テキスト入力"
        />
      </div>

      {/* Output with highlights */}
      {input.length > 0 && (
        <>
          <div className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted">変換結果</h3>
              <button
                onClick={copyOutput}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
              >
                {copied ? "コピー完了!" : "コピー"}
              </button>
            </div>
            <div className="text-base leading-relaxed break-all font-sans select-all">
              {results.map((r, i) =>
                r.changed ? (
                  <mark
                    key={i}
                    className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded px-0.5"
                    title={`${r.original} → ${r.converted}`}
                  >
                    {r.converted}
                  </mark>
                ) : (
                  <span key={i}>{r.converted}</span>
                )
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-medium text-muted mb-3">変換統計</h3>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-foreground">{changedCount}</p>
                <p className="text-xs text-muted mt-0.5">変換した文字数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unchangedCount}</p>
                <p className="text-xs text-muted mt-0.5">未変換の文字数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{input.length}</p>
                <p className="text-xs text-muted mt-0.5">総文字数</p>
              </div>
            </div>
            {unchangedCount > 0 && (
              <p className="mt-3 text-xs text-muted">
                ※ 未変換の文字は対応表に含まれていないか、変換不要な文字です。
              </p>
            )}
          </div>
        </>
      )}

      {/* Reference table toggle */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="w-full flex items-center justify-between text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          <span>対応表（旧字体 ↔ 新字体）</span>
          <span className="text-xs">{showTable ? "▲ 閉じる" : "▼ 開く"}</span>
        </button>

        {showTable && (
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {tableEntries.map(([oldCh, newCh]) => (
              <div
                key={oldCh}
                className="flex flex-col items-center gap-0.5 border border-border rounded-lg p-1.5"
              >
                <span className="text-base font-sans text-foreground leading-none">
                  {oldCh}
                </span>
                <span className="text-xs text-muted leading-none">↓</span>
                <span className="text-base font-sans text-accent leading-none">
                  {newCh}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この旧字体・新字体 変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">旧字体（旧漢字）と新字体を相互変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この旧字体・新字体 変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "旧字体（旧漢字）と新字体を相互変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "旧字体・新字体 変換",
  "description": "旧字体（旧漢字）と新字体を相互変換",
  "url": "https://tools.loresync.dev/hanzi-jp-diff",
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
