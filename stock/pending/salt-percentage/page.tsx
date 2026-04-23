import SaltPercentage from "./components/SaltPercentage";

export default function SaltPercentagePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            塩分パーセント計算
          </h1>
          <p className="text-sm text-muted mt-1">
            食材重量から適切な塩分量を計算。食塩・醤油・味噌に換算して表示
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <SaltPercentage />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">塩分パーセントとは</h2>
            <p>
              塩分パーセントとは、食材の重量に対して加える塩の割合です。肉料理は0.8〜1.0%、魚料理は0.8〜1.2%、野菜は0.5〜0.8%が一般的な目安とされています。この割合を守ることで、素材の旨味を引き出しながらちょうどよい塩加減に仕上がります。
            </p>
            <h2 className="text-lg font-bold text-foreground">調味料換算について</h2>
            <p>
              食塩の塩分濃度は約99%、醤油は約16%、味噌は約12%です。例えば食材500gに塩分1%（5g）を加えたい場合、醤油なら約31g、味噌なら約42gが必要です。本ツールはこれらを自動換算します。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">塩分パーセント計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
