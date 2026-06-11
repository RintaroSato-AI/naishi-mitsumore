'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

interface Props {
  estimate: any
  items: any[]
}

export default function PDFDownloadButton({ estimate, items }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      // サーバーサイドNG なので動的インポート
      const { pdf } = await import('@react-pdf/renderer')
      const { default: EstimatePDF } = await import('./EstimatePDF')
      const { createElement } = await import('react')

      const blob = await pdf(
        createElement(EstimatePDF, { estimate, items })
      ).toBlob()

      // blobからダウンロードリンクを生成してクリック
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `見積書_${estimate.estimate_number}_${estimate.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      console.error('PDF生成エラー:', e)
      setError('PDF生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
      >
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> PDF生成中...</>
          : <><FileDown size={16} /> PDFダウンロード</>
        }
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
