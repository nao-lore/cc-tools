import TimestampConverter from "./components/TimestampConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              時
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">日時変換ツール</h1>
              <p className="text-xs text-gray-500">Unix時間⇔日本時間・和暦の相互変換</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TimestampConverter />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Unixタイムスタンプとは</h2>
            <p>
              Unixタイムスタンプ（Unix時間・エポック時間）は、1970年1月1日00:00:00 UTC（Unixエポック）から経過した秒数を表す数値です。
              タイムゾーンに依存しないため、システム間でのデータのやり取りやログの記録、データベースへの保存に広く使われています。
              Webアプリ・モバイルアプリ・サーバーサイドの開発では欠かせない基本知識です。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">日本時間（JST）との関係</h2>
            <p>
              日本標準時（JST）はUTCより9時間進んでいます（UTC+9）。
              Unixタイムスタンプ自体はタイムゾーン情報を持たないUTCベースの値ですが、
              このツールでは日本時間に換算した形でわかりやすく表示します。
              「日時→タイムスタンプ」変換では入力値をJSTとして解釈し、正確なUnix時間に変換します。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">和暦（元号）表示について</h2>
            <p>
              このツールは令和・平成・昭和・大正・明治の和暦表示に対応しています。
              行政書類や日本固有のシステムで日付を和暦で表示したい場合にも活用できます。
              入力したUnixタイムスタンプが対応する元号・年号・月日・時刻を自動で表示します。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">秒とミリ秒の違い</h2>
            <p>
              Unixタイムスタンプは通常「秒」単位の10桁の数値ですが、JavaScriptの{" "}
              <code className="bg-gray-100 px-1 rounded font-mono">Date.now()</code> や
              一部のAPIでは「ミリ秒」単位の13桁が返ってきます。
              ミリ秒モードをオンにすると、13桁のタイムスタンプをそのまま貼り付けて変換できます。
              桁数が10桁より多い場合は自動的にミリ秒として判定します。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">このツールの使い方</h2>
            <p>
              「現在時刻を取得」ボタンで今この瞬間のタイムスタンプを入力欄に自動入力できます。
              タイムスタンプ入力欄に数値を貼り付けると、JST・UTC・ISO 8601・和暦・相対時間に即座に変換されます。
              逆に日付・時刻を入力すれば、対応するUnixタイムスタンプを取得できます。
              各出力値はコピーボタンで1クリックでクリップボードにコピーできます。
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">日時変換ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">関連ツール</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://epoch-converter-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">Epoch Converter (EN)</a>
              <a href="/wareki-converter" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">和暦変換</a>
              <a href="/cron-generator" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">Cron Generator</a>
              <a href="/timezone-converter" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">Timezone Converter</a>
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
