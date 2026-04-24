"use client";
import Hikidemono from "./components/Hikidemono";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">引き出物予算配分</h1>
          <p className="text-gray-400 mb-8">ご祝儀額に対する引き出物の適切な予算を計算。一般的な相場（ご祝儀の3分の1）を基準に、料理・引き菓子・縁起物の内訳も提案。</p>
          <Hikidemono />
        </div>
        <aside className="hidden lg:block space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">関連ツール</h3>
            <div className="space-y-2 text-sm">
              <a href="/" className="block text-blue-400 hover:text-blue-300">← ツール一覧に戻る</a>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 border-dashed p-6 text-center">
            <span className="text-gray-600 text-xs">Ad Space</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
