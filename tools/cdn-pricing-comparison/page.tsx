import Link from "next/link";
import { tools } from "@/lib/tools-config";
import CdnPricingComparison from "./components/CdnPricingComparison";

const faq = [
  {
    q: "このCDN料金比較は請求額と一致しますか？",
    a: "一致を保証するものではありません。公開料金から主要な帯域・リクエスト・パッケージ費用を概算し、WAF、ログ、ストレージ、動画配信、契約割引、税金は除外しています。",
  },
  {
    q: "Cloudflareが常に最安になるのですか？",
    a: "通常のWebサイトCDNでは固定プランが強いですが、動画、大容量ファイル、ソフトウェア配布、Enterprise条件が絡む場合は別判断です。利用規約と対象プロダクトを確認してください。",
  },
  {
    q: "CloudFrontのフラットレートと従量課金はどう使い分けますか？",
    a: "AWS内の標準的な配信やセキュリティ込みで予算を固定したい場合はフラットレート、細かなAWS構成や既存割引を使う場合は従量課金を別途精査します。",
  },
  {
    q: "Fastlyが高く見えるのはなぜですか？",
    a: "このツールでは2026年時点の公開パッケージ料金を使っています。Fastlyは小規模なGB単価勝負より、企業向けの制御・運用・セキュリティ込みで評価するサービスです。",
  },
];

export default function CdnPricingComparisonPage() {
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
              <p className="text-sm font-semibold text-sky-700">SaaS・インフラ料金ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                CDN料金比較ツール
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Cloudflare、Amazon CloudFront、Fastly、bunny.net の公開料金をもとに、月間トラフィックとリクエスト数から月額の目安を比較します。
                固定プランと従量課金を分けて見られる、CDN選定前の粗い見積もり用ツールです。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">更新日</div>
              <div className="mt-2 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-white">2026-05-11</div>
              <p className="mt-2">公式公開料金をもとにした概算です。契約前の最終見積もりではありません。</p>
            </div>
          </div>
        </header>

        <CdnPricingComparison />

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
            <Related href="/aws-s3-cost" title="AWS S3料金" body="ストレージとリクエスト料金を概算" />
            <Related href="/cloudflare-workers-cost" title="Cloudflare Workers料金" body="エッジ処理の月額を概算" />
            <Related href="/vercel-pricing" title="Vercel料金" body="Vercelプランと使用量を比較" />
            <Related href="/supabase-pricing" title="Supabase料金" body="DB・ストレージ・転送量を確認" />
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

function Related({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
    </Link>
  );
}
