import { CalendarClock } from 'lucide-react'

export function BrandMark({ compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'justify-start'}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-300">
        <CalendarClock className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-3xl leading-none tracking-[0.22em] text-[#f6ecd0]">
          Barber Date
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.35em] text-white/45">
          Agendamento Instantâneo
        </p>
      </div>
    </div>
  )
}
