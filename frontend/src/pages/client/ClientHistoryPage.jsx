import { Ban, CalendarClock, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CardShell } from '../../components/shared/CardShell.jsx'
import { ConfirmModal } from '../../components/shared/ConfirmModal.jsx'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner.jsx'
import { Navbar } from '../../components/shared/Navbar.jsx'
import { SectionTitle } from '../../components/shared/SectionTitle.jsx'
import { useClientSession } from '../../contexts/ClientSessionContext.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import { api } from '../../lib/api.js'
import { formatCurrency, formatLongDate, formatPhone, formatTime, getStatusLabel } from '../../utils/formatters.js'
import { extractApiErrorMessage } from '../../utils/http.js'

export function ClientHistoryPage() {
  const { clientProfile, hasClientProfile } = useClientSession()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const { showToast } = useToast()

  const loadAppointments = async () => {
    if (!hasClientProfile) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const { data } = await api.get('/client/appointments', {
        params: {
          name: clientProfile.name,
          phone: clientProfile.phone,
        },
      })

      setAppointments(data)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Falha ao carregar histórico',
        description: extractApiErrorMessage(error, 'Não foi possível buscar seus agendamentos.'),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [hasClientProfile])

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) {
      return
    }

    setCancelLoading(true)

    try {
      await api.post(`/client/appointments/${selectedAppointment.id}/cancel`, {
        name: clientProfile.name,
        phone: clientProfile.phone,
      })

      showToast({
        type: 'success',
        title: 'Agendamento cancelado',
        description: 'O horário voltou para a lista disponível, se ainda estiver dentro da agenda ativa.',
      })
      setSelectedAppointment(null)
      await loadAppointments()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Falha ao cancelar',
        description: extractApiErrorMessage(error, 'Não foi possível cancelar este agendamento.'),
      })
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="page-shell page-grid">
      <div className="glow-orb top" />
      <div className="glow-orb bottom" />

      <Navbar
        actions={
          <>
            <Link to="/" className="premium-button premium-button-secondary">
              Início
            </Link>
            <Link to="/cliente/agendamento" className="premium-button premium-button-primary">
              Voltar para agenda
            </Link>
          </>
        }
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <CardShell>
          <SectionTitle
            eyebrow="Histórico"
            title="Seus próprios agendamentos"
            description="Visualize reservas em andamento, acompanhe horários passados e cancele quando quiser."
          />

          {hasClientProfile ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/62">
                <p className="section-kicker">Cliente</p>
                <p className="mt-2 text-lg font-semibold text-[#f6e8c3]">{clientProfile.name}</p>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/62">
                <p className="section-kicker">Telefone</p>
                <p className="mt-2 text-lg font-semibold text-[#f6e8c3]">
                  {formatPhone(clientProfile.phone)}
                </p>
              </div>
            </div>
          ) : null}
        </CardShell>

        {!hasClientProfile ? (
          <CardShell className="text-center">
            <Ban className="mx-auto h-8 w-8 text-amber-300" />
            <p className="mt-4 font-display text-4xl text-[#f8efcf]">Identificação ausente</p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/58">
              Entre primeiro como cliente para salvar nome e telefone, e então acompanhar seus próprios agendamentos.
            </p>
            <Link to="/cliente/agendamento" className="premium-button premium-button-primary mt-6">
              Ir para agendamento
            </Link>
          </CardShell>
        ) : loading ? (
          <LoadingSpinner label="Carregando seus agendamentos..." />
        ) : (
          <div className="grid gap-4">
            {appointments.length ? (
              appointments.map((appointment) => {
                const scheduled = appointment.status === 'SCHEDULED'

                return (
                  <CardShell key={appointment.id} className="overflow-hidden">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-3 text-amber-300">
                          <CalendarClock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-white/35">
                            {getStatusLabel(appointment.status)}
                          </p>
                          <p className="mt-2 font-display text-4xl text-[#f8efcf]">
                            {appointment.serviceName}
                          </p>
                          <div className="mt-3 grid gap-2 text-sm text-white/60 sm:grid-cols-2">
                            <p>Data: {formatLongDate(appointment.appointmentDate)}</p>
                            <p>Horário: {formatTime(appointment.appointmentTime)}</p>
                            <p>Telefone: {formatPhone(appointment.clientPhone)}</p>
                            <p>Valor: {formatCurrency(appointment.servicePrice)}</p>
                          </div>
                        </div>
                      </div>

                      {scheduled ? (
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(appointment)}
                          className="premium-button premium-button-secondary w-full lg:w-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Cancelar agendamento
                        </button>
                      ) : (
                        <div className="rounded-full border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.28em] text-white/45">
                          Histórico finalizado
                        </div>
                      )}
                    </div>
                  </CardShell>
                )
              })
            ) : (
              <CardShell className="text-center">
                <p className="font-display text-4xl text-[#f8efcf]">Nenhum agendamento encontrado</p>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Assim que você reservar um horário, ele aparecerá aqui.
                </p>
              </CardShell>
            )}
          </div>
        )}
      </main>

      <ConfirmModal
        open={Boolean(selectedAppointment)}
        title="Cancelar este agendamento?"
        description="Essa ação pode ser feita a qualquer momento. Se o horário ainda estiver válido na agenda liberada, ele volta a aparecer como disponível."
        confirmLabel="Cancelar agora"
        onClose={() => setSelectedAppointment(null)}
        onConfirm={handleCancelAppointment}
        loading={cancelLoading}
      >
        {selectedAppointment ? (
          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/70">
            <p>
              <span className="text-white/45">Serviço:</span> {selectedAppointment.serviceName}
            </p>
            <p className="mt-2">
              <span className="text-white/45">Data:</span> {formatLongDate(selectedAppointment.appointmentDate)}
            </p>
            <p className="mt-2">
              <span className="text-white/45">Horário:</span> {formatTime(selectedAppointment.appointmentTime)}
            </p>
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
