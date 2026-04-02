import Anthropic from '@anthropic-ai/sdk'
import { Character, Reply } from './types'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function generateReplies(
  tweet: string,
  character: Character,
): Promise<Reply[]> {
  const userMessage = `以下の投稿に対して、あなたのキャラクターでクソリプを10件生成してください。
各返信は必ず番号付きリスト（1. 〜 10.）の形式で出力し、番号と返信テキストのみ記載してください。余計な説明は不要です。

投稿：「${tweet}」`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: character.systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  const lines = content.text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+[\.\)]\s/.test(line))

  const replies: Reply[] = lines.slice(0, 10).map((line, i) => ({
    id: `reply-${Date.now()}-${i}`,
    text: line.replace(/^\d+[\.\)]\s*/, '').trim(),
    character,
  }))

  if (replies.length === 0) {
    throw new Error('返信の解析に失敗しました')
  }

  return replies
}
