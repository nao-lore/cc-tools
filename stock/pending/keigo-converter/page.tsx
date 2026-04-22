import KeigoConverter from "./components/KeigoConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              敬
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">敬語変換ツール</h1>
              <p className="text-xs text-gray-500">尊敬語・謙譲語・丁寧語に自動変換</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <KeigoConverter />

        {/* AdSense Placeholder */}
        <div className="mt-10 p-4 bg-gray-100 border border-dashed border-gray-300 rounded-xl text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">敬語とは</h2>
            <p>
              敬語とは、話し手が相手や話題の人物に対して敬意を表すために使う特別な言葉遣いです。
              日本語の敬語は大きく「尊敬語」「謙譲語」「丁寧語」の3種類に分けられます。
              ビジネスシーンやフォーマルな場面では、適切な敬語を使うことが相手への礼節を示す大切な手段となります。
              メールや電話対応、会議など、様々な場面で正しい敬語の使い方が求められます。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">尊敬語・謙譲語・丁寧語の違い</h2>
            <p>
              <strong>尊敬語</strong>は相手や目上の人の動作・状態を高めて表現するための敬語です。
              「行く→いらっしゃる」「言う→おっしゃる」「食べる→召し上がる」などが代表的な例です。
              相手が主語になる場面で使います。
            </p>
            <p className="mt-2">
              <strong>謙譲語</strong>は自分や身内の動作をへりくだって表現することで、相手を相対的に高める敬語です。
              「行く→参る」「言う→申す」「見る→拝見する」などが代表例で、自分が主語になる場面で使います。
            </p>
            <p className="mt-2">
              <strong>丁寧語</strong>は「ます・です」を使って丁寧に表現する最も基本的な敬語です。
              主語に関わらず汎用的に使えるため、日常のビジネス会話に適しています。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">このツールの使い方</h2>
            <p>
              テキスト入力欄に普通の日本語文章を入力し、「3パターンに変換する」ボタンを押すだけです。
              尊敬語・謙譲語・丁寧語の3種類が同時に表示されます。
              変換された部分は黄色のハイライトで視覚的に確認でき、各パターンをワンクリックでコピーできます。
              ビジネスメールや報告書の作成時に、適切な敬語表現の参考としてご活用ください。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">ビジネスでよく使う敬語の例</h2>
            <p>
              「確認する→ご確認いたします」「連絡する→ご連絡申し上げます」「送る→お送りします」など、
              ビジネスメールで頻繁に使われる表現を多数収録しています。
              また「行く・来る→いらっしゃる/参る」「言う→おっしゃる/申す」「見る→ご覧になる/拝見する」など、
              基本的な動詞の敬語形も網羅しています。
              日々のビジネスコミュニケーションに役立ててください。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">敬語変換ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://furigana-converter.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">ふりがな変換</a>
              <a href="https://zenkaku-hankaku.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">全角半角変換</a>
              <a href="https://wareki-converter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">和暦変換</a>
              <a href="https://word-counter-seven-khaki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">文字数カウント</a>
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
