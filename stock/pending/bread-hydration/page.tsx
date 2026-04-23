import BreadHydration from "./components/BreadHydration";

export default function BreadHydrationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            パン加水率計算
          </h1>
          <p className="text-sm text-muted mt-1">
            粉量から水分量を逆算。パン種類別の推奨加水率を参考に最適な生地を作ろう
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <BreadHydration />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">加水率とは</h2>
            <p>
              加水率とは、粉の重量に対して加える水の割合をパーセントで表したものです。例えば粉300gに水210gを加える場合、加水率は70%になります。加水率が高いほど生地はやわらかく気泡が大きくなり、低いほど密度の高いしっとりした食感になります。
            </p>
            <h2 className="text-lg font-bold text-foreground">種類別の目安</h2>
            <p>
              食パンは65〜70%、バゲットやカンパーニュなどのハード系は70〜80%、フォカッチャは75〜85%が一般的な目安です。高加水パンは成形が難しい反面、内側の気泡が大きくなりトースト時のパリッと感が増します。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">パン加水率計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
