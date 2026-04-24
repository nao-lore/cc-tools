import CalorieCalculator from "./components/CalorieCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            カロリー計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            性別・年齢・身長・体重・活動レベルから基礎代謝（BMR）・消費カロリー（TDEE）・PFCバランスを即計算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <CalorieCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              基礎代謝量（BMR）とは
            </h2>
            <p>
              基礎代謝量（BMR: Basal Metabolic Rate）は、安静状態で生命を維持するために最低限必要なエネルギー量です。呼吸・体温維持・心臓の拍動などの生命活動に使われるカロリーで、何もしなくても消費されます。本ツールでは世界的に広く用いられる Harris-Benedict 改訂式を使用しており、男性は「88.362 + (13.397 × 体重) + (4.799 × 身長) − (5.677 × 年齢)」、女性は「447.593 + (9.247 × 体重) + (3.098 × 身長) − (4.330 × 年齢)」で算出します。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              1日の消費カロリー（TDEE）と活動レベル
            </h2>
            <p>
              TDEE（Total Daily Energy Expenditure）は、基礎代謝量に活動係数を掛けた「1日の総消費カロリー」です。活動係数は、ほとんど運動しない場合は 1.2、週1〜3回の軽い運動は 1.375、週3〜5回の中程度の運動は 1.55、週6〜7回の激しい運動は 1.725、アスリートや肉体労働者は 1.9 が目安となります。自分の生活スタイルに合った活動レベルを選ぶことで、より正確な消費カロリーを把握できます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              減量・増量のカロリー設定
            </h2>
            <p>
              体重を変化させるには、摂取カロリーと消費カロリーの差（カロリー収支）を調整します。一般的に 7,200kcal の不足・過剰が体脂肪 1kg 相当とされるため、1日 500kcal の赤字を作ると週約 0.5kg の減量、1日 500kcal の黒字を作ると週約 0.5kg の増量が期待できます。急激な制限は筋肉量の低下や栄養不足を招くため、TDEE を基準に無理のない範囲で調整することが大切です。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              PFCバランス（三大栄養素）について
            </h2>
            <p>
              PFC とは、タンパク質（Protein）・脂質（Fat）・炭水化物（Carbohydrate）の頭文字です。タンパク質は 1g あたり 4kcal、脂質は 9kcal、炭水化物は 4kcal のエネルギーを持ちます。一般的な目安として、タンパク質 30%・脂質 25%・炭水化物 45% のバランスが推奨されることがあります。ダイエット中はタンパク質を増やして筋肉を維持し、脂質・炭水化物を適度に抑えるアプローチが効果的です。本ツールの結果はあくまで参考値ですので、詳細な栄養管理については管理栄養士や医師にご相談ください。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">カロリー計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://bmi-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
              <a href="https://nenrei-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="https://risoku-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">利息計算</a>
              <a href="https://loan-simulator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ローンシミュレーター</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "カロリー計算ツール",
  "description": "カロリー計算ツール — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/calorie-keisan",
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
