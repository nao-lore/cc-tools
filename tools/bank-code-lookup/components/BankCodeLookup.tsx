"use client";

import { useState, useMemo, useCallback } from "react";

type Branch = {
  name: string;
  code: string;
};

type Bank = {
  name: string;
  code: string;
  kana: string;
  branches: Branch[];
};

const BANKS: Bank[] = [
  {
    name: "みずほ銀行",
    code: "0001",
    kana: "みずほぎんこう",
    branches: [
      { name: "東京営業部", code: "001" },
      { name: "丸の内中央", code: "011" },
      { name: "新宿", code: "051" },
      { name: "渋谷", code: "071" },
      { name: "横浜", code: "211" },
      { name: "大阪", code: "301" },
      { name: "名古屋", code: "451" },
      { name: "福岡", code: "601" },
      { name: "札幌", code: "701" },
      { name: "仙台", code: "751" },
    ],
  },
  {
    name: "三菱UFJ銀行",
    code: "0005",
    kana: "みつびしゆーえふじぇいぎんこう",
    branches: [
      { name: "東京営業部", code: "001" },
      { name: "丸の内", code: "003" },
      { name: "新宿", code: "052" },
      { name: "渋谷", code: "075" },
      { name: "横浜", code: "212" },
      { name: "大阪営業部", code: "301" },
      { name: "名古屋営業部", code: "452" },
      { name: "福岡", code: "602" },
      { name: "札幌", code: "702" },
      { name: "広島", code: "502" },
    ],
  },
  {
    name: "三井住友銀行",
    code: "0009",
    kana: "みついすみともぎんこう",
    branches: [
      { name: "東京営業部", code: "001" },
      { name: "丸の内", code: "004" },
      { name: "新宿", code: "053" },
      { name: "渋谷", code: "073" },
      { name: "横浜", code: "213" },
      { name: "大阪営業部", code: "302" },
      { name: "名古屋", code: "453" },
      { name: "福岡", code: "603" },
      { name: "札幌", code: "703" },
      { name: "仙台", code: "753" },
    ],
  },
  {
    name: "りそな銀行",
    code: "0010",
    kana: "りそなぎんこう",
    branches: [
      { name: "東京営業部", code: "001" },
      { name: "新宿", code: "051" },
      { name: "渋谷", code: "071" },
      { name: "横浜", code: "211" },
      { name: "大阪営業部", code: "301" },
      { name: "梅田", code: "311" },
      { name: "難波", code: "321" },
      { name: "京都", code: "401" },
      { name: "神戸", code: "351" },
      { name: "名古屋", code: "451" },
    ],
  },
  {
    name: "埼玉りそな銀行",
    code: "0017",
    kana: "さいたまりそなぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "大宮", code: "011" },
      { name: "川越", code: "021" },
      { name: "浦和", code: "031" },
      { name: "所沢", code: "041" },
      { name: "越谷", code: "051" },
      { name: "川口", code: "061" },
      { name: "熊谷", code: "071" },
      { name: "春日部", code: "081" },
    ],
  },
  {
    name: "PayPay銀行",
    code: "0033",
    kana: "ぺいぺいぎんこう",
    branches: [
      { name: "本店", code: "001" },
      { name: "ビジネス", code: "002" },
    ],
  },
  {
    name: "セブン銀行",
    code: "0034",
    kana: "せぶんぎんこう",
    branches: [
      { name: "本店", code: "001" },
    ],
  },
  {
    name: "ソニー銀行",
    code: "0035",
    kana: "そにーぎんこう",
    branches: [
      { name: "本店", code: "001" },
    ],
  },
  {
    name: "楽天銀行",
    code: "0036",
    kana: "らくてんぎんこう",
    branches: [
      { name: "本店", code: "001" },
      { name: "第一営業部", code: "101" },
      { name: "第二営業部", code: "102" },
    ],
  },
  {
    name: "住信SBIネット銀行",
    code: "0038",
    kana: "すみしんえすびーあいねっとぎんこう",
    branches: [
      { name: "本店", code: "001" },
      { name: "法人営業部", code: "002" },
    ],
  },
  {
    name: "auじぶん銀行",
    code: "0039",
    kana: "あうじぶんぎんこう",
    branches: [
      { name: "本店", code: "001" },
    ],
  },
  {
    name: "ゆうちょ銀行",
    code: "9900",
    kana: "ゆうちょぎんこう",
    branches: [
      { name: "東京貯金事務センター", code: "100" },
      { name: "さいたま貯金事務センター", code: "110" },
      { name: "横浜貯金事務センター", code: "120" },
      { name: "名古屋貯金事務センター", code: "200" },
      { name: "大阪貯金事務センター", code: "300" },
      { name: "神戸貯金事務センター", code: "310" },
      { name: "広島貯金事務センター", code: "500" },
      { name: "福岡貯金事務センター", code: "600" },
      { name: "仙台貯金事務センター", code: "700" },
      { name: "札幌貯金事務センター", code: "800" },
    ],
  },
  {
    name: "北海道銀行",
    code: "0116",
    kana: "ほっかいどうぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "札幌中央", code: "011" },
      { name: "旭川", code: "021" },
      { name: "函館", code: "031" },
      { name: "帯広", code: "041" },
      { name: "釧路", code: "051" },
    ],
  },
  {
    name: "東北銀行",
    code: "0122",
    kana: "とうほくぎんこう",
    branches: [
      { name: "本店", code: "001" },
      { name: "盛岡北", code: "011" },
      { name: "水沢", code: "021" },
    ],
  },
  {
    name: "七十七銀行",
    code: "0124",
    kana: "しちじゅうしちぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "仙台", code: "011" },
      { name: "石巻", code: "021" },
      { name: "古川", code: "031" },
    ],
  },
  {
    name: "常陽銀行",
    code: "0130",
    kana: "じょうようぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "水戸", code: "011" },
      { name: "つくば", code: "021" },
      { name: "土浦", code: "031" },
    ],
  },
  {
    name: "横浜銀行",
    code: "0138",
    kana: "よこはまぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "横浜駅前", code: "011" },
      { name: "川崎", code: "021" },
      { name: "藤沢", code: "031" },
      { name: "相模原", code: "041" },
    ],
  },
  {
    name: "千葉銀行",
    code: "0134",
    kana: "ちばぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "千葉中央", code: "011" },
      { name: "船橋", code: "021" },
      { name: "柏", code: "031" },
      { name: "松戸", code: "041" },
    ],
  },
  {
    name: "静岡銀行",
    code: "0149",
    kana: "しずおかぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "静岡中央", code: "011" },
      { name: "浜松", code: "021" },
      { name: "沼津", code: "031" },
    ],
  },
  {
    name: "名古屋銀行",
    code: "0155",
    kana: "なごやぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "栄", code: "011" },
      { name: "金山", code: "021" },
      { name: "一宮", code: "031" },
    ],
  },
  {
    name: "京都銀行",
    code: "0158",
    kana: "きょうとぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "烏丸", code: "011" },
      { name: "四条大宮", code: "021" },
      { name: "大阪", code: "031" },
    ],
  },
  {
    name: "近畿大阪銀行",
    code: "0161",
    kana: "きんきおおさかぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "難波", code: "011" },
      { name: "天王寺", code: "021" },
    ],
  },
  {
    name: "関西みらい銀行",
    code: "0163",
    kana: "かんさいみらいぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "梅田", code: "011" },
      { name: "難波", code: "021" },
      { name: "神戸", code: "031" },
      { name: "京都", code: "041" },
    ],
  },
  {
    name: "広島銀行",
    code: "0169",
    kana: "ひろしまぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "紙屋町", code: "011" },
      { name: "福山", code: "021" },
      { name: "呉", code: "031" },
    ],
  },
  {
    name: "伊予銀行",
    code: "0173",
    kana: "いよぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "松山", code: "011" },
      { name: "今治", code: "021" },
      { name: "高松", code: "031" },
    ],
  },
  {
    name: "福岡銀行",
    code: "0177",
    kana: "ふくおかぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "天神", code: "011" },
      { name: "博多", code: "021" },
      { name: "北九州", code: "031" },
      { name: "熊本", code: "041" },
    ],
  },
  {
    name: "西日本シティ銀行",
    code: "0190",
    kana: "にしにほんしてぃぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "博多", code: "011" },
      { name: "天神", code: "021" },
      { name: "北九州", code: "031" },
    ],
  },
  {
    name: "鹿児島銀行",
    code: "0185",
    kana: "かごしまぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "鹿児島中央", code: "011" },
      { name: "宮崎", code: "021" },
    ],
  },
  {
    name: "琉球銀行",
    code: "0187",
    kana: "りゅうきゅうぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "那覇", code: "011" },
      { name: "浦添", code: "021" },
      { name: "沖縄", code: "031" },
    ],
  },
  {
    name: "沖縄銀行",
    code: "0188",
    kana: "おきなわぎんこう",
    branches: [
      { name: "本店営業部", code: "001" },
      { name: "那覇支店", code: "011" },
      { name: "コザ", code: "021" },
    ],
  },
];

type SearchMode = "bank" | "branch";

type ResultRow = {
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    )
    .replace(/\s/g, "");
}

export default function BankCodeLookup() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("bank");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const results = useMemo<ResultRow[]>(() => {
    const q = normalize(query);
    if (!q) return [];

    const rows: ResultRow[] = [];

    if (mode === "bank") {
      for (const bank of BANKS) {
        const matchesName = normalize(bank.name).includes(q);
        const matchesKana = normalize(bank.kana).includes(q);
        const matchesCode = bank.code.includes(q);
        if (matchesName || matchesKana || matchesCode) {
          for (const branch of bank.branches) {
            rows.push({
              bankName: bank.name,
              bankCode: bank.code,
              branchName: branch.name,
              branchCode: branch.code,
            });
          }
        }
      }
    } else {
      for (const bank of BANKS) {
        for (const branch of bank.branches) {
          const matchesBranchName = normalize(branch.name).includes(q);
          const matchesBranchCode = branch.code.includes(q);
          if (matchesBranchName || matchesBranchCode) {
            rows.push({
              bankName: bank.name,
              bankCode: bank.code,
              branchName: branch.name,
              branchCode: branch.code,
            });
          }
        }
      }
    }

    return rows;
  }, [query, mode]);

  const handleCopy = useCallback(
    async (text: string, key: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Search mode */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-sm font-medium text-muted mb-3">検索対象</p>
        <div className="flex gap-2">
          {(
            [
              { value: "bank", label: "銀行名・銀行コード" },
              { value: "branch", label: "支店名・支店コード" },
            ] as { value: SearchMode; label: string }[]
          ).map((m) => (
            <button
              key={m.value}
              onClick={() => {
                setMode(m.value);
                setQuery("");
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                mode === m.value
                  ? "bg-accent text-white"
                  : "bg-background border border-border text-foreground hover:border-accent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-sm font-medium text-muted mb-3">
          {mode === "bank"
            ? "銀行名・よみがな・銀行コードで検索"
            : "支店名・支店コードで検索"}
        </p>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === "bank"
              ? "例: みずほ、三菱、0001…"
              : "例: 新宿、東京、001…"
          }
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Results */}
      {query && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted">検索結果</p>
            <span className="text-xs text-muted">{results.length} 件</span>
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">
              該当する銀行・支店が見つかりませんでした
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted pb-2 pr-3">
                      銀行名
                    </th>
                    <th className="text-left text-xs font-medium text-muted pb-2 pr-3">
                      銀行コード
                    </th>
                    <th className="text-left text-xs font-medium text-muted pb-2 pr-3">
                      支店名
                    </th>
                    <th className="text-left text-xs font-medium text-muted pb-2">
                      支店コード
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => {
                    const bankKey = `bank-${i}`;
                    const branchKey = `branch-${i}`;
                    return (
                      <tr
                        key={i}
                        className="border-b border-border/50 last:border-0"
                      >
                        <td className="py-2.5 pr-3 text-foreground">
                          {row.bankName}
                        </td>
                        <td className="py-2.5 pr-3">
                          <button
                            onClick={() =>
                              handleCopy(row.bankCode, bankKey)
                            }
                            title="クリックでコピー"
                            className="font-mono font-semibold text-accent hover:underline"
                          >
                            {copiedKey === bankKey
                              ? "コピー済"
                              : row.bankCode}
                          </button>
                        </td>
                        <td className="py-2.5 pr-3 text-foreground">
                          {row.branchName}
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() =>
                              handleCopy(row.branchCode, branchKey)
                            }
                            title="クリックでコピー"
                            className="font-mono font-semibold text-accent hover:underline"
                          >
                            {copiedKey === branchKey
                              ? "コピー済"
                              : row.branchCode}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      {!query && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <p className="text-sm font-medium text-muted mb-2">対応銀行一覧</p>
          <div className="flex flex-wrap gap-1.5">
            {BANKS.map((b) => (
              <button
                key={b.code}
                onClick={() => {
                  setMode("bank");
                  setQuery(b.code);
                }}
                className="px-2.5 py-1 text-xs rounded-lg bg-background border border-border text-foreground hover:border-accent transition-colors"
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この銀行・支店コード検索ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">銀行名/支店名↔コードの相互検索。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この銀行・支店コード検索ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "銀行名/支店名↔コードの相互検索。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "銀行・支店コード検索",
  "description": "銀行名/支店名↔コードの相互検索",
  "url": "https://tools.loresync.dev/bank-code-lookup",
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
