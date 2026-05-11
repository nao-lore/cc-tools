import Link from "next/link";
import { tools } from "@/lib/tools-config";
import KenpeiYoseki from "./components/KenpeiYoseki";

const faq = [
  {
    q: "建蔽率と容積率は何が違いますか？",
    a: "建蔽率は敷地面積に対する建築面積の割合、容積率は敷地面積に対する延べ床面積の割合です。建蔽率は建物が敷地を覆う広さ、容積率は建物全体の床面積を制限します。",
  },
  {
    q: "前面道路幅員による容積率制限とは何ですか？",
    a: "指定容積率とは別に、前面道路の幅員に一定係数を掛けた上限がかかる場合があります。このツールでは住居系0.4、その他0.6の係数を選んで、有効容積率を概算します。",
  },
  {
    q: "用途地域の建蔽率・容積率はどこで確認しますか？",
    a: "自治体の都市計画図、都市計画GIS、重要事項説明書、行政窓口で確認します。プリセットは目安なので、実際の土地では自治体が指定する数値を入力してください。",
  },
  {
    q: "この結果だけで建築確認に使えますか？",
    a: "使えません。斜線制限、高さ制限、防火地域、角地緩和、道路後退、条例、容積率不算入などは個別判断が必要です。設計や購入判断では建築士・行政窓口・不動産会社に確認してください。",
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
              <p className="text-sm font-semibold text-emerald-700">不動産・建築計画ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                建蔽率・容積率 計算ツール
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                敷地面積、建蔽率、容積率、前面道路幅員から、最大建築面積と最大延べ床面積を概算します。土地購入や建築計画の初期確認に使えます。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 shadow-sm">
              <div className="font-semibold text-emerald-950">公式制度を前提にした概算</div>
              <p className="mt-2">
                建築基準法の建蔽率・容積率の考え方をもとに、指定値と道路幅員制限の小さい方を使います。
              </p>
            </div>
          </div>
        </header>

        <KenpeiYoseki />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="建築面積を確認" body="建蔽率から、敷地に対して建てられる建築面積の上限を概算します。" />
          <InfoCard title="延べ床面積を確認" body="指定容積率と前面道路幅員による制限を比較して、有効容積率を出します。" />
          <InfoCard title="購入前の初期検討" body="土地資料の数値を入れて、建物ボリュームの大まかな当たりをつけられます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算方法</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">建蔽率</h3>
              <p className="mt-1">
                最大建築面積は「敷地面積 × 建蔽率」で計算します。角地などの緩和を試算する場合は、建蔽率に10%を加算して上限を出します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">容積率</h3>
              <p className="mt-1">
                最大延べ床面積は「敷地面積 × 有効容積率」で計算します。有効容積率は、指定容積率と「前面道路幅員 × 係数 × 100」の小さい方です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">このツールで見ないもの</h3>
              <p className="mt-1">
                高さ制限、斜線制限、防火地域、日影規制、道路後退、条例、容積率不算入部分、敷地形状、接道条件などは個別確認が必要です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公式情報</h3>
              <p className="mt-1">
                建蔽率は建築基準法第53条、容積率は第52条の考え方を参照しています。詳細は必ず最新の法令と自治体窓口で確認してください。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://elaws.e-gov.go.jp/document?lawid=325AC0000000201"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  建築基準法 e-Gov
                </a>
                <a
                  href="https://www.mlit.go.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  国土交通省
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
            <Related href="/menseki-keisan" title="面積計算" body="坪・m²・畳の面積換算" />
            <Related href="/loan-simulator" title="住宅ローン計算" body="借入額と返済額を試算" />
            <Related href="/risoku-keisan" title="利息計算" body="金利と期間から利息を計算" />
            <Related href="/tax-calculator" title="税金計算" body="所得税・住民税の概算" />
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
