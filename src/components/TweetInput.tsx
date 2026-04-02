import { useState } from 'react'

interface Props {
  onPost: (text: string) => void
  isLoading: boolean
}

const MAX_CHARS = 140

export default function TweetInput({ onPost, isLoading }: Props) {
  const [text, setText] = useState('')

  const remaining = MAX_CHARS - text.length
  const isOverLimit = remaining < 0
  const isEmpty = text.trim().length === 0

  function handleSubmit() {
    if (!isEmpty && !isOverLimit && !isLoading) {
      onPost(text.trim())
      setText('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
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
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800">
            <div className="flex items-center gap-1">
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
