import Link from "next/link";
import { tools } from "@/lib/tools-config";
import Converter from "./components/Converter";

const faq = [
  {
    q: "全角と半角は何が違いますか？",
    a: "全角は日本語文字と同じ幅で表示される文字、半角は英数字などで使われる狭い幅の文字です。フォームや古いシステムでは半角英数字を指定されることがあります。",
  },
  {
    q: "半角カタカナに変換しても大丈夫ですか？",
    a: "提出先が半角カタカナを指定している場合は使えます。ただし文字化けや読みにくさの原因になることがあるため、指定がない場合は全角カタカナが無難です。",
  },
  {
    q: "スペースも変換できますか？",
    a: "できます。スペースのオプションを有効にすると、全角スペースと半角スペースを相互変換します。",
  },
  {
    q: "入力したテキストは保存されますか？",
    a: "保存されません。変換処理はブラウザ内で完結し、入力したテキストを外部に送信しません。",
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
              <p className="text-sm font-semibold text-blue-700">日本語テキストツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                全角・半角変換
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                カタカナ、英数字、記号、スペースを個別に選んで全角・半角変換します。住所、氏名、CSV、フォーム入力、古いシステム向けの文字幅調整に使えます。
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 shadow-sm">
              <div className="font-semibold">変換対象を細かく選択</div>
              <p className="mt-2">
                カタカナだけ、英数字だけ、スペースだけなど、必要な文字種だけを変換できます。入力値はブラウザ内で処理されます。
              </p>
            </div>
          </div>
        </header>

        <Converter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="文字種別を選択" body="カタカナ、英数字、記号、スペースを個別にオン・オフできます。" />
          <InfoCard title="自動変換・手動変換" body="入力と同時に変換するか、確認してから変換するかを選べます。" />
          <InfoCard title="コピー・CSV" body="変換結果をコピーしたり、入力・出力・変換条件をCSVで保存できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">全角・半角変換の使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">フォーム入力</h3>
              <p className="mt-1">
                電話番号、郵便番号、メールアドレス、IDなどで半角英数字を求められる場合、英数字と記号だけを半角化できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">CSV前処理</h3>
              <p className="mt-1">
                表記ゆれを減らしたい列に対して、英数字やスペースの幅を統一すると、検索・集計・重複排除がしやすくなります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">半角カタカナ</h3>
              <p className="mt-1">
                古い業務システムで指定されることがあります。一方で文字化けの原因にもなるため、指定がない場合は全角カタカナを推奨します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">スペースの扱い</h3>
              <p className="mt-1">
                見た目では気づきにくい全角スペースを半角に統一したり、提出形式に合わせて半角スペースを全角に変換できます。
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
            <Related href="/moji-count" title="文字数カウント" body="文字数・バイト数・文字種別を確認" />
            <Related href="/hebon-romaji" title="ヘボン式ローマ字" body="氏名のローマ字表記を確認" />
            <Related href="/furigana" title="ふりがな変換" body="漢字かな交じり文の読み確認" />
            <Related href="/text-diff" title="テキスト差分" body="変換前後の違いを比較" />
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
