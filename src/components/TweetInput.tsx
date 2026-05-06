import { useRef, useState } from 'react'
import { compressImage } from '../imageUtils'
import { ImageAttachment } from '../types'

interface Props {
  onPost: (text: string, image?: ImageAttachment) => void
  isLoading: boolean
}

const MAX_CHARS = 140
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const

export default function TweetInput({ onPost, isLoading }: Props) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<ImageAttachment | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const remaining = MAX_CHARS - text.length
  const isOverLimit = remaining < 0
  const isEmpty = text.trim().length === 0 && !image

  function handleSubmit() {
    if (!isEmpty && !isOverLimit && !isLoading) {
      onPost(text.trim(), image ?? undefined)
      setText('')
      setImage(null)
      setPreviewUrl(null)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type as typeof ACCEPTED_TYPES[number])) return

    compressImage(file).then(({ attachment, previewUrl }) => {
      setImage(attachment)
      setPreviewUrl(previewUrl)
    })
    e.target.value = ''
  }

  function removeImage() {
    setImage(null)
    setPreviewUrl(null)
  }

  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg select-none">
          あ
        </div>
        <div className="flex-1">
          <textarea
            className="w-full bg-transparent text-white placeholder-gray-500 text-xl resize-none outline-none min-h-[120px]"
            placeholder="いま何してる？"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            maxLength={MAX_CHARS + 50}
          />

          {previewUrl && (
            <div className="relative mt-2 inline-block">
              <img
                src={previewUrl}
                alt="添付画像"
                className="max-h-60 max-w-full rounded-xl object-cover border border-gray-700"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="画像を添付"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4a3 3 0 014.24 0L16 16m-2-2l1.59-1.59A3 3 0 0119 12m-7 4v4m0 0H8m4 0h4M3 8h18M3 4h18" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <span
                className={`text-sm font-medium ${
                  isOverLimit
                    ? 'text-red-500'
                    : remaining <= 20
                      ? 'text-yellow-400'
                      : 'text-gray-500'
                }`}
              >
                {remaining}
              </span>
              {isOverLimit && (
                <span className="text-red-500 text-xs">文字オーバー</span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isEmpty || isOverLimit || isLoading}
              className="px-5 py-2 rounded-full bg-sky-500 text-white font-bold text-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-sky-400 active:bg-sky-600
                transition-colors duration-150"
            >
              {isLoading ? '生成中…' : 'ポスト'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
