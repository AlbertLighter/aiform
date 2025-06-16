export class FormFiller {
  
  /**
   * 填充表单数据
   */
  fillForm(data: Record<string, any>): void {
    for (const [key, value] of Object.entries(data)) {
      this.fillField(key, value);
    }
  }

  /**
   * 填充指定字段
   */
  private fillField(key: string, value: any): void {
    const elements = this.findFormElements(key);
    
    elements.forEach(element => {
      this.setElementValue(element, value);
    });
  }

  /**
   * 查找表单元素
   */
  private findFormElements(key: string): HTMLElement[] {
    const elements: HTMLElement[] = [];
    
    // 通过name属性查找
    const byName = document.querySelectorAll(`[name="${key}"]`);
    elements.push(...Array.from(byName) as HTMLElement[]);
    
    // 通过id属性查找
    const byId = document.getElementById(key);
    if (byId) {
      elements.push(byId);
    }
    
    // 通过placeholder查找
    const byPlaceholder = document.querySelectorAll(`[placeholder="${key}"]`);
    elements.push(...Array.from(byPlaceholder) as HTMLElement[]);
    
    // 通过label文本查找
    const byLabel = this.findByLabelText(key);
    elements.push(...byLabel);
    
    // 通过类名查找（模糊匹配）
    if (elements.length === 0) {
      const byClass = document.querySelectorAll(`[class*="${key}"]`);
      elements.push(...Array.from(byClass).filter(el => 
        el.tagName.toLowerCase() === 'input' || 
        el.tagName.toLowerCase() === 'textarea' || 
        el.tagName.toLowerCase() === 'select'
      ) as HTMLElement[]);
    }
    
    return elements;
  }

  /**
   * 通过label文本查找关联的表单元素
   */
  private findByLabelText(text: string): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const labels = document.querySelectorAll('label');
    
    labels.forEach(label => {
      if (label.textContent?.trim() === text) {
        // 通过for属性查找
        if (label.htmlFor) {
          const element = document.getElementById(label.htmlFor);
          if (element) {
            elements.push(element);
          }
        } else {
          // 查找label内的表单元素
          const formElement = label.querySelector('input, textarea, select');
          if (formElement) {
            elements.push(formElement as HTMLElement);
          }
        }
      }
    });
    
    return elements;
  }

  /**
   * 设置元素值
   */
  private setElementValue(element: HTMLElement, value: any): void {
    const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    // 跳过只读和禁用的元素
    if (this.isReadOnlyOrDisabled(input) || input.disabled) {
      return;
    }
    
    // 跳过密码字段
    if ((input as HTMLInputElement).type === 'password') {
      return;
    }
    
    // 跳过文件输入
    if ((input as HTMLInputElement).type === 'file') {
      return;
    }
    
    try {
      switch ((input as HTMLInputElement).type) {
        case 'checkbox':
          (input as HTMLInputElement).checked = value === 'true' || value === true;
          break;
          
        case 'radio':
          if (input.value === value) {
            (input as HTMLInputElement).checked = true;
          }
          break;
          
        case 'select-one':
        case 'select-multiple':
          const select = input as HTMLSelectElement;
          if (Array.isArray(value)) {
            // 多选
            Array.from(select.options).forEach(option => {
              option.selected = (value as any[]).includes(option.value);
            });
          } else {
            select.value = String(value);
          }
          break;
          
        default:
          input.value = String(value);
          break;
      }
      
      // 触发change事件以确保框架响应
      this.triggerChangeEvent(input);
      
      // 添加视觉反馈
      this.addVisualFeedback(input);
      
    } catch (error) {
      console.warn(`设置元素值失败:`, element, value, error);
    }
  }

  /**
   * 检查元素是否只读
   */
  private isReadOnlyOrDisabled(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
    if (input.tagName.toLowerCase() === 'select') {
      return false; // select元素没有readOnly属性
    }
    return (input as HTMLInputElement | HTMLTextAreaElement).readOnly;
  }

  /**
   * 触发change事件
   */
  private triggerChangeEvent(element: HTMLElement): void {
    const events = ['input', 'change', 'blur'];
    
    events.forEach(eventType => {
      const event = new Event(eventType, { bubbles: true });
      element.dispatchEvent(event);
    });
    
    // 对于React等框架，还需要触发更多事件
    if ((window as any).React) {
      const reactEvent = new Event('input', { bubbles: true });
      Object.defineProperty(reactEvent, 'target', {
        writable: false,
        value: element
      });
      element.dispatchEvent(reactEvent);
    }
  }

  /**
   * 添加视觉反馈
   */
  private addVisualFeedback(element: HTMLElement): void {
    const originalBorder = element.style.border;
    const originalBackground = element.style.backgroundColor;
    
    // 添加绿色边框和背景
    element.style.border = '2px solid #4CAF50';
    element.style.backgroundColor = '#f0f8f0';
    element.style.transition = 'all 0.3s ease';
    
    // 2秒后恢复原样
    setTimeout(() => {
      element.style.border = originalBorder;
      element.style.backgroundColor = originalBackground;
    }, 2000);
  }

  /**
   * 清空所有表单数据
   */
  clearAllForms(): void {
    const elements = document.querySelectorAll('input, textarea, select');
    
    elements.forEach(element => {
      const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      if (this.isReadOnlyOrDisabled(input) || input.disabled) {
        return;
      }
      
      switch ((input as HTMLInputElement).type) {
        case 'checkbox':
        case 'radio':
          (input as HTMLInputElement).checked = false;
          break;
        case 'select-one':
        case 'select-multiple':
          (input as HTMLSelectElement).selectedIndex = 0;
          break;
        case 'file':
          // 文件输入不能清空
          break;
        default:
          input.value = '';
          break;
      }
      
      this.triggerChangeEvent(input);
    });
  }
} 