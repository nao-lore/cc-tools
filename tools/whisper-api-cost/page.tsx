import Link from "next/link";
import { tools } from "@/lib/tools-config";
import WhisperApiCost from "./components/WhisperApiCost";

const faq = [
  {
    q: "Whisper APIだけでなくGPT-4o Transcribeが出るのはなぜですか？",
    a: "OpenAIの現行Speech-to-text APIでは、gpt-4o-transcribeとgpt-4o-mini-transcribeが主要モデルとして案内されています。Whisperは既存実装との比較用に残しています。",
  },
  {
    q: "料金は分単位だけで計算できますか？",
    a: "音声文字起こしの実務見積もりでは、まず音声分数×分単価で概算するのが分かりやすいです。gpt-4o系ではtoken単価も公開されているため、最終請求はUsageログで確認してください。",
  },
  {
    q: "会議の要約や話者分離も含まれますか？",
    a: "含まれません。このツールは音声からテキストへの文字起こしAPI料金に絞っています。要約、整形、話者分離、翻訳、保存、検索インデックス化は別途見積もりが必要です。",
  },
  {
    q: "入力した録音時間は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力したファイル数や音声時間を外部に送信しません。",
  },
];

export default function WhisperApiCostPage() {
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
              <p className="text-sm font-semibold text-cyan-700">Audio API Cost Tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">OpenAI 音声文字起こし 料金計算</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                GPT-4o Transcribe、GPT-4o mini Transcribe、Whisperの文字起こし料金を、音声分数・ファイル数・為替レートから概算します。
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-900 shadow-sm">
              <div className="font-semibold text-cyan-950">OpenAI公式価格ベース</div>
              <p className="mt-2">2026年5月時点で確認したOpenAI API PricingとSpeech-to-textモデルDocsを初期値にしています。</p>
            </div>
          </div>
        </header>

        <WhisperApiCost />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="現行モデル対応" body="gpt-4o-transcribe、gpt-4o-mini-transcribe、Whisperを比較できます。" />
          <InfoCard title="案件見積もり向け" body="ファイル数×平均分数×期間で、会議・Podcast・コールセンターの月額を概算できます。" />
          <InfoCard title="後処理は分離" body="要約、翻訳、話者分離、検索化などの追加LLM費用は別枠として扱います。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">音声文字起こし料金の見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">まず分単価で見る</h3>
              <p className="mt-1">録音済みファイルの文字起こしは、音声時間に分単価をかけると概算しやすいです。1時間は60分なので、$0.006/分なら$0.36/時間です。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">gpt-4o系とWhisperの使い分け</h3>
              <p className="mt-1">精度重視ならgpt-4o-transcribe、低コスト大量処理ならgpt-4o-mini-transcribe、既存Whisper実装との互換比較ならWhisperを基準にできます。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">このツールに含めていないもの</h3>
              <p className="mt-1">Realtime接続、音声保存、ノイズ処理、話者分離、議事録要約、翻訳、ベクトル検索、管理画面のインフラ費用は含めていません。</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">参考にした公式情報</h3>
              <p className="mt-1">価格とモデル仕様はOpenAI公式PricingおよびSpeech-to-textモデルDocsを参照しています。</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="https://developers.openai.com/api/docs/pricing" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  OpenAI API Pricing
                </a>
                <a href="https://developers.openai.com/api/docs/models/gpt-4o-transcribe" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  GPT-4o Transcribe
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
            <Related href="/elevenlabs-pricing" title="ElevenLabs料金" body="TTS/STT/音声処理の費用を概算" />
            <Related href="/meeting-cost" title="会議コスト" body="会議時間と参加人数のコストを計算" />
            <Related href="/claude-api-cost" title="Claude API料金" body="要約後処理のLLM費用を概算" />
            <Related href="/prompt-token-counter" title="トークン数カウンター" body="議事録要約のプロンプト長を確認" />
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
