'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { PlusCircle, Save, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { CATEGORY_LABELS, type EstimateFormData } from '@/types'
import { calcTotals } from '@/lib/utils/estimate'
import ItemRow from '@/components/estimates/ItemRow'
import TotalSummary from '@/components/estimates/TotalSummary'

const DEFAULT_ITEM = {
  category: 'other' as const,
  item_name: '',
  spec: '',
  unit: '式',
  quantity: 1,
  unit_price: 0,
  notes: '',
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function generateEstimateNumber() {
  const year = new Date().getFullYear()
  const stored = JSON.parse(localStorage.getItem('estimates') || '[]')
  const seq = (stored.length + 1).toString().padStart(4, '0')
  return `${year}-${seq}`
}

export default function NewEstimatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [isNewCustomer, setIsNewCustomer] = useState(true)

  const {
    register, control, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<EstimateFormData>({
    defaultValues: {
      title: '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0],
      tax_rate: 0.10,
      notes: '',
      items: [{ ...DEFAULT_ITEM }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchItems = watch('items')
  const taxRate = watch('tax_rate')
  const { subtotal, taxAmount, total } = calcTotals(watchItems || [], Number(taxRate))

  function onSubmit(data: EstimateFormData) {
    setSaving(true)
    try {
      const existing = JSON.parse(localStorage.getItem('estimates') || '[]')
      const estimateNumber = generateEstimateNumber()
      const id = generateId()

      const newEstimate = {
        id,
        estimate_number: estimateNumber,
        customer_name: data.customer_name || '',
        customer_address: data.customer_address || '',
        customer_phone: data.customer_phone || '',
        title: data.title,
        status: 'draft',
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        notes: data.notes || '',
        tax_rate: data.tax_rate,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        items: data.items.map((item, i) => ({
          id: generateId(),
          sort_order: i,
          ...item,
          amount: Math.round(item.quantity * item.unit_price),
        })),
        created_at: new Date().toISOString(),
      }

      localStorage.setItem('estimates', JSON.stringify([newEstimate, ...existing]))
      router.push(`/estimates/${id}`)
    } catch (e) {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/estimates" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">新規見積もり作成</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">基本情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                見積もりタイトル <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title', { required: 'タイトルは必須です' })}
                placeholder="例：○○様邸 リビングリフォーム工事"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* 顧客情報 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">顧客情報</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  {...register('customer_name')}
                  placeholder="顧客名"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  {...register('customer_address')}
                  placeholder="住所"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  {...register('customer_phone')}
                  placeholder="電話番号"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">発行日</label>
              <input
                type="date"
                {...register('issue_date', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
              <input
                type="date"
                {...register('expiry_date', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">消費税率</label>
              <select
                {...register('tax_rate', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value={0.10}>10%（標準）</option>
                <option value={0.08}>8%（軽減）</option>
                <option value={0}>0%（非課税）</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">備考・特記事項</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="工期、支払条件、特記事項など..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
          </div>
        </section>

        {/* 明細テーブル */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">工事明細</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="px-2 py-2 text-left w-28">カテゴリ</th>
                  <th className="px-2 py-2 text-left">工事名称</th>
                  <th className="px-2 py-2 text-left w-32">仕様・規格</th>
                  <th className="px-2 py-2 text-center w-20">単位</th>
                  <th className="px-2 py-2 text-right w-24">数量</th>
                  <th className="px-2 py-2 text-right w-32">単価（円）</th>
                  <th className="px-2 py-2 text-right w-32">金額</th>
                  <th className="px-2 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <ItemRow
                    key={field.id}
                    index={index}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    onRemove={() => remove(index)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => append({ ...DEFAULT_ITEM })}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <PlusCircle size={16} />
            行を追加
          </button>

          <div className="mt-6">
            <TotalSummary
              subtotal={subtotal}
              taxRate={Number(taxRate)}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        </section>

        <div className="flex justify-end gap-3 pb-8">
          <Link
            href="/estimates"
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  )
}
