import { DocRegistry } from '../dist/docx-utils.js';
import { nanoid } from 'nanoid';
import { writeFile } from 'node:fs/promises';

async function testNewFeatures() {
  const registry = new DocRegistry();
  
  console.log('🧪 测试新功能：代码块、列表、分页符、增强文本格式');
  
  const testDoc = {
    meta: {
      title: "新功能测试文档",
      creator: "DOCX MCP Server v0.2.0"
    },
    content: [
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", text: "DOCX MCP 新功能测试" }]
      },
      
      // 代码块测试
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "1. 代码块功能" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "以下是一个 JavaScript 代码示例：" }]
      },
      {
        type: "codeBlock",
        language: "javascript",
        showLineNumbers: true,
        theme: "default",
        code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 输出: 55`,
        title: "斐波那契数列函数"
      },
      
      // 列表测试
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "2. 列表功能" }]
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "无序列表示例：" }]
      },
      {
        type: "list",
        ordered: false,
        bulletStyle: "bullet",
        items: [
          {
            children: [{ type: "text", text: "第一项 - 普通项目符号" }]
          },
          {
            children: [{ type: "text", text: "第二项 - 包含", bold: true }, { type: "text", text: "粗体", bold: true }, { type: "text", text: "文本" }]
          },
          {
            children: [{ type: "text", text: "第三项 - 包含", italics: true }, { type: "text", text: "斜体", italics: true }, { type: "text", text: "文本" }]
          }
        ]
      },
      
      {
        type: "paragraph",
        children: [{ type: "text", text: "有序列表示例：" }]
      },
      {
        type: "list",
        ordered: true,
        numberFormat: "decimal",
        items: [
          {
            children: [{ type: "text", text: "第一步：准备工作" }]
          },
          {
            children: [{ type: "text", text: "第二步：执行操作" }]
          },
          {
            children: [{ type: "text", text: "第三步：验证结果" }]
          }
        ]
      },
      
      // 分页符测试
      {
        type: "pageBreak",
        breakType: "page"
      },
      
      // 增强文本格式测试
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "3. 增强文本格式" }]
      },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "普通文本，" },
          { type: "text", text: "粗体文本", bold: true },
          { type: "text", text: "，" },
          { type: "text", text: "斜体文本", italics: true },
          { type: "text", text: "，" },
          { type: "text", text: "下划线文本", underline: true },
          { type: "text", text: "，" },
          { type: "text", text: "删除线文本", strike: true },
          { type: "text", text: "。" }
        ]
      },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "上标：H", fontFamily: "Arial" },
          { type: "text", text: "2", superScript: true, fontFamily: "Arial" },
          { type: "text", text: "O，下标：CO", fontFamily: "Arial" },
          { type: "text", text: "2", subScript: true, fontFamily: "Arial" },
          { type: "text", text: "。", fontFamily: "Arial" }
        ]
      },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "彩色文本：" },
          { type: "text", text: "红色", color: "FF0000" },
          { type: "text", text: "，" },
          { type: "text", text: "绿色", color: "00FF00" },
          { type: "text", text: "，" },
          { type: "text", text: "蓝色", color: "0000FF" },
          { type: "text", text: "。" }
        ]
      },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "不同字体：" },
          { type: "text", text: "Arial字体", fontFamily: "Arial" },
          { type: "text", text: "，" },
          { type: "text", text: "Times New Roman字体", fontFamily: "Times New Roman" },
          { type: "text", text: "，" },
          { type: "text", text: "Consolas字体", fontFamily: "Consolas" },
          { type: "text", text: "。" }
        ]
      },
      
      // Python 代码块
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "4. Python 代码示例" }]
      },
      {
        type: "codeBlock",
        language: "python",
        showLineNumbers: true,
        theme: "light",
        code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# 测试
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quick_sort(numbers)
print(f"排序结果: {sorted_numbers}")`,
        title: "快速排序算法"
      },
      
      {
        type: "paragraph",
        children: [{ type: "text", text: "测试完成！以上展示了代码块、列表、分页符和增强文本格式等新功能。" }]
      }
    ]
  };

  try {
    const docId = nanoid();
    await registry.createAsync(docId, testDoc);
    const buffer = await registry.packToBuffer(docId);
    await writeFile('test-new-features.docx', buffer);
    console.log(`✅ 新功能测试文档创建成功！文件大小: ${buffer.byteLength} bytes`);
    console.log('📁 生成文件: test-new-features.docx');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  }
}

testNewFeatures().catch(console.error);
