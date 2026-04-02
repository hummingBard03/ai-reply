export interface Character {
  id: string
  name: string
  handle: string
  avatar: string
  description: string
  systemPrompt: string
}

export interface Reply {
  id: string
  text: string
  character: Character
}

export interface AppState {
  tweet: string
  postedTweet: string | null
  replies: Reply[]
  currentCharacter: Character | null
  isLoading: boolean
  error: string | null
}
