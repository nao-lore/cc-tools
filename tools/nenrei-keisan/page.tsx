import AgeCalculator from "./components/AgeCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            年齢計算ツール
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            生年月日から満年齢・干支・星座・次の誕生日まで一括計算
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <AgeCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm bg-white">
            <p>広告スペース</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-gray-600">
            <h2 className="text-lg font-bold text-gray-800">年齢計算とは</h2>
            <p>
              年齢計算ツールは、生年月日を入力するだけで満年齢・数え年・干支・星座・生まれてから何日経過したか・次の誕生日まで何日かを瞬時に計算します。手帳やカレンダーを見ながら計算する手間なく、正確な情報を素早く確認できます。
            </p>

            <h2 className="text-lg font-bold text-gray-800">満年齢と数え年の違い</h2>
            <p>
              満年齢とは、生まれた日を0歳とし、誕生日を迎えるたびに1歳加算する現代日本で一般的な数え方です。一方、数え年とは生まれた年を1歳とし、以降は元旦（1月1日）ごとに1歳加算する伝統的な数え方です。お正月や厄年・還暦などの行事では数え年が使われることが多く、満年齢と1〜2歳の差が生じる場合があります。
            </p>

            <h2 className="text-lg font-bold text-gray-800">干支（えと）について</h2>
            <p>
              干支（十二支）は子・丑・寅・卯・辰・巳・午・未・申・酉・戌・亥の12種類で、12年を1周期として繰り返します。生まれ年によって干支が決まり、日本では年賀状や占い、厄年の計算などに広く使われています。本ツールでは生年から自動的に干支を判定します。
            </p>

            <h2 className="text-lg font-bold text-gray-800">星座の算出方法</h2>
            <p>
              西洋占星術の星座（12星座）は、誕生日の月日によって決まります。牡羊座（3/21〜4/19）から魚座（2/19〜3/20）まで12種類あり、生まれた月日を入力するだけで自動的に表示されます。星座は誕生日占いや相性診断などに広く活用されています。
            </p>

            <h2 className="text-lg font-bold text-gray-800">このツールの使い方</h2>
            <p>
              年・月・日のセレクトボックスから生年月日を選択し、「計算する」ボタンを押すだけです。満年齢・数え年・干支・星座・経過日数・次の誕生日までの日数が一度に表示されます。登録不要・完全無料でお使いいただけます。
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            nenrei-keisan — 年齢計算ツール。登録不要・無料。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日計算</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">和暦変換</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">全角半角変換</a>
              <a href="/furigana" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ふりがな変換</a>
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
  "name": "年齢計算ツール",
  "description": "生年月日から満年齢・干支・星座・次の誕生日まで一括計算",
  "url": "https://tools.loresync.dev/nenrei-keisan",
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
