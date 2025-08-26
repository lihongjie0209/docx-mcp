# docx-mcp v0.4.0 Release Notes
## 📄 Document Structure Release

**发布日期**: 2025年8月

### ✨ 主要新功能

#### 📄 页眉页脚系统
v0.4.0的核心功能是完整的页眉页脚系统，为专业文档生成提供了强大的支持。

**核心特性**:
- **多级页眉页脚**: 支持默认、首页、奇偶页不同的页眉页脚设置
- **丰富内容元素**: 文本、页码、日期、文档标题、图片等多种内容类型
- **灵活样式控制**: 字体、颜色、大小、对齐方式等全面的样式选项
- **动态内容更新**: 页码和日期自动更新，确保文档信息准确性

#### 🎯 支持的页眉页脚类型

1. **默认页眉页脚 (default)**
   - 应用于大多数页面的标准格式
   - 适合公司标识、文档标题等固定内容

2. **首页特殊设置 (first)**
   - 首页独有的页眉页脚样式
   - 适合封面页、标题页的特殊设计

3. **奇偶页不同 (even)**
   - 偶数页的特殊页眉页脚
   - 支持书籍式的专业排版布局

#### 🔧 页眉页脚元素类型

| 元素类型 | 功能描述 | 配置选项 |
|---------|----------|----------|
| `text` | 静态文本内容 | 字体、大小、颜色、粗体、斜体、下划线 |
| `pageNumber` | 自动页码 | 数字、大写/小写罗马数字、大写/小写字母 |
| `currentDate` | 当前日期 | 自定义日期格式、样式选项 |
| `documentTitle` | 文档标题 | 从文档元数据自动获取 |
| `image` | 图片内容 | base64、文件路径、URL，支持尺寸控制 |

### 📝 使用示例

#### 基础页眉页脚配置
```json
{
  "headers": {
    "default": {
      "alignment": "center",
      "children": [
        {
          "type": "text",
          "text": "公司机密文档",
          "bold": true,
          "size": 14,
          "color": "#1f4788"
        }
      ]
    }
  },
  "footers": {
    "default": {
      "alignment": "center",
      "children": [
        {
          "type": "text",
          "text": "第 "
        },
        {
          "type": "pageNumber",
          "format": "decimal"
        },
        {
          "type": "text",
          "text": " 页"
        }
      ]
    }
  }
}
```

#### 复杂页眉页脚配置
```json
{
  "headers": {
    "default": {
      "alignment": "left",
      "children": [
        {
          "type": "documentTitle",
          "bold": true,
          "size": 12,
          "color": "#1f4788"
        },
        {
          "type": "text",
          "text": " | 技术规范文档",
          "size": 12,
          "italics": true,
          "color": "#666666"
        }
      ]
    },
    "first": {
      "alignment": "center",
      "children": [
        {
          "type": "text",
          "text": "机密文档 - 请勿外传",
          "bold": true,
          "size": 16,
          "color": "#cc0000"
        }
      ]
    },
    "even": {
      "alignment": "right",
      "children": [
        {
          "type": "currentDate",
          "format": "yyyy/MM/dd",
          "size": 10,
          "color": "#666666"
        },
        {
          "type": "text",
          "text": " | 第 ",
          "size": 10
        },
        {
          "type": "pageNumber",
          "format": "decimal"
        },
        {
          "type": "text",
          "text": " 页",
          "size": 10
        }
      ]
    }
  },
  "footers": {
    "default": {
      "alignment": "center",
      "children": [
        {
          "type": "text",
          "text": "© 2024 公司名称 - ",
          "size": 9,
          "color": "#333333"
        },
        {
          "type": "documentTitle",
          "size": 9,
          "color": "#333333"
        }
      ]
    },
    "first": {
      "alignment": "center",
      "children": [
        {
          "type": "text",
          "text": "生成时间: ",
          "size": 8,
          "color": "#666666"
        },
        {
          "type": "currentDate",
          "format": "yyyy年MM月dd日",
          "size": 8,
          "color": "#666666"
        }
      ]
    }
  }
}
```

### 🛠 技术实现

#### 架构改进
- **Schema 扩展**: 新增 HeaderFooterContent、HeaderFooterElement 等类型定义
- **TypeScript 增强**: 完整的页眉页脚类型定义和编译时检查
- **docx 库集成**: 基于 docx.js 的 Header 和 Footer 功能
- **动态内容处理**: 页码、日期等动态元素的自动更新机制

#### API 扩展
- `createHeader()`: 创建页眉内容
- `createFooter()`: 创建页脚内容
- `createHeaderFooterElements()`: 处理页眉页脚元素
- `getAlignment()`: 对齐方式转换
- `formatDate()`: 日期格式化

### 📈 应用场景

#### 企业文档
- 公司标识和标题在页眉
- 页码和版权信息在页脚
- 机密标识和日期戳

#### 学术论文
- 论文标题和章节在页眉
- 页码和作者信息在页脚
- 首页特殊格式

#### 技术文档
- 文档标题和版本在页眉
- 页码和更新日期在页脚
- 奇偶页不同布局

#### 法律文件
- 案件标题和编号在页眉
- 页码和机密标记在页脚
- 严格的格式要求

### 🔄 迁移指南

v0.4.0 完全向后兼容 v0.3.0，现有文档无需修改。页眉页脚为可选功能：

```json
{
  "meta": { ... },
  "pageSettings": { ... },
  // 新增可选的页眉页脚配置
  "headers": { ... },
  "footers": { ... },
  "content": [ ... ]
}
```

### 🐛 修复的问题

- 改进了页面边距的处理逻辑
- 优化了文档元数据的引用机制
- 修复了日期格式化的本地化问题
- 增强了错误处理和验证

### 📊 性能优化

- 优化了页眉页脚的渲染性能
- 改进了大型文档的内存使用
- 加快了包含页眉页脚的文档生成速度
- 减少了重复元素的处理开销

### 🔮 下一版本预告

v0.5.0 计划功能：
- 目录系统 (Table of Contents)
- 交叉引用 (Cross References)
- 书签功能 (Bookmarks)
- 文档大纲 (Document Outline)

---

### 💡 获取帮助

- **文档**: 查看更新的 README.md 获取完整使用指南
- **示例**: 参考 `demo/test-v040-*.js` 了解页眉页脚功能的使用方法
- **问题反馈**: 通过 GitHub Issues 报告问题或提出建议

### 🎉 致谢

感谢所有用户的反馈和建议！v0.4.0 的页眉页脚系统为专业文档生成提供了强大的支持，让 docx-mcp 更加接近企业级文档处理工具的标准。
