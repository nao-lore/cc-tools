"use client";
import ClickPostSize from "./components/ClickPostSize";

export default function ClickPostSizePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">メール便・小型配送 サイズ判定</h1>
        <p className="text-blue-700 mb-8">荷物のサイズ・重量から使えるサービスを即判定。ネコポス / クリックポスト / ゆうパケット比較</p>
        <ClickPostSize />
      </div>
    </div>
  );
}
