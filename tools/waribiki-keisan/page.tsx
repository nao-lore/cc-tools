import Link from "next/link";
import { tools } from "@/lib/tools-config";
import DiscountCalculator from "./components/DiscountCalculator";

const faq = [
  {
    q: "3割引と30%OFFは同じですか？",
    a: "同じです。日本語の1割は10%なので、3割引は30%OFF、5割引は50%OFFです。",
  },
  {
    q: "税込価格を入力しても使えますか？",
    a: "使えます。その場合、割引後価格は税込ベースの割引後金額として見てください。税抜価格を入力した場合は、税込10%と税込8%の目安も表示します。",
  },
  {
    q: "複数商品をまとめて計算できますか？",
    a: "できます。商品を追加して、それぞれの元値と割引を入力すると、合計の割引額、支払額、税込額を確認できます。",
  },
  {
    q: "円引きが元値を超えた場合は？",
    a: "割引後価格がマイナスにならないよう、割引額は元値までに制限します。",
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
              <p className="text-sm font-semibold text-emerald-700">生活・買い物</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">割引計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                %OFF、○割引、円引きから割引後価格、割引額、税込10%、税込8%、複数商品の合計を計算します。セール、クーポン、まとめ買いの支払額確認に使えます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">対応形式</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-700">
                <span className="rounded-lg bg-slate-100 px-2 py-2">%OFF</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2">割引</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2">円引き</span>
              </div>
              <p className="mt-3">入力値はブラウザ内で計算され、外部に送信されません。</p>
            </div>
          </div>
        </header>

        <DiscountCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="3つの割引形式" body="%OFF、○割引、円引きに対応。5割引なら50%OFFとして計算します。" />
          <InfoCard title="税込額も確認" body="割引後価格に対して、標準税率10%と軽減税率8%の目安を表示します。" />
          <InfoCard title="複数商品とCSV" body="複数商品の合計を計算し、商品別の結果をCSVで保存できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">割引計算の考え方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">%OFF</h3>
              <p className="mt-1">20%OFFなら、元値 × 20% を割引額として引きます。割引後価格は「元値 - 割引額」です。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">○割引</h3>
              <p className="mt-1">1割は10%です。3割引は30%OFF、5割引は50%OFF、7割引は70%OFFとして扱います。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">円引き</h3>
              <p className="mt-1">500円引き、1,000円引きなど、固定額のクーポンや値引きに使います。元値を超える円引きは0円で止めます。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">税込表示</h3>
              <p className="mt-1">税抜価格を入力した場合の目安として、割引後価格に10%または8%を加算します。税込価格を入力した場合は税込ベースの値引きとして見てください。</p>
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
            <Related href="/tax-calculator" title="消費税計算" body="税込・税抜・税額を計算" />
            <Related href="/stripe-fee-calculator" title="Stripe手数料計算" body="決済後の入金額を確認" />
            <Related href="/mercari-tesuryou" title="メルカリ手数料計算" body="販売価格から手取りを計算" />
            <Related href="/recipe-scaling" title="レシピ分量計算" body="分量を人数に合わせて換算" />
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
