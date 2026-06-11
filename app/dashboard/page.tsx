import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS, type EstimateStatus } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/estimate'

export default async function DashboardPage() {
  const supabase = createClient()

  const [{ data: estimates }, { count: total }, { count: drafts }] = await Promise.all([
    supabase
      .from('estimates')
      .select('id, estimate_number, title, status, issue_date, total_amount, customers(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('estimates').select('*', { count: 'exact', head: true }),
    supabase.from('estimates').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ])

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
        <SummaryCard label="総見積もり件数" value={`${total ?? 0}件`} color="blue" />
        <SummaryCard label="下書き" value={`${drafts ?? 0}件`} color="gray" />
        <SummaryCard label="今月作成" value="—" color="green" />
      </div>

      {/* 最近の見積もり */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">最近の見積もり</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">見積もり番号</th>
              <th className="px-6 py-3 text-left">タイトル</th>
              <th className="px-6 py-3 text-left">顧客名</th>
              <th className="px-6 py-3 text-left">発行日</th>
              <th className="px-6 py-3 text-right">金額</th>
              <th className="px-6 py-3 text-center">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {estimates?.map(est => (
              <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/estimates/${est.id}`} className="text-blue-600 hover:underline font-mono">
                    {est.estimate_number}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-800">{est.title}</td>
                <td className="px-6 py-4 text-gray-600">{(est.customers as any)?.name ?? '—'}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(est.issue_date)}</td>
                <td className="px-6 py-4 text-right font-semibold">{formatCurrency(est.total_amount)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[est.status as EstimateStatus]}`}>
                    {STATUS_LABELS[est.status as EstimateStatus]}
                  </span>
                </td>
              </tr>
            ))}
            {!estimates?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  まだ見積もりがありません。「新規見積もり」から作成してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = { blue: 'bg-blue-50 text-blue-700', gray: 'bg-gray-100 text-gray-700', green: 'bg-green-50 text-green-700' }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${(colors as any)[color]}`}>{value}</p>
    </div>
  )
}
