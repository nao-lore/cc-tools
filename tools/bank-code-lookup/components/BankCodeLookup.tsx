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
  const [query, setQuery] = useState("みずほ");
  const [mode, setMode] = useState<SearchMode>("bank");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const allRows = useMemo<ResultRow[]>(() => {
    return BANKS.flatMap((bank) =>
      bank.branches.map((branch) => ({
        bankName: bank.name,
        bankCode: bank.code,
        branchName: branch.name,
        branchCode: branch.code,
      }))
    );
  }, []);

  const results = useMemo<ResultRow[]>(() => {
    const q = normalize(query);
    if (!q) return allRows.slice(0, 20);

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

    return rows.slice(0, 80);
  }, [allRows, query, mode]);

  const handleCopy = useCallback(
    async (text: string, key: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    },
    []
  );

  const handleCopyRow = useCallback(
    async (row: ResultRow, key: string) => {
      await handleCopy(
        `${row.bankName} ${row.bankCode} / ${row.branchName} ${row.branchCode}`,
        key
      );
    },
    [handleCopy]
  );

  function clear() {
    setQuery("");
    setCopiedKey(null);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">検索条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                主要銀行の簡易データから、銀行コードと支店コードを検索します。
              </p>
            </div>
            <button
              type="button"
              onClick={clear}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">検索対象</p>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {(
                [
                  { value: "bank", label: "銀行" },
                  { value: "branch", label: "支店" },
                ] as { value: SearchMode; label: string }[]
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setMode(item.value);
                    setQuery("");
                    setCopiedKey(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    mode === item.value
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="bank-code-query" className="text-sm font-medium text-slate-700">
              {mode === "bank" ? "銀行名・よみがな・銀行コード" : "支店名・支店コード"}
            </label>
            <input
              id="bank-code-query"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCopiedKey(null);
              }}
              placeholder={mode === "bank" ? "例: みずほ、三菱、0001" : "例: 新宿、東京、001"}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-slate-900"
            />
            <p className="mt-2 text-sm text-slate-500">
              入力値はブラウザ上で処理され、外部に送信されません。
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["みずほ", "三菱", "0009", "新宿", "001"].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setQuery(sample)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            振込や口座登録に使う場合は、必ず金融機関の公式サイト・アプリ・通帳・キャッシュカードでも確認してください。支店統廃合でコードが変わる場合があります。
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-950">収録銀行</p>
            <div className="mt-2 flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              {BANKS.map((bank) => (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => {
                    setMode("bank");
                    setQuery(bank.code);
                  }}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-900"
                >
                  {bank.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">検索結果</h2>
              <p className="mt-1 text-sm text-slate-500">
                {query ? `${results.length}件表示` : "未入力時は先頭20件を表示"}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              銀行 {BANKS.length} / 支店 {allRows.length}
            </div>
          </div>

          {query && results.length === 0 ? (
            <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">該当データがありません</p>
                <p className="mt-1 text-sm text-slate-500">表記ゆれを変えるか、金融機関の公式情報を確認してください。</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <div className="hidden grid-cols-[1.4fr_90px_1fr_90px_80px] gap-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 md:grid">
                <div>銀行名</div>
                <div>銀行コード</div>
                <div>支店名</div>
                <div>支店コード</div>
                <div className="text-right">操作</div>
              </div>
              <div className="max-h-[560px] divide-y divide-slate-200 overflow-y-auto">
                {results.map((row, index) => {
                  const rowKey = `${row.bankCode}-${row.branchCode}-${index}`;
                  return (
                    <div
                      key={rowKey}
                      className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1.4fr_90px_1fr_90px_80px] md:items-center md:gap-0"
                    >
                      <div>
                        <div className="font-semibold text-slate-950">{row.bankName}</div>
                        <div className="mt-1 text-xs text-slate-500 md:hidden">銀行コード {row.bankCode}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(row.bankCode, `bank-${rowKey}`)}
                        className="hidden text-left font-mono font-semibold text-slate-950 hover:underline md:block"
                      >
                        {copiedKey === `bank-${rowKey}` ? "コピー済" : row.bankCode}
                      </button>
                      <div>
                        <div className="text-slate-800">{row.branchName}</div>
                        <div className="mt-1 text-xs text-slate-500 md:hidden">支店コード {row.branchCode}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(row.branchCode, `branch-${rowKey}`)}
                        className="hidden text-left font-mono font-semibold text-slate-950 hover:underline md:block"
                      >
                        {copiedKey === `branch-${rowKey}` ? "コピー済" : row.branchCode}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyRow(row, `row-${rowKey}`)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {copiedKey === `row-${rowKey}` ? "済" : "コピー"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
