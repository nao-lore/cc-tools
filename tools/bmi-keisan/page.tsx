import Link from "next/link";
import { tools } from "@/lib/tools-config";
import BmiCalculator from "./components/BmiCalculator";

const faq = [
  {
    q: "BMIはどの計算式で出していますか？",
    a: "BMI = 体重(kg) ÷ 身長(m)^2 で計算しています。身長170cm、体重65kgなら 65 ÷ 1.7 ÷ 1.7 = 22.5 です。",
  },
  {
    q: "標準体重はどう計算していますか？",
    a: "標準体重は BMI 22 を基準に、身長(m)^2 × 22 で計算しています。統計的に疾病が少ない目安として使われます。",
  },
  {
    q: "子どもや妊娠中でも使えますか？",
    a: "このツールは成人向けの目安です。子ども、妊娠中、アスリート、高齢者などはBMIだけでは判断しにくいため、専門家の基準を優先してください。",
  },
  {
    q: "入力した身長や体重は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力値を外部に送信しません。",
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
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">健康・生活ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">BMI計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                身長と体重からBMI、肥満度、標準体重、普通体重の目安を計算します。日本肥満学会の判定基準に沿った成人向けの確認ツールです。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">計算式</div>
              <div className="mt-2 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-white">BMI = kg / m^2</div>
              <p className="mt-2">判定は健康診断の代替ではありません。</p>
            </div>
          </div>
        </header>

        <BmiCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="普通体重" body="BMI 18.5以上25.0未満が普通体重の範囲です。" />
          <InfoCard title="標準体重" body="BMI 22を基準にした体重を標準体重として表示します。" />
          <InfoCard title="ローカル計算" body="入力値はブラウザ内で処理され、外部送信や保存は行いません。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">BMIの計算方法と注意点</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">計算式</h3>
              <p className="mt-1">
                BMIは「体重(kg) ÷ 身長(m)^2」で求めます。標準体重は「身長(m)^2 × 22」、普通体重の範囲は「身長(m)^2 × 18.5」から「身長(m)^2 × 25未満」です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">使い方</h3>
              <p className="mt-1">
                身長と体重を入力すると結果が自動で更新されます。結果をコピーして、体重管理メモや健康診断結果の確認に使えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">BMIだけで判断しない</h3>
              <p className="mt-1">
                BMIは身長と体重だけを見る指標です。筋肉量、体脂肪率、腹囲、年齢、性別、既往歴までは反映しません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考資料</h3>
              <p className="mt-1">
                判定区分と計算式は、厚生労働省 e-ヘルスネットのBMIチェックツールおよび肥満と健康の解説を参考にしています。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://kennet.mhlw.go.jp/information/information/metabolic/bmi_check.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  BMIチェックツール
                </a>
                <a
                  href="https://kennet.mhlw.go.jp/information/information/food/e-02-001.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  肥満と健康
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
            <Related href="/calorie-keisan" title="カロリー計算" body="消費カロリーと基礎代謝を確認" />
            <Related href="/nenrei-keisan" title="年齢計算" body="満年齢・数え年を計算" />
            <Related href="/denki-keisan" title="電気代計算" body="家電ごとの電気料金を確認" />
            <Related href="/waribiki-keisan" title="割引計算" body="割引後価格と税込価格を計算" />
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
