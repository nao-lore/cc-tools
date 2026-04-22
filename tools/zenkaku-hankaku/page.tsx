import Converter from "./components/Converter";

export default function Home() {
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            全角半角変換ツール
          </h1>
          <p className="text-sm text-muted text-center mt-1">
            カタカナ・英数字・記号・スペースを個別に選択して変換
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Converter />

          {/* AdSense Placeholder */}
          <div className="mt-10 border border-dashed border-border rounded-lg p-6 text-center text-muted text-sm bg-accent/30">
            広告スペース (AdSense)
          </div>

          {/* SEO Content */}
          <section className="mt-12 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-semibold text-foreground">
              全角半角変換ツールとは
            </h2>
            <p>
              全角半角変換ツールは、日本語テキスト中の全角文字と半角文字を簡単に相互変換できる無料のオンラインツールです。カタカナ、英数字（アルファベット・数字）、各種記号、スペースをそれぞれ個別に選択して変換できるため、必要な文字種だけをピンポイントで変換することが可能です。
            </p>

            <h2 className="text-lg font-semibold text-foreground">
              主な機能と使い方
            </h2>
            <p>
              テキストを入力エリアに貼り付け、変換したい文字の種類（カタカナ・英数字・記号・スペース）をチェックボックスで選択します。変換方向は「全角→半角」と「半角→全角」の切り替えが可能です。「変換する」ボタンをクリックすると即座に変換結果が表示され、ワンクリックでクリップボードにコピーできます。自動変換モードをオンにすると、入力と同時にリアルタイムで変換結果が更新されます。
            </p>

            <h2 className="text-lg font-semibold text-foreground">
              こんな場面で便利
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                ビジネス文書やメールで全角・半角の統一が必要なとき
              </li>
              <li>
                データ入力やCSVファイルの文字種を揃えたいとき
              </li>
              <li>
                Webフォームへの入力で半角英数字が求められるとき
              </li>
              <li>
                住所やカタカナ氏名の全角・半角変換が必要なとき
              </li>
              <li>
                プログラミングやデータ処理で文字コードを統一したいとき
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">
              対応している文字種
            </h2>
            <p>
              本ツールは以下の文字種の全角・半角変換に対応しています。カタカナは濁音・半濁音・拗音を含むすべてのカタカナに対応し、英数字はA-Z、a-z、0-9の全角・半角を変換します。記号は括弧、感嘆符、疑問符、コロン、セミコロンなど一般的な記号をカバーしています。スペースは全角スペース（U+3000）と半角スペース（U+0020）を相互変換します。すべての処理はブラウザ上で完結するため、入力したテキストが外部に送信されることはありません。安心してご利用ください。
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            全角半角変換ツール — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://furigana-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Furigana</a>
              <a href="https://wareki-converter-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Wareki Converter</a>
              <a href="https://eigyoubi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Eigyoubi</a>
              <a href="https://tax-calculator-lilac-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tax Calculator</a>
              <a href="https://base64-tools-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </>
  );
}
