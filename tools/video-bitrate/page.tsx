import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import VideoBitrate from "./components/VideoBitrate";

const faq: FaqItem[] = [
  { q: "動画ファイルサイズはどう計算しますか？", a: "映像ビットレートと音声ビットレートを合計し、再生時間を掛けてバイト換算します。結果は概算です。" },
  { q: "入力内容は外部に送信されますか？", a: "いいえ。ビットレート計算、プリセット適用、検証、リセット、コピー用の確認はブラウザ上で完結します。" },
  { q: "どの例から始めるとよいですか？", a: "YouTube 1080p、4K、SNS投稿など用途に近いプリセットを選び、必要に応じてカスタム値に切り替えてください。" },
];

export default function VideoBitratePage() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader locale="ja" eyebrow="動画・配信ツール" title="動画ビットレート計算ツール" description="解像度、fps、コーデック、再生時間から推奨ビットレートとファイルサイズを概算します。例プリセット、入力検証、リセット、コピー用の確認に対応します。" tone="cyan" noteTitle="ブラウザ上で計算" note="入力した時間・ビットレート・プリセット情報は外部に送信されません。" />
        <VideoBitrate />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Example presets" body="YouTube、SNS、4Kなどの例から近い条件を選べます。" />
          <InfoCard title="サイズ見積もり" body="動画と音声のビットレートから、1本あたりの容量を概算します。" />
          <InfoCard title="制作前チェック" body="アップロード制限や保存容量に収まるか事前に確認できます。" />
        </section>
        <InfoSection title="計算メモ" items={[["概算値です", "実際の容量は可変ビットレート、音声形式、コンテナ、エンコーダ設定で変わります。"], ["品質とのバランス", "解像度やfpsを上げるほど容量が増えるため、配信先の推奨値を基準に調整してください。"]]} />
        <Faq items={faq} />
        <RelatedSection locale="ja" links={[["/image-compressor", "画像圧縮", "画像容量を削減"], ["/dpi-resolution", "DPI解像度", "印刷サイズを確認"], ["/aspect-ratio", "アスペクト比", "動画比率を計算"], ["/youtube-revenue", "YouTube収益", "収益目安を計算"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools は {toolCount} 個以上の無料オンラインツールを公開しています。</footer>
      </div>
      <JsonLd faq={faq} name="動画ビットレート計算ツール" description="動画ビットレートと再生時間からファイルサイズをブラウザ上で概算する無料ツール。" url="https://tools.loresync.dev/video-bitrate" inLanguage="ja" />
    </main>
  );
}
