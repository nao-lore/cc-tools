import MeasuringConverter from "./components/MeasuringConverter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b]">
      {/* Header */}
      <header className="border-b border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            計量スプーン・カップ グラム換算
          </h1>
          <p className="text-sm text-violet-100 mt-1">
            大さじ・小さじ・カップをグラムに換算 — 食材別の正確な重量計算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <MeasuringConverter />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">使い方ガイド</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <span className="font-medium text-foreground">食材を選ぶ</span>
                — 水・醤油・砂糖・小麦粉など計量したい食材を選択します。食材によって同じ容量でもグラム数が異なります。
              </li>
              <li>
                <span className="font-medium text-foreground">変換方向を選ぶ</span>
                — 「容量→グラム」か「グラム→容量」を選択します。
              </li>
              <li>
                <span className="font-medium text-foreground">量を入力する</span>
                — 計量スプーン・カップのボタンをタップするか、数値を直接入力します。
              </li>
              <li>
                <span className="font-medium text-foreground">換算結果を確認する</span>
                — グラム・ml・各スプーン・カップでの換算値が一覧表示されます。
              </li>
            </ol>

            <h2 className="text-lg font-bold text-foreground mt-8">よくある質問（FAQ）</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Q. 大さじ1は何グラムですか？（砂糖・塩・醤油など）</p>
                <p className="mt-1">A. 大さじ1は15mlですが、グラム数は食材によって異なります。砂糖（上白糖）は約9g、塩は約18g、醤油は約18g、小麦粉（薄力粉）は約8gが目安です。このツールで食材を選んで確認できます。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 1カップは何mlですか？</p>
                <p className="mt-1">A. 日本の計量カップ1カップは200mlです。アメリカのレシピで使われる1カップは約240mlと異なるので、海外レシピを使う際は注意が必要です。このツールは日本基準（200ml）で計算します。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 小さじと大さじの関係は？</p>
                <p className="mt-1">A. 小さじ1は5ml、大さじ1は15mlです。大さじ1 = 小さじ3の関係があります。レシピで「大さじ1と1/2」とある場合は22.5ml（小さじ4.5杯分）です。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 料理スケール（はかり）がない場合に使えますか？</p>
                <p className="mt-1">A. はい、このツールはスケールなしでも材料を計量できるように設計されています。グラム数をml・スプーン・カップに変換できるため、計量スプーンと計量カップだけで正確に計れます。</p>
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
                      name: "大さじ1は何グラムですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "大さじ1は15mlですが食材によって異なります。砂糖約9g、塩約18g、醤油約18g、薄力粉約8gが目安です。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "1カップは何mlですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "日本の計量カップ1カップは200mlです。アメリカのレシピの1カップは約240mlと異なります。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "小さじと大さじの関係は？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "小さじ1は5ml、大さじ1は15mlです。大さじ1 = 小さじ3の関係があります。",
                      },
                    },
                  ],
                }),
              }}
            />

            <h2 className="text-lg font-bold text-foreground mt-8">関連ツール</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/oven-temp-converter" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">オーブン温度換算</a>
              <a href="/calorie-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">カロリー計算</a>
            </div>

            <div className="mt-6 bg-card border border-border rounded-xl p-5 text-center space-y-2">
              <p className="font-bold text-foreground">レシピ通りに正確に計量したいなら</p>
              <p className="text-xs text-muted">大さじ・小さじ・カップを食材別のグラム数に瞬時に換算。お菓子作りや料理の精度が上がります。</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">計量スプーン・カップ グラム換算 — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/oven-temp-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">オーブン温度換算</a>
              <a href="/calorie-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">カロリー計算</a>
              <a href="/bmi-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
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
  "name": "計量スプーン・カップ グラム換算",
  "description": "計量スプーン・カップ グラム換算 — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/measuring-converter",
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
