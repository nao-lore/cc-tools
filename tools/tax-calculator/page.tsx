import Link from "next/link";
import { tools } from "@/lib/tools-config";
import TaxCalculator from "./components/TaxCalculator";

const faq = [
  {
    q: "源泉徴収税率は何％ですか？",
    a: "原稿料・講演料・デザイン報酬など一定の報酬・料金は、源泉徴収対象額が100万円以下なら10.21%、100万円を超える部分は20.42%で計算します。",
  },
  {
    q: "消費税は源泉徴収の対象に含めますか？",
    a: "原則は消費税を含めた金額が対象です。ただし、請求書等で報酬額と消費税額が明確に区分されている場合は、報酬額のみを対象額として差し支えないとされています。",
  },
  {
    q: "このツールは確定申告や納付書の代わりになりますか？",
    a: "なりません。請求書作成前の概算確認用です。実際の対象報酬、納付、確定申告、インボイス対応は国税庁の案内や税理士に確認してください。",
  },
  {
    q: "端数処理はどうしていますか？",
    a: "源泉徴収税額は国税庁の案内に合わせ、1円未満を切り捨てています。消費税の内税/外税計算は1円単位で丸めています。",
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
              <p className="text-sm font-semibold text-emerald-700">フリーランス税務</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                源泉徴収税計算ツール
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                原稿料、講演料、デザイン料などの報酬について、源泉徴収税額、消費税、税込報酬、差引支払額をまとめて計算します。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 shadow-sm">
              <div className="font-semibold text-emerald-950">確認日: 2026年5月11日</div>
              <p className="mt-2">
                国税庁タックスアンサー No.2795 と No.6303 を前提にした概算です。
              </p>
            </div>
          </div>
        </header>

        <TaxCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="100万円超にも対応" body="100万円以下10.21%、100万円超の超過部分20.42%で計算します。" />
          <InfoCard title="消費税区分を選べる" body="税抜、税込で消費税区分あり、税込総額のみの3パターンを切り替えられます。" />
          <InfoCard title="請求書テキストをコピー" body="複数行の明細と合計を、請求書確認用のテキストとしてコピーできます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算の前提</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">源泉徴収税率</h3>
              <p className="mt-1">
                源泉徴収対象額をAとして、100万円以下は A×10.21%、100万円超は (A-100万円)×20.42%+102,100円で計算します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">消費税の扱い</h3>
              <p className="mt-1">
                消費税額が請求書等で明確に区分されていれば報酬額のみを源泉徴収対象にできます。区分がない税込総額は税込額を対象にします。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">対象報酬の確認</h3>
              <p className="mt-1">
                すべての業務委託報酬が同じ扱いではありません。原稿料、講演料、デザイン料など対象範囲を確認してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">免責</h3>
              <p className="mt-1">
                本ツールは概算用です。納付期限、納付書、確定申告、インボイス制度、例外的な報酬区分は公式案内や専門家の確認を優先してください。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">公式情報</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <SourceLink
              href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2795.htm"
              title="国税庁 No.2795"
              body="原稿料や講演料等の源泉徴収税額"
            />
            <SourceLink
              href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6303.htm"
              title="国税庁 No.6303"
              body="消費税および地方消費税の税率"
            />
            <SourceLink
              href="https://www.nta.go.jp/publication/pamph/gensen/aramashi2022/pdf/07.pdf"
              title="国税庁 源泉徴収のあらまし"
              body="報酬・料金等の源泉徴収事務"
            />
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
            <Related href="/withholding-tax-calculator" title="源泉徴収計算" body="別形式の源泉徴収計算ツール" />
            <Related href="/tedori-keisan" title="手取り計算" body="給与の手取り目安を計算" />
            <Related href="/gyomu-itaku-hikaku" title="業務委託比較" body="業務委託と雇用の違いを比較" />
            <Related href="/jigyou-keihi-bunrui" title="経費分類" body="勘定科目の分類を確認" />
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
            name: "源泉徴収税計算ツール",
            description: "フリーランス報酬の源泉徴収税額、消費税、差引支払額を計算する無料ツール。",
            url: "https://tools.loresync.dev/tax-calculator",
            applicationCategory: "FinanceApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
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

function SourceLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50"
    >
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
    </a>
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
