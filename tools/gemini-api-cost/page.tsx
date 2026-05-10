import Link from "next/link";
import { tools } from "@/lib/tools-config";
import GeminiApiCost from "./components/GeminiApiCost";

const faq = [
  {
    q: "Gemini APIのどの料金を計算していますか？",
    a: "Google AI for DevelopersのGemini Developer API pricingに掲載されているPaid Tierの入力、出力、context caching、storage、Grounding料金を初期値にしています。",
  },
  {
    q: "Standard / Batch / Priorityの違いは？",
    a: "Standardは通常単価、Batchは一部モデルで半額、Priorityは高い優先処理単価として概算します。モデルごとの未対応条件は公式Pricingを確認してください。",
  },
  {
    q: "Groundingの無料枠は反映していますか？",
    a: "Gemini 3系のSearch/Maps Groundingは5,000 queries/月を無料として、超過分を$14/1K queriesで概算しています。2.5系や古い無料枠は用途により異なるため、公式Docsで確認してください。",
  },
  {
    q: "入力した利用量は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力したトークン数や利用量を外部に送信しません。",
  },
];

export default function GeminiApiCostPage() {
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
              <p className="text-sm font-semibold text-blue-700">AI Cost Tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Gemini API 料金計算</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Gemini 3.1 Pro、Gemini 3 Flash、Gemini 2.5 Pro/FlashのAPI料金を、トークン、cache、Grounding込みで概算します。
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 shadow-sm">
              <div className="font-semibold text-blue-950">Google公式Pricingベース</div>
              <p className="mt-2">2026年5月時点で確認したGemini Developer API pricingのPaid Tierを初期値にしています。</p>
            </div>
          </div>
        </header>

        <GeminiApiCost />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="3系/2.5系対応" body="Gemini 3.1、3 Flash、2.5 Pro/Flash/Flash-Liteを同じ画面で比較できます。" />
          <InfoCard title="Cache込み" body="Context caching単価とstorage時間を分けて月額に反映できます。" />
          <InfoCard title="Grounding込み" body="Google SearchとMaps Groundingの無料枠・超過料金も概算できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Gemini API料金の見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">出力にはthinking tokensも含まれる</h3>
              <p className="mt-1">Googleの価格表では、出力価格にthinking tokensが含まれます。推論を強く使うワークロードでは、見かけの回答より出力tokenが増える可能性があります。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">長文promptの単価</h3>
              <p className="mt-1">Pro系は200K tokensを境に入力・出力・cache単価が変わるモデルがあります。このツールは1リクエスト入力が200Kを超える場合に長文単価へ切り替えます。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Grounding課金</h3>
              <p className="mt-1">Google SearchやMaps Groundingは無料枠後にquery単位で課金されます。検索が多いRAGや調査botではtoken費用以外も効きます。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公式情報</h3>
              <p className="mt-1">単価と注意事項はGoogle AI for Developersの公式Pricingページをもとにしています。</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Gemini API Pricing
                </a>
                <a href="https://ai.google.dev/gemini-api/docs/caching" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Context caching
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
            <Related href="/claude-api-cost" title="Claude API料金" body="Anthropicモデルの月額を概算" />
            <Related href="/azure-openai-cost" title="Azure OpenAI料金" body="Azure経由のOpenAI費用を概算" />
            <Related href="/openrouter-pricing" title="OpenRouter料金" body="複数モデルのAPI費用を比較" />
            <Related href="/prompt-token-counter" title="トークン数カウンター" body="プロンプトの長さを事前確認" />
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
