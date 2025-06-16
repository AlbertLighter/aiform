// ES模块导入示例
import AIForm from 'aiform';

// 或者 CommonJS 导入
// const AIForm = require('aiform');

// 基础使用
const aiform = new AIForm({
  apiKey: 'your-openai-api-key',
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  enableHistory: true
});

// 高级配置
const advancedAIForm = new AIForm({
  // OpenAI 配置
  apiKey: 'sk-...',
  provider: 'openai',
  model: 'gpt-4',
  
  // 或 OpenRouter 配置
  // apiKey: 'sk-or-...',
  // provider: 'openrouter',
  // model: 'openai/gpt-3.5-turbo',
  // apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  
  // 或 DeepSeek 配置
  // apiKey: 'sk-...',
  // provider: 'deepseek',
  // model: 'deepseek-chat',
  // apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  
  // UI配置
  position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  
  // 历史记录配置
  enableHistory: true,
  
  // 自定义提示词
  prompt: '请将以下表单数据重写得更加专业和完整，保持JSON格式：'
});

// 手动操作示例
async function manualUsage() {
  // 提取表单数据
  const formData = aiform.extractFormData();
  console.log('提取的表单数据:', formData);
  
  // 使用AI重写数据
  try {
    const rewrittenData = await aiform.rewriteData(formData);
    console.log('重写后的数据:', rewrittenData);
    
    // 填充表单
    aiform.fillFormData(rewrittenData);
  } catch (error) {
    console.error('AI重写失败:', error);
  }
  
  // 历史记录操作
  aiform.saveCurrentFormData(); // 保存当前数据
  aiform.restoreLatestFormData(); // 恢复最新数据
  
  // 获取历史管理器
  const historyManager = aiform.getHistoryManager();
  const currentPageHistory = historyManager.getCurrentPageHistory();
  console.log('当前页面历史记录:', currentPageHistory);
}

// React Hook 示例
function useAIForm(config = {}) {
  const [aiform, setAIForm] = useState(null);
  
  useEffect(() => {
    const instance = new AIForm({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      provider: 'openai',
      enableHistory: true,
      ...config
    });
    
    setAIForm(instance);
    
    return () => {
      instance.destroy();
    };
  }, []);
  
  return aiform;
}

// Vue Composition API 示例
function useAIForm(config = {}) {
  const aiform = ref(null);
  
  onMounted(() => {
    aiform.value = new AIForm({
      apiKey: process.env.VUE_APP_OPENAI_API_KEY,
      provider: 'openai',
      enableHistory: true,
      ...config
    });
  });
  
  onUnmounted(() => {
    if (aiform.value) {
      aiform.value.destroy();
    }
  });
  
  return aiform;
}

// 导出给其他模块使用
export { manualUsage };
export default aiform; 