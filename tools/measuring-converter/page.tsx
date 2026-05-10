import Link from "next/link";
import { tools } from "@/lib/tools-config";
import MeasuringConverter from "./components/MeasuringConverter";

const faq = [
  {
    q: "大さじ1は何グラムですか？",
    a: "大さじ1は15mlですが、グラム数は食材で変わります。水は約15g、醤油は約18g、上白糖は約9g、薄力粉は約8gが家庭用の目安です。",
  },
  {
    q: "1カップは何mlですか？",
    a: "日本の計量カップは1カップ=200mlとして計算しています。海外レシピでは1カップが約240mlのことがあるため、レシピの国や単位表記を確認してください。",
  },
  {
    q: "グラムから大さじ・小さじに逆換算できますか？",
    a: "できます。変換方向を「g → 容量」に切り替えると、入力したグラム数をml、小さじ、大さじ、カップの目安に換算します。",
  },
  {
    q: "なぜ食材ごとにグラム数が違うのですか？",
    a: "同じ15mlでも、水、油、砂糖、小麦粉では密度が違います。粉類はすくい方や詰まり方、湿度でも変わるため、料理用の目安として使ってください。",
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
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">料理・レシピツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                <span className="block sm:inline">計量スプーン・カップ</span>
                {" "}
                <span className="block sm:inline">グラム換算</span>
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                大さじ、小さじ、計量カップ、グラムを食材別に相互換算します。水、醤油、砂糖、塩、小麦粉などの家庭用の計量目安を、コピーやCSVで扱えます。
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 shadow-sm">
              <div className="font-semibold">家庭用の計量目安</div>
              <p className="mt-2">
                小さじ1=5ml、大さじ1=15ml、1カップ=200mlで計算します。粉類はすくい方や湿度で差が出るため、厳密な製菓や栄養計算ではスケールを優先してください。
              </p>
            </div>
          </div>
        </header>

        <MeasuringConverter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="大さじ・小さじ基準" body="日本の家庭用計量に合わせて、小さじ1=5ml、大さじ1=15ml、1カップ=200mlで換算します。" />
          <InfoCard title="食材別の重さ" body="水、醤油、油、砂糖、塩、小麦粉など、同じ容量でも重さが変わる食材差を反映します。" />
          <InfoCard title="CSV・コピー" body="結果をコピーしたりCSVで保存したりできるので、レシピ調整や買い物メモに使えます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計量スプーン換算の考え方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">基準容量</h3>
              <p className="mt-1">
                このツールでは、小さじ1=5ml、大さじ1=15ml、計量カップ1杯=200mlとして扱います。大さじ1は小さじ3杯分です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">食材差</h3>
              <p className="mt-1">
                容量が同じでも、食材の密度が違うためグラム数は変わります。水15mlは約15gですが、醤油は約18g、上白糖は約9gが目安です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">粉類の注意</h3>
              <p className="mt-1">
                小麦粉、片栗粉、砂糖、塩は、すくい方、ふるい方、粒度、湿度、メーカーで重さが変わります。レシピ調整用の実用値として見てください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">使いどころ</h3>
              <p className="mt-1">
                はかりがない時、海外レシピを日本の計量に寄せたい時、グラム指定を大さじ・小さじに戻したい時に便利です。厳密な配合はキッチンスケールを使ってください。
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
            <Related href="/oven-temp-converter" title="オーブン温度換算" body="摂氏・華氏・ガスマークを変換" />
            <Related href="/recipe-scaling" title="レシピ分量調整" body="人数に合わせて材料を倍率計算" />
            <Related href="/calorie-keisan" title="カロリー計算" body="基礎代謝と消費カロリーを確認" />
            <Related href="/waribiki-keisan" title="割引計算" body="税込・割引後価格をまとめて計算" />
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
