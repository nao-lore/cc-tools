import Link from "next/link";
import { tools } from "@/lib/tools-config";
import AiCostCalculator from "./components/AiCostCalculator";

const faq = [
  {
    q: "この計算結果は実際の請求額と一致しますか？",
    a: "一致を保証するものではありません。公開料金をもとに、入力・cached input・出力トークンの主要部分だけを概算します。ツール利用料、データ所在地、税金、無料枠、契約割引は別途確認してください。",
  },
  {
    q: "cached inputとは何ですか？",
    a: "同じ長いプロンプトやシステム指示を繰り返し使う場合に、キャッシュされた入力として低い単価で課金されることがあるトークンです。各社で適用条件は異なります。",
  },
  {
    q: "Batchモードはいつ使いますか？",
    a: "即時応答が不要な一括処理、要約、分類、データ整形などに向きます。通常は安くなりますが、レイテンシや対応モデル、cached inputの扱いを確認してください。",
  },
  {
    q: "貼り付けたテキストは送信されますか？",
    a: "送信されません。トークン概算も料金計算もブラウザ内で完結します。",
  },
];

export default function AiCostCalculatorPage() {
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
              <p className="text-sm font-semibold text-emerald-700">AI・LLM料金ツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                AI APIコスト計算ツール
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                OpenAI、Claude、GeminiのAPI料金を、入力・cached input・出力トークン、リクエスト数、Batch利用の有無から概算します。
                モデル別の月額比較、円換算、プロンプト文量のトークン概算にも対応しています。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">料金確認日</div>
              <div className="mt-2 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-white">2026-05-11</div>
              <p className="mt-2">公式価格ページをもとにした概算です。実装前に必ず各社の最新料金を再確認してください。</p>
            </div>
          </div>
        </header>

        <AiCostCalculator />

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">料金前提と公式ソース</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">OpenAI</h3>
              <p className="mt-1">GPT-5.5、GPT-5.4、GPT-5.4 mini/nanoの標準/Batch/cached input単価を使用しています。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Anthropic Claude</h3>
              <p className="mt-1">Claude Opus 4.7、Sonnet 4.6、Haiku 4.5の入力・cache read・出力単価を使い、Batchは50%割引として扱います。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Google Gemini</h3>
              <p className="mt-1">Gemini 3.1 Pro Preview、Gemini 2.5 Pro/Flash/Flash-Liteの標準単価とBatch単価を反映しています。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">公式リンク</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Source href="https://platform.openai.com/docs/pricing" label="OpenAI pricing" />
                <Source href="https://platform.claude.com/docs/en/about-claude/pricing" label="Claude pricing" />
                <Source href="https://ai.google.dev/gemini-api/docs/pricing" label="Gemini pricing" />
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
            <Related href="/context-window-visualizer" title="コンテキスト長比較" body="モデルごとの長文入力上限を確認" />
            <Related href="/embedding-cost-calculator" title="Embedding料金計算" body="埋め込みAPIの月額費用を概算" />
            <Related href="/fine-tuning-cost" title="Fine-tuning料金" body="学習と推論のコストを確認" />
            <Related href="/openrouter-pricing" title="OpenRouter料金比較" body="複数モデルの単価を横断比較" />
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

function Source({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
      {label}
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
