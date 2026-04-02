interface Props {
  text: string
  onRegenerate: () => void
  isLoading: boolean
}

export default function TweetCard({ text, onRegenerate, isLoading }: Props) {
  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg select-none">
          あ
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-sm">あなた</span>
            <span className="text-gray-500 text-sm">@you</span>
          </div>
          <p className="text-white text-base whitespace-pre-wrap break-words">{text}</p>
          <div className="mt-3">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="text-sm text-sky-400 hover:text-sky-300 border border-sky-800 hover:border-sky-600
                px-4 py-1.5 rounded-full transition-colors duration-150
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '生成中…' : '🔄 もう一回クソリプをもらう'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
