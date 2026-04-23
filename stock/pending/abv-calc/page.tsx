import AbvCalculator from "./components/AbvCalculator";

export default function AbvCalcPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            アルコール度数計算
          </h1>
          <p className="text-sm text-muted mt-1">
            比重からアルコール度数（ABV）を計算。自家醸造・ホームブルー向け
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <AbvCalculator />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">ABVの計算式</h2>
            <p>
              アルコール度数（ABV）は「(初期比重 - 最終比重) × 131.25」で計算されます。これはビール・ワイン・シードルなど発酵飲料全般に使用できる汎用式です。より精度の高い計算には「(76.08 × (初期比重 - 最終比重)) / (1.775 - 初期比重) × (最終比重 / 0.794)」が用いられます。
            </p>
            <h2 className="text-lg font-bold text-foreground">比重の測定方法</h2>
            <p>
              比重はハイドロメーター（糖度計）で測定します。初期比重（OG）は仕込み直後、最終比重（FG）は発酵が止まってから2〜3日連続で同じ値になったときに記録します。温度補正が必要な場合は15〜20℃での測定値を基準にしてください。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">アルコール度数計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
