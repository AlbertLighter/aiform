import { FormFieldInfo } from './form-extractor';

export interface FormHistoryEntry {
  id: string;
  timestamp: number;
  url: string;
  title: string;
  data: Record<string, any>;
  fieldCount: number;
}

export class FormHistoryManager {
  private storageKey = 'aiform_history';
  private maxEntries = 20; // 最大保存条目数
  private autoSaveDelay = 2000; // 自动保存延迟(ms)
  private autoSaveTimer: number | null = null;

  constructor() {
    this.cleanupOldEntries();
  }

  /**
   * 获取当前页面的标识符
   */
  private getCurrentPageKey(): string {
    // 使用URL路径作为页面标识，忽略查询参数
    const url = new URL(window.location.href);
    return url.pathname || '/';
  }

  /**
   * 获取页面标题
   */
  private getPageTitle(): string {
    return document.title || 'Unknown Page';
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取所有历史记录
   */
  getAllHistory(): FormHistoryEntry[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('获取表单历史失败:', error);
      return [];
    }
  }

  /**
   * 获取当前页面的历史记录
   */
  getCurrentPageHistory(): FormHistoryEntry[] {
    const currentUrl = this.getCurrentPageKey();
    return this.getAllHistory().filter(entry => entry.url === currentUrl);
  }

  /**
   * 获取最近的表单数据（当前页面）
   */
  getLatestFormData(): Record<string, any> | null {
    const pageHistory = this.getCurrentPageHistory();
    if (pageHistory.length === 0) {
      return null;
    }
    
    // 返回最新的记录
    const latest = pageHistory.sort((a, b) => b.timestamp - a.timestamp)[0];
    return latest.data;
  }

  /**
   * 保存表单数据
   */
  saveFormData(data: Record<string, any>, isAutoSave = false): boolean {
    try {
      // 过滤空值 - 使用兼容的方法
      const filteredData: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined && value !== '') {
          filteredData[key] = value;
        }
      }

      // 如果没有有效数据，不保存
      if (Object.keys(filteredData).length === 0) {
        return false;
      }

      const entry: FormHistoryEntry = {
        id: this.generateId(),
        timestamp: Date.now(),
        url: this.getCurrentPageKey(),
        title: this.getPageTitle(),
        data: filteredData,
        fieldCount: Object.keys(filteredData).length
      };

      const allHistory = this.getAllHistory();
      
      // 如果是自动保存，检查是否与最近的记录相同
      if (isAutoSave) {
        const currentPageHistory = allHistory.filter(h => h.url === entry.url);
        if (currentPageHistory.length > 0) {
          const latest = currentPageHistory.sort((a, b) => b.timestamp - a.timestamp)[0];
          if (this.isDataEqual(latest.data, filteredData)) {
            return false; // 数据相同，不需要保存
          }
        }
      }

      // 添加新记录
      allHistory.unshift(entry);

      // 限制记录数量
      if (allHistory.length > this.maxEntries) {
        allHistory.splice(this.maxEntries);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(allHistory));
      return true;
    } catch (error) {
      console.warn('保存表单历史失败:', error);
      return false;
    }
  }

  /**
   * 删除指定的历史记录
   */
  deleteHistoryEntry(id: string): boolean {
    try {
      const allHistory = this.getAllHistory();
      const filtered = allHistory.filter(entry => entry.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.warn('删除历史记录失败:', error);
      return false;
    }
  }

  /**
   * 清空当前页面的历史记录
   */
  clearCurrentPageHistory(): boolean {
    try {
      const currentUrl = this.getCurrentPageKey();
      const allHistory = this.getAllHistory();
      const filtered = allHistory.filter(entry => entry.url !== currentUrl);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.warn('清空当前页面历史失败:', error);
      return false;
    }
  }

  /**
   * 清空所有历史记录
   */
  clearAllHistory(): boolean {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.warn('清空所有历史失败:', error);
      return false;
    }
  }

  /**
   * 自动保存表单数据（防抖）
   */
  autoSaveFormData(data: Record<string, any>): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.saveFormData(data, true);
      this.autoSaveTimer = null;
    }, this.autoSaveDelay);
  }

  /**
   * 比较两个数据对象是否相等
   */
  private isDataEqual(data1: Record<string, any>, data2: Record<string, any>): boolean {
    const keys1 = Object.keys(data1).sort();
    const keys2 = Object.keys(data2).sort();
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    return keys1.every(key => data1[key] === data2[key]);
  }

  /**
   * 清理过期的历史记录
   */
  private cleanupOldEntries(): void {
    try {
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
      const cutoffTime = Date.now() - maxAge;
      
      const allHistory = this.getAllHistory();
      const filtered = allHistory.filter(entry => entry.timestamp > cutoffTime);
      
      if (filtered.length !== allHistory.length) {
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      }
    } catch (error) {
      console.warn('清理历史记录失败:', error);
    }
  }

  /**
   * 格式化时间戳
   */
  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return '刚刚';
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * 获取存储使用情况
   */
  getStorageInfo(): { used: number; total: number; entries: number } {
    try {
      const data = localStorage.getItem(this.storageKey) || '[]';
      const entries = this.getAllHistory().length;
      const used = new Blob([data]).size;
      const total = 5 * 1024 * 1024; // 假设5MB限制
      
      return { used, total, entries };
    } catch (error) {
      return { used: 0, total: 0, entries: 0 };
    }
  }
} 