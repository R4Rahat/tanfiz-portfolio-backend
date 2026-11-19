import { useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ImageOff,
  Images,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react'

import api from '../lib/api'
import { cn, getErrorMessage, optimizedImage } from '../lib/utils'
import { toast } from '../store/toastStore'
import Button from './ui/Button'
import EmptyState from './ui/EmptyState'
import { ConfirmDialog } from './ui/Modal'

const MAX_MEDIA = 20

export default function MediaManager({ project, onChange, disabled = false }) {
  const media = project?.media || []
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const [reordering, setReordering] = useState(false)
  const [altSavingId, setAltSavingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef(null)

  const atLimit = media.length >= MAX_MEDIA

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length || !project) return

    if (media.length + files.length > MAX_MEDIA) {
      toast.error(
        `You can add ${Math.max(MAX_MEDIA - media.length, 0)} more file(s) to this project.`,
      )
      return
    }

    const form = new FormData()
    files.forEach((file) => form.append('files', file))

    setUploading(true)
    setProgress(0)

    try {
      const { data } = await api.post(`/projects/${project._id}/media`, form, {
        onUploadProgress: (event) => {
          const total = event.total || event.loaded
          setProgress(Math.round((event.loaded * 100) / total))
        },
      })
      onChange(data.data)
      toast.success(`${files.length} media file(s) uploaded`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not upload media'))
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const persistOrder = async (next) => {
    const previous = project.media || []
    onChange({ ...project, media: next })
    setReordering(true)

    try {
      const { data } = await api.patch(`/projects/${project._id}/media/reorder`, {
        ids: next.map((item) => item._id),
      })
      onChange(data.data)
    } catch (error) {
      onChange({ ...project, media: previous })
      toast.error(getErrorMessage(error, 'Could not save the new order'))
    } finally {
      setReordering(false)
    }
  }

  const move = (from, to) => {
    if (from === to || to < 0 || to >= media.length) return
    const next = [...media]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    persistOrder(next)
  }

  const saveAlt = async (item, value) => {
    const alt = value.trim()
    if (alt === (item.alt || '')) return

    setAltSavingId(item._id)
    try {
      const { data } = await api.patch(
        `/projects/${project._id}/media/${item._id}`,
        { alt },
      )
      onChange(data.data)
      toast.success('Alt text saved')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not save alt text'))
    } finally {
      setAltSavingId(null)
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return

    setDeleting(true)
    try {
      const { data } = await api.delete(
        `/projects/${project._id}/media/${pendingDelete._id}`,
      )
      onChange(data.data)
      toast.success('Media deleted')
      setPendingDelete(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not delete media'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            Gallery
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {media.length}/{MAX_MEDIA}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Drag cards to reorder. Images and GIFs are shown in this order.
          </p>
        </div>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => uploadFiles(event.target.files)}
          />
          <Button
            size="sm"
            icon={Plus}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || atLimit}
          >
            Add media
          </Button>
        </div>
      </div>

      <div className="p-5">
        {uploading ? (
          <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-800">
              <Loader2 className="size-4 animate-spin" />
              Uploading media… {progress}%
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100">
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {!media.length ? (
          <EmptyState
            icon={Images}
            title="No media yet"
            description="Upload images or GIFs that showcase this project. You can add up to 20 items."
            action={
              <Button
                variant="secondary"
                size="sm"
                icon={UploadCloud}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
              >
                Upload files
              </Button>
            }
            className="border-slate-200 bg-slate-50/50 py-12"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {media.map((item, index) => (
              <div
                key={item._id}
                draggable={!disabled && !reordering}
                onDragStart={(event) => {
                  setDragIndex(index)
                  event.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  setOverIndex(index)
                }}
                onDragLeave={() =>
                  setOverIndex((current) => (current === index ? null : current))
                }
                onDrop={(event) => {
                  event.preventDefault()
                  if (dragIndex !== null) move(dragIndex, index)
                  setDragIndex(null)
                  setOverIndex(null)
                }}
                onDragEnd={() => {
                  setDragIndex(null)
                  setOverIndex(null)
                }}
                className={cn(
                  'group overflow-hidden rounded-xl border bg-white shadow-sm transition',
                  dragIndex === index ? 'opacity-50' : 'opacity-100',
                  overIndex === index && dragIndex !== index
                    ? 'border-brand-400 ring-4 ring-brand-100'
                    : 'border-slate-200',
                  !disabled && !reordering && 'cursor-grab active:cursor-grabbing',
                )}
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  {item.type === 'gif' ? (
                    <img
                      src={item.url}
                      alt={item.alt || `Media ${index + 1}`}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={optimizedImage(item.url, 600)}
                      alt={item.alt || `Media ${index + 1}`}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  )}

                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-slate-950/65 px-1.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <GripVertical className="size-3" />
                    {index + 1}
                  </span>

                  {item.type === 'gif' ? (
                    <span className="absolute right-2 top-2 rounded-md bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      GIF
                    </span>
                  ) : null}

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-slate-950/70 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0 || reordering || disabled}
                        className="grid size-7 place-items-center rounded-md bg-white/90 text-slate-700 transition hover:bg-white disabled:opacity-40"
                        aria-label="Move media left"
                      >
                        <ArrowLeft className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, index + 1)}
                        disabled={
                          index === media.length - 1 || reordering || disabled
                        }
                        className="grid size-7 place-items-center rounded-md bg-white/90 text-slate-700 transition hover:bg-white disabled:opacity-40"
                        aria-label="Move media right"
                      >
                        <ArrowRight className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(item)}
                      disabled={disabled}
                      className="grid size-7 place-items-center rounded-md bg-rose-600 text-white transition hover:bg-rose-700 disabled:opacity-40"
                      aria-label="Delete media"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 p-3">
                  <label
                    htmlFor={`alt-${item._id}`}
                    className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Alt text
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`alt-${item._id}`}
                      key={`${item._id}-${item.alt}`}
                      defaultValue={item.alt}
                      placeholder="Describe this image…"
                      disabled={disabled}
                      onBlur={(event) => saveAlt(item, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur()
                      }}
                      className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                    {altSavingId === item._id ? (
                      <Loader2 className="size-3.5 shrink-0 animate-spin text-brand-600" />
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {atLimit ? (
          <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <ImageOff className="size-3.5" />
            This project has reached the {MAX_MEDIA} media item limit.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this media item?"
        description="The file will be permanently removed from ImageKit and from this project's gallery."
        confirmLabel="Delete media"
      />
    </div>
  )
}
