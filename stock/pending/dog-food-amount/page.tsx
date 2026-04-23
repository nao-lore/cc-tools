import DogFoodAmount from "./components/DogFoodAmount";

export default function DogFoodAmountPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            犬種別 適正給餌量計算
          </h1>
          <p className="text-sm text-muted mt-1">
            体重・年齢・活動量から1日の適正フード量を計算。ドライ・ウェット換算付き
          </p>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <DogFoodAmount />
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>広告スペース</p>
          </div>
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">給餌量の計算方法</h2>
            <p>
              犬の1日に必要なカロリー（安静時代謝エネルギー：RER）は体重(kg)の0.75乗×70で計算します。活動係数を掛けることで実際の必要カロリーが求まります。子犬は成犬の約2倍、シニア犬は0.8倍が目安です。
            </p>
            <h2 className="text-lg font-bold text-foreground">注意事項</h2>
            <p>
              本ツールの計算結果はあくまで目安です。個体差・健康状態・フードのカロリー密度によって最適な量は異なります。愛犬の体重が増減している場合は獣医師にご相談ください。
            </p>
          </section>
        </div>
      </main>
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">犬の給餌量計算 — Free online tool. No signup required.</p>
        </div>
      </footer>
    </div>
  );
}
