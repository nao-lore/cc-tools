import Link from "next/link";
import { tools } from "@/lib/tools-config";
import OvenTempConverter from "./components/OvenTempConverter";

const faq = [
  {
    q: "華氏350°Fは摂氏何度ですか？",
    a: "華氏350°Fは約177°Cです。家庭用オーブンでは180°C設定に丸めて使われることが多い温度です。",
  },
  {
    q: "ガスマーク4は何度ですか？",
    a: "ガスマーク4は約180°C、約350°Fの目安です。英国系レシピの中温としてよく使われます。",
  },
  {
    q: "ファン付きオーブンでは何度下げればいいですか？",
    a: "一般的にはレシピ指定より20°Cほど低くする目安があります。ただし機種差が大きいため、焼き色や火通りを見ながら調整してください。",
  },
  {
    q: "海外レシピの温度はそのまま設定して大丈夫ですか？",
    a: "大型オーブンやガスオーブン前提のレシピは、日本の家庭用オーブンと焼き上がりが変わることがあります。変換後の温度を基準に、時間と焼き色で調整してください。",
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
              <p className="text-sm font-semibold text-orange-700">料理・レシピツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                <span className="block sm:inline">オーブン温度換算</span>
                {" "}
                <span className="block sm:inline">ツール</span>
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                摂氏、華氏、ガスマークを相互変換します。海外レシピの350°F、375°F、Gas Mark 4などを、日本の家庭用オーブンで使いやすい温度に確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-900 shadow-sm">
              <div className="font-semibold">焼き加減は機種差があります</div>
              <p className="mt-2">
                変換値は温度設定の目安です。家庭用オーブンは庫内温度がずれることがあるため、予熱、焼き色、中心温度、焼き時間もあわせて調整してください。
              </p>
            </div>
          </div>
        </header>

        <OvenTempConverter />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="摂氏・華氏変換" body="°C = (°F - 32) × 5 ÷ 9、°F = °C × 9 ÷ 5 + 32 で計算します。" />
          <InfoCard title="ガスマーク対応" body="英国系レシピで使われる Gas Mark 1〜9 を、摂氏・華氏の目安に換算します。" />
          <InfoCard title="ファン付き目安" body="コンベクションやファン付きオーブン向けに、20°C下げた目安も表示します。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">オーブン温度換算の使い方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">華氏から摂氏へ</h3>
              <p className="mt-1">
                アメリカ系レシピの350°Fは約177°C、375°Fは約191°Cです。家庭用オーブンでは180°Cや190°Cに丸めて設定することが多いです。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">ガスマークの読み替え</h3>
              <p className="mt-1">
                Gas Mark 4は約180°C、Gas Mark 6は約200°Cの目安です。英国系レシピを日本のオーブン設定に直す時に使えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">ファン付きオーブン</h3>
              <p className="mt-1">
                ファン付きオーブンは熱が回りやすいため、レシピ温度から20°C程度下げる目安を併記しています。最終的には焼き色と火通りを確認してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">焼き時間は自動換算しない</h3>
              <p className="mt-1">
                温度を変えると焼き時間も変わりますが、生地量、型、庫内サイズ、予熱状態で差が大きいため、このツールでは温度換算だけに絞っています。
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
            <Related href="/measuring-converter" title="計量スプーン換算" body="大さじ・小さじ・グラムを換算" />
            <Related href="/recipe-scaling" title="レシピ分量調整" body="人数に合わせて材料を倍率計算" />
            <Related href="/calorie-keisan" title="カロリー計算" body="食事と運動の目安を確認" />
            <Related href="/bmi-keisan" title="BMI計算" body="標準体重と普通体重範囲を計算" />
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
