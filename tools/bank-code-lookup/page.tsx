import Link from "next/link";
import { tools } from "@/lib/tools-config";
import BankCodeLookup from "./components/BankCodeLookup";

const faq = [
  {
    q: "銀行コードと金融機関コードは同じですか？",
    a: "一般的には同じ4桁のコードを指します。振込や口座登録では、銀行名とあわせて銀行コードまたは金融機関コードとして使われます。",
  },
  {
    q: "支店コードと店番号は同じですか？",
    a: "多くの場合、支店コード・店番号・店番は同じ3桁の番号を指します。ただし金融機関ごとの表記を優先してください。",
  },
  {
    q: "このツールだけで振込情報を確定してよいですか？",
    a: "確定用途では、必ず金融機関の公式サイト、アプリ、通帳、キャッシュカード、振込画面で確認してください。支店統廃合や名称変更で情報が変わることがあります。",
  },
  {
    q: "全金融機関・全支店に対応していますか？",
    a: "現時点では主要銀行と代表的な支店の簡易検索です。全国の信用金庫、信用組合、農協、全支店を網羅する完全データベースではありません。",
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
              <p className="text-sm font-semibold text-sky-700">銀行・振込確認ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                銀行コード・支店コード検索
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                銀行名、銀行コード、支店名、支店コードから主要銀行のコードを検索できます。振込前の下調べや帳票入力の確認に使えます。
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 shadow-sm">
              <div className="font-semibold text-sky-950">正式確認は金融機関側で</div>
              <p className="mt-2">
                支店統廃合や名称変更があるため、実際の振込・口座登録では金融機関の公式情報を必ず確認してください。
              </p>
            </div>
          </div>
        </header>

        <BankCodeLookup />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="コードをコピー" body="銀行コード、支店コード、銀行・支店の組み合わせをワンクリックでコピーできます。" />
          <InfoCard title="銀行・支店を切替検索" body="銀行名/コード検索と支店名/コード検索を切り替えて使えます。" />
          <InfoCard title="ローカル検索" body="検索はブラウザ内の簡易データで行い、入力した内容は外部に送信しません。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">銀行コードを探す</h3>
              <p className="mt-1">
                検索対象を「銀行」にして、銀行名、よみがな、4桁の銀行コードを入力します。該当銀行の代表的な支店コードも一覧表示します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">支店コードを探す</h3>
              <p className="mt-1">
                検索対象を「支店」にして、支店名または3桁の支店コードを入力します。同じ支店名を持つ複数銀行がある場合も並べて確認できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">口座登録時の注意</h3>
              <p className="mt-1">
                銀行名・支店名が合っていても、口座種別や口座番号、名義が違うと登録や振込に失敗します。最終確認は振込画面や金融機関公式情報で行ってください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">データ範囲</h3>
              <p className="mt-1">
                このページは主要銀行の簡易検索です。完全な全国金融機関コードデータベースではないため、見つからない場合は金融機関公式サイトを確認してください。
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
            <Related href="/invoice-qualified-checker" title="インボイス登録番号チェック" body="登録番号の形式を確認" />
            <Related href="/jigyou-keihi-bunrui" title="経費 勘定科目 判別" body="仕訳の候補を確認" />
            <Related href="/zei-kin-henkan" title="税込・税抜変換" body="税率別に金額を変換" />
            <Related href="/json-to-csv" title="JSON to CSV" body="表データの整形に利用" />
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
