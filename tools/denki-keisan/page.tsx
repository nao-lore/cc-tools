import DenkiCalculator from "./components/DenkiCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            電気代計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            家電の消費電力と使用時間から1日・1ヶ月・1年の電気代を自動計算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <DenkiCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              電気代の計算方法
            </h2>
            <p>
              電気代は「消費電力（W）× 使用時間（h）÷ 1000 × 電気料金単価（円/kWh）」で計算できます。消費電力をワット（W）から1000で割ることでキロワット（kW）に換算し、使用時間をかけると消費電力量（kWh）が求まります。その値に電力会社の料金単価を掛けたものが電気代です。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              電気料金単価の目安
            </h2>
            <p>
              電気料金単価は電力会社・プラン・地域によって異なりますが、2024年時点での全国平均は1kWhあたり約31円です。ご契約の電力会社の明細書や電力会社のWebサイトで確認できます。時間帯別料金プランを利用している場合は、使用時間帯に応じた単価で計算するとより正確です。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              家電別の電気代目安
            </h2>
            <p>
              エアコン（1000W）を8時間使用した場合、1日あたり約24円（31円/kWh換算）。冷蔵庫（150W）は24時間稼働で約11円/日。ドライヤー（1200W）は1日15分の使用で約9円/月です。消費電力の大きい家電ほど電気代への影響が大きいため、複数の家電をまとめて計算し、節電の優先順位を把握するのに本ツールが役立ちます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              このツールの使い方
            </h2>
            <p>
              電気料金単価を入力後、家電の消費電力（W）と1日の使用時間（時間）を入力すると、1日・1ヶ月・1年の電気代が自動計算されます。プリセットボタンからエアコン・冷蔵庫など代表的な家電をワンタップで追加でき、「家電を追加」ボタンで複数台の合計電気代も一覧できます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">電気代計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/bmi-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
              <a href="/nenrei-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="/risoku-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">利息計算</a>
              <a href="/loan-simulator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ローン計算</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
