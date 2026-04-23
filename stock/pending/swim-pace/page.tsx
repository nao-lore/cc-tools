import SwimPace from "./components/SwimPace";

export default function SwimPacePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            水泳ペース計算
          </h1>
          <p className="text-sm text-muted mt-1">
            距離とタイムから100mペース・ラップ・スプリットを自動計算
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <SwimPace />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">水泳のペース管理</h2>
            <p>
              水泳では100mあたりのタイムをペースの基準とします。例えば1500m自由形を25分で泳いだ場合、100mペースは1分40秒（1:40/100m）です。ペースを把握することで一定のペースを維持するネガティブスプリット（後半加速）戦略が立てやすくなります。
            </p>
            <h2 className="text-lg font-bold text-foreground">プール別の換算</h2>
            <p>
              25mプール（短水路）と50mプール（長水路）ではターン回数が異なるため、実際のタイムに差が出ます。一般的に短水路のタイムは長水路より1〜2%速くなります。本ツールでは距離とタイムをそのまま入力して使用してください。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">水泳ペース計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
