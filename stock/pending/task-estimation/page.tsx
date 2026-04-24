"use client";
import TaskEstimation from "./components/TaskEstimation";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">タスク見積もりツール</h1>
          <p className="text-gray-400 mb-8">楽観・標準・悲観の3点見積もりからPERT計算で信頼できる工数を算出</p>
          <TaskEstimation />
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
