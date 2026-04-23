import BmiCalculator from "./components/BmiCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            BMI計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            身長・体重を入力するだけで BMI・肥満度・標準体重を即計算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <BmiCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              BMIとは
            </h2>
            <p>
              BMI（Body Mass Index）は、体重と身長から算出される肥満度の指標です。計算式は「体重(kg) ÷ 身長(m)²」で、世界的に広く使われています。日本肥満学会では BMI 18.5 未満を「低体重（やせ）」、18.5〜25 未満を「普通体重」、25 以上を「肥満」と定義しており、肥満はさらに 1〜4 度に細分化されています。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              標準体重・理想体重の計算方法
            </h2>
            <p>
              標準体重は「身長(m)² × 22」で算出します。BMI 22 は統計的に最も病気にかかりにくいとされる数値であり、この体重を目標にするのが健康管理の基本とされています。また、適正体重の範囲は BMI 18.5〜25 に対応する体重で、「身長(m)² × 18.5」〜「身長(m)² × 25」となります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              日本肥満学会の判定基準
            </h2>
            <p>
              日本肥満学会が定める BMI 基準は、BMI 18.5 未満が低体重（やせ）、18.5〜25 未満が普通体重、25〜30 未満が肥満1度、30〜35 未満が肥満2度、35〜40 未満が肥満3度、40 以上が肥満4度となっています。WHO の基準では 30 以上を肥満としていますが、日本人は脂肪が蓄積しやすい体質のため、25 以上を肥満と定義しています。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              BMIの注意点と活用方法
            </h2>
            <p>
              BMI はあくまで体重と身長だけを用いた指標であり、筋肉量・体脂肪率・年齢・性別などは考慮されません。筋肉量の多いアスリートは BMI が高くても体脂肪率は低い場合があります。本ツールの結果はあくまで参考値として活用し、詳しい健康管理については医師や専門家にご相談ください。日常的に BMI を確認することで、体重管理の目安として役立てることができます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">BMI計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://nenrei-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日計算</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
              <a href="https://tax-calculator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
