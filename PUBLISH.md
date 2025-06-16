# AIForm 发布指南

## 📦 发布到 NPM

### 1. 准备工作

确保您已经：
- 注册了 NPM 账户
- 本地已登录 NPM 账户
- 项目已经构建完成

```bash
# 检查是否已登录NPM
npm whoami

# 如果未登录，请先登录
npm login
```

### 2. 构建项目

```bash
# 构建项目
npm run build

# 检查构建结果
ls -la dist/
```

### 3. 版本管理

```bash
# 补丁版本（1.0.0 -> 1.0.1）
npm run version:patch

# 小版本（1.0.0 -> 1.1.0）
npm run version:minor

# 大版本（1.0.0 -> 2.0.0）
npm run version:major
```

### 4. 发布到 NPM

```bash
# 发布正式版本
npm run publish:npm

# 或发布测试版本
npm run publish:beta
```

## 🏠 本地测试

### 方法1：npm link

```bash
# 在 AIForm 项目根目录
npm link

# 在测试项目中
npm link aiform
```

### 方法2：本地安装

```bash
# 在测试项目中直接安装本地包
npm install /path/to/aiform
```

### 方法3：使用 npm pack

```bash
# 在 AIForm 项目根目录打包
npm pack

# 会生成 aiform-1.0.0.tgz 文件
# 在测试项目中安装
npm install /path/to/aiform-1.0.0.tgz
```

## 🧪 测试项目设置

### 创建测试项目

```bash
mkdir test-aiform
cd test-aiform
npm init -y
```

### 安装和使用

```bash
# 安装 AIForm
npm install aiform

# 或本地安装
npm install /path/to/aiform
```

### 创建测试页面

```html
<!DOCTYPE html>
<html>
<head>
    <title>AIForm 测试</title>
</head>
<body>
    <form>
        <input type="text" name="name" placeholder="姓名">
        <input type="email" name="email" placeholder="邮箱">
        <textarea name="bio" placeholder="个人介绍"></textarea>
    </form>

    <script type="module">
        import AIForm from './node_modules/aiform/dist/aiform.esm.js';
        
        const aiform = new AIForm({
            apiKey: 'your-api-key',
            provider: 'openai',
            enableHistory: true
        });
        
        console.log('AIForm 初始化成功');
    </script>
</body>
</html>
```

### React 项目测试

```jsx
// App.js
import React, { useEffect } from 'react';
import AIForm from 'aiform';

function App() {
  useEffect(() => {
    const aiform = new AIForm({
      apiKey: 'your-api-key',
      provider: 'openai',
      enableHistory: true
    });

    return () => {
      aiform.destroy();
    };
  }, []);

  return (
    <div>
      <h1>AIForm 测试</h1>
      <form>
        <input type="text" name="name" placeholder="姓名" />
        <input type="email" name="email" placeholder="邮箱" />
        <textarea name="bio" placeholder="个人介绍"></textarea>
      </form>
    </div>
  );
}

export default App;
```

## 🔍 发布前检查清单

- [ ] 代码已经构建完成
- [ ] 所有功能测试通过
- [ ] README.md 文档完整
- [ ] package.json 配置正确
- [ ] 版本号已更新
- [ ] LICENSE 文件存在
- [ ] .npmignore 配置正确
- [ ] TypeScript 类型定义文件存在

## 📈 发布后验证

### 检查包信息

```bash
# 查看包信息
npm info aiform

# 查看包内容
npm pack --dry-run
```

### 在新项目中测试

```bash
# 创建新的测试项目
mkdir fresh-test
cd fresh-test
npm init -y

# 安装已发布的包
npm install aiform

# 测试导入
node -e "const AIForm = require('aiform'); console.log('导入成功');"
```

## 🚀 CI/CD 自动化发布

### GitHub Actions 示例

```yaml
# .github/workflows/publish.yml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📋 常见问题

### Q: 发布失败怎么办？
A: 检查包名是否已被占用，版本号是否重复，登录状态是否有效。

### Q: 如何撤销发布？
A: 发布后72小时内可以使用 `npm unpublish` 撤销。

### Q: 如何更新包？
A: 更新版本号并重新发布即可。

### Q: 如何处理作用域包？
A: 使用 `@your-scope/aiform` 格式的包名。

## 🔗 相关链接

- [NPM 官方文档](https://docs.npmjs.com/)
- [语义化版本](https://semver.org/)
- [包发布最佳实践](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry) 