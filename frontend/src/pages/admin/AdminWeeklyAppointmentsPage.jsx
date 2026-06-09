import { CalendarDays, Clock3, Scissors, UserRound, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ConfirmModal } from '../../components/shared/ConfirmModal.jsx'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner.jsx'
import { SectionTitle } from '../../components/shared/SectionTitle.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import { api } from '../../lib/api.js'
import { extractApiErrorMessage } from '../../utils/http.js'
import { formatLongDate, formatTime } from '../../utils/formatters.js'

function compareAppointments(left, right) {
  const dateComparison = left.appointmentDate.localeCompare(right.appointmentDate)

  if (dateComparison !== 0) {
    return dateComparison
  }

  return left.appointmentTime.localeCompare(right.appointmentTime)
}

export function AdminWeeklyAppointmentsPage() {
  const [appointmentsByDay, setAppointmentsByDay] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const { showToast } = useToast()

  const loadAppointments = useCallback(async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/admin/appointments/week')
      setAppointmentsByDay(data)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Falha ao carregar agendamentos',
        description: extractApiErrorMessage(
          error,
          'Não foi possível buscar os agendamentos da semana.',
        ),
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const appointments = useMemo(() => {
    return appointmentsByDay
      .flatMap((day) =>
        (day.appointments ?? []).map((appointment) => ({
          ...appointment,
          dayOfWeek: day.dayOfWeek,
          appointmentDate: day.date,
        })),
      )
      .sort(compareAppointments)
  }, [appointmentsByDay])

  const handleOpenCancelModal = (appointment) => {
    setSelectedAppointment(appointment)
  }

  const handleCloseCancelModal = () => {
    if (cancelLoading) {
      return
    }

    setSelectedAppointment(null)
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) {
      return
    }

    setCancelLoading(true)

    try {
      await api.post(`/admin/appointments/${selectedAppointment.id}/cancel`)

      setAppointmentsByDay((current) =>
        current
          .map((day) => ({
            ...day,
            appointments: day.appointments.filter(
              (appointment) => appointment.id !== selectedAppointment.id,
            ),
          }))
          .filter((day) => day.appointments.length > 0),
      )

      showToast({
        type: 'success',
        title: 'Agendamento cancelado',
        description: 'O horário foi liberado imediatamente para novas reservas.',
      })

      setSelectedAppointment(null)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Falha ao cancelar',
        description: extractApiErrorMessage(
          error,
          'Não foi possível cancelar este agendamento.',
        ),
      })
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Carregando agenda da semana..." />
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle
        eyebrow="Agendamentos"
        title="Semana atual"
        description="Visualização cronológica dos agendamentos da semana corrente, com cancelamento imediato do horário."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-3 text-amber-300">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Agendamentos ativos</p>
              <p className="mt-2 font-display text-4xl text-[#f8efcf]">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/8 p-3 text-emerald-300">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Horários liberáveis</p>
              <p className="mt-2 font-display text-4xl text-[#f8efcf]">Ao cancelar</p>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-sky-300/20 bg-sky-300/8 p-3 text-sky-300">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Status</p>
              <p className="mt-2 font-display text-4xl text-[#f8efcf]">Tempo real</p>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card rounded-[28px] p-6 sm:p-7">
        {appointments.length ? (
          <div className="flex flex-col gap-4">
            {appointments.map((appointment, index) => {
              const previousAppointment = appointments[index - 1]
              const showDateHeader =
                !previousAppointment ||
                previousAppointment.appointmentDate !== appointment.appointmentDate

              return (
                <div key={appointment.id} className="flex flex-col gap-3">
                  {showDateHeader ? (
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div>
                        <p className="section-kicker">
                          {appointment.dayOfWeek}
                        </p>
                        <h2 className="font-display text-3xl text-[#f8efcf]">
                          {formatLongDate(appointment.appointmentDate)}
                        </h2>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[26px] border border-white/8 bg-black/25 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-semibold text-[#f6e8c3]">
                            {appointment.clientName}
                          </p>
                          <span className="rounded-full border border-amber-300/18 bg-amber-300/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                            {formatTime(appointment.appointmentTime)}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-white/62 sm:grid-cols-2">
                          <p className="flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-white/35" />
                            <span>Cliente: {appointment.clientName}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Scissors className="h-4 w-4 text-white/35" />
                            <span>Serviço: {appointment.serviceName}</span>
                          </p>
                          <p className="flex items-center gap-2 sm:col-span-2">
                            <CalendarDays className="h-4 w-4 text-white/35" />
                            <span>Data: {formatLongDate(appointment.appointmentDate)}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(appointment)}
                        className="premium-button premium-button-secondary w-full xl:w-auto"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancelar Agendamento
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[26px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center">
            <p className="font-display text-4xl text-[#f8efcf]">
              Nenhum agendamento ativo nesta semana
            </p>
            <p className="mt-3 text-sm text-white/45">
              Quando novos agendamentos entrarem, eles aparecerão nesta lista em ordem cronológica.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(selectedAppointment)}
        title="Cancelar agendamento?"
        description={
          selectedAppointment
            ? `Tem certeza que deseja cancelar o agendamento de ${selectedAppointment.clientName} às ${formatTime(selectedAppointment.appointmentTime)}?`
            : ''
        }
        confirmLabel="Cancelar agendamento"
        cancelLabel="Manter agendamento"
        onClose={handleCloseCancelModal}
        onConfirm={handleCancelAppointment}
        loading={cancelLoading}
      >
        {selectedAppointment ? (
          <div className="space-y-2 text-sm text-white/65">
            <p>
              <span className="text-white/40">Serviço:</span>{' '}
              {selectedAppointment.serviceName}
            </p>
            <p>
              <span className="text-white/40">Data:</span>{' '}
              {formatLongDate(selectedAppointment.appointmentDate)}
            </p>
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
