import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Film,
  FolderKanban,
  Image as ImageIcon,
  Images,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import api from '../lib/api'
import { getErrorMessage, optimizedImage } from '../lib/utils'
import { toast } from '../store/toastStore'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [reordering, setReordering] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
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

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return projects

    return projects.filter((project) => {
      const haystack = [
        project.title,
        project.slug,
        project.projectType,
        project.year,
        ...(project.role || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(search)
    })
  }, [projects, query])

  const move = async (id, direction) => {
    if (reordering) return

    const index = projects.findIndex((project) => project._id === id)
    const target = index + direction
    if (index === -1 || target < 0 || target >= projects.length) return

    const previous = projects
    const next = [...projects]
    ;[next[index], next[target]] = [next[target], next[index]]

    setProjects(next)
    setReordering(true)

    try {
      const { data } = await api.patch('/projects/reorder', {
        ids: next.map((project) => project._id),
      })
      setProjects(data.data || next)
    } catch (reorderError) {
      setProjects(previous)
      toast.error(getErrorMessage(reorderError, 'Could not save the new order'))
    } finally {
      setReordering(false)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return

    setDeleting(true)
    try {
      await api.delete(`/projects/${pendingDelete._id}`)
      setProjects((current) =>
        current.filter((project) => project._id !== pendingDelete._id),
      )
      toast.success(`"${pendingDelete.title}" deleted`)
      setPendingDelete(null)
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'Could not delete the project'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="Create, reorder and manage every case study in your portfolio."
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

      <div className="card mb-5 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, type or role…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <p className="flex items-center gap-2 px-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <ArrowUp className="size-3.5" />
            <ArrowDown className="size-3.5" />
            Reorder
          </span>
          <span className="text-slate-300">·</span>
          {filtered.length} of {projects.length} shown
        </p>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="card divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4">
              <div className="h-14 w-20 animate-pulse rounded-lg bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="card overflow-hidden">
          <div className="hidden items-center gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:flex">
            <span className="w-5 text-center">#</span>
            <span className="flex-1">Project</span>
            <span className="w-36">Type</span>
            <span className="w-16">Year</span>
            <span className="w-24">Media</span>
            <span className="w-[7.5rem] text-right">Actions</span>
          </div>

          <ul className="divide-y divide-slate-100">
            {filtered.map((project, index) => (
              <li key={project._id} className="group transition hover:bg-slate-50/70">
                <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="hidden w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-slate-400 sm:block">
                      {index + 1}
                    </span>

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
                      <Link
                        to={`/projects/${project._id}`}
                        className="block truncate text-sm font-semibold text-slate-900 transition hover:text-brand-600"
                      >
                        {project.title}
                      </Link>
                      <p className="truncate text-xs text-slate-400">
                        /{project.slug}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:hidden">
                        {project.projectType ? (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                            {project.projectType}
                          </span>
                        ) : null}
                        {project.year ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <Calendar className="size-3" />
                            {project.year}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Images className="size-3" />
                          {project.media?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden w-36 shrink-0 sm:block">
                    {project.projectType ? (
                      <span className="inline-flex max-w-full truncate rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                        {project.projectType}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </div>

                  <div className="hidden w-16 shrink-0 text-sm text-slate-600 sm:block">
                    {project.year || '—'}
                  </div>

                  <div className="hidden w-24 shrink-0 items-center gap-2 sm:flex">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Images className="size-3.5" />
                      {project.media?.length || 0}
                    </span>
                    {project.videoId ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
                        <Film className="size-3" />
                        Video
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-1 sm:w-[7.5rem] sm:justify-end">
                    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => move(project._id, -1)}
                        disabled={reordering || projects[0]?._id === project._id}
                        className="grid size-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Move ${project.title} up`}
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(project._id, 1)}
                        disabled={
                          reordering ||
                          projects[projects.length - 1]?._id === project._id
                        }
                        className="grid size-7 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label={`Move ${project.title} down`}
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>

                    <div className="ml-1 flex items-center gap-1">
                      <Link
                        to={`/projects/${project._id}`}
                        className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-800"
                        aria-label={`Edit ${project.title}`}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(project)}
                        className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : projects.length ? (
        <EmptyState
          icon={Search}
          title="No matching projects"
          description={`Nothing matched “${query}”. Try a different title, type or role.`}
          action={
            <Button variant="secondary" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Your portfolio is a blank canvas. Create your first project to get started."
          action={
            <Button icon={Plus} onClick={() => navigate('/projects/new')}>
              Create your first project
            </Button>
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${pendingDelete?.title || 'this project'}"?`}
        description={
          pendingDelete?.media?.length || pendingDelete?.thumbnailImage
            ? 'This will permanently delete the project, its media and cover image from ImageKit. This cannot be undone.'
            : 'This will permanently delete the project. This cannot be undone.'
        }
        confirmLabel="Delete project"
      />
    </div>
  )
}
