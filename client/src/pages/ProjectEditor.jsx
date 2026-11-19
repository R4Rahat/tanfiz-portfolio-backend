import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  FileText,
  Film,
  Hash,
  Image as ImageIcon,
  Images,
  Save,
  Sparkles,
} from 'lucide-react'

import MediaManager from '../components/MediaManager.jsx'
import ThumbnailUpload from '../components/ThumbnailUpload.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { Field, Input, Textarea } from '../components/ui/Field.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import { SectionLoader } from '../components/ui/Spinner.jsx'
import api from '../lib/api.js'
import {
  formatDate,
  getErrorMessage,
  optimizedImage,
  parseRoles,
} from '../lib/utils.js'
import { toast } from '../store/toastStore.js'

const emptyForm = {
  title: '',
  projectType: '',
  year: '',
  role: '',
  about: '',
  videoUrl: '',
  endingStatement: '',
}

function toForm(project) {
  return {
    title: project?.title || '',
    projectType: project?.projectType || '',
    year: project?.year != null ? String(project.year) : '',
    role: (project?.role || []).join(', '),
    about: project?.about || '',
    videoUrl: project?.videoId
      ? `https://www.youtube.com/watch?v=${project.videoId}`
      : '',
    endingStatement: project?.endingStatement || '',
  }
}

function youtubeId(value = '') {
  const patterns = [
    /youtu\.be\/([\w-]{6,})/,
    /[?&]v=([\w-]{6,})/,
    /embed\/([\w-]{6,})/,
    /shorts\/([\w-]{6,})/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match) return match[1]
  }

  return null
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function SummaryRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-right text-xs font-medium text-slate-700">
        {children}
      </span>
    </div>
  )
}

export default function ProjectEditor() {
  const { id } = useParams()

  // Remount on id change so every project starts with clean local state.
  return <ProjectEditorContent key={id || 'new'} id={id} />
}

function ProjectEditorContent({ id }) {
  const isNew = !id
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [tab, setTab] = useState('details')

  useEffect(() => {
    if (isNew) return undefined

    let active = true

    api
      .get('/projects')
      .then(({ data }) => {
        if (!active) return
        const found = (data.data || []).find((item) => item._id === id)
        if (!found) {
          setNotFound(true)
          setProject(null)
          return
        }
        setProject(found)
        setForm(toForm(found))
      })
      .catch((error) => {
        if (!active) return
        setLoadError(getErrorMessage(error, 'Could not load this project'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, isNew])

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const handleSave = async () => {
    const nextErrors = {}
    const yearValue = form.year === '' ? null : Number(form.year)

    if (!form.title.trim()) nextErrors.title = 'Title is required'
    if (
      form.year !== '' &&
      (!Number.isFinite(yearValue) || yearValue < 1900 || yearValue > 2100)
    ) {
      nextErrors.year = 'Enter a year between 1900 and 2100'
    }
    if (form.videoUrl.trim() && !youtubeId(form.videoUrl)) {
      nextErrors.videoUrl = 'Enter a valid YouTube link'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setTab('details')
      return
    }

    const payload = {
      title: form.title.trim(),
      projectType: form.projectType.trim(),
      year: yearValue,
      role: parseRoles(form.role),
      about: form.about.trim(),
      videoUrl: form.videoUrl.trim() || null,
      endingStatement: form.endingStatement.trim(),
    }

    setSaving(true)
    try {
      if (isNew) {
        const { data } = await api.post('/projects', payload)
        const created = data.data
        toast.success('Project created. You can add media now.')
        navigate(`/projects/${created._id}`, { replace: true })
      } else {
        const { data } = await api.patch(`/projects/${project._id}`, payload)
        setProject(data.data)
        setForm(toForm(data.data))
        toast.success('Changes saved')
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save the project'))
    } finally {
      setSaving(false)
    }
  }

  const isDirty = isNew
    ? Object.values(form).some((value) => String(value).trim())
    : project
      ? JSON.stringify(form) !== JSON.stringify(toForm(project))
      : false

  if (loading) {
    return (
      <div className="animate-fade-in">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </button>
        <SectionLoader label="Loading project…" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="animate-fade-in">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </button>
        <EmptyState
          icon={AlertTriangle}
          title="Could not load this project"
          description={loadError}
          action={
            <Button onClick={() => window.location.reload()}>Try again</Button>
          }
        />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="animate-fade-in">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </button>
        <EmptyState
          icon={Hash}
          title="Project not found"
          description="It may have been deleted, or the link is incorrect."
          action={
            <Button onClick={() => navigate('/projects')}>
              Back to projects
            </Button>
          }
        />
      </div>
    )
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    {
      id: 'media',
      label: 'Media',
      icon: Images,
      count: project?.media?.length || 0,
      disabled: isNew || !project,
      disabledHint: 'Create the project first to add media',
    },
    {
      id: 'cover',
      label: 'Cover',
      icon: ImageIcon,
      disabled: isNew || !project,
      disabledHint: 'Create the project first to add a cover',
    },
  ]

  const previewVideoId = youtubeId(form.videoUrl)
  const roles = parseRoles(form.role)

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </button>

      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
              {isNew ? 'New project' : form.title || 'Untitled project'}
            </h1>
            {project ? (
              <span className="max-w-[16rem] truncate rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-500">
                /{project.slug}
              </span>
            ) : null}
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {isNew
              ? 'Add the essentials first — media and cover uploads unlock after saving.'
              : 'Update the story, media and cover for this project.'}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/projects')}>
            Cancel
          </Button>
          <Button icon={Save} loading={saving} onClick={handleSave}>
            {isNew ? 'Create project' : 'Save changes'}
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {tab === 'details' ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="card p-5 sm:p-6">
              <SectionTitle
                icon={FileText}
                title="Basic information"
                description="The core details shown on your portfolio."
              />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Title"
                  htmlFor="title"
                  required
                  error={errors.title}
                  className="sm:col-span-2"
                  hint="Changing the title does not change the existing URL slug."
                >
                  <Input
                    id="title"
                    value={form.title}
                    onChange={setField('title')}
                    placeholder="e.g. Tanfiz — Brand identity"
                  />
                </Field>

                <Field
                  label="Project type"
                  htmlFor="projectType"
                  hint="e.g. Brand identity, Web design, Illustration"
                >
                  <Input
                    id="projectType"
                    value={form.projectType}
                    onChange={setField('projectType')}
                    placeholder="Brand identity"
                  />
                </Field>

                <Field label="Year" htmlFor="year" error={errors.year}>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.year}
                    onChange={setField('year')}
                    placeholder="2026"
                  />
                </Field>

                <Field
                  label="About"
                  htmlFor="about"
                  className="sm:col-span-2"
                  hint="A short introduction to the project and your approach."
                >
                  <Textarea
                    id="about"
                    rows={5}
                    value={form.about}
                    onChange={setField('about')}
                    placeholder="Tell the story behind this project…"
                  />
                </Field>

                <Field
                  label="Ending statement"
                  htmlFor="endingStatement"
                  className="sm:col-span-2"
                  hint="A closing line shown at the end of the project page."
                >
                  <Textarea
                    id="endingStatement"
                    rows={2}
                    value={form.endingStatement}
                    onChange={setField('endingStatement')}
                    placeholder="A final thought, quote or takeaway…"
                  />
                </Field>
              </div>
            </section>

            <section className="card p-5 sm:p-6">
              <SectionTitle
                icon={Film}
                title="Video & roles"
                description="Add a YouTube walkthrough and list what you did."
              />

              <div className="mt-6 space-y-5">
                <Field
                  label="YouTube link"
                  htmlFor="videoUrl"
                  error={errors.videoUrl}
                  hint="Paste any YouTube URL. Leave empty to remove the video."
                >
                  <Input
                    id="videoUrl"
                    type="url"
                    value={form.videoUrl}
                    onChange={setField('videoUrl')}
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                </Field>

                {previewVideoId ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${previewVideoId}`}
                        title="Video preview"
                        className="size-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null}

                <Field
                  label="Roles"
                  htmlFor="role"
                  hint="Separate multiple roles with commas. These appear as tags on the project."
                >
                  <Input
                    id="role"
                    value={form.role}
                    onChange={setField('role')}
                    placeholder="Art direction, UI design, Development"
                  />
                </Field>

                {roles.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {isNew ? (
              <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      One quick step
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-brand-800/75">
                      Save the project first. Then the Media and Cover tabs unlock
                      so you can upload your gallery and cover image.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900">
                Project summary
              </h3>
              <div className="mt-3 divide-y divide-slate-100">
                <SummaryRow label="Slug">
                  <span className="block max-w-[11rem] truncate font-mono text-[11px]">
                    /{project?.slug || '—'}
                  </span>
                </SummaryRow>
                <SummaryRow label="Position">
                  {typeof project?.position === 'number'
                    ? project.position + 1
                    : '—'}
                </SummaryRow>
                <SummaryRow label="Media items">
                  {project?.media?.length || 0}
                </SummaryRow>
                <SummaryRow label="Video">
                  {project?.videoId ? (
                    <span className="text-emerald-600">Connected</span>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </SummaryRow>
                <SummaryRow label="Created">
                  {project ? formatDate(project.createdAt) : '—'}
                </SummaryRow>
                <SummaryRow label="Updated">
                  {project ? formatDate(project.updatedAt) : '—'}
                </SummaryRow>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Cover image
                </h3>
                {project ? (
                  <button
                    type="button"
                    onClick={() => setTab('cover')}
                    className="text-[11px] font-semibold text-brand-600 transition hover:text-brand-700"
                  >
                    Manage
                  </button>
                ) : null}
              </div>

              <div className="p-4">
                {project?.thumbnailImage?.url ? (
                  <img
                    src={optimizedImage(project.thumbnailImage.url, 480)}
                    alt={`${project.title} cover`}
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="grid aspect-video w-full place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                    <ImageIcon className="size-6" />
                  </div>
                )}
                <p className="mt-2 text-[11px] text-slate-400">
                  {project?.thumbnailImage?.url
                    ? 'Shown on the project grid.'
                    : isNew
                      ? 'Save the project to add a cover.'
                      : 'No cover yet. Projects without one use a placeholder.'}
                </p>
              </div>
            </div>

            {!isNew ? (
              <Link
                to="/projects"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Calendar className="size-3.5" />
                Back to all projects
              </Link>
            ) : null}
          </aside>
        </div>
      ) : null}

      {tab === 'media' && project ? (
        <div className="space-y-6">
          <MediaManager project={project} onChange={setProject} />
        </div>
      ) : null}

      {tab === 'cover' && project ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ThumbnailUpload project={project} onChange={setProject} />

          <div className="card h-fit p-5">
            <h3 className="text-sm font-semibold text-slate-900">
              Cover guidelines
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-500">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-400" />
                Use a 16:9 image so it fills the project grid cleanly.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-400" />
                JPG, PNG and WebP are supported, up to 10MB.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-400" />
                Uploading a new cover automatically removes the previous file
                from ImageKit.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-400" />
                Keep important subjects away from the edges for better cropping.
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
