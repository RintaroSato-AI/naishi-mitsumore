'use client'

import { formatCurrency } from '@/lib/utils/estimate'

interface Props {
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
}

export default function TotalSummary({ subtotal, taxRate, taxAmount, total }: Props) {
  return (
    <div className="flex justify-end">
      <div className="w-72 bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>小計</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>消費税（{Math.round(taxRate * 100)}%）</span>
          <span className="font-medium">{formatCurrency(taxAmount)}</span>
        </div>
        <div className="border-t border-gray-300 pt-2 flex justify-between">
          <span className="font-bold text-gray-900">合計金額</span>
          <span className="font-bold text-xl text-blue-700">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
