import TsumitateSim from "./components/TsumitateSim";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            積立シミュレーション
          </h1>
          <p className="text-sm text-muted mt-1">
            つみたてNISA・投資信託の複利効果を計算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Simulator */}
          <TsumitateSim />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              積立投資の複利効果とは
            </h2>
            <p>
              積立投資は、毎月一定額を長期にわたって投資し続けることで、複利の力を最大限に活用できる運用方法です。複利とは、運用で得た利益を再投資することで、元本だけでなく利益にも利息がつく仕組みです。投資期間が長くなるほど複利効果は大きく働き、資産が雪だるま式に増えていきます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              つみたてNISAと新NISAの概要
            </h2>
            <p>
              つみたてNISAは、少額からの長期・積立・分散投資を支援する非課税制度です。年間40万円（月約33,333円）までの投資に対し、最長20年間、運用益が非課税となります。2024年から始まった新NISAでは、つみたて投資枠が年間120万円（月10万円）に拡大され、成長投資枠と合わせた年間投資上限は360万円、生涯投資枠は1,800万円となりました。本ツールでは通常の積立計算として複利シミュレーションを行っています。非課税メリットを加味した実際の手取りは税制の条件に応じて異なります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              想定年利の目安
            </h2>
            <p>
              全世界株式や米国株式のインデックスファンドは、過去の実績ベースで年率4〜7%程度のリターンが参考値として用いられることが多いです。ただし、将来のリターンを保証するものではなく、投資にはリスクが伴います。本ツールは教育目的のシミュレーターであり、投資判断の根拠として使用しないようお願いします。実際の運用では信託報酬等のコストも考慮する必要があります。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              このツールの使い方
            </h2>
            <p>
              毎月の積立額・想定年利・積立期間を入力すると、最終積立額・元本合計・運用益・運用益率が即時に計算されます。初期投資額（一括投資分）も加算できます。年次推移表では各年末時点の元本累計・運用益・合計を確認でき、複利の加速をグラフィカルに把握できます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">積立シミュレーション — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://loan-simulator-jade.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ローンシミュレーター</a>
              <a href="https://tax-calculator-chi-neon.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
              <a href="https://tedori-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">手取り計算</a>
              <a href="https://waribiki-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">割引計算</a>
              <a href="https://bmi-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
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
