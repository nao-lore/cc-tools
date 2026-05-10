import Link from "next/link";
import { tools } from "@/lib/tools-config";
import BaseStoresFee from "./components/BaseStoresFee";

const faq = [
  {
    q: "この比較は何を含みますか？",
    a: "月額費用、決済手数料率、BASEスタンダードの40円/件を含めた月間コストを比較します。振込手数料、オプション費用、決済手段ごとの追加料率は含みません。",
  },
  {
    q: "BASEグロースは年払いと月払いを切り替えられますか？",
    a: "はい。公式料金に合わせ、年払い換算16,580円/月と月払い19,980円/月を切り替えて比較できます。",
  },
  {
    q: "STORESの決済手数料はなぜ「〜」付きですか？",
    a: "公式料金がフリー5.5%〜、スタンダード3.6%〜と表記しているためです。このツールでは下限料率で概算します。",
  },
  {
    q: "料金データはいつ確認しましたか？",
    a: "2026年5月10日にBASE公式料金ページ、BASEヘルプ、STORES公式料金ページで確認しています。",
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
              <p className="text-sm font-semibold text-emerald-700">EC・ネットショップ</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                <span className="inline-block">BASE・STORES</span>{" "}
                <span className="inline-block">手数料比較</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                月商、平均注文単価、注文件数から BASE と STORES の月額費用・決済手数料・実質手数料率を比較します。最安プランと乗り換え目安をすぐ確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">公式料金確認</div>
              <div className="mt-2 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-white">2026-05-10</div>
              <p className="mt-2">料金改定があるため、申込前は必ず公式ページも確認してください。</p>
            </div>
          </div>
        </header>

        <BaseStoresFee />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="BASEの40円/件を反映" body="BASEスタンダードは料率だけでなく1注文あたり40円も含めて計算します。" />
          <InfoCard title="グロース年払い/月払い対応" body="年払い換算16,580円/月と月払い19,980円/月を切り替えられます。" />
          <InfoCard title="CSV出力" body="比較結果をCSVで保存し、月商シナリオの検討に使えます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">料金データの前提</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">BASE</h3>
              <p className="mt-1">
                スタンダードは月額0円、決済手数料3.6%+40円、サービス利用料3%。グロースは年払い換算16,580円/月または月払い19,980円/月、決済手数料2.9%で概算します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">STORES</h3>
              <p className="mt-1">
                フリーは月額0円・決済手数料5.5%〜、スタンダードは月額3,300円・決済手数料3.6%〜で概算します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">含めていないもの</h3>
              <p className="mt-1">
                振込手数料、スピード入金、決済手段ごとの追加料率、オプション、キャンペーン、税務上の処理は含めていません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">公式ページ</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="https://thebase.com/price/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  BASE 料金
                </a>
                <a href="https://help.thebase.in/hc/ja/articles/5701824979353" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  BASE グロース
                </a>
                <a href="https://stores.fun/ec/pricing" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  STORES 料金
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
            <Related href="/mercari-tesuryou" title="メルカリ手数料計算" body="販売価格から手取りを計算" />
            <Related href="/shopify-fee-jp" title="Shopify手数料計算" body="プラン別の月額・決済費用を比較" />
            <Related href="/stripe-fee-calculator" title="Stripe手数料計算" body="決済手数料と入金額を確認" />
            <Related href="/takuhaibin-hikaku" title="宅配便送料比較" body="配送サイズ別の送料を比較" />
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
