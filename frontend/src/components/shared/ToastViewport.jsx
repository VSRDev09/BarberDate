import { AlertCircle, BadgeCheck, Info, X } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext.jsx'

const toastMap = {
  success: {
    icon: BadgeCheck,
    className: 'border-emerald-300/30 bg-emerald-500/12 text-emerald-100',
  },
  error: {
    icon: AlertCircle,
    className: 'border-rose-300/30 bg-rose-500/12 text-rose-100',
  },
  info: {
    icon: Info,
    className: 'border-amber-300/25 bg-black/70 text-[#f3ebd6]',
  },
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const config = toastMap[toast.type] ?? toastMap.info
        const Icon = config.icon

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rise-in rounded-3xl border px-4 py-4 shadow-2xl backdrop-blur-xl ${config.className}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-white/8 p-2">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6 text-white/75">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full p-1 text-white/50 transition hover:text-white"
                aria-label="Fechar aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
