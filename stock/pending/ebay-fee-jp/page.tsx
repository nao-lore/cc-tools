"use client";
import EbayFeeJp from "./components/EbayFeeJp";
export default function EbayFeeJpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">eBay 日本から出品 手数料・利益 計算ツール</h1>
        <p className="text-gray-600 mb-8">出品手数料・決済手数料・為替・送料を日本円で計算し利益を算出します</p>
        <EbayFeeJp />
      </div>
    </div>
  );
}
