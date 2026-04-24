import NengouTable from "./components/NengouTable";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-700">ツール一覧</a>
          <span className="mx-2">›</span>
          <span className="text-gray-900">年号早見表</span>
        </nav>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">年号早見表</h1>
          <p className="text-gray-500 mb-8">西暦と年号(令和/平成/昭和/大正/明治)の一覧表</p>
          <NengouTable />
        </div>
      </div>
    </div>
  );
}
