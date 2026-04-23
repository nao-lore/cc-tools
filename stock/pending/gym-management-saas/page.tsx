"use client";
import GymManagementComparison from "./components/GymManagementComparison";
export default function GymManagementSaasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ジム管理システム比較</h1>
        <p className="text-gray-600 mb-8">会員管理・予約・決済機能で主要SaaSを横断比較</p>
        <GymManagementComparison />
      </div>
    </div>
  );
}
