const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

// 获取 token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// 通用请求函数
const request = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
};

// 认证 API
export const authApi = {
  register: (username: string, password: string, role?: string) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),
  
  login: (username: string, password: string) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  
  getCurrentUser: () => 
    request('/auth/me'),
};

// 知识库 API
export const knowledgeBaseApi = {
  getAll: () => 
    request('/knowledge-base'),
  
  getById: (id: string) => 
    request(`/knowledge-base/${id}`),
  
  create: (name: string, description?: string) => 
    request('/knowledge-base', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
  
  update: (id: string, data: { name?: string; description?: string; status?: string }) => 
    request(`/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) => 
    request(`/knowledge-base/${id}`, {
      method: 'DELETE',
    }),
};

// 文档 API
export const documentApi = {
  getByKnowledgeBase: (knowledgeBaseId: string) => 
    request(`/documents/knowledge-base/${knowledgeBaseId}`),
  
  upload: (knowledgeBaseId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('knowledgeBaseId', knowledgeBaseId);

    const token = getToken();
    
    return fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(res => res.json());
  },
  
  delete: (id: string) => 
    request(`/documents/${id}`, {
      method: 'DELETE',
    }),
};

// 聊天 API
export const chatApi = {
  getSessions: () => 
    request('/chat/sessions'),
  
  createSession: () => 
    request('/chat/sessions', {
      method: 'POST',
    }),
  
  getMessages: (sessionId: string) => 
    request(`/chat/sessions/${sessionId}/messages`),
  
  sendMessage: (sessionId: string, content: string) => 
    request(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  
  deleteSession: (sessionId: string) => 
    request(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
};
