import { EstimateItemFormData } from '@/types'

export function calcItemAmount(item: EstimateItemFormData): number {
  return Math.round(item.quantity * item.unit_price)
}

export function calcTotals(items: EstimateItemFormData[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + calcItemAmount(item), 0)
  const taxAmount = Math.round(subtotal * taxRate)
  const total = subtotal + taxAmount
  return { subtotal, taxAmount, total }
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}
