import OvenTempConverter from "./components/OvenTempConverter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            オーブン温度換算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            摂氏・華氏・ガスマーク を相互変換 — お菓子・料理レシピの温度確認に
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <OvenTempConverter />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">使い方ガイド</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <span className="font-medium text-foreground">変換元の単位を選ぶ</span>
                — 摂氏（°C）・華氏（°F）・ガスマークのいずれかを選択します。
              </li>
              <li>
                <span className="font-medium text-foreground">温度を入力する</span>
                — 数値を入力すると他の2単位へ自動変換されます。
              </li>
              <li>
                <span className="font-medium text-foreground">温度帯を確認する</span>
                — 低温・中温・中高温・高温の区分と調理用途の目安が表示されます。
              </li>
              <li>
                <span className="font-medium text-foreground">プリセットを活用する</span>
                — クッキー・ケーキ・パンなどよく使われる温度をワンタップで入力できます。
              </li>
            </ol>

            <h2 className="text-lg font-bold text-foreground mt-8">よくある質問（FAQ）</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Q. 華氏350°Fは摂氏何度ですか？</p>
                <p className="mt-1">A. 華氏350°F は摂氏約177°C（≒180°C）です。スポンジケーキやクッキーなど多くのお菓子レシピで使われる標準的な温度です。計算式は °C = (°F − 32) × 5 ÷ 9 です。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. ガスマークとは何ですか？</p>
                <p className="mt-1">A. ガスマーク（Gas Mark）はイギリスのガスオーブン向けの温度表記で、1〜9の数字で温度を示します。主に英語圏のレシピで使用されます。ガスマーク4が約180°C、ガスマーク6が約200°Cに相当します。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. レシピの温度より少し低めに設定したほうがいいですか？</p>
                <p className="mt-1">A. オーブンによって実際の庫内温度が異なります。コンベクション（ファン付き）オーブンは熱が均一に回るため、レシピより10〜20°C低めに設定するのが一般的です。オーブン用温度計で実際の温度を確認することをおすすめします。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. アメリカのレシピで「375°F」と書いてあります。日本のオーブンで何度に設定すればいいですか？</p>
                <p className="mt-1">A. 375°F は約190°Cです。このツールで華氏を入力すれば摂氏に変換できます。アメリカのレシピは大型ガスオーブン前提のことが多いため、日本の家庭用オーブンでは同じ温度でも焼き加減が異なる場合があります。</p>
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
                      name: "華氏350°Fは摂氏何度ですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "華氏350°Fは摂氏約177°C（≒180°C）です。多くのお菓子レシピで使われる標準的な温度です。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "ガスマークとは何ですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "ガスマークはイギリスのガスオーブン向けの温度表記で、1〜9の数字で温度を示します。ガスマーク4が約180°C、ガスマーク6が約200°Cです。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "アメリカのレシピで375°Fは日本のオーブンで何度に設定すればいいですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "375°Fは約190°Cです。このツールで華氏を入力すれば摂氏に自動変換できます。",
                      },
                    },
                  ],
                }),
              }}
            />

            <h2 className="text-lg font-bold text-foreground mt-8">関連ツール</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/measuring-converter" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">計量スプーン・カップ換算</a>
              <a href="/calorie-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">カロリー計算</a>
            </div>

            <div className="mt-6 bg-card border border-border rounded-xl p-5 text-center space-y-2">
              <p className="font-bold text-foreground">海外レシピを日本語で再現するなら</p>
              <p className="text-xs text-muted">温度・分量の単位変換をまとめて確認。英語レシピも怖くない。</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">オーブン温度換算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/measuring-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">計量スプーン換算</a>
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
  "name": "オーブン温度換算ツール",
  "description": "オーブン温度換算ツール — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/oven-temp-converter",
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
