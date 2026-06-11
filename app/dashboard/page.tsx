import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <Link
          href="/estimates/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          ＋ 新規見積もり
        </Link>
      </div>

      {/* サマリカード */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">総見積もり件数</p>
          <p className="text-3xl font-bold text-blue-700">—</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">下書き</p>
          <p className="text-3xl font-bold text-gray-700">—</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">今月作成</p>
          <p className="text-3xl font-bold text-green-700">—</p>
        </div>
      </div>

      {/* 案内メッセージ */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium mb-2">Supabaseを接続するとデータが表示されます</p>
        <p className="text-blue-600 text-sm mb-4">まずは「新規見積もり」から見積もりを作成してみてください！</p>
        <Link
          href="/estimates/new"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          新規見積もりを作成する
        </Link>
      </div>
    </div>
  )
}
