import Anthropic from '@anthropic-ai/sdk'
import { Character, ConvoMessage, ImageAttachment, Reply } from './types'

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
  gentleMode?: boolean,
): Promise<string> {
  const historyLines = history
    .map((m) =>
      m.role === 'user'
        ? `ユーザー:「${m.text}」`
        : `${character.name}（あなた）:「${m.text}」`,
    )
    .join('\n')

  const replyStyle = gentleMode
    ? '優しく温かいリプライを1〜3文で返してください。'
    : 'クソリプを1〜3文で返してください。'

  const prompt = historyLines
    ? `これまでの会話の流れ:\n${historyLines}\n\nユーザーの最新メッセージ:「${userText}」\n\n上記を踏まえて${replyStyle}`
    : `ユーザーのメッセージ:「${userText}」\n\n${replyStyle}`

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
  image?: ImageAttachment,
  gentleMode?: boolean,
): Promise<Reply[]> {
  const characterList = characters
    .map((c, i) => `${i + 1}. 【${c.id}】${c.name}\n${c.systemPrompt}`)
    .join('\n\n')

  const replyType = gentleMode ? '優しいリプライ' : 'クソリプ'
  const replyStyle = gentleMode
    ? '各返信は1〜3文の短文で、温かく・優しく・励ましたり褒めたりする内容にしてください。日本語で返してください。'
    : '各返信は1〜3文の短文で、ズレ感と笑いを含めてください。攻撃的・差別的にはならないでください。日本語で返してください。'

  const textPrompt = `以下の${characters.length}人のキャラクターそれぞれとして、投稿に対する${replyType}を1件ずつ返してください。

## 投稿
「${tweet || '（画像のみ）'}」

## キャラクター一覧
${characterList}

## 共通ルール
${replyStyle}

## 出力形式
各キャラクターの返信を以下の形式で出力してください。他の文章は一切不要です。

[キャラクターID]
返信テキスト

[キャラクターID]
返信テキスト

...（全員分）`

  const userContent: Anthropic.MessageParam['content'] = image
    ? [
        { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } },
        { type: 'text', text: textPrompt },
      ]
    : textPrompt

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: userContent }],
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
