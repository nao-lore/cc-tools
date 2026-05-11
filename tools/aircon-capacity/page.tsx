import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AirconCapacity from "./components/AirconCapacity";

const faq = [
  {
    q: "畳数だけでエアコンを選んでも大丈夫ですか？",
    a: "畳数は入口として使えますが、実際は西日、最上階、断熱性能、窓の大きさ、地域、暖房重視かどうかで必要能力が変わります。このツールでは畳数を補正して目安クラスを出します。",
  },
  {
    q: "冷房能力と暖房能力のどちらを見るべきですか？",
    a: "夏の暑さ対策なら冷房能力、冬の暖房をエアコン中心にするなら暖房能力も確認してください。寒冷地や暖房重視の部屋では、一段上のクラスや寒冷地仕様も候補になります。",
  },
  {
    q: "電気代の計算は正確ですか？",
    a: "電気代は「能力 ÷ COP × 使用時間 × 電気単価」で単純化した概算です。実際の消費電力は機種、外気温、設定温度、断熱、運転制御で変わります。",
  },
  {
    q: "入力した部屋条件は保存されますか？",
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
              <p className="text-sm font-semibold text-sky-700">暮らし・省エネツール</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">エアコン適正容量計算ツール</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                部屋の畳数、日当たり、階数、断熱、窓、地域条件から、エアコンの冷暖房能力クラスを見積もります。電気単価と使用時間を入れて月額電気代の概算も確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">見るべきポイント</div>
              <p className="mt-2">「主に○畳」は目安です。西日・最上階・低断熱・大きな窓・寒冷地では余裕を見てください。</p>
            </div>
          </div>
        </header>

        <AirconCapacity />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="畳数を補正" body="部屋の広さに加えて、日射・断熱・窓・天井高を補正して容量クラスを選びます。" />
          <InfoCard title="電気代も概算" body="電気単価、使用時間、効率目安を変えて、月額コストのざっくりした差を見られます。" />
          <InfoCard title="ローカル計算" body="入力した部屋条件はブラウザ内で処理され、外部送信や保存は行いません。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算の考え方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">容量クラス</h3>
              <p className="mt-1">
                2.2kW、2.5kW、2.8kW、3.6kW、4.0kW、5.6kWなどの一般的な能力クラスに丸めて表示します。補正後の畳数がクラス上限に近いときは、一段上も候補にします。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">電気代</h3>
              <p className="mt-1">
                電気代は「能力 ÷ COP × 使用時間 × 30日 × 電気単価」で概算します。既定値は31円/kWhですが、契約プランや燃料費調整で変わるため入力で変更できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">余裕を見る条件</h3>
              <p className="mt-1">
                西向き、大きな窓、最上階、低断熱、キッチン隣接、在室人数が多い部屋、寒冷地の暖房利用では、畳数表記より大きめの能力が必要になることがあります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考情報</h3>
              <p className="mt-1">
                エアコンの「畳数のめやす」は、部屋条件で変わる目安として扱ってください。最終的な購入判断ではメーカーの機種仕様、販売店の確認、設置環境をあわせて見ます。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://www.enecho.meti.go.jp/category/saving_and_new/saving/general/howto/airconditioning/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  資源エネルギー庁 省エネ
                </a>
                <a
                  href="https://www.ac.daikin.co.jp/customercenter/useful/article/29"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  ダイキン 畳数の見方
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
            <Related href="/denki-keisan" title="電気代計算" body="家電ごとの電気料金を確認" />
            <Related href="/aircon-capacity" title="エアコン容量" body="このページの条件を見直す" />
            <Related href="/loan-simulator" title="ローンシミュレーター" body="購入費用の月額負担を確認" />
            <Related href="/waribiki-keisan" title="割引計算" body="家電セール価格を計算" />
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
            name: "エアコン適正容量計算ツール",
            description: "部屋の畳数、日当たり、階数、断熱、窓、地域条件から、エアコンの冷暖房能力クラスを見積もる無料ツール。",
            url: "https://tools.loresync.dev/aircon-capacity",
            applicationCategory: "UtilityApplication",
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
