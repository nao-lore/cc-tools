import TodayDate from "./components/TodayDate";
import WarekiConverter from "./components/WarekiConverter";
import AgeTable from "./components/AgeTable";
import SeoContent from "./components/SeoContent";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗓️</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                和暦西暦変換ツール
              </h1>
              <p className="text-xs text-gray-500">
                令和・平成・昭和・大正・明治対応 | 年齢早見表・干支付き
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 今日の日付 */}
        <TodayDate />

        {/* 変換ツール */}
        <WarekiConverter />

        {/* 年齢早見表 */}
        <AgeTable />

        {/* AdSense プレースホルダー */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* SEOコンテンツ */}
        <SeoContent />
      </main>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            和暦西暦変換ツール — 登録不要・無料。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://eigyoubi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Eigyoubi</a>
              <a href="https://zenkaku-hankaku.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Zenkaku Hankaku</a>
              <a href="https://furigana-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Furigana</a>
              <a href="https://tax-calculator-lilac-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tax Calculator</a>
              <a href="https://timezone-converter-rouge-two.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timezone Converter</a>
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
