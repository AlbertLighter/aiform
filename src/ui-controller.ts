import { AIFormConfig } from './index';
import { FormDataExtractor, FormFieldInfo } from './form-extractor';

export class UIController {
  private config: AIFormConfig;
  private onRewrite: (formData: Record<string, any>, config: Partial<AIFormConfig>) => Promise<void>;
  private formExtractor: FormDataExtractor;
  private button: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private isModalOpen = false;
  private currentFormFields: FormFieldInfo[] = [];

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
              <div class="aiform-data-header">
                <h4>检测到的表单数据：</h4>
                <div class="aiform-data-controls">
                  <button class="aiform-select-all">全选</button>
                  <button class="aiform-select-none">全不选</button>
                  <button class="aiform-refresh-data">刷新数据</button>
                </div>
              </div>
              <div class="aiform-data-table-container">
                <table class="aiform-data-table">
                  <thead>
                    <tr>
                      <th class="aiform-checkbox-col">选择</th>
                      <th class="aiform-field-col">字段名</th>
                      <th class="aiform-type-col">类型</th>
                      <th class="aiform-value-col">当前值</th>
                      <th class="aiform-options-col">可选项</th>
                      <th class="aiform-status-col">状态</th>
                    </tr>
                  </thead>
                  <tbody class="aiform-data-tbody">
                  </tbody>
                </table>
                <div class="aiform-no-data" style="display: none;">
                  <p>未检测到表单数据</p>
                </div>
              </div>
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
          <div class="aiform-selected-count">已选择 <span>0</span> 个字段</div>
          <div class="aiform-footer-buttons">
            <button class="aiform-button-secondary aiform-test-connection">测试连接</button>
            <button class="aiform-button-primary aiform-rewrite">开始重写</button>
          </div>
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
    
    // 全选/全不选按钮
    const selectAllButton = this.modal.querySelector('.aiform-select-all');
    selectAllButton?.addEventListener('click', () => this.selectAllFields(true));
    
    const selectNoneButton = this.modal.querySelector('.aiform-select-none');
    selectNoneButton?.addEventListener('click', () => this.selectAllFields(false));
    
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
    this.currentFormFields = this.formExtractor.extractDetailedInfo();
    this.renderFormDataTable();
    this.updateSelectedCount();
  }

  private renderFormDataTable(): void {
    const tbody = this.modal?.querySelector('.aiform-data-tbody');
    const noDataDiv = this.modal?.querySelector('.aiform-no-data') as HTMLElement;
    const tableContainer = this.modal?.querySelector('.aiform-data-table-container') as HTMLElement;
    
    if (!tbody) return;
    
    if (this.currentFormFields.length === 0) {
      if (noDataDiv) noDataDiv.style.display = 'block';
      if (tableContainer) tableContainer.style.display = 'none';
      return;
    }
    
    if (noDataDiv) noDataDiv.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'block';
    
    tbody.innerHTML = '';
    
    this.currentFormFields.forEach((field, index) => {
      const row = document.createElement('tr');
      row.className = 'aiform-data-row';
      
      // 构建状态标识
      const statusBadges = [];
      if (field.required) statusBadges.push('<span class="aiform-badge aiform-badge-required">必填</span>');
      if (field.readonly) statusBadges.push('<span class="aiform-badge aiform-badge-readonly">只读</span>');
      if (field.disabled) statusBadges.push('<span class="aiform-badge aiform-badge-disabled">禁用</span>');
      
      // 构建可选项显示
      let optionsDisplay = '-';
      if (field.options && field.options.length > 0) {
        if (field.options.length <= 3) {
          optionsDisplay = field.options.join(', ');
        } else {
          optionsDisplay = field.options.slice(0, 2).join(', ') + `... (共${field.options.length}项)`;
        }
      }
      
      row.innerHTML = `
        <td class="aiform-checkbox-col">
          <input type="checkbox" class="aiform-field-checkbox" data-index="${index}" 
                 ${!field.readonly && !field.disabled && field.value ? 'checked' : ''}>
        </td>
        <td class="aiform-field-col">
          <div class="aiform-field-name" title="${field.key}">${field.key}</div>
          ${field.label ? `<div class="aiform-field-label">${field.label}</div>` : ''}
        </td>
        <td class="aiform-type-col">
          <span class="aiform-type-badge">${field.type}</span>
        </td>
        <td class="aiform-value-col">
          <div class="aiform-current-value" title="${field.value || ''}">${field.value || '<空>'}</div>
          ${field.placeholder ? `<div class="aiform-placeholder">提示: ${field.placeholder}</div>` : ''}
        </td>
        <td class="aiform-options-col">
          <div class="aiform-options" title="${field.options?.join(', ') || ''}">${optionsDisplay}</div>
        </td>
        <td class="aiform-status-col">
          ${statusBadges.join(' ')}
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    // 绑定复选框事件
    const checkboxes = tbody.querySelectorAll('.aiform-field-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateSelectedCount());
    });
  }

  private selectAllFields(select: boolean): void {
    const checkboxes = this.modal?.querySelectorAll('.aiform-field-checkbox') as NodeListOf<HTMLInputElement>;
    checkboxes?.forEach(checkbox => {
      // 只选择非只读、非禁用且有值的字段
      const index = parseInt(checkbox.dataset.index || '0');
      const field = this.currentFormFields[index];
      if (!field.readonly && !field.disabled && field.value) {
        checkbox.checked = select;
      }
    });
    this.updateSelectedCount();
  }

  private updateSelectedCount(): void {
    const checkboxes = this.modal?.querySelectorAll('.aiform-field-checkbox:checked') as NodeListOf<HTMLInputElement>;
    const countSpan = this.modal?.querySelector('.aiform-selected-count span');
    if (countSpan) {
      countSpan.textContent = checkboxes?.length.toString() || '0';
    }
  }

  private getSelectedFields(): Record<string, any> {
    const selectedData: Record<string, any> = {};
    const checkboxes = this.modal?.querySelectorAll('.aiform-field-checkbox:checked') as NodeListOf<HTMLInputElement>;
    
    checkboxes?.forEach(checkbox => {
      const index = parseInt(checkbox.dataset.index || '0');
      const field = this.currentFormFields[index];
      if (field && field.value !== null) {
        selectedData[field.key] = field.value;
      }
    });
    
    return selectedData;
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
    const selectedData = this.getSelectedFields();
    const config = this.getConfigFromUI();
    
    if (Object.keys(selectedData).length === 0) {
      this.showError('请至少选择一个字段进行重写');
      return;
    }
    
    if (!config.apiKey) {
      this.showError('请先配置API密钥');
      return;
    }
    
    this.showStatus(`正在重写 ${Object.keys(selectedData).length} 个字段...`, 'info');
    
    try {
      await this.onRewrite(selectedData, config);
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