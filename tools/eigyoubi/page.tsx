import { BusinessDaysCalculator } from "./components/BusinessDaysCalculator";

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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-bold text-lg">eigyoubi</span>
          </div>
        </div>
      </header>

      {/* Main Tool */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          営業日数計算ツール
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          日本の祝日・振替休日に完全対応
        </p>

        <BusinessDaysCalculator />

        {/* AdSense Placeholder */}
        <div className="mt-12 mb-8 bg-gray-100 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-xs text-gray-400">広告スペース</p>
        </div>

        {/* SEO Content */}
        <section className="mt-8 prose prose-sm max-w-none">
          <h2 className="text-xl font-bold mb-4">営業日とは</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            営業日とは、企業や官公庁が業務を行う日のことです。一般的に土曜日・日曜日と国民の祝日を除いた平日が営業日となります。ビジネスにおいて「営業日ベースで5日以内」「10営業日以内に納品」といった期限を正確に計算することは、プロジェクト管理や契約遵守において非常に重要です。
          </p>

          <h2 className="text-xl font-bold mb-4">
            営業日数の計算方法
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            営業日数を手計算する場合、カレンダーを見ながら土日と祝日を一つずつ除外していく必要があります。特にゴールデンウィークやお盆、年末年始をまたぐ期間では、振替休日や会社独自の休業日も考慮しなければならず、計算ミスが起こりやすくなります。このツールでは、日本の国民の祝日と振替休日を自動的に除外し、正確な営業日数を瞬時に計算します。
          </p>

          <h2 className="text-xl font-bold mb-4">
            日本の祝日について
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            日本には年間16日の国民の祝日があります。元日、成人の日、建国記念の日、天皇誕生日、春分の日、昭和の日、憲法記念日、みどりの日、こどもの日、海の日、山の日、敬老の日、秋分の日、スポーツの日、文化の日、勤労感謝の日です。祝日が日曜日と重なった場合、その翌日の月曜日が振替休日となります。このツールは2024年から2027年までの全ての祝日と振替休日に対応しています。
          </p>

          <h2 className="text-xl font-bold mb-4">このツールの使い方</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            「期間指定で計算」モードでは、開始日と終了日を選択するだけで営業日数が表示されます。「営業日数から逆算」モードでは、開始日と営業日数を入力すると、その営業日数後の日付を計算します。納期の逆算やスケジュール作成に便利です。さらに、会社独自の休業日がある場合は「カスタム休日」機能で追加でき、より正確な計算が可能です。カレンダー表示で期間内の営業日・休日を視覚的に確認することもできます。
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            eigyoubi — 営業日数計算ツール。登録不要・無料。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Wareki Converter</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tax Calculator</a>
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Zenkaku Hankaku</a>
              <a href="/furigana" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Furigana</a>
              <a href="/timezone-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timezone Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "営業日数計算ツール",
  "description": "日本の祝日・振替休日に完全対応",
  "url": "https://tools.loresync.dev/eigyoubi",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
