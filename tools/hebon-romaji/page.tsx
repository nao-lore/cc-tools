import HebonRomaji from "./components/HebonRomaji";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            ヘボン式ローマ字変換
          </h1>
          <p className="text-sm text-muted mt-1">
            パスポート申請対応 — ひらがな・カタカナをヘボン式ローマ字に変換
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <HebonRomaji />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">使い方ガイド</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <span className="font-medium text-foreground">モードを選択する</span>
                — パスポート申請には「パスポート用」モードを選択してください。外務省基準に準拠した変換を行います。
              </li>
              <li>
                <span className="font-medium text-foreground">日本語を入力する</span>
                — ひらがな・カタカナで名前を入力します。スペースで姓と名を区切るとそのまま変換されます。
              </li>
              <li>
                <span className="font-medium text-foreground">変換結果を確認する</span>
                — 大文字のヘボン式ローマ字に変換されます。「コピー」ボタンでクリップボードにコピーできます。
              </li>
              <li>
                <span className="font-medium text-foreground">申請書に記入する</span>
                — パスポート申請書の「ローマ字氏名」欄にそのまま転記してください。
              </li>
            </ol>

            <h2 className="text-lg font-bold text-foreground mt-8">よくある質問（FAQ）</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Q. ヘボン式ローマ字とは何ですか？</p>
                <p className="mt-1">A. ヘボン式（Hepburn romanization）は、日本語をローマ字表記するための方式のひとつです。外務省のパスポート申請で採用されており、「し→shi」「ち→chi」「つ→tsu」のように英語の発音に近い表記が特徴です。訓令式（「し→si」）とは異なります。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. パスポートのローマ字氏名はヘボン式でないといけませんか？</p>
                <p className="mt-1">A. はい、日本のパスポートでは外務省告示に基づきヘボン式ローマ字が原則採用されています。ただし、すでに使用している英語表記がある場合は申し出により使用できるケースもあります。詳細はパスポートセンターにご確認ください。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 長音（ー）はどう表記しますか？</p>
                <p className="mt-1">A. パスポート用ヘボン式では長音は省略します。「おおさか → OSAKA」「とうきょう → TOKYO」のように、伸ばす音のマクロン（ō、ū）は使わず、そのまま母音を表記します。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 「ん」は N と M どちらですか？</p>
                <p className="mt-1">A. 基本は「N」ですが、B・M・P の前では「M」と表記します（例：しんぱい → SHIMPAI、あんぜん → ANZEN）。このツールのパスポートモードでは自動的に変換されます。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 漢字はヘボン式に変換できますか？</p>
                <p className="mt-1">A. このツールはひらがな・カタカナの変換に対応しています。漢字の読み取りには対応していないため、先にふりがなに変換してから入力してください。</p>
              </div>
            </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "ヘボン式ローマ字とは何ですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "ヘボン式は日本語をローマ字表記する方式で、外務省のパスポート申請で採用されています。し→shi、ち→chi、つ→tsuのように英語の発音に近い表記が特徴です。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "パスポートのローマ字氏名はヘボン式でないといけませんか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "はい、日本のパスポートでは外務省告示に基づきヘボン式ローマ字が原則採用されています。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "長音（ー）はどう表記しますか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "パスポート用ヘボン式では長音は省略します。おおさか→OSAKA、とうきょう→TOKYOのように伸ばす音は省略して表記します。",
                      },
                    },
                  ],
                }),
              }}
            />

            <h2 className="text-lg font-bold text-foreground mt-8">関連ツール</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/furigana" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">ふりがな変換</a>
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">全角半角変換</a>
              <a href="/moji-count" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">文字数カウント</a>
            </div>

            <div className="mt-6 bg-card border border-border rounded-xl p-5 text-center space-y-2">
              <p className="font-bold text-foreground">パスポート申請・海外渡航の準備に</p>
              <p className="text-xs text-muted">外務省基準のヘボン式ローマ字で、正確な英語表記を確認しましょう。</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">ヘボン式ローマ字変換 — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/furigana" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ふりがな変換</a>
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">全角半角変換</a>
              <a href="/moji-count" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">文字数カウント</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">60+ Free Tools →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ヘボン式ローマ字変換",
  "description": "ヘボン式ローマ字変換 — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/hebon-romaji",
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
