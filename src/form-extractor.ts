import './types';

export interface FormFieldInfo {
  key: string;
  value: string | null;
  type: string;
  element: HTMLElement;
  options?: string[]; // 用于select、radio、checkbox的选项
  placeholder?: string;
  label?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

export class FormDataExtractor {
  
  /**
   * 提取页面中所有表单数据（简化版，保持向后兼容）
   */
  extractAll(): Record<string, any> {
    const formData: Record<string, any> = {};
    const detailedInfo = this.extractDetailedInfo();
    
    detailedInfo.forEach(field => {
      if (field.key && field.value !== null && field.value !== '') {
        formData[field.key] = field.value;
      }
    });

    return formData;
  }

  /**
   * 提取页面中所有表单的详细信息
   */
  extractDetailedInfo(): FormFieldInfo[] {
    const formFields: FormFieldInfo[] = [];
    
    // 提取所有input元素，但排除AIForm自己的元素
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach((element) => {
      // 跳过AIForm自己的元素
      if (this.isAIFormElement(element as HTMLElement)) {
        return;
      }
      
      const fieldInfo = this.getFieldInfo(element as HTMLElement);
      if (fieldInfo.key) {
        formFields.push(fieldInfo);
      }
    });

    return formFields;
  }

  /**
   * 获取表单字段的详细信息
   */
  private getFieldInfo(element: HTMLElement): FormFieldInfo {
    const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const key = this.getElementKey(element);
    const value = this.getElementValue(element);
    const type = this.getElementType(element);
    const options = this.getElementOptions(element);
    
    return {
      key,
      value,
      type,
      element,
      options,
      placeholder: (input as HTMLInputElement).placeholder || undefined,
      label: this.getElementLabel(element),
      required: (input as HTMLInputElement).required || false,
      readonly: this.isElementReadonly(element),
      disabled: input.disabled || false
    };
  }

  /**
   * 获取元素类型的友好显示名称
   */
  private getElementType(element: Element): string {
    const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'input') {
      const inputElement = input as HTMLInputElement;
      switch (inputElement.type) {
        case 'text': return '文本输入';
        case 'email': return '邮箱输入';
        case 'tel': return '电话输入';
        case 'number': return '数字输入';
        case 'password': return '密码输入';
        case 'url': return '网址输入';
        case 'date': return '日期选择';
        case 'time': return '时间选择';
        case 'datetime-local': return '日期时间';
        case 'checkbox': return '复选框';
        case 'radio': return '单选框';
        case 'file': return '文件上传';
        case 'hidden': return '隐藏字段';
        case 'submit': return '提交按钮';
        case 'button': return '按钮';
        default: return `输入框 (${inputElement.type})`;
      }
    } else if (tagName === 'textarea') {
      return '多行文本';
    } else if (tagName === 'select') {
      const selectElement = input as HTMLSelectElement;
      return selectElement.multiple ? '多选下拉' : '单选下拉';
    }
    
    return tagName;
  }

  /**
   * 获取元素的选项（用于select、radio、checkbox）
   */
  private getElementOptions(element: Element): string[] | undefined {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'select') {
      const selectElement = element as HTMLSelectElement;
      return Array.from(selectElement.options).map(option => option.text);
    } else if (tagName === 'input') {
      const inputElement = element as HTMLInputElement;
      
      if (inputElement.type === 'radio') {
        // 查找同名的所有radio按钮
        const radioGroup = document.querySelectorAll(`input[name="${inputElement.name}"][type="radio"]`);
        return Array.from(radioGroup).map(radio => (radio as HTMLInputElement).value);
      } else if (inputElement.type === 'checkbox') {
        // 对于checkbox，返回当前值
        return [inputElement.value];
      }
    }
    
    return undefined;
  }

  /**
   * 获取元素的标签文本
   */
  private getElementLabel(element: Element): string | undefined {
    const label = this.findAssociatedLabel(element as HTMLInputElement);
    return label?.textContent?.trim() || undefined;
  }

  /**
   * 检查元素是否只读
   */
  private isElementReadonly(element: Element): boolean {
    const input = element as HTMLInputElement | HTMLTextAreaElement;
    if (element.tagName.toLowerCase() === 'select') {
      return false; // select元素没有readOnly属性
    }
    return input.readOnly || false;
  }

  /**
   * 检查元素是否属于AIForm的UI组件
   */
  public isAIFormElement(element: HTMLElement): boolean {
    // 检查元素本身或其父元素是否有aiform相关的类名
    let current: HTMLElement | null = element;
    while (current) {
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ');
        if (classes.some(cls => cls.startsWith('aiform-'))) {
          return true;
        }
      }
      
      // 检查ID
      if (current.id && current.id.startsWith('aiform-')) {
        return true;
      }
      
      current = current.parentElement;
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