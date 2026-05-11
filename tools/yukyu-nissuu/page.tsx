import Link from "next/link";
import { tools } from "@/lib/tools-config";
import YukyuNissuu from "./components/YukyuNissuu";

const faq = [
  {
    q: "有給休暇はいつ発生しますか？",
    a: "雇入れの日から6か月継続勤務し、その期間の全労働日の8割以上出勤した場合に、原則10日の年次有給休暇が発生します。",
  },
  {
    q: "パート・アルバイトでも有給はありますか？",
    a: "あります。週所定労働時間が30時間以上、週5日以上、年間217日以上の場合は通常付与、週30時間未満で労働日数が少ない場合は比例付与になります。",
  },
  {
    q: "年5日の取得義務は誰が対象ですか？",
    a: "法定の年次有給休暇付与日数が10日以上のすべての労働者が対象です。使用者は基準日から1年以内に5日分を取得させる必要があります。",
  },
  {
    q: "有給休暇は何年で消えますか？",
    a: "年休権は発生日から2年間行使可能とされています。会社独自の上乗せ休暇や特別休暇は就業規則を確認してください。",
  },
];

export default function YukyuNissuuPage() {
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
              <p className="text-sm font-semibold text-emerald-700">労務・働き方ツール</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                有給休暇日数計算ツール
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                入社日、基準日、週所定労働日数、週30時間以上かどうかから、年次有給休暇の法定付与日数を計算します。
                パート・アルバイトの比例付与、年5日の取得義務、2年時効の繰越目安も確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">根拠</div>
              <div className="mt-2 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-white">
                労基法39条 / 2026-05-11確認
              </div>
              <p className="mt-2">厚生労働省の付与日数表と年5日取得義務の解説をもとにした概算です。</p>
            </div>
          </div>
        </header>

        <YukyuNissuu />

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">公式情報</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <SourceLink
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/faq/kijyunhou_6_00001.html"
              title="厚生労働省 FAQ"
              body="通常付与・比例付与の表"
            />
            <SourceLink
              href="https://hatarakikatakaikaku.mhlw.go.jp/salaried.html"
              title="年5日の時季指定"
              body="使用者の取得義務"
            />
            <SourceLink
              href="https://www.check-roudou.mhlw.go.jp/study/roudousya_yukyu.html"
              title="確かめよう労働条件"
              body="時効・管理簿・取得義務"
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
            <Related href="/zangyou-dai" title="残業代計算" body="割増賃金と残業代を概算" />
            <Related href="/tedori-keisan" title="手取り計算" body="給与から手取り額を概算" />
            <Related href="/gyomu-itaku-hikaku" title="業務委託比較" body="雇用と委託の収入差を確認" />
            <Related href="/meeting-cost" title="会議コスト計算" body="会議時間と人件費を可視化" />
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

function SourceLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">
      <div className="font-semibold text-slate-950">{title}</div>
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
