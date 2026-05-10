import Link from "next/link";
import { tools } from "@/lib/tools-config";
import UrlEncoder from "./components/UrlEncoder";

const faq = [
  {
    q: "encodeURIとencodeURIComponentはどう違いますか？",
    a: "encodeURIはURL全体向けで、https:// や ? や & などの構造を残します。encodeURIComponentはクエリ値やパス断片向けで、& や = もエンコードします。",
  },
  {
    q: "クエリパラメータの値にはどれを使うべきですか？",
    a: "検索語、ID、名前などをクエリ値として入れる時はencodeURIComponentを使います。値に & や = が含まれてもクエリ構造を壊しにくいためです。",
  },
  {
    q: "URLデコードでエラーになるのはなぜですか？",
    a: "% の後に16進数2桁がない、途中で壊れたUTF-8バイト列がある、などの文字列はdecodeURIComponentでエラーになります。",
  },
  {
    q: "入力したURLや文字列は保存されますか？",
    a: "保存されません。変換、URL分解、クエリ生成はブラウザ内で完結し、入力値を外部に送信しません。",
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
              <p className="text-sm font-semibold text-cyan-700">開発者ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                URLエンコード・デコード
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                URL、クエリパラメータ、パス断片をパーセントエンコード・デコードします。URL分解、クエリ文字列生成、よく使うエンコード表もまとめて確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900 shadow-sm">
              <div className="font-semibold">ブラウザ内で処理</div>
              <p className="mt-2">
                入力したURLやパラメータは外部に送信されません。APIリクエスト、UTM、リダイレクトURL、検索パラメータの確認に使えます。
              </p>
            </div>
          </div>
        </header>

        <UrlEncoder />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="URL全体と値を分ける" body="URL全体にはencodeURI、クエリ値にはencodeURIComponentを使うのが基本です。" />
          <InfoCard title="URL分解" body="protocol、host、path、query、fragmentを分けて表示し、複雑なURLを読みやすくします。" />
          <InfoCard title="クエリ生成" body="key/valueを入力すると、エンコード済みのクエリ文字列を生成できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">URLエンコードの使い分け</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">encodeURI</h3>
              <p className="mt-1">
                URL全体を扱う時に使います。`:` `/` `?` `&` `=` など、URL構造として意味を持つ文字は残します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">encodeURIComponent</h3>
              <p className="mt-1">
                クエリパラメータのkeyやvalue、パスの一部など、URLの部品を扱う時に使います。`&` や `=` も安全にエンコードします。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Strict percent</h3>
              <p className="mt-1">
                英数字、ハイフン、アンダースコア、ドット、チルダ以外をできるだけ%表記にします。署名用文字列や厳格なAPI確認の補助に使えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">デコード時の注意</h3>
              <p className="mt-1">
                壊れた%表記や途中で切れたUTF-8バイト列はデコードできません。エラーが出た場合は、%の後ろが16進数2桁になっているか確認してください。
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
            <Related href="/base64-tools" title="Base64変換" body="Base64のエンコード・デコード" />
            <Related href="/html-entity" title="HTMLエンティティ" body="HTML特殊文字を変換" />
            <Related href="/jwt-decoder" title="JWTデコード" body="JWTのヘッダーとペイロード確認" />
            <Related href="/json-formatter" title="JSON整形" body="JSONを整形・検証" />
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
