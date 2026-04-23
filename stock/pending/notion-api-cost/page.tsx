"use client";
import NotionApiCost from "./components/NotionApiCost";
export default function NotionApiCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notion プラン料金試算ツール</h1>
        <p className="text-gray-600 mb-8">メンバー数・ゲスト数・プランからNotion月額を試算</p>
        <NotionApiCost />
      </div>
    </div>
  );
}
