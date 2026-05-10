import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AzureOpenAiCost from "./components/AzureOpenAiCost";

const faq = [
  {
    q: "Azure OpenAI Serviceのどの料金を計算していますか？",
    a: "Microsoft Azureの公開価格ページに掲載されているGlobal Standardのトークン単価を初期値にし、入力・キャッシュ入力・出力トークンからAPI利用料を概算します。",
  },
  {
    q: "PTUやBatch APIも含まれますか？",
    a: "このツールは従量課金の概算に絞っています。PTU、Batch API、Priority Processing、契約割引、税、リージョン差は公式のAzure Pricing Calculatorや実際の請求で確認してください。",
  },
  {
    q: "キャッシュ入力率は何を入れればいいですか？",
    a: "同じsystem promptや長い文脈を再利用できる割合です。実装前なら0%で保守的に見積もり、運用後にAzureの利用実績から調整すると安全です。",
  },
  {
    q: "入力値は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力したトークン数や為替レートは外部に送信しません。",
  },
];

export default function AzureOpenAiCostPage() {
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
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Azure OpenAI Service 料金計算</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                GPT-5、GPT-4.1、GPT-4o、o4-miniなどのAzure OpenAI API利用料を、月間リクエスト数と平均トークン数から概算します。
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900 shadow-sm">
              <div className="font-semibold text-blue-950">公式価格ベース</div>
              <p className="mt-2">2026年5月時点で確認したMicrosoft Azure公式価格ページのGlobal Standard単価を初期値にしています。</p>
            </div>
          </div>
        </header>

        <AzureOpenAiCost />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="入力・出力を分離" body="入力、キャッシュ入力、出力の単価差を分けて月額を見積もれます。" />
          <InfoCard title="日本円換算" body="為替レートを変えて、社内予算や月次見積もりに近い金額へ変換できます。" />
          <InfoCard title="ローカル計算" body="トークン数や想定利用量はブラウザ内で処理され、外部送信されません。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Azure OpenAI料金の見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">トークン課金の基本</h3>
              <p className="mt-1">
                Azure OpenAIの従量課金は、モデルごとの入力トークン、キャッシュ入力トークン、出力トークンの単価で決まります。出力単価は入力より高いことが多いため、長い回答を返す設計ほど費用が増えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">キャッシュ入力</h3>
              <p className="mt-1">
                同じプロンプトや長いコンテキストを再利用できる場合、キャッシュ入力単価が使える可能性があります。実際に適用される条件はモデルとAPIの仕様に依存します。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">このツールに含めていないもの</h3>
              <p className="mt-1">
                PTU、Batch API、Priority Processing、契約割引、税、リージョンごとの差、Azure Foundry上の追加機能料金は含めていません。請求前の概算として使ってください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公式情報</h3>
              <p className="mt-1">価格はMicrosoft Azureの公開価格ページとAzure Retail Prices APIの考え方をもとにしています。</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Azure OpenAI Pricing
                </a>
                <a
                  href="https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Azure Retail Prices API
                </a>
                <a
                  href="https://azure.microsoft.com/en-us/pricing/calculator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Pricing Calculator
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
            <Related href="/ai-cost-calculator" title="AI料金計算" body="主要AI APIの概算費用を比較" />
            <Related href="/claude-api-cost" title="Claude API料金" body="Anthropicモデルの月額を計算" />
            <Related href="/gemini-api-cost" title="Gemini API料金" body="Google Gemini APIの費用を概算" />
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
