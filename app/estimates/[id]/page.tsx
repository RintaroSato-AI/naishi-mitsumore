import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  ChevronLeft, Pencil, Send, CheckCircle, XCircle, Clock
} from 'lucide-react'
import {
  STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS,
  type EstimateStatus, type ItemCategory, type Estimate, type EstimateItem
} from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/estimate'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'

interface Props {
  params: { id: string }
}

export default async function EstimateDetailPage({ params }: Props) {
  const supabase = createClient()

  const { data: est } = await supabase
    .from('estimates')
    .select('*, customers(*), profiles:created_by(name)')
    .eq('id', params.id)
    .single()

  if (!est) notFound()

  const { data: items } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', params.id)
    .order('sort_order')

  const estimate = est as any as Estimate
  const estimateItems = (items ?? []) as EstimateItem[]

  return (
    <div className="max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/estimates" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-gray-500 text-sm">{est.estimate_number}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[est.status as EstimateStatus]}`}>
                {STATUS_LABELS[est.status as EstimateStatus]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{est.title}</h1>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <PDFDownloadButton estimate={estimate} items={estimateItems} />
          <StatusActions estimateId={params.id} currentStatus={est.status as EstimateStatus} />
          <Link
            href={`/estimates/${params.id}/edit`}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Pencil size={15} />
            編集
          </Link>
        </div>
      </div>

      {/* 詳細カード */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <InfoCard label="顧客名" value={(est.customers as any)?.name ?? '—'} />
        <InfoCard label="発行日" value={formatDate(est.issue_date)} />
        <InfoCard label="有効期限" value={formatDate(est.expiry_date)} />
      </div>

      {/* 明細テーブル */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">工事明細</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3 text-center w-10">No</th>
                <th className="px-4 py-3 text-left w-24">区分</th>
                <th className="px-4 py-3 text-left">工事名称</th>
                <th className="px-4 py-3 text-left w-28">仕様・規格</th>
                <th className="px-4 py-3 text-center w-16">単位</th>
                <th className="px-4 py-3 text-right w-20">数量</th>
                <th className="px-4 py-3 text-right w-28">単価</th>
                <th className="px-4 py-3 text-right w-32">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {estimateItems.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 text-center text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[item.category as ItemCategory] ?? item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.item_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.spec ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              {!estimateItems.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">明細がありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 合計 */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>小計</span>
                <span>{formatCurrency(est.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>消費税（{Math.round(est.tax_rate * 100)}%）</span>
                <span>{formatCurrency(est.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                <span>合計金額</span>
                <span className="text-blue-700">{formatCurrency(est.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 備考 */}
      {est.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">備考・特記事項</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{est.notes}</p>
        </div>
      )}

      {/* メタ情報 */}
      <div className="text-xs text-gray-400 text-right">
        作成者: {(est.profiles as any)?.name ?? '—'}
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function StatusActions({ estimateId, currentStatus }: { estimateId: string; currentStatus: EstimateStatus }) {
  if (currentStatus === 'draft') {
    return (
      <form action={`/api/estimates/${estimateId}/status`} method="POST">
        <input type="hidden" name="status" value="sent" />
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Send size={15} />
          送付済みにする
        </button>
      </form>
    )
  }
  if (currentStatus === 'sent') {
    return (
      <div className="flex gap-2">
        <form action={`/api/estimates/${estimateId}/status`} method="POST">
          <input type="hidden" name="status" value="approved" />
          <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <CheckCircle size={15} /> 承認
          </button>
        </form>
        <form action={`/api/estimates/${estimateId}/status`} method="POST">
          <input type="hidden" name="status" value="rejected" />
          <button type="submit" className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            <XCircle size={15} /> 却下
          </button>
        </form>
      </div>
    )
  }
  return null
}
