'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { PlusCircle, Save, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, type EstimateFormData, type Customer } from '@/types'
import { calcItemAmount, calcTotals } from '@/lib/utils/estimate'
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

export default function NewEstimatePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
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

  // 顧客一覧取得
  useEffect(() => {
    const supabase = createClient()
    supabase.from('customers').select('*').order('name').then(({ data }) => {
      if (data) setCustomers(data as Customer[])
    })
  }, [])

  async function onSubmit(data: EstimateFormData) {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未ログイン')

      // 新規顧客の場合は先に登録
      let customerId = data.customer_id
      if (isNewCustomer && data.customer_name) {
        const { data: newCust, error: custErr } = await supabase
          .from('customers')
          .insert({ name: data.customer_name, address: data.customer_address, phone: data.customer_phone })
          .select('id')
          .single()
        if (custErr) throw custErr
        customerId = newCust.id
      }

      // 見積もり番号生成
      const { data: numData } = await supabase.rpc('generate_estimate_number')
      const estimateNumber = numData ?? `${new Date().getFullYear()}-0001`

      // 見積もり本体を登録
      const { data: est, error: estErr } = await supabase
        .from('estimates')
        .insert({
          estimate_number: estimateNumber,
          customer_id: customerId || null,
          title: data.title,
          status: 'draft',
          issue_date: data.issue_date,
          expiry_date: data.expiry_date,
          notes: data.notes,
          subtotal,
          tax_rate: data.tax_rate,
          tax_amount: taxAmount,
          total_amount: total,
          created_by: user.id,
        })
        .select('id')
        .single()
      if (estErr) throw estErr

      // 明細を登録
      const items = data.items.map((item, i) => ({
        estimate_id: est.id,
        sort_order: i,
        category: item.category,
        item_name: item.item_name,
        spec: item.spec || null,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes || null,
      }))
      const { error: itemsErr } = await supabase.from('estimate_items').insert(items)
      if (itemsErr) throw itemsErr

      router.push(`/estimates/${est.id}`)
    } catch (e: any) {
      setError(e.message || '保存に失敗しました')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
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
            {/* 見積もりタイトル */}
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

            {/* 顧客選択 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">顧客</label>
              <div className="flex gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(false)}
                  className={`text-sm px-3 py-1 rounded-full border transition-colors ${!isNewCustomer ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-300 hover:border-blue-400'}`}
                >
                  既存顧客から選ぶ
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(true)}
                  className={`text-sm px-3 py-1 rounded-full border transition-colors ${isNewCustomer ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-300 hover:border-blue-400'}`}
                >
                  新規顧客を入力
                </button>
              </div>
              {!isNewCustomer ? (
                <select
                  {...register('customer_id')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">（顧客なし）</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <input
                    {...register('customer_name', { required: isNewCustomer })}
                    placeholder="顧客名 *"
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
              )}
            </div>

            {/* 発行日・有効期限・消費税 */}
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

            {/* 備考 */}
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
          <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            工事明細
          </h2>
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

          {/* 合計 */}
          <div className="mt-6">
            <TotalSummary
              subtotal={subtotal}
              taxRate={Number(taxRate)}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        </section>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 送信ボタン */}
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
            {saving ? '保存中...' : '下書き保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
