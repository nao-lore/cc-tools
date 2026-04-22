import BodyFatCalculator from "./components/BodyFatCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            体脂肪率計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            Navy法で体脂肪率を推定計算。身長・体重・ウエスト・首周りを入力するだけ
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <BodyFatCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              Navy法（米海軍式）とは
            </h2>
            <p>
              Navy法は米海軍が採用する体脂肪率推定式で、身長・ウエスト周囲径・首周りの3つの周径を使って体脂肪率を算出します。女性の場合はさらに腰周りを加えます。体組成計が手元になくても、メジャー一本で手軽に計測できるため、自宅でのセルフチェックに広く活用されています。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              計算式
            </h2>
            <p>
              男性の体脂肪率（%）は「86.010 × log10(腹囲 - 首囲) − 70.041 × log10(身長) + 36.76」で求めます。女性の場合は「163.205 × log10(腹囲 + 腰囲 - 首囲) − 97.684 × log10(身長) − 78.387」です。いずれも測定部位の単位はcmです。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              体脂肪率の判定基準
            </h2>
            <p>
              体脂肪率の適正範囲は性別・年齢によって異なります。一般的に男性は10〜20%、女性は20〜30%が標準とされています。男性で25%以上、女性で35%以上は肥満と判定され、生活習慣病のリスクが高まります。一方で体脂肪率が低すぎる場合も免疫機能の低下やホルモンバランスへの影響が懸念されます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              正確な測定のポイント
            </h2>
            <p>
              ウエスト周囲径はへその高さで水平に測り、息を吐いた状態で測定します。首周りは喉仏の直下を水平に測ります。測定時間帯を統一する（例：起床後30分以内）ことで、日々の変化を比較しやすくなります。本ツールの結果はあくまで推定値です。詳細な健康管理については医師や専門家にご相談ください。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">体脂肪率計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://bmi-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
              <a href="https://nenrei-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="https://eigyoubi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日計算</a>
              <a href="https://wareki-converter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
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
