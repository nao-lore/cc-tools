import Link from "next/link";
import { tools } from "@/lib/tools-config";
import HashGenerator from "./components/HashGenerator";

const faq = [
  {
    q: "MD5やSHA-1は使っても大丈夫ですか？",
    a: "MD5とSHA-1は衝突攻撃に弱いため、セキュリティ用途には推奨しません。古いシステムとの照合や非セキュリティのチェックサム確認向けです。",
  },
  {
    q: "パスワード保存にこのハッシュを使えますか？",
    a: "使わないでください。パスワード保存にはソルト付きのbcrypt、scrypt、Argon2など、専用のパスワードハッシュ方式を使うべきです。",
  },
  {
    q: "ファイルはサーバーに送信されますか？",
    a: "送信されません。テキストとファイルはブラウザ上で処理され、外部サーバーにアップロードされません。",
  },
  {
    q: "大文字と小文字の違いはありますか？",
    a: "ハッシュ値の16進表記は大文字でも小文字でも同じ値を表します。比較機能では大文字小文字を無視して判定します。",
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
              <p className="text-sm font-semibold text-indigo-700">開発者・検証ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Hash Generator</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                テキストやファイルから MD5、SHA-1、SHA-256、SHA-384、SHA-512 をまとめて生成します。値のコピー、TXT出力、ハッシュ比較に対応しています。
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-indigo-950 shadow-sm">
              <div className="font-semibold">ブラウザ内処理</div>
              <p className="mt-1">入力テキストやファイルは外部に送信されません。</p>
            </div>
          </div>
        </header>

        <HashGenerator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="SHA-256推奨" body="セキュリティ用途ではSHA-256以上を使い、MD5/SHA-1は互換確認に限定します。" />
          <InfoCard title="ファイル照合" body="配布元のハッシュ値と照合し、改ざんや転送破損を確認できます。" />
          <InfoCard title="まとめてコピー" body="すべてのアルゴリズム結果をタブ区切りでコピーできます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">ハッシュ値の使い分け</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">SHA-256 / SHA-384 / SHA-512</h3>
              <p className="mt-1">
                現在の一般的な整合性確認や署名検証ではSHA-2系を使います。迷った場合はSHA-256を選ぶのが実務上わかりやすいです。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">MD5 / SHA-1</h3>
              <p className="mt-1">
                古いチェックサムや既存システムとの照合で使われることがありますが、衝突攻撃に弱いため新規のセキュリティ設計には使いません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">ファイル完全性確認</h3>
              <p className="mt-1">
                ダウンロードしたファイルのハッシュ値を公式値と比較すると、転送中の破損や意図しない変更を検知できます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">パスワード保存には不十分</h3>
              <p className="mt-1">
                通常のハッシュは高速すぎるため、パスワード保存には向きません。bcrypt、scrypt、Argon2などの専用方式を使ってください。
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
            <Related href="/base64-tools" title="Base64 Tools" body="テキストやデータをBase64変換" />
            <Related href="/password-generator" title="Password Generator" body="ランダムパスワードを生成" />
            <Related href="/uuid-generator" title="UUID Generator" body="UUID v4を生成" />
            <Related href="/jwt-decoder" title="JWT Decoder" body="JWTのヘッダーとペイロードを確認" />
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
            name: "Hash Generator",
            description: "テキストやファイルから MD5、SHA-1、SHA-256、SHA-384、SHA-512 を生成するブラウザ内処理の無料ツールです。",
            url: "https://tools.loresync.dev/hash-generator",
            applicationCategory: "DeveloperApplication",
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
