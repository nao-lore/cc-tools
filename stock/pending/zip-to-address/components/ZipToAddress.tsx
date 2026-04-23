"use client";

import { useState } from "react";

// 3桁プレフィックス → 都道府県マッピング（範囲ベース）
// 北海道: 001-006, 060-099 は lookupPrefecture で個別処理
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

// 北海道 (001-006, 060-099) は別途処理
function lookupPrefecture(zip: string): string | null {
  const digits = zip.replace(/-/g, "");
  if (digits.length !== 7) return null;
  const prefix3 = parseInt(digits.slice(0, 3), 10);

  // 北海道: 001-006, 060-099
  if ((prefix3 >= 1 && prefix3 <= 6) || (prefix3 >= 60 && prefix3 <= 99)) {
    return "北海道";
  }

  for (const range of PREFECTURE_RANGES) {
    if (prefix3 >= range.start && prefix3 <= range.end) {
      return range.pref;
    }
  }
  return null;
}

// 都道府県一覧（郵便番号帯付き）
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

function formatZip(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 7);
  if (digits.length <= 3) return digits;
  return digits.slice(0, 3) + "-" + digits.slice(3);
}

function isValidZip(zip: string): boolean {
  return /^\d{3}-\d{4}$/.test(zip) || /^\d{7}$/.test(zip);
}

interface LookupResult {
  zip: string;
  prefecture: string | null;
  error?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
    >
      {copied ? "コピー済" : "コピー"}
    </button>
  );
}

export default function ZipToAddress() {
  const [singleZip, setSingleZip] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [showTable, setShowTable] = useState(false);

  // Single lookup result
  const singleResult: LookupResult | null = (() => {
    const zip = singleZip.replace(/\D/g, "");
    if (zip.length === 0) return null;
    if (zip.length !== 7) return { zip: singleZip, prefecture: null, error: "7桁で入力してください" };
    const formatted = zip.slice(0, 3) + "-" + zip.slice(3);
    const pref = lookupPrefecture(zip);
    return { zip: formatted, prefecture: pref, error: pref ? undefined : "該当する都道府県が見つかりませんでした" };
  })();

  // Batch lookup results
  const batchResults: LookupResult[] = batchInput
    .split(/[\n,、，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((raw) => {
      const zip = raw.replace(/\D/g, "");
      if (zip.length !== 7) return { zip: raw, prefecture: null, error: "フォーマット不正" };
      const formatted = zip.slice(0, 3) + "-" + zip.slice(3);
      const pref = lookupPrefecture(zip);
      return { zip: formatted, prefecture: pref, error: pref ? undefined : "不明" };
    });

  const batchCopyText = batchResults
    .map((r) => `${r.zip}\t${r.prefecture ?? r.error ?? "不明"}`)
    .join("\n");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">郵便番号→住所変換ツール</h1>
        <p className="text-muted text-sm">
          7桁の郵便番号から都道府県を判定します。市区町村・町域の詳細は日本郵便サイトでご確認ください。
        </p>
      </div>

      {/* Mode selector */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("single")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              mode === "single"
                ? "bg-accent text-white"
                : "border border-border text-gray-700 hover:bg-gray-50"
            }`}
          >
            1件検索
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              mode === "batch"
                ? "bg-accent text-white"
                : "border border-border text-gray-700 hover:bg-gray-50"
            }`}
          >
            一括検索
          </button>
        </div>

        {mode === "single" ? (
          <div className="space-y-3">
            <div>
              <label className="text-muted text-xs block mb-1">郵便番号（7桁）</label>
              <input
                type="text"
                value={singleZip}
                onChange={(e) => setSingleZip(formatZip(e.target.value))}
                placeholder="例: 100-0001"
                maxLength={8}
                className="w-full sm:w-64 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {singleResult && (
              <div
                className={`rounded-lg p-4 ${
                  singleResult.error
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                {singleResult.error ? (
                  <p className="text-red-700 text-sm">{singleResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-muted text-xs block">郵便番号</span>
                        <span className="font-mono font-semibold text-gray-900">〒{singleResult.zip}</span>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">都道府県</span>
                        <span className="text-2xl font-bold text-green-700">{singleResult.prefecture}</span>
                      </div>
                      <CopyButton text={`〒${singleResult.zip} ${singleResult.prefecture}`} />
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-xs text-gray-600">
                        市区町村・町域の詳細は
                        <a
                          href={`https://www.post.japanpost.jp/cgi-zip/zipcode.php?zip=${singleResult.zip.replace("-", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline mx-1"
                        >
                          日本郵便の公式サイト
                        </a>
                        でご確認ください。
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
              <label className="text-muted text-xs block mb-1">
                郵便番号を複数入力（改行・カンマ・スペース区切り）
              </label>
              <textarea
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={5}
                placeholder={"100-0001\n530-0001\n810-0001\n..."}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y"
              />
            </div>

            {batchResults.length > 0 && (
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-border">
                  <span className="text-sm font-medium text-gray-700">
                    結果 {batchResults.length}件
                  </span>
                  <CopyButton text={batchCopyText} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border">
                        <th className="text-left px-4 py-2 text-muted text-xs font-medium">郵便番号</th>
                        <th className="text-left px-4 py-2 text-muted text-xs font-medium">都道府県</th>
                        <th className="text-left px-4 py-2 text-muted text-xs font-medium">詳細</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchResults.map((r, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-2 font-mono text-gray-800">〒{r.zip}</td>
                          <td className="px-4 py-2">
                            {r.prefecture ? (
                              <span className="font-semibold text-gray-900">{r.prefecture}</span>
                            ) : (
                              <span className="text-red-500 text-xs">{r.error}</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {r.prefecture && (
                              <a
                                href={`https://www.post.japanpost.jp/cgi-zip/zipcode.php?zip=${r.zip.replace("-", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 text-xs underline"
                              >
                                日本郵便で確認
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

      {/* 都道府県一覧テーブル */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>都道府県別 郵便番号帯一覧</span>
          <span className="text-muted">{showTable ? "▲ 閉じる" : "▼ 開く"}</span>
        </button>

        {showTable && (
          <div className="border-t border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left px-4 py-2 text-muted text-xs font-medium">都道府県</th>
                  <th className="text-left px-4 py-2 text-muted text-xs font-medium">郵便番号帯（上3桁）</th>
                </tr>
              </thead>
              <tbody>
                {PREFECTURE_TABLE.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-medium text-gray-800">{row.pref}</td>
                    <td className="px-4 py-2 font-mono text-gray-600 text-xs">{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-gray-50 border-t border-border">
              <p className="text-xs text-muted">
                ※ 上3桁による都道府県判定は概算です。同一番号帯に複数県が含まれる場合があります。
                正確な住所は
                <a
                  href="https://www.post.japanpost.jp/zipcode/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mx-1"
                >
                  日本郵便公式
                </a>
                でご確認ください。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>

      {/* ── SEO: 使い方ガイド ── */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">郵便番号 住所変換ツールの使い方</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "モードを選ぶ", body: "1件だけ調べたい場合は「1件検索」、複数の郵便番号をまとめて変換したい場合は「一括検索」を選んでください。" },
            { step: "2", title: "郵便番号を入力する", body: "7桁の数字を入力してください。ハイフンあり（100-0001）・なし（1000001）どちらの形式にも対応しています。" },
            { step: "3", title: "都道府県を確認する", body: "入力に合わせてリアルタイムで都道府県が表示されます。市区町村・町域の詳細は日本郵便公式サイトへのリンクで確認できます。" },
            { step: "4", title: "結果をコピーする", body: "「コピー」ボタンで郵便番号と都道府県をまとめてクリップボードにコピーできます。一括検索はタブ区切りでスプレッドシートにも貼り付け可能です。" },
          ].map(({ step, title, body }) => (
            <li key={step} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">{step}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── SEO: FAQ ── */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">郵便番号・住所変換に関するよくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "郵便番号から市区町村まで調べられますか？",
              a: "このツールは上3桁から都道府県を判定します。市区町村・町域の詳細は日本郵便の公式サイト（post.japanpost.jp）へのリンクで確認できます。",
            },
            {
              q: "複数の郵便番号を一度に変換できますか？",
              a: "「一括検索」モードで改行・カンマ・スペース区切りで複数の郵便番号を貼り付けると、まとめて都道府県に変換できます。結果はタブ区切りでコピーできます。",
            },
            {
              q: "郵便番号の都道府県判定は正確ですか？",
              a: "上3桁による範囲判定のため概算です。一部の境界では複数の都道府県が重なる場合があります。正確な住所は日本郵便の公式データベースでご確認ください。",
            },
            {
              q: "ハイフンなしの郵便番号でも使えますか？",
              a: "はい。1000001（ハイフンなし）でも100-0001（ハイフンあり）でも自動的に解釈します。入力時に自動でハイフン付きフォーマットに整形されます。",
            },
          ].map(({ q, a }, i) => (
            <details key={i} className="group border border-border rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-gray-800 hover:bg-blue-50 list-none">
                <span>Q. {q}</span>
                <span className="text-blue-500 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-gray-600 border-t border-border">{a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* ── SEO: JSON-LD FAQPage ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "郵便番号から市区町村まで調べられますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "このツールは上3桁から都道府県を判定します。市区町村・町域の詳細は日本郵便公式サイトへのリンクで確認できます。" },
              },
              {
                "@type": "Question",
                "name": "複数の郵便番号を一度に変換できますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "「一括検索」モードで改行・カンマ・スペース区切りで複数貼り付けると、まとめて都道府県に変換できます。" },
              },
              {
                "@type": "Question",
                "name": "ハイフンなしの郵便番号でも使えますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "はい。1000001（ハイフンなし）でも100-0001（ハイフンあり）でも自動的に解釈します。" },
              },
            ],
          }),
        }}
      />

      {/* ── SEO: 関連ツール ── */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
        <h2 className="text-sm font-bold text-blue-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { href: "/tools/bank-code-lookup", label: "銀行コード検索ツール", desc: "銀行・支店コードを素早く調べる" },
            { href: "/tools/houjin-bangou-validator", label: "法人番号 検証ツール", desc: "13桁の法人番号を検証・フォーマット" },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} className="flex flex-col gap-0.5 bg-white rounded-xl p-3 border border-blue-100 hover:border-blue-300 transition-colors">
              <span className="text-sm font-semibold text-blue-700">{label}</span>
              <span className="text-xs text-gray-500">{desc}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── SEO: CTA ── */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-5 text-white text-center space-y-3">
        <p className="text-base font-bold">住所・コード変換ツールをまとめて活用</p>
        <p className="text-xs opacity-80">郵便番号・銀行コード・法人番号など、業務データの変換・検証ツールを無料で提供しています。</p>
        <a href="/tools" className="inline-block bg-white text-blue-700 text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors">
          全ツール一覧を見る
        </a>
      </div>
    </div>
  );
}
