import Link from "next/link";
import { tools } from "@/lib/tools-config";
import InterestCalculator from "./components/InterestCalculator";

const faq = [
  {
    q: "単利と複利は何が違いますか？",
    a: "単利は元金に対してだけ利息を計算します。複利は発生した利息を元金に組み入れ、その利息にも次の利息がつく計算です。期間が長いほど差が大きくなります。",
  },
  {
    q: "税引後の金額は正確な受取額ですか？",
    a: "概算です。初期値は預貯金などの利子で一般的に使われる20.315%にしていますが、商品、制度、口座、課税方式によって扱いが変わるため、実際の受取額は金融機関や税務上の案内を確認してください。",
  },
  {
    q: "複利頻度はどう選べばいいですか？",
    a: "商品説明に年複利、半年複利、月複利などの記載があればそれに合わせます。不明な場合は年1回で見積もり、月次や日次は参考値として比較してください。",
  },
  {
    q: "入力した金額や利率は保存されますか？",
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
              <p className="text-sm font-semibold text-emerald-700">資産・利回り計算</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">利息計算ツール</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                元金、年利率、期間から単利・複利の利息額、元利合計、税引後の概算受取額を計算します。年次推移、コピー、CSV出力にも対応しています。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・単利 / 複利の元利合計を比較</li>
                <li>・年複利、半年複利、月複利、日次複利を概算</li>
                <li>・利息税を反映した税引後金額を表示</li>
                <li>・年次推移をCSVで保存</li>
              </ul>
            </div>
          </div>
        </header>

        <InterestCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="複利比較" body="同じ年利でも、複利頻度と期間によって元利合計が変わります。" />
          <InfoCard title="税引後の確認" body="税率を変更して、利息から差し引かれる概算税額を確認できます。" />
          <InfoCard title="ローカル計算" body="入力値はブラウザ上で計算され、外部送信や保存は行いません。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">利息計算の考え方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">単利の計算式</h3>
              <p className="mt-1">
                単利は「元金 × 年利率 × 年数」で利息を計算します。利息を元金へ組み入れないため、毎年の利息額は同じです。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">複利の計算式</h3>
              <p className="mt-1">
                複利は「元金 × (1 + 年利率 ÷ 複利回数)^(複利回数 × 年数)」で元利合計を概算します。利息にも利息がつくため、長期ほど差が出ます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">税引後の見方</h3>
              <p className="mt-1">
                初期値の20.315%は、所得税・復興特別所得税15.315%と地方税5%を合わせた一般的な利子課税の目安です。制度や商品により異なるため、税率は編集できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考資料</h3>
              <p className="mt-1">
                税率の初期値は、国税庁の利子所得および復興特別所得税の案内を参考にしています。正確な課税関係は金融機関や税務専門家の確認を優先してください。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1319.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  利子の源泉徴収
                </a>
                <a
                  href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2507.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  復興特別所得税
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
            <Related href="/tsumitate-sim" title="積立シミュレーター" body="毎月積立と運用利回りを確認" />
            <Related href="/loan-simulator" title="ローンシミュレーター" body="返済額と総支払額を計算" />
            <Related href="/tax-calculator" title="消費税計算" body="税込・税抜価格を素早く換算" />
            <Related href="/waribiki-keisan" title="割引計算" body="割引後価格と差額を計算" />
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
