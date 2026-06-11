// ユーザー
export type UserRole = 'admin' | 'staff'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

// 顧客
export interface Customer {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  notes?: string
  created_at: string
  updated_at: string
}

// 見積もりステータス
export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'

// 見積もり本体
export interface Estimate {
  id: string
  estimate_number: string
  customer_id: string
  customer?: Customer
  title: string
  status: EstimateStatus
  issue_date: string
  expiry_date: string
  notes?: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  created_by: string
  created_by_user?: User
  created_at: string
  updated_at: string
  items?: EstimateItem[]
}

// 見積もり明細カテゴリ
export type ItemCategory =
  | 'demolition'      // 解体
  | 'construction'    // 造作
  | 'flooring'        // 床
  | 'wall'            // 壁
  | 'ceiling'         // 天井
  | 'painting'        // 塗装
  | 'electrical'      // 電気
  | 'plumbing'        // 給排水
  | 'carpentry'       // 建具
  | 'equipment'       // 設備機器
  | 'material'        // 材料費
  | 'labor'           // 工賃
  | 'other'           // その他

// 見積もり明細
export interface EstimateItem {
  id: string
  estimate_id: string
  sort_order: number
  category: ItemCategory
  item_name: string
  spec?: string          // 仕様・規格
  unit: string           // 単位（式、m、m²、個 etc）
  quantity: number
  unit_price: number
  amount: number         // quantity × unit_price
  notes?: string
}

// 見積もり作成フォーム用
export interface EstimateFormData {
  customer_id?: string
  customer_name?: string   // 新規顧客の場合
  customer_address?: string
  customer_phone?: string
  title: string
  issue_date: string
  expiry_date: string
  tax_rate: number
  notes?: string
  items: EstimateItemFormData[]
}

export interface EstimateItemFormData {
  category: ItemCategory
  item_name: string
  spec?: string
  unit: string
  quantity: number
  unit_price: number
  notes?: string
}

// カテゴリラベルマップ
export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  demolition: '解体',
  construction: '造作',
  flooring: '床',
  wall: '壁',
  ceiling: '天井',
  painting: '塗装',
  electrical: '電気',
  plumbing: '給排水',
  carpentry: '建具',
  equipment: '設備機器',
  material: '材料費',
  labor: '工賃',
  other: 'その他',
}

export const STATUS_LABELS: Record<EstimateStatus, string> = {
  draft: '下書き',
  sent: '送付済み',
  approved: '承認済み',
  rejected: '却下',
  expired: '期限切れ',
}

export const STATUS_COLORS: Record<EstimateStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-yellow-100 text-yellow-700',
}
