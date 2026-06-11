import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS, type EstimateStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/estimate'

export default async function EstimatesPage() {
  const supabase = createClient()
  const { data: estimates } = await supabase
    .from('estimates')
    .select('id, estimate_number, title, status, issue_date, expiry_date, total_amount, customers(name)')
    .order('created_at', { ascending: false })

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
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">見積もり番号</th>
              <th className="px-6 py-3 text-left">タイトル</th>
              <th className="px-6 py-3 text-left">顧客名</th>
              <th className="px-6 py-3 text-left">発行日</th>
              <th className="px-6 py-3 text-left">有効期限</th>
              <th className="px-6 py-3 text-right">合計金額</th>
              <th className="px-6 py-3 text-center">ステータス</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {estimates?.map(est => (
              <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-600">
                  <Link href={`/estimates/${est.id}`} className="hover:underline">
                    {est.estimate_number}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-800 font-medium">{est.title}</td>
                <td className="px-6 py-4 text-gray-600">{(est.customers as any)?.name ?? '—'}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(est.issue_date)}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(est.expiry_date)}</td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(est.total_amount)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[est.status as EstimateStatus]}`}>
                    {STATUS_LABELS[est.status as EstimateStatus]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/estimates/${est.id}`} className="text-blue-600 hover:underline text-xs">
                    詳細 →
                  </Link>
                </td>
              </tr>
            ))}
            {!estimates?.length && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                  見積もりがまだありません。「新規見積もり」から作成してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
