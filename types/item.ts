export type Category = 
  | 'document'    // 证件
  | 'electronics' // 电子产品
  | 'clothing'    // 衣物
  | 'jewelry'     // 首饰
  | 'key'         // 钥匙
  | 'wallet'      // 钱包
  | 'bag'         // 包包
  | 'medicine'    // 药品
  | 'cosmetics'   // 化妆品
  | 'other';      // 其他

export interface Item {
  id: string;
  name: string;
  category: Category;
  location: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export const categoryLabels: Record<Category, string> = {
  document: '证件',
  electronics: '电子产品',
  clothing: '衣物',
  jewelry: '首饰',
  key: '钥匙',
  wallet: '钱包',
  bag: '包包',
  medicine: '药品',
  cosmetics: '化妆品',
  other: '其他',
};

export const categoryIcons: Record<Category, string> = {
  document: '📄',
  electronics: '📱',
  clothing: '👔',
  jewelry: '💍',
  key: '🔑',
  wallet: '💳',
  bag: '👜',
  medicine: '💊',
  cosmetics: '💄',
  other: '📦',
};

export const categoryColors: Record<Category, string> = {
  document: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  electronics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  clothing: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  jewelry: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  key: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  wallet: 'bg-green-500/20 text-green-400 border-green-500/30',
  bag: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  medicine: 'bg-red-500/20 text-red-400 border-red-500/30',
  cosmetics: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};
