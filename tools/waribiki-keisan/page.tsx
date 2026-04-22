import DiscountCalculator from "./components/DiscountCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            割引計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            パーセント割引・円引き・○割引きに対応。税込価格・お得度も自動計算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <DiscountCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              割引計算の使い方
            </h2>
            <p>
              商品の元の価格と割引率（または割引額）を入力するだけで、割引後の価格・割引額・消費税込みの価格を瞬時に計算します。セールやクーポン利用時の実際の支払額を素早く確認できます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              3つの割引モード
            </h2>
            <p>
              「% 割引」モードは最も一般的な割引率による計算です。たとえば「20% OFF」の商品なら割引率に20を入力するだけです。「○割引き」モードは日本独自の表現に対応しており、「3割引」なら3を入力することで30%OFFとして計算されます。「円引き」モードは金額が明示されているクーポンや値引きに使います。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              税込価格（10%・8%）の自動計算
            </h2>
            <p>
              割引後の価格に対して、消費税10%（標準税率）と8%（軽減税率・食料品等）の両方の税込価格を自動で表示します。スーパーや飲食店の買い物など、軽減税率が適用される場面でも正確な税込価格を確認できます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              複数商品の合計計算
            </h2>
            <p>
              「商品を追加」ボタンで複数の商品をまとめて計算できます。まとめ買いのセールや、複数のクーポンを使う際の合計節約額・合計支払額を一目で確認できます。各商品ごとにお得度も表示されるので、どの商品が最もお得かひと目でわかります。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">割引計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://tax-calculator-jp.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
              <a href="https://nenrei-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="https://eigyoubi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日計算</a>
              <a href="https://wareki-converter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
              <a href="https://zenkaku-hankaku.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">全角半角変換</a>
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
