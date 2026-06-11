import Link from 'next/link'

export default function EstimatesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">見積もり一覧</h1>
        <Link
          href="/estimates/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          ＋ 新規見積もり
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-16 text-center text-gray-400">
          <p className="text-lg mb-2">見積もりがまだありません</p>
          <p className="text-sm mb-6">Supabaseを接続すると見積もりデータが表示されます</p>
          <Link
            href="/estimates/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            新規見積もりを作成する
          </Link>
        </div>
      </div>
    </div>
  )
}
