import GachaCostCeiling from "./components/GachaCostCeiling";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0d0d2b]">
      {/* Header */}
      <header className="border-b border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            ガチャ 天井コスト計算ツール
          </h1>
          <p className="text-sm text-violet-100 mt-1">
            天井・排出率・1回コストから期待値と最大コストを計算 — 原神・スターレイル対応
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <GachaCostCeiling />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">使い方ガイド</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <span className="font-medium text-foreground">ゲームを選択する</span>
                — 原神・スターレイルなどのプリセットを選ぶと天井・排出率・コストが自動入力されます。
              </li>
              <li>
                <span className="font-medium text-foreground">設定を確認・調整する</span>
                — 天井回数・排出率・1回あたりのコストを必要に応じて変更できます。
              </li>
              <li>
                <span className="font-medium text-foreground">目標数と現在の累積回数を入力する</span>
                — 何体取得したいか、今何連しているかを入力すると残りコストも計算されます。
              </li>
              <li>
                <span className="font-medium text-foreground">結果を確認する</span>
                — 天井コスト（確定）・期待コスト・天井までの残り回数が表示されます。
              </li>
            </ol>

            <h2 className="text-lg font-bold text-foreground mt-8">よくある質問（FAQ）</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Q. 天井コストと期待コストの違いは何ですか？</p>
                <p className="mt-1">A. 天井コストは「最悪のケース」で天井まで引き切った場合のコストです。期待コストは確率計算に基づく平均的なコストで、天井コストより少なくなります。運が良ければ期待コスト以下で引けることもあります。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 原神の天井は何回ですか？</p>
                <p className="mt-1">A. 原神のキャラクターガチャは90連が天井（ハード天井）で、★5が確定します。また50連ごとにソフト天井があり、74連以降は排出率が徐々に上がる仕組みです。このツールのシンプルモデルはソフト天井を考慮していないため、実際の期待値とは若干異なります。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 課金額の目安を知りたい</p>
                <p className="mt-1">A. ゲーム内通貨のレートを「1通貨あたり（円）」欄に入力すると、円換算の金額が表示されます。例えば原神で160石＝1回で、石のレートを設定することで天井までの課金額が計算できます。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 複数キャラを狙う場合の計算方法は？</p>
                <p className="mt-1">A. 「目標キャラ数」に取得したい体数を入力してください。複数体の合計コスト（最大・期待値）が計算されます。なお確率はキャラごとに独立しているため、1体の期待コスト×体数で計算されます。</p>
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
                      name: "天井コストと期待コストの違いは何ですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "天井コストは最悪のケースで天井まで引き切ったコスト、期待コストは確率計算に基づく平均的なコストです。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "原神の天井は何回ですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "原神のキャラクターガチャは90連が天井（ハード天井）で★5が確定します。74連以降は排出率が徐々に上がるソフト天井もあります。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "複数キャラを狙う場合の計算方法は？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "目標キャラ数に取得したい体数を入力すると複数体の合計コストが計算されます。",
                      },
                    },
                  ],
                }),
              }}
            />

            <h2 className="text-lg font-bold text-foreground mt-8">関連ツール</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/waribiki-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">割引計算</a>
              <a href="/loan-simulator" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">ローン計算</a>
            </div>

            <div className="mt-6 bg-card border border-border rounded-xl p-5 text-center space-y-2">
              <p className="font-bold text-foreground">課金前に必ずシミュレーション</p>
              <p className="text-xs text-muted">天井コストを把握してから計画的にガチャを回しましょう。天井まで引いた場合の最大コストを事前確認。</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">ガチャ 天井コスト計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/waribiki-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">割引計算</a>
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
  "name": "ガチャ 天井コスト計算ツール",
  "description": "ガチャ 天井コスト計算ツール — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/gacha-cost-ceiling",
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
