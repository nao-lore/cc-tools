import HeartRateTarget from "./components/HeartRateTarget";

export default function HeartRateTargetPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            目標心拍数ゾーン計算
          </h1>
          <p className="text-sm text-muted mt-1">
            年齢と安静時心拍数から5段階のトレーニングゾーンを計算（カルボーネン法）
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <HeartRateTarget />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">カルボーネン法とは</h2>
            <p>
              カルボーネン法は最大心拍数と安静時心拍数の差（心拍予備量）を利用してトレーニング強度を計算する方法です。単純な最大心拍数のパーセンテージより個人差を反映しやすいとされています。目標心拍数 = (最大心拍数 - 安静時心拍数) × 強度% + 安静時心拍数
            </p>
            <h2 className="text-lg font-bold text-foreground">各ゾーンの効果</h2>
            <p>
              ゾーン1〜2（50〜70%）は脂肪燃焼・回復走に最適です。ゾーン3（70〜80%）は有酸素能力向上、ゾーン4（80〜90%）は乳酸閾値向上、ゾーン5（90〜100%）は最大酸素摂取量（VO2max）の向上が期待できます。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">目標心拍数ゾーン計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
