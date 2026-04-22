import TategakiConverter from "./components/TategakiConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              縦
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">縦書き変換ツール</h1>
              <p className="text-xs text-gray-500">横書きテキストを縦書きプレビューに変換</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TategakiConverter />

        {/* AdSense Placeholder */}
        <div className="mt-10 p-4 bg-gray-100 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">縦書きとは</h2>
            <p>
              縦書きとは、文字を上から下へと並べ、行を右から左へ進める日本語の伝統的な書き方です。
              古来より書物や新聞、雑誌などで広く使われてきた表記方法で、縦組みとも呼ばれます。
              特に小説や詩、手紙など、日本語の文学・文化表現において縦書きは今でも重要な役割を担っています。
              横書きが主流のデジタル環境においても、縦書きは日本語の美しさと伝統を感じさせる表現として根強い人気があります。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">このツールの使い方</h2>
            <p>
              このツールを使えば、普段横書きで入力したテキストを簡単に縦書きプレビューで確認できます。
              テキストエリアに文章を入力すると、リアルタイムで縦書き表示が更新されます。
              フォントは明朝体またはゴシック体から選択でき、文字サイズや行間もスライダーで自由に調整できます。
              また、原稿用紙風の20×20マス表示モードに切り替えると、原稿用紙のような格子状のグリッド上に文字を配置して確認できます。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">縦書きの活用シーン</h2>
            <p>
              縦書きは、小説・随筆・詩などの文学作品の執筆、年賀状や暑中見舞いなどの挨拶状、
              式典の案内状や冠婚葬祭の文書など、さまざまな場面で活用されます。
              また、Webサイトやデジタルコンテンツのデザインにおいても、縦書きを取り入れることで
              日本的な雰囲気や趣のある表現が可能です。
              このツールで縦書きレイアウトをプレビューしながら、原稿の仕上がりイメージを確認してみてください。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">原稿用紙風表示について</h2>
            <p>
              原稿用紙風表示モードをオンにすると、20×20マスの原稿用紙レイアウトで文字を確認できます。
              400字詰め原稿用紙を模したグリッド上に1文字ずつ配置されるため、原稿用紙に書いたときの
              仕上がりイメージを掴むのに最適です。
              小説や作文の下書き、文字数の目安を把握したい場合などにご活用ください。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">縦書き変換ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://zenkaku-hankaku.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">全角半角変換</a>
              <a href="https://wareki-converter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">和暦変換</a>
              <a href="https://word-counter-seven-khaki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">文字数カウント</a>
              <a href="https://eigyoubi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">営業日計算</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
