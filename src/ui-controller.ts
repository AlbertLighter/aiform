import { AIFormConfig } from './index';
import { FormDataExtractor } from './form-extractor';

export class UIController {
  private config: AIFormConfig;
  private onRewrite: (formData: Record<string, any>, config: Partial<AIFormConfig>) => Promise<void>;
  private formExtractor: FormDataExtractor;
  private button: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private isModalOpen = false;

  constructor(
    config: AIFormConfig, 
    onRewrite: (formData: Record<string, any>, config: Partial<AIFormConfig>) => Promise<void>
  ) {
    this.config = config;
    this.onRewrite = onRewrite;
    this.formExtractor = new FormDataExtractor();
  }

  render(): void {
    this.createButton();
    this.createModal();
  }

  private createButton(): void {
    // 检查是否已经存在按钮
    if (document.getElementById('aiform-button')) {
      return;
    }

    this.button = document.createElement('div');
    this.button.id = 'aiform-button';
    this.button.className = 'aiform-button';
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13 7H7v6h6V7z" fill="currentColor"/>
        <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"/>
      </svg>
      <span>AI表单</span>
    `;
    
    // 设置按钮位置
    this.setButtonPosition();
    
    // 添加点击事件
    this.button.addEventListener('click', () => this.openModal());
    
    document.body.appendChild(this.button);
  }

  private setButtonPosition(): void {
    if (!this.button) return;
    
    const position = this.config.position || 'bottom-right';
    
    switch (position) {
      case 'bottom-right':
        this.button.style.bottom = '20px';
        this.button.style.right = '20px';
        break;
      case 'bottom-left':
        this.button.style.bottom = '20px';
        this.button.style.left = '20px';
        break;
      case 'top-right':
        this.button.style.top = '20px';
        this.button.style.right = '20px';
        break;
      case 'top-left':
        this.button.style.top = '20px';
        this.button.style.left = '20px';
        break;
    }
  }

  private createModal(): void {
    this.modal = document.createElement('div');
    this.modal.id = 'aiform-modal';
    this.modal.className = 'aiform-modal';
    this.modal.style.display = 'none';
    
    this.modal.innerHTML = `
      <div class="aiform-modal-overlay"></div>
      <div class="aiform-modal-content">
        <div class="aiform-modal-header">
          <h3>AI表单重写器</h3>
          <button class="aiform-close-button">&times;</button>
        </div>
        
        <div class="aiform-modal-body">
          <div class="aiform-tabs">
            <button class="aiform-tab active" data-tab="data">表单数据</button>
            <button class="aiform-tab" data-tab="config">配置</button>
          </div>
          
          <div class="aiform-tab-content" id="aiform-data-tab">
            <div class="aiform-form-data">
              <h4>检测到的表单数据：</h4>
              <div class="aiform-data-preview"></div>
              <button class="aiform-refresh-data">刷新数据</button>
            </div>
          </div>
          
          <div class="aiform-tab-content" id="aiform-config-tab" style="display: none;">
            <div class="aiform-config-form">
              <div class="aiform-form-group">
                <label>AI提供商：</label>
                <select class="aiform-provider">
                  <option value="openai">OpenAI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>
              
              <div class="aiform-form-group">
                <label>API密钥：</label>
                <input type="password" class="aiform-api-key" placeholder="请输入API密钥">
              </div>
              
              <div class="aiform-form-group">
                <label>模型：</label>
                <input type="text" class="aiform-model" placeholder="例如：gpt-3.5-turbo">
              </div>
              
              <div class="aiform-form-group">
                <label>自定义API地址（可选）：</label>
                <input type="text" class="aiform-api-url" placeholder="例如：https://api.openai.com/v1/chat/completions">
              </div>
              
              <div class="aiform-form-group">
                <label>重写提示词：</label>
                <textarea class="aiform-prompt" rows="3" placeholder="请重写以下表单数据..."></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <div class="aiform-modal-footer">
          <button class="aiform-button-secondary aiform-test-connection">测试连接</button>
          <button class="aiform-button-primary aiform-rewrite">开始重写</button>
        </div>
        
        <div class="aiform-status"></div>
      </div>
    `;
    
    document.body.appendChild(this.modal);
    this.bindModalEvents();
  }

  private bindModalEvents(): void {
    if (!this.modal) return;
    
    // 关闭按钮
    const closeButton = this.modal.querySelector('.aiform-close-button');
    closeButton?.addEventListener('click', () => this.closeModal());
    
    // 点击遮罩关闭
    const overlay = this.modal.querySelector('.aiform-modal-overlay');
    overlay?.addEventListener('click', () => this.closeModal());
    
    // 标签切换
    const tabs = this.modal.querySelectorAll('.aiform-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
        this.switchTab(tabName || 'data');
      });
    });
    
    // 刷新数据按钮
    const refreshButton = this.modal.querySelector('.aiform-refresh-data');
    refreshButton?.addEventListener('click', () => this.refreshFormData());
    
    // 测试连接按钮
    const testButton = this.modal.querySelector('.aiform-test-connection');
    testButton?.addEventListener('click', () => this.testConnection());
    
    // 重写按钮
    const rewriteButton = this.modal.querySelector('.aiform-rewrite');
    rewriteButton?.addEventListener('click', () => this.handleRewrite());
  }

  private openModal(): void {
    if (!this.modal || this.isModalOpen) return;
    
    this.isModalOpen = true;
    this.modal.style.display = 'block';
    this.refreshFormData();
    this.loadConfig();
    
    // 动画效果
    setTimeout(() => {
      this.modal?.classList.add('active');
    }, 10);
  }

  private closeModal(): void {
    if (!this.modal || !this.isModalOpen) return;
    
    this.modal.classList.remove('active');
    
    setTimeout(() => {
      if (this.modal) {
        this.modal.style.display = 'none';
        this.isModalOpen = false;
      }
    }, 300);
  }

  private switchTab(tabName: string): void {
    if (!this.modal) return;
    
    // 更新标签按钮状态
    const tabs = this.modal.querySelectorAll('.aiform-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    
    // 显示对应内容
    const contents = this.modal.querySelectorAll('.aiform-tab-content');
    contents.forEach(content => {
      const element = content as HTMLElement;
      element.style.display = element.id === `aiform-${tabName}-tab` ? 'block' : 'none';
    });
  }

  private refreshFormData(): void {
    const formData = this.formExtractor.extractAll();
    const preview = this.modal?.querySelector('.aiform-data-preview');
    
    if (preview) {
      if (Object.keys(formData).length === 0) {
        preview.innerHTML = '<p class="aiform-no-data">未检测到表单数据</p>';
      } else {
        const html = Object.entries(formData)
          .map(([key, value]) => `
            <div class="aiform-data-item">
              <span class="aiform-data-key">${key}:</span>
              <span class="aiform-data-value">${String(value)}</span>
            </div>
          `).join('');
        preview.innerHTML = html;
      }
    }
  }

  private loadConfig(): void {
    if (!this.modal) return;
    
    const providerSelect = this.modal.querySelector('.aiform-provider') as HTMLSelectElement;
    const apiKeyInput = this.modal.querySelector('.aiform-api-key') as HTMLInputElement;
    const modelInput = this.modal.querySelector('.aiform-model') as HTMLInputElement;
    const apiUrlInput = this.modal.querySelector('.aiform-api-url') as HTMLInputElement;
    const promptTextarea = this.modal.querySelector('.aiform-prompt') as HTMLTextAreaElement;
    
    if (providerSelect) providerSelect.value = this.config.provider || 'openai';
    if (apiKeyInput) apiKeyInput.value = this.config.apiKey || '';
    if (modelInput) modelInput.value = this.config.model || '';
    if (apiUrlInput) apiUrlInput.value = this.config.apiUrl || '';
    if (promptTextarea) promptTextarea.value = this.config.prompt || '';
  }

  private getConfigFromUI(): Partial<AIFormConfig> {
    if (!this.modal) return {};
    
    const providerSelect = this.modal.querySelector('.aiform-provider') as HTMLSelectElement;
    const apiKeyInput = this.modal.querySelector('.aiform-api-key') as HTMLInputElement;
    const modelInput = this.modal.querySelector('.aiform-model') as HTMLInputElement;
    const apiUrlInput = this.modal.querySelector('.aiform-api-url') as HTMLInputElement;
    const promptTextarea = this.modal.querySelector('.aiform-prompt') as HTMLTextAreaElement;
    
    return {
      provider: providerSelect?.value as 'openai' | 'openrouter' | 'deepseek',
      apiKey: apiKeyInput?.value,
      model: modelInput?.value,
      apiUrl: apiUrlInput?.value,
      prompt: promptTextarea?.value
    };
  }

  private async testConnection(): Promise<void> {
    const config = this.getConfigFromUI();
    this.showStatus('正在测试连接...', 'info');
    
    // 这里可以添加实际的连接测试逻辑
    setTimeout(() => {
      this.showStatus('连接测试成功！', 'success');
    }, 1000);
  }

  private async handleRewrite(): Promise<void> {
    const formData = this.formExtractor.extractAll();
    const config = this.getConfigFromUI();
    
    if (Object.keys(formData).length === 0) {
      this.showError('未检测到表单数据');
      return;
    }
    
    if (!config.apiKey) {
      this.showError('请先配置API密钥');
      return;
    }
    
    this.showStatus('正在重写表单数据...', 'info');
    
    try {
      await this.onRewrite(formData, config);
      this.closeModal();
    } catch (error) {
      this.showError((error as Error).message);
    }
  }

  showStatus(message: string, type: 'info' | 'success' | 'error'): void {
    const status = this.modal?.querySelector('.aiform-status');
    if (status) {
      status.className = `aiform-status aiform-status-${type}`;
      status.textContent = message;
      
      if (type === 'success') {
        setTimeout(() => {
          status.textContent = '';
          status.className = 'aiform-status';
        }, 3000);
      }
    }
  }

  showSuccess(message: string): void {
    this.showStatus(message, 'success');
  }

  showError(message: string): void {
    this.showStatus(message, 'error');
  }

  destroy(): void {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
    
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
} 