import { Reply } from '../types'

interface Props {
  replies: Reply[]
  isLoading: boolean
}

export default function ReplyList({ replies, isLoading }: Props) {
  if (replies.length === 0) return null

  return (
    <div>
      {replies.map((reply, index) => (
        <ReplyItem key={reply.id} reply={reply} index={index} />
      ))}
      {isLoading && (
        <div className="p-4 text-center text-gray-600 text-sm animate-pulse">
          まだ来てる…
        </div>
      )}
    </div>
  )
}

function ReplyItem({ reply, index }: { reply: Reply; index: number }) {
  return (
    <div
      className="border-b border-gray-800 p-4 animate-fadeIn"
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl select-none">
          {reply.character.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-sm">{reply.character.name}</span>
            <span className="text-gray-500 text-sm">{reply.character.handle}</span>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            返信先: <span className="text-sky-700">@you</span>
          </div>
          <p className="text-white text-base whitespace-pre-wrap break-words leading-relaxed">
            {reply.text}
          </p>
        </div>
      </div>
    </div>
  )
}
