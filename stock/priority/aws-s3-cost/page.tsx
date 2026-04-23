"use client";
import AwsS3Cost from "./components/AwsS3Cost";

export default function AwsS3CostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FF9900] flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-label="AWS S3">
              <path d="M12 2L4 6v12l8 4 8-4V6L12 2zm0 2.18L18 7.5v9L12 19.82 6 16.5v-9L12 4.18zM12 7l-4 2v6l4 2 4-2V9l-4-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AWS S3 料金計算</h1>
            <p className="text-gray-500 text-sm">
              ストレージクラス・容量・リクエスト数・転送量から月額コストをシミュレーション
            </p>
          </div>
        </div>
        <AwsS3Cost />
      </div>
    </div>
  );
}
