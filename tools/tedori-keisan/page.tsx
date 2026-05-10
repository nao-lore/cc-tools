import Link from "next/link";
import { tools } from "@/lib/tools-config";
import TedoriCalculator from "./components/TedoriCalculator";

const faq = [
  {
    q: "この手取り計算は正確な給与明細と一致しますか？",
    a: "一致しない場合があります。標準報酬月額の等級、賞与、通勤手当、勤務先の健康保険組合、自治体独自の住民税、各種控除を簡略化した概算です。",
  },
  {
    q: "2026年度の料率に対応していますか？",
    a: "初期値は2026年度の公開情報をもとに、協会けんぽ東京支部の健康保険料率、厚生年金18.3%、令和8年度の一般事業の雇用保険本人負担率を入れています。必要に応じて詳細設定から変更できます。",
  },
  {
    q: "40歳以上だと何が変わりますか？",
    a: "40歳以上65歳未満は介護保険料が加算されます。このツールでは年齢が40〜64歳のときだけ介護保険料率を健康保険等に加算します。",
  },
  {
    q: "入力した年収や年齢は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力値を外部に送信しません。",
  },
];

const sources = [
  {
    label: "協会けんぽ東京支部: 2026年度健康保険料率",
    href: "https://www.kyoukaikenpo.or.jp/shibu/tokyo/public_relations/e-mail_magazine/473.html",
  },
  {
    label: "日本年金機構: 厚生年金保険の保険料",
    href: "https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20150515-01.html",
  },
  {
    label: "厚生労働省: 令和8年度 雇用保険料率",
    href: "https://www.mhlw.go.jp/content/001692566.pdf",
  },
  {
    label: "国税庁: 給与所得控除",
    href: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm",
  },
  {
    label: "国税庁: 所得税の税率",
    href: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm",
  },
  {
    label: "国税庁: 基礎控除の見直し",
    href: "https://www.nta.go.jp/users/gensen/2025kiso/index.htm",
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
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">給与・生活費ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">手取り計算ツール</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                額面年収から所得税、住民税、健康保険、厚生年金、雇用保険を概算し、手取り月額・年額・控除内訳を確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 shadow-sm">
              <div className="font-semibold">2026年度の初期料率</div>
              <p className="mt-2">
                公式公開情報を初期値にしています。勤務先や自治体で差が出るため、詳細設定で料率を変更できます。
              </p>
            </div>
          </div>
        </header>

        <TedoriCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="社会保険を分解" body="健康保険、介護保険、子ども子育て支援金、厚生年金、雇用保険を分けて表示します。" />
          <InfoCard title="税金も概算" body="給与所得控除、基礎控除、扶養控除、社会保険料控除を使って所得税と住民税を概算します。" />
          <InfoCard title="料率を調整" body="協会けんぽ以外の健康保険組合や年度差分に合わせて、主要料率を手入力で変更できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">手取り計算の前提</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">社会保険料</h3>
              <p className="mt-1">
                健康保険などは標準報酬月額の近似として月収を使い、総料率を労使折半として半分だけ本人負担にします。厚生年金は18.3%を労使折半で計算します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">所得税</h3>
              <p className="mt-1">
                給与所得控除、基礎控除、扶養控除、社会保険料控除を差し引いた課税所得に、所得税の速算表と復興特別所得税2.1%を反映します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">住民税</h3>
              <p className="mt-1">
                住民税は所得割10%と均等割相当を使った概算です。実際には自治体、前年所得、調整控除、非課税判定などで変わります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">反映していないもの</h3>
              <p className="mt-1">
                賞与、通勤手当、住宅ローン控除、配偶者控除、生命保険料控除、iDeCo、小規模企業共済、住民税の年度ずれは個別に反映していません。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">参考にした公式情報</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                {source.label}
              </a>
            ))}
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
            <Related href="/tax-calculator" title="税金計算" body="税額や税込価格を確認" />
            <Related href="/withholding-tax-calculator" title="源泉徴収税計算" body="報酬の源泉税を計算" />
            <Related href="/ideco-tax-saving" title="iDeCo節税" body="所得控除による節税額を試算" />
            <Related href="/hourly-to-annual" title="時給年収換算" body="時給・月給・年収を換算" />
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
              name: "手取り計算ツール",
              description: "額面年収から所得税、住民税、社会保険料を差し引いた手取り額を概算します。",
              url: "https://tools.loresync.dev/tedori-keisan",
              applicationCategory: "FinanceApplication",
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
