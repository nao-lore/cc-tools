import AreaCalculator from "./components/AreaCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            面積計算ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            8種類の図形の面積・周囲長を計算 — 坪・畳・ヘクタールなど日本単位にも対応
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <AreaCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">
              面積計算ツールについて
            </h2>
            <p>
              正方形・長方形・三角形・円・台形・平行四辺形・ひし形・楕円の8種類の図形に対応した面積計算ツールです。各図形の寸法を入力するだけで面積と周囲長が即座に求められます。入力単位はm（メートル）・cm（センチメートル）・mm（ミリメートル）・km（キロメートル）から選択でき、計算結果はm²・cm²・mm²・km²・坪・畳・a（アール）・ha（ヘクタール）など8種類の単位に自動変換されます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              日本の面積単位（坪・畳）について
            </h2>
            <p>
              日本では不動産・建築分野で「坪」や「畳」が広く使われています。1坪は約3.30579m²で、一般的に2畳分の広さに相当します。1畳は地域によって多少異なりますが、本ツールでは1畳＝約1.65290m²（京間）を基準に計算しています。マンションや住宅の間取り検討時に、平米数から坪数・畳数への換算にご活用ください。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              アール・ヘクタールとは
            </h2>
            <p>
              a（アール）とha（ヘクタール）は主に農地・土地の広さを表す単位です。1a＝100m²、1ha＝10,000m²（＝100a）で、1ヘクタールはおよそ東京ドーム（約46,755m²）の約0.21個分の広さです。田畑・山林・公園などの広大な面積を扱う際に便利な単位です。本ツールでは土地の面積をm²からアール・ヘクタールに瞬時に変換できます。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              各図形の計算式
            </h2>
            <p>
              正方形：一辺²、長方形：縦×横、三角形：底辺×高さ÷2、円：半径²×π、台形：（上底＋下底）×高さ÷2、平行四辺形：底辺×高さ、ひし形：対角線1×対角線2÷2、楕円：長半径×短半径×π。周囲長は正方形・長方形・円・ひし形・楕円（ラマヌジャン近似）で計算されます。三角形・台形・平行四辺形は全辺の長さが必要なため周囲長の表示を省略しています。
            </p>

            <h2 className="text-lg font-bold text-foreground">
              このツールの使い方
            </h2>
            <p>
              まず上部の図形ボタンから計算したい図形を選択します。次に「入力単位」で寸法の単位を選択し、各フィールドに数値を入力してください。面積と周囲長が自動で計算され、右側の単位セレクターで表示単位を切り替えられます。「単位変換一覧」では8種類すべての単位での面積が一覧表示されます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">面積計算ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://bmi-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">BMI計算</a>
              <a href="https://denki-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">電気代計算</a>
              <a href="https://risoku-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">利息計算</a>
              <a href="https://nenrei-keisan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">年齢計算</a>
              <a href="https://px-to-rem.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">px to rem</a>
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
