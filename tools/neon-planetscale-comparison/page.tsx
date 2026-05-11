import Link from "next/link";
import { tools } from "@/lib/tools-config";
import NeonPlanetscaleComparison from "./components/NeonPlanetscaleComparison";

const faq = [
  {
    q: "Neon、PlanetScale、Tursoは同じ条件で比較できますか？",
    a: "完全にはできません。NeonはCU-hoursとstorage、PlanetScaleはcluster/branch/storage、Tursoはstorage/rows/syncsが主な課金軸です。このツールは代表的な使用量を入力して概算するためのものです。",
  },
  {
    q: "PlanetScaleの旧Scaler $29プランはまだ使えますか？",
    a: "PlanetScale公式ドキュメントでは、Scaler ProはBase planに改名され、無料プランはなくなっています。このツールでは現在のBase planとsingle-node Postgresの入口価格を前提にしています。",
  },
  {
    q: "本番DBとしてどれを選ぶべきですか？",
    a: "Postgresのサーバーレス運用ならNeon、MySQL/VitessやPlanetScaleの運用機能を重視するならPlanetScale、エッジ分散やSQLite/libSQLの軽さを重視するならTursoが候補です。要件と課金軸を合わせて見てください。",
  },
  {
    q: "料金データは保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力値を外部に送信しません。",
  },
];

export default function NeonPlanetscaleComparisonPage() {
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
              <p className="text-sm font-semibold text-emerald-700">SaaS・クラウド料金比較</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Neon / PlanetScale / Turso 料金比較</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                サーバーレスDBの料金軸を、NeonのCU-hours、PlanetScaleのcluster/storage、Tursoのstorage/rowsに分けて比較します。無料枠、入口価格、超過課金を日本語で確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">価格確認日</div>
              <p className="mt-2">2026-05-11時点の公式価格ページをもとにしています。実請求前に必ず公式ページを再確認してください。</p>
            </div>
          </div>
        </header>

        <NeonPlanetscaleComparison />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Neon" body="Postgres、scale-to-zero、branching、CU-hours課金。小さく始めるPostgresに向きます。" />
          <InfoCard title="PlanetScale" body="Base plan、Vitess/MySQL、Postgresも提供。clusterとbranch設計で費用が変わります。" />
          <InfoCard title="Turso" body="SQLite/libSQL、エッジ分散、rows read/write課金。軽量DBや多拠点用途に向きます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">料金前提と参照元</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Neon</h3>
              <p className="mt-1">
                Freeは100 CU-hours/月/projectと0.5GB storage。Launchは$0.106/CU-hour、$0.35/GB-monthとして概算しています。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">PlanetScale</h3>
              <p className="mt-1">
                Base planの10GB込みstorage、single-node Postgresの入口価格、PS-10/20/40の例示価格を使っています。branchやadd-onは除外しています。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Turso</h3>
              <p className="mt-1">
                Free、Developer、Scaler、Proのstorage、rows read、rows writtenをもとに、最も安い該当プランを選ぶ概算にしています。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">公式価格ページ</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="https://neon.com/pricing" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Neon pricing
                </a>
                <a href="https://planetscale.com/docs/planetscale-plans" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  PlanetScale plans
                </a>
                <a href="https://turso.tech/pricing?frequency=monthly" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Turso pricing
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
            <Related href="/supabase-pricing" title="Supabase料金計算" body="DB/Auth/Storageの費用を見る" />
            <Related href="/firebase-pricing" title="Firebase料金計算" body="FirestoreやHosting費用を概算" />
            <Related href="/vercel-pricing" title="Vercel料金計算" body="帯域・Functions費用を確認" />
            <Related href="/render-fly-railway-comparison" title="PaaS料金比較" body="Render/Fly/Railwayを比較" />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Neon / PlanetScale / Turso 料金比較",
            description: "サーバーレスDBの料金軸をNeon、PlanetScale、Tursoで比較する無料ツール。",
            url: "https://tools.loresync.dev/neon-planetscale-comparison",
            applicationCategory: "BusinessApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
            inLanguage: "ja",
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
