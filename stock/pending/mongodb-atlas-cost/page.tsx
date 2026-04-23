"use client";
import MongodbAtlasCost from "./components/MongodbAtlasCost";
export default function MongodbAtlasCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">MongoDB Atlas 料金試算ツール</h1>
        <p className="text-gray-600 mb-8">クラスタサイズ・ストレージ・転送量から月額を試算</p>
        <MongodbAtlasCost />
      </div>
    </div>
  );
}
