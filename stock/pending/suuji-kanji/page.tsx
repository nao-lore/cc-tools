import SuujiKanjiConverter from "./components/SuujiKanjiConverter";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔢</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                数字漢字変換
              </h1>
              <p className="text-xs text-gray-500">
                通常漢数字・大字・位取り式・金額表示に対応 | 逆変換（漢数字→数字）付き
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <SuujiKanjiConverter />

        {/* AdSense プレースホルダー */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* SEO コンテンツ */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 text-sm text-gray-600">
          <h2 className="font-bold text-gray-800 text-base">数字漢字変換とは</h2>
          <p>
            算用数字（アラビア数字）を漢数字・大字に変換するツールです。
            領収書・契約書・小切手などの金額記入、公式文書の数字表記に活用できます。
          </p>
          <h3 className="font-bold text-gray-700">大字（だいじ）とは</h3>
          <p>
            大字は漢数字の改ざん防止版です。「一」→「壱」、「二」→「弐」、「三」→「参」のように
            画数が多い字体を使うことで、書き換えを防ぎます。銀行・法的書類で使われます。
          </p>
          <h3 className="font-bold text-gray-700">金額表示の書き方</h3>
          <p>
            「金〇〇円也」の形式は小切手・領収書の正式表記です。
            末尾の「也（なり）」はそれ以上の端数がないことを示します。
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            数字漢字変換 — 登録不要・無料。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://wareki-converter.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">全角半角変換</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">消費税計算</a>
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
