export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: KnowledgeSource[];
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  status: 'active' | 'training' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  knowledgeBaseId: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  size: number;
  status: 'indexed' | 'processing' | 'failed';
  uploadDate: string;
  content?: string;
}

export interface KnowledgeSource {
  documentId: string;
  documentName: string;
  content: string;
  relevance: number;
}

export interface ZhipuResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}
