import { CalendarRange, LockOpen, Save, CalendarOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CardShell } from '../../components/shared/CardShell.jsx'
import { LoadingSpinner } from '../../components/shared/LoadingSpinner.jsx'
import { SectionTitle } from '../../components/shared/SectionTitle.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import { api } from '../../lib/api.js'
import { formatDayLabel, formatLongDate, formatTime } from '../../utils/formatters.js'
import { extractApiErrorMessage } from '../../utils/http.js'

function buildDrafts(days) {
  return Object.fromEntries(
    days.map((day) => [
      day.dayOfWeek,
      {
        startHour: formatTime(day.startHour),
        endHour: formatTime(day.endHour),
        lunchStart: formatTime(day.lunchStart),
        lunchEnd: formatTime(day.lunchEnd),
        isOpen: !day.dayOff,
      },
    ]),
  )
}

export function AdminSchedulePage() {
  const [schedule, setSchedule] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState(null)
  const { showToast } = useToast()

  const loadSchedule = async () => {
    setLoading(true)

    try {
      const { data } = await api.get('/admin/schedules/week')

      setSchedule(data)
      setDrafts(buildDrafts(data.days))
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Falha ao carregar agenda',
        description: extractApiErrorMessage(
          error,
          'Não foi possível buscar a agenda semanal.',
        ),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  const visibleDays = useMemo(() => schedule?.days ?? [], [schedule])

  const totalSlotsReais = useMemo(() => {
    return visibleDays.reduce((acc, day) => {
      return acc + (day.dayOff ? 0 : (day.totalSlots || 0))
    }, 0)
  }, [visibleDays])

  const livresReais = useMemo(() => {
    return visibleDays.reduce((acc, day) => {
      return acc + (day.dayOff ? 0 : (day.availableSlots || 0))
    }, 0)
  }, [visibleDays])

  const handleSaveDay = async (dayOfWeek) => {
    const draft = drafts[dayOfWeek]

    setSavingKey(dayOfWeek)

    const payload = draft.isOpen
      ? {
          dayOfWeek,
          dayOff: false,
          startHour: draft.startHour,
          endHour: draft.endHour,
          lunchStart: draft.lunchStart || null,
          lunchEnd: draft.lunchEnd || null,
        }
      : {
          dayOfWeek,
          dayOff: true,
        }

    try {
      const { data } = await api.put('/admin/schedules/day', payload)

      setSchedule(data)
      setDrafts(buildDrafts(data.days))

      showToast({
        type: 'success',
        title: draft.isOpen
          ? 'Horários atualizados'
          : 'Dia de folga configurado',
        description: draft.isOpen
          ? 'Os slots deste dia foram recalculados.'
          : 'Este dia foi marcado como fechado com sucesso.',
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Falha ao salvar dia',
        description: extractApiErrorMessage(
          error,
          'Não foi possível atualizar este dia.',
        ),
      })
    } finally {
      setSavingKey(null)
    }
  }

  const handleToggleRelease = async () => {
    setSavingKey('release')

    try {
      const { data } = await api.post(
        '/admin/schedules/release',
        null,
        {
          params: {
            released: !schedule.released,
          },
        },
      )

      setSchedule(data)
      setDrafts(buildDrafts(data.days))

      showToast({
        type: 'success',
        title: data.released
          ? 'Agenda liberada'
          : 'Agenda recolhida',
        description: data.released
          ? 'Os clientes já podem reservar os horários da semana.'
          : 'Os clientes não conseguem mais visualizar horários reserváveis.',
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Falha na liberação',
        description: extractApiErrorMessage(
          error,
          'Não foi possível alterar o estado da agenda.',
        ),
      })
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) {
    return (
      <LoadingSpinner label="Carregando agenda semanal..." />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <CardShell className="overflow-hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            eyebrow="Agenda Semanal"
            title="Controle completo dos horários disponíveis"
            description={`Semana ativa: ${formatLongDate(schedule.weekStart)} até ${formatLongDate(schedule.weekEnd)}.`}
          />

          <div className="rounded-[26px] border border-amber-300/14 bg-amber-300/8 p-5">
            <p className="section-kicker">
              Disponibilidade
            </p>

            <p className="mt-2 font-display text-4xl text-[#f8efcf]">
              {schedule.released
                ? 'Liberada'
                : 'Bloqueada'}
            </p>

            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p>
                Slots totais: {totalSlotsReais}
              </p>

              <p>
                Slots livres: {livresReais}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleRelease}
              className="premium-button premium-button-primary mt-4 w-full"
              disabled={savingKey === 'release'}
            >
              <LockOpen className="h-4 w-4" />

              {savingKey === 'release'
                ? 'Atualizando...'
                : schedule.released
                  ? 'Retirar agenda do cliente'
                  : 'Liberar agenda semanal'}
            </button>
          </div>
        </div>
      </CardShell>

      <div className="grid gap-5 xl:grid-cols-2">
        {visibleDays.map((day) => {
          const isDayOpen =
            drafts[day.dayOfWeek]?.isOpen ?? !day.dayOff

          return (
            <CardShell
              key={`${day.dayOfWeek}-${day.date}`}
              className="relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-300/7 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-2xl border p-3 ${
                        isDayOpen
                          ? 'border-amber-300/20 bg-amber-300/8 text-amber-300'
                          : 'border-white/10 bg-white/5 text-white/40'
                      }`}
                    >
                      {isDayOpen ? (
                        <CalendarRange className="h-5 w-5" />
                      ) : (
                        <CalendarOff className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#f6e8c3]">
                        {formatDayLabel(
                          day.dayOfWeek,
                          day.date,
                        )}
                      </p>

                      <p className="text-sm text-white/45">
                        {formatLongDate(day.date)}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={isDayOpen}
                      onChange={(event) => {
                        const checked =
                          event.target.checked

                        setDrafts((current) => ({
                          ...current,

                          [day.dayOfWeek]: {
                            ...current[day.dayOfWeek],

                            isOpen: checked,

                            ...(checked
                              ? {}
                              : {
                                  startHour: '',
                                  endHour: '',
                                  lunchStart: '',
                                  lunchEnd: '',
                                }),
                          },
                        }))
                      }}
                    />

                    <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white/40 after:transition-all peer-checked:bg-amber-400 peer-checked:after:translate-x-full peer-checked:after:bg-black" />

                    <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                      {isDayOpen ? 'Aberto' : 'Folga'}
                    </span>
                  </label>
                </div>

                {isDayOpen ? (
                  <>
                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                          Início
                        </label>

                        <input
                          type="time"
                          step="3600"
                          className="input-shell"
                          value={
                            drafts[day.dayOfWeek]
                              ?.startHour || ''
                          }
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,

                              [day.dayOfWeek]: {
                                ...current[
                                  day.dayOfWeek
                                ],

                                startHour:
                                  event.target.value,
                              },
                            }))
                          }
                          />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                          Fim do almoço
                        </label>

                        <input
                          type="time"
                          step="3600"
                          className="input-shell"
                          value={
                            drafts[day.dayOfWeek]
                              ?.lunchEnd || ''
                          }
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,

                              [day.dayOfWeek]: {
                                ...current[
                                  day.dayOfWeek
                                ],

                                lunchEnd:
                                  event.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                          Início do almoço
                        </label>

                        <input
                          type="time"
                          step="3600"
                          className="input-shell"
                          value={
                            drafts[day.dayOfWeek]
                              ?.lunchStart || ''
                          }
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,

                              [day.dayOfWeek]: {
                                ...current[
                                  day.dayOfWeek
                                ],

                                lunchStart:
                                  event.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#f6e8c2]">
                          Fim
                        </label>

                        <input
                          type="time"
                          step="3600"
                          className="input-shell"
                          value={
                            drafts[day.dayOfWeek]
                              ?.endHour || ''
                          }
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,

                              [day.dayOfWeek]: {
                                ...current[
                                  day.dayOfWeek
                                ],

                                endHour:
                                  event.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                          Slots
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[#f6e8c3]">
                          {day.totalSlots}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                          Reservados
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[#f6e8c3]">
                          {day.bookedSlots}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                          Livres
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[#f6e8c3]">
                          {day.availableSlots}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 text-center">
                    <p className="text-sm font-medium text-white/40">
                      Nenhum horário comercial definido
                      para este dia.
                    </p>
                  </div>
                )}

                <div className="mt-5 flex justify-end border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveDay(day.dayOfWeek)
                    }
                    disabled={
                      savingKey === day.dayOfWeek
                    }
                    className="premium-button premium-button-primary px-4 py-2 text-xs"
                  >
                    <Save className="h-3.5 w-3.5" />

                    {savingKey === day.dayOfWeek
                      ? 'Salvando...'
                      : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </CardShell>
          )
        })}
      </div>
    </div>
  )
}
