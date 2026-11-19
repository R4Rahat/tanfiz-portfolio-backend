import { Loader2 } from 'lucide-react'

import { cn } from '../../lib/utils'

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand-600', className)} />
}

export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-950">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-2xl bg-brand-500/30" />
        <div className="relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-brand-900/50">
          T
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <Loader2 className="size-4 animate-spin" />
        {label}
      </div>
    </div>
  )
}

export function SectionLoader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-sm text-slate-500">
      <Spinner className="size-4" />
      {label}
    </div>
  )
}
