import CaffeineIntake from "./components/CaffeineIntake";

export default function CaffeineIntakePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            カフェイン摂取量計算
          </h1>
          <p className="text-sm text-muted mt-1">
            飲料別のカフェイン含有量を計算し、1日の摂取上限との比較を表示
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <CaffeineIntake />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">カフェインの1日上限</h2>
            <p>
              WHOや各国の食品機関は、健康な成人のカフェイン摂取上限を1日400mg（妊婦は200mg）としています。コーヒー1杯（150ml）に含まれるカフェインは約90mg、エナジードリンク250mlは約80mgが目安です。
            </p>
            <h2 className="text-lg font-bold text-foreground">過摂取のリスク</h2>
            <p>
              カフェインを過剰に摂取すると、不眠・頭痛・動悸・不安感などの症状が現れることがあります。特に午後3時以降の摂取は睡眠の質を下げやすいため注意が必要です。カフェインに敏感な方や子供・妊婦はより少ない量を目安にしてください。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">カフェイン摂取量計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
