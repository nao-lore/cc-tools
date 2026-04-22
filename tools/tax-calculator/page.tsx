import TaxCalculator from "./components/TaxCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            源泉徴収税計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            フリーランス・個人事業主向け 報酬の税額シミュレーション
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <TaxCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              源泉徴収とは
            </h2>
            <p>
              源泉徴収とは、報酬や給与を支払う側が、所得税をあらかじめ差し引いて国に納付する制度です。フリーランスや個人事業主がクライアントから報酬を受け取る際、多くの場合、報酬額から源泉徴収税が差し引かれた金額が振り込まれます。これは所得税の前払いにあたり、確定申告時に精算されます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              源泉徴収税の計算方法
            </h2>
            <p>
              源泉徴収税の税率は、報酬額（税抜）に応じて以下のように定められています。100万円以下の部分には10.21%（所得税10%＋復興特別所得税0.21%）、100万円を超える部分には20.42%（所得税20%＋復興特別所得税0.42%）が適用されます。なお、消費税額が請求書等で明確に区分されている場合は、税抜金額に対して源泉徴収税を計算します。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              フリーランスの確定申告との関係
            </h2>
            <p>
              源泉徴収された税額は、確定申告の際に納付すべき所得税額から差し引かれます。年間の所得が少なく、源泉徴収された税額が本来の所得税額を上回る場合は、確定申告により還付を受けることができます。フリーランスとして活動する方は、年間の源泉徴収額を正確に把握しておくことが、適切な確定申告と節税のために重要です。本ツールでは複数の報酬を一括で計算し、年間合計額を把握することができます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              このツールの使い方
            </h2>
            <p>
              報酬額を入力し、消費税の扱い（税込・税抜）を選択するだけで、源泉徴収税額と手取り額（差引支払額）が自動計算されます。「項目を追加」ボタンで複数件の報酬をまとめて計算でき、年間合計も確認できます。計算結果は「請求書用テキストをコピー」ボタンで簡単にコピーできるため、請求書作成やクライアントへの連絡にそのまま活用いただけます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">源泉徴収税計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://eigyoubi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日計算</a>
              <a href="https://wareki-converter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
              <a href="https://zenkaku-hankaku.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">全角半角変換</a>
              <a href="https://furigana-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ふりがな変換</a>
              <a href="https://aspect-ratio-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Aspect Ratio</a>
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
