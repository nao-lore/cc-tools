import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import MeetingCost from "./components/MeetingCost";

const faq: FaqItem[] = [
  { q: "会議コストはどう計算しますか？", a: "年収を年間労働時間で割って時給を概算し、参加人数と会議時間を掛けて算出します。" },
  { q: "入力内容は外部に送信されますか？", a: "いいえ。参加者、年収、時間、頻度、検証、リセット、コピー用の確認はブラウザ上で完結します。" },
  { q: "どんな例に使えますか？", a: "定例会、レビュー会議、全社会、意思決定会議など、頻度と参加人数が決まっている会議の見直しに使えます。" },
];

export default function MeetingCostPage() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader locale="ja" eyebrow="仕事効率ツール" title="会議コスト計算機" description="参加者の年収、人数、会議時間、開催頻度から1回・月間・年間の会議コストを概算します。例プリセット、入力検証、リセット、コピー用の確認に対応します。" tone="orange" noteTitle="ブラウザ上で計算" note="入力した給与や人数の情報は外部に送信されません。会議見直しのたたき台として使えます。" />
        <MeetingCost />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Example roles" body="経営者、部長、課長、一般社員などの例から参加者を追加できます。" />
          <InfoCard title="頻度別コスト" body="1回だけでなく、月間・年間の会議コストも確認できます。" />
          <InfoCard title="改善の材料" body="削減候補、参加人数、時間短縮の効果を会議前に見積もれます。" />
        </section>
        <InfoSection title="計算メモ" items={[["概算です", "福利厚生、賞与、間接費、機会損失までは含めないシンプルな見積もりです。"], ["見直し観点", "目的、参加者、頻度、時間、非同期化できる内容を確認すると改善につながります。"]]} />
        <Faq items={faq} />
        <RelatedSection locale="ja" links={[["/hourly-to-annual", "時給年収換算", "給与を換算"], ["/zangyou-dai", "残業代計算", "割増賃金を確認"], ["/tedori-keisan", "手取り計算", "給与手取りを概算"], ["/gyomu-itaku-hikaku", "業務委託比較", "働き方を比較"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools は {toolCount} 個以上の無料オンラインツールを公開しています。</footer>
      </div>
      <JsonLd faq={faq} name="会議コスト計算機" description="参加者の年収・人数・時間から会議コストをブラウザ上で概算する無料ツール。" url="https://tools.loresync.dev/meeting-cost" inLanguage="ja" />
    </main>
  );
}
