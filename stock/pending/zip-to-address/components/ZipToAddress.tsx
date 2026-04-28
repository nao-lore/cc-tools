"use client";

import { useState } from "react";

type Lang = "ja" | "en";

const T = {
  ja: {
    title: "郵便番号→住所変換ツール",
    subtitle: "7桁の郵便番号から都道府県を判定します。市区町村・町域の詳細は日本郵便サイトでご確認ください。",
    singleMode: "1件検索",
    batchMode: "一括検索",
    zipLabel: "郵便番号（7桁）",
    zipPlaceholder: "例: 100-0001",
    zipError: "7桁で入力してください",
    zipNotFound: "該当する都道府県が見つかりませんでした",
    zipNum: "郵便番号",
    prefecture: "都道府県",
    details: "詳細",
    detailsLink: "日本郵便で確認",
    detailsNote: "市区町村・町域の詳細は",
    detailsNote2: "日本郵便の公式サイト",
    detailsNote3: "でご確認ください。",
    batchLabel: "郵便番号を複数入力（改行・カンマ・スペース区切り）",
    batchResults: "結果",
    batchCount: "件",
    formatError: "フォーマット不正",
    unknown: "不明",
    copy: "コピー",
    copied: "コピー済",
    tableToggleOpen: "都道府県別 郵便番号帯一覧",
    tableToggleClose: "▲ 閉じる",
    tableToggleShow: "▼ 開く",
    tablePref: "都道府県",
    tableRange: "郵便番号帯（上3桁）",
    tableNote: "※ 上3桁による都道府県判定は概算です。同一番号帯に複数県が含まれる場合があります。正確な住所は",
    tableNoteLink: "日本郵便公式",
    tableNoteEnd: "でご確認ください。",
    adPlaceholder: "広告スペース",
    guideTitle: "郵便番号 住所変換ツールの使い方",
    guide: [
      { step: "1", title: "モードを選ぶ", body: "1件だけ調べたい場合は「1件検索」、複数の郵便番号をまとめて変換したい場合は「一括検索」を選んでください。" },
      { step: "2", title: "郵便番号を入力する", body: "7桁の数字を入力してください。ハイフンあり（100-0001）・なし（1000001）どちらの形式にも対応しています。" },
      { step: "3", title: "都道府県を確認する", body: "入力に合わせてリアルタイムで都道府県が表示されます。" },
      { step: "4", title: "結果をコピーする", body: "「コピー」ボタンで郵便番号と都道府県をまとめてクリップボードにコピーできます。" },
    ],
    faqTitle: "郵便番号・住所変換に関するよくある質問",
    faq: [
      { q: "郵便番号から市区町村まで調べられますか？", a: "このツールは上3桁から都道府県を判定します。市区町村・町域の詳細は日本郵便の公式サイトへのリンクで確認できます。" },
      { q: "複数の郵便番号を一度に変換できますか？", a: "「一括検索」モードで改行・カンマ・スペース区切りで複数の郵便番号を貼り付けると、まとめて都道府県に変換できます。" },
      { q: "郵便番号の都道府県判定は正確ですか？", a: "上3桁による範囲判定のため概算です。正確な住所は日本郵便の公式データベースでご確認ください。" },
      { q: "ハイフンなしの郵便番号でも使えますか？", a: "はい。1000001（ハイフンなし）でも100-0001（ハイフンあり）でも自動的に解釈します。" },
    ],
    relatedTools: "関連ツール",
    related: [
      { href: "/tools/bank-code-lookup", label: "銀行コード検索ツール", desc: "銀行・支店コードを素早く調べる" },
      { href: "/tools/houjin-bangou-validator", label: "法人番号 検証ツール", desc: "13桁の法人番号を検証・フォーマット" },
    ],
    ctaTitle: "住所・コード変換ツールをまとめて活用",
    ctaDesc: "郵便番号・銀行コード・法人番号など、業務データの変換・検証ツールを無料で提供しています。",
    ctaBtn: "全ツール一覧を見る",
  },
  en: {
    title: "ZIP Code → Address Converter",
    subtitle: "Determine the prefecture from a 7-digit Japanese postal code. For city/town details, check Japan Post.",
    singleMode: "Single",
    batchMode: "Batch",
    zipLabel: "Postal Code (7 digits)",
    zipPlaceholder: "e.g. 100-0001",
    zipError: "Please enter 7 digits",
    zipNotFound: "No matching prefecture found",
    zipNum: "Postal Code",
    prefecture: "Prefecture",
    details: "Details",
    detailsLink: "Check on Japan Post",
    detailsNote: "For city/town details, see ",
    detailsNote2: "Japan Post official site",
    detailsNote3: ".",
    batchLabel: "Enter multiple postal codes (newline, comma, or space separated)",
    batchResults: "Results",
    batchCount: "",
    formatError: "Invalid format",
    unknown: "Unknown",
    copy: "Copy",
    copied: "Copied",
    tableToggleOpen: "Prefecture ZIP Code Range Table",
    tableToggleClose: "▲ Close",
    tableToggleShow: "▼ Open",
    tablePref: "Prefecture",
    tableRange: "ZIP Range (first 3 digits)",
    tableNote: "Note: Prefecture lookup by first 3 digits is approximate. For exact addresses, see ",
    tableNoteLink: "Japan Post",
    tableNoteEnd: ".",
    adPlaceholder: "Advertisement",
    guideTitle: "How to Use the ZIP to Address Tool",
    guide: [
      { step: "1", title: "Select a mode", body: "Use 'Single' for one lookup or 'Batch' to convert multiple postal codes at once." },
      { step: "2", title: "Enter a postal code", body: "Type 7 digits. Both hyphenated (100-0001) and non-hyphenated (1000001) formats are accepted." },
      { step: "3", title: "Check the prefecture", body: "The prefecture is shown in real time as you type." },
      { step: "4", title: "Copy the result", body: "Use the Copy button to copy the postal code and prefecture to your clipboard." },
    ],
    faqTitle: "FAQ about ZIP Code Lookup",
    faq: [
      { q: "Can I look up the city/town from a postal code?", a: "This tool determines the prefecture from the first 3 digits. For city/town details, follow the Japan Post link." },
      { q: "Can I convert multiple postal codes at once?", a: "Yes. Use Batch mode and paste multiple codes separated by newlines, commas, or spaces." },
      { q: "Is the prefecture lookup accurate?", a: "It is approximate based on the first 3 digits. For exact addresses, use Japan Post's official database." },
      { q: "Does it work without hyphens?", a: "Yes. Both 1000001 (no hyphen) and 100-0001 (with hyphen) are accepted and auto-formatted." },
    ],
    relatedTools: "Related Tools",
    related: [
      { href: "/tools/bank-code-lookup", label: "Bank Code Lookup", desc: "Quickly find bank and branch codes" },
      { href: "/tools/houjin-bangou-validator", label: "Corporate Number Validator", desc: "Validate and format 13-digit corporate numbers" },
    ],
    ctaTitle: "Address & Code Conversion Tools",
    ctaDesc: "Free tools for converting and validating postal codes, bank codes, corporate numbers, and more.",
    ctaBtn: "View All Tools",
  },
} as const;

// Prefecture lookup data (unchanged)
const PREFECTURE_RANGES: Array<{ start: number; end: number; pref: string }> = [
  { start: 10, end: 19, pref: "秋田県" },
  { start: 20, end: 29, pref: "岩手県" },
  { start: 30, end: 39, pref: "青森県" },
  { start: 100, end: 209, pref: "東京都" },
  { start: 210, end: 259, pref: "神奈川県" },
  { start: 260, end: 299, pref: "千葉県" },
  { start: 300, end: 319, pref: "茨城県" },
  { start: 320, end: 329, pref: "栃木県" },
  { start: 330, end: 369, pref: "埼玉県" },
  { start: 370, end: 379, pref: "群馬県" },
  { start: 380, end: 399, pref: "長野県" },
  { start: 400, end: 409, pref: "山梨県" },
  { start: 410, end: 439, pref: "静岡県" },
  { start: 440, end: 499, pref: "愛知県" },
  { start: 500, end: 509, pref: "岐阜県" },
  { start: 510, end: 519, pref: "三重県" },
  { start: 520, end: 529, pref: "滋賀県" },
  { start: 530, end: 599, pref: "大阪府" },
  { start: 600, end: 629, pref: "京都府" },
  { start: 630, end: 639, pref: "奈良県" },
  { start: 640, end: 649, pref: "和歌山県" },
  { start: 650, end: 679, pref: "兵庫県" },
  { start: 680, end: 689, pref: "鳥取県" },
  { start: 690, end: 699, pref: "島根県" },
  { start: 700, end: 719, pref: "岡山県" },
  { start: 720, end: 739, pref: "広島県" },
  { start: 740, end: 759, pref: "山口県" },
  { start: 760, end: 769, pref: "香川県" },
  { start: 770, end: 779, pref: "徳島県" },
  { start: 780, end: 789, pref: "高知県" },
  { start: 790, end: 799, pref: "愛媛県" },
  { start: 800, end: 839, pref: "福岡県" },
  { start: 840, end: 849, pref: "佐賀県" },
  { start: 850, end: 859, pref: "長崎県" },
  { start: 860, end: 869, pref: "熊本県" },
  { start: 870, end: 879, pref: "大分県" },
  { start: 880, end: 889, pref: "宮崎県" },
  { start: 890, end: 899, pref: "鹿児島県" },
  { start: 900, end: 909, pref: "沖縄県" },
  { start: 910, end: 919, pref: "福井県" },
  { start: 920, end: 929, pref: "石川県" },
  { start: 930, end: 939, pref: "富山県" },
  { start: 940, end: 959, pref: "新潟県" },
  { start: 960, end: 979, pref: "福島県" },
  { start: 980, end: 989, pref: "宮城県" },
  { start: 990, end: 999, pref: "山形県" },
];

const PREFECTURE_TABLE = [
  { pref: "北海道", range: "001-006, 060-099" },
  { pref: "青森県", range: "030-039" },
  { pref: "岩手県", range: "020-028" },
  { pref: "宮城県", range: "980-989" },
  { pref: "秋田県", range: "010-019" },
  { pref: "山形県", range: "990-999" },
  { pref: "福島県", range: "960-979" },
  { pref: "茨城県", range: "300-319" },
  { pref: "栃木県", range: "320-329" },
  { pref: "群馬県", range: "370-379" },
  { pref: "埼玉県", range: "330-369" },
  { pref: "千葉県", range: "260-299" },
  { pref: "東京都", range: "100-209" },
  { pref: "神奈川県", range: "210-259" },
  { pref: "新潟県", range: "940-959" },
  { pref: "富山県", range: "930-939" },
  { pref: "石川県", range: "920-929" },
  { pref: "福井県", range: "910-919" },
  { pref: "山梨県", range: "400-409" },
  { pref: "長野県", range: "380-399" },
  { pref: "岐阜県", range: "500-509" },
  { pref: "静岡県", range: "410-439" },
  { pref: "愛知県", range: "440-499" },
  { pref: "三重県", range: "510-519" },
  { pref: "滋賀県", range: "520-529" },
  { pref: "京都府", range: "600-629" },
  { pref: "大阪府", range: "530-599" },
  { pref: "兵庫県", range: "650-679" },
  { pref: "奈良県", range: "630-639" },
  { pref: "和歌山県", range: "640-649" },
  { pref: "鳥取県", range: "680-689" },
  { pref: "島根県", range: "690-699" },
  { pref: "岡山県", range: "700-719" },
  { pref: "広島県", range: "720-739" },
  { pref: "山口県", range: "740-759" },
  { pref: "徳島県", range: "770-779" },
  { pref: "香川県", range: "760-769" },
  { pref: "愛媛県", range: "790-799" },
  { pref: "高知県", range: "780-789" },
  { pref: "福岡県", range: "800-839" },
  { pref: "佐賀県", range: "840-849" },
  { pref: "長崎県", range: "850-859" },
  { pref: "熊本県", range: "860-869" },
  { pref: "大分県", range: "870-879" },
  { pref: "宮崎県", range: "880-889" },
  { pref: "鹿児島県", range: "890-899" },
  { pref: "沖縄県", range: "900-909" },
];

function lookupPrefecture(zip: string): string | null {
  const digits = zip.replace(/-/g, "");
  if (digits.length !== 7) return null;
  const prefix3 = parseInt(digits.slice(0, 3), 10);
  if ((prefix3 >= 1 && prefix3 <= 6) || (prefix3 >= 60 && prefix3 <= 99)) return "北海道";
  for (const range of PREFECTURE_RANGES) {
    if (prefix3 >= range.start && prefix3 <= range.end) return range.pref;
  }
  return null;
}

function formatZip(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 7);
  if (digits.length <= 3) return digits;
  return digits.slice(0, 3) + "-" + digits.slice(3);
}

interface LookupResult {
  zip: string;
  prefecture: string | null;
  error?: string;
}

function CopyButton({ text, t }: { text: string; t: typeof T["ja"] }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium"
    >
      {copied ? t.copied : t.copy}
    </button>
  );
}

export default function ZipToAddress() {
  const [singleZip, setSingleZip] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [showTable, setShowTable] = useState(false);
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

  const singleResult: LookupResult | null = (() => {
    const zip = singleZip.replace(/\D/g, "");
    if (zip.length === 0) return null;
    if (zip.length !== 7) return { zip: singleZip, prefecture: null, error: t.zipError };
    const formatted = zip.slice(0, 3) + "-" + zip.slice(3);
    const pref = lookupPrefecture(zip);
    return { zip: formatted, prefecture: pref, error: pref ? undefined : t.zipNotFound };
  })();

  const batchResults: LookupResult[] = batchInput
    .split(/[\n,、，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((raw) => {
      const zip = raw.replace(/\D/g, "");
      if (zip.length !== 7) return { zip: raw, prefecture: null, error: t.formatError };
      const formatted = zip.slice(0, 3) + "-" + zip.slice(3);
      const pref = lookupPrefecture(zip);
      return { zip: formatted, prefecture: pref, error: pref ? undefined : t.unknown };
    });

  const batchCopyText = batchResults.map((r) => `${r.zip}\t${r.prefecture ?? r.error ?? t.unknown}`).join("\n");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes border-spin { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text { text-shadow: 0 0 30px rgba(196,181,253,0.6); }
        .result-card-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .gradient-border-box { position: relative; }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .table-row-stripe:hover { background: rgba(139,92,246,0.08); transition: background 0.2s ease; }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Mode selector + inputs */}
      <div className="glass-card rounded-2xl p-4 space-y-4">
        <div className="flex gap-2">
          {(["single", "batch"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
                mode === m
                  ? "bg-violet-600 text-white"
                  : "glass-card text-violet-200 hover:text-white"
              }`}
            >
              {m === "single" ? t.singleMode : t.batchMode}
            </button>
          ))}
        </div>

        {mode === "single" ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-violet-100 block mb-1 uppercase tracking-wider">{t.zipLabel}</label>
              <input
                type="text"
                value={singleZip}
                onChange={(e) => setSingleZip(formatZip(e.target.value))}
                placeholder={t.zipPlaceholder}
                maxLength={8}
                className="w-full sm:w-64 px-3 py-2 number-input rounded-xl text-sm focus:outline-none neon-focus font-mono"
              />
            </div>
            {singleResult && (
              <div className={`rounded-xl p-4 ${
                singleResult.error
                  ? "glass-card border-red-500/20"
                  : "gradient-border-box glass-card-bright result-card-glow"
              }`}>
                {singleResult.error ? (
                  <p className="text-red-400 text-sm">{singleResult.error}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <span className="text-violet-200 text-xs block mb-1">{t.zipNum}</span>
                        <span className="font-mono font-semibold text-white">〒{singleResult.zip}</span>
                      </div>
                      <div>
                        <span className="text-violet-200 text-xs block mb-1">{t.prefecture}</span>
                        <span className="text-3xl font-bold text-white glow-text">{singleResult.prefecture}</span>
                      </div>
                      <CopyButton text={`〒${singleResult.zip} ${singleResult.prefecture}`} t={t} />
                    </div>
                    <div className="pt-2 border-t border-white/8">
                      <p className="text-xs text-violet-200">
                        {t.detailsNote}
                        <a
                          href={`https://www.post.japanpost.jp/cgi-zip/zipcode.php?zip=${singleResult.zip.replace("-", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-300 underline mx-1"
                        >
                          {t.detailsNote2}
                        </a>
                        {t.detailsNote3}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-violet-100 block mb-1 uppercase tracking-wider">{t.batchLabel}</label>
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={5}
                placeholder={"100-0001\n530-0001\n810-0001\n..."}
                className="w-full px-3 py-2 number-input rounded-xl text-sm focus:outline-none neon-focus font-mono resize-y"
              />
            </div>
            {batchResults.length > 0 && (
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
                  <span className="text-sm font-medium text-violet-100">
                    {t.batchResults} {batchResults.length}{t.batchCount}
                  </span>
                  <CopyButton text={batchCopyText} t={t} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left px-4 py-2 text-xs font-medium text-violet-200 uppercase tracking-wider">{t.zipNum}</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-violet-200 uppercase tracking-wider">{t.prefecture}</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-violet-200 uppercase tracking-wider">{t.details}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((r, i) => (
                        <tr key={i} className="border-b border-white/5 table-row-stripe">
                          <td className="px-4 py-2 font-mono text-white/90">〒{r.zip}</td>
                          <td className="px-4 py-2">
                            {r.prefecture
                              ? <span className="font-semibold text-white">{r.prefecture}</span>
                              : <span className="text-red-400 text-xs">{r.error}</span>}
                          </td>
                          <td className="px-4 py-2">
                            {r.prefecture && (
                              <a
                                href={`https://www.post.japanpost.jp/cgi-zip/zipcode.php?zip=${r.zip.replace("-", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-300 text-xs underline"
                              >
                                {t.detailsLink}
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prefecture table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-violet-100 hover:bg-white/5 transition-colors"
        >
          <span>{t.tableToggleOpen}</span>
          <span className="text-violet-200">{showTable ? t.tableToggleClose : t.tableToggleShow}</span>
        </button>
        {showTable && (
          <div className="border-t border-white/8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-2 text-xs font-medium text-violet-200 uppercase tracking-wider">{t.tablePref}</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-violet-200 uppercase tracking-wider">{t.tableRange}</th>
                </tr>
              </thead>
              <tbody>
                {PREFECTURE_TABLE.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 table-row-stripe">
                    <td className="px-4 py-2 font-medium text-white/90">{row.pref}</td>
                    <td className="px-4 py-2 font-mono text-violet-200 text-xs">{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-white/8">
              <p className="text-xs text-violet-200">
                {t.tableNote}
                <a href="https://www.post.japanpost.jp/zipcode/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline mx-1">
                  {t.tableNoteLink}
                </a>
                {t.tableNoteEnd}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="glass-card rounded-xl flex items-center justify-center h-20 text-violet-200/30 text-sm select-none">
        {t.adPlaceholder}
      </div>

      {/* Guide */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white/90 text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <details key={i} className="group glass-card rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-white/90 hover:bg-white/5 list-none">
                <span>Q. {item.q}</span>
                <span className="text-violet-400 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-violet-100 border-t border-white/6">{item.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "郵便番号から市区町村まで調べられますか？", "acceptedAnswer": { "@type": "Answer", "text": "このツールは上3桁から都道府県を判定します。市区町村・町域の詳細は日本郵便公式サイトへのリンクで確認できます。" } },
              { "@type": "Question", "name": "複数の郵便番号を一度に変換できますか？", "acceptedAnswer": { "@type": "Answer", "text": "「一括検索」モードで改行・カンマ・スペース区切りで複数貼り付けると、まとめて都道府県に変換できます。" } },
              { "@type": "Question", "name": "ハイフンなしの郵便番号でも使えますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。1000001（ハイフンなし）でも100-0001（ハイフンあり）でも自動的に解釈します。" } },
            ],
          }),
        }}
      />

      {/* Related tools */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {t.related.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm">{link.label}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-5 text-white text-center space-y-3" style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.8), rgba(124,58,237,0.6))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <p className="text-base font-bold">{t.ctaTitle}</p>
        <p className="text-xs opacity-80">{t.ctaDesc}</p>
        <a href="/tools" className="inline-block bg-white text-violet-700 text-sm font-bold px-5 py-2 rounded-xl hover:bg-violet-50 transition-colors">
          {t.ctaBtn}
        </a>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "郵便番号 ↔ 住所変換",
  "description": "7桁郵便番号から住所（都道府県・市区町村・町域）、逆引きにも対応",
  "url": "https://tools.loresync.dev/zip-to-address",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
  "inLanguage": "ja"
}`
        }}
      />
    </div>
  );
}
