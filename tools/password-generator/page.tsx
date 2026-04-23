import PasswordGenerator from "./components/PasswordGenerator";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          パスワード生成ツール
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          安全で強力なパスワードをワンクリックで自動生成。
          強度チェックとエントロピー表示で、パスワードの安全性を確認できます。
        </p>
      </div>

      {/* Generator */}
      <div className="px-4 pb-8">
        <PasswordGenerator />
      </div>

      {/* AdSense placeholder */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div
          className="rounded-lg border border-dashed p-8 text-center text-sm opacity-30"
          style={{ borderColor: "var(--border)" }}
        >
          広告スペース
        </div>
      </div>

      {/* SEO content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <article
          className="rounded-xl p-6 sm:p-8 border space-y-6 text-sm leading-relaxed opacity-80"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <section>
            <h2 className="text-lg font-bold mb-2">
              なぜ強いパスワードが必要なのか
            </h2>
            <p>
              インターネット上でのセキュリティ脅威は年々増加しています。弱いパスワードは、ブルートフォース攻撃や辞書攻撃によって短時間で突破されてしまいます。例えば、8文字の小文字のみのパスワードは数秒で解読される可能性があります。一方、大文字・小文字・数字・記号を組み合わせた16文字以上のパスワードは、現在のコンピュータ技術では解読に数百年以上かかると言われています。個人情報や資産を守るためには、十分な長さと複雑さを持つパスワードが不可欠です。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">安全なパスワードの作り方</h2>
            <p>
              安全なパスワードを作るためのポイントは以下の通りです。まず、パスワードの長さは最低でも12文字以上を推奨します。大文字・小文字・数字・記号をすべて含めることで、文字の組み合わせパターンが飛躍的に増加します。また、名前や誕生日、辞書に載っている単語をそのまま使用することは避けてください。このツールのようなランダム生成ツールを使うことで、人間の癖やパターンに依存しない、真にランダムなパスワードを作成できます。生成したパスワードはパスワードマネージャーに保存することを強くお勧めします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">セキュリティのヒント</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>サービスごとに異なるパスワードを使用する</li>
              <li>パスワードマネージャーを活用して管理する</li>
              <li>二要素認証（2FA）を有効にする</li>
              <li>定期的にパスワードを変更する</li>
              <li>
                フィッシングメールやSMSに注意し、不審なリンクからパスワードを入力しない
              </li>
              <li>公共のWi-Fiでは重要なアカウントへのログインを控える</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">
              このツールのセキュリティについて
            </h2>
            <p>
              このパスワード生成ツールはすべての処理をブラウザ上で行います。生成されたパスワードがサーバーに送信されることは一切ありません。暗号学的に安全な乱数生成器（Web
              Crypto
              API）を使用しており、予測困難なランダムパスワードを生成します。安心してご利用ください。
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Password Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/hash-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
              <a href="/uuid-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">UUID Generator</a>
              <a href="/qr-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">QR Generator</a>
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/chmod-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Chmod Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
