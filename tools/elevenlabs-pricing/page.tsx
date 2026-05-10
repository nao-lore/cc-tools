import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ElevenLabsPricing from "./components/ElevenLabsPricing";

const faq = [
  {
    q: "ElevenLabs APIは別料金ですか？",
    a: "ElevenLabsのヘルプでは、APIはFreeを含む全プランに含まれ、APIキーでの生成もWeb利用と同じように実際の生成分のcreditsを消費すると説明されています。",
  },
  {
    q: "Text to Speechは何で課金されますか？",
    a: "公式API料金ページではText to Speechは文字数ベースです。Flash/Turboは$0.05/1K characters、Multilingual v2/v3は$0.10/1K charactersとして掲載されています。",
  },
  {
    q: "creditsとcharactersは同じですか？",
    a: "ElevenLabsのヘルプでは、creditsは以前charactersと呼ばれていたものだと説明されています。ただしFlash/Turboのself-serveでは1文字=0.5 credits、他の主要TTSモデルでは1文字=1 creditなど、モデルで消費量が異なります。",
  },
  {
    q: "入力した利用量は保存されますか？",
    a: "保存されません。計算はブラウザ上で完結し、入力した利用量や為替レートを外部に送信しません。",
  },
];

const sources = [
  {
    label: "ElevenLabs API Pricing",
    href: "https://elevenlabs.io/pricing/api",
  },
  {
    label: "ElevenLabs Help: What are credits?",
    href: "https://help.elevenlabs.io/hc/en-us/articles/27562020846481-What-are-credits",
  },
  {
    label: "ElevenLabs Help: API cost",
    href: "https://help.elevenlabs.io/hc/en-us/articles/28184926326033-How-much-does-it-cost-to-use-the-API",
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
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-indigo-700">AI Audio Cost Tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">ElevenLabs API 料金計算</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                ElevenLabsのText to Speech、Speech to Text、Music、Voice Isolator、DubbingなどのAPI利用量から月額コストを概算します。
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm leading-6 text-indigo-900 shadow-sm">
              <div className="font-semibold">公式API単価ベース</div>
              <p className="mt-2">
                2026年5月時点で確認したElevenLabs公式API料金ページの公開単価を初期値にしています。
              </p>
            </div>
          </div>
        </header>

        <ElevenLabsPricing />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="複数プロダクト対応" body="TTS、STT、音声処理、効果音、吹き替えを同じ画面で試算できます。" />
          <InfoCard title="USD/JPY換算" body="為替レートを入力して、ドル請求を日本円の予算感に変換できます。" />
          <InfoCard title="クレジット目安" body="TTSではモデルごとの文字数とcreditsの関係もあわせて表示します。" />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">ElevenLabs API料金の見方</h2>
          <div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">TTSは文字数ベース</h3>
              <p className="mt-1">
                Text to Speechは1,000文字あたりの単価で見積もります。Flash/Turboは低遅延、Multilingual v2/v3は品質寄りのモデルとして分けています。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">STTは時間ベース</h3>
              <p className="mt-1">
                Speech to Textは音声時間で計算します。通常処理とRealtimeでは時間単価が違うため、用途に合わせて切り替えます。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">creditsに注意</h3>
              <p className="mt-1">
                creditsの消費量はプロダクト、モデル、カスタムボイス、追加機能で変わります。請求前にはダッシュボードの使用量も確認してください。
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">税金・プラン条件は別</h3>
              <p className="mt-1">
                公式ページの価格は税抜き表示です。プラン同梱枠、超過、税金、Enterprise条件、地域差は実際の請求で変わる場合があります。
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">参考にした公式情報</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                {source.label}
              </a>
            ))}
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
            <Related href="/openrouter-pricing" title="OpenRouter料金" body="LLM APIのモデル別料金を比較" />
            <Related href="/whisper-api-cost" title="Whisper API料金" body="音声文字起こしのコストを計算" />
            <Related href="/dalle-pricing" title="DALL·E料金" body="画像生成コストを試算" />
            <Related href="/ai-cost-calculator" title="AI APIコスト" body="トークン課金の月額を概算" />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools は {toolCount} 個以上の無料オンラインツールを公開しています。
        </footer>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ElevenLabs API 料金計算",
              description: "ElevenLabs APIの文字数、時間、分数、生成回数から利用料金を概算します。",
              url: "https://tools.loresync.dev/elevenlabs-pricing",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
              inLanguage: "ja",
            },
            {
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
            },
          ]),
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
