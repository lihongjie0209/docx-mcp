# DOCX-MCP v0.5.0 脚注功能

## 概述

v0.5.0 版本为 DOCX-MCP 引入了强大的脚注系统，支持学术写作、专业文档和技术文档中的引用需求。

## 新增功能

### 脚注系统
- ✅ 支持自定义脚注ID（数字或字符串）
- ✅ 脚注内容支持多段落
- ✅ 支持富文本格式（粗体、斜体、下划线等）
- ✅ 支持超链接
- ✅ 支持表格
- ✅ 支持代码块
- ✅ 支持列表
- ✅ 基于 docx 库原生 API，确保完美兼容性

### JSON Schema 结构

```json
{
  "footnotes": {
    "footnote-id": {
      "children": [
        {
          "type": "paragraph",
          "children": [...]
        }
      ]
    }
  },
  "content": [
    {
      "type": "paragraph", 
      "children": [
        {
          "type": "text",
          "text": "正文内容"
        },
        {
          "type": "footnoteReference",
          "footnoteId": "footnote-id"
        }
      ]
    }
  ]
}
```

## 使用示例

### 基本脚注

```json
{
  "meta": {
    "title": "脚注示例文档"
  },
  "footnotes": {
    "1": {
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "这是一个简单的脚注。"
            }
          ]
        }
      ]
    }
  },
  "content": [
    {
      "type": "paragraph",
      "children": [
        {
          "type": "text",
          "text": "这里有一个脚注引用"
        },
        {
          "type": "footnoteReference",
          "footnoteId": "1"
        },
        {
          "type": "text",
          "text": "。"
        }
      ]
    }
  ]
}
```

### 学术引用脚注

```json
{
  "footnotes": {
    "smith2023": {
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Smith, J. (2023). "
            },
            {
              "type": "text",
              "text": "现代文档处理技术",
              "italics": true
            },
            {
              "type": "text",
              "text": ". 学术出版社, 第123页."
            }
          ]
        }
      ]
    }
  }
}
```

### 多段落脚注

```json
{
  "footnotes": {
    "detailed": {
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "这是脚注的第一段。"
            }
          ]
        },
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "这是脚注的第二段，提供更多详细信息。"
            }
          ]
        }
      ]
    }
  }
}
```

### 包含超链接的脚注

```json
{
  "footnotes": {
    "web-ref": {
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "更多信息请参见: "
            },
            {
              "type": "hyperlink",
              "url": "https://example.com",
              "children": [
                {
                  "type": "text",
                  "text": "https://example.com"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

## 技术实现

### 核心技术栈
- **docx 库 v8.5.0**: 使用原生 `FootnoteReferenceRun` 和 `Document.footnotes` API
- **JSON Schema 2020-12**: 完整的类型安全和验证
- **TypeScript**: 强类型支持，确保开发时安全

### 架构特点
1. **Schema-first 设计**: 先定义 JSON Schema，再实现处理逻辑
2. **类型安全**: 完整的 TypeScript 类型定义
3. **验证机制**: 严格的 JSON 验证，确保文档结构正确
4. **异步支持**: 同时支持同步和异步文档生成

### 兼容性说明
- ✅ 支持 Microsoft Word 2016+
- ✅ 支持 LibreOffice Writer
- ✅ 支持 Google Docs（导入时）
- ⚠️ 当前版本暂不支持尾注（endnotes），因为 docx 库尚未提供相关API

## 测试文件

项目包含以下测试文件：

1. **simple-footnote-test.json**: 基本脚注功能测试
2. **examples/footnotes-example.json**: 综合脚注示例
3. **examples/complete-footnotes-test.json**: 完整功能测试，包括：
   - 基本脚注
   - 多段落脚注
   - 包含超链接的脚注
   - 包含表格的脚注
   - 多个脚注引用

## 版本信息

- **版本**: v0.5.0-dev
- **发布日期**: 2024年12月
- **主要贡献**: 脚注系统实现
- **下一版本计划**: v0.6.0 将专注于协作功能和高级文档特性

## 开发团队

感谢所有为 DOCX-MCP 项目贡献的开发者们。脚注功能的实现标志着我们向专业文档处理工具的重要迈进。

---

*DOCX-MCP: 让文档生成变得简单而强大*
