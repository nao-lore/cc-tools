import Link from "next/link";
import { tools } from "@/lib/tools-config";
import GachaCostCeiling from "./components/GachaCostCeiling";

const faq = [
  {
    q: "天井コストと期待値は何が違いますか？",
    a: "天井コストは最悪ケースで天井まで引いた場合のコストです。期待値は排出率から見た平均的な目安で、実際の結果は大きく上下します。",
  },
  {
    q: "ゲームごとのソフト天井やすり抜け保証は反映していますか？",
    a: "反映していません。このツールは排出率と天井回数を使った単純モデルです。特殊仕様がある場合は、ゲーム内の最新表記を見て入力値を調整してください。",
  },
  {
    q: "円換算はどう使いますか？",
    a: "1ゲーム内通貨あたりの円換算レートを入力すると、天井コストや目標数の最大コストを円で表示できます。無料配布分や割引パックは別途差し引いてください。",
  },
  {
    q: "この結果を課金判断に使っていいですか？",
    a: "あくまで上限と期待値の目安です。確率は短期的に大きく偏るため、予算上限を決めたうえで無理のない範囲で判断してください。",
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
              <p className="text-sm font-semibold text-rose-700">ゲーム・確率ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">ガチャ 天井コスト計算</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                天井回数、排出率、1回コストから、天井までの最大コスト、期待値、現在の累積からの残り回数を計算します。設定例を選んでから自由に調整できます。
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 shadow-sm">
              <div className="font-semibold">課金前の上限確認</div>
              <p className="mt-1">このツールは支出を勧めるものではなく、上限把握用の計算ツールです。</p>
            </div>
          </div>
        </header>

        <GachaCostCeiling />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="最大コスト" body="天井まで引いた場合の上限コストを確認できます。" />
          <InfoCard title="期待値" body="単純な確率モデルで平均的な必要回数を見積もります。" />
          <InfoCard title="残り回数" body="現在の累積回数から、天井までの残りを計算します。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算モデルの前提</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">単純な天井モデル</h3>
              <p className="mt-1">
                排出率が一定で、天井回数に到達したら取得できるものとして計算します。実際のゲームにある段階的な排出率上昇は含めていません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">最大コストと期待値は別物</h3>
              <p className="mt-1">
                最大コストは予算上限の確認に向いています。期待値は平均的な目安ですが、個別の結果は大きくぶれる可能性があります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">ゲーム内表記を優先</h3>
              <p className="mt-1">
                排出率、天井、交換ポイント、保証条件、無料配布分はゲームごとに異なります。最終的にはゲーム内の最新説明を確認してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">予算上限を先に決める</h3>
              <p className="mt-1">
                確率計算は支出判断の補助にすぎません。ガチャを回す前に、最大でいくらまで使うかを先に決めておくのが実用的です。
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
            <Related href="/gacha-probability" title="ガチャ確率計算" body="指定回数で当たる確率を計算" />
            <Related href="/waribiki-keisan" title="割引計算" body="パック購入時の割引率を確認" />
            <Related href="/risoku-keisan" title="利息計算" body="積立や利息の増え方を計算" />
            <Related href="/subscription-lifetime" title="サブスク累計" body="月額課金の長期コストを確認" />
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
            "@type": "WebApplication",
            name: "ガチャ 天井コスト計算",
            description: "天井回数、排出率、1回コストからガチャの最大コスト、期待値、残り回数を計算する無料ツールです。",
            url: "https://tools.loresync.dev/gacha-cost-ceiling",
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
          }),
        }}
      />
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
