import Link from "next/link";
import { tools } from "@/lib/tools-config";
import { DaysCalculator } from "./components/DaysCalculator";

const faq = [
  {
    q: "開始日と終了日は両方含めて数えますか？",
    a: "標準では開始日から終了日までの経過日数を表示します。イベント日数のように終了日も含めたい場合は「終了日を日数に含める」をオンにしてください。",
  },
  {
    q: "○日後は基準日を含めますか？",
    a: "前後計算では基準日を0日目として扱います。たとえば5月10日の30日後は、5月10日から30日進めた日付です。",
  },
  {
    q: "営業日数も計算できますか？",
    a: "土日祝を除いた営業日数は、関連ツールの営業日数計算を使ってください。このページは暦日ベースの日数計算です。",
  },
  {
    q: "入力した日付は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力した日付を外部に送信しません。",
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
              <p className="text-sm font-semibold text-emerald-700">日付・カレンダー計算</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">日数計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                2つの日付間の日数、週数、年月日換算、時間・分・秒への換算をまとめて計算します。指定日からN日後・N日前の日付も確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・2つの日付間の日数を計算</li>
                <li>・週数、年月日、時間へ換算</li>
                <li>・N日後 / N日前の日付を確認</li>
                <li>・結果をコピー / CSV出力</li>
              </ul>
            </div>
          </div>
        </header>

        <DaysCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="期限管理" body="契約期限、保証期間、提出期限など、暦日ベースの日数を確認できます。" />
          <InfoCard title="記念日・予定" body="誕生日、イベント、旅行までの日数や、経過日数の確認に使えます。" />
          <InfoCard title="前後計算" body="基準日から30日後、90日前など、指定日数だけ前後した日付を出せます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">日数計算の使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">日付間の日数</h3>
              <p className="mt-1">
                開始日と終了日を選ぶと、経過日数、週換算、年月日換算、時間・分・秒への換算を表示します。終了日を含めるかどうかは用途に合わせて切り替えられます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">N日後・N日前</h3>
              <p className="mt-1">
                基準日と日数を入力し、「後」または「前」を選ぶと結果日を表示します。基準日は0日目として扱います。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">祝日表示</h3>
              <p className="mt-1">
                2024年から2027年までの日本の祝日を期間内に表示します。営業日数を計算したい場合は、土日祝を除外できる営業日数計算ツールを使ってください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">注意点</h3>
              <p className="mt-1">
                法務・契約・行政手続きでは「初日不算入」「末日が休日の場合」など個別ルールがあります。重要な期限は該当する規約や専門家の確認を優先してください。
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
            <Related href="/eigyoubi" title="営業日数計算" body="土日祝を除いた営業日数を計算" />
            <Related href="/wareki-converter" title="和暦変換" body="西暦と和暦を相互変換" />
            <Related href="/timezone-converter" title="タイムゾーン変換" body="海外との日時調整に使う" />
            <Related href="/nenrei-keisan" title="年齢計算" body="満年齢と生年月日の確認" />
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
