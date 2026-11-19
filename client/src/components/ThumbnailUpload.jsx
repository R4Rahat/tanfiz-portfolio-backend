import { useRef, useState } from 'react'
import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from 'lucide-react'

import api from '../lib/api'
import { getErrorMessage, optimizedImage } from '../lib/utils'
import { toast } from '../store/toastStore'
import Button from './ui/Button'
import { ConfirmDialog } from './ui/Modal'

export default function ThumbnailUpload({ project, onChange, disabled = false }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [removing, setRemoving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [dragging, setDragging] = useState(false)

  const thumbnail = project?.thumbnailImage

  const uploadFile = async (file) => {
    if (!file || !project) return

    const form = new FormData()
    form.append('thumbnail', file)

    setUploading(true)
    setProgress(0)

    try {
      const { data } = await api.put(`/projects/${project._id}/thumbnail`, form, {
        onUploadProgress: (event) => {
          const total = event.total || event.loaded
          setProgress(Math.round((event.loaded * 100) / total))
        },
      })
      onChange(data.data)
      toast.success('Cover image updated')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not upload the cover image'))
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const { data } = await api.delete(`/projects/${project._id}/thumbnail`)
      onChange(data.data)
      setConfirmOpen(false)
      toast.success('Cover image removed')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not remove the cover image'))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Cover image</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            The main image shown for this project. JPG, PNG or WebP, up to 10MB.
          </p>
        </div>
        {thumbnail ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
            >
              Replace
            </Button>
            <Button
              variant="danger-outline"
              size="sm"
              icon={Trash2}
              onClick={() => setConfirmOpen(true)}
              disabled={disabled || uploading}
            >
              Remove
            </Button>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => uploadFile(event.target.files?.[0])}
        />

        {thumbnail ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-900">
            <img
              src={optimizedImage(thumbnail.url, 1200)}
              alt={`${project.title} cover`}
              className="size-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-4 text-xs font-medium text-white/90">
              Cover preview · 16:9 recommended
            </p>
            {uploading ? (
              <div className="absolute inset-0 grid place-items-center bg-slate-950/55 backdrop-blur-sm">
                <div className="w-52 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-white" />
                  <p className="mt-2 text-xs font-medium text-white">
                    Uploading… {progress}%
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              uploadFile(event.dataTransfer.files?.[0])
            }}
            className={`grid w-full place-items-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition ${
              dragging
                ? 'border-brand-400 bg-brand-50'
                : 'border-slate-200 bg-slate-50/60 hover:border-brand-300 hover:bg-brand-50/40'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {uploading ? (
              <div>
                <Loader2 className="mx-auto size-6 animate-spin text-brand-600" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  Uploading… {progress}%
                </p>
              </div>
            ) : (
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-brand-600 shadow-sm">
                  <UploadCloud className="size-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG or WebP — up to 10MB
                </p>
              </div>
            )}
          </button>
        )}

        {!thumbnail ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <ImagePlus className="size-3.5" />
            A cover makes the project stand out on the portfolio grid.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRemove}
        loading={removing}
        title="Remove cover image?"
        description="The cover will be deleted from ImageKit and this project will show a fallback placeholder until you upload a new one."
        confirmLabel="Remove cover"
      />
    </div>
  )
}
