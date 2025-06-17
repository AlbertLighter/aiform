// AIForm Browser Extension Content Script
import { AIForm } from '../index';

// 确保在DOM加载完成后执行
function initAIForm() {
  try {
    // 创建 AIForm 实例
    const aiForm = new AIForm({
      apiKey: '', // 将通过扩展的设置获取
      apiUrl: '',
      provider: 'openai'
    });

    // 监听表单变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // 检查是否是表单元素
              if (element.tagName === 'FORM' || element.querySelector('form')) {
                console.log('检测到新的表单，初始化AIForm功能');
                // 这里可以添加表单处理逻辑
              }
            }
          });
        }
      });
    });

    // 开始观察DOM变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 为现有表单添加功能
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      console.log('为现有表单添加AIForm功能', form);
      // 这里可以添加表单处理逻辑
    });

    console.log('AIForm浏览器扩展内容脚本已加载');
  } catch (error) {
    console.error('AIForm扩展初始化失败:', error);
  }
}

// 当DOM准备就绪时初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAIForm);
} else {
  initAIForm();
} 