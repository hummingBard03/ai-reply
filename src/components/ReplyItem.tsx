import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Character, ConvoMessage, Reply } from '../types'

interface Props {
  reply: Reply
  index: number
  onLike: (id: string) => void
  onBlock: (id: string) => void
  onChain: (id: string, text: string) => void
  onConvoSubmit: (id: string, userText: string, character: Character, currentConvo: ConvoMessage[]) => void
  depth?: number
}

export default function ReplyItem({ reply, index, onLike, onBlock, onChain, onConvoSubmit, depth = 0 }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [convoOpen, setConvoOpen] = useState(false)
  const [input, setInput] = useState('')

  if (reply.blocked) {
    return (
      <div
        className={`border-b border-gray-800 px-4 py-3 flex items-center justify-between ${depth > 0 ? 'ml-6 border-l border-gray-700' : ''}`}
        style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
      >
        <span className="text-gray-600 text-sm">ブロックしました</span>
        <button
          onClick={() => onBlock(reply.id)}
          className="text-sky-700 hover:text-sky-500 text-xs"
        >
          元に戻す
        </button>
      </div>
    )
  }

  async function handleExport() {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: '#000000',
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `kusoripu-${reply.character.id}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error(e)
    }
  }

  function handleShareX() {
    const text = `【${reply.character.name}】からのクソリプ\n\n「${reply.text}」\n\n#クソリプほいほい`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  function handleConvoToggle() {
    setConvoOpen((v) => !v)
    if (!convoOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleConvoSubmit() {
    const text = input.trim()
    if (!text || reply.convoLoading) return
    onConvoSubmit(reply.id, text, reply.character, reply.convo)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleConvoSubmit()
    }
  }

  return (
    <div
      className={`border-b border-gray-800 animate-fadeIn ${depth > 0 ? 'ml-6 border-l border-gray-700' : ''}`}
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
    >
      {/* カード本体（画像エクスポート対象） */}
      <div ref={cardRef} className="p-4 bg-black">
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

      {/* アクションボタン */}
      <div className="px-4 pb-3 flex items-center gap-1 flex-wrap">
        <ActionButton
          onClick={() => onLike(reply.id)}
          active={reply.liked}
          activeClass="text-pink-500 bg-pink-500/10"
          hoverClass="hover:text-pink-400 hover:bg-pink-500/10"
        >
          {reply.liked ? '♥' : '♡'} いいね
        </ActionButton>

        <ActionButton
          onClick={() => onChain(reply.id, reply.text)}
          disabled={reply.chainLoading}
          hoverClass="hover:text-sky-400 hover:bg-sky-400/10"
        >
          🔥 野次馬を呼ぶ
        </ActionButton>

        <ActionButton
          onClick={handleConvoToggle}
          active={convoOpen}
          activeClass="text-emerald-400 bg-emerald-400/10"
          hoverClass="hover:text-emerald-400 hover:bg-emerald-400/10"
        >
          ✍️ 言い返す{reply.convo.length > 0 ? ` (${Math.ceil(reply.convo.length / 2)})` : ''}
        </ActionButton>

        <ActionButton
          onClick={handleShareX}
          hoverClass="hover:text-gray-300 hover:bg-gray-700"
        >
          𝕏 シェア
        </ActionButton>

        <ActionButton
          onClick={handleExport}
          hoverClass="hover:text-gray-300 hover:bg-gray-700"
        >
          📷 保存
        </ActionButton>

        <ActionButton
          onClick={() => onBlock(reply.id)}
          hoverClass="hover:text-red-400 hover:bg-red-400/10"
          className="ml-auto"
        >
          🚫 ブロック
        </ActionButton>
      </div>

      {/* 連鎖ローディング */}
      {reply.chainLoading && (
        <div className="px-4 pb-3 text-gray-600 text-sm animate-pulse">
          クソリプ連鎖中…
        </div>
      )}

      {/* 連鎖リプライ */}
      {reply.chainReplies.length > 0 && (
        <div>
          {reply.chainReplies.map((chainReply, i) => (
            <ReplyItem
              key={chainReply.id}
              reply={chainReply}
              index={i}
              onLike={onLike}
              onBlock={onBlock}
              onChain={onChain}
              onConvoSubmit={onConvoSubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* 言い返すスレッド */}
      {convoOpen && (
        <div className="border-t border-gray-800 bg-gray-950">
          {/* 会話履歴 */}
          {reply.convo.length > 0 && (
            <div className="px-4 pt-3 space-y-3">
              {reply.convo.map((msg, i) =>
                msg.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[75%] bg-sky-600 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-sm select-none">
                      {reply.character.avatar}
                    </div>
                    <div className="max-w-[75%] bg-gray-800 text-white rounded-2xl rounded-tl-sm px-3 py-2 text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>
                  </div>
                )
              )}
              {reply.convoLoading && (
                <div className="flex gap-2 items-center">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-sm select-none">
                    {reply.character.avatar}
                  </div>
                  <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 入力フォーム */}
          <div className="flex gap-2 px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${reply.character.name}に言い返す… (Cmd+Enter で送信)`}
              rows={2}
              disabled={reply.convoLoading}
              className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-3 py-2 resize-none placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
            />
            <button
              onClick={handleConvoSubmit}
              disabled={!input.trim() || reply.convoLoading}
              className="self-end px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-full transition-colors"
            >
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  active,
  activeClass = '',
  hoverClass = '',
  className = '',
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  activeClass?: string
  hoverClass?: string
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active ? activeClass : `text-gray-500 ${hoverClass}`}
        ${className}`}
    >
      {children}
    </button>
  )
}
