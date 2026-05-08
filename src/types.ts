export interface ImageAttachment {
  base64: string
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
}

export interface Character {
  id: string
  name: string
  handle: string
  avatar: string
  description: string
  systemPrompt: string
}

export interface ConvoMessage {
  role: 'user' | 'character'
  text: string
}

export interface Reply {
  id: string
  text: string
  character: Character
  liked: boolean
  blocked: boolean
  chainReplies: Reply[]
  chainLoading: boolean
  convo: ConvoMessage[]
  convoLoading: boolean
}

export interface AppState {
  tweet: string
  postedTweet: string | null
  postedImage: ImageAttachment | null
  replies: Reply[]
  isLoading: boolean
  error: string | null
  gentleMode: boolean
}
