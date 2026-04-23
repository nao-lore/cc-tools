"use client";
import TaskEstimation from "./components/TaskEstimation";
export default function TaskEstimationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">タスク見積もりツール</h1>
        <p className="text-gray-600 mb-8">楽観・標準・悲観の3点見積もりからPERT法で信頼できる工数を算出します</p>
        <TaskEstimation />
      </div>
    </div>
  );
}
