import NengouTable from "./components/NengouTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                年号早見表
              </h1>
              <p className="text-xs text-gray-500">
                明治・大正・昭和・平成・令和 — 西暦⇔和暦 対照表・年齢早見
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* メインコンポーネント */}
        <NengouTable />

        {/* AdSense プレースホルダー */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* SEOコンテンツ */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5 text-sm text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">年号早見表とは</h2>
            <p>
              明治元年（1868年）から令和現在（2026年）まで、日本の元号（和暦）と西暦の対照表です。
              生まれ年からの現在年齢も一覧で確認できます。
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">各元号の期間</h2>
            <ul className="space-y-1">
              <li><span className="font-semibold text-purple-700">令和</span>：2019年（令和元年）〜現在</li>
              <li><span className="font-semibold text-blue-700">平成</span>：1989年（平成元年）〜2019年（平成31年）</li>
              <li><span className="font-semibold text-green-700">昭和</span>：1926年（昭和元年）〜1989年（昭和64年）</li>
              <li><span className="font-semibold text-orange-700">大正</span>：1912年（大正元年）〜1926年（大正15年）</li>
              <li><span className="font-semibold text-red-700">明治</span>：1868年（明治元年）〜1912年（明治45年）</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">よくある使い方</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>履歴書や書類への記入時に西暦⇔和暦を確認</li>
              <li>生まれ年から現在の年齢を素早く調べる</li>
              <li>「昭和何年生まれは何歳？」をすぐ確認</li>
              <li>元号が変わった年（改元年）の確認</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-2">改元の覚え方</h2>
            <p>
              元年は各元号のスタート年。平成元年＝1989年、令和元年＝2019年。
              改元年（例：昭和64年＝平成元年＝1989年）は同じ年に2つの年号が存在します。
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            年号早見表 — 登録不要・無料。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://wareki-converter.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦西暦変換</a>
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Eigyoubi</a>
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Zenkaku Hankaku</a>
              <a href="/furigana" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Furigana</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tax Calculator</a>
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
