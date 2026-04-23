import RinyuushokuGuide from "./components/RinyuushokuGuide";

export default function RinyuushokuPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            離乳食 進度判定
          </h1>
          <p className="text-sm text-muted mt-1">
            月齢に応じた離乳食の段階と食べられる食材・注意食材をガイド
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <RinyuushokuGuide />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">離乳食の進め方</h2>
            <p>
              離乳食は生後5〜6ヶ月頃から開始します。初期（5〜6ヶ月）はなめらかなペースト状から始め、中期（7〜8ヶ月）は舌でつぶせる固さ、後期（9〜11ヶ月）は歯茎でつぶせる固さ、完了期（12〜18ヶ月）は幼児食に移行します。
            </p>
            <h2 className="text-lg font-bold text-foreground">アレルゲン食材の注意</h2>
            <p>
              卵・乳・小麦・そば・落花生などはアレルギーを起こしやすい食材です。初めて与える食材は少量から始め、異変がないか観察しましょう。本ツールの情報は一般的なガイドラインに基づくものです。お子様の状態に合わせて小児科医にご相談ください。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">離乳食進度判定 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
