# AIForm 项目概览

## 📋 项目信息

- **项目名称**: AIForm
- **版本**: 1.0.0
- **语言**: TypeScript
- **构建工具**: Rollup
- **目标**: 智能表单填写工具，使用AI自动重写表单内容

## 🏗️ 项目结构

```
aiform/
├── src/                    # 源代码目录
│   ├── index.ts           # 主入口文件
│   ├── form-extractor.ts  # 表单数据提取器
│   ├── ai-service.ts      # AI服务调用
│   ├── ui-controller.ts   # UI控制器
│   ├── form-filler.ts     # 表单数据填充器
│   └── styles.ts          # CSS样式
├── dist/                   # 构建输出目录
│   ├── aiform.js          # UMD格式的构建文件
│   ├── aiform.esm.js      # ES Module格式的构建文件
│   └── *.d.ts             # TypeScript声明文件
├── example/               # 示例页面
│   └── index.html         # 完整的示例页面
├── test.html              # 简单测试页面
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── rollup.config.js       # Rollup构建配置
├── start.sh               # 启动脚本
└── README.md              # 项目文档
```

## ✨ 核心功能

### 1. 表单数据提取 (FormDataExtractor)
- 自动识别页面中的表单元素
- 智能提取字段名称和值
- 支持多种元素类型：input, textarea, select
- 通过多种方式识别字段：name, id, placeholder, label

### 2. AI服务集成 (AIService)
- 支持多个AI提供商：
  - OpenAI (GPT-3.5, GPT-4)
  - OpenRouter (多模型支持)
  - DeepSeek (深度求索)
- 可配置的API端点和参数
- 智能响应解析

### 3. UI控制器 (UIController)
- 现代化的用户界面
- 响应式设计
- 浮动按钮和模态框
- 配置面板和数据预览
- 支持多种按钮位置

### 4. 表单填充器 (FormFiller)
- 智能字段匹配
- 支持各种表单元素类型
- 视觉反馈效果
- 框架兼容性（React, Vue等）

## 🎯 使用方式

### 1. 通过script标签引入
```html
<script src="dist/aiform.js"></script>
```

### 2. ES Module导入
```javascript
import AIForm from './dist/aiform.esm.js';
```

### 3. NPM安装（待发布）
```bash
npm install aiform
```

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式（监听文件变化）
npm run dev

# 启动本地服务器
npm run start

# 构建并启动服务器
npm run serve

# 或者使用启动脚本
./start.sh
```

## 🧪 测试

1. 构建项目：`npm run build`
2. 启动服务器：`npm run start`
3. 访问测试页面：`http://localhost:8000/test.html`
4. 访问示例页面：`http://localhost:8000/example/index.html`

## 📝 配置选项

```javascript
const config = {
    apiKey: 'your-api-key',
    provider: 'openai', // 'openai' | 'openrouter' | 'deepseek'
    model: 'gpt-3.5-turbo',
    apiUrl: 'custom-api-url', // 可选
    prompt: '自定义提示词',
    position: 'bottom-right' // 按钮位置
};
```

## 🚀 部署

1. 复制 `dist/aiform.js` 到你的项目
2. 在HTML中引入：`<script src="path/to/aiform.js"></script>`
3. 页面会自动显示AI表单按钮

## 📱 兼容性

- ✅ 现代浏览器（Chrome, Firefox, Safari, Edge）
- ✅ 移动端浏览器
- ✅ React, Vue, Angular等框架
- ✅ 响应式设计

## 🔒 安全注意事项

- 不要在前端硬编码API密钥
- 建议通过环境变量或服务端代理管理API密钥
- 使用HTTPS确保数据传输安全

## 🎨 界面特色

- 现代化的渐变色设计
- 流畅的动画效果
- 美观的模态框
- 清晰的状态反馈
- 响应式布局

## 📄 文件说明

- `src/index.ts`: 主入口，导出AIForm类
- `src/form-extractor.ts`: 表单数据提取逻辑
- `src/ai-service.ts`: AI API调用和响应处理
- `src/ui-controller.ts`: 用户界面管理
- `src/form-filler.ts`: 表单数据填充逻辑
- `src/styles.ts`: 所有CSS样式定义
- `dist/aiform.js`: UMD格式构建文件（用于script标签）
- `dist/aiform.esm.js`: ES Module格式构建文件（用于import）

## 🎉 特别说明

这个项目是一个完整的、可立即使用的JavaScript库，具有以下特点：

1. **开箱即用**: 只需引入一个JS文件即可工作
2. **零依赖**: 不依赖任何第三方库
3. **TypeScript**: 完整的类型支持
4. **现代化**: 使用最新的Web API和ES特性
5. **兼容性**: 支持主流浏览器和框架
6. **可扩展**: 易于定制和扩展功能

该项目已经可以在生产环境中使用，只需要用户提供自己的AI API密钥即可。 