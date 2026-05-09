import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AreaCalculator from "./components/AreaCalculator";

const faq = [
  {
    q: "坪と平方メートルはどう換算していますか？",
    a: "1坪 = 3.305785124平方メートルとして換算しています。住宅や土地の広さを確認するときの目安として使えます。",
  },
  {
    q: "畳はどの大きさで計算していますか？",
    a: "このツールでは1畳 = 1.62平方メートルを目安にしています。地域や物件表示によって畳の大きさは変わるため、厳密な設計値が必要な場合は指定寸法を優先してください。",
  },
  {
    q: "三角形や台形の周囲長は出ますか？",
    a: "底辺と高さだけでは全ての辺の長さが決まらないため、周囲長は表示しません。面積だけを計算します。",
  },
  {
    q: "入力値は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、寸法や計算結果を外部に送信しません。",
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
              <p className="text-sm font-semibold text-emerald-700">面積・単位変換</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">面積計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                正方形、長方形、三角形、円など8種類の図形の面積を計算します。平方メートル、坪、畳、アール、ヘクタールへの換算もまとめて確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・8種類の図形の面積を計算</li>
                <li>・周囲長を出せる図形は同時表示</li>
                <li>・坪、畳、a、haへ換算</li>
                <li>・結果をコピー / CSV出力</li>
              </ul>
            </div>
          </div>
        </header>

        <AreaCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="土地・部屋の広さ" body="m²から坪・畳へ変換して、不動産や間取りの感覚に合わせて確認できます。" />
          <InfoCard title="図形の公式" body="長方形、円、台形、ひし形など、よく使う図形の公式を切り替えて計算できます。" />
          <InfoCard title="単位変換" body="面積をm²、cm²、km²、a、haなど複数単位で同時に確認できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">面積計算の使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">図形を選ぶ</h3>
              <p className="mt-1">
                最初に図形を選びます。図形ごとに必要な入力項目だけが表示されるため、長方形なら横と縦、円なら半径、台形なら上底・下底・高さを入力します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">長さ単位と面積単位を分ける</h3>
              <p className="mt-1">
                入力する寸法はmm、cm、m、kmから選べます。結果はm²、坪、畳、a、haなどへ変換できます。長さ単位と面積単位を分けることで計算ミスを減らします。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">坪・畳の目安</h3>
              <p className="mt-1">
                坪は1坪=3.305785124m²、畳は1畳=1.62m²として換算しています。畳の大きさは地域や表示基準で変わるため、厳密な建築設計では指定寸法を使ってください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">周囲長について</h3>
              <p className="mt-1">
                正方形、長方形、円、ひし形、楕円は周囲長も表示します。三角形、台形、平行四辺形は全辺の長さが必要なため、入力値だけでは周囲長を出しません。
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
            <Related href="/kenpei-yoseki" title="建蔽率・容積率" body="敷地面積から建築上限を計算" />
            <Related href="/measuring-converter" title="計量換算" body="料理用の容量と重量を換算" />
            <Related href="/px-to-rem" title="px to rem" body="CSSのサイズ単位を変換" />
            <Related href="/waribiki-keisan" title="割引計算" body="価格と割合の計算に使う" />
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
