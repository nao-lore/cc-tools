import FuriganaConverter from "./components/FuriganaConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              振
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ふりがな変換ツール</h1>
              <p className="text-xs text-gray-500">漢字にふりがなを自動付与</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <FuriganaConverter />

        {/* AdSense Placeholder */}
        <div className="mt-10 p-4 bg-gray-100 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">ふりがなとは</h2>
            <p>
              ふりがな（振り仮名）とは、漢字の読み方を示すために漢字の上や横に付けるひらがなのことです。
              ルビとも呼ばれ、日本語の文章において読み手の理解を助ける重要な役割を持っています。
              特に小学生や日本語学習者にとって、ふりがなは漢字の読み方を学ぶための大切な手がかりとなります。
              新聞や教科書、公的文書など、幅広い場面でふりがなが使用されています。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">このツールの使い方</h2>
            <p>
              このふりがな変換ツールは、入力されたテキスト内の漢字に自動でふりがなを付与します。
              使い方はとても簡単です。テキスト入力欄に日本語の文章を入力し、出力形式を選択して「ふりがなを変換する」ボタンを押すだけです。
              出力形式は3種類から選べます。HTMLのrubyタグ形式はウェブページに直接使え、漢字の上にふりがなが表示されます。
              括弧表示は漢字の後ろに括弧でひらがなを表示する形式で、メールやテキストファイルに適しています。
              ひらがなのみの形式は、すべての漢字をひらがなに変換して出力します。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">教育での活用</h2>
            <p>
              ふりがなは日本の教育現場で広く活用されています。
              小学校では学年ごとに習う漢字が決まっており、まだ習っていない漢字にはふりがなを付けるのが一般的です。
              また、日本語を外国語として学ぶ学習者にとっても、ふりがなは漢字の読み方を覚えるための重要なツールです。
              このツールを使えば、教材の作成や学習資料の準備が効率的に行えます。
              読書指導やテスト作成、プリント教材の作成など、さまざまな教育場面でご活用いただけます。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">対応している漢字について</h2>
            <p>
              このツールは内蔵辞書に500語以上の一般的な漢字熟語の読みを収録しています。
              日常的によく使われる単語を中心に収録しているため、一般的な文章であれば多くの漢字に正確なふりがなを付けることができます。
              辞書にない漢字はそのまま表示されます。より高度な変換（固有名詞の読み分けや文脈による読み分けなど）が必要な場合は、
              サーバーサイドの形態素解析を用いた変換をご検討ください。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">ふりがな変換ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">全角半角変換</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日計算</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">税金計算</a>
              <a href="/word-counter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">文字数カウント</a>
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
