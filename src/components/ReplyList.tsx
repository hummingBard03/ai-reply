import { Character, ConvoMessage, Reply } from '../types'
import ReplyItem from './ReplyItem'

interface Props {
  replies: Reply[]
  isLoading: boolean
  onLike: (id: string) => void
  onBlock: (id: string) => void
  onChain: (id: string, text: string) => void
  onConvoSubmit: (id: string, userText: string, character: Character, currentConvo: ConvoMessage[]) => void
}

export default function ReplyList({ replies, isLoading, onLike, onBlock, onChain, onConvoSubmit }: Props) {
  if (replies.length === 0) return null

  return (
    <div>
      {replies.map((reply, index) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          index={index}
          onLike={onLike}
          onBlock={onBlock}
          onChain={onChain}
          onConvoSubmit={onConvoSubmit}
        />
      ))}
      {isLoading && (
        <div className="p-4 text-center text-gray-600 text-sm animate-pulse">
          まだ来てる…
        </div>
      )}
    </div>
  )
}
