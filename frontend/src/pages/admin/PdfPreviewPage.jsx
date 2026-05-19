import { Download, Eye } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CardShell } from '../../components/shared/CardShell.jsx'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner.jsx'
import { SectionTitle } from '../../components/shared/SectionTitle.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import { api } from '../../lib/api.js'
import { formatLongDate } from '../../utils/formatters.js'
import { extractApiErrorMessage } from '../../utils/http.js'

export function PdfPreviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState(null)
  const { showToast } = useToast()

  const selectedDate = useMemo(
    () => searchParams.get('date') || new Date().toISOString().slice(0, 10),
    [searchParams],
  )

  useEffect(() => {
    let nextUrl = null

    const loadPdf = async () => {
      setLoading(true)

      try {
        const response = await api.get(`/admin/appointments/day/${selectedDate}/pdf`, {
          responseType: 'blob',
        })

        nextUrl = URL.createObjectURL(response.data)
        setPdfUrl(nextUrl)
      } catch (error) {
        setPdfUrl(null)
        showToast({
          type: 'error',
          title: 'Falha ao gerar PDF',
          description: extractApiErrorMessage(error, 'Não foi possível montar o PDF desta data.'),
        })
      } finally {
        setLoading(false)
      }
    }

    loadPdf()

    return () => {
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl)
      }
    }
  }, [selectedDate, showToast])

  return (
    <div className="flex flex-col gap-6">
      <CardShell>
        <SectionTitle
          eyebrow="PDF Preview"
          title="Pré-visualização diária de agendamentos"
          description={`Documento pronto para compartilhamento em ${formatLongDate(selectedDate)}.`}
        />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="date"
            className="input-shell max-w-xs"
            value={selectedDate}
            onChange={(event) => setSearchParams({ date: event.target.value })}
          />

          {pdfUrl ? (
            <a
              href={pdfUrl}
              download={`agenda-${selectedDate}.pdf`}
              className="premium-button premium-button-primary"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </a>
          ) : null}
        </div>
      </CardShell>

      <CardShell className="min-h-[720px]">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-3 text-amber-300">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f6e8c3]">Visualização do documento</p>
            <p className="text-sm text-white/45">Formato inline com layout pronto para envio.</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Gerando PDF..." />
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Preview do PDF da agenda"
            className="h-[680px] w-full rounded-[24px] border border-white/8 bg-black/35"
          />
        ) : (
          <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-white/45">
            Não foi possível gerar o PDF para esta data.
          </div>
        )}
      </CardShell>
    </div>
  )
}
