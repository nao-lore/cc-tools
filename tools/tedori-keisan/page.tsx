import TedoriCalculator from "./components/TedoriCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            手取り計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            会社員・給与所得者向け 年収から手取り額をかんたん試算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <TedoriCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              手取り額とは
            </h2>
            <p>
              手取り額とは、額面の給与（総支給額）から所得税・住民税・社会保険料（健康保険・厚生年金・雇用保険）を差し引いた、実際に受け取れる金額のことです。同じ年収でも、扶養家族の有無や勤務地、加入している健康保険組合によって手取り額は変わります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              手取り計算の仕組み
            </h2>
            <p>
              給与から差し引かれる主な項目は、社会保険料（健康保険・厚生年金・雇用保険）と税金（所得税・住民税）です。社会保険料は標準報酬月額に保険料率をかけて算出し、労使折半で負担します。所得税は給与所得控除・基礎控除・扶養控除・社会保険料控除を差し引いた課税所得に対して超過累進課税が適用されます。住民税は前年の所得をもとに翌年に徴収されます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              年収ごとの手取り目安
            </h2>
            <p>
              一般的に手取り率は年収が上がるにつれて低くなる傾向があります。年収300万円前後では手取り率は約75〜78%、年収500万円では約73〜76%、年収800万円では約70〜73%が目安です。扶養家族がいる場合は控除が増えるため、手取り率はやや高くなります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              このツールの使い方
            </h2>
            <p>
              額面年収（万円）と年齢、扶養家族数を入力し、社会保険の加入状況を選択するだけで手取り月額・年額と控除の内訳が自動表示されます。社会保険未加入の場合（フリーランス・国民健康保険加入者等）は「未加入」を選択してください。本ツールは2024年度の税制をもとにした概算であり、実際の金額は勤務先や各種控除の適用状況により異なります。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">手取り計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="../tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
              <a href="../loan-simulator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ローン返済シミュレーター</a>
              <a href="../waribiki-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">割引計算</a>
              <a href="../bmi-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
              <a href="../nenrei-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
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
  "name": "手取り計算ツール",
  "description": "手取り計算ツール — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/tedori-keisan",
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
