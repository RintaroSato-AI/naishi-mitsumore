'use client'

import { useState, useEffect } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Estimate, EstimateItem } from '@/types'

interface Props {
  estimate: Estimate
  items: EstimateItem[]
}

export default function PDFDownloadButton({ estimate, items }: Props) {
  const [ready, setReady] = useState(false)
  const [PDFDownloadLink, setPDFDownloadLink] = useState<any>(null)
  const [EstimatePDF, setEstimatePDF] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
      import('./EstimatePDF').then(m => m.default),
    ]).then(([link, pdf]) => {
      setPDFDownloadLink(() => link)
      setEstimatePDF(() => pdf)
      setReady(true)
    })
  }, [])

  const filename = `見積もり_${estimate.estimate_number}_${estimate.title}.pdf`

  if (!ready || !PDFDownloadLink || !EstimatePDF) {
    return (
      <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm">
        <Loader2 size={16} className="animate-spin" /> PDF準備中...
      </button>
    )
  }

  return (
    <PDFDownloadLink
      document={<EstimatePDF estimate={estimate} items={items} />}
      fileName={filename}
    >
      {({ loading }: { loading: boolean }) => (
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
