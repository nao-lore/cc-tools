import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import FuriganaConverter from "./components/FuriganaConverter";

const faq: FaqItem[] = [
  { q: "変換した文章は外部に送信されますか？", a: "いいえ。ふりがな変換、例文入力、出力形式の切り替え、コピー、クリアはブラウザ上で完結します。" },
  { q: "どの出力形式を選べますか？", a: "HTML ruby、括弧表示、ひらがなのみの3形式に対応しています。用途に合わせて切り替えてください。" },
  { q: "辞書にない漢字はどうなりますか？", a: "内蔵辞書で読みを判断できない語は原文のまま残ります。公開前に変換結果を確認してください。" },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <ToolHeader locale="ja" eyebrow="日本語テキストツール" title="ふりがな変換ツール" description="日本語文の漢字にふりがなを付け、HTML ruby、括弧表示、ひらがなのみで出力します。例文、検証、コピー、クリアに対応します。" tone="sky" noteTitle="ローカル変換" note="入力文と変換結果は外部に送信されません。教材や下書きの確認に使えます。" />
        <FuriganaConverter />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="出力形式" body="rubyタグ、括弧表示、ひらがなのみを切り替えられます。" />
          <InfoCard title="例文入力" body="サンプル文章で変換結果と表示形式をすぐ確認できます。" />
          <InfoCard title="コピー対応" body="変換後のテキストを教材、メール、CMS下書きへ移せます。" />
        </section>
        <InfoSection title="活用メモ" items={[["教材作成", "小学生向けプリントや日本語学習者向け資料の下書きに使えます。"], ["確認が必要", "固有名詞や文脈で読みが変わる語は、変換後に人の目で確認してください。"]]} />
        <Faq items={faq} />
        <RelatedSection locale="ja" links={[["/zenkaku-hankaku", "全角半角変換", "文字幅を変換"], ["/hebon-romaji", "ヘボン式ローマ字", "ローマ字へ変換"], ["/word-counter", "Word Counter", "文章量を確認"], ["/markdown-preview", "Markdown Preview", "文書をプレビュー"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools は {toolCount} 個以上の無料オンラインツールを公開しています。</footer>
      </div>
      <JsonLd faq={faq} name="ふりがな変換ツール" description="漢字にふりがなをブラウザ上で付与し、ruby、括弧表示、ひらがなのみで出力する無料ツール。" url="https://tools.loresync.dev/furigana" inLanguage="ja" />
    </main>
  );
}
