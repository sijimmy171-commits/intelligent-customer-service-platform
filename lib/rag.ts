import { Document, KnowledgeSource } from '@/types'
import { storage } from './storage'

// 简单的文本相似度计算（基于关键词匹配）
function calculateSimilarity(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  const textWords = text.toLowerCase().split(/\s+/)
  
  let matchCount = 0
  for (const word of queryWords) {
    if (word.length > 1) {
      for (const textWord of textWords) {
        if (textWord.includes(word) || word.includes(textWord)) {
          matchCount++
        }
      }
    }
  }
  
  return matchCount / (queryWords.length + 1)
}

// 提取文本片段
function extractRelevantChunks(query: string, content: string, chunkSize: number = 500): string[] {
  const sentences = content.split(/[。！？.!?]/)
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < chunkSize) {
      currentChunk += sentence + '。'
    } else {
      if (currentChunk) chunks.push(currentChunk)
      currentChunk = sentence + '。'
    }
  }
  
  if (currentChunk) chunks.push(currentChunk)
  return chunks
}

export function searchKnowledgeBase(query: string, topK: number = 3): KnowledgeSource[] {
  const documents = storage.getDocuments()
  const results: Array<{ doc: Document; chunk: string; score: number }> = []

  for (const doc of documents) {
    if (doc.status !== 'indexed' || !doc.content) continue

    const chunks = extractRelevantChunks(query, doc.content)
    
    for (const chunk of chunks) {
      const score = calculateSimilarity(query, chunk)
      if (score > 0.1) {
        results.push({ doc, chunk, score })
      }
    }
  }

  // 按相似度排序
  results.sort((a, b) => b.score - a.score)

  // 返回前K个结果
  return results.slice(0, topK).map(r => ({
    documentId: r.doc.id,
    documentName: r.doc.name,
    content: r.chunk,
    relevance: r.score,
  }))
}

export function buildKnowledgeContext(sources: KnowledgeSource[]): string {
  if (sources.length === 0) return ''
  
  let context = '知识库参考信息：\n\n'
  sources.forEach((source, index) => {
    context += `[${index + 1}] 来自《${source.documentName}》：\n${source.content}\n\n`
  })
  
  return context
}
