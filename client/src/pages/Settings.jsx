import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Cookie,
  LogOut,
  Mail,
  Server,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { initials } from '../lib/utils'
import { useAuthStore } from '../store/authStore'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm text-slate-700">{value}</p>
      </div>
    </div>
  )
}

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your admin profile and session details."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-7">
              <div className="absolute inset-0 bg-grid opacity-50" />
              <div className="absolute -right-16 -top-20 size-56 rounded-full bg-brand-600/25 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-xl font-bold text-white shadow-xl shadow-brand-950/40">
                  {initials(user?.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-white">
                    {user?.name || 'Admin'}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-slate-400">
                    {user?.email}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                    <BadgeCheck className="size-3" />
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 px-6">
              <InfoRow icon={UserRound} label="Display name" value={user?.name || '—'} />
              <InfoRow icon={Mail} label="Email address" value={user?.email || '—'} />
              <InfoRow
                icon={ShieldCheck}
                label="Account status"
                value={user?.isActive === false ? 'Disabled' : 'Active'}
              />
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Cookie className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Session & security
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  You are signed in with a server-issued, HTTP-only cookie. The
                  token is never stored in browser storage, so it cannot be read by
                  JavaScript. Sessions expire automatically after 7 days.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Signed in
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                <ShieldCheck className="size-3.5" />
                Protected routes
              </span>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900">System</h3>
            <div className="mt-3 divide-y divide-slate-100">
              <InfoRow icon={Server} label="API base" value="/api" />
              <InfoRow icon={ShieldCheck} label="Auth" value="HTTP-only cookie" />
              <InfoRow
                icon={Cookie}
                label="Session length"
                value="7 days"
              />
            </div>
          </section>

          <section className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900">Sign out</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              End this session on the current device. You will need your email and
              password to sign back in.
            </p>
            <Button
              variant="danger-outline"
              icon={LogOut}
              className="mt-4 w-full"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </section>
        </aside>
      </div>
    </div>
  )
}
