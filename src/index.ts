import { FormDataExtractor } from './form-extractor';
import { AIService } from './ai-service';
import { UIController } from './ui-controller';
import { FormFiller } from './form-filler';
import { FormHistoryManager } from './form-history';
import { cssStyles } from './styles';

export interface AIFormConfig {
  apiKey?: string;
  provider?: 'openai' | 'openrouter' | 'deepseek';
  model?: string;
  apiUrl?: string;
  prompt?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  enableHistory?: boolean; // 是否启用历史记录功能
}

export class AIForm {
  private formExtractor: FormDataExtractor;
  private aiService: AIService;
  private uiController: UIController;
  private formFiller: FormFiller;
  private historyManager: FormHistoryManager;
  private config: AIFormConfig;
  private formChangeListeners: Array<() => void> = [];

  constructor(config: AIFormConfig = {}) {
    this.config = {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      prompt: '请重写以下表单数据，使其更加专业和完整，保持JSON格式不变：',
      position: 'bottom-right',
      enableHistory: true,
      ...config
    };

    this.formExtractor = new FormDataExtractor();
    this.aiService = new AIService(this.config);
    this.formFiller = new FormFiller();
    this.historyManager = new FormHistoryManager();
    this.uiController = new UIController(this.config, this.handleRewrite.bind(this), this.historyManager);

    this.init();
    this.injectStyles();
    
    if (this.config.enableHistory) {
      this.setupFormChangeListeners();
      this.tryRestoreLatestData();
    }

    // 监听恢复数据事件
    this.setupRestoreDataListener();
  }

  private init(): void {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.uiController.render());
    } else {
      this.uiController.render();
    }
  }

  private injectStyles(): void {
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('aiform-styles');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'aiform-styles';
        style.textContent = cssStyles;
        document.head.appendChild(style);
      }
    }
  }

  /**
   * 设置恢复数据事件监听器
   */
  private setupRestoreDataListener(): void {
    document.addEventListener('aiform-restore-data', (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, any>>;
      const data = customEvent.detail;
      this.formFiller.fillForm(data);
    });
  }

  /**
   * 设置表单变化监听器
   */
  private setupFormChangeListeners(): void {
    if (typeof document === 'undefined') return;

    // 防抖函数
    let debounceTimer: number | null = null;
    const debounceDelay = 1000;

    const handleFormChange = () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        const formData = this.extractFormData();
        if (Object.keys(formData).length > 0) {
          this.historyManager.autoSaveFormData(formData);
        }
        debounceTimer = null;
      }, debounceDelay);
    };

    // 使用事件委托监听表单变化
    const handleEvent = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && this.isFormElement(target) && !this.formExtractor.isAIFormElement(target)) {
        handleFormChange();
      }
    };

    // 监听各种表单事件
    document.addEventListener('input', handleEvent, true);
    document.addEventListener('change', handleEvent, true);
    document.addEventListener('blur', handleEvent, true);

    // 保存清理函数
    this.formChangeListeners.push(() => {
      document.removeEventListener('input', handleEvent, true);
      document.removeEventListener('change', handleEvent, true);
      document.removeEventListener('blur', handleEvent, true);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    });
  }

  /**
   * 检查元素是否为表单元素
   */
  private isFormElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return ['input', 'textarea', 'select'].includes(tagName);
  }

  /**
   * 尝试恢复最新的表单数据
   */
  private tryRestoreLatestData(): void {
    // 延迟执行，确保页面完全加载
    setTimeout(() => {
      const latestData = this.historyManager.getLatestFormData();
      if (latestData && Object.keys(latestData).length > 0) {
        // 检查当前表单是否为空
        const currentData = this.extractFormData();
        const hasCurrentData = Object.values(currentData).some(value => 
          value !== null && value !== undefined && value !== ''
        );

        // 如果当前表单为空，显示恢复提示
        if (!hasCurrentData) {
          this.showRestorePrompt(latestData);
        }
      }
    }, 1000);
  }

  /**
   * 显示数据恢复提示
   */
  private showRestorePrompt(data: Record<string, any>): void {
    const fieldCount = Object.keys(data).length;
    
    // 创建提示框
    const prompt = document.createElement('div');
    prompt.className = 'aiform-restore-prompt';
    prompt.innerHTML = `
      <div class="aiform-restore-content">
        <div class="aiform-restore-icon">📋</div>
        <div class="aiform-restore-text">
          <div class="aiform-restore-title">发现上次填写的表单数据</div>
          <div class="aiform-restore-desc">检测到 ${fieldCount} 个字段的历史数据，是否恢复？</div>
        </div>
        <div class="aiform-restore-actions">
          <button class="aiform-restore-btn aiform-restore-yes">恢复数据</button>
          <button class="aiform-restore-btn aiform-restore-no">忽略</button>
        </div>
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .aiform-restore-prompt {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border-left: 4px solid #667eea;
        animation: aiform-slide-in 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .aiform-restore-content {
        display: flex;
        align-items: center;
        padding: 16px;
        gap: 12px;
      }
      
      .aiform-restore-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      
      .aiform-restore-text {
        flex: 1;
      }
      
      .aiform-restore-title {
        font-weight: 600;
        color: #374151;
        margin-bottom: 4px;
      }
      
      .aiform-restore-desc {
        font-size: 13px;
        color: #6b7280;
      }
      
      .aiform-restore-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
      
      .aiform-restore-btn {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid #d1d5db;
        transition: all 0.2s ease;
      }
      
      .aiform-restore-yes {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }
      
      .aiform-restore-yes:hover {
        background: #5a67d8;
      }
      
      .aiform-restore-no {
        background: white;
        color: #6b7280;
      }
      
      .aiform-restore-no:hover {
        background: #f9fafb;
      }
      
      @keyframes aiform-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(prompt);

    // 绑定事件
    const yesBtn = prompt.querySelector('.aiform-restore-yes');
    const noBtn = prompt.querySelector('.aiform-restore-no');

    const removePrompt = () => {
      prompt.remove();
      style.remove();
    };

    yesBtn?.addEventListener('click', () => {
      this.formFiller.fillForm(data);
      removePrompt();
    });

    noBtn?.addEventListener('click', removePrompt);

    // 5秒后自动关闭
    setTimeout(removePrompt, 5000);
  }

  private async handleRewrite(formData: Record<string, any>, newConfig: Partial<AIFormConfig>): Promise<void> {
    try {
      // 更新配置
      Object.assign(this.config, newConfig);
      this.aiService.updateConfig(this.config);

      // 使用AI重写数据
      const rewrittenData = await this.aiService.rewriteFormData(formData);
      
      // 填入表单
      this.formFiller.fillForm(rewrittenData);

      // 保存重写后的数据到历史记录
      if (this.config.enableHistory) {
        this.historyManager.saveFormData(rewrittenData);
      }

      this.uiController.showSuccess('表单数据已成功重写并填入！');
    } catch (error) {
      console.error('AIForm重写失败:', error);
      this.uiController.showError('重写失败：' + (error as Error).message);
    }
  }

  // 公共API
  public extractFormData(): Record<string, any> {
    return this.formExtractor.extractAll();
  }

  public async rewriteData(data: Record<string, any>): Promise<Record<string, any>> {
    return this.aiService.rewriteFormData(data);
  }

  public fillFormData(data: Record<string, any>): void {
    this.formFiller.fillForm(data);
  }

  public updateConfig(config: Partial<AIFormConfig>): void {
    Object.assign(this.config, config);
    this.aiService.updateConfig(this.config);
  }

  /**
   * 手动保存当前表单数据
   */
  public saveCurrentFormData(): boolean {
    const formData = this.extractFormData();
    return this.historyManager.saveFormData(formData);
  }

  /**
   * 恢复最新的表单数据
   */
  public restoreLatestFormData(): boolean {
    const latestData = this.historyManager.getLatestFormData();
    if (latestData) {
      this.formFiller.fillForm(latestData);
      return true;
    }
    return false;
  }

  /**
   * 获取表单历史管理器（用于外部访问）
   */
  public getHistoryManager(): FormHistoryManager {
    return this.historyManager;
  }

  public destroy(): void {
    // 清理表单监听器
    this.formChangeListeners.forEach(cleanup => cleanup());
    this.formChangeListeners = [];
    
    this.uiController.destroy();
    
    // 移除样式
    const style = document.getElementById('aiform-styles');
    if (style) {
      style.remove();
    }
  }
}

// 自动初始化（如果通过script标签引入）
if (typeof window !== 'undefined') {
  (window as any).AIForm = AIForm;
  
  // 检查是否有自动初始化配置
  const autoConfig = (window as any).AIFORM_CONFIG;
  if (autoConfig !== false) {
    new AIForm(autoConfig || {});
  }
}

// 默认导出AIForm类（保持向后兼容）
export default AIForm; 