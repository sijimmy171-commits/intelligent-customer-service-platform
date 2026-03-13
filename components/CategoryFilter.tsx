'use client';

import { Category, categoryLabels, categoryIcons } from '@/types/item';

interface CategoryFilterProps {
  selected: Category | 'all';
  onChange: (category: Category | 'all') => void;
}

const allCategories: (Category | 'all')[] = [
  'all', 'document', 'electronics', 'clothing', 'jewelry', 
  'key', 'wallet', 'bag', 'medicine', 'cosmetics', 'other'
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selected === cat
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
          }`}
        >
          {cat === 'all' ? (
            <>
              <span>📋</span>
              <span>全部</span>
            </>
          ) : (
            <>
              <span>{categoryIcons[cat]}</span>
              <span>{categoryLabels[cat]}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
