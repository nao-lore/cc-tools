import Link from "next/link";
import { tools } from "@/lib/tools-config";
import KeihiBunrui from "./components/KeihiBunrui";

const faq = [
  {
    q: "このツールだけで勘定科目を確定していいですか？",
    a: "いいえ。候補表示ツールです。最終的な勘定科目は、実際の用途、領収書、契約内容、継続的な処理方針、税理士や税務署の案内に合わせて判断してください。",
  },
  {
    q: "自宅兼事務所の費用はどう考えますか？",
    a: "家賃、電気代、通信費など私用と事業用が混ざる費用は、事業に直接必要な部分を合理的に按分します。床面積、使用時間、通信量など根拠を残すことが重要です。",
  },
  {
    q: "同じ支出でも違う科目になることがありますか？",
    a: "あります。例えば飲食代でも、会議目的なら会議費、取引先接待なら接待交際費、従業員向けなら福利厚生費など、目的と相手先で変わります。",
  },
  {
    q: "入力した経費内容は保存されますか？",
    a: "保存されません。判定はブラウザ上で完結し、入力した経費内容を外部に送信しません。",
  },
];

const sources = [
  {
    label: "国税庁: 個人で事業を行っている方の記帳・帳簿等の保存",
    href: "https://www.nta.go.jp/taxes/shiraberu/shinkoku/kojin_jigyo/index.htm",
  },
  {
    label: "国税庁: 記帳や帳簿等保存・青色申告",
    href: "https://www.nta.go.jp/publication/pamph/koho/kurashi/html/01_2.htm",
  },
  {
    label: "国税庁: 家事関連費",
    href: "https://www.nta.go.jp/law/tsutatsu/kihon/shotoku/07/01.htm",
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
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-amber-700">個人事業主・経理ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">経費 勘定科目 候補ツール</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                領収書や明細の内容から、旅費交通費、通信費、会議費、接待交際費、消耗品費などの勘定科目候補を表示します。
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 shadow-sm">
              <div className="font-semibold">断定ではなく候補表示</div>
              <p className="mt-2">
                税務判断を自動確定せず、用途・相手先・按分根拠を確認するための補助ツールとして設計しています。
              </p>
            </div>
          </div>
        </header>

        <KeihiBunrui />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="候補を複数表示" body="キーワードが複数の科目に当たる場合、近い候補を最大3つ表示します。" />
          <InfoCard title="注意点を同時表示" body="家事按分、高額備品、源泉徴収など、確認すべきポイントを併記します。" />
          <InfoCard title="メモにコピー" body="候補と注意点をコピーして、会計ソフトの摘要やメモ作成に使えます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">勘定科目を選ぶときの考え方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">用途を先に見る</h3>
              <p className="mt-1">
                同じ支出でも目的で科目が変わります。カフェ代なら、作業場所、会議、接待のどれに近いかを確認します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">継続して同じ処理にする</h3>
              <p className="mt-1">
                同じ性質の支出は、毎月・毎年で処理がぶれないようにします。迷った場合はメモを残して後から確認できるようにします。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">家事按分の根拠</h3>
              <p className="mt-1">
                自宅、スマホ、電気代など私用と事業用が混ざる支出は、事業に直接必要だった部分を説明できるように按分根拠を残します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">帳簿・領収書の保存</h3>
              <p className="mt-1">
                収入金額や必要経費を記載した帳簿、請求書、領収書などは整理して保存します。保存期間や要件は申告区分で変わります。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">参考にした公式情報</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                {source.label}
              </a>
            ))}
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
            <Related href="/tedori-keisan" title="手取り計算" body="年収から手取りを概算" />
            <Related href="/withholding-tax-calculator" title="源泉徴収税" body="報酬の源泉税を計算" />
            <Related href="/consumption-tax-choice" title="消費税判定" body="課税方式の検討メモ" />
            <Related href="/gyomu-itaku-hikaku" title="業務委託比較" body="会社員との収入差を確認" />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools は {toolCount} 個以上の無料オンラインツールを公開しています。
        </footer>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "経費 勘定科目 候補ツール",
              description: "経費内容から個人事業主向けの勘定科目候補と確認ポイントを表示します。",
              url: "https://tools.loresync.dev/jigyou-keihi-bunrui",
              applicationCategory: "FinanceApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
              inLanguage: "ja",
            },
            {
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
            },
          ]),
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
