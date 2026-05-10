import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AgeCalculator from "./components/AgeCalculator";

const faq = [
  {
    q: "満年齢と数え年は何が違いますか？",
    a: "満年齢は生まれた日を0歳として、誕生日を迎えるたびに1歳増える数え方です。数え年は生まれた年を1歳として、年が変わるたびに1歳増える伝統的な数え方です。",
  },
  {
    q: "2月29日生まれはどう扱いますか？",
    a: "このツールでは、うるう年ではない年の誕生日判定を2月28日として扱います。書類や制度上の扱いは提出先のルールを確認してください。",
  },
  {
    q: "干支と星座も同時に確認できますか？",
    a: "確認できます。干支は生まれ年、星座は生まれた月日から判定します。",
  },
  {
    q: "入力した生年月日は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力した生年月日を外部に送信しません。",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            無料オンラインツール集
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-sky-700">日本語生活ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">年齢計算ツール</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                生年月日から満年齢、数え年、干支、星座、生まれてからの日数、次の誕生日までの日数をまとめて計算します。
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 shadow-sm">
              <div className="font-semibold">今日時点で自動計算</div>
              <p className="mt-2">
                誕生日を迎えているか、2月29日生まれを平年でどう扱うかも含めて計算します。入力値は外部に送信されません。
              </p>
            </div>
          </div>
        </header>

        <AgeCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="満年齢" body="今日時点で誕生日を迎えているかを見て、現在の年齢を計算します。" />
          <InfoCard title="数え年" body="生まれた年を1歳として数える伝統的な年齢を表示します。" />
          <InfoCard title="誕生日までの日数" body="次の誕生日の日付と、そこまでの残り日数を確認できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">年齢計算の使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">満年齢の計算</h3>
              <p className="mt-1">
                現在年から生年を引き、今年の誕生日をまだ迎えていなければ1を引きます。日本の一般的な年齢表記で使われる数え方です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">数え年の計算</h3>
              <p className="mt-1">
                生まれた年を1歳として、現在年との差に1を足します。厄年、長寿祝い、年中行事の確認で使われることがあります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">うるう日の扱い</h3>
              <p className="mt-1">
                2月29日生まれの場合、平年の誕生日判定は2月28日として扱います。制度や書類で厳密な扱いが必要な場合は提出先のルールを優先してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">干支と星座</h3>
              <p className="mt-1">
                干支は生まれ年の十二支、星座は誕生日の月日から判定します。年賀状、プロフィール、占いの確認にも使えます。
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
            <Related href="/eigyoubi" title="営業日計算" body="営業日・休業日を数える" />
            <Related href="/wareki-converter" title="和暦変換" body="西暦と和暦を変換" />
            <Related href="/nissuu-keisan" title="日数計算" body="日付間の日数を計算" />
            <Related href="/bmi-keisan" title="BMI計算" body="身長と体重から健康目安を確認" />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools は {toolCount} 個以上の無料オンラインツールを公開しています。
        </footer>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "年齢計算ツール",
              description: "生年月日から満年齢、数え年、干支、星座、生まれてからの日数を計算します。",
              url: "https://tools.loresync.dev/nenrei-keisan",
              applicationCategory: "UtilityApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
              inLanguage: "ja",
            },
            {
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
            },
          ]),
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
