'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot,
  Plus,
  MessageSquare,
  Clock,
  Settings,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  User,
  LogOut,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import { storage } from '@/lib/storage'
import { chatWithZhipu } from '@/lib/zhipu'
import { searchKnowledgeBase, buildKnowledgeContext } from '@/lib/rag'
import { generateId, formatDateTime } from '@/lib/utils'
import { User as UserType, ChatSession, Message } from '@/types'

export default function ChatPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    setCurrentUser(user)
    loadSessions(user.id)
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSessions = (userId: string) => {
    const userSessions = storage.getChatSessions(userId)
    setSessions(userSessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ))
  }

  const createNewSession = () => {
    if (!currentUser) return
    
    const newSession: ChatSession = {
      id: generateId(),
      userId: currentUser.id,
      title: '新对话',
      messages: [{
        id: generateId(),
        role: 'assistant',
        content: '您好！我是您的智能客服助手。基于 Zhipu AI 和 RAG (检索增强生成) 技术，我可以为您提供基于企业私有知识库的精准解答。\n\n请问今天有什么可以帮您的？',
        timestamp: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    storage.saveChatSession(newSession)
    setSessions([newSession, ...sessions])
    setCurrentSession(newSession)
  }

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session)
  }

  const handleSend = async () => {
    if (!input.trim() || !currentUser) return

    let session = currentSession
    if (!session) {
      createNewSession()
      return
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...session.messages, userMessage]
    const updatedSession = {
      ...session,
      messages: updatedMessages,
      title: session.title === '新对话' ? input.slice(0, 20) : session.title,
      updatedAt: new Date().toISOString(),
    }

    setCurrentSession(updatedSession)
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s))
    storage.saveChatSession(updatedSession)
    setInput('')
    setLoading(true)

    try {
      // RAG检索
      const knowledgeSources = searchKnowledgeBase(input)
      const knowledgeContext = buildKnowledgeContext(knowledgeSources)

      // 调用智谱AI
      const historyMessages = updatedMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await chatWithZhipu(historyMessages, knowledgeContext)

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        sources: knowledgeSources.length > 0 ? knowledgeSources : undefined,
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      const finalSession = {
        ...updatedSession,
        messages: finalMessages,
      }

      setCurrentSession(finalSession)
      setSessions(sessions.map(s => s.id === finalSession.id ? finalSession : s))
      storage.saveChatSession(finalSession)
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    storage.setCurrentUser(null)
    router.push('/')
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  if (!currentUser) return null

  return (
    <div className="h-screen flex bg-slate-50">
      {/* 左侧边栏 */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">智能客服平台</h1>
              <p className="text-xs text-slate-500">Zhipu AI & RAG 驱动</p>
            </div>
          </div>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-4">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            开启新对话
          </button>
        </div>

        {/* 历史记录 */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-2">
            历史记录
          </div>
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => selectSession(session)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                  currentSession?.id === session.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDateTime(session.updatedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 底部用户信息 */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {currentUser.username}
              </p>
              <p className="text-xs text-slate-500">
                {currentUser.role === 'admin' ? '管理员' : '普通用户'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/admin')}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              管理后台
            </button>
            <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-5 pt-5">
              用户门户
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {currentSession ? (
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {currentSession.messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-fade-in ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* 头像 */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-blue-600'
                        : 'bg-blue-100'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* 来源信息 */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          来源：{message.sources[0].documentName}
                        </p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  开始新的对话
                </h3>
                <p className="text-slate-500">
                  点击左侧"开启新对话"按钮开始咨询
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入您的问题..."
                disabled={loading || !currentSession}
                className="w-full pl-4 pr-14 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim() || !currentSession}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              基于 Zhipu AI 大模型与 RAG 实时知识库检索生成内容
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
