# AIForm - 智能表单填写工具

AIForm 是一个基于人工智能的表单自动填写工具，能够智能分析网页中的表单数据，使用大模型（OpenAI、OpenRouter、DeepSeek）对内容进行重写优化，并自动填回表单中。

## ✨ 特性

- 🚀 **开箱即用** - 只需引入脚本即可自动工作
- 🎯 **智能识别** - 自动识别页面中的所有表单元素
- 🤖 **AI 驱动** - 支持多种AI提供商（OpenAI、OpenRouter、DeepSeek）
- 💫 **美观界面** - 现代化的UI设计，响应式布局
- 🔧 **高度可配置** - 支持自定义提示词、API配置等
- 📱 **框架兼容** - 兼容Vue、React等主流框架
- 🎨 **视觉反馈** - 填入数据时提供视觉反馈效果
- 📋 **表单历史记录** - 自动保存表单输入历史，支持一键恢复

## 🚀 快速开始

### 1. 安装

```bash
npm install @albertlighter/aiform
```

#### 通过 CDN 引入
```html
<script src="https://unpkg.com/aiform@latest/dist/aiform.js"></script>
```

#### 下载文件
下载 `dist/aiform.js` 文件并在HTML中引入。

### 2. 基本使用

#### HTML 中直接使用
```html
<!DOCTYPE html>
<html>
<head>
    <title>我的网页</title>
</head>
<body>
    <!-- 你的表单 -->
    <form>
        <input type="text" name="name" placeholder="姓名">
        <input type="email" name="email" placeholder="邮箱">
        <textarea name="description" placeholder="描述"></textarea>
    </form>

    <!-- 引入 AIForm -->
    <script src="path/to/aiform.js"></script>
</body>
</html>
```

#### JavaScript 模块使用
```javascript
import AIForm from '@albertlighter/aiform';

// 创建实例
const aiform = new AIForm({
    apiKey: 'your-api-key',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    enableHistory: true
});
```

#### React 中使用
```jsx
import React, { useEffect } from 'react';
import AIForm from '@albertlighter/aiform';

function App() {
    useEffect(() => {
        const aiform = new AIForm({
            apiKey: process.env.REACT_APP_OPENAI_API_KEY,
            provider: 'openai',
            enableHistory: true
        });

        return () => aiform.destroy();
    }, []);

    return (
        <div>
            <form>
                <input name="name" placeholder="姓名" />
                <input name="email" placeholder="邮箱" />
            </form>
        </div>
    );
}
```

#### Vue 中使用
```vue
<template>
    <div>
        <form>
            <input v-model="form.name" name="name" placeholder="姓名">
            <input v-model="form.email" name="email" placeholder="邮箱">
        </form>
    </div>
</template>

<script>
import AIForm from '@albertlighter/aiform';

export default {
    data() {
        return {
            form: {
                name: '',
                email: ''
            },
            aiform: null
        };
    },
    mounted() {
        this.aiform = new AIForm({
            apiKey: process.env.VUE_APP_OPENAI_API_KEY,
            provider: 'openai',
            enableHistory: true
        });
    },
    beforeDestroy() {
        if (this.aiform) {
            this.aiform.destroy();
        }
    }
};
</script>
```

### 3. 历史记录功能

```javascript
// 手动保存表单数据
aiform.saveCurrentFormData();

// 恢复最新的表单数据
aiform.restoreLatestFormData();

// 获取历史管理器进行高级操作
const historyManager = aiform.getHistoryManager();
const history = historyManager.getCurrentPageHistory();
```

## 📋 历史记录功能详解

### 自动保存机制

- **智能防抖** - 输入停止1秒后自动保存，避免频繁操作
- **数据过滤** - 只保存非空字段，节省存储空间
- **去重处理** - 相同数据不会重复保存

### 历史记录管理

- **按页面分类** - 不同页面的表单数据分别存储
- **时间排序** - 按时间顺序展示历史记录
- **批量操作** - 支持清空当前页面或全部历史记录
- **存储统计** - 显示存储使用情况和记录数量

### 智能恢复

- **自动提示** - 页面加载时检测历史数据并提示恢复
- **一键恢复** - 支持恢复最新数据或指定历史记录
- **选择性恢复** - 在表单数据界面选择需要恢复的字段

## ⚙️ 配置选项

```javascript
const config = {
    // API 密钥
    apiKey: 'your-api-key',
    
    // AI 提供商: 'openai' | 'openrouter' | 'deepseek'
    provider: 'openai',
    
    // 模型名称
    model: 'gpt-3.5-turbo',
    
    // 自定义 API 地址（可选）
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    
    // 自定义提示词
    prompt: '请重写以下表单数据，使其更加专业和完整：',
    
    // 按钮位置: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    position: 'bottom-right',
    
    // 历史记录配置
    enableHistory: true
};

const aiform = new AIForm(config);
```

### 全局配置（通过 script 标签引入时）

```html
<script>
    // 在引入 AIForm 之前设置全局配置
    window.AIFORM_CONFIG = {
        position: 'bottom-left',
        prompt: '自定义提示词...',
        enableHistory: true
    };
    
    // 设置为 false 可禁用自动初始化
    // window.AIFORM_CONFIG = false;
</script>
<script src="path/to/aiform.js"></script>
```

## 🤖 支持的 AI 提供商

### OpenAI
```javascript
new AIForm({
    provider: 'openai',
    apiKey: 'sk-...',
    model: 'gpt-3.5-turbo', // 或 'gpt-4'
    apiUrl: 'https://api.openai.com/v1/chat/completions', // 可选
    enableHistory: true
});
```

### OpenRouter
```javascript
new AIForm({
    provider: 'openrouter',
    apiKey: 'sk-or-...',
    model: 'openai/gpt-3.5-turbo', // 或其他支持的模型
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions', // 可选
    enableHistory: true
});
```

### DeepSeek
```javascript
new AIForm({
    provider: 'deepseek',
    apiKey: 'sk-...',
    model: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions', // 可选
    enableHistory: true
});
```

## 📚 API 参考

### AIForm 类

#### 构造函数
```javascript
new AIForm(config?: AIFormConfig)
```

#### 方法

##### `extractFormData(): Record<string, any>`
提取当前页面的所有表单数据。

```javascript
const formData = aiform.extractFormData();
console.log(formData);
```

##### `rewriteData(data: Record<string, any>): Promise<Record<string, any>>`
使用 AI 重写指定的数据。

```javascript
const originalData = { name: '张三', email: 'test@example.com' };
const rewrittenData = await aiform.rewriteData(originalData);
```

##### `fillFormData(data: Record<string, any>): void`
将数据填入页面表单。

```javascript
const data = { name: '李四', email: 'lisi@example.com' };
aiform.fillFormData(data);
```

##### `updateConfig(config: Partial<AIFormConfig>): void`
更新配置。

```javascript
aiform.updateConfig({
    apiKey: 'new-api-key',
    model: 'gpt-4'
});
```

##### `destroy(): void`
销毁实例，清理 DOM 元素。

```javascript
aiform.destroy();
```

### 配置接口

```typescript
interface AIFormConfig {
    apiKey?: string;
    provider?: 'openai' | 'openrouter' | 'deepseek';
    model?: string;
    apiUrl?: string;
    prompt?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    enableHistory?: boolean;
}
```

## 🎯 使用场景

- **表单测试** - 快速生成测试数据
- **内容优化** - 让AI帮助改善表单内容质量
- **数据标准化** - 统一表单数据格式
- **效率提升** - 减少重复的表单填写工作
- **内容创作** - 基于现有内容生成更好的文案

## 🔍 工作原理

1. **表单识别** - 自动扫描页面中的 `input`、`textarea`、`select` 元素
2. **数据提取** - 智能提取表单字段的键名和值
3. **AI 处理** - 将数据发送给 AI 模型进行重写
4. **智能填充** - 将重写后的数据自动填回对应的表单字段
5. **视觉反馈** - 提供视觉效果确认填充成功

## 🛠️ 开发构建

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 📝 更新日志

### v1.0.0
- 🎉 首次发布
- ✨ 支持 OpenAI、OpenRouter、DeepSeek
- 🎨 现代化 UI 设计
- 📱 响应式布局
- 🔧 高度可配置

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 常见问题

### Q: 如何获取 API 密钥？
- **OpenAI**: 访问 [OpenAI API](https://platform.openai.com/api-keys)
- **OpenRouter**: 访问 [OpenRouter](https://openrouter.ai/keys)  
- **DeepSeek**: 访问 [DeepSeek API](https://platform.deepseek.com/)

### Q: 支持哪些表单元素？
A: 支持所有标准 HTML 表单元素：`input`（各种类型）、`textarea`、`select`。

### Q: 如何自定义提示词？
A: 通过配置 `prompt` 选项来自定义 AI 的重写指令。

### Q: 是否支持文件上传字段？
A: 文件上传字段会被跳过，不会进行处理。

### Q: 如何在生产环境中使用？
A: 确保 API 密钥安全，建议通过环境变量或服务端代理来管理。

## 🌟 功能特色

- **智能表单提取** - 自动识别页面中的表单字段
- **AI驱动重写** - 使用大语言模型优化表单数据
- **多AI平台支持** - 支持OpenAI、OpenRouter、DeepSeek等
- **可视化界面** - 直观的字段选择和配置界面

## 🌐 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📦 示例页面

- `examples/basic.html` - 基本功能演示
- `examples/advanced.html` - 高级功能演示
- `examples/history-demo.html` - 历史记录功能演示

## 🎯 历史记录API

### FormHistoryManager

```javascript
const historyManager = aiform.getHistoryManager();

// 获取历史记录
historyManager.getAllHistory(); // 获取所有历史记录
historyManager.getCurrentPageHistory(); // 获取当前页面历史记录
historyManager.getLatestFormData(); // 获取最新表单数据

// 保存和删除
historyManager.saveFormData(data); // 手动保存数据
historyManager.deleteHistoryEntry(id); // 删除指定记录
historyManager.clearCurrentPageHistory(); // 清空当前页面历史
historyManager.clearAllHistory(); // 清空所有历史

// 实用功能
historyManager.formatTimestamp(timestamp); // 格式化时间
historyManager.getStorageInfo(); // 获取存储信息
```

## 🔄 自动保存配置

```javascript
// 历史记录会在以下情况自动保存：
// 1. 表单字段输入变化（防抖1秒）
// 2. AI重写完成后
// 3. 手动调用保存方法

// 自动保存的数据特点：
// - 只保存非空字段
// - 过滤掉相同的数据
// - 按页面URL分类存储
// - 自动清理30天前的数据
```

## 📞 联系

如有问题或建议，请提交 Issue 或联系开发者。 