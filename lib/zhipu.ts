import { ZhipuResponse, KnowledgeSource } from '@/types'

const API_KEY = '74c6860477614d52b82d4507bccf193b.1uhK8u4bhpNuOCWh'
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

export async function chatWithZhipu(
  messages: { role: string; content: string }[],
  knowledgeContext?: string
): Promise<string> {
  try {
    let systemPrompt = '你是智能客服助手，请用中文回答用户问题。'
    
    if (knowledgeContext) {
      systemPrompt += `\n\n请参考以下知识库内容回答问题，如果知识库中没有相关信息，请基于你的知识自主回答：\n\n${knowledgeContext}`
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const data: ZhipuResponse = await response.json()
    return data.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。'
  } catch (error) {
    console.error('智谱API调用失败:', error)
    return '抱歉，服务暂时不可用，请稍后再试。'
  }
}

export async function chatWithZhipuStream(
  messages: { role: string; content: string }[],
  knowledgeContext?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    let systemPrompt = '你是智能客服助手，请用中文回答用户问题。'
    
    if (knowledgeContext) {
      systemPrompt += `\n\n请参考以下知识库内容回答问题，如果知识库中没有相关信息，请基于你的知识自主回答：\n\n${knowledgeContext}`
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullContent += content
                onChunk?.(content)
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    }

    return fullContent || '抱歉，我暂时无法回答这个问题。'
  } catch (error) {
    console.error('智谱API流式调用失败:', error)
    return '抱歉，服务暂时不可用，请稍后再试。'
  }
}
