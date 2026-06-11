import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/estimate'

export default async function CustomersPage() {
  const supabase = createClient()
  const { data: customers } = await supabase
    .from('customers')
    .select('*, estimates(count)')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">顧客名</th>
              <th className="px-6 py-3 text-left">住所</th>
              <th className="px-6 py-3 text-left">電話番号</th>
              <th className="px-6 py-3 text-center">見積もり件数</th>
              <th className="px-6 py-3 text-left">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers?.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                <td className="px-6 py-4 text-gray-600">{c.address ?? '—'}</td>
                <td className="px-6 py-4 text-gray-600">{c.phone ?? '—'}</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {(c.estimates as any)?.[0]?.count ?? 0}件
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{formatDate(c.created_at)}</td>
              </tr>
            ))}
            {!customers?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                  顧客がまだ登録されていません。見積もり作成時に自動登録されます。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
