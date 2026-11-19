import { cn } from '../../lib/utils'

const controlClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'

export function Input({ className, ...props }) {
  return <input className={cn(controlClasses, className)} {...props} />
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(controlClasses, 'min-h-28 resize-y leading-relaxed', className)}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(controlClasses, 'pr-9', className)} {...props}>
      {children}
    </select>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-medium text-slate-700"
        >
          {label}
          {required ? <span className="text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}
