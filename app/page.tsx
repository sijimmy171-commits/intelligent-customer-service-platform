'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bot, Sparkles, BarChart3, User, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { storage } from '@/lib/storage'
import { generateId } from '@/lib/utils'
import { User as UserType } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (currentUser) {
      if (currentUser.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/chat')
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // 登录
        const users = storage.getUsers()
        const user = users.find(u => u.username === username && u.password === password)
        
        if (!user) {
          setError('用户名或密码错误')
          setLoading(false)
          return
        }

        storage.setCurrentUser(user)
        
        if (user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/chat')
        }
      } else {
        // 注册
        if (username.length < 3) {
          setError('用户名至少3个字符')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('密码至少6个字符')
          setLoading(false)
          return
        }

        const users = storage.getUsers()
        if (users.some(u => u.username === username)) {
          setError('用户名已存在')
          setLoading(false)
          return
        }

        const newUser: UserType = {
          id: generateId(),
          username,
          password,
          role: isAdminMode ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        }

        storage.saveUser(newUser)
        storage.setCurrentUser(newUser)
        router.push('/chat')
      }
    } catch (err) {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 左侧品牌展示 */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                智能客服
              </h1>
              <h2 className="text-4xl font-bold text-blue-600 leading-tight">
                云端管理平台
              </h2>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed max-w-md">
              基于人工智能驱动的下一代客户服务解决方案。实时响应，深度分析，为您的客户提供无缝体验。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">AI 自动回复</h3>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">情感分析</h3>
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* 顶部装饰 */}
          <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-20 h-20 border border-blue-400/30 rounded-lg transform rotate-12" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border border-blue-400/20 rounded-lg transform -rotate-12" />
              <div className="absolute top-8 left-8 w-3 h-3 bg-blue-400/40 rounded-full" />
              <div className="absolute bottom-8 right-12 w-2 h-2 bg-blue-400/50 rounded-full" />
            </div>
            <div className="relative z-10 p-8">
              <h3 className="text-2xl font-bold text-white">
                {isLogin ? '欢迎回来' : '创建账号'}
              </h3>
              <p className="text-slate-400 mt-1">
                {isLogin ? '请登录您的管理后台' : '注册开始使用智能客服'}
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名或邮箱"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdminMode}
                      onChange={(e) => setIsAdminMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">注册为管理员账号</span>
                  </label>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-slate-600">
                    <input type="checkbox" className="mr-2 rounded border-slate-300" />
                    记住我
                  </label>
                  <button type="button" className="text-blue-600 hover:text-blue-700">
                    忘记密码？
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '请稍候...' : (isLogin ? '登录' : '注册')}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">
                    {isLogin ? '还没有账号？' : '已有账号？'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setIsAdminMode(false)
                  setError('')
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                {isLogin ? '注册新账号' : '返回登录'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                © 2024 智能客服平台 · 全力驱动
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
