import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ClaudeApiCost from "./components/ClaudeApiCost";

const faq = [
  {
    q: "どのClaudeモデル価格を使っていますか？",
    a: "Anthropic公式DocsのModel pricingに掲載されているClaude Opus 4.7、Opus 4.6、Sonnet 4.6、Haiku 4.5、Haiku 3.5のUSD/MTok単価を初期値にしています。",
  },
  {
    q: "Prompt cachingはどう計算していますか？",
    a: "5分キャッシュ書き込み、キャッシュヒット、通常入力を分けて計算します。公式Docsでは5分書き込みは1.25x、1時間書き込みは2x、キャッシュヒットは0.1xの考え方です。このツールは5分書き込み単価で概算します。",
  },
  {
    q: "Batch API割引は含められますか？",
    a: "はい。Batch APIをオンにすると、入力・出力・キャッシュ系の概算を50%割引として計算します。リアルタイム用途ではなく非同期処理向けです。",
  },
  {
    q: "入力した利用量は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力したトークン数や想定利用量を外部に送信しません。",
  },
];

export default function ClaudeApiCostPage() {
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
              <p className="text-sm font-semibold text-amber-700">AI Cost Tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Claude API 料金計算</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Anthropic Claude APIの月額を、通常入力、Prompt caching、出力、Batch API、Web searchまで分けて概算します。
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 shadow-sm">
              <div className="font-semibold text-amber-950">公式Docsベース</div>
              <p className="mt-2">2026年5月時点で確認したAnthropic公式Pricing DocsのModel pricingを初期値にしています。</p>
            </div>
          </div>
        </header>

        <ClaudeApiCost />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="キャッシュを分離" body="通常入力、5分キャッシュ書き込み、キャッシュヒットを分けて見積もれます。" />
          <InfoCard title="Batch/Residency対応" body="Batch APIの50%割引とUS-only inferenceの1.1倍を切り替えられます。" />
          <InfoCard title="Web search込み" body="Claude APIのWeb search利用料も月間search数から概算できます。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Claude API料金の見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">MTok単価</h3>
              <p className="mt-1">
                Anthropicの価格表はMTok、つまり100万トークンあたりのUSD単価で表示されます。入力より出力が高いため、長い回答やコード生成では出力側の費用が支配的になります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Prompt caching</h3>
              <p className="mt-1">
                固定プロンプト、ドキュメント、長い会話履歴を再利用できる場合、キャッシュヒット単価で大きく下げられます。初回はキャッシュ書き込み料金がかかります。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Batch API</h3>
              <p className="mt-1">
                非同期の大量処理ならBatch APIの50%割引が使える場合があります。即時応答が必要なチャットやエージェント操作には向きません。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公式情報</h3>
              <p className="mt-1">価格、Prompt caching、Batch API、Web searchの説明はAnthropic公式Docsをもとにしています。</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="https://platform.claude.com/docs/en/about-claude/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Claude API Pricing
                </a>
                <a
                  href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Prompt caching
                </a>
                <a
                  href="https://docs.anthropic.com/en/docs/build-with-claude/batch-processing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batch processing
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
            <Related href="/azure-openai-cost" title="Azure OpenAI料金" body="Azure経由のOpenAI API費用を概算" />
            <Related href="/gemini-api-cost" title="Gemini API料金" body="Google Gemini APIの費用を概算" />
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
