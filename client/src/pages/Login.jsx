import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  FolderKanban,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import { Field, Input } from '../components/ui/Field'

const features = [
  {
    icon: FolderKanban,
    title: 'Curate every project',
    text: 'Create, reorder and update case studies in seconds.',
  },
  {
    icon: Sparkles,
    title: 'Media that performs',
    text: 'Upload images and GIFs straight to ImageKit.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    text: 'Every route is protected by an HTTP-only session.',
  },
]

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const login = useAuthStore((state) => state.login)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    clearError()
  }, [clearError])

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errors = {}
    if (!form.email.trim()) errors.email = 'Email is required'
    if (!form.password) errors.password = 'Password is required'

    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setSubmitting(true)
    try {
      await login(form.email.trim(), form.password)
      const from = location.state?.from
      const target = from?.pathname
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : '/dashboard'
      navigate(target, { replace: true })
    } catch {
      // The store already exposes a readable error message.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-[52%] overflow-hidden bg-slate-950 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -left-28 -top-24 size-[28rem] rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute -bottom-32 right-0 size-[30rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative z-10 flex flex-1 flex-col p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-lg font-bold text-white shadow-xl shadow-brand-950/40">
              T
            </span>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">Tanfiz</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Portfolio Admin
              </p>
            </div>
          </div>

          <div className="my-auto max-w-lg py-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-brand-200">
              <Sparkles className="size-3.5" />
              Your work, beautifully managed
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
              The control room for your{' '}
              <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                portfolio.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
              Publish new projects, upload media, rearrange your gallery and keep
              every case study looking its best — all from one quiet, focused place.
            </p>

            <div className="mt-10 space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-brand-300">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {feature.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Tanfiz. All rights reserved.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-50/70 to-transparent lg:hidden" />

        <div className="relative w-full max-w-sm animate-slide-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-brand-600/25">
              T
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Tanfiz</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Portfolio Admin
              </p>
            </div>
          </div>

          <div className="mb-7">
            <div className="mb-4 grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-brand-600 shadow-sm">
              <Lock className="size-5" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to manage your portfolio. This area is private.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <Field
              label="Email address"
              htmlFor="email"
              error={fieldErrors.email}
              required
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="you@example.com"
                  className="pl-10"
                  value={form.email}
                  onChange={setField('email')}
                />
              </div>
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              error={fieldErrors.password}
              required
            >
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="pl-10 pr-11"
                  value={form.password}
                  onChange={setField('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
              {!submitting ? <ArrowRight className="size-4" /> : null}
            </Button>
          </form>

          <div className="mt-7 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-slate-500">
              Your session is stored in a secure, HTTP-only cookie. Sign out when
              you are done on a shared device.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 lg:hidden">
            © {new Date().getFullYear()} Tanfiz. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
