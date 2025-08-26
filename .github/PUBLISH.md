# GitHub Actions 自动发布设置

## 📝 概述
这个工作流会在你推送 `v*` 格式的标签时自动发布到 NPM。

## 🔧 设置步骤

### 1. 设置 NPM Token
你需要在 GitHub 仓库中设置 NPM Token 作为密钥：

1. **获取 NPM Token**:
   ```bash
   # 登录 NPM
   npm login
   
   # 创建 automation token
   npm token create --type=automation
   ```
   
2. **添加到 GitHub Secrets**:
   - 访问你的仓库: https://github.com/lihongjie0209/docx-mcp
   - 点击 `Settings` → `Secrets and variables` → `Actions`
   - 点击 `New repository secret`
   - Name: `NPM_TOKEN`
   - Value: 粘贴从 NPM 获取的 token
   - 点击 `Add secret`

### 2. 使用方法

创建并推送标签来触发自动发布：

```bash
# 创建新版本标签
git tag v0.2.0

# 推送标签到 GitHub
git push origin v0.2.0
```

或者一次性创建并推送：
```bash
git tag v0.2.0 && git push origin v0.2.0
```

### 3. 支持的标签格式

- ✅ `v1.0.0` - 正式版本
- ✅ `v1.0.0-beta.1` - 预发布版本  
- ✅ `v1.0.0-alpha.1` - Alpha 版本
- ✅ `v1.0.0-rc.1` - Release Candidate

### 4. 工作流程

1. **验证阶段** (`validate` job):
   - 验证标签格式
   - 提取版本号
   - 安装依赖
   - 类型检查
   - 构建项目
   - 验证构建产物

2. **发布阶段** (`publish` job):
   - 重新构建项目
   - 更新 package.json 版本
   - 执行 dry-run 测试
   - 发布到 NPM
   - 验证发布成功
   - 创建 GitHub Release

### 5. 自动生成的内容

- 📦 NPM 包会自动发布
- 🏷️ GitHub Release 会自动创建
- 📋 Release notes 包含安装说明
- 🔗 自动链接到 NPM 包页面

### 6. 错误处理

如果发布失败，检查：
- NPM_TOKEN 是否正确设置
- 标签格式是否正确（必须是 v*）
- 版本号是否已存在于 NPM
- 构建是否成功

### 7. 本地测试

发布前可以本地测试：
```bash
# 构建
npm run build

# 检查
npm run check

# 模拟发布（不会真正发布）
npm publish --dry-run --access public
```

## 🚀 示例发布流程

```bash
# 1. 完成开发并提交代码
git add .
git commit -m "feat: add new feature"
git push

# 2. 创建并推送标签
git tag v0.2.0
git push origin v0.2.0

# 3. GitHub Actions 会自动：
#    - 验证代码
#    - 构建项目
#    - 发布到 NPM
#    - 创建 GitHub Release
```

## 📊 监控发布

- 查看 GitHub Actions: https://github.com/lihongjie0209/docx-mcp/actions
- 查看 NPM 包: https://www.npmjs.com/package/@docx-mcp/docx-mcp
- 查看 GitHub Releases: https://github.com/lihongjie0209/docx-mcp/releases
