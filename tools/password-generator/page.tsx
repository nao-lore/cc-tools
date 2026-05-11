import Link from "next/link";
import { tools } from "@/lib/tools-config";
import PasswordGenerator from "./components/PasswordGenerator";

const faq = [
  {
    q: "生成したパスワードは保存されますか？",
    a: "保存されません。生成はブラウザ上で行われ、パスワードをサーバーへ送信しません。",
  },
  {
    q: "どのくらいの長さにすべきですか？",
    a: "短すぎるパスワードは避け、パスワードマネージャーで管理できるなら16文字以上のランダム文字列を推奨します。",
  },
  {
    q: "記号を入れれば安全ですか？",
    a: "記号だけでなく、長さ、ランダム性、使い回しをしないこと、MFAを有効にすることが重要です。",
  },
  {
    q: "サービスごとに違うパスワードが必要ですか？",
    a: "必要です。1つのサービスから漏えいした場合に、他のサービスへ被害が広がるのを防げます。",
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
              <p className="text-sm font-semibold text-sky-700">セキュリティ・開発者ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                パスワード生成ツール
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Web Crypto APIでランダムなパスワードを生成します。文字種、長さ、生成数、紛らわしい文字の除外を調整し、コピーやTXT保存までできます。
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900 shadow-sm">
              <div className="font-semibold text-sky-950">端末内で生成</div>
              <p className="mt-2">
                生成結果はブラウザ内だけで扱います。パスワードマネージャーへの保存とMFAの併用を前提にしてください。
              </p>
            </div>
          </div>
        </header>

        <PasswordGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="暗号学的乱数" body="Web Crypto APIの乱数を使い、Math.randomには依存しません。" />
          <InfoCard title="使い回し防止" body="生成数を増やして、サービスごとに別パスワードを用意できます。" />
          <InfoCard title="管理しやすい出力" body="個別コピー、全件コピー、TXT保存でパスワードマネージャーへ移せます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">安全な使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">長くランダムにする</h3>
              <p className="mt-1">
                人間が考えた規則的な文字列より、十分な長さのランダム文字列の方が推測されにくくなります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">使い回さない</h3>
              <p className="mt-1">
                同じパスワードを複数サービスで使うと、1件の漏えいが他のアカウントに波及します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">パスワードマネージャーに保存する</h3>
              <p className="mt-1">
                ランダムで長いパスワードは覚えず、信頼できるパスワードマネージャーで管理するのが現実的です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">MFAを有効にする</h3>
              <p className="mt-1">
                強いパスワードだけではフィッシングや漏えいを防ぎきれません。重要アカウントではMFAを併用してください。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">参考情報</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <SourceLink
              href="https://pages.nist.gov/800-63-4/sp800-63b.html"
              title="NIST SP 800-63B"
              body="Digital Identity Guidelines"
            />
            <SourceLink
              href="https://www.cisa.gov/secure-our-world/require-strong-passwords"
              title="CISA strong passwords"
              body="Long, random, unique passwords"
            />
            <SourceLink
              href="https://www.cisa.gov/mfa"
              title="CISA MFA"
              body="Why multifactor authentication matters"
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
            <Related href="/hash-generator" title="Hash Generator" body="文字列のハッシュ値を生成" />
            <Related href="/uuid-generator" title="UUID Generator" body="ランダムUUIDを生成" />
            <Related href="/jwt-decoder" title="JWT Decoder" body="JWTのpayloadを確認" />
            <Related href="/base64-tools" title="Base64 Tools" body="Base64の変換と確認" />
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
            name: "パスワード生成ツール",
            description: "Web Crypto APIでランダムなパスワードをブラウザ内生成する無料ツール。",
            url: "https://tools.loresync.dev/password-generator",
            applicationCategory: "SecurityApplication",
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
