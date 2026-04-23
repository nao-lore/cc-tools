import KyuujitaiConverter from "./components/KyuujitaiConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              旧
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">旧字体変換ツール</h1>
              <p className="text-xs text-gray-500">新字体と旧字体を相互変換</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <KyuujitaiConverter />

        {/* AdSense Placeholder */}
        <div className="mt-10 p-4 bg-gray-100 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">旧字体とは</h2>
            <p>
              旧字体（きゅうじたい）とは、1946年に告示された当用漢字表以前に使われていた、画数が多く複雑な字形の漢字のことです。
              現在一般的に使われているのは新字体（しんじたい）と呼ばれる簡略化された字形で、旧字体は歴史的・伝統的な文章や文学作品、
              神社仏閣の扁額、書道などで今も使用されています。
              たとえば「学」の旧字体は「學」、「国」は「國」のように、旧字体はより多くの画数を持つのが特徴です。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">このツールの使い方</h2>
            <p>
              このツールは、新字体と旧字体を相互に変換します。まず変換方向を「新字体→旧字体」または「旧字体→新字体」から選択してください。
              次にテキスト入力欄に変換したい文章を入力し、「変換する」ボタンを押すと結果が表示されます。
              変換された文字はオレンジ色でハイライトされるので、どの文字が変換されたかひと目でわかります。
              変換結果はコピーボタンで簡単にコピーできます。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">旧字体が使われる場面</h2>
            <p>
              旧字体は現代日本語の日常生活では使われなくなりましたが、さまざまな場面で今も目にすることがあります。
              戦前・戦中に発行された書籍や新聞、公文書などには旧字体が使われています。
              また、神社や寺院の看板・扁額、伝統的な書道作品、家紋や印鑑などにも旧字体が用いられることがあります。
              さらに人名や地名として旧字体が正式な表記として残っているケースも多く、
              戸籍や公的書類では旧字体が使われることがあります。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">収録している変換辞書について</h2>
            <p>
              このツールには200組以上の新旧字体マッピングが内蔵されています。
              常用漢字を中心に、よく使われる旧字体との対応関係を収録しています。
              1文字ずつ変換するため、熟語の読み方は考慮せず字形のみを変換します。
              すべての漢字に旧字体・新字体の対応があるわけではなく、対応する字形がない文字はそのまま出力されます。
              辞書にない文字はそのまま保持されますので、変換漏れが生じることがあります。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">旧字体変換ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/zenkaku-hankaku" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">全角半角変換</a>
              <a href="/wareki-converter" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">和暦変換</a>
              <a href="/eigyoubi" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">営業日計算</a>
              <a href="/tax-calculator" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">税金計算</a>
              <a href="/word-counter" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">文字数カウント</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
