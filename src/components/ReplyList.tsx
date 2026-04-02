import { Reply, Character } from '../types'

interface Props {
  replies: Reply[]
  character: Character | null
  isLoading: boolean
}

export default function ReplyList({ replies, character, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-3 text-gray-400">
          <span className="text-2xl animate-spin">⚙️</span>
          <span>クソリプ生成中…</span>
        </div>
      </div>
    )
  }

  if (replies.length === 0) return null

  return (
    <div>
      {character && (
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-xl">{character.avatar}</span>
            <span>
              今回のクソリプ担当：
              <span className="text-sky-400 font-bold ml-1">{character.name}</span>
              <span className="text-gray-500 ml-1">（{character.description}）</span>
            </span>
          </div>
        </div>
      )}
      {replies.map((reply, index) => (
        <ReplyItem key={reply.id} reply={reply} index={index} />
      ))}
    </div>
  )
}

function ReplyItem({ reply, index }: { reply: Reply; index: number }) {
  return (
    <div
      className="border-b border-gray-800 p-4 animate-fadeIn"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
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
