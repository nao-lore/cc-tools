import MojicodeConverter from "./components/MojicodeConverter";

export default function Home() {
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            文字コード変換ツール
          </h1>
          <p className="text-sm text-muted text-center mt-1">
            UTF-8 / Shift_JIS / EUC-JP / UTF-16 のバイト列を確認・変換
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <MojicodeConverter />

          {/* AdSense Placeholder */}
          <div className="mt-10 border border-dashed border-border rounded-lg p-6 text-center text-muted text-sm bg-accent/30">
            広告スペース (AdSense)
          </div>

          {/* SEO Content */}
          <section className="mt-12 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-semibold text-foreground">
              文字コード変換ツールとは
            </h2>
            <p>
              文字コード変換ツールは、日本語テキストをUTF-8・Shift_JIS・EUC-JP・UTF-16などの各エンコーディングでバイト列として表示できる無料のオンラインツールです。各文字が異なる文字コードでどのように表現されるかを16進数（hex）で確認できるため、文字化けの原因調査やエンコーディングの学習に役立ちます。
            </p>

            <h2 className="text-lg font-semibold text-foreground">
              主な機能と使い方
            </h2>
            <p>
              テキスト入力エリアに調べたい文字や文章を入力すると、UTF-8・Shift_JIS・EUC-JP・UTF-16の4種類のエンコーディングそれぞれのバイト列が16進数で表示されます。各エンコーディングのバイト数も確認でき、「コピー」ボタンで変換結果をクリップボードにコピーできます。また、入力テキストのエンコーディングを自動判定する機能も搭載しています。すべての処理はブラウザ上で完結するため、入力したテキストが外部に送信されることはありません。
            </p>

            <h2 className="text-lg font-semibold text-foreground">
              各文字コードの特徴
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                UTF-8: 現在最も広く使われるエンコーディング。ASCII互換で、日本語は3バイトで表現されます
              </li>
              <li>
                Shift_JIS: Windowsや古い日本語システムで広く使われてきたエンコーディング。日本語は2バイトで表現されます
              </li>
              <li>
                EUC-JP: Unix/Linux系システムで使われてきたエンコーディング。日本語は2〜3バイトで表現されます
              </li>
              <li>
                UTF-16: JavaやWindowsの内部表現で使われるエンコーディング。日本語は基本的に2バイトで表現されます
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">
              こんな場面で便利
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                文字化けの原因を調査したいとき
              </li>
              <li>
                異なるシステム間でのデータ連携時にエンコーディングを確認したいとき
              </li>
              <li>
                プログラミングで文字列のバイト長を確認したいとき
              </li>
              <li>
                レガシーシステムとのデータ変換でShift_JISやEUC-JPのバイト列を確認したいとき
              </li>
              <li>
                文字コードの学習や教育目的でバイト表現を視覚的に確認したいとき
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            文字コード変換ツール — Free online tool. No signup required.
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
