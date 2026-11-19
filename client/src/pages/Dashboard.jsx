import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  Film,
  FolderKanban,
  Image as ImageIcon,
  Images,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

import api from '../lib/api'
import {
  formatDate,
  getErrorMessage,
  greeting,
  optimizedImage,
} from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'

const statStyles = {
  brand: 'bg-brand-50 text-brand-600',
  violet: 'bg-violet-50 text-violet-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

function StatCard({ label, value, hint, icon: Icon, tone }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span className={`grid size-10 place-items-center rounded-xl ${statStyles[tone]}`}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card p-5">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-8 w-14 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-3 w-28 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="card p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.get('/projects')
      setProjects(data.data || [])
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load your projects'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    api
      .get('/projects')
      .then(({ data }) => {
        if (!active) return
        setProjects(data.data || [])
        setError(null)
      })
      .catch((loadError) => {
        if (active) {
          setError(getErrorMessage(loadError, 'Could not load your projects'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const mediaCount = projects.reduce(
      (total, project) => total + (project.media?.length || 0),
      0,
    )
    const withVideo = projects.filter((project) => project.videoId).length
    const withCover = projects.filter(
      (project) => project.thumbnailImage?.url,
    ).length

    return [
      {
        label: 'Projects',
        value: projects.length,
        hint: 'Published in your portfolio',
        icon: FolderKanban,
        tone: 'brand',
      },
      {
        label: 'Media items',
        value: mediaCount,
        hint: 'Images and GIFs across projects',
        icon: Images,
        tone: 'violet',
      },
      {
        label: 'Videos',
        value: withVideo,
        hint: 'Projects with a YouTube video',
        icon: Film,
        tone: 'emerald',
      },
      {
        label: 'Cover images',
        value: withCover,
        hint: 'Projects with a custom cover',
        icon: ImageIcon,
        tone: 'amber',
      },
    ]
  }, [projects])

  const recent = projects.slice(0, 4)
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A snapshot of everything in your portfolio."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={loadProjects}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => navigate('/projects/new')}>
              New project
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-8">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-brand-600/25 blur-3xl" />
          <div className="absolute -bottom-28 right-32 size-64 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-200">
                <Sparkles className="size-3.5" />
                Portfolio control room
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {greeting()}, {firstName}.
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {projects.length
                  ? `You have ${projects.length} project${projects.length === 1 ? '' : 's'} live and ${stats[1].value} media item${stats[1].value === 1 ? '' : 's'} in your library.`
                  : 'Your portfolio is ready for its first project. Add one to get started.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                className=" text-black hover:bg-slate-900 shadow-none"
                icon={Plus}
                onClick={() => navigate('/projects/new')}
              >
                Add a project
              </Button>
              <Button
                variant="ghost"
                className="border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate('/projects')}
              >
                Manage projects
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent projects
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Ordered the same way visitors see them.
                </p>
              </div>
              {projects.length > 0 ? (
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  View all
                  <ArrowRight className="size-3.5" />
                </button>
              ) : null}
            </div>

            {recent.length ? (
              <ul className="divide-y divide-slate-100">
                {recent.map((project) => (
                  <li key={project._id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-slate-50"
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {project.thumbnailImage?.url ? (
                          <img
                            src={optimizedImage(project.thumbnailImage.url, 320)}
                            alt={project.title}
                            className="size-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid size-full place-items-center text-slate-300">
                            <ImageIcon className="size-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {project.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          {project.projectType ? (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                              {project.projectType}
                            </span>
                          ) : null}
                          {project.year ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="size-3" />
                              {project.year}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1">
                            <Images className="size-3" />
                            {project.media?.length || 0} media
                          </span>
                          <span className="hidden text-slate-400 sm:inline">
                            /{project.slug}
                          </span>
                        </div>
                      </div>

                      <span className="hidden text-xs text-slate-400 sm:block">
                        {formatDate(project.updatedAt)}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={FolderKanban}
                  title="No projects yet"
                  description="Create your first project and it will appear here and on your public portfolio."
                  action={
                    <Button icon={Plus} onClick={() => navigate('/projects/new')}>
                      Create project
                    </Button>
                  }
                />
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
