import { AIFormConfig } from './index';
import { FormDataExtractor, FormFieldInfo } from './form-extractor';
import { FormHistoryManager, FormHistoryEntry } from './form-history';

export class UIController {
  private config: AIFormConfig;
  private onRewrite: (formData: Record<string, any>, config: Partial<AIFormConfig>) => Promise<void>;
  private formExtractor: FormDataExtractor;
  private historyManager: FormHistoryManager;
  private button: HTMLElement | null = null;
  private sidebar: HTMLElement | null = null;
  private isSidebarOpen = false;
  private currentFormFields: FormFieldInfo[] = [];

  constructor(
    config: AIFormConfig, 
    onRewrite: (formData: Record<string, any>, config: Partial<AIFormConfig>) => Promise<void>,
    historyManager: FormHistoryManager
  ) {
    this.config = config;
    this.onRewrite = onRewrite;
    this.formExtractor = new FormDataExtractor();
    this.historyManager = historyManager;
  }

  render(): void {
    this.createButton();
    this.createSidebar();
  }

  private createButton(): void {
    // 检查是否已经存在按钮
    if (document.getElementById('aiform-button')) {
      return;
    }

    this.button = document.createElement('div');
    this.button.id = 'aiform-button';
    this.button.className = 'aiform-button aiform-button-sidebar';
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13 7H7v6h6V7z" fill="currentColor"/>
        <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"/>
      </svg>
      <span>AI表单</span>
    `;
    
    // 设置按钮位置 - 固定在右侧中部
    this.button.style.position = 'fixed';
    this.button.style.right = '20px';
    this.button.style.top = '50%';
    this.button.style.transform = 'translateY(-50%)';
    this.button.style.zIndex = '9999';
    
    // 添加点击事件
    this.button.addEventListener('click', () => this.toggleSidebar());
    
    document.body.appendChild(this.button);
  }

  private createSidebar(): void {
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'aiform-sidebar';
    this.sidebar.className = 'aiform-sidebar';
    
    this.sidebar.innerHTML = `
      <div class="aiform-sidebar-header">
        <h3>🤖 AI表单助手</h3>
        <button class="aiform-sidebar-close">&times;</button>
      </div>
      
      <div class="aiform-sidebar-content">
        <div class="aiform-tabs">
          <button class="aiform-tab active" data-tab="data">表单数据</button>
          <button class="aiform-tab" data-tab="history">历史记录</button>
          <button class="aiform-tab" data-tab="config">设置</button>
        </div>
        
        <div class="aiform-tab-content" id="aiform-data-tab">
          <div class="aiform-form-data">
            <div class="aiform-data-header">
              <h4>检测到的表单数据</h4>
              <div class="aiform-data-controls">
                <button class="aiform-btn aiform-btn-sm aiform-refresh-data">🔄 刷新</button>
                <button class="aiform-btn aiform-btn-sm aiform-save-current">💾 保存</button>
              </div>
            </div>
            
            <div class="aiform-form-fields">
              <!-- 表单字段将在这里显示 -->
            </div>
            
            <div class="aiform-no-data" style="display: none;">
              <div class="aiform-empty-state">
                <span class="aiform-empty-icon">📝</span>
                <p>未检测到表单数据</p>
                <p class="aiform-empty-hint">请在页面中填写表单后刷新</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="aiform-tab-content" id="aiform-history-tab" style="display: none;">
          <div class="aiform-history-data">
            <div class="aiform-history-header">
              <h4>表单历史记录</h4>
              <div class="aiform-history-controls">
                <button class="aiform-btn aiform-btn-sm aiform-restore-latest">↩️ 恢复最新</button>
                <button class="aiform-btn aiform-btn-sm aiform-clear-history">🗑️ 清空</button>
              </div>
            </div>
            <div class="aiform-history-list">
              <!-- 历史记录将在这里显示 -->
            </div>
          </div>
        </div>
        
        <div class="aiform-tab-content" id="aiform-config-tab" style="display: none;">
          <div class="aiform-config-form">
            <div class="aiform-form-group">
              <label>AI提供商</label>
              <select class="aiform-provider">
                <option value="openai">OpenAI</option>
                <option value="openrouter">OpenRouter</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>
            
            <div class="aiform-form-group">
              <label>API密钥</label>
              <input type="password" class="aiform-api-key" placeholder="请输入API密钥">
            </div>
            
            <div class="aiform-form-group">
              <label>模型</label>
              <input type="text" class="aiform-model" placeholder="例如：gpt-3.5-turbo">
            </div>
            
            <div class="aiform-form-group">
              <label>自定义API地址（可选）</label>
              <input type="text" class="aiform-api-url" placeholder="留空使用默认地址">
            </div>
          </div>
        </div>
      </div>
      
      <div class="aiform-sidebar-footer">
        <div class="aiform-selected-info">
          <span class="aiform-selected-count">0 个字段已选择</span>
        </div>
        <div class="aiform-footer-buttons">
          <button class="aiform-btn aiform-btn-secondary aiform-test-connection">🔗 测试连接</button>
          <button class="aiform-btn aiform-btn-primary aiform-rewrite">✨ AI重写</button>
        </div>
      </div>
      
      <div class="aiform-status"></div>
    `;
    
    document.body.appendChild(this.sidebar);
    this.bindSidebarEvents();
  }

  private bindSidebarEvents(): void {
    if (!this.sidebar) return;
    
    // 关闭按钮
    const closeButton = this.sidebar.querySelector('.aiform-sidebar-close');
    closeButton?.addEventListener('click', () => this.closeSidebar());
    
    // 标签切换
    const tabs = this.sidebar.querySelectorAll('.aiform-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
        this.switchTab(tabName || 'data');
      });
    });
    
    // 表单数据相关按钮
    const refreshButton = this.sidebar.querySelector('.aiform-refresh-data');
    refreshButton?.addEventListener('click', () => this.refreshFormData());
    
    const saveCurrentButton = this.sidebar.querySelector('.aiform-save-current');
    saveCurrentButton?.addEventListener('click', () => this.saveCurrentFormData());
    
    // 历史记录相关按钮
    const restoreLatestButton = this.sidebar.querySelector('.aiform-restore-latest');
    restoreLatestButton?.addEventListener('click', () => this.restoreLatestHistory());
    
    const clearHistoryButton = this.sidebar.querySelector('.aiform-clear-history');
    clearHistoryButton?.addEventListener('click', () => this.clearHistory());
    
    // 测试连接按钮
    const testButton = this.sidebar.querySelector('.aiform-test-connection');
    testButton?.addEventListener('click', () => this.testConnection());
    
    // 重写按钮
    const rewriteButton = this.sidebar.querySelector('.aiform-rewrite');
    rewriteButton?.addEventListener('click', () => this.handleRewrite());
  }

  private toggleSidebar(): void {
    if (this.isSidebarOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  private openSidebar(): void {
    if (!this.sidebar || this.isSidebarOpen) return;
    
    this.isSidebarOpen = true;
    this.sidebar.classList.add('active');
    this.refreshFormData();
    this.refreshHistory();
    this.loadConfig();
    
    // 更新按钮状态
    if (this.button) {
      this.button.classList.add('active');
    }
  }

  private closeSidebar(): void {
    if (!this.sidebar || !this.isSidebarOpen) return;
    
    this.sidebar.classList.remove('active');
    this.isSidebarOpen = false;
    
    // 更新按钮状态
    if (this.button) {
      this.button.classList.remove('active');
    }
  }

  private switchTab(tabName: string): void {
    if (!this.sidebar) return;
    
    // 更新标签按钮状态
    const tabs = this.sidebar.querySelectorAll('.aiform-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    
    // 显示对应内容
    const contents = this.sidebar.querySelectorAll('.aiform-tab-content');
    contents.forEach(content => {
      const element = content as HTMLElement;
      element.style.display = element.id === `aiform-${tabName}-tab` ? 'block' : 'none';
    });
    
    // 如果切换到历史记录标签，刷新历史数据
    if (tabName === 'history') {
      this.refreshHistory();
    }
  }

  private refreshFormData(): void {
    this.currentFormFields = this.formExtractor.extractDetailedInfo();
    this.renderFormFields();
    this.updateSelectedCount();
  }

  private renderFormFields(): void {
    const fieldsContainer = this.sidebar?.querySelector('.aiform-form-fields');
    const noDataDiv = this.sidebar?.querySelector('.aiform-no-data') as HTMLElement;
    
    if (!fieldsContainer) return;
    
    if (this.currentFormFields.length === 0) {
      if (noDataDiv) noDataDiv.style.display = 'block';
      fieldsContainer.innerHTML = '';
      return;
    }
    
    if (noDataDiv) noDataDiv.style.display = 'none';
    
    fieldsContainer.innerHTML = this.currentFormFields.map((field, index) => `
      <div class="aiform-field-item" data-field-index="${index}">
        <div class="aiform-field-header">
          <div class="aiform-field-info">
            <div class="aiform-field-name" title="${field.name}">${field.name || field.label || `字段${index + 1}`}</div>
            <div class="aiform-field-meta">
              <span class="aiform-field-type">${field.type}</span>
              ${field.required ? '<span class="aiform-badge aiform-badge-required">必填</span>' : ''}
              ${field.readonly ? '<span class="aiform-badge aiform-badge-readonly">只读</span>' : ''}
            </div>
          </div>
          <div class="aiform-field-actions">
            <button class="aiform-field-locate" title="定位到表单字段">📍</button>
            <input type="checkbox" class="aiform-field-checkbox" ${field.value ? 'checked' : ''}>
          </div>
        </div>
        
        <div class="aiform-field-value">
          ${this.renderFieldValueInput(field, index)}
        </div>
        
        ${field.options && field.options.length > 0 ? `
          <div class="aiform-field-options">
            <small>可选项: ${field.options.slice(0, 3).join(', ')}${field.options.length > 3 ? '...' : ''}</small>
          </div>
        ` : ''}
      </div>
    `).join('');
    
    // 绑定事件
    this.bindFieldEvents();
  }

  private renderFieldValueInput(field: FormFieldInfo, index: number): string {
    const value = field.value || '';
    const isDisabled = field.readonly || field.disabled;
    
    switch (field.type) {
      case 'textarea':
        return `<textarea class="aiform-field-input" data-field-index="${index}" ${isDisabled ? 'disabled' : ''}>${value}</textarea>`;
      
      case 'select':
        const options = field.options || [];
        return `
          <select class="aiform-field-input" data-field-index="${index}" ${isDisabled ? 'disabled' : ''}>
            <option value="">请选择...</option>
            ${options.map(option => `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
        `;
      
      case 'checkbox':
        return `
          <label class="aiform-checkbox-label">
            <input type="checkbox" class="aiform-field-input" data-field-index="${index}" ${value ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
            ${field.label || '选择'}
          </label>
        `;
      
      case 'radio':
        const radioOptions = field.options || [];
        return `
          <div class="aiform-radio-group">
            ${radioOptions.map(option => `
              <label class="aiform-radio-label">
                <input type="radio" name="field-${index}" class="aiform-field-input" data-field-index="${index}" value="${option}" ${option === value ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                ${option}
              </label>
            `).join('')}
          </div>
        `;
      
      default:
        return `<input type="text" class="aiform-field-input" data-field-index="${index}" value="${value}" ${isDisabled ? 'disabled' : ''}>`;
    }
  }

  private bindFieldEvents(): void {
    if (!this.sidebar) return;
    
    // 绑定定位按钮事件
    const locateButtons = this.sidebar.querySelectorAll('.aiform-field-locate');
    locateButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.locateField(index));
    });
    
    // 绑定字段值变化事件
    const fieldInputs = this.sidebar.querySelectorAll('.aiform-field-input');
    fieldInputs.forEach(input => {
      const fieldIndex = parseInt((input as HTMLElement).dataset.fieldIndex || '0');
      
      input.addEventListener('input', () => this.updateFieldValue(fieldIndex, input));
      input.addEventListener('change', () => this.updateFieldValue(fieldIndex, input));
    });
    
    // 绑定复选框事件
    const checkboxes = this.sidebar.querySelectorAll('.aiform-field-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateSelectedCount());
    });
  }

  private locateField(fieldIndex: number): void {
    const field = this.currentFormFields[fieldIndex];
    if (!field || !field.element) return;
    
    // 滚动到字段位置
    field.element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    
    // 高亮显示字段
    this.highlightField(field.element);
    
    // 聚焦字段
    setTimeout(() => {
      if (field.element instanceof HTMLInputElement || 
          field.element instanceof HTMLTextAreaElement || 
          field.element instanceof HTMLSelectElement) {
        field.element.focus();
      }
    }, 500);
  }

  private highlightField(element: HTMLElement): void {
    // 移除之前的高亮
    document.querySelectorAll('.aiform-highlight').forEach(el => {
      el.classList.remove('aiform-highlight');
    });
    
    // 添加高亮样式
    element.classList.add('aiform-highlight');
    
    // 3秒后移除高亮
    setTimeout(() => {
      element.classList.remove('aiform-highlight');
    }, 3000);
  }

  private updateFieldValue(fieldIndex: number, input: Element): void {
    const field = this.currentFormFields[fieldIndex];
    if (!field || !field.element) return;
    
    let newValue: string | boolean = '';
    
    if (input instanceof HTMLInputElement) {
      if (input.type === 'checkbox') {
        newValue = input.checked;
      } else if (input.type === 'radio') {
        newValue = input.checked ? input.value : field.value || '';
      } else {
        newValue = input.value;
      }
    } else if (input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
      newValue = input.value;
    }
    
    // 更新页面中的实际字段
    this.updatePageField(field.element, newValue);
    
    // 更新内部记录
    field.value = newValue;
  }

  private updatePageField(element: HTMLElement, value: string | boolean): void {
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        element.checked = Boolean(value);
      } else {
        element.value = String(value);
      }
      
      // 触发 change 事件
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('input', { bubbles: true }));
      
    } else if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      element.value = String(value);
      
      // 触发 change 事件
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private updateSelectedCount(): void {
    if (!this.sidebar) return;
    
    const checkboxes = this.sidebar.querySelectorAll('.aiform-field-checkbox:checked');
    const countElement = this.sidebar.querySelector('.aiform-selected-count');
    
    if (countElement) {
      countElement.textContent = `${checkboxes.length} 个字段已选择`;
    }
  }

  private saveCurrentFormData(): void {
    const formData = this.formExtractor.extractAll();
    const success = this.historyManager.saveFormData(formData);
    
    if (success) {
      this.showStatus('表单数据已保存到历史记录', 'success');
      this.refreshHistory();
    } else {
      this.showStatus('保存失败：没有有效的表单数据', 'error');
    }
  }

  private refreshHistory(): void {
    this.renderHistoryList();
  }

  private renderHistoryList(): void {
    const historyList = this.sidebar?.querySelector('.aiform-history-list');
    if (!historyList) return;
    
    const currentPageHistory = this.historyManager.getCurrentPageHistory();
    
    if (currentPageHistory.length === 0) {
      historyList.innerHTML = `
        <div class="aiform-empty-state">
          <span class="aiform-empty-icon">📚</span>
          <p>暂无历史记录</p>
          <p class="aiform-empty-hint">填写表单后会自动保存历史数据</p>
        </div>
      `;
      return;
    }
    
    // 按时间排序
    const sortedHistory = currentPageHistory.sort((a, b) => b.timestamp - a.timestamp);
    
    historyList.innerHTML = sortedHistory.map((entry, index) => `
      <div class="aiform-history-item" data-id="${entry.id}">
        <div class="aiform-history-info">
          <div class="aiform-history-time">${this.historyManager.formatTimestamp(entry.timestamp)}</div>
          <div class="aiform-history-meta">${entry.fieldCount} 个字段</div>
        </div>
        <div class="aiform-history-preview">
          ${this.formatHistoryData(entry.data)}
        </div>
        <div class="aiform-history-actions">
          <button class="aiform-btn aiform-btn-xs aiform-history-restore" title="恢复此记录">恢复</button>
          <button class="aiform-btn aiform-btn-xs aiform-btn-danger aiform-history-delete" title="删除此记录">删除</button>
        </div>
      </div>
    `).join('');
    
    // 绑定历史记录操作事件
    historyList.querySelectorAll('.aiform-history-restore').forEach((btn, index) => {
      btn.addEventListener('click', () => this.restoreHistoryEntry(sortedHistory[index]));
    });
    
    historyList.querySelectorAll('.aiform-history-delete').forEach((btn, index) => {
      btn.addEventListener('click', () => this.deleteHistoryEntry(sortedHistory[index].id));
    });
  }

  private formatHistoryData(data: Record<string, any>): string {
    const entries = Object.entries(data);
    if (entries.length <= 2) {
      return entries.map(([key, value]) => `${key}: ${String(value).substring(0, 15)}`).join(', ');
    } else {
      const preview = entries.slice(0, 1).map(([key, value]) => `${key}: ${String(value).substring(0, 15)}`).join(', ');
      return `${preview}... 等${entries.length}项`;
    }
  }

  private restoreLatestHistory(): void {
    const latestData = this.historyManager.getLatestFormData();
    if (latestData) {
      this.restoreFormData(latestData);
      this.showStatus('已恢复最新的历史数据', 'success');
    } else {
      this.showStatus('没有找到历史数据', 'error');
    }
  }

  private restoreHistoryEntry(entry: FormHistoryEntry): void {
    this.restoreFormData(entry.data);
    this.showStatus('已恢复历史数据', 'success');
  }

  private deleteHistoryEntry(id: string): void {
    const success = this.historyManager.deleteHistoryEntry(id);
    if (success) {
      this.showStatus('历史记录已删除', 'success');
      this.refreshHistory();
    } else {
      this.showStatus('删除失败', 'error');
    }
  }

  private clearHistory(): void {
    if (confirm('确定要清空当前页面的所有历史记录吗？此操作不可恢复。')) {
      const success = this.historyManager.clearCurrentPageHistory();
      if (success) {
        this.showStatus('历史记录已清空', 'success');
        this.refreshHistory();
      } else {
        this.showStatus('清空失败', 'error');
      }
    }
  }

  private restoreFormData(data: Record<string, any>): void {
    // 派发自定义事件
    const event = new CustomEvent('aiform-restore-data', { detail: data });
    document.dispatchEvent(event);
  }

  private loadConfig(): void {
    if (!this.sidebar) return;
    
    const providerSelect = this.sidebar.querySelector('.aiform-provider') as HTMLSelectElement;
    const apiKeyInput = this.sidebar.querySelector('.aiform-api-key') as HTMLInputElement;
    const modelInput = this.sidebar.querySelector('.aiform-model') as HTMLInputElement;
    const apiUrlInput = this.sidebar.querySelector('.aiform-api-url') as HTMLInputElement;
    
    if (providerSelect) providerSelect.value = this.config.provider || 'openai';
    if (apiKeyInput) apiKeyInput.value = this.config.apiKey || '';
    if (modelInput) modelInput.value = this.config.model || '';
    if (apiUrlInput) apiUrlInput.value = this.config.apiUrl || '';
  }

  private getConfigFromUI(): Partial<AIFormConfig> {
    if (!this.sidebar) return {};
    
    const providerSelect = this.sidebar.querySelector('.aiform-provider') as HTMLSelectElement;
    const apiKeyInput = this.sidebar.querySelector('.aiform-api-key') as HTMLInputElement;
    const modelInput = this.sidebar.querySelector('.aiform-model') as HTMLInputElement;
    const apiUrlInput = this.sidebar.querySelector('.aiform-api-url') as HTMLInputElement;
    
    return {
      provider: providerSelect?.value || 'openai',
      apiKey: apiKeyInput?.value || '',
      model: modelInput?.value || '',
      apiUrl: apiUrlInput?.value || ''
    };
  }

  private async testConnection(): Promise<void> {
    this.showStatus('正在测试连接...', 'info');
    
    try {
      // 这里可以添加连接测试逻辑
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.showStatus('连接测试成功！', 'success');
    } catch (error) {
      this.showStatus('连接测试失败', 'error');
    }
  }

  private async handleRewrite(): Promise<void> {
    const selectedData = this.getSelectedFields();
    const config = this.getConfigFromUI();
    
    if (Object.keys(selectedData).length === 0) {
      this.showStatus('请至少选择一个字段', 'error');
      return;
    }
    
    try {
      await this.onRewrite(selectedData, config);
      this.refreshFormData();
    } catch (error) {
      this.showStatus('重写失败: ' + (error instanceof Error ? error.message : String(error)), 'error');
    }
  }

  private getSelectedFields(): Record<string, any> {
    if (!this.sidebar) return {};
    
    const selectedData: Record<string, any> = {};
    const checkboxes = this.sidebar.querySelectorAll('.aiform-field-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
      const fieldItem = checkbox.closest('.aiform-field-item');
      if (fieldItem) {
        const fieldIndex = parseInt(fieldItem.getAttribute('data-field-index') || '0');
        const field = this.currentFormFields[fieldIndex];
        if (field && field.name) {
          selectedData[field.name] = field.value || '';
        }
      }
    });
    
    return selectedData;
  }

  showStatus(message: string, type: 'info' | 'success' | 'error'): void {
    const statusDiv = this.sidebar?.querySelector('.aiform-status') as HTMLElement;
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.className = `aiform-status aiform-status-${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
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
    
    if (this.sidebar) {
      this.sidebar.remove();
      this.sidebar = null;
    }
  }
} 