import Anthropic from '@anthropic-ai/sdk'
import { Character, ConvoMessage, Reply } from './types'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

function makeReply(id: string, text: string, character: Character): Reply {
  return { id, text, character, liked: false, blocked: false, chainReplies: [], chainLoading: false, convo: [], convoLoading: false }
}

export async function generateCharacterReply(
  userText: string,
  character: Character,
  history: ConvoMessage[],
): Promise<string> {
  const historyLines = history
    .map((m) =>
      m.role === 'user'
        ? `ユーザー:「${m.text}」`
        : `${character.name}（あなた）:「${m.text}」`,
    )
    .join('\n')

  const prompt = historyLines
    ? `これまでの会話の流れ:\n${historyLines}\n\nユーザーの最新メッセージ:「${userText}」\n\n上記を踏まえてクソリプを1〜3文で返してください。`
    : `ユーザーのメッセージ:「${userText}」\n\nクソリプを1〜3文で返してください。`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: character.systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text.trim()
}

export async function generateReplies(
  tweet: string,
  characters: Character[],
): Promise<Reply[]> {
  const characterList = characters
    .map((c, i) => `${i + 1}. 【${c.id}】${c.name}（${c.description}）\nキャラクター設定: ${c.systemPrompt}`)
    .join('\n\n')

  const userMessage = `以下の${characters.length}人のキャラクターそれぞれとして、投稿に対するクソリプを1件ずつ返してください。

## 投稿
「${tweet}」

## キャラクター一覧
${characterList}

## 出力形式
各キャラクターの返信を以下の形式で出力してください。他の文章は一切不要です。

[キャラクターID]
返信テキスト

[キャラクターID]
返信テキスト

...（全員分）`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  const idToCharacter = new Map(characters.map((c) => [c.id, c]))
  const replies: Reply[] = []

  const blocks = content.text.split(/\[([^\]]+)\]\n/)
  for (let i = 1; i < blocks.length - 1; i += 2) {
    const id = blocks[i].trim()
    const text = blocks[i + 1].trim()
    const character = idToCharacter.get(id)
    if (character && text) {
      replies.push(makeReply(`reply-${id}-${Date.now()}-${i}`, text, character))
    }
  }

  return replies
}
