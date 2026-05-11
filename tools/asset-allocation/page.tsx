import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AssetAllocation from "./components/AssetAllocation";

const faq = [
  {
    q: "アセットアロケーションとは何ですか？",
    a: "資産を現金、債券、株式など複数の資産クラスにどの比率で配分するかという考え方です。このツールでは現在金額と目標比率の差分を確認できます。",
  },
  {
    q: "このツールは投資助言ですか？",
    a: "いいえ。特定の配分や金融商品の購入を勧めるものではありません。入力した比率に対する機械的な差分計算だけを行います。",
  },
  {
    q: "リバランス差分はどう見ればいいですか？",
    a: "目標金額より少ない資産は買い増し候補、多い資産は売却または新規買付を控える候補として表示します。税金や手数料は考慮していません。",
  },
  {
    q: "目標比率はどう決めればいいですか？",
    a: "年齢、収入、生活防衛資金、運用期間、値下がりへの耐性で変わります。必要に応じて金融庁などの公的情報や中立の専門家を確認してください。",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← 無料オンラインツール集
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-violet-700">資産配分・リバランス確認</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                アセットアロケーション計算ツール
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                現在の資産金額と目標比率を入力して、資産配分、目標金額、買い増し・売却目安を確認します。投資判断ではなく、配分整理のための計算ツールです。
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-900 shadow-sm">
              <div className="font-semibold text-violet-950">投資助言ではありません</div>
              <p className="mt-2">
                税金、手数料、商品リスク、個別事情は考慮しません。比率と金額の整理だけに使ってください。
              </p>
            </div>
          </div>
        </header>

        <AssetAllocation />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="現在比率を確認" body="入力した資産金額から、現在の配分比率を自動計算します。" />
          <InfoCard title="目標との差分" body="追加投資後の基準額に対して、買い増し・売却目安を表示します。" />
          <InfoCard title="ローカル計算" body="計算はブラウザ上で完結し、入力した資産額は外部に送信しません。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">使い方と注意点</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">現在金額を入れる</h3>
              <p className="mt-1">
                現金、債券、株式など、資産クラスごとの現在金額を万円単位で入力します。名称は自由に書き換えられます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">目標比率を入れる</h3>
              <p className="mt-1">
                目標比率の合計が100%になるように入力します。プリセットは考え方の例であり、推奨配分ではありません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">差分を見る</h3>
              <p className="mt-1">
                追加投資額がある場合は、それを含めた総額に対して目標金額を計算します。税金や売買手数料は別途考慮してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公的情報</h3>
              <p className="mt-1">
                金融庁は資産形成の基本として、状況やライフプランに合わせた方法の使い分け、長期・積立・分散投資の考え方を紹介しています。
              </p>
              <a
                href="https://www.fsa.go.jp/policy/nisa2/invest/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                金融庁 資産形成の基本
              </a>
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
            <Related href="/tsumitate-sim" title="積立シミュレーション" body="毎月積立の将来額を概算" />
            <Related href="/ideco-tax-saving" title="iDeCo節税計算" body="掛金による税負担軽減を確認" />
            <Related href="/sho-kigyo-kyosai" title="小規模企業共済" body="掛金控除の節税額を概算" />
            <Related href="/risoku-keisan" title="利息計算" body="利回りと期間の概算" />
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
