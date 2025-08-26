# docx-mcp v0.3.0 Release Notes
## 🎨 Styles & Layout Release

**发布日期**: 2024年

### ✨ 主要新功能

#### 📐 页面设置系统
- **页面尺寸**: 支持 A4, A3, A5, Letter, Legal, Tabloid, Executive 等标准尺寸
- **页面方向**: 支持纵向和横向两种方向
- **页边距控制**: 精确设置上下左右页边距以及页眉页脚边距
- **完整配置**: 一次性设置整个文档的页面布局

#### 📊 增强的表格功能
- **背景颜色**: 支持十六进制颜色代码设置单元格背景
- **边框样式**: 多种边框样式选择（单线、双线、粗线、虚线、点线等）
- **垂直对齐**: 单元格内容支持顶部、中间、底部对齐
- **单独边框控制**: 可以独立设置单元格的上下左右边框
- **行标题**: 支持设置表格行为标题行
- **行高控制**: 精确设置表格行高

#### 🔧 新增块元素类型

1. **水平分割线 (HorizontalRule)**
   - 创建视觉分隔线
   - 支持自定义样式和颜色

2. **引用块 (Blockquote)**
   - 优雅的左侧边框样式
   - 适合引用文本和重要说明

3. **信息框 (InfoBox)**
   - 多种预设类型：info, warning, error, success, note
   - 自动样式配色方案
   - 适合重要信息提示

4. **文本框 (TextBox)**
   - 带边框的内容容器
   - 突出显示重要内容

### 🛠 技术改进

#### 架构增强
- **JSON Schema 扩展**: 基于 JSON Schema 2020-12 标准扩展文档结构定义
- **TypeScript 集成**: 完整的类型定义和编译时检查
- **向后兼容**: 完全保持与之前版本的兼容性

#### 代码质量
- **全面测试**: 新增comprehensive测试覆盖所有新功能
- **错误处理**: 改进的验证和错误处理机制
- **文档更新**: 完整的使用示例和API文档

### 📝 使用示例

#### 页面设置
```json
{
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 2540,
      "bottom": 2540,
      "left": 1905,
      "right": 1905
    }
  }
}
```

#### 增强表格
```json
{
  "type": "table",
  "rows": [
    {
      "cells": [
        {
          "children": [{"type": "paragraph", "children": [{"type": "text", "text": "Header"}]}],
          "backgroundColor": "#e3f2fd",
          "verticalAlign": "center"
        }
      ]
    }
  ]
}
```

#### 新块元素
```json
{
  "type": "horizontalRule"
},
{
  "type": "blockquote",
  "children": [{"type": "text", "text": "This is a quote"}]
},
{
  "type": "infoBox",
  "style": "warning",
  "children": [{"type": "text", "text": "Important warning"}]
}
```

### 🔄 迁移指南

v0.3.0 完全向后兼容，现有文档无需修改即可继续使用。新功能为可选功能，可以逐步集成到现有工作流程中。

### 🐛 修复的问题

- 改进了表格边框渲染
- 优化了页面设置的处理逻辑
- 修复了颜色格式验证问题

### 📊 性能优化

- 优化了大型文档的处理性能
- 改进了内存使用效率
- 加快了文档生成速度

### 🔮 下一版本预告

v0.4.0 计划功能：
- 图表和图形支持
- 高级样式主题系统
- 更多页面布局选项
- 协作功能增强

---

### 💡 获取帮助

- **文档**: 查看更新的 README.md 获取完整使用指南
- **示例**: 参考 `test-v030-features.js` 了解所有新功能的使用方法
- **问题反馈**: 通过 GitHub Issues 报告问题或提出建议

感谢您使用 docx-mcp！这个版本为专业文档生成奠定了坚实的基础。
