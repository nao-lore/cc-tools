import { DaysCalculator } from "./components/DaysCalculator";

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
            <span className="font-bold text-lg">nissuu-keisan</span>
          </div>
        </div>
      </header>

      {/* Main Tool */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          日数計算ツール
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          2つの日付間の日数・期間を計算。○日後・○日前の日付も即座に算出。
        </p>

        <DaysCalculator />

        {/* AdSense Placeholder */}
        <div className="mt-12 mb-8 bg-gray-100 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-xs text-gray-400">広告スペース</p>
        </div>

        {/* SEO Content */}
        <section className="mt-8 prose prose-sm max-w-none">
          <h2 className="text-xl font-bold mb-4">日数計算とは</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            日数計算とは、2つの日付の間に何日あるかを調べたり、ある日付から指定した日数だけ前後した日付を求める計算です。誕生日まで何日か、契約期限まであと何日か、プロジェクト開始から何日経過したかなど、日常生活やビジネスで頻繁に必要になる計算です。
          </p>

          <h2 className="text-xl font-bold mb-4">このツールで計算できること</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            「2つの日付間の日数」モードでは、開始日と終了日を入力するだけで、日数・週数・月数・年数・時間数・分数・秒数をまとめて表示します。期間内に含まれる日本の祝日も一覧表示されるため、スケジュール確認に便利です。「○日後・○日前の日付」モードでは、基準日と日数を入力することで、指定した日数後または日数前の日付を瞬時に計算できます。
          </p>

          <h2 className="text-xl font-bold mb-4">日数計算の主な使い道</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            日数計算は様々な場面で活用されます。契約書や規約の「30日以内」「90日以内」といった期限の確認、試用期間や保証期間の計算、記念日や誕生日までのカウントダウン、プロジェクトの経過日数・残日数の把握、ローンや定期預金の期間計算など、正確な日数把握が求められる場面は多くあります。
          </p>

          <h2 className="text-xl font-bold mb-4">日本の祝日について</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            このツールは2024年から2027年までの日本の国民の祝日・振替休日に対応しています。期間内に祝日が含まれる場合は自動的に一覧表示されます。祝日が日曜日と重なる場合の振替休日も含めて正確に表示されます。
          </p>

          <h2 className="text-xl font-bold mb-4">このツールの使い方</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            「2つの日付間の日数」モードでは、開始日と終了日を選択するだけで自動的に計算結果が表示されます。日数だけでなく、週数・月数・年数・時間数など複数の単位で同時に確認できます。「○日後・○日前の日付」モードでは、基準日と日数を入力し、「後」または「前」を選択するだけで目的の日付が表示されます。登録不要・完全無料でご利用いただけます。
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            nissuu-keisan — 日数計算ツール。登録不要・無料。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">営業日数計算</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Wareki Converter</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tax Calculator</a>
              <a href="/timezone-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timezone Converter</a>
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
