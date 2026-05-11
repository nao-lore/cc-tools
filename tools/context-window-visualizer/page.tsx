import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ContextWindowVisualizer from "./components/ContextWindowVisualizer";

const faq = [
  {
    q: "コンテキストウィンドウとは何ですか？",
    a: "モデルが1回のリクエストで参照できる入力、会話履歴、ツール結果、出力予定分を含む作業メモリの上限です。学習データの量とは別物です。",
  },
  {
    q: "大きいコンテキストなら常に高精度ですか？",
    a: "いいえ。長い文脈を入れられることと、必要情報を正確に取り出せることは別です。重要な情報を整理し、不要な履歴やツール結果を圧縮する設計が必要です。",
  },
  {
    q: "文字数からトークン数への換算は正確ですか？",
    a: "概算です。言語、記号、コード、空白、トークナイザで変わります。正確な値は各社APIのtoken counting機能やSDKで確認してください。",
  },
  {
    q: "入力した文字数は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力値を外部に送信しません。",
  },
];

export default function ContextWindowVisualizerPage() {
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
              <p className="text-sm font-semibold text-emerald-700">AI・LLMツール</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">LLMコンテキスト長比較</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                OpenAI、Claude、Gemini の長文入力上限を、トークン数、文字数、A4ページ、書籍換算で比較します。入力文量がどのモデルに収まるかも確認できます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">確認日</div>
              <p className="mt-2">2026-05-11時点の公式ドキュメントをもとにしています。APIやプランごとの制限は実装前に再確認してください。</p>
            </div>
          </div>
        </header>

        <ContextWindowVisualizer />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="入力上限を可視化" body="最大コンテキストと最大出力を切り替えて、モデルごとの容量差を比較できます。" />
          <InfoCard title="文量を概算" body="文字数からトークン、A4ページ、書籍相当量へ換算し、プロンプト設計の目安にできます。" />
          <InfoCard title="ローカル計算" body="入力した文字数はブラウザ内で処理され、外部送信や保存は行いません。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">使い方と注意点</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">長文処理の設計</h3>
              <p className="mt-1">
                コンテキスト上限に近い入力をそのまま投げるより、章ごとの要約、検索、引用箇所抽出、圧縮メモを組み合わせる方が安定しやすいです。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">出力トークンも消費する</h3>
              <p className="mt-1">
                コンテキストは入力だけでなく、生成する回答、ツール結果、推論用トークンにも使われます。上限ぎりぎりではなく余白を残してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">公式ソース</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="https://platform.openai.com/docs/models/compare" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  OpenAI models
                </a>
                <a href="https://platform.claude.com/docs/en/build-with-claude/context-windows" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Claude context windows
                </a>
                <a href="https://ai.google.dev/gemini-api/docs/models/gemini-v2" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Gemini models
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">換算の前提</h3>
              <p className="mt-1">
                既定では 1 token ≈ 日本語1.5文字 として計算しています。英語、コード、JSON、Markdownでは変わるため、必要なら換算係数を調整してください。
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
            <Related href="/prompt-token-counter" title="プロンプト token 計算" body="テキスト量をtoken視点で確認" />
            <Related href="/ai-cost-calculator" title="AI API料金計算" body="入力・出力tokenから費用を概算" />
            <Related href="/prompt-chain-builder" title="プロンプトチェーン設計" body="複数ステップの入出力を整理" />
            <Related href="/rag-cost-estimator" title="RAGコスト計算" body="検索・埋め込み・生成費用を概算" />
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "LLMコンテキストウィンドウ比較",
            description: "OpenAI、Claude、Geminiのコンテキスト長を比較し、入力文量が収まるか確認する無料ツール。",
            url: "https://tools.loresync.dev/context-window-visualizer",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
            inLanguage: "ja",
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
