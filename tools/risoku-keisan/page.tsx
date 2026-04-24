import InterestCalculator from "./components/InterestCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            利息計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            単利・複利の利息額と元利合計をかんたんシミュレーション
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <InterestCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              利息とは
            </h2>
            <p>
              利息とは、お金を貸し借りする際に発生する対価のことです。預金や投資では受け取る側、ローンや借入れでは支払う側になります。利息の計算方式には「単利」と「複利」の2種類があり、長期運用では両者の差が大きくなります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              単利と複利の違い
            </h2>
            <p>
              単利は元金に対してのみ利息が発生する計算方式です。毎期同じ金額の利息が加算されます。一方、複利は元金に加えて過去に発生した利息にも利息がつく方式です。「利息が利息を生む」ため、運用期間が長いほど複利の効果が大きくなります。例えば元金100万円・年利3%・10年の場合、単利では利息合計30万円ですが、複利（年1回）では約34.4万円となります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              複利計算の頻度について
            </h2>
            <p>
              複利は計算（利息の組み入れ）頻度が高いほど最終的な受取額が大きくなります。年1回よりも半年・四半期・毎月の方が有利です。本ツールでは年1回・半年（年2回）・四半期（年4回）・毎月（年12回）から選択できます。実効年利率（EAR）を確認することで、異なる頻度の商品を公平に比較できます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              このツールの使い方
            </h2>
            <p>
              元金・年利率・期間（年またはヶ月）を入力し、単利か複利かを選択するだけで計算できます。複利の場合は計算頻度も選択してください。結果には利息額・元利合計・実質利回りのほか、年ごとの残高推移表が表示されます。定期預金・積立投資・ローンのシミュレーションなど幅広くお使いいただけます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">利息計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://loan-simulator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">住宅ローン計算</a>
              <a href="https://waribiki-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">割引計算</a>
              <a href="https://bmi-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
              <a href="https://nenrei-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="https://tax-calculator-psi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
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
  "name": "利息計算ツール",
  "description": "利息計算ツール — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/risoku-keisan",
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
