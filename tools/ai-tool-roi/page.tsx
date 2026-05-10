import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AiToolRoi from "./components/AiToolRoi";

const faq = [
  {
    q: "AIツールのROIはどう計算していますか？",
    a: "時短時間 × 時給換算 × 定着率で月の時短価値を出し、月額コストと初期導入費を差し引いてROIと回収期間を計算します。",
  },
  {
    q: "定着率は何を入れればいいですか？",
    a: "導入しても全員が毎日使うとは限らないため、実際に効果が出る割合を入れます。最初は50〜80%で保守的に見ると判断しやすいです。",
  },
  {
    q: "時給換算は給与だけでよいですか？",
    a: "給与だけでなく、外注単価、売上に直結する時間単価、管理コストを含めた概算でも構いません。比較目的なら同じ基準で揃えることが重要です。",
  },
  {
    q: "入力したコスト情報は保存されますか？",
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
              <p className="text-sm font-semibold text-emerald-700">AI導入・業務改善計算</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">AIツール導入 ROI計算</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                AIツールの月額コスト、初期導入費、利用人数、時短効果、定着率から月次効果と12ヶ月ROIを試算します。複数ツールの比較、コピー、CSV出力に対応しています。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">このツールでできること</div>
              <ul className="mt-2 space-y-1.5">
                <li>・AIツール導入費と時短価値を比較</li>
                <li>・利用人数と定着率を加味</li>
                <li>・12ヶ月純効果と回収期間を確認</li>
                <li>・結果をコピー / CSV保存</li>
              </ul>
            </div>
          </div>
        </header>

        <AiToolRoi />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="月次効果" body="月額コストと時短価値を比較し、毎月プラスになるかを確認できます。" />
          <InfoCard title="回収期間" body="初期導入費を何ヶ月で回収できるかを概算します。" />
          <InfoCard title="定着率" body="使われない前提を織り込むことで、導入判断を保守的にできます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">AIツールROIの見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">計算式</h3>
              <p className="mt-1">
                月の時短価値は「時短分/日 × 稼働日数 × 利用人数 × 定着率 ÷ 60 × 時給換算」で計算します。月の純効果はそこから月額コストを差し引きます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">12ヶ月純効果</h3>
              <p className="mt-1">
                12ヶ月純効果は「月の純効果 × 12 − 初期導入費」です。教育や移行にコストがかかる場合は初期導入費に含めてください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">保守的に見る</h3>
              <p className="mt-1">
                AI導入は期待値だけで判断すると過大評価になりがちです。定着率、レビュー時間、誤出力の修正時間も考えて、低めのシナリオも試すのが安全です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">向いている用途</h3>
              <p className="mt-1">
                議事録、文章作成、コード補助、問い合わせ対応、調査、データ整形のように、時間削減を見積もりやすい業務の比較に向いています。
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
            <Related href="/prompt-token-counter" title="プロンプトトークン計算" body="LLM入力の概算トークン数を確認" />
            <Related href="/ai-cost-calculator" title="AI API料金計算" body="API利用料をモデル別に試算" />
            <Related href="/meeting-cost" title="会議コスト計算" body="会議時間の人件費を見える化" />
            <Related href="/hourly-to-annual" title="時給年収換算" body="時給と稼働時間から年収を試算" />
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
