import { useState } from 'react'
import { AppState } from './types'
import { pickRandomCharacters } from './characters'
import { generateReplies } from './api'
import TweetInput from './components/TweetInput'
import TweetCard from './components/TweetCard'
import ReplyList from './components/ReplyList'

const initialState: AppState = {
  tweet: '',
  postedTweet: null,
  replies: [],
  isLoading: false,
  error: null,
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState)

  async function fetchReplies(tweet: string) {
    const selectedCharacters = pickRandomCharacters(10)
    setState((s) => ({ ...s, isLoading: true, error: null, replies: [] }))
    try {
      const replies = await generateReplies(tweet, selectedCharacters)
      setState((s) => ({ ...s, replies, isLoading: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラー'
      setState((s) => ({ ...s, isLoading: false, error: message }))
    }
  }

  async function handlePost(tweet: string) {
    setState((s) => ({ ...s, postedTweet: tweet }))
    await fetchReplies(tweet)
  }

  async function handleRegenerate() {
    if (!state.postedTweet) return
    await fetchReplies(state.postedTweet)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[600px] mx-auto border-x border-gray-800 min-h-screen">
        <header className="sticky top-0 z-10 backdrop-blur-md bg-black/80 border-b border-gray-800 px-4 py-3">
          <h1 className="text-lg font-bold text-white">クソリプほいほい 💬</h1>
          <p className="text-xs text-gray-500 mt-0.5">投稿すると10キャラが1件ずつクソリプを返してくれるよ</p>
        </header>

        <TweetInput onPost={handlePost} isLoading={state.isLoading} />

        {state.error && (
          <div className="m-4 p-3 bg-red-900/40 border border-red-800 rounded-lg text-red-300 text-sm">
            エラー: {state.error}
          </div>
        )}

        {state.postedTweet && (
          <TweetCard
            text={state.postedTweet}
            onRegenerate={handleRegenerate}
            isLoading={state.isLoading}
          />
        )}

        <ReplyList replies={state.replies} isLoading={state.isLoading} />

        {!state.postedTweet && !state.isLoading && (
          <div className="p-8 text-center text-gray-600">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm">何かつぶやくと、10キャラが1件ずつクソリプを返してくれます</p>
          </div>
        )}
      </div>
    </div>
  )
}
