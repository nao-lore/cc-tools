import Link from "next/link";
import { tools } from "@/lib/tools-config";
import TsumitateSim from "./components/TsumitateSim";

const faq = [
  {
    q: "新NISAのつみたて投資枠に対応していますか？",
    a: "はい。年間120万円、月10万円を目安に、入力した積立額が枠内かどうかを表示します。ただし実際の買付可否は口座状況や金融機関の設定によります。",
  },
  {
    q: "年コストは何を入れればいいですか？",
    a: "投資信託なら信託報酬などの年率コストを入れます。たとえば信託報酬0.2%なら、想定年利から0.2%を差し引いた実質年利で試算します。",
  },
  {
    q: "NISAと課税口座の違いは何ですか？",
    a: "NISA/非課税では運用益への税金を0円として試算します。課税口座では運用益に税率を掛けた概算税額を差し引きます。",
  },
  {
    q: "この結果は将来の利益を保証しますか？",
    a: "保証しません。想定年利を固定した教育用シミュレーションです。実際の投資では価格変動、為替、手数料、税制変更などで結果が変わります。",
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
              <p className="text-sm font-semibold text-emerald-700">資産形成・NISA計算</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">積立シミュレーション</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                毎月の積立額、想定年利、年コスト、積立期間から将来の資産額を試算します。新NISA枠、課税口座の概算税額、年次推移、CSV出力に対応しています。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・毎月積立と初期投資をまとめて試算</li>
                <li>・信託報酬などの年コストを反映</li>
                <li>・NISA/課税口座の税引後金額を比較</li>
                <li>・年次推移をコピー / CSV保存</li>
              </ul>
            </div>
          </div>
        </header>

        <TsumitateSim />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="新NISA枠の目安" body="つみたて投資枠の年120万円、生涯投資枠1,800万円に対する使用率を表示します。" />
          <InfoCard title="コスト控除" body="想定年利から信託報酬などの年コストを差し引いて、現実寄りに試算できます。" />
          <InfoCard title="課税口座も比較" body="課税口座では運用益に税率を掛け、税引後の概算額を表示します。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">積立投資シミュレーションの見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">月次複利で試算</h3>
              <p className="mt-1">
                毎月の積立額を12か月分加算し、想定年利から年コストを引いた実質年利を月次に換算して計算します。月初積立と月末積立も切り替えられます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">新NISAの枠</h3>
              <p className="mt-1">
                2024年からのNISAでは、つみたて投資枠が年間120万円、成長投資枠が年間240万円、合計で年間360万円まで利用できます。非課税保有限度額は1,800万円です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">課税口座の税額</h3>
              <p className="mt-1">
                課税口座を選ぶと、運用益に税率を掛けた概算税額を差し引きます。初期値は20.315%ですが、制度や商品に合わせて変更できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考資料</h3>
              <p className="mt-1">
                NISAの投資枠は金融庁と国税庁の案内を参考にしています。税制や口座条件は変わる可能性があるため、実際の投資判断では公式情報と金融機関の案内を確認してください。
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://www.fsa.go.jp/policy/nisa2/know/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  金融庁 NISAを知る
                </a>
                <a
                  href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1535.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  国税庁 NISA制度
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
            <Related href="/risoku-keisan" title="利息計算" body="単利・複利・税引後の利息を計算" />
            <Related href="/loan-simulator" title="ローンシミュレーター" body="返済額と総支払額を確認" />
            <Related href="/asset-allocation" title="資産配分計算" body="ポートフォリオの比率を調整" />
            <Related href="/ideco-tax-saving" title="iDeCo節税計算" body="掛金による節税効果を試算" />
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
