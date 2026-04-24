import KenpeiYoseki from "./components/KenpeiYoseki";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            建蔽率・容積率 計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            敷地面積と用途地域から最大建築面積・延べ床面積を計算 — 法適合チェック付き
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <KenpeiYoseki />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">使い方ガイド</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <span className="font-medium text-foreground">用途地域を選択する</span>
                — 土地の用途地域を選ぶと建蔽率・容積率の制限値が自動入力されます。用途地域は登記簿や行政の都市計画図で確認できます。
              </li>
              <li>
                <span className="font-medium text-foreground">敷地面積を入力する</span>
                — m²単位で敷地面積を入力します。登記簿謄本や測量図の「地積」欄を参照してください。
              </li>
              <li>
                <span className="font-medium text-foreground">結果を確認する</span>
                — 最大建築面積（建蔽率）・最大延べ床面積（容積率）・概算最大階数が表示されます。
              </li>
              <li>
                <span className="font-medium text-foreground">法適合チェックをする（任意）</span>
                — 建築面積・延べ床面積を入力すると、制限値以内かどうかをチェックできます。
              </li>
            </ol>

            <h2 className="text-lg font-bold text-foreground mt-8">よくある質問（FAQ）</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Q. 建蔽率と容積率の違いは何ですか？</p>
                <p className="mt-1">A. 建蔽率は「敷地面積に対する建築面積（建物の1階部分の面積）の割合」で、建物が敷地をどれだけ覆うかを制限します。容積率は「敷地面積に対する延べ床面積（全フロアの合計）の割合」で、建物の総ボリュームを制限します。例えば敷地100m²・建蔽率60%・容積率200%なら、建築面積60m²以下・延べ床面積200m²以下の建物を建てられます。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 用途地域はどこで確認できますか？</p>
                <p className="mt-1">A. 各市区町村の都市計画課または都市計画GIS（多くの自治体でWeb公開）で確認できます。不動産の登記事項証明書に記載されている場合もあります。また不動産購入時の重要事項説明書に必ず記載されています。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 建蔽率・容積率の緩和規定はありますか？</p>
                <p className="mt-1">A. あります。角地緩和（建蔽率+10%）、耐火建築物緩和（商業地域等）、前面道路幅員による容積率制限（道路幅員×係数）などがあります。このツールは基本的な計算のみ対応しており、緩和・制限は考慮していません。設計前には必ず建築士または行政窓口にご確認ください。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 建蔽率を超えている建物は違反建築ですか？</p>
                <p className="mt-1">A. 建築当時の法規制との適合が重要です。既存建物が現行の建蔽率・容積率を超えている場合、「既存不適格」として一定の条件下で存続できますが、増築や建て替えには現行法規制に従う必要があります。</p>
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
                      name: "建蔽率と容積率の違いは何ですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "建蔽率は敷地面積に対する建築面積の割合、容積率は敷地面積に対する延べ床面積の割合です。建蔽率は建物が敷地を覆う広さ、容積率は建物の総ボリュームを制限します。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "用途地域はどこで確認できますか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "各市区町村の都市計画課または都市計画GISのWeb公開サービスで確認できます。重要事項説明書にも記載されています。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "建蔽率・容積率の緩和規定はありますか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "角地緩和（+10%）や耐火建築物緩和などがあります。このツールは基本計算のみ対応しており、設計前には建築士や行政窓口への確認を推奨します。",
                      },
                    },
                  ],
                }),
              }}
            />

            <h2 className="text-lg font-bold text-foreground mt-8">関連ツール</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/menseki-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">面積計算ツール</a>
              <a href="/loan-simulator" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">住宅ローンシミュレーター</a>
            </div>

            <div className="mt-6 bg-card border border-border rounded-xl p-5 text-center space-y-2">
              <p className="font-bold text-foreground">土地購入・家づくりの事前確認に</p>
              <p className="text-xs text-muted">購入前に建てられる建物の規模を把握。用途地域と敷地面積を入力するだけで、最大の建築ボリュームがわかります。</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">建蔽率・容積率 計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/menseki-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">面積計算</a>
              <a href="/loan-simulator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ローン計算</a>
              <a href="/risoku-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">利息計算</a>
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
  "name": "建蔽率・容積率 計算ツール",
  "description": "建蔽率・容積率 計算ツール — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/kenpei-yoseki",
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
