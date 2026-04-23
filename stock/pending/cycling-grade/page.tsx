import CyclingGrade from "./components/CyclingGrade";

export default function CyclingGradePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            サイクリング 勾配・消費カロリー計算
          </h1>
          <p className="text-sm text-muted mt-1">
            距離・標高差・体重・走行時間から勾配・消費カロリー・平均パワーを計算
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <CyclingGrade />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">勾配の計算方法</h2>
            <p>
              勾配（%）は「標高差 ÷ 水平距離 × 100」で求められます。例えば水平距離1000mで標高差80mなら勾配8%です。ヒルクライムの難易度の目安として、3%以下は緩坂、5〜8%は中級、10%以上は急坂とされています。
            </p>
            <h2 className="text-lg font-bold text-foreground">消費カロリーとパワー</h2>
            <p>
              自転車での消費カロリーは速度・体重・風の抵抗・勾配によって変化します。平均パワー（ワット）は体重あたりのワット数（W/kg）でサイクリストの実力を比較する指標として使われます。プロ選手の登坂パワーは6W/kg前後、一般サイクリストは2〜3W/kgが目安です。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">サイクリング勾配・消費カロリー計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
