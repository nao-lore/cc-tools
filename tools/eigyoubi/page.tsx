import Link from "next/link";
import { tools } from "@/lib/tools-config";
import { BusinessDaysCalculator } from "./components/BusinessDaysCalculator";

const faq = [
  {
    q: "営業日数は開始日を含めて数えますか？",
    a: "期間指定モードでは「開始日を営業日数に含める」を切り替えられます。逆算モードでは開始日は0日目として扱い、翌営業日から1営業日目として数えます。",
  },
  {
    q: "どの休日に対応していますか？",
    a: "土日と、内閣府が公表している2024年から2027年までの国民の祝日・振替休日・祝日法第3条第3項の休日に対応しています。会社独自の休業日はカスタム休日として追加できます。",
  },
  {
    q: "年末年始や会社の休業日は反映できますか？",
    a: "はい。会社独自の休日に日付を追加すると、その日も営業日から除外して計算します。年末年始休業、創立記念日、有給消化日などに使えます。",
  },
  {
    q: "入力した日付は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力した日付やカスタム休日を外部に送信しません。",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← 無料オンラインツール集
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">日付・ビジネス計算</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">営業日数計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                開始日と終了日から営業日数を計算し、営業日数から納期も逆算できます。土日、2024〜2027年の日本の祝日、会社独自の休業日をまとめて除外できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・期間内の営業日数を計算</li>
                <li>・N営業日後の納期を逆算</li>
                <li>・独自休業日を追加</li>
                <li>・結果をコピー / CSV出力</li>
              </ul>
            </div>
          </div>
        </header>

        <BusinessDaysCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="営業日ベースの納期" body="「5営業日以内」「10営業日後」など、土日祝を除いた締切を確認できます。" />
          <InfoCard title="祝日と振替休日" body="内閣府公表の祝日データを使い、振替休日や祝日法上の休日も除外します。" />
          <InfoCard title="社内カレンダー対応" body="年末年始や会社独自の休業日を追加して、自社基準の営業日数に近づけられます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">営業日数の数え方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">期間指定</h3>
              <p className="mt-1">
                開始日から終了日までの暦日を見て、土曜日、日曜日、国民の祝日、カスタム休日を除外します。開始日を含めるかどうかは案件や契約の表現に合わせて切り替えられます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">営業日数から逆算</h3>
              <p className="mt-1">
                開始日は0日目として扱い、翌営業日から1営業日目として数えます。納品予定日、審査期限、支払期限、問い合わせ回答期限の確認に使えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">祝日データ</h3>
              <p className="mt-1">
                祝日は内閣府「国民の祝日について」の公表情報を参考にしています。祝日が将来変更された場合は、最新の公表情報を優先してください。
              </p>
              <a
                href="https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                内閣府の祝日資料
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">注意点</h3>
              <p className="mt-1">
                業界や会社によって営業日の定義は異なります。銀行営業日、行政窓口、配送業者、取引先の休業日は別基準になることがあるため、重要な契約では相手先の定義を確認してください。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">よくある質問</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {faq.map((item) => (
              <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-slate-950">{item.q}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">関連ツール</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Related href="/nissuu-keisan" title="日数計算" body="日付間の日数・週数を計算" />
            <Related href="/wareki-converter" title="和暦変換" body="西暦と和暦を相互変換" />
            <Related href="/timezone-converter" title="タイムゾーン変換" body="海外との日時調整に使う" />
            <Related href="/gyomu-itaku-hikaku" title="業務委託比較" body="契約条件と手取りを比較" />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools は {toolCount} 個以上の無料オンラインツールを公開しています。
        </footer>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function Related({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
    </Link>
  );
}
