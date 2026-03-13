import { Item } from '@/types/item';

const STORAGE_KEY = 'item-manager-data';

export class StorageService {
  static getItems(): Item[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const items: Item[] = JSON.parse(data);
      return items.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to load items from storage:', error);
      return [];
    }
  }

  static saveItems(items: Item[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save items to storage:', error);
    }
  }

  static exportToJSON(): string {
    const items = this.getItems();
    return JSON.stringify(items, null, 2);
  }

  static importFromJSON(jsonString: string): Item[] | null {
    try {
      const items: Item[] = JSON.parse(jsonString);
      // 验证数据结构
      if (Array.isArray(items) && items.every(item => 
        item.id && 
        item.name && 
        item.category && 
        item.location &&
        typeof item.createdAt === 'number' &&
        typeof item.updatedAt === 'number'
      )) {
        return items;
      }
      return null;
    } catch {
      return null;
    }
  }
}
