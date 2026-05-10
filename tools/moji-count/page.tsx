import Link from "next/link";
import { tools } from "@/lib/tools-config";
import { MojiCounter } from "./components/MojiCounter";

const faq = [
  {
    q: "スペースあり・なしの文字数はどう違いますか？",
    a: "スペースありは空白、タブ、改行を含めた文字数です。スペースなしはそれらの空白文字を除いた本文量の目安です。",
  },
  {
    q: "日本語の単語数は正確に数えられますか？",
    a: "このツールの単語数は空白区切りの目安です。日本語は単語の境界が明示されないため、厳密な単語数には形態素解析が必要です。",
  },
  {
    q: "UTF-8とShift_JISのバイト数が違うのはなぜですか？",
    a: "UTF-8では日本語が主に3バイト、Shift_JISでは多くの日本語文字が2バイトとして扱われます。このツールのShift_JISは実務確認用の概算です。",
  },
  {
    q: "入力した文章は保存されますか？",
    a: "保存されません。カウント処理はブラウザ内で完結し、入力したテキストを外部に送信しません。",
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
              <p className="text-sm font-semibold text-sky-700">日本語テキストツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">文字数カウント</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                日本語テキストの文字数、スペースなし文字数、行数、段落数、UTF-8バイト数、Shift_JIS概算バイト数、ひらがな・カタカナ・漢字の内訳を確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 shadow-sm">
              <div className="font-semibold">ブラウザ内でカウント</div>
              <p className="mt-2">
                入力した文章は外部に送信されません。SNS投稿、メタ説明、応募文、メール文面などの長さ確認に使えます。
              </p>
            </div>
          </div>
        </header>

        <MojiCounter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="文字数制限の確認" body="SNS投稿、フォーム入力、メタ説明、メール件名などの上限確認に使えます。" />
          <InfoCard title="バイト数の目安" body="UTF-8とShift_JIS概算を並べて、データベースや古いフォームの上限確認を補助します。" />
          <InfoCard title="日本語の内訳" body="ひらがな、カタカナ、漢字、英数字、全角・半角の構成を確認できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">文字数カウントの使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">スペースあり文字数</h3>
              <p className="mt-1">
                入力した文字、空白、タブ、改行をすべて含めた数です。投稿欄やフォームの文字数制限は、この値に近い扱いになることが多いです。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">スペースなし文字数</h3>
              <p className="mt-1">
                空白類を除いた本文量です。原稿量、要約文、応募文など、実質的な文章量を見たい時に便利です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">バイト数</h3>
              <p className="mt-1">
                文字数とバイト数は違います。UTF-8では日本語が主に3バイト、Shift_JISでは多くの日本語文字が2バイトになるため、保存容量の目安が変わります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">文字種別</h3>
              <p className="mt-1">
                全角、半角、ひらがな、カタカナ、漢字、英数字、記号を分けて表示します。表記ゆれや文章の日本語比率を見る時に使えます。
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
