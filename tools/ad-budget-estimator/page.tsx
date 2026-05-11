import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AdBudgetEstimator from "./components/AdBudgetEstimator";

const faq = [
  {
    q: "広告予算はどの式で計算していますか？",
    a: "基本式は、必要クリック数 = 目標CV数 ÷ CVR、必要インプレッション = クリック数 ÷ CTR、必要予算 = 目標CV数 × 目標CPA です。",
  },
  {
    q: "CVRやCTRは何を入れればいいですか？",
    a: "過去実績がある場合は実績値を入れてください。ない場合は仮置きで試算し、配信後に実績値で更新するのが現実的です。",
  },
  {
    q: "Google広告やSNS広告でそのまま使えますか？",
    a: "初期予算の目安として使えます。ただし媒体の学習期間、入札戦略、競合状況、クリエイティブ、LP品質で実績は大きく変わります。",
  },
  {
    q: "このツールに含まれない費用はありますか？",
    a: "広告制作費、LP改善費、代理店手数料、計測ツール費、消費税、社内運用工数は含みません。広告媒体費だけの概算として見てください。",
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
              <p className="text-sm font-semibold text-blue-700">広告運用・予算計画</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                広告予算逆算ツール
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                目標CV数、CPA、CVR、CTR、CPCから、必要な広告予算・クリック数・インプレッション数を逆算します。月次予算や初期提案の下書きに使えます。
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 shadow-sm">
              <div className="font-semibold text-blue-950">広告媒体費の概算です</div>
              <p className="mt-2">
                制作費、代理店手数料、消費税、媒体学習期間、計測ずれは含みません。実績値で更新してください。
              </p>
            </div>
          </div>
        </header>

        <AdBudgetEstimator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="目標から逆算" body="CV数とCPAから必要予算を出し、CVR/CTRでファネル規模を確認できます。" />
          <InfoCard title="予算から見積もり" body="予算とCPCからクリック数、CV数、CPAを概算できます。" />
          <InfoCard title="結果をコピー" body="予算・CV・CPA・クリック・インプレッションをまとめてコピーできます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算式と使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">予算を逆算する</h3>
              <p className="mt-1">
                目標CV数と目標CPAが決まっている場合、広告予算は「目標CV数 × CPA」で概算できます。CVRとCTRを入れると必要クリック数と表示回数も確認できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">予算からCV数を見る</h3>
              <p className="mt-1">
                予算とCPCが決まっている場合、「予算 ÷ CPC」でクリック数を出し、CVRを掛けてCV数を概算します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">ROASを見る</h3>
              <p className="mt-1">
                平均売上単価と成約率を入れると、広告費に対する売上目安を計算できます。利益率は含まないため、粗利ベースでは別途調整してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">注意点</h3>
              <p className="mt-1">
                広告配信はクリエイティブ、LP、媒体学習、競合、季節性、計測環境で変動します。このツールは事前計画用の概算で、成果を保証しません。
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
            <Related href="/ai-tool-roi" title="AIツール ROI計算" body="コストと時短効果を比較" />
            <Related href="/meeting-cost" title="会議コスト計算" body="参加人数と時間から費用を確認" />
            <Related href="/subscription-lifetime" title="サブスクLTV" body="継続課金の価値を概算" />
            <Related href="/stripe-fee-calculator" title="Stripe手数料" body="決済手数料と入金額を確認" />
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
