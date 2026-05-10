import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ImageCompressor from "./components/ImageCompressor";

const faq = [
  {
    q: "画像はサーバーにアップロードされますか？",
    a: "アップロードされません。画像の読み込み、リサイズ、圧縮、ダウンロード用ファイルの生成はすべてブラウザ上で行います。",
  },
  {
    q: "WebP、JPEG、PNG のどれを選ぶべきですか？",
    a: "Web掲載ならWebP、互換性重視ならJPEG、透過や線画を残したい場合はPNGが向いています。PNGは品質設定によるサイズ変化が小さい場合があります。",
  },
  {
    q: "圧縮後にファイルサイズが増えることはありますか？",
    a: "あります。すでに最適化された画像を別形式へ変換した場合や、PNGへ変換した場合はサイズが増えることがあります。結果の削減率を見て判断してください。",
  },
  {
    q: "複数画像をまとめて処理できますか？",
    a: "できます。複数ファイルを一括選択またはドラッグ&ドロップし、設定を選んでからまとめて圧縮できます。",
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
              <p className="text-sm font-semibold text-emerald-700">画像ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">画像圧縮ツール</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                JPEG、PNG、WebP画像をブラウザ内で圧縮します。品質、出力形式、最大サイズを調整して、Web掲載・SNS投稿・メール添付向けに軽量化できます。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 shadow-sm">
              <div className="font-semibold">ローカル処理</div>
              <p className="mt-1">画像は外部に送信されません。Canvas APIで端末内処理します。</p>
            </div>
          </div>
        </header>

        <ImageCompressor />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="一括処理" body="複数画像をまとめて選択し、同じ設定で圧縮できます。" />
          <InfoCard title="形式変換" body="WebP、JPEG、PNGを選択し、用途に合わせて出力できます。" />
          <InfoCard title="結果コピー" body="圧縮後のサイズ、削減率、出力名をタブ区切りでコピーできます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">画像圧縮の使い分け</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">WebPはWeb掲載向け</h3>
              <p className="mt-1">
                ほとんどの現代ブラウザで使える軽量形式です。写真やスクリーンショットをWebサイトに載せる場合は、まずWebP 75〜85%を試すのが実用的です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">JPEGは互換性重視</h3>
              <p className="mt-1">
                古いCMS、入稿システム、メール添付など、受け取り側の互換性を優先する場合はJPEGが無難です。写真向けで、透過は保持できません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">PNGは透過・線画向け</h3>
              <p className="mt-1">
                ロゴ、UI画像、透過素材、線が多い画像に向いています。写真をPNGにすると重くなることがあるため、削減率を確認してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">リサイズも重要</h3>
              <p className="mt-1">
                4000px幅の写真を800px幅で表示するなら、圧縮だけでなく最大幅を指定すると大きく軽量化できます。表示サイズに近い寸法へ落とすのが基本です。
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
            <Related href="/image-to-base64" title="画像→Base64変換" body="画像をData URIへ変換" />
            <Related href="/svg-to-png" title="SVG→PNG変換" body="SVG素材をPNG画像に変換" />
            <Related href="/favicon-generator" title="Favicon生成" body="サイト用アイコンを作成" />
            <Related href="/qr-generator" title="QRコード生成" body="URLやテキストをQR化" />
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
            "@type": "WebApplication",
            name: "画像圧縮ツール",
            description: "JPEG、PNG、WebP画像をブラウザ内で圧縮し、品質・形式・最大サイズを調整できる無料ツールです。",
            url: "https://tools.loresync.dev/image-compressor",
            applicationCategory: "UtilityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
          }),
        }}
      />
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
