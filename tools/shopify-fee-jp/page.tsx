"use client";
import ShopifyFeeJp from "./components/ShopifyFeeJp";

export default function ShopifyFeeJpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopify 手数料計算（日本）</h1>
        <p className="text-gray-600 mb-8">プラン別月額・カード決済手数料・トランザクション手数料を即計算</p>
        <ShopifyFeeJp />
      </div>
    </div>
  );
}
