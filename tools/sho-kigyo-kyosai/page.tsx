import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ShoKigyoKyosai from "./components/ShoKigyoKyosai";

const faq = [
  {
    q: "小規模企業共済の掛金は全額控除できますか？",
    a: "支払った掛金は、小規模企業共済等掛金控除として全額が所得控除の対象です。このツールでは掛金額を課税所得から差し引いて節税額を概算します。",
  },
  {
    q: "月額掛金はいくらまで設定できますか？",
    a: "月額1,000円から70,000円まで、500円単位で選べます。実際の加入資格や増額・減額の条件は中小機構の公式情報を確認してください。",
  },
  {
    q: "共済金を受け取るときの税金も計算していますか？",
    a: "していません。共済金や解約手当金の税務は受取理由や年数で扱いが変わるため、このツールは毎年の掛金控除による節税額に絞っています。",
  },
  {
    q: "どの所得を入力すればいいですか？",
    a: "ほかの所得控除を差し引いた後、小規模企業共済等掛金控除を入れる前の課税所得を入れると概算しやすいです。確定申告書の最終計算とは差が出る場合があります。",
  },
];

export default function ShoKigyoKyosaiPage() {
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
              <p className="text-sm font-semibold text-emerald-700">フリーランス税務ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">小規模企業共済 節税計算</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                月額掛金と課税所得から、小規模企業共済等掛金控除による所得税・復興特別所得税・住民税の軽減額を概算します。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 shadow-sm">
              <div className="font-semibold text-emerald-950">公式制度ベース</div>
              <p className="mt-2">2026年5月時点で確認した中小機構・国税庁の公式情報をもとに、掛金控除の節税額に絞って計算します。</p>
            </div>
          </div>
        </header>

        <ShoKigyoKyosai />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="全額所得控除" body="年間掛金を課税所得から差し引いて、税額の変化を概算します。" />
          <InfoCard title="実質負担を表示" body="額面掛金から節税額を差し引いた年額・月額の負担感を確認できます。" />
          <InfoCard title="受取時課税は分離" body="共済金や解約手当金の税務は条件差が大きいため、ここでは毎年の節税に絞ります。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">計算方法と注意点</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">節税額の考え方</h3>
              <p className="mt-1">
                掛金を所得控除として差し引く前後で、所得税の速算表を使って税額差を計算します。さらに復興特別所得税2.1%と住民税10%を概算で加えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">入力する課税所得</h3>
              <p className="mt-1">
                事業所得そのものではなく、基礎控除・社会保険料控除などを差し引いた後、小規模企業共済等掛金控除を入れる前の課税所得を入れると近い試算になります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">このツールに含めていないもの</h3>
              <p className="mt-1">
                共済金受取時の退職所得・一時所得の扱い、加入資格、前納減額金、事業廃止時の共済金額、地方自治体ごとの差は含めていません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公式情報</h3>
              <p className="mt-1">掛金範囲、所得控除、所得税率は中小機構・国税庁の公式情報を参照しています。</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="https://www.smrj.go.jp/kyosai/skyosai/index.html" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  中小機構 小規模企業共済
                </a>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1135.htm" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  国税庁 掛金控除
                </a>
                <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  国税庁 所得税率
                </a>
              </div>
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
            <Related href="/tedori-keisan" title="手取り計算" body="給与・賞与の手取りを概算" />
            <Related href="/withholding-tax-calculator" title="源泉徴収税" body="報酬の源泉徴収額を計算" />
            <Related href="/ideco-tax-saving" title="iDeCo節税" body="掛金による所得控除を比較" />
            <Related href="/jigyou-keihi-bunrui" title="経費 勘定科目" body="経費の科目候補を確認" />
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
