import { AIFormConfig } from './index';

export class AIService {
  private config: AIFormConfig;

  constructor(config: AIFormConfig) {
    this.config = config;
  }

  updateConfig(config: AIFormConfig): void {
    this.config = config;
  }

  async rewriteFormData(formData: Record<string, any>): Promise<Record<string, any>> {
    if (!this.config.apiKey) {
      throw new Error('请先配置API密钥');
    }

    const prompt = `${this.config.prompt}\n\n${JSON.stringify(formData, null, 2)}`;

    try {
      let response: Response;
      
      switch (this.config.provider) {
        case 'openai':
          response = await this.callOpenAI(prompt);
          break;
        case 'openrouter':
          response = await this.callOpenRouter(prompt);
          break;
        case 'deepseek':
          response = await this.callDeepSeek(prompt);
          break;
        default:
          throw new Error(`不支持的AI提供商: ${this.config.provider}`);
      }

      const result = await response.json();
      return this.parseAIResponse(result);
    } catch (error) {
      console.error('AI服务调用失败:', error);
      throw new Error(`AI服务调用失败: ${(error as Error).message}`);
    }
  }

  private async callOpenAI(prompt: string): Promise<Response> {
    const apiUrl = this.config.apiUrl || 'https://api.openai.com/v1/chat/completions';
    
    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
  }

  private async callOpenRouter(prompt: string): Promise<Response> {
    const apiUrl = this.config.apiUrl || 'https://openrouter.ai/api/v1/chat/completions';
    
    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AIForm'
      },
      body: JSON.stringify({
        model: this.config.model || 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
  }

  private async callDeepSeek(prompt: string): Promise<Response> {
    const apiUrl = this.config.apiUrl || 'https://api.deepseek.com/v1/chat/completions';
    
    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });
  }

  private parseAIResponse(response: any): Record<string, any> {
    try {
      let content: string;
      
      // 处理不同AI服务的响应格式
      if (response.choices && response.choices[0] && response.choices[0].message) {
        content = response.choices[0].message.content;
      } else if (response.content) {
        content = response.content;
      } else {
        throw new Error('无效的AI响应格式');
      }

      // 尝试从响应中提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果没有找到JSON，尝试直接解析整个内容
      return JSON.parse(content);
    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new Error('AI响应格式无效，无法解析为有效的表单数据');
    }
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    try {
      const testData = { test: 'connection' };
      await this.rewriteFormData(testData);
      return true;
    } catch (error) {
      return false;
    }
  }
} 