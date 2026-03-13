'use client';

import { Item, categoryLabels, categoryIcons, categoryColors } from '@/types/item';
import { MapPin, Clock, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ItemCardProps {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-200"
    >
      {/* Category Badge */}
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[item.category]}`}>
          <span>{categoryIcons[item.category]}</span>
          <span>{categoryLabels[item.category]}</span>
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Item Name */}
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
        {item.name}
      </h3>

      {/* Location */}
      <div className="flex items-center gap-2 text-slate-300 mb-2">
        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span className="text-sm line-clamp-1">{item.location}</span>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
          {item.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-slate-500 pt-3 border-t border-slate-700/50">
        <Clock className="w-3 h-3" />
        <span>更新于 {formatDate(item.updatedAt)}</span>
      </div>
    </motion.div>
  );
}
