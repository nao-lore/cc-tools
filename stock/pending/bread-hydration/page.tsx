import BreadHydration from "./components/BreadHydration";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">ツール一覧</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900">パン加水率計算</span>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">パン加水率計算</h1>
          <p className="text-gray-500 mb-8">粉量から水分量を逆算、パン種類別推奨加水率</p>
          <BreadHydration />
        </div>
      </div>
    </div>
  );
}
