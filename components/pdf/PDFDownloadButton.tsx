'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

interface Props {
  estimate: any
  items: any[]
}

// jsDelivr 経由の Noto Sans JP (WOFF形式・react-pdf対応)
const FONT_URLS = {
  regular: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-400-normal.woff',
  bold:    'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff',
}

// フォントをfetchしてbase64 data URLに変換（react-pdfに確実に渡すため）
async function fetchFontAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`font fetch failed: ${url}`)
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:font/woff;base64,${btoa(binary)}`
}

export default function PDFDownloadButton({ estimate, items }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const { pdf, Font } = await import('@react-pdf/renderer')
      const { default: EstimatePDF } = await import('./EstimatePDF')
      const { createElement } = await import('react')

      // フォントが未登録なら登録（重複登録を防ぐ）
      const registered = (Font as any).getRegisteredFonts?.() ?? {}
      if (!registered['NotoSansJP']) {
        const [regularDataUrl, boldDataUrl] = await Promise.all([
          fetchFontAsDataUrl(FONT_URLS.regular),
          fetchFontAsDataUrl(FONT_URLS.bold),
        ])
        Font.register({
          family: 'NotoSansJP',
          fonts: [
            { src: regularDataUrl, fontWeight: 400 },
            { src: boldDataUrl,    fontWeight: 700 },
          ],
        })
      }

      const blob = await pdf(
        createElement(EstimatePDF, { estimate, items }) as any
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `見積書_${estimate.estimate_number}_${estimate.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      console.error('PDF生成エラー:', e)
      setError('PDF生成に失敗しました。再度お試しください。')
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
          ? <><Loader2 size={16} className="animate-spin" /> PDF生成中（初回は少し時間がかかるで）</>
          : <><FileDown size={16} /> PDFダウンロード</>
        }
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
