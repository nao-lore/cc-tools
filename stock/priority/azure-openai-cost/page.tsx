"use client";
import AzureOpenAiCost from "./components/AzureOpenAiCost";
export default function AzureOpenAiCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Azure OpenAI Service 料金計算</h1>
        <p className="text-gray-600 mb-8">リージョン・モデル・デプロイ方式からAzure OpenAI Serviceのコストをシミュレーション</p>
        <AzureOpenAiCost />
      </div>
    </div>
  );
}
