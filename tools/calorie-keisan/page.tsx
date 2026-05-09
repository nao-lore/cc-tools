import Link from "next/link";
import { tools } from "@/lib/tools-config";
import CalorieCalculator from "./components/CalorieCalculator";

const faq = [
  {
    q: "このツールのカロリーは何を表していますか？",
    a: "基礎代謝量は安静時の推定消費エネルギー、推定消費カロリーは基礎代謝量に活動係数を掛けた1日あたりの目安です。実測値ではありません。",
  },
  {
    q: "減量目標のカロリーをそのまま守れば体重は落ちますか？",
    a: "必ず落ちるとは限りません。体重変化は体組成、摂取量の誤差、活動量、睡眠、体調などで変わります。数週間単位で体重と体調を見ながら調整してください。",
  },
  {
    q: "子どもや妊娠中でも使えますか？",
    a: "このツールは18歳以上の成人向けの概算です。子ども、妊娠中、持病がある場合、競技者の栄養管理では専門家の基準を優先してください。",
  },
  {
    q: "入力した身体情報は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、年齢・身長・体重などの入力値を外部に送信しません。",
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
              <p className="text-sm font-semibold text-emerald-700">健康・生活ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">カロリー計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                年齢、性別、身長、体重、活動レベルから基礎代謝量と1日の推定消費カロリーを計算します。目標カロリーとPFCの目安も確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・基礎代謝量を推定</li>
                <li>・活動レベル込みのTDEEを計算</li>
                <li>・維持/減量/増量カロリーを比較</li>
                <li>・PFC目安をコピー / CSV出力</li>
              </ul>
            </div>
          </div>
        </header>

        <CalorieCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="基礎代謝量" body="呼吸や体温維持など、安静時に必要なエネルギー量の推定値です。" />
          <InfoCard title="TDEE" body="基礎代謝量に活動係数を掛けた、1日の総消費カロリーの目安です。" />
          <InfoCard title="PFC" body="たんぱく質、脂質、炭水化物の比率から、g単位の摂取目安を出します。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算方法と使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">基礎代謝量とTDEE</h3>
              <p className="mt-1">
                このツールでは Harris-Benedict 改訂式で基礎代謝量を推定し、活動レベルの係数を掛けて1日の推定消費カロリーを出します。係数は生活の活動量をざっくり反映するための目安です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">目標カロリー</h3>
              <p className="mt-1">
                維持はTDEEそのまま、ゆるく減量は約300kcal減、減量は約500kcal減、増量は約300kcal増で計算します。急な制限ではなく、体調を見ながら調整する前提です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">エネルギー消費の考え方</h3>
              <p className="mt-1">
                1日のエネルギー消費は、基礎代謝、食事誘発性熱産生、身体活動量で構成されます。身体活動量の個人差が大きいため、結果は固定値ではなく調整の出発点として使ってください。
              </p>
              <a
                href="https://kennet.mhlw.go.jp/information/information/exercise/s-02-003.html"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                e-ヘルスネット: 身体活動とエネルギー代謝
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">栄養バランス</h3>
              <p className="mt-1">
                PFCは、たんぱく質4kcal/g、脂質9kcal/g、炭水化物4kcal/gとしてg換算しています。実際の食事設計では、厚生労働省の食事摂取基準や専門家の助言も参考にしてください。
              </p>
              <a
                href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/eiyou/syokuji_kijyun.html"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                厚生労働省: 日本人の食事摂取基準
              </a>
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
            <Related href="/bmi-keisan" title="BMI計算" body="体格と標準体重の目安を確認" />
            <Related href="/nenrei-keisan" title="年齢計算" body="満年齢や生年月日の確認" />
            <Related href="/tsumitate-sim" title="積立シミュレーション" body="毎月積立の将来額を計算" />
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
