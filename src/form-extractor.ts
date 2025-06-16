export class FormDataExtractor {
  
  /**
   * 提取页面中所有表单数据
   */
  extractAll(): Record<string, any> {
    const formData: Record<string, any> = {};
    
    // 提取所有input元素，但排除AIForm自己的元素
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((element) => {
      // 跳过AIForm自己的元素
      if (this.isAIFormElement(element)) {
        return;
      }
      
      const key = this.getElementKey(element);
      const value = this.getElementValue(element);
      
      if (key && value !== null && value !== '') {
        formData[key] = value;
      }
    });

    return formData;
  }

  /**
   * 检查元素是否属于AIForm
   */
  private isAIFormElement(element: Element): boolean {
    // 检查元素本身是否有aiform相关的类名
    if (element.className && element.className.includes('aiform-')) {
      return true;
    }
    
    // 检查元素是否在aiform模态框内
    let parent = element.parentElement;
    while (parent) {
      if (parent.id === 'aiform-modal' || 
          parent.id === 'aiform-button' ||
          (parent.className && parent.className.includes('aiform-'))) {
        return true;
      }
      parent = parent.parentElement;
    }
    
    return false;
  }

  /**
   * 从指定表单中提取数据
   */
  extractFromForm(form: HTMLFormElement): Record<string, any> {
    const formData: Record<string, any> = {};
    const formDataObject = new FormData(form);
    
    for (const [key, value] of formDataObject.entries()) {
      if (value instanceof File) {
        formData[key] = `[文件: ${value.name}]`;
      } else {
        formData[key] = value;
      }
    }

    return formData;
  }

  /**
   * 获取元素的键名
   */
  private getElementKey(element: Element): string {
    const input = element as HTMLInputElement;
    
    // 优先使用name属性
    if (input.name) {
      return input.name;
    }
    
    // 其次使用id属性
    if (input.id) {
      return input.id;
    }
    
    // 使用placeholder作为键名
    if (input.placeholder) {
      return input.placeholder;
    }
    
    // 查找关联的label
    const label = this.findAssociatedLabel(input);
    if (label) {
      return label.textContent?.trim() || '';
    }
    
    // 使用类名或其他属性
    if (input.className) {
      return input.className.split(' ')[0];
    }
    
    return '';
  }

  /**
   * 获取元素的值
   */
  private getElementValue(element: Element): string | null {
    const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    // 跳过密码字段
    if (input.type === 'password') {
      return null;
    }
    
    // 跳过隐藏字段
    if (input.type === 'hidden') {
      return null;
    }
    
    // 跳过文件输入
    if (input.type === 'file') {
      const fileInput = input as HTMLInputElement;
      return fileInput.files && fileInput.files.length > 0 
        ? `[文件: ${fileInput.files[0].name}]` 
        : null;
    }
    
    // 处理复选框
    if (input.type === 'checkbox') {
      return (input as HTMLInputElement).checked ? 'true' : 'false';
    }
    
    // 处理单选按钮
    if (input.type === 'radio') {
      return (input as HTMLInputElement).checked ? input.value : null;
    }
    
    return input.value || null;
  }

  /**
   * 查找关联的label
   */
  private findAssociatedLabel(input: HTMLInputElement): HTMLLabelElement | null {
    // 通过for属性查找
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement;
      if (label) return label;
    }
    
    // 查找父级label
    let parent = input.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === 'label') {
        return parent as HTMLLabelElement;
      }
      parent = parent.parentElement;
    }
    
    // 查找前一个兄弟元素中的label
    let sibling = input.previousElementSibling;
    while (sibling) {
      if (sibling.tagName.toLowerCase() === 'label') {
        return sibling as HTMLLabelElement;
      }
      sibling = sibling.previousElementSibling;
    }
    
    return null;
  }

  /**
   * 获取可见的表单元素（排除AIForm自己的元素）
   */
  getVisibleFormElements(): HTMLElement[] {
    const elements = Array.from(document.querySelectorAll('input, textarea, select')) as HTMLElement[];
    
    return elements.filter(element => {
      // 排除AIForm自己的元素
      if (this.isAIFormElement(element)) {
        return false;
      }
      
      const style = getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetParent !== null;
    });
  }
} 