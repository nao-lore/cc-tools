"use client";
import MercariTesuryou from "./components/MercariTesuryou";

export default function MercariTesuryouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          メルカリ 手数料・利益計算
        </h1>
        <p className="text-gray-600 mb-8">
          販売価格から実利益を即計算。逆算で目標利益から販売価格も算出できます。
        </p>
        <MercariTesuryou />
      </div>
    </div>
  );
}
