import { User, ChatSession, KnowledgeBase, Document } from '@/types'

const STORAGE_KEYS = {
  USERS: 'cs_users',
  CURRENT_USER: 'cs_current_user',
  CHAT_SESSIONS: 'cs_chat_sessions',
  KNOWLEDGE_BASES: 'cs_knowledge_bases',
  DOCUMENTS: 'cs_documents',
}

export const storage = {
  // User related
  getUsers(): User[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.USERS)
    return data ? JSON.parse(data) : []
  },

  saveUser(user: User): void {
    if (typeof window === 'undefined') return
    const users = this.getUsers()
    users.push(user)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return data ? JSON.parse(data) : null
  },

  setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  },

  // Chat sessions
  getChatSessions(userId: string): ChatSession[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS)
    const sessions = data ? JSON.parse(data) : []
    return sessions.filter((s: ChatSession) => s.userId === userId)
  },

  saveChatSession(session: ChatSession): void {
    if (typeof window === 'undefined') return
    const sessions = this.getAllChatSessions()
    const index = sessions.findIndex(s => s.id === session.id)
    if (index >= 0) {
      sessions[index] = session
    } else {
      sessions.push(session)
    }
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions))
  },

  getAllChatSessions(): ChatSession[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS)
    return data ? JSON.parse(data) : []
  },

  deleteChatSession(sessionId: string): void {
    if (typeof window === 'undefined') return
    const sessions = this.getAllChatSessions()
    const filtered = sessions.filter(s => s.id !== sessionId)
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(filtered))
  },

  // Knowledge bases
  getKnowledgeBases(): KnowledgeBase[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASES)
    return data ? JSON.parse(data) : []
  },

  saveKnowledgeBase(kb: KnowledgeBase): void {
    if (typeof window === 'undefined') return
    const kbs = this.getKnowledgeBases()
    const index = kbs.findIndex(k => k.id === kb.id)
    if (index >= 0) {
      kbs[index] = kb
    } else {
      kbs.push(kb)
    }
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASES, JSON.stringify(kbs))
  },

  deleteKnowledgeBase(kbId: string): void {
    if (typeof window === 'undefined') return
    const kbs = this.getKnowledgeBases()
    const filtered = kbs.filter(k => k.id !== kbId)
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASES, JSON.stringify(filtered))
  },

  // Documents
  getDocuments(knowledgeBaseId?: string): Document[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
    const docs = data ? JSON.parse(data) : []
    if (knowledgeBaseId) {
      return docs.filter((d: Document) => d.knowledgeBaseId === knowledgeBaseId)
    }
    return docs
  },

  saveDocument(doc: Document): void {
    if (typeof window === 'undefined') return
    const docs = this.getDocuments()
    const index = docs.findIndex(d => d.id === doc.id)
    if (index >= 0) {
      docs[index] = doc
    } else {
      docs.push(doc)
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs))
  },

  deleteDocument(docId: string): void {
    if (typeof window === 'undefined') return
    const docs = this.getDocuments()
    const filtered = docs.filter(d => d.id !== docId)
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered))
  },
}
