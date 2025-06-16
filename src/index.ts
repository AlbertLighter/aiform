import { FormDataExtractor } from './form-extractor';
import { AIService } from './ai-service';
import { UIController } from './ui-controller';
import { FormFiller } from './form-filler';
import { cssStyles } from './styles';

export interface AIFormConfig {
  apiKey?: string;
  provider?: 'openai' | 'openrouter' | 'deepseek';
  model?: string;
  apiUrl?: string;
  prompt?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export class AIForm {
  private formExtractor: FormDataExtractor;
  private aiService: AIService;
  private uiController: UIController;
  private formFiller: FormFiller;
  private config: AIFormConfig;

  constructor(config: AIFormConfig = {}) {
    this.config = {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      prompt: '请重写以下表单数据，使其更加专业和完整，保持JSON格式不变：',
      position: 'bottom-right',
      ...config
    };

    this.formExtractor = new FormDataExtractor();
    this.aiService = new AIService(this.config);
    this.formFiller = new FormFiller();
    this.uiController = new UIController(this.config, this.handleRewrite.bind(this));

    this.init();
    this.injectStyles();
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

  private async handleRewrite(formData: Record<string, any>, newConfig: Partial<AIFormConfig>): Promise<void> {
    try {
      // 更新配置
      Object.assign(this.config, newConfig);
      this.aiService.updateConfig(this.config);

      // 使用AI重写数据
      const rewrittenData = await this.aiService.rewriteFormData(formData);
      
      // 填入表单
      this.formFiller.fillForm(rewrittenData);

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

  public destroy(): void {
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