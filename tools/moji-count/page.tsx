import { MojiCounter } from "./components/MojiCounter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[var(--color-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="font-bold text-lg">moji-count</span>
          </div>
        </div>
      </header>

      {/* Main Tool */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          文字数カウント
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          日本語テキストの文字数・バイト数・文字種別を瞬時に計測
        </p>

        <MojiCounter />

        {/* AdSense Placeholder */}
        <div className="mt-12 mb-8 bg-gray-100 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-xs text-gray-400">広告スペース</p>
        </div>

        {/* SEO Content */}
        <section className="mt-8 prose prose-sm max-w-none">
          <h2 className="text-xl font-bold mb-4">文字数カウントツールとは</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            文字数カウントツールは、入力したテキストの文字数・単語数・行数・段落数・バイト数などをリアルタイムで計測するWebツールです。ブログ記事・SNS投稿・メール・書類作成など、文字数制限がある場面で活躍します。登録不要・インストール不要でブラウザ上ですぐ使えます。
          </p>

          <h2 className="text-xl font-bold mb-4">スペースあり・なしの違い</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            「文字数（スペースあり）」は空白・改行を含むすべての文字をカウントした数です。「文字数（スペースなし）」は空白・タブ・改行などの空白文字を除いた実質的な文字数です。Twitterや各種SNSの文字数制限は空白込みでカウントされることが多く、ビジネス文書では本文量の把握にスペースなしカウントが便利です。
          </p>

          <h2 className="text-xl font-bold mb-4">バイト数（UTF-8・Shift_JIS）について</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            文字数とバイト数は異なります。UTF-8では日本語の1文字が3バイト、Shift_JISでは2バイトとして扱われます。データベースのフィールド長制限・メール送信・ファイルサイズの見積もりでは文字数ではなくバイト数が重要になります。このツールではUTF-8とShift_JISの両方のバイト数を同時に確認できます。
          </p>

          <h2 className="text-xl font-bold mb-4">全角・半角・文字種別の計測</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            日本語テキストには全角文字（ひらがな・カタカナ・漢字・全角記号）と半角文字（英数字・半角記号・半角カタカナ）が混在します。印刷物や表組みでは全角・半角の違いがレイアウトに影響します。ひらがな・カタカナ・漢字・英数字の内訳を確認することで、文章の読みやすさや日本語比率のチェックにも活用できます。
          </p>

          <h2 className="text-xl font-bold mb-4">活用シーン</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            文字数カウントが役立つ場面は多岐にわたります。Twitterの140文字制限・Instagramのキャプション・note記事の文字数確認、SEOを意識したメタディスクリプションの最適化（120〜160文字）、履歴書・職務経歴書の字数制限確認、SMS送信時のバイト数確認、小説・文芸作品の原稿枚数管理、コーディングのコメント文字数チェックなど、さまざまな用途で使えます。
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            moji-count — 文字数カウントツール。登録不要・無料。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Zenkaku Hankaku</a>
              <a href="/furigana" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Furigana</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Wareki Converter</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tax Calculator</a>
              <a href="/timezone-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timezone Converter</a>
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
