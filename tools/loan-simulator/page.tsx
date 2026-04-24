import LoanSimulator from "./components/LoanSimulator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            ローン返済シミュレーター
          </h1>
          <p className="text-sm text-muted mt-1">
            住宅・カーローン等の月々の返済額・総返済額・利息をシミュレーション
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Simulator */}
          <LoanSimulator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              ローン計算とは
            </h2>
            <p>
              ローン計算とは、借入金額・金利・返済期間をもとに、毎月の返済額や総返済額、支払う利息の合計を算出することです。住宅ローン・マイカーローン・教育ローンなど、さまざまな場面で活用されます。事前にシミュレーションを行うことで、無理のない借入計画を立てることができます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              元利均等返済と元金均等返済の違い
            </h2>
            <p>
              元利均等返済は、毎月の返済額（元金＋利息）が一定になる方式です。返済計画が立てやすく、住宅ローンで最も広く使われています。一方、元金均等返済は毎月の元金返済額が一定で、残高が減るにつれて利息も減るため、返済が進むほど月々の負担が軽くなります。総支払利息は元金均等返済の方が少なくなりますが、返済初期の月々の負担が大きくなります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              返済比率について
            </h2>
            <p>
              返済比率とは、年収に対する年間返済額の割合のことです。金融機関による住宅ローン審査では、返済比率が重要な指標のひとつとなります。一般的に、返済比率が25%以下であれば安全圏、25〜35%は注意、35%を超えると家計への負担が大きいとされます。本ツールでは年収を入力することで返済比率を自動計算できます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              ボーナス返済について
            </h2>
            <p>
              ボーナス返済とは、通常の毎月返済に加え、賞与月（一般的に年2回）に追加で返済する方法です。ボーナス返済を活用することで、毎月の返済額を抑えながら早期に元金を減らすことができます。本シミュレーターでは1回あたりのボーナス返済額を入力することで、年2回のボーナス返済を加味した総返済額と年次残高推移を確認できます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              このツールの使い方
            </h2>
            <p>
              借入金額（万円）・金利（年利%）・返済期間（年）を入力するだけで、毎月の返済額・総返済額・利息総額が自動計算されます。ボーナス返済額（任意）と年収を入力すると、ボーナス返済を含めた計算と返済比率の確認も可能です。元利均等返済と元金均等返済の切り替えボタンで、両方式の比較も簡単に行えます。年次の返済シミュレーション表で残高の推移を一目で確認できます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">ローン返済シミュレーター — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://tax-calculator-nine-tau.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日計算</a>
              <a href="https://nissuu-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">日数計算</a>
              <a href="https://nenrei-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
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
  "name": "ローン返済シミュレーター",
  "description": "ローン返済シミュレーター — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/loan-simulator",
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
