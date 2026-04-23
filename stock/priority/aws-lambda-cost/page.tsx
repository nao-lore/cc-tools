"use client";
import AwsLambdaCost from "./components/AwsLambdaCost";

export default function AwsLambdaCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FF9900] flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-label="AWS Lambda">
              <path d="M6.5 2L2 12l4.5 10h11L22 12 17.5 2H6.5zm5.5 3l4 7-4 7-4-7 4-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AWS Lambda 料金計算</h1>
            <p className="text-gray-500 text-sm">
              リクエスト数・実行時間・メモリ割当量から月額コストをシミュレーション
            </p>
          </div>
        </div>
        <AwsLambdaCost />
      </div>
    </div>
  );
}
