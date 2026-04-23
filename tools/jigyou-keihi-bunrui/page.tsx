import KeihiBunrui from "./components/KeihiBunrui";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            経費 勘定科目 判別ツール
          </h1>
          <p className="text-sm text-muted mt-1">
            経費の内容から勘定科目を即座に判別 — 個人事業主・フリーランス向け
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <KeihiBunrui />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>

          {/* 使い方ガイド */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">使い方ガイド</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>
                <span className="font-medium text-foreground">経費の内容を入力する</span>
                — 「タクシー代」「Amazonで本を購入」など購入内容をそのまま入力してください。
              </li>
              <li>
                <span className="font-medium text-foreground">「判別」ボタンを押す</span>
                — キーワードに基づいて最も近い勘定科目を提案します。
              </li>
              <li>
                <span className="font-medium text-foreground">一覧から確認する</span>
                — 候補が出ない場合は下の勘定科目一覧から近いものを選び、具体例と比較してください。
              </li>
              <li>
                <span className="font-medium text-foreground">最終判断は専門家に確認</span>
                — 判断が難しい経費は税理士や国税庁のWebサイトで確認することをおすすめします。
              </li>
            </ol>

            {/* FAQ */}
            <h2 className="text-lg font-bold text-foreground mt-8">よくある質問（FAQ）</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Q. 打ち合わせの飲食代は「会議費」と「接待交際費」どちらですか？</p>
                <p className="mt-1">A. 目安として、1人あたり5,000円以下の社内・少人数打ち合わせは「会議費」、取引先を招いた飲食や金額が大きい場合は「接待交際費」に仕分けるのが一般的です。ただし厳密な基準は税理士にご確認ください。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 自宅兼事務所の家賃はどう処理しますか？</p>
                <p className="mt-1">A. 「地代家賃」として計上できますが、事業に使用している部分（床面積比率など）のみが経費になります。按分計算が必要で、按分割合の根拠を記録しておくことが重要です。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. スマホ代は全額経費にできますか？</p>
                <p className="mt-1">A. 業務専用端末であれば全額「通信費」として計上可能です。プライベートと兼用の場合は業務使用割合を按分する必要があります。一般的に50〜80%が業務分として認められるケースが多いです。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. Amazonで購入した消耗品はどの勘定科目ですか？</p>
                <p className="mt-1">A. 文房具・プリンク・事務用品など業務で1年以内に消費するものは「消耗品費」です。10万円未満のパソコンや周辺機器も消耗品費として一括計上できます（青色申告の場合は30万円未満まで特例あり）。</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Q. 勘定科目を間違えて申告した場合どうなりますか？</p>
                <p className="mt-1">A. 経費の合計金額が正しければ税額への影響は原則ありません。ただし、経費にできないものを経費計上すると税務調査で指摘される可能性があります。不安な場合は修正申告を検討してください。</p>
              </div>
            </div>

            {/* JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "打ち合わせの飲食代は会議費と接待交際費どちらですか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "1人あたり5,000円以下の少人数打ち合わせは会議費、取引先を招いた飲食や金額が大きい場合は接待交際費が一般的です。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "自宅兼事務所の家賃はどう処理しますか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "地代家賃として計上できますが、事業使用部分のみ按分して経費にします。",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "スマホ代は全額経費にできますか？",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "業務専用端末なら全額通信費として計上できます。プライベート兼用の場合は業務使用割合を按分する必要があります。",
                      },
                    },
                  ],
                }),
              }}
            />

            {/* 関連ツール */}
            <h2 className="text-lg font-bold text-foreground mt-8">関連ツール</h2>
            <div className="flex flex-wrap gap-2">
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">源泉徴収税計算</a>
              <a href="/tedori-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">手取り計算</a>
              <a href="/loan-simulator" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">ローン返済シミュレーター</a>
            </div>

            {/* CTA */}
            <div className="mt-6 bg-card border border-border rounded-xl p-5 text-center space-y-2">
              <p className="font-bold text-foreground">確定申告の準備に</p>
              <p className="text-xs text-muted">経費を正しく仕分けて、漏れのない節税を。判断が難しい経費は税理士にご相談ください。</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">経費 勘定科目 判別ツール — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">源泉徴収税計算</a>
              <a href="/tedori-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">手取り計算</a>
              <a href="/loan-simulator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ローン計算</a>
              <a href="/risoku-keisan" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">利息計算</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">60+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
