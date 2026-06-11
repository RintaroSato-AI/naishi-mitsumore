'use client'

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { CATEGORY_LABELS, type ItemCategory, type EstimateFormData } from '@/types'
import { formatCurrency } from '@/lib/utils/estimate'

const UNITS = ['式', 'm', 'm²', 'm³', '個', '枚', '本', '箇所', '台', 'セット', 'ヶ所']

interface Props {
  index: number
  register: UseFormRegister<EstimateFormData>
  watch: UseFormWatch<EstimateFormData>
  setValue: UseFormSetValue<EstimateFormData>
  errors: FieldErrors<EstimateFormData>
  onRemove: () => void
  canRemove: boolean
}

export default function ItemRow({ index, register, watch, onRemove, canRemove }: Props) {
  const qty = watch(`items.${index}.quantity`) || 0
  const price = watch(`items.${index}.unit_price`) || 0
  const amount = Math.round(Number(qty) * Number(price))

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      {/* カテゴリ */}
      <td className="px-2 py-2">
        <select
          {...register(`items.${index}.category`)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
        >
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </td>
      {/* 工事名称 */}
      <td className="px-2 py-2">
        <input
          {...register(`items.${index}.item_name`, { required: true })}
          placeholder="例：LGS下地組"
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>
      {/* 仕様 */}
      <td className="px-2 py-2">
        <input
          {...register(`items.${index}.spec`)}
          placeholder="例：t=12.5mm"
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </td>
      {/* 単位 */}
      <td className="px-2 py-2 w-20">
        <input
          {...register(`items.${index}.unit`)}
          list={`unit-list-${index}`}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
        />
        <datalist id={`unit-list-${index}`}>
          {UNITS.map(u => <option key={u} value={u} />)}
        </datalist>
      </td>
      {/* 数量 */}
      <td className="px-2 py-2 w-24">
        <input
          type="number"
          step="0.01"
          min="0"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 text-right"
        />
      </td>
      {/* 単価 */}
      <td className="px-2 py-2 w-32">
        <input
          type="number"
          min="0"
          {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 text-right"
        />
      </td>
      {/* 金額（自動計算） */}
      <td className="px-2 py-2 w-32 text-right font-semibold text-gray-800 text-sm">
        {formatCurrency(amount)}
      </td>
      {/* 削除ボタン */}
      <td className="px-2 py-2 text-center w-10">
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        )}
      </td>
    </tr>
  )
}
