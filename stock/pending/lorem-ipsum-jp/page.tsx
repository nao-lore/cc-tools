import LoremIpsumJp from "./components/LoremIpsumJp";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            日本語ダミーテキスト生成
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            文字数・段落数・文体を指定して日本語ダミーテキストを生成。
            Webデザインやモックアップ制作に。
          </p>
        </div>

        {/* Main Tool */}
        <LoremIpsumJp />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            日本語ダミーテキストとは
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Webサイトやアプリのデザイン・モックアップ制作時に使用する、意味のない仮のテキストです。
            英語のLorem Ipsumに相当する日本語版として、レイアウト確認やフォント選定に役立ちます。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            文体の選択
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            「である調」はフォーマルな文書・記事・論文調の印象を与えます。
            「ですます調」は一般的なWebサイトやブログ、ビジネス文書に適しています。
            用途に合わせて文体を切り替えてご利用ください。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            使い方
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            文字数スライダーで生成する文字数（100〜5000字）を指定し、
            段落数（1〜20段落）と文体を選択して「生成」ボタンを押すだけです。
            生成されたテキストは右上のコピーボタンでクリップボードにコピーできます。
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">日本語ダミーテキスト生成 — 無料のテキスト生成ツール</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">関連ツール</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://text-counter-jp.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">文字数カウント</a>
              <a href="https://markdown-preview-jp.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdownプレビュー</a>
              <a href="https://text-diff-jp.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">テキスト差分比較</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ 無料ツール →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
