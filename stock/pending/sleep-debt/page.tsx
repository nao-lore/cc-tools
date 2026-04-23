import SleepDebt from "./components/SleepDebt";

export default function SleepDebtPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            睡眠負債計算
          </h1>
          <p className="text-sm text-muted mt-1">
            理想睡眠時間との差分から累積睡眠負債を可視化し、回復プランを提案
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <SleepDebt />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">睡眠負債とは</h2>
            <p>
              睡眠負債とは、必要な睡眠時間に対して実際の睡眠時間が不足している時間の累積です。スタンフォード大学の研究によると、睡眠負債は脳・身体機能の低下・免疫力の低下・肥満リスクの上昇と関連しています。1〜2時間の睡眠不足でも積み重なることで大きな影響が出ます。
            </p>
            <h2 className="text-lg font-bold text-foreground">睡眠負債の返済方法</h2>
            <p>
              睡眠負債は週末の「寝だめ」で完全には解消できません。毎日少しずつ（15〜30分）睡眠時間を増やし、2〜3週間かけて徐々に返済するのが効果的とされています。就寝・起床時刻を一定に保つことが重要です。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">睡眠負債計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
