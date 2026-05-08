import { useState } from 'react'
import { AppState, Character, ConvoMessage, ImageAttachment, Reply } from './types'
import { pickRandomCharacters } from './characters'
import { generateCharacterReply, generateReplies } from './api'
import TweetInput from './components/TweetInput'
import TweetCard from './components/TweetCard'
import ReplyList from './components/ReplyList'

const initialState: AppState = {
  tweet: '',
  postedTweet: null,
  postedImage: null,
  replies: [],
  isLoading: false,
  error: null,
  gentleMode: false,
}

function updateReplyById(
  replies: Reply[],
  id: string,
  updater: (r: Reply) => Reply,
): Reply[] {
  return replies.map((r) => {
    if (r.id === id) return updater(r)
    if (r.chainReplies.length > 0) {
      return { ...r, chainReplies: updateReplyById(r.chainReplies, id, updater) }
    }
    return r
  })
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState)

  async function fetchReplies(tweet: string, image?: ImageAttachment, gentleMode?: boolean) {
    const selectedCharacters = pickRandomCharacters(10)
    setState((s) => ({ ...s, isLoading: true, error: null, replies: [] }))
    try {
      const replies = await generateReplies(tweet, selectedCharacters, image, gentleMode)
      setState((s) => ({ ...s, replies, isLoading: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラー'
      setState((s) => ({ ...s, isLoading: false, error: message }))
    }
  }

  async function handlePost(tweet: string, image?: ImageAttachment) {
    setState((s) => ({ ...s, postedTweet: tweet, postedImage: image ?? null }))
    await fetchReplies(tweet, image, state.gentleMode)
  }

  async function handleRegenerate() {
    if (!state.postedTweet && !state.postedImage) return
    await fetchReplies(state.postedTweet ?? '', state.postedImage ?? undefined, state.gentleMode)
  }

  function handleToggleGentleMode() {
    setState((s) => ({ ...s, gentleMode: !s.gentleMode }))
  }

  function handleLike(id: string) {
    setState((s) => ({
      ...s,
      replies: updateReplyById(s.replies, id, (r) => ({ ...r, liked: !r.liked })),
    }))
  }

  function handleBlock(id: string) {
    setState((s) => ({
      ...s,
      replies: updateReplyById(s.replies, id, (r) => ({ ...r, blocked: !r.blocked })),
    }))
  }

  async function handleChain(id: string, text: string) {
    setState((s) => ({
      ...s,
      replies: updateReplyById(s.replies, id, (r) => ({ ...r, chainLoading: true })),
    }))
    const chainCharacters = pickRandomCharacters(3)
    try {
      const chainReplies = await generateReplies(text, chainCharacters, undefined, state.gentleMode)
      setState((s) => ({
        ...s,
        replies: updateReplyById(s.replies, id, (r) => ({
          ...r,
          chainLoading: false,
          chainReplies: [...r.chainReplies, ...chainReplies],
        })),
      }))
    } catch {
      setState((s) => ({
        ...s,
        replies: updateReplyById(s.replies, id, (r) => ({ ...r, chainLoading: false })),
      }))
    }
  }

  async function handleConvoSubmit(
    id: string,
    userText: string,
    character: Character,
    currentConvo: ConvoMessage[],
  ) {
    const withUserMsg: ConvoMessage[] = [...currentConvo, { role: 'user', text: userText }]
    setState((s) => ({
      ...s,
      replies: updateReplyById(s.replies, id, (r) => ({
        ...r,
        convo: withUserMsg,
        convoLoading: true,
      })),
    }))
    try {
      const responseText = await generateCharacterReply(userText, character, currentConvo, state.gentleMode)
      const withCharMsg: ConvoMessage[] = [...withUserMsg, { role: 'character', text: responseText }]
      setState((s) => ({
        ...s,
        replies: updateReplyById(s.replies, id, (r) => ({
          ...r,
          convo: withCharMsg,
          convoLoading: false,
        })),
      }))
    } catch {
      setState((s) => ({
        ...s,
        replies: updateReplyById(s.replies, id, (r) => ({ ...r, convoLoading: false })),
      }))
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[600px] mx-auto border-x border-gray-800 min-h-screen">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/80 border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">
                {state.gentleMode ? 'やさリプほいほい 🌸' : 'クソリプほいほい 💬'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {state.gentleMode
                  ? '投稿すると10キャラが優しいリプライを返してくれるよ'
                  : '投稿すると10キャラが1件ずつクソリプを返してくれるよ'}
              </p>
            </div>
            <button
              onClick={handleToggleGentleMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                state.gentleMode
                  ? 'bg-pink-500/20 border-pink-500 text-pink-400 hover:bg-pink-500/30'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {state.gentleMode ? '🌸 優しいモード' : '😈 クソリプモード'}
            </button>
          </div>
        </header>

        <TweetInput onPost={handlePost} isLoading={state.isLoading} />

        {state.error && (
          <div className="m-4 p-3 bg-red-900/40 border border-red-800 rounded-lg text-red-300 text-sm">
            エラー: {state.error}
          </div>
        )}

        {(state.postedTweet || state.postedImage) && (
          <TweetCard
            text={state.postedTweet ?? ''}
            image={state.postedImage ?? undefined}
            onRegenerate={handleRegenerate}
            isLoading={state.isLoading}
            gentleMode={state.gentleMode}
          />
        )}

        {state.isLoading && state.replies.length === 0 && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-3 text-gray-400">
              <span className="text-2xl animate-spin">{state.gentleMode ? '🌸' : '⚙️'}</span>
              <span>{state.gentleMode ? '優しいリプライ生成中…' : 'クソリプ召喚中…'}</span>
            </div>
          </div>
        )}

        <ReplyList
          replies={state.replies}
          isLoading={state.isLoading}
          onLike={handleLike}
          onBlock={handleBlock}
          onChain={handleChain}
          onConvoSubmit={handleConvoSubmit}
        />

        {!state.postedTweet && !state.isLoading && (
          <div className="p-8 text-center text-gray-600">
            <p className="text-4xl mb-3">{state.gentleMode ? '🌸' : '💬'}</p>
            <p className="text-sm">
              {state.gentleMode
                ? '何かつぶやくと、10キャラが優しいリプライを返してくれます'
                : '何かつぶやくと、10キャラが1件ずつクソリプを返してくれます'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
