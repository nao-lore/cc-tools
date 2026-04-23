"use client";
import TriangleSolver from "./components/TriangleSolver";
export default function TriangleSolverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">三角形 計算機</h1>
        <p className="text-gray-600 mb-8">辺と角の値を入力して残りの辺・角・面積・周長を自動計算します</p>
        <TriangleSolver />
      </div>
    </div>
  );
}
