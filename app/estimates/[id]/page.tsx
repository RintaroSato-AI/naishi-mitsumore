'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Send, CheckCircle, XCircle } from 'lucide-react'
import {
  STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS,
  type EstimateStatus, type ItemCategory,
} from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/estimate'
import PDFDownloadButton from '@/components/pdf/PDFDownloadButton'

export default function EstimateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [estimate, setEstimate] = useState<any>(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('estimates') || '[]')
    const found = stored.find((e: any) => e.id === params.id)
    if (!found) router.push('/estimates')
    else setEstimate(found)
  }, [params.id])

  function updateStatus(newStatus: string) {
    const stored = JSON.parse(localStorage.getItem('estimates') || '[]')
    const updated = stored.map((e: any) =>
      e.id === params.id ? { ...e, status: newStatus } : e
    )
    localStorage.setItem('estimates', JSON.stringify(updated))
    setEstimate((prev: any) => ({ ...prev, status: newStatus }))
  }

  if (!estimate) return <div className="text-center py-20 text-gray-400">読み込み中...</div>

  const items = estimate.items || []

  // PDF用にEstimate型へ変換
  const estimateForPDF = {
    ...estimate,
    customer: {
      id: '',
      name: estimate.customer_name || '',
      address: estimate.customer_address,
      phone: estimate.customer_phone,
      created_at: '',
      updated_at: '',
    },
    tax_rate: Number(estimate.tax_rate),
    subtotal: Number(estimate.subtotal),
    tax_amount: Number(estimate.tax_amount),
    total_amount: Number(estimate.total_amount),
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/estimates" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-gray-500 text-sm">{estimate.estimate_number}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[estimate.status as EstimateStatus]}`}>
                {STATUS_LABELS[estimate.status as EstimateStatus]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{estimate.title}</h1>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <PDFDownloadButton estimate={estimateForPDF} items={items} />
          {estimate.status === 'draft' && (
            <button
              onClick={() => updateStatus('sent')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Send size={15} /> 送付済みにする
            </button>
          )}
          {estimate.status === 'sent' && (
            <div className="flex gap-2">
              <button onClick={() => updateStatus('approved')} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <CheckCircle size={15} /> 承認
              </button>
              <button onClick={() => updateStatus('rejected')} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <XCircle size={15} /> 却下
              </button>
            </div>
          )}
          <Link
            href={`/estimates/${estimate.id}/edit`}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Pencil size={15} /> 編集
          </Link>
        </div>
      </div>

      {/* 詳細カード */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">顧客名</p>
          <p className="font-semibold text-gray-900">{estimate.customer_name || '—'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">発行日</p>
          <p className="font-semibold text-gray-900">{formatDate(estimate.issue_date)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">有効期限</p>
          <p className="font-semibold text-gray-900">{formatDate(estimate.expiry_date)}</p>
        </div>
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
              {items.map((item: any, i: number) => (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 text-center text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[item.category as ItemCategory] ?? item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.item_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.spec || '—'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 合計 */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>小計</span>
                <span>{formatCurrency(estimate.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>消費税（{Math.round(estimate.tax_rate * 100)}%）</span>
                <span>{formatCurrency(estimate.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                <span>合計金額</span>
                <span className="text-blue-700">{formatCurrency(estimate.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {estimate.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">備考・特記事項</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{estimate.notes}</p>
        </div>
      )}
    </div>
  )
}
