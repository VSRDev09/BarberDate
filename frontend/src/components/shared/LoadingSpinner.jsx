import { LoaderCircle } from 'lucide-react'

export function LoadingSpinner({ label = 'Carregando...' }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 text-center text-white/70">
      <LoaderCircle className="h-8 w-8 animate-spin text-amber-300" />
      <p className="text-sm uppercase tracking-[0.28em]">{label}</p>
    </div>
  )
}
