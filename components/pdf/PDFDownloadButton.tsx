'use client'

import dynamic from 'next/dynamic'
import { FileDown, Loader2 } from 'lucide-react'
import { Estimate, EstimateItem } from '@/types'

// @react-pdf/renderer はサーバーサイドでは使えないので動的インポート
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false, loading: () => (
    <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm">
      <Loader2 size={16} className="animate-spin" /> PDF準備中...
    </button>
  )}
)

const EstimatePDF = dynamic(() => import('./EstimatePDF'), { ssr: false })

interface Props {
  estimate: Estimate
  items: EstimateItem[]
}

export default function PDFDownloadButton({ estimate, items }: Props) {
  const filename = `見積もり_${estimate.estimate_number}_${estimate.title}.pdf`

  return (
    <PDFDownloadLink
      document={<EstimatePDF estimate={estimate} items={items} />}
      fileName={filename}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          {loading ? 'PDF生成中...' : 'PDFダウンロード'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
