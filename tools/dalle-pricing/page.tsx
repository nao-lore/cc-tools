import Link from "next/link";
import { tools } from "@/lib/tools-config";
import DallePricing from "./components/DallePricing";

const faq = [
  {
    q: "DALL-E料金計算なのにGPT-image-2が出るのはなぜですか？",
    a: "OpenAIの現行API価格ではGPT-image-2が画像生成の主力として掲載されています。DALL-E 3はlegacy比較として残しています。",
  },
  {
    q: "GPT-image-2の料金は1枚固定ですか？",
    a: "いいえ。OpenAI公式価格では画像入力・キャッシュ入力・画像出力のトークン単価で示されています。このツールは品質プリセットごとの出力token目安で概算します。",
  },
  {
    q: "GPT Image 1やDALL-E 3はどう計算していますか？",
    a: "GPT Image 1は公式モデルDocsの品質・サイズ別の1枚あたり価格を、DALL-E 3は公式モデルDocsのper image価格を基準にしています。",
  },
  {
    q: "入力したプロンプトや枚数は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力値を外部に送信しません。",
  },
];

export default function DallePricingPage() {
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
              <p className="text-sm font-semibold text-emerald-700">Image API Cost Tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">OpenAI 画像生成 料金計算</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                GPT-image-2、GPT Image 1、DALL-E 3の画像生成コストを、枚数・品質・サイズ・入力トークンから概算します。
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900 shadow-sm">
              <div className="font-semibold text-emerald-950">OpenAI公式価格ベース</div>
              <p className="mt-2">2026年5月時点で確認したOpenAI API PricingとモデルDocsを初期値にしています。</p>
            </div>
          </div>
        </header>

        <DallePricing />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="現行モデル対応" body="GPT-image-2を主軸に、GPT Image 1とDALL-E 3も比較できます。" />
          <InfoCard title="入力も分離" body="プロンプト、参照画像、キャッシュ入力を分けて概算できます。" />
          <InfoCard title="日本円換算" body="為替レートを変えて、案件や月次予算に近い金額へ変換できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">OpenAI画像生成料金の見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">GPT-image-2はtokenベース</h3>
              <p className="mt-1">
                OpenAIのAPI価格ページでは、GPT-image-2の画像入力、キャッシュ入力、画像出力が100万tokenあたりの単価で掲載されています。生成枚数だけでなく、出力token量の見積もりが重要です。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">旧モデルは1枚単価で比較</h3>
              <p className="mt-1">
                GPT Image 1とDALL-E 3はモデルDocsに品質・サイズ別のper image価格が掲載されています。旧運用との比較や見積もりの下限確認に使えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">このツールに含めていないもの</h3>
              <p className="mt-1">
                Batch API、組織別の条件、税、画像編集時の実際の入力token差、APIレスポンスで返るusageとの差分は含めていません。請求前の概算として使ってください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公式情報</h3>
              <p className="mt-1">価格はOpenAI API Pricing、GPT Image 1、DALL-E 3公式モデルDocsをもとにしています。</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="https://openai.com/api/pricing/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  OpenAI API Pricing
                </a>
                <a href="https://developers.openai.com/api/docs/models/gpt-image-1" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  GPT Image 1
                </a>
                <a href="https://platform.openai.com/docs/models/dall-e-3" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  DALL-E 3
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
            <Related href="/image-compressor" title="画像圧縮" body="生成画像の容量を軽くする" />
            <Related href="/placeholder-image" title="プレースホルダー画像" body="仮画像をすばやく作成" />
            <Related href="/azure-openai-cost" title="Azure OpenAI料金" body="Azure側のAI API費用を概算" />
            <Related href="/ai-cost-calculator" title="AI料金計算" body="主要AI APIの費用を比較" />
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
