import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { Estimate, EstimateItem, CATEGORY_LABELS, type ItemCategory } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils/estimate'

// 日本語フォント（Noto Sans JP）
Font.register({
  family: 'NotoSansJP',
  fonts: [
    { src: 'https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Regular.otf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Bold.otf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    color: '#1a1a1a',
  },
  // ヘッダー
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 4,
  },
  estimateNumber: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoLeft: {
    width: '55%',
  },
  infoRight: {
    width: '40%',
    alignItems: 'flex-end',
  },
  customerName: {
    fontSize: 13,
    fontWeight: 700,
    borderBottom: '2px solid #1a1a1a',
    paddingBottom: 4,
    marginBottom: 4,
  },
  customerSub: {
    fontSize: 8,
    color: '#555',
    marginBottom: 2,
  },
  projectTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 12,
    backgroundColor: '#f0f4ff',
    padding: '6 8',
    borderLeft: '3px solid #2563eb',
  },
  infoRow: {
    flexDirection: 'row',
    fontSize: 8,
    marginBottom: 3,
  },
  infoLabel: {
    width: 60,
    color: '#666',
  },
  infoValue: {
    flex: 1,
  },
  // 金額ハイライト
  totalHighlight: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    padding: '6 10',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1d4ed8',
  },
  // テーブル
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    color: '#fff',
    padding: '4 0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid #e5e7eb',
    minHeight: 20,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  // カラム幅
  colNo: { width: 20, padding: '3 4', textAlign: 'center' },
  colCat: { width: 40, padding: '3 4' },
  colName: { flex: 1, padding: '3 4' },
  colSpec: { width: 70, padding: '3 4' },
  colUnit: { width: 24, padding: '3 4', textAlign: 'center' },
  colQty: { width: 30, padding: '3 4', textAlign: 'right' },
  colPrice: { width: 55, padding: '3 4', textAlign: 'right' },
  colAmount: { width: 60, padding: '3 4', textAlign: 'right', fontWeight: 700 },
  // 合計欄
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  summaryBox: {
    width: 180,
    border: '0.5px solid #d1d5db',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '4 8',
    borderBottom: '0.5px solid #e5e7eb',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '6 8',
    backgroundColor: '#1e3a5f',
    color: '#fff',
  },
  summaryLabelTotal: { fontSize: 9, fontWeight: 700 },
  summaryValueTotal: { fontSize: 11, fontWeight: 700 },
  // 備考
  notesSection: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 700,
    marginBottom: 4,
    color: '#374151',
  },
  notesBox: {
    border: '0.5px solid #d1d5db',
    padding: '6 8',
    minHeight: 40,
    fontSize: 8,
    color: '#555',
    lineHeight: 1.5,
  },
  // フッター
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
    borderTop: '0.5px solid #e5e7eb',
    paddingTop: 6,
  },
})

interface Props {
  estimate: Estimate
  items: EstimateItem[]
}

export default function EstimatePDF({ estimate, items }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* タイトル */}
        <View style={styles.header}>
          <Text style={styles.title}>御　見　積　書</Text>
          <Text style={styles.estimateNumber}>No. {estimate.estimate_number}</Text>
        </View>

        {/* 金額ハイライト */}
        <View style={styles.totalHighlight}>
          <Text style={styles.totalLabel}>御見積金額（税込）</Text>
          <Text style={styles.totalValue}>{formatCurrency(estimate.total_amount)} 也</Text>
        </View>

        {/* 顧客情報と発行情報 */}
        <View style={styles.infoGrid}>
          <View style={styles.infoLeft}>
            <Text style={styles.customerName}>{estimate.customer?.name ?? '　'} 御中</Text>
            {estimate.customer?.address && (
              <Text style={styles.customerSub}>〒 {estimate.customer.address}</Text>
            )}
            {estimate.customer?.phone && (
              <Text style={styles.customerSub}>TEL: {estimate.customer.phone}</Text>
            )}
          </View>
          <View style={styles.infoRight}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発行日</Text>
              <Text style={styles.infoValue}>{formatDate(estimate.issue_date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>有効期限</Text>
              <Text style={styles.infoValue}>{formatDate(estimate.expiry_date)}</Text>
            </View>
          </View>
        </View>

        {/* 工事名 */}
        <Text style={styles.projectTitle}>件名：{estimate.title}</Text>

        {/* 明細テーブル */}
        <View style={styles.table}>
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
            <View
              key={item.id}
              style={[styles.tableRow, i % 2 === 0 ? styles.tableRowEven : {}]}
            >
              <Text style={styles.colNo}>{i + 1}</Text>
              <Text style={styles.colCat}>{CATEGORY_LABELS[item.category as ItemCategory] ?? item.category}</Text>
              <Text style={styles.colName}>{item.item_name}</Text>
              <Text style={styles.colSpec}>{item.spec ?? ''}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{item.unit_price.toLocaleString('ja-JP')}</Text>
              <Text style={styles.colAmount}>{item.amount.toLocaleString('ja-JP')}</Text>
            </View>
          ))}
        </View>

        {/* 合計 */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>小計</Text>
              <Text>{formatCurrency(estimate.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>消費税（{Math.round(estimate.tax_rate * 100)}%）</Text>
              <Text>{formatCurrency(estimate.tax_amount)}</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>合計金額</Text>
              <Text style={styles.summaryValueTotal}>{formatCurrency(estimate.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* 備考 */}
        {estimate.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>備考・特記事項</Text>
            <View style={styles.notesBox}>
              <Text>{estimate.notes}</Text>
            </View>
          </View>
        )}

        {/* フッター */}
        <View style={styles.footer} fixed>
          <Text>発行日: {formatDate(estimate.issue_date)}</Text>
          <Text>見積もり番号: {estimate.estimate_number}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
