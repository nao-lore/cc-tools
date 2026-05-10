import Link from "next/link";
import { tools } from "@/lib/tools-config";
import LoanSimulator from "./components/LoanSimulator";

const faq = [
  {
    q: "元利均等返済と元金均等返済の違いは？",
    a: "元利均等返済は毎月の返済額がほぼ一定です。元金均等返済は毎月の元金返済額が一定で、返済初期の負担は大きいものの総利息は少なくなりやすい方式です。",
  },
  {
    q: "ボーナス返済はどう扱っていますか？",
    a: "6月と12月に追加で元金返済する概算として扱います。追加返済によって予定より早く完済する場合は、完済月でシミュレーションを止めます。",
  },
  {
    q: "返済比率はどう計算していますか？",
    a: "年間返済額を年収で割って算出しています。返済比率は審査結果を保証するものではなく、家計負担を見るための目安です。",
  },
  {
    q: "実際の借入条件とずれることはありますか？",
    a: "あります。保証料、団信、事務手数料、金利優遇、繰上返済手数料、返済日、端数処理は金融機関ごとに異なります。",
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
              <p className="text-sm font-semibold text-indigo-700">生活・お金</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">ローン返済シミュレーター</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                借入金額、金利、返済期間から毎月返済額、総返済額、利息総額、返済比率、年次残高を計算します。元利均等返済と元金均等返済の比較に対応しています。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">計算方式</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs font-semibold text-slate-700">
                <span className="rounded-lg bg-slate-100 px-2 py-2">元利均等</span>
                <span className="rounded-lg bg-slate-100 px-2 py-2">元金均等</span>
              </div>
              <p className="mt-3">概算用です。契約前は必ず金融機関の正式試算を確認してください。</p>
            </div>
          </div>
        </header>

        <LoanSimulator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="完済月まで積み上げ" body="ボーナス追加返済で早く完済する場合、完済月で計算を止めて総返済額を出します。" />
          <InfoCard title="返済比率を確認" body="年収を入力すると、年間返済額が年収に占める割合を概算できます。" />
          <InfoCard title="CSV出力" body="年次の残高推移、元金返済、利息をCSVで保存できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算の前提</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">元利均等返済</h3>
              <p className="mt-1">
                毎月返済額がほぼ一定になる方式です。返済初期は利息の割合が大きく、後半ほど元金返済の割合が増えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">元金均等返済</h3>
              <p className="mt-1">
                毎月の元金返済額を一定にする方式です。返済初期の月額は高めですが、残高が減るにつれて利息も下がります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">ボーナス返済</h3>
              <p className="mt-1">
                このツールでは6月・12月の追加元金返済として扱います。金融機関の「ボーナス返済部分」とは計算方法が異なる場合があります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">含めていないもの</h3>
              <p className="mt-1">
                保証料、団体信用生命保険、事務手数料、火災保険、端数処理、返済日差、金利変動、繰上返済手数料は含めません。
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
            <Related href="/risoku-keisan" title="利息計算" body="単利・複利の利息を計算" />
            <Related href="/tsumitate-sim" title="積立シミュレーション" body="積立投資の将来額を確認" />
            <Related href="/waribiki-keisan" title="割引計算" body="割引後価格と税込価格を計算" />
            <Related href="/nenrei-keisan" title="年齢計算" body="返済完了時の年齢確認にも使えます" />
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
