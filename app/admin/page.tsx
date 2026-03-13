'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot,
  LayoutDashboard,
  BookOpen,
  Upload,
  Settings,
  Users,
  LogOut,
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  Filter,
  RefreshCw,
  FileUp,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react'
import { storage } from '@/lib/storage'
import { generateId, formatDate, formatFileSize } from '@/lib/utils'
import { User, KnowledgeBase, Document } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'knowledge' | 'upload' | 'settings'>('knowledge')
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [newKBName, setNewKBName] = useState('')
  const [newKBDescription, setNewKBDescription] = useState('')

  useEffect(() => {
    const user = storage.getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    if (user.role !== 'admin') {
      router.push('/chat')
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = () => {
    setKnowledgeBases(storage.getKnowledgeBases())
    setDocuments(storage.getDocuments())
  }

  const handleLogout = () => {
    storage.setCurrentUser(null)
    router.push('/')
  }

  const createKnowledgeBase = () => {
    if (!newKBName.trim()) return

    const newKB: KnowledgeBase = {
      id: generateId(),
      name: newKBName,
      description: newKBDescription,
      documentCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    storage.saveKnowledgeBase(newKB)
    setKnowledgeBases([...knowledgeBases, newKB])
    setNewKBName('')
    setNewKBDescription('')
    setShowCreateModal(false)
  }

  const deleteKnowledgeBase = (id: string) => {
    if (confirm('确定要删除这个知识库吗？')) {
      storage.deleteKnowledgeBase(id)
      setKnowledgeBases(knowledgeBases.filter(kb => kb.id !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            已上线
          </span>
        )
      case 'training':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            训练中
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            草稿
          </span>
        )
      default:
        return null
    }
  }

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-100">
            已索引 (Indexed)
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
            处理中 (Processing)
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
            索引失败 (Failed)
          </span>
        )
      default:
        return null
    }
  }

  if (!currentUser) return null

  return (
    <div className="h-screen flex bg-slate-50">
      {/* 左侧边栏 */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">智能客服平台</h1>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <div className="flex-1 py-4 px-3 space-y-1">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-3">
            主菜单
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            仪表盘
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            知识库
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-5 h-5" />
            上传文档
          </button>

          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-6 mb-2 px-3">
            系统设置
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            通用设置
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Users className="w-5 h-5" />
            权限管理
          </button>
        </div>

        {/* 底部信息 */}
        <div className="p-4 border-t border-slate-100">
          <div className="text-xs text-slate-400 mb-1">系统版本</div>
          <div className="text-sm font-medium text-slate-700">V2.4.0 稳定版</div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-600">运行正常</span>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`text-sm font-medium pb-5 pt-5 border-b-2 transition-colors ${
                activeTab === 'knowledge' || activeTab === 'upload'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-blue-600'
              }`}
            >
              管理后台
            </button>
            <button
              onClick={() => router.push('/chat')}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors pb-5 pt-5"
            >
              用户中心
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索文档或设置..."
                className="pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">管理员</p>
                <p className="text-xs text-slate-500">admin@cloud-ai.com</p>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">管</span>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'knowledge' && !selectedKB && (
            <div className="max-w-6xl mx-auto">
              {/* 页面标题 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">知识库管理</h2>
                  <p className="text-slate-500 mt-1">管理您的AI训练数据、PDF文档及QA语料库</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  新建知识库
                </button>
              </div>

              {/* 上传区域 */}
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">上传新文档</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    支持拖拽 PDF, Word, TXT, 或 Markdown 文件到此区域。单个文件大小限制 50MB。
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      选择文件
                    </button>
                    <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                      批量上传
                    </button>
                  </div>
                </div>
              </div>

              {/* 知识库列表 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">已创建知识库</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">文档数量</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">更新时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {knowledgeBases.map((kb) => (
                      <tr key={kb.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{kb.name}</p>
                              <p className="text-sm text-slate-500">{kb.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{kb.documentCount} 个文件</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(kb.updatedAt)}</td>
                        <td className="px-6 py-4">{getStatusBadge(kb.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedKB(kb)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {kb.status === 'active' ? '编辑' : '查看'}
                            </button>
                            <button
                              onClick={() => deleteKnowledgeBase(kb.id)}
                              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {knowledgeBases.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          暂无知识库，点击&quot;新建知识库&quot;创建
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {knowledgeBases.length > 0 && (
                  <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      显示 1 到 {knowledgeBases.length} 条，共 {knowledgeBases.length} 条记录
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
                        上一页
                      </button>
                      <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">1</button>
                      <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
                        下一页
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && selectedKB && (
            <KnowledgeBaseDetail
              knowledgeBase={selectedKB}
              documents={documents.filter(d => d.knowledgeBaseId === selectedKB.id)}
              onBack={() => setSelectedKB(null)}
              onUpdate={loadData}
            />
          )}

          {activeTab === 'upload' && (
            <UploadPage
              knowledgeBases={knowledgeBases}
              onUploadComplete={loadData}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </div>
      </div>

      {/* 创建知识库弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">新建知识库</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  知识库名称
                </label>
                <input
                  type="text"
                  value={newKBName}
                  onChange={(e) => setNewKBName(e.target.value)}
                  placeholder="请输入知识库名称"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述
                </label>
                <textarea
                  value={newKBDescription}
                  onChange={(e) => setNewKBDescription(e.target.value)}
                  placeholder="请输入知识库描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={createKnowledgeBase}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 知识库详情组件
function KnowledgeBaseDetail({
  knowledgeBase,
  documents,
  onBack,
  onUpdate,
}: {
  knowledgeBase: KnowledgeBase
  documents: Document[]
  onBack: () => void
  onUpdate: () => void
}) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'processing' | 'failed'>('all')

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'indexed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-100">
            已索引 (Indexed)
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
            处理中 (Processing)
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
            索引失败 (Failed)
          </span>
        )
      default:
        return null
    }
  }

  const filteredDocs = documents.filter(d => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'processing') return d.status === 'processing'
    if (activeFilter === 'failed') return d.status === 'failed'
    return true
  })

  const totalSize = documents.reduce((sum, d) => sum + d.size, 0)
  const indexedCount = documents.filter(d => d.status === 'indexed').length

  const deleteDocument = (id: string) => {
    if (confirm('确定要删除这个文档吗？')) {
      storage.deleteDocument(id)
      onUpdate()
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          返回列表
        </button>
      </div>

      {/* 知识库信息 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{knowledgeBase.name}</h2>
            <p className="text-slate-500 mt-1">{knowledgeBase.description || '管理并同步您的知识库源文件，支持 PDF, DOCX, Markdown 格式。'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              <Settings className="w-4 h-4" />
              配置
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              上传文档
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">文件总数</p>
            <p className="text-2xl font-bold text-slate-900">{documents.length.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">已索引</p>
            <p className="text-2xl font-bold text-slate-900">{indexedCount.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">
              {documents.length > 0 ? Math.round((indexedCount / documents.length) * 100) : 0}%
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">存储空间</p>
            <p className="text-2xl font-bold text-slate-900">{formatFileSize(totalSize)}</p>
            <p className="text-xs text-slate-400 mt-1">/ 500MB</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">失败任务</p>
            <p className="text-2xl font-bold text-red-600">
              {documents.filter(d => d.status === 'failed').length}
            </p>
          </div>
        </div>
      </div>

      {/* 文档列表 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveFilter('all')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeFilter === 'all'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-blue-600'
              }`}
            >
              全部文件
            </button>
            <button
              onClick={() => setActiveFilter('processing')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeFilter === 'processing'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-blue-600'
              }`}
            >
              正在处理 ({documents.filter(d => d.status === 'processing').length})
            </button>
            <button
              onClick={() => setActiveFilter('failed')}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeFilter === 'failed'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-blue-600'
              }`}
            >
              索引失败 ({documents.filter(d => d.status === 'failed').length})
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">文件名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">大小</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">上传日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-slate-900">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{getDocumentStatusBadge(doc.status)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatFileSize(doc.size)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(doc.uploadDate)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  暂无文档
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 上传页面组件
function UploadPage({
  knowledgeBases,
  onUploadComplete,
}: {
  knowledgeBases: KnowledgeBase[]
  onUploadComplete: () => void
}) {
  const [selectedKB, setSelectedKB] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    await handleFiles(files)
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      await handleFiles(files)
    }
  }

  const handleFiles = async (files: FileList) => {
    if (!selectedKB) {
      alert('请先选择知识库')
      return
    }

    setUploading(true)

    for (const file of Array.from(files)) {
      // 读取文件内容
      const content = await readFileContent(file)
      
      const doc: Document = {
        id: generateId(),
        knowledgeBaseId: selectedKB,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        status: 'indexed',
        uploadDate: new Date().toISOString(),
        content: content,
      }

      storage.saveDocument(doc)
    }

    // 更新知识库文档计数
    const kb = knowledgeBases.find(k => k.id === selectedKB)
    if (kb) {
      const docs = storage.getDocuments(selectedKB)
      kb.documentCount = docs.length
      kb.updatedAt = new Date().toISOString()
      storage.saveKnowledgeBase(kb)
    }

    setUploading(false)
    onUploadComplete()
    alert('上传成功！')
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '')
      }
      reader.readAsText(file)
    })
  }

  const getFileType = (filename: string): 'pdf' | 'docx' | 'txt' | 'md' => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (ext === 'docx' || ext === 'doc') return 'docx'
    if (ext === 'md') return 'md'
    return 'txt'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">上传文档</h2>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          选择知识库
        </label>
        <select
          value={selectedKB}
          onChange={(e) => setSelectedKB(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">请选择知识库</option>
          {knowledgeBases.map(kb => (
            <option key={kb.id} value={kb.id}>{kb.name}</option>
          ))}
        </select>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`bg-white rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
        }`}
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileUp className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {uploading ? '上传中...' : '拖拽文件到此处上传'}
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          支持 PDF, Word, TXT, Markdown 格式，单个文件最大 50MB
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
          <Plus className="w-4 h-4" />
          选择文件
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-900 mb-2">上传提示</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>PDF 文件会被转换为文本进行索引</li>
          <li>Word 文档支持 .docx 格式</li>
          <li>上传后系统会自动进行索引处理</li>
          <li>索引完成后即可在对话中使用</li>
        </ul>
      </div>
    </div>
  )
}

// 仪表盘页面
function DashboardPage() {
  const sessions = storage.getAllChatSessions()
  const users = storage.getUsers()
  const documents = storage.getDocuments()

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">仪表盘</h2>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm text-slate-500">总用户数</p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
          </div>
          <p className="text-sm text-slate-500">知识库数量</p>
          <p className="text-2xl font-bold text-slate-900">{storage.getKnowledgeBases().length}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
          </div>
          <p className="text-sm text-slate-500">文档总数</p>
          <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+23%</span>
          </div>
          <p className="text-sm text-slate-500">对话次数</p>
          <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">最近活动</h3>
          <div className="space-y-4">
            {sessions.slice(0, 5).map(session => (
              <div key={session.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{session.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(session.updatedAt)}</p>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-slate-500 text-center py-4">暂无活动</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">系统状态</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">智谱 AI API</span>
              </div>
              <span className="text-sm text-green-600">正常</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">知识库索引</span>
              </div>
              <span className="text-sm text-green-600">正常</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">存储服务</span>
              </div>
              <span className="text-sm text-green-600">正常</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 设置页面
function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">通用设置</h2>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-medium text-slate-900 mb-4">AI 模型配置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                模型名称
              </label>
              <input
                type="text"
                value="GLM-4-Flash"
                readOnly
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value="****************"
                readOnly
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-slate-100">
          <h3 className="font-medium text-slate-900 mb-4">RAG 配置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                检索数量 (Top-K)
              </label>
              <input
                type="number"
                defaultValue={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">从知识库中检索的相关文档片段数量</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-medium text-slate-900 mb-4">界面设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">显示消息时间戳</p>
                <p className="text-sm text-slate-500">在聊天界面显示消息发送时间</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">显示知识库来源</p>
                <p className="text-sm text-slate-500">显示回答引用的知识库文档来源</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
