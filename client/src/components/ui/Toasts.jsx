import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { useToastStore } from '../../store/toastStore'

const styles = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-rose-500',
    barClass: 'bg-rose-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-brand-500',
    barClass: 'bg-brand-500',
  },
}

export default function Toasts() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (!toasts.length) return null

  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end">
      {toasts.map((toast) => {
        const style = styles[toast.type] || styles.info
        const Icon = style.icon

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 pr-3 shadow-lg shadow-slate-950/10"
          >
            <span className={cn('mt-0.5 shrink-0', style.iconClass)}>
              <Icon className="size-5" />
            </span>
            <p className="flex-1 pt-0.5 text-sm leading-snug text-slate-700">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
