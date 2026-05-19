import { X } from 'lucide-react'

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Voltar',
  onConfirm,
  onClose,
  loading = false,
  children,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md">
      <div className="surface-card gold-ring relative w-full max-w-lg rounded-[30px] p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/65 transition hover:text-white"
          aria-label="Fechar modal"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="section-kicker">Confirmação</p>
        <h3 className="mt-3 font-display text-4xl text-[#f8efcf]">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/60">{description}</p>
        <div className="mt-6">{children}</div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="premium-button premium-button-secondary w-full"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="premium-button premium-button-primary w-full"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Confirmando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
