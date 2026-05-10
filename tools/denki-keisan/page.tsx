import Link from "next/link";
import { tools } from "@/lib/tools-config";
import DenkiCalculator from "./components/DenkiCalculator";

const faq = [
  {
    q: "電気代はどの計算式ですか？",
    a: "消費電力(W) × 使用時間(h) ÷ 1000 = 消費電力量(kWh) とし、消費電力量 × 電気料金単価(円/kWh) で電気代を計算します。",
  },
  {
    q: "31円/kWhは何の単価ですか？",
    a: "家電の電気代表示で使われることが多い目安単価です。実際の単価は電力会社、契約プラン、燃料費調整額、再エネ賦課金などで変わるため、明細の単価に合わせて変更してください。",
  },
  {
    q: "冷蔵庫のように24時間動く家電はどう入力しますか？",
    a: "使用時間を24時間、使用日数を30日として入力します。実際には常に最大消費電力で動くわけではないため、メーカー表示の年間消費電力量がある場合はそちらも参考にしてください。",
  },
  {
    q: "入力した家電情報は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力値を外部に送信しません。",
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
              <p className="text-sm font-semibold text-emerald-700">生活費・節電計算</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">電気代計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                家電の消費電力、使用時間、使用日数、台数から1日・1ヶ月・1年の電気代を計算します。複数家電の合計、プリセット、コピー、CSV出力に対応しています。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・家電ごとのW数、時間、日数、台数を入力</li>
                <li>・電気料金単価を契約に合わせて変更</li>
                <li>・月額/年額の節電インパクトを比較</li>
                <li>・結果をコピー / CSV保存</li>
              </ul>
            </div>
          </div>
        </header>

        <DenkiCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="複数家電の合計" body="エアコン、冷蔵庫、PCなどをまとめて入力し、月額と年額の合計を確認できます。" />
          <InfoCard title="明細単価に対応" body="初期値は31円/kWhですが、契約プランの単価に変更して計算できます。" />
          <InfoCard title="節電比較" body="使用時間や台数を変えて、どこを削ると効果が大きいかを比較できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">電気代の計算方法</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">基本式</h3>
              <p className="mt-1">
                電気代は「消費電力(W) × 使用時間(h) ÷ 1000 × 電気料金単価(円/kWh)」で計算します。複数台ある場合は台数も掛けます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">使用日数の考え方</h3>
              <p className="mt-1">
                毎日使う家電は30日、平日だけ使う家電は20〜22日など、実際の使い方に近い日数を入れると月額が見やすくなります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">注意点</h3>
              <p className="mt-1">
                エアコンや冷蔵庫は常に最大消費電力で動くわけではありません。メーカー表示の年間消費電力量がある場合は、その値を優先した方が現実に近いことがあります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考資料</h3>
              <p className="mt-1">
                初期値の31円/kWhは、家電の電気代目安として使われる単価を参考にしています。正確な単価は電力会社の検針票や契約プランを確認してください。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://www.eftc.or.jp/qa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  家電公取協 Q&A
                </a>
              </div>
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
            <Related href="/aircon-capacity" title="エアコン畳数計算" body="部屋に合うエアコン能力を確認" />
            <Related href="/calorie-keisan" title="カロリー計算" body="消費カロリーと基礎代謝を計算" />
            <Related href="/menseki-keisan" title="面積計算" body="部屋や土地の面積を換算" />
            <Related href="/loan-simulator" title="ローン計算" body="毎月返済額と総支払額を確認" />
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
