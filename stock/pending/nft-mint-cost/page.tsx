"use client";
import NftMintCost from "./components/NftMintCost";
export default function NftMintCostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT ミント費用計算ツール</h1>
        <p className="text-gray-600 mb-8">チェーン別のNFTミント費用を比較・試算</p>
        <NftMintCost />
      </div>
    </div>
  );
}
