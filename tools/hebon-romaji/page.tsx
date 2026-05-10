import Link from "next/link";
import { tools } from "@/lib/tools-config";
import HebonRomaji from "./components/HebonRomaji";

const faq = [
  {
    q: "ヘボン式ローマ字とは何ですか？",
    a: "日本語の読みを英語話者が発音しやすい形に近づけたローマ字表記です。パスポートの氏名表記では、戸籍氏名をヘボン式ローマ字で表記することが基本とされています。",
  },
  {
    q: "パスポート申請にそのまま使えますか？",
    a: "このツールは読み仮名からの確認補助です。外務省はヘボン式ローマ字綴方表を参照し、不明点は申請窓口に照会するよう案内しています。申請前に必ず窓口の案内を確認してください。",
  },
  {
    q: "「ん」はNとMのどちらですか？",
    a: "B、M、Pの前に来る「ん」はMとして扱います。例として「しんばし」はSHIMBASHIになります。それ以外は基本的にNで表します。",
  },
  {
    q: "漢字から直接ローマ字にできますか？",
    a: "できません。漢字の読み取りは人名ごとの読み方が必要なため、先にひらがな・カタカナの読みを入力してください。",
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
              <p className="text-sm font-semibold text-emerald-700">日本語変換ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                ヘボン式ローマ字変換
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                ひらがな・カタカナの読みをヘボン式ローマ字へ変換します。パスポート用の大文字表記、長音省略の目安、B/M/P前の「ん→M」に対応します。
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 shadow-sm">
              <div className="font-semibold">申請前に窓口確認</div>
              <p className="mt-2">
                パスポートの氏名表記は変更が難しい重要情報です。このツールは確認補助として使い、最終判断は申請窓口や外務省案内を確認してください。
              </p>
            </div>
          </div>
        </header>

        <HebonRomaji />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="パスポート用表記" body="大文字、長音省略の目安、B/M/P前のN→M変換に対応します。" />
          <InfoCard title="ひらがな・カタカナ対応" body="氏名の読み仮名を入力して変換します。漢字の読み取りは行いません。" />
          <InfoCard title="コピー・CSV" body="結果をコピーしたり、入力と変換結果をCSVとして保存できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">ヘボン式ローマ字の主なルール</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">訓令式との違い</h3>
              <p className="mt-1">
                し=SHI、ち=CHI、つ=TSU、ふ=FU のように表記します。訓令式の SI、TI、TU、HU とは異なります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">撥音「ん」</h3>
              <p className="mt-1">
                B、M、Pの前ではMに変えます。しんばしはSHIMBASHI、なんばはNAMBA、さんぽはSAMPOになります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">長音</h3>
              <p className="mt-1">
                パスポート用では長音を省略する目安で表示します。とうきょうはTOKYO、おおさかはOSAKAのように扱います。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">例外表記</h3>
              <p className="mt-1">
                生活実態のある非ヘボン式表記や別名併記は例外扱いになる場合があります。該当する場合は申請窓口で確認してください。
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="https://www.mofa.go.jp/mofaj/toko/passport/pass_4.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              外務省 パスポートQ&A
            </a>
            <a
              href="https://www.mofa.go.jp/mofaj/toko/passport/download/faq.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              外務省 申請書FAQ
            </a>
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
            <Related href="/furigana" title="ふりがな変換" body="漢字かな交じり文の読み確認" />
            <Related href="/zenkaku-hankaku" title="全角・半角変換" body="英数字や記号の幅を変換" />
            <Related href="/moji-count" title="文字数カウント" body="氏名や入力欄の文字数確認" />
            <Related href="/wareki-converter" title="和暦変換" body="生年月日の和暦・西暦確認" />
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
