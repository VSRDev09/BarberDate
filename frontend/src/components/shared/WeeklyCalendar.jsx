import { Clock3, CalendarOff } from 'lucide-react'
import { formatDate, formatDayLabel, formatTime } from '../../utils/formatters.js'
import { CardShell } from './CardShell.jsx'

export function WeeklyCalendar({
  days,
  onSelectSlot,
  selectedSlotId,
  disabled = false,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {days.map((day) => {
       
       const isClosed = day.dayOff;

        return (
          <CardShell key={`${day.dayOfWeek}-${day.date}`} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-300/8 blur-3xl" />
            <div className="relative flex flex-col gap-5">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <p className="section-kicker">{formatDate(day.date)}</p>
                  <h3 className="font-display text-3xl text-[#f8efcf]">
                    {formatDayLabel(day.dayOfWeek, day.date)}
                  </h3>
                </div>
                <div className="rounded-full border border-amber-300/15 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  {isClosed ? 'Fechado' : `${formatTime(day.startHour)} - ${formatTime(day.endHour)}`}
                </div>
              </div>

              {isClosed ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-white/[0.02] p-4 border border-white/5 text-white/30">
                    <CalendarOff className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <p className="mt-3 font-semibold text-[#f6e7c2]">Barbeiro em dia de descanso</p>
                  <p className="text-xs text-white/40 mt-1">Não há atendimento disponível nesta data.</p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[1.3fr_0.95fr]">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#f6e7c2]">
                      <Clock3 className="h-4 w-4" />
                      Horários livres
                    </div>
                    {day.availableSlots.length ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {day.availableSlots.map((slot) => {
                          const selected = selectedSlotId === slot.id

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => onSelectSlot(day, slot)}
                              className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                                selected
                                  ? 'border-amber-300/70 bg-amber-300 text-black'
                                  : 'border-white/10 bg-white/[0.035] text-white/85 hover:border-amber-300/35 hover:bg-amber-300/8'
                              }`}
                            >
                              {formatTime(slot.startTime)}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-white/45">
                        Nenhum horário disponível neste dia.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-semibold text-white/70">Horários ocupados</div>
                    {day.occupiedSlots.length ? (
                      <div className="space-y-3">
                        {day.occupiedSlots.map((slot) => (
                          <div
                            key={`occupied-${slot.id}`}
                            className="rounded-2xl border border-white/8 bg-black/35 px-4 py-3"
                          >
                            <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                              {formatTime(slot.startTime)}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#f5e9c6]">
                              {slot.clientName}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-white/45">
                        Ainda não há horários ocupados.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardShell>
        )
      })}
    </div>
  )
}
