'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { CATEGORY_LABELS, type ItemCategory } from '@/types'

// ※ @react-pdf/renderer はデフォルトで英数字フォント内蔵
// 日本語は文字化けを避けるため、外部フォントなしで動作させる

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    color: '#1a1a1a',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  estimateNumber: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  totalHighlight: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 10 },
  totalValue: { fontSize: 16, color: '#1d4ed8' },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  infoLeft: { width: '55%' },
  infoRight: { width: '40%' },
  customerName: { fontSize: 12, marginBottom: 4, borderBottomWidth: 2, borderColor: '#1a1a1a', paddingBottom: 3 },
  customerSub: { fontSize: 8, color: '#555', marginBottom: 2 },
  projectTitle: { fontSize: 10, marginBottom: 12, backgroundColor: '#f0f4ff', padding: 6, borderLeftWidth: 3, borderLeftColor: '#2563eb' },
  infoRow: { flexDirection: 'row', fontSize: 8, marginBottom: 3 },
  infoLabel: { width: 55, color: '#666' },
  // テーブル
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e3a5f', color: '#fff', paddingVertical: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', minHeight: 20 },
  tableRowEven: { backgroundColor: '#f9fafb' },
  colNo:     { width: 20,  paddingHorizontal: 4, paddingVertical: 3, textAlign: 'center' },
  colCat:    { width: 40,  paddingHorizontal: 4, paddingVertical: 3 },
  colName:   { flex: 1,    paddingHorizontal: 4, paddingVertical: 3 },
  colSpec:   { width: 70,  paddingHorizontal: 4, paddingVertical: 3 },
  colUnit:   { width: 24,  paddingHorizontal: 4, paddingVertical: 3, textAlign: 'center' },
  colQty:    { width: 30,  paddingHorizontal: 4, paddingVertical: 3, textAlign: 'right' },
  colPrice:  { width: 55,  paddingHorizontal: 4, paddingVertical: 3, textAlign: 'right' },
  colAmount: { width: 60,  paddingHorizontal: 4, paddingVertical: 3, textAlign: 'right' },
  // 合計
  summarySection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, marginBottom: 16 },
  summaryBox: { width: 180, borderWidth: 0.5, borderColor: '#d1d5db' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 5, borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb' },
  summaryRowTotal: { flexDirection: 'row', justifyContent: 'space-between', padding: 6, backgroundColor: '#1e3a5f' },
  summaryLabelTotal: { fontSize: 9, color: '#fff' },
  summaryValueTotal: { fontSize: 11, color: '#fff' },
  // 備考
  notesTitle: { fontSize: 8, marginBottom: 4, color: '#374151' },
  notesBox: { borderWidth: 0.5, borderColor: '#d1d5db', padding: 6, minHeight: 36, fontSize: 8, color: '#555' },
  // フッター
  footer: {
    position: 'absolute', bottom: 24, left: 40, right: 40,
    flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 7, color: '#9ca3af',
    borderTopWidth: 0.5, borderTopColor: '#e5e7eb', paddingTop: 5,
  },
})

function fmt(n: number) { return '\xA5' + n.toLocaleString() }
function fmtDate(s: string) {
  try {
    const d = new Date(s)
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
  } catch { return s }
}

interface Props {
  estimate: any
  items: any[]
}

export default function EstimatePDF({ estimate, items }: Props) {
  const customerName = estimate.customer?.name || estimate.customer_name || ''
  const customerAddress = estimate.customer?.address || estimate.customer_address || ''
  const customerPhone = estimate.customer?.phone || estimate.customer_phone || ''

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* タイトル */}
        <Text style={styles.title}>御見積書</Text>
        <Text style={styles.estimateNumber}>No. {estimate.estimate_number}</Text>

        {/* 合計金額ハイライト */}
        <View style={styles.totalHighlight}>
          <Text style={styles.totalLabel}>御見積金額（税込）</Text>
          <Text style={styles.totalValue}>{fmt(estimate.total_amount)} 也</Text>
        </View>

        {/* 顧客・発行情報 */}
        <View style={styles.infoGrid}>
          <View style={styles.infoLeft}>
            <Text style={styles.customerName}>{customerName || '　'} 御中</Text>
            {customerAddress ? <Text style={styles.customerSub}>{customerAddress}</Text> : null}
            {customerPhone ? <Text style={styles.customerSub}>TEL: {customerPhone}</Text> : null}
          </View>
          <View style={styles.infoRight}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発行日</Text>
              <Text>{fmtDate(estimate.issue_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>有効期限</Text>
              <Text>{fmtDate(estimate.expiry_date)}</Text>
            </View>
          </View>
        </View>

        {/* 件名 */}
        <Text style={styles.projectTitle}>件名：{estimate.title}</Text>

        {/* 明細テーブル */}
        <View style={{ marginBottom: 4 }}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>No</Text>
            <Text style={styles.colCat}>区分</Text>
            <Text style={styles.colName}>工事名称</Text>
            <Text style={styles.colSpec}>仕様・規格</Text>
            <Text style={styles.colUnit}>単位</Text>
            <Text style={styles.colQty}>数量</Text>
            <Text style={styles.colPrice}>単価</Text>
            <Text style={styles.colAmount}>金額</Text>
          </View>
          {items.map((item, i) => (
            <View key={item.id || i} style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}>
              <Text style={styles.colNo}>{i + 1}</Text>
              <Text style={styles.colCat}>{CATEGORY_LABELS[item.category as ItemCategory] ?? item.category}</Text>
              <Text style={styles.colName}>{item.item_name}</Text>
              <Text style={styles.colSpec}>{item.spec ?? ''}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{Number(item.unit_price).toLocaleString()}</Text>
              <Text style={styles.colAmount}>{Number(item.amount).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* 合計 */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>小計</Text>
              <Text>{fmt(estimate.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>消費税（{Math.round(estimate.tax_rate * 100)}%）</Text>
              <Text>{fmt(estimate.tax_amount)}</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>合計金額</Text>
              <Text style={styles.summaryValueTotal}>{fmt(estimate.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* 備考 */}
        {estimate.notes ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.notesTitle}>備考・特記事項</Text>
            <View style={styles.notesBox}>
              <Text>{estimate.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* フッター */}
        <View style={styles.footer} fixed>
          <Text>発行日: {fmtDate(estimate.issue_date)}</Text>
          <Text>見積書番号: {estimate.estimate_number}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
