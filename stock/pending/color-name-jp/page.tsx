import TraditionalColors from "./components/TraditionalColors";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            日本の伝統色
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            200色以上の和色カラーコード一覧。色名・読み・HEXコード付き。
            季節別・色相別に絞り込み、クリックで詳細を確認できます。
          </p>
        </div>

        {/* Main Tool */}
        <TraditionalColors />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            日本の伝統色とは
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            日本の伝統色（和色）とは、日本古来より使われてきた色の総称です。
            自然の草木・鉱物・動物などから染め出された色々に、情緒豊かな名前が付けられています。
            「紅」「藍」「萌黄」など、日本人の美意識と自然観が反映された色の体系です。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            季節と伝統色
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            日本の伝統色は四季と深く結びついています：
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li><strong>春</strong> — 桜色・萌黄色・若葉色など、生命の芽吹きを感じる淡い色</li>
            <li><strong>夏</strong> — 浅葱色・水色・空色など、涼しさを感じる青系の色</li>
            <li><strong>秋</strong> — 柿色・茜色・朽葉色など、紅葉を思わせる温かみのある色</li>
            <li><strong>冬</strong> — 銀色・紺色・深緑など、静寂と落ち着きを感じる色</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            デザインへの活用
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            和色はWebデザイン・グラフィックデザイン・ファッションなど様々な場面で活用されています。
            HEXコードとRGB値を確認してコピーできるので、デザインツールやCSSへの直接入力が可能です。
            和風・日本的な雰囲気を表現したい時に、伝統色を取り入れてみてください。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            色名の由来
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            日本の伝統色の名前は、染料の原料（茜・藍・紅花など）、
            自然の草花・動物・季節の情景（桜・梅・鶯など）、
            または歴史的な人物・地名（江戸紫・京紫・利休色など）に由来するものが多くあります。
            各色の説明欄で、その色の由来や背景を確認できます。
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">日本の伝統色 — 無料の和色カラーコード検索ツール</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">関連ツール</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/color-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">カラーコード変換</a>
              <a href="https://color-palette-azure.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">カラーパレット生成</a>
              <a href="/css-gradient" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSSグラデーション</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ 無料ツール →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
